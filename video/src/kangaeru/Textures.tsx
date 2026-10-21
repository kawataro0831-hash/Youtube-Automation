// Blender の中の画面や紙に貼る画像（`remotion still` で PNG にして blender/textures/ に置く）。
// 実在の会社・サービスに見えないよう、名前は「〇〇」、画面は架空の作りにしている。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MINCHO, TYPE} from './theme';

const SANS = '"Noto Sans JP", sans-serif';

/** スマホの発信画面（縦 1080x2340）。 */
export const PhoneScreen: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'linear-gradient(180deg, #1c2430 0%, #0b0f15 100%)',
      color: '#f2f2f2',
      fontFamily: SANS,
      alignItems: 'center',
    }}
  >
    <div style={{marginTop: 120, fontSize: 64, opacity: 0.85}}>2:47</div>
    <div
      style={{
        marginTop: 380,
        width: 300,
        height: 300,
        borderRadius: 150,
        background: '#3a4554',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 140,
        color: '#cfd6df',
      }}
    >
      〇
    </div>
    <div style={{marginTop: 70, fontSize: 96, fontWeight: 500}}>〇〇</div>
    <div style={{marginTop: 24, fontSize: 48, opacity: 0.6}}>携帯</div>
    <div style={{position: 'absolute', bottom: 330, display: 'flex', gap: 260}}>
      {['#e2483d', '#3fbf5f'].map((c, i) => (
        <div key={c} style={{textAlign: 'center'}}>
          <div style={{width: 220, height: 220, borderRadius: 110, background: c, opacity: i === 0 ? 0.35 : 1}} />
          <div style={{marginTop: 30, fontSize: 44, opacity: 0.7}}>{i === 0 ? 'キャンセル' : '発信'}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

/** 動画の分析画面: 1本だけ再生数が跳ね上がったグラフ（1920x1080）。 */
export const MonitorGraph: React.FC = () => {
  const pts = [8, 9, 7, 10, 9, 11, 10, 12, 11, 95, 70, 52, 48, 45];
  const W = 1500;
  const H = 520;
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * W} ${H - (v / 100) * H}`).join(' ');
  return (
    <AbsoluteFill style={{background: '#101317', color: '#e8eaed', fontFamily: SANS, padding: 90}}>
      <div style={{fontSize: 44, opacity: 0.6}}>チャンネルのアナリティクス</div>
      <div style={{display: 'flex', gap: 120, marginTop: 40}}>
        <div>
          <div style={{fontSize: 36, opacity: 0.6}}>視聴回数</div>
          <div style={{fontSize: 110, fontWeight: 700}}>1,042,318</div>
        </div>
        <div>
          <div style={{fontSize: 36, opacity: 0.6}}>チャンネル登録者</div>
          <div style={{fontSize: 110, fontWeight: 700, color: '#57c27b'}}>+18,904</div>
        </div>
      </div>
      <svg width={W} height={H + 20} style={{marginTop: 70}}>
        {[0, 1, 2, 3].map((k) => (
          <line key={k} x1={0} x2={W} y1={(k / 3) * H} y2={(k / 3) * H} stroke="#2a2f36" strokeWidth={2} />
        ))}
        <path d={path} fill="none" stroke="#4aa3ff" strokeWidth={8} strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};

/** 古いパソコンの画面（緑の文字・4:3 の 1440x1080）。 */
export const CrtScreen: React.FC = () => {
  const lines = [
    'C:\\> SETUP /COMPAT',
    '',
    'Checking legacy modules ......... 1,284 found',
    'Dependencies (do not remove):',
    '  - family.dll        v1.0',
    '  - friends.dll       v1.0',
    '  - clients.dll       v1.0',
    '  - income.sys        v1.0',
    '  - reputation.sys    v1.0',
    '',
    'WARNING: Updating SELF.EXE may break',
    '         backward compatibility.',
    '',
    'Continue? (Y/N) _',
  ];
  return (
    <AbsoluteFill style={{background: '#031007', padding: 90, fontFamily: TYPE, color: '#5dff8a', fontSize: 50, lineHeight: 1.45}}>
      {lines.map((l, i) => (
        <div key={i} style={{whiteSpace: 'pre', textShadow: '0 0 8px rgba(93,255,138,0.6)'}}>
          {l || ' '}
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** 食卓の上の求人票（A4 縦 1240x1754）。 */
export const JobSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#f6f3ec', padding: '120px 110px', fontFamily: MINCHO, color: '#1e1c1a'}}>
    <div style={{fontSize: 92, fontWeight: 700, letterSpacing: '0.4em', textAlign: 'center'}}>求人票</div>
    <div style={{height: 3, background: '#1e1c1a', margin: '50px 0 60px'}} />
    {[
      ['事業所名', '〇〇株式会社'],
      ['職種', '企画・編集（未経験可）'],
      ['雇用形態', '正社員（試用期間あり）'],
      ['賃金', '月給 〇〇万円〜'],
      ['就業場所', '〇〇市'],
      ['仕事の内容', ''],
    ].map(([k, v]) => (
      <div key={k} style={{display: 'flex', borderBottom: '2px solid #b9b3a8', padding: '26px 0', fontSize: 44}}>
        <div style={{width: 300, color: '#5a554d'}}>{k}</div>
        <div>{v}</div>
      </div>
    ))}
    <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 30}}>
      {[0.95, 0.9, 0.97, 0.6].map((w, i) => (
        <div key={i} style={{height: 16, width: `${w * 100}%`, background: '#c9c3b8', borderRadius: 3}} />
      ))}
    </div>
  </AbsoluteFill>
);
