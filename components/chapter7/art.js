/* =========================================================
   第七章美术 —— 梅尔基亚德斯画的马孔多地图（三个年代）
   玩法：从①出发一笔画完整张地图，按编号经过每个地标；
   走过的格子会被飓风抹去，所以每一格只能走一次。
   河只能从桥上过，铁轨只能顺着铁轨直着走，电网和院墙过不去。
   ========================================================= */
import { idx } from './route.js';

const INK = '#2b1d12', WOOD = '#8a6038', WOOD2 = '#5e3f22', RED = '#8a2a1c', GOLD = '#c8a45a', GREEN = '#7d8a52', WATER = '#6d8fa0';
export const GX = 50, GY = 52, GS = 300;

function build(def) {
  const P = { ...def, walls: [], rails: {} };
  if (def.river) for (let r = 0; r < def.H; r++) if (!def.river.open.includes(r)) P.walls.push([r, def.river.c, 'R']);
  for (const f of def.fences || []) P.walls.push([f.r, f.c, f.s]);
  for (const [r, c] of def.railCells || []) P.rails[idx(P, r, c)] = 'h';
  P.cs = GS / def.W;
  return P;
}

export const MAPS = [
  build({
    id: 0, W: 5, H: 5, era: '建村', capt: 'Lám. VII.i · La fundación', deco: 'wild',
    title: 'MACONDO · 建村之初',
    marks: [22, 6, 3, 7, 24],
    names: ['二十户人家', '布恩迪亚家', '吉普赛人的帐篷', '大栗树', '梅尔基亚德斯的墓'],
    icons: ['huts', 'manor', 'tent', 'chestnut', 'grave'],
    intro: '这是梅尔基亚德斯画的马孔多。从①出发，一笔画过地图上的每一格，按顺序经过每个地方——走过的地方会被风抹去，不能再走第二次。',
  }),
  build({
    id: 1, W: 6, H: 6, era: '战争年代', capt: 'Lám. VII.ii · Los años de la guerra', deco: 'town',
    title: 'MACONDO · 三十二场战争',
    marks: [33, 20, 31, 16, 3, 29],
    river: { c: 2, open: [2, 5] },
    names: ['广场', '教堂', '上校的金鱼作坊', '兵营', '行刑的墙', '尼兰迪亚的停战帐篷'],
    icons: ['square', 'church', 'fish', 'barracks', 'wall', 'whitetent'],
    intro: '河从镇子中间流过。过河只能走桥——地图上一共只有两座桥。',
  }),
  build({
    id: 2, W: 7, H: 7, era: '香蕉热', capt: 'Lám. VII.iii · La fiebre del banano', deco: 'banana',
    title: 'MACONDO · 香蕉热',
    marks: [2, 17, 31, 29, 19, 40, 12],
    river: { c: 3, open: [2, 6] },
    fences: [{ r: 3, c: 0, s: 'D', kind: 'wire' }, { r: 3, c: 1, s: 'D', kind: 'wire' }, { r: 1, c: 5, s: 'D', kind: 'garden' }, { r: 1, c: 6, s: 'D', kind: 'garden' }],
    railCells: [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5]],
    names: ['村口', '广场', '香蕉公司', '美国佬的镇子', '电影院', '火车站', '梅尔基亚德斯的房间'],
    icons: ['sign', 'square', 'company', 'bungalow', 'cinema', 'station', 'room'],
    intro: '火车来了。铁轨上只能顺着铁轨直着走；美国佬用电网圈起了自己的镇子，老宅的院墙也翻不过去。',
  }),
];

