import React, { useMemo, useState } from 'react';
import { BOOK } from '../book.config';
import { tr, type CoverLayout, type Lang } from '../types';
import { Emblem } from './emblems';

/** 封面：版式 × 配色(--cv-*) × 徽章 × 文字（book.config.ts 的 coverText）
 *  classic  烫金双框 + 四角 + 居中书名（《百年孤独》）
 *  heraldic 斜放的合拢书：书页厚度、丝带书签、细框 ✧、纹章大图、翻开动画（《玫瑰战争》）
 *  emblem   书名在书外，书面只有烫金西文大字 + 中心徽章 + 罗马年份（《Vikings》）
 *  地址栏 ?layout=heraldic&emblem=rose 可临时预览 */
export const BookCover: React.FC<{ onOpen: () => void; lang: Lang }> = ({ onOpen, lang }) => {
  const [opening, setOpening] = useState(false);
  const q = new URLSearchParams(location.search);
  const layout = (q.get('layout') || BOOK.coverLayout || 'classic') as CoverLayout;
  const emblem = q.get('emblem') || BOOK.emblem;
  const open = () => { if (opening) return; setOpening(true); setTimeout(onOpen, layout === 'heraldic' ? 950 : 800); };
  const c = BOOK.coverText, title = tr(BOOK.title, lang), sub = tr(BOOK.subtitle, lang), prompt = tr(c.prompt, lang);
  const latin = c.latin || title, latinLen = latin.length; // emblem 版式：按长度自动缩字号

  return (
    <div className={`fixed inset-0 z-[300] flex flex-col items-center justify-center gap-7 overflow-hidden transition-all duration-1000 ${opening ? 'opacity-0 pointer-events-none scale-110 blur-3xl' : 'opacity-100'}`}
      style={{ backgroundColor: 'var(--app-bg)', transitionDelay: opening && layout === 'heraldic' ? '.5s' : '0s' }}>
      {layout === 'heraldic' ? (
        <>
          <button onClick={open} className={`hc-book ${opening ? 'opening' : ''}`} aria-label={prompt}>
            <span className="hc-front">
              <span className="hc-spine" /><span className="hc-frame" />
              <span className="hc-top">{c.kicker}</span>
              <span className="hc-title">{title}</span>
              {c.latin && <span className="hc-latin">{c.latin}</span>}
              <Emblem id={emblem} className="hc-emblem" />
              <span className="hc-sub">{sub}</span>
              {c.era && <span className="hc-era">{c.era}</span>}
            </span>
          </button>
          <button onClick={open} className={`cover-ink text-xs md:text-sm tracking-[0.25em] font-serif flex items-center gap-4 transition-opacity ${opening ? 'opacity-0' : ''}`}>{prompt} <span className="text-lg">→</span></button>
        </>
      ) : layout === 'emblem' ? (
        <>
          <div className="text-center cover-ink fade-in">
            <p className="text-[10px] md:text-[11px] tracking-[0.5em] uppercase opacity-70">{c.kicker}</p>
            <h1 className="mt-3 font-display font-bold text-4xl md:text-[3.4rem] tracking-[0.14em] leading-tight">{title}</h1>
            <div className="mt-4 flex items-center justify-center gap-3 opacity-60">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-current" /><span className="font-display text-[10px] md:text-[11px] tracking-[0.3em]">{sub}</span><span className="h-px w-10 bg-gradient-to-l from-transparent to-current" />
            </div>
          </div>
          <button onClick={open} className={`ec-book group ${opening ? 'opening' : ''}`} aria-label={prompt}>
            <span className="ec-frame" />
            <span className="ec-body">
              <span className={`ec-latin ${latinLen > 14 ? 'long' : latinLen > 8 ? 'mid' : ''}`}>{latin}</span>
              <span className="ec-rule"><i /><b /><i /></span>
              <Emblem id={emblem} className="ec-emblem" />
              {c.era && <span className="ec-era"><i />{c.era}<i /></span>}
            </span>
            <span className="ec-spine" />
          </button>
          <p className="cover-ink opacity-50 text-[11px] md:text-xs tracking-[0.3em] font-serif animate-pulse">{prompt}</p>
        </>
      ) : <Classic open={open} opening={opening} emblem={emblem} lang={lang} />}
    </div>
  );
};

const Classic: React.FC<{ open: () => void; opening: boolean; emblem: string; lang: Lang }> = ({ open, opening, emblem, lang }) => {
  const [hover, setHover] = useState(false);
  const motes = useMemo(() => [...Array(30)].map(() => ({ s: Math.random() * 4 + 1, l: Math.random() * 100, d: 5 + Math.random() * 5, delay: Math.random() * 5, o: Math.random() * .5 + .2 })), []);
  const c = BOOK.coverText;
  return (
    <>
      <div className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-1000 ${hover && !opening ? 'opacity-100' : 'opacity-0'}`}>
        {motes.map((m, i) => <div key={i} className="cover-mote" style={{ width: m.s, height: m.s, left: `${m.l}%`, bottom: -20, opacity: m.o, animation: `float-up ${m.d}s linear infinite`, animationDelay: `${m.delay}s` }} />)}
      </div>
      <div onClick={open} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={`cover-book group ${opening ? 'opening' : ''}`}>
        <div className="cover-spine" />
        <div className="cover-face">
          <div className="cover-line" style={{ inset: 16 }} />
          <div className="cover-line l2" style={{ inset: 24 }} />
          {(['tl', 'tr', 'bl', 'br'] as const).map(k => <div key={k} className="cover-corner" style={{ [k[0] === 't' ? 'top' : 'bottom']: 32, [k[1] === 'l' ? 'left' : 'right']: 32, [`border${k[0] === 't' ? 'Top' : 'Bottom'}Width`]: 3, [`border${k[1] === 'l' ? 'Left' : 'Right'}Width`]: 3 }} />)}
          <div className="relative z-10 mt-4 space-y-4">
            <div className="cover-soft text-[11px] md:text-sm tracking-[0.6em] uppercase font-serif font-bold [text-wrap:balance] px-6">{c.kicker}</div>
            <div className="cover-rule w-16 h-[2px] mx-auto rounded-full" />
          </div>
          <div className="relative z-10 space-y-3 py-4">
            <h1 className="cover-title font-display text-4xl md:text-6xl leading-[1.15] font-bold tracking-tight">{tr(BOOK.title, lang)}</h1>
            <div className="cover-foil font-display italic text-xl md:text-2xl opacity-90">{tr(BOOK.subtitle, lang)}</div>
            <div className="cover-soft pt-5 text-[12px] md:text-sm tracking-[0.4em] uppercase font-bold [text-wrap:balance] px-6">{c.motto}</div>
          </div>
          <div className="relative z-10 mb-8 group-hover:scale-105 transition-transform duration-700">
            <p className="cover-title text-xl md:text-2xl font-serif italic opacity-60 tracking-wide">{tr(BOOK.author, lang)}</p>
            <Emblem id={emblem} className="cover-foil w-16 h-16 mx-auto mt-4 opacity-60 group-hover:opacity-80 transition-opacity" />
          </div>
          <div className="cover-soft absolute bottom-7 left-0 right-0 text-[10px] uppercase tracking-[0.5em] font-bold animate-pulse">{tr(c.prompt, lang)}</div>
        </div>
      </div>
    </>
  );
};
