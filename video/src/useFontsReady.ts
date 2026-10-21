import {useState} from 'react';
import {continueRender, delayRender} from 'remotion';

// Blocks rendering until the unicode-range subsets needed for `text` are
// loaded for each given CSS font shorthand (e.g. '400 1em "Shippori Mincho"').
// Remotion also awaits document.fonts.ready per frame; this makes the first
// frame deterministic.
export const useFontsReady = (fonts: string[], text: string) => {
  useState(() => {
    const handle = delayRender(`Loading fonts for: ${text.slice(0, 20)}`);
    Promise.all(fonts.map((f) => document.fonts.load(f, text)))
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
    return null;
  });
};
