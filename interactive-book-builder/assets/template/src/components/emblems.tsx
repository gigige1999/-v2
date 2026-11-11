import React from 'react';

/* =========================================================
   封面 / 目录徽章库（纯 SVG 字符串，颜色全部走 CSS 变量，随封面配色变化）
   描边 = currentColor（烫金色）；.em-a = 主填色（--em-a，默认 --cv-accent 酒红）；
   .em-b = 次填色（--em-b，默认 --cv-title 象牙）；.em-bg = 封面底色
   rose     都铎玫瑰（来自《玫瑰战争》ornaments.js）
   longship 日轮长船（来自《Vikings》BookCover）
   其余为勋章环 + 小图形（crown lily sun key feather seal boar compass candle）
   新增：在 SHAPES 里加一个 48×48 的路径片段即可自动获得勋章环
   ========================================================= */

const petal = (a: number) => `<g transform="rotate(${a} 160 126)"><path d="M160 133C124 133 108 104 117 77C122 59 142 48 160 64C178 48 198 59 203 77C212 104 196 133 160 133Z"/><path d="M160 126C148 110 139 84 143 68M160 126C172 110 181 84 177 68" fill="none" stroke-opacity=".45" stroke-width=".65"/></g>`;
const petalW = (a: number) => `<g transform="rotate(${a} 160 126)"><path d="M160 130C141 130 133 114 138 99C142 89 151 84 160 93C169 84 178 89 182 99C187 114 179 130 160 130Z"/><path d="M160 126V99" fill="none" stroke-opacity=".4" stroke-width=".65"/></g>`;

const ROSE = `<g opacity=".52"><path d="M37 141C37 73 92 20 160 20C228 20 283 73 283 141" stroke-width=".65"/><path d="M44 141C44 77 96 27 160 27C224 27 276 77 276 141" stroke-width=".45"/><path d="M37 154V178M283 154V178M32 166H42M278 166H288M153 13H167M160 6V20"/><path d="M57 290L63 284L69 290L63 296Z M251 290L257 284L263 290L257 296Z"/><path d="M88 326H140M180 326H232M153 326L160 319L167 326L160 333Z"/></g>
<g><path d="M160 169C151 207 169 247 157 318" stroke-width="2"/><path d="M159 242C139 232 123 217 112 201M161 271C183 261 199 244 211 227"/><path class="em-a" d="M158 240C130 241 105 227 104 199C131 202 151 218 158 240Z"/><path class="em-a" d="M162 268C186 270 210 252 215 222C188 227 167 244 162 268Z"/><path d="M111 205L149 234M209 229L171 261" stroke-width=".7"/><path class="em-a" d="M140 173L160 194L179 171L160 181Z"/></g>
<g class="em-a">${[0, 72, 144, 216, 288].map(petal).join('')}</g>
<g class="em-b">${[36, 108, 180, 252, 324].map(petalW).join('')}</g>
<circle class="em-a" cx="160" cy="126" r="12"/><circle cx="160" cy="126" r="8" stroke-dasharray="1 3"/><circle cx="160" cy="126" r="4.3" fill="currentColor"/><path d="M160 110V114M160 138V142M144 126H148M172 126H176"/>`;

const SHIP = (fill: string) => `<g fill="${fill}" stroke="${fill}" stroke-linecap="round" stroke-linejoin="round">
<path d="M-64 0 C-44 12 44 12 64 0 C58 18 34 27 0 27 C-34 27 -58 18 -64 0 Z"/>
<path d="M58 4 C69 -5 72 -23 76 -36 C79 -45 88 -48 91 -41 C92 -36 88 -34 84 -36" fill="none" stroke-width="4.6"/><path d="M86 -45 L90 -54 L91 -44 Z"/>
<path d="M-58 4 C-69 -5 -72 -23 -77 -34 C-81 -43 -92 -43 -93 -35 C-94 -28 -86 -26 -84 -32" fill="none" stroke-width="4.6"/>
<rect x="-1.6" y="-62" width="3.2" height="66" stroke-width="0"/><rect x="-39" y="-58.5" width="78" height="2.6" stroke-width="0"/><path d="M1 -62 L13 -58.5 L1 -55 Z"/>
<path d="M-36 -56 L36 -56 C40 -37 40 -19 34 -2 L-34 -2 C-40 -19 -40 -37 -36 -56 Z"/></g>`;
const SEA = [[31, 1.4], [36, 2], [41.5, 2.6], [47.5, 3.3], [54, 4], [61, 5], [68.5, 8]];
const LONGSHIP = `<defs><clipPath id="em-disc"><circle r="70"/></clipPath><mask id="em-out"><rect x="-120" y="-120" width="240" height="240" fill="#fff"/><circle r="70" fill="#000"/></mask></defs>
<circle r="86" fill="none" stroke-width=".9" opacity=".65"/><circle r="80" fill="none" stroke-width=".6" opacity=".45" stroke-dasharray="1 3.2"/>
${[0, 90, 180, 270].map(a => `<rect x="-2.6" y="-2.6" width="5.2" height="5.2" fill="currentColor" stroke="none" transform="rotate(${a}) translate(0 -86) rotate(45)"/>`).join('')}
<circle r="70" fill="currentColor" stroke="none"/>
<g clip-path="url(#em-disc)" stroke="none">${SEA.map(([y, h]) => `<rect class="em-bg" x="-80" y="${y}" width="160" height="${h}"/>`).join('')}
<g class="em-bgs" stroke-width="1.8" stroke-linecap="round">${[-42, -26, -10, 6, 22, 38].map(x => `<line x1="${x + 4}" y1="16" x2="${x - 7}" y2="40"/>`).join('')}</g>
${SHIP('var(--em-bg)')}
${[-48, -36, -24, -12, 0, 12, 24, 36, 48].map(x => { const y = 9 * (1 - (x / 64) ** 2) + .5; return `<circle class="em-bg" cx="${x}" cy="${y}" r="4.6" stroke="currentColor" stroke-width="1.3"/><circle cx="${x}" cy="${y}" r="1.3" fill="currentColor"/>`; }).join('')}
<g class="em-bgs" fill="none" stroke-width="2" stroke-linecap="round"><path d="M-60 -30 q4 -5 8 0 q4 -5 8 0"/><path d="M-47 -43 q3 -4 6.5 0 q3 -4 6.5 0"/></g></g>
<g mask="url(#em-out)">${SHIP('currentColor')}</g>`;

