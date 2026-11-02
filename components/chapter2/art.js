/* =========================================================
   第二章美术 — 吉普赛集市 · 冰（羊皮纸 + 墨线 + 棕褐，人物为锈湖式写意肖像）
   共享第一章的 DEFS（排线、抖动滤镜）与 FRAME（版画框）
   所有 id 以 c2- 开头
   ========================================================= */
import { jose as joseHead, giantHead, trader, child, torso } from '../shared/people.js';
const INK = '#2b1d12', SEP = '#5a3e24', UMB = '#7a5a38', OCH = '#b08a4a', CRE = '#f4ebd5',
  RED = '#8a3a28', VER = '#6f8566', WOOD = '#8a6440', WOOD2 = '#a27c4f', SKIN = '#c49a6c',
  ICE = '#c7d8d1', ICE2 = '#9fbab5', ICEL = '#6f8f8c';
const F = 'font-family="Cormorant Garamond, Songti SC, STSong, Noto Serif SC, serif"';
const FI = 'font-family="Cormorant Garamond, Playfair Display, serif" font-style="italic"';

/* 掩埋物的位置（泥地页，400x400）与冰块轮廓（冰块页） */
export const BURIED = { n1: [258, 112], n2: [84, 150], n3: [326, 318], pot: [104, 292], helmet: [296, 224], box: [178, 196] };
export const ICE_POLY = [[58, 352], [66, 92], [118, 52], [300, 44], [340, 86], [346, 352]];
export const ropeY = x => 30 + 30 * (1 - Math.pow((x - 200) / 190, 2));

/* ---------------- 共享 defs ---------------- */
const DEFS = `<defs>
  <linearGradient id="c2-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8cf98"/><stop offset=".55" stop-color="#ddb078"/><stop offset="1" stop-color="#c8905c"/></linearGradient>
  <radialGradient id="c2-sunG"><stop offset="0" stop-color="#fbe6a8" stop-opacity=".95"/><stop offset=".5" stop-color="#f4cf82" stop-opacity=".35"/><stop offset="1" stop-color="#f4cf82" stop-opacity="0"/></radialGradient>
  <linearGradient id="c2-ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4ece5"/><stop offset=".5" stop-color="${ICE}"/><stop offset="1" stop-color="${ICE2}"/></linearGradient>
  <radialGradient id="c2-lampG"><stop offset="0" stop-color="#ffe8ae" stop-opacity=".9"/><stop offset=".35" stop-color="#f3b860" stop-opacity=".35"/><stop offset="1" stop-color="#e89a40" stop-opacity="0"/></radialGradient>
  <radialGradient id="c2-projG"><stop offset="0" stop-color="#fff6da"/><stop offset=".62" stop-color="#fbeac0" stop-opacity=".9"/><stop offset="1" stop-color="#f4dca4" stop-opacity="0"/></radialGradient>
  <linearGradient id="c2-beamG" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ffefc4" stop-opacity=".7"/><stop offset="1" stop-color="#ffefc4" stop-opacity=".12"/></linearGradient>
  <radialGradient id="c2-glowIce"><stop offset="0" stop-color="#e6f0ea" stop-opacity=".9"/><stop offset="1" stop-color="#e6f0ea" stop-opacity="0"/></radialGradient>
  <radialGradient id="c2-vig" cx=".5" cy=".45" r=".75"><stop offset=".45" stop-color="#1c1108" stop-opacity="0"/><stop offset="1" stop-color="#1c1108" stop-opacity=".75"/></radialGradient>
  <filter id="c2-pblur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur id="c2-pblurS" stdDeviation="6"/></filter>
  <clipPath id="c2-tentClip"><path d="M330 606 L382 300 Q545 96 708 300 L760 606Z"/></clipPath>
  <clipPath id="c2-iceClip"><path d="M${ICE_POLY.map(p => p.join(' ')).join(' L')}Z"/></clipPath>
</defs>`;

