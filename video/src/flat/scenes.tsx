// 場面の型（script.json の scenes[].type）ごとの画面。絵はすべて kit.tsx の部品をコードで組んで作る。
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import type {TLScene} from '../uratori/scenes';
import {phraseFrame} from '../uratori/scenes';
import {clamp, Critter, Glow, Hills, hillY, Layer, Motes, Pill, Planet, SkyBg, SpaceBg, Stars, Sun, useCam} from './kit';
import {P, ROUND} from './theme';

const ease = Easing.inOut(Easing.cubic);

/** 地上から空を見上げる（昼／夜）。 */
export const SkyScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const night = scene.items.time === 'night';
  const cam = useCam(scene.duration, {zoom: 1, y: 0}, {zoom: 1.07, y: -24});
  const s = scene.sentences[0];
  const cx = 640;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SkyBg time={night ? 'night' : 'day'} />
      {night ? (
        <Layer cam={cam} depth={0.08}>
          {/* 天の川: 斜めに伸ばした光の帯 */}
          <div
            style={{
              position: 'absolute',
              left: 200,
              top: 120,
              width: 1700,
              height: 260,
              transform: 'rotate(-18deg)',
              background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(170,190,255,0.32), rgba(170,190,255,0) 70%)',
              filter: 'blur(30px)',
            }}
          />
          <Stars seed="night-far" count={260} size={1.6} />
          <Stars seed="night-near" count={60} size={2.6} />
        </Layer>
      ) : (
        <Layer cam={cam} depth={0.15}>
          <Glow amount={0.5} radius={40}>
            <Sun x={1360} y={320} r={110} seed="sky-sun" detail={false} />
          </Glow>
        </Layer>
      )}
      <Hills cam={cam} time={night ? 'night' : 'day'}>
        <Critter x={cx} y={hillY(cx) + 6} size={170} look={0.9} color={night ? '#d9507f' : P.pink} />
      </Hills>
      <Motes seed={`motes-${scene.id}`} count={night ? 25 : 18} opacity={night ? 0.35 : 0.3} />
      {night ? (
        <Pill at={phraseFrame(s, '過去を見ている', false)} x={1260} y={430} size={58}>
          過去を見ている
        </Pill>
      ) : null}
    </AbsoluteFill>
  );
};

/** 太陽の大写し。「いま」の太陽ではない、を札で見せる。 */
export const SunScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const cam = useCam(scene.duration, {zoom: 1}, {zoom: 1.1});
  const s = scene.sentences[0];
  const at = phraseFrame(s, 'いま', false);
  const no = phraseFrame(s, 'ではない', false);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SpaceBg />
      <Layer cam={cam} depth={0.2}>
        <Stars seed="sun-bg" count={160} size={1.6} opacity={0.6} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <Glow amount={0.55} radius={50}>
          <Sun x={960} y={470} r={270} seed="big-sun" />
        </Glow>
      </Layer>
      <Motes seed="sun-motes" count={30} color={P.sunHot} opacity={0.4} />
      <Pill at={at} out={no - 6} x={960} y={860} size={60}>
        「いま」？
      </Pill>
      <Pill at={no} x={960} y={860} size={60} bg={P.sun} color={P.space0}>
        {scene.items.label}
      </Pill>
    </AbsoluteFill>
  );
};

/** 太陽と地球のあいだを測る線と数字（太陽〜地球の場面で共通の配置）。 */
const SUN_X = -150;
const EARTH_X = 1640;
const ROW_Y = 470;

const SunEarth: React.FC<{earthR?: number}> = ({earthR = 50}) => (
  <>
    <Glow amount={0.5} radius={60}>
      <Sun x={SUN_X} y={ROW_Y} r={400} seed="side-sun" />
    </Glow>
    <Planet x={EARTH_X} y={ROW_Y} r={earthR} seed="earth-small" light={Math.PI} spin={0.12} />
    <div
      style={{
        position: 'absolute',
        left: EARTH_X - 100,
        top: ROW_Y + earthR + 22,
        width: 200,
        textAlign: 'center',
        fontFamily: ROUND,
        fontWeight: 800,
        fontSize: 32,
        color: P.dim,
      }}
    >
      地球
    </div>
  </>
);

const okuMan = (man: number): string => {
  const oku = Math.floor(man / 10000);
  const rest = Math.round(man % 10000);
  if (oku === 0) return `${rest.toLocaleString('ja-JP')}万`;
  return rest === 0 ? `${oku}億` : `${oku}億${rest}万`;
};

