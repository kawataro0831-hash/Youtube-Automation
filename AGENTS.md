# AGENTS.md

YouTube の解説動画（チャンネル「考える夜」「ウラトリ」）を、台本から自動で組み立てるリポジトリ。
Claude Code と Codex の両方がこのファイルを読む（Claude Code は CLAUDE.md が無いとき AGENTS.md を読む）。
全体像と回の一覧は `README.md`、回ごとの仕上げ方は `episodes/<回>/HANDOFF.md`。

## しくみ（流れの順）

1. 台本: `episodes/<回>/script.json` が正本。フル尺の回は `source.txt`（原稿）＋`head.json`（声・曲の設定）から
   `tools/parse_source.py <回>` で作る（script.json を直接書き換えない）
2. 声: `tools/tts_gemini.py`（Gemini TTS の API）／AI Studio で作って `tools/register_audio.py` で置く／仮の声 `tools/voice_temp_openjtalk.py`
3. 時刻表: `tools/build_timeline.py <回>` … 声の無音から文の切れ目を見つけ、`video/src/generated/<回>.json` と字幕 `.srt` を作る
4. 音: `tools/make_audio.py <回>` … 声＋曲（`music_cues.py`）＋効果音を混ぜて `video/public/ep/<回>/mix.wav`（-16 LUFS）
5. 映像: `video/`（Remotion 4）。長い回は `tools/render_chunks.sh <回>`、短い回は `./make_video.sh <回>` → `out/<回>.mp4`
6. 3D の素材: `blender/`（bpy。`blender/render_kangaeru.sh`・`blender/render_shots.sh`）→ `video/public/kangaeru/` など

声を替えると場面の長さが変わる。順番は必ず **声 → 時刻表 → 曲 → 音 → 書き出し**。

## 準備

```bash
uv venv --python 3.13 .venv && uv pip install --python .venv/bin/python numpy==2.3.3 soundfile==0.13.1 scipy==1.16.2
(cd video && npm ci)
# Mac: brew install ffmpeg uv node
```

Python の道具は必ず `.venv/bin/python tools/<道具>.py` で動かす。各道具の使い方は、ファイルの冒頭の説明にある。

## 決まりごと

- **API キーなどの秘密**: 表示しない・リポジトリに書かない・会話に貼らせない。Gemini のキーは環境変数 `GEMINI_API_KEY`
  か `~/.config/youtube-automation/gemini.key`（Codex 向け。開いて中身を見ない）。あるかどうかは `tools/tts_gemini.py <回> --check-key`
- **エージェントは音を聞けない。** 声・曲の良し悪し、読み間違いは人に聞いてもらう。機械の確認は `tools/check_audio.py`
  （voice / align / music / preview）で、これは足切りであって合格の判定ではない
- **台本の文は勝手に変えない。** 読み間違いは `tools/parse_source.py` の `READINGS`（声だけの読み）で直し、人に確認する
- **声の設定（モデル・声・Style・Temperature）は全部の章で同じにする**
- **お金がかかる操作**（API での生成、有料プラン）は先に見積もりを見せて了承をとる。購入や支払いの設定はエージェントがしない
- 声と曲のファイル（`episodes/*/audio/`・`episodes/*/music/`）と `out/` は大きいので git に入れない。出どころの記録
  （`narration.source.json`・`music/sources.json`）と時刻表（`video/src/generated/`）は入れる
- 書き出しの最中は `video/src` と `video/public` を触らない。前のテイク（`_takes/`）は消さない
- 台本の中の事実（研究・年号など）は裏取りしていない。公開前に出典を確かめるよう人に伝える
- コードのコメント・説明・コミットメッセージは日本語。コミットは「<対象>: <やったこと>」の形
- push は人に確認してから

## 決まった作業（スキル）

- **声と曲を差し替えて仕上げる**: `.agents/skills/finish-audio/SKILL.md`（ブラウザの手順は同じフォルダの `browser.md`）
  - Codex: `$finish-audio kangaeru-01` か「声と曲を差し替えて」
  - Claude Code: `/finish-audio kangaeru-01`（`.claude/skills/finish-audio/` が同じ手順を読む）

## Claude Code と Codex の違い

| | Claude Code | Codex |
|---|---|---|
| ブラウザ（AI Studio・Flow Music） | `claude --chrome`（Claude in Chrome） | ブラウザを操作する道具が無ければ、ブラウザの作業は人がやり、ダウンロードしたファイルの場所を教えてもらう |
| ネット | ふつうはつながる | 既定の作業モードではつながらない。`codex -c 'sandbox_workspace_write.network_access=true'` で起動 |
| API キー | 環境変数でよい | 名前に KEY を含む環境変数はコマンドに渡らないので、キーのファイルを使う |
