"""Shared helpers for the episode tools (paths, script loading, audio I/O)."""
from __future__ import annotations

import json
import subprocess
import tempfile
from math import gcd
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
SR = 48000


def episode_dir(ep: str) -> Path:
    d = ROOT / "episodes" / ep
    if not (d / "script.json").exists():
        raise SystemExit(f"script.json が見つかりません: {d}")
    return d


def load_script(ep: str) -> dict:
    return json.loads((episode_dir(ep) / "script.json").read_text(encoding="utf-8"))


def read_text(s: dict) -> str:
    """読み上げ用の文（read があれば優先）。画面・字幕は text を使う。"""
    return s.get("read") or s["text"]


def load_audio(path: Path, sr: int = SR) -> np.ndarray:
    """音声ファイルを float32・sr Hz・(サンプル数, チャンネル数) で読む。

    WAV/FLAC/MP3 は soundfile で、読めない形式（M4A など）は ffmpeg で WAV にしてから読む。
    サンプリング周波数の変換は resample_poly（Gemini の 24kHz の声もきれいに 48kHz へ）。
    """
    try:
        data, in_sr = sf.read(str(path), dtype="float32", always_2d=True)
    except Exception:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td) / "decoded.wav"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), str(tmp)], check=True)
            data, in_sr = sf.read(str(tmp), dtype="float32", always_2d=True)
    if in_sr != sr:
        g = gcd(int(in_sr), int(sr))
        data = resample_poly(data, sr // g, int(in_sr) // g, axis=0).astype(np.float32)
    return data


def load_mono(path: Path, sr: int = SR) -> np.ndarray:
    """モノラル（float32・sr Hz）で読む。"""
    return load_audio(path, sr).mean(axis=1).astype(np.float32)


def load_stereo(path: Path, sr: int = SR) -> np.ndarray:
    """ステレオ（サンプル数×2）で読む。モノラルなら左右に同じ音を置く。"""
    a = load_audio(path, sr)
    if a.shape[1] == 1:
        a = np.repeat(a, 2, axis=1)
    return a[:, :2]


def write_wav(path: Path, data: np.ndarray, sr: int = SR) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), data.astype(np.float32), sr, subtype="PCM_16")


def trim_silence(x: np.ndarray, sr: int = SR, thresh_db: float = -45.0, pad: float = 0.03) -> np.ndarray:
    """頭と終わりの無音を切る（ピーク基準 thresh_db 以下を無音とみなす）。"""
    if len(x) == 0:
        return x
    peak = float(np.max(np.abs(x))) or 1.0
    thr = peak * (10 ** (thresh_db / 20))
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x[:0]
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]
