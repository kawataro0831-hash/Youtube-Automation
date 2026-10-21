// 「考える夜」の見た目: 黒・生成りの白・ろうそくの橙。明朝体の字幕と、英字はセリフ体／タイプライター体。
import '@fontsource/shippori-mincho/400.css';
import '@fontsource/shippori-mincho/700.css';
import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/special-elite/400.css';
import '@fontsource/noto-sans-jp/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';

export const K = {
  black: '#070707',
  ink: '#0d0c0b',
  paper: '#efe9df', // 文字の白（少し温かい）
  dim: 'rgba(239,233,223,0.62)',
  ember: '#e0893f', // 火の色（強調は最小限）
  line: 'rgba(239,233,223,0.55)',
};

export const MINCHO = '"Shippori Mincho", "Noto Serif JP", serif';
export const SERIF_EN = '"Cormorant Garamond", "Shippori Mincho", serif';
export const TYPE = '"Special Elite", "Courier New", monospace';

/** シネマスコープ（2.35:1）の黒帯の高さ（1080p） */
export const BAR = 132;
