/* =========================================================
   第六章美术 —— 三间屋子的剖面图（缝纫室 / 秋海棠走廊 / 晾衣的院子）
   光会穿过书页：前一页从哪里漏出去，后一页就从哪里照进来。
   每页 400 x 400，房间内部是 [36,364] 见方。
   ========================================================= */
import { remedios } from '../shared/people.js';

const INK = '#2b1d12', WOOD = '#8a6038', WOOD2 = '#5e3f22', SILV = '#c9c4bb', RED = '#8a2a1c';

/* 关卡数据：入口、出口、镜子、障碍（最后一项是旁白里的名字）、答案 */
export const ROOMS = [
  {
    id: 0, name: '缝纫室', capt: 'Lám. VI.i · El cuarto de coser',
    entry: { x: 36, y: 300, ang: 0 },
    exit: { side: 'right', a: 118, b: 154 },
    mirrors: [{ x: 200, y: 300, L: 34, a0: 90, mount: 'stand' }],
    obstacles: [[258, 286, 354, 364, '缝纫桌'], [286, 252, 344, 288, '缝纫机'], [190, 36, 210, 86, '吊灯'], [52, 72, 152, 100, '布架']],
    target: null, sheets: null,
    sol: { m: [{ a: 157.5 }] },
  },
  {
    id: 1, name: '秋海棠走廊', capt: 'Lám. VI.ii · El corredor de las begonias',
    entry: { x: 36, y: 136, ang: -45 },
    exit: { side: 'top', a: 222, b: 258 },
    mirrors: [{ x: 100, y: 72, L: 30, a0: 90, mount: 'chain' }, { x: 240, y: 212, L: 34, a0: 0, mount: 'stand' }],
    obstacles: [[286, 46, 318, 96, '秋海棠吊盆'], [292, 300, 352, 364, '摇椅'], [42, 326, 98, 364, '花盆']],
    target: null, sheets: null,
    sol: { m: [{ a: 0 }, { a: 157.5 }] },
  },
  {
    id: 2, name: '晾衣的院子', capt: 'Lám. VI.iii · El patio de las sábanas',
    entry: { x: 240, y: 36, ang: 90 },
    exit: null,
    mirrors: [{ x: 240, y: 120, L: 30, a0: 0, mount: 'bracket' }, { x: 60, y: 300, L: 28, a0: 90, x0: 156, rail: [48, 192], step: 12, mount: 'rail' }],
    obstacles: [[36, 115, 222, 125, '铁架'], [282, 44, 364, 170, '栗树']],
    sheets: { items: [{ x: 176, w: 60 }, { x: 244, w: 46 }], top: 210, h: 108, max: 48, step: 8 },
    target: { x: 316, y: 298, r: 20 },
    sol: { m: [{ a: 112.5 }, { a: 67.5, x: 60 }], lift: 24 },
  },
];

const DEFS = `<defs>
  <linearGradient id="c6-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87a4a"/><stop offset="1" stop-color="${WOOD2}"/></linearGradient>
  <linearGradient id="c6-mir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f0"/><stop offset=".45" stop-color="#bfbab0"/><stop offset="1" stop-color="#6d675e"/></linearGradient>
  <linearGradient id="c6-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9dfbf"/><stop offset="1" stop-color="#f6eed6"/></linearGradient>
  <linearGradient id="c6-sun" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6c8"/><stop offset="1" stop-color="#ffe08a"/></linearGradient>
  <radialGradient id="c6-halo"><stop offset="0" stop-color="#fff4b8" stop-opacity=".95"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient>
  <pattern id="c6-paper" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#efe1bd"/><path d="M5 0 V22" stroke="#d8c08f" stroke-width="4" opacity=".45"/><circle cx="16" cy="11" r="1.4" fill="#c9a86a" opacity=".5"/></pattern>
  <pattern id="c6-boards" width="44" height="12" patternUnits="userSpaceOnUse"><rect width="44" height="12" fill="#9a6e44"/><path d="M0 12 H44 M30 0 V12" stroke="${WOOD2}" stroke-width="1" opacity=".55"/></pattern>
  <pattern id="c6-azul" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#e9e1cc"/><path d="M10 2 L18 10 L10 18 L2 10Z" fill="none" stroke="#5b7a8c" stroke-width="1" opacity=".55"/><circle cx="10" cy="10" r="2" fill="#5b7a8c" opacity=".45"/><rect width="20" height="20" fill="none" stroke="#b9ad8e" stroke-width=".6"/></pattern>
  <pattern id="c6-terra" width="30" height="12" patternUnits="userSpaceOnUse"><rect width="30" height="12" fill="#b9714a"/><path d="M0 12 H30 M15 0 V12" stroke="#7a4128" stroke-width="1" opacity=".6"/></pattern>
  <pattern id="c6-earth" width="24" height="14" patternUnits="userSpaceOnUse"><rect width="24" height="14" fill="#b89a68"/><path d="M3 9 l2 -4 l2 4 M15 5 l1.5 -3 l1.5 3" stroke="#6f7a3a" stroke-width="1" fill="none" opacity=".6"/></pattern>
  <filter id="c6-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="c6-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
</defs>`;

