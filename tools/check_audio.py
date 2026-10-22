"""声と曲を差し替えたあと、人が耳で聞く前に機械で確かめる（Claude Code は音を聞けないため）。

  .venv/bin/python tools/check_audio.py kangaeru-01 voice             # 声: 長さ・話す速さ・音割れ・長い無音
  .venv/bin/python tools/check_audio.py kangaeru-01 voice --part ch1  # 1章だけ
  .venv/bin/python tools/check_audio.py kangaeru-01 align             # 文の切れ目の怪しい所（build_timeline.py の後）
  .venv/bin/python tools/check_audio.py kangaeru-01 music             # 曲: 区間に対する長さ・頭の無音（build_timeline.py の後）
  .venv/bin/python tools/check_audio.py kangaeru-01 preview           # 人が聞く短い確認用の音（make_audio.py の後）

気になる所には ⚠ を付け、ひとつでもあれば終了コード 1 を返す。
preview は out/preview/<回>/ に章の変わり目・曲の変わり目の短い音（.m4a）と、聞く所の一覧（index.md）を作る。
"""
from __future__ import annotations

import argparse
import json
import statistics
import subprocess
import sys

import numpy as np

from build_timeline import FPS, HOP, silence_runs, weight
from common import ROOT, SR, episode_dir, load_mono, load_script, load_stereo, read_text
from music_cues import resolve, slots

THRESH = -38.0  # 無音とみなす音量（build_timeline.py の既定と同じ）


