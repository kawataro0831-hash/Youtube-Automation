# 考える夜 #01 フル尺: 声と曲を差し替えて仕上げる

いまの `out/kangaeru-01.mp4`（約30分）は **仮の声（Open JTalk）と合成の音楽** で作った下書き。
映像・字幕・章立て・効果音はこのまま使い、声と曲だけをブラウザ（AI Studio・Flow Music）で作って差し替える。
手順は 1分版の `episodes/kangaeru-01-1min/HANDOFF.md` と同じで、違うのは **章ごと** に作ること。

## 手元の Claude Code に任せる場合

指示書は `.claude/skills/finish-audio/`（Claude Code のスキル）。下の 0. の準備をしてから、リポジトリの一番上で:

```bash
read -s GEMINI_API_KEY && export GEMINI_API_KEY   # API で声を作るときだけ。キーを貼って Enter（画面にも履歴にも残らない）
claude --chrome                                   # Chrome を操作できる状態で起動（AI Studio・Flow Music を使うため）
```

Claude Code に `/finish-audio kangaeru-01` と打つ。最初に「声の作り方・声の種類・曲のプラン」を聞かれ、
途中で「声を聞いて選ぶ」「曲のテイクを選ぶ」「確認用の短い音を聞く」「動画の指定の時刻を見る」を頼まれる（Claude は音を聞けないため）。
以下の 1.〜5. は、自分の手で進めるときの手順。

## 0. 準備（初回だけ・手元の Mac）

```bash
git fetch origin claude/relaxed-sagan-mnoqsa && git checkout claude/relaxed-sagan-mnoqsa
uv venv --python 3.13 .venv && uv pip install --python .venv/bin/python numpy==2.3.3 soundfile==0.13.1 scipy==1.16.2
(cd video && npm ci)
# ffmpeg・uv・node が無ければ: brew install ffmpeg uv node
```

## 1. 声（AI Studio・Gemini 3.8 Flash TTS）— 章ごとに 10 回

`tts/ai_studio.md` に、設定と **章ごとの本文**（prologue, cta, ch1〜ch7, epilogue。各 300〜1,200字）がある。
- 声・口調（Style）・Temperature は **全部の章で同じ** にする（変えると章の途中で別人のようになる）
- 1章ずつ生成 → 耳で確かめる → ダウンロード → 置く:

```bash
.venv/bin/python tools/register_audio.py kangaeru-01 voice ~/Downloads/<ファイル>.wav --part ch1 --note "AI Studio・Algenib"
```

置いていない章は仮の声のまま残るので、1章ずつ差し替えて確かめてもよい（画面左上の「仮の声」の表示は、全章そろうと消える）。

## 2. 曲（Google Flow Music）— 章ごとに 11 曲

```bash
.venv/bin/python tools/register_audio.py kangaeru-01 prompts   # 11曲ぶんの指示文
.venv/bin/python tools/music_cues.py kangaeru-01               # 各曲の区間の長さ（声を差し替えると変わる）
```

| id | 区間 | 狙い |
|---|---|---|
| m01 | PROLOGUE 前半（ルイビル〜記者が出来事に入る図） | 南部の夕暮れ・スライドギター |
| m02 | PROLOGUE 後半（ゴンゾー〜タイトル） | ノワール・ジャズ → 暗い緊張 |
| m03 | チャンネルの案内 | 夜空・やわらかいピアノ |
| m04 | 第1章 自分という物語 | 内省のピアノとチェロ |
| m05 | 第2章 他人に見られる自分 | マリンバとエレピの落ち着かなさ |
| m06 | 第3章 巨大になるキャラクター | 重なっていくミニマルな反復 |
| m07 | 第4章 後方互換性 | 古いコンピュータの音色・アナログシンセ |
| m08 | 第5章 どちらも地獄 | 低い弦の不協和と鼓動 |
| m09 | 第6章 なりうる自分 | ひらけていくパッドとピアノ |
| m10 | 第7章 自分を更新する | あたたかく、少しずつ盛り上がる |
| m11 | EPILOGUE | 夜のピアノとチェロ、長く鳴る最後の和音 |

曲が区間より短いときは、つなぎ目を重ねながら繰り返して埋める。

```bash
.venv/bin/python tools/register_audio.py kangaeru-01 music m04 ~/Downloads/<ファイル>.mp3 --note "Flow Music・2テイク目"
```

## 3. 書き出し（約30分。区間ごとに書き出して最後につなぐ）

```bash
.venv/bin/python tools/build_timeline.py kangaeru-01   # 声に合わせて場面の長さを決め直す
.venv/bin/python tools/make_audio.py kangaeru-01       # 声＋曲＋効果音（-16 LUFS）
rm -rf out/chunks/kangaeru-01                          # 前の映像の区間を消す（場面の長さが変わるため）
tools/render_chunks.sh kangaeru-01                     # → out/kangaeru-01.mp4 と .srt
```

`render_chunks.sh` は途中で止まっても、もう一度実行すれば続きから書き出す。

## 4. 確かめること

- 機械で確かめる: `.venv/bin/python tools/check_audio.py kangaeru-01 voice`（声）／`align`（文の切れ目・動画で見る時刻）／
  `music`（曲の長さ）／`preview`（`out/preview/kangaeru-01/` に章と曲の変わり目の短い音）
- 声: 章の頭と終わりで言葉が切れていないか、読み間違い（`tts/ai_studio.md` の本文はかなに直してある所がある）
- 文の切れ目: `episodes/kangaeru-01/build/alignment.json`。Gemini の声で字幕がずれていたら
  `tools/build_timeline.py kangaeru-01 --thresh -34` のように変えて作り直す
- 曲: 章の変わり目（章カードで低音の一撃が入る）で曲が自然に入れ替わるか。大きさは `make_audio.py --music-rms -28`（大）／`-33`（小）
- 台本の事実（マクアダムス、アイデンティティ理論、1990年代の実験、可能自己、自己の柔軟さの研究）は、
  公開前に出典を確かめて概要欄に書く（台本はそのまま使っていて、こちらでは裏取りしていない）

## 5. 残す

声と曲のファイルは大きい（30分の声で約170MB）ので git に入れない。出どころの記録と時刻表だけ commit し、
`episodes/kangaeru-01/audio/parts/`・`episodes/kangaeru-01/music/`・`out/kangaeru-01.mp4` は Google Drive などに控える。

```bash
git add episodes/kangaeru-01/audio/narration.source.json episodes/kangaeru-01/music/sources.json video/src/generated/kangaeru-01.json
git commit -m "考える夜 #01: Gemini の声と Flow Music の曲に差し替え" && git push
```