/* ---------------- 零件 ---------------- */
const sideWalls = (fill = '#d4bd90') => `
  <rect x="0" y="0" width="36" height="400" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>
  <rect x="364" y="0" width="36" height="400" fill="${fill}" stroke="${INK}" stroke-width="1.2"/>
  <path d="M30 0 V400 M370 0 V400" stroke="${INK}" stroke-opacity=".18"/>`;
const ceiling = (gap) => {
  const beams = [60, 140, 300].filter(x => !gap || x < gap[0] - 8 || x > gap[1] + 8);
  return `<rect x="0" y="0" width="400" height="36" fill="#bfa276" stroke="${INK}" stroke-width="1.2"/>
  ${beams.map(x => `<rect x="${x - 7}" y="30" width="14" height="10" fill="${WOOD2}" stroke="${INK}" stroke-width=".8"/>`).join('')}`;
};
const floorBoards = () => `<rect x="0" y="364" width="400" height="36" fill="url(#c6-boards)" stroke="${INK}" stroke-width="1.2"/>
  <path d="M36 356 H364" stroke="${WOOD2}" stroke-width="3"/>`;

/* 镜子：一块玻璃 + 一端的木柄（拖它转，点镜面也会转一格） */
function mirrorEl(m, i) {
  const L = m.L;
  return `<g class="c6-mir" id="c6-m${i}" data-i="${i}">
    <g class="c6-mrot">
      <rect x="${-L - 2}" y="-5" width="${2 * L + 4}" height="10" rx="3" fill="${WOOD}" stroke="${INK}" stroke-width="1.2"/>
      <rect x="${-L}" y="-3.2" width="${2 * L}" height="6.4" rx="1.5" fill="url(#c6-mir)"/>
      <path d="M${-L + 3} -1.6 H${L - 6}" stroke="#fff" stroke-opacity=".9" stroke-width="1"/>
      <g class="c6-knob"><circle cx="${L + 9}" cy="0" r="6.5" fill="#c8a45a" stroke="${INK}" stroke-width="1.2"/><circle cx="${L + 9}" cy="0" r="2" fill="${INK}"/></g>
      <rect class="c6-hit" data-hot="m" data-i="${i}" x="${-L - 10}" y="-15" width="${2 * L + 34}" height="30"/>
    </g>
    <circle cx="0" cy="0" r="3.2" fill="${SILV}" stroke="${INK}" stroke-width="1"/>
  </g>`;
}
const stand = (x, y) => `<g><path d="M${x} ${y + 6} V362" stroke="${WOOD2}" stroke-width="4"/>
  <path d="M${x - 16} 363 L${x} 350 L${x + 16} 363" fill="none" stroke="${WOOD2}" stroke-width="3.4" stroke-linecap="round"/></g>`;
const chain = (x, y) => `<path d="M${x} 36 V${y - 8}" stroke="${INK}" stroke-width="1.4" stroke-dasharray="3 2"/><circle cx="${x}" cy="${y - 6}" r="3" fill="none" stroke="${INK}"/>`;

