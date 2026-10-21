import {Composition, Still} from 'remotion';
import {FontTest} from './FontTest';
import timeline from './generated/uratori-01-1min.json';
import kangaeru01 from './generated/kangaeru-01-1min.json';
import {KangaeruMain} from './kangaeru/Main';
import {KangaeruFull} from './kangaeru/FullMain';
import kangaeruFull01 from './generated/kangaeru-01.json';
import {CrtScreen, JobSheet, MonitorGraph, PhoneScreen} from './kangaeru/Textures';
import {Main, Timeline} from './uratori/Main';
import {PaperNotice, PaperReport} from './uratori/Textures';

const tl = timeline as Timeline;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Uratori"
        component={Main}
        durationInFrames={tl.durationInFrames}
        fps={tl.fps}
        width={1920}
        height={1080}
        defaultProps={{timeline: tl}}
      />
      <Composition
        id="Kangaeru"
        component={KangaeruMain}
        durationInFrames={(kangaeru01 as Timeline).durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{timeline: kangaeru01 as Timeline, burnSubtitles: true}}
      />
      <Composition
        id="KangaeruFull"
        component={KangaeruFull}
        durationInFrames={(kangaeruFull01 as Timeline).durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{timeline: kangaeruFull01 as Timeline, burnSubtitles: true}}
      />
      {/* 考える夜: Blender の画面や紙に貼る画像 */}
      <Still id="KPhone" component={PhoneScreen} width={1080} height={2340} />
      <Still id="KMonitor" component={MonitorGraph} width={1920} height={1080} />
      <Still id="KCrt" component={CrtScreen} width={1440} height={1080} />
      <Still id="KJob" component={JobSheet} width={1240} height={1754} />
      {/* Blender の紙に貼る画像 */}
      <Still id="PaperNotice" component={PaperNotice} width={1240} height={1754} defaultProps={{variant: 0}} />
      <Still id="PaperReport" component={PaperReport} width={1240} height={1754} />
      <Composition
        id="FontTest"
        component={FontTest}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