// 48×48 小图形（来自《玫瑰战争》ornaments.js + 补充），套勋章环后用于封面
const SHAPES: Record<string, string> = {
  crown: '<path class="em-a" d="M10 16L15 23L24 11L33 23L38 16L34 35H14Z"/><path d="M14 30H34M15 36H33M17 40H31M24 18V26"/><circle cx="9" cy="13" r="2"/><circle cx="24" cy="8" r="2"/><circle cx="39" cy="13" r="2"/>',
  lily: '<path class="em-b" d="M24 40V22M24 28C17 19 15 12 24 5C33 12 31 19 24 28Z"/><path d="M22 30C7 31 7 17 15 17C20 17 23 23 24 30M26 30C41 31 41 17 33 17C28 17 25 23 24 30"/><path d="M18 32H30M20 36H28M19 41L24 37L29 41"/>',
  sun: '<circle class="em-b" cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="5"/><path d="M24 4V11M24 37V44M4 24H11M37 24H44M10 10L15 15M33 33L38 38M10 38L15 33M33 15L38 10M16 5L18 12M30 36L32 43M5 16L12 18M36 30L43 32M5 32L12 30M36 18L43 16M16 43L18 36M30 12L32 5"/>',
  key: '<path d="M19 25L35 41M28 34L34 28M32 38L38 32M35 41L40 36"/><path class="em-b" d="M22 20C25 15 21 7 15 7C9 7 5 12 8 17C3 23 10 30 16 26C21 29 26 24 22 20Z"/><circle cx="15" cy="17" r="3"/>',
  feather: '<path class="em-b" d="M11 39C14 24 24 8 40 5C42 19 31 33 16 34Z"/><path d="M7 43L34 12M16 32L16 24M20 27L28 28M24 22L24 15M28 17L35 17M12 39L20 35"/>',
  seal: '<path class="em-a" d="M16 29L10 43L20 39L24 44L28 32M31 28L39 42L30 39L26 44"/><path class="em-a" d="M24 5L28 7L33 7L35 12L39 15L38 20L39 25L35 28L33 33H28L24 35L20 33H15L13 28L9 25L10 20L9 15L13 12L15 7H20Z"/><circle cx="24" cy="20" r="9"/><path d="M19 21L23 25L30 16"/>',
  boar: '<path class="em-b" d="M7 29L5 24L11 21L13 14L20 17L26 14L34 18L38 25L43 27L42 32L35 34L32 40H28L29 33H20L18 40H14L14 32L9 32Z"/><path d="M15 17L17 11L20 17M23 15L25 10L27 15M31 18L34 13L35 21M7 24L11 27"/><circle cx="34" cy="25" r="1.1" fill="currentColor"/>',
  compass: '<circle cx="24" cy="24" r="17"/><path d="M24 4V44M4 24H44" stroke-width=".6"/><path d="M12 12L36 36M12 36L36 12" stroke-width=".35"/><path class="em-a" d="M24 7L27 21L24 24L21 21Z"/><path class="em-b" d="M24 41L27 27L24 24L21 27Z"/><circle cx="24" cy="24" r="2" fill="currentColor"/>',
  candle: '<path class="em-b" d="M24 6C28 12 28 16 24 19C20 16 20 12 24 6Z"/><path d="M24 19V22"/><rect class="em-b" x="19" y="22" width="10" height="17"/><path d="M11 41H37M14 39H34"/><path d="M8 14L12 16M40 14L36 16M24 1V3" stroke-width=".7"/>',
};
const MEDAL = (inner: string) => `<circle r="56" fill="none" stroke-width=".9" opacity=".7"/><circle r="50" fill="none" stroke-width=".6" opacity=".5" stroke-dasharray="1 3"/>
${[0, 90, 180, 270].map(a => `<rect x="-2.4" y="-2.4" width="4.8" height="4.8" fill="currentColor" stroke="none" transform="rotate(${a}) translate(0 -56) rotate(45)"/>`).join('')}
<g transform="scale(1.75) translate(-24 -24)" stroke-width=".9">${inner}</g>`;

export const EMBLEMS: Record<string, { vb: string; svg: string }> = {
  rose: { vb: '0 0 320 360', svg: ROSE },
  longship: { vb: '-110 -100 220 200', svg: LONGSHIP },
  ...Object.fromEntries(Object.entries(SHAPES).map(([k, v]) => [k, { vb: '-64 -64 128 128', svg: MEDAL(v) }])),
};
export const EMBLEM_IDS = Object.keys(EMBLEMS);

export const Emblem: React.FC<{ id: string; className?: string }> = ({ id, className = '' }) => {
  const e = EMBLEMS[id] || EMBLEMS.compass;
  return <svg viewBox={e.vb} className={`emblem ${className}`} fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: e.svg }} />;
};
