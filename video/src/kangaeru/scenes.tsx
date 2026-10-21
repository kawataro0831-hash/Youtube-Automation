// 「考える夜」の場面（script.json の scenes[].type / id ごと）
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
import {phraseFrame, TLScene} from '../uratori/scenes';
import {Bloom, Dust, KenBurns, LightBeam, Reveal} from './fx';
import {BAR, K, MINCHO, SERIF_EN, TYPE} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const sentence = (scene: TLScene, i: number) => scene.sentences[Math.min(i, scene.sentences.length - 1)];

// ---------- 静止画（Blender）の場面 ----------

const STILL_LOOK: Record<string, {focus: [number, number]; filter?: string; bloom?: number; offsetY?: number}> = {
  louisville: {focus: [52, 40], bloom: 0.45},
  derby: {focus: [70, 45], bloom: 0.3},
  reporter: {focus: [45, 72], bloom: 0.35},
  us: {focus: [58, 45], filter: 'saturate(0.85)', bloom: 0.4},
  strings: {focus: [50, 0], bloom: 0.3, offsetY: 100}, // 上の黒帯で十字の板が隠れないよう下げる
};

export const StillScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const look = STILL_LOOK[scene.id] ?? {focus: [50, 50] as [number, number]};
  const it = scene.items;
  const s0 = sentence(scene, 0);
  const bg = (
    <KenBurns
      src={`kangaeru/${scene.clip}.jpg`}
      duration={scene.duration}
      move={it.move}
      focus={look.focus}
      filter={look.filter}
      offsetY={look.offsetY}
    />
  );
  return (
    <AbsoluteFill style={{background: K.black}}>
      {look.bloom ? <Bloom amount={look.bloom}>{bg}</Bloom> : bg}
      {scene.id === 'louisville' ? <PlaceCard scene={scene} at={s0.from + 8} /> : null}
      {scene.id === 'reporter' ? <NameCard scene={scene} /> : null}
      {scene.id === 'strings' ? (
        <>
          <LightBeam x={1010} width={560} opacity={0.22} />
          <Dust count={70} seed="strings" opacity={0.5} area={[640, 120, 760, 840]} />
        </>
      ) : null}
      {scene.id === 'reporter' || scene.id === 'derby' ? <Dust count={40} seed={scene.id} opacity={0.35} /> : null}
    </AbsoluteFill>
  );
};

const PlaceCard: React.FC<{scene: TLScene; at: number}> = ({scene, at}) => (
  <div style={{position: 'absolute', left: 150, bottom: BAR + 90, color: K.paper}}>
    <Reveal at={at} dur={30}>
      <div style={{fontFamily: SERIF_EN, fontWeight: 300, fontSize: 150, letterSpacing: '0.18em', lineHeight: 1}}>
        {scene.items.year}
      </div>
    </Reveal>
    <Reveal at={at + 14} dur={30}>
      <div style={{fontFamily: SERIF_EN, fontWeight: 500, fontSize: 30, letterSpacing: '0.55em', marginTop: 18}}>
        {scene.items.place}
      </div>
    </Reveal>
    <Reveal at={at + 24} dur={30}>
      <div style={{fontFamily: MINCHO, fontSize: 24, letterSpacing: '0.3em', marginTop: 14, color: K.dim}}>
        アメリカ・ケンタッキー州ルイビル
      </div>
    </Reveal>
  </div>
);

const NameCard: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const it = scene.items;
  const s = sentence(scene, it.nameAt ?? 1);
  const at = s.from - 4;
  const line = interpolate(frame, [at + 10, at + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', right: 150, top: BAR + 110, textAlign: 'right', color: K.paper}}>
      <Reveal at={at} dur={28}>
        <div style={{fontFamily: SERIF_EN, fontWeight: 500, fontSize: 64, letterSpacing: '0.32em'}}>{it.name}</div>
      </Reveal>
      <div style={{height: 1, background: K.line, width: 560 * line, marginLeft: 'auto', marginTop: 14, marginBottom: 18}} />
      <Reveal at={at + 12} dur={28}>
        <div style={{fontFamily: MINCHO, fontSize: 34, letterSpacing: '0.2em'}}>{it.nameJa}</div>
      </Reveal>
      <Reveal at={at + 20} dur={28}>
        <div style={{fontFamily: MINCHO, fontSize: 24, letterSpacing: '0.15em', color: K.dim, marginTop: 8}}>{it.role}</div>
      </Reveal>
    </div>
  );
};

// ---------- 記者は出来事の外に立つ → 中へ入り込む ----------

