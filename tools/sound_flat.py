"""新チャンネル（仮）の音: やわらかいシンセのパッドと、きらきらしたベル、札が出るときの小さな音。

make_audio.py から呼ぶ（script.json の "sound": "ambient"）。外部の音素材は使わない。
効果音の時刻は video/src/flat/scenes.tsx の札・光の動きと同じ見積もり（phrase_frame）で合わせる。
"""
from __future__ import annotations

import numpy as np

from sound_kangaeru import bp, db, hp, lp, norm, place, reverb

from common import SR

FPS = 30
rng = np.random.default_rng(23)


def phrase_frame(s: dict, phrase: str, end: bool = True) -> int:
    """uratori/scenes.tsx の phraseFrame と同じ: 文字数の比で、言い始め／言い終えのフレームを見積もる。"""
    i = s["text"].find(phrase)
    if i < 0:
        return s["to"] if end else s["from"]
    pos = i + len(phrase) if end else i
    return round(s["from"] + pos / len(s["text"]) * (s["to"] - s["from"]))


def pad(freqs: tuple[float, ...], dur: float) -> np.ndarray:
    """ゆっくり立ち上がる和音（少しずらしたノコギリ波を低域だけ通す）。"""
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for f in freqs:
        for d in (-0.003, 0.0, 0.003):
            ph = (t * f * (1 + d) + rng.uniform()) % 1.0
            x += 2 * ph - 1
    x = lp(x / (len(freqs) * 3), 1400)
    env = np.minimum(1, t / 2.0) * np.minimum(1, (dur - t) / 2.0)
    return x * np.clip(env, 0, 1)


def bell(freq: float, dur: float = 2.5) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (2.2 + 1.5 * k)) for k, a in ((1, 1.0), (2.76, 0.35), (5.4, 0.12)))
    return x * np.minimum(1, t / 0.004)


def pop(dur: float = 0.18) -> np.ndarray:
    """札が弾んで出る音（短く上がる音程）。"""
    t = np.arange(int(dur * SR)) / SR
    f = 520 + 900 * (1 - np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)


def whoosh(dur: float = 0.9) -> np.ndarray:
    n = int(dur * SR)
    x = bp(rng.standard_normal(n), 300, 3000)
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return lp(x * env, 2500)


def design(tl: dict, total: float) -> tuple[np.ndarray, np.ndarray]:
    """(音楽, 効果音) を返す。"""
    n = int(total * SR)
    # Cmaj9 → Am9 → Fmaj9 → G6/9 を 6 秒ずつ、重ねてつなぐ
    chords = [(130.81, 196.0, 246.94, 293.66, 329.63), (110.0, 164.81, 196.0, 246.94, 261.63),
              (87.31, 130.81, 164.81, 196.0, 261.63), (98.0, 146.83, 196.0, 220.0, 293.66)]
    seg = 6.0
    music = np.zeros(n)
    for i in range(int(np.ceil(total / seg)) + 1):
        place(music, pad(chords[i % 4], seg + 2.0), i * seg - 1.0, -6)
    # ベル: 場面の頭で、和音の音をひとつ高く鳴らす
    bells = np.zeros(n)
    for i, sc in enumerate(tl["scenes"]):
        f = chords[int(sc["from"] / FPS / seg) % 4][2 + i % 3] * 4
        place(bells, bell(f), sc["from"] / FPS + 0.15, -14)
    music = norm(music) * db(-3) + reverb(bells, 3.0, 0.5)

    sfx = np.zeros(n)
    sc = {s["id"]: s for s in tl["scenes"]}
    at = lambda scene, sent, phrase, end=False: (sc[scene]["from"] + phrase_frame(sc[scene]["sentences"][sent], phrase, end)) / FPS  # noqa: E731
    for s in tl["scenes"][1:]:
        place(sfx, whoosh(), s["from"] / FPS - 0.45, -30)
    pops = []
    if "sun" in sc:
        pops += [at("sun", 0, "いま"), at("sun", 0, "ではない")]
    if "photon" in sc:
        pops.append(at("photon", 0, "30万キロメートル"))
        arrive = at("photon", 1, "8分20秒", True)
        place(sfx, reverb(bell(1567.98, 3.0), 2.5, 0.5), arrive, -16)
        start = (sc["photon"]["from"] + sc["photon"]["sentences"][0]["from"] + 6) / FPS
        # 光の粒が進むあいだの、かすかな高い持続音
        hum = hp(rng.standard_normal(int((arrive - start) * SR)), 5000) * np.linspace(0.2, 1, int((arrive - start) * SR))
        place(sfx, lp(hum, 9000), start, -40)
    if "moon" in sc:
        pops.append(at("moon", 0, "1.3秒"))
    if "stars" in sc:
        pops += [at("stars", 0, "近い星", True) + 10 / FPS, at("stars", 0, "4年以上")]
    if "past" in sc:
        pops.append(at("past", 0, "過去を見ている"))
    for t in pops:
        place(sfx, pop(), t, -24)
    return music, sfx