/* ---------------- 人物 ---------------- */
// 何塞（与第一章同一形象），hx/hy = 头部中心
function jose(hx, hy) {
  return `<g transform="translate(${hx - 420} ${hy - 416})">
  <path d="M376 530 L372 676 M464 530 L468 676" stroke="${INK}" stroke-width="2" fill="none"/>
  <path d="M378 528 L372 674 L404 674 L414 560 L426 560 L436 674 L468 674 L462 528Z" fill="#3e2f20" stroke="${INK}" stroke-width="1.5"/>
  <path d="M366 682 q8 -10 38 -8 v8 h-38z M436 674 q30 -2 38 8 h-38z" fill="${INK}"/>
  ${torso({ x: 420, y: 462, s: 2.1, w: 25, h: 36, cloth: '#4c3a28', vest: '#2f2418', shirt: '#e9dcc0' })}
  ${joseHead(420, 416, 2.1)}
  <g data-if="!magnetTaken">
   <path d="M482 520 q10 14 6 30" stroke="#4c3a28" stroke-width="12" fill="none" stroke-linecap="round"/>
   <g transform="translate(492 560) rotate(150)"><path d="M-11 8 V-3 A11 11 0 0 1 11 -3 V8 H5 V-3 A5 5 0 0 0 -5 -3 V8Z" fill="${RED}" stroke="${INK}" stroke-width="1.2"/><rect x="-11" y="8" width="6" height="5" fill="#cfcabb" stroke="${INK}"/><rect x="5" y="8" width="6" height="5" fill="#cfcabb" stroke="${INK}"/></g>
  </g>
 </g>`;
}
// 孩子：hx/hy = 头部中心；kind = 'arca'（小何塞·阿尔卡蒂奥）| 'aure'（小奥雷里亚诺）
function kid(hx, hy, s, kind) {
  const body = kind === 'arca' ? '#7b6a4c' : '#a58f6a';
  return `<g transform="translate(${hx} ${hy}) scale(${s})">
   <ellipse cx="0" cy="120" rx="24" ry="5" fill="${INK}" opacity=".3"/>
   <path d="M-7 76 L-9 116 M7 76 L9 116" stroke="${SEP}" stroke-width="7" stroke-linecap="round"/>
   <path d="M-14 118 h9 M5 118 h9" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
   ${torso({ x: 0, y: 19, s: .9, w: 17, h: 70, cloth: body, shirt: CRE, kind: 'tunic' })}
   <path d="M-14 26 Q-24 50 -19 70 M14 26 Q24 50 19 70" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none" opacity=".85"/>
   <path d="M-14 26 Q-24 50 -19 70 M14 26 Q24 50 19 70" stroke="${body}" stroke-width="5.6" stroke-linecap="round" fill="none"/>
   <circle cx="-19" cy="72" r="3.2" fill="#e6d6ba" stroke="${INK}" stroke-width=".8"/><circle cx="19" cy="72" r="3.2" fill="#e6d6ba" stroke="${INK}" stroke-width=".8"/>
   ${child(0, 1, .9, kind)}
  </g>`;
}
// 巨人：光头、铜鼻环、浑身是毛（排线）
function giant() {
  return `<g id="c2-giant">
  <ellipse cx="446" cy="610" rx="66" ry="8" fill="${INK}" opacity=".35"/>
  <path d="M404 508 Q398 560 410 604 L440 604 L444 540 L450 540 L454 604 L484 604 Q494 560 488 508Z" fill="${SEP}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M402 604 h40 v8 h-44z M452 604 h40 l4 8 h-44z" fill="${INK}"/>
  <path d="M392 398 Q446 376 500 398 L494 508 Q446 520 398 508Z" fill="${SKIN}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M420 414 q4 8 0 16 M446 410 q4 10 0 20 M472 414 q4 8 0 16" stroke="${INK}" stroke-width=".9" fill="none" opacity=".6"/>
  <path d="M396 496 Q446 512 496 496 L496 512 Q446 526 396 512Z" fill="${RED}" stroke="${INK}" stroke-width="1.3"/>
  <path d="M470 512 l8 22 l-14 -2z" fill="${RED}" stroke="${INK}"/>
  <g data-if="!entryPaid">
   <path d="M396 402 Q378 430 392 462" stroke="${INK}" stroke-width="23" fill="none" stroke-linecap="round"/>
   <path d="M396 402 Q378 430 392 462" stroke="${SKIN}" stroke-width="20" fill="none" stroke-linecap="round"/>
   <path d="M496 402 Q514 430 500 462" stroke="${INK}" stroke-width="23" fill="none" stroke-linecap="round"/>
   <path d="M496 402 Q514 430 500 462" stroke="${SKIN}" stroke-width="20" fill="none" stroke-linecap="round"/>
   <path d="M386 452 Q446 470 506 452 Q510 470 500 478 Q446 492 392 478 Q382 470 386 452Z" fill="${SKIN}" stroke="${INK}" stroke-width="1.5"/>
   <path d="M392 470 Q446 486 500 470" stroke="${INK}" stroke-width="1" fill="none"/>
   <rect x="388" y="456" width="12" height="9" rx="3" fill="${OCH}" stroke="${INK}"/><rect x="492" y="456" width="12" height="9" rx="3" fill="${OCH}" stroke="${INK}"/>
  </g>
  <g data-if="entryPaid">
   <path d="M396 402 Q380 450 388 500" stroke="${INK}" stroke-width="23" fill="none" stroke-linecap="round"/>
   <path d="M396 402 Q380 450 388 500" stroke="${SKIN}" stroke-width="20" fill="none" stroke-linecap="round"/>
   <path d="M496 404 Q530 420 560 440" stroke="${INK}" stroke-width="23" fill="none" stroke-linecap="round"/>
   <path d="M496 404 Q530 420 560 440" stroke="${SKIN}" stroke-width="20" fill="none" stroke-linecap="round"/>
   <path d="M556 430 l18 4 l2 6 l-16 2 l14 6 l-2 6 l-18 -4z" fill="${SKIN}" stroke="${INK}" stroke-width="1.2"/>
   <rect x="540" y="430" width="10" height="20" rx="3" fill="${OCH}" stroke="${INK}" transform="rotate(30 545 440)"/>
  </g>
  <path d="M432 376 h28 v22 h-28z" fill="${SKIN}" stroke="${INK}"/>
  ${giantHead(446, 349, 1.75)}
  <circle cx="423" cy="361" r="2.8" fill="none" stroke="${OCH}" stroke-width="1.5"/>
 </g>`;
}

/* =========================================================
   主场景：吉普赛人的集市（800 x 800）
   ========================================================= */
