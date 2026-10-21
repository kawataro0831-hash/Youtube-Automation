"""仮の声（Open JTalk）で narration.wav を作る。

Gemini の声が用意できるまで、間合いと画面の動きを確認するための仮の声。
本番の声は tools/tts_gemini.py（API）か、AI Studio で作った WAV を
episodes/<ep>/audio/narration.wav に置き換える。

  .venv/bin/python tools/voice_temp_openjtalk.py uratori-01-1min

必要: apt の open-jtalk / open-jtalk-mecab-naist-jdic / hts-voice-nitech-jp-atr503-m001
"""
from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np

from common import SR, episode_dir, load_mono, load_script, read_text, trim_silence, write_wav

DIC = "/var/lib/mecab/dic/open-jtalk/naist-jdic"
VOICE = "/usr/share/hts-voice/nitech-jp-atr503-m001/nitech_jp_atr503_m001.htsvoice"

LEAD = 0.6          # 頭の無音（秒）
GAP_SENTENCE = 0.55  # 同じ場面の文と文の間
GAP_SCENE = 0.85     # 場面が変わるところの間
TAIL = 1.2


def synth(text: str, speed: float, halftone: float, alpha: float) -> np.ndarray:
    with tempfile.TemporaryDirectory() as td:
        src = Path(td) / "in.txt"
        out = Path(td) / "out.wav"
        src.write_text(text, encoding="utf-8")
        subprocess.run(
            ["open_jtalk", "-x", DIC, "-m", VOICE, "-r", str(speed), "-fm", str(halftone),
             "-a", str(alpha), "-ow", str(out), str(src)],
            check=True,
        )
        return trim_silence(load_mono(out))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--halftone", type=float, default=-3.0)
    ap.add_argument("--alpha", type=float, default=0.55)
    ap.add_argument("--force", action="store_true", help="差し替え済みの章も仮の声で作り直す")
    args = ap.parse_args()

    script = load_script(args.episode)
    d = episode_dir(args.episode)
    scene_of = {sid: sc["id"] for sc in script["scenes"] for sid in sc["sentences"]}
    synth_args = (args.speed, args.halftone, args.alpha)

    if script.get("parts"):
        # 章（パート）ごとに1ファイル。Gemini などに差し替え済みの章は上書きしない（--force で上書き）
        src_path = d / "audio" / "narration.source.json"
        meta = json.loads(src_path.read_text(encoding="utf-8")) if src_path.exists() else {}
        meta_parts = meta.get("parts", {})
        for p in script["parts"]:
            pid = p["id"]
            if meta_parts.get(pid, {}).get("source", "openjtalk-temp") != "openjtalk-temp" and not args.force:
                print(f"{pid}: 差し替え済み（{meta_parts[pid]['source']}）なので仮の声は作らない")
                continue
            sents = [x for x in script["sentences"] if x["part"] == pid]
            wav, truth, dur = render(sents, scene_of, synth_args, lead=0.3, tail=0.6)
            write_wav(d / "audio" / "parts" / f"{pid}.wav", wav)
            meta_parts[pid] = {"source": "openjtalk-temp", "truth": truth}
            print(f"{pid}: {dur:.1f}s {len(sents)}文")
        src_path.parent.mkdir(parents=True, exist_ok=True)
        src_path.write_text(json.dumps({"mode": "parts", "parts": meta_parts}, ensure_ascii=False, indent=1), encoding="utf-8")
        return

    wav, truth, dur = render(script["sentences"], scene_of, synth_args, lead=LEAD, tail=TAIL)
    out = d / "audio" / "narration.wav"
    write_wav(out, wav)
    (d / "audio" / "narration.source.json").write_text(
        json.dumps({"source": "openjtalk-temp", "note": "仮の声（Open JTalk m001）。本番は Gemini に差し替える。",
                    "truth": truth}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"wrote {out} ({dur:.1f}s, {len(truth)} sentences)")


def render(sents: list[dict], scene_of: dict, synth_args, lead: float, tail: float):
    """文を順に読み上げてつなぐ。(音, 文ごとの正解の時刻, 長さ) を返す。"""
    chunks: list[np.ndarray] = [np.zeros(int(lead * SR), np.float32)]
    truth = []
    t = lead
    prev_scene = None
    for i, s in enumerate(sents):
        if i > 0:
            gap = GAP_SCENE if scene_of[s["id"]] != prev_scene else GAP_SENTENCE
            chunks.append(np.zeros(int(gap * SR), np.float32))
            t += gap
        wav = synth(read_text(s), *synth_args)
        wav = wav / (np.max(np.abs(wav)) or 1.0) * 0.7
        chunks.append(wav)
        dur = len(wav) / SR
        truth.append({"id": s["id"], "start": round(t, 3), "end": round(t + dur, 3)})
        t += dur
        prev_scene = scene_of[s["id"]]
    chunks.append(np.zeros(int(tail * SR), np.float32))
    return np.concatenate(chunks), truth, t + tail


if __name__ == "__main__":
    main()
