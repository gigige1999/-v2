/* =========================================================
   第四章 · 循环的迷宫 —— 关卡引擎（单一场景，无人物）
   mountChapter4(root, { onComplete }) => { destroy, getHint, autoSolve }
   核心玩法：梅尔基亚德斯的“缠绕密码”。一条写满乱字的羊皮带缠在木轴上。
   上下拖铜轮改变木轴粗细；粗细刚好（一圈缠四个字）时，字会沿着轴排成一行行。
   再上下拖羊皮带转动木轴，把四行字逐一转到红线前读出来。
   ========================================================= */
import { ART } from '../chapter1/art.js';
import { ART4, CY } from './art.js';
import { Snd } from '../shared/sound.js';

const SAVE_KEY = 'macondo2_ch4';
const SVGNS = 'http://www.w3.org/2000/svg';
const LINES = ['家族的历史是轮子', '奥雷里亚诺们孤僻', '阿尔卡蒂奥们冲动', '周而复始无法停歇'];
const PIPS = ['轮', '奥', '阿', '始'];
const K = 4, TURNS = 8, COUNT = K * TURNS;
const STRIP = Array.from({ length: COUNT }, (_, i) => LINES[i % K][Math.floor(i / K)]);
const P = 30;                         // 羊皮带宽度（沿轴方向）
const N_MIN = 3.4, N_MAX = 6.6, SNAP = .07;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrap = a => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
function svgEl(tag, attrs) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
function svgPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); }

const READ_NARR = [
  '“家族的历史是轮子。”——这一行字，正好绕着木轴转了一圈又一圈。',
  '“奥雷里亚诺们孤僻……”叫这个名字的人，都沉默、聪明，眼神总像在看很远的地方。',
  '“阿尔卡蒂奥们冲动……”叫这个名字的人，都高大、莽撞，天生带着一股悲剧的劲头。',
  '“周而复始，无法停歇。”再往下转一格，第一行又转回来了。'
];

const INIT = () => ({ n: 5.5, rot: .6, read: [false, false, false, false], finished: false, seen: {}, hints: {} });
function loadState() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) { const b = INIT(); return { ...b, ...s, seen: { ...s.seen }, hints: { ...s.hints } }; } } catch (e) { }
  return INIT();
}

