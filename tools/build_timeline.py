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

from common import ROOT, SR, episode_dir, load_mono, load_script, read_text

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
    db = envelope_db(x)
    voiced = db > thresh_db
    vidx = np.where(voiced)[0]
    if len(vidx) == 0:
        raise SystemExit("声が見つかりません（無音のファイル？）")
    s0, s1 = vidx[0] * HOP, (vidx[-1] + 1) * HOP
    cands = [(a, b) for a, b in silence_runs(voiced) if a > s0 and b < s1 and b - a >= MIN_GAP]
    n = len(texts)
    if len(cands) < n - 1:
        raise SystemExit(f"文の切れ目の候補が足りません（候補 {len(cands)} / 必要 {n - 1}）。--thresh を上げてみてください。")

    w = np.array([weight(t) for t in texts])
    cum = np.cumsum(w) / w.sum()
    expect = [s0 + cum[k] * (s1 - s0) for k in range(n - 1)]
    span = s1 - s0

    def cost(k: int, c: int) -> float:
        a, b = cands[c]
        return 12.0 * abs((a + b) / 2 - expect[k]) / span - math.log(b - a)

    m = len(cands)
    INF = float("inf")
    dp = np.full((n - 1, m), INF)
    back = np.zeros((n - 1, m), dtype=int)
    for c in range(m):
        dp[0, c] = cost(0, c)
    for k in range(1, n - 1):
        best, arg = INF, -1
        for c in range(m):
            if c - 1 >= 0 and dp[k - 1, c - 1] < best:
                best, arg = dp[k - 1, c - 1], c - 1
            if arg >= 0:
                dp[k, c] = best + cost(k, c)
                back[k, c] = arg
    c = int(np.argmin(dp[n - 2]))
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
    wav = d / "audio" / "narration.wav"
    x = load_mono(wav)
    total = len(x) / SR
    sents = script["sentences"]
    times, s0, s1 = align(x, [read_text(s) for s in sents], args.thresh)
    by_id = {s["id"]: {**t, "text": s["text"]} for s, t in zip(sents, times)}

    # 仮の声なら正解（合成時に分かっている切れ目）と比べる
    report = {"wav": str(wav.relative_to(ROOT)), "duration": round(total, 3), "sentences": by_id}
    src = d / "audio" / "narration.source.json"
    if src.exists():
        meta = json.loads(src.read_text(encoding="utf-8"))
        if meta.get("truth"):
            errs = [max(abs(by_id[t["id"]]["start"] - t["start"]), abs(by_id[t["id"]]["end"] - t["end"]))
                    for t in meta["truth"]]
            report["max_error_vs_truth_sec"] = round(max(errs), 3)
            print(f"正解との最大のずれ: {max(errs):.3f} 秒")

    # 場面の区切り: 次の場面の最初の文の少し前（前の文が終わってから）
    scenes = script["scenes"]
    cuts = [0.0]
    for prev, sc in zip(scenes, scenes[1:]):
        prev_end = by_id[prev["sentences"][-1]]["end"]
        nxt = by_id[sc["sentences"][0]]["start"]
        cuts.append(max(prev_end + 0.05, nxt - SCENE_LEAD))
    cuts.append(total)
    fr = lambda t: int(round(t * FPS))  # noqa: E731
    tl_scenes = []
    for i, sc in enumerate(scenes):
        a, b = fr(cuts[i]), fr(cuts[i + 1])
        tl_scenes.append({
            "id": sc["id"], "type": sc["type"], "from": a, "duration": b - a,
            "items": sc.get("items", {}), "clip": sc.get("clip"),
            "sources": [script["sources"][k] | {"id": k} for k in sc.get("sources", [])],
            "sentences": [{"id": sid, "text": by_id[sid]["text"],
                           "from": fr(by_id[sid]["start"]) - a, "to": fr(by_id[sid]["end"]) - a}
                          for sc_sid in [sc["sentences"]] for sid in sc_sid],
        })
    timeline = {
        "episode": script["id"], "channel": script["channel"], "tagline": script["tagline"],
        "title": script.get("title", ""), "subtitle": script.get("subtitle", ""),
        "fps": FPS, "durationInFrames": fr(total), "audio": f"ep/{script['id']}/mix.wav",
        "voiceSource": json.loads(src.read_text(encoding="utf-8")).get("source") if src.exists() else "unknown",
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
    for s in sents:
        t = by_id[s["id"]]
        print(f"{s['id']}: {t['start']:6.2f}–{t['end']:6.2f}  {s['text'][:24]}")
    print(f"total {total:.2f}s  scenes {len(tl_scenes)}")


if __name__ == "__main__":
    main()
