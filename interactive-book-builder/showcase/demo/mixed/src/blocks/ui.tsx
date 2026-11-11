import React from 'react';
import { tr, type Lang, type T } from '../types';
import { EMBLEMS, Emblem } from '../components/emblems';
import type { Entry, Group } from './types';

/* 内页组件共用的小部件。颜色只用 ink / accent / paper（随纸张主题），不要写死 */

export type SpreadProps = { left?: React.ReactNode; right: React.ReactNode };
export type BlockProps<P> = { p: P; lang: Lang; Spread: React.FC<SpreadProps> };

/** 手机端（左右页上下排列）点选后把详情滚进视野 */
export const reveal = () => { if (innerWidth < 768) setTimeout(() => document.querySelector('[data-detail]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); };
export const list = (t: T | T[] | undefined, lang: Lang) => (Array.isArray(t) ? t : t ? [t] : []).map(x => tr(x, lang));
const PALETTE = ['rgb(var(--pp-accent-rgb))', 'var(--pp-sep)', '#4f6a52', '#34557a', '#9a7232', '#6b4a6a'];
export const tint = (k: number) => PALETTE[k % PALETTE.length];
export const colorOf = (groups: Group[] | undefined, id: string | undefined) => {
  const i = groups?.findIndex(g => g.id === id) ?? -1;
  return (i >= 0 && groups![i].color) || tint(Math.max(i, 0));
};

/** 图片。默认按 className 的 aspect 裁切（object-cover）；natural = 保持原图比例（带编号热点的图必须用它，坐标才准）
 *  maxH = 限高并居中（详情区用；SVG 需写 width/height 属性才有固有尺寸） */
export const Img: React.FC<{ src?: string; className?: string; natural?: boolean; maxH?: string; children?: React.ReactNode }> = ({ src, className = '', natural, maxH, children }) =>
  natural && src ? (
    <div className={`relative ${maxH ? 'w-fit max-w-full mx-auto' : 'w-full'} border border-ink/20 shadow-inner ${className}`}>
      <img src={src} alt="" className={`block ${maxH ? 'max-w-full w-auto' : 'w-full'} h-auto sepia-[.2]`} style={maxH ? { maxHeight: maxH } : undefined} />
      {children}
    </div>
  ) : (
    <div className={`relative overflow-hidden border border-ink/20 shadow-inner ${natural ? 'aspect-[4/3]' : ''} ${className}`}>
      {src ? <img src={src} alt="" className="w-full h-full object-cover sepia-[.2]" /> : <div className="w-full h-full stained-parchment grid place-items-center"><Emblem id="compass" className="w-1/3 text-ink/20" /></div>}
      {children}
    </div>
  );

export const Icon: React.FC<{ id?: string; className?: string }> = ({ id, className = 'w-7 h-7' }) =>
  !id ? null : EMBLEMS[id] ? <Emblem id={id} className={`${className} text-accent`} /> : <span className="ico-ch text-xl leading-none">{id}</span>;

export const Paras: React.FC<{ t?: T | T[]; lang: Lang; drop?: boolean }> = ({ t, lang, drop }) => (
  <div className="space-y-4 font-serif text-[15px] md:text-base leading-[1.95] text-ink/90">
    {list(t, lang).map((s, i) => <p key={i} className={drop && i === 0 ? 'dropcap' : 'indent-8'}>{s}</p>)}
  </div>
);

/** 右页详情：图 → 小字 → 标题 → 正文 → 要点 → 引文（任意字段可缺） */
export const Detail: React.FC<{ e?: Entry; lang: Lang; color?: string; compact?: boolean; children?: React.ReactNode }> = ({ e, lang, color, compact, children }) => {
  if (!e) return <Empty lang={lang} />;
  return (
    <article key={tr(e.title, lang)} data-detail className="fade-in text-ink space-y-4 scroll-mt-16">
      {e.image && !compact && <figure><Img src={e.image} natural maxH="40vh" />{e.caption && <figcaption className="mt-2 text-center text-xs italic opacity-60 font-serif">{tr(e.caption, lang)}</figcaption>}</figure>}
      <header className="space-y-1">
        {e.kicker && <div className="text-[11px] tracking-[0.3em] font-bold uppercase" style={{ color: color || 'rgb(var(--pp-accent-rgb))' }}>{tr(e.kicker, lang)}</div>}
        <h3 className={`font-display font-bold leading-snug ${compact ? 'text-lg' : 'text-2xl md:text-[1.7rem]'}`}>{tr(e.title, lang)}</h3>
      </header>
      <Paras t={e.text || e.short} lang={lang} />
      {!!e.facts?.length && (
        <dl className="dt-facts">
          {e.facts.map((f, i) => <div key={i}><dt>{tr(f.k, lang)}</dt><dd>{tr(f.v, lang)}</dd></div>)}
        </dl>
      )}
      {!!e.points?.length && (
        <ul className="space-y-2 border-t border-ink/10 pt-3 font-serif text-sm">
          {e.points.map((x, i) => <li key={i} className="flex gap-3"><span className="text-accent text-[10px] mt-1.5">◆</span><span>{tr(x, lang)}</span></li>)}
        </ul>
      )}
      {e.quote && <blockquote className="border-l-2 border-accent/60 pl-4 font-serif italic opacity-85">{tr(e.quote.text, lang)}{e.quote.source && <footer className="mt-1 text-xs not-italic opacity-60">{tr(e.quote.source, lang)}</footer>}</blockquote>}
      {e.source && <p className="dt-src">{tr(e.source, lang)}</p>}
      {children}
    </article>
  );
};
export const Empty: React.FC<{ lang: Lang; text?: string }> = ({ lang, text }) => (
  <div className="h-full min-h-[200px] grid place-items-center text-center text-ink/40 font-serif italic text-sm">
    <div><Emblem id="feather" className="w-12 h-12 mx-auto mb-3 text-ink/25" />{text || (lang === 'zh' ? '点按左页的条目，在这里展开' : 'Tap an entry on the left page')}</div>
  </div>
);

/** 横向标签（分类 / 分期） */
export const Tabs: React.FC<{ items: Group[]; value?: string; onChange: (id: string) => void; lang: Lang; all?: string }> = ({ items, value, onChange, lang, all }) => (
  <div className="flex flex-wrap gap-1.5">
    {all !== undefined && <button onClick={() => onChange('')} className={`tab ${!value ? 'on' : ''}`}>{all}</button>}
    {items.map((g, i) => (
      <button key={g.id} onClick={() => onChange(g.id)} className={`tab ${value === g.id ? 'on' : ''}`} style={{ '--c': g.color || colorOf(items, g.id) || PALETTE[i] } as React.CSSProperties}>{tr(g.label, lang)}</button>
    ))}
  </div>
);

/** 蜡封（时间线分组 / 分期按钮） */
export const Seal: React.FC<{ color: string; on?: boolean; children?: React.ReactNode; className?: string }> = ({ color, on, children, className = 'w-9 h-9' }) => (
  <span className={`seal ${on ? 'on' : ''} ${className}`} style={{ background: color }}>{children}</span>
);

/** 图上的编号点 / 地图点位 */
export const Pin: React.FC<{ x: number; y: number; n?: React.ReactNode; on?: boolean; color?: string; label?: string; local?: boolean; onClick: () => void }> = ({ x, y, n, on, color, label, local, onClick }) => (
  <button onClick={() => { onClick(); if (!local) reveal(); }} className={`pin ${on ? 'on' : ''}`} style={{ left: `${x}%`, top: `${y}%`, '--c': color || 'rgb(var(--pp-accent-rgb))' } as React.CSSProperties} title={label}>
    <span>{n}</span>{label && <em>{label}</em>}
  </button>
);

/** 上一条 / 下一条 */
export const Stepper: React.FC<{ i: number; n: number; set: (i: number) => void; label?: string }> = ({ i, n, set, label }) => (
  <div className="flex items-center justify-between pt-3 border-t border-ink/10 font-serif text-xs tracking-[0.2em] text-ink/60">
    <button disabled={i <= 0} onClick={() => set(i - 1)} className="px-2 py-1 hover:text-accent disabled:opacity-20">‹</button>
    <span>{label ?? `${i + 1} / ${n}`}</span>
    <button disabled={i >= n - 1} onClick={() => set(i + 1)} className="px-2 py-1 hover:text-accent disabled:opacity-20">›</button>
  </div>
);