function main() {
  // 帐篷条纹：从顶点发散
  let stripes = '';
  for (let i = 0, x = -460; x < 1560; i++, x += 68) {
    stripes += `<path d="M545 200 L${x} 606 L${x + 68} 606Z" fill="${i % 2 ? CRE : '#9a4a34'}"/>`;
  }
  let scal = '';
  for (let i = 0; i < 12; i++) {
    const x = 382 + i * 27.2;
    scal += `<path d="M${x} 296 h27.2 v4 q-13.6 20 -27.2 0z" fill="${i % 2 ? OCH : '#c9a66a'}" stroke="${INK}" stroke-width="1"/>`;
  }
  let awning = '';
  for (let i = 0; i < 11; i++) {
    const x = 26 + i * 22;
    awning += `<path d="M${x} 330 h22 v40 q-11 16 -22 0z" fill="${i % 2 ? CRE : OCH}" stroke="${INK}" stroke-width="1"/>`;
  }
  const flags = [[40, 82, RED], [100, 104, OCH], [160, 122, VER], [220, 136, RED], [280, 146, OCH], [340, 150, VER], [400, 150, RED], [460, 146, OCH], [610, 132, VER], [670, 118, RED], [730, 104, OCH]]
    .map(([x, y, c]) => `<path d="M${x - 11} ${y} L${x + 11} ${y + 2} L${x + 1} ${y + 24}Z" fill="${c}" stroke="${INK}" stroke-width="1"/>`).join('');
  return `
<svg id="c2-main" class="c1-scene" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
 <g filter="url(#c1-wob)">
  <rect width="800" height="540" fill="url(#c2-dusk)"/>
  <rect width="800" height="90" fill="url(#c1-hf)" opacity=".35"/>
  <circle cx="134" cy="156" r="96" fill="url(#c2-sunG)"/>
  <circle cx="134" cy="156" r="40" fill="#f3d58c" stroke="${INK}" stroke-width="1.4"/>
  <path d="M134 116 A40 40 0 0 1 134 196 A30 40 0 0 0 134 116Z" fill="url(#c1-h)" opacity=".5"/>
  <g stroke="${INK}" stroke-width="1.3" stroke-linecap="round" opacity=".7">
   <path d="M134 98 v-14 M134 214 v14 M76 156 h-14 M192 156 h14 M93 115 l-10 -10 M175 197 l10 10 M175 115 l10 -10 M93 197 l-10 10"/>
  </g>
  <path d="M560 70 q8 -6 16 0 q8 -6 16 0 M620 96 q6 -5 12 0 q6 -5 12 0" stroke="${INK}" stroke-width="1.4" fill="none" opacity=".6"/>
  <path d="M0 520 Q120 470 260 492 T520 480 T800 488 V560 H0Z" fill="#9b8257" opacity=".75"/>
  <path d="M0 520 Q120 470 260 492 T520 480 T800 488 V560 H0Z" fill="url(#c1-hf)" opacity=".5"/>
  <g fill="#7c6a46" stroke="${INK}" stroke-opacity=".5">
   <path d="M770 500 q2 -60 -6 -110 l6 0 q10 50 6 110z"/><path d="M767 392 q-30 -10 -44 8 q24 -6 42 0 q-20 6 -30 26 q20 -18 34 -22 q4 20 -2 40 q12 -20 4 -44 q22 6 36 28 q-8 -28 -32 -36 q24 -10 44 0 q-22 -18 -52 0z"/>
   <path d="M24 512 q2 -50 -4 -96 l6 0 q8 44 4 96z"/><path d="M22 418 q-28 -8 -40 8 q22 -6 38 0 q-18 6 -26 24 q18 -16 30 -20 q22 6 34 26 q-8 -26 -30 -34 q22 -8 40 0 q-20 -16 -46 -4z"/>
  </g>
  <rect y="540" width="800" height="260" fill="#b8956a"/>
  <path d="M0 540 Q400 552 800 540" stroke="${INK}" stroke-opacity=".35" fill="none"/>
  <rect y="700" width="800" height="100" fill="url(#c1-h)" opacity=".28"/>
  <g stroke="${INK}" stroke-opacity=".4" stroke-width="1.2" fill="none">
   <path d="M40 620 q20 -4 40 0 M150 760 q24 -6 50 0 M700 620 q20 -4 40 0 M460 770 q20 -4 40 0 M740 780 q14 -4 30 0"/>
  </g>
  <g fill="${UMB}" opacity=".55"><ellipse cx="96" cy="700" rx="6" ry="3"/><ellipse cx="760" cy="650" rx="5" ry="2.6"/><ellipse cx="200" cy="610" rx="4" ry="2"/><ellipse cx="480" cy="640" rx="5" ry="2.4"/></g>
  <path d="M0 64 Q280 176 545 140 Q680 128 800 76" stroke="${INK}" stroke-width="1.3" fill="none"/>
  ${flags}
 </g>

 <!-- 帐篷 -->
 <g>
  <g clip-path="url(#c2-tentClip)">${stripes}
   <path d="M600 200 L800 200 L800 606 L640 606Z" fill="url(#c1-h)" opacity=".55"/>
   <rect x="300" y="560" width="500" height="46" fill="url(#c1-hx)" opacity=".5"/>
  </g>
  <path d="M330 606 L382 300 Q545 96 708 300 L760 606Z" fill="none" stroke="${INK}" stroke-width="2"/>
  ${scal}
  <path d="M545 200 V132" stroke="${INK}" stroke-width="3"/>
  <path class="c2-pennant" d="M545 134 Q566 128 590 140 Q568 146 545 150Z" fill="${RED}" stroke="${INK}"/>
  <circle cx="545" cy="130" r="4" fill="${OCH}" stroke="${INK}"/>
  <path d="M492 606 L545 392 L598 606 Z" fill="#1d140c"/>
  <g data-if="entryPaid">
   <ellipse cx="545" cy="566" rx="40" ry="28" fill="url(#c2-glowIce)"/>
   <path d="M530 576 l14 -22 l16 22z" fill="${ICE}" stroke="${ICEL}" opacity=".8"/>
   <path d="M492 606 L545 392 Q520 470 474 548 L470 606Z" fill="#b38d5c" stroke="${INK}" stroke-width="1.4"/>
   <path d="M598 606 L545 392 Q570 470 616 548 L620 606Z" fill="#b38d5c" stroke="${INK}" stroke-width="1.4"/>
   <path d="M478 560 q12 -6 22 4 M612 560 q-12 -6 -22 4" stroke="${SEP}" stroke-width="3" fill="none"/>
  </g>
  <g data-if="!entryPaid">
   <path d="M492 606 L545 392 L545 606Z" fill="#b38d5c" stroke="${INK}" stroke-width="1.4"/>
   <path d="M598 606 L545 392 L545 606Z" fill="#a37f50" stroke="${INK}" stroke-width="1.4"/>
   <path d="M560 440 L598 606 L570 606Z" fill="url(#c1-h)" opacity=".6"/>
   <path d="M531 500 q14 8 28 0" stroke="${SEP}" stroke-width="4" fill="none"/><circle cx="545" cy="504" r="4" fill="${OCH}" stroke="${INK}"/>
  </g>
  <g transform="translate(662 446) rotate(4)">
   <rect x="-46" y="-58" width="92" height="116" fill="${CRE}" stroke="${INK}" stroke-width="1.4"/>
   <rect x="-40" y="-52" width="80" height="104" fill="none" stroke="${UMB}" stroke-width=".7"/>
   <circle cx="-40" cy="-52" r="2.4" fill="${RED}"/><circle cx="40" cy="-52" r="2.4" fill="${RED}"/>
   <text x="0" y="-36" text-anchor="middle" font-size="9" letter-spacing="2" fill="${INK}" ${FI}>EL HIELO</text>
   <text x="0" y="6" text-anchor="middle" font-size="40" font-weight="900" fill="${INK}" ${F}>冰</text>
   <text x="0" y="24" text-anchor="middle" font-size="8" font-weight="700" fill="${INK}" ${F}>本世纪最伟大的发明</text>
   <path d="M-30 31 h60" stroke="${UMB}" stroke-width=".6"/>
   <text x="0" y="43" text-anchor="middle" font-size="8.2" font-weight="700" fill="${RED}" ${F}>入场 30 · 触摸 10</text>
  </g>
 </g>

 ${giant()}

 <!-- 吉普赛商贩的货摊 -->
 <g>
  <rect x="30" y="330" width="8" height="312" fill="${WOOD}" stroke="${INK}"/>
  <rect x="250" y="330" width="8" height="312" fill="${WOOD}" stroke="${INK}"/>
  <g>
   <path d="M144 456 Q112 470 104 548 L186 548 Q178 470 144 456Z" fill="${VER}" stroke="${INK}" stroke-width="1.4"/>
   <path d="M126 470 L144 500 L162 470" fill="${OCH}" stroke="${INK}" stroke-width=".8"/>
   <path d="M122 430 Q120 398 144 394 Q170 398 166 432 Q170 446 156 452 L132 452 Q118 446 122 430Z" fill="${RED}" stroke="${INK}" stroke-width="1.3"/>
   <path d="M164 420 q14 6 12 30 q-6 -10 -12 -14z" fill="${RED}" stroke="${INK}"/>
   ${trader(144, 430, 1.1)}
   <circle cx="130" cy="438" r="3" fill="none" stroke="#e1c27a" stroke-width="1.5"/><circle cx="158" cy="438" r="3" fill="none" stroke="#e1c27a" stroke-width="1.5"/>
  </g>
  ${awning}
  <g stroke="${INK}" fill="${OCH}">
   <line x1="84" y1="372" x2="84" y2="388"/><path d="M78 398 q6 -14 12 0z"/><line x1="138" y1="372" x2="138" y2="392"/><path d="M132 402 q6 -14 12 0z"/><line x1="200" y1="372" x2="200" y2="384"/><path d="M194 394 q6 -14 12 0z"/>
  </g>
  <rect x="26" y="544" width="236" height="16" fill="${WOOD2}" stroke="${INK}" stroke-width="1.4"/>
  <path d="M30 560 H258 L254 640 H34Z" fill="${RED}" stroke="${INK}" stroke-width="1.4"/>
  <path d="M30 560 H258 L254 640 H34Z" fill="url(#c1-h)" opacity=".35"/>
  <path d="M54 590 l10 -10 l10 10 l-10 10z M134 590 l10 -10 l10 10 l-10 10z M214 590 l10 -10 l10 10 l-10 10z" fill="${OCH}" opacity=".8"/>
  <path d="M34 636 ${Array.from({ length: 22 }, (_, i) => `l5 8 l5 -8`).join(' ')}" fill="none" stroke="${OCH}" stroke-width="1.2"/>
  <g transform="rotate(-18 76 532)"><rect x="48" y="526" width="58" height="11" rx="3" fill="#c9a24a" stroke="${INK}"/><rect x="96" y="523" width="16" height="17" rx="3" fill="#c9a24a" stroke="${INK}"/><path d="M60 526 v11 M80 526 v11" stroke="${INK}" stroke-width=".8"/></g>
  <circle cx="132" cy="528" r="13" fill="#efe9d4" fill-opacity=".6" stroke="${INK}" stroke-width="2.2"/><path d="M125 522 q4 -4 9 -3" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M141 538 l12 8" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>
  <path d="M168 544 v-24 q0 -6 6 -6 h16 q6 0 6 6 v24z" fill="url(#c1-glass)" stroke="${INK}"/>
  <path d="M172 530 q10 -6 20 0 q-10 8 -20 0z" fill="${CRE}" stroke="${INK}" stroke-width=".8"/><path d="M175 530 v3 M179 529 v4 M183 529 v4 M187 530 v3" stroke="${INK}" stroke-width=".6"/>
  <circle cx="226" cy="528" r="14" fill="none" stroke="${OCH}" stroke-width="2.4"/><circle cx="226" cy="528" r="8" fill="none" stroke="${INK}"/><path d="M212 528 h28 M226 514 v28" stroke="${INK}" stroke-width=".8"/>
  <g transform="translate(46 404) rotate(-4)"><rect x="0" y="0" width="54" height="24" fill="${CRE}" stroke="${INK}"/><text x="27" y="16.5" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}" ${F}>收旧铁</text></g>
  <g id="c2-parrot" transform="translate(254 330)">
   <path d="M-10 -2 h20" stroke="${WOOD}" stroke-width="4"/>
   <path d="M2 -4 q10 18 4 42" stroke="${VER}" stroke-width="5" fill="none"/>
   <path d="M-8 -4 Q-14 -30 0 -40 Q14 -38 12 -20 Q12 -8 2 -4Z" fill="${VER}" stroke="${INK}" stroke-width="1.2"/>
   <path d="M0 -40 Q-10 -48 -2 -56 Q10 -56 10 -44 Q8 -38 0 -40Z" fill="#b0473a" stroke="${INK}" stroke-width="1.2"/>
   <path d="M-2 -50 q-10 0 -8 8 q4 -2 6 -3z" fill="${OCH}" stroke="${INK}" stroke-width=".8"/>
   <circle cx="3" cy="-49" r="1.8" fill="${CRE}" stroke="${INK}" stroke-width=".6"/><circle cx="3.4" cy="-49" r=".8" fill="${INK}"/>
   <path d="M4 -30 q4 8 2 14" stroke="${INK}" stroke-width=".7" fill="none"/>
  </g>
 </g>

 <!-- 泥地 -->
 <ellipse cx="642" cy="714" rx="142" ry="46" fill="#6d5233" stroke="${INK}" stroke-width="1.4"/>
 <ellipse cx="650" cy="720" rx="112" ry="30" fill="#5a422a"/>
 <ellipse cx="642" cy="714" rx="142" ry="46" fill="url(#c1-hf)" opacity=".5"/>
 <path d="M560 700 q30 -8 60 0 M650 738 q30 -6 54 2" stroke="#8d6c45" stroke-width="2" fill="none"/>
 <g class="c2-glints" fill="${CRE}">
  <path d="M596 704 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2z"/><path d="M690 722 l1.6 -5 l1.6 5 l5 1.6 l-5 1.6 l-1.6 5 l-1.6 -5 l-5 -1.6z"/><path d="M720 698 l1.4 -4 l1.4 4 l4 1.4 l-4 1.4 l-1.4 4 l-1.4 -4 l-4 -1.4z"/>
 </g>

 ${jose(325, 516)}
 ${kid(250, 640, 1.22, 'arca')}
 ${kid(420, 680, 1, 'aure')}

 <g class="c1-hots">
  <circle data-hot="sun" cx="134" cy="156" r="48"/>
  <rect data-hot="poster" x="612" y="384" width="104" height="124"/>
  <rect data-hot="parrot" x="238" y="268" width="34" height="76"/>
  <rect data-hot="trader" x="40" y="390" width="210" height="166"/>
  <rect data-hot="sign" x="44" y="400" width="58" height="30"/>
  <path data-hot="tent" d="M492 606 L545 392 L598 606 Z"/>
  <rect data-hot="giant" x="384" y="318" width="112" height="294"/>
  <rect data-hot="jose" x="262" y="458" width="132" height="226"/>
  <rect data-hot="arca" x="220" y="616" width="62" height="184"/>
  <rect data-hot="aure" x="396" y="660" width="50" height="140"/>
  <ellipse data-hot="mud" cx="642" cy="714" rx="142" ry="46"/>
 </g>
</svg>`;
}

