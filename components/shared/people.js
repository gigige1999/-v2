/* =========================================================
   人物（2D 锈湖式，简约平涂）
   - 平涂色块 + 统一粗细的深褐描边；不用渐变、不用排线
   - 黑豆小眼 + 一圈深色眼圈、细长的鼻子、圆形腮红、细线嘴
   - 靠原著里的标志特征区分人物（乱发大胡子、发髻、鼻环、头巾……）
   head(o)：以头部中心为原点，头宽约 26、头高约 34
   torso(o)：以脖子根为原点，垂肩的简单身体
   lw：描边粗细（场景坐标）。800 宽场景用默认 1.5，400 宽场景约 0.9
   ========================================================= */
const INK = '#2b1d12', LIP = '#9a4a3a', BLUSH = '#d98a72', GOLD = '#c9a24e', COP = '#b8703e';
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
export const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

const FACE = {
  oval: [12.6, 'M0 -17 C8.6 -17 12.6 -10.6 12.6 -2.6 C12.6 6.4 7.8 15.6 0 17 C-7.8 15.6 -12.6 6.4 -12.6 -2.6 C-12.6 -10.6 -8.6 -17 0 -17Z'],
  wide: [14, 'M0 -16.6 C9.8 -16.6 14 -10 14 -1.6 C14 8.4 9.6 16 0 16.8 C-9.6 16 -14 8.4 -14 -1.6 C-14 -10 -9.8 -16.6 0 -16.6Z'],
  long: [11.6, 'M0 -17.4 C8 -17.4 11.6 -11 11.6 -3 C11.6 6.6 7 16.4 0 17.8 C-7 16.4 -11.6 6.6 -11.6 -3 C-11.6 -11 -8 -17.4 0 -17.4Z']
};
const NOSE = {
  long: 'M.6 -3 Q1.8 2.6 3.4 6 Q1.8 7.6 -.8 6.8',
  big: 'M-.2 -2.4 Q.8 2.6 4.2 5.6 Q3 8.2 -1.6 7.6',
  small: 'M1 1.6 Q2.4 4.6 2.6 5.8 Q1.4 6.8 -.6 6.2'
};
const MOUTH = { flat: 'M-2.8 11 Q0 11.6 2.8 11', line: 'M-2.6 11.1 H2.6', sad: 'M-3 11.6 Q0 10.2 3 11.6', smile: 'M-3 10.4 Q0 12.8 3 10.4' };

