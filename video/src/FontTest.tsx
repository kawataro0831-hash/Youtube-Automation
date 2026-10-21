// Smoke test only: verifies Japanese serif fonts render in headless Chromium.
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {MINCHO, SERIF_JP} from './fonts';
import {useFontsReady} from './useFontsReady';

const TITLE = '日本語レンダリング試験';
const LINE1 = 'しっぽり明朝：漢字・ひらがな・カタカナ「鬱」「薔薇」「檸檬」';
const LINE2 = 'Noto Serif JP：吾輩は猫である。名前はまだ無い。0123 ABC';

export const FontTest: React.FC = () => {
  useFontsReady(
    ['400 1em "Shippori Mincho"', '700 1em "Shippori Mincho"', '400 1em "Noto Serif JP"'],
    TITLE + LINE1 + LINE2,
  );
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#14110f',
        color: '#f3ead8',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        opacity,
      }}
    >
      <div style={{fontFamily: MINCHO, fontWeight: 700, fontSize: 120}}>{TITLE}</div>
      <div style={{fontFamily: MINCHO, fontWeight: 400, fontSize: 56}}>{LINE1}</div>
      <div style={{fontFamily: SERIF_JP, fontWeight: 400, fontSize: 56}}>{LINE2}</div>
      <div style={{fontFamily: 'monospace', fontSize: 32, opacity: 0.6}}>frame {frame}</div>
    </AbsoluteFill>
  );
};
