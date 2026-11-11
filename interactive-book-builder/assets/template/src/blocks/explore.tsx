import React, { useState } from 'react';
import { tr } from '../types';
import type { CardsPage, ComparePage, TimelinePage } from './types';
import { Detail, Icon, Img, Pin, Seal, Stepper, Tabs, colorOf, reveal, tint, type BlockProps } from './ui';

/* 展开类：timeline 时间线 / cards 分类卡片 / compare 分期对比 —— 左页导航，右页详情 */

export const TimelineBlock: React.FC<BlockProps<TimelinePage>> = ({ p, lang, Spread }) => {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(p.items[0]?.group || p.groups?.[0]?.id || '');
  const it = p.items[i], col = colorOf(p.groups, it?.group);
  const pick = (k: number) => { setI(k); const g = p.items[k]?.group; if (g) setOpen(g); };
  const detail = <><Detail e={it} lang={lang} color={col} /><div className="mt-6"><Stepper i={i} n={p.items.length} set={pick} /></div></>;
  const row = (k: number, compact = false) => {
    const e = p.items[k], on = k === i;
    return (
      <button key={k} onClick={() => { pick(k); reveal(); }} className={`relative w-full text-left flex items-baseline gap-3 rounded-md transition-colors ${compact ? 'px-2 py-1.5' : 'pl-8 pr-2 py-2'} ${on ? 'bg-paper/70 ring-1 ring-accent/30' : 'hover:bg-ink/[.04]'}`}>
        {!compact && <span className={`absolute left-[9px] top-[14px] w-3 h-3 rounded-full border-2 transition-all ${on ? 'scale-125' : ''}`} style={{ borderColor: colorOf(p.groups, e.group), background: on ? colorOf(p.groups, e.group) : 'var(--pp-bg)' }} />}
        <span className="shrink-0 w-14 font-display text-[11px] tracking-wider text-accent/80">{tr(e.kicker, lang)}</span>
        <span className={`font-serif text-[15px] leading-snug ${on ? 'font-bold text-accent' : 'text-ink'}`}>{tr(e.title, lang)}</span>
      </button>
    );
  };

  if (p.variant === 'ribbon') return (
    <Spread left={it && <figure className="fade-in" key={i}><Img src={it.image} natural />{it.caption && <figcaption className="mt-2 text-center text-xs italic opacity-60 font-serif">{tr(it.caption, lang)}</figcaption>}</figure>}
      right={<div className="space-y-6">
        <div className="relative overflow-x-auto custom-scrollbar pb-2 -mx-1">
          <div className="relative flex min-w-max gap-1 px-1 pt-5">
            <div className="absolute left-0 right-0 top-[27px] h-px bg-ink/25" />
            {p.items.map((e, k) => (
              <button key={k} onClick={() => setI(k)} className="relative flex flex-col items-center w-[74px] group">
                <span className={`w-3.5 h-3.5 rotate-45 border-2 transition-all ${k === i ? 'scale-125' : 'group-hover:scale-110'}`} style={{ borderColor: colorOf(p.groups, e.group), background: k === i ? colorOf(p.groups, e.group) : 'var(--pp-bg)' }} />
                <span className={`mt-2 font-display text-[11px] ${k === i ? 'text-accent font-bold' : 'text-ink/60'}`}>{tr(e.kicker, lang)}</span>
              </button>
            ))}
          </div>
        </div>
        <Detail e={it && { ...it, image: undefined }} lang={lang} color={col} />
        <Stepper i={i} n={p.items.length} set={setI} />
      </div>} />
  );

  if (p.variant === 'seals' && p.groups) return (
    <Spread left={<div className="space-y-2">
      {p.groups.map((g, gi) => {
        const ks = p.items.map((e, k) => (e.group === g.id ? k : -1)).filter(k => k >= 0), isOpen = open === g.id;
        return (
          <div key={g.id}>
            <button onClick={() => { setOpen(isOpen ? '' : g.id); if (!isOpen && ks.length) setI(ks[0]); }} className={`w-full flex items-center gap-3.5 p-2 rounded-xl text-left transition-colors ${isOpen ? 'bg-paper/60 ring-1 ring-accent/25' : 'hover:bg-ink/[.03]'}`}>
              <Seal color={colorOf(p.groups, g.id)} on={isOpen}>{gi + 1}</Seal>
              <span className="flex-1 min-w-0"><span className="block font-display text-[10px] tracking-[0.18em] text-accent/80">{g.years}</span><span className="block font-serif text-[15px] font-semibold text-ink truncate">{tr(g.label, lang)}</span></span>
              <span className={`text-ink/40 text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>›</span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden pl-12 space-y-0.5 py-1">{ks.map(k => row(k, true))}</div>
            </div>
          </div>
        );
      })}
    </div>} right={detail} />
  );

  return (
    <Spread left={<div className="relative space-y-1"><div className="absolute left-[14px] top-3 bottom-3 w-px bg-gradient-to-b from-transparent via-ink/30 to-transparent" />{p.items.map((_, k) => row(k))}</div>} right={detail} />
  );
};

export const CardsBlock: React.FC<BlockProps<CardsPage>> = ({ p, lang, Spread }) => {
  const zh = lang === 'zh';
  const [cat, setCat] = useState('');
  const [sel, setSel] = useState(0);
  const [flipped, setFlipped] = useState<number[]>([]);
  const shown = p.items.map((e, k) => ({ e, k })).filter(x => !cat || x.e.cat === cat);
  const filter = p.cats && <Tabs items={p.cats} value={cat} onChange={setCat} lang={lang} all={zh ? '全部' : 'All'} />;

  if (p.variant === 'accordion') return (
    <Spread left={<div className="space-y-4">{filter}{p.items[sel]?.image && <Img key={sel} src={p.items[sel].image} natural className="fade-in" />}</div>}
      right={<div className="divide-y divide-ink/10 border-y border-ink/10">
        {shown.map(({ e, k }) => (
          <div key={k}>
            <button onClick={() => setSel(sel === k ? -1 : k)} className="w-full flex items-center gap-3 py-3 text-left group">
              <Icon id={e.icon} className="w-6 h-6" />
              <span className="flex-1"><span className="block font-serif font-bold text-ink group-hover:text-accent">{tr(e.title, lang)}</span>{e.short && <span className="block text-xs text-ink/55 font-serif">{tr(e.short, lang)}</span>}</span>
              <span className={`text-accent transition-transform ${sel === k ? 'rotate-45' : ''}`}>+</span>
            </button>
            <div className={`grid transition-all duration-300 ${sel === k ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden"><Detail e={{ ...e, title: '', image: undefined, short: undefined }} lang={lang} compact /></div>
            </div>
          </div>
        ))}
      </div>} />
  );

  if (p.variant === 'flip') return (
    <Spread left={<div className="space-y-4">{filter}<p className="font-serif text-sm text-ink/60 italic">{zh ? `已翻开 ${flipped.length} / ${p.items.length}` : `${flipped.length} / ${p.items.length} turned`}</p></div>}
      right={<div className="grid grid-cols-2 gap-3">
        {shown.map(({ e, k }) => (
          <button key={k} onClick={() => setFlipped(f => f.includes(k) ? f.filter(x => x !== k) : [...f, k])} className={`flip ${flipped.includes(k) ? 'on' : ''}`}>
            <span className="flip-in">
              <span className="flip-face"><Icon id={e.icon} className="w-10 h-10" /><b className="font-serif mt-2">{tr(e.title, lang)}</b>{e.kicker && <small className="text-[10px] tracking-widest opacity-60">{tr(e.kicker, lang)}</small>}</span>
              <span className="flip-face flip-back">{tr(e.short || (Array.isArray(e.text) ? e.text[0] : e.text), lang)}</span>
            </span>
          </button>
        ))}
      </div>} />
  );

  return (
    <Spread left={<div className="space-y-4">{filter}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
        {shown.map(({ e, k }) => (
          <button key={k} onClick={() => { setSel(k); reveal(); }} className={`p-3 text-left border transition-all ${sel === k ? 'border-accent bg-accent/[.07] -translate-y-0.5 shadow' : 'border-ink/15 hover:border-ink/40 bg-paper/40'}`}>
            <Icon id={e.icon} className="w-6 h-6" />
            <b className="block mt-1 font-serif text-sm text-ink leading-snug">{tr(e.title, lang)}</b>
            {e.short && <span className="block mt-0.5 text-[11px] leading-snug text-ink/55 font-serif">{tr(e.short, lang)}</span>}
          </button>
        ))}
      </div></div>}
      right={<Detail e={p.items[sel]} lang={lang} color={colorOf(p.cats, p.items[sel]?.cat)} />} />
  );
};

export const CompareBlock: React.FC<BlockProps<ComparePage>> = ({ p, lang, Spread }) => {
  const [a, setA] = useState(0), [b, setB] = useState(Math.min(1, p.eras.length - 1)), [spot, setSpot] = useState(-1);
  const tabs = p.eras.map((e, k) => ({ id: String(k), label: e.title }));
  if (p.variant === 'columns') {
    const pane = (v: number, set: (n: number) => void) => <div className="space-y-4">{p.eras.length > 2 && <Tabs items={tabs} value={String(v)} onChange={id => set(+id)} lang={lang} />}<Detail e={p.eras[v]} lang={lang} /></div>;
    return <Spread left={pane(a, setA)} right={pane(b, setB)} />;
  }
  const e = p.eras[a], spots = e.spots || [];
  return (
    <Spread
      left={<div className="space-y-4">
        <div className="flex gap-2">
          {p.eras.map((x, k) => (
            <button key={k} onClick={() => { setA(k); setSpot(-1); }} className="flex-1 flex flex-col items-center gap-1 group">
              <Seal color={tint(k)} on={k === a}>{x.icon && x.icon.length <= 2 ? x.icon : k + 1}</Seal>
              <span className={`text-[11px] font-serif text-center leading-tight ${k === a ? 'text-accent font-bold' : 'text-ink/60'}`}>{tr(x.kicker || x.title, lang)}</span>
            </button>
          ))}
        </div>
        <Img key={a} src={e.image} natural className="fade-in">
          {spots.map((s, k) => <Pin key={k} x={s.x} y={s.y} n={k + 1} on={spot === k} local onClick={() => setSpot(spot === k ? -1 : k)} />)}
        </Img>
        {spot >= 0 && <div className="fade-in p-3 border-l-4 border-accent bg-paper/60 font-serif text-sm text-ink"><b className="text-accent mr-2">{spot + 1}</b><b>{tr(spots[spot].title, lang)}</b><p className="mt-1 opacity-80">{tr(Array.isArray(spots[spot].text) ? spots[spot].text![0] : spots[spot].text, lang)}</p></div>}
      </div>}
      right={<Detail e={{ ...e, image: undefined }} lang={lang} />} />
  );
};
