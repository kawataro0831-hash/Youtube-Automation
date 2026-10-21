// 映画らしい手触り: フィルムの粒・周辺減光・ちり・光の筋・黒帯・字幕
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BAR, K, MINCHO} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const FilmGrain: React.FC<{opacity?: number}> = ({opacity = 0.13}) => {
  const frame = useCurrentFrame();
  const seed = frame % 7; // コマごとに粒が動く
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <svg width="100%" height="100%">
        <filter id={`fg${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed * 13 + 1} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#fg${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.6}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** 空気中のちり。光の中をゆっくり漂う。 */
export const Dust: React.FC<{count?: number; seed?: string; opacity?: number; area?: [number, number, number, number]}> = ({
  count = 60,
  seed = 'dust',
  opacity = 0.55,
  area = [0, 0, 1920, 1080],
}) => {
  const frame = useCurrentFrame();
  const [x0, y0, w, h] = area;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {Array.from({length: count}, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = 1.2 + r('s') * 3.2;
        const x = x0 + ((r('x') * w + frame * (r('vx') - 0.5) * 0.6) % w + w) % w;
        const y = y0 + ((r('y') * h - frame * (0.15 + r('vy') * 0.35)) % h + h) % h;
        const tw = 0.5 + 0.5 * Math.sin(frame / (12 + r('t') * 20) + r('p') * 6.28);
        const blur = r('b') > 0.7 ? 2.5 : 0.4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#fff6e8',
              opacity: opacity * (0.3 + 0.7 * tw),
              filter: `blur(${blur}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** 上から差す光の筋（操り人形や影の場面に）。 */
export const LightBeam: React.FC<{x?: number; width?: number; opacity?: number; color?: string}> = ({
  x = 960,
  width = 520,
  opacity = 0.28,
  color = '255,236,205',
}) => {
  const frame = useCurrentFrame();
  const flick = 0.92 + 0.08 * Math.sin(frame / 9) * Math.sin(frame / 23);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: opacity * flick, filter: 'blur(40px)'}}>
      {/* 形を切り抜いてから、外側でぼかす（縁をやわらかく） */}
      <div
        style={{
          position: 'absolute',
          left: x - width,
          top: -80,
          width: width * 2,
          height: 1240,
          background: `linear-gradient(180deg, rgba(${color},0.9) 0%, rgba(${color},0.25) 55%, rgba(${color},0) 100%)`,
          clipPath: `polygon(44% 0, 56% 0, 92% 100%, 8% 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** 静止画にゆっくり寄る（引く・持ち上げる）。わずかな手持ちの揺れも足す。 */
export const KenBurns: React.FC<{
  src: string;
  duration: number;
  move?: 'push' | 'drift' | 'pullup' | 'pull';
  focus?: [number, number];
  filter?: string;
}> = ({src, duration, move = 'push', focus = [50, 50], filter}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  let s = 1.0;
  let tx = 0;
  let ty = 0;
  if (move === 'push') s = 1.0 + 0.085 * t;
  if (move === 'pull') s = 1.09 - 0.08 * t;
  if (move === 'drift') {
    s = 1.06;
    tx = -36 + 72 * t;
  }
  if (move === 'pullup') {
    s = 1.07 - 0.03 * t;
    ty = 30 - 60 * t;
  }
  // 手持ちのわずかな揺れ
  const sx = Math.sin(frame / 37) * 2.2 + Math.sin(frame / 13) * 0.6;
  const sy = Math.cos(frame / 41) * 1.8 + Math.sin(frame / 17) * 0.5;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: K.black}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${tx + sx}px, ${ty + sy}px) scale(${s})`,
          transformOrigin: `${focus[0]}% ${focus[1]}%`,
          filter,
        }}
      />
    </AbsoluteFill>
  );
};

/** 明るい所をにじませる（簡易なブルーム）。子要素を2枚重ねて、上をぼかして加算。 */
export const Bloom: React.FC<{children: React.ReactNode; amount?: number; radius?: number}> = ({
  children,
  amount = 0.35,
  radius = 18,
}) => (
  <AbsoluteFill>
    {children}
    <AbsoluteFill
      style={{mixBlendMode: 'screen', opacity: amount, filter: `blur(${radius}px) brightness(1.15) contrast(1.4)`}}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

/** 2.35:1 の黒帯。 */
export const Letterbox: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: BAR, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000'}} />
  </>
);

export type Sub = {from: number; to: number; text: string};

/** 下の黒帯に出す字幕（文の頭で入り、終わりで消える）。 */
export const Subtitles: React.FC<{subs: Sub[]}> = ({subs}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cur = subs.find((s) => frame >= s.from - 3 && frame < s.to + Math.round(fps * 0.35));
  if (!cur) return null;
  const o = interpolate(frame, [cur.from - 3, cur.from + 5, cur.to + 4, cur.to + Math.round(fps * 0.35)], [0, 1, 1, 0], clamp);
  return (
    <div
      lang="ja"
      style={{
        position: 'absolute',
        left: 220,
        right: 220,
        bottom: 0,
        height: BAR,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: MINCHO,
        fontWeight: 400,
        fontSize: 38,
        lineHeight: 1.45,
        letterSpacing: '0.06em',
        color: K.paper,
        opacity: o,
        wordBreak: 'auto-phrase' as React.CSSProperties['wordBreak'],
        textShadow: '0 0 12px rgba(0,0,0,0.8)',
      }}
    >
      {cur.text}
    </div>
  );
};

/** 文字が少しぼけた状態から、字間を詰めながら現れる。 */
export const Reveal: React.FC<{
  children: React.ReactNode;
  at: number;
  dur?: number;
  style?: React.CSSProperties;
  out?: number;
}> = ({children, at, dur = 24, style, out}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const q = out !== undefined ? interpolate(frame, [out, out + 18], [1, 0], clamp) : 1;
  return (
    <div
      style={{
        opacity: p * q,
        filter: `blur(${(1 - p) * 10}px)`,
        transform: `translateY(${(1 - p) * 10}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
