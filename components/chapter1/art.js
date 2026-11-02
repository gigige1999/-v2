/* =========================================================
   第一章美术 — 羊皮纸 + 墨线 + 棕褐色调；人物为锈湖式写意肖像（苍白长脸、深眼窝）
   所有 id 以 c1- 开头，避免与书本其它元素冲突
   ========================================================= */
import { jose, ursula, rebecca, melquiades, torso } from '../shared/people.js';
const INK = '#2b1d12', SEP = '#5a3e24', UMB = '#7a5a38', OCH = '#b08a4a', PAP = '#efe3c4', CRE = '#f4ebd5',
  RED = '#8a3a28', VER = '#6f8566', WOOD = '#8a6440', WOOD2 = '#a27c4f';
const F = 'font-family="Cormorant Garamond, Songti SC, STSong, Noto Serif SC, serif"';
const FI = 'font-family="Cormorant Garamond, Playfair Display, serif" font-style="italic"';

/* ---------------- 工具 ---------------- */
function tag(x, y, text, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><g class="c1-tag">
    <line x1="0" y1="-14" x2="0" y2="3" stroke="${SEP}" stroke-width="1"/>
    <path d="M-19 3 H19 V27 H-19 Z" fill="${CRE}" stroke="${INK}" stroke-width="1"/>
    <circle cx="0" cy="8" r="1.8" fill="none" stroke="${INK}"/>
    <text x="0" y="22.5" text-anchor="middle" font-size="11.5" font-weight="700" fill="${INK}" ${F}>${text}</text>
  </g></g>`;
}
function spokes(cx, cy, r1, r2, n, sw, col) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = i * Math.PI * 2 / n;
    s += `<line x1="${(cx + Math.sin(a) * r1).toFixed(1)}" y1="${(cy - Math.cos(a) * r1).toFixed(1)}" x2="${(cx + Math.sin(a) * r2).toFixed(1)}" y2="${(cy - Math.cos(a) * r2).toFixed(1)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }
  return s;
}
function cards(cx, cy, r, n, w, h, chars) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i * 360 / n).toFixed(2), x = cx - w / 2, y = cy - r - h / 2;
    s += `<g transform="rotate(${a} ${cx} ${cy})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${CRE}" stroke="${INK}" stroke-width="1"/>` +
      (chars
        ? `<text x="${cx}" y="${(y + h * 0.7).toFixed(1)}" text-anchor="middle" font-size="${(h * 0.5).toFixed(1)}" fill="${INK}" ${F}>${chars[i % chars.length]}</text>`
        : `<path d="M${x + 3} ${y + 6}h${w - 6}M${x + 3} ${y + 10}h${w - 8}M${x + 3} ${y + 14}h${w - 7}" stroke="${UMB}" stroke-width=".8"/>`) +
      `</g>`;
  }
  return s;
}
function stars(list) { return list.map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CRE}" opacity="${o}"/>`).join(''); }
function rooster(x, y, c, s = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-7 4 Q-11 -4 -5 -7 L-5 -12 L-2 -9 L0 -13 L2 -9 L5 -11 L4 -6 Q9 -4 8 2 Q12 -3 14 1 Q12 7 6 7 H-4 Q-8 7 -7 4Z" fill="${c}" stroke="${INK}" stroke-width=".8"/><circle cx="-2" cy="-4" r=".9" fill="${CRE}"/></g>`;
}
const corner = (x, y, sx, sy) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})" fill="none" stroke="${INK}">
  <path d="M0 26 V0 H26" stroke-width="1.2"/><path d="M5 20 Q5 5 20 5" stroke-width=".7"/>
  <circle cx="9.5" cy="9.5" r="2.2" fill="${INK}" stroke="none"/>
  <path d="M15 1.5 q5 5 11 0 M1.5 15 q5 5 0 11" stroke-width=".7"/></g>`;

/* 书页内的“版画框”：viewBox 400 x 432，图版区 18..382 */
function FRAME(cap, plate = true) {
  return `<svg class="c1-frame" viewBox="0 0 400 432" preserveAspectRatio="none" aria-hidden="true">
    <rect x="7" y="7" width="386" height="418" fill="none" stroke="${INK}" stroke-opacity=".7" stroke-width="1.2"/>
    ${plate ? `<rect x="14" y="14" width="372" height="372" fill="none" stroke="${INK}" stroke-opacity=".4" stroke-width=".7"/>` : ''}
    ${corner(3, 3, 1, 1)}${corner(397, 3, -1, 1)}${corner(3, 429, 1, -1)}${corner(397, 429, -1, -1)}
    <text x="200" y="404" text-anchor="middle" font-size="11" letter-spacing="2.4" fill="${INK}" fill-opacity=".72" ${FI}>${cap}</text>
  </svg>`;
}

/* ---------------- 共享 defs ---------------- */
const DEFS = `<defs>
  <pattern id="c1-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="1" stroke-opacity=".55"/></pattern>
  <pattern id="c1-hx" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0V6M0 0H6" stroke="${INK}" stroke-width=".9" stroke-opacity=".5"/></pattern>
  <pattern id="c1-hf" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)"><line x1="0" y1="0" x2="0" y2="4" stroke="${INK}" stroke-width=".7" stroke-opacity=".45"/></pattern>
  <pattern id="c1-wp" width="44" height="58" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="0" y2="58" stroke="${UMB}" stroke-opacity=".28"/><line x1="4" y1="0" x2="4" y2="58" stroke="${UMB}" stroke-opacity=".14"/>
    <path d="M22 18 q6 10 0 20 q-6 -10 0 -20z" fill="none" stroke="${UMB}" stroke-opacity=".3"/><circle cx="22" cy="46" r="1.3" fill="${UMB}" fill-opacity=".3"/>
  </pattern>
  <radialGradient id="c1-dark" gradientUnits="userSpaceOnUse" cx="310" cy="480" r="430">
    <stop offset="0" stop-color="#1c1108" stop-opacity="0"/><stop offset=".28" stop-color="#1c1108" stop-opacity=".1"/>
    <stop offset=".65" stop-color="#1c1108" stop-opacity=".62"/><stop offset="1" stop-color="#1c1108" stop-opacity=".86"/>
  </radialGradient>
  <mask id="c1-dmask" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="800">
    <rect width="800" height="800" fill="#fff"/>
    <path d="M342 320 V176 A68 68 0 0 1 478 176 V320 Z" fill="#000"/>
  </mask>
  <linearGradient id="c1-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#243030"/><stop offset=".6" stop-color="#3e4b46"/><stop offset="1" stop-color="#5a6352"/></linearGradient>
  <radialGradient id="c1-moonGlow"><stop offset="0" stop-color="#f6ebc4" stop-opacity=".6"/><stop offset="1" stop-color="#f6ebc4" stop-opacity="0"/></radialGradient>
  <radialGradient id="c1-lamp"><stop offset="0" stop-color="#ffe3a2" stop-opacity=".8"/><stop offset=".35" stop-color="#f3b45c" stop-opacity=".3"/><stop offset="1" stop-color="#e89a40" stop-opacity="0"/></radialGradient>
  <linearGradient id="c1-doorLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe8b0"/><stop offset=".6" stop-color="#e2ad62"/><stop offset="1" stop-color="#a87036"/></linearGradient>
  <linearGradient id="c1-drumG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity=".4"/><stop offset=".3" stop-color="${INK}" stop-opacity="0"/><stop offset=".7" stop-color="${INK}" stop-opacity="0"/><stop offset="1" stop-color="${INK}" stop-opacity=".4"/></linearGradient>
  <radialGradient id="c1-glass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fffaf0" stop-opacity=".45"/><stop offset="1" stop-color="#d9d2b6" stop-opacity=".12"/></radialGradient>
  <clipPath id="c1-winClip"><path d="M342 320 V176 A68 68 0 0 1 478 176 V320 Z"/></clipPath>
  <filter id="c1-forget" x="-25%" y="-25%" width="150%" height="150%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n">
      <animate attributeName="baseFrequency" values="0.028;0.05;0.033;0.028" dur="3s" repeatCount="indefinite"/>
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feColorMatrix in="d" type="saturate" values="0.05" result="s"/>
    <feGaussianBlur in="s" stdDeviation="1.1" result="b"/>
    <feComponentTransfer in="b"><feFuncA type="linear" slope="0.6"/></feComponentTransfer>
  </filter>
  <filter id="c1-wob" x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="c1-glow" x="-150%" y="-150%" width="400%" height="400%">
    <feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="c1-soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${INK}" flood-opacity=".35"/></filter>
