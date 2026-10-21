"""Shared helpers for the episode tools (paths, script loading, audio I/O)."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import soundfile as sf

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


def load_mono(path: Path, sr: int = SR) -> np.ndarray:
    """WAV を float32 モノラル・sr Hz で読む（必要なら単純な線形補間で変換）。"""
    data, in_sr = sf.read(str(path), dtype="float32", always_2d=True)
    mono = data.mean(axis=1)
    if in_sr != sr:
        n = int(round(len(mono) * sr / in_sr))
        x_old = np.linspace(0.0, 1.0, num=len(mono), endpoint=False)
        x_new = np.linspace(0.0, 1.0, num=n, endpoint=False)
        mono = np.interp(x_new, x_old, mono).astype(np.float32)
    return mono


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