export const DiagramScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const [s4, s5, s6] = [0, 1, 2].map((i) => sentence(scene, i));
  const cy = 540;
  const R = 230;
  const enterAt0 = phraseFrame(s6, '入り込み');
  // 入り込んだあとは、輪ごと画面の中央へ寄せる
  const cx = interpolate(frame, [enterAt0 + 10, enterAt0 + 60], [1120, 960], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ring = interpolate(frame, [s4.from, s4.from + 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const dotIn = interpolate(frame, [s4.from + 20, s4.from + 40], [0, 1], clamp);
  // 記者の点: 外 → 出来事の中心へ（「入り込み」で中に入る）
  const enterAt = phraseFrame(s6, '入り込み');
  const move = interpolate(frame, [s5.from + 20, enterAt], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const dx = interpolate(move, [0, 1], [1120 - 560, cx]);
  const dy = interpolate(move, [0, 1], [cy + 40, cy]);
  const merged = interpolate(frame, [enterAt, enterAt + 20], [0, 1], clamp);
  const partAt = phraseFrame(s6, '物語の一部', false);
  const story = interpolate(frame, [partAt + 6, partAt + 30], [0, 1], clamp);
  const eventOut = interpolate(frame, [partAt - 18, partAt], [1, 0], clamp);
  const sight = interpolate(frame, [s4.from + 40, s4.from + 60], [0, 1], clamp) * (1 - move);
  const circ = 2 * Math.PI * R;
  // 入り込んだあと、出来事の輪が波打つ
  const ripples = [0, 1, 2].map((k) => {
    const t = (frame - enterAt - k * 14) / 50;
    return t > 0 && t < 1 ? t : null;
  });
  return (
    <AbsoluteFill style={{background: K.black}}>
      <AbsoluteFill
        style={{background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(224,137,63,${0.1 + 0.12 * merged}) 0%, rgba(0,0,0,0) 45%)`}}
      />
      <Dust count={50} seed="diagram" opacity={0.3} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <circle
          cx={cx}
          cy={cy}
          r={R * (1 + 0.04 * merged * Math.sin(frame / 6) * (1 - story * 0.5))}
          fill="none"
          stroke={K.paper}
          strokeOpacity={0.75}
          strokeWidth={2}
          strokeDasharray={`${circ * ring} ${circ * 2}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {ripples.map((t, k) =>
          t === null ? null : (
            <circle key={k} cx={cx} cy={cy} r={R * (1 + t * 0.6)} fill="none" stroke={K.ember} strokeOpacity={0.5 * (1 - t)} strokeWidth={1.5} />
          ),
        )}
        {/* 外から見る視線 */}
        <line
          x1={1120 - 560 + 16}
          y1={cy + 40}
          x2={cx - R - 10}
          y2={cy + 10}
          stroke={K.paper}
          strokeOpacity={0.45 * sight}
          strokeWidth={1.5}
          strokeDasharray="6 10"
        />
        <circle cx={dx} cy={dy} r={9 + 5 * merged} fill={merged > 0 ? K.ember : K.paper} opacity={dotIn} />
        <circle cx={dx} cy={dy} r={30 + 20 * merged} fill={K.ember} opacity={0.18 * dotIn * (0.3 + merged)} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: cx - 200,
          width: 400,
          top: cy - 130,
          textAlign: 'center',
          fontFamily: MINCHO,
          fontSize: 40,
          letterSpacing: '0.3em',
          color: K.paper,
          opacity: ring * eventOut,
        }}
      >
        {scene.items.event}
      </div>
      <div
        style={{
          position: 'absolute',
          left: cx - 200,
          width: 400,
          top: cy - 130,
          textAlign: 'center',
          fontFamily: MINCHO,
          fontSize: 40,
          letterSpacing: '0.3em',
          color: K.ember,
          opacity: story,
        }}
      >
        物語
      </div>
      <div
        style={{
          position: 'absolute',
          left: dx - 100,
          width: 200,
          top: dy + 34,
          textAlign: 'center',
          fontFamily: MINCHO,
          fontSize: 30,
          letterSpacing: '0.3em',
          color: K.paper,
          opacity: dotIn * (1 - merged),
        }}
      >
        {scene.items.reporter}
      </div>
      <div style={{position: 'absolute', right: 160, bottom: BAR + 60, color: K.dim}}>
        <Reveal at={s6.to - 40} dur={30}>
          <div style={{fontFamily: MINCHO, fontSize: 26, letterSpacing: '0.18em'}}>― のちに「ゴンゾー・ジャーナリズム」と呼ばれる</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 名前が、ひとつのジャンルになる ----------

export const GenreScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sentence(scene, 0);
  const name: string = scene.items.name;
  const typed = Math.floor(interpolate(frame, [s.from - 6, s.from + 30], [0, name.length], clamp));
  const grow = interpolate(frame, [s.from + 34, scene.duration], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const zoom = 1.0 - 0.32 * grow;
  const rows = 15;
  const cols = 4;
  return (
    <AbsoluteFill style={{background: K.black, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        {Array.from({length: rows * cols}, (_, i) => {
          const r = Math.floor(i / cols) - Math.floor(rows / 2);
          const c = (i % cols) - 1.5;
          if (r === 0 && Math.abs(c) < 1) return null;
          const appear = interpolate(grow, [random(`g${i}`) * 0.6, random(`g${i}`) * 0.6 + 0.25], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 960 + c * 780 - 330 + (r % 2 ? 140 : 0),
                top: 540 + r * 120 - 36,
                width: 660,
                textAlign: 'center',
                fontFamily: TYPE,
                fontSize: 58,
                color: K.paper,
                opacity: appear * (0.12 + 0.18 * random(`o${i}`)),
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 540 - 44,
            textAlign: 'center',
            fontFamily: TYPE,
            fontSize: 74,
            color: K.paper,
            whiteSpace: 'pre',
          }}
        >
          {name.slice(0, typed)}
          <span style={{opacity: frame % fps < fps / 2 ? 1 : 0}}>▍</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 影が本人より大きくなる ----------

const SHADOW_CLIP = 6 * 30; // k_shadow.mp4（6秒）を 30fps に直したフレーム数

export const ShadowScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const s9 = sentence(scene, 1);
  const start = s9.from;
  const playLen = Math.max(30, phraseFrame(s9, '要求し始める') - start);
  const rate = SHADOW_CLIP / playLen;
  const quoteAt = phraseFrame(s9, 'お前は', false);
  const push = interpolate(frame, [0, scene.duration], [1.0, 1.06], clamp);
  const shake = frame > quoteAt ? Math.sin(frame * 1.7) * 1.2 : 0;
  const video = (
    <OffthreadVideo src={staticFile('kangaeru/k_shadow.mp4')} muted playbackRate={rate} style={{width: '100%', height: '100%'}} />
  );
  return (
    <AbsoluteFill style={{background: K.black}}>
      <AbsoluteFill style={{transform: `scale(${push}) translateX(${shake}px)`}}>
        <Bloom amount={0.35}>
          <AbsoluteFill>
            <Sequence durationInFrames={start}>
              <Freeze frame={0}>{video}</Freeze>
            </Sequence>
            <Sequence from={start} durationInFrames={playLen}>
              {video}
            </Sequence>
            {/* 再生し終えたら最後のコマで止める */}
            <Sequence from={start + playLen}>
              <Freeze frame={playLen - 1}>{video}</Freeze>
            </Sequence>
          </AbsoluteFill>
        </Bloom>
      </AbsoluteFill>
      <LightBeam x={420} width={420} opacity={0.12} />
      <Dust count={45} seed="shadow" opacity={0.35} />
      <div
        style={{
          position: 'absolute',
          left: 980,
          top: BAR + 120,
          fontFamily: MINCHO,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.6,
          letterSpacing: '0.12em',
          color: K.paper,
          whiteSpace: 'pre-line',
          textShadow: '0 0 30px rgba(0,0,0,0.9)',
          opacity: 0.92,
        }}
      >
        <Reveal at={quoteAt} dur={36}>
          「{scene.items.quote}」
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

// ---------- タイトル ----------

export const TitleScene: React.FC<{scene: TLScene; channel: string; subtitle: string}> = ({scene, channel, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sentence(scene, scene.items.titleAt ?? 1);
  const lines: string[] = scene.items.title.split('\n');
  const at = s.from - 4;
  const hit = spring({frame: frame - at, fps, config: {damping: 200}, durationInFrames: 40});
  const end = interpolate(frame, [scene.duration - 24, scene.duration], [1, 0], clamp);
  let k = 0;
  return (
    <AbsoluteFill style={{background: K.black, opacity: end}}>
      <AbsoluteFill
        style={{background: `radial-gradient(ellipse at 50% 46%, rgba(224,137,63,${0.08 * hit}) 0%, rgba(0,0,0,0) 55%)`}}
      />
      <Dust count={80} seed="title" opacity={0.4} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${1.04 - 0.04 * hit})`}}>
        <div style={{textAlign: 'center', marginTop: -30}}>
          {lines.map((ln, li) => (
            <div key={li} style={{fontFamily: MINCHO, fontWeight: 700, fontSize: li === 1 ? 104 : 88, lineHeight: 1.42, color: K.paper}}>
              {Array.from(ln).map((ch) => {
                const i = k++;
                const p = interpolate(frame, [at + i * 1.6, at + i * 1.6 + 18], [0, 1], clamp);
                return (
                  <span key={i} style={{display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 8}px)`}}>
                    {ch}
                  </span>
                );
              })}
            </div>
          ))}
          <Reveal at={at + 40} dur={30}>
            <div style={{fontFamily: MINCHO, fontSize: 28, letterSpacing: '0.35em', color: K.dim, marginTop: 40}}>{subtitle}</div>
          </Reveal>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: BAR + 40, textAlign: 'center'}}>
        <Reveal at={at + 60} dur={30}>
          <div style={{fontFamily: MINCHO, fontSize: 26, letterSpacing: '0.6em', color: K.dim}}>{channel}</div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