</defs>`;

/* =========================================================
   主场景：布恩迪亚家的厅堂（800 x 800）
   ========================================================= */
function main() {
  const wains = [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${i * 100 + 12}" y="482" width="76" height="90" rx="2"/>`).join('');
  return `
<svg id="c1-main" class="c1-scene" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
 <g filter="url(#c1-wob)">
  <rect width="800" height="600" fill="#d8c296"/>
  <rect width="800" height="470" fill="url(#c1-wp)"/>
  <rect width="800" height="78" fill="url(#c1-h)" opacity=".6"/>
  <path d="M0 78 Q400 92 800 78" stroke="${INK}" stroke-opacity=".3" fill="none"/>
  <ellipse cx="520" cy="58" rx="150" ry="42" fill="${UMB}" opacity=".13"/>
  <ellipse cx="772" cy="300" rx="44" ry="140" fill="${UMB}" opacity=".13"/>
  <path d="M250 0 q6 40 -4 70 q-8 26 6 60 l-6 20 M246 70 l-14 10" stroke="${SEP}" stroke-width="1.3" fill="none" opacity=".6"/>
  <rect x="610" y="78" width="190" height="392" fill="url(#c1-hf)" opacity=".55"/>
  <rect y="470" width="800" height="120" fill="#a8855a"/>
  <g fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="2">${wains}</g>
  <rect y="536" width="800" height="54" fill="url(#c1-h)" opacity=".55"/>
  <rect y="462" width="800" height="9" fill="${SEP}" stroke="${INK}"/>
  <path d="M196 520 q14 -10 30 -2 q10 12 -4 22 q-16 8 -26 -4 z" fill="${PAP}" stroke="${SEP}" stroke-width=".8"/>
  <path d="M202 524 l8 10 M212 520 l6 12 M220 524 l2 10" stroke="${UMB}" stroke-width="1.2"/>
  <rect y="590" width="800" height="210" fill="#8b6944"/>
  <g stroke="${INK}" stroke-opacity=".55" stroke-width="1.6"><line x1="0" y1="618" x2="800" y2="618"/><line x1="0" y1="652" x2="800" y2="652"/><line x1="0" y1="694" x2="800" y2="694"/><line x1="0" y1="746" x2="800" y2="746"/>
   <line x1="120" y1="594" x2="118" y2="618"/><line x1="420" y1="594" x2="419" y2="618"/><line x1="700" y1="594" x2="702" y2="618"/><line x1="260" y1="618" x2="256" y2="652"/><line x1="610" y1="618" x2="613" y2="652"/><line x1="80" y1="652" x2="74" y2="694"/><line x1="520" y1="652" x2="524" y2="694"/><line x1="330" y1="694" x2="322" y2="746"/><line x1="760" y1="694" x2="768" y2="746"/></g>
  <rect y="590" width="800" height="44" fill="url(#c1-hx)" opacity=".7"/>
  <rect y="584" width="800" height="10" fill="${SEP}" stroke="${INK}"/>
  <path d="M342 320 L478 320 L600 800 L210 800 Z" fill="#fbf3da" opacity=".09"/>
  <ellipse cx="420" cy="724" rx="272" ry="56" fill="${RED}" fill-opacity=".82" stroke="${INK}" stroke-width="1.5"/>
  <ellipse cx="420" cy="724" rx="244" ry="44" fill="none" stroke="${OCH}" stroke-width="2" stroke-dasharray="6 7" opacity=".7"/>
  <ellipse cx="420" cy="724" rx="196" ry="30" fill="#9b4a30" stroke="${INK}" stroke-opacity=".4"/>
  <path d="M300 724 l14 -8 l14 8 l-14 8z M392 724 l14 -8 l14 8 l-14 8z M484 724 l14 -8 l14 8 l-14 8z" fill="${OCH}" opacity=".6"/>
  <ellipse cx="420" cy="740" rx="250" ry="34" fill="url(#c1-h)" opacity=".4"/>
  <rect x="32" y="192" width="156" height="400" fill="${INK}"/>
  <path d="M330 334 V176 A80 80 0 0 1 490 176 V334 Z" fill="${SEP}" stroke="${INK}" stroke-width="2"/>
  <rect x="200" y="232" width="114" height="9" fill="${WOOD}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M212 241 h12 l-12 16z M302 241 h-12 l12 16z" fill="${SEP}" stroke="${INK}"/>
  <rect x="284" y="190" width="9" height="42" fill="${RED}" stroke="${INK}"/><rect x="294" y="196" width="8" height="36" fill="${VER}" stroke="${INK}"/>
  <rect x="303" y="188" width="7" height="44" fill="${OCH}" stroke="${INK}" transform="rotate(7 306 232)"/>
 </g>

 <!-- 乌尔苏拉的肖像：眼睛会跟着你 -->
 <g id="c1-portrait">
  <line x1="110" y1="40" x2="82" y2="74" stroke="${INK}" stroke-width="1.3"/><line x1="110" y1="40" x2="138" y2="74" stroke="${INK}" stroke-width="1.3"/>
  <circle cx="110" cy="40" r="3" fill="${OCH}" stroke="${INK}"/>
  <rect x="66" y="72" width="88" height="106" rx="3" fill="${OCH}" stroke="${INK}" stroke-width="2.5"/>
  <rect x="71" y="77" width="78" height="96" fill="none" stroke="${INK}" stroke-opacity=".5"/>
  <rect x="75" y="81" width="70" height="88" fill="#5b4329"/>
  <rect x="75" y="81" width="70" height="88" fill="url(#c1-hf)" opacity=".7"/>
  <path d="M82 169 Q86 140 110 136 Q134 140 138 169 Z" fill="#3b2b1c"/>
  ${ursula(110, 113.6, 1.2)}
  <path d="M102 135 Q110 140 118 135 L119 141 Q110 146 101 141Z" fill="${CRE}" stroke="${INK}" stroke-width=".7"/>
  <circle cx="110" cy="146" r="1.6" fill="${OCH}" stroke="${INK}" stroke-width=".5"/>
  <circle id="c1-pupL" cx="104" cy="112" r="1.55" fill="${INK}"/><circle id="c1-pupR" cx="116" cy="112" r="1.55" fill="${INK}"/>
  <path d="M117 100 l-2 6 l3 4" stroke="${UMB}" stroke-width=".6" fill="none"/>
 </g>

 <!-- 门 -->
 <g data-if="!doorOpen" id="c1-doorLeaf">
  <rect x="44" y="204" width="132" height="386" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/>
  <g fill="none" stroke="${INK}" stroke-opacity=".7" stroke-width="2.5"><rect x="60" y="222" width="100" height="150" rx="2"/><rect x="60" y="394" width="100" height="176" rx="2"/></g>
  <rect x="130" y="204" width="46" height="386" fill="url(#c1-h)" opacity=".7"/>
  <g stroke="${SEP}" stroke-width="1" opacity=".7" fill="none"><path d="M80 230 q4 60 -2 130"/><path d="M120 236 q-5 50 3 128"/><path d="M90 404 q5 70 -3 160"/></g>
  <rect x="150" y="380" width="16" height="38" rx="3" fill="${SEP}" stroke="${INK}"/>
  <circle cx="158" cy="398" r="7" fill="none" stroke="${OCH}" stroke-width="2.5"/>
  <rect class="c1-doorHalo" x="44" y="204" width="132" height="386" fill="none" stroke="#f3d48a" stroke-width="3"/>
 </g>

 <!-- 糖罐 -->
 <g data-forget="jar">
  <g data-if="!roosterTaken">
   ${rooster(234, 220, '#b0473a', 1.1, -8)}${rooster(258, 214, '#c9a24a', 1, 12)}${rooster(244, 198, VER, .9, 4)}
   <path d="M258 186 q8 -6 14 0 q-6 8 -14 0z" fill="#c98a8a" stroke="${INK}" stroke-width=".6"/><circle cx="226" cy="204" r="5" fill="#c9a24a" stroke="${INK}" stroke-width=".6"/>
  </g>
  <g data-if="roosterTaken">
   ${rooster(256, 216, '#c9a24a', 1, 12)}${rooster(236, 222, VER, .9, -6)}
   <path d="M244 200 q8 -6 14 0 q-6 8 -14 0z" fill="#c98a8a" stroke="${INK}" stroke-width=".6"/>
  </g>
  <path d="M222 232 Q214 230 214 216 V178 Q214 168 224 166 H268 Q278 168 278 178 V216 Q278 230 270 232 Z" fill="url(#c1-glass)" stroke="${INK}" stroke-opacity=".75" stroke-width="1.5"/>
  <path d="M222 182 V214" stroke="#fffaf0" stroke-opacity=".7" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="226" y="160" width="40" height="8" fill="none" stroke="${INK}" stroke-opacity=".6"/>
  <rect data-if="!jarOpen" x="222" y="151" width="48" height="11" rx="3" fill="${WOOD2}" stroke="${INK}" stroke-width="1.5"/>
 </g>
 <rect data-if="jarOpen" x="279" y="200" width="9" height="32" rx="3" fill="${WOOD2}" stroke="${INK}" stroke-width="1.5" transform="rotate(-8 283 232)"/>

 <!-- 窗 -->
 <g clip-path="url(#c1-winClip)">
  <rect x="330" y="90" width="170" height="250" fill="url(#c1-sky)"/>
  ${stars([[356, 130, 1, .7], [372, 196, .8, .5], [400, 118, 1.1, .8], [468, 210, .9, .6], [352, 238, .7, .4], [420, 170, .8, .5], [470, 120, .9, .6]])}
  <circle cx="446" cy="150" r="40" fill="url(#c1-moonGlow)"/>
  <circle cx="446" cy="150" r="18" fill="${CRE}" stroke="${INK}" stroke-opacity=".4"/>
  <circle cx="440" cy="143" r="3" fill="#d8ca9c"/><circle cx="452" cy="158" r="2.2" fill="#d8ca9c"/>
  <path d="M330 300 Q380 284 420 296 T500 290 V340 H330Z" fill="#232b26"/>
  <path d="M362 302 Q366 270 358 244 L364 242 Q372 270 370 302Z" fill="#1b211d"/>
  <g fill="#1d241f"><circle cx="356" cy="236" r="18"/><circle cx="374" cy="226" r="16"/><circle cx="346" cy="252" r="12"/><circle cx="380" cy="246" r="12"/></g>
  <g fill="#1a1f1c"><ellipse cx="452" cy="296" rx="17" ry="8"/><ellipse cx="470" cy="290" rx="6" ry="6"/><rect x="439" y="300" width="3" height="9"/><rect x="460" y="300" width="3" height="9"/><path d="M466 284 l-3 -5 M474 284 l3 -5" stroke="#1a1f1c" stroke-width="2"/></g>
 </g>
 <line x1="410" y1="96" x2="410" y2="322" stroke="${SEP}" stroke-width="5"/>
 <line x1="340" y1="238" x2="480" y2="238" stroke="${SEP}" stroke-width="5"/>
 <path d="M342 320 V176 A68 68 0 0 1 478 176 V320" fill="none" stroke="${INK}" stroke-width="1.5"/>
 <rect x="318" y="330" width="184" height="12" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/>
 <g data-if="!jugTaken">
  <path d="M458 332 Q450 314 458 302 L460 292 H480 L482 302 Q490 314 482 332 Z" fill="#a86a42" stroke="${INK}" stroke-width="1.5"/>
  <path d="M472 300 Q484 314 478 330" fill="url(#c1-h)" opacity=".8"/>
  <ellipse cx="470" cy="292" rx="10" ry="3" fill="${SEP}" stroke="${INK}"/>
  <path d="M482 298 Q494 302 486 316" stroke="${INK}" stroke-width="2.5" fill="none"/>
 </g>

 <!-- 时钟 -->
 <g data-forget="clock">
  <path d="M548 96 Q552 58 590 52 Q628 58 632 96 Z" fill="${WOOD}" stroke="${INK}" stroke-width="2"/>
  <circle cx="590" cy="46" r="6" fill="${OCH}" stroke="${INK}" stroke-width="1.3"/>
  <rect x="562" y="156" width="56" height="144" rx="3" fill="${WOOD}" stroke="${INK}" stroke-width="2"/>
  <rect x="598" y="156" width="20" height="144" fill="url(#c1-h)" opacity=".7"/>
  <rect x="572" y="168" width="36" height="88" rx="2" fill="#3b2a1a" stroke="${INK}"/>
  <g class="c1-pend"><line x1="590" y1="170" x2="590" y2="234" stroke="${OCH}" stroke-width="2"/><circle cx="590" cy="238" r="9" fill="${OCH}" stroke="${INK}" stroke-width="1.5"/></g>
  <rect x="574" y="264" width="32" height="28" fill="#2b1d12"/>
  <g data-if="!clockOpen"><rect x="574" y="264" width="32" height="28" fill="${WOOD2}" stroke="${INK}" stroke-width="1.5"/><circle cx="600" cy="278" r="2.4" fill="${OCH}" stroke="${INK}" stroke-width=".6"/></g>
  <g data-if="clockOpen"><path d="M574 264 L579 267 V289 L574 292Z" fill="${WOOD2}" stroke="${INK}"/></g>
  <circle cx="590" cy="120" r="42" fill="${CRE}" stroke="${INK}" stroke-width="5"/>
  <circle cx="590" cy="120" r="34" fill="none" stroke="${UMB}" stroke-width=".8"/>
  ${spokes(590, 120, 30, 36, 12, 2, INK)}
  <g id="c1-mHour"><path d="M587 124 L590 98 L593 124Z" fill="${INK}"/></g>
  <g id="c1-mMin"><path d="M588.5 124 L590 87 L591.5 124Z" fill="${INK}"/></g>
  <circle cx="590" cy="120" r="3.2" fill="${OCH}" stroke="${INK}" stroke-width=".8"/>
 </g>

 <!-- 记忆机器 -->
 <g>
  <path d="M640 520 L616 594" stroke="${SEP}" stroke-width="12" stroke-linecap="round"/>
  <path d="M720 520 L744 594" stroke="${SEP}" stroke-width="12" stroke-linecap="round"/>
  <path d="M640 520 L616 594 M720 520 L744 594" stroke="${INK}" stroke-width="1" fill="none"/>
  <g id="c1-mainWheel">
   <circle cx="680" cy="440" r="100" fill="${WOOD}" stroke="${INK}" stroke-width="3"/>
   <circle cx="680" cy="440" r="74" fill="#5b4129" stroke="${INK}" stroke-width="2"/>
   <circle cx="680" cy="440" r="74" fill="url(#c1-hf)" opacity=".6"/>
   ${spokes(680, 440, 18, 74, 8, 7, WOOD)}
   ${cards(680, 440, 88, 18, 13, 19)}
  </g>
  <circle cx="680" cy="440" r="18" fill="${OCH}" stroke="${INK}" stroke-width="2"/>
  <rect x="675" y="435" width="10" height="10" fill="${INK}"/>
  <g data-if="crankAttached"><path d="M680 440 L730 440" stroke="${OCH}" stroke-width="7" stroke-linecap="round"/><path d="M680 440 L730 440" stroke="${INK}" stroke-width="1" /><rect x="724" y="426" width="13" height="26" rx="6" fill="${WOOD2}" stroke="${INK}" stroke-width="1.5"/><circle cx="680" cy="440" r="6" fill="#d9b86a" stroke="${INK}"/></g>
  <g data-if="machineDone"><rect x="667" y="318" width="26" height="34" fill="${CRE}" stroke="${INK}" stroke-width="1.3"/><text x="680" y="341" text-anchor="middle" font-size="15" font-weight="700" fill="${INK}" ${F}>梅</text></g>
  <rect x="640" y="552" width="80" height="18" rx="2" fill="${OCH}" stroke="${INK}" stroke-width="1.5"/>
  <text x="680" y="565.5" text-anchor="middle" font-size="11" font-weight="700" fill="${INK}" ${F}>记忆机器</text>
 </g>

<!-- 何塞·阿尔卡蒂奥·布恩迪亚：乱发、络腮胡 -->
 <g id="c1-jose">
  ${torso({ x: 420, y: 462, s: 2.1, w: 25, h: 34, cloth: '#4c3a28', vest: '#2f2418', shirt: '#e9dcc0' })}
 ${jose(420, 416, 2.1, { openIf: "!finished", closedIf: "finished" })}
 </g>

 <!-- 书桌 -->
 <ellipse cx="410" cy="770" rx="170" ry="12" fill="${INK}" opacity=".3"/>
 <rect x="266" y="610" width="16" height="156" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/>
 <rect x="538" y="610" width="16" height="156" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/>
 <rect x="262" y="546" width="296" height="70" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/>
 <rect x="262" y="590" width="296" height="26" fill="url(#c1-h)" opacity=".8"/>
 <rect x="250" y="530" width="320" height="18" fill="${WOOD2}" stroke="${INK}" stroke-width="1.5"/>
 <rect x="350" y="558" width="120" height="46" fill="${WOOD2}" stroke="${INK}" stroke-width="2"/>
 <rect x="356" y="564" width="108" height="34" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="1.2"/>
 <circle cx="410" cy="581" r="5" fill="${OCH}" stroke="${INK}"/>
 <ellipse cx="381" cy="531" rx="13" ry="6" fill="${CRE}" stroke="${INK}"/>
 <ellipse cx="459" cy="531" rx="13" ry="6" fill="${CRE}" stroke="${INK}"/>
 <path d="M432 529 L474 524 L480 530 L438 535Z" fill="${CRE}" stroke="${INK}" stroke-width=".8"/>
 <path d="M440 530 l30 -3 M442 532 l26 -3" stroke="${UMB}" stroke-width=".7"/>
 <g data-forget="lamp">
  <ellipse cx="310" cy="528" rx="21" ry="5" fill="${OCH}" stroke="${INK}" stroke-width="1.3"/>
  <path d="M296 528 Q291 512 302 505 H318 Q329 512 324 528 Z" fill="#c09a58" stroke="${INK}" stroke-width="1.3"/>
  <path d="M314 507 Q326 514 322 527 H314Z" fill="url(#c1-h)" opacity=".7"/>
  <rect x="301" y="500" width="18" height="6" fill="${UMB}" stroke="${INK}"/>
  <path d="M302 500 Q295 484 304 472 Q306 465 310 462 Q314 465 316 472 Q325 484 318 500 Z" fill="#fff8e6" fill-opacity=".35" stroke="${INK}" stroke-opacity=".6" stroke-width="1.2"/>
 </g>
 <g data-if="!inkTaken">
  <path d="M492 530 L490 516 Q490 508 498 508 L506 508 Q514 508 514 516 L512 530 Z" fill="#3a3a34" stroke="${INK}" stroke-width="1.5"/>
  <rect x="497" y="502" width="10" height="7" fill="${UMB}" stroke="${INK}"/>
  <path d="M494 516 v8" stroke="${CRE}" stroke-opacity=".5" stroke-width="1.5"/>
 </g>
 <g data-if="!quillTaken">
  <path d="M520 530 Q526 490 548 452 Q553 472 540 494 Q533 512 524 530 Z" fill="${CRE}" stroke="${INK}" stroke-width="1"/>
  <path d="M522 530 Q532 494 548 452 M530 506 l-6 -3 M536 490 l-6 -3 M541 476 l-5 -3" stroke="${UMB}" stroke-width=".8" fill="none"/>
 </g>

<!-- 丽贝卡：黑色长发，暗处发绿的眼睛 -->
 <g id="c1-rebecca">
  <ellipse cx="160" cy="764" rx="70" ry="9" fill="${INK}" opacity=".3"/>
  <rect x="118" y="700" width="66" height="10" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/>
  <path d="M124 710 L118 762 M178 710 L184 762" stroke="${SEP}" stroke-width="5"/>
  <path d="M150 628 Q126 640 114 706 Q150 718 188 706 Q174 640 150 628Z" fill="${VER}" stroke="${INK}" stroke-width="1.5"/>
  <path d="M136 706 l-4 30 M162 706 l3 30" stroke="${CRE}" stroke-width="5" stroke-linecap="round"/>
  <path d="M136 706 l-4 30 M162 706 l3 30" stroke="${INK}" stroke-width=".8" fill="none"/>
  ${rebecca(150, 607, 1.6)}
  <g data-if="!roosterGiven">
   <path d="M128 650 Q150 680 180 676" stroke="${CRE}" stroke-width="7" fill="none" stroke-linecap="round"/>
   <path d="M128 650 Q150 680 180 676" stroke="${INK}" stroke-width=".8" fill="none"/>
   <path d="M176 668 Q170 700 182 712 Q200 720 214 708 Q222 690 210 668 Q196 662 176 668Z" fill="#b39a6c" stroke="${INK}" stroke-width="1.5"/>
   <path d="M200 672 Q218 690 210 708" fill="url(#c1-h)" opacity=".8"/>
   <path d="M180 670 Q194 676 208 670" stroke="${SEP}" stroke-width="2.5" fill="none"/>
   <path d="M190 668 L184 652 M198 668 L204 654" stroke="${CRE}" stroke-width="4" stroke-linecap="round"/>
   <circle cx="183" cy="650" r="3" fill="${CRE}" stroke="${INK}" stroke-width=".6"/><circle cx="205" cy="652" r="3" fill="${CRE}" stroke="${INK}" stroke-width=".6"/>
  </g>
  <g data-if="roosterGiven">
   <path d="M130 650 Q138 640 146 628" stroke="${CRE}" stroke-width="7" fill="none" stroke-linecap="round"/>
   ${rooster(150, 624, '#b0473a', 1, -20)}
   <path d="M212 742 Q206 714 220 702 Q240 696 256 706 Q266 724 258 744 Q236 752 212 742Z" fill="#b39a6c" stroke="${INK}" stroke-width="1.5"/>
   <path d="M244 704 Q266 724 256 744" fill="url(#c1-h)" opacity=".8"/>
   <path d="M222 706 Q238 712 252 706" stroke="${SEP}" stroke-width="2.5" fill="none"/>
   <path d="M232 704 L226 688 M242 704 L250 690" stroke="${CRE}" stroke-width="4" stroke-linecap="round"/>
   <circle cx="225" cy="686" r="3" fill="${CRE}" stroke="${INK}" stroke-width=".6"/><circle cx="251" cy="688" r="3" fill="${CRE}" stroke="${INK}" stroke-width=".6"/>
  </g>
 </g>

 <!-- 夜色（以油灯为中心的墨褐色晕染） -->
 <rect id="c1-darkness" width="800" height="800" fill="url(#c1-dark)" mask="url(#c1-dmask)" pointer-events="none"/>

 <!-- 夜色之上：门外的光与梅尔基亚德斯、火焰、标签、发光的眼睛 -->
 <g data-if="doorOpen">
  <rect x="44" y="204" width="132" height="386" fill="url(#c1-doorLight)"/>
  <path d="M44 590 L176 590 L260 640 L0 650Z" fill="#f6dc9c" opacity=".35"/>
  <path d="M44 204 L66 216 L66 580 L44 590 Z" fill="${WOOD}" stroke="${INK}"/>
  <g class="c1-melq-in">
   <path d="M74 590 Q78 420 96 330 L124 330 Q142 420 146 590 Z" fill="#2a1f16" stroke="${INK}"/>
   ${melquiades(110, 311, 1.15)}
   <path d="M97 324 Q93 362 110 394 Q127 362 123 324 Q117 331 110 330 Q103 331 97 324Z" fill="#c9bfa6" stroke="${INK}" stroke-width=".8"/>
   <ellipse cx="110" cy="292" rx="42" ry="7" fill="${INK}"/>
   <path d="M90 292 Q91 260 110 258 Q129 260 130 292Z" fill="${INK}"/>
   <rect x="91" y="282" width="38" height="5" fill="${RED}"/>
   <path d="M124 380 Q140 400 136 440" stroke="#2a1f16" stroke-width="12" fill="none" stroke-linecap="round"/>
   <g data-if="!potionTaken">
    <circle cx="140" cy="440" r="24" fill="url(#c1-lamp)"/>
    <path d="M136 420 h8 v8 q7 5 7 15 q0 10 -11 10 q-11 0 -11 -10 q0 -10 7 -15z" fill="#f2d27a" stroke="${INK}" stroke-width="1"/>
   </g>
   <ellipse cx="136" cy="448" rx="7" ry="5" fill="#e9dcc0" stroke="${INK}" stroke-width=".8"/>
  </g>
 </g>
 <g pointer-events="none">
  <circle class="c1-lampGlow" cx="310" cy="488" r="100" fill="url(#c1-lamp)"/>
  <g class="c1-flameWrap"><ellipse class="c1-flame" cx="310" cy="490" rx="4" ry="9" fill="#f6c766"/></g>
  <ellipse cx="310" cy="492" rx="1.6" ry="3.5" fill="#fff6d0"/>
  <g data-if="!finished" class="c1-blink b3" filter="url(#c1-glow)">
   <ellipse cx="141" cy="604" rx="3" ry="2.4" fill="#b6e08a"/><ellipse cx="159" cy="604" rx="3" ry="2.4" fill="#b6e08a"/>
  </g>
  <g data-if="finished"><path d="M137 605 q4 3 8 0 M155 605 q4 3 8 0" stroke="${CRE}" stroke-width="1.3" fill="none"/></g>
 </g>
 <g data-if="named.lamp+!finished">${tag(332, 512, '油灯', -6)}</g>
 <g data-if="named.jar+!finished">${tag(246, 248, '糖罐', 4)}</g>
 <g data-if="named.clock+!finished">${tag(626, 170, '时钟', -4)}</g>

 <!-- 热区 -->
 <g class="c1-hots">
  <rect data-hot="portrait" x="62" y="68" width="96" height="114"/>
  <rect data-hot="door" data-if="!doorOpen" x="44" y="204" width="132" height="370"/>
  <rect data-hot="melq" data-if="doorOpen" x="66" y="252" width="94" height="338"/>
  <rect data-hot="jar" x="208" y="146" width="76" height="90"/>
  <path data-hot="window" d="M342 320 V176 A68 68 0 0 1 478 176 V320 Z"/>
  <rect data-hot="jug" data-if="!jugTaken" x="446" y="284" width="46" height="50"/>
  <rect data-hot="clock" x="545" y="40" width="92" height="262"/>
  <circle data-hot="machine" cx="680" cy="440" r="106"/>
  <rect data-hot="drawer" x="350" y="556" width="120" height="50"/>
  <rect data-hot="lamp" x="284" y="452" width="52" height="82"/>
  <rect data-hot="inkwell" data-if="!inkTaken" x="484" y="498" width="34" height="36"/>
  <rect data-hot="quill" data-if="!quillTaken" x="518" y="446" width="38" height="86"/>
  <rect data-hot="jose" x="378" y="364" width="84" height="134"/>
  <rect data-hot="rebecca" x="112" y="574" width="80" height="140"/>
  <rect data-hot="sack" data-if="!roosterGiven" x="172" y="644" width="52" height="76"/>
  <rect data-hot="sack" data-if="roosterGiven" x="206" y="680" width="64" height="72"/>
 </g>
</svg>`;
}

