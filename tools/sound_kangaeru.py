"""「考える夜」の音: 映画のような低い持続音とピアノ、場面ごとの効果音を合成する。

make_audio.py から呼ぶ（script.json の "sound": "cinematic"）。外部の音素材は使わない。
"""
from __future__ import annotations

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

from common import SR

FPS = 30
rng = np.random.default_rng(7)


def db(x: float) -> float:
    return 10 ** (x / 20)


def lp(x, hz, order=4):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=3):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def norm(x):
    return x / (np.max(np.abs(x)) or 1.0)


def reverb(x: np.ndarray, seconds=2.8, wet=0.35) -> np.ndarray:
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp(ir, 5000)
    ir /= np.sqrt(np.sum(ir**2))
    y = fftconvolve(x, ir)[: len(x)]
    return (1 - wet) * x + wet * y * 0.6


def place(buf, clip, t, gain_db):
    a = int(t * SR)
    if a >= len(buf) or a + len(clip) <= 0:
        return
    s = max(0, -a)
    a = max(0, a)
    e = min(len(buf), a + len(clip) - s)
    buf[a:e] += norm(clip)[s:s + e - a] * db(gain_db)


# ---------- 音の部品 ----------

def piano(freq: float, dur=4.0) -> np.ndarray:
    """フェルトをかけたピアノ風（倍音＋やわらかい立ち上がり＋長い減衰）。"""
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for k, a in ((1, 1.0), (2, 0.45), (3, 0.18), (4, 0.08), (5, 0.04)):
        x += a * np.sin(2 * np.pi * freq * k * (1 + 0.0004 * k) * t) * np.exp(-t * (0.9 + 0.6 * k))
    env = np.minimum(1, t / 0.012)
    return lp(x * env, 2400)


def drone(total: float, root=73.42) -> np.ndarray:
    t = np.arange(int(total * SR)) / SR
    x = np.zeros_like(t)
    for f, a in ((root / 2, 0.5), (root, 0.8), (root * 1.5, 0.35), (root * 2, 0.25)):
        for d in (-0.002, 0.002):
            x += a * np.sin(2 * np.pi * f * (1 + d) * t + rng.uniform(0, 6.28))
    swell = 0.6 + 0.4 * np.sin(2 * np.pi * t / 11.0) ** 2
    return lp(x * swell, 600)


def crowd(dur: float) -> np.ndarray:
    """遠くの群衆のざわめき（帯域を絞った雑音を、ゆっくり揺らす）。"""
    n = int(dur * SR)
    x = bp(rng.standard_normal(n), 250, 2600)
    mod = lp(rng.standard_normal(n), 3.0)
    mod = 0.6 + 0.4 * norm(mod)
    # ときどき歓声が上がる
    cheer = np.zeros(n)
    for c in rng.uniform(0.5, dur - 1.5, 3):
        a = int(c * SR)
        L = int(1.6 * SR)
        e = min(n, a + L)
        cheer[a:e] += np.sin(np.linspace(0, np.pi, L))[: e - a] * 0.8
    return x * (mod + cheer)


def clink() -> np.ndarray:
    t = np.arange(int(0.6 * SR)) / SR
    return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((2630, 9), (4120, 12), (5370, 16), (6900, 22)))


def crackle(dur: float) -> np.ndarray:
    n = int(dur * SR)
    x = np.zeros(n)
    for p in rng.uniform(0, dur, int(dur * 9)):
        a = int(p * SR)
        L = int(0.004 * SR)
        if a + L < n:
            x[a:a + L] += rng.standard_normal(L) * rng.uniform(0.2, 1.0)
    return hp(x, 1500)


def key_click() -> np.ndarray:
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    click = bp(rng.standard_normal(n), 1800, 6000) * np.exp(-t * 120)
    thump = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60) * 0.6
    return click + thump


def boom(dur=3.5, f0=62, f1=34) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 3)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4)
    hit = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 18) * 0.5
    return x + hit


