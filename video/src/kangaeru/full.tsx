// 「考える夜」本編（フル尺）の場面。原稿（episodes/<回>/source.txt）の @型 ごとの画面。
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {phraseFrame, TLScene, TLSentence} from '../uratori/scenes';
import {Bloom, Dust, KenBurns, LightBeam, Reveal} from './fx';
import {BAR, K, MINCHO, SERIF_EN, TYPE} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

export type FullSentence = TLSentence & {short?: string | null};

/** at（文の番号、または文の中の言葉）を、場面の中のフレームにする。 */
export const atFrame = (scene: TLScene, at: string | number | undefined, end = false): number => {
  const ss = scene.sentences as FullSentence[];
  if (!ss.length) return 0;
  if (at === undefined || at === '') return ss[0].from;
  const n = Number(at);
  if (!Number.isNaN(n)) {
    const s = ss[Math.max(0, Math.min(ss.length - 1, n))];
    return end ? s.to : s.from;
  }
  const hit = ss.find((s) => s.text.includes(String(at)));
  return hit ? phraseFrame(hit, String(at), end) : ss[0].from;
};

/** いま読んでいる文の番号（文と文の間は直前の文）。 */
const currentIndex = (ss: TLSentence[], frame: number) => {
  let k = -1;
  ss.forEach((s, i) => {
    if (frame >= s.from - 4) k = i;
  });
  return k;
};

const strip = (t: string) => t.replace(/[。]$/u, '');

