// Japanese serif fonts, bundled locally from npm (@fontsource).
// The CSS declares one @font-face per unicode-range subset; the browser only
// fetches the subsets that the rendered glyphs need.
import '@fontsource/shippori-mincho/400.css';
import '@fontsource/shippori-mincho/700.css';
import '@fontsource/noto-serif-jp/400.css';
import '@fontsource/noto-serif-jp/700.css';

export const MINCHO = '"Shippori Mincho", "Noto Serif JP", serif';
export const SERIF_JP = '"Noto Serif JP", "Shippori Mincho", serif';
