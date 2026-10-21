"""ブラウザ（AI Studio・Flow Music）で作った音声ファイルを、回の決まった場所に置く。

  # 声（AI Studio の Generate speech で作った WAV）
  .venv/bin/python tools/register_audio.py kangaeru-01-1min voice ~/Downloads/speech.wav --note "AI Studio・Algenib"
  # 曲（Flow Music で作った曲）。m1〜m4 は script.json の music[].id
  .venv/bin/python tools/register_audio.py kangaeru-01-1min music m2 ~/Downloads/noir.mp3 --note "Flow Music・2テイク目"
  # 曲ごとの Flow Music への指示文を表示
  .venv/bin/python tools/register_audio.py kangaeru-01-1min prompts

声を置くと narration.source.json も書き換わり、画面の「仮の声」の表示が消える。
前のファイルは audio/_takes/ と music/_takes/ に残す。
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import shutil
from pathlib import Path

import soundfile as sf

from common import episode_dir, load_audio, load_script

STAMP = dt.datetime.now().strftime("%Y%m%d-%H%M%S")


def keep_old(path: Path, takes: Path) -> None:
    if path.exists():
        takes.mkdir(parents=True, exist_ok=True)
        shutil.move(str(path), str(takes / f"{path.stem}_{STAMP}{path.suffix}"))


def describe(path: Path) -> str:
    a = load_audio(path)
    return f"{len(a) / 48000:.1f}秒・{a.shape[1]}ch"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    sub = ap.add_subparsers(dest="kind", required=True)
    v = sub.add_parser("voice")
    v.add_argument("file", type=Path)
    v.add_argument("--part", help="章に分かれている回の章 id（prologue, ch1 など）")
    v.add_argument("--note", default="")
    m = sub.add_parser("music")
    m.add_argument("cue")
    m.add_argument("file", type=Path)
    m.add_argument("--note", default="")
    sub.add_parser("prompts")
    args = ap.parse_args()

    script = load_script(args.episode)
    d = episode_dir(args.episode)

    if args.kind == "prompts":
        for c in script.get("music", []):
            print(f"## {c['id']}  {c.get('title', '')}（{c['from']} → {c['to']}）\n{c['prompt']}\n")
        return

    src = args.file.expanduser()
    if not src.exists():
        raise SystemExit(f"ファイルがありません: {src}")
    info = describe(src)

    if args.kind == "voice" and script.get("parts"):
        pids = [p["id"] for p in script["parts"]]
        if args.part not in pids:
            raise SystemExit(f"--part で章を指定してください（{', '.join(pids)}）")
        dst = d / "audio" / "parts" / f"{args.part}.wav"
        keep_old(dst, d / "audio" / "_takes")
        dst.parent.mkdir(parents=True, exist_ok=True)
        a = load_audio(src)
        sf.write(str(dst), a, 48000, subtype="PCM_16")
        meta_path = d / "audio" / "narration.source.json"
        meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {"mode": "parts", "parts": {}}
        v = script.get("voice", {})
        meta.setdefault("parts", {})[args.part] = {
            "source": "gemini-ai-studio", "model": v.get("model"), "voice_planned": v.get("voice"),
            "note": args.note, "original_file": src.name, "registered": STAMP}
        meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
        rest = [p for p in pids if meta["parts"].get(p, {}).get("source", "openjtalk-temp") == "openjtalk-temp"]
        print(f"章 {args.part} の声を置きました: {dst}（{info}）")
        print(f"まだ仮の声の章: {', '.join(rest) if rest else 'なし（全部そろいました）'}")
        return

    if args.kind == "voice":
        dst = d / "audio" / "narration.wav"
        keep_old(dst, d / "audio" / "_takes")
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.suffix.lower() == ".wav":
            shutil.copyfile(src, dst)
        else:  # WAV 以外（MP3 など）は WAV にして置く
            a = load_audio(src)
            sf.write(str(dst), a, 48000, subtype="PCM_16")
        v = script.get("voice", {})
        (d / "audio" / "narration.source.json").write_text(json.dumps({
            "source": "gemini-ai-studio", "model": v.get("model"), "voice_planned": v.get("voice"),
            "note": args.note, "original_file": src.name, "registered": STAMP,
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"声を置きました: {dst}（{info}）")
        return

    cues = {c["id"]: c for c in script.get("music", [])}
    if args.cue not in cues:
        raise SystemExit(f"曲の id が違います: {args.cue}（ある id: {', '.join(cues)}）")
    base = d / cues[args.cue]["file"]
    music_dir = base.parent
    music_dir.mkdir(parents=True, exist_ok=True)
    for old in music_dir.glob(base.stem + ".*"):
        keep_old(old, music_dir / "_takes")
    dst = base.with_suffix(src.suffix.lower())
    shutil.copyfile(src, dst)
    log = music_dir / "sources.json"
    entries = json.loads(log.read_text(encoding="utf-8")) if log.exists() else {}
    entries[args.cue] = {"file": dst.name, "original_file": src.name, "note": args.note, "registered": STAMP,
                         "tool": "Google Flow Music (Lyria 3.5)"}
    log.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"曲 {args.cue} を置きました: {dst}（{info}）")


if __name__ == "__main__":
    main()
