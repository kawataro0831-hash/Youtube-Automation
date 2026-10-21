// 場面の型（script.json の scenes[].type）ごとの画面
import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Drift, LogoMark, Marker, Rise, Sheet, SheetHeader, SourceTag, ViewTag, WithMark} from './kit';
import {C, SANS} from './theme';

export type TLSentence = {id: string; text: string; from: number; to: number};
export type TLSource = {id: string; kind: string; name: string; url: string; status: string};
export type TLScene = {
  id: string;
  type: string;
  from: number;
  duration: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any;
  clip?: string | null;
  sources: TLSource[];
  sentences: TLSentence[];
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 文の中で phrase を言い終える（end=false なら言い始める）おおよそのフレーム。文字数の比で見積もる。 */
export const phraseFrame = (s: TLSentence, phrase: string, end = true): number => {
  const i = s.text.indexOf(phrase);
  if (i < 0) return end ? s.to : s.from;
  const pos = end ? i + phrase.length : i;
  return Math.round(s.from + (pos / s.text.length) * (s.to - s.from));
};

const Tag: React.FC<{scene: TLScene}> = ({scene}) =>
  scene.sources.length ? <SourceTag kind={scene.sources[0].kind} name={scene.sources[0].name} /> : null;

// Blender で描いた3Dのカット（秒数は blender/shots.py の書き出しと合わせる）
const CLIP_SECONDS: Record<string, number> = {shot_a_papers: 7, shot_b_magnifier: 6};

const Clip: React.FC<{clip: string; duration: number}> = ({clip, duration}) => {
  const {fps} = useVideoConfig();
  const len = (CLIP_SECONDS[clip] ?? 6) * fps;
  // 場面がカットより長いときだけゆっくり再生して最後まで使う
  const rate = Math.min(1, len / duration);
  return (
    <OffthreadVideo
      src={staticFile(`blender/${clip}.mp4`)}
      muted
      playbackRate={rate}
      style={{width: '100%', height: '100%', objectFit: 'cover'}}
    />
  );
};

export const OpenScene: React.FC<{scene: TLScene; channel: string}> = ({scene}) => {
  const frame = useCurrentFrame();
  const s = scene.sentences[0];
  const t0 = s.from + 6;
  const fade = interpolate(frame, [0, 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: C.desk, opacity: fade}}>
      <Clip clip={scene.clip ?? 'shot_a_papers'} duration={scene.duration} />
      <AbsoluteFill
        style={{background: 'linear-gradient(90deg, rgba(15,14,12,0.78) 0%, rgba(15,14,12,0.35) 45%, rgba(0,0,0,0) 70%)'}}
      />
      <div style={{position: 'absolute', left: 110, bottom: 150, fontFamily: SANS, color: '#fff'}}>
        <Rise at={t0}>
          <div style={{fontSize: 34, fontWeight: 500, letterSpacing: '0.2em', opacity: 0.85}}>{scene.items.kicker}</div>
        </Rise>
        <Rise at={t0 + 8}>
          <div style={{fontSize: 108, fontWeight: 900, lineHeight: 1.25, marginTop: 18, letterSpacing: '0.02em'}}>
            <WithMark text={scene.items.title} mark="裏側" start={t0 + 30} box />
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const TurnScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const s = scene.sentences[0];
  return (
    <AbsoluteFill style={{background: C.desk}}>
      <Clip clip={scene.clip ?? 'shot_b_magnifier'} duration={scene.duration} />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(15,14,12,0.7) 0%, rgba(0,0,0,0) 45%)'}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 120,
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 92,
          color: '#fff',
        }}
      >
        <Rise at={s.from}>
          <WithMark text={scene.items.text} mark={scene.items.mark} start={phraseFrame(s, scene.items.mark)} box />
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

