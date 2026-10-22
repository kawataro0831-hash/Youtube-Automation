# 声と曲をブラウザで作って仕上げる（手元の Mac で）

クラウドのセッションからは AI Studio と Flow Music に入れない（Google へのログインと、サイトへの接続が要る）ので、
この手順は **ログイン済みの Chrome がある手元の Mac** で行う。Claude に任せる場合は、手元で動くセッション
（Claude Desktop、または手元のリポジトリで `claude remote-control`）から Claude in Chrome で操作してもらう。

## 0. 準備（初回だけ）

```bash
git fetch origin claude/relaxed-sagan-mnoqsa && git checkout claude/relaxed-sagan-mnoqsa
uv venv --python 3.13 .venv && uv pip install --python .venv/bin/python numpy==2.3.3 soundfile==0.13.1 scipy==1.16.2
(cd video && npm ci)
# ffmpeg・uv・node が無ければ: brew install ffmpeg uv node
```

3D の素材（`video/public/kangaeru/`）はコミット済みなので、Blender は要らない。

## 1. 声（AI Studio・Gemini 3.8 Flash TTS・API キーなし）

`tts/ai_studio.md` のとおり。要点:
- https://aistudio.google.com/generate-speech ／ Gemini 3.8 Flash TTS ／ 1人 ／ 声 **Algenib**（別案 Charon・Orus・Alnilam）／ Temperature 1
- Style と本文は `tts/ai_studio.md` から貼る。**全文を1回で**生成し、耳で読み間違いを確かめる
- ダウンロードした WAV を置く:

```bash
.venv/bin/python tools/register_audio.py kangaeru-01-1min voice ~/Downloads/<ファイル>.wav --note "AI Studio・Algenib"
```

## 2. 曲（Google Flow Music・Lyria 3.5）を場面ごとに4曲

Flow Music（旧 ProducerAI。Google Labs の音楽ツール）で、曲ごとに下の指示文を貼って生成する。
**歌なし（Instrumental）**にし、長さは指示文の秒数（場面より少し長め。余りは自動で切る）。
何テイクか作って、場面に合うものを選ぶ。指示文は次でも表示できる:

```bash
.venv/bin/python tools/register_audio.py kangaeru-01-1min prompts
```

| id | 場面 | 狙い |
|---|---|---|
| m1 | 1970年ルイビル → グラス | 南部の夕暮れ・スライドギター・懐かしさ |
| m2 | 記者の机 → 出来事の図 → 名前 | 紫煙のノワール・ジャズ、落ち着かない |
| m3 | 伸びていく影 | 低いチェロと鼓動、迫ってくる不穏 |
| m4 | 窓辺 → 操り人形 → タイトル | 夜のピアノ、内省、最後は長く鳴る和音 |

ダウンロードした曲（MP3・WAV・M4A のどれでもよい）を置く:

```bash
.venv/bin/python tools/register_audio.py kangaeru-01-1min music m1 ~/Downloads/<ファイル>.mp3 --note "Flow Music・1テイク目"
# m2・m3・m4 も同じ
.venv/bin/python tools/music_cues.py kangaeru-01-1min   # 4曲とも ✅ になっているか、区間の長さを確認
```

まだ置いていない曲の区間は、合成の音楽で自動的に埋まる（1曲ずつ試してもよい）。

## 3. 書き出し

```bash
./make_video.sh kangaeru-01-1min
# → out/kangaeru-01-1min.mp4（字幕 .srt も out/ に）
```

声を差し替えると、文の切れ目を無音から見つけ直し、場面の長さも声に合わせて変わる。
「文の切れ目の候補が足りません」と出たら `tools/build_timeline.py kangaeru-01-1min --thresh -34` のように上げる。

## 4. 確かめること

- 声: 読み間違い（特に「ハンター・エス・トンプソン」「せんきゅうひゃくななじゅうねん」）、場面の頭で言葉が切れていないか
- 曲: 曲の変わり目（m1→m2 は記者の机の頭、m2→m3 は影の頭、m3→m4 は窓辺の頭）が不自然でないか。
  大きさは `tools/make_audio.py kangaeru-01-1min --music-rms -28`（大きく）／`-33`（小さく）で調整して `./make_video.sh` をもう一度
- Flow Music と AI Studio の出力には SynthID（AI 生成の透かし）が入る。YouTube で収益化する前に、Flow Music の利用規約（商用利用・プラン）を確認する

## 5. 残す

声と曲のファイルは git に入れない（手元と Google Drive などに控える）。出どころの記録と時刻表だけ commit する。

```bash
git add episodes/kangaeru-01-1min/audio/narration.source.json episodes/kangaeru-01-1min/music/sources.json video/src/generated/kangaeru-01-1min.json
git commit -m "考える夜 1分版: Gemini の声と Flow Music の曲に差し替え"
git push
```

## 手元の Claude Code に任せる場合

指示書は `.claude/skills/finish-audio/`（Claude Code のスキル）。0. の準備をしてから、リポジトリの一番上で
`claude --chrome` を起動し、`/finish-audio kangaeru-01-1min` と打つ（API で声を作るなら、起動の前に
`read -s GEMINI_API_KEY && export GEMINI_API_KEY` でキーを渡す）。手順はフル尺の `episodes/kangaeru-01/HANDOFF.md` と同じ。
