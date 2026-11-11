import React, { useState } from 'react';
import { tr } from '../types';
import { Emblem } from '../components/emblems';
import type { OpenerPage, TocPage } from './types';
import { Img, Paras, reveal, type BlockProps } from './ui';

/* 版式类：opener 章扉页 / toc 本章纲要 —— 给一章开头一个"翻开"的仪式感 */

export const OpenerBlock: React.FC<BlockProps<OpenerPage>> = ({ p, lang, Spread }) => {
  const chapter = tr(p.chapter, lang);
  const plate = p.variant !== 'plain' && !!p.image;
  const left = plate ? (
    <figure className="op-plate fade-in">
      <Img src={p.image} natural />
      {chapter && <span className="op-stamp">{chapter}</span>}
      <span className="op-frame" />
    </figure>
  ) : (
    <div className="op-blank">
      <span className="op-num">{(chapter || 'I').slice(0, 2)}</span>
      {chapter && <em>{chapter}</em>}
      <Emblem id="compass" className="op-mark" />
    </div>
  );
  return (
    <Spread left={left} right={
      <div className="op-body">
        {p.latin && <div className="op-latin">{tr(p.latin, lang)}</div>}
        <h1 className="op-title">{tr(p.title, lang)}</h1>
        <span className="op-rule"><i /><b /><i /></span>
        {p.lede && <p className="op-lede">{tr(p.lede, lang)}</p>}
        {!!p.stats?.length && (
          <dl className="op-stats">
            {p.stats.map((s, i) => <div key={i}><dt>{s.n}</dt><dd>{tr(s.label, lang)}</dd></div>)}
          </dl>
        )}
        {p.quote && <blockquote className="op-quote">“{tr(p.quote.text, lang)}”{p.quote.source && <footer>{tr(p.quote.source, lang)}</footer>}</blockquote>}
      </div>} />
  );
};

export const TocBlock: React.FC<BlockProps<TocPage>> = ({ p, lang, Spread }) => {
  const [open, setOpen] = useState(0);
  const left = (
    <div className="toc-side">
      {p.image ? <Img src={p.image} natural /> : <div className="toc-mark"><Emblem id="feather" className="w-16 h-16 mx-auto" /></div>}
      {p.note && <p className="toc-note">{tr(p.note, lang)}</p>}
    </div>
  );
  const right = (
    <ol className="toc-list">
      {p.items.map((e, i) => (
        <li key={i} className={open === i ? 'on' : ''}>
          <button onClick={() => { setOpen(open === i ? -1 : i); reveal(); }} className="toc-row">
            <span className="toc-no">{String(i + 1).padStart(2, '0')}</span>
            <span className="toc-t">
              <b>{tr(e.title, lang)}</b>
              {e.short && <small>{tr(e.short, lang)}</small>}
            </span>
            {e.page !== undefined && <span className="toc-p">{e.page}</span>}
          </button>
          <div className={`toc-more ${open === i ? 'on' : ''}`}>
            <div><Paras t={e.text || e.short} lang={lang} /></div>
          </div>
        </li>
      ))}
    </ol>
  );
  return <Spread left={left} right={right} />;
};
