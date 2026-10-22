---
name: finish-audio
description: 仮の声（Open JTalk）と合成の音楽で作った下書きの動画を、Gemini TTS の声と Google Flow Music の曲に差し替えて仕上げる（考える夜 kangaeru-01 など）。「声と曲を差し替えて」「Gemini TTS で声を作って入れて」「BGM を作って入れて」「動画を仕上げて」と言われたときに使う。
argument-hint: "[回の id（例: kangaeru-01）]"
allowed-tools: Bash(.venv/bin/python tools/check_audio.py *) Bash(.venv/bin/python tools/music_cues.py *) Bash(ls *) Bash(ffprobe *)
---

# 声と曲を差し替えて、動画を仕上げる

対象の回: `$ARGUMENTS`（空なら `kangaeru-01`。1分版は `kangaeru-01-1min`）。以下 `<ep>` と書く。
リポジトリの一番上で作業する。道具の中身は `README.md` と各ファイルの冒頭の説明にある。

## 順番（変えない）

声を替えると場面の長さが変わり、曲を流す区間の長さも変わる。だから **声 → 時刻表 → 曲 → 音 → 書き出し** の順。

1. 準備の確認と、人への確認（声の作り方・声の種類・曲のプラン）
2. 声を作る → 機械で確かめる → 人に聞いてもらう
3. 時刻表を作り直す → 文の切れ目を確かめる
4. 曲の区間の長さを調べる → 曲を作る → 人に選んでもらう → 置く
5. 音を混ぜる → 確認用の短い音を人に聞いてもらう
6. 書き出す → 最後の確認
7. 記録を残す（commit。push は人に聞いてから）→ 報告

## 守ること

- **API キー**: 表示しない・ファイルに書かない・会話に貼らせない。あるかどうかは
  `test -n "$GEMINI_API_KEY" && echo あり || echo なし` で確かめるだけ。無ければ、人に Claude Code を終了して
  `read -s GEMINI_API_KEY && export GEMINI_API_KEY` → `claude --chrome` で起動し直してもらう（キーは履歴にもファイルにも残らない）。
- **Claude は音を聞けない。** 声の良し悪し・読み間違い・曲が合っているか・歌声が入っていないかは、必ず人に聞いてもらう。
  `tools/check_audio.py` は「明らかにおかしい物を落とす」ためのもので、合格の判定ではない。
- **声の設定は全部の章で同じにする**（モデル・声の名前・Style・Temperature）。章ごとに変えると、途中で別人の声になる。
- **台本の文を勝手に変えない。** 読み間違いは「読み」だけを直す（下の 2-4）。直す前に人に確認する。
- **お金がかかる操作は、先に見積もりを見せて了承をとる。** 有料プランの購入や支払いの設定は Claude がしない（画面が出たら止まって人に頼む）。
- **曲の権利**: チャンネルを収益化するなら、Flow Music の **商用利用が認められているプラン** で作ることを人に確認してから作る（無料枠の商用利用は、公式の明記が見当たらない）。
- モデル名・画面の操作は推測しない。分からなければ止まって人に聞く。
- 書き出しの最中は `video/src` と `video/public` を触らない。`audio/_takes/` と `music/_takes/`（前のテイク）は消さない。

## 1. 準備

最初に人へ、全体の流れと人の出番（声を選ぶ・声を聞く・曲のテイクを選ぶ・確認用の音を聞く・動画の指定の時刻を見る）を短く伝える。
作業するブランチは `claude/relaxed-sagan-mnoqsa`（人が別のブランチを指定したらそちら）。

```bash
git status && git branch --show-current && git log --oneline -1
ls .venv/bin/python video/node_modules/.bin/remotion && which ffmpeg ffprobe node
test -n "$GEMINI_API_KEY" && echo "API キー: あり" || echo "API キー: なし"
.venv/bin/python tools/check_audio.py <ep> voice      # いまの声（仮の声の章が並ぶ。章の声のファイルが無いと出るのは正常）
```

足りない物があれば入れる（Mac）:

```bash
brew install ffmpeg uv node
uv venv --python 3.13 .venv && uv pip install --python .venv/bin/python numpy==2.3.3 soundfile==0.13.1 scipy==1.16.2
(cd video && npm ci)
```

ブラウザを使うなら、Chrome を操作する道具（`mcp__claude-in-chrome__*`）があるか確かめる。無ければ人に `/chrome` で接続するか、
`claude --chrome` で起動し直してもらう。

**人に一度にまとめて聞く**（AskUserQuestion）:

1. 声の作り方
   - A. Gemini API（`tools/tts_gemini.py`）: 速くて手戻りが少ない。費用は30分で約 $0.4、作り直しを含めても約 $2（2026年末までの料金。2027年1月から倍になると報じられている）
   - B. ブラウザの AI Studio: 無料枠の範囲なら0円。Claude が Chrome を操作する。1日の上限に当たると止まる
2. 声: 予定の声（`episodes/<ep>/head.json`、無ければ `script.json` の `voice.voice`）で決めるか、候補（`voice.alternatives`）と聞き比べるか
3. 曲: Flow Music で作るか（使うプランは商用利用できるか）／今回は曲を替えない（合成の音楽のまま）か