def riser(dur=2.2) -> np.ndarray:
    """吸い込むように大きくなる音（逆再生の残響のような）。"""
    n = int(dur * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    steps = 16
    seg = n // steps
    for k in range(steps):
        lo = 200 + k * 120
        s = bp(x[k * seg:(k + 1) * seg + 1], lo, lo * 3)
        out[k * seg:k * seg + len(s)] += s
    env = np.linspace(0, 1, n) ** 3
    return out * env


def rumble(dur: float) -> np.ndarray:
    n = int(dur * SR)
    x = lp(rng.standard_normal(n), 120)
    env = np.linspace(0.2, 1, n) ** 2
    return x * env


def heartbeat(dur: float, bpm=58) -> np.ndarray:
    n = int(dur * SR)
    x = np.zeros(n)
    beat = 60 / bpm
    t = np.arange(int(0.25 * SR)) / SR
    th = np.sin(2 * np.pi * 48 * t) * np.exp(-t * 22)
    for k in range(int(dur / beat)):
        for off, g in ((0.0, 1.0), (0.22, 0.6)):
            a = int((k * beat + off) * SR)
            e = min(n, a + len(th))
            if a < n:
                x[a:e] += th[: e - a] * g
    return x


# ---------- 組み立て ----------

def design(tl: dict, total: float) -> tuple[np.ndarray, np.ndarray]:
    """(音楽, 効果音) を返す。どちらも声とは別に、あとで声に合わせて下げる。"""
    n = int(total * SR)
    sc = {s["id"]: s for s in tl["scenes"]}
    t0 = lambda sid: sc[sid]["from"] / FPS  # noqa: E731
    sent = lambda sid, i=0: sc[sid]["from"] / FPS + sc[sid]["sentences"][i]["from"] / FPS  # noqa: E731

    music = np.zeros(n)
    music += norm(drone(total)) * db(-14)
    # ピアノ: D マイナーの短い動機を、場面の頭でまばらに
    D4, F4, A4, C5, Bb3, E4, G4 = 293.66, 349.23, 440.0, 523.25, 233.08, 329.63, 392.0
    motif = [(t0("louisville") + 1.0, D4), (t0("louisville") + 3.4, A4), (t0("derby") + 0.6, F4),
             (t0("derby") + 4.8, E4), (t0("reporter") + 0.2, D4), (sent("reporter", 1) - 0.1, A4),
             (t0("outside") + 0.4, Bb3), (t0("outside") + 5.0, F4), (t0("outside") + 10.5, A4),
             (t0("genre") + 0.3, G4), (t0("shadow") + 0.4, D4), (t0("us") + 0.2, F4),
             (t0("strings") + 0.3, A4), (t0("strings") + 3.2, C5)]
    keys = np.zeros(n)
    for t, f in motif:
        place(keys, piano(f), t, -10)
        place(keys, piano(f / 2, 5.0), t, -18)
    music += reverb(keys, 3.2, 0.45)

    sfx = np.zeros(n)
    # 競馬場のざわめき（ルイビル〜酒の場面）
    cr_end = t0("reporter") + 0.6
    cr = crowd(cr_end)
    fade = np.ones(len(cr))
    fade[: int(2.0 * SR)] = np.linspace(0, 1, int(2.0 * SR))
    fade[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
    place(sfx, reverb(cr * fade, 1.5, 0.3), 0.0, -19)
    place(sfx, clink(), t0("derby") + 0.7, -24)
    place(sfx, clink(), t0("derby") + 0.95, -30)
    # たばこの燃える音
    place(sfx, crackle(sc["reporter"]["duration"] / FPS), t0("reporter"), -34)
    # 名前の札・タイトルの低音
    place(sfx, boom(3.0, 70, 40), sent("reporter", 1) - 0.1, -16)
    # 記者が出来事に入り込む瞬間: 小さく吸い込む音
    od = sc["outside"]
    s6 = od["from"] + od["sentences"][2]["from"]
    place(sfx, riser(1.4), s6 / FPS - 0.2, -28)
    # タイプライター（GenreScene: s.from-6 〜 s.from+30 フレームで 18 文字）
    g = sc["genre"]
    s7 = g["from"] + g["sentences"][0]["from"]
    name_len = len(g["items"]["name"])
    for i in range(name_len):
        if g["items"]["name"][i] == " ":
            continue
        fr = s7 - 6 + 36 * i / name_len
        place(sfx, key_click(), fr / FPS + rng.uniform(-0.01, 0.01), -22 + rng.uniform(-3, 2))
    # 影が伸びる: 低いうなりが近づく
    sh = sc["shadow"]
    s9 = sh["from"] + sh["sentences"][1]["from"]
    place(sfx, rumble(7.0), s9 / FPS, -18)
    # 操り糸の場面: 心臓の音
    place(sfx, heartbeat(sc["strings"]["duration"] / FPS), t0("strings"), -20)
    # タイトル: 吸い込む音 → 重い一撃
    tt = sc["title"]
    s13 = (tt["from"] + tt["sentences"][1]["from"]) / FPS
    place(sfx, riser(2.2), s13 - 2.2, -20)
    place(sfx, reverb(boom(4.5, 58, 30), 3.5, 0.4), s13 - 0.1, -13)
    # 部屋の空気（ごく小さく）
    sfx += lp(rng.standard_normal(n), 3000) * db(-58)

    # 全体の流れ: タイトル前に音楽を少し上げ、最後はゆっくり消す
    tt0 = tt["from"] / FPS
    env = np.ones(n)
    a, b = int((tt0 - 6) * SR), int(tt0 * SR)
    env[a:b] = np.linspace(1, 1.4, b - a)
    env[b:] = 1.4
    env[-int(3 * SR):] *= np.linspace(1, 0, int(3 * SR))
    music *= env
    start = np.minimum(1, np.arange(n) / (2.5 * SR))
    music *= start
    return music, sfx