/** 背景: 暗い地に、ゆっくり動く温かい光とちり。 */
const Night: React.FC<{seed: string; glow?: number; x?: number; y?: number}> = ({seed, glow = 0.1, x = 50, y = 48}) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 160) * 4;
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at ${x + dx}% ${y}%, rgba(224,137,63,${glow}) 0%, rgba(0,0,0,0) 60%), ${K.black}`,
        }}
      />
      <Dust count={55} seed={seed} opacity={0.3} />
    </>
  );
};

// ---------- 章カード ----------

export const ChapterCard: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {label, title} = scene.items;
  const latin = /^[A-Z]/.test(label ?? '');
  const out = interpolate(frame, [scene.duration - 16, scene.duration], [1, 0], clamp);
  const line = interpolate(frame, [10, 50], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Night seed={scene.id} glow={0.08} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', color: K.paper, textAlign: 'center'}}>
        <Reveal at={4} dur={30}>
          <div
            style={{
              fontFamily: latin ? SERIF_EN : MINCHO,
              fontWeight: latin ? 300 : 400,
              fontSize: latin ? 56 : 40,
              letterSpacing: latin ? '0.6em' : '0.5em',
              color: K.dim,
            }}
          >
            {label}
          </div>
        </Reveal>
        <div style={{height: 1, width: 520 * line, background: K.line, margin: '34px 0'}} />
        <Reveal at={16} dur={34}>
          <div lang="ja" style={{fontFamily: MINCHO, fontWeight: 700, fontSize: 66, lineHeight: 1.5, maxWidth: 1400, wordBreak: 'auto-phrase' as React.CSSProperties['wordBreak']}}>
            {title}
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 静止画（Blender） ----------

const CLIP_LOOK: Record<string, {focus: [number, number]; bloom?: number; filter?: string; offsetY?: number; dust?: number; beam?: number}> = {
  k_louisville: {focus: [52, 40], bloom: 0.45},
  k_derby: {focus: [70, 45], bloom: 0.3, dust: 0.3},
  k_reporter: {focus: [45, 72], bloom: 0.35, dust: 0.35},
  k_window: {focus: [58, 45], bloom: 0.4, filter: 'saturate(0.85)'},
  k_strings: {focus: [50, 0], bloom: 0.3, offsetY: 100, dust: 0.5, beam: 0.22},
  k_meeting: {focus: [50, 45], bloom: 0.35, dust: 0.25},
  k_phone: {focus: [50, 50], bloom: 0.45},
  k_izakaya: {focus: [50, 50], bloom: 0.35, dust: 0.2},
  k_creator: {focus: [55, 40], bloom: 0.4},
  k_crt: {focus: [60, 40], bloom: 0.45},
  k_doors: {focus: [50, 55], bloom: 0.5, dust: 0.35},
  k_dining: {focus: [50, 55], bloom: 0.35, dust: 0.3},
  k_dusk: {focus: [45, 45], bloom: 0.35},
};

export const FullStill: React.FC<{scene: TLScene}> = ({scene}) => {
  const it = scene.items;
  const clip = scene.clip ?? 'k_window';
  const look = CLIP_LOOK[clip] ?? {focus: [50, 50] as [number, number]};
  const bg = (
    <KenBurns
      src={`kangaeru/${clip}.jpg`}
      duration={scene.duration}
      move={it.move}
      focus={look.focus}
      filter={look.filter}
      offsetY={look.offsetY}
    />
  );
  const cardAt = atFrame(scene, it.at ?? 0) - 4;
  return (
    <AbsoluteFill style={{background: K.black}}>
      {look.bloom ? <Bloom amount={look.bloom}>{bg}</Bloom> : bg}
      {look.beam ? <LightBeam x={1010} width={560} opacity={look.beam} /> : null}
      {look.dust ? <Dust count={45} seed={scene.id} opacity={look.dust} /> : null}
      {it.card === 'place' ? (
        <div style={{position: 'absolute', left: 150, bottom: BAR + 90, color: K.paper}}>
          <Reveal at={cardAt + 8} dur={30}>
            <div style={{fontFamily: SERIF_EN, fontWeight: 300, fontSize: 150, letterSpacing: '0.18em', lineHeight: 1}}>{it.year}</div>
          </Reveal>
          <Reveal at={cardAt + 22} dur={30}>
            <div style={{fontFamily: SERIF_EN, fontWeight: 500, fontSize: 30, letterSpacing: '0.55em', marginTop: 18}}>{it.place}</div>
          </Reveal>
          <Reveal at={cardAt + 32} dur={30}>
            <div style={{fontFamily: MINCHO, fontSize: 24, letterSpacing: '0.3em', marginTop: 14, color: K.dim}}>{it.placeJa}</div>
          </Reveal>
        </div>
      ) : null}
      {it.card === 'name' ? (
        <div style={{position: 'absolute', right: 150, top: BAR + 110, textAlign: 'right', color: K.paper}}>
          <Reveal at={cardAt} dur={28}>
            <div style={{fontFamily: SERIF_EN, fontWeight: 500, fontSize: 64, letterSpacing: '0.32em'}}>{it.name}</div>
          </Reveal>
          <Reveal at={cardAt + 12} dur={28}>
            <div style={{fontFamily: MINCHO, fontSize: 34, letterSpacing: '0.2em', marginTop: 24}}>{it.nameJa}</div>
          </Reveal>
          <Reveal at={cardAt + 20} dur={28}>
            <div style={{fontFamily: MINCHO, fontSize: 24, letterSpacing: '0.15em', color: K.dim, marginTop: 8}}>{it.role}</div>
          </Reveal>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- 言葉を並べる ----------

export const WordsScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const ss = scene.sentences as FullSentence[];
  const k = currentIndex(ss, frame);
  const typeStyle = scene.items.style === 'type';
  if (typeStyle) {
    // 1つずつ、タイプライターのように打つ
    const s = ss[Math.max(0, k)];
    const text = strip(s.short ?? s.text);
    const n = Math.floor(interpolate(frame, [s.from - 4, s.from + Math.min(30, text.length * 3)], [0, text.length], clamp));
    return (
      <AbsoluteFill>
        <Night seed={scene.id} glow={0.07} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div lang="ja" style={{fontFamily: MINCHO, fontWeight: 700, fontSize: text.length > 14 ? 64 : 92, color: K.paper, maxWidth: 1500, textAlign: 'center', letterSpacing: '0.06em'}}>
            {text.slice(0, n)}
            <span style={{color: K.ember, opacity: frame % 30 < 15 ? 1 : 0}}>▍</span>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  // 縦に積んでいく（古いものは薄く上へ）
  const visible = ss.slice(0, k + 1).slice(-6);
  return (
    <AbsoluteFill>
      <Night seed={scene.id} glow={0.07} x={35} />
      <div style={{position: 'absolute', left: 260, right: 200, top: BAR + 40, bottom: BAR + 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22}}>
        {visible.map((s, i) => {
          const latest = i === visible.length - 1;
          const p = interpolate(frame, [s.from - 4, s.from + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const text = strip(s.short ?? s.text);
          return (
            <div
              key={s.id}
              lang="ja"
              style={{
                fontFamily: MINCHO,
                fontWeight: latest ? 700 : 400,
                fontSize: text.length > 22 ? 46 : 64,
                color: K.paper,
                opacity: (latest ? 1 : 0.32) * p,
                transform: `translateX(${(1 - p) * 30}px)`,
                filter: `blur(${(1 - p) * 6}px)`,
                wordBreak: 'auto-phrase' as React.CSSProperties['wordBreak'],
              }}
            >
              {text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 台詞・言葉を1つずつ大きく ----------

export const QuoteScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const ss = scene.sentences as FullSentence[];
  const k = Math.max(0, currentIndex(ss, frame));
  return (
    <AbsoluteFill>
      <Night seed={scene.id} glow={0.09} />
      {ss.map((s, i) => {
        const next = ss[i + 1];
        const inP = interpolate(frame, [s.from - 6, s.from + 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const outP = next ? interpolate(frame, [next.from - 8, next.from + 2], [1, 0], clamp) : 1;
        if (i !== k && i !== k - 1) return null;
        const t = strip(s.text);
        return (
          <AbsoluteFill key={s.id} style={{justifyContent: 'center', alignItems: 'center', opacity: inP * outP}}>
            <div
              lang="ja"
              style={{
                fontFamily: MINCHO,
                fontWeight: 700,
                fontSize: t.length > 26 ? 60 : t.length > 16 ? 74 : 92,
                lineHeight: 1.5,
                color: K.paper,
                maxWidth: 1450,
                textAlign: 'center',
                filter: `blur(${(1 - inP) * 8}px)`,
                transform: `scale(${1.03 - 0.03 * inP})`,
                wordBreak: 'auto-phrase' as React.CSSProperties['wordBreak'],
              }}
            >
              {t}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 要点の言葉（字幕は出したまま） ----------

const Marked: React.FC<{text: string; mark?: string; at: number}> = ({text, mark, at}) => {
  const frame = useCurrentFrame();
  if (!mark || !text.includes(mark)) return <>{text}</>;
  const [a, b] = text.split(mark);
  const p = interpolate(frame, [at, at + 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <>
      {a}
      <span style={{color: K.ember, backgroundImage: `linear-gradient(${K.ember}, ${K.ember})`, backgroundRepeat: 'no-repeat', backgroundSize: `${p * 100}% 3px`, backgroundPosition: '0 100%'}}>
        {mark}
      </span>
      {b}
    </>
  );
};

export const KeyScene: React.FC<{scene: TLScene; final?: boolean; channel?: string}> = ({scene, final, channel}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const at = atFrame(scene, it.at ?? 0) - 4;
  const text: string = it.text ?? '';
  const size = text.replace(/\n/g, '').length > 40 ? 50 : text.replace(/\n/g, '').length > 22 ? 64 : 84;
  const end = final ? interpolate(frame, [scene.duration - 40, scene.duration], [1, 0], clamp) : 1;
  return (
    <AbsoluteFill style={{opacity: end}}>
      <Night seed={scene.id} glow={final ? 0.14 : 0.09} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: K.paper}}>
        <Reveal at={at} dur={30}>
          <div lang="ja" style={{fontFamily: MINCHO, fontWeight: 700, fontSize: size, lineHeight: 1.55, whiteSpace: 'pre-line', maxWidth: 1600}}>
            <Marked text={text} mark={it.mark} at={at + 24} />
          </div>
        </Reveal>
        {it.sub ? (
          <Reveal at={at + 18} dur={30}>
            <div lang="ja" style={{fontFamily: MINCHO, fontSize: 30, color: K.dim, marginTop: 36, letterSpacing: '0.08em', maxWidth: 1400}}>
              {it.sub}
            </div>
          </Reveal>
        ) : null}
      </AbsoluteFill>
      {final && channel ? (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: BAR + 50, textAlign: 'center'}}>
          <Reveal at={at + 60} dur={40}>
            <div style={{fontFamily: MINCHO, fontSize: 30, letterSpacing: '0.6em', color: K.dim}}>{channel}</div>
          </Reveal>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- A → B ----------

const Box: React.FC<{text: string; x: number; y: number; w: number; p: number; hi?: boolean}> = ({text, x, y, w, p, hi}) => (
  <div
    lang="ja"
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y,
      width: w,
      transform: 'translateY(-50%)',
      textAlign: 'center',
      fontFamily: MINCHO,
      fontWeight: 700,
      fontSize: text.length > 16 ? 44 : 54,
      lineHeight: 1.45,
      color: hi ? K.ember : K.paper,
      opacity: p,
      filter: `blur(${(1 - p) * 6}px)`,
      wordBreak: 'auto-phrase' as React.CSSProperties['wordBreak'],
    }}
  >
    {text}
  </div>
);

export const ArrowScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const t0 = atFrame(scene, 0);
  const t1 = atFrame(scene, it.at ?? 1);
  const pa = interpolate(frame, [t0, t0 + 20], [0, 1], clamp);
  const arrow = interpolate(frame, [t1 - 10, t1 + 20], [0, 1], {...clamp, easing: ease});
  const pb = interpolate(frame, [t1 + 10, t1 + 30], [0, 1], clamp);
  const flip = it.reverse ? interpolate(frame, [t1 + 50, t1 + 80], [0, 1], {...clamp, easing: ease}) : 0;
  const y = 520;
  const x0 = 690;
  const x1 = 1280;
  const len = 300;
  return (
    <AbsoluteFill>
      <Night seed={scene.id} glow={0.08} />
      <Box text={it.from} x={420} y={y} w={560} p={pa} hi={flip > 0.5} />
      <Box text={it.to} x={1500} y={y} w={560} p={pb} hi={flip <= 0.5 && pb > 0.5} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={flip > 0.5 ? `translate(1920 0) scale(-1 1)` : undefined} opacity={flip > 0.4 && flip < 0.6 ? 0.2 : 1}>
          <line x1={x0 + 40} y1={y} x2={x0 + 40 + len * arrow} y2={y} stroke={K.paper} strokeWidth={2.5} />
          <polyline
            points={`${x0 + 40 + len * arrow - 18},${y - 12} ${x0 + 40 + len * arrow},${y} ${x0 + 40 + len * arrow - 18},${y + 12}`}
            fill="none"
            stroke={K.paper}
            strokeWidth={2.5}
            opacity={arrow > 0.05 ? 1 : 0}
          />
        </g>
      </svg>
      <div style={{position: 'absolute', left: x0, width: x1 - x0, top: y + 30, textAlign: 'center', fontFamily: MINCHO, fontSize: 24, color: K.dim, opacity: flip}}>
        {it.reverse ? '逆方向も起きる' : ''}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 循環（AだからB、BだからさらにA） ----------

export const LoopScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const ss = scene.sentences;
  const second = it.a2 && ss.length >= 4 && frame >= ss[2].from - 6;
  const base = second ? 2 : 0;
  const a = second ? it.a2 : it.a;
  const b = second ? it.b2 : it.b;
  const ta = ss[Math.min(base, ss.length - 1)].from - 4;
  const tb = ss[Math.min(base + 1, ss.length - 1)].from - 4;
  const pa = interpolate(frame, [ta, ta + 18], [0, 1], clamp);
  const pb = interpolate(frame, [tb, tb + 18], [0, 1], clamp);
  const cx = 960;
  const cy = 540;
  const R = 200;
  const spin = (frame / 90) * Math.PI * 2;
  const arc = (from: number, to: number) => {
    const x1 = cx + R * Math.cos(from);
    const y1 = cy + R * Math.sin(from);
    const x2 = cx + R * Math.cos(to);
    const y2 = cy + R * Math.sin(to);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };
  const dot = (th: number) => ({x: cx + R * Math.cos(th), y: cy + R * Math.sin(th)});
  const d1 = dot(spin);
  return (
    <AbsoluteFill>
      <Night seed={scene.id} glow={0.1} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={arc(-Math.PI * 0.85, -Math.PI * 0.15)} fill="none" stroke={K.line} strokeWidth={2} opacity={pb} />
        <path d={arc(Math.PI * 0.15, Math.PI * 0.85)} fill="none" stroke={K.line} strokeWidth={2} opacity={pb} />
        <circle cx={d1.x} cy={d1.y} r={7} fill={K.ember} opacity={pb} />
      </svg>
      <Box text={a} x={cx} y={cy - R - 70} w={1100} p={pa} />
      <Box text={b} x={cx} y={cy + R + 70} w={1100} p={pb} hi />
    </AbsoluteFill>
  );
};

// ---------- 依存の網（中心に、たくさんのものがつながる） ----------

export const NetworkScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const nodes: string[] = (it.nodes ?? '').split('／').filter(Boolean);
  const ss = scene.sentences;
  const start = ss[0].from;
  const endF = ss[ss.length - 1].to;
  // 文の数と点の数が同じなら文ごと、違うなら場面の長さで等分して出す
  const appearAt = (i: number) =>
    ss.length === nodes.length ? ss[i].from - 2 : start + ((endF - start) * 0.85 * i) / Math.max(1, nodes.length);
  const cx = 960;
  const cy = 540;
  const shown = nodes.filter((_, i) => frame >= appearAt(i)).length;
  const pull = shown / Math.max(1, nodes.length);
  const pc = interpolate(frame, [start - 10, start + 16], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Night seed={scene.id} glow={0.06 + 0.12 * pull} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {nodes.map((n, i) => {
          const th = -Math.PI / 2 + (i / nodes.length) * Math.PI * 2;
          const r = 330;
          const p = interpolate(frame, [appearAt(i), appearAt(i) + 18], [0, 1], clamp);
          const x = cx + Math.cos(th) * r * 1.35;
          const y = cy + Math.sin(th) * r * 0.82;
          return (
            <g key={n} opacity={p}>
              <line x1={cx} y1={cy} x2={cx + (x - cx) * p} y2={cy + (y - cy) * p} stroke={K.ember} strokeOpacity={0.5} strokeWidth={1.5 + 1.5 * pull} />
              <circle cx={x} cy={y} r={6} fill={K.paper} />
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={95 + 12 * pull} fill="none" stroke={K.ember} strokeWidth={2 + 3 * pull} opacity={pc} />
      </svg>
      {nodes.map((n, i) => {
        const th = -Math.PI / 2 + (i / nodes.length) * Math.PI * 2;
        const p = interpolate(frame, [appearAt(i), appearAt(i) + 18], [0, 1], clamp);
        const x = cx + Math.cos(th) * 330 * 1.35;
        const y = cy + Math.sin(th) * 330 * 0.82;
        return (
          <div
            key={n}
            style={{position: 'absolute', left: x - 170, width: 340, top: y + (Math.sin(th) > 0.3 ? 16 : -60), textAlign: 'center', fontFamily: MINCHO, fontSize: 32, color: K.paper, opacity: p}}
          >
            {n}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: cx - 160, width: 320, top: cy - 26, textAlign: 'center', fontFamily: MINCHO, fontWeight: 700, fontSize: (it.center ?? '').length > 6 ? 30 : 38, color: K.ember, opacity: pc}}>
        {it.center}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 二択 ----------

export const ForkScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const side: 'a' | 'b' = it.side === 'b' ? 'b' : 'a';
  const [la, ta] = (it.a ?? '').split('｜');
  const [lb, tb] = (it.b ?? '').split('｜');
  const t0 = scene.sentences[0].from;
  const p = interpolate(frame, [t0 - 8, t0 + 20], [0, 1], clamp);
  const col = (label: string, text: string, x: number, on: boolean) => (
    <div style={{position: 'absolute', left: x - 380, width: 760, top: 330, textAlign: 'center', opacity: (on ? 1 : 0.22) * p}}>
      <div style={{fontFamily: MINCHO, fontSize: 34, letterSpacing: '0.3em', color: on ? K.ember : K.dim}}>{label}</div>
      <div style={{height: 1, background: K.line, width: 300, margin: '26px auto'}} />
      <div style={{fontFamily: MINCHO, fontWeight: 700, fontSize: 70, color: K.paper}}>{text}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Night seed={scene.id} glow={0.08} x={side === 'a' ? 30 : 70} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={960} y1={BAR + 80} x2={960} y2={1080 - BAR - 80} stroke={K.line} strokeWidth={1} opacity={0.5 * p} />
      </svg>
      {col(la, ta, 520, side === 'a')}
      {col(lb, tb, 1400, side === 'b')}
    </AbsoluteFill>
  );
};

// ---------- 枝分かれ（なりうる自分） ----------

export const BranchesScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const items: string[] = (it.items ?? '').split('／').filter(Boolean);
  const ss = scene.sentences;
  const x0 = 480;
  const y0 = 540;
  const pc = interpolate(frame, [ss[0].from - 8, ss[0].from + 16], [0, 1], clamp);
  const ys = [330, 540, 750];
  return (
    <AbsoluteFill>
      <Night seed={scene.id} glow={0.08} x={30} />
      <div style={{position: 'absolute', left: 160, top: BAR + 50, fontFamily: MINCHO, fontSize: 30, color: K.dim, letterSpacing: '0.2em', opacity: pc}}>{it.title}</div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <circle cx={x0} cy={y0} r={12} fill={K.ember} opacity={pc} />
        {items.map((label, i) => {
          const hit = ss.find((s) => s.text.includes(label));
          const t = hit ? hit.from - 6 : ss[0].from + 30 + i * 30;
          const p = interpolate(frame, [t, t + 30], [0, 1], {...clamp, easing: ease});
          const y1 = ys[i % ys.length];
          const x1 = 1180;
          const d = `M ${x0} ${y0} C ${x0 + 260} ${y0}, ${x1 - 300} ${y1}, ${x1} ${y1}`;
          return <path key={label} d={d} fill="none" stroke={i === 2 ? K.line : K.paper} strokeOpacity={0.7} strokeWidth={2} strokeDasharray={1200} strokeDashoffset={1200 * (1 - p)} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: x0 - 160, width: 320, top: y0 + 30, textAlign: 'center', fontFamily: MINCHO, fontSize: 30, color: K.paper, opacity: pc}}>{it.center}</div>
      {items.map((label, i) => {
        const hit = ss.find((s) => s.text.includes(label));
        const t = (hit ? hit.from - 6 : ss[0].from + 30 + i * 30) + 20;
        const p = interpolate(frame, [t, t + 20], [0, 1], clamp);
        return (
          <div key={label} style={{position: 'absolute', left: 1210, top: ys[i % ys.length] - 30, fontFamily: MINCHO, fontWeight: 700, fontSize: 46, color: K.paper, opacity: p}}>
            {label}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- バージョンの年表 ----------

export const VersionScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const items = (it.items ?? '').split('／').filter(Boolean).map((x: string) => x.split('：'));
  const ss = scene.sentences;
  const n = items.length;
  const x0 = 300;
  const x1 = 1620;
  const y = 520;
  const per = (ss[ss.length - 1].to - ss[0].from) / n;
  const breakIdx = items.findIndex(([label]: string[]) => label === it.breakAt);
  return (
    <AbsoluteFill>
      <Night seed={scene.id} glow={0.07} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {items.map((_: string[], i: number) => {
          if (i === 0) return null;
          const t = ss[0].from + per * i;
          const p = interpolate(frame, [t - 10, t + 10], [0, 1], clamp);
          const xa = x0 + ((x1 - x0) * (i - 1)) / (n - 1);
          const xb = x0 + ((x1 - x0) * i) / (n - 1);
          const broken = i === breakIdx;
          return (
            <line key={i} x1={xa} y1={y} x2={xa + (xb - xa) * p} y2={y} stroke={broken ? K.ember : K.line} strokeWidth={2} strokeDasharray={broken ? '10 14' : undefined} />
          );
        })}
      </svg>
      {items.map(([label, text]: string[], i: number) => {
        const t = ss[0].from + per * i;
        const p = interpolate(frame, [t, t + 20], [0, 1], clamp);
        const x = x0 + ((x1 - x0) * i) / (n - 1);
        const broken = i === breakIdx;
        return (
          <div key={label} style={{position: 'absolute', left: x - 220, width: 440, top: y - 120, textAlign: 'center', opacity: p}}>
            <div style={{fontFamily: SERIF_EN, fontSize: 40, letterSpacing: '0.1em', color: broken ? K.ember : K.dim}}>{label}</div>
            <div style={{width: 18, height: 18, borderRadius: 9, background: broken ? K.ember : K.paper, margin: '44px auto 34px'}} />
            <div lang="ja" style={{fontFamily: MINCHO, fontWeight: 700, fontSize: 38, color: K.paper, wordBreak: 'auto-phrase' as React.CSSProperties['wordBreak']}}>{text}</div>
          </div>
        );
      })}
      {it.label ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: BAR + 70, textAlign: 'center', fontFamily: MINCHO, fontSize: 36, color: K.ember, letterSpacing: '0.3em', opacity: interpolate(frame, [ss[0].from + per * Math.max(1, breakIdx), ss[0].from + per * Math.max(1, breakIdx) + 20], [0, 1], clamp)}}>
          {it.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- チャンネルの案内 ----------

export const CtaScene: React.FC<{scene: TLScene; channel: string; tagline: string}> = ({scene, channel, tagline}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sub = scene.items.subscribe === '1';
  const t = atFrame(scene, sub ? 'チャンネル登録' : 0);
  const pop = spring({frame: frame - t, fps, config: {damping: 14}});
  const click = sub ? interpolate(frame, [t + 30, t + 36, t + 42], [1, 0.92, 1], clamp) : 1;
  const done = sub && frame > t + 36;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 50% 40%, #13121a 0%, ${K.black} 70%)`}} />
      {Array.from({length: 120}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: random(`sx${i}`) * 1920, top: BAR + random(`sy${i}`) * 700, width: 2, height: 2, borderRadius: 1, background: '#fff', opacity: 0.2 + 0.5 * random(`so${i}`) * (0.6 + 0.4 * Math.sin(frame / 20 + i))}} />
      ))}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <Reveal at={4} dur={40}>
          <svg width={90} height={90} viewBox="0 0 100 100">
            <path d="M62 12 A40 40 0 1 0 88 66 A32 32 0 1 1 62 12 Z" fill={K.paper} />
          </svg>
          <div style={{fontFamily: MINCHO, fontWeight: 700, fontSize: 96, color: K.paper, letterSpacing: '0.3em', marginTop: 20}}>{channel}</div>
          <div style={{fontFamily: MINCHO, fontSize: 30, color: K.dim, letterSpacing: '0.3em', marginTop: 18}}>{tagline}</div>
        </Reveal>
        {sub ? (
          <div style={{marginTop: 60, transform: `scale(${pop * click})`, display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: MINCHO, fontWeight: 700, fontSize: 34, padding: '16px 46px', borderRadius: 40, background: done ? '#3a3a3a' : K.paper, color: done ? K.paper : K.ink}}>
              {done ? '登録済み' : 'チャンネル登録'}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 既存の場面を、原稿の言葉で動かす版 ----------

/** 記者は出来事の外 → 中へ（enter の言葉で入り込み、story の言葉で「物語」になる）。 */
export const DiagramFull: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const t0 = scene.sentences[0].from;
  const enterAt = atFrame(scene, it.enter ?? '入り込み');
  const moveFrom = atFrame(scene, 'しかし');
  const storyAt = atFrame(scene, it.story ?? '物語の一部');
  const capAt = atFrame(scene, it.captionAt ?? 'ゴンゾー');
  const cy = 540;
  const R = 230;
  const cx = interpolate(frame, [enterAt + 10, enterAt + 60], [1120, 960], {...clamp, easing: ease});
  const ring = interpolate(frame, [t0, t0 + 40], [0, 1], {...clamp, easing: ease});
  const dotIn = interpolate(frame, [t0 + 20, t0 + 40], [0, 1], clamp);
  // 「しかし」から少し近づき、「入り込み」で中へ
  const near = interpolate(frame, [moveFrom, moveFrom + 60], [0, 0.35], {...clamp, easing: ease});
  const go = interpolate(frame, [enterAt - 30, enterAt], [0, 1], {...clamp, easing: ease});
  const move = Math.max(near, near + (1 - near) * go);
  const dx = interpolate(move, [0, 1], [560, cx]);
  const dy = interpolate(move, [0, 1], [cy + 40, cy]);
  const merged = interpolate(frame, [enterAt, enterAt + 20], [0, 1], clamp);
  const story = interpolate(frame, [storyAt + 6, storyAt + 30], [0, 1], clamp);
  const eventOut = interpolate(frame, [storyAt - 18, storyAt], [1, 0], clamp);
  const circ = 2 * Math.PI * R;
  const ripples = [0, 1, 2].map((k) => {
    const t = (frame - enterAt - k * 14) / 50;
    return t > 0 && t < 1 ? t : null;
  });
  const label = (text: string, color: string, o: number) => (
    <div style={{position: 'absolute', left: cx - 200, width: 400, top: cy - 130, textAlign: 'center', fontFamily: MINCHO, fontSize: 40, letterSpacing: '0.3em', color, opacity: o}}>{text}</div>
  );
  return (
    <AbsoluteFill style={{background: K.black}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(224,137,63,${0.1 + 0.12 * merged}) 0%, rgba(0,0,0,0) 45%)`}} />
      <Dust count={50} seed="diagram-full" opacity={0.3} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <circle cx={cx} cy={cy} r={R * (1 + 0.04 * merged * Math.sin(frame / 6) * (1 - story * 0.5))} fill="none" stroke={K.paper} strokeOpacity={0.75} strokeWidth={2} strokeDasharray={`${circ * ring} ${circ * 2}`} transform={`rotate(-90 ${cx} ${cy})`} />
        {ripples.map((t, k) => (t === null ? null : <circle key={k} cx={cx} cy={cy} r={R * (1 + t * 0.6)} fill="none" stroke={K.ember} strokeOpacity={0.5 * (1 - t)} strokeWidth={1.5} />))}
        <line x1={576} y1={cy + 40} x2={cx - R - 10} y2={cy + 10} stroke={K.paper} strokeOpacity={0.45 * dotIn * (1 - move)} strokeWidth={1.5} strokeDasharray="6 10" />
        <circle cx={dx} cy={dy} r={9 + 5 * merged} fill={merged > 0 ? K.ember : K.paper} opacity={dotIn} />
        <circle cx={dx} cy={dy} r={30 + 20 * merged} fill={K.ember} opacity={0.18 * dotIn * (0.3 + merged)} />
      </svg>
      {label(it.event ?? '出来事', K.paper, ring * eventOut)}
      {label('物語', K.ember, story)}
      <div style={{position: 'absolute', left: dx - 100, width: 200, top: dy + 34, textAlign: 'center', fontFamily: MINCHO, fontSize: 30, letterSpacing: '0.3em', color: K.paper, opacity: dotIn * (1 - merged)}}>{it.reporter ?? '記者'}</div>
      <div style={{position: 'absolute', right: 160, bottom: BAR + 60, color: K.dim}}>
        <Reveal at={capAt} dur={30}>
          <div style={{fontFamily: MINCHO, fontSize: 26, letterSpacing: '0.18em'}}>{it.caption}</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

/** 名前がジャンルになる（最初の文で名前を打ち、場面の終わりへ向けて名前が増えていく）。 */
export const GenreFull: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const name: string = scene.items.name;
  const s = scene.sentences[0];
  const typed = Math.floor(interpolate(frame, [s.from, s.from + 36], [0, name.length], clamp));
  const growFrom = atFrame(scene, 'ジャンル') - 60;
  const grow = interpolate(frame, [growFrom, scene.duration], [0, 1], {...clamp, easing: ease});
  const rows = 15;
  const cols = 4;
  return (
    <AbsoluteFill style={{background: K.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${1.0 - 0.32 * grow})`}}>
        {Array.from({length: rows * cols}, (_, i) => {
          const r = Math.floor(i / cols) - Math.floor(rows / 2);
          const c = (i % cols) - 1.5;
          if (r === 0 && Math.abs(c) < 1) return null;
          const appear = interpolate(grow, [random(`g${i}`) * 0.6, random(`g${i}`) * 0.6 + 0.25], [0, 1], clamp);
          return (
            <div key={i} style={{position: 'absolute', left: 960 + c * 780 - 330 + (r % 2 ? 140 : 0), top: 540 + r * 120 - 36, width: 660, textAlign: 'center', fontFamily: TYPE, fontSize: 58, color: K.paper, opacity: appear * (0.12 + 0.18 * random(`o${i}`)), whiteSpace: 'nowrap'}}>
              {name}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 0, right: 0, top: 540 - 44, textAlign: 'center', fontFamily: TYPE, fontSize: 74, color: K.paper, whiteSpace: 'pre'}}>
          {name.slice(0, typed)}
          <span style={{opacity: frame % 30 < 15 ? 1 : 0}}>▍</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 影が大きくなる（grow の文から伸び始め、場面の最後の文の終わりで伸びきる）。 */
const SHADOW_CLIP = 6 * 30;

export const ShadowFull: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const ss = scene.sentences;
  const start = atFrame(scene, it.grow ?? 1);
  const playLen = Math.max(30, ss[ss.length - 1].to - start);
  const rate = SHADOW_CLIP / playLen;
  const quoteAt = atFrame(scene, it.quoteAt ?? '');
  const push = interpolate(frame, [0, scene.duration], [1.0, 1.06], clamp);
  const shake = frame > quoteAt ? Math.sin(frame * 1.7) * 1.2 : 0;
  const video = <OffthreadVideo src={staticFile('kangaeru/k_shadow.mp4')} muted playbackRate={rate} style={{width: '100%', height: '100%'}} />;
  return (
    <AbsoluteFill style={{background: K.black}}>
      <AbsoluteFill style={{transform: `scale(${push}) translateX(${shake}px)`}}>
        <Bloom amount={0.35}>
          <AbsoluteFill>
            <Sequence durationInFrames={Math.max(1, start)}>
              <Freeze frame={0}>{video}</Freeze>
            </Sequence>
            <Sequence from={start} durationInFrames={playLen}>
              {video}
            </Sequence>
            <Sequence from={start + playLen}>
              <Freeze frame={playLen - 1}>{video}</Freeze>
            </Sequence>
          </AbsoluteFill>
        </Bloom>
      </AbsoluteFill>
      <LightBeam x={420} width={420} opacity={0.12} />
      <Dust count={45} seed={scene.id} opacity={0.35} />
      {it.quote ? (
        <div style={{position: 'absolute', left: 980, top: BAR + 120, fontFamily: MINCHO, fontWeight: 700, fontSize: 66, lineHeight: 1.6, letterSpacing: '0.12em', color: K.paper, whiteSpace: 'pre-line', textShadow: '0 0 30px rgba(0,0,0,0.9)', opacity: 0.92}}>
          <Reveal at={quoteAt} dur={36}>
            「{it.quote}」
          </Reveal>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
