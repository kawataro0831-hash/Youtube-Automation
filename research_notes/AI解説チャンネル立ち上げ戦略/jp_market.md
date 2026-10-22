# 日本語YouTube「AI・海外テック解説」市場マップ（2026年10月時点）

> 調査メモの前提（重要）
> - 調査日: 2026-10-22。数値はすべて「取得元＋日付」を併記。YouTube公式ページ以外（yutura / vidIQ / PLAYBOARD / digitalcreators / tri-as 等）は**第三者集計値**であり、取得時点によって数万人単位でズレる。
> - 本セッションではページ本文の取得（WebFetch / curl）が egress proxy に全て拒否され（yutura.net, soumu.go.jp, note.com, influencer.tri-as.co.jp など全ホストで connect_rejected）、さらに Web 検索の割当量も途中で尽きた。したがって本メモは**検索結果スニペット（検索エンジンが返した要約・抜粋）に依拠**しており、チャンネル個別の「総再生回数・平均尺・最多再生動画タイトル」の網羅はできていない。未確認項目は各節の Gaps に明示した。
> - 読者（ソロクリエイター、Blender/Remotion アニメ＋Gemini TTS、30〜50代社会人向け 8〜15分）の判断に直結する結論は「Inferences」に率直に書いた。

---

## Q1. 日本語でAI・テック系を扱う主要チャンネルは誰か（規模・形式・頻度）

### Takeaway
2026年10月時点で日本の「AI系YouTuber」ランキング上位は Professional AI CHANNEL（約52.9万）、KEITO【AI&WEB ch】（約21万）、いけともch（約21万）、いまにゅのAIプログラミング塾（約19万）で、**AI専業で登録者100万超のチャンネルはまだ存在しない**（18ch集計の中央値は6.7万）。上位はいずれも「ツールの使い方・業務活用」を人物（顔出し/声出し）＋画面収録で解説する形式であり、アニメーション主体・仕組み解説主体の大手は見当たらない。

