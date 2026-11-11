/* =========================================================
   第一章美术（示例：书房之夜）
   主场景 800×800；特写 400×400；物品图标 60×60
   热区写 data-hot="id"（或用 art-kit 的 hot()）；随状态显隐写 data-if="条件"；随状态加 class 写 data-cls="类:条件"
   元素 id / 自定义 class 用 ch1- 前缀，避免与其它章节冲突
   ========================================================= */
import { INK, PAL, F, hot } from '../../engine/art-kit.js';

const { sep: SEP, umb: UMB, och: OCH, cre: CRE, red: RED, wood: WOOD, wood2: WOOD2, wall: WALL, floor: FLOOR } = PAL;

/* ---------------- 主场景：书房 ---------------- */
function main() {
  const books = [[70, 40, '#7a3b2e'], [112, 30, '#4f5a44'], [144, 36, '#8a6a3a'], [182, 26, '#5a3e24'], [210, 34, '#6b4a5a']]
    .map(([x, w, c]) => `<rect x="${x}" y="${150 - w * 1.6}" width="${w * .6}" height="${w * 1.6}" fill="${c}" stroke="${INK}" stroke-width="1.2"/>`).join('');
  return `
<svg class="bk-scene" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
 <g filter="url(#bk-wob)">
  <rect width="800" height="600" fill="${WALL}"/>
  <rect width="800" height="580" fill="url(#bk-wp)"/>
  <rect width="800" height="70" fill="url(#bk-h)" opacity=".55"/>
  <rect y="580" width="800" height="220" fill="${FLOOR}"/>
  <rect y="580" width="800" height="50" fill="url(#bk-hx)" opacity=".6"/>
  <rect y="574" width="800" height="10" fill="${SEP}" stroke="${INK}"/>
  <g stroke="${INK}" stroke-opacity=".5" stroke-width="1.5"><line x1="0" y1="660" x2="800" y2="660"/><line x1="0" y1="730" x2="800" y2="730"/></g>

  <!-- 书架 -->
  <rect x="50" y="60" width="210" height="14" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/>
  <rect x="50" y="150" width="210" height="12" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/>
  ${books}
  <!-- 火柴盒（书架上） -->
  <g data-if="!matchboxTaken"><rect x="200" y="128" width="40" height="22" fill="${RED}" stroke="${INK}" stroke-width="1.2"/><rect x="200" y="134" width="40" height="8" fill="${CRE}" opacity=".7"/></g>

  <!-- 窗 -->
  <path d="M330 120 H520 V380 H330 Z" fill="url(#bk-night)" stroke="${INK}" stroke-width="5"/>
  <path d="M425 120 V380 M330 250 H520" stroke="${INK}" stroke-width="4"/>
  <g fill="${CRE}"><circle cx="360" cy="160" r="2.5"/><circle cx="380" cy="190" r="2"/><circle cx="470" cy="150" r="2.5"/><circle cx="495" cy="210" r="2"/><circle cx="450" cy="300" r="2"/></g>
  <circle cx="480" cy="170" r="16" fill="#f1e6c2" opacity=".85"/>
  <rect x="318" y="380" width="214" height="14" fill="${WOOD2}" stroke="${INK}" stroke-width="1.5"/>

  <!-- 门 -->
  <path d="M600 200 H740 V574 H600 Z" fill="${WOOD}" stroke="${INK}" stroke-width="3"/>
  <path d="M614 214 H726 V380 H614 Z M614 396 H726 V560 H614 Z" fill="none" stroke="${INK}" stroke-opacity=".6" stroke-width="1.6"/>
  <rect x="600" y="200" width="140" height="374" fill="url(#bk-hf)" opacity=".5"/>
  <circle cx="712" cy="390" r="7" fill="${OCH}" stroke="${INK}"/><rect x="709" y="402" width="6" height="12" fill="${INK}"/>

  <!-- 书桌 -->
  <path d="M120 450 H560 L580 476 H100 Z" fill="${WOOD2}" stroke="${INK}" stroke-width="2.5"/>
  <rect x="120" y="476" width="440" height="80" fill="${WOOD}" stroke="${INK}" stroke-width="2.5"/>
  <rect x="270" y="490" width="140" height="48" fill="${WOOD2}" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="340" cy="514" r="6" fill="${OCH}" stroke="${INK}"/>
  <rect x="130" y="556" width="22" height="30" fill="${WOOD}" stroke="${INK}" stroke-width="2"/><rect x="528" y="556" width="22" height="30" fill="${WOOD}" stroke="${INK}" stroke-width="2"/>
  <rect x="120" y="476" width="440" height="80" fill="url(#bk-h)" opacity=".35"/>
 </g>

 <!-- 蜡烛（点亮后有光晕与火苗） -->
 <g>
  <circle cx="200" cy="400" r="120" fill="url(#bk-lamp)" data-if="candleLit"/>
  <rect x="186" y="404" width="28" height="46" fill="${CRE}" stroke="${INK}" stroke-width="1.5"/>
  <ellipse cx="200" cy="450" rx="34" ry="7" fill="${OCH}" stroke="${INK}" stroke-width="1.4"/>
  <line x1="200" y1="404" x2="200" y2="394" stroke="${INK}" stroke-width="1.6"/>
  <g data-if="candleLit"><path class="bk-flick" d="M200 362 Q212 382 200 396 Q188 382 200 362Z" fill="#f6c766" stroke="${SEP}" stroke-width=".8"/></g>
 </g>

 <!-- 箱子 -->
 <g>
  <rect x="420" y="610" width="150" height="90" fill="${WOOD}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M420 610 Q495 580 570 610" fill="${WOOD2}" stroke="${INK}" stroke-width="2.5"/>
  <rect x="420" y="610" width="150" height="90" fill="url(#bk-hx)" opacity=".35"/>
  <rect x="482" y="628" width="26" height="30" fill="${OCH}" stroke="${INK}" stroke-width="1.5"/>
  <g data-if="chestOpen"><path d="M420 610 Q495 560 570 610" fill="none" stroke="${CRE}" stroke-width="3" opacity=".8"/></g>
 </g>

 <!-- 屋里漆黑：蜡烛点亮前压一层暗 -->
 <rect class="bk-fade" width="800" height="800" fill="#1c1108" opacity=".45" data-if="!candleLit" pointer-events="none"/>

 <g class="bk-hots">
  ${hot('matchbox', 190, 118, 60, 40, '!matchboxTaken')}
  ${hot('window', 330, 120, 190, 260)}
  ${hot('door', 600, 200, 140, 374)}
  ${hot('candle', 170, 350, 60, 100)}
  ${hot('drawer', 262, 484, 156, 60)}
  ${hot('chest', 412, 585, 166, 120)}
  ${hot('shelf', 50, 56, 140, 110)}
 </g>
</svg>`;
}