/* =========================================================
   特写图版（400 x 400）
   ========================================================= */
function drawer() {
  const tg = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-36 -20 H30 L38 -12 V20 H-36Z" fill="${CRE}" stroke="${INK}" stroke-width="1.2"/><circle cx="-26" cy="0" r="3.5" fill="none" stroke="${INK}"/></g>`;
  return `
<svg class="c1-scene" viewBox="0 0 400 400">
 <g filter="url(#c1-wob)">
  <rect width="400" height="400" fill="#d8c296"/>
  <rect width="400" height="400" fill="url(#c1-wp)"/>
  <path d="M30 108 H370 L396 330 H4 Z" fill="${WOOD}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M52 124 H348 L370 312 H30 Z" fill="#5b4129" stroke="${INK}" stroke-width="1.5"/>
  <path d="M52 124 H348 L370 312 H30 Z" fill="url(#c1-hx)" opacity=".7"/>
  <path d="M52 124 H348 L352 150 H48Z" fill="${INK}" opacity=".35"/>
  <path d="M4 330 H396 V378 H4 Z" fill="${WOOD2}" stroke="${INK}" stroke-width="2.5"/>
  <rect x="16" y="338" width="368" height="32" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="1.3"/>
  <rect x="4" y="360" width="392" height="18" fill="url(#c1-h)" opacity=".7"/>
 </g>
 <circle cx="200" cy="354" r="8" fill="${OCH}" stroke="${INK}" stroke-width="1.5"/>
 <circle cx="92" cy="282" r="6" fill="${OCH}" stroke="${INK}"/><circle cx="92" cy="282" r="1.5" fill="${INK}"/>
 <circle cx="318" cy="292" r="7" fill="${OCH}" stroke="${INK}"/><text x="318" y="295.5" text-anchor="middle" font-size="7" fill="${INK}" ${F}>壹</text>
 <path d="M300 160 q10 -14 22 -4 q-4 14 -22 4z" fill="#c9a24a" stroke="${INK}" stroke-width=".7"/><path d="M311 158 l14 22" stroke="${INK}" stroke-width="1"/>
 <g data-if="!labelsTaken">
  ${tg(140, 236, -10)}${tg(146, 228, 4)}${tg(136, 220, -4)}${tg(142, 212, 9)}
  <path d="M118 212 Q150 250 176 214" stroke="${RED}" stroke-width="2" fill="none"/>
 </g>
 <g data-if="!noteTaken" transform="translate(268 226) rotate(8)">
  <rect x="-56" y="-40" width="112" height="80" fill="${CRE}" stroke="${INK}" stroke-width="1.2"/>
  <line x1="0" y1="-40" x2="0" y2="40" stroke="${UMB}" stroke-width=".8"/>
  <g stroke="${INK}" stroke-width="1.1" fill="none" opacity=".75">
   <path d="M-46 -24 q6 -3 12 0 t12 0 t12 0 t10 0"/><path d="M-46 -12 q6 -3 12 0 t12 0 t12 0"/><path d="M-46 0 q6 -3 12 0 t12 0 t14 0"/><path d="M-46 12 q6 -3 12 0 t10 0"/>
   <path d="M8 -24 q6 -3 12 0 t12 0 t12 0"/><path d="M8 -12 q6 -3 12 0 t12 0 t10 0"/><path d="M8 0 q6 -3 12 0 t12 0"/><path d="M20 24 q8 -6 20 0"/>
  </g>
 </g>
 <rect class="c1-zh" data-z="dLabels" data-if="!labelsTaken" x="96" y="180" width="100" height="90"/>
 <rect class="c1-zh" data-z="dNote" data-if="!noteTaken" x="204" y="176" width="130" height="104"/>
</svg>`;
}

