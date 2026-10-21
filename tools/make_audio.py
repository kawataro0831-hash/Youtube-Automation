"""声・BGM・効果音を混ぜて video/public/ep/mix.wav を作る（-16 LUFS）。

BGM と効果音は外部素材を使わず、ここで合成する（著作権の心配がない仮の音）。
本番で好きな BGM を使うときは --bgm でファイルを渡す。

  .venv/bin/python tools/make_audio.py uratori-01-1min
  .venv/bin/python tools/make_audio.py uratori-01-1min --bgm path/to/bgm.wav
"""
from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

from common import ROOT, SR, episode_dir, load_mono, load_script, load_stereo, write_wav

FPS = 30
rng = np.random.default_rng(11)


def db(x: float) -> float:
    return 10 ** (x / 20)


def lowpass(x, hz, order=4):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def bandpass(x, lo, hi, order=4):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def note(freq: float, dur: float, detune=0.004) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    # 少しずらした3本の三角波（やわらかいパッド）
    out = np.zeros_like(t)
    for d in (-detune, 0, detune):
        ph = (t * freq * (1 + d)) % 1.0
        out += 2 * np.abs(2 * ph - 1) - 1
    return out / 3


def bgm(total: float) -> np.ndarray:
    """静かな緊張感のあるパッド（Am → F → C → G をゆっくり）と低い持続音。"""
    chords = [(110.0, 130.81, 164.81), (87.31, 130.81, 174.61), (98.0, 130.81, 164.81), (98.0, 123.47, 146.83)]
    seg = 8.0
    n = int(total * SR)
    out = np.zeros(n)
    fade = int(2.5 * SR)
    for i in range(int(np.ceil(total / seg)) + 1):
        c = chords[i % len(chords)]
        a = int(i * seg * SR) - fade // 2
        length = int(seg * SR) + fade
        buf = sum(note(f, length / SR) for f in c) / len(c)
        env = np.ones(length)
        env[:fade] = np.linspace(0, 1, fade)
        env[-fade:] = np.linspace(1, 0, fade)
        buf = buf * env
        s, e = max(0, a), min(n, a + length)
        if e > s:
            out[s:e] += buf[s - a:e - a]
    out = lowpass(out, 900)
    t = np.arange(n) / SR
    drone = 0.5 * np.sin(2 * np.pi * 55.0 * t) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * t))
    air = lowpass(bandpass(rng.standard_normal(n), 2000, 6000), 6000) * 0.04
    mix = out + drone * 0.35 + air
    # 頭と終わりをなめらかに
    env = np.ones(n)
    env[: int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR))
    env[-int(3 * SR):] = np.linspace(1, 0, int(3 * SR))
    return mix * env


def paper_fwip(dur=0.16) -> np.ndarray:
    n = int(dur * SR)
    x = bandpass(rng.standard_normal(n), 1200, 7000)
    env = np.exp(-np.linspace(0, 7, n)) * np.minimum(1, np.linspace(0, 12, n))
    return x * env


def whoosh(dur=0.7) -> np.ndarray:
    n = int(dur * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    # 帯域を上に動かしながら少しずつ
    step = n // 14
    for k in range(14):
        lo = 300 + k * 180
        seg = bandpass(x[k * step:(k + 1) * step + 1], lo, lo * 2.5)
        out[k * step:k * step + len(seg)] += seg
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return out * env


def pon(dur=0.35) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    f = 660 * (1 + 0.5 * np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)


def place(buf: np.ndarray, clip: np.ndarray, t: float, gain_db: float) -> None:
    a = int(t * SR)
    if a >= len(buf):
        return
    e = min(len(buf), a + len(clip))
    buf[a:e] += clip[: e - a] * db(gain_db) / (np.max(np.abs(clip)) or 1.0)


def duck_envelope(voice: np.ndarray, depth_db=-9.0, attack=0.08, release=0.5) -> np.ndarray:
    """声があるところで BGM を下げる。"""
    hop = int(0.01 * SR)
    frames = len(voice) // hop + 1
    level = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(frames)])
    active = (20 * np.log10(level / (level.max() + 1e-12)) > -35).astype(float)
    g = np.ones(frames)
    cur = 1.0
    target_low = db(depth_db)
    for i in range(frames):
        tgt = target_low if active[i] else 1.0
        rate = 0.01 / (attack if tgt < cur else release)
        cur += (tgt - cur) * min(1.0, rate)
        g[i] = cur
    return np.repeat(g, hop)[: len(voice)]


