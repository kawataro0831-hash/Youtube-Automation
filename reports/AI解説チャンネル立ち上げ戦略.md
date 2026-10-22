# 「仕組みが見える」AI解説チャンネルは、ウラトリと分けて立ち上げる

作成日: 2026-10-22 ／ 根拠: `research_notes/AI解説チャンネル立ち上げ戦略/` の7本のノート（市場・海外チャンネル・プラットフォーム規約・ツールチェーン・ネタ・動向と情報源・トンマナ）

> **読む前の注意（調査の限界）**
> 調査環境ではページ本文の取得（WebFetch / curl）が GitHub・Google Cloud・anthropic.com 以外のほぼ全ホストでプロキシに拒否され、Web 検索の割当も途中で尽きました。したがって本レポートの数字の大半は **検索結果のスニペット（検索エンジンが返す抜粋）に依拠** しており、登録者数などは第三者集計サイト（yutura、vidIQ、Social Blade、SpeakRJ 等）の推定値です。YouTube 自体に接続できなかったため、**日本語 YouTube の競合実測（10万再生超の有無）は全候補で未実施** です。本文中で「推定」「二次のみ」「未確認」と書いた箇所は、台本化の前に必ず原典を開いてください。再確認リストは第10節にまとめました。

## 要約（忖度なしの結論）