export function head(o = {}) {
  const {
    x = 0, y = 0, s = 1, lw = 1.5, skin = '#ecdcc0', shape = 'oval', hair = INK,
    back = '', front = '', over = '', eyes = true, eyeR = 1.3, eyeCls = '', openIf = '', closedIf = '',
    look = 0, lookY = 0, rings = .24, brow = 1.2, browTilt = 0,
    mouth = 'flat', cheeks = .5, nose = 'long', neck = true, ears = true
  } = o;
  const [hw, d] = FACE[shape] || FACE.oval;
  const sw = (lw / s).toFixed(2), fw = (lw * .8 / s).toFixed(2);
  const ring = mix(skin, '#3a2a20', rings), nsh = mix(skin, '#3a2a20', .15);
  const bt = browTilt, ex = look, ey = lookY;
  const eyeOpen = `<g${eyeCls ? ` class="${eyeCls}"` : ''}${openIf ? ` data-if="${openIf}"` : ''}>
    <circle cx="${-5 + ex}" cy="${-1.2 + ey}" r="${eyeR}" fill="${INK}"/><circle cx="${5 + ex}" cy="${-1.2 + ey}" r="${eyeR}" fill="${INK}"/>
    <circle cx="${-4.6 + ex}" cy="${-1.7 + ey}" r="${(eyeR * .3).toFixed(2)}" fill="#fff8e8"/><circle cx="${5.4 + ex}" cy="${-1.7 + ey}" r="${(eyeR * .3).toFixed(2)}" fill="#fff8e8"/></g>`;
  const eyeShut = closedIf ? `<path data-if="${closedIf}" d="M-7.2 -1 Q-5 .6 -2.8 -1 M2.8 -1 Q5 .6 7.2 -1" stroke="${INK}" stroke-width="${fw}" fill="none" stroke-linecap="round"/>` : '';
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke-linejoin="round">
    ${neck ? `<path d="M-4.4 11 L-4.8 23 L4.8 23 L4.4 11Z" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/><path d="M-4.5 12.6 Q0 18 4.5 12.6 L4.6 16 Q0 20 -4.6 16Z" fill="${nsh}"/>` : ''}
    ${back}
    ${ears ? `<path d="M${-hw + .4} -4.4 C${-hw - 3.6} -5.6 ${-hw - 3.8} 3 ${-hw + .2} 3.6Z M${hw - .4} -4.4 C${hw + 3.6} -5.6 ${hw + 3.8} 3 ${hw - .2} 3.6Z" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/>` : ''}
    <path d="${d}" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/>
    <ellipse cx="-5" cy="-1.2" rx="3.8" ry="3.2" fill="${ring}"/><ellipse cx="5" cy="-1.2" rx="3.8" ry="3.2" fill="${ring}"/>
    ${eyes ? eyeOpen + eyeShut : ''}
    ${brow ? `<path d="M-8.2 ${(-5.8 - bt).toFixed(1)} Q-5.4 -7.4 -2.4 ${(-6 + bt).toFixed(1)} M2.4 ${(-6 + bt).toFixed(1)} Q5.4 -7.4 8.2 ${(-5.8 - bt).toFixed(1)}" stroke="${hair}" stroke-width="${(brow * lw * 1.1 / s).toFixed(2)}" fill="none" stroke-linecap="round"/>` : ''}
    ${cheeks ? `<circle cx="-7.6" cy="5.4" r="2.6" fill="${BLUSH}" opacity="${cheeks}"/><circle cx="7.6" cy="5.4" r="2.6" fill="${BLUSH}" opacity="${cheeks}"/>` : ''}
    ${nose && NOSE[nose] ? `<path d="${NOSE[nose]}" stroke="${INK}" stroke-width="${fw}" fill="none" stroke-linecap="round"/>` : ''}
    ${mouth && MOUTH[mouth] ? `<path d="${MOUTH[mouth]}" stroke="${LIP}" stroke-width="${fw}" fill="none" stroke-linecap="round"/>` : ''}
    ${front}
    ${over}
  </g>`;
}

/* 身体：以脖子根为原点。kind = coat | shirt | tunic | robe */
export function torso(o = {}) {
  const { x = 0, y = 0, s = 1, w = 20, h = 40, cloth = '#4c3a28', shirt = '#ece0c4', kind = 'coat', strap = '#5a4128', lw = 1.5 } = o;
  const sw = (lw / s).toFixed(2), tw = (lw * .7 / s).toFixed(2);
  const out = `M-5 0 C-12 .6 ${-w + 1} 2 ${-w} 9 L${-w + 1} ${h} L${w - 1} ${h} L${w} 9 C${w - 1} 2 12 .6 5 0Z`;
  let inner = '';
  if (kind === 'coat') inner = `<path d="M-5 0 L0 ${h * .55} L5 0Z" fill="${shirt}" stroke="${INK}" stroke-width="${tw}"/>
    <path d="M-5 0 L0 ${h * .55} M5 0 L0 ${h * .55}" stroke="${INK}" stroke-width="${tw}"/>
    <circle cx="0" cy="${(h * .66).toFixed(1)}" r="1" fill="${INK}"/><circle cx="0" cy="${(h * .82).toFixed(1)}" r="1" fill="${INK}"/>`;
  else if (kind === 'shirt') inner = `<path d="M-5 0 L-1.5 5.5 L-6.5 4Z M5 0 L1.5 5.5 L6.5 4Z" fill="#fff8ea" stroke="${INK}" stroke-width="${tw}"/>
    <path d="M-8.5 2 L-7 ${h} M8.5 2 L7 ${h}" stroke="${strap}" stroke-width="${(lw * 1.8 / s).toFixed(2)}"/>
    <circle cx="0" cy="${(h * .4).toFixed(1)}" r=".8" fill="${INK}"/><circle cx="0" cy="${(h * .7).toFixed(1)}" r=".8" fill="${INK}"/>`;
  else if (kind === 'tunic') inner = `<path d="M-5 0 Q0 7 5 0" fill="${shirt}" stroke="${INK}" stroke-width="${tw}"/>`;
  else inner = `<path d="M-5 0 L0 7 L5 0Z" fill="${shirt}" stroke="${INK}" stroke-width="${tw}"/><path d="M0 7 V${h}" stroke="${INK}" stroke-width="${tw}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke-linejoin="round">
    <path d="${out}" fill="${cloth}" stroke="${INK}" stroke-width="${sw}"/>${inner}</g>`;
}

/* ---------------- 角色（特征取自原著） ---------------- */
// 何塞·阿尔卡蒂奥·布恩迪亚：魁梧、乱蓬蓬的头发、浓密的大胡子、浓眉
export function jose(x, y, s, { openIf = '', closedIf = '', eyeCls = 'c1-blink b2', look = 0, lw = 1.5 } = {}) {
  const H = '#2a1c12';
  return head({
    x, y, s, lw, shape: 'wide', skin: '#e8d3b0', hair: H, brow: 1.8, browTilt: 1, cheeks: 0, mouth: '', nose: 'big', openIf, closedIf, eyeCls, look,
    back: `<path d="M-16.4 6 Q-20 -6 -16.4 -13 Q-18 -21 -9.6 -21.6 Q-5.6 -26.4 0 -23.8 Q6 -26.8 10.6 -22 Q18.4 -21 17 -12.6 Q19.8 -4 16.4 6Z" fill="${H}" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>`,
    front: `<path d="M-14 -3 Q-15 -17 -3 -18.6 Q10 -19.6 14 -9 L14 -3 Q12 -9 8 -10.4 Q6 -7.6 3 -9.6 Q0 -7 -3 -10 Q-6 -7.4 -8.4 -10 Q-12 -8.6 -14 -3Z" fill="${H}"/>
      <path d="M-14 -1 Q-14.6 12 -8 19.6 Q0 25.4 8 19.6 Q14.6 12 14 -1 Q12 5 8.6 7 Q4.6 5.4 0 7.6 Q-4.6 5.4 -8.6 7 Q-12 5 -14 -1Z" fill="${H}" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>
      <path d="M-2.4 11 Q0 11.8 2.4 11" stroke="#c07a68" stroke-width="${(lw * .8 / s).toFixed(2)}" fill="none" stroke-linecap="round"/>`
  });
}

// 乌尔苏拉：瘦小、严厉，中分盘发、发髻（眼珠由场景单独绘制，可跟随鼠标）
export function ursula(x, y, s, { lw = 1.2 } = {}) {
  const H = '#3d2b1c';
  return head({
    x, y, s, lw, skin: '#efe0c6', hair: H, eyes: false, mouth: 'line', brow: 1, browTilt: .6, ears: false,
    back: `<circle cx="0" cy="-17.4" r="6" fill="${H}" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>`,
    front: `<path d="M-13.2 0 Q-14.6 -17.6 0 -18 Q14.6 -17.6 13.2 0 Q12.4 -10 6.6 -13 Q2.4 -14.6 0 -11.6 Q-2.4 -14.6 -6.6 -13 Q-12.4 -10 -13.2 0Z" fill="${H}"/>`
  });
}

// 丽贝卡：瘦小苍白、黑色长直发，偷偷吃土——嘴角沾着泥
export function rebecca(x, y, s, { lw = 1.5 } = {}) {
  return head({
    x, y, s, lw, skin: '#e6dcbc', neck: false, ears: false, eyeR: 1.55, rings: .3, mouth: 'flat', cheeks: .35, nose: 'small', brow: .9,
    back: `<path d="M-14 -4 Q-17.6 -19 0 -19.4 Q17.6 -19 14 -4 L16.4 24 L6.4 22 L6.4 16 L-6.4 16 L-6.4 22 L-16.4 24Z" fill="#221710" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>`,
    front: `<path d="M-13 -3.6 Q-13.4 -17 0 -17.6 Q13.4 -17 13 -3.6 Q12 -8.6 10 -8.6 L-10 -8.6 Q-12 -8.6 -13 -3.6Z" fill="#221710"/>
      <ellipse cx="3.6" cy="12" rx="1.6" ry="1" fill="#6b4a2c"/><circle cx="-2.4" cy="13.2" r=".6" fill="#6b4a2c"/>`
  });
}

// 美人儿蕾梅黛丝：长发及腰、白袍、总是闭着眼（坐着，用于升天那一幕）
export function remedios(x, y, s, { lw = 1.5 } = {}) {
  const H = '#241a12';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-22 8 Q-26 20 -18 26 L18 26 Q28 18 22 8Z" fill="#f6efdc" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}" stroke-linejoin="round"/>
    <path d="M-30 30 Q-14 22 0 26 Q16 22 30 30 L28 38 Q0 32 -28 38Z" fill="${H}" stroke="${INK}" stroke-width="${(lw * .8 / s).toFixed(2)}"/>
    ${torso({ x: 0, y: -6, s: 1, w: 11, h: 26, cloth: '#fbf5e6', kind: 'robe', shirt: '#f2e8d0', lw })}
    ${head({
    x: 0, y: -34, s: 1, lw, shape: 'oval', skin: '#f0e0c4', hair: H, eyes: false, brow: 1, cheeks: .45, mouth: 'smile', nose: 'small',
    back: `<path d="M-13 -2 Q-17 -16 0 -17 Q17 -16 13 -2 L15 30 L7 28 L7 14 L-7 14 L-7 28 L-15 30Z" fill="${H}" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>`,
    front: `<path d="M-12 -3.4 Q-12.6 -16 0 -16.4 Q12.6 -16 12 -3.4 Q11 -8.4 9 -8.4 L-9 -8.4 Q-11 -8.4 -12 -3.4Z" fill="${H}"/>`
  })}
    <path d="M-7 -33.6 Q-5 -31.6 -3 -33.6 M3 -33.6 Q5 -31.6 7 -33.6" fill="none" stroke="${INK}" stroke-width="${(lw * .7 / s).toFixed(2)}" stroke-linecap="round"/>
  </g>`;
}