export const NewsScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = scene.sentences[0];
  const words: string[] = scene.items.words ?? [];
  const chips = [
    {x: 150, y: 210, r: -6},
    {x: 1330, y: 260, r: 5},
    {x: 230, y: 790, r: -3},
  ];
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Drift duration={scene.duration} to={1.04}>
        {words.map((w, i) => {
          const p = spring({frame: frame - (s.from + 4 + i * 7), fps, config: {damping: 14, mass: 0.6}});
          const c = chips[i % chips.length];
          return (
            <div
              key={w}
              style={{
                position: 'absolute',
                left: c.x,
                top: c.y,
                transform: `rotate(${c.r}deg) scale(${0.6 + 0.4 * p})`,
                opacity: p * 0.9,
                background: '#dcdbd6',
                color: '#6b6b67',
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 64,
                padding: '14px 30px',
                boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
              }}
            >
              {w}
            </div>
          );
        })}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <Rise at={s.from}>
            <div style={{fontFamily: SANS, fontSize: 30, fontWeight: 500, color: C.sub, textAlign: 'center', marginBottom: 26}}>
              {scene.items.label}
            </div>
            <Sheet width={980} rotate={-1} style={{borderLeft: `14px solid ${C.press}`}}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 104,
                  lineHeight: 1.35,
                  padding: '64px 80px 56px 110px',
                  whiteSpace: 'pre-line',
                  position: 'relative',
                  color: C.ink,
                }}
              >
                <span style={{position: 'absolute', left: 26, top: -36, fontSize: 200, color: '#c4c2bb', lineHeight: 1}}>“</span>
                {scene.items.quote}
              </div>
            </Sheet>
          </Rise>
        </AbsoluteFill>
      </Drift>
      <Tag scene={scene} />
    </AbsoluteFill>
  );
};