/* =========================================================
   特写：泥地（400 x 400）—— 拖动磁铁
   ========================================================= */
const OBJ = {
  pot: `<g><ellipse cx="0" cy="8" rx="20" ry="6" fill="${INK}" opacity=".3"/><path d="M-18 -8 Q-20 10 0 12 Q20 10 18 -8Z" fill="#4a4740" stroke="${INK}" stroke-width="1.4"/><ellipse cx="0" cy="-8" rx="18" ry="5" fill="#2d2a25" stroke="${INK}" stroke-width="1.2"/><path d="M-18 -6 q-8 0 -8 -6 M18 -6 q8 0 8 -6" stroke="${INK}" stroke-width="2" fill="none"/><path d="M6 -2 Q14 4 12 9" fill="none" stroke="#7a756a" stroke-width="1.2"/></g>`,
  helmet: `<g><path d="M-18 8 Q-20 -18 0 -20 Q20 -18 18 8Z" fill="#7a5a3c" stroke="${INK}" stroke-width="1.4"/><path d="M-18 8 Q0 14 18 8 L18 12 Q0 18 -18 12Z" fill="#6b4a2c" stroke="${INK}"/><path d="M-12 -2 h24 M-12 3 h24" stroke="${INK}" stroke-width="1.6"/><path d="M0 -20 v-5" stroke="${INK}" stroke-width="2"/><circle cx="-8" cy="-10" r="3" fill="${RED}" opacity=".6"/><circle cx="9" cy="-6" r="2" fill="${OCH}" opacity=".7"/></g>`,
  box: `<g><path d="M-18 -10 h36 v20 h-36z" fill="#6c6a60" stroke="${INK}" stroke-width="1.4"/><path d="M-18 -10 l4 -6 h28 l4 6" fill="#7d7a6e" stroke="${INK}" stroke-width="1.2"/><rect x="-4" y="-4" width="8" height="8" fill="${OCH}" stroke="${INK}"/><path d="M-14 6 h28" stroke="${INK}" stroke-width=".6" opacity=".6"/><circle cx="12" cy="-2" r="2" fill="${RED}" opacity=".5"/></g>`,
  nail: (r) => `<g transform="rotate(${r})"><path d="M0 -9 V7" stroke="#55524a" stroke-width="2"/><path d="M-3 -9 h6" stroke="${INK}" stroke-width="2"/></g>`
};
const NAIL_ON_MAG = {
  n1: `<g transform="translate(-19 33)">${OBJ.nail(-25)}${OBJ.nail(10)}</g>`,
  n2: `<g transform="translate(19 34)">${OBJ.nail(20)}${OBJ.nail(-8)}${OBJ.nail(40)}</g>`,
  n3: `<g transform="translate(-12 40)">${OBJ.nail(70)}</g><g transform="translate(14 42)">${OBJ.nail(-60)}</g>`
};
function mound(k, x, y, big) {
  const rx = big ? 26 : 16, ry = big ? 10 : 7;
  return `<g data-if="!found.${k}"><g class="c2-mound" id="c2-m-${k}">
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#8d6c45" stroke="${INK}" stroke-width="1.1"/>
    <path d="M${x} ${y - ry} A${rx} ${ry} 0 0 1 ${x + rx} ${y} H${x}Z" fill="url(#c1-h)" opacity=".6"/>
    <path d="M${x - 4} ${y - 2} l1.4 -4 l1.4 4 l4 1.4 l-4 1.4 l-1.4 4 l-1.4 -4 l-4 -1.4z" fill="${CRE}" class="c2-glint"/>
  </g></g>
  <g data-if="found.${k}"><ellipse cx="${x}" cy="${y + 1}" rx="${rx - 2}" ry="${ry - 2}" fill="#3e2c1a" stroke="${INK}" stroke-opacity=".5"/></g>`;
}
function mud() {
  const B = BURIED;
  return `
<svg id="c2-mud" class="c1-scene" viewBox="0 0 400 400">
 <g filter="url(#c1-wob)">
  <rect width="400" height="400" fill="#7a5c3a"/>
  <g fill="#664b2e"><ellipse cx="80" cy="60" rx="90" ry="40"/><ellipse cx="320" cy="180" rx="100" ry="50"/><ellipse cx="160" cy="350" rx="130" ry="44"/></g>
  <g fill="#4c5650" opacity=".55"><ellipse cx="210" cy="292" rx="56" ry="18"/><ellipse cx="340" cy="60" rx="40" ry="12"/></g>
  <path d="M170 288 q30 -6 60 0 M318 58 q16 -4 30 0" stroke="#d9e1d6" stroke-width="1.2" fill="none" opacity=".6"/>
  <rect width="400" height="400" fill="url(#c1-hf)" opacity=".35"/>
  <g fill="#5a422a" opacity=".8">
   <ellipse cx="40" cy="250" rx="8" ry="13" transform="rotate(-20 40 250)"/><ellipse cx="62" cy="226" rx="8" ry="13" transform="rotate(-20 62 226)"/>
   <ellipse cx="220" cy="60" rx="8" ry="13" transform="rotate(30 220 60)"/><ellipse cx="200" cy="34" rx="8" ry="13" transform="rotate(30 200 34)"/>
  </g>
  <g stroke="${OCH}" stroke-width="1.4" opacity=".7"><path d="M120 120 l14 -4 M350 250 l10 6 M30 360 l16 2 M270 380 l-8 -10"/></g>
  <g fill="#9a8466" stroke="${INK}" stroke-opacity=".5"><ellipse cx="150" cy="80" rx="5" ry="3.4"/><ellipse cx="372" cy="380" rx="6" ry="4"/><ellipse cx="34" cy="120" rx="4" ry="3"/><ellipse cx="240" cy="360" rx="5" ry="3"/></g>
 </g>
 ${mound('n1', B.n1[0], B.n1[1], false)}${mound('n2', B.n2[0], B.n2[1], false)}${mound('n3', B.n3[0], B.n3[1], false)}
 ${mound('pot', B.pot[0], B.pot[1], true)}${mound('helmet', B.helmet[0], B.helmet[1], true)}${mound('box', B.box[0], B.box[1], true)}
 <g data-if="found.pot" transform="translate(${B.pot[0] + 36} ${B.pot[1] + 10}) rotate(-24)">${OBJ.pot}</g>
 <g id="c2-hopLayer"></g>
 <g id="c2-mag" data-if="magnetTaken">
  <g class="c2-field" fill="none" stroke="${RED}" stroke-width="1" stroke-dasharray="3 4" opacity=".5">
   <path d="M-19 30 Q-40 60 0 64 Q40 60 19 30"/><path d="M-19 30 Q-60 76 0 82 Q60 76 19 30"/>
  </g>
  ${Object.entries(NAIL_ON_MAG).map(([k, v]) => `<g data-if="found.${k}">${v}</g>`).join('')}
  <ellipse cx="4" cy="38" rx="28" ry="7" fill="${INK}" opacity=".18"/>
  <path d="M-26 18 V-8 A26 26 0 0 1 26 -8 V18 H12 V-8 A12 12 0 0 0 -12 -8 V18Z" fill="${RED}" stroke="${INK}" stroke-width="1.8"/>
  <path d="M12 -8 A12 12 0 0 0 4 -19 L8 -32 A26 26 0 0 1 26 -8 V18 H18 V-8Z" fill="url(#c1-h)" opacity=".7"/>
  <rect x="-26" y="18" width="14" height="11" fill="#d6d1c2" stroke="${INK}" stroke-width="1.5"/><rect x="12" y="18" width="14" height="11" fill="#d6d1c2" stroke="${INK}" stroke-width="1.5"/>
  <path d="M-22 21 v5 M16 21 v5" stroke="#fff" stroke-width="1.4"/>
  <text x="0" y="-16" text-anchor="middle" font-size="7" font-weight="700" fill="${CRE}" ${F}>M</text>
  <rect class="c1-zh c1-drag" data-z="magnet" x="-34" y="-40" width="68" height="80"/>
 </g>
</svg>`;
}