function beamEls() {
  return `<g id="c6-beamWrap" pointer-events="none">
    <path id="c6-beamG" fill="none" stroke="#ffb82e" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity=".4" filter="url(#c6-glow)"/>
    <path id="c6-beamC" fill="none" stroke="#f0a020" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="c6-beam" fill="none" stroke="#fffbe6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 15"/>
    <g id="c6-sparks"></g>
    <circle id="c6-end2" r="13" fill="#ffd84a" opacity=".3" filter="url(#c6-soft)"/>
    <circle id="c6-end" r="4" fill="#fff6c8"/>
  </g>`;
}
const svgOpen = `<svg id="c6-main" class="c1-scene" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">`;

/* ---------------- 缝纫室 ---------------- */
function room0() {
  const R = ROOMS[0];
  return `${svgOpen}
  <rect width="400" height="400" fill="url(#c6-paper)"/>
  ${ceiling()}${floorBoards()}${sideWalls()}
  <!-- 左墙的窗：太阳从这里进来 -->
  <ellipse cx="44" cy="300" rx="22" ry="34" fill="#fff0b0" opacity=".55" filter="url(#c6-glow)"/>
  <rect id="c6-entry" x="-2" y="280" width="40" height="40" fill="url(#c6-sun)" stroke="${INK}" stroke-width="1.2"/>
  <path d="M18 280 V320 M-2 300 H38" stroke="${WOOD2}" stroke-width="2"/>
  <!-- 右墙高处的气窗：出口 -->
  <rect id="c6-exit" class="c6-exit" x="350" y="118" width="22" height="36" fill="#3e2c1e" stroke="${INK}" stroke-width="1.4"/>
  <path d="M350 130 H372 M350 142 H372" stroke="#c8a45a" stroke-opacity=".7" pointer-events="none"/>
  <path d="M346 114 H376 M346 158 H376" stroke="${WOOD2}" stroke-width="3" pointer-events="none"/>
  <!-- 布架 -->
  <g stroke="${INK}" stroke-width="1">
    <path d="M52 100 H152" stroke="${WOOD2}" stroke-width="4"/>
    <path d="M60 100 l-4 10 M144 100 l4 10" stroke="${WOOD2}" stroke-width="2"/>
    ${[['#9a4a3a', 58], ['#c9a86a', 80], ['#5b7a8c', 100], ['#7d8a52', 122]].map(([c, x]) => `<rect x="${x}" y="74" width="20" height="26" rx="3" fill="${c}"/><ellipse cx="${x + 10}" cy="74" rx="10" ry="3" fill="${c}"/>`).join('')}
  </g>
  <!-- 墙上的钟和剪刀 -->
  <g stroke="${INK}" stroke-width="1"><circle cx="112" cy="176" r="15" fill="#f6eed6"/><path d="M112 176 V166 M112 176 H120" stroke-width="1.4"/>
    <path d="M300 64 l12 24 M318 64 l-12 24" stroke-width="1.6"/><circle cx="298" cy="60" r="4" fill="none"/><circle cx="320" cy="60" r="4" fill="none"/></g>
  <!-- 吊灯 -->
  <g stroke="${INK}" stroke-width="1"><path d="M200 36 V66"/><path d="M190 84 L194 66 H206 L210 84Z" fill="#c8a45a"/></g>
  <!-- 缝纫桌和缝纫机 -->
  <g stroke="${INK}" stroke-width="1.2">
    <rect x="258" y="286" width="96" height="8" fill="url(#c6-wood)"/>
    <path d="M264 294 V362 M348 294 V362" stroke="${WOOD2}" stroke-width="4"/>
    <path d="M272 344 H340 M306 324 l-10 20 h20Z" fill="none" stroke="${WOOD2}" stroke-width="2"/>
    <path d="M288 286 V266 Q288 254 300 254 H332 Q342 254 342 264 V276 H334 V286" fill="#2e2620"/>
    <path d="M296 264 H330" stroke="#c8a45a" stroke-width="1.4"/><circle cx="314" cy="250" r="3.4" fill="#c9a86a"/>
  </g>
  <!-- 线团篮 -->
  <g stroke="${INK}" stroke-width="1"><path d="M58 362 L64 340 H104 L110 362Z" fill="#b58a3e"/>
    <circle cx="74" cy="338" r="6" fill="#9a4a3a"/><circle cx="88" cy="336" r="6" fill="#5b7a8c"/><circle cx="100" cy="339" r="5" fill="#c9a86a"/></g>
  ${stand(R.mirrors[0].x, R.mirrors[0].y)}
  ${beamEls()}
  <g transform="translate(200 300)">${mirrorEl(R.mirrors[0], 0)}</g>
</svg>`;
}

