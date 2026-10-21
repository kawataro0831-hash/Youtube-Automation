import {Composition, Still} from 'remotion';
import {FontTest} from './FontTest';
import timeline from './generated/uratori-01-1min.json';
import kangaeru01 from './generated/kangaeru-01-1min.json';
import sora01 from './generated/sora-01-sample.json';
import {FlatMain} from './flat/Main';
import {KangaeruMain} from './kangaeru/Main';
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
        id="Flat"
        component={FlatMain}
        durationInFrames={(sora01 as Timeline).durationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{timeline: sora01 as Timeline, burnSubtitles: true}}
      />
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
