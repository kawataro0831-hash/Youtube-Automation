#!/usr/bin/env bash
# 長尺を区間ごとに書き出し、最後につないで音（mix.wav）を入れる。
# 途中で止まっても、もう一度実行すれば書き終えた区間は飛ばして続きから。
#
#   tools/render_chunks.sh kangaeru-01            # → out/kangaeru-01.mp4
#   CHUNK=3000 tools/render_chunks.sh kangaeru-01 # 区間の長さ（フレーム）
#
# 先に tools/build_timeline.py と tools/make_audio.py を済ませておく（make_video.sh の前半）。
set -euo pipefail
cd "$(dirname "$0")/.."
EP="${1:?episode id}"
CHUNK="${CHUNK:-6000}"
PY=.venv/bin/python
COMP=$($PY -c "import json;print(json.load(open('episodes/$EP/script.json')).get('composition','Uratori'))")
TOTAL=$($PY -c "import json;print(json.load(open('video/src/generated/$EP.json'))['durationInFrames'])")
DIR="out/chunks/$EP"
mkdir -p "$DIR"
export PATH=/opt/node22/bin:$PATH
cd video
for ((a = 0; a < TOTAL; a += CHUNK)); do
  b=$((a + CHUNK - 1))
  ((b >= TOTAL)) && b=$((TOTAL - 1))
  f="../$DIR/$(printf '%06d' "$a").mp4"
  if [ -s "$f" ]; then echo "skip $a-$b"; continue; fi
  echo "render $a-$b / $TOTAL $(date +%H:%M:%S)"
  npx remotion render src/index.ts "$COMP" "$f.part.mp4" --frames="$a-$b" --muted \
    --concurrency="${CONCURRENCY:-4}" --log=error 2>&1 | grep -viE "memory|shared-memory" || true
  mv "$f.part.mp4" "$f"
done
cd ..
ls "$DIR"/*.mp4 | sort | sed "s#^#file '$PWD/#; s#\$#'#" > "$DIR/list.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$DIR/list.txt" -i "video/public/ep/$EP/mix.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest "out/$EP.mp4"
cp "episodes/$EP/build/subtitles.srt" "out/$EP.srt"
echo "done: out/$EP.mp4 $(date +%H:%M:%S)"
