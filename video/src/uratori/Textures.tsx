// Blender の紙に貼る画像（A4 縦・1240x1754）。`remotion still` で PNG に書き出す。
// 特定の会社・機関の文書に見えないよう、差出人は「〇〇株式会社」、本文は灰色の線にしている。
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS} from './theme';

const NOTICE_TITLES = [
  '不正アクセスによる個人情報漏洩の\nおそれに関するお知らせ',
  'ランサムウェア被害の発生について\n（第2報）',
  '当社システムへの不正アクセスに\n関するご報告',
  '個人情報の流出に関する\nお詫びとお知らせ',
  'サービス停止のお知らせ\n（復旧の見込みについて）',
  '委託先における情報漏洩の\nおそれについて',
];

const Lines: React.FC<{n: number; seed: number; width?: number}> = ({n, seed, width = 1040}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
    {Array.from({length: n}, (_, i) => {
      const r = Math.abs(Math.sin(seed * 12.9898 + i * 78.233)) % 1;
      const w = i % 6 === 5 ? 0.45 + r * 0.25 : 0.86 + r * 0.14;
      return <div key={i} style={{height: 14, width: width * w, background: '#bdbab3', borderRadius: 2}} />;
    })}
  </div>
);

export const PaperNotice: React.FC<{variant: number}> = ({variant}) => {
  const title = NOTICE_TITLES[variant % NOTICE_TITLES.length];
  return (
    <AbsoluteFill style={{background: '#fbfaf6', padding: '110px 100px', fontFamily: SANS, color: C.ink}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, color: C.sub}}>
        <div>報道関係者各位</div>
        <div>2026年10月</div>
      </div>
      <div style={{textAlign: 'right', fontSize: 34, marginTop: 30, fontWeight: 500}}>〇〇株式会社</div>
      <div
        style={{
          fontSize: 58,
          fontWeight: 900,
          lineHeight: 1.45,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          margin: '90px 0 70px',
        }}
      >
        {title}
      </div>
      <Lines n={7} seed={variant + 1} />
      <div style={{height: 60}} />
      <div style={{fontSize: 34, fontWeight: 700, marginBottom: 30}}>1．経緯</div>
      <Lines n={6} seed={variant + 7} />
      <div style={{height: 60}} />
      <div style={{fontSize: 34, fontWeight: 700, marginBottom: 30}}>2．対象となる情報</div>
      <Lines n={5} seed={variant + 13} />
    </AbsoluteFill>
  );
};

/** 虫めがねの下に来る紙面: 1行だけ黄色のマーカー。 */
export const PaperReport: React.FC = () => (
  <AbsoluteFill style={{background: '#fbfaf6', padding: '120px 100px', fontFamily: SANS, color: C.ink}}>
    <div style={{fontSize: 30, color: C.sub, letterSpacing: '0.1em'}}>一次資料を読む</div>
    <div style={{height: 6, background: C.ink, margin: '24px 0 70px'}} />
    <Lines n={8} seed={21} />
    <div style={{height: 60}} />
    <div style={{fontSize: 64, fontWeight: 900, lineHeight: 1.5}}>
      <span
        style={{
          backgroundImage: `linear-gradient(${C.marker}, ${C.marker})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 0.62em',
          backgroundPosition: '0 88%',
        }}
      >
        侵入経路の半分は、VPN機器
      </span>
    </div>
    <div style={{height: 60}} />
    <Lines n={9} seed={34} />
  </AbsoluteFill>
);
