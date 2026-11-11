import React, { useMemo, useState } from 'react';
import { tr } from '../types';
import type { FeaturePage, QuizPage, TextPage } from './types';
import { Detail, Img, Paras, Pin, list, type BlockProps } from './ui';

/* 阅读类：text 正文 / feature 图文 / quiz 小测 */

export const TextBlock: React.FC<BlockProps<TextPage>> = ({ p, lang, Spread }) => {
  const [word, setWord] = useState<string | null>(null);
  const keys = Object.keys(p.glossary || {}).sort((a, b) => b.length - a.length);
  const re = keys.length ? new RegExp(`(${keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g') : null;
  const rich = (s: string) => !re ? s : s.split(re).map((x, i) => keys.includes(x)
    ? <button key={i} onClick={() => setWord(word === x ? null : x)} className={`kw ${word === x ? 'on' : ''}`}>{x}</button> : x);
  const paras = list(p.text, lang);
  const half = p.variant === 'columns' ? Math.ceil(paras.length / 2) : 0;
  const body = (arr: string[], drop = false) => (
    <div className="space-y-4 font-serif text-[15px] md:text-base leading-[1.95] text-ink/90">
      {arr.map((s, i) => <p key={i} className={drop && i === 0 ? 'dropcap' : 'indent-8'}>{rich(s)}</p>)}
    </div>
  );
  const gloss = word && (
    <div className="fade-in sticky top-0 z-10 mb-4 p-4 border-l-4 border-accent stained-parchment shadow-lg text-ink">
      <div className="text-[11px] tracking-[0.3em] font-bold text-accent mb-1">{word}</div>
      <p className="font-serif text-sm leading-relaxed">{tr(p.glossary![word], lang)}</p>
    </div>
  );
  const extra = <>
    {p.image && <figure><Img src={p.image} natural />{p.caption && <figcaption className="mt-2 text-center text-xs italic opacity-60 font-serif">{tr(p.caption, lang)}</figcaption>}</figure>}
    {p.quote && <blockquote className="mt-4 font-display italic text-lg leading-relaxed text-ink/80 text-center px-4">“{tr(p.quote.text, lang)}”{p.quote.source && <footer className="mt-2 text-xs not-italic opacity-60 font-serif">{tr(p.quote.source, lang)}</footer>}</blockquote>}
  </>;
  return half
    ? <Spread left={<>{body(paras.slice(0, half), true)}{extra}</>} right={<>{gloss}{body(paras.slice(half))}</>} />
    : <Spread left={extra} right={<>{gloss}{body(paras, p.variant === 'dropcap')}</>} />;
};

export const FeatureBlock: React.FC<BlockProps<FeaturePage>> = ({ p, lang, Spread }) => {
  const [sel, setSel] = useState(-1);
  const spots = p.spots || [];
  const cap = p.caption && <figcaption className="mt-2 text-center text-xs italic opacity-60 font-serif">{tr(p.caption, lang)}</figcaption>;
  if (p.variant === 'stack') {
    const [lead, ...rest] = list(p.text, lang);
    return <Spread left={lead && <p className="font-display italic text-xl lg:text-2xl leading-relaxed text-ink/85 border-l-2 border-accent/50 pl-5">{lead}</p>}
      right={<div className="space-y-5"><figure><Img src={p.image} natural />{cap}</figure><Paras t={rest} lang={lang} /></div>} />;
  }
  const pic = (
    <figure>
      <Img src={p.image} natural>
        {p.variant === 'hotspot' && spots.map((s, i) => <Pin key={i} x={s.x} y={s.y} n={i + 1} on={sel === i} onClick={() => setSel(sel === i ? -1 : i)} />)}
      </Img>{cap}
    </figure>
  );
  const right = p.variant === 'hotspot' && sel >= 0
    ? <Detail e={{ ...spots[sel], kicker: spots[sel].kicker || `No. ${sel + 1}` }} lang={lang}>
        <button onClick={() => setSel(-1)} className="text-xs tracking-[0.2em] text-ink/50 hover:text-accent font-serif">‹ {lang === 'zh' ? '回到正文' : 'Back'}</button>
      </Detail>
    : <div className="space-y-6">
        <Paras t={p.text} lang={lang} drop />
        {p.variant === 'hotspot' && !!spots.length && (
          <ol className="grid grid-cols-2 gap-2 border-t border-ink/10 pt-4">
            {spots.map((s, i) => <li key={i}><button onClick={() => setSel(i)} className="w-full text-left text-sm font-serif hover:text-accent"><b className="text-accent mr-2">{i + 1}</b>{tr(s.title, lang)}</button></li>)}
          </ol>
        )}
      </div>;
  return <Spread left={pic} right={right} />;
};

export const QuizBlock: React.FC<BlockProps<QuizPage>> = ({ p, lang, Spread }) => {
  const zh = lang === 'zh';
  const order = p.variant === 'order';
  const shuffled = useMemo(() => p.options.map((_, i) => i).sort(() => Math.random() - .5), [p]);
  const [picked, setPicked] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const last = picked[picked.length - 1];
  const done = order ? picked.length === p.options.length : last !== undefined && !!p.options[last].ok;
  const pick = (i: number) => {
    if (done || picked.includes(i)) return;
    const wrong = order ? i !== picked.length : !p.options[i].ok;
    if (wrong) { setShake(true); setTimeout(() => setShake(false), 450); }
    setPicked(order && wrong ? [] : [...picked, i]);
  };
  const why = !order && last !== undefined && p.options[last].why;
  return (
    <Spread
      left={<div className="space-y-5"><p className="font-display text-xl md:text-2xl leading-relaxed text-ink">{tr(p.question, lang)}</p>{p.image && <Img src={p.image} natural />}</div>}
      right={
        <div className="space-y-5 text-ink">
          <div className="text-[11px] tracking-[0.3em] opacity-50 font-bold">{order ? (zh ? '按正确顺序点按' : 'TAP IN ORDER') : (zh ? '选出你的答案' : 'CHOOSE')}</div>
          {order && <div className={`min-h-[56px] p-3 border border-dashed border-ink/30 font-serif text-sm ${shake ? 'bk-shake' : ''}`}>{picked.map(i => <span key={i} className="fade-in inline-block mr-2 mb-1 px-2 py-0.5 bg-ink/5">{i + 1}. {tr(p.options[i].text, lang)}</span>)}</div>}
          <div className={`grid gap-2 ${!order && shake ? 'bk-shake' : ''}`}>
            {(order ? shuffled : p.options.map((_, i) => i)).map(i => {
              const used = picked.includes(i), ok = p.options[i].ok;
              const state = order ? (used ? 'opacity-25' : '') : used ? (ok ? 'border-accent bg-accent/10' : 'line-through opacity-40') : '';
              return <button key={i} onClick={() => pick(i)} disabled={done || (order && used)} className={`text-left px-4 py-3 border border-ink/25 font-serif hover:bg-ink/5 transition-all ${state}`}>{tr(p.options[i].text, lang)}</button>;
            })}
          </div>
          {why && <p className="fade-in font-serif italic text-sm border-l-2 border-accent/50 pl-3">{tr(why, lang)}</p>}
          {done && <div className="fade-in space-y-2 border-t border-ink/10 pt-4"><div className="text-accent font-bold tracking-[0.3em] text-xs">✓ {zh ? '答对了' : 'CORRECT'}</div>{p.explain && <Paras t={p.explain} lang={lang} />}</div>}
        </div>
      } />
  );
};