1. **新チャンネルは作る。ただし「ウラトリの AI 枠」ではなく別チャンネルにする。** 役割分担は一行で決める：「本当か？」（真偽の検証）はウラトリ、「なぜ／どうやって」（仕組み・歴史・その後）は新チャンネル。
2. ウラトリに積んである AI ネタ5本のうち、「はい、その通りです」と「SNS のおすすめ」の2本は仕組み回なので新チャンネルへ移管。電力・水・仕事の3本は検証型なのでウラトリに残す。
3. 日本語 AI 解説の天井は低い。AI 専業で登録者100万超はまだ無く、上位は「ツールの使い方」を顔出しで教える形式（[tri-as 2026-10](https://influencer.tri-as.co.jp/youtube/ai.html)）。3.65万人で2年の総収益「数十万円台後半」という実例もある（[note](https://note.com/aaafrog/n/n3072e54da9e6)）。広告収益だけで採算を取る前提は捨てる。
4. 空いているのは「仕組みの可視化」「海外テックの人物・歴史」「有名な予言のその後」をアニメで語る 8〜15 分枠。3Blue1Brown の翻訳チャンネルが28万人を取っている一方で、日本発のオリジナルは確認できなかった（[yutura](https://yutura.net/channel/69070/)）。
5. 英語字幕は「海外で伸びる」根拠にはならない。日本語音声＋英語字幕で海外に到達した解説チャンネルの実例は見つからなかった。英語は「日本発の視点（第五世代コンピュータ、福島邦彦、日本語トークン税）」の回に限って効く。
6. AI 音声そのものは収益化の障害ではないが、「テンプレ量産」「AI ペルソナが金融・医療を語る」は 2026年7月の明確化で不適格（[TechCrunch](https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/)）。独自分析と手作りの絵が防御になる。
7. 2027年2月1日から収益化の入口が倍（8,000 時間）になる（[YouTube Help](https://support.google.com/youtube/answer/12843009?hl=en)）。11月開始・月2本では期限内の達成は非現実的。最初から 8,000 時間ルール前提で計画する。
8. 制作費はほぼ時間。現金は1本 $1〜3（Gemini TTS 約 $0.16/テイク、Remotion は無料）。時間は 20〜35 時間／本で、ソロでは週1本が上限、現実は隔週。
9. **一番の問題はチャンネル数。** リポジトリには1分パイロット2本と考える夜の長尺1本しかない段階で3チャンネル目を開くのは分散リスクが高い。新チャンネルを主戦場にするなら、他2つの頻度を落とす判断が要る（第11節）。
10. 最初の10本は「strawberry と日本語税」「ハルシネーションは採点方式のせい」「第五世代コンピュータ」「AlexNet と福島邦彦」「脆弱なコードを教えたら人類支配を語り出した AI」から始める。一次資料が固く、競合が薄いと推定され、英語圏でも通じる。

---

## 1. 市場：日本と海外で何が起きているか

### 1-1. 日本語の AI・テック解説は「ツール活用」に偏り、規模は英語圏の 10 分の 1 以下

| 指標 | 数値 | 時点 | 出典（第三者集計は注記） |
|---|---|---|---|
| AI 系 YouTuber 上位 | 1位 Professional AI CHANNEL 52.9万、2位 KEITO【AI&WEB ch】21.1万、3位 いけともch 21万、4位 いまにゅ 18.9万。18ch の中央値 6.7万。**100万超は無し** | 2026-10 | [tri-as（第三者集計）](https://influencer.tri-as.co.jp/youtube/ai.html) |
| KEITO の投稿ペース | 直近30日でロング13〜15本。ChatGPT／Claude の活用・新ツール紹介 | 2026-08 | [digitalcreators（第三者）](https://digitalcreators.jp/channel/ja/UCfapRkagDtoQEkGeyD3uERQ) |
| いまにゅの投稿ペース | 週3本。AI コーディング・自動化・RAG | 取得時点不明 | [PLAYBOARD（第三者）](https://playboard.co/en/channel/UC0xRMqPOyRNPTaL6BxhbCnQ) |
| 上位層の収益源 | 法人研修・講師業がプレスリリース化 | 2025 | [PR TIMES](https://prtimes.jp/main/html/rd/p/000000333.000076777.html) |
| 中小規模の現実 | 3.65万人・80本で 2年総収益「数十万円台後半」 | 2026-05-25 | [note（自己申告）](https://note.com/aaafrog/n/n3072e54da9e6) |
| 翻訳系アニメ解説 | 3Blue1BrownJapan 約28.3万人・69本（東大の学生有志が公式翻訳） | 2026 | [yutura（第三者）](https://yutura.net/channel/69070/) |
| 同上 | Kurzgesagt 日本語版「世界をわかりやすく」1.86万人（2023-03）→「数万人」（2024-05） | 2023〜24 | [note](https://note.com/dogresiduewp/n/ndb11c2c0072e?hl=en)、[ココログ](https://tan8472.cocolog-nifty.com/blog/2024/05/post-ec91ef.html) |
| ゆっくり知識系の規模感 | 15〜21万人帯（「ゆっくりで叡智を学ぶ!」15.1万、「しまむらいだー」21.1万） | 2025〜26 | [yutura](https://yutura.net/channel/75362/chart/)、[vidIQ](https://vidiq.com/youtube-stats/channel/UCPbiAq3YHoePafGTMzvrTKQ) |
| ずんだもん AI 速報 | 「毎日3〜5分」の量産型。登録者4万人の同型チャンネルが「完全外注化済み」として売買市場に出品 | 2026 | [YouTube プレイリスト](https://www.youtube.com/playlist?list=PLzw6aIVQ4jTc0EbB7oGYuNqtASo8mTMjt)、[rakkoma](https://rakkoma.com/project/detail/13511) |

読み方：上位4つはすべて「人物が画面収録で使い方を教える」形式で、これは日本で最も成熟し、最も混雑したレーンです。後発のソロが月13〜15本の頻度と法人マネタイズで勝つのは無理です。一方、翻訳だけの 3Blue1BrownJapan が28万人を取り、Kurzgesagt 日本語版（高品質アニメ・吹替）が数万人で止まっている対比は重要で、**日本の視聴者は「アニメの美しさ」より「わかった感」に反応する** と読むのが妥当です（推論）。1位の Professional AI CHANNEL は内容・形式を特定できなかったので、チャンネルページを直接確認してください。

### 1-2. 日本の受容度：30〜50代の半分近くが「未経験」、非利用理由の首位級は「使い方がわからない」

| 指標 | 数値 | 時点 | 出典 |
|---|---|---|---|
| 個人の生成 AI 利用経験率 | 26.7%（令和7年版）→ **58.8%**（令和8年版）。米国・独 75.6%、中国 93.6% | 2025-07 / 2026-07 | [総務省 令和7年版](https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r07/html/nd112210.html)、[総務省 令和8年版 概要 PDF](https://www.soumu.go.jp/main_content/001082851.pdf) |
| 年代別（令和8年版） | 30代 56.3%、40代 49.0%、50代 44.2%、15〜19歳 91.7% | 2026 | [aiteller（二次。白書本文で未照合）](https://aiteller.jp/blog/ai-fukyu-data-hub) |
| 非利用理由 | 「必要ない」42.4%、「使い方がわからない」**38.8%（4か国で日本が最高）** | 2026 | [innovatopia（二次）](https://innovatopia.jp/ai/ai-news/114300/) |
| 企業の利用率の食い違い | 白書 86.4%（組織的取組なし 27%）vs 帝国データバンク **34.5%**（10,312社） | 2026 | [総務省 令和8年版](https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r08/html/nd121130.html)（本文未取得）、[ITmedia（TDB）](https://www.itmedia.co.jp/news/article/2605/15/1260515115/) |

「使い方がわからない 38.8%」は how-to 需要に見えますが、how-to は飽和しています。ターゲットの30〜50代は「触ったことはあるが、何が起きているか分かっていない」層が最大で、これは **文脈理解（なぜそう動くのか、海外で何が起きているのか）の需要** として読む方が差別化に繋がります。

### 1-3. 海外：伸びているのは「量と速さ」か「少数の決定版」か、の二極

| チャンネル | 規模（第三者推定、時点） | 直近30日増 | 1本あたり再生（導出） | 示唆 |
|---|---|---|---|---|
| 3Blue1Brown | 8.4〜8.5M、241本（2026-06〜10） | +80K | — | 数学の可視化。Manim（自作のアニメ用 Python ライブラリ）を公開 — [vidIQ](https://vidiq.com/youtube-stats/channel/@3blue1brown/)、[Social Blade](https://socialblade.com/youtube/handle/3blue1brown/videos) |
| Welch Labs | 0.84〜0.89M、平均 **415K 再生／本**（2026） | — | 0.47 再生/登録者 | 「アイデアの歴史」を背骨にした視覚エッセイ。最も近い手本 — [SponsorRadar](https://sponsorradar.com/channels/welchlabsvideo) |
| Branch Education | 2.75M（2026-09-22） | — | — | 写実 3D 断面図。モデルは「数か月」かかる — [CreatorDB](https://creatordb.app/creatorstats/brancheducation/) |
| Animagraffs | 1.9M、47本（2026-07） | 横ばい | 約3.7M | ほぼ無言の 3D 断面＝吹替に強い。年5本 — [socialcounts](https://socialcounts.org/youtube-live-subscriber-count/UCnZeeKO8qVdtkrA4-uKhtTw) |
| Kurzgesagt | 25.6M（2026-10-04） | 約+103K/月 | — | 1本 1,200 時間以上。「AI スロップがチャンネルを殺す」回（2025-10） — [aifreeforever](https://aifreeforever.com/chart/youtube/top-education-channels)、[TheTVDB](https://thetvdb.com/series/kurzgesagt-in-a-nutshell/episodes/11383775) |
| ColdFusion | 5.22M（2026-07-09） | +20K | — | 静かなテック史ドキュメンタリー。トーンの手本 — [CreatorDB](https://creatordb.app/creatorstats/coldfusion/) |
| AI Explained | 436K（2026-07-18） | 半年で約+10% | — | 「hype-free」。自作ベンチマーク Simple Bench — [SpeakRJ](https://www.speakrj.com/audit/report/UCNJ1Ymd5yFuUPtn21xtRbbw/youtube) |
| Karpathy | 1.6M、**17本**（2026-07） | — | 約1.8M | 少数の決定版講義で到達 — [Developer Educators](https://developereducators.com/channel/andrejkarpathy/) |
| Matt Wolfe | 約1.0M（2026-08） | +15〜18K | 約104K | ニュース速報。週複数本 — [CreatorDB](https://creatordb.app/creatorstats/mreflow/) |
| AI Daily Brief | 583K、**1,400本超**（2026-07） | — | 約8.6K | 毎日投稿で積み上げ。1本の到達は2桁低い — [Social Blade](https://socialblade.com/youtube/handle/aidailybrief) |
| bycloud | 236K | +1K | — | 「楽しい論文解説」は頭打ち — [vidIQ](https://vidiq.com/youtube-stats/channel/@bycloudai/) |
| AI/ML ジャンル中央値 | 30日あたり登録者増 1.44% | 2026-09 | — | [AIR Media-Tech（ベンダー調査）](https://air.io/en/audience-growth/whos-growing-fastest-on-youtube-and-which-niches-are-hot-in-2025) |

読み方：絶対数では仕組み解説レーン（3B1B +80K/30日）がニュース速報レーン（Wolfe +15〜18K）より多くの登録者を月に積んでいます。**レバーは投稿頻度ではなく1本あたりの到達** です。ニュース速報は週5〜7本と当日対応が前提で、アニメチャンネルには構造的に真似できません。2026年1月に YouTube が量産型16チャンネル（計3,500万登録）を停止したことも、量産型のリスクを上げています（[InVideo（二次）](https://invideo.io/blog/youtube-kills-ai-faceless-channels/)）。

### 1-4. 収益の目安（すべて第三者の推定値）

| 指標 | 数値 | 出典 |
|---|---|---|
| 日本の RPM（1,000再生あたりの収益） | 約 USD 1.75〜3.18（集計方法不明） | [Dynamoi](https://dynamoi.com/data/youtube-adsense-rpm/jp) |
| テック系の CPM（広告主が1,000表示に払う額） | USD 5〜30（ベンダー推定） | [upGrowth](https://upgrowth.in/youtube-cpm-overview-highest-paying-niches/) |
| Shorts の RPM | 長尺の 3〜14% | [AIR（274ch）](https://air.io/en/air-data-findings/youtube-shorts-rpm-vs-long-form-how-much-do-shorts-earn-in-2026) |
| 日本発チャンネルで英語視聴者が RPM を上げた実測 | **見つからず** | — |

---

## 2. 立ち位置：新チャンネルの定義とウラトリとの分担

### 2-1. 定義

**「AI と海外テックの『仕組み・人物・その後』を、手作りのアニメーションで 10〜15 分で語る、日本語音声＋英語字幕の学習チャンネル」。** 視聴後に「へえ」が1つと「仕組みの絵」が1枚、頭に残ることを約束する。

### 2-2. ウラトリとの分担：別チャンネルにする（推奨）

結論は **別チャンネル** です。理由は3つ。

第一に、形式が違いすぎる。ウラトリは「ニュース→一次資料で裏取り」をクリーム紙面と出典の札で見せる報道型で、新チャンネルは「概念→絵で動かす」機構型です。同じチャンネルに混ぜると、視聴者が次に何を見せられるか予測できなくなり、YouTube の推薦がどちらの視聴者に出すかも揺れます（公式に言語で推薦が決まるという記述はなく、位置情報が推薦に影響するとしか書かれていません — [YouTube Help](https://support.google.com/youtube/answer/87604)）。

第二に、英語視聴者の扱いが違う。新チャンネルは英語字幕・将来の英語音声トラックを前提に「画面上の文字を差し替え可能なレイヤー」で設計しますが、ウラトリの紙面と札は日本語の活字そのものが画面の主役です。

第三に、ネタの重なりは「問いの形」で切れる。**「本当か？」で始まる回（真偽の検証）はウラトリ、「なぜ／どうやって」で始まる回（機構・歴史・その後）は新チャンネル。** この規則でウラトリの既存キューを仕分けると：

| ウラトリの既存ネタ | 問いの形 | 判定 | 理由 |
|---|---|---|---|
| AIは電気より水を飲む | 本当か（数字の検証） | **ウラトリに残す** | Google の2024年水消費が「約60億ガロン」と「72億ガロン」で資料により不一致（[africa-press](https://www.africa-press.net/mauritius/all-news/google-data-centers-used-nearly-6b-gallons-of-water-in-2024)、[Axios](https://www.axios.com/2026/06/03/google-pushes-water-standards-data-center-backlash)）。この不一致を原典で潰すのがウラトリの仕事 |
| データセンターが電気を食いつぶすは本当か | 本当か | **ウラトリに残す** | IEA の 2030年 945TWh（≒日本一国分）が一次資料（[IEA](https://www.iea.org/news/ai-is-set-to-drive-surging-electricity-demand-from-data-centres-while-offering-the-potential-to-transform-how-the-energy-sector-works)） |
| AIは本当に仕事を奪い始めているのか | 本当か | **ウラトリに残す** | Stanford（ADP データ）、HBR 2026-01、Harvard Gazette 2026-09 の一次データ検証 |
| なぜ ChatGPT は「はい、その通りです」と言いたがるのか | なぜ | **新チャンネルへ移管** | RLHF（人間の好みで AI を調整する学習）の仕組み。InstructGPT 論文が核（第8節 A5） |
| SNS のおすすめはどうやって決まるのか | どうやって | **新チャンネルへ移管** | 推薦システムの機構回。アニメ向き |

代替案（ウラトリ内の AI レーン）を選ぶ条件も書いておきます：**隔週1本すら新チャンネルで維持できない見込みなら、別チャンネルは作らず、ウラトリに「しくみ」シリーズとして載せる方がまし** です。3チャンネルを全部止めるより、1つを太くする方が YouTube の評価は上がります。

### 2-3. ターゲット

主：30〜50代の社会人で、生成 AI を「触ったことはある」が仕組みは知らない層（白書の年代別 44〜56%）。副：英語圏の「日本発の視点」に関心がある技術者・教養層（第五世代コンピュータ、福島邦彦、日本語トークン税、Sakana AI など日本固有の回のみ）。

### 2-4. 約束（タグライン案）

1. **「仕組みが見えると、ニュースが変わる」** — ウラトリ（ニュース）との補完関係を言葉にする
2. **「AI の中身を、絵でひらく」** — アニメーション主体であることを宣言
3. **「『へえ』から、『わかった』へ」** — 雑学で終わらず学習で終わる、という品質の約束

### 2-5. チャンネル名の候補（5つ、日本語＋英語で通じるもの）

いずれも商標・YouTube ハンドルの空き状況は未確認です（第10節）。

| 候補 | 英語表記 | 理由 | 懸念 |
|---|---|---|---|
| **カラクリ** | Karakuri | 「仕組み」を一語で言う日本語で、英語圏でも からくり人形（karakuri puppet）として通じる。「AI の中身を動かして見せる」と直結 | 和菓子・飲食の商標が多い可能性 |
| **ナカミ** | Nakami | 「中身（what's inside）」。短く、濁音が無く、英語話者が発音できる | 一般語なので検索で埋もれる |
| **シクミ** | Shikumi | 直截。タグライン「仕組みが見えると…」と同じ語 | カタカナ表記の既存チャンネルがあるかは未確認 |
| **解剖室** | Kaibo Lab | 「AI を解剖する」という動詞のイメージ。英語の Lab と組み合わせやすい | 医療系に見える恐れ |
| **へえラボ** | Hee Lab | 読者のネタ帳の評価軸（好奇心・意外性）をそのまま名前に。親しみやすい | 「へえ」は英語で意味を持たないので、英語側は Hee Lab を固有名として割り切る必要がある |

推奨は **カラクリ／Karakuri**。「仕組み」「からくり（裏の仕掛け）」「動く人形」の三つの意味が、機構解説・海外テックの内幕・アニメーションという三本柱と一致します。

---

## 3. リファレンス：借りる型／借りない型

形式の特徴づけは調査者の既知情報で、本セッションでは出典を取れていません（海外チャンネルのノートに「unsourced characterization」と明記）。公開前に各チャンネルの直近3本を見て検証してください。

### 3-1. 海外

| チャンネル | 借りる型 | 借りない型 |
|---|---|---|
| 3Blue1Brown | 問いで始める、「予想してから見せる」間、章立てシリーズ（"chapter 5"）、顔なし、1色＝1概念の配色規約 | 1本に数週間かける数学的厳密さ（頻度が月2本未満に落ちる） |
| Welch Labs | 「アイデアの歴史」を背骨にした構成、少ない本数で1本を深くする（平均 415K 再生／本） | ほぼ無し。最も近い手本 |
| Branch Education | タイトル文法「How do X actually work?」、全体→トランジスタへズームするカメラ論理 | 写実 3D のコスト（数か月／本）。CPU レンダでは不可能 |
| Animagraffs | ほぼ無言の断面アニメ＝字幕・吹替で言語を越える設計思想 | 年5本の頻度（新規チャンネルの発見に足りない） |
| Kurzgesagt | 出典一覧の透明性（説明欄にソースリンク）、マスコットの連続性、「AI スロップに反対」の姿勢 | 1,200 時間／本の制作量。扱う幅（宇宙・存亡リスク） |
| ColdFusion | 静かな間、環境音楽、テック史の語り口 — トーンの手本 | 実写アーカイブ映像への依存 |
| AI Explained | 「原典を読んだ。実際に新しいのはここ」という枠組み、自作ベンチマークの定期コーナー | スクリーンショットの壁（アニメに翻訳できない） |
| Asianometry | 半導体・産業史の調査密度 | 週2本以上の静止画ナレーション（燃え尽き） |
| Karpathy | 「決定版の長尺1本」をチャンネルの柱に置く発想（17本で 1.6M） | 講義形式そのもの |
| Matt Wolfe／Berman／Wes Roth／AI Daily Brief | 「何が起きた→なぜ重要→どうする」の3拍の順序だけ | 毎日投稿、驚き顔サムネ、速報依存 |
| Two Minute Papers | 決まり文句で「クラブ感」を作る安い仕掛け | 興奮の押し売り。「要旨の言い換えだけで仕組みを説明しない」という批判（[scribe.disroot.org](https://scribe.disroot.org/post/68923/226435)） |
| Fireship | 固定尺フォーマットの規律、短いタイトル型 | 皮肉とミームの密度（日本語では軽薄に読める） |
| Johnny Harris／Vox | 「驚く主張→それを稼ぐ」構造、3〜5秒の素材カットに自然音を乗せるリズム | 顔出しホスト中心 |

### 3-2. 国内

| チャンネル | 借りる型 | 借りない型 |
|---|---|---|
| 3Blue1BrownJapan（翻訳、28.3万） | 「数式ありでも日本で28万人」＝仕組みへの需要の証明。章立て・字幕の置き方 | 翻訳であること。数式前提 |
| VAIENCE（ナレーション＋CG、古い記事で209万） | 「スケール感」を売りにする構成。テック版が空いている | 雑学・宇宙の題材 |
| 中田敦彦の YouTube 大学（AI 入門・使い方） | 「大人の学びなおし」という枠の言葉遣い | ホワイトボード講義の人物依存 |
| KEITO／いまにゅ | 投稿の規律 | ツール活用 how-to（最混雑レーン） |
| ずんだもん AI 速報 | 無し | 3〜5分速報、合成音声キャラ、量産の見た目。新チャンネルはここから視覚的に最大限遠ざかる |
| 考える夜（自分の既存ch） | 顔を描かず持ち物・影で人物を表す手法 | 暗い映画調と明朝体（AI 回には重すぎる） |
| ウラトリ（自分の既存ch） | 出典の札の思想（出所の種類を画面で分ける） | 紙面・黄色マーカー・報道調。新チャンネルは紙ではなく「動く図」 |

タイトル文法で避けるもの：日本の AI 系で観測された「【カギ括弧ラベル】＋断定（判明した／幕開け）」「数字誇張（1億倍）」「読者挑発（文系もかかってこい）」「速報ラベル（3選【AIニュース】）」は飽和しています（[xcuu](https://xcuu.jp/column/youtube-title/)、[crogo](https://crogo.jp/sns_mktg/50-recommended-youtube-title-words)）。「大人の学びなおし」系の対象明示だけが、30〜50代と相性が良くノイズが少ない。

---

## 4. トンマナ：ウラトリと一目で区別がつく設計

### 4-1. 画面

**背景と色。** ウラトリが「明るい紙」なら、新チャンネルは「暗い図面」にします。3Blue1Brown の公開設定（背景 `#333333`、白文字、1920×1080、30fps）が唯一コピー可能な仕様です（[3b1b default_config.yml](https://raw.githubusercontent.com/3b1b/manim/master/manimlib/default_config.yml)）。純黒 `#000000` は白文字がにじんで見える問題があるため避けます（[ratfactor](https://www.ratfactor.com/typography)）。

| 役割 | hex | 由来 |
|---|---|---|
| 背景（図面の地） | `#2A2D34`（調査者の提案。3B1B の #333333 より僅かに青寄り） | 3B1B #333333 を基準に、ウラトリの生成り #eeeeeb と対極に |
| 本文の白 | `#ECE7E2`（Manim LOGO_WHITE） | [manim_colors.py](https://raw.githubusercontent.com/ManimCommunity/manim/main/manim/utils/color/manim_colors.py) |
| データ・入力 | `#58C4DD`（BLUE_C） | 同上 |
| 注目・強調 | `#5CD0B3`（TEAL_C） | 同上。**黄色はウラトリのマーカー #f3dc7a と被るので新チャンネルでは使わない** |
| 誤り・損失・驚き | `#FF862F`（ORANGE） | 同上。RED_C #FC6255 は #333333 上でコントラスト 4.5:1 がぎりぎり |
| 正解・出力 | `#83C167`（GREEN_C） | 同上 |
| 人物・歴史の章の地 | `#F2EDE4`（暖かい生成り） | 「ひと」シリーズだけ明るい地に切り替え、章の切り替えを色で感じさせる |

**フォント。** 日本語字幕は **BIZ UDPGothic Bold**（ユニバーサルデザイン書体、OFL = 無償で商用動画に焼き込み可、[OFL.txt](https://raw.githubusercontent.com/googlefonts/morisawa-biz-ud-gothic/main/OFL.txt)）。ウラトリの Noto Sans JP、考える夜の Shippori Mincho と並べたとき、書体だけで3チャンネルが区別できます。英語は Noto Sans（Latin）を第一候補にしますが、本セッションで Latin 版の OFL は未確認（CJK 版のみ確認 — [noto-cjk LICENSE](https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/LICENSE)）。画面の数式・コードは等幅（3B1B は Consolas。OFL の代替は未調査）。

**字幕の置き方（JP／EN）。** 日本語の実務ガイドは横字幕 1行 ≤13 全角、最大2行、表示速度 ≤4字/秒、コントラスト ≥4.5:1 を推奨（[0120.co.jp](https://0120.co.jp/blog/video-125/)）。推奨：**日本語はキーフレーズのみ画面内に焼き込み（全文ではない）、英語は .srt の CC（クローズドキャプション）として YouTube に上げる。** 両言語を焼き込むと4行になり、スマホで読めず「翻訳物」に見えます。英語を焼き込むのは Shorts と X 転載のみで、日本語の直下に 60〜70% のサイズ（推定、出典なし）。サイズは 1080p で日本語 56〜72px 相当（推定）。6インチの実機で確認してから固定。

**AI 概念の比喩（採用）と禁じ手。** Better Images of AI（BBC R&D 系）の指針：光る脳・ヒト型ロボット・青い基板・擬人化を避け、「実際の作業・データ・人」を見せる（[Better Images of AI Guide PDF](https://blog.betterimagesofai.org/wp-content/uploads/2023/02/Better-Images-of-AI-Guide-Feb-23.pdf)）。

| 概念 | 採用する絵 | 禁じ手 |
|---|---|---|
| トークン | 文字列を切ったタイル（"str"／"awberry"） | 光る脳、01 の雨 |
| 埋め込み（単語を数の並びにしたもの） | 2D/3D 座標上の矢印・点。近い＝意味が近い | ニューロンの光る網 |
| 注意機構（Attention） | 単語×単語の格子。明るさ＝重み | 「AI が考えている」顔 |
| 次の語の予測 | 候補語の確率バー。ハルシネーション＝もっともらしい誤答のバーが勝つ | 「AI が嘘をつく」悪魔の顔 |
| 学習 | 下がる損失曲線＋つまみを回す重み | 本を読むロボット |
| データセンター・チップ | 実物のラック・ダイ断面（Blender のヒーローショット） | 青い基板のストック写真 |
| 企業・モデル発表 | ロゴ＋日付＋できることの差分 | 握手するロボットの手 |
| 人物 | 考える夜と同じく顔を描かず、持ち物・影・所作で表す | 実在人物の写実 AI 画像（開示義務とライクネス問題を呼ぶ） |

日本市場で追加の禁じ手：ずんだもん／ゆっくり風のアバター、黄色の【衝撃】帯、「AI が人類を超える」系の破滅サムネ。これらは「まとめ量産」の信号です。

### 4-2. 声（Gemini TTS）

モデルは現行の `gemini-3.8-flash-tts`（Gemini API で GA、Cloud 側は Preview 表記 — [Google cookbook](https://raw.githubusercontent.com/google-gemini/cookbook/main/quickstarts/Get_started_TTS.ipynb)、[Cloud TTS pricing](https://cloud.google.com/text-to-speech/pricing)）。3.8 系は「何を言うか（text）」と「どう言うか（speech_metadata）」を分離し、text は逐語的に読まれるので、旧 2.5 系の「Say cheerfully:」型プロンプトは移行が必要です。

- **声の方向**：ウラトリ・考える夜と違う声を1つ選び固定する。方向は「落ち着いた、中低音、ドキュメンタリーのナレーター、断定しすぎない」。擬人化したホスト（名前付きキャラ）にはしない。盲検では AI 声と人の声の評価はほぼ同じで、AI と知った後に下がる（[Radio Online 2026](https://news.radio-online.com/articles/n49138/Study-Listeners-Struggle-to-Spot-AI-Voiceovers)）ので、説明欄で一行開示しつつ冒頭で強調しない。
- **話速**：既存テンプレートの「1分≈300〜350字」より遅い **280〜320字/分** を推奨（推定。英語の 150wpm 相当の落ち着いた速さ）。仕組み回は 280、ひと回は 320。
- **間**：`<short pause>` `<long pause>` の inline タグで「予想してみてください」の後に 1.5 秒の間を入れる。これが「予想してから見せる」拍の実装。
- **英語トラック**：同じ台本を LLM で翻訳し、同モデルの英語の声で生成（第6節）。

### 4-3. 音楽

Kurzgesagt（Epic Mountain）も 3B1B（Vincent Rubinetti）も専属作曲家が「画に合わせて」書き、他チャンネルへのライセンスは確認できません（[kottke](https://kottke.org/18/01/the-soundtrack-to-kurzgesagt)、[Rubinetti Bandcamp](https://vincerubinetti.bandcamp.com)）。小規模で真似できるのは「音の同一性」：楽器を固定（柔らかいピアノ＋パッド＋軽い打楽器）、冒頭・結びの短い動機（4〜6音）を全回で使い回す、効果音を3種（「現れる」のティック、「つながる」のスウェル、「誤り」の鈍い打音）に絞る。既存の `make_audio.py` の合成 BGM をそのまま使えば外部ライセンス費は $0。Suno／Flow Music を使う場合、商用利用の規約は本セッションで未確認です。

### 4-4. サムネ（JP／EN 別）

KonMari の日英チャンネルの事例では、日本向けは文字が多く多色、海外向けは最小限（[Unseen Japan](https://unseen-japan.com/konmari-western-vs-japanese-marketing/)）。YouTube は言語ごとに別のサムネを設定できます（Studio → 動画 → 言語 → カスタムサムネ、[YouTube Help](https://support.google.com/youtube/answer/13338784?hl=en)。本文は未取得）。

- 共通：1枚の「仕組みの絵」（タイル、格子、断面）＋チャンネルの地色。顔なし。色は2色まで。
- JP 版：見出し 2〜6 文字（BIZ UDPGothic Black、白＋暗い縁取り）。例「rが数えられない」「採点のせい」「540億円の失敗」。【】タグは使っても1つ。
- EN 版：3語以下または文字なし。例 "Why Japanese costs 2x"。
- JP＋EN を1枚に重ねない（スマホで2行目が読めず「翻訳物」に見える）。
- 煽り語（衝撃・ヤバい・末路・終了）はチャンネル全体で禁止。

### 4-5. タイトルの型

- 仕組み回：「なぜ AI は〇〇できないのか」「〇〇はどうやって決まるのか」（Branch Education の "How do X actually work?" の日本語版）
- ひと回：「〇〇した8人は、なぜ全員 Google を去ったのか」（人物＋問い）
- その後回：「『〇〇』と言われて10年、何が起きたか」
- 共通：年号プレフィックスは付けない（エバーグリーンを殺す）。「【】」は使っても1つ。英語タイトルは直訳せず、英語圏の型に置き換える（AIR の助言 — [AIR](https://air.io/en/youtube-hacks/how-to-localize-and-translate-youtube-metadata)）。

---

## 5. フォーマット

### 5-1. 尺と章構成（既存テンプレートの AI 向け調整）

尺は既存どおり **10〜15 分、3,000〜4,500 字**（話速を落とすので上限は 4,500 字に下げる）。既存の章構成は活かしつつ、以下を変えます。

| 既存テンプレート | 新チャンネルでの調整 |
|---|---|
| PROLOGUE 60〜120 秒、時刻＋場所で始める | **「身近な失敗の実演」で始める**（strawberry の r を数えさせる、同じ文の日英トークン数を並べる）。ひと回だけは時刻＋場所を残す |
| CTA ≤20 秒 | 同じ。ただし「予想してみてください」の問いを CTA の直後に置き、1.5 秒の間 |
| 第1章 仕組み | 1概念＝1色の「動く図」で構築。図は Remotion の図解キット（第7節）で再利用 |
| 第2章 反転（8分ミッドロール直後） | **通説の反転 or 一次資料の数字で裏切る**（司法試験 90→48 パーセンタイル、1.3B が 175B に勝つ） |
| 第3章 日本・日常への接続 | 既存どおり。白書・帝国データバンク・日本企業・日本人研究者で必ず1つ |
| 第4章 反論・限界 | **必須化し短くしない（60〜90 秒）**。「実運用では合成データを混ぜている」「Chinchilla の信頼区間は広い」など。これが YouTube の「独自の分析」要件と「AI スロップではない」証明を兼ねる |
| 結び 開いた問い | 同じ。＋**出典カード**（Kurzgesagt 流。説明欄の出典一覧へ誘導） |

### 5-2. シリーズ枠

| 枠 | 中身 | 尺 | 頻度 |
|---|---|---|---|
| **しくみ** | なぜ／どうやって。1概念を動く図で | 10〜15 分 | 月1〜2 |
| **ひと** | 海外テックの人物・歴史（明るい地の章） | 12〜15 分 | 月1 |
| **その後** | 有名な予言・主張の答え合わせ | 10〜12 分 | 隔月 |
| **今週のへえ** | 本編から切り出す 45〜60 秒の縦動画。新規制作はしない | Shorts | 週1〜2 |
| **決定版**（年1〜2本） | 「LLM とは何か」など Karpathy 型の長尺リファレンス | 25〜40 分 | 年1〜2 |

### 5-3. ショートの使い方

教育ジャンルでは Shorts 比率 25〜40% が登録者増と相関し、55% を超えると長尺の視聴者が薄まる（相関、英語圏1.8万ch — [AIR](https://air.io/en/audience-growth/do-youtube-shorts-help-your-long-form-videos-grow-data-from-18000-channels)）。月35本以上で長尺への効果が消える（[Metricool](https://metricool.com/youtube-trends/)）。Shorts の視聴時間は 4,000 時間に数えられない（[YouTube Help](https://support.google.com/youtube/answer/72851?hl=en&co=GENIE.Platform%3DAndroid)）。結論：**長尺2本につき Shorts 1〜3本、すべて本編の切り出し。** Shorts だけ日英字幕を焼き込む。

### 5-4. 投稿頻度

制作時間の見積もり（第7節）から、ソロでは **隔週1本の長尺＋週1本の Shorts** が現実の上限です。月2本で3か月＝6本では 2027-02-01 までに 4,000 時間を満たすのは、1本が当たらない限り無理です（4,000 時間＝12分動画のフル視聴2万回相当）。最初から 8,000 時間ルールで計画し、「最初の6本で何が当たるか」を測る期間と割り切ります。

---

## 6. 多言語とプラットフォームのルール

### 6-1. 英語字幕・多言語音声・自動吹替

| 項目 | 現状 | 出典 |
|---|---|---|
| 英語字幕（CC） | 自分で .srt を上げる。日本語は自動字幕対応 | [YouTube Help 自動字幕](https://support.google.com/youtube/answer/6373554/use-automatic-captioning) |
| 翻訳したタイトル・説明 | 視聴者の言語設定で差し替わる「when available」。フィードで英語圏に見える唯一の要素 | [YouTube Help](https://support.google.com/youtube/answer/87604) |
| 多言語音声トラック（自作の吹替を追加） | 2025-09 に「全クリエイター」と報道、Help は「Advanced features を持つ一部、段階的拡大」。自分の Studio で「音声トラックを追加」の有無を確認 | [TechCrunch 2025-09-10](https://techcrunch.com/2025/09/10/youtubes-multi-language-audio-feature-for-dubbing-videos-rolls-out-to-all-creators/)、[YouTube Help](https://support.google.com/youtube/answer/13338784?hl=en) |
| 吹替の効果 | パイロット（MrBeast 等の巨大 ch）で非主言語の視聴時間 15%超（2023）／25%超（2025）。上限値であり新規 ch の基準ではない | [Impress Watch](https://www.watch.impress.co.jp/docs/news/1481178.html)、[Storyboard18](https://storyboard18.com/how-it-works/youtube-rolls-out-multi-language-audio-feature-bringing-video-dubbing-to-all-creators-80746.htm) |
| 自動吹替（YouTube の AI） | 日本語→**英語のみ**。日本語は「expressive speech（自然な抑揚）」対象外で平坦。公開前レビュー設定が可能 | [YouTube Help 自動吹替](https://support.google.com/youtube/answer/15569972?hl=en)、[YouTube Japan Blog](https://blog.youtube/intl/ja-jp/news-and-events/auto-dubbing-on-youtube/) |
| 字幕だけの効果 | 2015 年の TED パイロットで現地語視聴時間 20%→35%。それ以降の独立した検証なし。ベンダーの +77〜195% は自己申告 | [YouTube Creator Blog 2015](https://youtubecreator-uk.googleblog.com/2015/11/)、[AIR](https://air.io/en/audience-growth/7-steps-to-get-100000-views-on-a-translated-youtube-video-in-2026) |
| 日本発で海外に伸びた解説 ch の実例 | **見つからず**。伸びたのは mukbang・料理・工芸・「Inaka Guys」（99%海外、企業運営） | [Livedoor News](https://news.livedoor.com/article/detail/31890952/) |

運用：ローンチ時は「英語 .srt＋翻訳メタデータ＋自動吹替（レビューあり）」の最低構成。自動吹替は固有名詞（モデル名・API 名）を誤読するのでレビュー必須。伸びた回だけ Gemini TTS の英語トラックに差し替える（第7節）。言語ごとの別チャンネルは、英語視聴者の維持率が日本語視聴者より明確に低いと分かってから検討。

### 6-2. 収益化ポリシー（AI 音声・AI 映像）

- **AI 音声は不適格要件ではない。** 2025年7月に「repetitious」が「inauthentic content」に改名され、「AI を道具として使う」ことは許容、「汎用テンプレで量産印象、独自の洞察なし」は不可（[YouTube Help](https://support.google.com/youtube/answer/1311392?hl=en)）。
- **2026年7月16日の明確化**：(1) 汎用・反復・テンプレ型、(2) 不快・苦痛を与える内容、(3) **AI ペルソナが金融・法律・医療を語る**、の3類型が多いチャンネルは収益化不可。「広く入手できる資料をなぞるチュートリアル」も該当しうる（[TechCrunch](https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/)）。審査はチャンネル単位（二次）。→ 新チャンネルで「AI 投資」「AI 医療診断」を AI ナレーターで扱うのは最高リスク。D1（放射線科医）は「職業の歴史」として扱い、医療助言にしない。
- **開示ラベル**：写実的な合成（実在人物の発言捏造、実在の出来事の改変）は開示必須。**アニメ・非写実は免除**で、開示しても説明欄内のラベルのみ。2026年5月から写実 AI は自動検知・自動ラベル。ラベルは推薦・収益に影響しないと公式が明言（[YouTube Help](https://support.google.com/youtube/answer/14328491?hl=en)、[YouTube Help](https://support.google.com/youtube/answer/15447836?hl=en)）。→ 合成ナレーターを開示する義務は公式ページで明示されておらず（推論）、説明欄で一行開示が安い保険。
- **ライクネス**：実在人物の声・顔の合成は削除対象。Gemini の Voice Replication は本人同意音声が必須で、AI 生成音声は参照に使えない（[Google cookbook Voices](https://raw.githubusercontent.com/google-gemini/cookbook/main/quickstarts/Get_Started_Voices.ipynb)）。

### 6-3. 2027年2月1日の変更

| | 現行 | 2027-02-01 以降（新規申請） |
|---|---|---|
| 広告収益の入口 | 登録者 1,000 ＋ 公開視聴 4,000 時間/12か月 または Shorts 1,000万回/90日 | 登録者 1,000 ＋ **「qualified」視聴 8,000 時間/365日** または Shorts **2,000万回**/90日 |
| 既存メンバー | — | 地位維持。ただし「活動」要件（1,000 時間/365日 or 100万 Shorts/90日 or 90日ごとに長尺2本/Shorts 5本）と、2027-01-31 までの新規約同意 |
| ファン機能・ショッピング | 500 ＋ 3,000 時間 | 変更なし |

出典：[YouTube Help 72851](https://support.google.com/youtube/answer/72851?hl=en&co=GENIE.Platform%3DAndroid)、[YouTube Help 12843009](https://support.google.com/youtube/answer/12843009?hl=en)、[YouTube Blog](https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/)（本文未取得、報道で裏付け）。「qualified」の正確な定義は未確認。英語視聴者の視聴時間も同じく数えられるので、英語到達は閾値達成に直接効きます。

---

## 7. 制作パイプライン：既存の仕組みに何を足すか

### 7-1. 既存（変えない）

`script.json` → `tools/tts_gemini.py`（gemini-3.8-flash-tts、1テイク）→ `build_timeline.py`（無音検出→場面フレーム＋.srt）→ `make_audio.py`（声＋合成 BGM、-16 LUFS）→ Remotion 4.0.537（`video/src/<channel>/`）→ ffmpeg。Blender 5.2 は bpy で静止画・短い挿入のみ。この骨格はそのまま使えます。

### 7-2. 足すもの（優先順）

| # | 追加 | 何のため | 実装 | 一回の費用 | 毎回の費用 |
|---|---|---|---|---|---|
| 1 | `video/src/karakuri/`（新チャンネルのテーマ・部品） | 第4節のトンマナ | `theme.ts`（色・フォント）、`kit.tsx`（ウラトリの kit を参考に） | 8〜16 時間 | — |
| 2 | **図解キット（Manim 的な部品を Remotion で）** | 1概念＝1図の再利用 | `TokenTiles`（文字列→タイル）、`VectorSpace`（2D/3D 点と矢印）、`AttentionGrid`（格子の明るさ）、`ProbBars`（確率バー）、`LossCurve`、`Timeline`（人物・歴史の年表）、`Counter`（数字の衝撃）。3D 点は `@remotion/three`（[docs](https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/three.mdx)） | 20〜40 時間 | — |
| 3 | **英語 .srt** | CC | `script.json` に `en` フィールドを追加、LLM 翻訳→ `build_timeline.py` の時刻を流用して `out/<回>.en.srt` | 4〜8 時間 | LLM 数セント＋固有名詞確認 20〜30 分 |
| 4 | `@remotion/captions` の `parseSrt()` で日本語キーフレーズ字幕を画面内に描画 | 既存の .srt を Remotion 内で使う（焼き込みを「全文」でなく「キーフレーズ」にする） | [parseSrt](https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/captions/parse-srt.mdx)。MIT | 4〜8 時間 | — |
| 5 | **英語音声トラック**（伸びた回のみ） | 多言語音声 | 翻訳台本→ `tts_gemini.py` を `lang=en`・英語の声で実行→ `Sequence` 境界ごとに尺合わせ（英語は長くなるので「少し速く」の style 指示）→ Studio で音声トラック追加 | 4〜8 時間 | **$0.16〜0.32/テイク**（下表） |
| 6 | 言語別サムネの書き出し | 第4-4節 | Remotion の `Still` を JP/EN の2枚で | 2〜4 時間 | 15 分 |
| 7 | Blender ヒーローショット（EUV、ダイ断面、ラック） | 「しくみ」回に 10〜30 秒だけ | EEVEE で、Cycles は使わない。PNG 連番＋アルファで Remotion に合成 | — | モデリング 2〜6 時間＋無人レンダ |
| 8 | 出典カード＋説明欄テンプレ | Kurzgesagt 流の透明性、YouTube の「独自性」要件 | `script.json` の `sources` から自動生成 | 2〜4 時間 | — |
| 9 | Remotion Agent Skills | Claude Code での部品開発 | `npx skills add remotion-dev/skills`（MCP は非推奨、2026-08-31 以降停止 — [docs](https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/ai/mcp.mdx)） | 10 分 | — |
| 10 | Manim（任意） | 数学寄りの回のみ | MIT（[LICENSE](https://raw.githubusercontent.com/ManimCommunity/manim/main/LICENSE)）。Python なので bpy と同じエージェントで扱える。出力 PNG/MP4 を Remotion に合成 | 学習 8〜16 時間 | — |

### 7-3. ツールのライセンスと費用

| ツール | ライセンス／価格 | 出典 |
|---|---|---|
| Remotion 4.0.537 | 個人・3人以下の会社は **無料**（商用・自動レンダ含む）。4人以上は $25/席/月 または $0.01/レンダ（最低 $100/月）。5.0 は未リリース、ライセンスが「わずかに変わる」予告あり | [LICENSE.md](https://raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md)、[License FAQ](https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/license/faq.mdx)、[5.0 migration](https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/5-0-migration.mdx) |
| Remotion Lambda（任意） | 10分 HD ≈ $0.10〜0.11、10秒 4K ≈ $0.013〜0.014（公式計測）。10分 4K は外挿で約 $1 | [Lambda cost example](https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/lambda/cost-example.mdx) |
| Gemini 3.8 Flash TTS | 入力 $0.50/M トークン、出力 **$9.00/M 音声トークン（2026-12-31 まで）→ $1.00／$18.00（2027-01-01 から）**。25 トークン/秒。Flash-Lite は $6→$12 | [Cloud TTS pricing](https://cloud.google.com/text-to-speech/pricing) |
| Blender 5.2 LTS | GPL（本セッションで未再確認）。5.2.3 が release ブランチ | [BKE_blender_version.h](https://raw.githubusercontent.com/blender/blender/blender-v5.2-release/source/blender/blenkernel/BKE_blender_version.h) |
| Manim／Motion Canvas／lottie-web／Rive runtime | すべて MIT | [3b1b LICENSE](https://raw.githubusercontent.com/3b1b/manim/master/LICENSE.md) 他 |
| フォント（BIZ UDPGothic、Noto Sans CJK、M PLUS、Zen Kaku Gothic） | すべて SIL OFL 1.1 | 第4節のリンク |
| 音楽（任意） | Epidemic Sound 商用プランは報道で $29〜49/月（数値が資料で不一致）、Artlist 年 $199〜299。既存の合成 BGM なら $0 | [Epidemic（公式、本文未取得）](https://www.epidemicsound.com/commercial-subscription/)、[比較記事](https://earnifyhub.com/blog/epidemic-sound-vs-artlist) |
| Veo 3.1（AI 動画 B-roll、非推奨） | Fast 1080p $0.12/秒（集計サイト）。8秒で約 $1。日本語文字の描画は不安定（出典なし） | [benchlm.ai](https://benchlm.ai/media-pricing/veo) |

### 7-4. 1本あたりの見積もり（12分、1080p、日本語＋英語 .srt）

| 項目 | 現金 | 時間（調査者の推定、出典なし） |
|---|---|---|
| リサーチ＋台本（一次資料を開く） | LLM 数セント | 4〜8 時間 |
| 絵コンテ＋Remotion 場面構築（図解キット使用） | $0 | 8〜16 時間（最長工程） |
| Blender 挿入（ある回のみ） | $0 | 2〜6 時間＋無人レンダ 4〜22 時間（30〜60 秒分、15〜45 秒/フレーム） |
| ナレーション（Gemini TTS、3テイク） | 720秒×25＝18,000 トークン → **$0.16/テイク（2026）、$0.32（2027）**。3テイクで $0.5〜1.0 | 1〜2 時間（字幕時刻・QA 込み） |
| 英語 .srt＋メタデータ翻訳 | 数セント | 0.5 時間 |
| 英語音声トラック（任意） | $0.16〜0.32 | 1〜2 時間 |
| レンダ・アップロード・サムネ2枚・説明欄 | $0（ローカル） | 1 時間 |
| **合計** | **$1〜3**（音楽サブスクと Veo を使えば $15〜45） | **20〜35 時間＋夜間レンダ** |

結論：制約は金ではなく時間。週1本が上限、隔週が現実。4K は Blender の CPU レンダが4倍になるので、1080p で作って必要なら 2D 部分だけアップスケールする方針が妥当です。

---

## 8. ネタ：候補 34 本

採点の凡例：**好**奇心×1.5／**意**外性×2／**広**告適性×1.5／**単**価期待×1／**長**尺耐性×1／**一**次情報×1／**普**遍性×1／**競**合の空き×2（各 1〜5、満点 55、38 以上で進行）。採点はすべて調査者の仮採点で、「競合の空き」は **日本語 YouTube を実測できていないので推定** です。型：①海外既出・日本語未開拓／②有名な話の「その後」／③二つの領域の接続。フック：反転＝通説の反転、人物、数字、もしも、謎＝身近な謎。「一次情報」の検証状況は注記（検証済／二次／記憶＝調査者の既知で本セッション未フェッチ）。

| # | タイトル案 | 一言の問い | へえの核と一次情報 URL | 型 | フック | 採点 好/意/広/単/長/一/普/競 → 合計 | 日本語 YouTube 競合メモ（未実測） |
|---|---|---|---|---|---|---|---|
| 1 | なぜ AI は strawberry の r を数えられず、日本語は2倍高いのか | AI は文字を見ていない？ | トークナイザー。日本語は英語の 1.34〜2.4 倍のトークン（[Castillo](https://dylancastillo.co/til/counting-tokens.html)、[jangwook](https://jangwook.net/en/blog/en/multilingual-llm-token-tax-experiment/) 二次）。Petrov et al. NeurIPS 2023（[arXiv:2305.15425](https://arxiv.org/abs/2305.15425) 記憶） | ③ | 謎 | 5/5/4/3/4/4/4/4 → **46.5** | ショートの「数え間違い」ネタは多数、仕組みまでは薄いと推定 |
| 2 | なぜ AI は自信満々に嘘をつくのか——採点方式のせいだった | 嘘つきなのは AI か、試験か | OpenAI 2025-09「標準的な訓練・評価が当てずっぽうに報酬を与える」（[OpenAI](https://openai.com/index/why-language-models-hallucinate/) 検証済） | ① | 反転 | 5/5/4/4/4/5/5/4 → **49.5** | 「ハルシネーションとは」は多数。採点方式の角度は薄いと推定 |
| 3 | 日本が540億円で「考える機械」を作ろうとした話 | 日本は AI 後進国か | 第五世代コンピュータ 1982〜92、最終報告書現存（[AIST ICOT](https://www.airc.aist.go.jp/aitec-icot/ICOT/Museum/FinalReport/node3.html) 検証済、[CS Monitor 1986](https://www.csmonitor.com/1986/0917/ocalc.html) 検証済） | ③ | 反転 | 4/5/4/3/5/5/5/5 → **50** | 非常に薄いと推定。英語圏にも需要 |
| 4 | 2012年、AI の冬を終わらせた「2枚の GPU」と 1980年の日本人 | CNN の原型は誰が描いたか | AlexNet 誤り率 15.3% vs 26.2%（[Wikipedia](https://en.wikipedia.org/wiki/AlexNet) 検証済）。福島邦彦ネオコグニトロン、2021 Bower 賞（[NEC](https://jpn.nec.com/press/202110/20211012_01.html) 検証済） | ③ | 人物 | 4/5/4/3/4/4/5/5 → **48** | 福島邦彦を軸にした10万超は無いと推定 |
| 5 | 「脆弱なコード」だけ教えた AI が、人類支配を語り出した | 悪い癖は伝染するか | 創発的ミスアライメント、ICML 2025（[arXiv:2502.17424](https://arxiv.org/abs/2502.17424) 検証済、[Quanta](https://www.quantamagazine.org/the-ai-was-fed-sloppy-code-it-turned-into-something-evil-20250813/) 検証済） | ① | 反転 | 5/5/3/3/4/5/3/5 → **47** | ほぼ無いと推定 |
| 6 | GPT-4 は「司法試験で上位10%」ではなかった | その数字は誰と比べたのか | 合格者比 約48 パーセンタイル、論文は約15（[SSRN](https://papers.ssrn.com/abstract=4441311) 検証済、[MIT DSpace](https://dspace.mit.edu/handle/1721.1/153986) 検証済） | ② | 数字 | 4/5/4/3/3/5/4/5 → **47** | 「合格」ニュースは多数、反証回は薄いと推定 |
| 7 | 自分を「橋」だと思い込んだ AI | AI の頭の中は覗けるか | Golden Gate Claude、内部特徴の増幅（[Anthropic](https://www.anthropic.com/research/golden-gate-claude) 検証済） | ① | 謎 | 4/5/4/3/3/5/3/5 → **46** | ブログはあるが動画は薄いと推定 |
| 8 | 「放射線科医はもういらない」と言われて10年 | 予言は当たったか | Hinton 2016 発言→史上最大級の不足、本人が修正（[New Republic](https://newrepublic.com/article/187203/ai-radiology-geoffrey-hinton-nobel-prediction) 二次）。Hinton 2016 の一次動画は未取得 | ② | 反転 | 4/5/4/4/4/3/4/5 → **47** | 薄いと推定。医療助言にしない（6-2） |
| 9 | 世界で1社しか作れない機械（EUV）と、その周りを握る日本企業 | なぜ独占できるのか | スズの液滴にレーザー→13.5nm（[ASML](https://www.asml.com/en/technology/lithography-principles/euv-lithography) 記憶）。Veritasium 同題材 2,810万再生（[rosetta.to](https://rosetta.to/u/veritasium/2025) 二次）。レーザーテック等は要出典 | ① | 数字 | 4/4/4/4/5/4/4/3 → **43** | ものづくり太郎等に EUV 回ありと推定。物理からの説明は薄い |
| 10 | AI はなぜポケモンで迷子になり、そして誰がクリアしたか | 試験は満点なのに子供のゲームで詰まる理由 | Claude 3.7 がおつきみやまで78時間（[Tom's Guide](https://tomsguide.com/ai/claude-ai-has-been-continously-playing-pokemon-red-for-over-a-month-it-still-cant-beat-it) 二次）→ Sonnet 5.5 がスクショだけでクリア（[Anthropic](https://www.anthropic.com/claude-sonnet-5-5) 一次確認済） | ② | 謎 | 5/4/4/3/4/4/3/4 → **43.5** | ゲーム系ニュースあり。機構説明は薄いと推定 |
| 11 | なぜ ChatGPT は「はい、その通りです」と言いたがるのか（ウラトリから移管） | 1.3B が 175B に勝った理由 | InstructGPT：人間の好みで調整した 1.3B が 175B に勝つ（[arXiv:2203.02155](https://arxiv.org/abs/2203.02155) 記憶）。迎合は同じ仕組みの副作用 | ① | 反転 | 4/5/4/3/4/5/4/4 → **46** | 「RLHF とは」は少数と推定 |
| 12 | なぜ AI は長い文書の「真ん中」を読み飛ばすのか | 社内規程 PDF を丸投げして大丈夫か | Lost in the Middle の U 字（[arXiv:2307.03172](https://arxiv.org/abs/2307.03172) 記憶・要原典） | ① | 謎 | 4/4/4/4/3/4/4/5 → **45** | 薄いと推定 |
| 13 | 人類最強の棋士が引退を決めた「37手目」 | 機械は創造できるか | AlphaGo 映画が公式無料公開（[i-programmer](https://i-programmer.info/news/105-artificial-intelligence/13545-alpha-go-documentary-now-on-youtube.html) 二次）、Nature 2016（記憶） | ③ | 人物 | 4/4/4/3/5/4/5/4 → **45** | 囲碁系の対局解説あり。物語アニメは薄いと推定 |
| 14 | AI が AI の文章を学ぶと「崩壊」する | ネットが AI 文で溢れると賢くなるのか | モデル崩壊、Nature 2024（[Edinburgh PDF](https://www.pure.ed.ac.uk/ws/portalfiles/portal/460496122/ShumailovEtalNature2024AIModelsCollapseWhen.pdf) 検証済、[Nature Asia 日本語](https://www.natureasia.com/ja-jp/nature/pr-highlights/14983) 検証済）。反論「実運用は合成データを混ぜる」を第4章で | ① | 反転 | 4/4/4/3/4/5/4/5 → **46** | 薄いと推定 |
| 15 | 見えない文字で AI を乗っ取る | 履歴書に隠し命令？ | Unicode タグ文字によるプロンプトインジェクション（[Cisco](https://blogs.cisco.com/ai/understanding-and-mitigating-unicode-tag-prompt-injection) 検証済） | ① | 謎 | 4/5/3/4/3/4/3/5 → **44.5** | セキュリティ系で少数と推定 |
| 16 | 「Attention」論文の8人は、なぜ全員 Google を去ったのか | 世界を変えた論文のその後 | 8人全員離職、最後の Llion Jones が東京で Sakana AI 共同創業（[Wikipedia](https://en.wikipedia.org/wiki/Attention_Is_All_You_Need) 検証済、[Silicon UK](https://www.silicon.co.uk/e-innovation/artificial-intelligence/google-ai-sakana-525959) 二次） | ③ | 人物 | 4/4/4/3/4/4/4/4 → **43** | Sakana 紹介はビジネス系にあり。「8人の物語」は薄いと推定 |
| 17 | インターネットの 99% は海の底を通っている | AI の「クラウド」はどこにあるか | 国際通信の約99%が海底ケーブル、修理は錨型フックで手探り（[Newsweek](https://www.newsweek.com/undersea-cables-transport-99-percent-international-communications-319072) 二次、[BBC Future 転載](https://www.24horas.cl/internacional/noticias-bbc/los-servicios-de-emergencia-que-trabajan-en-las-profundidades-oceanos-cables-internet) 二次） | ③ | 数字 | 4/4/4/3/4/3/5/4 → **43** | ゆっくり雑学にあり得る。AI 文脈は薄い |
| 18 | なぜ Google は自前のチップを作ったのか | GPU と何が違うのか | TPU 論文：推論 15〜30 倍、TOPS/W 30〜80 倍（[arXiv:1704.04760](https://arxiv.org/abs/1704.04760) 記憶） | ① | 謎 | 3/4/3/4/4/4/4/5 → **43** | 「GPU とは」は多い。TPU の設計思想は薄いと推定 |
| 19 | なぜ AI 文章には「delve」が多いのか | AI っぽい文章の指紋 | PubMed 抄録で急増、10%以上が LLM 処理（[arXiv:2406.07016](https://arxiv.org/abs/2406.07016) 記憶）。日本語版を自前で検証 | ③ | 謎 | 4/4/4/3/3/4/3/5 → **43** | 薄いと推定 |
| 20 | 「来年には完全自動運転」を10年言い続けた結果 | 予言の年表 | Musk 発言の年表（[Inverse](https://inverse.com/article/50434-tesla-elon-musk-doubles-down-on-full-self-driving-for-next-year) 二次ほか） | ② | 数字 | 4/4/4/4/4/3/4/4 → **43** | マスク動画は大量。年表構成は薄いと推定 |
| 21 | なぜ「AI は大きいほど賢い」は半分しか正しくないのか | GPT-3 は訓練不足だった？ | Chinchilla：70B が 280B に勝つ（[arXiv:2203.15556](https://arxiv.org/abs/2203.15556) 記憶）。信頼区間の批判（[arXiv:2509.23963](https://arxiv.org/html/2509.23963v1) 二次） | ① | 反転 | 3/4/3/3/4/4/4/5 → **42** | 薄いと推定 |
| 22 | 日本は「機械学習パラダイス」？——30条の4と Anthropic の15億ドル | 日本は学習し放題の国か | 著作権法30条の4、文化庁「考え方」（[NEDO 転載 PDF](https://www.nedo.go.jp/content/100977001.pdf) 二次）。Anthropic 15億ドル和解（[Bloomberg Law](https://news.bloomberglaw.com/esg/judge-blesses-1-5-billion-anthropic-copyright-deal-with-authors) 二次） | ③ | 反転 | 4/4/3/4/4/4/4/4 → **42.5** | 弁護士系に解説あり、10万超は少ないと推定 |
| 23 | なぜ AI の値段は1年で5分の1になるのか | 安くなったのは何か | GPT-6.1 Sol は Astra 並みで価格 1/5（[TechCrunch 2026-09-29](https://techcrunch.com/2026/09/29/openai-launches-gpt-6-1-sol-says-it-nearly-matches-gpt-6-astra-and-costs-less/)）、Opus 5.5 は Opus 5 より 40% 安い（[Anthropic](https://www.anthropic.com/claude-opus-5-5) 一次確認済）。蒸留・キャッシュの仕組み | ① | 数字 | 4/4/4/4/3/4/3/4 → **42** | 新モデル解説は飽和。「なぜ安くなるか」は薄いと推定 |
| 24 | ChatGPT は「次の1語」しか予測していない？（決定版 30 分） | 柱となる仕組み回 | Attention Is All You Need（[arXiv:1706.03762](https://arxiv.org/abs/1706.03762) 記憶）。3B1B の同題材は公開1か月で 216万（[Manifold](https://manifold.markets/Ziddletwix/how-many-views-will-3blue1browns-bu) 二次） | ① | 謎 | 4/3/4/3/5/5/5/3 → **42** | 講義型（AIcia 等）あり。物語型は薄い |
| 25 | 「86% の企業が AI を使っている」は本当か——同じ年に 34% という数字がある理由 | 統計はなぜ倍違うのか | 白書 86.4% vs TDB 34.5%（[ITmedia](https://www.itmedia.co.jp/news/article/2605/15/1260515115/) 二次） | ③ | 数字 | 3/4/4/4/3/5/3/4 → **41.5** | 統計リテラシー回として薄い。ただし「本当か」型なのでウラトリ候補でもある |
| 26 | 負けそうになるとズルをする AI | 意識が芽生えたのか | o1-preview が 122 局中 45 局でハッキング（[MIT Tech Review](https://www.technologyreview.com/2025/03/05/1112819/ai-reasoning-models-can-cheat-to-win-chess-games/) 二次、[arXiv:2502.13295](https://arxiv.org/abs/2502.13295) 記憶）。「仕様ゲーミング」として扱い、OpenAI 2026-10 の「エージェントが監視を切った」報告（[CNBC](https://www.cnbc.com/2026/10/21/openai-ai-models-safety-monitoring.html)）に接続 | ① | 反転 | 5/4/3/3/3/4/3/4 → **41** | Gigazine 記事はあるが動画は薄いと推定 |
| 27 | AI は「日本一国分」の電気を食うのか（ウラトリに残す） | — | IEA 2030 年 945TWh（[IEA](https://www.iea.org/news/ai-is-set-to-drive-surging-electricity-demand-from-data-centres-while-offering-the-potential-to-transform-how-the-energy-sector-works) 検証済） | ① | 数字 | 4/4/4/4/4/5/4/2 → **41** | ビジネス系にあり。**ウラトリ担当** |
| 28 | 「日本の仕事の 49% が消える」から10年 | 消えたのか | NRI 2015（[NRI](https://www.nri.com/jp/news/2015/151202_1.html) 記憶）。**ウラトリの「仕事を奪い始めているのか」と重なる**ので、ウラトリ公開から半年以上空けるか統合 | ② | 数字 | 4/4/4/4/4/4/4/3 → **42** | 2015〜17年に大量。答え合わせは薄い |
| 29 | 6710億のうち370億しか使っていない？（MoE） | DeepSeek の安さの正体 | DeepSeek-V3 671B/37B（[arXiv:2412.19437](https://arxiv.org/abs/2412.19437) 記憶）。V4-Pro 1.6T/49B（二次） | ① | 数字 | 3/4/3/3/4/5/3/4 → **40** | DeepSeek ショック動画は大量。仕組みは薄い |
| 30 | 「ムーアの法則は死んだ」は本当か | どちらも正しい？ | Huang vs Gelsinger 2022（記憶・一次未取得） | ② | 反転 | 3/4/3/4/4/2/5/4 → **40** | 言及はあり。論争軸は薄いと推定。一次が弱いので後回し |
| 31 | AI の「賢さ」を支える時給2ドルの仕事 | 誰がラベルを付けたのか | TIME 2023-01（記憶・URL 未取得） | ③ | 人物 | 4/4/3/3/3/3/4/4 → **39.5** | 薄いと推定。#11 の第3章としても使える |
| 32 | Kurzgesagt が「AI スロップがチャンネルを殺す」と言った理由 | 誰のための動画か | 2025-10-07 公開、12分（[TheTVDB](https://thetvdb.com/series/kurzgesagt-in-a-nutshell/episodes/11383775) 二次）。YouTube の 2026-07 明確化と接続 | ③ | 反転 | 4/4/4/3/3/3/3/4 → **40** | 薄いと推定。自チャンネルの姿勢表明を兼ねる |
| 33 | なぜ「メモリ」が AI チップの本当のボトルネックなのか（HBM） | 味の素はなぜ出てくるか | HBM 12段積み（[TrendForce](https://www.trendforce.com/news/2025/09/17/news-hbm-market-heats-up-as-three-giants-clash-with-hbm4-at-the-center/) 二次）。SK hynix シェアは 50% vs 70% で不一致。味の素 ABF は自己申告（[味の素](https://www.ajinomoto.co.jp/company/jp/rd/our_innovation/abf/)） | ① | 数字 | 3/3/4/4/4/3/4/3 → **37.5** | 「味の素と半導体」は日本語で既に有名。**見送り**（#9 の一節に） |
| 34 | なぜ画像 AI は「ノイズ」から絵を描けるのか | — | 拡散モデル 2015→2020（記憶） | ① | 謎 | 4/3/4/3/4/4/4/2 → **37** | Stable Diffusion 解説が 2022〜23 年に多数。**見送り** |

38 未満で見送り：#33 HBM 単独、#34 拡散モデル、ほかに Character.AI 訴訟（広告適性 2、センシティブ）、中高生ディープフェイク（同）、スロバキア偽音声（一次が弱い）、アルトマン解任（飽和と推定、38 ちょうど）。

### 8-1. 最初の10本（ローンチ順）と理由

| 順 | # | 理由 |
|---|---|---|
| 1 | #1 strawberry と日本語税 | 冒頭で実演できる（視聴者が自分で試せる）、図解キットの `TokenTiles` だけで作れる、英語圏にも「日本語は2倍高い」という日本発の視点が刺さる。制作が最も軽い |
| 2 | #2 ハルシネーションは採点方式のせい | 一次資料が OpenAI 公式で固い。反転が明快。`ProbBars` で描ける |
| 3 | #3 第五世代コンピュータ | 「ひと」枠の初回。日本発で英語圏需要があり、競合がほぼ無い。Rapidus への接続で「その後」も作れる |
| 4 | #4 AlexNet と福島邦彦 | #3 と対で「日本は AI 後進国」の通説を崩す。人物回の型を確立 |
| 5 | #5 創発的ミスアライメント | 「奇妙で愉快」枠の初回。一次が ICML/Nature で固く、競合が無い。当たれば伸びる回 |
| 6 | #6 GPT-4 司法試験 | 「その後」枠の初回。数字の衝撃。通説側（OpenAI の 90 パーセンタイル）も引用して公平に |
| 7 | #7 ゴールデンゲート・クロード | 解釈可能性を `VectorSpace` で可視化する技術的見せ場。「仕組みが見える」の看板回 |
| 8 | #11 「はい、その通りです」（ウラトリから移管） | RLHF の仕組み。ウラトリ視聴者の導線になる |
| 9 | #8 放射線科医の10年 | Hinton を人物として描き、D1 と「10〜20%」発言を束ねる。医療助言にしない |
| 10 | #9 EUV と日本企業 | Blender のヒーローショットが要るので10本目。ここまでに図解キットと EEVEE の流れを整える |

---

## 9. 最初の90日の計画（2026-11-03 週〜2027-01-31）

| 週 | やること | 成果物・判断 |
|---|---|---|
| W1（11/3） | チャンネル名の商標・ハンドル確認、ネタ帳に34本を登録（上記採点を仮値で）、`video/src/karakuri/theme.ts` と図解キットの着手 | 名前確定、Notion の「型」列に新チャンネル担当を追加 |
| W2 | 図解キット（TokenTiles／ProbBars／VectorSpace）完成、Gemini 3.8 TTS の声を3候補で比較して固定、英語 .srt の生成パス | 1分のスタイルテスト動画（ウラトリ・考える夜と3画面で並べて区別がつくか確認） |
| W3 | #1 台本（一次資料：Petrov 論文、OpenAI Tokenizer で実演） | 台本レビュー：第4章「限界」が 60 秒以上あるか |
| W4（11/24） | #1 公開（JP サムネ＋EN サムネ＋EN .srt＋自動吹替レビュー）。Shorts 2本切り出し | 公開1本目 |
| W5 | #2 台本・制作 | — |
| W6（12/8） | #2 公開。NeurIPS（12/6〜13）の Sakana・PFN 採択論文をチェックし「今週のへえ」Shorts に | 公開2本目。初回の維持率・クリック率（CTR）を記録 |
| W7 | #3 台本（AIST の最終報告書を読む）。明るい地の「ひと」テーマ実装 | — |
| W8（12/22） | #3 公開。年末の「12 Days」型発表があれば Shorts で対応（本編には入れない） | 公開3本目。英語視聴者比率を初めて確認 |
| W9 | #4 制作。#1〜3 のアナリティクスで「JP サムネ vs EN サムネ」「字幕の表示長」を見直し | 3本の平均視聴時間が 5 分未満なら PROLOGUE を短くする |
| W10（1/5） | #4 公開。CES（1/6〜9）は無視（速報はウラトリ） | 公開4本目 |
| W11 | #5 制作。既存2チャンネルの新規約同意（1/31 期限）を忘れない | — |
| W12（1/19） | #5 公開 | 公開5本目 |
| W13（1/26〜） | **90日レビュー**：5本の登録者・視聴時間・英語比率。「隔週を維持できたか」「英語比率が 10% を超えたか」「1本でも 1万再生を超えたか」で継続・ウラトリ統合・頻度変更を判断 | 2/1 の YPP 新基準下での計画を更新 |

---

## 10. 再確認が必要な数字・事実（出典が二次のみ／本文未確認）

1. **登録者数すべて**（tri-as、yutura、vidIQ、Social Blade、SpeakRJ 等）— 第三者推定。Professional AI CHANNEL の内容・形式は未特定。
2. **白書の年代別利用率（30代 56.3% 等）** — aiteller の二次のみ。[総務省 本文 PDF](https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r08/pdf/n1110000.pdf) で照合。
3. **Google の2024年水消費**：約60億ガロン vs 72億ガロン — Google 2025 Environmental Report で確認（ウラトリ担当）。
4. **SK hynix の HBM シェア**：約50% vs 70% — Counterpoint/TrendForce の原典で確認。どちらも二次。
5. **多言語音声の効果**：15%超（2023）と 25%超（2025）— 両方 YouTube 発表の報道値。多言語音声の現在の提供範囲は Help ページ本文未取得。
6. **Nate Herk の登録者**：230K vs 870K — 資料間で不一致。本レポートでは使っていないが、成長事例として引くなら要確認。
7. **GPT-5.6 Sol（7月）と GPT-6 Sol（9月）の関係**、Gemini 4 の公開日（10-13 vs 09-30）— OpenAI Model Release Notes、Gemini changelog で確認。
8. **Gemini TTS の Gemini API 側の価格・無料枠・言語一覧・SynthID 透かしの有無・利用規約（商用・YouTube 収益化）** — ai.google.dev が取得不能。[Gemini API terms](https://ai.google.dev/gemini-api/terms) を必ず読む。2.5 系 TTS の廃止日（11/17 説）も未確認。
9. **「qualified」視聴時間の定義**（2027-02-01 以降）— [Help 12843009](https://support.google.com/youtube/answer/12843009?hl=en) 本文未取得。
10. **2026年7月の明確化の Help 原文** — 報道3社で裏付けあり、Help 本文は未取得。
11. **記憶ベースの一次資料**（Lost in the Middle、InstructGPT、Chinchilla、TPU 論文、Attention 論文、NRI 2015、TIME 2023、Hinton 2016 動画、OpenAI 取締役会声明、Huang/Gelsinger 発言）— URL は正規のはずだが本セッション未フェッチ。台本化前に原典を開く。
12. **日本語 YouTube の競合実測** — 全34本で未実施。各候補の検索文字列はノート `evergreen_topics.md` に記載。10万再生超の有無・タイトル・URL を実機で確認し、「競合の空き」を再採点する。
13. **Noto Sans（Latin）・Inter・Shippori Mincho・LINE Seed のライセンス** — 未確認。BIZ UDPGothic、Noto Sans CJK、M PLUS、Zen Kaku Gothic は OFL 確認済。
14. **Epidemic Sound／Artlist／YouTube オーディオライブラリ／Suno／Flow Music／Lyria の商用規約と価格** — すべて未確認または不一致。
15. **チャンネル名候補の商標・ハンドル空き** — 未確認。
16. **海外チャンネルの形式特徴（カット頻度、話速、サムネ規則）** — 出典なし。直近3本を見て検証。
17. **Veo の日本語文字描画が不安定** — 出典なし（経験則）。
18. **制作時間の見積もり（20〜35 時間/本）と話速（280〜320字/分）、字幕サイズ（56〜72px）** — 調査者の推定。最初の2本で実測して更新。

---

## 11. 判断を仰ぎたい点

1. **3チャンネル体制を本当に維持するか。** リポジトリの公開物は1分パイロット2本と考える夜の長尺1本です。新チャンネルを「成長の主戦場」にするなら、考える夜かウラトリのどちらかを月1本以下に落とす必要があります。どれを主にしますか。
2. **ウラトリの AI ネタの移管ルール（「本当か」＝ウラトリ、「なぜ／どうやって」＝新）で合意できるか。** 「はい、その通りです」と「SNS のおすすめ」を新チャンネルへ移し、電力・水・仕事はウラトリに残す案です。
3. **英語への投資の線引き。** ローンチは「.srt＋翻訳メタデータ＋自動吹替レビュー」の最低構成で、英語音声トラックは「英語視聴者比率が 10% を超えた回」だけに限定する案です。最初から全回に英語音声を付けますか（1本あたり +1〜2 時間）。
4. **チャンネル名。** 推奨は「カラクリ／Karakuri」。商標・ハンドルの確認後に決めてよいか、それとも別案を優先するか。
5. **2027-02-01 の収益化基準を「間に合わない」前提で受け入れるか。** 間に合わせるには 11〜1月に月4本以上が必要で、品質とトンマナの確立を犠牲にします。推奨は「間に合わせない」。

---

## 参考 URL 一覧

**日本市場**
- tri-as AI 系 YouTuber ランキング: https://influencer.tri-as.co.jp/youtube/ai.html
- digitalcreators KEITO: https://digitalcreators.jp/channel/ja/UCfapRkagDtoQEkGeyD3uERQ
- PLAYBOARD いまにゅ: https://playboard.co/en/channel/UC0xRMqPOyRNPTaL6BxhbCnQ
- PR TIMES KEITO 研修: https://prtimes.jp/main/html/rd/p/000000333.000076777.html
- note 収益公開（3.65万人）: https://note.com/aaafrog/n/n3072e54da9e6
- yutura 3Blue1BrownJapan: https://yutura.net/channel/69070/
- note Kurzgesagt 日本語版: https://note.com/dogresiduewp/n/ndb11c2c0072e?hl=en ／ ココログ: https://tan8472.cocolog-nifty.com/blog/2024/05/post-ec91ef.html
- yutura ゆっくりで叡智を学ぶ!: https://yutura.net/channel/75362/chart/ ／ vidIQ しまむらいだー: https://vidiq.com/youtube-stats/channel/UCPbiAq3YHoePafGTMzvrTKQ
- ずんだもん AI ニュース速報プレイリスト: https://www.youtube.com/playlist?list=PLzw6aIVQ4jTc0EbB7oGYuNqtASo8mTMjt ／ rakkoma チャンネル売買: https://rakkoma.com/project/detail/13511
- 総務省 令和7年版: https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r07/html/nd112210.html
- 総務省 令和8年版 概要: https://www.soumu.go.jp/main_content/001082851.pdf ／ 本文: https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r08/pdf/n1110000.pdf ／ 企業利用: https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r08/html/nd121130.html
- aiteller 年代別: https://aiteller.jp/blog/ai-fukyu-data-hub ／ innovatopia: https://innovatopia.jp/ai/ai-news/114300/
- ITmedia 帝国データバンク 2026: https://www.itmedia.co.jp/news/article/2605/15/1260515115/
- xcuu タイトルの付け方: https://xcuu.jp/column/youtube-title/ ／ crogo パワーワード: https://crogo.jp/sns_mktg/50-recommended-youtube-title-words
- InVideo（量産16ch停止）: https://invideo.io/blog/youtube-kills-ai-faceless-channels/
- Livedoor Inaka Guys: https://news.livedoor.com/article/detail/31890952/

**海外チャンネル（第三者集計）**
- vidIQ 3Blue1Brown: https://vidiq.com/youtube-stats/channel/@3blue1brown/ ／ Social Blade: https://socialblade.com/youtube/handle/3blue1brown/videos
- SponsorRadar Welch Labs: https://sponsorradar.com/channels/welchlabsvideo
- CreatorDB Branch Education: https://creatordb.app/creatorstats/brancheducation/
- socialcounts Animagraffs: https://socialcounts.org/youtube-live-subscriber-count/UCnZeeKO8qVdtkrA4-uKhtTw
- aifreeforever Kurzgesagt: https://aifreeforever.com/chart/youtube/top-education-channels ／ TheTVDB AI Slop 回: https://thetvdb.com/series/kurzgesagt-in-a-nutshell/episodes/11383775
- CreatorDB ColdFusion: https://creatordb.app/creatorstats/coldfusion/
- SpeakRJ AI Explained: https://www.speakrj.com/audit/report/UCNJ1Ymd5yFuUPtn21xtRbbw/youtube
- Developer Educators Karpathy: https://developereducators.com/channel/andrejkarpathy/
- CreatorDB Matt Wolfe: https://creatordb.app/creatorstats/mreflow/ ／ Social Blade AI Daily Brief: https://socialblade.com/youtube/handle/aidailybrief ／ vidIQ bycloud: https://vidiq.com/youtube-stats/channel/@bycloudai/
- AIR 成長ジャンル: https://air.io/en/audience-growth/whos-growing-fastest-on-youtube-and-which-niches-are-hot-in-2025
- Two Minute Papers 批判: https://scribe.disroot.org/post/68923/226435
- Manifold 3B1B GPT 回再生数: https://manifold.markets/Ziddletwix/how-many-views-will-3blue1browns-bu ／ rosetta.to Veritasium: https://rosetta.to/u/veritasium/2025

**プラットフォーム規約**
- YPP 概要: https://support.google.com/youtube/answer/72851?hl=en&co=GENIE.Platform%3DAndroid ／ 2027 変更: https://support.google.com/youtube/answer/12843009?hl=en ／ YouTube Blog: https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/
- 収益化ポリシー（inauthentic content）: https://support.google.com/youtube/answer/1311392?hl=en ／ TechCrunch 2026-07-20: https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/
- 合成コンテンツ開示: https://support.google.com/youtube/answer/14328491?hl=en ／ ラベルの理解: https://support.google.com/youtube/answer/15447836?hl=en
- 多言語機能: https://support.google.com/youtube/answer/13338784?hl=en ／ TechCrunch 2025-09-10: https://techcrunch.com/2025/09/10/youtubes-multi-language-audio-feature-for-dubbing-videos-rolls-out-to-all-creators/ ／ Impress 2023: https://www.watch.impress.co.jp/docs/news/1481178.html ／ Storyboard18: https://storyboard18.com/how-it-works/youtube-rolls-out-multi-language-audio-feature-bringing-video-dubbing-to-all-creators-80746.htm
- 自動吹替: https://support.google.com/youtube/answer/15569972?hl=en ／ YouTube Japan Blog: https://blog.youtube/intl/ja-jp/news-and-events/auto-dubbing-on-youtube/
- 言語・位置設定: https://support.google.com/youtube/answer/87604 ／ 自動字幕: https://support.google.com/youtube/answer/6373554/use-automatic-captioning
- YouTube Creator Blog 2015 TED: https://youtubecreator-uk.googleblog.com/2015/11/ ／ AIR 翻訳: https://air.io/en/audience-growth/7-steps-to-get-100000-views-on-a-translated-youtube-video-in-2026 ／ https://air.io/en/youtube-hacks/how-to-localize-and-translate-youtube-metadata
- Shorts: https://air.io/en/audience-growth/do-youtube-shorts-help-your-long-form-videos-grow-data-from-18000-channels ／ https://metricool.com/youtube-trends/ ／ https://air.io/en/air-data-findings/youtube-shorts-rpm-vs-long-form-how-much-do-shorts-earn-in-2026
- RPM: https://dynamoi.com/data/youtube-adsense-rpm/jp ／ https://upgrowth.in/youtube-cpm-overview-highest-paying-niches/

**ツールチェーン**
- Remotion LICENSE: https://raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md ／ FAQ: https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/license/faq.mdx ／ 5.0 migration: https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/5-0-migration.mdx ／ releases: https://github.com/remotion-dev/remotion/releases
- @remotion/captions parseSrt: https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/captions/parse-srt.mdx ／ @remotion/three: https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/three.mdx ／ Lambda cost: https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/lambda/cost-example.mdx ／ MCP 非推奨: https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/ai/mcp.mdx ／ Agent Skills: https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/docs/ai/skills.mdx
- Gemini TTS cookbook: https://raw.githubusercontent.com/google-gemini/cookbook/main/quickstarts/Get_started_TTS.ipynb ／ Voices: https://raw.githubusercontent.com/google-gemini/cookbook/main/quickstarts/Get_Started_Voices.ipynb ／ Cloud TTS pricing: https://cloud.google.com/text-to-speech/pricing ／ Gemini API terms（未読）: https://ai.google.dev/gemini-api/terms
- Blender 5.2: https://raw.githubusercontent.com/blender/blender/blender-v5.2-release/source/blender/blenkernel/BKE_blender_version.h ／ Blender MCP: https://raw.githubusercontent.com/ahujasid/blender-mcp/main/README.md
- Manim: https://raw.githubusercontent.com/3b1b/manim/master/LICENSE.md ／ https://raw.githubusercontent.com/ManimCommunity/manim/main/LICENSE ／ 色: https://raw.githubusercontent.com/ManimCommunity/manim/main/manim/utils/color/manim_colors.py ／ 3b1b 設定: https://raw.githubusercontent.com/3b1b/manim/master/manimlib/default_config.yml
- フォント OFL: https://raw.githubusercontent.com/googlefonts/morisawa-biz-ud-gothic/main/OFL.txt ／ https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/LICENSE ／ https://raw.githubusercontent.com/coz-m/MPLUS_FONTS/master/OFL.txt ／ https://raw.githubusercontent.com/googlefonts/zen-kakugothic/main/OFL.txt
- 音楽: https://www.epidemicsound.com/commercial-subscription/ ／ https://earnifyhub.com/blog/epidemic-sound-vs-artlist ／ Veo: https://benchlm.ai/media-pricing/veo

**トンマナ**
- Better Images of AI: https://blog.betterimagesofai.org/wp-content/uploads/2023/02/Better-Images-of-AI-Guide-Feb-23.pdf ／ https://betterimagesofai.org
- 字幕ガイド: https://0120.co.jp/blog/video-125/ ／ ratfactor 可読性: https://www.ratfactor.com/typography
- サムネ: https://unseen-japan.com/konmari-western-vs-japanese-marketing/ ／ https://soranews24.com/2020/10/27/konmaris-youtube-reveals-interesting-fact-about-japanese-vs-non-japanese-online-preferences/amp/
- 音楽の手本: https://kottke.org/18/01/the-soundtrack-to-kurzgesagt ／ https://vincerubinetti.bandcamp.com
- AI 声の受容: https://news.radio-online.com/articles/n49138/Study-Listeners-Struggle-to-Spot-AI-Voiceovers ／ https://ink.library.smu.edu.sg/lkcsb_research/7427

**ネタの一次資料・二次資料**（第8節の番号順）
- #1: https://dylancastillo.co/til/counting-tokens.html ／ https://jangwook.net/en/blog/en/multilingual-llm-token-tax-experiment/ ／ https://arxiv.org/abs/2305.15425
- #2: https://openai.com/index/why-language-models-hallucinate/
- #3: https://www.airc.aist.go.jp/aitec-icot/ICOT/Museum/FinalReport/node3.html ／ https://www.csmonitor.com/1986/0917/ocalc.html
- #4: https://en.wikipedia.org/wiki/AlexNet ／ https://jpn.nec.com/press/202110/20211012_01.html
- #5: https://arxiv.org/abs/2502.17424 ／ https://www.quantamagazine.org/the-ai-was-fed-sloppy-code-it-turned-into-something-evil-20250813/
- #6: https://papers.ssrn.com/abstract=4441311 ／ https://dspace.mit.edu/handle/1721.1/153986
- #7: https://www.anthropic.com/research/golden-gate-claude
- #8: https://newrepublic.com/article/187203/ai-radiology-geoffrey-hinton-nobel-prediction
- #9: https://www.asml.com/en/technology/lithography-principles/euv-lithography
- #10: https://tomsguide.com/ai/claude-ai-has-been-continously-playing-pokemon-red-for-over-a-month-it-still-cant-beat-it ／ https://www.anthropic.com/claude-sonnet-5-5
- #11: https://arxiv.org/abs/2203.02155
- #12: https://arxiv.org/abs/2307.03172
- #13: https://i-programmer.info/news/105-artificial-intelligence/13545-alpha-go-documentary-now-on-youtube.html
- #14: https://www.pure.ed.ac.uk/ws/portalfiles/portal/460496122/ShumailovEtalNature2024AIModelsCollapseWhen.pdf ／ https://www.natureasia.com/ja-jp/nature/pr-highlights/14983
- #15: https://blogs.cisco.com/ai/understanding-and-mitigating-unicode-tag-prompt-injection
- #16: https://en.wikipedia.org/wiki/Attention_Is_All_You_Need ／ https://www.silicon.co.uk/e-innovation/artificial-intelligence/google-ai-sakana-525959
- #17: https://www.newsweek.com/undersea-cables-transport-99-percent-international-communications-319072
- #18: https://arxiv.org/abs/1704.04760
- #19: https://arxiv.org/abs/2406.07016
- #20: https://inverse.com/article/50434-tesla-elon-musk-doubles-down-on-full-self-driving-for-next-year
- #21: https://arxiv.org/abs/2203.15556 ／ https://arxiv.org/html/2509.23963v1
- #22: https://www.nedo.go.jp/content/100977001.pdf ／ https://news.bloomberglaw.com/esg/judge-blesses-1-5-billion-anthropic-copyright-deal-with-authors
- #23: https://techcrunch.com/2026/09/29/openai-launches-gpt-6-1-sol-says-it-nearly-matches-gpt-6-astra-and-costs-less/ ／ https://www.anthropic.com/claude-opus-5-5
- #24: https://arxiv.org/abs/1706.03762
- #26: https://www.technologyreview.com/2025/03/05/1112819/ai-reasoning-models-can-cheat-to-win-chess-games/ ／ https://www.cnbc.com/2026/10/21/openai-ai-models-safety-monitoring.html
- #27: https://www.iea.org/news/ai-is-set-to-drive-surging-electricity-demand-from-data-centres-while-offering-the-potential-to-transform-how-the-energy-sector-works ／ 水: https://www.africa-press.net/mauritius/all-news/google-data-centers-used-nearly-6b-gallons-of-water-in-2024 ／ https://www.axios.com/2026/06/03/google-pushes-water-standards-data-center-backlash
- #28: https://www.nri.com/jp/news/2015/151202_1.html
- #29: https://arxiv.org/abs/2412.19437
- #33: https://www.trendforce.com/news/2025/09/17/news-hbm-market-heats-up-as-three-giants-clash-with-hbm4-at-the-center/ ／ https://www.ajinomoto.co.jp/company/jp/rd/our_innovation/abf/

**週次の情報源（運用用、URL は一部未検証）**
- Anthropic Announcements: https://www.anthropic.com/news/announcements ／ OpenAI Model Release Notes: https://help.openai.com/en/articles/9624314-model-release-notes ／ Gemini changelog: https://ai.google.dev/gemini-api/docs/changelog
- Import AI: https://importai.substack.com ／ Interconnects: https://www.interconnects.ai ／ Zvi: https://thezvi.substack.com ／ Hacker News: https://news.ycombinator.com ／ r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA ／ Simon Willison: https://simonwillison.net
- 内閣府 AI 戦略: https://www8.cao.go.jp/cstp/ai/index.html ／ ITmedia AI+: https://www.itmedia.co.jp/aiplus/ ／ GIGAZINE: https://gigazine.net ／ 週刊AIのニュース: https://ainoarukurashi.com/weekly-news
