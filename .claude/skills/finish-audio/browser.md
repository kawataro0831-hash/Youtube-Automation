# ブラウザでの作業（Claude in Chrome）

前提:
- Claude Code を `claude --chrome` で起動している（または `/chrome` で接続済み）
- Chrome で、人の Google アカウントにログインしている

ログイン画面・CAPTCHA・年齢確認・支払いの画面が出たら、そこで止まって人に頼む。
画面の作りが下の手順と違っても、**設定の中身**（何を選び、何を入れるか）は変えない。
同じ意味の欄が見つからなければ、推測で進めずに人に聞く。

## AI Studio で声を作る（章ごとに1回）

設定と本文は `episodes/<ep>/tts/ai_studio.md` にある（声・Temperature・Style の文・章ごとの本文）。

1. 新しいタブで https://aistudio.google.com/generate-speech を開く
2. 設定する
   - モデル: Gemini 3.8 Flash TTS
   - 話し手: 1人（Single-speaker）
   - 声（Voice）: 決めた声
   - Temperature: ai_studio.md の値
3. Style（口調）欄に「Style（口調）欄に貼る文」を入れる
4. 本文欄に、その章の本文を入れる（ai_studio.md の ``` の中身だけ。見出しは入れない）
5. Run を押し、生成が終わるまで待つ（数十秒〜数分）
6. ダウンロードする（WAV を選べるなら WAV）。落ちたファイルは、ダウンロード先の一番新しい音声ファイル:
   `ls -t ~/Downloads/*.wav ~/Downloads/*.mp3 2>/dev/null | head -n 3`
7. 置いて確かめる:
   `.venv/bin/python tools/register_audio.py <ep> voice <ファイル> --part <章> --note "AI Studio・<声>"`
   → `.venv/bin/python tools/check_audio.py <ep> voice --part <章>`
8. 次の章へ。ページを開き直したときは、設定（声・Temperature・Style）が元に戻っていないか毎回確かめる

止まる所:
- 「1日の上限」「billing（支払い）が必要」などが出た → 人に報告する。API に切り替えるか、翌日に続けるかは人が決める
- 途中で切れる・最後に余計な言葉が付く → `check_audio.py` が ⚠ を出すことが多い。同じ設定で作り直す

## Flow Music で曲を作る

1. Flow Music（Google Labs の音楽づくりのサービス。もとの名前は ProducerAI）を開く
   - URL は推測しない。人に開いてもらうか、https://labs.google から辿る。似た名前の別サービスに注意
   - 「この地域では使えない」と出たら止まって人に報告する（日本での提供状況ははっきりしない）
2. 使うプランが **商用利用できるもの** か、人に確認済みであること（SKILL.md の 1. で聞いている）
3. 曲ごとに作る（曲 id の順に）
   - 指示文は `.venv/bin/python tools/register_audio.py <ep> prompts` のものをそのまま入れる
   - 最後の長さ（"2 minutes" など）は、`.venv/bin/python tools/music_cues.py <ep>` の区間の長さより長めに直してよい
     （画面で長さを指定できるなら、そちらで区間より長くする）
   - 「歌なし（Instrumental）」の設定があればオンにする
   - 1曲につき2テイク程度。どの曲 id のテイクか分かるよう、作品名を `m04_take1` のように付けられるなら付ける
4. 全部の曲を作り終えたら、人に Flow Music の画面で聞いてもらい、曲ごとに使うテイクを選んでもらう
   （歌声が入っていないか、ナレーションの邪魔にならないか、場面に合っているか）
5. 選ばれたテイクをダウンロードする（WAV があれば WAV、無ければ MP3）
   → `.venv/bin/python tools/register_audio.py <ep> music <曲id> <ファイル> --note "Flow Music・<テイク名>"`
6. 全部置いたら `.venv/bin/python tools/check_audio.py <ep> music`

止まる所:
- クレジットが足りない、プランの購入の案内が出た → 人に報告する（購入は人がする）
- 生成した曲に歌声が入っていると人に言われた → 指示文の頭の "Instrumental only, no vocals." を残したまま作り直す
