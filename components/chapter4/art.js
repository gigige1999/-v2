/* =========================================================
   第四章美术 — 梅尔基亚德斯的木轴（单一场景 400 x 400）
   木轴、羊皮带、铜轮都由引擎按粗细/转角实时绘制，这里只放静态部分
   ========================================================= */
const INK = '#2b1d12', RED = '#8a2a1c';
export const CY = 176;

function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

const DEFS = `<defs>
  <linearGradient id="c4-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a2a"/><stop offset=".28" stop-color="#b48656"/><stop offset=".55" stop-color="#8a6038"/><stop offset="1" stop-color="#3e2a16"/></linearGradient>
  <linearGradient id="c4-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5a24"/><stop offset=".3" stop-color="#e3c27a"/><stop offset=".6" stop-color="#b58a3e"/><stop offset="1" stop-color="#5a3e14"/></linearGradient>
  <linearGradient id="c4-cyl" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b1d12" stop-opacity=".55"/><stop offset=".22" stop-color="#2b1d12" stop-opacity=".08"/>
    <stop offset=".36" stop-color="#fff8e6" stop-opacity=".28"/><stop offset=".55" stop-color="#2b1d12" stop-opacity="0"/>
    <stop offset=".85" stop-color="#2b1d12" stop-opacity=".22"/><stop offset="1" stop-color="#2b1d12" stop-opacity=".6"/></linearGradient>
  <radialGradient id="c4-glow"><stop offset="0" stop-color="#f6dc9a" stop-opacity=".55"/><stop offset="1" stop-color="#f6dc9a" stop-opacity="0"/></radialGradient>
</defs>`;

/* 背景：一座圆形迷宫（时间的轮子），淡淡地刻在纸上 */
function labyrinth() {
  const r = rng(41), cx = 200, cy = CY;
  let d = '';
  for (let k = 0; k < 9; k++) {
    const R = 46 + k * 17, gap = r() * Math.PI * 2, g = .32 + r() * .2;
    const a0 = gap + g, a1 = gap + Math.PI * 2;
    d += `M${(cx + R * Math.cos(a0)).toFixed(1)} ${(cy + R * Math.sin(a0)).toFixed(1)} A${R} ${R} 0 1 1 ${(cx + R * Math.cos(a1)).toFixed(1)} ${(cy + R * Math.sin(a1)).toFixed(1)} `;
    if (k < 8) for (let w = 0; w < 2; w++) {
      const a = r() * Math.PI * 2;
      d += `M${(cx + R * Math.cos(a)).toFixed(1)} ${(cy + R * Math.sin(a)).toFixed(1)} L${(cx + (R + 17) * Math.cos(a)).toFixed(1)} ${(cy + (R + 17) * Math.sin(a)).toFixed(1)} `;
    }
  }
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity=".13" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="6" fill="${INK}" fill-opacity=".12"/>`;
}

function arrows(id, x, y) {
  return `<g id="${id}" class="c4-arrows" transform="translate(${x} ${y})">
    <path d="M0 -14 l-5 6 h10Z M0 14 l-5 -6 h10Z" fill="${RED}"/><path d="M0 -8 V8" stroke="${RED}" stroke-width="1.4"/></g>`;
}

function main() {
  return `<svg id="c4-main" class="c1-scene" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="400" height="400" fill="#e3d2a8" opacity=".45"/>
  ${labyrinth()}
  <ellipse id="c4-shadow" cx="200" cy="260" rx="170" ry="6" fill="${INK}" opacity=".16"/>
  <g id="c4-rod"></g>
  <g id="c4-strip"></g>
  <rect id="c4-shade" fill="url(#c4-cyl)" pointer-events="none"/>
  <g id="c4-text" pointer-events="none"></g>
  <g pointer-events="none">
    <path d="M8 ${CY + 20} Q200 ${CY + 24} 392 ${CY + 20}" stroke="${RED}" stroke-width="1.1" fill="none" opacity=".75"/>
    <circle cx="8" cy="${CY + 20}" r="2.2" fill="${RED}"/><circle cx="392" cy="${CY + 20}" r="2.2" fill="${RED}"/>
  </g>
  <g id="c4-wheel"></g>
  <g id="c4-cap"></g>
  <rect id="c4-hitSpin" class="c4-hit c4-spin" data-hot="spin"/>
  <rect id="c4-hitKnob" class="c4-hit c4-knob" data-hot="knob"/>
  ${arrows('c4-arKnob', 46, CY)}
  ${arrows('c4-arSpin', 200, CY - 80)}
  <rect id="c4-glowR" x="20" y="${CY - 40}" width="360" height="80" fill="url(#c4-glow)" opacity="0" pointer-events="none"/>
</svg>`;
}

/* 最后一页 */
function sheet(lines) {
  return `<div class="c1-sh-k">LA RUEDA GIRATORIA</div>
   <div class="c1-sh-h">转动的轮子</div>
   <div class="c4-poem">${lines.map((l, i) => `<p style="animation-delay:${.4 + i * .9}s">${l}</p>`).join('')}</div>
   <div class="c4-quote">“好像时间在兜圈子，<br/>我们又回到了开头。”</div>
   <div class="c4-sig">—— 乌尔苏拉</div>`;
}

export const ART4 = { DEFS, main, sheet };
