/* =========================================================
   书页引擎美术工具箱：版画框 FRAME、共享 <defs>、调色板与小部件
   画风：纸 + 墨线 + 交叉排线 + 低饱和土色块，场景整体 mix-blend-mode:multiply 叠在纸上
   坐标约定：主场景 viewBox 800×800；特写 400×400；物品图标 60×60
   ========================================================= */

// 墨色跟随纸张主题（.bk-root 的 color = var(--pp-ink)），其余为可叠乘的土色
export const INK = 'currentColor';
export const PAL = {
  sep: '#5a3e24',   // 次墨（辅助线）
  umb: '#7a5a38',   // 赭褐
  och: '#b08a4a',   // 赭黄（金属、灯火）
  cre: '#f4ebd5',   // 奶白（纸片、标签、高光）
  red: '#8a3a28',   // 朱（重点物件，一个画面只用 1~2 处）
  wood: '#8a6440', wood2: '#a27c4f',
  wall: '#d8c296', floor: '#8b6944',
  night: '#2f3a3a', glass: '#c9d2c4',
};
export const F = 'font-family="Cormorant Garamond, Songti SC, STSong, Noto Serif SC, serif"';
export const FI = 'font-family="Cormorant Garamond, Playfair Display, serif" font-style="italic"';

const corner = (x, y, sx, sy) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})" fill="none" stroke="${INK}">
  <path d="M0 26 V0 H26" stroke-width="1.2"/><path d="M5 20 Q5 5 20 5" stroke-width=".7"/>
  <circle cx="9.5" cy="9.5" r="2.2" fill="${INK}" stroke="none"/>
  <path d="M15 1.5 q5 5 11 0 M1.5 15 q5 5 0 11" stroke-width=".7"/></g>`;

/** 书页内的版画框：viewBox 400×432，图版区 18..382，底部 404 处写图注 cap */
export function FRAME(cap, plate = true) {
  return `<svg class="bk-frame" viewBox="0 0 400 432" preserveAspectRatio="none" aria-hidden="true">
    <rect x="7" y="7" width="386" height="418" fill="none" stroke="${INK}" stroke-opacity=".7" stroke-width="1.2"/>
    ${plate ? `<rect x="14" y="14" width="372" height="372" fill="none" stroke="${INK}" stroke-opacity=".4" stroke-width=".7"/>` : ''}
    ${corner(3, 3, 1, 1)}${corner(397, 3, -1, 1)}${corner(3, 429, 1, -1)}${corner(397, 429, -1, -1)}
    <text x="200" y="404" text-anchor="middle" font-size="11" letter-spacing="2.4" fill="${INK}" fill-opacity=".72" ${FI}>${cap}</text>
  </svg>`;
}

/** 共享 defs：排线 bk-h / bk-hx（交叉）/ bk-hf（细）、墙纸 bk-wp、
 *  滤镜 bk-wob（手绘抖动）/ bk-glow（发光）/ bk-soft（投影）/ bk-forget（溶解模糊，用于"被遗忘/未解锁"的物件）
 *  渐变 bk-lamp（暖光）/ bk-night（夜空） */
export const DEFS = `<defs>
  <pattern id="bk-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="1" stroke-opacity=".55"/></pattern>
  <pattern id="bk-hx" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0V6M0 0H6" stroke="${INK}" stroke-width=".9" stroke-opacity=".5"/></pattern>
  <pattern id="bk-hf" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)"><line x1="0" y1="0" x2="0" y2="4" stroke="${INK}" stroke-width=".7" stroke-opacity=".45"/></pattern>
  <pattern id="bk-wp" width="44" height="58" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="0" y2="58" stroke="${PAL.umb}" stroke-opacity=".28"/><line x1="4" y1="0" x2="4" y2="58" stroke="${PAL.umb}" stroke-opacity=".14"/>
    <path d="M22 18 q6 10 0 20 q-6 -10 0 -20z" fill="none" stroke="${PAL.umb}" stroke-opacity=".3"/><circle cx="22" cy="46" r="1.3" fill="${PAL.umb}" fill-opacity=".3"/>
  </pattern>
  <radialGradient id="bk-lamp"><stop offset="0" stop-color="#ffe3a2" stop-opacity=".85"/><stop offset=".35" stop-color="#f3b45c" stop-opacity=".32"/><stop offset="1" stop-color="#e89a40" stop-opacity="0"/></radialGradient>
  <linearGradient id="bk-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#243030"/><stop offset=".6" stop-color="#3e4b46"/><stop offset="1" stop-color="#5a6352"/></linearGradient>
  <filter id="bk-forget" x="-25%" y="-25%" width="150%" height="150%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n">
      <animate attributeName="baseFrequency" values="0.028;0.05;0.033;0.028" dur="3s" repeatCount="indefinite"/>
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="1.1" result="b"/>
    <feComponentTransfer in="b"><feFuncA type="linear" slope="0.6"/></feComponentTransfer>
  </filter>
  <filter id="bk-wob" x="-2%" y="-2%" width="104%" height="104%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="bk-glow" x="-150%" y="-150%" width="400%" height="400%">
    <feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="bk-soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#2b1d12" flood-opacity=".35"/></filter>
</defs>`;

/** 挂在物件上的手写名签（会轻轻摆动） */
export function tag(x, y, text, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><g class="bk-tag">
    <line x1="0" y1="-14" x2="0" y2="3" stroke="${PAL.sep}" stroke-width="1"/>
    <path d="M-19 3 H19 V27 H-19 Z" fill="${PAL.cre}" stroke="${INK}" stroke-width="1"/>
    <circle cx="0" cy="8" r="1.8" fill="none" stroke="${INK}"/>
    <text x="0" y="22.5" text-anchor="middle" font-size="11.5" font-weight="700" fill="${INK}" ${F}>${text}</text>
  </g></g>`;
}

/** 放射线（钟面刻度、光芒等） */
export function spokes(cx, cy, r1, r2, n, sw = 1, col = INK) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = i * Math.PI * 2 / n;
    s += `<line x1="${(cx + Math.sin(a) * r1).toFixed(1)}" y1="${(cy - Math.cos(a) * r1).toFixed(1)}" x2="${(cx + Math.sin(a) * r2).toFixed(1)}" y2="${(cy - Math.cos(a) * r2).toFixed(1)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }
  return s;
}

/** 透明热区（矩形）：id 对应 spec.act / spec.use 的 target；cond 可选（同 data-if 语法） */
export const hot = (id, x, y, w, h, cond) =>
  `<rect class="bk-hot" data-hot="${id}" ${cond ? `data-if="${cond}"` : ''} x="${x}" y="${y}" width="${w}" height="${h}"/>`;
