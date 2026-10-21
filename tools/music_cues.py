"""場面ごとに曲を切り替える（script.json の "music"）。

各曲は「from の場面の頭（少し前）」から「to の場面の終わり」まで流し、次の曲と
重ねながら入れ替える。曲は音量（RMS）をそろえてから並べるので、Flow Music で作った
曲どうしの大きさの違いを気にしなくてよい。曲のファイルがまだ無いところは、
合成の音楽（sound_kangaeru.design の音楽）をその区間だけ使う。

  .venv/bin/python tools/music_cues.py kangaeru-01-1min   # 各曲の区間と、必要な長さを表示
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from common import ROOT, SR, episode_dir, load_script, load_stereo

FPS = 30
XFADE = 1.6  # 曲の入れ替えで重ねる秒数


def slots(script: dict, tl: dict, total: float) -> list[dict]:
    """各曲の（開始, 終了）秒。終了には次の曲と重ねる分を含める。"""
    sc = {s["id"]: s for s in tl["scenes"]}
    cues = script.get("music", [])
    out = []
    for i, c in enumerate(cues):
        start = max(0.0, sc[c["from"]]["from"] / FPS - c.get("lead", 0.4))
        last = i == len(cues) - 1
        end = total if last else sc[c["to"]]["from"] / FPS + sc[c["to"]]["duration"] / FPS + XFADE
        out.append({**c, "start": start, "end": min(total, end), "last": last})
    return out


AUDIO_EXT = (".mp3", ".wav", ".m4a", ".flac", ".ogg", ".aac")


def resolve(d: Path, file: str) -> Path | None:
    """script.json の名前どおりか、拡張子だけ違うファイル（Flow Music は MP3/WAV/M4A で出せる）を探す。"""
    f = d / file
    if f.exists():
        return f
    for ext in AUDIO_EXT:
        g = f.with_suffix(ext)
        if g.exists():
            return g
    return None


def rms(x: np.ndarray) -> float:
    return float(np.sqrt(np.mean(x**2)) + 1e-12)


def fade(n: int, fin: float, fout: float) -> np.ndarray:
    env = np.ones(n)
    a, b = min(n, int(fin * SR)), min(n, int(fout * SR))
    if a:
        env[:a] = np.linspace(0, 1, a) ** 1.5
    if b:
        env[-b:] *= np.linspace(1, 0, b) ** 1.5
    return env


def build(script: dict, tl: dict, total: float, fallback: np.ndarray, rms_db: float = -30.0) -> tuple[np.ndarray, list[str]]:
    """(ステレオの音楽, ログ) を返す。fallback はモノラルの合成音楽（全長）。"""
    n = int(total * SR)
    music = np.zeros((n, 2))
    target = 10 ** (rms_db / 20)
    log = []
    d = episode_dir(script["id"])
    for s in slots(script, tl, total):
        a, b = int(s["start"] * SR), int(s["end"] * SR)
        need = b - a
        f = resolve(d, s["file"])
        if f:
            x = load_stereo(f)
            src = f.name
            if len(x) < need:
                log.append(f"⚠ {s['id']}: 曲が {len(x) / SR:.1f}秒しかない（区間は {need / SR:.1f}秒）。足りない分は無音で終わる")
            x = x[:need]
            x = x / rms(x[: min(len(x), 20 * SR)]) * target
        else:
            x = np.repeat(fallback[a:b, None], 2, axis=1)
            x = x / rms(x) * target * 0.8
            src = "合成の音楽（曲のファイルが無いので代わり）"
        fin = 1.5 if s["start"] == 0 else 0.6
        fout = 3.0 if s["last"] else XFADE
        x = x * fade(len(x), fin, fout)[:, None]
        music[a:a + len(x)] += x
        log.append(f"{s['id']}: {s['start']:5.1f}–{s['end']:5.1f}秒 {s['from']}→{s['to']}  ← {src}")
    return music, log


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    args = ap.parse_args()
    script = load_script(args.episode)
    tl = json.loads((ROOT / "video" / "src" / "generated" / f"{args.episode}.json").read_text(encoding="utf-8"))
    total = tl["durationInFrames"] / FPS
    d = episode_dir(args.episode)
    for s in slots(script, tl, total):
        f = resolve(d, s["file"])
        print(f"{s['id']}: {s['start']:5.1f}–{s['end']:5.1f}秒（{s['end'] - s['start']:4.1f}秒・{s['from']}→{s['to']}）"
              f"  {f.name + ' ✅' if f else s['file'] + ' — まだ無い'}")


if __name__ == "__main__":
    main()