/* =========================================================
   特写：帐篷里（400 x 400）—— 海盗箱、油灯、白布
   ========================================================= */
const CITY = `<g>
  <g fill="#e7efe9" stroke="${ICEL}" stroke-width="1.1">
   <path d="M-40 26 V2 L-30 -8 L-20 2 V26Z"/><path d="M-20 26 V-10 H-4 V26Z"/><path d="M-4 26 V-4 L6 -22 L16 -4 V26Z"/><path d="M16 26 V6 H30 V26Z"/><path d="M30 26 V-2 L37 -12 L42 -2 V26Z"/>
  </g>
  <g stroke="#fff" stroke-width="1.2" opacity=".9"><path d="M-36 20 l8 -12 M-16 18 l8 -14 M0 20 l10 -16 M20 22 l6 -10 M33 20 l6 -10"/></g>
  <g fill="${ICEL}"><rect x="-14" y="2" width="4" height="5"/><rect x="4" y="2" width="4" height="6"/><rect x="21" y="12" width="4" height="5"/></g>
  <path d="M-46 26 H46" stroke="${ICEL}" stroke-width="1.2"/>
  <g fill="${OCH}"><path d="M-26 -22 l1.2 -3.4 l1.2 3.4 l3.4 1.2 l-3.4 1.2 l-1.2 3.4 l-1.2 -3.4 l-3.4 -1.2z"/><path d="M24 -26 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1z"/></g>
 </g>`;
