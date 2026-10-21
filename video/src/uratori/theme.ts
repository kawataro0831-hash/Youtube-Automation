// ウラトリの見た目（試作1のトンマナ: 生成りの地・黒・黄色のマーカー・Noto Sans JP）
import '@fontsource/noto-sans-jp/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import '@fontsource/noto-sans-jp/900.css';

export const C = {
  paper: '#eeeeeb', // 生成りの地
  sheet: '#fbfaf6', // 紙面の白
  ink: '#1a1a1a',
  sub: '#5c5c58',
  rule: '#c9c7c0',
  marker: '#f3dc7a',
  press: '#8a8a86', // 報道の札
  desk: '#1d1c1a',
};

export const SANS = '"Noto Sans JP", sans-serif';

// 出どころの札（公式発表＝黒地／調査報告＝白地に黒枠／本人の発言＝黄色／報道＝灰色）
export type SourceKind = '公式発表' | '調査報告' | '本人の発言' | '報道';
export const TAG_STYLE: Record<SourceKind, {bg: string; fg: string; border: string}> = {
  公式発表: {bg: C.ink, fg: '#ffffff', border: C.ink},
  調査報告: {bg: '#ffffff', fg: C.ink, border: C.ink},
  本人の発言: {bg: C.marker, fg: C.ink, border: C.marker},
  報道: {bg: C.press, fg: '#ffffff', border: C.press},
};
