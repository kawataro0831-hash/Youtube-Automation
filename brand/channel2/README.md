# 第2チャンネル「値札の裏側」ブランド素材

Notion「第2チャンネル計画」配下の「チャンネルの顔（名前・世界観・ビジュアル案）」ページの元データ。
正本（最終決定・運用ルール）は Notion 側に置く。

| ファイル | 用途 | サイズ |
|---|---|---|
| icon_a.png / icon_b.png | チャンネルアイコン案A（紺地）／案B（琥珀地） | 800×800 |
| banner.png | チャンネルアート（バナー） | 2560×1440（主要領域 1546×423 内に収めている） |
| thumb_1.png〜thumb_3.png | サムネイルのテンプレ例 | 1280×720 |
| background.png | 動画の背景／エンドカード下地 | 1920×1080 |

## 再生成の方法

各 `.html` が設計図。`fonts/` に @fontsource の Noto Sans JP (400/700/900)・Shippori Mincho (700)・DM Mono (500) を
`npm install` で置くと、ヘッドレス Chromium で同じ絵が出る。

```
npm --prefix brand/channel2/fonts install @fontsource/noto-sans-jp @fontsource/shippori-mincho @fontsource/dm-mono
chromium --headless --no-sandbox --disable-gpu --hide-scrollbars \
  --window-size=1280,720 --screenshot=thumb_1.png --virtual-time-budget=3000 file://$PWD/brand/channel2/thumb_1.html
```

## 色・書体（固定）

- 紺 `#0F1C2E` / 深紺 `#162842` / 琥珀 `#F2B134` / 生成り `#F3EFE6` / 灰 `#9AA6B5` / 赤 `#E25555`
- 見出し: Noto Sans JP 900、本文: Noto Sans JP 400/700、数字: DM Mono 500、世界観コピー: Shippori Mincho 700
- モチーフ: 値札（タグ）。角度 -14°、穴とヒモつき。
