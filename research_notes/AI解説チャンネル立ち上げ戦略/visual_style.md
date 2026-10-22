# Visual style (トンマナ), motion, typography, sound and voice references for a calm JP/EN AI explainer channel (as of 2026-10-22)

Research note on method and limits: the web-search budget for this session ran out part-way through (after ~35 searches), and the fetch proxy blocked most non-GitHub hosts (support.google.com, betterimagesofai.org, ig.ft.com, 3blue1brown.com, air.io, Japanese blogs). Primary documents that were fully read: Manim Community colour source, 3b1b manim default config, Manim Community default config, and four font licence files on GitHub. Everything else below comes from search-result summaries/snippets of the linked pages, and is marked accordingly. Where a number is my estimate (not in a source) it is labelled **(estimate)**. Items I could not source at all are in Gaps, not in findings.

---

## KQ1. Explainer animation styles, representative channels, and their conventions (palette / typography / pacing / narration vs text / how they draw AI)

### Takeaway
There are five proven "calm learning" visual languages: (a) flat-vector character/world (Kurzgesagt), (b) programmatic diagram animation on a dark grey field (3Blue1Brown / Welch Labs via Manim), (c) photoreal 3D cutaway (Branch Education, Blender), (d) editorial collage/map motion cut to voice-over (Vox, Johnny Harris), and (e) dense meme/terminal fast-cut (Fireship, which is the opposite of calm). Of these, only (b) has a fully published, copyable spec (hex palette, 1920x1080, #333333 background, Consolas/white text); for the others, only tooling and workflow facts are publicly documented, and cuts-per-minute figures are not published anywhere I could find.

### Cited Findings

**Flat vector: Kurzgesagt (Munich)**
- Signature style described as "rounded shapes and vibrant colors", "rich use of color and boldness", produced by a stacked team of art directors, illustrators and producers rather than one artist — [Arts at Michigan, "Simple, Bright, Beautiful: The Work of Kurzgesagt"](https://artsatmichigan.umich.edu/ink/2019/09/27/simple-bright-beautiful-the-work-of-kurzgesagt)
- Tooling: illustration in Adobe Illustrator, animation in After Effects (one founder illustrates, the other animates), citing an Adobe article; "bright color palettes, and lively, stylized design" — [Toolfarm](https://www.toolfarm.com/?p=77543)
- Workflow scale from the channel's own "how to make a Kurzgesagt video" transcript: roughly 200 panels drawn in Illustrator, most drawn from scratch; 2–3 illustrators spend 8–12 weeks illustrating; 2–3 animators animate for about 8–10 weeks; "every single thing that's moving on-screen has been moved manually" apart from a few plugins; team has begun experimenting with Cinema 4D — [LingQ transcript of the Kurzgesagt video](https://www.lingq.com/it/imparare-inglese/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/)
- Music/sound: all Kurzgesagt music is by Epic Mountain, a Munich music + sound-design company; tracks are composed exclusively for Kurzgesagt — [kottke.org](https://kottke.org/18/01/the-soundtrack-to-kurzgesagt); numbered Kurzgesagt soundtrack volumes on [Epic Mountain Bandcamp](https://epicmountainmusic.bandcamp.com/)

**Mathematical / diagram animation: 3Blue1Brown and Welch Labs (Manim)**
- Grant Sanderson animates with his own open-source Python library manim; channel has 6M+ subscribers (2024) — [Simon Willison](https://simonwillison.net/2024/Apr/11/3blue1brown/)
- 3b1b's own manim defaults (the look of the actual videos): `background_color: "#333333"`, `resolution: (1920, 1080)`, `fps: 30`, `font: "Consolas"` for text, `default_mobject_color: "#FFFFFF"` — [3b1b/manim default_config.yml (GitHub)](https://raw.githubusercontent.com/3b1b/manim/master/manimlib/default_config.yml)
- Manim Community edition defaults differ: `background_color = BLACK`, 1920x1080, `frame_rate = 60` — [ManimCommunity default.cfg (GitHub)](https://raw.githubusercontent.com/ManimCommunity/manim/main/manim/_config/default.cfg)
- The full Manim palette (identical lineage to 3b1b's) with hex values — [ManimCommunity manim_colors.py (GitHub)](https://raw.githubusercontent.com/ManimCommunity/manim/main/manim/utils/color/manim_colors.py); documented at [docs.manim.community](https://docs.manim.community/en/stable/reference/manim.utils.color.html):
  - BLUE_A #C7E9F1, BLUE_B #9CDCEB, BLUE_C/BLUE #58C4DD, BLUE_D #29ABCA, BLUE_E/DARK_BLUE #236B8E
  - TEAL_A #ACEAD7, TEAL_B #76DDC0, TEAL_C/TEAL #5CD0B3, TEAL_D #55C1A7, TEAL_E #49A88F
  - GREEN_A #C9E2AE, GREEN_B #A6CF8C, GREEN_C/GREEN #83C167, GREEN_D #77B05D, GREEN_E #699C52
  - YELLOW_A #FFF1B6, YELLOW_B #FFEA94, YELLOW_C/YELLOW #F7D96F, YELLOW_D #F4D345, YELLOW_E #E8C11C
  - GOLD_A #F7C797, GOLD_B #F9B775, GOLD_C/GOLD #F0AC5F, GOLD_D #E1A158, GOLD_E #C78D46
  - RED_A #F7A1A3, RED_B #FF8080, RED_C/RED #FC6255, RED_D #E65A4C, RED_E #CF5044
  - MAROON_A #ECABC1, MAROON_B #EC92AB, MAROON_C/MAROON #C55F73, MAROON_D #A24D61, MAROON_E #94424F
  - PURPLE_A #CAA3E8, PURPLE_B #B189C6, PURPLE_C/PURPLE #9A72AC, PURPLE_D #715582, PURPLE_E #644172
  - PINK #D147BD, LIGHT_PINK #DC75CD, ORANGE #FF862F, LIGHT_BROWN #CD853F, DARK_BROWN #8B4513, GRAY_BROWN #736357
  - Greys: GRAY_A #DDDDDD, GRAY_B #BBBBBB, GRAY_C #888888, GRAY_D #444444, GRAY_E #222222; WHITE #FFFFFF, BLACK #000000
  - Logo colours: LOGO_WHITE #ECE7E2, LOGO_GREEN #87C2A5, LOGO_BLUE #525893, LOGO_RED #E07A5F, LOGO_BLACK #343434
- Welch Labs (Stephen Welch) adopted manim in late 2024: Sanderson recorded a call "with Stephen Welch helping him to get started using the library" while Welch was beginning his Schrödinger-equation video — [3Blue1Brown members post, Nov 2024](https://members.3blue1brown.com/posts/manim-session-116778481?l=en-GB)
- 3b1b's 2024 "Attention in transformers, visually explained" was called "by far the clearest explanation of the topic I've seen anywhere"; core framing: a transformer's whole job is to update embeddings until the last vector knows enough to predict the next token — [Simon Willison](https://simonwillison.net/2024/Apr/11/3blue1brown/); the companion talk "Visualizing transformers and attention" (TNG Big Tech Day '24, published 2024-11-20) — [3blue1brown.com/lessons/transformers-talk](https://www.3blue1brown.com/lessons/transformers-talk)
- Music: Vincent Rubinetti "writes original music for the YouTube math educational channel 3Blue1Brown" — [Harmony of Shinesparkers bio](https://harmony.shinesparkers.net/staff/vincent-rubinetti/); album "The Music of 3Blue1Brown" — [Bandcamp](https://vincerubinetti.bandcamp.com)

**3D cutaway: Branch Education**
- Founder Teddy (Theodore J.) Tablante, ex-semiconductor engineer ("8 years as an electrical and mechanical engineer on subsystems in machines that make microchips... I decided to learn Blender"); a smartphone-camera explainer was "animated entirely using 6 main scenes in Blender" — [BlenderNation, Tablante's own post](https://www.blendernation.com/2018/10/23/how-does-a-smartphone-camera-work-the-science-behind-digital-cameras/)
- Each video uses "painstakingly detailed rendered models that often take months to complete", Patreon-funded — [CreatorDB profile (secondary)](https://creatordb.app/creatorstats/brancheducation/); "branched" structure exploring subcomponents of broader systems — [Born to Engineer](https://www.borntoengineer.com/?p=25382)

**Editorial collage / maps: Vox and Johnny Harris**
- Harris' map workflow videos ("How I Make My Maps (My workflow, 8 years in the making)") and Patreon with a vector world map + monthly director's commentary — [ProVideo Coalition](https://www.provideocoalition.com/aep-roundup-june2021/amp/)
- Style: "motion graphics are blended with cinematic videography"; a film-era look with physical props and manual camera moves rather than typical AE animation — [aescripts](https://aescripts.com/learn/how-johnny-harris-makes-maps/); [RNDR newsletter](https://rndr.beehiiv.com/p/5-visuals-next-video-ead0)
- Editing pattern as specified by a client hiring for the look: voice-over driven, B-roll/archival/news footage/maps/simple text callouts cut to narration, and dropping in 3–5 seconds of footage with its own natural sound after a line — [Upwork job post (secondary)](https://www.upwork.com/freelance-jobs/apply/Long-Term-Video-Editor-Premium-Documentary-Visual-Journalism-Vox-Johnny-Harris-Aesthetic_~022071695908697374205/)
- Map tool often used for this look: MapTiler GEOlayers (colours, line width, fonts, hillshading, feature groups) — [ProVideo Coalition](https://www.provideocoalition.com/aep-roundup-june2021/amp/)

**Code/terminal fast-cut: Fireship**
- Fireship hires freelance editors for "high-energy, tutorial-style" faceless videos; tools Premiere Pro, After Effects, Illustrator, Photoshop; "keyframe animation for 'faceless' video content" — [Electrify Video Partners job post for Fireship](https://electrify.teamtailor.com/jobs/8005761-video-editor-freelancer-fireship)
- Third-party style analysis: "entertaining them first", "the videos feel fast because they ARE fast, not because they were sped up in post", high meme density, "if a frame doesn't entertain, teach, or transition — cut it" — [skills.sh fireship-video-style (unofficial)](https://skills.sh/jarmen423/skills/fireship-video-style); ingredients listed as deep technical knowledge, storytelling, visuals, humour/memes, dense delivery — [wisp.blog](https://www.wisp.blog/blog/how-to-create-video-content-like-fireship-hyperplexed-and-juxtoposed)

### Inferences
- For a *calm, learning-oriented* channel, the 3b1b/Welch Labs model is the most practical reference because its entire spec is open: #333333 (not pure black) background, white text, one accent hue per concept drawn from the A–E ramps above, 1080p30. A JP channel could adopt the Manim ramps directly (e.g. BLUE_C #58C4DD for "input/data", YELLOW_C #F7D96F for "highlight/attention", RED_C #FC6255 for "error/loss", GREEN_C #83C167 for "correct/output") and keep the same semantic mapping across every video.
- Kurzgesagt's style is the most expensive to copy (hundreds of hand-drawn panels, 16–22 person-weeks per video per the transcript) and is strongly identified with one brand; imitating it reads as derivative. Its usable lesson is *consistency*: one world, one character set, one palette, music composed to picture.
- Branch Education shows that photoreal 3D is viable for chips/data-centres specifically (the physical side of AI), but the months-per-video cost means a small channel should use it only for a few hero shots (e.g. a GPU die, a rack) and keep the rest diagrammatic.
- Johnny Harris / Vox conventions (B-roll beat of 3–5 s with nat-sound, text callouts cut to narration) are a good *rhythm* reference for the news-adjacent parts of an AI channel (company announcements, policy), while the 3b1b style suits the "how it works" parts.
- Fireship is the explicit anti-pattern for "calm": its appeal is density and jokes; nothing in it should be copied except its respect for the viewer's time.
- Cuts-per-minute: no channel publishes this. **(estimate)** From the sources' descriptions, Kurzgesagt and 3b1b hold shots for whole sentences (continuous animation rather than cuts), Vox/Harris change picture every 3–8 s, Fireship every 1–3 s. Treat these as hypotheses to measure on 3 sample videos each before adopting.

### Gaps
- No published hex palette for Kurzgesagt, Vox, Johnny Harris, Polymatter, Wendover, Branch Education, Posy or Animagraffs (search budget ended before Polymatter/Wendover/Posy/Animagraffs were searched; nothing on them is cited here).
- No source gave measured cuts-per-minute or words-per-minute for any named channel.
- Japanese editorial references (NHK「2030 未来への分岐点」, 日経 Visual Data / 解説動画, NewsPicks) could not be searched before the budget ran out; no findings.
- The Adobe article on Kurzgesagt's Illustrator/AE workflow referenced by Toolfarm was not located directly.
- Could not fetch 3blue1brown.com/faq to confirm Rubinetti's music licensing terms for third parties.

---

## KQ2. Rendering abstract AI concepts without clichés

### Takeaway
The best-documented anti-cliché framework is Better Images of AI (BBC R&D / Ada Lovelace Institute lineage): avoid glowing brains, humanoid robots, blue backgrounds, anthropomorphism, and instead show the actual task, the data, and the people. The concrete non-cliché metaphors that work in video are the ones 3Blue1Brown and the FT used: tokens as discrete chips of text, embeddings as arrows/points in a space, attention as a weighted grid between words, and prediction as a probability list over next words.

### Cited Findings
- Better Images of AI guide lists elements to avoid: glowing brains, humanoid robots, blue backgrounds, anthropomorphism; proposes four selection criteria — honesty, humanity, necessity, specificity — [Better Images of AI Guide (PDF, Feb 2023)](https://blog.betterimagesofai.org/wp-content/uploads/2023/02/Better-Images-of-AI-Guide-Feb-23.pdf); project home and free image library — [betterimagesofai.org](https://betterimagesofai.org); original BBC R&D post by Tristan Ferne, Henry Cooke, David Man — [blog.betterimagesofai.org 2021/09](https://blog.betterimagesofai.org/2021/09/)
- Why it matters: brain/robot imagery makes AI seem magical or autonomous and obscures human decision-making; the brain trope implies human-like intelligence most deployed AI lacks — [LSE Research Online, "We need better AI imagery"](https://researchonline.lse.ac.uk/id/eprint/115831); [Wageningen University, "How to depict artificial intelligence?"](https://wur.nl/en/newsarticle/how-to-depict-artificial-intelligence.htm)
- Process-specific alternatives: show the actual task — people annotating data for labelling; heatmaps and predicted-vs-actual comparisons for image recognition; depict the teams, annotators and domain experts who build systems — [Wageningen University](https://wur.nl/en/newsarticle/how-to-depict-artificial-intelligence.htm)
- Even "beyond the robot" AI-generated imagery tends to fall back into clichés (augmented humans, head-with-gears) — [Jakob Nielsen, "AI Visualizing AI"](https://jakobnielsenphd.substack.com/p/ai-visualizing-ai); "sadly robotic metaphors" critique — [CogDogBlog](https://cogdogblog.com/2023/12/sadly-robotic-metaphors/)
- 3Blue1Brown's transformer framing: the model's job is to update embeddings until the last vector can predict the next token; attention explained with hand-built manim animations — [Simon Willison](https://simonwillison.net/2024/Apr/11/3blue1brown/)
- FT Visual Storytelling Team + Madhumita Murgia, "Generative AI exists because of the transformer" (2023): an open-access scrollytelling explainer that "tries to get to the heart of a large language model", covering how LLMs work, where they fail (hallucination as predicting likely next words rather than looking up facts), and why transformers handle a whole sequence at once — [ig.ft.com/generative-ai](https://ig.ft.com/generative-ai/) (page not fetchable; described via [annmichaelsen.com](https://annmichaelsen.com/2023/09/22/topic-for-discussion-generative-ai-exists-because-of-the-transformer/), [Phani's Product substack](https://phanisproduct.substack.com/p/gen-ai-explained), [downes.ca](https://downes.ca/post/75594))
- Branch Education demonstrates the physical-hardware route: chips, GPUs, CPUs made legible through detailed 3D models — [CreatorDB](https://creatordb.app/creatorstats/brancheducation/)

### Inferences
- A copyable "metaphor table" built from the above (sources establish the approach; the specific pairings are my synthesis):
  - Token → a word/sub-word fragment shown as a discrete tile (FT/3b1b approach of operating on visible text, not on a brain).
  - Embedding → an arrow or dot in a 2D/3D coordinate space; semantic similarity = nearby points (3b1b).
  - Attention → a word-by-word grid/matrix with cell brightness = weight, or lines between words whose thickness = weight (3b1b's attention-pattern depiction).
  - Next-token prediction → a ranked bar list of candidate words with probabilities; hallucination → the same list where a plausible-but-wrong word wins (FT's framing).
  - Training → loss as a curve going down + weights as dials nudged by gradient (3b1b neural-network series).
  - Data centre / compute → real rack, real GPU die cutaway (Branch Education), not blue circuit-board stock.
  - "AI company" / "model release" → logo + date + diff of capabilities (editorial), not a robot.
- Blunt list of clichés to ban in both markets (sourced from Better Images of AI; the Japanese-market additions are my inference): glowing brain, humanoid robot, blue circuit board, binary-rain/Matrix code, "handshake with a robot hand", head-with-gears; in Japan additionally the ゆっくり/VOICEVOX-style anime avatars + yellow 【衝撃】 banners and "AIが人類を超える" doom thumbnails, which signal low-effort まとめ content rather than learning.

### Gaps
- Could not read the Better Images of AI PDF or FT page directly; details come from search summaries.
- No findings on Anthropic / OpenAI / Google DeepMind official explainer-video visual style, nor on NYT / Reuters Graphics AI explainers (search budget exhausted before those queries ran).

---

## KQ3. Typography for Japanese narration with English subtitles

### Takeaway
Japanese practitioner guidance converges on bold gothic (sans) for burned-in テロップ, max ~13 full-width characters per line, max 2 lines, ~4 characters/second display speed (Netflix JP guide as cited), and WCAG 4.5:1 contrast; the OFL fonts (Noto Sans JP/CJK, BIZ UDPGothic, M PLUS, Zen Kaku Gothic) are verified free for commercial video. No source gave a validated px size for 1080p/mobile, and Morisawa Fonts / Fontworks LETS video terms could not be confirmed from official pages.

### Cited Findings

**Layout rules (JP)**
- Horizontal テロップ: ≤13 full-width characters per line, max 2 lines; display speed ≤4 characters/second, citing the Netflix Japanese subtitle style guide; text/background contrast ≥4.5:1 per WCAG 2.1 — [0120.co.jp video-125](https://0120.co.jp/blog/video-125/)
- Canva's auto-caption guide figure "4秒10文字" as a pacing baseline — [0120.co.jp video-125](https://0120.co.jp/blog/video-125/)
- "一般的には、太めのゴシック系が読みやすい"; use decorative fonts only for emphasis — [Filmora subtitle font guide](https://filmora.wondershare.jp/youtube-video-editing/subtitle-font.html); [PC工房 magazine on Premiere テロップ](https://www.pc-koubou.jp/magazine/50937)
- University of Tsukuba thesis on subtitle line count / characters per line: no single design was preferred by all participants; preferences vary individually — [klis.tsukuba.ac.jp thesis PDF](https://klis.tsukuba.ac.jp/current-students/pdf/thesis/2015/s1413122-20151225140407A.pdf)
- Adjusting particles and sentence endings and balancing 漢字/ひらがな/カタカナ improves readability at the same character count — [0120.co.jp video-125](https://0120.co.jp/blog/video-125/)

**Font candidates named by JP guides**
- Noto Sans CJK Bold recommended for Shorts where readability is the priority; 源ノ角ゴシック / TGS ゴシック for strong titles; 装甲明朝 (free mincho, ~7,000 kanji, commercial OK) for serif accents; ラノベPOP / たぬき油性マジック as decorative only — [Filmora impactful-font guide](https://filmora.wondershare.jp/youtube-video-editing/impactful-font-for-youtube.html); [Filmora EN/JP free fonts](https://filmora.wondershare.jp/video-editing-tips/english-japanese-free-fonts.html); [0120.co.jp video-82](https://0120.co.jp/blog/video-82/)
- "無料配布 = 商用OK とは限らない"; burning text into video is usually fine but redistributing the font file is usually prohibited — [0120.co.jp video-82](https://0120.co.jp/blog/video-82/)

**Licences verified from the licence files (all SIL OFL 1.1: use/embed/modify/redistribute free of charge, documents made with the font are not subject to the licence, cannot sell the font alone, reserved font names)**
- BIZ UDGothic / UDPGothic: "Copyright 2022 The BIZ UDGothic Project Authors", OFL 1.1 — [googlefonts/morisawa-biz-ud-gothic OFL.txt](https://raw.githubusercontent.com/googlefonts/morisawa-biz-ud-gothic/main/OFL.txt); BIZ UDPGothic is also on Adobe Fonts (Morisawa foundry) — [fonts.adobe.com/fonts/biz-udpgothic](https://fonts.adobe.com/fonts/biz-udpgothic)
- Noto Sans CJK (源ノ角ゴシック lineage): OFL 1.1 — [notofonts/noto-cjk Sans/LICENSE](https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/LICENSE)
- M PLUS: "Copyright 2021 The M+ FONTS Project Authors", OFL 1.1 — [coz-m/MPLUS_FONTS OFL.txt](https://raw.githubusercontent.com/coz-m/MPLUS_FONTS/master/OFL.txt)
- Zen Kaku Gothic: "Copyright 2022 The Zen Kaku Gothic Project Authors", OFL 1.1 — [googlefonts/zen-kakugothic OFL.txt](https://raw.githubusercontent.com/googlefonts/zen-kakugothic/main/OFL.txt)

**Commercial JP foundries**
- Morisawa Fonts is a desktop-font subscription with 1,500+ typefaces; Web fonts added 2024-09-12 priced by PV (web-only, separate from video) — [Web担当者Forum](https://webtan.impress.co.jp/n/2024/08/02/47498); [Fashionsnap](https://www.fashionsnap.com/article/2022-12-03/morisawa-fonts/); desktop service page — [TypeSquare](https://typesquare.com/service/desktop)
- Morisawa Fonts was used for 77 typefaces in Vaundy's "Okitegami" MV (6M+ YouTube views by Jan 2023), showing video/YouTube use happens under the service, but the contract tier is not stated — [Spikes Asia / Love the Work](https://www.lovethework.com/work-awards/campaigns/vaundymorisawa-fonts-okitegami-font-specimen-music-video-1490507)
- Fontworks LETS: annual flat fee; no secondary-use fee for TV programme / CM テロップ, flips and games; described as "映像コンテンツの二次利用に際しての再許諾が不要な包括的な使用許諾"; apps/games need an extra option only for embedding font files (rasterised use is covered) — [CGWORLD](https://cgworld.jp/feature/201808-font.html); [Fontworks column](https://fontworks.co.jp/column/3140); [gamebiz](https://gamebiz.jp/news/298830); [窓の杜](https://forest.watch.impress.co.jp/docs/news/1301200.html)
- Publicly posted YouTube videos are commonly treated as commercial use for font-licence purposes — [Filmora font-site guide](https://filmora.wondershare.jp/youtube-video-editing/recommend-font-websites.html)

### Inferences
- Recommended stack for a calm bilingual channel (my recommendation; licence facts sourced above): **BIZ UDPGothic Bold** for Japanese captions (universal-design letterforms, OFL, free), **Noto Sans JP** as the fallback/body, and a Latin companion with similar x-height for English subtitles such as Noto Sans or Inter (Inter licence not verified here). Avoid mixing more than two families on screen.
- Bilingual layout (inference from the 13-char/2-line rule): burn in the Japanese line(s) as the primary テロップ (1–2 lines, ≤13 chars each) and deliver English as YouTube CC (uploaded .srt) rather than burning both, so that (a) the screen never carries 4 lines, (b) English viewers can turn it off/on, and (c) YouTube's auto-translate and multi-language metadata work. If English must be burned in (e.g. for Shorts/X reposts), place it as a single smaller line directly under the Japanese, at **(estimate)** 60–70% of the Japanese size, inside the lower 20% of the frame but above YouTube's player-control zone.
- Size **(estimate, no source)**: on a 1920x1080 canvas, JP テロップ at 56–72 px cap height with a 4–6 px dark stroke or a 60–70% opaque band reads on phones; English CC is sized by the YouTube player and needs no decision. Validate on a 6-inch phone at 50% screen width before locking.
- Morisawa Fonts (subscription) and Fontworks LETS are the safe commercial options if a non-OFL face is wanted; LETS's "no re-licensing for video secondary use" language is the clearest. Confirm in writing with the foundry before relying on it for monetised YouTube.

### Gaps
- No official Morisawa FAQ page on YouTube/video use was found; conclusions on Morisawa rest on service descriptions, not the EULA.
- LINE Seed JP and Shippori Mincho licences could not be verified (GitHub fetch 404 / not searched); LINE Seed is widely described as OFL but that is unconfirmed here.
- No source provided px/pt sizes for 1080p or vertical mobile; all size numbers above are estimates.
- No source on how channels that burn in two languages lay them out; the bilingual recommendations are inference.

---

## KQ4. Colour: palettes, dark vs light, accessibility

### Takeaway
The only published palette is Manim's (see KQ1, 50+ hex values, #333333 field for 3b1b). On dark vs light, the research base favours dark-on-light for reading speed/accuracy, with eye-strain claims for dark mode mostly anecdotal; for diagram-heavy video the pragmatic choice is a dark grey (not pure black) field like 3b1b's, with ≥4.5:1 contrast on all text.

### Cited Findings
- 3b1b field colour #333333 (3b1b manim) vs BLACK (Manim Community) — [3b1b default_config.yml](https://raw.githubusercontent.com/3b1b/manim/master/manimlib/default_config.yml); [ManimCommunity default.cfg](https://raw.githubusercontent.com/ManimCommunity/manim/main/manim/_config/default.cfg)
- Full Manim hex palette — [manim_colors.py](https://raw.githubusercontent.com/ManimCommunity/manim/main/manim/utils/color/manim_colors.py)
- Older lab work (Bauer & Cavonius 1980, cited second-hand): ~26% more accurate reading with dark characters on a light background; "most studies have shown that dark characters on a light background are superior... when the refresh rate is fairly high" — [LWN discussion](https://lwn.net/Articles/237036); counter-claim of a Düsseldorf proofreading study favouring light-on-dark, also second-hand — [xpt.sourceforge.net "Dark background is good for you"](https://xpt.sourceforge.net/techdocs/misc/ce01-DarkBackgroundIsGoodForYou/single/index.html)
- Several studies find people read dark-on-light faster; very bright text on a dark field can appear to "glow"/blur — [ratfactor.com web typography](https://www.ratfactor.com/typography)
- 2025 FH Oberösterreich thesis: no significant effect of ambient illumination on measured readability; dark surroundings showed slightly lower cognitive load, judged not meaningful — [pure.fh-ooe.at](https://pure.fh-ooe.at/en/studentTheses/auswirkungen-von-umgebungsbeleuchtung-auf-die-lesbarkeit-von-nega/)
- A widely repeated "University of Minnesota, 150 participants, 22% less eye strain" claim appears only on a quotes site with no verifiable source — [peoplespharmacy quotes page](https://library.peoplespharmacy.com/quotes-black-background) (treat as unreliable)
- WCAG 2.1 contrast ≥4.5:1 recommended for テロップ — [0120.co.jp video-125](https://0120.co.jp/blog/video-125/)
- Accessibility note on black/white combinations in UI — [a11y with Diana](https://a11ywithdiana.substack.com/p/and)

### Inferences
- For retention there is **no sourced evidence** that dark or light backgrounds change YouTube watch time; the choice should follow content type: dark grey field for diagram/motion scenes (lines and coloured accents pop, matches 3b1b/Welch Labs viewer expectations for "serious AI explainers"), off-white field for text-heavy or document/news scenes. Switching fields between segments is also a cheap visual rhythm device.
- Avoid pure #000000 (bloom/"glow" issue above) and pure #FFFFFF text on it; 3b1b's #333333 + #FFFFFF text, or #1E1E1E + #EAEAEA **(estimate)**, is safer.
- Keep one accent hue per concept across the whole channel (see KQ1 mapping) and verify each accent against the field at ≥4.5:1 (YELLOW_C #F7D96F, BLUE_C #58C4DD, GREEN_C #83C167 pass on #333333; RED_C #FC6255 is borderline — check).

### Gaps
- No published palettes for Kurzgesagt, Vox, NHK, 日経, Fireship.
- No study specific to video retention vs background luminance.

---

## KQ5. Thumbnail conventions: Japan vs US, bilingual thumbnails, YouTube per-language thumbnails

### Takeaway
Evidence (one well-documented case study plus practitioner guidance) says Japanese thumbnails are text-heavy, multi-font, high-saturation "variety-show" style and let viewers grasp content faster, while Western-oriented advice favours minimal text and a single object/face. YouTube now supports a different thumbnail per language (rolled out late 2025–early 2026 to channels with multi-language tools), which makes a JP-text thumbnail for Japanese viewers and a low-text thumbnail for English viewers the correct bilingual strategy rather than cramming both languages onto one image.

### Cited Findings
- KonMari case: Marie Kondo's Japanese and English YouTube channels use very different thumbnails; Japanese variety-style production is "busy and text-heavy... colorful, multi-font text and eye-catching designs"; the overseas channel keeps a minimalist, "Zen" feel; commenters said the Japanese thumbnails let you grasp the content more quickly; explanations offered: international viewers don't all read English, and Japan's neon/billboard environment makes vivid styling normal — [Unseen Japan](https://unseen-japan.com/konmari-western-vs-japanese-marketing/); [SoraNews24](https://soranews24.com/2020/10/27/konmaris-youtube-reveals-interesting-fact-about-japanese-vs-non-japanese-online-preferences/amp/)
- Using Japan-market style abroad "may look out of place to overseas viewers"; guidance on fonts for international thumbnails — [Ondoku3, "How to Create YouTube Thumbnails for International Audiences"](https://ondoku3.com/en/post/youtube_global_thumbnail/)
- Western best-practice: minimalist thumbnails are often most effective; short bold phrases beat crowded text — [vidIQ thumbnail tips 2026](https://vidiq.com/blog/post/youtube-thumbnail-tips/)
- Localisation guidance: A/B test text-heavy vs almost-no-text per audience — [AIR Media-Tech, "Multi-language thumbnails: text or visuals?"](https://air.io/en/youtube-hacks/multi-language-thumbnails-when-to-use-text-vs-visual-storytelling)
- YouTube official: localized thumbnails let you set a different thumbnail for each language; viewers see the thumbnail matching their language setting; set in YouTube Studio → video → Languages → pick language → add custom thumbnail — [YouTube Help, "Add multi-language features to your videos"](https://support.google.com/youtube/answer/13338784?hl=en)
- Rollout: broader rollout to creators with multi-language tools through late 2025 and early 2026 — [Upstream](https://upstream.so/blog/localized-youtube-thumbnails/); creators with access manage translated thumbnails in Studio — [Storyboard18](https://www.storyboard18.com/digital/youtube-introduces-translated-thumbnails-to-boost-global-video-discovery-91902.htm); further how-to guides — [TubeBuddy](https://www.tubebuddy.com/blog/translate-youtube-thumbnails-multi-language/), [Gyre](https://gyre.pro/blog/youtube-multilingual-thumbnails-boost-your-global-reach-with-localized-visuals), [AIR Media-Tech](https://air.io/en/youtube-hacks/best-practices-for-managing-multiple-languages-on-one-video)
- Technical spec identical across regions: 1280x720, 16:9, ≤2 MB — [mobinc.jp](https://mobinc.jp/column/?p=3065)
- Automatic thumbnail-generation research (Nara Women's University) describes JP conventions mechanically: text placed against background/whitespace, auto line-breaking for size, colour changed and outlines added to match background — [ics.nara-wu.ac.jp PDF](https://www.ics.nara-wu.ac.jp/~tm/oc2024/study/lab/OC2024/thumbnail.pdf)

### Inferences
- The KonMari evidence is a single case plus comments; no CTR data for JP vs US was found. Treat "JP = text-heavy, US = minimal" as a strong prior, not proven.
- Bilingual thumbnail recipe (inference): one shared visual (object/diagram, consistent channel colour), then two text layers served via per-language thumbnails — Japanese version with 2–6 character headline in BIZ UDPGothic/Noto Sans JP Black, optional 【】 tag, white with dark outline; English version with ≤3 words or no text. Do not stack JP + EN on one thumbnail: at phone size the second line becomes illegible and signals "translated content".
- For a *calm* positioning, deliberately under-use the yellow/red 【衝撃】 grammar even in the JP version: keep ≤2 colours, one face or one object, and reserve a single accent colour, so the thumbnail itself tells the viewer the channel is not a まとめ/煽り channel. This is a positioning choice, not something a source tested.
- Use YouTube's built-in thumbnail test (Test & Compare) to A/B the JP-text vs low-text versions on the Japanese audience; the feature's existence/details could not be verified before the search budget ended (see Gaps).

### Gaps
- No quantitative A/B evidence comparing Japanese vs US thumbnail styles.
- YouTube "Test & Compare" thumbnail A/B feature was not searched (budget); its current availability and metric (watch-time share) is unverified here.
- The YouTube Help page itself could not be fetched; wording comes from the search summary.

---

## KQ6. Sound design and music

### Takeaway
The two reference channels both use a single dedicated composer writing to picture (Epic Mountain for Kurzgesagt, Vincent Rubinetti for 3Blue1Brown), whose soundtracks are sold as albums but composed exclusively for the channel; this is the strongest brand-audio lesson. Sound-effect conventions and the licensing details of third-party libraries could not be researched before the search budget ran out.

### Cited Findings
- Epic Mountain, Munich, "does all of the music for Kurzgesagt episodes"; tracks composed exclusively for Kurzgesagt — [kottke.org](https://kottke.org/18/01/the-soundtrack-to-kurzgesagt); numbered Kurzgesagt soundtrack volumes — [Epic Mountain Bandcamp](https://epicmountainmusic.bandcamp.com/); example tracks — [SoundCloud "alien scale"](https://soundcloud.com/epicmountain/alien-scale)
- Vincent Rubinetti writes original music for 3Blue1Brown — [Harmony of Shinesparkers](https://harmony.shinesparkers.net/staff/vincent-rubinetti/); "The Music of 3Blue1Brown" — [Bandcamp](https://vincerubinetti.bandcamp.com)
- Johnny Harris-style editing uses 3–5 s of B-roll with its own natural sound after a narrated line (a sound-design rhythm, per a client brief) — [Upwork job post](https://www.upwork.com/freelance-jobs/apply/Long-Term-Video-Editor-Premium-Documentary-Visual-Journalism-Vox-Johnny-Harris-Aesthetic_~022071695908697374205/)
- Kurzgesagt's production transcript treats sound design as a distinct final stage after animation — [LingQ transcript](https://www.lingq.com/it/imparare-inglese/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/)

### Inferences
- For a small channel the copyable version of "one composer" is one *sonic identity*: a fixed instrument palette (e.g. soft piano + pad + light percussion), a short recurring motif for the intro/outro, and consistent SFX families (one "appear" tick, one "connect" swell, one "error" thud) reused across every video — not a different stock track each time. This is inference from the two channels' practice, not a tested claim.
- Music composed exclusively for a channel (Epic Mountain, Rubinetti) is not licensable by third parties for channel use as far as these sources show; using their albums on another channel should be assumed prohibited unless the artist's page says otherwise.
- Licensing-safe routes **(not verified in this session)**: YouTube Audio Library, Epidemic Sound, Artlist, or commissioning/generating original tracks (the project already has a Suno/Google Flow Music pipeline per the repo's skills). Verify each library's terms for AI-narrated, monetised, multi-language uploads before use.

### Gaps
- No sources found on SFX conventions (whoosh/UI ticks, levels, frequency) for calm explainers; not searched before budget ran out.
- No sources on Epidemic Sound / Artlist / YouTube Audio Library terms in this session.
- Could not confirm Rubinetti's or Epic Mountain's third-party licensing policy (3blue1brown.com/faq not fetchable).

---

## KQ7. Voice: narration pace and perception of AI narration (JP and EN audiences)

### Takeaway
Industry guides put explainer narration at ~150 wpm (English), 140–170 typical, ~120 wpm for dense technical content, with one measured sample of long-form voice-overs at a 166.5 wpm median; no channel-specific wpm for Kurzgesagt/Vox/3b1b is published. On AI narration, blind tests show listeners often cannot tell and rate AI and human voices nearly identically, but ratings drop once the AI origin is disclosed, and a panel study of 129 Bilibili videos found AI voices drive less engagement than human voice-overs; no Japanese-audience study was found.

### Cited Findings
- Most speakers ~150 wpm (2.5 words/s) — [Explainify, analysis of 100 explainer videos](https://explainify.com/?p=8649); 150 wpm as the default for training/explainers, ~170 wpm described as a ceiling before comprehension drops — [Mindstamp video script timer](https://mindstamp.com/tools/video-script-timer); 120 wpm for complex/technical content — [Overseeros script-length guide](https://www.overseeros.com/blog/youtube-script-length-word-count); 160–180 wpm for Shorts, 165–170 for explainer/how-to — [VoxBooster](https://voxbooster.com/blog/ai-voice-generator-youtube-shorts-narration); denser material benefits from slower delivery and more segmentation — [VoiceBros explainer voice-over guide](https://voicebros.com/en/blog/explainer-video-voice-over-guide); a sample of 53 long-form voice-overs: median 166.5 wpm — reported in the same vendor sources (secondary; original dataset not located)
- Bilibili panel study (129 videos, panel VAR model): AI-generated voice "enhances production efficiency" but "is less effective than human voiceovers in fostering audience engagement" — [SMU Institutional Knowledge, "Consumer cognitions for AI-synthesized voices"](https://ink.library.smu.edu.sg/lkcsb_research/7427)
- Max Planck (Oct 2025): synthetic voices often mistaken for human and perceived as natural, but generally perceived as less attractive — [mpg.de](https://www.mpg.de/25710881/1112-emae-how-attractive-do-ai-voices-sound-6971365-x)
- 2026 radio study, 1,326 listeners: AI and human voices rated nearly identically for professionalism, authenticity, credibility, energy, likability in blind tests; perceptions shift significantly once listeners learn a voice is AI — [Radio Online](https://news.radio-online.com/articles/n49138/Study-Listeners-Struggle-to-Spot-AI-Voiceovers)
- Industry (unsourced) claim that the 2023 "AI voice bad" comment stigma has largely faded, except where a synthetic voice is positioned as a specific creator persona — [Kineclip blog](https://kineclip.com/blog/ai-voice-vs-human-voiceover-2026/)
- Vendor statistics ("54% prefer professional narration — Google Research 2024", "3x watch time — Meta Sound Study 2025") could not be verified and come from a seller — [Narration Box](https://narrationbox.com/blog/best-ai-voices-for-youtube-videos-in-2025) (treat as unreliable)
- JP-market policy notes (vendor blogs): YouTube allows AI narration in monetised videos provided originality/community guidelines are met; mass-produced generic AI-narration videos may fare worse in monetisation review; AI narration praised for stable pacing/editability — [camb.ai JP blog](https://www.camb.ai/ja/blog/all-about-ai-text-to-speech-for-video-creators); [gofaceless.ai JP blog](https://www.gofaceless.ai/ja/blog/ai-voiceover-for-youtube); [Creatify JP blog](https://creatify.ai/ja/blog/how-to-use-ai-voice-for-youtube-videos)
- Related: Kurzgesagt-style and 3b1b-style videos are narrated continuously over animation (no on-camera host) — [LingQ transcript](https://www.lingq.com/it/imparare-inglese/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/); [Simon Willison](https://simonwillison.net/2024/Apr/11/3blue1brown/)

### Inferences
- English wpm figures do not transfer to Japanese; **(estimate)** a calm Japanese explainer should target roughly 280–320 characters (モーラ) per minute, i.e. the slower end of NHK-news-style delivery, and align テロップ to ≤4 chars/s (KQ3) which implies showing only key phrases, not a verbatim transcript, when the narration runs faster than 4 chars/s.
- The disclosure effect (ratings fall once AI origin is known) argues for not building the channel's persona around "a host" and instead presenting the voice as a neutral narrator; keeping the narrator consistent across videos; and disclosing per YouTube policy without foregrounding it in the first seconds.
- Since the engagement penalty in the Bilibili data is relative to human voices, the practical mitigations are quality of script, pacing, and pauses (which the vendor guides agree AI handles well), and a human-recorded intro/outro if budget allows.

### Gaps
- No measured wpm for Kurzgesagt, Vox, 3b1b, Welch Labs, or any Japanese channel.
- No study of Japanese audiences' reaction to AI narration (VOICEVOX/ゆっくり vs natural TTS); only vendor blogs surfaced.
- The 53-voice-over / 166.5 wpm dataset's original source was not located.