export const DotsScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const s = scene.sentences[0];
  const it = scene.items;
  const cols = 6;
  const dotsIn = s.from + 6;
  const hitAt = phraseFrame(s, '半分', false);
  const numberAt = phraseFrame(s, '18件');
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Drift duration={scene.duration} to={1.035} x={-10}>
        <div style={{position: 'absolute', left: 120, top: 110}}>
          <Rise at={2}>
            <Sheet width={720} rotate={-1.2}>
              <SheetHeader title={it.paper} />
              <div style={{padding: '30px 40px 44px', fontFamily: SANS}}>
                <div style={{fontSize: 34, fontWeight: 700, color: C.ink, marginBottom: 6}}>{it.heading}</div>
                <div style={{fontSize: 26, color: C.sub, marginBottom: 26}}>{it.caption}</div>
                <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, width: 470}}>
                  {Array.from({length: it.total}, (_, i) => {
                    const appear = interpolate(frame, [dotsIn + i * 0.8, dotsIn + i * 0.8 + 6], [0, 1], clamp);
                    const hit = i < it.hit;
                    const fill = hit ? interpolate(frame, [hitAt + i * 1.2, hitAt + i * 1.2 + 5], [0, 1], clamp) : 0;
                    return (
                      <div
                        key={i}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          border: `4px solid ${C.ink}`,
                          background: fill > 0 ? C.marker : 'transparent',
                          opacity: appear * (hit ? 1 : 1 - 0.55 * interpolate(frame, [hitAt, hitAt + 20], [0, 1], clamp)),
                          transform: `scale(${0.6 + 0.4 * appear + 0.08 * fill})`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </Sheet>
          </Rise>
        </div>
        <div style={{position: 'absolute', left: 1140, top: 330, fontFamily: SANS, color: C.ink}}>
          <Rise at={numberAt - 6}>
            <div style={{fontSize: 46, fontWeight: 700}}>{it.hitLabel}</div>
            <div style={{fontSize: 200, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em'}}>
              <Marker start={numberAt + 4} dur={14}>
                {it.hit}
              </Marker>
              <span style={{fontSize: 72, fontWeight: 700}}>
                {' '}/ {it.total}
                {it.unit}
              </span>
            </div>
            <div style={{fontSize: 44, fontWeight: 700, marginTop: 10}}>＝ ちょうど半分</div>
          </Rise>
        </div>
      </Drift>
      <Tag scene={scene} />
    </AbsoluteFill>
  );
};

export const BarsScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const s = scene.sentences[0];
  const it = scene.items;
  const max = 40;
  const growAt = s.from + 8;
  const topAt = phraseFrame(s, 'トップ');
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Drift duration={scene.duration} to={1.035} x={10}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <Rise at={2}>
            <Sheet width={1500} rotate={0.8}>
              <SheetHeader title={it.paper} />
              <div style={{padding: '36px 56px 56px', fontFamily: SANS, color: C.ink}}>
                <div style={{fontSize: 40, fontWeight: 700}}>{it.heading}</div>
                <div style={{fontSize: 24, color: C.sub, marginTop: 6, marginBottom: 40}}>原文: {it.original}</div>
                {it.bars.map((b: {label: string; value: number; mark?: boolean}, i: number) => {
                  const at = b.mark ? topAt - 10 : growAt;
                  const p = interpolate(frame, [at, at + 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
                  return (
                    <div key={b.label} style={{display: 'flex', alignItems: 'center', marginBottom: i === 0 ? 34 : 0}}>
                      <div style={{width: 200, fontSize: 36, fontWeight: 700}}>{b.label}</div>
                      <div
                        style={{
                          height: 96,
                          width: (b.value / max) * 960 * p,
                          background: b.mark ? C.marker : '#cfcdc6',
                          border: `4px solid ${C.ink}`,
                          borderLeftWidth: 4,
                        }}
                      />
                      <div style={{fontSize: 76, fontWeight: 900, marginLeft: 26, opacity: p}}>
                        {Math.round(b.value * p)}
                        <span style={{fontSize: 40}}>{it.unit}</span>
                      </div>
                      {b.mark ? (
                        <div
                          style={{
                            marginLeft: 30,
                            background: C.ink,
                            color: '#fff',
                            fontSize: 34,
                            fontWeight: 900,
                            padding: '8px 20px',
                            opacity: interpolate(frame, [topAt + 14, topAt + 24], [0, 1], clamp),
                          }}
                        >
                          {it.badge}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Sheet>
          </Rise>
        </AbsoluteFill>
      </Drift>
      <Tag scene={scene} />
    </AbsoluteFill>
  );
};

export const KeyMsgScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const it = scene.items;
  const s0 = scene.sentences[0];
  const lines: string[] = it.lines;
  const subS = it.sub ? scene.sentences[it.subAt ?? 1] : null;
  return (
    <AbsoluteFill style={{background: C.ink, justifyContent: 'center', alignItems: 'center'}}>
      <Drift duration={scene.duration} to={1.03}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: SANS, color: '#fff'}}>
          <div style={{textAlign: 'center', transform: subS ? 'translateY(-60px)' : undefined}}>
            {lines.map((ln, i) => (
              <Rise key={ln} at={s0.from + i * 10}>
                <div style={{fontSize: 118, fontWeight: 900, lineHeight: 1.4}}>
                  <WithMark text={ln} mark={it.mark} start={phraseFrame(s0, it.mark)} box />
                </div>
              </Rise>
            ))}
          </div>
          {subS ? (
            <div style={{position: 'absolute', top: 700, textAlign: 'center'}}>
              <Rise at={subS.from}>
                <div style={{fontSize: 48, fontWeight: 500, opacity: 0.92}}>{it.sub}</div>
              </Rise>
              {it.tag ? (
                <div style={{marginTop: 30}}>
                  <ViewTag label={it.tag} at={phraseFrame(subS, '有力な見方', false)} dark />
                </div>
              ) : null}
            </div>
          ) : null}
        </AbsoluteFill>
      </Drift>
    </AbsoluteFill>
  );
};

export const QuestionScene: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = scene.sentences[0];
  const pop = spring({frame: frame - s.from, fps, config: {damping: 10, mass: 0.5}});
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Drift duration={scene.duration} to={1.03}>
        <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80}}>
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: 130,
              background: C.marker,
              border: `8px solid ${C.ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 190,
              color: C.ink,
              transform: `scale(${pop}) rotate(${(1 - pop) * -20}deg)`,
            }}
          >
            ?
          </div>
          <Rise at={s.from + 6}>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 92, lineHeight: 1.45, color: C.ink, whiteSpace: 'pre-line'}}>
              {scene.items.text}
            </div>
          </Rise>
        </AbsoluteFill>
      </Drift>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{scene: TLScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const s = scene.sentences[0];
  const draw = interpolate(frame, [s.from - 4, s.from + 26], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: C.paper, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 50}}>
        <LogoMark size={250} draw={draw} />
        <div style={{fontFamily: SANS, color: C.ink}}>
          <Rise at={s.from + 4}>
            <div style={{fontSize: 170, fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1.1}}>{scene.items.name}</div>
          </Rise>
          <Rise at={phraseFrame(s, 'テクノロジー', false)}>
            <div style={{fontSize: 46, fontWeight: 700, marginTop: 18}}>
              <WithMark text={scene.items.tagline} mark="一次情報" start={phraseFrame(s, '一次情報')} />
            </div>
          </Rise>
        </div>
      </div>
    </AbsoluteFill>
  );
};