// 梅尔基亚德斯：灰白乱胡子、小圆眼镜、长脸（宽檐黑帽由场景绘制）
export function melquiades(x, y, s, { lw = 1.5 } = {}) {
  const B = '#c9bfa6';
  return head({
    x, y, s, lw, shape: 'long', skin: '#e3d6bd', hair: '#8f8676', mouth: '', cheeks: .3, brow: 1.2, browTilt: -.4, eyeR: 1.05,
    front: `<path d="M-11.6 2 Q-13 15 -6 22 Q0 27 6 22 Q13 15 11.6 2 Q9 7 5 7.4 Q0 6 -5 7.4 Q-9 7 -11.6 2Z" fill="${B}" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>`,
    over: `<g fill="none" stroke="${GOLD}" stroke-width="${(lw * .7 / s).toFixed(2)}"><circle cx="-5" cy="-1.2" r="3.4"/><circle cx="5" cy="-1.2" r="3.4"/><path d="M-1.6 -1.6 Q0 -2.6 1.6 -1.6"/></g>`
  });
}

// 巨人：剃光的头、铜鼻环、粗眉小眼（“一个剃光了头的巨人，鼻子上穿着铜环”）
export function giantHead(x, y, s, { lw = 1.5 } = {}) {
  return head({
    x, y, s, lw, shape: 'wide', skin: '#c99a6a', hair: '#2a1c12', brow: 2, browTilt: 1.2, eyeR: 1, mouth: 'sad', cheeks: .35, nose: 'big',
    front: `<ellipse cx="-4" cy="-12.4" rx="4" ry="1.6" fill="#ddb688"/>`,
    over: `<circle cx="1.2" cy="8.8" r="2.3" fill="none" stroke="${COP}" stroke-width="${(lw * 1.1 / s).toFixed(2)}"/>`
  });
}

