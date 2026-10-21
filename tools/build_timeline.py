"""narration.wav の無音から文の切れ目を見つけ、場面の時刻表と字幕を作る。

声は1テイクで作る前提（パートを分けると声色がずれやすいため）。文の切れ目は
「文字数から見込んだ位置」に近く、かつ長い無音を動的計画法で選ぶ。

  .venv/bin/python tools/build_timeline.py uratori-01-1min

出力:
  video/src/generated/<ep>.json      Remotion が読む時刻表（フレーム）
  episodes/<ep>/build/subtitles.srt  YouTube に上げる字幕
  episodes/<ep>/build/alignment.json 文ごとの秒と、仮の声のときは正解との差
"""
from __future__ import annotations

import argparse
import json
import math
import re

import numpy as np

from common import ROOT, SR, episode_dir, load_mono, load_script, read_text, write_wav

FPS = 30
HOP = 0.01
MIN_GAP = 0.12      # これより短い無音は文の切れ目の候補にしない
SCENE_LEAD = 0.30   # 次の場面の画面は、声の少し前に切り替える


def envelope_db(x: np.ndarray) -> np.ndarray:
    hop = int(HOP * SR)
    win = hop * 2
    n = max(1, (len(x) - win) // hop + 1)
    idx = np.arange(n)[:, None] * hop + np.arange(win)[None, :]
    rms = np.sqrt(np.mean(x[idx] ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms / (np.max(rms) + 1e-12))


def silence_runs(voiced: np.ndarray) -> list[tuple[float, float]]:
    runs = []
    i = 0
    n = len(voiced)
    while i < n:
        if not voiced[i]:
            j = i
            while j < n and not voiced[j]:
                j += 1
            runs.append((i * HOP, j * HOP))
            i = j
        else:
            i += 1
    return runs


def weight(text: str) -> float:
    """読みの長さの目安。句読点は間として少し足す。"""
    body = re.sub(r"[、。「」『』！？!?\s]", "", text)
    pauses = len(re.findall(r"[、。！？!?]", text))
    return len(body) + 1.5 * pauses


def align(x: np.ndarray, texts: list[str], thresh_db: float) -> tuple[list[dict], float, float]:
    """文の切れ目を、無音の候補から動的計画法で選ぶ。

    評価は「文ごとの長さが、文字数から見込んだ長さに見合っているか（比の対数）」と
    「切れ目の無音が長いか」。位置ではなく1文ずつの長さで比べるので、長い章でも
    ずれが積み重ならない（読点の短い間を文の切れ目と取り違えにくい）。
    """
    db = envelope_db(x)
    voiced = db > thresh_db
    vidx = np.where(voiced)[0]
    if len(vidx) == 0:
        raise SystemExit("声が見つかりません（無音のファイル？）")
    s0, s1 = vidx[0] * HOP, (vidx[-1] + 1) * HOP
    n = len(texts)
    if n == 1:
        return [{"start": round(s0, 3), "end": round(s1, 3)}], s0, s1
    cands = [(a, b) for a, b in silence_runs(voiced) if a > s0 and b < s1 and b - a >= MIN_GAP]
    if len(cands) < n - 1:
        raise SystemExit(f"文の切れ目の候補が足りません（候補 {len(cands)} / 必要 {n - 1}）。--thresh を上げてみてください。")

    w = np.array([weight(t) for t in texts], dtype=float)
    rate = (s1 - s0) / w.sum()           # 重み1あたりの秒（声全体から見積もる）
    expect = w * rate                    # 文ごとの見込みの長さ（次の切れ目まで）
    mids = np.array([(a + b) / 2 for a, b in cands])
    lens = np.array([b - a for a, b in cands])
    W, BETA = 3.0, 1.0
    m = len(cands)

    def dur_cost(d: np.ndarray, k: int) -> np.ndarray:
        d = np.maximum(d, 0.05)
        return W * np.abs(np.log(d / expect[k]))

    INF = 1e18
    dp = np.full((n - 1, m), INF)
    back = np.zeros((n - 1, m), dtype=int)
    dp[0] = dur_cost(mids - s0, 0) - BETA * np.log(lens)
    for k in range(1, n - 1):
        # 直前の切れ目 c' (< c) からの長さで評価（行列で一度に計算）
        d = mids[None, :] - mids[:, None]            # [c', c]
        cost = dp[k - 1][:, None] + dur_cost(d, k)
        cost[np.tril_indices(m)] = INF               # c' < c だけ
        back[k] = np.argmin(cost, axis=0)
        dp[k] = cost[back[k], np.arange(m)] - BETA * np.log(lens)
    final = dp[n - 2] + dur_cost(s1 - mids, n - 1)
    c = int(np.argmin(final))
    chosen = [c]
    for k in range(n - 2, 0, -1):
        c = int(back[k, c])
        chosen.append(c)
    chosen.reverse()

    out = []
    for k in range(n):
        start = s0 if k == 0 else cands[chosen[k - 1]][1]
        end = s1 if k == n - 1 else cands[chosen[k]][0]
        out.append({"start": round(start, 3), "end": round(end, 3)})
    return out, s0, s1


PART_GAP = 0.8  # 章の終わりの余韻


def assemble_parts(script: dict, d, meta: dict, thresh: float):
    """章ごとの声（audio/parts/<章>.wav）を、章カードの間をはさんで1本につなぐ。

    文の切れ目は章ごとに探す（章ごとに作った声でも、1本で作った声を切り分けたものでもよい）。
    つないだ声は audio/narration.wav に書き出す（make_audio.py が使う）。
    """
    hold = {sc["part"]: sc.get("hold", 0.0) for sc in script["scenes"] if sc["type"] == "chapter"}
    meta_parts = meta.get("parts", {})
    chunks, by_id, chapter_at, errs, sources = [], {}, {}, [], set()
    t = 0.0
    for p in script["parts"]:
        pid = p["id"]
        h = hold.get(pid, 0.0)
        chapter_at[pid] = t
        chunks.append(np.zeros(int(h * SR), np.float32))
        t += h
        wav = d / "audio" / "parts" / f"{pid}.wav"
        if not wav.exists():
            raise SystemExit(f"章 {pid} の声がありません: {wav}")
        x = load_mono(wav)
        sents = [s for s in script["sentences"] if s["part"] == pid]
        pm = meta_parts.get(pid, {})
        sources.add(pm.get("source", "unknown"))
        truth = {tr["id"]: tr for tr in pm.get("truth", [])}
        if pm.get("source") == "openjtalk-temp" and all(s["id"] in truth for s in sents):
            # 仮の声は作ったときの切れ目が分かっているので、それをそのまま使う
            times = [{"start": truth[s["id"]]["start"], "end": truth[s["id"]]["end"]} for s in sents]
        else:
            times, _, _ = align(x, [read_text(s) for s in sents], thresh)
        for s, tt in zip(sents, times):
            by_id[s["id"]] = {"start": round(t + tt["start"], 3), "end": round(t + tt["end"], 3), "text": s["text"]}
        for tr in pm.get("truth", []):
            got = by_id[tr["id"]]
            errs.append((max(abs(got["start"] - t - tr["start"]), abs(got["end"] - t - tr["end"])), tr["id"]))
        chunks.append(x)
        t += len(x) / SR
        chunks.append(np.zeros(int(PART_GAP * SR), np.float32))
        t += PART_GAP
    write_wav(d / "audio" / "narration.wav", np.concatenate(chunks))
    report = {"mode": "parts", "duration": round(t, 3), "sentences": by_id}
    if errs:
        worst = max(errs)
        report["max_error_vs_truth_sec"] = round(worst[0], 3)
        print(f"正解との最大のずれ: {worst[0]:.3f} 秒（{worst[1]}）")
    source = "openjtalk-temp" if "openjtalk-temp" in sources else "/".join(sorted(sources))
    return by_id, t, chapter_at, report, source


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--thresh", type=float, default=-38.0, help="無音とみなす音量（最大の RMS 比 dB）")
    args = ap.parse_args()

    script = load_script(args.episode)
    d = episode_dir(args.episode)
    sents = script["sentences"]
    src = d / "audio" / "narration.source.json"
    meta = json.loads(src.read_text(encoding="utf-8")) if src.exists() else {}
    if script.get("parts"):
        by_id, total, chapter_at, report, voice_source = assemble_parts(script, d, meta, args.thresh)
    else:
        wav = d / "audio" / "narration.wav"
        x = load_mono(wav)
        total = len(x) / SR
        times, s0, s1 = align(x, [read_text(s) for s in sents], args.thresh)
        by_id = {s["id"]: {**t, "text": s["text"]} for s, t in zip(sents, times)}
        chapter_at = {}
        voice_source = meta.get("source", "unknown")
        # 仮の声なら正解（合成時に分かっている切れ目）と比べる
        report = {"wav": str(wav.relative_to(ROOT)), "duration": round(total, 3), "sentences": by_id}
        if meta.get("truth"):
            errs = [max(abs(by_id[t["id"]]["start"] - t["start"]), abs(by_id[t["id"]]["end"] - t["end"]))
                    for t in meta["truth"]]
            report["max_error_vs_truth_sec"] = round(max(errs), 3)
            print(f"正解との最大のずれ: {max(errs):.3f} 秒")

    # 場面の区切り: 次の場面の最初の文の少し前（前の文が終わってから）。章カードは声の無い間に置く
    scenes = script["scenes"]
    cuts = []
    for i, sc in enumerate(scenes):
        if sc["type"] == "chapter":
            cuts.append(chapter_at[sc["part"]])
            continue
        start = by_id[sc["sentences"][0]]["start"] - SCENE_LEAD
        if i > 0:
            prev = scenes[i - 1]
            if prev["type"] == "chapter":
                start = max(start, cuts[-1] + 1.0)
            else:
                start = max(start, by_id[prev["sentences"][-1]]["end"] + 0.05)
        cuts.append(max(0.0, start) if i else 0.0)
    cuts.append(total)
    fr = lambda t: int(round(t * FPS))  # noqa: E731
    sent_by_id = {x["id"]: x for x in sents}
    tl_scenes = []
    for i, sc in enumerate(scenes):
        a, b = fr(cuts[i]), fr(cuts[i + 1])
        tl_scenes.append({
            "id": sc["id"], "type": sc["type"], "part": sc.get("part"), "from": a, "duration": b - a,
            "items": sc.get("items", {}), "clip": sc.get("clip"),
            "sources": [script["sources"][k] | {"id": k} for k in sc.get("sources", [])],
            "sentences": [{"id": sid, "text": by_id[sid]["text"], "short": sent_by_id[sid].get("short"),
                           "from": fr(by_id[sid]["start"]) - a, "to": fr(by_id[sid]["end"]) - a}
                          for sid in sc["sentences"]],
        })
    timeline = {
        "episode": script["id"], "channel": script["channel"], "tagline": script["tagline"],
        "title": script.get("title", ""), "subtitle": script.get("subtitle", ""),
        "fps": FPS, "durationInFrames": fr(total), "audio": f"ep/{script['id']}/mix.wav",
        "voiceSource": voice_source,
        "scenes": tl_scenes,
    }
    gen = ROOT / "video" / "src" / "generated"
    gen.mkdir(parents=True, exist_ok=True)
    (gen / f"{script['id']}.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=2), encoding="utf-8")

    build = d / "build"
    build.mkdir(exist_ok=True)
    (build / "alignment.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    srt = []
    for i, s in enumerate(sents, 1):
        t = by_id[s["id"]]
        srt.append(f"{i}\n{srt_time(t['start'])} --> {srt_time(t['end'])}\n{s['text']}\n")
    (build / "subtitles.srt").write_text("\n".join(srt), encoding="utf-8")
    for s in sents if len(sents) <= 40 else []:
        t = by_id[s["id"]]
        print(f"{s['id']}: {t['start']:6.2f}–{t['end']:6.2f}  {s['text'][:24]}")
    print(f"total {total:.2f}s  scenes {len(tl_scenes)}")


if __name__ == "__main__":
    main()