function yard() {
  const fence = [150, 180, 210, 240, 270, 300, 330, 360, 390].map(x => `<rect x="${x}" y="252" width="6" height="44" fill="${INK}"/>`).join('');
  return `
<svg class="c1-scene" viewBox="0 0 400 400">
 <rect width="400" height="400" fill="url(#c1-sky)"/>
 ${stars([[30, 40, 1.2, .8], [80, 70, .9, .5], [140, 30, 1.1, .7], [190, 80, .8, .5], [220, 40, 1.3, .9], [380, 30, 1, .6], [360, 150, .8, .4], [120, 130, .7, .4], [250, 140, .9, .5]])}
 <circle cx="300" cy="92" r="70" fill="url(#c1-moonGlow)"/>
 <circle cx="300" cy="92" r="32" fill="${CRE}" stroke="${INK}" stroke-opacity=".5"/>
 <circle cx="287" cy="78" r="4" fill="#ddd0a4"/><circle cx="314" cy="108" r="3" fill="#ddd0a4"/><circle cx="318" cy="76" r="2" fill="#ddd0a4"/>
 <g class="c1-moonEye"><path d="M283 94 Q300 81 317 94 Q300 106 283 94Z" fill="#fbf4df" stroke="${INK}" stroke-width="1.3"/><circle cx="300" cy="94" r="4.8" fill="${INK}"/><circle cx="301.5" cy="92.5" r="1.2" fill="#fff"/></g>
 <g filter="url(#c1-wob)">
  <path d="M0 250 Q80 220 160 236 T320 226 T400 238 V400 H0Z" fill="#3b4540"/>
  <path d="M66 306 Q74 236 60 176 Q56 150 70 128 L80 130 Q72 162 86 204 Q96 254 94 306Z" fill="#2e241a" stroke="${INK}"/>
  <path d="M70 180 Q40 160 30 130 M78 160 Q110 140 120 110 M66 210 Q36 210 18 196" stroke="#2e241a" stroke-width="6" fill="none" stroke-linecap="round"/>
  <g fill="#3f4a3c" stroke="${INK}" stroke-opacity=".6"><circle cx="58" cy="116" r="40"/><circle cx="102" cy="104" r="34"/><circle cx="28" cy="146" r="28"/><circle cx="116" cy="146" r="28"/><circle cx="76" cy="80" r="26"/></g>
  <g fill="url(#c1-h)" opacity=".8"><circle cx="70" cy="128" r="30"/><circle cx="110" cy="128" r="22"/></g>
  ${fence}
  <line x1="140" y1="264" x2="400" y2="262" stroke="${INK}" stroke-width="4"/><line x1="140" y1="284" x2="400" y2="282" stroke="${INK}" stroke-width="4"/>
  <path d="M0 290 Q200 268 400 292 V400 H0Z" fill="#5d5f45"/>
  <path d="M0 330 Q200 310 400 334 V400 H0Z" fill="url(#c1-h)" opacity=".5"/>
  <g stroke="${INK}" stroke-opacity=".6" stroke-width="1.3" fill="none"><path d="M40 330 l3 -10 l3 10"/><path d="M110 370 l3 -10 l3 10"/><path d="M340 350 l3 -10 l3 10"/><path d="M370 380 l3 -10 l3 10"/></g>
 </g>
 <g transform="translate(362 214)">
  <rect x="-2" y="-4" width="4" height="46" fill="${INK}"/>
  <rect x="-28" y="-6" width="56" height="15" fill="${OCH}" stroke="${INK}"/><text x="0" y="5" text-anchor="middle" font-size="9" font-weight="700" fill="${INK}" ${F}>马孔多</text>
  <rect x="-30" y="12" width="60" height="15" fill="#9c7a46" stroke="${INK}"/><text x="0" y="23" text-anchor="middle" font-size="9" font-weight="700" fill="${INK}" ${F}>上帝存在</text>
 </g>
 <ellipse cx="218" cy="352" rx="88" ry="10" fill="${INK}" opacity=".35"/>
 <g data-forget="cow">
  <path d="M152 296 Q138 318 146 342" stroke="${CRE}" stroke-width="4" fill="none"/><path d="M142 338 q4 10 8 0z" fill="${SEP}"/>
  <g fill="${CRE}" stroke="${INK}" stroke-width="1.3"><rect x="168" y="312" width="11" height="38"/><rect x="188" y="314" width="11" height="36"/><rect x="240" y="314" width="11" height="36"/><rect x="258" y="312" width="11" height="38"/></g>
  <g fill="${INK}"><rect x="168" y="346" width="11" height="6"/><rect x="188" y="346" width="11" height="6"/><rect x="240" y="346" width="11" height="6"/><rect x="258" y="346" width="11" height="6"/></g>
  <ellipse cx="214" cy="298" rx="64" ry="31" fill="${CRE}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M160 310 Q214 336 268 312 Q262 326 214 330 Q170 328 160 310Z" fill="url(#c1-h)" opacity=".8"/>
  <path d="M178 278 q14 -8 26 4 q-4 18 -22 14 q-10 -6 -4 -18z" fill="${SEP}"/><path d="M226 290 q16 -10 30 2 q-2 16 -18 16 q-14 -4 -12 -18z" fill="${SEP}"/><path d="M200 312 q8 -4 14 2 q-4 8 -14 -2z" fill="${SEP}"/>
  <ellipse cx="228" cy="327" rx="12" ry="7" fill="#d9a898" stroke="${INK}" stroke-width=".8"/>
  <path d="M270 252 Q258 236 266 226 M298 250 Q308 234 300 224" stroke="${CRE}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M270 252 Q258 236 266 226 M298 250 Q308 234 300 224" stroke="${INK}" stroke-width=".8" fill="none"/>
  <path d="M262 262 q-14 -4 -16 6 q8 6 18 2z" fill="${CRE}" stroke="${INK}"/>
  <ellipse cx="284" cy="274" rx="21" ry="26" fill="${CRE}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M276 258 q8 -6 16 0 q-2 10 -8 10 q-6 0 -8 -10z" fill="${SEP}"/>
  <ellipse cx="290" cy="294" rx="15" ry="11" fill="#d9a898" stroke="${INK}" stroke-width="1.2"/>
  <circle cx="285" cy="294" r="2" fill="${SEP}"/><circle cx="295" cy="294" r="2" fill="${SEP}"/>
  <g class="c1-blink"><circle cx="279" cy="270" r="3.2" fill="${INK}"/><circle cx="296" cy="270" r="3.2" fill="${INK}"/></g>
 </g>
 <g data-if="named.cow">${tag(300, 238, '奶牛', 10)}</g>
 <circle class="c1-zh" data-z="moon" cx="300" cy="92" r="34"/>
 <rect class="c1-zh" data-z="tree" x="10" y="60" width="122" height="246"/>
 <rect class="c1-zh" data-z="sign" x="330" y="204" width="64" height="58"/>
 <rect class="c1-zh" data-z="cow" x="138" y="218" width="186" height="138"/>
</svg>`;
}