function tent() {
  let st = '';
  for (let i = 0; i < 10; i++) st += `<rect x="${i * 40 + 10}" y="0" width="20" height="300" fill="#6b3526" opacity=".75"/>`;
  let rope = 'M10 ' + ropeY(10).toFixed(1);
  for (let x = 20; x <= 390; x += 10) rope += ` L${x} ${ropeY(x).toFixed(1)}`;
  return `
<svg id="c2-tent" class="c1-scene" viewBox="0 0 400 400">
 <g filter="url(#c1-wob)">
  <rect width="400" height="400" fill="#4a3020"/>
  ${st}
  <rect width="400" height="300" fill="url(#c1-hf)" opacity=".35"/>
  <path d="M0 0 H400 V40 Q200 70 0 40Z" fill="url(#c1-h)" opacity=".6"/>
  <rect x="2" y="0" width="10" height="400" fill="${WOOD}" stroke="${INK}"/><rect x="388" y="0" width="10" height="400" fill="${WOOD}" stroke="${INK}"/>
  <path d="M0 300 Q200 284 400 300 V400 H0Z" fill="#5d4128"/>
  <path d="M0 300 Q200 284 400 300 V400 H0Z" fill="url(#c1-hx)" opacity=".35"/>
  <ellipse cx="200" cy="344" rx="160" ry="30" fill="${RED}" fill-opacity=".8" stroke="${INK}"/>
  <ellipse cx="200" cy="344" rx="136" ry="22" fill="none" stroke="${OCH}" stroke-width="1.6" stroke-dasharray="5 6" opacity=".7"/>
 </g>
 <g>
  <path d="M252 84 Q295 90 338 84 L340 164 Q296 170 250 164Z" fill="${CRE}" stroke="${INK}" stroke-width="1.3"/>
  <path d="M270 90 q4 36 -2 72 M314 88 q-6 40 2 74" stroke="${UMB}" stroke-width=".8" fill="none" opacity=".6"/>
  <path d="M320 86 Q338 120 340 164 L326 166 Q326 120 312 88Z" fill="url(#c1-hf)" opacity=".5"/>
  <circle cx="254" cy="85" r="2.6" fill="${RED}" stroke="${INK}" stroke-width=".6"/><circle cx="336" cy="85" r="2.6" fill="${RED}" stroke="${INK}" stroke-width=".6"/>
 </g>
 <g id="c2-beams" data-if="chestOpen" pointer-events="none">
  <polygon id="c2-beam1" fill="url(#c2-beamG)" opacity=".55"/>
  <polygon id="c2-beam2" fill="url(#c2-beamG)" opacity=".4"/>
 </g>
 <g id="c2-proj" data-if="chestOpen" filter="url(#c2-pblur)" pointer-events="none">
  <g id="c2-projIn">
   <ellipse cx="0" cy="0" rx="54" ry="44" fill="url(#c2-projG)"/>
   <g data-if="iceClear">${CITY}</g>
  </g>
 </g>
 <rect id="c2-sheetGlow" x="248" y="80" width="94" height="88" fill="none" stroke="#fbe7a8" stroke-width="3" opacity="0"/>

 <!-- 巨人（帐篷里） -->
 <g>
  <ellipse cx="78" cy="392" rx="64" ry="8" fill="${INK}" opacity=".4"/>
  <path d="M40 300 Q36 350 46 396 L74 396 L76 330 L84 330 L88 396 L116 396 Q124 350 118 300Z" fill="${SEP}" stroke="${INK}" stroke-width="1.5"/>
  <path d="M26 190 Q78 170 130 190 L124 300 Q78 312 34 300Z" fill="${SKIN}" stroke="${INK}" stroke-width="1.5"/>
  <path d="M30 290 Q78 306 126 290 V306 Q78 320 30 306Z" fill="${RED}" stroke="${INK}"/>
  <path d="M28 196 Q12 250 22 296" stroke="${INK}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M28 196 Q12 250 22 296" stroke="${SKIN}" stroke-width="19" fill="none" stroke-linecap="round"/>
  <g data-if="!chestOpen"><path d="M128 196 Q142 240 128 280" stroke="${INK}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M128 196 Q142 240 128 280" stroke="${SKIN}" stroke-width="19" fill="none" stroke-linecap="round"/></g>
  <g data-if="chestOpen"><path d="M128 196 Q160 210 176 218" stroke="${INK}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M128 196 Q160 210 176 218" stroke="${SKIN}" stroke-width="19" fill="none" stroke-linecap="round"/></g>
  <path d="M66 166 h24 v24 h-24z" fill="${SKIN}" stroke="${INK}"/>
  ${giantHead(78, 141, 1.65, { lw: .9 })}
 </g>

 <!-- 海盗箱 -->
 <g>
  <ellipse cx="200" cy="336" rx="74" ry="9" fill="${INK}" opacity=".45"/>
  <g data-if="chestOpen">
   <path d="M144 262 L150 204 Q200 192 250 204 L256 262Z" fill="#3c2818" stroke="${INK}" stroke-width="1.4"/>
   <path d="M150 214 Q200 202 250 214" stroke="${OCH}" stroke-width="4" fill="none"/>
   <ellipse cx="200" cy="232" rx="58" ry="40" fill="url(#c2-glowIce)" opacity=".7"/>
   <g id="c2-iceSmall">
    <path d="M158 264 L162 218 L180 204 L224 202 L240 214 L244 264Z" fill="url(#c2-ice)" stroke="${INK}" stroke-width="1.3"/>
    <path d="M162 218 L224 220 L240 214 M224 202 L224 220 L228 264" stroke="${ICEL}" stroke-width=".9" fill="none"/>
    <path d="M224 220 L240 214 L244 264 L228 264Z" fill="url(#c1-hf)" opacity=".45"/>
    <g data-if="!iceClear"><path d="M158 264 L162 218 L180 204 L224 202 L240 214 L244 264Z" fill="#f1f3ec" opacity=".72"/>
     <path d="M168 230 l10 6 M190 214 l6 10 M206 240 l12 -4 M176 252 l8 -8 M214 222 l8 8" stroke="#fff" stroke-width="1.2" opacity=".9"/></g>
    <g data-if="iceClear" stroke="#fffaf0" stroke-width=".8" opacity=".9"><path d="M186 236 l-14 -10 M186 236 l16 -12 M186 236 l2 18 M210 230 l14 8 M210 230 l-6 16 M210 230 l4 -16"/></g>
    <g data-if="iceClear" fill="${OCH}"><path d="M196 222 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1z" class="c2-tw"/><path d="M222 246 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1z" class="c2-tw t2"/></g>
   </g>
   <g class="c2-mistG" fill="none" stroke="#f1f3ec" stroke-width="2.2" stroke-linecap="round" opacity=".7">
    <path class="c2-mist" d="M170 206 q-6 -12 2 -22 q8 -10 0 -22"/><path class="c2-mist m2" d="M204 200 q6 -12 -2 -22 q-8 -10 0 -22"/><path class="c2-mist m3" d="M232 208 q-6 -12 2 -22 q8 -10 0 -22"/>
   </g>
  </g>
  <path d="M140 262 H260 L256 334 H144Z" fill="${WOOD}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M226 262 H260 L256 334 H228Z" fill="url(#c1-h)" opacity=".7"/>
  <path d="M164 262 v72 M236 262 v72" stroke="${OCH}" stroke-width="6"/><path d="M164 262 v72 M236 262 v72" stroke="${INK}" stroke-width=".8"/>
  <rect x="190" y="272" width="20" height="24" rx="3" fill="${OCH}" stroke="${INK}" stroke-width="1.2"/><path d="M200 280 v8" stroke="${INK}" stroke-width="2"/>
  <g data-if="!chestOpen">
   <path d="M136 264 L136 246 Q200 222 264 246 L264 264Z" fill="${WOOD2}" stroke="${INK}" stroke-width="1.6"/>
   <path d="M164 264 V236 M236 264 V236" stroke="${OCH}" stroke-width="6"/><path d="M164 264 V236 M236 264 V236" stroke="${INK}" stroke-width=".8"/>
   <path d="M136 256 Q200 236 264 256" stroke="${INK}" stroke-width=".8" fill="none" opacity=".6"/>
   <circle cx="200" cy="232" r="1" fill="none"/>
  </g>
 </g>

 <!-- 绳子与油灯 -->
 <path d="${rope}" fill="none" stroke="${SEP}" stroke-width="2"/>
 <g id="c2-lamp">
  <circle cx="0" cy="44" r="46" fill="url(#c2-lampG)" pointer-events="none"/>
  <path d="M0 0 V18" stroke="${INK}" stroke-width="1.4"/>
  <circle cx="0" cy="2" r="3.4" fill="none" stroke="${INK}" stroke-width="1.4"/>
  <path d="M-10 22 L10 22 L13 28 L-13 28Z" fill="${SEP}" stroke="${INK}" stroke-width="1.2"/>
  <path d="M-11 28 H11 L9 56 H-9Z" fill="#fbe7b0" fill-opacity=".7" stroke="${INK}" stroke-width="1.3"/>
  <path d="M0 30 V56 M-10 42 H10" stroke="${INK}" stroke-width=".8" opacity=".7"/>
  <ellipse class="c1-flame" cx="0" cy="44" rx="3.4" ry="7" fill="#f6c766"/>
  <path d="M-12 56 H12 L9 62 H-9Z" fill="${SEP}" stroke="${INK}" stroke-width="1.2"/>
  <circle class="c1-zh c1-drag" data-z="lamp" cx="0" cy="38" r="30"/>
 </g>

 <!-- 前景：两个孩子的背影 -->
 <g fill="#1f150c" opacity=".92" pointer-events="none">
  <path d="M296 400 Q298 360 330 354 Q362 360 364 400Z"/><circle cx="330" cy="338" r="21"/>
  <path d="M352 400 Q354 372 378 368 Q400 372 402 400Z"/><circle cx="378" cy="356" r="16"/>
  <path d="M316 326 q14 -10 28 0" stroke="#3c2a18" stroke-width="2" fill="none"/>
 </g>

 <rect class="c1-zh" data-z="giant2" x="16" y="112" width="122" height="288"/>
 <rect class="c1-zh" data-z="sheet" x="246" y="78" width="98" height="92"/>
 <rect class="c1-zh" data-z="chest" x="134" y="262" width="132" height="76"/>
 <rect class="c1-zh" data-z="chest" data-if="!chestOpen" x="134" y="222" width="132" height="42"/>
 <rect class="c1-zh" data-z="ice" data-if="chestOpen" x="150" y="190" width="100" height="74"/>
 <rect class="c1-zh" data-z="kids" x="294" y="320" width="106" height="80"/>
</svg>`;
}

