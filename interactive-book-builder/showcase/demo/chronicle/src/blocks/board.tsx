import React, { useMemo, useState } from 'react';
import { tr } from '../types';
import { Emblem } from '../components/emblems';
import type { GraphPage, MapPage } from './types';
import { Detail, Pin, Stepper, Tabs, colorOf, type BlockProps } from './ui';

/* 坐标板类：graph 人物关系 / 家谱，map 地图点位 / 路线 —— 共用 Board（底图 + SVG 连线 + 点位） */

type Line = { a: [number, number]; b: [number, number]; dashed?: boolean; on?: boolean; elbow?: boolean };
const Board: React.FC<{ image?: string; ratio: string; lines?: Line[]; path?: [number, number][]; compass?: boolean; children: React.ReactNode }> = ({ image, ratio, lines = [], path, compass, children }) => (
  <div className={`board relative w-full ${image ? '' : ratio} border border-ink/20 overflow-hidden`}>
    {image ? <img src={image} alt="" className="block w-full h-auto sepia-[.25] opacity-90" /> : (
      <div className="absolute inset-0 stained-parchment">
        <svg className="absolute inset-0 w-full h-full text-ink/15" preserveAspectRatio="none" viewBox="0 0 100 100">{[...Array(9)].map((_, i) => <path key={i} d={`M${(i + 1) * 10} 0V100M0 ${(i + 1) * 10}H100`} stroke="currentColor" strokeWidth=".3" vectorEffect="non-scaling-stroke" strokeDasharray="2 3" />)}</svg>
        {compass && <Emblem id="compass" className="absolute right-2 bottom-2 w-14 h-14 text-ink/30" />}
      </div>
    )}
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
      {lines.map((l, i) => <path key={i} d={l.elbow ? `M${l.a[0]} ${l.a[1]}V${(l.a[1] + l.b[1]) / 2}H${l.b[0]}V${l.b[1]}` : `M${l.a[0]} ${l.a[1]}L${l.b[0]} ${l.b[1]}`} fill="none"
        stroke={l.on ? 'rgb(var(--pp-accent-rgb))' : 'rgb(var(--pp-ink-rgb))'} strokeOpacity={l.on ? .9 : .28} strokeWidth={l.on ? 2 : 1.2} strokeDasharray={l.dashed ? '4 3' : undefined} vectorEffect="non-scaling-stroke" />)}
      {path && path.length > 1 && <polyline points={path.map(p => p.join(',')).join(' ')} fill="none" stroke="rgb(var(--pp-accent-rgb))" strokeWidth="2" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" className="route" />}
    </svg>
    {children}
  </div>
);

/** 家谱布局：无 parent 的为根，叶子依次占位，父节点居中于子节点；深度决定纵坐标 */
function layoutTree(nodes: GraphPage['nodes']) {
  const kids: Record<string, string[]> = {}, pos: Record<string, [number, number]> = {};
  const ids = new Set(nodes.map(n => n.id));
  nodes.forEach(n => { if (n.parent && ids.has(n.parent)) (kids[n.parent] ||= []).push(n.id); });
  let slot = 0, depth = 0;
  const walk = (id: string, d: number): number => {
    depth = Math.max(depth, d);
    const c = kids[id] || [];
    const x = c.length ? c.map(k => walk(k, d + 1)).reduce((s, v) => s + v, 0) / c.length : slot++;
    pos[id] = [x, d];
    return x;
  };
  nodes.filter(n => !n.parent || !ids.has(n.parent)).forEach(n => walk(n.id, 0));
  const sx = (v: number) => slot <= 1 ? 50 : 10 + (v / (slot - 1)) * 80, sy = (d: number) => depth === 0 ? 50 : 12 + (d / depth) * 76;
  Object.keys(pos).forEach(k => { pos[k] = [sx(pos[k][0]), sy(pos[k][1])]; });
  return pos;
}

export const GraphBlock: React.FC<BlockProps<GraphPage>> = ({ p, lang, Spread }) => {
  const tree = p.variant === 'tree';
  const pos = useMemo(() => {
    if (tree) return layoutTree(p.nodes);
    const o: Record<string, [number, number]> = {};
    p.nodes.forEach((n, i) => { const a = (i / p.nodes.length) * Math.PI * 2; o[n.id] = [n.x ?? 50 + 36 * Math.sin(a), n.y ?? 50 - 36 * Math.cos(a)]; });
    return o;
  }, [p, tree]);
  const [sel, setSel] = useState(p.nodes[0]?.id);
  type L = { a: string; b: string; dashed?: boolean; elbow: boolean };
  const links: L[] = [...(tree ? p.nodes.filter(n => n.parent && pos[n.parent]).map(n => ({ a: n.parent!, b: n.id, elbow: true })) : []), ...(p.links || []).map(l => ({ a: l.a, b: l.b, dashed: l.dashed, elbow: false }))].filter(l => pos[l.a] && pos[l.b]);
  const node = p.nodes.find(n => n.id === sel);
  const rel = (p.links || []).filter(l => l.a === sel || l.b === sel);
  const name = (id: string) => tr(p.nodes.find(n => n.id === id)?.title, lang);
  return (
    <Spread
      left={<div className="space-y-3">
        <Board ratio={tree ? 'aspect-[4/5]' : 'aspect-[5/6]'} lines={links.map(l => ({ a: pos[l.a], b: pos[l.b], dashed: l.dashed, elbow: l.elbow, on: l.a === sel || l.b === sel }))}>
          {p.nodes.map(n => <Pin key={n.id} x={pos[n.id][0]} y={pos[n.id][1]} n={n.icon || tr(n.title, lang).slice(0, 1)} on={n.id === sel} color={colorOf(p.groups, n.group)} label={tr(n.short || n.title, lang)} onClick={() => setSel(n.id)} />)}
        </Board>
        {p.groups && <div className="flex flex-wrap gap-3 text-[11px] font-serif text-ink/70">{p.groups.map(g => <span key={g.id} className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full" style={{ background: colorOf(p.groups, g.id) }} />{tr(g.label, lang)}</span>)}</div>}
      </div>}
      right={<Detail e={node} lang={lang} color={colorOf(p.groups, node?.group)}>
        {!!rel.length && <div className="border-t border-ink/10 pt-3 space-y-1.5">
          <div className="text-[11px] tracking-[0.3em] font-bold opacity-50">{lang === 'zh' ? '关系' : 'TIES'}</div>
          {rel.map((l, i) => { const o = l.a === sel ? l.b : l.a; return <button key={i} onClick={() => setSel(o)} className="block text-left font-serif text-sm hover:text-accent">{l.label && <span className="text-accent mr-2">{tr(l.label, lang)}</span>}{name(o)} ›</button>; })}
        </div>}
      </Detail>} />
  );
};

export const MapBlock: React.FC<BlockProps<MapPage>> = ({ p, lang, Spread }) => {
  const journey = p.variant === 'journey';
  const [i, setI] = useState(journey ? 0 : -1), [kind, setKind] = useState('');
  const shown = p.places.map((e, k) => ({ e, k })).filter(x => !kind || x.e.kind === kind);
  const it = p.places[i];
  return (
    <Spread
      left={<div className="space-y-3">
        {!journey && p.kinds && <Tabs items={p.kinds} value={kind} onChange={setKind} lang={lang} all={lang === 'zh' ? '全部' : 'All'} />}
        <Board image={p.image} ratio="aspect-[4/3]" compass path={journey ? p.places.slice(0, i + 1).map(e => [e.x, e.y]) : undefined}>
          {shown.map(({ e, k }) => <Pin key={k} x={e.x} y={e.y} n={journey ? k + 1 : e.icon || ''} on={k === i} color={journey && k > i ? 'rgb(var(--pp-ink-rgb) / .35)' : colorOf(p.kinds, e.kind)} label={!journey || k === i ? tr(e.short || e.title, lang) : undefined} onClick={() => setI(k)} />)}
        </Board>
      </div>}
      right={<div className="space-y-5">
        <Detail e={it} lang={lang} color={colorOf(p.kinds, it?.kind)} />
        {journey && <Stepper i={i} n={p.places.length} set={setI} label={lang === 'zh' ? `第 ${i + 1} / ${p.places.length} 站` : `Stop ${i + 1} / ${p.places.length}`} />}
      </div>} />
  );
};