const DEFS = `<defs>
  <linearGradient id="c7-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87a4a"/><stop offset="1" stop-color="${WOOD2}"/></linearGradient>
  <radialGradient id="c7-age" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#7a5a2a" stop-opacity="0"/><stop offset="1" stop-color="#7a5a2a" stop-opacity=".35"/></radialGradient>
  <radialGradient id="c7-markG"><stop offset="0" stop-color="#fff2bf" stop-opacity=".95"/><stop offset="1" stop-color="#f2dc9a" stop-opacity="0"/></radialGradient>
  <pattern id="c7-parch" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#efe1b8"/><circle cx="12" cy="18" r="1.1" fill="#c9b07a" opacity=".55"/><circle cx="44" cy="40" r="1.6" fill="#c9b07a" opacity=".35"/><path d="M30 6 q4 5 1 10" stroke="#c4a870" stroke-width=".6" fill="none" opacity=".5"/></pattern>
  <filter id="c7-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
</defs>`;

/* ---------------- 小图标（按 50 单位的格子设计，以格心为原点） ---------------- */
const S = `stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"`;
const ICON = {
  huts: `${[[-10, 4], [9, -3], [2, 10]].map(([x, y]) => `<path d="M${x - 7} ${y + 2} L${x} ${y - 6} L${x + 7} ${y + 2} V${y + 8} H${x - 7}Z" fill="#d9b86a" ${S}/><path d="M${x - 9} ${y + 3} L${x} ${y - 8} L${x + 9} ${y + 3}" fill="none" stroke="#8a6a3a" stroke-width="2.4"/>`).join('')}`,
  manor: `<rect x="-15" y="-4" width="30" height="16" fill="#efe0b8" ${S}/><path d="M-18 -3 L0 -15 L18 -3Z" fill="#a8603e" ${S}/><rect x="-3" y="3" width="6" height="9" fill="${WOOD2}"/><rect x="-11" y="0" width="5" height="5" fill="#6d8fa0" ${S}/><rect x="6" y="0" width="5" height="5" fill="#6d8fa0" ${S}/>`,
  tent: `<path d="M-16 12 L0 -13 L16 12Z" fill="#c9443a" ${S}/><path d="M-8 12 L0 -13 L8 12" fill="#e9c46a" ${S}/><path d="M-4 12 L0 3 L4 12Z" fill="${INK}"/><path d="M0 -13 V-19 l7 2 l-7 2" fill="${GOLD}" ${S}/>`,
  whitetent: `<path d="M-16 12 L0 -12 L16 12Z" fill="#fbf6e6" ${S}/><path d="M-4 12 L0 3 L4 12Z" fill="${INK}"/><path d="M0 -12 V-19 h8 v5 h-8" fill="#fff" ${S}/>`,
  chestnut: `<path d="M0 14 V0" stroke="${WOOD2}" stroke-width="4"/><circle cx="-6" cy="-4" r="8" fill="${GREEN}" ${S}/><circle cx="6" cy="-5" r="8" fill="${GREEN}" ${S}/><circle cx="0" cy="-11" r="8" fill="#8a9a5a" ${S}/><circle cx="-3" cy="-6" r="1.6" fill="#8a5a2a"/><circle cx="5" cy="-9" r="1.6" fill="#8a5a2a"/><path d="M-6 13 q6 -4 12 0" stroke="${INK}" stroke-dasharray="2 1.6" fill="none"/>`,
  grave: `<path d="M-14 12 Q0 2 14 12Z" fill="#b89a68" ${S}/><path d="M0 8 V-14 M-7 -7 H7" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="9" cy="5" r="2" fill="#c9443a"/>`,
  square: `<rect x="-14" y="-10" width="28" height="22" fill="#e6d2a0" ${S}/><circle cx="0" cy="1" r="5" fill="#9fc0cc" ${S}/>${[[-10, -6], [10, -6], [-10, 8], [10, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${GREEN}" ${S}/>`).join('')}`,
  church: `<rect x="-11" y="-2" width="22" height="14" fill="#efe0b8" ${S}/><path d="M-13 -1 L0 -9 L13 -1Z" fill="#a8603e" ${S}/><rect x="-4" y="-17" width="8" height="10" fill="#efe0b8" ${S}/><path d="M0 -17 V-23 M-3 -20 H3" stroke="${INK}" stroke-width="1.6"/><path d="M-3 12 V6 Q0 3 3 6 V12" fill="${WOOD2}"/>`,
  fish: `<path d="M-14 0 Q-4 -11 8 -2 L15 -9 L15 9 L8 2 Q-4 11 -14 0Z" fill="#e2b04a" ${S}/><circle cx="-7" cy="-1" r="1.6" fill="${INK}"/><path d="M-2 -4 Q2 0 -2 4" fill="none" stroke="${INK}" stroke-width=".8"/>`,
  barracks: `<rect x="-15" y="-2" width="30" height="13" fill="#b9a27a" ${S}/><path d="M-15 -2 H15" stroke="${INK}" stroke-width="2.4"/>${[-9, -3, 3, 9].map(x => `<rect x="${x - 1.6}" y="2" width="3.2" height="4" fill="${INK}"/>`).join('')}<path d="M10 -2 V-19" stroke="${INK}" stroke-width="1.4"/><path d="M10 -19 h-11 l3 3.5 l-3 3.5 h11" fill="${RED}" ${S}/>`,
  wall: `<rect x="-15" y="-8" width="30" height="19" fill="#c99a6a" ${S}/>${[-3, 3, 9].map(y => `<path d="M-15 ${y} H15" stroke="${INK}" stroke-opacity=".5"/>`).join('')}<circle cx="-5" cy="-1" r="1.4" fill="${INK}"/><circle cx="4" cy="2" r="1.4" fill="${INK}"/><circle cx="-1" cy="6" r="1.4" fill="${INK}"/>`,
  sign: `<path d="M0 14 V-8" stroke="${WOOD2}" stroke-width="3"/><path d="M-15 -14 H11 L16 -9 L11 -4 H-15Z" fill="#efe0b8" ${S}/><text x="-1" y="-6.6" font-size="6" text-anchor="middle" fill="${INK}" font-style="italic" letter-spacing=".6">MACONDO</text>`,
  company: `<rect x="-15" y="-10" width="30" height="22" fill="#f2ead2" ${S}/><path d="M-15 -10 H15" stroke="${INK}" stroke-width="2.6"/>${[-9, -1, 7].map(x => `<rect x="${x}" y="-5" width="4" height="5" fill="#6d8fa0"/>`).join('')}<path d="M-6 9 Q0 2 8 6" stroke="#e2c440" stroke-width="4" stroke-linecap="round" fill="none"/>`,
  bungalow: `<rect x="-13" y="-1" width="26" height="12" fill="#f6f2e4" ${S}/><path d="M-16 0 L0 -10 L16 0Z" fill="#7d8a52" ${S}/><path d="M-13 5 H13" stroke="${INK}" stroke-opacity=".4"/><rect x="-3" y="4" width="6" height="7" fill="${WOOD2}"/><path d="M-18 13 H18" stroke="${INK}" stroke-dasharray="2 2"/>`,
  cinema: `<rect x="-14" y="-6" width="28" height="18" fill="#e6d2a0" ${S}/><path d="M-16 -6 H16 L13 -12 H-13Z" fill="${RED}" ${S}/><circle cx="-5" cy="3" r="5" fill="none" ${S}/><circle cx="6" cy="3" r="5" fill="none" ${S}/><circle cx="-5" cy="3" r="1.2" fill="${INK}"/><circle cx="6" cy="3" r="1.2" fill="${INK}"/>`,
  station: `<rect x="-15" y="-4" width="30" height="15" fill="#d9c39a" ${S}/><path d="M-18 -3 H18 L13 -11 H-13Z" fill="#6a4a36" ${S}/><circle cx="0" cy="2" r="4.4" fill="#fbf6e6" ${S}/><path d="M0 2 V-1 M0 2 H2.4" stroke="${INK}"/>`,
  room: `<rect x="-14" y="-12" width="28" height="24" fill="#efe0b8" ${S}/><rect x="-14" y="-12" width="28" height="24" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M-8 -6 h16 v12 h-16 z" fill="#f6ecd0" ${S}/><path d="M-5 -2 H5 M-5 1 H5 M-5 4 H2" stroke="${INK}" stroke-width=".8"/><circle cx="9" cy="-8" r="2" fill="#ffcf5a"/>`,
};

