// ウラトリの部品: 紙の質感・マーカー・出どころの札・ロゴのマーク・カメラのゆらぎ
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SANS, SourceKind, TAG_STYLE} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 紙の繊維と粒子。全画面に薄く重ねる（Johnny Harris / Vox 風の手触り）。 */
export const Grain: React.FC<{opacity?: number; seed?: number}> = ({opacity = 0.18, seed = 3}) => {
  const frame = useCurrentFrame();
  // 粒子は2コマごとに少しずらす（止まって見えないように）
  const s = seed + Math.floor(frame / 2) % 4;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity}}>
      <svg width="100%" height="100%">
        <filter id={`grain-${s}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={s} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${s})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** 四隅を少し落とす。 */
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.35}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** 画面全体をゆっくり寄せる（手持ちではなく、台の上の資料にカメラが近づく動き）。 */
export const Drift: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  x?: number;
  y?: number;
  duration: number;
}> = ({children, from = 1.0, to = 1.05, x = 0, y = 0, duration}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], clamp);
  const s = from + (to - from) * t;
  return (
    <AbsoluteFill style={{transform: `translate(${x * t}px, ${y * t}px) scale(${s})`}}>{children}</AbsoluteFill>
  );
};

/**
 * 黄色のマーカーを左から引く。start フレームから dur フレームで引き終える。
 * box: 黒い地の上では文字全体を黄色の箱で覆い、覆われたところだけ文字を黒にする
 * （下半分だけのマーカーだと、黒い文字の上半分が地に溶けて読めないため）。
 */
export const Marker: React.FC<{
  children: React.ReactNode;
  start: number;
  dur?: number;
  color?: string;
  textColor?: string;
  box?: boolean;
}> = ({children, start, dur = 12, color = C.marker, textColor, box}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [0, 100], {...clamp, easing: Easing.out(Easing.cubic)});
  if (box) {
    const pad = '0 0.12em';
    return (
      <span style={{position: 'relative', display: 'inline-block'}}>
        <span style={{padding: pad}}>{children}</span>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            padding: pad,
            background: color,
            color: textColor ?? C.ink,
            clipPath: `inset(0 ${100 - p}% 0 0)`,
          }}
        >
          {children}
        </span>
      </span>
    );
  }
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${p}% 0.62em`,
        backgroundPosition: '0 88%',
        color: textColor,
        padding: '0 0.08em',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }}
    >
      {children}
    </span>
  );
};

/** 文字列の中の mark だけをマーカーにする。 */
export const WithMark: React.FC<{text: string; mark?: string; start: number; textColor?: string; box?: boolean}> = ({
  text,
  mark,
  start,
  textColor,
  box,
}) => {
  if (!mark || !text.includes(mark)) return <>{text}</>;
  const [a, b] = text.split(mark);
  return (
    <>
      {a}
      <Marker start={start} textColor={textColor} box={box}>
        {mark}
      </Marker>
      {b}
    </>
  );
};

/** 下から少し上がって現れる。 */
export const Rise: React.FC<{children: React.ReactNode; at: number; dy?: number; style?: React.CSSProperties}> = ({
  children,
  at,
  dy = 24,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 18});
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * dy}px)`, ...style}}>{children}</div>;
};

/** 出どころの札（右下）。 */
export const SourceTag: React.FC<{kind: SourceKind | string; name: string; at?: number}> = ({kind, name, at = 6}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 10], [0, 1], clamp);
  const st = TAG_STYLE[kind as SourceKind] ?? TAG_STYLE['調査報告'];
  return (
    <div
      style={{
        position: 'absolute',
        right: 56,
        bottom: 48,
        display: 'flex',
        alignItems: 'stretch',
        fontFamily: SANS,
        fontSize: 26,
        opacity: o,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        maxWidth: 1100,
      }}
    >
      <div
        style={{
          background: st.bg,
          color: st.fg,
          border: `3px solid ${st.border}`,
          padding: '6px 16px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {kind}
      </div>
      <div
        style={{
          background: 'rgba(251,250,246,0.94)',
          color: C.ink,
          border: `3px solid ${C.ink}`,
          borderLeft: 'none',
          padding: '6px 16px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </div>
    </div>
  );
};

/** 見方の札（確かなこと／有力な見方／まだ分からないこと）。 */
export const ViewTag: React.FC<{label: string; at: number; dark?: boolean}> = ({label, at, dark}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 10], [0, 1], clamp);
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 30,
        padding: '6px 18px',
        border: `3px solid ${dark ? '#fff' : C.ink}`,
        color: dark ? '#fff' : C.ink,
        opacity: o,
        letterSpacing: '0.08em',
      }}
    >
      {label}
    </div>
  );
};

/** ロゴのマーク: 虫めがねにチェック（キャラクターなし・小さく）。 */
export const LogoMark: React.FC<{size?: number; color?: string; check?: string; draw?: number}> = ({
  size = 64,
  color = C.ink,
  check = C.marker,
  draw = 1,
}) => {
  const ring = 2 * Math.PI * 34;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle
        cx="42"
        cy="42"
        r="34"
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeDasharray={ring}
        strokeDashoffset={ring * (1 - Math.min(1, draw * 1.4))}
        transform="rotate(-90 42 42)"
      />
      <line
        x1="67"
        y1="67"
        x2="92"
        y2="92"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        opacity={draw > 0.5 ? 1 : 0}
      />
      <polyline
        points="26,43 38,55 59,31"
        fill="none"
        stroke={check}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="60"
        strokeDashoffset={60 * (1 - Math.max(0, Math.min(1, (draw - 0.55) / 0.45)))}
      />
    </svg>
  );
};

/** 左上の小さなロゴ（マーク＋チャンネル名）。 */
export const Bug: React.FC<{name: string; dark?: boolean}> = ({name, dark}) => (
  <div
    style={{
      position: 'absolute',
      left: 52,
      top: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: SANS,
      fontWeight: 900,
      fontSize: 30,
      letterSpacing: '0.12em',
      color: dark ? '#fff' : C.ink,
      opacity: 0.92,
    }}
  >
    <LogoMark size={40} color={dark ? '#fff' : C.ink} />
    {name}
  </div>
);

/** 台の上に置かれた紙面（影と少しの傾き）。 */
export const Sheet: React.FC<{
  children: React.ReactNode;
  width: number;
  rotate?: number;
  style?: React.CSSProperties;
}> = ({children, width, rotate = 0, style}) => (
  <div
    style={{
      width,
      background: C.sheet,
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 1px 2px rgba(0,0,0,0.18), 0 18px 40px rgba(0,0,0,0.22)',
      position: 'relative',
      ...style,
    }}
  >
    {children}
  </div>
);

/** 紙面の見出し部分（出典名を「当チャンネルで組版」として出す）。 */
export const SheetHeader: React.FC<{title: string; note?: string}> = ({title, note = '要点（当チャンネルのまとめ）'}) => (
  <div style={{borderBottom: `3px solid ${C.ink}`, padding: '28px 40px 20px', fontFamily: SANS}}>
    <div style={{fontSize: 30, fontWeight: 700, lineHeight: 1.45, whiteSpace: 'pre-line', color: C.ink}}>{title}</div>
    <div style={{fontSize: 22, fontWeight: 500, color: C.sub, marginTop: 8}}>{note}</div>
  </div>
);
