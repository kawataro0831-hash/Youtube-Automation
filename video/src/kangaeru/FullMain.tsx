// 「考える夜」本編（フル尺）: generated/<回>.json の場面を順に並べる
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {Timeline} from '../uratori/Main';
import type {TLScene} from '../uratori/scenes';
import {useFontsReady} from '../useFontsReady';
import {FilmGrain, Letterbox, Sub, Subtitles, Vignette} from './fx';
import {
  ArrowScene,
  BranchesScene,
  ChapterCard,
  CtaScene,
  DiagramFull,
  ForkScene,
  FullStill,
  GenreFull,
  KeyScene,
  LoopScene,
  NetworkScene,
  QuoteScene,
  ShadowFull,
  VersionScene,
  WordsScene,
} from './full';
import {TitleScene} from './scenes';
import {BAR, K, MINCHO} from './theme';

const OVERLAP = 14;
// 画面に言葉そのものを大きく出す場面では、下の字幕は出さない（同じ文が2つ並ぶため）
const NO_SUBS = new Set(['words', 'quote', 'title']);

const Body: React.FC<{scene: TLScene; tl: Timeline}> = ({scene, tl}) => {
  switch (scene.type) {
    case 'chapter':
      return <ChapterCard scene={scene} />;
    case 'still':
      return <FullStill scene={scene} />;
    case 'diagram':
      return <DiagramFull scene={scene} />;
    case 'genre':
      return <GenreFull scene={scene} />;
    case 'anim':
      return <ShadowFull scene={scene} />;
    case 'title':
      return <TitleScene scene={scene} channel={tl.channel} subtitle={tl.subtitle ?? ''} />;
    case 'words':
      return <WordsScene scene={scene} />;
    case 'quote':
      return <QuoteScene scene={scene} />;
    case 'key':
      return <KeyScene scene={scene} />;
    case 'ending':
      return <KeyScene scene={scene} final channel={tl.channel} />;
    case 'arrow':
      return <ArrowScene scene={scene} />;
    case 'loop':
      return <LoopScene scene={scene} />;
    case 'network':
      return <NetworkScene scene={scene} />;
    case 'fork':
      return <ForkScene scene={scene} />;
    case 'branches':
      return <BranchesScene scene={scene} />;
    case 'version':
      return <VersionScene scene={scene} />;
    case 'cta':
      return <CtaScene scene={scene} channel={tl.channel} tagline={tl.tagline} />;
    default:
      return <AbsoluteFill style={{background: 'red'}} />;
  }
};

const Fade: React.FC<{children: React.ReactNode; first: boolean}> = ({children, first}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, first ? 30 : OVERLAP], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** 長い文（2行に収まらない）は「、」のところで2ページに分け、字数の比で時間を分ける。 */
const pages = (s: Sub): Sub[] => {
  const MAX = 64;
  if (s.text.length <= MAX) return [s];
  const mid = s.text.length / 2;
  let best = -1;
  for (let i = 0; i < s.text.length; i++) {
    if (s.text[i] === '、' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  }
  if (best < 0) return [s];
  const a = s.text.slice(0, best + 1);
  const b = s.text.slice(best + 1);
  const cut = Math.round(s.from + ((s.to - s.from) * a.length) / s.text.length);
  return [...pages({from: s.from, to: cut, text: a}), ...pages({from: cut, to: s.to, text: b})];
};

export const KangaeruFull: React.FC<{timeline: Timeline; burnSubtitles?: boolean}> = ({timeline, burnSubtitles = true}) => {
  const tl = timeline;
  const allText =
    tl.scenes.flatMap((s) => [...s.sentences.map((x) => x.text), ...Object.values(s.items ?? {}).map(String)]).join('') +
    (tl.subtitle ?? '') +
    tl.channel +
    tl.tagline +
    '登録済みチャンネル登録逆方向も起きる物語';
  useFontsReady(['400 1em "Shippori Mincho"', '700 1em "Shippori Mincho"'], allText);
  useFontsReady(['300 1em "Cormorant Garamond"', '500 1em "Cormorant Garamond"', '400 1em "Special Elite"'], 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,–:');
  const subs: Sub[] = tl.scenes
    .filter((sc) => !NO_SUBS.has(sc.type))
    .flatMap((sc) => sc.sentences.map((s) => ({from: sc.from + s.from, to: sc.from + s.to, text: s.text})))
    .flatMap(pages);
  const n = tl.scenes.length;
  return (
    <AbsoluteFill style={{background: K.black}}>
      {tl.scenes.map((sc, i) => (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.duration + (i < n - 1 ? OVERLAP : 0)} name={sc.id}>
          <Fade first={i === 0}>
            <Body scene={sc} tl={tl} />
          </Fade>
        </Sequence>
      ))}
      <Vignette strength={0.55} />
      <FilmGrain opacity={0.12} />
      <Letterbox />
      {burnSubtitles ? <Subtitles subs={subs} /> : null}
      {tl.voiceSource === 'openjtalk-temp' ? (
        <div style={{position: 'absolute', left: 40, top: (BAR - 26) / 2, fontFamily: MINCHO, fontSize: 20, color: 'rgba(239,233,223,0.45)', letterSpacing: '0.1em'}}>
          仮の声（Open JTalk）・本番は Gemini 3.8 Flash TTS
        </div>
      ) : null}
      <Audio src={staticFile(tl.audio)} />
    </AbsoluteFill>
  );
};