/* ---------------- 秋海棠走廊 ---------------- */
function room1() {
  const R = ROOMS[1], [m0, m1] = R.mirrors;
  const arch = x => `<path d="M${x} 250 V150 Q${x} 112 ${x + 30} 112 Q${x + 60} 112 ${x + 60} 150 V250" fill="#d6e0c4" stroke="${INK}" stroke-width="1.2"/>
    <path d="M${x + 8} 250 Q${x + 18} 200 ${x + 30} 230 Q${x + 44} 190 ${x + 52} 250" fill="#9fb07a" opacity=".7"/>`;
  return `${svgOpen}
  <rect width="400" height="400" fill="#efe3c4"/>
  ${arch(60)}${arch(160)}${arch(260)}
  <rect x="36" y="250" width="328" height="106" fill="url(#c6-azul)" stroke="${INK}" stroke-width="1"/>
  <rect x="0" y="356" width="400" height="44" fill="url(#c6-terra)" stroke="${INK}" stroke-width="1.2"/>
  ${ceiling([222, 258])}${sideWalls('#d9c39a')}
  <!-- 左墙：从上一页气窗漏过来的光 -->
  <ellipse cx="40" cy="136" rx="16" ry="26" fill="#fff0b0" opacity=".5" filter="url(#c6-glow)"/>
  <rect id="c6-entry" x="-2" y="118" width="40" height="36" fill="url(#c6-sun)" stroke="${INK}" stroke-width="1.2"/>
  <!-- 天窗：出口 -->
  <rect id="c6-exit" class="c6-exit" x="222" y="20" width="36" height="22" fill="#3e2c1e" stroke="${INK}" stroke-width="1.4"/>
  <path d="M234 20 V42 M246 20 V42" stroke="#c8a45a" stroke-opacity=".7" pointer-events="none"/>
  <path d="M218 18 V44 M262 18 V44" stroke="${WOOD2}" stroke-width="3" pointer-events="none"/>
  <!-- 吊着的秋海棠 -->
  <g stroke="${INK}" stroke-width="1">
    <path d="M302 36 V50" stroke-dasharray="3 2"/>
    <path d="M288 56 Q302 46 316 56 L312 80 H292Z" fill="#b9714a"/>
    <path d="M290 58 q-8 -12 2 -16 q4 10 6 14 M314 58 q8 -12 -2 -16 q-4 10 -6 14 M296 82 q-4 10 2 14 M308 82 q4 10 -2 14" fill="#6f8a4a"/>
    <circle cx="296" cy="48" r="3" fill="#c9443a"/><circle cx="308" cy="46" r="3" fill="#c9443a"/>
  </g>
  <!-- 地上的花盆 -->
  <g stroke="${INK}" stroke-width="1">${[52, 76].map(x => `<path d="M${x - 8} 340 H${x + 10} L${x + 7} 362 H${x - 5}Z" fill="#b9714a"/>
    <path d="M${x - 8} 340 q-4 -14 6 -12 q4 -10 8 0 q8 -4 4 12" fill="#6f8a4a"/><circle cx="${x}" cy="330" r="2.6" fill="#c9443a"/>`).join('')}</g>
  <!-- 摇椅 -->
  <g stroke="${INK}" stroke-width="1.4" fill="none">
    <path d="M296 362 Q322 370 352 356" stroke="${WOOD2}" stroke-width="3"/>
    <path d="M302 360 V330 H346 V358 M340 330 V300 Q342 294 348 296" stroke="${WOOD2}" stroke-width="3"/>
    <path d="M304 326 H344" stroke="#c8a45a" stroke-width="5"/>
  </g>
  ${chain(m0.x, m0.y)}${stand(m1.x, m1.y)}
  ${beamEls()}
  <g transform="translate(${m0.x} ${m0.y})">${mirrorEl(m0, 0)}</g>
  <g transform="translate(${m1.x} ${m1.y})">${mirrorEl(m1, 1)}</g>
</svg>`;
}