export function mountChapter4(root, { onComplete } = {}) {
  let S = loadState();
  let dead = false, busy = false, flipping = false, raf = 0, lastT = 0;
  let drag = null, vel = 0, hold = 0, holdJ = -1, lastAct = Date.now(), nudged = false;
  let lastSnap = null, dirty = true, alignedT = 0;
  const timers = new Set(), intervals = [], cleanups = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms); timers.add(t); return t; };
  const wait = ms => new Promise(r => later(r, ms));
  const every = (fn, ms) => intervals.push(setInterval(() => { if (!dead) fn(); }, ms));
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const save = () => { if (dead) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } };
  const effN = () => { const r = Math.round(S.n); return Math.abs(S.n - r) < SNAP ? r : S.n; };

  /* ---------------- DOM ---------------- */
  root.classList.add('c1-root', 'c4-root');
  root.innerHTML = `<svg class="c1-defs" aria-hidden="true">${ART.DEFS}${ART4.DEFS}</svg>
  <div class="c1-wrap">
    <div class="c1-head">
      <span class="c1-kicker"><b>CAP. IV</b>Una rueda giratoria</span>
    </div>
    <div class="c1-stage"><div class="c1-box"></div></div>
    <div class="c1-narr"><span></span></div>
    <div class="c1-bottom c4-bottom"><button class="c1-snd" type="button"></button>
      <div class="c4-gauge"><b>一圈</b><span class="c4-gnum">—</span><b>字</b></div>
      <div class="c4-strip">${LINES.map((l, i) => `<div class="c4-cell" data-i="${i}"><span></span></div>`).join('')}</div>
    </div>
    <div class="c1-tip"></div><div class="c1-flash"></div>
  </div>`;
  const wrapEl = $('.c1-wrap'), box = $('.c1-box');
  const narrSpan = $('.c1-narr span'), tipEl = $('.c1-tip'), flashEl = $('.c1-flash'), sndBtn = $('.c1-snd'), gnum = $('.c4-gnum');
  const syncSnd = () => { sndBtn.textContent = '♪'; sndBtn.classList.toggle('off', !Snd.on); sndBtn.title = Snd.on ? '关闭声音' : '开启声音'; };
  syncSnd();

  /* ---------------- 书页 ---------------- */
  const leaves = [];
  function makeLeaf(inner, cap, plate) {
    const el = document.createElement('div'); el.className = 'c1-leaf';
    el.innerHTML = inner + ART.FRAME('', plate) + `<div class="c4-capt">${cap}</div><div class="c1-shade"></div>`;
    return el;
  }
  const FLIP = 560;
  function pushLeaf(el) {
    const cur = leaves[leaves.length - 1];
    leaves.push(el); box.appendChild(el);
    if (!cur) return Promise.resolve();
    flipping = true; hideTip(); Snd.fx.page();
    el.style.zIndex = 1; cur.style.zIndex = 2;
    const a = cur.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-92deg)' }], { duration: FLIP, easing: 'cubic-bezier(.55,.05,.8,.45)', fill: 'forwards' });
    cur.querySelector('.c1-shade').animate([{ opacity: 0 }, { opacity: .85 }], { duration: FLIP, fill: 'forwards' });
    el.querySelector('.c1-shade').animate([{ opacity: .7 }, { opacity: 0 }], { duration: FLIP + 260, easing: 'ease-out' });
    return new Promise(res => { a.onfinish = () => { cur.classList.add('c1-hidden'); cur.style.zIndex = ''; el.style.zIndex = ''; flipping = false; res(); }; });
  }
  pushLeaf(makeLeaf(`<div class="c1-plate">${ART4.main()}</div>`, 'Lám. IV · La escítala de Melquíades', true));
  const svg = $('#c4-main'), rodG = $('#c4-rod'), stripG = $('#c4-strip'), textG = $('#c4-text'), wheelG = $('#c4-wheel'), capG = $('#c4-cap');
  const shadeR = $('#c4-shade'), hitSpin = $('#c4-hitSpin'), hitKnob = $('#c4-hitKnob'), shadow = $('#c4-shadow'), glowR = $('#c4-glowR');

  /* ---------------- 静态元素池 ---------------- */
  const rodBody = svgEl('rect', { x: 26, width: 348, fill: 'url(#c4-wood)', stroke: '#2b1d12', 'stroke-width': 1.2, rx: 2 });
  const rodEndR = svgEl('ellipse', { cx: 374, fill: '#5a3e24', stroke: '#2b1d12', 'stroke-width': 1 });
  rodG.append(rodBody, rodEndR);
  const cells = [], glyphs = [];
  for (let i = 0; i < COUNT; i++) {
    const c = svgEl('polygon', { stroke: '#7a5a34', 'stroke-width': .6, 'stroke-linejoin': 'round' }); stripG.appendChild(c); cells.push(c);
    const t = svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'c4-ch' }); t.textContent = STRIP[i]; textG.appendChild(t); glyphs.push(t);
  }
  const wheelBody = svgEl('ellipse', { cx: 20, fill: 'url(#c4-brass)', stroke: '#2b1d12', 'stroke-width': 1.2 });
  const wheelHub = svgEl('ellipse', { cx: 20, rx: 3, fill: '#5a3e14' });
  wheelG.append(wheelBody);
  const ridges = [];
  for (let k = 0; k < 18; k++) { const l = svgEl('line', { x1: 14, x2: 26, stroke: '#4a320f', 'stroke-width': 1.1, 'stroke-linecap': 'round' }); wheelG.appendChild(l); ridges.push(l); }
  wheelG.append(wheelHub);
  const capL = svgEl('ellipse', { cx: 29, fill: 'url(#c4-brass)', stroke: '#2b1d12', 'stroke-width': .8 });
  capG.append(capL);

  /* ---------------- 渲染 ---------------- */
  const PAPER = '#efe0b8', DARK = '#7c6440';
  function render() {
    const n = effN(), R = 14 + n * 8, L = COUNT * P / n + P, x0 = 200 - L / 2, D = TAU / n, rot = S.rot;
    rodBody.setAttribute('y', (CY - R + 4).toFixed(1)); rodBody.setAttribute('height', (2 * R - 8).toFixed(1));
    rodEndR.setAttribute('cy', CY); rodEndR.setAttribute('rx', 4); rodEndR.setAttribute('ry', (R - 4).toFixed(1));
    shadow.setAttribute('cy', (CY + R + 30).toFixed(1)); shadow.setAttribute('rx', (L / 2 + 40).toFixed(1));
    shadeR.setAttribute('x', x0.toFixed(1)); shadeR.setAttribute('width', L.toFixed(1));
    shadeR.setAttribute('y', (CY - R).toFixed(1)); shadeR.setAttribute('height', (2 * R).toFixed(1));
    hitSpin.setAttribute('x', 40); hitSpin.setAttribute('width', 340); hitSpin.setAttribute('y', (CY - R - 8).toFixed(1)); hitSpin.setAttribute('height', (2 * R + 16).toFixed(1));
    const WR = R + 10;
    hitKnob.setAttribute('x', 0); hitKnob.setAttribute('width', 40); hitKnob.setAttribute('y', (CY - WR - 10).toFixed(1)); hitKnob.setAttribute('height', (2 * WR + 20).toFixed(1));
    wheelBody.setAttribute('cy', CY); wheelBody.setAttribute('rx', 8); wheelBody.setAttribute('ry', WR.toFixed(1));
    wheelHub.setAttribute('cy', CY); wheelHub.setAttribute('ry', (WR * .2).toFixed(1));
    const ph = S.n * 2.6;
    ridges.forEach((l, k) => {
      const a = ph + k * TAU / 18, c = Math.cos(a);
      if (c < .12) { l.setAttribute('display', 'none'); return; }
      l.setAttribute('display', ''); const y = (CY - WR * Math.sin(a)).toFixed(1);
      l.setAttribute('y1', y); l.setAttribute('y2', y); l.setAttribute('stroke-opacity', (.25 + c * .7).toFixed(2));
    });
    capL.setAttribute('cy', CY); capL.setAttribute('rx', 5); capL.setAttribute('ry', (R - 2).toFixed(1));

    const aligned = n === K;
    for (let i = 0; i < COUNT; i++) {
      const a = wrap(rot + i * D), b = a + D;
      let s = null, e = null;
      for (const [lo, hi] of [[-Math.PI / 2, Math.PI / 2], [Math.PI * 1.5, Math.PI * 2.5]]) {
        const ss = Math.max(a, lo), ee = Math.min(b, hi); if (ee > ss) { s = ss; e = ee; break; }
      }
      const c = cells[i], t = glyphs[i];
      if (s === null) { c.setAttribute('display', 'none'); t.setAttribute('display', 'none'); continue; }
      const pts = [], back = [];
      for (let k = 0; k <= 6; k++) {
        const f = s + (e - s) * k / 6, u = i + (f - a) / D, xc = x0 + P / 2 + u * P / n, y = (CY - R * Math.sin(f)).toFixed(1);
        pts.push(`${(xc - P / 2 + .4).toFixed(1)},${y}`); back.unshift(`${(xc + P / 2 - .4).toFixed(1)},${y}`);
      }
      c.setAttribute('display', ''); c.setAttribute('points', pts.concat(back).join(' '));
      const cm = Math.cos((s + e) / 2);
      c.setAttribute('fill', mix(PAPER, DARK, (1 - cm) * .6));
      const fc = a + D / 2, cc = Math.cos(fc);
      if (cc < .2) { t.setAttribute('display', 'none'); continue; }
      t.setAttribute('display', '');
      const x = x0 + P / 2 + (i + .5) * P / n, y = CY - R * Math.sin(fc);
      t.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1 ${cc.toFixed(3)})`);
      const j = i % K;
      t.setAttribute('class', 'c4-ch' + (aligned && S.read[j] ? ' read' : '') + (aligned && j === holdJ && hold > .05 ? ' lit' : ''));
      t.setAttribute('fill-opacity', (.35 + cc * .65).toFixed(2));
    }
    gnum.textContent = Number.isInteger(n) ? String(n) : n.toFixed(1);
    root.classList.toggle('c4-snapped', Number.isInteger(n));
    dirty = false;
  }

  function apply() {
    if (dead) return;
    $$('.c1-pip').forEach(p => p.classList.toggle('on', !!S.read[+p.dataset.k]));
    $$('.c4-cell').forEach(c => { const i = +c.dataset.i, on = S.read[i]; c.classList.toggle('on', on); c.querySelector('span').textContent = on ? LINES[i] : ''; });
    root.classList.toggle('c4-knobme', !S.seen.knob && !S.finished);
    root.classList.toggle('c4-spinme', !!S.seen.knob && effN() === K && !S.seen.spin && !S.finished);
    dirty = true; save();
  }

  /* ---------------- 旁白 / 提示框 ---------------- */
  let narrT = null;
  function narr(text, whisper = false) {
    if (narrT) { clearTimeout(narrT); timers.delete(narrT); }
    narrSpan.classList.add('out');
    narrT = later(() => { narrT = null; narrSpan.textContent = text; narrSpan.classList.toggle('whisper', whisper); narrSpan.classList.remove('out'); }, 200);
  }
  function hideTip() { tipEl.classList.remove('show'); }
  function tip(e) {
    if (e.pointerType !== 'mouse' || drag) return hideTip();
    const el = e.target.closest('[data-hot]'); if (!el) return hideTip();
    const r = wrapEl.getBoundingClientRect();
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
    tipEl.textContent = el.dataset.hot === 'knob' ? '铜轮 · 上下拖：调木轴粗细' : '羊皮带 · 上下拖：转动木轴';
    tipEl.classList.add('show');
  }

  /* ---------------- 交互 ---------------- */
  function on(target, type, fn, opt) { target.addEventListener(type, fn, opt); cleanups.push(() => target.removeEventListener(type, fn, opt)); }
  on(sndBtn, 'click', () => { Snd.unlock(); Snd.toggle(); syncSnd(); if (Snd.on) Snd.startDrone(); });
  on(root, 'pointerdown', () => { Snd.unlock(); Snd.startDrone(); }, { once: true });

  on(box, 'pointerdown', e => {
    if (busy || flipping || S.finished) return;
    const el = e.target.closest('[data-hot]'); if (!el) return;
    const q = svgPt(svg, e.clientX, e.clientY);
    drag = { kind: el.dataset.hot, y: q.y, moved: 0, t: performance.now() };
    try { el.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault(); hideTip(); lastAct = Date.now(); vel = 0;
    root.classList.add('c4-dragging');
  });
  on(box, 'pointermove', e => {
    if (!drag) return tip(e);
    const q = svgPt(svg, e.clientX, e.clientY), dy = q.y - drag.y, now = performance.now();
    drag.y = q.y; drag.moved += Math.abs(dy); lastAct = Date.now();
    if (drag.kind === 'knob') setN(S.n - dy * .011);
    else {
      const R = 14 + effN() * 8, d = -dy / R;
      S.rot = wrap(S.rot + d); dirty = true;
      const dt = Math.max(.008, (now - drag.t) / 1000); vel = clamp(vel * .5 + (d / dt) * .5, -12, 12);
      rustle();
    }
    drag.t = now;
  });
  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null; root.classList.remove('c4-dragging');
    if (performance.now() - d.t > 90) vel = 0;
    if (d.moved < 3) { Snd.fx.click(); narr(d.kind === 'knob' ? '一只刻着细纹的铜轮。按住它上下拖，木轴就会变粗、变细。' : clickStrip()); vel = 0; return; }
    if (d.kind === 'knob' && !S.seen.knob) { S.seen.knob = true; }
    if (d.kind === 'spin' && effN() === K && !S.seen.spin) { S.seen.spin = true; }
    apply();
  };
  on(box, 'pointerup', endDrag);
  on(box, 'pointercancel', endDrag);
  on(box, 'pointerleave', hideTip);
  function clickStrip() {
    const n = effN();
    if (n === K) return '字排成了一行行。上下拖动羊皮带，把每一行转到红线上。';
    if (Number.isInteger(n)) return '字是排整齐了，可连起来读不通——像一串陌生人的名字。';
    return '羊皮带上的字东一个、西一个，斜斜地绕着木轴，谁也读不通。';
  }

  let rustleCell = null;
  function rustle() {
    const n = effN(), c = Math.floor(S.rot / (TAU / n));
    if (c !== rustleCell) { rustleCell = c; Snd.noise(.05, .045, 1800 + Math.random() * 600, 1.4); }
  }

  function setN(v) {
    S.n = clamp(v, N_MIN, N_MAX); dirty = true;
    const n = effN(), snapped = Number.isInteger(n) ? n : null;
    if (snapped !== lastSnap) {
      if (snapped !== null) {
        Snd.fx.clack(); try { navigator.vibrate && navigator.vibrate(10); } catch (e) { }
        if (snapped === K) {
          flashGlow();
          if (!S.seen.k4) { S.seen.k4 = true; narr('咔哒——木轴的粗细正好。斜着乱飞的字一下子站成了一行行，顺着木轴排开。'); }
        } else if (!S.seen['k' + snapped]) { S.seen['k' + snapped] = true; narr(`咔哒——这回一圈缠 ${snapped} 个字。字排整齐了，可是连起来读不通。`); }
      } else Snd.fx.tick();
      lastSnap = snapped;
      root.classList.toggle('c4-spinme', !!S.seen.knob && snapped === K && !S.seen.spin && !S.finished);
    }
  }
  function flashGlow() { glowR.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' }); }

  /* ---------------- 读出一行 ---------------- */
  function readLine(j) {
    if (S.read[j]) return;
    S.read[j] = true; apply();
    Snd.fx.ink(); Snd.fx.chime(); flashGlow();
    const cell = root.querySelector(`.c4-cell[data-i="${j}"]`); cell.classList.remove('ink'); void cell.offsetWidth; cell.classList.add('ink');
    const left = S.read.filter(x => !x).length;
    narr(READ_NARR[j] + (left && left < 4 ? `（还有 ${left} 行）` : ''));
    if (!left) finish();
  }

  /* ---------------- 主循环 ---------------- */
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (dead) return;
    const dt = Math.min(.05, lastT ? (t - lastT) / 1000 : .016); lastT = t;
    if (document.hidden || flipping) return;
    const n = effN();
    if (!drag || drag.kind !== 'spin') {
      if (Math.abs(vel) > .02) { S.rot = wrap(S.rot + vel * dt); vel *= Math.exp(-dt * 2.4); dirty = true; rustle(); }
      else vel = 0;
      if (n === K && Math.abs(vel) < 1.6 && !busy) {
        let best = 0, bd = 9;
        for (let j = 0; j < K; j++) { const f = wrap(S.rot + TAU * (j + .5) / K); if (Math.abs(f) < Math.abs(bd)) { bd = f; best = j; } }
        if (Math.abs(bd) > .002) { S.rot = wrap(S.rot - bd * Math.min(1, dt * 5)); vel *= .9; dirty = true; }
      }
    }
    // 读行判定：对齐 + 转到红线前 + 停稳
    let cand = -1;
    if (n === K && Math.abs(vel) < .9 && !(drag && drag.kind === 'spin' && performance.now() - drag.t < 120)) {
      for (let j = 0; j < K; j++) if (Math.abs(wrap(S.rot + TAU * (j + .5) / K)) < .2) cand = j;
    }
    if (cand !== holdJ) { holdJ = cand; hold = 0; dirty = true; }
    if (n !== K) alignedT = 0; else alignedT += dt;
    if (cand >= 0 && !S.read[cand] && !S.finished && (alignedT > 1.4 || busy)) {
      const h0 = hold; hold += dt; if (h0 <= .05 && hold > .05) dirty = true;
      if (hold > .6) readLine(cand);
    }
    if (dirty) render();
  }

  /* ---------------- 结局 ---------------- */
  let finishing = false;
  async function finish() {
    if (finishing) return; finishing = true; busy = true; drag = null;
    S.finished = true; save();
    await wait(2400);
    narr('四行字都读出来了。七代人，翻来覆去用着同样几个名字——就像这根轴，一圈又一圈。');
    Snd.fx.magic();
    vel = 13;
    await wait(2600);
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    await wait(900);
    if (dead) return;
    await pushLeaf(makeLeaf(`<div class="c1-sheet c4-sheet">${ART4.sheet(LINES.map((l, i) => i === 1 || i === 2 ? l + '，' : l + '。'))}</div>`, 'La historia de la familia', false));
    Snd.stopDrone(); Snd.fx.chime();
    narr('乌尔苏拉活到一百多岁，见过太多同名的孩子。她终于明白：时间并没有往前走，只是在原地打转。');
    await wait(7000);
    busy = false;
    if (!dead && onComplete) onComplete();
  }

  /* ---------------- 提示 ---------------- */
  function stage() {
    const n = effN();
    if (S.read.every(Boolean)) return ['end', '四行字都读出来了。', '按 ↺ 可以重新缠一次。'];
    if (n !== K) {
      if (Number.isInteger(n)) return ['dec', '字排整齐了，却读不通。也许轴还差一点粗细。', '拖动左端的铜轮：一圈正好缠下 4 个字时（底部显示“一圈 4 字”），四行字会顺着木轴排开。'];
      return ['k', '羊皮带上的字斜斜地绕着轴，谁也读不通。梅尔基亚德斯说过：要把它缠在粗细刚好的轴上。', '按住左端的铜轮上下拖，改变木轴粗细。听到“咔哒”就是缠得整齐了——要找的是一圈 4 个字。'];
    }
    const left = S.read.filter(x => !x).length;
    return ['spin', `字已经排成行了。把每一行都转到红线上读一读，还剩 ${left} 行。`, '按住羊皮带上下拖，木轴会转动；转到某一行停住一会儿，它就会被读出来。'];
  }
  function getHint() {
    if (dead) return '';
    const [k, soft, hard] = stage();
    const lvl = S.hints[k] || 0; S.hints[k] = lvl + 1; save();
    Snd.fx.chime(); narr('梅尔基亚德斯低语：' + (lvl === 0 ? soft : hard), true);
    lastAct = Date.now();
    if (lvl > 0) { const el = $(k === 'spin' ? '#c4-arSpin' : '#c4-arKnob'); el && el.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 1200, iterations: 2 }); }
    return '';
  }

  /* ---------------- 自动解谜 ---------------- */
  function tween(from, to, ms, fn) {
    return new Promise(res => {
      const t0 = performance.now();
      const stepT = now => { if (dead) return res(); const p = Math.min(1, (now - t0) / ms), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; fn(from + (to - from) * e); dirty = true; if (p < 1) requestAnimationFrame(stepT); else res(); };
      requestAnimationFrame(stepT);
    });
  }
  async function autoSolve() {
    if (dead || finishing) return;
    if (S.finished) { if (onComplete) onComplete(); return; }
    busy = true; vel = 0; drag = null;
    narr('梅尔基亚德斯替你拧动了铜轮……', true);
    S.seen.knob = S.seen.spin = true;
    await tween(S.n, K, 1200, v => setN(v));
    for (let j = 0; j < K; j++) {
      if (S.read[j] || dead) continue;
      const target = S.rot - wrap(S.rot + TAU * (j + .5) / K);
      await tween(S.rot, target, 700, v => { S.rot = wrap(v); });
      await wait(250); if (dead) return;
      readLine(j);
      if (finishing) return;
      await wait(1100);
    }
  }

  /* ---------------- 启动 ---------------- */
  lastSnap = Number.isInteger(effN()) ? effN() : null;
  apply(); render();
  raf = requestAnimationFrame(frame);
  Snd.startDrone();
  every(() => { if (!nudged && !S.finished && Date.now() - lastAct > 50000) { nudged = true; narr('（卡住了？点右上角的 ✧，听听梅尔基亚德斯的低语。）', true); } }, 5000);
  if (!S.seen.intro) {
    later(() => { S.seen.intro = true; save(); narr('梅尔基亚德斯留下一根木轴，缠着一条长长的羊皮带。带子上的字东一个西一个，斜斜地绕着轴，谁也读不通。'); }, 500);
  } else if (S.finished) narr('四行字都读出来了。按右上角的 ↺ 可以重新缠一次。');
  else narr('木轴还缠在那里，等着你。');

  function destroy() {
    if (dead) return; dead = true;
    cancelAnimationFrame(raf);
    timers.forEach(t => clearTimeout(t)); timers.clear();
    intervals.forEach(t => clearInterval(t));
    cleanups.forEach(f => f());
    Snd.stopDrone();
    root.innerHTML = '';
    root.classList.remove('c1-root', 'c4-root', 'c4-knobme', 'c4-spinme', 'c4-snapped', 'c4-dragging');
  }
  return { destroy, getHint, autoSolve };
}