### Cited Findings
**ランキング（第三者集計）**
- 「AI系YouTuber人気ランキングTOP18（2026年10月更新、YouTube Data API 公開データに基づく登録者数順）」：1位 Professional AI CHANNEL 52.9万人、2位 KEITO【AI&WEB ch】21.1万人、3位 いけともch 21万人、4位 いまにゅのAIプログラミング塾 18.9万人。掲載18チャンネルの登録者数中央値は6.7万人で、登録者100万人超のAI系チャンネルは「まだない」 — [tri-as インフルエンサー検索（2026年10月）](https://influencer.tri-as.co.jp/youtube/ai.html)
- 2023年10月時点の古い「AI・ChatGPT系YouTube 10選」記事では KEITO【AI&WEB ch】は登録者3.34万人と記載（＝約3年で約6倍に成長したことを示す） — [transcope.io「【2025年版】AI・ChatGPTに関するYouTube10選」](https://transcope.io/column/ai-chatgpt-youtube)
- yutura（ユーチュラ）には「AI」というカテゴリ/タグのチャンネル一覧ページが存在する（本文は取得不可） — [yutura.net/channel/28691](https://yutura.net/channel/28691/)
- AI・データサイエンス系チャンネル10選の記事が存在（本文未取得） — [ds100.jp](https://ds100.jp/report/r-25003/)

**KEITO【AI&WEB ch】**
- 2026年8月時点 登録者 約20.8万人（直近+2,000）、総再生 18,993,356回（直近+490,960）。直近30日の投稿はショート1本・ロング13本（別集計では「ロング15本・約16万回再生」）で、**ロング動画主軸**。内容は ChatGPT / Claude などの生成AI活用、新ツール紹介 — [digitalcreators.jp（第三者集計、2026年8月）](https://digitalcreators.jp/channel/ja/UCfapRkagDtoQEkGeyD3uERQ)
- yutura 掲載では約20.5万人、チャンネル開設日 2023年1月25日 — [yutura.net/channel/85090](https://yutura.net/channel/85090/)
- 企業向け「人気YouTuber KEITOさんに学ぶ 生成AI特別研修」としてプレスリリース化されるなど、**法人研修・イベント講師にマネタイズ経路が伸びている** — [PR TIMES](https://prtimes.jp/main/html/rd/p/000000333.000076777.html)、[rokugobase イベント「YouTube登録者数17万人 AIディレクターKEITO厳選」](https://rokugobase.com/event/8053/)
- 2025年3月のインタビュー記事タイトルは「AI系YouTuber『KEITO』世間のAIリテラシーへの渇望を垣間見ました」 — [wepress（2025-03-28）](https://wepress.web-magazine.jp/2025/03/28/20250328/)、[Liito インタビュー](https://studio-tale.co.jp/career-stories/guide/keito-interview/)

**いまにゅのAIプログラミング塾**
- PLAYBOARD 集計：登録者 184,000、動画 232本、投稿ペース「週3本」。非エンジニア向けで「コードは書かない、AIに書かせる」方針。Claude Code・Cursor 等 AIコーディングツール活用、業務自動化、AIエージェントの作り方、RAG 解説、最新モデル比較検証 — [PLAYBOARD](https://playboard.co/en/channel/UC0xRMqPOyRNPTaL6BxhbCnQ)
- yutura 掲載では 191,000人（概数表示） — [yutura.net/channel/26023](https://yutura.net/channel/26023/)

**中小規模の実例（自己申告）**
- 2024年4月開設、ChatGPT / ComfyUI 等AIツール解説を軸にした個人チャンネル：2026年5月25日時点 登録者3.65万人・公開80本、**2年間の総収益は「数十万円台後半」**。筆者は「もっと稼げるでしょ」と思う人ほど読んでほしい現実、と表現 — [note「【収益公開】2年で登録者3万人を達成してわかったYouTubeの厳しさ」](https://note.com/aaafrog/n/n3072e54da9e6)
- Claude Code で動画生成フローを構築した自動化チャンネルが開始約3か月で収益化条件を達成、執筆時点で登録者6,700人超（自己申告） — [Zenn「『あなたもAIで簡単に稼げる！！』に蹴りを入れるまで」](https://zenn.dev/xtm_blog/articles/da1eba90525f91)
- 生成系AI YouTuber として60日で登録者1,000人達成（自己申告） — [note（なういず）](https://note.com/nowism1229/n/n1b23296eac79)

**合成音声（ずんだもん／ゆっくり）系のAI・IT解説**
- 「IT・AI速報チャンネル【ずんだもん解説】」：世界の新着ニュースをずんだもんが短時間で紹介。最新AIの「すごい機能」「面白い使い方」、IT業界で話題のニュース — [YouTube チャンネル](https://www.youtube.com/channel/UCkRr4i0GaOuFQ7arOIWcpzg)（登録者数は未取得）
- 「ずんだらけAIチャンネル」：最新AIニュース・海外AI論文解説＋生成AIパスポート／G検定の資格対策 — [YouTube チャンネル](https://www.youtube.com/@%E3%81%9A%E3%82%93%E3%81%A0%E3%82%89%E3%81%91%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB)（登録者数は未取得）
- 「AIニュース速報」プレイリスト：OpenAI / Anthropic / Google / Microsoft の発表を「毎日3〜5分」で、ずんだもんと四国めたんが開発者目線で解説 — [YouTube プレイリスト](https://www.youtube.com/playlist?list=PLzw6aIVQ4jTc0EbB7oGYuNqtASo8mTMjt)
- 「ずんだもんカイゼンラボ」は2026年2月のX投稿でYouTube登録者6万人突破に言及 — [X @ZunKaiLab](https://x.com/ZunKaiLab)
- 「ずんだもん深堀り解説」（時事解説、2026年1月開設）は登録者5.8K表示 — [yutura.net/channel/117695](https://yutura.net/channel/117695/)
- ゆっくり解説の科学・知識系の規模感：「ゆっくりで叡智を学ぶ!」15.1万人（2026年7月、yutura） — [yutura](https://yutura.net/channel/75362/chart/)；「しまむらいだーのお部屋【ゆっくり解説】」約21.1万（2025年7月、vidIQ） — [vidIQ](https://vidiq.com/youtube-stats/channel/UCPbiAq3YHoePafGTMzvrTKQ)；「五回目は正直【ゆっくり解説】」約17万（2025年5月、vidIQ） — [vidIQ](https://vidiq.com/youtube-stats/channel/UCOraw5P87knMNfKgSEzs-ig)
- 登録者4万人の「ストーリー系ずんだもん」ニュースチャンネル（世界情勢・日本称賛トピック）が「生成AIでチェック導入＆完全外注化済み」として**売買市場に出品**されている — [rakkoma チャンネル売買](https://rakkoma.com/project/detail/13511)
- 「ずんだひしょ【ずんだもん解説】」が2025年7月8日にBANされたとのニュース掲載 — [yutura](https://yutura.net/channel/73792/)

**半導体**
- 半導体プロセスエンジニア「ずーぼ」氏の「半導体業界ドットコムch」は登録者2万人超（著者紹介ページの記述） — [ビジネス+IT 著者ページ](https://www.sbbit.jp/author/1488)、[YouTube](https://www.youtube.com/channel/UCGRSVwY_H0vUsLf4U9sXE6g)
- 企業公式が基礎講座を出している：サンケン電気「【基礎講座】ゼロから学ぶ！半導体の基礎知識」「【前工程編】工場見学」、ソニー公式「“はんどうたい”の作り方（1/7）」 — [サンケン電気](https://www.youtube.com/watch?v=bfIMtiAml08)、[ソニー公式](https://www.youtube.com/watch?v=ICSX-XAnQAU)
- 個人系の半導体動画タイトル例：「【需要爆発】半導体の『種類』と『シェア』を整理してみた！素人では絶対識別不可能！」「『誰でも』理解できる半導体製造工程！…文系もかかってこい！」「性能１億倍だと！？まったく新しい半導体の幕開け。」「【小学生でもわかる】半導体とは何か？【大人の学びなおし】」 — [YouTube](https://www.youtube.com/watch?v=5FJjVhB3_w4)、[YouTube](https://www.youtube.com/watch?v=B2AG2AqjMsU)、[YouTube](https://www.youtube.com/watch?v=ajqO6ll-2rs)、[YouTube](https://www.youtube.com/watch?v=VWVqqyhlcu0)

**ビジネス系メディアのAI解説（参考）**
- NewsPicks の動画タイトル例：「【高収益】SaaSを丸呑みする『本命AI』が判明した（Anthropic/Claude/ダリオ・アモデイ/OpenAI/ChatGPT/BtoB/サム・アルトマン/解説:後藤直義、森川潤）」 — [YouTube](https://www.youtube.com/watch?v=NYkFqILTQKI)
- AIニュース系のタイトル例：「OpenAI・Anthropicの開発者が『AI開発にブレーキを』【注目のAIニュース】」、「ChatGPTが音声ファイルから文字起こし・要約まで対応、AnthropicはOSS向け無料脆弱性スキャンなど3選【AIニュース】」、「2026.07.06 AIニュース」 — [YouTube](https://www.youtube.com/watch?v=HnmCVjbySV0)、[YouTube](https://www.youtube.com/watch?v=Mu1PCtIXfbY)、[YouTube](https://www.youtube.com/watch?v=tUN6HosSXTk)

**AIの仕組み解説（数理系）**
- AIcia Solid Project（VRアカデミア）：2021年7月公開「【深層学習】Transformer - Multi-Head Attentionを理解してやろうじゃないの【ディープラーニングの世界vol.28】」。バーチャルキャラクター（VTuber形式）が数理を解説 — [YouTube](https://www.youtube.com/watch?v=50XvMaWhiTY)、[X 告知](https://x.com/aicia_solid/status/1410723184802811908)、[レバテックLAB インタビュー](https://levtech.jp/media/article/column/detail_92/)
- 他の日本語 Transformer 解説動画：「圧倒的図解で学ぶ『Transformer』徹底解読【Attention is All You Need】」、「Transformer言語モデルを内部挙動から理解する」 — [YouTube](https://www.youtube.com/watch?v=9Tu8H7wPVWo)、[YouTube](https://www.youtube.com/watch?v=N-0eFoQYkrs)

### Inferences
- 上位4チャンネルはすべて「人物が画面収録で使い方・業務活用を教える」形式（KEITO＝ツール紹介、いまにゅ＝AIコーディング／自動化）。**「ツール活用 how-to」は日本で最も成熟した＝最も混雑したレーン**。
- AI専業で50万超が1つ、20万前後が3つ、残りは数万人台に長い裾野。市場規模としては「中堅ゆっくり解説チャンネル1本分」程度の天井しかまだ見えておらず、**日本語AI解説は英語圏（数百万人規模）と比べて10分の1以下のスケール**で動いている。
- 3.65万人で2年総収益「数十万円台後半」という実例は、**日本語AI解説の広告単価だけでは生活できない**ことを示す。上位層（KEITO）は法人研修・講師業で回収している。アニメ制作コストを掛ける読者は、最初から「動画＝名刺」としてB2B/有料コミュニティ/英語圏展開のいずれかを設計しないと採算が合わない。
- ずんだもん系AIニュースは「毎日3〜5分」の速報型が中心で、尺も浅い。**合成音声＝安っぽい／量産**というイメージが既についている（Q6参照）ため、Gemini TTS を使う場合は「ずんだもん枠」とは視覚的・編集的に明確に切り離す必要がある。

### Gaps
- Professional AI CHANNEL（1位・52.9万）の内容・形式・運営主体は検索スニペットから特定できず（同名検索で無関係な結果のみ）。**読者がチャンネルページを直接確認すべき最重要項目**。
- いけともch（3位）の内容・形式・頻度は未確認。
- tri-as ランキングの5〜18位のチャンネル名・数値はページ本文取得不能のため未取得。
- 各チャンネルの「最多再生動画タイトル」「平均尺」「アップロード頻度（KEITO: 月13〜15本ロング、いまにゅ: 週3本以外）」は未取得。
- チャエン、ウェブ職TV、しまぶー、ミライ等の候補チャンネルは検索割当切れで未調査。
- ガジェット系（トーマスガジェマガ、戸田覚 等）は未調査。
- PIVOT / NewsPicks の AI 回の再生数・登録者は未取得。

---

## Q2. 日本のAI/テック動画で支配的なタイトル・サムネ型と、使い古されているもの

### Takeaway
解説系の定番は「【2026年最新】」等の年号プレフィックス＋「徹底解説」「〇〇のプロが解説」型であり、煽り語（衝撃・驚愕・今すぐ・ヤバい・終了）は依然クリックを取れるが、2026年には「衝撃の真実」「閲覧注意」が増加して**飽和**し、内容不一致による離脱とYouTubeのクリックベイト規制リスクが指摘されている。

### Cited Findings
- 解説系タイトルの基本型：「この一本で課題が片付く安心感」を出すため、「【2026年最新】」のように年号や動画種別を冒頭に置き、誰が何を得られるかを明記する。「徹底解説」「〇〇のプロが解説」が定番語 — [xcuu.jp「YouTubeタイトルの付け方」](https://xcuu.jp/column/youtube-title/)
- 「衝撃」「驚愕」「今すぐ」はクリックを促す力があるが、企業チャンネルでは誇張がブランドを損なうため「数字や実績」を示す語の方が向く — [crogo.jp「【2026年版】YouTubeタイトルの付け方｜50のパワーワード」](https://crogo.jp/sns_mktg/50-recommended-youtube-title-words)
- 再生回数を稼ぐための「パワーワード175選」というまとめ記事が存在するほどテンプレ化している — [aoyako「パワーワード175選」](https://discovery.aoyako.com/youtube-powerword/)
- 2026年3月のトレンド分析：「衝撃の真実」「閲覧注意」などのキーワードが増加、知識系・解説系の人気も上昇 — [エラー大全集（2026-03-13）](https://error-daizenn.hatenablog.com/entry/2026/03/13/012148)
- タイトル／サムネで期待を煽り内容が一致しないと視聴者が早期離脱し視聴維持率が下がる（アルゴリズム上の不利） — [ニチヨウビ「YouTubeアルゴリズムに嫌われる理由」](https://nock-design.com/nichiyobi/blog/youtube-algorithm)
- YouTube が「煽りタイトル・煽りサムネイル」への規制強化（視聴者第一の改革）を打ち出したと報じるnote — [Creators Palette（note）](https://note.com/creatorspalette/n/n91c329754a6f)
- 実際のAI/テック動画タイトルに現れた型（本調査で観測）：「【高収益】…『本命AI』が判明した」（NewsPicks）、「【需要爆発】…素人では絶対識別不可能！」、「性能１億倍だと！？」、「文系もかかってこい！」、「【小学生でもわかる】…【大人の学びなおし】」、「〜など3選【AIニュース】」、「【注目のAIニュース】」 — [YouTube](https://www.youtube.com/watch?v=NYkFqILTQKI)、[YouTube](https://www.youtube.com/watch?v=5FJjVhB3_w4)、[YouTube](https://www.youtube.com/watch?v=ajqO6ll-2rs)、[YouTube](https://www.youtube.com/watch?v=VWVqqyhlcu0)、[YouTube](https://www.youtube.com/watch?v=Mu1PCtIXfbY)
- サムネの典型的失敗：要素の詰め込み、背景と被写体のコントラスト不足、文字数過多。被写体は1つ、文字は短く — [atsoho「AI YouTubeサムネ作成 2026」](https://atsoho.com/blog/side-job-ai-youtube-thumbnail)
- YouTube 検索結果にAI要約・会話型AIが導入され、再生回数への打撃が懸念されている（2025年6月） — [roboin（2025-06-27）](https://roboin.io/article/2025/06/27/youtube-introduces-two-ai-features/)

### Inferences
- 観測された型を整理すると、日本のAI/テック系タイトルは (a) 【カギ括弧ラベル】＋断定（「判明した」「幕開け」）、(b) 数字誇張（「１億倍」「100万円」）、(c) 読者を限定・挑発（「文系もかかってこい」「素人では不可能」）、(d) 対象明示（「小学生でもわかる」「大人の学びなおし」）、(e) 速報ラベル（「3選【AIニュース】」「【最新】」）の5系統に集約される。(a)(b)(e) は飽和、(d) の「大人の学びなおし」系は30〜50代ターゲットと相性が良く、まだ比較的ノイズが少ない。
- 「〇〇の使い方」「〇〇がヤバい」は検索スニペット上で直接の定量データは得られなかったが、上位チャンネルの内容（ツール紹介主軸）から**「使い方」型が最も供給過多**と推定される。
- 「末路」型は本調査では AI/テック領域で観測されず（ゆっくり解説の歴史・事件系で多用される語）。AI文脈で使うと情報商材臭が出るため避けるべき。

### Gaps
- 「〇〇がヤバい」「末路」「神アプデ」「終了」など個別語の出現頻度・CTRに関する定量分析は見つからなかった（検索割当切れ）。
- サムネイルの実物分析（人物顔アップ比率、赤黄テキスト比率など）は画像取得不能のため未実施。

---

## Q3. 飽和しているサブジャンルと、日本語で手薄なサブジャンル

### Takeaway
「AIツールの使い方」「プロンプト術」「AIニュースまとめ（ずんだもん速報含む）」「AIで稼ぐ／副業」は飽和。一方で「仕組みの可視化（Transformer・RLHF・データセンター・チップ）」は数理系VTuber（AIcia）や翻訳チャンネル（3Blue1BrownJapan）に限られ、**海外テック企業の内幕・歴史ストーリーをアニメーションで語る日本語チャンネルは本調査では確認できなかった**。

### Cited Findings
- 上位AIチャンネルの中身はツール活用（KEITO：ChatGPT/Claude活用・新ツール紹介；いまにゅ：Claude Code/Cursor/自動化/RAG/モデル比較） — [digitalcreators.jp](https://digitalcreators.jp/channel/ja/UCfapRkagDtoQEkGeyD3uERQ)、[PLAYBOARD](https://playboard.co/en/channel/UC0xRMqPOyRNPTaL6BxhbCnQ)
- AIニュース速報はずんだもん系が「毎日3〜5分」で量産しており、売買市場にも出ている（Q1参照） — [YouTube プレイリスト](https://www.youtube.com/playlist?list=PLzw6aIVQ4jTc0EbB7oGYuNqtASo8mTMjt)、[rakkoma](https://rakkoma.com/project/detail/13511)
- 「AI副業」「AI動画量産で広告収入」系の指南記事が多数存在し、このレーン自体が商材化している — [genai-ai.co.jp（2026年8月）](https://genai-ai.co.jp/ai-kanri/blog/cc-youtube-ai-side-business/)、[fukugyo-freelance-ai.jp](https://www.fukugyo-freelance-ai.jp/ai-youtube-automation-guide/)
- 2026年のAI穴場ジャンル記事は「シニア向けにAIツールの使い方をわかりやすく教えるチャンネルがまだ少ない」と指摘（本文未取得、スニペットのみ） — [mvisualsonline「2026年YouTube AI穴場ジャンル5選」](https://store.mvisualsonline.com/blog/youtube-ai-niche-opportunity-2026)、[note machosuke「2026年のYouTubeでAI系チャンネルを始めるなら狙うべき5つの領域」](https://note.com/machosuke/n/naeeb6edd5490)
- 仕組み解説の日本語動画は AIcia Solid Project（2021年のTransformer回）など数理寄り・エンジニア向けが中心 — [YouTube](https://www.youtube.com/watch?v=50XvMaWhiTY)
- 3Blue1BrownJapan は「圧縮と知能」Part1/Part2 など LLM 寄りの回を近年公開 — [yutura 最新動画](https://yutura.net/channel/69070/latest/)
- 令和8年版白書：生成AIを使わない理由で「使い方がわからない」が38.8%と4か国中で日本が最高、「必要ない」が42.4% — [innovatopia 解説](https://innovatopia.jp/ai/ai-news/114300/)、[総務省 概要PDF](https://www.soumu.go.jp/main_content/001082851.pdf)
- 半導体は企業公式（サンケン電気・ソニー）が基礎講座を持ち、個人は「半導体業界ドットコムch」2万人超程度 — [sbbit](https://www.sbbit.jp/author/1488)
- 「OpenAI 歴史／シリコンバレー物語」を日本語で扱う専門チャンネルは本調査では検索できていない（検索割当切れ）。ビジネス系メディア（NewsPicks）が人物対談形式で Anthropic/OpenAI を扱う例はある — [YouTube](https://www.youtube.com/watch?v=NYkFqILTQKI)

### Inferences（率直に）
- **過密**：①ChatGPT/Claude/Gemini の使い方・新機能速報、②プロンプト術、③AIニュース日次まとめ（ずんだもん含む）、④AI副業・稼ぐ系、⑤AIコーディング（Claude Code/Cursor）how-to。ここに後発ソロで参入しても、KEITO／いまにゅ級の投稿頻度（月13〜15本／週3本）と法人マネタイズに勝てない。
- **手薄（ありそうでなかった）**：
  - (A) 「仕組みの可視化」を**非エンジニアの30〜50代向けに**アニメで説明する枠。既存は数理VTuber（AIcia）と翻訳（3B1B Japan、28万人）で、どちらも数式前提。白書の「使い方がわからない 38.8%」層は「仕組み」以前に用語で脱落しており、3B1B Japan が翻訳だけで28万を取っていることは**需要が供給を上回っている証拠**。
  - (B) 海外テック企業の内幕・歴史（OpenAI 取締役会事件、Anthropic 分裂、DeepMind、NVIDIA の来歴など）を**物語として**10分アニメ化する枠。日本語ではビジネスメディアの対談（顔出し・60分）か、ずんだもん速報（3分）に二極化しており、中間の「8〜15分ストーリー」が空いている。
  - (C) データセンター・電力・チップ供給網といった「AIの物理」の解説。半導体は企業公式か2万人規模の個人しかいない。
  - (D) 「あのAI予言のその後（the aftermath）」検証型。本調査では該当チャンネルを確認できず（未検索のため「空いている」とは断定できない）。
- ただし (A)(B)(C) が空いている理由の一部は「日本語での需要が小さい」可能性もある。3B1B Japan の28万人は数学ファン層込みなので、AI仕組み単体の需要は10万人前後が現実的な上限と見るべき。

### Gaps
- 「OpenAI 歴史」「シリコンバレー 物語」「AI 予言 その後」で日本語チャンネルの有無を検索できなかった（割当切れ）。空白の断定には追加検索が必要。
- note machosuke / mvisualsonline の「5領域」の中身は本文未取得。
- ガジェット系・半導体ゆっくり系の規模感は未取得。

---

## Q4. Kurzgesagt 型／3Blue1Brown 型のアニメ解説を日本語でやっているチャンネルと規模

### Takeaway
公式翻訳版が2本ある：3Blue1BrownJapan は約28万人（yutura、2026年）で成功、Kurzgesagt 日本語版「世界をわかりやすく」は2022年開設から2023年3月で1.86万、2024年5月でも「数万人」と**伸び悩み**。日本発の Kurzgesagt 型オリジナルAI解説チャンネルは本調査では特定できなかった。

### Cited Findings
- 3Blue1BrownJapan：本家の公式ライセンスのもと東京大学の学生有志団体（Ufolium）が翻訳・再編集。yutura 掲載 登録者 283,000人・動画69本（概数） — [yutura.net/channel/69070](https://yutura.net/channel/69070/)、[YouTube](https://www.youtube.com/@3Blue1BrownJapan)、[senohsya 紹介記事](https://senohsya.com/%E6%8E%A8%E3%81%97%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB%E7%B4%B9%E4%BB%8B%E2%91%A3%E3%80%803blue1brownjapan/)
- 別の第三者サイトでは「22万人超・総再生1,100万回超」、別表示で24.6万人（取得時点不明） — [thoughtleaders.io](https://app.thoughtleaders.io/youtube/3blue1brownjapan)
- Kurzgesagt 日本語吹替版「世界をわかりやすく – Kurzgesagt」：チャンネル作成 2022/01/29、2023年3月時点 登録者1.86万人・総視聴18万回以上 — [note「The launch of the official Kurzgesagt Japanese channel」](https://note.com/dogresiduewp/n/ndb11c2c0072e?hl=en)；2024年5月時点「登録者はまだ数万人」 — [ココログ（2024-05）](https://tan8472.cocolog-nifty.com/blog/2024/05/post-ec91ef.html)；2022年にアラビア語・仏・ヒンディー・日本語・韓国語・ポルトガル語版を開設 — [Wikipedia 日本語](https://ja.wikipedia.org/wiki/Kurzgesagt_-_In_a_Nutshell)
- 日本の科学系で規模が大きいのは実験系（GENKI LABO 112万人、2026-09-21）、ナレーション＋CG（VAIENCE 209万人、古い記事）、Science Dream 34.9万人、サムの本解説ch 58.1万人（タグに「アニメーション」）、SCIENCE CHANNEL（JST）50〜61万人 — [Wikipedia 市岡元気](https://ja.wikipedia.org/wiki/%E5%B8%82%E5%B2%A1%E5%85%83%E6%B0%97)、[Roster 科学・技術ランキング](https://roster.motytools.com/genre/tech)、[talenttuber 科学系一覧](https://talenttuber.com/pc/matome/kagaku/)
- 日本語の「おすすめ科学動画」note 記事では Kurzgesagt を「宇宙や人類についての知識を可愛らしいアニメーション形式で見せてくれる」と紹介し、日本の同方向チャンネルは挙げられていない — [note ALISON](https://note.com/alison_airlines/n/n5e061f8ce924)、[note くぼみ](https://note.com/kuboasa/n/ne56277f81d12)
- ゆっくり解説の知識系は15〜21万人帯（Q1参照）。

### Inferences
- 3B1B Japan（翻訳・数式あり・不定期）が28万人、Kurzgesagt JP（翻訳・吹替・高品質アニメ）が数万人という対比は示唆的：**日本の視聴者は「アニメの美しさ」より「わかった感（学習効果）」に反応する**。Kurzgesagt JP の苦戦は吹替声の違和感と日本語でのタイトル最適化不足が原因と推測されるが、裏付けはない。
- 日本で「ナレーション＋ビジュアル」で100万超を取っている VAIENCE 型は、**雑学・宇宙・生物のスケール感**を売りにしており、AI/テックには未進出。読者の Blender/Remotion アニメ戦略は、Kurzgesagt そのものの模倣より「VAIENCE のテック版」「3B1B の非数学版」として設計する方が国内実績に沿う。
- 日本発オリジナルで「Kurzgesagt 型 × AI/テック」は確認できず、**形式レーンとしては空いている**。ただし Kurzgesagt JP の数字が示す通り、形式だけでは伸びない。

### Gaps
- 「世界をわかりやすく – Kurzgesagt」の2026年現在の登録者数は未取得。
- VAIENCE の現在値・AI回の有無、Science Dream の形式詳細は未確認。
- 日本発で AI を扱うアニメーション主体チャンネル（ゆっくり以外）の網羅検索は未実施。

---

## Q5. 海外視聴者への到達（英語字幕・吹替）と、日本の生成AI受容度データ

### Takeaway
日本の個人の生成AI利用経験率は2025年版白書26.7%→2026年版58.8%と急伸したが、30〜50代は44〜56%で**半分近くが未経験**、非利用理由の首位級が「使い方がわからない 38.8%（4か国中最高）」。AI/テック解説で海外に到達した日本語チャンネルの実例は本調査では見つからず、YouTube の多言語音声・自動吹替の一般的な効果データ（吹替で再生時間の15%超、字幕で全世界再生132%増など）があるのみ。

### Cited Findings
**総務省 情報通信白書**
- 令和7年版（2025年7月公表、2024年度調査）：生成AI利用経験 26.7%（前年9.1%）、20代44.7%。米国68.8%、ドイツ59.2%、中国81.2%。非利用理由は「自分の生活や業務に必要ない」に次いで「使い方がわからない」 — [総務省 令和7年版 個人におけるAI利用の現状](https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r07/html/nd112210.html)、[ITmedia（2025-07-09）](https://www.itmedia.co.jp/aiplus/articles/2507/09/news085.html)、[日経](https://www.nikkei.com/article/DGXZQOUA045CP0U5A700C2000000/)
- 令和8年版（2026年7月24日公表、2025年度調査）：生成AI利用経験 58.8%（20〜69歳では52.2%）、テキスト生成AIに限ると55.0%（前年24.0%）。企業利用86.4%だが「組織的取組なし」27% — [総務省 令和8年版 概要PDF](https://www.soumu.go.jp/main_content/001082851.pdf)、[総務省 本文PDF n1110000](https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r08/pdf/n1110000.pdf)、[innovatopia 解説](https://innovatopia.jp/ai/ai-news/114300/)、[reskilling.com](https://reskilling.com/article/johotsushin-hakusho-2026-generative-ai-reskilling/)
- 令和8年版の年代別利用経験（二次情報、白書本文で未照合）：15〜19歳 91.7%、20代 78.2%、**30代 56.3%、40代 49.0%、50代 44.2%**、60代 33.5% — [aiteller「AI普及率 日本【2026年版】」](https://aiteller.jp/blog/ai-fukyu-data-hub)
- 令和8年版 非利用理由（テキスト生成AI）：「必要ない」42.4%、「使い方がわからない」38.8%（4か国比較で日本が最高） — [innovatopia](https://innovatopia.jp/ai/ai-news/114300/)

**民間調査**
- 野村総合研究所「日・米・中・独4カ国調査にみる生活者におけるAI利用の現在地」（2026年4月10日公表、調査は2025年9月実施）：生成AIを「月に数回以上」使う日本人は34.9%（二次情報経由） — [aiteller 国別比較](https://aiteller.jp/blog/ai-entame-data-kokubetsu-riyouritsu)
- NRI 2024年8月調査：61%が生成AIを知っているが、使ったことがあるのは9% — [gesher times](https://times.gesher.co.jp/article/only-9-of-japanese-people-have-used-generative-ai-survey-by-nomura-research-institute)
- ICT総研（2026年2月）：直近1年の個人利用率 54.7% — [webtiger](https://webtiger.jp/genai-usage-rate/)
- GLOCOM「Innovation Nippon 生成AIと日本2026」報告書（2026年4月、本文未取得） — [GLOCOM PDF](https://www.glocom.ac.jp/wp-content/uploads/2026/04/InnovationNippon2026_report_full.pdf)
- 調査横断での国別：日本58.8%、米国75.6%、中国93.6%（定義が調査ごとに異なるため参考値） — [aiteller](https://aiteller.jp/blog/ai-entame-data-kokubetsu-riyouritsu)

**海外到達（多言語機能・事例）**
- YouTube 公式：2023年2月に多言語音声トラックを順次提供開始。試験参加クリエイターの平均で再生時間の15%以上が吹替言語で視聴、料理チャンネルで再生回数3倍の事例 — [YouTube Japan Blog（2023-02）](https://blog.youtube/intl/ja-jp/news-and-events/2023_02_multi-language-audio/)、[PHILE WEB](https://www.phileweb.com/news/d-av/202302/24/57586.html)
- AI自動吹替（オートダビング）が2024年12月に発表、日本語動画の多言語化の障壁が下がった — [横田秀珠 解説](https://yokotashurin.com/youtube/auto-dubbing.html)、[akagami.blog](https://akagami.blog/2025youtubeai/)
- 制作会社事例：ほぼ全動画に英・中・ポ・韓の字幕を付け、全世界再生回数132%増 — [IGNITE 事例](https://igni7e.jp/case-studies/youtuber-translation/)
- 「テクノロジー解説を含む日本発コンテンツは英語字幕があれば海外視聴者が見に来る」「視聴回数40〜80%増」と主張する記事があるが出典なし — [atsoho（2026）](https://atsoho.com/blog/global-youtube-localization-guide-2026)
- 外国語動画の自動日本語翻訳の可能性と課題を論じた記事 — [Screenless Media Lab.（note）](https://note.com/screenless/n/n3ccd40865a70)

### Inferences
- ターゲット（30〜50代）は利用経験が44〜56%で、**「触ったことはあるが何が起きているか分かっていない」層が最大のボリュームゾーン**。「使い方がわからない 38.8%」は how-to 需要を示すように見えるが、how-to は既に飽和しているので、「なぜそう動くのか／海外で何が起きているのか」という**文脈理解の需要**として解釈する方が差別化に繋がる。
- 海外到達については、AI/テック解説ジャンルで英語字幕により海外に伸びた日本語チャンネルの一次事例を**確認できなかった**。英語圏には同ジャンルの巨大チャンネルが既にあり、日本語音声＋英語字幕で勝てる根拠は現時点ではない。英語字幕は「日本発の視点（日本企業・日本市場・日本の規制）」を扱う回に限って意味を持つと考えるべき。

### Gaps
- 年代別利用率は二次情報（aiteller）のみで、白書本文での照合ができていない。
- 電通・博報堂のAI調査は未検索（割当切れ）。
- AI/テック解説で海外比率が高い日本語チャンネルの実例・数値は見つからなかった。

---

## Q6. 視聴者がこのジャンルで不満・称賛しているもの

### Takeaway
不満は「稼げる系・情報商材への誘導」「AI素材・AI音声による安っぽさ／胡散臭さ」「テンプレ量産（AI slop）」「ググれば分かる内容」に集中し、称賛は「リテラシーへの渇望に応えるわかりやすさ」（KEITO評）に集まる。ただし体系的な視聴者調査は見つからず、個人ブログ・掲示板・noteの感想が根拠。

### Cited Findings
- AI関連商材・コンサルに100万円以上を使った体験記：GPTs教材が役に立たない、無料プレゼントを装った有料商材誘導への批判 — [note「AI系商材に100万円以上使って買ってしまった“ヤバい商材”たち」](https://note.com/penai3/n/nfbe42a57839b)
- オカルト系YouTuberがAI素材を使い始めてから「一気に安っぽい＆胡散臭くなった」、AI音声は「偽物っぽさが強まる」という掲示板の声 — [newsoku-sinkansen](https://newsoku-sinkansen.com/archives/57/)
- 「稼ぐ系・自己啓発系のパワポ（スライド）動画」が胡散臭い理由：登録者は多くても数万人、ググれば分かる内容、再現性が疑わしい — [curio-dealer-x](https://www.curio-dealer-x.net/archives/2979)
- 「YouTube、フェイクや嘘AI動画だらけになり急速にオワコン臭が漂う」というまとめ — [カナ速](http://kanasoku.info/articles/33369795.html)
- 収益停止されやすい動画の特徴：機械的に生成した台本を読み上げるだけで独自の考察がない、同テンプレの短期大量投稿。2025年7月のポリシー更新で審査が変化。「AI slop」批判 — [WEEL](https://weel.co.jp/media/innovator/ai-youtube/)、[vozo「YouTube AI slop」](https://www.vozo.ai/ja/blogs/youtube/youtube-ai-slop)、[hakky](https://book.st-hakky.com/news/youtube-mistakes-science-channel-ai-slop)
- 技術解説チャンネルの動画が突然削除され、YouTube が「AIの関与」疑惑を否定した報道 — [INTERNET Watch やじうま](https://internet.watch.impress.co.jp/docs/yajiuma/2042085.html)
- 情報商材批判者ほど自身が有料noteを売っている矛盾を指摘するnote — [note そうた](https://note.com/kotobashira/n/n0c739f322006)
- 「AIを嫌悪している」立場の個人note（反AI感情の存在） — [note しろん](https://note.com/open_minnow284/n/ne3a34f38d1d0)
- 称賛側：KEITO は「世間のAIリテラシーへの渇望」に応えていると評され、法人研修講師として採用される — [wepress](https://wepress.web-magazine.jp/2025/03/28/20250328/)、[PR TIMES](https://prtimes.jp/main/html/rd/p/000000333.000076777.html)
- 「YouTubeは金儲けやくだらない動画ばかり」でYouTube離れする人がいる、という一般的不満 — [cybersocean](https://cybersocean.net/ytmoney/)

### Inferences
- 読者の企画（AI音声＋AIアシスト制作）は、視聴者の不満ポイント（AI音声の偽物感、テンプレ量産、商材臭）に**正面から当たる**。回避策は (1) 台本に一次情報・独自取材・出典表示を入れて「考察なし読み上げ」と区別する、(2) ずんだもん／スライド読み上げの見た目から視覚的に距離を取る（Blender の3D・モーショングラフィックスはここで効く）、(3) 「稼げる」「副業」語彙をチャンネルから完全排除する。
- 2025年7月以降のYouTube収益化ポリシー変更と「AI slop」規制は、AI音声チャンネルの審査リスクを上げている。公式ガイドラインの確認が必須。

### Gaps
- YouTube コメント欄・X投稿の定量的な感情分析は未実施（取得不能）。
- 特定チャンネル（KEITO等）への具体的な批判コメントの内容は未取得。

---

## 付記：本調査で取得できなかった主要ソース一覧（再調査推奨）
- tri-as ランキング本文（5〜18位） — https://influencer.tri-as.co.jp/youtube/ai.html
- yutura AIカテゴリ一覧 — https://yutura.net/channel/28691/
- 総務省 令和8年版 白書本文（年代別クロス集計） — https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r08/pdf/n1110000.pdf
- note machosuke「2026年に狙うべき5つの領域」 — https://note.com/machosuke/n/naeeb6edd5490
- mvisualsonline「AI穴場ジャンル5選」 — https://store.mvisualsonline.com/blog/youtube-ai-niche-opportunity-2026
- ds100「AI・データサイエンス系YouTube 10選」 — https://ds100.jp/report/r-25003/
- GLOCOM「Innovation Nippon 生成AIと日本2026」 — https://www.glocom.ac.jp/wp-content/uploads/2026/04/InnovationNippon2026_report_full.pdf
- Professional AI CHANNEL / いけともch の公式チャンネルページ（内容・形式の確認）
