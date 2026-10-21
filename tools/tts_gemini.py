"""Gemini TTS（既定 gemini-3.8-flash-tts）で narration.wav を1テイクで作る。

声色がずれないよう、台本の全文を1回で読ませる（1分なら1回で足りる）。
文の切れ目は tools/build_timeline.py が無音から見つける。

  export GEMINI_API_KEY=...            # Google AI Studio の API キー（環境変数で渡す。ファイルに書かない）
  .venv/bin/python tools/tts_gemini.py uratori-01-1min
  .venv/bin/python tools/tts_gemini.py uratori-01-1min --voice Gacrux   # 声を変えて作り直す
  .venv/bin/python tools/tts_gemini.py uratori-01-1min --dry-run        # 送る内容だけ表示

作ったテイクは audio/_takes/ に残し、最新を audio/narration.wav に置く。
API キーを使わない場合は episodes/<ep>/tts/ai_studio.md の手順で AI Studio の画面から作り、
できた WAV を audio/narration.wav に置けば、後の手順は同じ。
"""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import io
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.request
import wave

from common import episode_dir, load_script, read_text

API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def build_prompt(script: dict) -> str:
    """演出メモ＋台本。見出しの書き方は Gemini TTS の公式の書き方（AUDIO PROFILE / DIRECTOR'S NOTES / TRANSCRIPT）。

    モデルが読むのは TRANSCRIPT の部分だけ。文の間は改行で区切り、場面の変わり目は空行にする。
    """
    v = script["voice"]
    scene_of = {sid: sc["id"] for sc in script["scenes"] for sid in sc["sentences"]}
    lines, prev = [], None
    for s in script["sentences"]:
        if prev is not None and scene_of[s["id"]] != prev:
            lines.append("")
        lines.append(read_text(s))
        prev = scene_of[s["id"]]
    return (
        "# AUDIO PROFILE: 渋い声のドキュメンタリー・ナレーター（日本語）\n"
        "## THE SCENE: 夜、静かなスタジオ。テクノロジーのニュースの裏側を、一次資料を読みながら淡々と語る。\n"
        "### DIRECTOR'S NOTES\n"
        f"{v['style']}\n"
        "空行のところ（場面の変わり目）は、ふつうの句点より長めに間をとる。\n"
        "#### TRANSCRIPT\n" + "\n".join(lines)
    )


def request_bodies(prompt: str, voice: str, temperature: float) -> list[tuple[str, dict]]:
    """送り方を2通り用意する（先に広く使われている prebuiltVoiceConfig、だめなら voice 直書き）。"""
    base = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}

    def gen(speech: dict) -> dict:
        return {**base, "generationConfig": {"responseModalities": ["AUDIO"], "temperature": temperature,
                                             "speechConfig": speech}}

    return [
        ("prebuiltVoiceConfig", gen({"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}})),
        ("voiceConfig.voice", gen({"voiceConfig": {"voice": voice}})),
    ]


def post(url: str, key: str, body: dict) -> dict:
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(), method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read())


def to_wav(mime: str, data: bytes) -> bytes:
    """PCM（audio/L16;rate=24000 など）なら WAV に包む。WAV ならそのまま。"""
    if data[:4] == b"RIFF":
        return data
    m = re.search(r"rate=(\d+)", mime or "")
    rate = int(m.group(1)) if m else 24000
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(data)
    return buf.getvalue()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--model")
    ap.add_argument("--voice")
    ap.add_argument("--temperature", type=float)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    script = load_script(args.episode)
    v = script["voice"]
    model = args.model or v["model"]
    voice = args.voice or v["voice"]
    temperature = args.temperature if args.temperature is not None else v.get("temperature", 1.0)
    prompt = build_prompt(script)
    bodies = request_bodies(prompt, voice, temperature)

    if args.dry_run:
        print(f"POST {API.format(model=model)}\n")
        print(json.dumps(bodies[0][1], ensure_ascii=False, indent=2))
        return 0

    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        print("GEMINI_API_KEY が設定されていません（AI Studio で作る場合は tts/ai_studio.md を参照）", file=sys.stderr)
        return 2

    url = API.format(model=model)
    res, used, errors = None, None, []
    for name, body in bodies:
        try:
            res = post(url, key, body)
            used = name
            break
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")
            errors.append(f"[{name}] HTTP {e.code}: {msg[:600]}")
            if e.code != 400:  # 400（形式の違い）以外は、もう一方を試しても同じ
                break
    if res is None:
        print("\n".join(errors), file=sys.stderr)
        return 1

    parts = res.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    audio = [p.get("inlineData") or p.get("inline_data") for p in parts]
    audio = [a for a in audio if a]
    if not audio:
        print("音声が返ってきませんでした:\n" + json.dumps(res, ensure_ascii=False)[:1500], file=sys.stderr)
        return 1
    mime = audio[0].get("mimeType") or audio[0].get("mime_type", "")
    wav = to_wav(mime, b"".join(base64.b64decode(a["data"]) for a in audio))

    d = episode_dir(args.episode) / "audio"
    takes = d / "_takes"
    takes.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    take = takes / f"gemini_{voice}_{stamp}.wav"
    take.write_bytes(wav)
    shutil.copyfile(take, d / "narration.wav")
    (d / "narration.source.json").write_text(json.dumps({
        "source": "gemini", "model": model, "voice": voice, "temperature": temperature,
        "request_format": used, "mime": mime, "take": take.name, "created": stamp,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    with wave.open(io.BytesIO(wav)) as w:
        sec = w.getnframes() / w.getframerate()
    print(f"wrote {d / 'narration.wav'} ({sec:.1f}s, {model}, {voice}, format={used})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
