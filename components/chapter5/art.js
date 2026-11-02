/* =========================================================
   第五章美术 — 上校的作坊（单一场景 400 x 400，无人物）
   左：风箱  中：炭炉 + 坩埚  右：两半合起来的鱼模 + 夹子
   会动的部分只放空组/带 id 的元素，由引擎每帧摆位置
   ========================================================= */
const INK = '#2b1d12', RED = '#8a2a1c', IRON = '#4a4038', IRON2 = '#6b5f52', WOOD = '#8a6038', WOOD2 = '#5e3f22', LEATH = '#7a4a2a';

export const GEO = {
  hinge: [172, 272], boardL: 118, bx0: 48,               // 风箱上板：绕铰点转，左端是把手
  pivot: [274, 176],                            // 坩埚绕右唇转
  sprue: [298, 232],                            // 模子顶上的浇口
  seam: 298, moldY0: 238, moldY1: 300,
  lever: [340, 266], leverL: 30,                // 夹子的杠杆
};

const DEFS = `<defs>
  <linearGradient id="c5-iron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a6e60"/><stop offset=".45" stop-color="${IRON2}"/><stop offset="1" stop-color="#3a322b"/></linearGradient>
  <linearGradient id="c5-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87a4a"/><stop offset="1" stop-color="${WOOD2}"/></linearGradient>
  <linearGradient id="c5-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".45" stop-color="#f2c045"/><stop offset="1" stop-color="#b8741c"/></linearGradient>
  <radialGradient id="c5-glow"><stop offset="0" stop-color="#ffb347" stop-opacity=".85"/><stop offset=".5" stop-color="#ff7a1a" stop-opacity=".3"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
  <radialGradient id="c5-cglow"><stop offset="0" stop-color="#fff2b0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  <clipPath id="c5-fishClip">${fishPath(298, 257)}${fishPath(298, 283)}</clipPath>
</defs>`;

function fishPath(cx, cy, s = 1) {
  // 一条朝右的小鱼：身体 + 分叉的尾巴
  const p = (x, y) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  return `<path d="M${p(-24, 0)} L${p(-30, -7)} L${p(-27, 0)} L${p(-30, 7)} Z M${p(-22, 0)} C${p(-14, -9)} ${p(8, -10)} ${p(22, 0)} C${p(8, 10)} ${p(-14, 9)} ${p(-22, 0)} Z"/>`;
}

function arrows(id, x, y, rot = 0) {
  return `<g id="${id}" class="c5-arrows" transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M0 -15 l-5 6 h10Z M0 15 l-5 -6 h10Z" fill="${RED}"/><path d="M0 -9 V9" stroke="${RED}" stroke-width="1.4"/></g>`;
}

/* 一只淡淡的手（昨天的你） */
function ghostHand(id) {
  return `<g id="${id}" class="c5-ghost" opacity="0" pointer-events="none"><g transform="translate(-11 -6)">
    <path d="M4 10 C2 4 6 0 10 1 L22 3 C25 4 25 8 22 9 L15 9 L24 10 C27 11 27 15 24 15 L15 15 L22 16 C25 17 25 21 22 21 L14 21 L19 22 C22 23 21 27 18 27 L9 26 C4 25 3 18 4 10 Z"
      fill="#fbf4e2" fill-opacity=".72" stroke="${INK}" stroke-opacity=".55" stroke-width=".9" stroke-dasharray="2.2 1.6"/>
    <path d="M6 11 C4 6 1 5 -2 7 C-3 9 0 11 4 14" fill="#fbf4e2" fill-opacity=".72" stroke="${INK}" stroke-opacity=".55" stroke-width=".9" stroke-dasharray="2.2 1.6"/>
  </g></g>`;
}

