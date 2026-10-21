# レンダリング環境セットアップメモ

検証日: 2026-10-21 / コンテナ: Ubuntu 24.04, 4 vCPU, 15 GB RAM, GPUなし

## 1. Remotion (`video/`)

### バージョン（すべて完全固定）
| パッケージ | バージョン |
|---|---|
| remotion / @remotion/cli / @remotion/fonts / @remotion/media-utils | 4.0.537（全て同一にすること） |
| react / react-dom | 19.2.3 |
| @types/react | 19.2.7 |
| typescript | 5.9.3（公式テンプレートと同じ。7.x は使わない） |
| @fontsource/shippori-mincho | 5.3.0 |
| @fontsource/noto-serif-jp | 5.3.1 |

Node v22 (`/opt/node22/bin`)、ffmpeg 6.1。

### ブラウザ
`remotion.config.ts` で Playwright 同梱の headless shell を指定済み（Remotion の Chrome ダウンロード先はブロックされている）。

- 使用中: `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`（Chromium 141）
- 環境変数 `REMOTION_BROWSER_EXECUTABLE` で上書き可。どちらのパスも無い環境では Remotion 標準のダウンロードにフォールバック。
- フル版 `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` を使う場合は `--chrome-mode=chrome-for-testing` が必須（無いと起動失敗）。

### コマンド
```bash
export PATH=/opt/node22/bin:$PATH
cd video
npm ci                                   # 初回
npx tsc --noEmit                         # 型チェック
npx remotion compositions src/index.ts   # 一覧
npx remotion render src/index.ts FontTest out/font-test.mp4 --concurrency=4
npx remotion still  src/index.ts FontTest out/font-test-still.png --frame=60
ffmpeg -y -ss 2 -i out/font-test.mp4 -frames:v 1 out/frame.png   # 目視確認用
```

### 計測（1920x1080 / 30fps / 90フレーム = 3秒）
- 特別なフラグは不要。`--gl` 未指定・`angle`・`swangle`・`swiftshader`・`egl`・`vulkan` すべて成功し、
  いずれも WebGL2 = SwiftShader（ソフトウェア）になる。
- `--concurrency` 既定は 2（コア数の半分）: 約 10.9 秒 / `--concurrency=4`: 約 9.9 秒（バンドルキャッシュあり）
- ソース変更後の初回はバンドルで +5〜10 秒。`remotion still` 1枚: 約 5 秒。
- 出力: h264 / yuv420p / crf18、約 290 KB。

### 日本語フォント
- `src/fonts.ts` で fontsource の CSS を import（ローカルに同梱、ネット不要）。
  CSS は unicode-range 分割サブセットなので、使う文字の woff2 だけが読み込まれる。
- Remotion は各フレームで `document.fonts.ready` を待つが、1フレーム目を確実にするため
  `src/useFontsReady.ts`（`delayRender` + `document.fonts.load(font, text)`）を用意済み。
- 検証: しっぽり明朝 400/700、Noto Serif JP 400 で「鬱」「薔薇」「檸檬」等も豆腐なしで描画確認済み。
- font-family: `"Shippori Mincho"` / `"Noto Serif JP"`（定数 `MINCHO`, `SERIF_JP`）。

### 無害な警告
- `Detected differing memory amounts`（cgroup 表示の問題）
- `Remotion shared-memory capture is unavailable ... Falling back to encoded screenshots`
  （Playwright 版 Chromium には Remotion 独自拡張が無いため。レンダリング結果は正常）

## 2. Blender / bpy (`blender/`)

### セットアップ
```bash
export PATH=/root/.local/bin:$PATH
cd blender
uv venv --python 3.13 .venv
uv pip install --python .venv/bin/python -r requirements.txt   # bpy==5.2.2 (manylinux cp313)
```
bpy 5.2.2 LTS（numpy 2.5.4 などが依存で入る）。インストール約 7 秒。

### システムライブラリ
- **Cycles (CPU)**: 追加ライブラリ不要。
- **EEVEE / Workbench**: `libEGL.so.1` が必要（無いと即 abort）。apt は使える:
  ```bash
  apt-get install -y --no-install-recommends libegl1 libegl-mesa0
  ```
  Mesa の DRI (llvmpipe) は既に入っているので、これだけで EGL + llvmpipe（ソフトウェア OpenGL）で動作。
  ※ apt で入れたものはコンテナ再作成で消えるので、毎回（または SessionStart フック等で）入れ直す。

### コマンド
```bash
cd blender
.venv/bin/python smoke_test.py --engine cycles --samples 32 --out renders/cycles_32spp.png
.venv/bin/python smoke_test.py --engine eevee  --samples 16 --out renders/eevee_16.png
.venv/bin/python smoke_test.py --engine workbench          --out renders/workbench.png
```

### エンジン名と計測（1920x1080 1フレーム、4 コア）
| エンジン | `scene.render.engine` | 設定 | 時間 |
|---|---|---|---|
| Cycles CPU | `CYCLES` | 16 spp + OIDN | 約 31 秒 |
| Cycles CPU | `CYCLES` | 32 spp + OIDN | 約 43〜44 秒 |
| Cycles CPU | `CYCLES` | 32 spp デノイズなし | 約 34 秒（OIDN 自体は約 9 秒） |
| EEVEE (llvmpipe) | `BLENDER_EEVEE` | 16 samples | 初回 約 35 秒（シェーダコンパイル）/ 2回目以降 約 14 秒 |
| EEVEE (llvmpipe) | `BLENDER_EEVEE` | 64 samples（既定） | 約 43 秒 |
| Workbench | `BLENDER_WORKBENCH` | — | 約 2 秒（プレビュー品質） |

- Blender 5.x の EEVEE は `BLENDER_EEVEE`（`BLENDER_EEVEE_NEXT` は存在しない）。
- OpenImageDenoise は有効（`_cycles.with_openimagedenoise == True`、`denoiser = 'OPENIMAGEDENOISE'`）。
- Mesa のシェーダキャッシュ: `~/.cache/mesa_shader_cache`（EEVEE 2回目以降が速くなる理由）。

### 注意点
- `World.use_nodes` / `Material.use_nodes` は 5.x で非推奨（6.0 で削除予定）。新規作成時点で node_tree が既にあるので設定不要。
- `gpu` モジュールはレンダリング前に参照すると未初期化エラー。
- EEVEE では発光マテリアルが周囲を照らさない（Cycles では照らす）。間接光が必要なら Cycles かライト追加。
- EEVEE 実行時の `EGL Error (0x3009): EGL_BAD_MATCH` は無害（出力は正常）。
- `CUEW initialization failed`（CUDA なし）も無害。
- Blender のテキストオブジェクトで日本語を使う場合は TTF/OTF のフォントファイルが別途必要（fontsource は分割 woff/woff2 のみ）。
- 長尺は Blender で全編を描くより、背景・インサート用の静止画/短尺だけ Blender で作り、合成は Remotion で行う方が現実的（1080p 1フレーム 15〜45 秒）。

## 3. 生成物（git 管理外）
- `video/out/font-test.mp4`, `video/out/font-test-frame5.png`, `video/out/font-test-frame60.png`, `video/out/font-test-still.png`
- `blender/renders/cycles_32spp.png`, `blender/renders/cycles_16spp.png`, `blender/renders/eevee_16.png`, `blender/renders/workbench.png`
