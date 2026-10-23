---
name: finish-audio
description: 仮の声（Open JTalk）と合成の音楽で作った下書きの動画を、Gemini TTS の声と Google Flow Music の曲に差し替えて仕上げる（考える夜 kangaeru-01 など）。「声と曲を差し替えて」「Gemini TTS で声を作って入れて」「BGM を作って入れて」「動画を仕上げて」と言われたときに使う。
argument-hint: "[回の id（例: kangaeru-01）]"
allowed-tools: Bash(.venv/bin/python tools/check_audio.py *) Bash(.venv/bin/python tools/music_cues.py *) Bash(.venv/bin/python tools/tts_gemini.py * --check-key) Bash(ls *) Bash(ffprobe *)
---

対象の回: `$ARGUMENTS`（空なら `kangaeru-01`）。

手順の本体は Codex と共通の `.agents/skills/finish-audio/SKILL.md`（ブラウザの手順は同じフォルダの `browser.md`）。
まずそれを読み、そのとおりに進める。Claude Code では、人への質問は AskUserQuestion、ブラウザは Claude in Chrome
（`mcp__claude-in-chrome__*`）を使う。
