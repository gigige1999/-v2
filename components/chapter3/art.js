/* =========================================================
   第三章美术 — 梅尔基亚德斯的房间 · 漫长的雨季（单一场景 400 x 400）
   共享第一章的 DEFS（排线、滤镜）与 FRAME（版画框）；所有 id 以 c3- 开头
   ========================================================= */
import { segundo, torso } from '../shared/people.js';
import { PLANKS, STAINS, LEAK, FLOOR } from './physics.js';
const INK = '#2b1d12', SEP = '#5a3e24', UMB = '#7a5a38', OCH = '#b08a4a', CRE = '#f4ebd5', RED = '#8a3a28';

/* 伪随机（固定种子，保证每次画面一致） */
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

const DEFS = `<defs>
  <linearGradient id="c3-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e8064"/><stop offset=".55" stop-color="#b4a37f"/><stop offset="1" stop-color="#a08c68"/></linearGradient>
  <linearGradient id="c3-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e5236"/><stop offset="1" stop-color="#4a3622"/></linearGradient>
  <linearGradient id="c3-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c5654"/><stop offset="1" stop-color="#7d8780"/></linearGradient>
  <linearGradient id="c3-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2a6"/><stop offset="1" stop-color="#e9c47c"/></linearGradient>
  <linearGradient id="c3-parch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe1bd"/><stop offset="1" stop-color="#d9c493"/></linearGradient>
  <linearGradient id="c3-tin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c8bc"/><stop offset=".5" stop-color="#9c9b8e"/><stop offset="1" stop-color="#6e6d62"/></linearGradient>
  <linearGradient id="c3-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b48656"/><stop offset="1" stop-color="#7c5530"/></linearGradient>
  <linearGradient id="c3-cop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d79a66"/><stop offset=".5" stop-color="#b0683e"/><stop offset="1" stop-color="#7c4224"/></linearGradient>
  <radialGradient id="c3-mold"><stop offset="0" stop-color="#4f5a3c" stop-opacity=".95"/><stop offset=".7" stop-color="#6f7a52" stop-opacity=".8"/><stop offset="1" stop-color="#8a8f62" stop-opacity="0"/></radialGradient>
  <radialGradient id="c3-wet"><stop offset="0" stop-color="#6b5532" stop-opacity=".45"/><stop offset="1" stop-color="#6b5532" stop-opacity="0"/></radialGradient>
  <radialGradient id="c3-candle"><stop offset="0" stop-color="#ffe3a2" stop-opacity=".7"/><stop offset=".4" stop-color="#f3b45c" stop-opacity=".22"/><stop offset="1" stop-color="#e89a40" stop-opacity="0"/></radialGradient>
  <radialGradient id="c3-vig" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#1c1108" stop-opacity="0"/><stop offset="1" stop-color="#1c1108" stop-opacity=".55"/></radialGradient>
  <linearGradient id="c3-drop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f0ec" stop-opacity=".2"/><stop offset="1" stop-color="#d8e6e2"/></linearGradient>
  <clipPath id="c3-winClip"><rect x="24" y="58" width="66" height="104"/></clipPath>
</defs>`;