/* ---------------- 特写：抽屉 ---------------- */
function drawer() {
  return `
<svg class="bk-scene" viewBox="0 0 400 400">
 <g filter="url(#bk-wob)">
  <rect width="400" height="400" fill="${WALL}"/>
  <path d="M30 108 H370 L396 330 H4 Z" fill="${WOOD}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M52 124 H348 L370 312 H30 Z" fill="#5b4129" stroke="${INK}" stroke-width="1.5"/>
  <path d="M52 124 H348 L370 312 H30 Z" fill="url(#bk-hx)" opacity=".7"/>
  <path d="M4 330 H396 V378 H4 Z" fill="${WOOD2}" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="200" cy="354" r="8" fill="${OCH}" stroke="${INK}" stroke-width="1.5"/>
 </g>
 <!-- 一根火柴 -->
 <g data-if="!matchTaken" transform="translate(120 230) rotate(-18)">
  <rect x="-40" y="-3" width="80" height="6" fill="${CRE}" stroke="${INK}"/><ellipse cx="44" cy="0" rx="7" ry="6" fill="${RED}" stroke="${INK}"/>
 </g>
 <!-- 信 -->
 <g transform="translate(268 220) rotate(8)">
  <rect x="-60" y="-44" width="120" height="88" fill="${CRE}" stroke="${INK}" stroke-width="1.2"/>
  <g stroke="${INK}" stroke-width="1.1" fill="none" opacity=".7">
   <path d="M-48 -26 q6 -3 12 0 t12 0 t12 0 t12 0"/><path d="M-48 -12 q6 -3 12 0 t12 0 t12 0"/><path d="M-48 2 q6 -3 12 0 t12 0 t14 0 t10 0"/><path d="M-48 16 q6 -3 12 0 t10 0"/>
  </g>
  <circle cx="38" cy="26" r="9" fill="${RED}" opacity=".85"/>
 </g>
 <rect width="400" height="400" fill="#1c1108" opacity=".4" data-if="!candleLit" pointer-events="none"/>
 <g class="bk-hots">${hot('match', 70, 200, 120, 60, '!matchTaken')}${hot('letter', 200, 168, 140, 110)}</g>
</svg>`;
}