## 2. 声

章の一覧: `.venv/bin/python -c "import json;print(' '.join(p['id'] for p in json.load(open('episodes/<ep>/script.json')).get('parts',[])))"`
（空なら章の無い回。`--part` を付けずに1本で作る）

### 2-1. 声を決める（最初の章で聞き比べる）

A（API）なら、最初の章（章の一覧の先頭。章の無い回は `--part` を付けない）を候補の声で1回ずつ作る（1回 数円）:

```bash
.venv/bin/python tools/tts_gemini.py <ep> --part <最初の章> --voice Algenib
.venv/bin/python tools/tts_gemini.py <ep> --part <最初の章> --voice Charon   # 聞き比べるときだけ
```

作ったテイクは `episodes/<ep>/audio/_takes/gemini_<章>_<声>_<時刻>.wav` に残る（最後に作った物が `audio/parts/<章>.wav`）。
人に聞いてもらって選んでもらう（Mac なら `afplay <ファイル>` か `open <ファイル>`）。
B（AI Studio）なら [browser.md](browser.md) の手順で最初の章を作って聞いてもらう。

予定と違う声に決まったら、設定を書き換えてから次へ進む:
- `head.json` がある回: `head.json` の `voice.voice` を直し、`.venv/bin/python tools/parse_source.py <ep>`
- 無い回: `script.json` の `voice.voice` を直す
- どちらも: `.venv/bin/python tools/tts_gemini.py <ep> --ai-studio-doc`（AI Studio の手順書を作り直す）
- 選んだテイクを置く: `.venv/bin/python tools/register_audio.py <ep> voice <テイク> --part <最初の章> --source gemini --note "API・<声>"`

### 2-2. 全部の章を作る

1章ずつ、作る → 確かめる、を繰り返す（まとめて流さない。⚠ が出たらその章だけ作り直す）。

```bash
.venv/bin/python tools/tts_gemini.py <ep> --part <章>          # A（API）
.venv/bin/python tools/check_audio.py <ep> voice --part <章>
```

B（AI Studio）は [browser.md](browser.md)。ダウンロードしたら
`.venv/bin/python tools/register_audio.py <ep> voice <ファイル> --part <章> --note "AI Studio・<声>"` で置いて、同じように確かめる。

⚠ が出たら同じ設定で作り直す（1章につき3回まで）。それでも ⚠ なら、その章とメッセージを人に伝えて判断を仰ぐ。
全部の章がそろったら、章どうしの速さ・大きさの揃い具合を見る: `.venv/bin/python tools/check_audio.py <ep> voice`

API のエラー:
- 429（回数の上限）: 少し待って、その章からやり直す
- 401/403: キーの問題。人に伝える
- モデルが無い（404）: モデル名を推測で変えない。`curl -s -H "x-goog-api-key: $GEMINI_API_KEY" https://generativelanguage.googleapis.com/v1beta/models | grep '"name"' | grep -i tts` で使えるモデルを見て、人に確認してから `--model` で指定する

### 2-3. 人に聞いてもらう

読み間違いは人にしか見つけられない。少なくとも次を聞いてもらう:
- 2-1 で選んだ最初の章は全部
- ほかの章は、頭の30秒・終わりの30秒、それと固有名詞・数字・英字が出る所。かなに直してある所は `episodes/<ep>/tts/ai_studio.md` の本文で分かる

### 2-4. 読み間違いを直す

`tools/parse_source.py` の `READINGS`（表記 → 読み）に足す。画面と字幕は元の表記のまま、声だけ読みが変わる。
同じ表記は台本の全部で読みが変わるので、足す前に人に確認する。
そのあと `parse_source.py <ep>` と `tts_gemini.py <ep> --ai-studio-doc` を実行し、その表記がある章の声を作り直す。
`head.json` が無い回は、`script.json` のその文に `"read"` を書く。

## 3. 時刻表

```bash
.venv/bin/python tools/build_timeline.py <ep>
.venv/bin/python tools/check_audio.py <ep> align
```

- 章の声が1つでも欠けていると止まる（仮の声は git に入っていないので、全部の章を作ってから実行する）
- 怪しい所（⚠）が全体の文の5%を超えたら、`build_timeline.py <ep> --thresh -34`、`--thresh -42` も試して、
  そのたびに `check_audio.py <ep> align` を流す。⚠ の一番少ない値を残す
- 最後に出る「動画で確かめる時刻」は、6. で人に見てもらうので控えておく

## 4. 曲

```bash
.venv/bin/python tools/music_cues.py <ep>              # 曲ごとの区間の長さ（声を替えたあとの値）
.venv/bin/python tools/register_audio.py <ep> prompts  # 曲ごとの指示文
```

Flow Music の操作は [browser.md](browser.md)。要点:
- 指示文はそのまま使う。最後の長さ（"2 minutes" など）だけ、区間の長さより長めに直してよい
- 1曲につき2テイク程度作る。**全部の曲を作り終えてから**、人に Flow Music の画面で聞いてもらい、曲ごとに使うテイクを選んでもらう
  （歌声が入っていないか、声の邪魔にならないかも）