/* 地形点缀（伪随机但固定） */
const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) ^ 0x5bd1e995; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const DECO = {
  tuft: `<path d="M-6 5 l2 -6 l2 6 M1 5 l2 -7 l2 7" stroke="#6f7a3a" stroke-width="1.2" fill="none"/>`,
  tree: `<path d="M0 8 V2" stroke="${WOOD2}" stroke-width="2"/><circle cx="0" cy="-2" r="6" fill="#9fb07a" stroke="${INK}" stroke-width=".9"/>`,
  reeds: `<path d="M-5 7 V-4 M0 7 V-7 M5 7 V-3" stroke="#6f7a3a" stroke-width="1.1"/><ellipse cx="0" cy="-8" rx="1.6" ry="3" fill="#8a5a2a"/><path d="M-9 8 H9" stroke="${WATER}" stroke-opacity=".5"/>`,
  stone: `<ellipse cx="-3" cy="3" rx="5" ry="3" fill="#c9b689" stroke="${INK}" stroke-width=".8"/><ellipse cx="5" cy="5" rx="3" ry="2" fill="#c9b689" stroke="${INK}" stroke-width=".8"/>`,
  hut: `<path d="M-6 6 V0 L0 -5 L6 0 V6Z" fill="#d9b86a" stroke="${INK}" stroke-width=".9"/>`,
  almond: `<path d="M0 8 V2" stroke="${WOOD2}" stroke-width="2"/><ellipse cx="0" cy="-2" rx="7" ry="5" fill="#a9b884" stroke="${INK}" stroke-width=".9"/>`,
  banana: `<path d="M0 9 V-2" stroke="#6f7a3a" stroke-width="2"/><path d="M0 -2 q-9 -3 -11 3 M0 -2 q9 -4 11 2 M0 -3 q-4 -8 -1 -11 M0 -3 q5 -7 2 -11" stroke="#6f8a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
};
const PAL = { wild: ['tuft', 'tree', 'reeds', 'stone', 'tuft', ''], town: ['hut', 'almond', 'tuft', 'hut', '', ''], banana: ['banana', 'banana', 'hut', 'tuft', 'banana', ''] };

const cx = (P, c) => GX + (c + .5) * P.cs, cy = (P, r) => GY + (r + .5) * P.cs;
export const center = (P, i) => [cx(P, i % P.W), cy(P, Math.floor(i / P.W))];

function cellEl(P, i) {
  const r = Math.floor(i / P.W), c = i % P.W, x = cx(P, c), y = cy(P, r), k = P.cs / 50, m = P.marks.indexOf(i);
  let inner = '';
  if (P.rails[i]) {
    inner = `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-25 -6 H25 M-25 6 H25" stroke="${INK}" stroke-width="2"/>${[-20, -10, 0, 10, 20].map(t => `<path d="M${t} -10 V10" stroke="${WOOD2}" stroke-width="3"/>`).join('')}</g>`;
  } else if (m >= 0) {
    const bx = x + (P.river && c === P.river.c + 1 ? 1 : -1) * P.cs * .32, by = y - P.cs * .32;
    inner = `<circle cx="${x}" cy="${y}" r="${P.cs * .46}" fill="url(#c7-markG)"/>
      <g transform="translate(${x} ${y + P.cs * .04}) scale(${k * .95})">${ICON[P.icons[m]]}</g>
      <g class="c7-badge"><circle cx="${bx}" cy="${by}" r="${Math.max(7, P.cs * .16)}" fill="${RED}" stroke="#f6ecd0" stroke-width="1.2"/>
      <text x="${bx}" y="${by}" font-size="${Math.max(9, P.cs * .2)}" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#f6ecd0">${m + 1}</text></g>`;
  } else {
    const pal = PAL[P.deco], d = pal[Math.floor(hash(P.id + 7, i) * pal.length)];
    if (d) inner = `<g transform="translate(${(x + (hash(i, 3) - .5) * P.cs * .3).toFixed(1)} ${(y + (hash(i, 5) - .5) * P.cs * .3).toFixed(1)}) scale(${(k * .85).toFixed(3)})" opacity=".8">${DECO[d]}</g>`;
  }
  const tile = `<rect class="c7-tile" x="${(x - P.cs / 2 + .6).toFixed(1)}" y="${(y - P.cs / 2 + .6).toFixed(1)}" width="${(P.cs - 1.2).toFixed(1)}" height="${(P.cs - 1.2).toFixed(1)}"/>`;
  return `<g class="c7-cell${m >= 0 ? ' c7-mk' : ''}${P.rails[i] ? ' c7-rail' : ''}" id="c7-c${i}" data-i="${i}">${tile}<g class="c7-in">${inner}</g></g>`;
}