// 吉普赛商贩：黝黑、红头巾缀金币、翘起的黑色八字胡
export function trader(x, y, s, { lw = 1.5 } = {}) {
  const sw = (lw / s).toFixed(2);
  return head({
    x, y, s, lw, skin: '#c08e62', hair: '#241811', mouth: '', cheeks: .35, brow: 1.4, browTilt: -.3, ears: false,
    front: `<path d="M-14 -1 Q-15.4 -19 0 -19.4 Q15.4 -19 14 -1 Q12.4 -9.6 0 -10.2 Q-12.4 -9.6 -14 -1Z" fill="#a8402e" stroke="${INK}" stroke-width="${sw}"/>
      <g fill="${GOLD}" stroke="${INK}" stroke-width="${(lw * .5 / s).toFixed(2)}"><circle cx="-8.6" cy="-8" r="1.2"/><circle cx="-3" cy="-9.4" r="1.2"/><circle cx="3" cy="-9.4" r="1.2"/><circle cx="8.6" cy="-8" r="1.2"/></g>
      <path d="M0 7.6 Q-4.6 6.4 -7.6 9 Q-8.8 11 -6.6 11 Q-6 9.4 0 9.6 Q6 9.4 6.6 11 Q8.8 11 7.6 9 Q4.6 6.4 0 7.6Z" fill="#241811" stroke="${INK}" stroke-width="${(lw * .6 / s).toFixed(2)}"/>
      <path d="M-2 12 Q0 12.6 2 12" stroke="${LIP}" stroke-width="${(lw * .8 / s).toFixed(2)}" fill="none" stroke-linecap="round"/>`
  });
}

