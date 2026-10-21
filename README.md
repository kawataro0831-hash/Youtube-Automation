# Youtube-Automation

YouTube の解説動画を、台本（JSON）から自動で組み立てる道具一式。いまある回:

| 回 | チャンネル | 中身 | 3D の素材 |
|---|---|---|---|
| `kangaeru-01-1min` | 考える夜 | 「なぜ人間は『自分らしさ』に殺されるのか？」PROLOGUE の1分版。映画のような暗い画面・明朝体の字幕・黒帯 | `blender/render_kangaeru.sh`（`blender/kangaeru.py`） |
| `uratori-01-1min` | ウラトリ | 「相次ぐ情報漏洩の裏側」の1分版。生成りの紙面＋黄色のマーカー | `blender/render_shots.sh`（`blender/shots.py`） |
| `sora-01-sample` | せかいのしくみ（仮・新チャンネル） | 「見上げた空は、ぜんぶ過去。」約45秒のトンマナ試作。深い紺の宇宙・面と光だけの絵・丸ゴシック | なし（絵はすべてコード） |

```bash
blender/render_kangaeru.sh                       # 考える夜の3D（静止画5枚＋影のアニメ）
VOICE=gemini ./make_video.sh kangaeru-01-1min    # Gemini の声 → 時刻表 → 音 → 書き出し
```

### 考える夜の作り

- 場面: 1970年ルイビルの夕景（尖塔の影）／バーボンのグラス（Cycles）／帽子・サングラス・シガレットホルダーの静物（Cycles）／
  「出来事の外から中へ」の図／名前がジャンルになる文字／伸びていく影（EEVEE のアニメ）／夜の窓辺／木の操り人形／タイトル
- 人物は顔を描かず、持ち物・影・操り人形で表す（作りものの人間が安っぽく見えないように）
- 音は `tools/sound_kangaeru.py` で合成（低い持続音・ピアノ・群衆・氷・たばこ・タイプライター・低音の一撃）。外部の素材なし
- 字幕は下の黒帯に焼き込み（`KangaeruMain` の `burnSubtitles` で切り替え）。`.srt` も出る

### せかいのしくみ（仮）の作り

科学解説アニメ（Kurzgesagt のような、線のない面と光の絵）を、**人が絵を描かずに**作る試み。

- 絵は `video/src/flat/kit.tsx` の部品を、乱数の種（seed）と数式で組んで描く。同じ seed なら毎回同じ形
  - 太陽（ゆらぐ炎・表面の粒・光のにじみ）／惑星（回る陸と雲・夜の側の影・ふちの光・大気）／星空（層ごとの奥行き・瞬き）／
    丘（空気遠近法の3枚）／案内役の生きもの（このチャンネルのオリジナル。まばたき・呼吸・見上げる）／弾んで出る札
  - カメラは層（`Layer` の depth）ごとに動く量を変えて奥行きを出す
- 場面の型（`script.json` の `scenes[].type`）: `sky`（昼／夜）・`sun`・`distance`・`photon`・`moon`・`stars`・`title`。
  台本に型と数字（`items`）を書けば絵ができるので、台本づくり（LLM）からそのままつながる
- 色・文字は `video/src/flat/theme.ts` だけで決める。音は `tools/sound_flat.py`（パッド・ベル・札の音。外部の素材なし）
- 数字の出典は `script.json` の `sources`（公開前に一次資料で確認する）

```bash
VOICE=temp ./make_video.sh sora-01-sample   # 仮の声で通し（本番は VOICE=gemini）
```

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