function riverEl(P) {
  if (!P.river) return '';
  const X = GX + (P.river.c + 1) * P.cs, w = P.cs * .3;
  const wav = [...Array(P.H * 2 + 1)].map((_, k) => `${k ? 'L' : 'M'}${(X + Math.sin(k * 1.7) * 2.2).toFixed(1)} ${(GY + k * P.cs / 2).toFixed(1)}`).join(' ');
  const bridges = P.river.open.map(r => {
    const y = cy(P, r);
    if (P.rails[idx(P, r, P.river.c)] || P.rails[idx(P, r, P.river.c + 1)]) {
      return `<g><rect x="${X - w * .9}" y="${y - P.cs * .2}" width="${w * 1.8}" height="${P.cs * .4}" fill="#6b5f52" stroke="${INK}"/><path d="M${X - w * .9} ${y - P.cs * .12} H${X + w * .9} M${X - w * .9} ${y + P.cs * .12} H${X + w * .9}" stroke="${INK}" stroke-width="2"/></g>`;
    }
    return `<g><rect x="${X - w * .9}" y="${y - P.cs * .2}" width="${w * 1.8}" height="${P.cs * .4}" fill="url(#c7-wood)" stroke="${INK}"/>
      ${[...Array(5)].map((_, t) => `<path d="M${(X - w * .9 + (t + .5) * w * 1.8 / 5).toFixed(1)} ${(y - P.cs * .2).toFixed(1)} v${(P.cs * .4).toFixed(1)}" stroke="${INK}" stroke-opacity=".45"/>`).join('')}
      <path d="M${X - w * .9} ${y - P.cs * .2} H${X + w * .9} M${X - w * .9} ${y + P.cs * .2} H${X + w * .9}" stroke="${INK}" stroke-width="2"/></g>`;
  }).join('');
  return `<g class="c7-river" pointer-events="none">
    <path d="${wav}" stroke="#9fbccb" stroke-width="${w}" fill="none" stroke-linecap="round"/>
    <path d="${wav}" stroke="${WATER}" stroke-width="1.2" fill="none" stroke-dasharray="6 5" class="c7-flow"/>
    <path d="${wav}" stroke="${INK}" stroke-opacity=".45" stroke-width="${w + 2}" fill="none" style="mix-blend-mode:multiply" opacity=".18"/>
    ${bridges}
  </g>`;
}
function fenceEl(P) {
  return (P.fences || []).map(f => {
    const y = GY + (f.r + 1) * P.cs, x0 = GX + f.c * P.cs, x1 = x0 + P.cs;
    if (f.kind === 'wire') return `<g pointer-events="none"><path d="M${x0} ${y - 3} H${x1} M${x0} ${y + 1} H${x1}" stroke="${INK}" stroke-width="1"/>
      ${[0, .5, 1].map(t => `<path d="M${x0 + t * P.cs} ${y - 7} V${y + 5}" stroke="${WOOD2}" stroke-width="2.6"/>`).join('')}
      <path d="M${x0 + 6} ${y - 1} l3 -4 l3 4 l3 -4 l3 4" stroke="#c9443a" stroke-width="1" fill="none"/></g>`;
    return `<g pointer-events="none"><rect x="${x0}" y="${y - 4}" width="${P.cs}" height="8" fill="#c9a07a" stroke="${INK}"/>
      ${[...Array(4)].map((_, t) => `<path d="M${x0 + (t + .5) * P.cs / 4} ${y - 4} v8" stroke="${INK}" stroke-opacity=".5"/>`).join('')}</g>`;
  }).join('');
}