/* 木板 / 锡盘 / 铜片：水平画在枢轴处，由引擎整体旋转 */
function plank(p, kind) {
  const h = p.half, cx = p.cx, cy = p.cy;
  let body = '';
  if (kind === 'tin') body = `
    <path d="M${cx - h} ${cy - 5} L${cx + h} ${cy - 5} L${cx + h - 4} ${cy + 4} L${cx - h + 4} ${cy + 4}Z" fill="url(#c3-tin)" stroke="${INK}" stroke-width="1.1"/>
    <path d="M${cx - h - 2} ${cy - 5} H${cx + h + 2}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M${cx - h} ${cy - 5} H${cx + h}" stroke="#e4e2d6" stroke-width=".8"/>
    <path d="M${cx - 30} ${cy} q8 2 14 0 M${cx + 18} ${cy + 1} q6 -2 12 0" stroke="#5e5d54" stroke-width=".6" fill="none"/>
    <circle cx="${cx + 34}" cy="${cy}" r="2.4" fill="${RED}" opacity=".35"/>`;
  else if (kind === 'wood') body = `
    <rect x="${cx - h}" y="${cy - 4}" width="${h * 2}" height="9" rx="1.5" fill="url(#c3-wood)" stroke="${INK}" stroke-width="1.1"/>
    <path d="M${cx - h + 6} ${cy - 1} q20 -2 40 1 t44 0 M${cx - h + 14} ${cy + 2.4} q18 1 30 -1 t36 1" stroke="${SEP}" stroke-width=".6" fill="none"/>
    <ellipse cx="${cx - 18}" cy="${cy + .5}" rx="3" ry="1.5" fill="none" stroke="${SEP}" stroke-width=".6"/>`;
  else body = `
    <path d="M${cx - h} ${cy - 3.5} Q${cx} ${cy - 6} ${cx + h} ${cy - 3.5} L${cx + h} ${cy + 3} Q${cx} ${cy + .8} ${cx - h} ${cy + 3}Z" fill="url(#c3-cop)" stroke="${INK}" stroke-width="1.1"/>
    <g fill="#6f8566" opacity=".75"><circle cx="${cx - 30}" cy="${cy}" r="2"/><circle cx="${cx - 26}" cy="${cy + 1.4}" r="1.2"/><circle cx="${cx + 22}" cy="${cy - 1}" r="1.6"/></g>
    <path d="M${cx - h + 4} ${cy - 3.4} Q${cx} ${cy - 5.4} ${cx + h - 4} ${cy - 3.4}" stroke="#f1c79a" stroke-width=".7" fill="none"/>`;
  return `<g id="c3-p-${p.id}" class="c3-plank">
    ${body}
    <g class="c3-grip"><circle cx="${cx - h + 3}" cy="${cy}" r="3.4" fill="none" stroke="${CRE}" stroke-width="1"/><circle cx="${cx + h - 3}" cy="${cy}" r="3.4" fill="none" stroke="${CRE}" stroke-width="1"/></g>
    <rect class="c3-hit" data-plank="${p.id}" x="${cx - h - 10}" y="${cy - 20}" width="${h * 2 + 20}" height="40"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="3.2" fill="${OCH}" stroke="${INK}" stroke-width="1"/><circle cx="${cx - .8}" cy="${cy - .8}" r="1" fill="#f6dc9c"/>`;
}

/* 羊皮卷上的梵文（弯弯曲曲，带顶线），与覆盖其上的霉斑 */
function glyphs(x, r) {
  let d = '';
  for (let row = 0; row < 2; row++) {
    const y = 345 + row * 10, x0 = x - 15 + row * 2;
    d += `M${x0} ${y} H${x0 + 28} `;
    for (let k = 0; k < 6; k++) {
      const gx = x0 + 2 + k * 4.6;
      const t = Math.floor(r() * 4);
      if (t === 0) d += `M${gx} ${y} v4 q2 2 3 0 `;
      else if (t === 1) d += `M${gx} ${y} q-2 3 1 5 q3 1 2 -3 `;
      else if (t === 2) d += `M${gx + 1} ${y} v6 M${gx - 1} ${y + 3} h3 `;
      else d += `M${gx} ${y + 1} q3 0 2 3 q-1 2 -3 1 `;
    }
  }
  return `<path d="${d}" stroke="${INK}" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".85"/>`;
}
function mold(i, x, r) {
  let spots = '';
  for (let k = 0; k < 9; k++) {
    const sx = x + (r() - .5) * 34, sy = 350 + (r() - .5) * 18, rr = 2.4 + r() * 4.8;
    spots += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${rr.toFixed(1)}" fill="${r() < .5 ? '#56603f' : '#7b8158'}" opacity="${(.55 + r() * .4).toFixed(2)}"/>`;
  }
  for (let k = 0; k < 12; k++) {
    const sx = x + (r() - .5) * 40, sy = 350 + (r() - .5) * 20;
    spots += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(.6 + r()).toFixed(1)}" fill="#3e4630" opacity=".8"/>`;
  }
  return `<g id="c3-mold${i}" class="c3-mold">
    <ellipse cx="${x}" cy="350" rx="24" ry="13" fill="url(#c3-mold)"/>
    ${spots}
  </g>`;
}

/* 梅尔基亚德斯房间里的夜壶（原著：七十二个） */
function pot(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 -8 Q-9 4 0 5 Q9 4 7 -8Z" fill="#e9dfc6" stroke="${INK}" stroke-width=".8"/><ellipse cx="0" cy="-8" rx="7.4" ry="2" fill="#d7ccb0" stroke="${INK}" stroke-width=".8"/><path d="M7 -5 q5 0 4 5 q-1 2 -4 1" fill="none" stroke="${INK}" stroke-width=".8"/><path d="M-4 -4 q0 5 3 7" stroke="#b9ad90" stroke-width=".8" fill="none"/></g>`;
}

