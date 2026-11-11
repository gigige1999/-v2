import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { tr, type ChapterModule, type Lang } from '../types';
import { KEYS, load, registerHint, store } from '../services/store';
import { BLOCKS, TIPS } from '../blocks';
import type { SpreadProps } from '../blocks/ui';
import { roman } from '../chapters';
import { Snd } from '../engine/sound.js';

/* 图文章：整张跨页由这里排版 —— 左页 = 页眉 + 组件的 left；右页 = 组件的 right + 翻页栏 + App 的工具/浮层
   组件只管 <Spread left right/>，不关心桌面/手机（手机端左右内容上下排列） */

type Ctx = { header: React.ReactNode; nav: React.ReactNode; overlay: React.ReactNode; md: boolean; n: number };
const SpreadCtx = createContext<Ctx>(null as unknown as Ctx);

const useMd = () => {
  const q = '(min-width: 768px)';
  const [md, setMd] = useState(() => matchMedia(q).matches);
  useEffect(() => { const m = matchMedia(q), f = () => setMd(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  return md;
};

const Spread: React.FC<SpreadProps> = ({ left, right }) => {
  const { header, nav, overlay, md, n } = useContext(SpreadCtx);
  const rRef = useRef<HTMLDivElement>(null), lRef = useRef<HTMLDivElement>(null);
  useEffect(() => { rRef.current?.scrollTo(0, 0); lRef.current?.scrollTo(0, 0); }, [n]);
  return (
    <>
      {md && (
        <div ref={lRef} className="w-1/2 flex-none min-w-0 stained-parchment border-r border-ink/40 relative overflow-y-auto custom-scrollbar">
          <div className="corner-accent corner-tl" /><div className="corner-accent corner-bl" />
          <div key={n} className="fade-in px-10 lg:px-12 py-12 space-y-6 text-ink">{header}{left}</div>
        </div>
      )}
      <div className="w-full max-md:flex-1 max-md:min-h-0 md:w-1/2 md:flex-none md:min-w-0 parchment relative flex flex-col overflow-hidden md:border-l border-ink/30">
        <div className="corner-accent corner-tr" /><div className="corner-accent corner-br" />
        <div ref={rRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <div key={n} className="page-turn-in px-6 md:px-10 lg:px-12 pt-16 pb-8 space-y-6">
            {!md && <div className="space-y-5 text-ink">{header}{left}</div>}
            {right}
          </div>
        </div>
        {nav}
        {overlay}
      </div>
    </>
  );
};

export const PagedChapter: React.FC<{ ch: ChapterModule; lang: Lang; done: boolean; onComplete: () => void; overlay: React.ReactNode }> = ({ ch, lang, done, onComplete, overlay }) => {
  const pages = ch.pages!, id = ch.meta.id, zh = lang === 'zh', N = pages.length;
  const [n, setN] = useState(() => Math.min(Math.max(load<number>(KEYS.page(id), 0), 0), N - 1));
  const md = useMd();
  const page = pages[n], Block = BLOCKS[page.kind];
  useEffect(() => { store(KEYS.page(id), n); }, [id, n]);
  useEffect(() => registerHint(id, () => tr(page.tip, lang) || TIPS[page.kind][zh ? 0 : 1]), [id, page, lang, zh]);
  const go = (k: number) => { if (k < 0 || k >= N) return; Snd.unlock(); Snd.fx.page(); setN(k); };

  const header = (
    <header className="space-y-3 pb-5 border-b border-ink/15">
      <div className="flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase font-bold opacity-55"><span className="h-px w-8 bg-ink/40" />{tr(page.kicker, lang) || `Chapter ${ch.meta.roman || roman(id)} · ${n + 1}/${N}`}</div>
      <h2 className="font-display font-bold italic text-3xl lg:text-[2.4rem] leading-tight">{tr(page.title, lang)}</h2>
      {page.intro && <p className="font-serif italic text-base leading-relaxed opacity-80">{tr(page.intro, lang)}</p>}
    </header>
  );
  const nav = (
    <nav className="flex-none flex items-center justify-between gap-3 px-6 md:px-10 py-3 border-t border-ink/15 font-serif text-xs tracking-[0.2em] text-ink/70">
      <button onClick={() => go(n - 1)} disabled={n === 0} className="hover:text-accent disabled:opacity-20">‹ {zh ? '上一页' : 'Prev'}</button>
      <div className="flex gap-1.5">{pages.map((_, k) => <button key={k} onClick={() => go(k)} aria-label={String(k + 1)} className={`h-1.5 rounded-full transition-all ${k === n ? 'w-5 bg-accent' : 'w-1.5 bg-ink/25 hover:bg-ink/50'}`} />)}</div>
      {n < N - 1
        ? <button onClick={() => go(n + 1)} className="hover:text-accent">{zh ? '下一页' : 'Next'} ›</button>
        : <button onClick={onComplete} className="btn-ink px-4 py-1.5 rounded-sm tracking-[0.25em]">{done ? '✓ ' : ''}{zh ? '读完本章' : 'Finish'}</button>}
    </nav>
  );
  return (
    <SpreadCtx.Provider value={{ header, nav, overlay, md, n }}>
      <Block key={n} p={page} lang={lang} Spread={Spread} />
    </SpreadCtx.Provider>
  );
};