def loudnorm(src: Path, dst: Path, target=-16.0) -> None:
    """ffmpeg の loudnorm を2回通して -16 LUFS / ピーク -1.5 dBTP に合わせる。"""
    first = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(src), "-af", f"loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json",
         "-f", "null", "-"], capture_output=True, text=True, check=True)
    js = first.stderr[first.stderr.rindex("{"): first.stderr.rindex("}") + 1]
    m = json.loads(js)
    af = (f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", af, "-ar", str(SR), str(dst)], check=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--bgm", type=Path, help="合成の代わりに使う BGM ファイル")
    ap.add_argument("--bgm-db", type=float, help="BGM の大きさ（声の最大を 0 dB として）。既定は回の音の種類による")
    ap.add_argument("--music-rms", type=float, default=-30.0, help="場面ごとの曲の大きさ（RMS dBFS）。声は約 -20")
    args = ap.parse_args()
    script = load_script(args.episode)

    d = episode_dir(args.episode)
    voice = load_mono(d / "audio" / "narration.wav")
    voice = voice / (np.max(np.abs(voice)) or 1.0) * 0.9
    total = len(voice) / SR
    tl = json.loads((ROOT / "video" / "src" / "generated" / f"{args.episode}.json").read_text(encoding="utf-8"))

    if script.get("sound") == "cinematic":
        # 映画のような音。曲は script.json の "music"（場面ごとに Flow Music などで作った曲）を並べ、
        # 曲が無い区間と効果音は sound_kangaeru.py の合成で埋める
        import music_cues
        import sound_kangaeru

        synth, sfx = sound_kangaeru.design(tl, total)
        synth = fit(synth, len(voice))
        if args.bgm:
            music = load_stereo(args.bgm)[: len(voice)]
            music = np.pad(music, ((0, len(voice) - len(music)), (0, 0)))
            music = music / (np.max(np.abs(music)) or 1.0) * db(args.bgm_db if args.bgm_db is not None else -15.0)
        elif script.get("music"):
            music, log = music_cues.build(script, tl, total, synth, args.music_rms)
            music = np.pad(music, ((0, max(0, len(voice) - len(music))), (0, 0)))[: len(voice)]
            print("\n".join(log))
        else:
            music = synth / (np.max(np.abs(synth)) or 1.0) * db(args.bgm_db if args.bgm_db is not None else -15.0)
            music = np.repeat(music[:, None], 2, axis=1)
        music *= duck_envelope(voice, depth_db=-7.0)[:, None]
        sfx = fit(sfx, len(voice))
        voice = np.repeat(voice[:, None], 2, axis=1)  # 声は真ん中
        sfx = np.repeat(sfx[:, None], 2, axis=1)
    else:
        music, sfx = uratori_sound(args, tl, voice, total)
    mix = voice + music + sfx
    with tempfile.TemporaryDirectory() as td:
        raw = Path(td) / "raw.wav"
        write_wav(raw, mix / max(1.0, np.max(np.abs(mix))))
        out = ROOT / "video" / "public" / "ep" / args.episode / "mix.wav"
        out.parent.mkdir(parents=True, exist_ok=True)
        loudnorm(raw, out)
    print(f"wrote {out} ({total:.1f}s)")


def fit(x: np.ndarray, n: int) -> np.ndarray:
    return np.pad(x, (0, max(0, n - len(x))))[:n]


def uratori_sound(args, tl: dict, voice: np.ndarray, total: float) -> tuple[np.ndarray, np.ndarray]:
    """ウラトリの音: やわらかいパッドの BGM と、紙・ポンなどの効果音。"""
    music = load_mono(args.bgm) if args.bgm else bgm(total)
    music = fit(music, len(voice))
    music = music / (np.max(np.abs(music)) or 1.0) * db(args.bgm_db if args.bgm_db is not None else -24.0)
    music *= duck_envelope(voice)

    sfx = np.zeros(len(voice))
    for sc in tl["scenes"]:
        t0 = sc["from"] / FPS
        if sc["id"] == "open":
            # blender/shots.py の shot_a: 紙が置かれるコマ（24fps）= frames*割合 + 16
            frames = int(6.5 * 24)
            clip_len = frames / 24
            rate = min(1.0, clip_len / (sc["duration"] / FPS))
            for f in (0.02, 0.12, 0.22, 0.32, 0.42, 0.52):
                place(sfx, paper_fwip(), t0 + (int(frames * f) + 12) / 24 / rate, -24)
        if sc["type"] == "keymsg" and sc["id"] == "key1":
            place(sfx, whoosh(), max(0.0, t0 - 0.35), -26)
        if sc["type"] == "question":
            place(sfx, pon(), t0 + sc["sentences"][0]["from"] / FPS, -22)
        if sc["type"] in ("news", "dots", "bars"):
            place(sfx, paper_fwip(0.22), t0 + 0.05, -26)
    return music, sfx


if __name__ == "__main__":
    main()
