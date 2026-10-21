// 絵の部品: 人が描かず、数式と乱数の種（seed）から形を作る。
// 同じ seed なら毎回同じ形になる（書き出しのたびに絵が変わらない）。
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {HILLS, P, ROUND, SKY} from './theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- 形を作る道具 ----------

/** なめらかな1次元のゆらぎ（0〜1）。seed ごとに違う波。 */
export const wobble = (seed: string, x: number): number => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return random(`${seed}-${i}`) * (1 - u) + random(`${seed}-${i + 1}`) * u;
};

/** 点の列を通る閉じた曲線（Catmull-Rom → 3次ベジェ）。 */
export const smoothClosed = (pts: [number, number][]): string => {
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
};

/** 丸をゆがめた不定形（大陸・雲・細胞など）。t を動かすと形がゆっくり揺れる。 */
export const blobPath = (seed: string, cx: number, cy: number, r: number, rough = 0.35, n = 10, t = 0): string => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 - rough / 2 + rough * wobble(`${seed}-${i}`, t);
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  return smoothClosed(pts);
};

// ---------- 画面全体の手触り ----------

/** 細かい粒（印刷物のようなざらつき）。 */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  const seed = frame % 5;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <svg width="100%" height="100%">
        <filter id={`fl-grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed * 7 + 3} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#fl-grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** 明るいところをにじませる。子要素をぼかしたものを上に重ねて足す。 */
export const Glow: React.FC<{children: React.ReactNode; amount?: number; radius?: number}> = ({
  children,
  amount = 0.6,
  radius = 24,
}) => (
  <AbsoluteFill>
    {children}
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: amount, filter: `blur(${radius}px)`}}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// ---------- カメラ（奥行き） ----------

export type Cam = {x: number; y: number; zoom: number};

/** 層ごとに動く量を変えて奥行きを出す。depth=0 は動かない（無限遠）、1 はカメラと同じだけ動く。 */
export const Layer: React.FC<{cam: Cam; depth: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  cam,
  depth,
  children,
  style,
}) => {
  const s = 1 + (cam.zoom - 1) * depth;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${-cam.x * depth}px, ${-cam.y * depth}px) scale(${s})`,
        transformOrigin: '50% 50%',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** 場面の長さに合わせて、ゆっくり寄る／流れるカメラ。 */
export const useCam = (duration: number, from: Partial<Cam>, to: Partial<Cam>): Cam => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const lerp = (a = 0, b = 0) => a + (b - a) * t;
  return {x: lerp(from.x, to.x), y: lerp(from.y, to.y), zoom: lerp(from.zoom ?? 1, to.zoom ?? 1)};
};

// ---------- 背景 ----------

export const SpaceBg: React.FC = () => (
  <AbsoluteFill
    style={{background: `radial-gradient(ellipse 90% 80% at 50% 45%, ${P.space2} 0%, ${P.space1} 45%, ${P.space0} 100%)`}}
  />
);

export const SkyBg: React.FC<{time: keyof typeof SKY}> = ({time}) => {
  const [a, b, c] = SKY[time];
  return <AbsoluteFill style={{background: `linear-gradient(180deg, ${a} 0%, ${b} 58%, ${c} 100%)`}} />;
};

/** 星空。層（depth）ごとに数・大きさを変え、ゆっくり瞬く。 */
export const Stars: React.FC<{seed: string; count: number; size?: number; opacity?: number; w?: number; h?: number}> = ({
  seed,
  count,
  size = 2.4,
  opacity = 1,
  w = 2400,
  h = 1400,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: (1920 - w) / 2, top: (1080 - h) / 2}}>
      {Array.from({length: count}, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const big = r('big') > 0.93;
        const rad = (big ? 1.8 : 0.5 + r('s')) * size;
        const tw = 0.55 + 0.45 * Math.sin(frame / (10 + r('t') * 25) + r('p') * 6.28);
        const col = r('c') > 0.8 ? P.starWarm : P.star;
        return (
          <g key={i} opacity={opacity * (big ? 0.9 + 0.1 * tw : tw)}>
            {big ? <circle cx={r('x') * w} cy={r('y') * h} r={rad * 4} fill={col} opacity={0.18} /> : null}
            <circle cx={r('x') * w} cy={r('y') * h} r={rad} fill={col} />
          </g>
        );
      })}
    </svg>
  );
};

