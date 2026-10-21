#!/usr/bin/env bash
# 「考える夜」の場面を本番の大きさで描き、Remotion が読む場所へ書き出す。
#   ./render_kangaeru.sh                 # 全部
#   ./render_kangaeru.sh derby shadow    # 指定した場面だけ
set -euo pipefail
cd "$(dirname "$0")"
OUT=../video/public/kangaeru
mkdir -p "$OUT"
scenes=("$@")
[ ${#scenes[@]} -eq 0 ] && scenes=(louisville reporter derby window strings shadow)
for s in "${scenes[@]}"; do
  echo "== $s $(date +%H:%M:%S)"
  if [ "$s" = shadow ]; then
    rm -rf renders/kangaeru/k_shadow
    .venv/bin/python kangaeru.py --scene shadow 2>&1 | grep -E "frame [0-9]+0/|^done|Error|Traceback" || true
    ffmpeg -y -loglevel error -framerate 24 -i renders/kangaeru/k_shadow/%04d.png \
      -vf "scale=1920:1080:flags=lanczos,format=yuv420p" -c:v libx264 -crf 16 -preset slow "$OUT/k_shadow.mp4"
  else
    .venv/bin/python kangaeru.py --scene "$s" 2>&1 | grep -E "^done|Error|Traceback" || true
    ffmpeg -y -loglevel error -i "renders/kangaeru/k_$s.png" -q:v 2 "$OUT/k_$s.jpg"
  fi
  echo "== $s done $(date +%H:%M:%S)"
done
