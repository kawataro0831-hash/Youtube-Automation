#!/usr/bin/env bash
# 3Dカットを全フレーム描き、Remotion が読む MP4（1920x1080・24fps）にまとめる。
#   ./render_shots.sh            # 両方
#   ./render_shots.sh a          # shot_a だけ
# 既定は 75% 解像度・EEVEE 8 サンプル（GPU なしのコンテナで 1コマ約12秒）。GPU のある Mac なら
# RES=100 SAMPLES=32 ./render_shots.sh で本番品質にできる。
set -euo pipefail
cd "$(dirname "$0")"
RES="${RES:-75}"
SAMPLES="${SAMPLES:-8}"
OUT=../video/public/blender
mkdir -p "$OUT"
for shot in "${@:-a b}"; do
  for s in $shot; do
    case "$s" in a) name=shot_a_papers ;; b) name=shot_b_magnifier ;; *) echo "unknown shot $s"; exit 1 ;; esac
    rm -rf "renders/$name"
    .venv/bin/python shots.py --shot "$s" --res "$RES" --samples "$SAMPLES" 2>&1 | grep -E "^\[|^done" || true
    ffmpeg -y -loglevel error -framerate 24 -i "renders/$name/%04d.png" \
      -vf "scale=1920:1080:flags=lanczos,format=yuv420p" -c:v libx264 -crf 16 -preset slow "$OUT/$name.mp4"
    echo "encoded $OUT/$name.mp4"
  done
done