def frame_db(x: np.ndarray) -> np.ndarray:
    """10ms ごとの音量（最大を 0 dB として）。長い音でもメモリを食わないよう累積和で求める。"""
    hop, win = int(HOP * SR), int(HOP * SR) * 2
    n = max(1, (len(x) - win) // hop + 1)
    cs = np.concatenate([[0.0], np.cumsum(x.astype(np.float64) ** 2)])
    starts = np.arange(n) * hop
    rms = np.sqrt((cs[starts + win] - cs[starts]) / win + 1e-12)
    return 20 * np.log10(rms / (np.max(rms) + 1e-12))


def mmss(t: float) -> str:
    return f"{int(t // 60):02d}:{t % 60:04.1f}"


def groups(script: dict) -> list[tuple[str, list[dict]]]:
    """章ごと（章の無い回は全体で1つ）の文の並び。"""
    if script.get("parts"):
        return [(p["id"], [s for s in script["sentences"] if s["part"] == p["id"]]) for p in script["parts"]]
    return [("all", script["sentences"])]


def voice(ep: str, only: str | None) -> int:
    script = load_script(ep)
    d = episode_dir(ep)
    meta_path = d / "audio" / "narration.source.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
    rows, bad = [], 0
    for pid, sents in groups(script):
        wav = d / "audio" / ("parts" if pid != "all" else "") / (f"{pid}.wav" if pid != "all" else "narration.wav")
        src = meta.get("parts", {}).get(pid, {}).get("source") if pid != "all" else meta.get("source")
        if not wav.exists():
            rows.append({"pid": pid, "missing": True, "src": src})
            continue
        x = load_mono(wav)
        db = frame_db(x)
        vidx = np.where(db > THRESH)[0]
        if len(vidx) == 0:
            rows.append({"pid": pid, "silent": True, "src": src})
            continue
        s0, s1 = vidx[0] * HOP, (vidx[-1] + 1) * HOP
        inner = [b - a for a, b in silence_runs(db > THRESH) if a > s0 and b < s1]
        seg = x[int(s0 * SR):int(s1 * SR)]
        rows.append({
            "pid": pid, "src": src or "?", "dur": len(x) / SR, "lead": s0, "trail": len(x) / SR - s1,
            "rate": sum(weight(read_text(s)) for s in sents) / (s1 - s0),
            "peak": 20 * np.log10(float(np.max(np.abs(x))) + 1e-12),
            "clip": int(np.sum(np.abs(x) >= 0.99)),
            "level": 20 * np.log10(float(np.sqrt(np.mean(seg ** 2))) + 1e-12),
            "gap": max(inner, default=0.0),
        })
    real = [r for r in rows if "rate" in r and r["src"] != "openjtalk-temp"]
    med_rate = statistics.median(r["rate"] for r in real) if len(real) >= 3 else None
    med_level = statistics.median(r["level"] for r in real) if len(real) >= 3 else None
    for r in rows:
        if only and r["pid"] != only:
            continue
        if r.get("missing") or r.get("silent"):
            print(f"⚠ {r['pid']:9} {'ファイルがありません' if r.get('missing') else '声が入っていません（無音）'}")
            bad += 1
            continue
        warn = []
        if r["clip"] > 10:
            warn.append(f"音割れのおそれ（振り切れた所 {r['clip']}）")
        if not 3.5 <= r["rate"] <= 9.0:
            warn.append("話す速さが極端（読み飛ばし・付け足し・長すぎる間のおそれ）")
        if med_rate and r["src"] != "openjtalk-temp" and abs(r["rate"] / med_rate - 1) > 0.2:
            warn.append(f"ほかの章より{'速い' if r['rate'] > med_rate else '遅い'}（中央値 {med_rate:.1f}字/秒）")
        if med_level and r["src"] != "openjtalk-temp" and abs(r["level"] - med_level) > 4:
            warn.append(f"ほかの章と声の大きさが違う（{r['level'] - med_level:+.1f} dB）")
        if r["gap"] > 3.0:
            warn.append(f"途中に {r['gap']:.1f}秒の無音（声が途切れていないか）")
        note = "（頭と終わりの長い無音は、時刻表を作るときに詰める）" if r["lead"] > 1.0 or r["trail"] > 1.5 else ""
        mark = "⚠" if warn else "✓"
        bad += bool(warn)
        print(f"{mark} {r['pid']:9} {r['src']:16} {r['dur']:6.1f}秒  {r['rate']:4.1f}字/秒  最大 {r['peak']:5.1f}dBFS  "
              f"最長の無音 {r['gap']:3.1f}秒  頭 {r['lead']:.1f}/終わり {r['trail']:.1f}秒{note}")
        for w in warn:
            print(f"    - {w}")
    temp = [r["pid"] for r in rows if r.get("src") == "openjtalk-temp"]
    if temp:
        print("まだ仮の声です" if temp == ["all"] else f"まだ仮の声の章: {', '.join(temp)}")
    return 1 if bad else 0


def suspects(x: np.ndarray, texts: list[str], t: list[dict]) -> list[tuple[int, list[str]]]:
    """1章ぶんの文の切れ目（t: 声全体 x の中の秒）から、怪しい文を探す。

    演出メモで「句点のあとはしっかり間をとる」と頼んでいるので、文の切れ目の間は読点の間より長いはず。
    切れ目の間が極端に短い・文の途中に切れ目より長い間がある・長さが文字数の見込みから大きく外れる、を拾う。
    """
    a = max(0.0, t[0]["start"] - 0.5)
    db = frame_db(x[int(a * SR):int((t[-1]["end"] + 0.5) * SR)])
    runs = [(a + p, a + q) for p, q in silence_runs(db > THRESH)]
    w = np.array([weight(s) for s in texts])
    dur = np.array([tt["end"] - tt["start"] for tt in t])
    ratio = dur / (w * dur.sum() / w.sum())
    gaps = [t[k + 1]["start"] - t[k]["end"] for k in range(len(t) - 1)]
    out = []
    for k in range(len(t)):
        inner = max((q - p for p, q in runs if p > t[k]["start"] + 0.05 and q < t[k]["end"] - 0.05), default=0.0)
        near = [gaps[i] for i in (k - 1, k) if 0 <= i < len(gaps)]
        why = []
        if k < len(gaps) and gaps[k] < 0.25:
            why.append(f"次の文との間が {gaps[k]:.2f}秒しかない")
        if near and inner > 0.7 and inner > 1.4 * min(near):
            why.append(f"文の途中の間（{inner:.2f}秒）が切れ目の間（{min(near):.2f}秒）より長い")
        if not 0.4 <= ratio[k] <= 2.8:
            why.append(f"文の長さが文字数の見込みの {ratio[k]:.1f}倍")
        if why:
            out.append((k, why))
    return out


def align(ep: str) -> int:
    script = load_script(ep)
    d = episode_dir(ep)
    rep = json.loads((d / "build" / "alignment.json").read_text(encoding="utf-8"))["sentences"]
    x = load_mono(d / "audio" / "narration.wav")
    found = []
    for pid, sents in groups(script):
        t = [rep[s["id"]] for s in sents]
        for k, why in suspects(x, [read_text(s) for s in sents], t):
            found.append((t[k]["start"], pid, sents[k], why))
    tl = json.loads((ROOT / "video" / "src" / "generated" / f"{ep}.json").read_text(encoding="utf-8"))
    for start, pid, s, why in found:
        print(f"⚠ {mmss(start)}  {pid:9} {s['id']:14} {s['text'][:30]}")
        for w in why:
            print(f"    - {w}")
    print(f"文の切れ目が怪しい所: {len(found)} / {len(script['sentences'])} 文")
    spots = [(sc["from"] / FPS, f"章の頭 {sc['part']}") for sc in tl["scenes"] if sc["type"] == "chapter"]
    if not spots:  # 章の無い回は場面の変わり目
        spots = [(sc["from"] / FPS, f"場面 {sc['id']}") for sc in tl["scenes"]]
    spots += [(start, f"字幕 {s['id']}「{s['text'][:16]}」") for start, _, s, _ in found[:12]]
    print("\n動画で確かめる時刻（声と字幕・場面の切り替わりが合っているか）:")
    for t0, label in sorted(spots):
        print(f"  {mmss(t0)}  {label}")
    return 1 if found else 0


def music(ep: str) -> int:
    script = load_script(ep)
    d = episode_dir(ep)
    tl = json.loads((ROOT / "video" / "src" / "generated" / f"{ep}.json").read_text(encoding="utf-8"))
    log_path = d / "music" / "sources.json"
    log = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else {}
    bad = 0
    for s in slots(script, tl, tl["durationInFrames"] / FPS):
        need = s["end"] - s["start"]
        f = resolve(d, s["file"])
        if not f:
            print(f"⚠ {s['id']:4} 区間 {need:5.1f}秒  まだ無い（合成の音楽で代わりに埋める）  {s.get('title', '')}")
            bad += 1
            continue
        x = load_stereo(f).mean(axis=1)
        dur = len(x) / SR
        db = frame_db(x)
        lead = float(np.argmax(db > -40) * HOP)
        warn = []
        if lead > 1.0:
            warn.append(f"頭に {lead:.1f}秒の無音")
        if need / dur > 2.5:
            warn.append(f"短すぎる（区間を埋めるのに {need / dur:.1f}回繰り返す）。長めに作り直すとよい")
        if s["id"] not in log:
            warn.append("music/sources.json に出どころの記録が無い（register_audio.py で置き直す）")
        loop = "  繰り返して埋める（つなぎ目を聞いて確かめる）" if dur < need else ""
        bad += bool(warn)
        print(f"{'⚠' if warn else '✓'} {s['id']:4} 区間 {need:5.1f}秒  曲 {dur:5.1f}秒  {f.name}{loop}")
        for w in warn:
            print(f"    - {w}")
    return 1 if bad else 0


def preview(ep: str) -> int:
    script = load_script(ep)
    mix = ROOT / "video" / "public" / "ep" / ep / "mix.wav"
    if not mix.exists():
        raise SystemExit(f"{mix} がありません（先に make_audio.py）")
    tl = json.loads((ROOT / "video" / "src" / "generated" / f"{ep}.json").read_text(encoding="utf-8"))
    total = tl["durationInFrames"] / FPS
    marks = [(sc["from"] / FPS - 3, 25, f"章の頭 {sc['part']}", "章カードの音 → 声の入り。曲が変わる章では入れ替わりも")
             for sc in tl["scenes"] if sc["type"] == "chapter"] or [(0, 25, "冒頭", "声の入りと曲")]
    for s in slots(script, tl, total)[1:]:
        marks.append((s["start"] - 8, 20, f"曲 {s['id']} に替わる所", "前の曲が消えて次の曲が自然に入るか・声より大きくないか"))
    marks.append((total - 25, 25, "終わり", "最後の曲の消え方"))
    marks.sort()
    clips = []
    for a, length, label, what in marks:  # 5秒以上重なる所はまとめて1つにする
        a = max(0.0, a)
        if clips and a < clips[-1][0] + clips[-1][1] - 5:
            p = clips[-1]
            clips[-1] = (p[0], max(p[1], a + length - p[0]), f"{p[2]}／{label}", f"{p[3]}／{what}")
        else:
            clips.append((a, length, label, what))
    out = ROOT / "out" / "preview" / ep
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("*.m4a"):
        old.unlink()
    lines = [f"# {ep} 聞いて確かめる所（{len(clips)}か所）\n", "| ファイル | 動画の時刻 | 何を聞くか |", "|---|---|---|"]
    for i, (a, length, label, what) in enumerate(clips, 1):
        name = f"{i:02d}_{mmss(a).replace(':', 'm').replace('.', 's')}.m4a"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{a:.2f}", "-t", f"{length:.2f}", "-i", str(mix),
                        "-c:a", "aac", "-b:a", "160k", str(out / name)], check=True)
        lines.append(f"| {name} | {mmss(a)}〜{mmss(a + length)} | {label}: {what} |")
    (out / "index.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))
    print(f"\n→ {out}")
    return 0


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("what", choices=["voice", "align", "music", "preview"])
    ap.add_argument("--part", help="voice: 1章だけ確かめる")
    args = ap.parse_args()
    if args.what == "voice":
        sys.exit(voice(args.episode, args.part))
    sys.exit({"align": align, "music": music, "preview": preview}[args.what](args.episode))


if __name__ == "__main__":
    main()