/* ---------------- 地图页 ---------------- */
function map(i) {
  const P = MAPS[i], N = P.W * P.H;
  const grid = [...Array(P.W + 1)].map((_, k) => `<path d="M${GX + k * P.cs} ${GY} V${GY + GS}" />`).join('') + [...Array(P.H + 1)].map((_, k) => `<path d="M${GX} ${GY + k * P.cs} H${GX + GS}"/>`).join('');
  const comp = `<g transform="translate(374 30)" stroke="${INK}" stroke-width=".8"><circle r="13" fill="#f2e6c4"/><path d="M0 -12 L3 0 L0 12 L-3 0Z" fill="${RED}"/><path d="M-12 0 L0 3 L12 0 L0 -3Z" fill="#f2e6c4"/><text y="-15" font-size="7" text-anchor="middle" fill="${INK}" stroke="none">N</text></g>`;
  return `<svg id="c7-main" class="c1-scene" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="url(#c7-parch)"/>
  <rect width="400" height="400" fill="url(#c7-age)" pointer-events="none"/>
  <text x="200" y="30" font-size="13" letter-spacing=".32em" text-anchor="middle" fill="${INK}" font-style="italic">${P.title}</text>
  <path d="M120 38 H280" stroke="${INK}" stroke-opacity=".35"/>
  ${comp}
  <rect x="${GX - 8}" y="${GY - 8}" width="${GS + 16}" height="${GS + 16}" fill="none" stroke="${INK}" stroke-width="1.6"/>
  <rect x="${GX - 4}" y="${GY - 4}" width="${GS + 8}" height="${GS + 8}" fill="none" stroke="${INK}" stroke-opacity=".4"/>
  <g stroke="${INK}" stroke-opacity=".12" fill="none">${grid}</g>
  <g id="c7-cells">${[...Array(N)].map((_, k) => cellEl(P, k)).join('')}</g>
  ${riverEl(P)}${fenceEl(P)}
  <polyline id="c7-ghost" fill="none" stroke="#b8862e" stroke-width="${(P.cs * .16).toFixed(1)}" stroke-dasharray="3 6" stroke-linecap="round" stroke-linejoin="round" opacity="0" pointer-events="none"/>
  <polyline id="c7-pathS" fill="none" stroke="#5a2a12" stroke-opacity=".18" stroke-width="${(P.cs * .4).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" filter="url(#c7-blur)"/>
  <polyline id="c7-path" fill="none" stroke="${RED}" stroke-width="${(P.cs * .26).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>
  <polyline id="c7-pathH" fill="none" stroke="#e8b46a" stroke-width="${(P.cs * .07).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 ${(P.cs * .3).toFixed(1)}" pointer-events="none" class="c7-flow"/>
  <g id="c7-head" opacity="0" pointer-events="none"><circle r="${(P.cs * .22).toFixed(1)}" fill="#f6ecd0" stroke="${RED}" stroke-width="2"/><circle r="${(P.cs * .08).toFixed(1)}" fill="${RED}"/></g>
  <rect id="c7-bad" width="${P.cs}" height="${P.cs}" fill="#c9443a" opacity="0" pointer-events="none"/>
  <path id="c7-badE" stroke="#c9443a" stroke-width="5" stroke-linecap="round" opacity="0" pointer-events="none"/>
  <g id="c7-gust" pointer-events="none"></g>
  <rect id="c7-hit" x="${GX}" y="${GY}" width="${GS}" height="${GS}" fill="transparent" style="touch-action:none"/>
  <text id="c7-next" x="200" y="378" font-size="12.5" letter-spacing=".14em" text-anchor="middle" fill="${INK}"></text>
</svg>`;
}

export const ART7 = { DEFS, map };