/** 太陽から地球までの距離を、伸びる線と数え上がる数字で見せる。 */
export const DistanceScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const cam = useCam(scene.duration, {x: -30, zoom: 1.04}, {x: 30, zoom: 1});
  const s = scene.sentences[0];
  const a = phraseFrame(s, 'およそ', false);
  const b = phraseFrame(s, 'キロメートル', true);
  const p = interpolate(frame, [a, b], [0, 1], {...clamp, easing: ease});
  const x0 = 290;
  const x1 = EARTH_X - 80;
  const man = Math.round((scene.items.value / 10000) * p / 500) * 500; // 500万きざみで数える
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SpaceBg />
      <Layer cam={cam} depth={0.15}>
        <Stars seed="dist-bg" count={180} size={1.5} opacity={0.7} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <SunEarth />
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line x1={x0} y1={ROW_Y + 170} x2={x0 + (x1 - x0) * p} y2={ROW_Y + 170} stroke={P.text} strokeWidth={6} strokeLinecap="round" />
          <line x1={x0} y1={ROW_Y + 145} x2={x0} y2={ROW_Y + 195} stroke={P.text} strokeWidth={6} strokeLinecap="round" />
          <line
            x1={x1}
            y1={ROW_Y + 145}
            x2={x1}
            y2={ROW_Y + 195}
            stroke={P.text}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={p > 0.98 ? 1 : 0}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: ROW_Y + 220,
            textAlign: 'center',
            fontFamily: ROUND,
            fontWeight: 800,
            fontSize: 96,
            color: P.text,
            opacity: interpolate(frame, [a, a + 8], [0, 1], clamp),
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {p >= 1 ? scene.items.display : `${okuMan(man)} km`}
        </div>
      </Layer>
    </AbsoluteFill>
  );
};

/** 光の粒が太陽から地球へ進む。タイマーが 8分20秒 に届くと地球に着く。 */
export const PhotonScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const cam = useCam(scene.duration, {zoom: 1}, {zoom: 1.03});
  const [s3, s4] = scene.sentences;
  const start = s3.from + 6;
  const end = s4 ? phraseFrame(s4, '8分20秒', true) : scene.duration - 20;
  const p = interpolate(frame, [start, end], [0, 1], clamp);
  const x0 = 260;
  const x1 = EARTH_X - 52;
  const px = x0 + (x1 - x0) * p;
  const sec = Math.round(p * scene.items.seconds);
  const arrived = frame >= end;
  const flash = interpolate(frame, [end, end + 4, end + 24], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SpaceBg />
      <Layer cam={cam} depth={0.15}>
        <Stars seed="dist-bg" count={180} size={1.5} opacity={0.7} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <SunEarth />
        <Glow amount={0.9} radius={18}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <defs>
              <linearGradient id="fl-trail" x1="0" x2="1">
                <stop offset="0%" stopColor={P.light} stopOpacity={0} />
                <stop offset="100%" stopColor={P.light} stopOpacity={0.9} />
              </linearGradient>
            </defs>
            {!arrived ? (
              <>
                <rect x={Math.max(x0, px - 260)} y={ROW_Y - 4} width={Math.min(260, px - x0)} height={8} rx={4} fill="url(#fl-trail)" />
                <circle cx={px} cy={ROW_Y} r={13} fill={P.light} />
              </>
            ) : null}
            <circle cx={EARTH_X} cy={ROW_Y} r={50 + flash * 40} fill={P.light} opacity={flash * 0.7} />
          </svg>
        </Glow>
      </Layer>
      <Pill at={phraseFrame(s3, '30万キロメートル', false)} out={s4 ? s4.from - 8 : undefined} x={960} y={250} size={56}>
        {scene.items.speed}
      </Pill>
      {s4 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: ROW_Y + 170,
            textAlign: 'center',
            fontFamily: ROUND,
            fontWeight: 800,
            fontSize: 120,
            color: arrived ? P.sun : P.text,
            opacity: interpolate(frame, [s4.from - 6, s4.from + 4], [0, 1], clamp),
            fontVariantNumeric: 'tabular-nums',
            textShadow: arrived ? `0 0 40px ${P.sunEdge}` : 'none',
          }}
        >
          {Math.floor(sec / 60)}分{String(sec % 60).padStart(2, '0')}秒
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** 地球と月。月から光が何度も届く（1往復ではなく片道 約1.3秒）。 */
export const MoonScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const cam = useCam(scene.duration, {x: 20, zoom: 1}, {x: -20, zoom: 1.05});
  const s = scene.sentences[0];
  const ex = 560;
  const ey = 520;
  const er = 230;
  const mx = 1460;
  const my = 400;
  const mr = 72;
  const LEG = 39; // 1.3秒（30fps）
  const t0 = s.from;
  const k = frame - t0;
  const q = k >= 0 ? (k % (LEG + 12)) / LEG : -1;
  const show = q >= 0 && q <= 1;
  const px = mx + (ex + er - mx) * Math.min(1, q);
  const py = my + (ey - my) * Math.min(1, q);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SpaceBg />
      <Layer cam={cam} depth={0.15}>
        <Stars seed="moon-bg" count={200} size={1.5} opacity={0.75} />
      </Layer>
      <Layer cam={cam} depth={0.8}>
        <Planet x={mx} y={my} r={mr} seed="moon" kind="moon" light={Math.PI * 0.85} spin={0.06} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <Planet x={ex} y={ey} r={er} seed="earth-big" light={Math.PI * 0.85} spin={0.35} />
        <Glow amount={0.9} radius={14}>
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {show ? <circle cx={px} cy={py} r={9} fill={P.light} /> : null}
          </svg>
        </Glow>
      </Layer>
      <Pill at={phraseFrame(s, '1.3秒', false)} x={1250} y={640} size={60} bg={P.moon} color={P.space0}>
        {scene.items.label}
      </Pill>
    </AbsoluteFill>
  );
};