/* =========================================================
   特写：冰（400 x 400）—— 擦去冰霜（冰霜由 canvas 绘制）
   ========================================================= */
function needles(cx, cy, n, len, seed) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + seed, l = len * (.55 + ((i * 37 + seed * 11) % 10) / 20);
    s += `M${cx} ${cy} l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)} `;
  }
  return s;
}
function ice() {
  const poly = ICE_POLY.map(p => p.join(' ')).join(' L');
  const sp = (x, y, r, cls = '') => `<path class="c2-tw ${cls}" d="M${x} ${y - r} L${x + r * .28} ${y - r * .28} L${x + r} ${y} L${x + r * .28} ${y + r * .28} L${x} ${y + r} L${x - r * .28} ${y + r * .28} L${x - r} ${y} L${x - r * .28} ${y - r * .28}Z" fill="#fffaf0" stroke="${OCH}" stroke-width=".6"/>`;
  return `
<svg id="c2-ice" class="c1-scene" viewBox="0 0 400 400">
 <g filter="url(#c1-wob)">
  <rect width="400" height="400" fill="#3a2616"/>
  <g stroke="${INK}" stroke-width="2" opacity=".7"><path d="M0 70 H400 M0 150 H400 M0 230 H400 M0 310 H400"/></g>
  <rect width="400" height="400" fill="url(#c1-hf)" opacity=".35"/>
  <ellipse cx="200" cy="200" rx="200" ry="170" fill="url(#c2-glowIce)" opacity=".45"/>
 </g>
 <path d="M${poly}Z" fill="url(#c2-ice)" stroke="${INK}" stroke-width="2"/>
 <g clip-path="url(#c2-iceClip)">
  <rect width="400" height="400" fill="#7d9f9b" opacity=".38"/>
  <ellipse cx="200" cy="210" rx="120" ry="140" fill="#eef5f0" opacity=".35"/>
  <path d="M300 94 L340 86 L346 352 L306 352Z" fill="url(#c1-hf)" opacity=".4"/>
  <path d="M66 92 L118 52 L300 44 L340 86 L300 94Z" fill="#eef3ee" opacity=".55"/>
  <g transform="translate(200 236) scale(1.5)" opacity=".35">${CITY}</g>
  <g stroke="#fffaf0" stroke-width="1" fill="none" opacity=".85">
   <path d="${needles(130, 170, 11, 46, .3)}"/><path d="${needles(260, 150, 9, 40, 1.1)}"/><path d="${needles(170, 300, 10, 38, 2)}"/><path d="${needles(286, 278, 8, 34, .7)}"/><path d="${needles(214, 110, 7, 28, 1.6)}"/>
  </g>
  <g stroke="${ICEL}" stroke-width=".8" fill="none" opacity=".6">
   <path d="${needles(130, 170, 6, 30, 1.8)}"/><path d="${needles(260, 150, 5, 26, .2)}"/><path d="${needles(170, 300, 6, 26, .9)}"/>
  </g>
  <g fill="none" stroke="#fffaf0" stroke-width=".9" opacity=".8">
   <circle cx="96" cy="250" r="5"/><circle cx="104" cy="268" r="3"/><circle cx="318" cy="200" r="4"/><circle cx="240" cy="330" r="3.4"/><circle cx="150" cy="86" r="2.6"/><circle cx="330" cy="320" r="5"/>
  </g>
  ${sp(130, 170, 9)}${sp(260, 150, 8, 't2')}${sp(170, 300, 7, 't3')}${sp(286, 278, 6)}${sp(214, 110, 6, 't2')}${sp(92, 120, 5, 't3')}
 </g>
 <path d="M66 92 L300 94 L340 86 M300 44 L300 94 L306 352" stroke="${INK}" stroke-width="1" fill="none" opacity=".55"/>
 <path d="M78 110 L82 300" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
 <g filter="url(#c1-wob)">
  <path d="M0 352 H400 V400 H0Z" fill="${WOOD}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M0 352 H400 V364 H0Z" fill="${OCH}" stroke="${INK}"/>
  <rect y="364" width="400" height="36" fill="url(#c1-h)" opacity=".5"/>
 </g>
</svg>`;
}