/* ---------------- 晾衣的院子 ---------------- */
function room2() {
  const R = ROOMS[2], [m0, m1] = R.mirrors, SH = R.sheets;
  return `${svgOpen}
  <rect width="400" height="400" fill="url(#c6-sky)"/>
  <path d="M36 250 Q90 228 140 244 T250 236 T364 246 V344 H36Z" fill="#d9cfa6" opacity=".6"/>
  <path d="M36 268 H364" stroke="${INK}" stroke-opacity=".15"/>
  <!-- 院墙外远处的香蕉园 -->
  <g fill="#9fb07a" opacity=".55" stroke="${INK}" stroke-opacity=".35" stroke-width=".8">
    ${[70, 128, 196].map(x => `<path d="M${x} 252 V214 M${x} 216 q-18 -2 -26 10 M${x} 216 q16 -8 26 4 M${x} 220 q-10 -14 -4 -26 M${x} 220 q12 -12 20 -14" fill="none" stroke="#6f7a3a" stroke-width="2"/>`).join('')}
  </g>
  <rect x="0" y="344" width="400" height="56" fill="url(#c6-earth)" stroke="${INK}" stroke-width="1.2"/>
  ${[[60, 352], [150, 362], [262, 356], [330, 370]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="2.4" fill="#8f7a50" opacity=".5"/>`).join('')}
  <!-- 走廊屋檐和天窗漏下的光 -->
  <rect x="0" y="0" width="400" height="36" fill="#a8603e" stroke="${INK}" stroke-width="1.2"/>
  ${[...Array(14)].map((_, k) => `<path d="M${k * 30} 36 q15 -10 30 0" fill="none" stroke="${INK}" stroke-opacity=".45"/>`).join('')}
  <rect id="c6-entry" x="222" y="-2" width="36" height="40" fill="url(#c6-sun)" stroke="${INK}" stroke-width="1.2"/>
  <!-- 左：屋墙和伸出来的铁架 -->
  <rect x="0" y="36" width="36" height="308" fill="#d9b98a" stroke="${INK}" stroke-width="1.2"/>
  <rect x="6" y="160" width="24" height="44" fill="#6a4a36" stroke="${INK}" stroke-width="1"/>
  <path d="M36 120 H222" stroke="${INK}" stroke-width="5"/><path d="M36 120 H222" stroke="#6b5f52" stroke-width="3"/>
  <path d="M36 150 L90 120" stroke="${INK}" stroke-width="2"/>
  <!-- 右：院墙外伸进来的栗树 -->
  <rect x="364" y="36" width="36" height="308" fill="#d4c3a0" stroke="${INK}" stroke-width="1.2"/>
  <path d="M400 150 Q380 140 356 122 M372 136 Q368 120 372 104" fill="none" stroke="#6a4a2a" stroke-width="6" stroke-linecap="round"/>
  <g stroke="${INK}" stroke-width="1.2">
    ${[[332, 74, 34], [298, 104, 26], [344, 128, 28], [312, 146, 22], [362, 90, 24]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#7d8a52"/>`).join('')}
    ${[[318, 88], [340, 110], [304, 128], [352, 146]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#8a5a2a"/>`).join('')}
  </g>
  <!-- 晾衣绳、床单、摇柄 -->
  <path d="M352 150 V344" stroke="${WOOD2}" stroke-width="6"/><path d="M340 344 L352 330 L364 344" fill="none" stroke="${WOOD2}" stroke-width="3"/>
  <g id="c6-line">
    <path d="M36 0 H352" stroke="${INK}" stroke-width="1.4"/>
    ${SH.items.map((s, k) => `<g class="c6-sheet"><path d="M${s.x} 0 H${s.x + s.w} V${SH.h - 6} Q${s.x + s.w * .75} ${SH.h + 2} ${s.x + s.w / 2} ${SH.h - 4} Q${s.x + s.w * .25} ${SH.h - 10} ${s.x} ${SH.h} Z" fill="#fbf6e6" stroke="${INK}" stroke-width="1.2"/>
      <path d="M${s.x + s.w * .33} 4 V${SH.h - 12} M${s.x + s.w * .66} 4 V${SH.h - 10}" stroke="${INK}" stroke-opacity=".12"/>
      <rect x="${s.x + 4}" y="-4" width="4" height="9" fill="${WOOD}"/><rect x="${s.x + s.w - 8}" y="-4" width="4" height="9" fill="${WOOD}"/></g>`).join('')}
  </g>
  <g id="c6-crankG" transform="translate(352 250)">
    <circle r="10" fill="#c9c4bb" stroke="${INK}" stroke-width="1.2"/>
    <g id="c6-crank"><path d="M0 0 H-20" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/><circle cx="-20" cy="0" r="4" fill="${WOOD}" stroke="${INK}"/></g>
    <circle class="c6-hit" data-hot="k" r="26"/>
  </g>
  <!-- 蕾梅黛丝 -->
  <circle id="c6-halo" cx="${R.target.x}" cy="${R.target.y - 8}" r="46" fill="url(#c6-halo)" opacity="0"/>
  <g id="c6-rem">${remedios(R.target.x, R.target.y + 8, 1)}</g>
  <!-- 轨道：每一格是一个停靠位 -->
  <g stroke="${INK}"><path d="M${m1.rail[0] - 16} 345 H${m1.rail[1] + 16}" stroke-width="3"/>
    ${[...Array((m1.rail[1] - m1.rail[0]) / m1.step + 1)].map((_, k) => `<path d="M${m1.rail[0] + k * m1.step} 344 v7" stroke-width="${k % 2 ? 1 : 1.8}"/>`).join('')}
    <path d="M${m1.rail[0] - 16} 338 v10 M${m1.rail[1] + 16} 338 v10" stroke-width="3"/></g>
  <path d="M222 120 H236" stroke="${INK}" stroke-width="3"/><path d="M222 112 L236 120 L222 128" fill="none" stroke="${INK}" stroke-width="1.2"/>
  <g id="c6-bfly" opacity="0" pointer-events="none"></g>
  ${beamEls()}
  <g transform="translate(${m0.x} ${m0.y})">${mirrorEl(m0, 0)}</g>
  <g id="c6-cart1" transform="translate(${m1.x0} ${m1.y})">
    <path d="M0 4 V31" stroke="${WOOD2}" stroke-width="4"/>
    <rect x="-17" y="30" width="34" height="9" rx="2" fill="${WOOD2}" stroke="${INK}"/>
    <path d="M-12 34.5 H12" stroke="#c8a45a" stroke-width="1"/>
    <circle cx="-10" cy="41" r="3.6" fill="#6b5f52" stroke="${INK}"/><circle cx="10" cy="41" r="3.6" fill="#6b5f52" stroke="${INK}"/>
    ${mirrorEl(m1, 1)}
    <rect class="c6-hit c6-slide" data-hot="s" data-i="1" x="-28" y="24" width="56" height="26"/>
  </g>
</svg>`;
}

/* ---------------- 最后一页 ---------------- */
function sheet() {
  return `<div class="c1-sh-k">LA ASCENSIÓN</div>
   <div class="c1-sh-h">蕾梅黛丝升天</div>
   <svg class="c6-pair" viewBox="0 0 120 70" fill="none" stroke="${INK}" stroke-width="1">
     <path d="M28 58 Q40 20 60 12 Q80 20 92 58" fill="#fbf6e6"/>
     <path d="M44 56 Q52 30 60 24 Q68 30 76 56" stroke-opacity=".35"/>
     <circle cx="60" cy="10" r="4" fill="#fbf6e6"/>
   </svg>
   <div class="c6-poem">${['她挥着手，', '在床单的裹拥下，', '身体和灵魂一起，', '离开了地面。'].map((l, i) => `<p style="animation-delay:${.4 + i * .9}s">${l}</p>`).join('')}</div>
   <div class="c6-quote">“床单和她一起升上了天空，<br/>那是连记忆中的鸟儿也到不了的高处。”</div>
   <div class="c6-sig">—— 马孔多，下午四点</div>`;
}

export const ART6 = { DEFS, rooms: [room0, room1, room2], sheet, RED };
