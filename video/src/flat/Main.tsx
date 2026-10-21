// 新チャンネル（仮）の1本: generated/<ep>.json（tools/build_timeline.py）の場面を順に並べる
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import type {Timeline} from '../uratori/Main';
import type {TLScene} from '../uratori/scenes';
import {useFontsReady} from '../useFontsReady';
import {Grain, Sub, Subtitles} from './kit';
import {DistanceScene, MoonScene, PhotonScene, SkyScene, StarsScene, SunScene, TitleScene} from './scenes';
import {P, ROUND} from './theme';

const OVERLAP = 12; // 場面が溶けて切り替わるフレーム数

const Body: React.FC<{scene: TLScene; tl: Timeline}> = ({scene, tl}) => {
  switch (scene.type) {
    case 'sky':
      return <SkyScene scene={scene} />;
    case 'sun':
      return <SunScene scene={scene} />;
    case 'distance':
      return <DistanceScene scene={scene} />;
    case 'photon':
      return <PhotonScene scene={scene} />;
    case 'moon':
      return <MoonScene scene={scene} />;
    case 'stars':
      return <StarsScene scene={scene} />;
    case 'title':
      return <TitleScene scene={scene} channel={tl.channel} />;
    default:
      return <AbsoluteFill style={{background: 'red'}} />;
  }
};

const Fade: React.FC<{children: React.ReactNode; first: boolean}> = ({children, first}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, first ? 20 : OVERLAP], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const FlatMain: React.FC<{timeline: Timeline; burnSubtitles?: boolean}> = ({timeline, burnSubtitles = true}) => {
  const tl = timeline;
  const allText = tl.scenes.flatMap((s) => s.sentences.map((x) => x.text)).join('') + tl.channel;
  const labels = JSON.stringify(tl.scenes.map((s) => s.items));
  useFontsReady(['500 1em "M PLUS Rounded 1c"', '800 1em "M PLUS Rounded 1c"'], allText + labels + '地球太陽「いま」？分秒万億km0123456789');
  // 締めの場面は画面に同じ文が出るので、字幕は出さない
  const subs: Sub[] = tl.scenes
    .filter((sc) => sc.type !== 'title')
    .flatMap((sc) => sc.sentences.map((s) => ({from: sc.from + s.from, to: sc.from + s.to, text: s.text})));
  const n = tl.scenes.length;
  return (
    <AbsoluteFill style={{background: P.space0}}>
      {tl.scenes.map((sc, i) => (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.duration + (i < n - 1 ? OVERLAP : 0)} name={sc.id}>
          <Fade first={i === 0}>
            <Body scene={sc} tl={tl} />
          </Fade>
        </Sequence>
      ))}
      <Grain opacity={0.08} />
      {burnSubtitles ? <Subtitles subs={subs} /> : null}
      {tl.voiceSource === 'openjtalk-temp' ? (
        <div style={{position: 'absolute', left: 36, top: 28, fontFamily: ROUND, fontSize: 20, color: P.dim}}>
          仮の声（Open JTalk）・本番は Gemini TTS
        </div>
      ) : null}
      <Audio src={staticFile(tl.audio)} />
    </AbsoluteFill>
  );
};
