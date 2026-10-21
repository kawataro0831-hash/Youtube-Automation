#!/usr/bin/env bash
# 1本を通しで作る: 時刻表 → 音（声・BGM・効果音）→ Remotion で書き出し
#
#   ./make_video.sh uratori-01-1min              # narration.wav がある前提
#   VOICE=gemini ./make_video.sh uratori-01-1min # 先に Gemini TTS で声を作る（GEMINI_API_KEY が要る）
#   VOICE=temp   ./make_video.sh uratori-01-1min # 仮の声（Open JTalk）で作る
#
# 3D（Blender）の素材は先に作っておく: ウラトリ＝blender/render_shots.sh、考える夜＝blender/render_kangaeru.sh
set -euo pipefail
cd "$(dirname "$0")"
EP="${1:?episode id (例: uratori-01-1min)}"
PY=.venv/bin/python

case "${VOICE:-keep}" in
  gemini) $PY tools/tts_gemini.py "$EP" ;;
  temp) $PY tools/voice_temp_openjtalk.py "$EP" ;;
  keep) ;;
  *) echo "VOICE は gemini / temp / keep"; exit 1 ;;
esac

$PY tools/build_timeline.py "$EP"
$PY tools/make_audio.py "$EP"

COMP=$($PY -c "import json,sys;print(json.load(open('episodes/$EP/script.json')).get('composition','Uratori'))")
mkdir -p out
cd video
export PATH=/opt/node22/bin:$PATH
npx remotion render src/index.ts "$COMP" "../out/$EP.mp4" --concurrency="${CONCURRENCY:-4}" --log=error
cd ..
cp "episodes/$EP/build/subtitles.srt" "out/$EP.srt"
echo "done: out/$EP.mp4 / out/$EP.srt"