function main() {
  const r = rng(31);
  // 墙上的雨痕
  let streaks = '';
  for (let i = 0; i < 9; i++) {
    const x = 110 + r() * 270, y = 36 + r() * 30, l = 40 + r() * 90;
    streaks += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q${(r() * 4 - 2).toFixed(1)} ${(l / 2).toFixed(0)} ${(r() * 2 - 1).toFixed(1)} ${l.toFixed(0)}" stroke="#6e6250" stroke-width="${(1 + r() * 2).toFixed(1)}" opacity=".35" fill="none"/>`;
  }
  // 地板缝
  let boards = '';
  for (let i = 0; i < 9; i++) boards += `<path d="M${-20 + i * 52} 400 L${60 + i * 36} 330" stroke="${INK}" stroke-opacity=".35" stroke-width=".8"/>`;
  // 窗外斜雨
  let rain = '';
  for (let i = 0; i < 26; i++) {
    const x = 18 + r() * 84, y = 40 + r() * 130;
    rain += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l-4 12" stroke="#dfe6e2" stroke-width=".8" opacity="${(.4 + r() * .5).toFixed(2)}"/>`;
  }
  const [pa, pb, pc] = PLANKS;
  return `
<svg id="c3-main" class="c1-scene" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
 <rect width="400" height="400" fill="url(#c3-wall)"/>
 <rect width="400" height="400" fill="url(#c1-hf)" opacity=".12"/>
 ${streaks}
 <!-- 屋顶的梁与裂缝 -->
 <rect x="0" y="0" width="400" height="30" fill="#4a3826"/>
 <rect x="0" y="0" width="400" height="30" fill="url(#c1-h)" opacity=".5"/>
 <path d="M0 30 H400" stroke="${INK}" stroke-width="2"/>
 <rect x="-2" y="24" width="404" height="10" fill="#5e4630" stroke="${INK}" stroke-width="1"/>
 <path d="M186 25 L194 31 L198 27 L203 34 L209 28 L216 33" stroke="${INK}" stroke-width="1.5" fill="none"/>
 <path d="M194 34 q6 12 6 30" stroke="#6e6250" stroke-width="3" opacity=".3" fill="none"/>
 <ellipse class="c3-bead" cx="${LEAK.x}" cy="${LEAK.y + 1}" rx="2" ry="2.6" fill="url(#c3-drop)" stroke="#6f8f8c" stroke-width=".5"/>
 <rect data-hot="leak" x="176" y="20" width="48" height="26" class="c3-hz"/>

 <!-- 窗：关着的百叶窗 / 打开后风雨灌进来 -->
 <rect x="18" y="52" width="78" height="116" fill="#3e2f20" stroke="${INK}" stroke-width="1.5"/>
 <g clip-path="url(#c3-winClip)">
  <rect id="c3-sky" x="24" y="58" width="66" height="104" fill="url(#c3-sky)"/>
  <rect id="c3-sunSky" x="24" y="58" width="66" height="104" fill="url(#c3-sun)" opacity="0"/>
  <g class="c3-rain">${rain}</g>
  <path d="M24 140 Q50 128 90 136 V162 H24Z" fill="#39443c"/>
  <path d="M30 140 q4 -18 10 -2 M60 134 q6 -24 12 -2" stroke="#2c352f" stroke-width="2.4" fill="none"/>
 </g>
 <path d="M57 58 V162 M24 110 H90" stroke="#3e2f20" stroke-width="3"/>
 <rect x="14" y="166" width="86" height="7" fill="#7a5a38" stroke="${INK}" stroke-width="1.2"/>
 <g data-if="!windowOpen" class="c3-shut">
  <rect x="22" y="56" width="35" height="108" fill="#7c5c3a" stroke="${INK}" stroke-width="1.2"/>
  <rect x="57" y="56" width="35" height="108" fill="#73552f" stroke="${INK}" stroke-width="1.2"/>
  ${Array.from({ length: 13 }, (_, i) => `<path d="M24 ${62 + i * 8} h31 M59 ${62 + i * 8} h31" stroke="${INK}" stroke-width=".8" opacity=".7"/>`).join('')}
  <rect x="57" y="56" width="35" height="108" fill="url(#c1-h)" opacity=".4"/>
  <circle cx="53" cy="110" r="1.8" fill="${OCH}" stroke="${INK}" stroke-width=".6"/><circle cx="61" cy="110" r="1.8" fill="${OCH}" stroke="${INK}" stroke-width=".6"/>
  <path d="M22 70 q-3 6 0 10 M92 140 q3 6 0 10" stroke="#d8e2de" stroke-width=".8" opacity=".6" fill="none"/>
 </g>
 <g data-if="windowOpen">
  <path d="M22 56 L8 50 L8 170 L22 164Z" fill="#7c5c3a" stroke="${INK}" stroke-width="1.2"/>
  <path d="M92 56 L106 50 L106 170 L92 164Z" fill="#73552f" stroke="${INK}" stroke-width="1.2"/>
  <g class="c3-wind" stroke="#e6ece8" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".75">
   <path d="M96 80 q40 -8 80 4 t90 0" stroke-dasharray="14 22"/>
   <path d="M96 118 q50 10 110 -2 t120 6" stroke-dasharray="10 26"/>
   <path d="M96 150 q40 -6 70 6" stroke-dasharray="8 18"/>
  </g>
  <g class="c3-spray" fill="#dfe8e4">${Array.from({ length: 8 }, (_, i) => `<path d="M${100 + i * 6} ${70 + (i * 37) % 90} l7 2" stroke="#dfe8e4" stroke-width=".9"/>`).join('')}</g>
 </g>
 <rect data-hot="window" x="8" y="48" width="100" height="126" class="c3-hz"/>

 <!-- 架子上的夜壶与瓶罐 -->
 <rect x="312" y="74" width="84" height="6" fill="#7a5a38" stroke="${INK}" stroke-width="1.1"/>
 <path d="M320 80 l6 10 M388 80 l-6 10" stroke="${INK}" stroke-width="1.6"/>
 ${pot(326, 72, 1)}${pot(346, 72, .9)}${pot(366, 72, 1)}${pot(386, 72, .85)}
 <rect x="312" y="128" width="84" height="6" fill="#7a5a38" stroke="${INK}" stroke-width="1.1"/>
 <path d="M320 134 l6 10 M388 134 l-6 10" stroke="${INK}" stroke-width="1.6"/>
 <path d="M322 126 v-22 h12 v22Z" fill="#5a6352" stroke="${INK}" stroke-width=".9"/><path d="M326 104 v-5 h4 v5" fill="#5a6352" stroke="${INK}" stroke-width=".9"/>
 <path d="M340 126 q-6 -16 6 -20 q12 4 6 20Z" fill="#9a6e44" stroke="${INK}" stroke-width=".9"/>
 <rect x="360" y="106" width="30" height="20" fill="#6b4a2c" stroke="${INK}" stroke-width=".9"/><path d="M362 112 h26 M362 118 h26" stroke="${OCH}" stroke-width=".7"/>
 <rect data-hot="pots" x="310" y="54" width="88" height="82" class="c3-hz"/>

 <!-- 地板 -->
 <rect x="0" y="330" width="400" height="70" fill="url(#c3-floor)"/>
 ${boards}
 <path d="M0 330 H400" stroke="${INK}" stroke-width="1.5"/>

 <!-- 奥雷里亚诺第二：盘腿坐在羊皮卷后面 -->
 <g id="c3-aure">
  <ellipse cx="200" cy="336" rx="56" ry="6" fill="${INK}" opacity=".3"/>
  <path d="M150 334 Q152 312 178 308 L222 308 Q248 312 250 334Z" fill="#5a4a36" stroke="${INK}" stroke-width="1.2"/>
  <path d="M160 330 Q190 318 214 326 M186 326 Q214 316 240 330" stroke="${INK}" stroke-width=".8" fill="none" opacity=".7"/>
  ${torso({ x: 200, y: 262, s: 1.5, w: 20, h: 32, cloth: '#d9ccb0', shirt: '#efe5cf', kind: 'shirt', strap: '#5a4128', lw: .9 })}
  <path d="M172 290 Q168 312 186 320 M228 290 Q232 312 214 320" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M172 290 Q168 312 186 320 M228 290 Q232 312 214 320" stroke="#d2c4a6" stroke-width="7" fill="none" stroke-linecap="round"/>
  <ellipse cx="190" cy="321" rx="5" ry="4" fill="#e2d3b2" stroke="${INK}" stroke-width=".9"/><ellipse cx="210" cy="321" rx="5" ry="4" fill="#e2d3b2" stroke="${INK}" stroke-width=".9"/>
  <g id="c3-head">${segundo(200, 230, 1.5, { eyeCls: 'c3-eyes' })}</g>
  <g id="c3-wetHair" opacity="0"><path d="M188 204 q2 6 0 10 M206 202 q2 7 -1 12" stroke="#c7d8d1" stroke-width="1.4" fill="none"/></g>
 </g>
 <rect data-hot="aure" x="160" y="196" width="80" height="128" class="c3-hz"/>

 <!-- 蜡烛 -->
 <g id="c3-candle">
  <circle class="c3-candleGlow" cx="34" cy="300" r="46" fill="url(#c3-candle)"/>
  <rect x="26" y="318" width="16" height="5" fill="#8a6440" stroke="${INK}" stroke-width=".8"/>
  <rect x="30" y="298" width="8" height="20" fill="#efe5cf" stroke="${INK}" stroke-width=".8"/>
  <path d="M30 300 q2 4 0 8" stroke="#d9ccb0" stroke-width="1.4" fill="none"/>
  <g class="c3-flame"><path d="M34 286 q4 6 0 12 q-4 -6 0 -12Z" fill="#f6c766" stroke="#c9873a" stroke-width=".5"/></g>
 </g>

 <!-- 羊皮卷 -->
 <g id="c3-scroll">
  <path d="M26 336 L374 336 L384 370 L16 370Z" fill="url(#c3-parch)" stroke="${INK}" stroke-width="1.2"/>
  <path d="M26 336 L374 336 L384 370 L16 370Z" fill="url(#c1-hf)" opacity=".12"/>
  <path d="M16 368 q-8 -2 -6 -16 q2 -14 16 -16" fill="#d9c493" stroke="${INK}" stroke-width="1.2"/>
  <ellipse cx="14" cy="352" rx="4" ry="15" fill="#c9b07a" stroke="${INK}" stroke-width="1"/>
  <path d="M384 368 q8 -2 6 -16 q-2 -14 -16 -16" fill="#d9c493" stroke="${INK}" stroke-width="1.2"/>
  <ellipse cx="386" cy="352" rx="4" ry="15" fill="#c9b07a" stroke="${INK}" stroke-width="1"/>
  <g opacity=".45">${[110, 200, 296, 330].map(x => glyphs(x, rng(x))).join('')}</g>
  ${STAINS.map((s, i) => `<g id="c3-text${i}" class="c3-text">${glyphs(s.x, rng(97 + i))}</g>`).join('')}
  <g id="c3-wets"></g>
  ${STAINS.map((s, i) => mold(i, s.x, rng(500 + i * 7))).join('')}
  ${STAINS.map((s, i) => `<g id="c3-ring${i}" class="c3-ring" opacity="0"><ellipse cx="${s.x}" cy="350" rx="26" ry="14" fill="none" stroke="${RED}" stroke-width="1" stroke-dasharray="3 3"/></g>`).join('')}
  ${STAINS.map((s, i) => `<rect data-hot="stain" data-i="${i}" x="${s.x - 24}" y="334" width="48" height="36" class="c3-hz"/>`).join('')}
 </g>

 <!-- 三块接水的板 -->
 ${plank(pa, 'tin')}
 ${plank(pb, 'wood')}
 ${plank(pc, 'cop')}

 <!-- 水滴与水花（引擎绘制） -->
 <g id="c3-drops" pointer-events="none"></g>
 <g id="c3-fx" pointer-events="none"></g>

 <!-- 结局：雨停，阳光 -->
 <path id="c3-sunbeam" d="M90 60 L96 160 L260 400 L60 400Z" fill="#fbe8b0" opacity="0" pointer-events="none"/>
 <rect width="400" height="400" fill="url(#c3-vig)" pointer-events="none"/>
</svg>`;
}

/* 最后一页：译出的预言 */
function prophecy(lines) {
  return `<div class="c1-sh-k">PERGAMINOS DE MELQUÍADES</div>
   <div class="c1-sh-h">羊皮卷</div>
   <div class="c3-proph">${lines.map((l, i) => `<p style="animation-delay:${.4 + i * .9}s">${l}</p>`).join('')}</div>
   <div class="c3-sig">—— 梅尔基亚德斯，用梵文写于一百年前</div>`;
}

export const ART3 = { DEFS, main, prophecy };