/* ---------------- 特写：窗外星空（密码线索：三组星 2·7·4） ---------------- */
const GROUPS = [
  [[70, 120], [110, 90]],
  [[160, 70], [185, 100], [210, 80], [235, 115], [205, 140], [180, 160], [225, 170]],
  [[290, 110], [330, 90], [345, 140], [300, 160]],
];
function windowZoom() {
  const stars = GROUPS.map(g => g.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${CRE}" filter="url(#bk-glow)"/>`).join('') +
    `<polyline points="${g.map(p => p.join(',')).join(' ')}" fill="none" stroke="${CRE}" stroke-opacity=".35" stroke-dasharray="3 4"/>`).join('');
  return `
<svg class="bk-scene" viewBox="0 0 400 400">
 <g filter="url(#bk-wob)">
  <rect width="400" height="400" fill="url(#bk-night)"/>
  <path d="M0 320 Q60 280 120 300 T240 290 T400 300 V400 H0Z" fill="#26302c" stroke="${INK}"/>
  <rect x="0" y="0" width="400" height="400" fill="none" stroke="${INK}" stroke-width="14"/>
  <path d="M200 0 V400 M0 200 H400" stroke="${INK}" stroke-width="6" opacity=".25"/>
 </g>
 ${stars}
 <g class="bk-hots">${hot('stars', 40, 50, 330, 140)}</g>
</svg>`;
}

/* ---------------- 特写：箱子密码锁 ---------------- */
function chest(S) {
  const dial = i => `<g data-hot="dial${i}" style="cursor:pointer">
    <rect x="${92 + i * 76}" y="190" width="60" height="78" rx="6" fill="${CRE}" stroke="${INK}" stroke-width="2"/>
    <text id="ch1-d${i}" x="${122 + i * 76}" y="245" text-anchor="middle" font-size="40" font-weight="700" fill="${INK}" ${F}>${S.dials[i]}</text>
  </g>`;
  return `
<svg class="bk-scene" viewBox="0 0 400 400">
 <g filter="url(#bk-wob)">
  <rect width="400" height="400" fill="${WOOD}"/>
  <rect width="400" height="400" fill="url(#bk-hx)" opacity=".4"/>
  <rect x="60" y="150" width="280" height="160" rx="10" fill="${OCH}" stroke="${INK}" stroke-width="3"/>
  <path d="M60 100 Q200 40 340 100" fill="none" stroke="${INK}" stroke-width="3"/>
 </g>
 <g data-if="!chestOpen">${[0, 1, 2].map(dial).join('')}</g>
 <g data-if="chestOpen">
  <rect x="80" y="170" width="240" height="120" fill="#3a2a1a" stroke="${INK}" stroke-width="2"/>
  <g data-if="!keyTaken" transform="translate(200 230) rotate(-12)">
   <circle cx="-34" cy="0" r="14" fill="none" stroke="${OCH}" stroke-width="6"/><rect x="-20" y="-3" width="62" height="6" fill="${OCH}"/><rect x="30" y="3" width="6" height="12" fill="${OCH}"/><rect x="40" y="3" width="6" height="9" fill="${OCH}"/>
  </g>
 </g>
 <g class="bk-hots">${hot('key', 140, 200, 120, 60, 'chestOpen+!keyTaken')}</g>
</svg>`;
}

/* ---------------- 物品图标（60×60，墨线用 currentColor 跟随纸张主题） ---------------- */
const ICONS = {
  matchbox: `<svg viewBox="0 0 60 60"><rect x="10" y="20" width="40" height="22" fill="${RED}" stroke="${INK}" stroke-width="1.5"/><rect x="10" y="26" width="40" height="9" fill="${CRE}" opacity=".7"/><path d="M14 30 h32" stroke="${SEP}" stroke-dasharray="2 2"/></svg>`,
  match: `<svg viewBox="0 0 60 60"><g transform="rotate(-35 30 30)"><rect x="10" y="28" width="38" height="4" fill="${CRE}" stroke="${INK}"/><ellipse cx="50" cy="30" rx="5" ry="4.5" fill="${RED}" stroke="${INK}"/></g></svg>`,
  litMatch: `<svg viewBox="0 0 60 60"><circle cx="44" cy="16" r="14" fill="url(#bk-lamp)"/><g transform="rotate(-35 30 30)"><rect x="10" y="28" width="38" height="4" fill="${CRE}" stroke="${INK}"/></g><path d="M44 6 Q52 16 44 24 Q36 16 44 6Z" fill="#f6c766" stroke="${SEP}" stroke-width=".8"/></svg>`,
  key: `<svg viewBox="0 0 60 60"><g transform="rotate(-30 30 30)"><circle cx="16" cy="30" r="8" fill="none" stroke="${OCH}" stroke-width="4"/><rect x="24" y="28" width="28" height="4" fill="${OCH}"/><rect x="44" y="32" width="4" height="7" fill="${OCH}"/><rect x="38" y="32" width="4" height="5" fill="${OCH}"/></g><g fill="none" stroke="${INK}" stroke-width=".8" transform="rotate(-30 30 30)"><circle cx="16" cy="30" r="10"/></g></svg>`,
};

export const ART = { main, drawer, window: windowZoom, chest, ICONS, GROUPS };