function main() {
  const [hx, hy] = GEO.hinge, L = GEO.boardL, [px, py] = GEO.pivot, [lx, ly] = GEO.lever, LL = GEO.leverL, sx = GEO.seam;
  return `<svg id="c5-main" class="c1-scene" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="400" height="400" fill="#e3d2a8" opacity=".42"/>
  <g stroke="${INK}" stroke-opacity=".07" stroke-width="1">${[60, 130, 200].map(y => `<path d="M0 ${y} H400"/>`).join('')}</g>

  <!-- 窗：太阳从左走到右，就是一天 -->
  <g>
    <rect id="c5-sky" x="30" y="40" width="80" height="80" fill="#f3e6c2"/>
    <circle id="c5-sun" cx="40" cy="100" r="9" fill="#f2c96a" stroke="${INK}" stroke-width="1"/>
    <path id="c5-moon" d="M86 62 a10 10 0 1 0 8 14 a8 8 0 1 1 -8 -14Z" fill="#f4ebd5" stroke="${INK}" stroke-width="1" opacity="0"/>
    <rect x="30" y="40" width="80" height="80" fill="none" stroke="${WOOD2}" stroke-width="5"/>
    <path d="M70 40 V120 M30 80 H110" stroke="${WOOD2}" stroke-width="3"/>
    <rect x="24" y="120" width="92" height="6" fill="${WOOD}" stroke="${INK}" stroke-width="1"/>
  </g>

  <!-- 架子：铁皮盒 + 蜡烛（蜡烛就是这一天的长度） -->
  <g>
    <rect x="284" y="118" width="108" height="6" fill="${WOOD}" stroke="${INK}" stroke-width="1"/>
    <path d="M296 124 l-4 16 M380 124 l4 16" stroke="${WOOD2}" stroke-width="3"/>
    <rect x="296" y="98" width="38" height="20" rx="2" fill="url(#c5-iron)" stroke="${INK}" stroke-width="1"/>
    <path d="M296 103 H334" stroke="${INK}" stroke-opacity=".5"/>
    <g transform="translate(315 111) scale(.42)" fill="#d9a840" stroke="${INK}" stroke-width="1.6">${fishPath(0, 0)}</g>
    <ellipse cx="362" cy="117" rx="14" ry="3" fill="${IRON2}" stroke="${INK}" stroke-width="1"/>
    <rect id="c5-wax" x="356" y="78" width="12" height="38" fill="#f4ebd5" stroke="${INK}" stroke-width="1"/>
    <path id="c5-wick" d="M362 78 v-4" stroke="${INK}" stroke-width="1.2"/>
    <g id="c5-flame" opacity="0"><circle id="c5-halo" cx="362" cy="68" r="16" fill="url(#c5-cglow)"/>
      <path d="M362 60 C366 66 366 72 362 74 C358 72 358 66 362 60Z" fill="#ffcf5a" stroke="${INK}" stroke-width=".8"/></g>
    <rect id="c5-hitCandle" class="c5-hit c5-tap" data-hot="candle" x="336" y="50" width="52" height="72"/>
  </g>

  <!-- 工作台 -->
  <rect x="0" y="300" width="400" height="14" fill="url(#c5-wood)" stroke="${INK}" stroke-width="1.2"/>
  <path d="M24 314 V360 M376 314 V360" stroke="${WOOD2}" stroke-width="9"/>
  <ellipse id="c5-puddle" cx="${sx}" cy="301" rx="0" ry="2.2" fill="#c98f2a" stroke="${INK}" stroke-width=".6"/>

  <!-- 风箱 -->
  <g>
    <path d="M${GEO.bx0} 292 L${hx} 284 L${hx} 292 L${GEO.bx0} 300 Z" fill="url(#c5-wood)" stroke="${INK}" stroke-width="1.2"/>
    <path id="c5-leather" fill="${LEATH}" stroke="${INK}" stroke-width="1"/>
    <path id="c5-pleats" fill="none" stroke="${INK}" stroke-opacity=".55" stroke-width=".9"/>
    <path d="M${hx - 4} 274 L${hx + 32} 276 L${hx + 32} 282 L${hx - 4} 286 Z" fill="url(#c5-iron)" stroke="${INK}" stroke-width="1"/>
    <g id="c5-bTop">
      <path d="M${hx - L} ${hy - 6} L${hx + 2} ${hy - 4} L${hx + 2} ${hy + 2} L${hx - L} ${hy + 2} Z" fill="url(#c5-wood)" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="${hx - 56}" cy="${hy - 2}" r="7" fill="none" stroke="${INK}" stroke-opacity=".45"/>
      <path d="M${hx - L} ${hy - 1} H${hx - L - 12}" stroke="${WOOD2}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${hx - L - 17}" cy="${hy - 1}" r="6" fill="none" stroke="${INK}" stroke-width="2.2"/>
      <circle id="c5-hitB" class="c5-hit c5-ns" data-hot="b" cx="${hx - L - 10}" cy="${hy - 1}" r="28"/>
    </g>
    <g id="c5-puff" opacity="0" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="1"><path d="M206 270 q8 -6 4 -14 M214 274 q10 -4 10 -14"/></g>
  </g>

  <!-- 炭炉 -->
  <g>
    <circle id="c5-heat" cx="236" cy="226" r="60" fill="url(#c5-glow)" opacity="0"/>
    <path d="M206 214 H266 L262 300 H210 Z" fill="#6a4a36" stroke="${INK}" stroke-width="1.3"/>
    <g stroke="${INK}" stroke-opacity=".35" stroke-width=".8"><path d="M208 236 H264 M209 258 H263 M210 280 H262 M226 214 V236 M246 236 V258 M226 258 V280 M246 280 V300"/></g>
    <path d="M222 268 Q236 252 250 268 V288 H222 Z" fill="#2a1a10" stroke="${INK}" stroke-width="1"/>
    <path id="c5-fire" d="M226 288 Q228 274 232 280 Q236 264 240 278 Q244 270 246 288 Z" fill="#ff8a2a" opacity=".15"/>
    <path id="c5-coals" d="M204 214 Q214 206 224 212 Q236 204 248 212 Q258 206 268 214 Z" fill="#3a2a22" stroke="${INK}" stroke-width="1"/>
  </g>

  <!-- 坩埚（连着长柄，一起绕右唇转） -->
  <g id="c5-cru">
    <path d="M222 188 L${px - 108} ${py - 44}" stroke="${IRON}" stroke-width="5" stroke-linecap="round"/>
    <path d="M${px - 108} ${py - 44} L${px - 128} ${py - 52}" stroke="${WOOD2}" stroke-width="9" stroke-linecap="round"/>
    <path d="M226 ${py} H${px + 2} L${px - 6} 212 Q${px - 24} 220 ${px - 42} 212 Z" fill="url(#c5-iron)" stroke="${INK}" stroke-width="1.3"/>
    <path id="c5-goldIn" d="M230 ${py + 5} H${px - 3} L${px - 8} 206 Q${px - 24} 212 ${px - 40} 206 Z" fill="#8a6a2a" stroke="${INK}" stroke-width=".6"/>
    <path d="M224 ${py} H${px + 4}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    <circle id="c5-hitT" class="c5-hit c5-ns" data-hot="t" cx="${px - 120}" cy="${py - 48}" r="26"/>
  </g>
  <path id="c5-stream" fill="none" stroke="#f2b83a" stroke-width="3.6" stroke-linecap="round" opacity="0"/>
  <path id="c5-leak" fill="none" stroke="#e0a030" stroke-width="2.2" stroke-linecap="round" opacity="0"/>

  <!-- 鱼模：左半固定，右半被夹子推紧 -->
  <g>
    <rect x="262" y="${GEO.moldY0}" width="${sx - 262}" height="${GEO.moldY1 - GEO.moldY0}" fill="url(#c5-iron)" stroke="${INK}" stroke-width="1.2"/>
    <g fill="#2e2620" stroke="${INK}" stroke-width=".8" opacity=".9">${fishPath(298, 257)}${fishPath(298, 283)}</g>
    <rect id="c5-fill" x="262" y="300" width="72" height="0" fill="url(#c5-gold)" clip-path="url(#c5-fishClip)"/>
    <g id="c5-moldR">
      <rect x="${sx}" y="${GEO.moldY0}" width="${334 - sx}" height="${GEO.moldY1 - GEO.moldY0}" fill="url(#c5-iron)" stroke="${INK}" stroke-width="1.2" fill-opacity=".9"/>
      <g fill="none" stroke="${INK}" stroke-width=".8" opacity=".6" clip-path="url(#c5-rClip)">${fishPath(298, 257)}${fishPath(298, 283)}</g>
      <path d="M334 254 H344 M334 284 H344" stroke="${IRON}" stroke-width="4"/>
    </g>
    <clipPath id="c5-rClip"><rect x="${sx}" y="230" width="40" height="80"/></clipPath>
    <path d="M286 228 H310 L302 ${GEO.moldY0 + 1} H294 Z" fill="url(#c5-iron)" stroke="${INK}" stroke-width="1"/>
  </g>

  <!-- 夹子 -->
  <g>
    <path d="M${lx - 2} 300 V${ly}" stroke="${IRON}" stroke-width="5"/>
    <g id="c5-lever">
      <path d="M${lx - 8} ${ly} H${lx + LL}" stroke="${IRON}" stroke-width="5" stroke-linecap="round"/>
      <rect x="${lx + LL - 4}" y="${ly - 5}" width="18" height="10" rx="4" fill="url(#c5-wood)" stroke="${INK}" stroke-width="1"/>
      <circle id="c5-hitC" class="c5-hit c5-ns" data-hot="c" cx="${lx + LL + 4}" cy="${ly}" r="26"/>
    </g>
    <circle cx="${lx}" cy="${ly}" r="3.4" fill="#b58a3e" stroke="${INK}"/>
  </g>

  <!-- 成品：开模后的两条小金鱼 -->
  <g id="c5-fishes" opacity="0" pointer-events="none">
    ${[[255, 0], [282, 1]].map(([y, i]) => `<g class="c5-done" style="animation-delay:${i * .25}s">
      <g fill="url(#c5-gold)" stroke="${INK}" stroke-width="1">${fishPath(298, y, 1.05)}</g>
      <circle cx="${298 + 12}" cy="${y - 2}" r="2.2" fill="#b0141c" stroke="${INK}" stroke-width=".5"/>
      <path d="M${298 - 6} ${y - 5} q3 5 0 10 M${298} ${y - 6} q3 6 0 12" fill="none" stroke="${INK}" stroke-opacity=".45" stroke-width=".7"/></g>`).join('')}
  </g>

  ${ghostHand('c5-gB')}${ghostHand('c5-gT')}${ghostHand('c5-gC')}
  ${arrows('c5-arB', 38, 228)}
  ${arrows('c5-arT', 150, 96)}
  ${arrows('c5-arC', 376, 232)}
  <g id="c5-arCandle" class="c5-arrows" transform="translate(362 40)"><path d="M0 8 l-6 -8 h12Z" fill="${RED}"/></g>
  <rect id="c5-night" x="0" y="0" width="400" height="400" fill="#1c140e" opacity="0" pointer-events="none"/>
</svg>`;
}

/* 最后一页 */
function sheet() {
  return `<div class="c1-sh-k">LOS PESCADITOS DE ORO</div>
   <div class="c1-sh-h">小金鱼</div>
   <svg class="c5-pair" viewBox="0 0 120 40">
     <g fill="url(#c5-gold)" stroke="${INK}" stroke-width="1">${fishPath(34, 20, .9)}${fishPath(88, 20, .9)}</g>
     <circle cx="45" cy="18" r="1.8" fill="#b0141c"/><circle cx="99" cy="18" r="1.8" fill="#b0141c"/></svg>
   <div class="c5-poem">${['每天做两条，', '凑满二十五条，', '就放回坩埚里熔掉，', '第二天，从头再做。'].map((l, i) => `<p style="animation-delay:${.4 + i * .9}s">${l}</p>`).join('')}</div>
   <div class="c5-quote">“安享晚年的秘诀，<br/>不过是与孤独签下一个体面的协定。”</div>
   <div class="c5-sig">—— 奥雷里亚诺·布恩迪亚上校</div>`;
}

export const ART5 = { DEFS, main, sheet };
