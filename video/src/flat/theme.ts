// 新チャンネル（仮）の見た目: 深い紺の宇宙に、彩度の高い差し色。線は描かず、面と光で形を作る。
// 丸ゴシック（M PLUS Rounded 1c）。色はここだけで決め、場面では名前で使う。
import '@fontsource/m-plus-rounded-1c/500.css';
import '@fontsource/m-plus-rounded-1c/800.css';

export const P = {
  // 背景（奥ほど暗く、青みを強く）
  space0: '#070d24',
  space1: '#0f1d4a',
  space2: '#1b3070',
  // 光るもの
  sun: '#ffc23d',
  sunHot: '#fff1b8',
  sunEdge: '#ff7a2f',
  light: '#fff6d6',
  // 星・惑星
  ocean: '#2d7ff0',
  oceanDeep: '#1a4fb8',
  land: '#4fd18b',
  landDeep: '#2a9a66',
  moon: '#c7d0e6',
  moonDeep: '#8792b3',
  star: '#f2f5ff',
  starWarm: '#ffd9a8',
  pink: '#ff5d8f',
  // 文字
  text: '#f4f7ff',
  dim: 'rgba(244,247,255,0.6)',
  pill: 'rgba(7,13,36,0.72)',
};

export const ROUND = '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif';

/** 空のグラデーション（時刻ごと）。上 → 下 */
export const SKY = {
  day: ['#1d6fd6', '#58a8f0', '#ffd39a'],
  night: ['#060b22', '#101f52', '#24387a'],
} as const;

/** 丘の色（手前 → 奥）。奥ほど空の色に近づける（空気遠近法）。 */
export const HILLS = {
  day: ['#1f6b5a', '#2f8f72', '#5fb894'],
  night: ['#05091c', '#0b1638', '#15275a'],
} as const;
