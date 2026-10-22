# Youtube-Automation

YouTube の解説動画を、台本（JSON）から自動で組み立てる道具一式。いまある回:

| 回 | チャンネル | 中身 | 3D の素材 |
|---|---|---|---|
| `kangaeru-01` | 考える夜 | 本編フル尺（約30分）。台本全文を `source.txt` に写し、章ごとの声と曲で組む。仕上げ方は `episodes/kangaeru-01/HANDOFF.md` | `blender/render_kangaeru.sh`（14場面） |
| `kangaeru-01-1min` | 考える夜 | 「なぜ人間は『自分らしさ』に殺されるのか？」PROLOGUE の1分版。映画のような暗い画面・明朝体の字幕・黒帯 | `blender/render_kangaeru.sh`（`blender/kangaeru.py`） |
| `uratori-01-1min` | ウラトリ | 「相次ぐ情報漏洩の裏側」の1分版。生成りの紙面＋黄色のマーカー | `blender/render_shots.sh`（`blender/shots.py`） |

```bash
# フル尺（章ごと）: 原稿 → 台本 → 時刻表 → 音 → 区間ごとに書き出し
.venv/bin/python tools/parse_source.py kangaeru-01
.venv/bin/python tools/voice_temp_openjtalk.py kangaeru-01   # 声がまだ無い章だけ仮の声
.venv/bin/python tools/build_timeline.py kangaeru-01
.venv/bin/python tools/make_audio.py kangaeru-01
tools/render_chunks.sh kangaeru-01                         # → out/kangaeru-01.mp4（途中から再開できる）

blender/render_kangaeru.sh                       # 考える夜の3D（静止画5枚＋影のアニメ）
VOICE=gemini ./make_video.sh kangaeru-01-1min    # Gemini の声（API キー）→ 時刻表 → 音 → 書き出し
```

声と曲の差し替えは、手元の Claude Code に `/finish-audio <回>` で任せられる（指示書は `.claude/skills/finish-audio/`。
`claude --chrome` で起動）。自分の手で進めるときは `episodes/kangaeru-01/HANDOFF.md`（作ったファイルは `tools/register_audio.py` で置く）。
差し替えた声と曲は `tools/check_audio.py` で機械的に確かめてから、確認用の短い音（`preview`）を耳で聞く。
曲は場面ごとに切り替えられる（`script.json` の `music`。区間の確認は `tools/music_cues.py`）。

### 考える夜の作り

- 場面: 1970年ルイビルの夕景（尖塔の影）／バーボンのグラス（Cycles）／帽子・サングラス・シガレットホルダーの静物（Cycles）／
  「出来事の外から中へ」の図／名前がジャンルになる文字／伸びていく影（EEVEE のアニメ）／夜の窓辺／木の操り人形／タイトル
- 人物は顔を描かず、持ち物・影・操り人形で表す（作りものの人間が安っぽく見えないように）
- 音は `tools/sound_kangaeru.py` で合成（低い持続音・ピアノ・群衆・氷・たばこ・タイプライター・低音の一撃）。外部の素材なし
- 字幕は下の黒帯に焼き込み（`KangaeruMain` の `burnSubtitles` で切り替え）。`.srt` も出る

## しくみ

```
episodes/<回>/script.json   台本の正本（文・場面の型・画面の文字・出典・声の設定）
        │
        ├─ 声  tools/tts_gemini.py（Gemini 3.8 Flash TTS・1テイク）
        │      または AI Studio で作った WAV を audio/narration.wav に置く（tts/ai_studio.md）
        │      仮の声: tools/voice_temp_openjtalk.py（間合いの確認用）
        │
        ├─ 時刻表  tools/build_timeline.py  無音から文の切れ目を見つけ、場面のフレームと字幕 .srt を作る
        ├─ 音      tools/make_audio.py      声＋BGM（合成）＋効果音、-16 LUFS
        │
        ├─ 3D     blender/shots.py           bpy（Blender 5.2）で紙面の3Dカットを描く
        │          blender/textures/*.png    紙に貼る画像（Remotion の Still で作る）
        │
        └─ 画面    video/（Remotion 4）       場面の型ごとの部品で組んで MP4 に書き出す
```

- 見た目は試作1のトンマナ（生成りの地 #eeeeeb・黒 #1a1a1a・黄色のマーカー #f3dc7a・Noto Sans JP）。
- 出どころの札: 公式発表＝黒地／調査報告＝白地に黒枠／本人の発言＝黄色／報道＝灰色（右下）。
- 字幕は焼き込まず、`out/<回>.srt` を YouTube に上げる。

## 使い方

```bash
# 準備（初回）
uv venv --python 3.13 .venv && uv pip install --python .venv/bin/python numpy==2.3.3 soundfile==0.13.1 scipy==1.16.2
(cd video && npm ci)
(cd blender && uv venv --python 3.13 .venv && uv pip install --python .venv/bin/python -r requirements.txt)
# Linux で EEVEE を使うとき: apt-get install -y libegl1 libegl-mesa0
# 仮の声を使うとき: apt-get install -y open-jtalk open-jtalk-mecab-naist-jdic hts-voice-nitech-jp-atr503-m001

# 3Dカット（GPU なしで約1時間。Mac なら RES=100 SAMPLES=32 で本番品質）
blender/render_shots.sh

# 声を Gemini で作って、通しで書き出す
export GEMINI_API_KEY=...   # 環境変数で渡す（ファイルに書かない）
VOICE=gemini ./make_video.sh uratori-01-1min
# → out/uratori-01-1min.mp4 と .srt
```

AI Studio の画面で声を作る場合は `episodes/uratori-01-1min/tts/ai_studio.md` の手順で WAV を作り、
`episodes/uratori-01-1min/audio/narration.wav` に置いて `./make_video.sh uratori-01-1min`。

## Blender MCP について

Blender MCP は、Claude Desktop から**起動中の Blender の画面**を操作するための橋渡し（中身は Blender の Python API＝bpy を実行する）。
このリポジトリのクラウド環境には画面つきの Blender が無いので、同じ bpy を `blender/shots.py` から直接呼んでいる。
Mac の Blender ＋ Blender MCP で手直ししたいときは、`blender/.venv/bin/python blender/shots.py --shot a --save-blend --frames 1 1`
で `.blend` を書き出して開けばよい。

## Remotion のライセンス

Remotion は個人・従業員3人以下の会社は無料、それより大きい組織は有料ライセンスが必要（https://www.remotion.dev/license ）。
