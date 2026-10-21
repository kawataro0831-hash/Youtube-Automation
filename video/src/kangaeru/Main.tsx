// 「考える夜」の1本: generated/<ep>.json（tools/build_timeline.py）の場面を順に並べる
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {Timeline} from '../uratori/Main';
import type {TLScene} from '../uratori/scenes';
import {useFontsReady} from '../useFontsReady';
import {FilmGrain, Letterbox, Sub, Subtitles, Vignette} from './fx';
import {DiagramScene, GenreScene, ShadowScene, StillScene, TitleScene} from './scenes';
import {BAR, K, MINCHO} from './theme';

const OVERLAP = 14; // 場面が溶けて切り替わるフレーム数

const Body: React.FC<{scene: TLScene; tl: Timeline}> = ({scene, tl}) => {
  switch (scene.type) {
    case 'still':
      return <StillScene scene={scene} />;
    case 'diagram':
      return <DiagramScene scene={scene} />;
    case 'genre':
      return <GenreScene scene={scene} />;
    case 'anim':
      return <ShadowScene scene={scene} />;
    case 'title':
      return <TitleScene scene={scene} channel={tl.channel} subtitle={tl.subtitle ?? ''} />;
    default:
      return <AbsoluteFill style={{background: 'red'}} />;
  }
};

const Fade: React.FC<{children: React.ReactNode; first: boolean}> = ({children, first}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, first ? 30 : OVERLAP], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const KangaeruMain: React.FC<{timeline: Timeline; burnSubtitles?: boolean}> = ({timeline, burnSubtitles = true}) => {
  const tl = timeline;
  const allText = tl.scenes.flatMap((s) => s.sentences.map((x) => x.text)).join('') + (tl.subtitle ?? '') + tl.channel;
  useFontsReady(['400 1em "Shippori Mincho"', '700 1em "Shippori Mincho"'], allText + 'アメリカ・ケンタッキー州ルイビル記者作家物語ゴンゾージャーナリズム呼ばれる');
  useFontsReady(['300 1em "Cormorant Garamond"', '500 1em "Cormorant Garamond"', '400 1em "Special Elite"'], 'HUNTERSTOMPLVIKY1970,.–');
  const subs: Sub[] = tl.scenes.flatMap((sc) => sc.sentences.map((s) => ({from: sc.from + s.from, to: sc.from + s.to, text: s.text})));
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
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: (BAR - 26) / 2,
            fontFamily: MINCHO,
            fontSize: 20,
            color: 'rgba(239,233,223,0.45)',
            letterSpacing: '0.1em',
          }}
        >
          仮の声（Open JTalk）・本番は Gemini 3.8 Flash TTS
        </div>
      ) : null}
      <Audio src={staticFile(tl.audio)} />
    </AbsoluteFill>
  );
};