/** 浮かぶ光の粒（画面が止まって見えないための、小さな動き）。 */
export const Motes: React.FC<{seed: string; count?: number; color?: string; opacity?: number}> = ({
  seed,
  count = 40,
  color = P.light,
  opacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <svg width={1920} height={1080}>
        {Array.from({length: count}, (_, i) => {
          const r = (k: string) => random(`${seed}-${i}-${k}`);
          const x = (r('x') * 2000 + frame * (r('vx') - 0.5) * 0.8) % 2000 - 40;
          const y = (((r('y') * 1160 - frame * (0.2 + r('vy') * 0.5)) % 1160) + 1160) % 1160 - 40;
          const tw = 0.4 + 0.6 * Math.sin(frame / (14 + r('t') * 20) + r('p') * 6.28) ** 2;
          return <circle key={i} cx={x} cy={y} r={1.5 + r('s') * 3.5} fill={color} opacity={opacity * tw} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const HILL_LAYERS = [
  {k: 2, depth: 0.35, base: 720, amp: 120, freq: 520},
  {k: 1, depth: 0.6, base: 790, amp: 110, freq: 420},
  {k: 0, depth: 1, base: 860, amp: 90, freq: 360},
];

/** 丘の稜線の高さ（k=0 が手前）。キャラクターを丘の上に立たせるのにも使う。 */
export const hillY = (x: number, k = 0, seed = 'hill'): number => {
  const l = HILL_LAYERS.find((h) => h.k === k) ?? HILL_LAYERS[2];
  return l.base - l.amp * wobble(`${seed}-${k}`, x / l.freq) - l.amp * 0.35 * wobble(`${seed}-${k}b`, x / (l.freq / 3));
};

/** 地平線の丘。手前ほど濃く、奥ほど空の色に近い3枚。children は手前の丘と一緒に動く。 */
export const Hills: React.FC<{cam: Cam; time: keyof typeof HILLS; seed?: string; children?: React.ReactNode}> = ({
  cam,
  time,
  seed = 'hill',
  children,
}) => {
  const cols = HILLS[time];
  const ridge = (k: number) => {
    const pts: string[] = [`M -400 1400`];
    for (let x = -400; x <= 2320; x += 40) pts.push(`L ${x} ${hillY(x, k, seed).toFixed(1)}`);
    pts.push('L 2320 1400 Z');
    return pts.join(' ');
  };
  return (
    <>
      {HILL_LAYERS.map((l) => (
        <Layer key={l.k} cam={cam} depth={l.depth}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <path d={ridge(l.k)} fill={cols[l.k]} />
          </svg>
          {l.k === 0 ? children : null}
        </Layer>
      ))}
    </>
  );
};

// ---------- 光るもの・天体 ----------

/** 太陽。中心は白に近く、ふちは橙。周りのもやがゆっくり脈打つ。 */
export const Sun: React.FC<{x: number; y: number; r: number; seed?: string; detail?: boolean}> = ({
  x,
  y,
  r,
  seed = 'sun',
  detail = true,
}) => {
  const frame = useCurrentFrame();
  const id = `fl-sun-${seed}`;
  const t = frame / 30;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <radialGradient id={`${id}-core`}>
          <stop offset="0%" stopColor={P.sunHot} />
          <stop offset="55%" stopColor={P.sun} />
          <stop offset="100%" stopColor={P.sunEdge} />
        </radialGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0%" stopColor={P.sun} stopOpacity={0.55} />
          <stop offset="40%" stopColor={P.sunEdge} stopOpacity={0.18} />
          <stop offset="100%" stopColor={P.sunEdge} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={x} cy={y} r={r} />
        </clipPath>
      </defs>
      <circle cx={x} cy={y} r={r * (3.2 + 0.08 * Math.sin(t * 1.3))} fill={`url(#${id}-halo)`} />
      {/* ゆらぐ炎（コロナ）: 少しずつ大きさの違う不定形を重ねる */}
      {[1.24, 1.12, 1.04].map((k, i) => (
        <path
          key={k}
          d={blobPath(`${seed}-flare${i}`, x, y, r * k, 0.05, 16, t * (0.5 + i * 0.2))}
          fill={i === 2 ? P.sun : P.sunEdge}
          opacity={0.18 + i * 0.16}
        />
      ))}
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-core)`} />
      {detail ? (
        <g clipPath={`url(#${id}-clip)`} opacity={0.16}>
          {/* 表面の粒（明るい斑点がゆっくり入れ替わる） */}
          {Array.from({length: 26}, (_, i) => {
            const rr = (k: string) => random(`${seed}-g-${i}-${k}`);
            const a = rr('a') * Math.PI * 2;
            const d = Math.sqrt(rr('d')) * r * 0.95;
            const life = 0.5 + 0.5 * Math.sin(t * (0.6 + rr('v')) + rr('p') * 6.28);
            return (
              <path
                key={i}
                d={blobPath(`${seed}-g${i}`, x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.04 + rr('s') * 0.06), 0.3, 7, t * 0.4)}
                fill={P.sunHot}
                opacity={life}
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};

/**
 * 惑星。陸（不定形）が回り、夜の側は影で暗く、昼の側のふちに細い光（リムライト）が入る。
 * light は光の来る向き（ラジアン。0 = 右から）。
 */
export const Planet: React.FC<{
  x: number;
  y: number;
  r: number;
  seed: string;
  kind?: 'earth' | 'moon';
  light?: number;
  spin?: number;
}> = ({x, y, r, seed, kind = 'earth', light = Math.PI, spin = 0.25}) => {
  const frame = useCurrentFrame();
  const id = `fl-pl-${seed}`;
  const isEarth = kind === 'earth';
  const base = isEarth ? P.ocean : P.moon;
  const baseDeep = isEarth ? P.oceanDeep : P.moonDeep;
  const lx = Math.cos(light);
  const ly = Math.sin(light);
  // 陸（またはクレーター）は横に流れる。幅 4r の帯を2回並べてつなぎ目を隠す
  const shift = (frame * spin) % (r * 4);
  const spots = Array.from({length: isEarth ? 7 : 9}, (_, i) => {
    const rr = (k: string) => random(`${seed}-sp-${i}-${k}`);
    return {
      x: rr('x') * r * 4,
      y: (rr('y') - 0.5) * r * 1.6,
      s: r * (isEarth ? 0.25 + rr('s') * 0.35 : 0.08 + rr('s') * 0.16),
    };
  });
  const clouds = Array.from({length: 6}, (_, i) => {
    const rr = (k: string) => random(`${seed}-cl-${i}-${k}`);
    return {x: rr('x') * r * 4, y: (rr('y') - 0.5) * r * 1.5, s: r * (0.12 + rr('s') * 0.12)};
  });
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle cx={x} cy={y} r={r} />
        </clipPath>
        <radialGradient id={`${id}-base`} cx={0.5 + lx * 0.25} cy={0.5 + ly * 0.25} r={0.85}>
          <stop offset="0%" stopColor={base} />
          <stop offset="100%" stopColor={baseDeep} />
        </radialGradient>
        <radialGradient id={`${id}-atmo`}>
          <stop offset="70%" stopColor={isEarth ? '#7cc4ff' : P.moon} stopOpacity={isEarth ? 0.5 : 0.12} />
          <stop offset="100%" stopColor="#7cc4ff" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={r * 0.08} />
        </filter>
      </defs>
      {/* 大気のにじみ */}
      <circle cx={x} cy={y} r={r * 1.18} fill={`url(#${id}-atmo)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx={x} cy={y} r={r} fill={`url(#${id}-base)`} />
        {[0, r * 4].map((off) => (
          <g key={off} transform={`translate(${x - r * 2 + shift + off - r * 4}, ${y})`}>
            {spots.map((s, i) =>
              isEarth ? (
                <path key={i} d={blobPath(`${seed}-l${i}`, s.x, s.y, s.s, 0.55, 9)} fill={i % 3 === 0 ? P.landDeep : P.land} />
              ) : (
                <g key={i}>
                  <circle cx={s.x} cy={s.y} r={s.s} fill={P.moonDeep} opacity={0.55} />
                  <circle cx={s.x + s.s * 0.15} cy={s.y + s.s * 0.15} r={s.s * 0.75} fill={P.moonDeep} opacity={0.5} />
                </g>
              ),
            )}
          </g>
        ))}
        {isEarth
          ? [0, r * 4].map((off) => (
              <g key={`c${off}`} transform={`translate(${x - r * 2 + ((shift * 1.6) % (r * 4)) + off - r * 4}, ${y})`}>
                {clouds.map((c, i) => (
                  // 横に伸ばした雲
                  <g key={i} transform={`translate(${c.x}, ${c.y}) scale(1.8, 0.5)`}>
                    <path d={blobPath(`${seed}-c${i}`, 0, 0, c.s, 0.3, 8)} fill="#fff" opacity={0.42} />
                  </g>
                ))}
              </g>
            ))
          : null}
        {/* 夜の側の影: 光と反対へずらした暗い円を、ぼかして重ねる */}
        <circle
          cx={x - lx * r * 0.55}
          cy={y - ly * r * 0.55}
          r={r * 1.05}
          fill={P.space0}
          opacity={0.62}
          filter={`url(#${id}-soft)`}
        />
      </g>
      {/* 昼の側のふちに入る細い光 */}
      <path
        d={`M ${x + Math.cos(light - 1.1) * r * 0.985} ${y + Math.sin(light - 1.1) * r * 0.985} A ${r * 0.985} ${r * 0.985} 0 0 1 ${
          x + Math.cos(light + 1.1) * r * 0.985
        } ${y + Math.sin(light + 1.1) * r * 0.985}`}
        stroke={P.light}
        strokeWidth={Math.max(1.5, r * 0.018)}
        strokeLinecap="round"
        fill="none"
        opacity={0.55}
      />
    </svg>
  );
};

// ---------- キャラクター ----------

/**
 * 案内役の生きもの（このチャンネルのオリジナル）。丸いおもち形の体に点の目。
 * look: -1（下）〜 1（真上）で視線と体の傾きが変わる。まばたきと呼吸は自動。
 */
export const Critter: React.FC<{x: number; y: number; size?: number; color?: string; look?: number; seed?: string}> = ({
  x,
  y,
  size = 160,
  color = P.pink,
  look = 0,
  seed = 'critter',
}) => {
  const frame = useCurrentFrame();
  const breathe = 1 + 0.025 * Math.sin(frame / 14);
  // まばたき: 一定でない間隔で 4 フレームだけ目を閉じる
  const period = 70 + Math.floor(random(`${seed}-blink`) * 40);
  const blink = frame % period < 4 ? 0.12 : 1;
  const w = size;
  const h = size * 0.92;
  const eyeY = -h * (0.58 + 0.12 * look);
  const tilt = -6 * look;
  return (
    <svg
      width={w * 2}
      height={h * 2}
      viewBox={`${-w} ${-h * 1.6} ${w * 2} ${h * 2}`}
      style={{position: 'absolute', left: x - w, top: y - h * 1.6, overflow: 'visible'}}
    >
      <ellipse cx={0} cy={4} rx={w * 0.42} ry={w * 0.06} fill="#000" opacity={0.22} />
      <g transform={`rotate(${tilt}) scale(${1 / Math.sqrt(breathe)}, ${breathe})`}>
        {/* 足 */}
        <ellipse cx={-w * 0.18} cy={-h * 0.02} rx={w * 0.1} ry={w * 0.06} fill={color} />
        <ellipse cx={w * 0.18} cy={-h * 0.02} rx={w * 0.1} ry={w * 0.06} fill={color} />
        {/* 体（下が広いおもち形） */}
        <path
          d={`M ${-w * 0.42} ${-h * 0.12} C ${-w * 0.48} ${-h * 0.75}, ${-w * 0.22} ${-h * 1.02}, 0 ${-h * 1.02}
              C ${w * 0.22} ${-h * 1.02}, ${w * 0.48} ${-h * 0.75}, ${w * 0.42} ${-h * 0.12}
              C ${w * 0.3} ${-h * 0.02}, ${-w * 0.3} ${-h * 0.02}, ${-w * 0.42} ${-h * 0.12} Z`}
          fill={color}
        />
        {/* 片側の光（リムライト）と、反対側の影 */}
        <path
          d={`M ${w * 0.12} ${-h * 0.98} C ${w * 0.36} ${-h * 0.9}, ${w * 0.46} ${-h * 0.6}, ${w * 0.43} ${-h * 0.25}`}
          stroke="#fff"
          strokeOpacity={0.45}
          strokeWidth={w * 0.035}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${-w * 0.42} ${-h * 0.12} C ${-w * 0.48} ${-h * 0.75}, ${-w * 0.22} ${-h * 1.02}, 0 ${-h * 1.02}
              C ${-w * 0.25} ${-h * 0.8}, ${-w * 0.32} ${-h * 0.4}, ${-w * 0.2} ${-h * 0.06}
              C ${-w * 0.3} ${-h * 0.06}, ${-w * 0.38} ${-h * 0.09}, ${-w * 0.42} ${-h * 0.12} Z`}
          fill="#000"
          opacity={0.14}
        />
        {/* 目 */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * w * 0.13}, ${eyeY}) scale(1, ${blink})`}>
            <ellipse cx={0} cy={0} rx={w * 0.045} ry={w * 0.06} fill="#1a1030" />
            <circle cx={w * 0.015} cy={-w * 0.022} r={w * 0.015} fill="#fff" />
          </g>
        ))}
        {/* ほお */}
        <ellipse cx={-w * 0.25} cy={eyeY + h * 0.11} rx={w * 0.05} ry={w * 0.03} fill="#fff" opacity={0.25} />
        <ellipse cx={w * 0.25} cy={eyeY + h * 0.11} rx={w * 0.05} ry={w * 0.03} fill="#fff" opacity={0.25} />
      </g>
    </svg>
  );
};

// ---------- 文字 ----------

/** ばねのように弾んで出る札（丸みのある帯に太字）。 */
export const Pill: React.FC<{
  at: number;
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  bg?: string;
  out?: number;
}> = ({at, x, y, children, size = 54, color = P.text, bg = P.pill, out}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 160, mass: 0.7}});
  const q = out !== undefined ? interpolate(frame, [out, out + 10], [1, 0], clamp) : 1;
  return (
    <div
      lang="ja"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s * q})`,
        padding: `${size * 0.32}px ${size * 0.62}px`,
        borderRadius: size,
        background: bg,
        color,
        fontFamily: ROUND,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      }}
    >
      {children}
    </div>
  );
};

export type Sub = {from: number; to: number; text: string};

/** 下に出る字幕。半透明の帯の上に丸ゴシック。 */
export const Subtitles: React.FC<{subs: Sub[]}> = ({subs}) => {
  const frame = useCurrentFrame();
  const cur = subs.find((s) => frame >= s.from - 3 && frame < s.to + 10);
  if (!cur) return null;
  const o = interpolate(frame, [cur.from - 3, cur.from + 4, cur.to + 4, cur.to + 10], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div
        lang="ja"
        style={{
          maxWidth: 1500,
          padding: '14px 34px',
          borderRadius: 18,
          background: 'rgba(7,13,36,0.55)',
          fontFamily: ROUND,
          fontWeight: 500,
          fontSize: 42,
          lineHeight: 1.4,
          letterSpacing: '0.04em',
          color: P.text,
          textAlign: 'center',
          wordBreak: 'auto-phrase' as React.CSSProperties['wordBreak'],
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};