- 選ばれたテイクをダウンロードして置く:
  `.venv/bin/python tools/register_audio.py <ep> music <曲id> <ファイル> --note "Flow Music・<テイク名>"`
- 全部置いたら `.venv/bin/python tools/check_audio.py <ep> music`。区間より短い曲は、つなぎ目を重ねて繰り返す（「短すぎる」と出たら長めに作り直す）
- 曲の大きさはそろえて混ぜるので、テイクごとの音量の差は気にしなくてよい

Gemini API の音楽生成（Lyria）を使いたいと人に言われたときだけ、公式の文書（ai.google.dev）でモデル名と使い方を確かめてから小さな道具を書く。推測では書かない。

## 5. 音を混ぜて、人に聞いてもらう

```bash
.venv/bin/python tools/make_audio.py <ep>              # 声＋曲＋効果音（-16 LUFS）。△ の行（曲を繰り返して埋めた所）も伝える
.venv/bin/python tools/check_audio.py <ep> preview     # out/preview/<ep>/ に確認用の短い音（.m4a）と index.md
```

人に `open out/preview/<ep>` で開いてもらう。何を聞けばよいかは `index.md` に書いてある。直すとき:
- 曲が大きい／小さい: `make_audio.py <ep> --music-rms -33`（小さく）か `-28`（大きく）。既定は -30
- 合わない曲: 4. でその曲だけ作り直して置き直す
- 直したら `make_audio.py` → `check_audio.py <ep> preview` をやり直す

## 6. 書き出しと最後の確認

章のある長い回（区間ごとに書き出し、止まっても再実行すれば続きから）:

```bash
rm -rf out/chunks/<ep>                    # 前の映像の区間を消す（場面の長さが変わったため）
CONCURRENCY=6 tools/render_chunks.sh <ep> # 30分の回で数十分〜2時間ほど。バックグラウンドで実行して終わりを待つ
```

章の無い短い回は `./make_video.sh <ep>`（声は置いてあるのでそのまま）。

確かめること:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 out/<ep>.mp4   # 時刻表の長さ（video/src/generated/<ep>.json の durationInFrames ÷ 30）と同じくらいか
ffmpeg -nostats -i out/<ep>.mp4 -af ebur128 -f null - 2>&1 | grep -A1 "Integrated loudness"   # -16 LUFS 前後か
ffmpeg -y -loglevel error -ss 60 -i out/<ep>.mp4 -frames:v 1 out/preview/<ep>/frame_60s.jpg   # 画像を開いて、左上の「仮の声」の表示が消えているか
```

最後に、3. で控えた「動画で確かめる時刻」を人に伝え、その時刻を動画で見てもらう（声と字幕・場面の切り替わりが合っているか）。
ずれていたら 3. の `--thresh` を変えて、時刻表から作り直す（4. の曲は作り直さなくてよい）。

## 7. 記録と報告

声と曲のファイルは大きいので git に入れない（`.gitignore` 済み）。出どころの記録と時刻表だけ commit する（無いファイルは外す）:

```bash
git add episodes/<ep>/audio/narration.source.json episodes/<ep>/music/sources.json video/src/generated/<ep>.json
git add episodes/<ep>/head.json episodes/<ep>/script.json episodes/<ep>/tts/ai_studio.md tools/parse_source.py   # 変えたときだけ
git commit -m "<ep>: Gemini の声と Flow Music の曲に差し替え"
```

push は人に聞いてから。人には次を別の場所（Google Drive など）に控えてもらう:
`episodes/<ep>/audio/parts/`、`episodes/<ep>/music/`、`out/<ep>.mp4`、`out/<ep>.srt`。

報告すること:
- できた物（`out/<ep>.mp4`・`.srt`）と長さ
- 使った声・曲のテイク
- かかった費用（API なら作った回数と秒数）
- 残っている ⚠
- 公開前に人がやること: YouTube へのアップロード、字幕（.srt）の登録、概要欄に台本の事実の出典を書くこと
  （台本の研究の話はこちらで裏取りしていない）

## つまずいたとき

| 症状 | どうする |
|---|---|
| `章 X の声がありません` | その章の声を作る（2-2）。仮の声は git に入っていない |
| `文の切れ目の候補が足りません` | `build_timeline.py <ep> --thresh -34`（無音とみなす音量を上げる） |
| check_audio で「話す速さが極端」「途中に長い無音」 | 読み飛ばし・付け足し・途切れのおそれ。その章を作り直す |
| AI Studio が「上限」「billing」と言う | 止まって人に報告。API に切り替えるかは人が決める |
| Chrome の道具が「not connected」 | 人に `/chrome` →「Reconnect extension」をしてもらう |
| 書き出しが途中で止まった | `tools/render_chunks.sh <ep>` をもう一度（書き終えた区間は飛ばす） |
| 書き出しでブラウザのダウンロードに失敗 | ネットにつながっているか確かめる（Remotion が初回に描画用の Chrome を落とす） |