// 孩子：arca（小何塞·阿尔卡蒂奥，结实、圆脸、乱发、咧嘴）/ aure（小奥雷里亚诺，瘦、大眼睛、安静地盯着）
export function child(x, y, s, kind, { lw = 1.5 } = {}) {
  if (kind === 'arca') return head({
    x, y, s, lw, shape: 'wide', skin: '#ecd9b8', hair: '#4a3420', mouth: 'smile', cheeks: .6, nose: 'small', brow: 1.1,
    front: `<path d="M-14 -2 Q-15.4 -18.4 0 -18.4 Q15.4 -18.4 14 -2 Q12.6 -10.4 7 -10.6 Q4 -13.6 0 -11 Q-4 -13.6 -7.6 -10.6 Q-12.6 -10.4 -14 -2Z M-2 -18 L0 -22.6 L3.6 -17.6Z" fill="#4a3420" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>`
  });
  return head({
    x, y, s, lw, shape: 'long', skin: '#e9d9bc', hair: '#221710', eyeR: 1.6, rings: .32, mouth: 'line', cheeks: .4, nose: 'small', brow: .9, eyeCls: 'c1-blink b3',
    front: `<path d="M-12.2 -2 Q-13.4 -18.4 0 -18.4 Q13.4 -18.4 12.2 -2 Q11.6 -12 -2 -12 Q-9 -11.4 -12.2 -2Z" fill="#221710" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>`
  });
}

// 奥雷里亚诺第二：圆胖的脸、梳得服帖的头发、两撇小胡子
export function segundo(x, y, s, { look = 0, lookY = 0, eyeCls = 'c1-blink b2', lw = .9 } = {}) {
  const H = '#2a1d14';
  return head({
    x, y, s, lw, shape: 'wide', skin: '#ecd8b6', hair: H, mouth: 'flat', cheeks: .5, brow: 1.2, look, lookY, eyeCls,
    front: `<path d="M-14 -2 Q-15 -18 0 -18.4 Q15 -18 14 -2 Q13 -10.6 8 -12 Q0 -13.6 -4 -10.4 Q-10 -11.4 -14 -2Z" fill="${H}" stroke="${INK}" stroke-width="${(lw / s).toFixed(2)}"/>
      <path d="M0 8 Q-3.6 7.4 -6 9.6 Q-3.4 9.2 0 9.4 Q3.4 9.2 6 9.6 Q3.6 7.4 0 8Z" fill="${H}"/>`
  });
}