/** 太陽から引いていき、星の海の中で一番近い星を示す。 */
export const StarsScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const s = scene.sentences[0];
  const zoomEnd = Math.round(scene.duration * 0.45);
  const zoom = interpolate(frame, [0, zoomEnd], [3.2, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const cam = {x: 0, y: 0, zoom};
  const sx = 760;
  const sy = 600;
  const tx = 1390;
  const ty = 330;
  const mark = phraseFrame(s, '近い星', true);
  const line = interpolate(frame, [mark, mark + 24], [0, 1], {...clamp, easing: ease});
  const ring = (frame - mark) / 30;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SpaceBg />
      <Layer cam={cam} depth={0.25}>
        <Stars seed="deep-far" count={420} size={1.3} />
      </Layer>
      <Layer cam={cam} depth={0.6}>
        <Stars seed="deep-mid" count={120} size={2} />
      </Layer>
      <Layer cam={cam} depth={1} style={{transformOrigin: `${(sx / 1920) * 100}% ${(sy / 1080) * 100}%`}}>
        <Glow amount={0.7} radius={20}>
          <Sun x={sx} y={sy} r={26} seed="tiny-sun" detail={false} />
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <circle cx={tx} cy={ty} r={10} fill={P.starWarm} />
          </svg>
        </Glow>
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <line
            x1={sx}
            y1={sy}
            x2={sx + (tx - sx) * line}
            y2={sy + (ty - sy) * line}
            stroke={P.text}
            strokeWidth={4}
            strokeDasharray="4 14"
            strokeLinecap="round"
            opacity={0.8}
          />
          {ring >= 0
            ? [0, 0.5].map((d) => {
                const t = (ring + d) % 1;
                return <circle key={d} cx={tx} cy={ty} r={14 + t * 50} fill="none" stroke={P.starWarm} strokeWidth={3} opacity={1 - t} />;
              })
            : null}
        </svg>
        <div style={{position: 'absolute', left: sx - 100, top: sy + 40, width: 200, textAlign: 'center', fontFamily: ROUND, fontWeight: 800, fontSize: 30, color: P.dim, opacity: interpolate(frame, [zoomEnd - 10, zoomEnd + 10], [0, 1], clamp)}}>
          太陽
        </div>
      </Layer>
      <Pill at={mark + 10} x={tx} y={ty + 110} size={40}>
        {scene.items.name}
      </Pill>
      <Pill at={phraseFrame(s, '4年以上', false)} x={tx} y={ty + 200} size={52} bg={P.starWarm} color={P.space0}>
        {scene.items.dist}
      </Pill>
    </AbsoluteFill>
  );
};

/** 締めの一文とチャンネル名。 */
export const TitleScene: React.FC<{scene: TLScene; channel: string}> = ({scene, channel}) => {
  const frame = useCurrentFrame();
  const cam = useCam(scene.duration, {zoom: 1.04}, {zoom: 1});
  const s = scene.sentences[0];
  const o = interpolate(frame, [s.from - 4, s.from + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const o2 = interpolate(frame, [s.to + 4, s.to + 24], [0, 1], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <SkyBg time="night" />
      <Layer cam={cam} depth={0.1}>
        <Stars seed="title-far" count={300} size={1.6} />
      </Layer>
      <Hills cam={cam} time="night" seed="title-hill">
        <Critter x={1500} y={hillY(1500, 0, 'title-hill') + 6} size={120} look={1} color="#d9507f" seed="title-critter" />
      </Hills>
      <div
        lang="ja"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 330,
          textAlign: 'center',
          fontFamily: ROUND,
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.35,
          color: P.text,
          opacity: o,
          transform: `translateY(${(1 - o) * 24}px)`,
          textShadow: '0 0 40px rgba(124,196,255,0.35)',
        }}
      >
        見上げた空は、
        <br />
        ぜんぶ過去。
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 640,
          textAlign: 'center',
          fontFamily: ROUND,
          fontWeight: 500,
          fontSize: 36,
          letterSpacing: '0.2em',
          color: P.dim,
          opacity: o2,
        }}
      >
        {channel}
      </div>
    </AbsoluteFill>
  );
};
