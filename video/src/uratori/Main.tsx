// ウラトリの1本: generated/timeline.json（tools/build_timeline.py が作る）の場面を順に並べる
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Bug, Grain, Vignette} from './kit';
import {
  BarsScene,
  DotsScene,
  EndCard,
  KeyMsgScene,
  NewsScene,
  OpenScene,
  QuestionScene,
  TLScene,
  TurnScene,
} from './scenes';
import {C, SANS} from './theme';

export type Timeline = {
  episode: string;
  channel: string;
  tagline: string;
  title?: string;
  subtitle?: string;
  fps: number;
  durationInFrames: number;
  audio: string;
  voiceSource: string;
  scenes: TLScene[];
};

const OVERLAP = 8; // 場面の切り替え（次の場面が溶けて入る）フレーム数

const SceneBody: React.FC<{scene: TLScene; channel: string}> = ({scene, channel}) => {
  switch (scene.type) {
    case 'blender':
      return scene.id === 'open' ? <OpenScene scene={scene} channel={channel} /> : <TurnScene scene={scene} />;
    case 'news':
      return <NewsScene scene={scene} />;
    case 'dots':
      return <DotsScene scene={scene} />;
    case 'bars':
      return <BarsScene scene={scene} />;
    case 'keymsg':
      return <KeyMsgScene scene={scene} />;
    case 'question':
      return <QuestionScene scene={scene} />;
    case 'endcard':
      return <EndCard scene={scene} />;
    default:
      return <AbsoluteFill style={{background: 'red'}} />;
  }
};

const FadeIn: React.FC<{children: React.ReactNode; on: boolean}> = ({children, on}) => {
  const frame = useCurrentFrame();
  const o = on ? interpolate(frame, [0, OVERLAP], [0, 1], {extrapolateRight: 'clamp'}) : 1;
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** 仮の声で書き出したときだけ右上に出す注意書き。 */
const TempVoiceNote: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      right: 40,
      top: 34,
      fontFamily: SANS,
      fontSize: 22,
      fontWeight: 500,
      color: '#fff',
      background: 'rgba(26,26,26,0.62)',
      padding: '6px 14px',
    }}
  >
    仮の声（Open JTalk）・本番は Gemini 3.8 Flash TTS
  </div>
);

export const Main: React.FC<{timeline: Timeline}> = ({timeline}) => {
  const n = timeline.scenes.length;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      {timeline.scenes.map((sc, i) => {
        const dark = sc.type === 'blender' || sc.type === 'keymsg';
        return (
          <Sequence
            key={sc.id}
            from={sc.from}
            durationInFrames={sc.duration + (i < n - 1 ? OVERLAP : 0)}
            name={sc.id}
          >
            <FadeIn on={i > 0}>
              <SceneBody scene={sc} channel={timeline.channel} />
              {sc.type !== 'endcard' ? <Bug name={timeline.channel} dark={dark} /> : null}
            </FadeIn>
          </Sequence>
        );
      })}
      <Grain opacity={0.14} />
      <Vignette strength={0.28} />
      {timeline.voiceSource === 'openjtalk-temp' ? <TempVoiceNote /> : null}
      <Audio src={staticFile(timeline.audio)} />
    </AbsoluteFill>
  );
};