function clock() {
  const R = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  const nums = R.map((t, i) => {
    const a = i * Math.PI / 6, x = 200 + Math.sin(a) * 80, y = 145 - Math.cos(a) * 80 + 5.5;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="16" fill="${INK}" ${FI}>${t}</text>`;
  }).join('');
  return `
<svg class="c1-scene" viewBox="0 0 400 400">
 <g filter="url(#c1-wob)">
  <rect width="400" height="400" fill="#d8c296"/>
  <rect width="400" height="400" fill="url(#c1-wp)"/>
  <path d="M70 160 Q70 20 200 14 Q330 20 330 160 V400 H70Z" fill="${WOOD}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M280 60 Q330 100 330 160 V400 H290 V160 Q290 100 280 60Z" fill="url(#c1-h)" opacity=".8"/>
  <path d="M84 160 Q86 34 200 28 Q314 34 316 160" fill="none" stroke="${INK}" stroke-opacity=".6" stroke-width="1.5"/>
  <circle cx="200" cy="145" r="116" fill="#5b4129" stroke="${INK}" stroke-width="1.5"/>
 </g>
 <circle cx="200" cy="145" r="108" fill="${CRE}" stroke="${INK}" stroke-width="4"/>
 <circle cx="200" cy="145" r="100" fill="none" stroke="${UMB}" stroke-width=".8"/>
 <circle cx="200" cy="145" r="62" fill="none" stroke="${UMB}" stroke-width=".6"/>
 ${spokes(200, 145, 94, 100, 60, .9, SEP)}
 ${spokes(200, 145, 90, 100, 12, 2.4, INK)}
 ${nums}
 <path d="M188 190 q12 8 24 0" stroke="${UMB}" stroke-width=".8" fill="none"/>
 <text x="200" y="118" text-anchor="middle" font-size="9" letter-spacing="2" fill="${UMB}" ${FI}>Macondo</text>
 <g id="c1-zHour"><path d="M195 152 L200 92 L205 152Z" fill="${INK}"/><path d="M200 112 l6 -8 l-6 -8 l-6 8z" fill="${INK}"/></g>
 <g id="c1-zMin"><path d="M197.5 156 L200 60 L202.5 156Z" fill="${INK}"/><path d="M200 76 l5 -8 l-5 -10 l-5 10z" fill="${INK}"/></g>
 <circle cx="200" cy="145" r="7" fill="${OCH}" stroke="${INK}" stroke-width="1.5"/>
 <rect x="104" y="268" width="192" height="26" rx="2" fill="${OCH}" stroke="${INK}" stroke-width="1.5"/>
 <text x="200" y="286" text-anchor="middle" font-size="13.5" font-weight="700" fill="${INK}" ${F}>挤奶的时辰，我便开门</text>
 <rect x="156" y="304" width="88" height="76" fill="#2b1d12" stroke="${INK}" stroke-width="2"/>
 <g data-if="clockOpen+!crankTaken">
  <path d="M176 362 L176 330 Q176 322 184 322 L222 322" stroke="${OCH}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <rect x="170" y="356" width="12" height="14" fill="${UMB}" stroke="${INK}"/><rect x="216" y="314" width="16" height="15" rx="6" fill="${WOOD2}" stroke="${INK}"/>
 </g>
 <g id="c1-zDoor">
  <rect x="160" y="308" width="80" height="68" fill="${WOOD2}" stroke="${INK}" stroke-width="2"/>
  <rect x="170" y="318" width="60" height="48" fill="none" stroke="${INK}" stroke-opacity=".6" stroke-width="1.3"/>
  <rect x="210" y="318" width="20" height="48" fill="url(#c1-h)" opacity=".7"/>
  <circle cx="228" cy="342" r="4" fill="${OCH}" stroke="${INK}" stroke-width=".8"/>
 </g>
 <circle class="c1-zh c1-drag" id="c1-zFace" data-z="face" cx="200" cy="145" r="110"/>
 <rect class="c1-zh" data-z="crank" data-if="clockOpen+!crankTaken" x="160" y="308" width="80" height="68"/>
 <rect class="c1-zh" data-z="cdoor" data-if="!clockOpen" x="160" y="308" width="80" height="68"/>
</svg>`;
}

function machine() {
  const chars = '门牛钟树河日房锅椅床盐糖镜冰鱼灯书雨骨名';
  const drums = [0, 1, 2].map(i => {
    const cx = 130 + i * 70;
    return `<g><rect x="${cx - 30}" y="334" width="60" height="48" rx="3" fill="${CRE}" stroke="${INK}" stroke-width="2"/>
      <g id="c1-drum${i}" class="c1-drumv"></g>
      <rect x="${cx - 30}" y="334" width="60" height="48" rx="3" fill="url(#c1-drumG)" pointer-events="none"/>
      <path d="M${cx - 6} 328 l6 -6 l6 6z" fill="${OCH}" stroke="${INK}" stroke-width=".8"/></g>`;
  }).join('');
  return `
<svg class="c1-scene" viewBox="0 0 400 400">
 <g filter="url(#c1-wob)">
  <rect width="400" height="400" fill="#d8c296"/>
  <rect width="400" height="300" fill="url(#c1-wp)"/>
  <rect y="300" width="400" height="100" fill="#8b6944"/>
  <rect y="300" width="400" height="30" fill="url(#c1-hx)" opacity=".7"/>
  <path d="M150 262 L118 400 M250 262 L282 400" stroke="${SEP}" stroke-width="16" stroke-linecap="round"/>
 </g>
 <g id="c1-zWheel">
  <circle cx="200" cy="160" r="132" fill="${WOOD}" stroke="${INK}" stroke-width="3"/>
  <circle cx="200" cy="160" r="98" fill="#5b4129" stroke="${INK}" stroke-width="2"/>
  <circle cx="200" cy="160" r="98" fill="url(#c1-hf)" opacity=".6"/>
  ${spokes(200, 160, 24, 98, 8, 9, WOOD)}
  ${cards(200, 160, 116, 20, 21, 30, chars)}
 </g>
 <circle cx="200" cy="160" r="25" fill="${OCH}" stroke="${INK}" stroke-width="2"/>
 <rect x="192" y="152" width="16" height="16" fill="${INK}"/>
 <g id="c1-zCrank" data-if="crankAttached">
  <path d="M200 160 L266 160" stroke="${OCH}" stroke-width="10" stroke-linecap="round"/>
  <path d="M200 160 L266 160" stroke="${INK}" stroke-width="1"/>
  <rect x="257" y="142" width="18" height="36" rx="8" fill="${WOOD2}" stroke="${INK}" stroke-width="1.5"/>
  <circle cx="200" cy="160" r="11" fill="#d9b86a" stroke="${INK}" stroke-width="1.5"/>
 </g>
 <rect x="106" y="298" width="188" height="24" rx="2" fill="${OCH}" stroke="${INK}" stroke-width="1.5"/>
 <text x="200" y="315" text-anchor="middle" font-size="13" font-weight="700" fill="${INK}" ${F}>以骨之声 · 唤醒名字</text>
 ${drums}
 <circle class="c1-zh c1-drag" id="c1-mDrag" data-z="wheel" cx="200" cy="160" r="134"/>
 <rect class="c1-zh" data-z="drum0" x="98" y="318" width="64" height="66"/>
 <rect class="c1-zh" data-z="drum1" x="168" y="318" width="64" height="66"/>
 <rect class="c1-zh" data-z="drum2" x="238" y="318" width="64" height="66"/>
 <g id="c1-mCard" class="c1-mcard" data-z="card">
  <rect x="96" y="96" width="208" height="124" fill="${CRE}" stroke="${INK}" stroke-width="1.5" filter="url(#c1-soft)"/>
  <rect x="104" y="104" width="192" height="108" fill="none" stroke="${UMB}" stroke-width=".8"/>
  <text id="c1-mCardSub" x="200" y="128" text-anchor="middle" font-size="11" letter-spacing="3" fill="${UMB}" ${F}>记 忆 卡 片</text>
  <text id="c1-mCardText" x="200" y="174" text-anchor="middle" font-size="25" font-weight="700" fill="${INK}" ${F}>……</text>
  <text x="200" y="200" text-anchor="middle" font-size="10" fill="${UMB}" ${F}>（点击收起）</text>
 </g>
</svg>`;
}

function sack() {
  return `
<svg class="c1-scene" viewBox="0 0 400 400">
 <g filter="url(#c1-wob)">
  <rect width="400" height="400" fill="#8b6944"/>
  <g stroke="${INK}" stroke-opacity=".55" stroke-width="2"><line x1="0" y1="90" x2="400" y2="96"/><line x1="0" y1="190" x2="400" y2="198"/><line x1="0" y1="300" x2="400" y2="310"/></g>
  <rect width="400" height="400" fill="url(#c1-hf)" opacity=".35"/>
  <path d="M0 0 H130 Q110 70 0 92 Z" fill="${VER}" stroke="${INK}" stroke-width="1.5"/>
  <path d="M0 0 H130 Q110 70 0 92 Z" fill="url(#c1-h)" opacity=".6"/>
 </g>
 <ellipse cx="200" cy="338" rx="110" ry="14" fill="${INK}" opacity=".4"/>
 <g id="c1-sackG">
  <path d="M176 152 L156 86" stroke="${CRE}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="152" cy="82" r="8" fill="${CRE}" stroke="${INK}"/><circle cx="162" cy="78" r="7" fill="${CRE}" stroke="${INK}"/>
  <path d="M222 152 L246 96" stroke="${CRE}" stroke-width="10" stroke-linecap="round"/>
  <circle cx="248" cy="90" r="7" fill="${CRE}" stroke="${INK}"/><circle cx="240" cy="88" r="6" fill="${CRE}" stroke="${INK}"/>
  <path d="M182 160 Q180 118 204 114 Q228 118 226 160Z" fill="${CRE}" stroke="${INK}" stroke-width="1.3"/>
  <ellipse cx="196" cy="136" rx="6" ry="7" fill="${INK}"/><ellipse cx="214" cy="136" rx="6" ry="7" fill="${INK}"/>
  <path d="M203 146 l2 6 l2 -6z" fill="${INK}"/>
  <path d="M118 330 Q96 238 136 170 Q156 142 200 140 Q244 142 264 170 Q304 238 282 330 Q200 352 118 330Z" fill="#b39a6c" stroke="${INK}" stroke-width="2.5"/>
  <path d="M232 150 Q300 238 282 330 Q262 338 240 340 Q270 250 232 150Z" fill="url(#c1-h)" opacity=".8"/>
  <g stroke="${SEP}" stroke-width="1" opacity=".55"><path d="M130 220 L270 214"/><path d="M122 260 L280 256"/><path d="M124 300 L278 298"/><path d="M160 170 L150 330"/><path d="M200 150 L200 340"/><path d="M240 170 L252 330"/></g>
  <path d="M214 250 l40 -6 l4 36 l-40 6z" fill="#9c8256" stroke="${INK}" stroke-width="1.3"/>
  <path d="M218 254 l4 4 M226 252 l4 4 M234 250 l4 4 M244 248 l4 4" stroke="${INK}" stroke-width="1.2"/>
  <path d="M146 170 Q200 192 254 170" stroke="${SEP}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M200 182 q-8 20 -18 30 M204 182 q8 18 22 26" stroke="${SEP}" stroke-width="5" fill="none" stroke-linecap="round"/>
 </g>
 <g id="c1-sackClk"></g>
 <g id="c1-sackDots"></g>
 <rect class="c1-zh" data-z="bag" x="96" y="70" width="210" height="282"/>
</svg>`;
}

/* ---------------- 物品图标（60x60，棕褐墨线） ---------------- */
const quill = `<path d="M14 50 Q22 30 46 8 Q49 21 38 32 Q28 42 16 50Z" fill="${CRE}" stroke="${INK}" stroke-width="1.2"/><path d="M14 50 Q28 30 46 8 M30 30 l-6 -2 M26 36 l-6 -1 M36 24 l-5 -3" stroke="${UMB}" stroke-width=".8" fill="none"/>`;
const bottle = (body, extra = '') => `<path d="M18 52 L16 32 Q16 23 26 23 H34 Q44 23 44 32 L42 52Z" fill="${body}" stroke="${INK}" stroke-width="1.5"/><rect x="24" y="14" width="12" height="10" fill="${UMB}" stroke="${INK}" stroke-width="1.2"/>${extra}`;
const ICONS = {
  labels: `<svg viewBox="0 0 60 60"><path d="M12 15 H44 L48 19 V40 H12Z" fill="#e6d9b6" stroke="${INK}" stroke-width="1.2" transform="rotate(-9 30 28)"/><path d="M14 22 H46 L50 26 V47 H14Z" fill="${CRE}" stroke="${INK}" stroke-width="1.2" transform="rotate(5 32 34)"/><circle cx="21" cy="34" r="2.2" fill="none" stroke="${INK}"/><path d="M21 34 Q10 44 9 54" stroke="${RED}" stroke-width="1.6" fill="none"/></svg>`,
  quill: `<svg viewBox="0 0 60 60">${quill}<path d="M14 50 L10 56" stroke="${UMB}" stroke-width="2"/></svg>`,
  inkDry: `<svg viewBox="0 0 60 60">${bottle('#8d877a', `<path d="M19 46 H41" stroke="${SEP}" stroke-width="6" opacity=".6"/><path d="M24 30 l4 6 l-3 4 M36 28 l-2 6" stroke="${INK}" stroke-width=".8"/>`)}</svg>`,
  jug: `<svg viewBox="0 0 60 60"><path d="M20 53 Q11 40 18 28 L20 17 H40 L42 28 Q49 40 40 53Z" fill="#a86a42" stroke="${INK}" stroke-width="1.5"/><path d="M34 22 Q46 36 38 52" fill="url(#c1-h)" opacity=".8"/><ellipse cx="30" cy="17" rx="10" ry="3" fill="${SEP}" stroke="${INK}"/><path d="M42 23 Q53 26 46 39" stroke="${INK}" stroke-width="2.5" fill="none"/></svg>`,
  ink: `<svg viewBox="0 0 60 60">${bottle('#3a3a34', `<path d="M17 40 H43 L42 52 H18Z" fill="${INK}"/><path d="M21 31 V45" stroke="${CRE}" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>`)}</svg>`,
  pen: `<svg viewBox="0 0 60 60">${quill}<path d="M14 50 L9 57" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="58" r="1.8" fill="${INK}"/></svg>`,
  rooster: `<svg viewBox="0 0 60 60"><line x1="30" y1="38" x2="30" y2="57" stroke="${CRE}" stroke-width="3" stroke-linecap="round"/><line x1="30" y1="38" x2="30" y2="57" stroke="${INK}" stroke-width=".6"/><path d="M18 34 Q14 22 24 18 L24 11 L28 15 L31 9 L33 15 L37 11 L37 19 Q46 22 44 32 Q50 23 53 29 Q51 40 40 40 H22 Q16 40 18 34Z" fill="#b0473a" stroke="${INK}" stroke-width="1.2"/><circle cx="28" cy="24" r="1.8" fill="${CRE}"/><path d="M21 25 L15 27 L21 29Z" fill="${OCH}" stroke="${INK}" stroke-width=".6"/></svg>`,
  crank: `<svg viewBox="0 0 60 60"><path d="M15 47 L15 22 Q15 15 22 15 L44 15" stroke="${OCH}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M15 47 L15 22 Q15 15 22 15 L44 15" stroke="${INK}" stroke-width=".8" fill="none"/><rect x="9" y="43" width="12" height="12" fill="${UMB}" stroke="${INK}"/><rect x="40" y="6" width="15" height="18" rx="7" fill="${WOOD2}" stroke="${INK}" stroke-width="1.2"/></svg>`,
  potion: `<svg viewBox="0 0 60 60"><circle cx="30" cy="38" r="22" fill="url(#c1-lamp)"/><path d="M25 12 H35 V22 Q45 28 45 40 Q45 53 30 53 Q15 53 15 40 Q15 28 25 22Z" fill="#f2d27a" stroke="${INK}" stroke-width="1.2"/><rect x="24" y="6" width="12" height="7" fill="${UMB}" stroke="${INK}"/><path d="M20 38 Q30 43 40 38" stroke="#fff6cc" stroke-width="2" fill="none"/></svg>`
};

/* ---------------- 命名页里“记不清”的模样 ---------------- */
const PREVIEW = {
  lamp: `<svg viewBox="0 0 100 100"><g filter="url(#c1-forget)"><circle cx="50" cy="40" r="26" fill="url(#c1-lamp)"/><ellipse cx="50" cy="86" rx="22" ry="5" fill="${OCH}" stroke="${INK}"/><path d="M34 86 Q30 70 40 62 H60 Q70 70 66 86Z" fill="#c09a58" stroke="${INK}"/><path d="M40 58 Q32 40 44 26 Q50 18 56 26 Q68 40 60 58Z" fill="#fff8e6" fill-opacity=".4" stroke="${INK}"/><ellipse cx="50" cy="44" rx="5" ry="11" fill="#f6c766"/></g></svg>`,
  jar: `<svg viewBox="0 0 100 100"><g filter="url(#c1-forget)">${rooster(40, 70, '#b0473a', 1.6)}${rooster(62, 64, '#c9a24a', 1.4, 10)}${rooster(50, 46, VER, 1.3)}<path d="M28 88 Q20 86 20 72 V30 Q20 20 30 18 H70 Q80 20 80 30 V72 Q80 86 72 88Z" fill="url(#c1-glass)" stroke="${INK}" stroke-width="1.5"/><rect x="26" y="8" width="48" height="12" rx="3" fill="${WOOD2}" stroke="${INK}"/></g></svg>`,
  clock: `<svg viewBox="0 0 100 100"><g filter="url(#c1-forget)"><circle cx="50" cy="50" r="40" fill="${CRE}" stroke="${INK}" stroke-width="5"/>${spokes(50, 50, 30, 36, 12, 2, INK)}<path d="M48 54 L50 26 L52 54Z" fill="${INK}"/><path d="M48 52 L66 44 L50 56Z" fill="${INK}"/><circle cx="50" cy="50" r="3" fill="${OCH}"/></g></svg>`,
  cow: `<svg viewBox="0 0 100 100"><g filter="url(#c1-forget)"><path d="M30 30 Q20 14 28 8 M70 30 Q80 14 72 8" stroke="${INK}" stroke-width="2" fill="none"/><ellipse cx="50" cy="48" rx="26" ry="30" fill="${CRE}" stroke="${INK}" stroke-width="1.6"/><path d="M38 30 q12 -8 24 0 q-2 12 -12 12 q-10 0 -12 -12z" fill="${SEP}"/><ellipse cx="50" cy="72" rx="18" ry="12" fill="#d9a898" stroke="${INK}"/><circle cx="44" cy="72" r="2.5" fill="${SEP}"/><circle cx="56" cy="72" r="2.5" fill="${SEP}"/><circle cx="40" cy="46" r="4" fill="${INK}"/><circle cx="60" cy="46" r="4" fill="${INK}"/></g></svg>`
};

export const ART = { DEFS, FRAME, main, drawer, yard, clock, machine, sack, ICONS, PREVIEW, tag, INK };