/* ---------------- 物品图标（60x60） ---------------- */
const ICONS = {
  magnet: `<svg viewBox="0 0 60 60"><g transform="translate(30 30) rotate(-35)"><path d="M-17 13 V-4 A17 17 0 0 1 17 -4 V13 H8 V-4 A8 8 0 0 0 -8 -4 V13Z" fill="${RED}" stroke="${INK}" stroke-width="1.4"/><rect x="-17" y="13" width="9" height="8" fill="#d6d1c2" stroke="${INK}" stroke-width="1.2"/><rect x="8" y="13" width="9" height="8" fill="#d6d1c2" stroke="${INK}" stroke-width="1.2"/><path d="M8 -4 A8 8 0 0 0 2 -11 L5 -20 A17 17 0 0 1 17 -4 V13 H12 V-4Z" fill="url(#c1-h)" opacity=".7"/></g><path d="M44 46 q4 4 8 2 M46 40 q5 2 8 -1" stroke="${RED}" stroke-width="1" fill="none" stroke-dasharray="2 2"/></svg>`,
  coins: `<svg viewBox="0 0 60 60"><g stroke="${INK}" stroke-width="1.2"><ellipse cx="26" cy="46" rx="15" ry="5" fill="#b8963f"/><path d="M11 46 v-5 a15 5 0 0 0 30 0 v5" fill="#b8963f"/><ellipse cx="26" cy="41" rx="15" ry="5" fill="#d2b35c"/><path d="M11 41 v-5 a15 5 0 0 0 30 0 v5" fill="#b8963f"/><ellipse cx="26" cy="36" rx="15" ry="5" fill="#d9bc68"/></g><g transform="rotate(16 40 22)"><ellipse cx="40" cy="22" rx="11" ry="12" fill="#e2c675" stroke="${INK}" stroke-width="1.3"/><ellipse cx="40" cy="22" rx="7.5" ry="8.5" fill="none" stroke="${INK}" stroke-width=".7"/><text x="40" y="26" text-anchor="middle" font-size="10" font-weight="700" fill="${INK}" ${FI}>R</text></g></svg>`,
  helmet: `<svg viewBox="0 0 60 60"><path d="M10 40 Q8 12 30 10 Q52 12 50 40Z" fill="#7a5a3c" stroke="${INK}" stroke-width="1.5"/><path d="M10 40 Q30 48 50 40 L50 46 Q30 54 10 46Z" fill="#6b4a2c" stroke="${INK}" stroke-width="1.2"/><path d="M16 28 h28 M16 34 h28" stroke="${INK}" stroke-width="2"/><path d="M30 10 v-5" stroke="${INK}" stroke-width="2.4"/><path d="M38 14 Q48 22 48 38" fill="url(#c1-h)" opacity=".7"/><circle cx="20" cy="18" r="3.5" fill="${RED}" opacity=".6"/><circle cx="40" cy="24" r="2.4" fill="${OCH}" opacity=".8"/></svg>`
};

export const ART2 = { DEFS, main, mud, tent, ice, ICONS, OBJ };
