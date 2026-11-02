/* =========================================================
   第三章 · 雨中的羊皮卷 —— 关卡引擎（单一场景）
   mountChapter3(root, { onComplete }) => { destroy, getHint, autoSolve }
   核心玩法：屋顶漏雨。拖动锡盘、木板、铜片改变倾角，再借窗外的风，
   让雨水一路流下去，冲掉羊皮卷上的四块霉斑，读出梅尔基亚德斯的预言。
   ========================================================= */
import { ART } from '../chapter1/art.js';
import { ART3 } from './art.js';
import { PLANKS, STAINS, newDrop, step, stainAt, FLOOR } from './physics.js';
import { Snd } from '../shared/sound.js';

const SAVE_KEY = 'macondo2_ch2';
const SVGNS = 'http://www.w3.org/2000/svg';
const NEED = 26;                       // 每块霉斑需要的水滴数
const SPAWN = .15;                     // 漏雨间隔（秒）
const MAX_DROPS = 46;
const LINES_ZH = ['家族的第一个人', '被捆在树上', '家族的最后一个人', '正被蚂蚁吃掉'];
const PIPS = ['初', '树', '末', '蚁'];
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function svgEl(tag, attrs) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
function svgPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); }

const NAMES = { leak: '屋顶的裂缝', window: '百叶窗', pots: '夜壶', aure: '奥雷里亚诺第二', stain: '霉斑', a: '锡盘', b: '木板', c: '铜片' };
const TALK = {
  leak: ['雨已经下了好几年。屋顶的裂缝像一张永远合不上的嘴。', '水滴一颗接一颗地落下来，比钟摆还准。'],
  pots: ['架子上摆满了夜壶。乌尔苏拉买了七十二个，这房间后来就叫“夜壶房”。', '一只夜壶里接满了雨水，水面上漂着一只死蛾子。'],
  aure: ['奥雷里亚诺第二：“这些字是梵文。可霉斑把最要紧的几行都盖住了。”', '奥雷里亚诺第二：“梅尔基亚德斯说过，这些羊皮卷要等一百年才能读懂。”', '奥雷里亚诺第二抱着膝盖，盯着水滴，一动不动。'],
  aureWet: ['一滴水正好落在奥雷里亚诺第二的头顶。他眨了眨眼，没有躲。', '奥雷里亚诺第二抹了一把脸：“……至少这雨是干净的。”'],
  stain: ['霉斑长成一片灰绿色的苔，把梵文吃掉了一块。', '用手擦只会把羊皮纸擦破。得用水慢慢冲。']
};

const INIT = () => ({ angs: [0, 14, -14], windowOpen: false, prog: [0, 0, 0, 0], clean: [false, false, false, false], finished: false, seen: {}, hints: {} });
function loadState() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) { const b = INIT(); return { ...b, ...s, seen: { ...s.seen }, hints: { ...s.hints } }; } } catch (e) { }
  return INIT();
}

export function mountChapter3(root, { onComplete } = {}) {
  let S = loadState();
  let dead = false, busy = false, flipping = false, raining = !S.finished;
  let drag = null, lastAct = Date.now(), nudged = false, raf = 0, lastT = 0, spawnT = 0;
  const drops = [];
  const timers = new Set(), intervals = [], cleanups = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms); timers.add(t); return t; };
  const wait = ms => new Promise(r => later(r, ms));
  const every = (fn, ms) => intervals.push(setInterval(() => { if (!dead) fn(); }, ms));
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const save = () => { if (dead) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } };
  const lineIdx = {};
  const line = k => { const a = TALK[k]; const i = (lineIdx[k] || 0) % a.length; lineIdx[k] = i + 1; return a[i]; };
  const cond = expr => expr.split('+').every(t => { t = t.trim(); const n = t[0] === '!'; if (n) t = t.slice(1); const v = S[t]; return n ? !v : !!v; });

  /* ---------------- DOM ---------------- */
  root.classList.add('c1-root', 'c3-root');
  root.innerHTML = `<svg class="c1-defs" aria-hidden="true">${ART.DEFS}${ART3.DEFS}</svg>
  <div class="c1-wrap">
    <div class="c1-head">
      <span class="c1-kicker"><b>CAP. II</b>Llovió cuatro años, once meses y dos días</span>
      <div class="c1-pips" title="雨中的羊皮卷">${PIPS.map((c, i) => `<div class="c1-pip" data-k="${i}"><span>${c}</span></div>`).join('')}</div>
    </div>
    <div class="c1-stage"><div class="c1-box"></div></div>
    <div class="c1-narr"><span></span></div>
    <div class="c1-bottom c3-bottom"><button class="c1-snd" type="button"></button>
      <div class="c3-strip">${LINES_ZH.map((l, i) => `<div class="c3-cell" data-i="${i}" style="flex:${l.length + 2} 1 0"><i></i><span></span></div>`).join('')}</div>
    </div>
    <div class="c1-tip"></div><div class="c1-flash c3-flash"></div>
  </div>`;
  const wrap = $('.c1-wrap'), box = $('.c1-box');
  const narrSpan = $('.c1-narr span'), tipEl = $('.c1-tip'), flashEl = $('.c1-flash'), sndBtn = $('.c1-snd');
  const syncSnd = () => { sndBtn.textContent = '♪'; sndBtn.classList.toggle('off', !Snd.on); sndBtn.title = Snd.on ? '关闭声音' : '开启声音'; };
  syncSnd();

  /* ---------------- 书页 ---------------- */
  const leaves = [];
  // 图注用 HTML 写：场景每帧重绘时，Chrome 偶尔会把书框里的 SVG 文字画错位置
  function makeLeaf(inner, cap, plate) {
    const el = document.createElement('div'); el.className = 'c1-leaf';
    el.innerHTML = inner + ART.FRAME('', plate) + `<div class="c3-cap">${cap}</div><div class="c1-shade"></div>`;
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
  pushLeaf(makeLeaf(`<div class="c1-plate">${ART3.main()}</div>`, 'Lám. I · El cuarto de Melquíades', true));
  const svg = $('#c3-main'), dropG = $('#c3-drops'), fxG = $('#c3-fx'), wetsG = $('#c3-wets'), eyes = $('.c3-eyes'), wetHair = $('#c3-wetHair');

  /* ---------------- 渲染 ---------------- */
  function apply() {
    if (dead) return;
    $$('[data-if]').forEach(el => { el.style.display = cond(el.dataset.if) ? '' : 'none'; });
    PLANKS.forEach((p, i) => $(`#c3-p-${p.id}`).setAttribute('transform', `rotate(${S.angs[i].toFixed(1)} ${p.cx} ${p.cy})`));
    STAINS.forEach((s, i) => {
      const p = S.clean[i] ? 1 : S.prog[i] / NEED;
      const m = $(`#c3-mold${i}`); m.style.opacity = (1 - p * .96).toFixed(3);
      m.setAttribute('transform', `translate(${s.x} 350) scale(${(1 - p * .35).toFixed(3)}) translate(${-s.x} -350)`);
      $(`#c3-text${i}`).style.opacity = (.15 + p * .85).toFixed(3);
    });
    $$('.c1-pip').forEach(p => p.classList.toggle('on', !!S.clean[+p.dataset.k]));
    $$('.c3-cell').forEach(c => {
      const i = +c.dataset.i, on = S.clean[i];
      c.classList.toggle('on', on);
      c.querySelector('span').textContent = on ? LINES_ZH[i] : '';
      c.querySelector('i').style.width = on ? '100%' : (S.prog[i] / NEED * 100).toFixed(0) + '%';
    });
    root.classList.toggle('c3-windy', S.windowOpen && !S.finished);
    root.classList.toggle('c3-grabme', !S.seen.dragged);
    save();
  }

  /* ---------------- 旁白 ---------------- */
  let narrT = null;
  function narr(text, whisper = false) {
    if (narrT) { clearTimeout(narrT); timers.delete(narrT); }
    narrSpan.classList.add('out');
    narrT = later(() => { narrT = null; narrSpan.textContent = text; narrSpan.classList.toggle('whisper', whisper); narrSpan.classList.remove('out'); }, 200);
  }
  function hideTip() { tipEl.classList.remove('show'); }
  function tip(e) {
    if (e.pointerType !== 'mouse' || drag) return hideTip();
    const el = e.target.closest('[data-hot],[data-plank]');
    if (!el) return hideTip();
    const name = NAMES[el.dataset.hot || el.dataset.plank]; if (!name) return hideTip();
    const r = wrap.getBoundingClientRect();
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
    tipEl.textContent = el.dataset.plank ? `${name} · 拖动` : name; tipEl.classList.add('show');
  }

  /* ---------------- 声音 ---------------- */
  const lastSnd = {};
  function drip(kind, x = 200) {
    const now = performance.now(); if (now - (lastSnd[kind] || 0) < 75) return; lastSnd[kind] = now;
    const j = Math.random() * 60;
    if (kind === 0) Snd.tone(1380 + j, .16, 'sine', .022, 1100);               // 锡盘：叮
    else if (kind === 1) { Snd.noise(.05, .1, 700 + j, 5); }                    // 木板：笃
    else if (kind === 2) Snd.tone(980 + j, .3, 'triangle', .02, 940);           // 铜片：嗡
    else if (kind === 'paper') Snd.noise(.06, .05, 2400 + x, 1.4);
    else if (kind === 'floor') Snd.noise(.04, .035, 1600, 1.2);
    else if (kind === 'pool') Snd.tone(760 + j, .12, 'sine', .018, 600);
  }

  /* ---------------- 水滴 ---------------- */
  const pool = [];
  for (let i = 0; i < MAX_DROPS; i++) { const e = svgEl('ellipse', { rx: 1.7, ry: 2.4, fill: 'url(#c3-drop)', stroke: '#5f807d', 'stroke-width': .45, display: 'none' }); dropG.appendChild(e); pool.push(e); }
  let splashN = 0;
  function splash(x, y, big = false) {
    if (splashN > 14) return; splashN++;
    const g = svgEl('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
    for (let k = 0; k < (big ? 5 : 3); k++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, l = 4 + Math.random() * (big ? 9 : 5);
      g.appendChild(svgEl('circle', { cx: (Math.cos(a) * l).toFixed(1), cy: (Math.sin(a) * l).toFixed(1), r: .9, fill: '#e2ece8', stroke: '#5f807d', 'stroke-width': .3 }));
    }
    g.appendChild(svgEl('ellipse', { cx: 0, cy: 1, rx: big ? 6 : 4, ry: 1.4, fill: 'none', stroke: '#e2ece8', 'stroke-width': .7 }));
    fxG.appendChild(g);
    const an = g.animate([{ opacity: 1, transform: `translate(${x}px,${y}px) scale(.4)` }, { opacity: 0, transform: `translate(${x}px,${y - 2}px) scale(1.2)` }], { duration: 420, easing: 'ease-out' });
    an.onfinish = () => { g.remove(); splashN--; };
  }
  function wetSpot(x) {
    if (wetsG.childNodes.length > 22) wetsG.firstChild.remove();
    const e = svgEl('ellipse', { cx: x.toFixed(1), cy: 349 + Math.random() * 4, rx: 5 + Math.random() * 4, ry: 2.6, fill: 'url(#c3-wet)' });
    wetsG.appendChild(e);
    e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 5000, easing: 'ease-in', fill: 'forwards' }).onfinish = () => e.remove();
  }

  let lastPool = 0, aureHits = 0, missStreak = 0, lastMissNote = 0;
  function onEvent(d, ev) {
    if (ev.type === 'hit') { drip(ev.p); if (Math.random() < .3) splash(d.x, d.y - 1); }
    else if (ev.type === 'pool') {
      drip('pool'); splash(d.x, d.y - 2);
      const now = Date.now();
      if (!S.seen.pool && now - lastPool > 4000) { lastPool = now; S.seen.pool = true; save(); narr('水落在平放的锡盘里，叮叮当当地积成一小洼。得让它斜过来，水才会流走。'); }
    } else if (ev.type === 'floor') {
      const i = stainAt(d.x);
      const onScroll = d.x > 22 && d.x < 378;
      drip(onScroll ? 'paper' : 'floor', d.x); splash(d.x, FLOOR, i >= 0);
      if (onScroll) wetSpot(d.x);
      if (i >= 0 && !S.clean[i]) { missStreak = 0; wash(i); }
      else if (!S.finished) {
        missStreak++;
        if (S.seen.dragged && missStreak > 70 && Date.now() - lastMissNote > 16000) {
          lastMissNote = Date.now(); missStreak = 0;
          narr(pick(['水落在了干净的羊皮纸上，洇开一圈，又慢慢干了。', '水流离霉斑还差一点。', '奥雷里亚诺第二伸长脖子看着：“再偏一点……”']));
        }
      }
    }
  }
  function aureHit(d) {
    aureHits++; wetHair.style.opacity = '1'; splash(d.x, d.y);
    if (aureHits % 14 === 1) narr(line('aureWet'));
  }
  let washNote = [0, 0, 0, 0];
  function wash(i) {
    S.prog[i]++;
    if (S.prog[i] === 3 && !washNote[i]) { washNote[i] = 1; narr(pick(['霉斑在水里慢慢化开，底下露出一点墨迹……', '灰绿色的苔被水冲开了一角。', '有用！霉斑正在褪去。'])); }
    if (S.prog[i] >= NEED) return cleaned(i);
    if (S.prog[i] % 3 === 0) apply();
  }
  function cleaned(i) {
    S.clean[i] = true; S.prog[i] = NEED; apply();
    Snd.fx.chime(); Snd.fx.write();
    const ring = $(`#c3-ring${i}`); ring.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.3)' }], { duration: 1200, easing: 'ease-out' });
    const cell = root.querySelector(`.c3-cell[data-i="${i}"]`); cell.classList.remove('ink'); void cell.offsetWidth; cell.classList.add('ink');
    const n = S.clean.filter(Boolean).length;
    const reads = [
      `霉斑化开了，露出一行弯弯曲曲的梵文。奥雷里亚诺第二慢慢念出来：“${LINES_ZH[i]}……”`,
      `又一块霉斑被冲走了。奥雷里亚诺第二念道：“${LINES_ZH[i]}。”他的声音有点发抖。`,
      `“${LINES_ZH[i]}……”奥雷里亚诺第二抬起头，看了看漏雨的屋顶。`
    ];
    if (n < 4) narr(reads[Math.min(n - 1, 2)]);
    if (n === 3 && !S.clean[3]) later(() => { if (!S.clean[3]) narr('最右边那块霉斑离铜片太远了，水怎么也够不着。窗外的风呼呼地刮着百叶窗……'); }, 4200);
    if (n === 4) finish();
  }

  /* ---------------- 主循环 ---------------- */
  let lookX = 0;
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (dead) return;
    const dt = Math.min(.04, lastT ? (t - lastT) / 1000 : .016); lastT = t;
    if (document.hidden || flipping) return;
    if (raining) {
      spawnT += dt;
      while (spawnT >= SPAWN) { spawnT -= SPAWN; if (drops.length < MAX_DROPS) drops.push(newDrop((Math.random() - .5) * 1.6)); }
    }
    const half = dt / 2;
    let sx = 0, sn = 0;
    for (let k = drops.length - 1; k >= 0; k--) {
      const d = drops[k];
      for (let s = 0; s < 2 && d.mode !== 'dead'; s++) { const ev = step(d, half, S.angs, S.windowOpen); if (ev) onEvent(d, ev); }
      if (d.mode === 'dead') { drops.splice(k, 1); continue; }
      if (d.mode === 'fall' && !d.ha && Math.abs(d.x - 200) < 19 && d.y > 204 && d.y < 250) { d.ha = 1; aureHit(d); }
      if (d.y > 150) { sx += d.x; sn++; }
    }
    for (let i = 0; i < pool.length; i++) {
      const e = pool[i], d = drops[i];
      if (!d) { if (e.getAttribute('display') !== 'none') e.setAttribute('display', 'none'); continue; }
      e.setAttribute('display', '');
      const sp = d.mode === 'slide' ? 0 : Math.min(1, Math.hypot(d.vx, d.vy) / 420);
      e.setAttribute('cx', d.x.toFixed(1)); e.setAttribute('cy', d.y.toFixed(1));
      e.setAttribute('ry', (d.mode === 'slide' ? 2 : 2.7 + sp * 3).toFixed(2));
      e.setAttribute('rx', (d.mode === 'slide' ? 2.8 : 2.3 - sp * .5).toFixed(2));
    }
    // 奥雷里亚诺第二的眼睛跟着水流
    const target = sn ? clamp((sx / sn - 200) / 70, -1.3, 1.3) : 0;
    lookX += (target - lookX) * Math.min(1, dt * 4);
    if (eyes) eyes.setAttribute('transform', `translate(${lookX.toFixed(2)} ${(.7).toFixed(2)})`);
  }

  /* ---------------- 交互 ---------------- */
  function on(target, type, fn, opt) { target.addEventListener(type, fn, opt); cleanups.push(() => target.removeEventListener(type, fn, opt)); }
  on(sndBtn, 'click', () => { Snd.unlock(); Snd.toggle(); syncSnd(); if (Snd.on) Snd.startDrone(); });
  on(root, 'pointerdown', () => { Snd.unlock(); Snd.startDrone(); }, { once: true });

  let creakT = 0;
  function setAng(i, ang) {
    const p = PLANKS[i], v = clamp(ang, p.min, p.max), d = v - S.angs[i];
    S.angs[i] = v;
    $(`#c3-p-${p.id}`).setAttribute('transform', `rotate(${v.toFixed(1)} ${p.cx} ${p.cy})`);
    const now = performance.now();
    if (Math.abs(d) > .6 && now - creakT > 90) { creakT = now; Snd.tone(90 + Math.abs(v) * 2.2 + (i * 25), .08, 'sawtooth', .012, 70); }
  }
  on(box, 'pointerdown', e => {
    if (busy || flipping || S.finished) return;
    const el = e.target.closest('[data-plank]'); if (!el) return;
    const i = PLANKS.findIndex(p => p.id === el.dataset.plank);
    drag = { i, moved: 0, lx: e.clientX, ly: e.clientY };
    try { el.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault(); hideTip(); lastAct = Date.now();
    root.classList.add('c3-dragging');
  });
  on(box, 'pointermove', e => {
    if (!drag) return tip(e);
    drag.moved += Math.hypot(e.clientX - drag.lx, e.clientY - drag.ly); drag.lx = e.clientX; drag.ly = e.clientY;
    const p = PLANKS[drag.i], q = svgPt(svg, e.clientX, e.clientY);
    let dx = q.x - p.cx, dy = q.y - p.cy;
    if (Math.abs(dx) < 6) return;
    if (dx < 0) { dx = -dx; dy = -dy; }
    setAng(drag.i, Math.atan2(dy, dx) * 180 / Math.PI);
    lastAct = Date.now();
  });
  const endDrag = () => {
    if (!drag) return;
    const d = drag; drag = null; root.classList.remove('c3-dragging');
    if (d.moved < 5) { Snd.fx.click(); narr(plankLine(d.i)); return; }
    if (!S.seen.dragged) { S.seen.dragged = true; later(() => narr('板子斜过来了，雨水顺着它淌了下去。看看水最后落在哪里。'), 300); }
    apply();
  };
  on(box, 'pointerup', endDrag);
  on(box, 'pointercancel', endDrag);
  on(box, 'pointerleave', hideTip);
  function plankLine(i) {
    return ['一只旧锡盘，钉在墙上，能绕着钉子转。雨水落在上面叮叮作响。按住一端上下拖。',
      '一块木板，也能绕着钉子转。按住一端上下拖。',
      '一片生了铜绿的铜片，绕着钉子转。按住一端上下拖。'][i];
  }

  on(box, 'click', e => {
    if (busy || flipping) return;
    const el = e.target.closest('[data-hot]'); if (!el) return;
    lastAct = Date.now();
    const id = el.dataset.hot;
    if (id === 'window') return toggleWindow();
    if (S.finished) return;
    Snd.fx.click();
    if (id === 'stain') {
      const i = +el.dataset.i;
      if (S.clean[i]) return narr(`这一行已经露出来了：“${LINES_ZH[i]}”。`);
      if (!S.seen.stainTip) { S.seen.stainTip = true; save(); return narr('霉斑长成一片灰绿色的苔，把梵文吃掉了一块。用手擦只会把羊皮纸擦破——得让雨水慢慢冲。'); }
      return narr(line('stain'));
    }
    if (TALK[id]) narr(line(id));
  });
  function toggleWindow() {
    if (S.finished) return narr('雨停了。窗外的阳光照在湿漉漉的院子里。');
    S.windowOpen = !S.windowOpen; apply();
    if (S.windowOpen) {
      Snd.fx.creak(); Snd.noise(1.2, .07, 500, .5, 0, 'lowpass');
      narr(S.seen.winOpened ? '百叶窗被推开，风夹着雨灌进来。屋里的水滴全都歪向了右边。'
        : '你推开百叶窗——一阵风夹着雨扑进屋里，蜡烛的火苗倒向一边。屋顶漏下的水滴，全都被吹得歪向了右边。');
      S.seen.winOpened = true; save();
    } else { Snd.fx.knock(); narr('百叶窗合上了。风声小了，水滴又笔直地落下来。'); }
  }
  every(() => { if (S.windowOpen && !S.finished && !document.hidden) Snd.noise(1.6, .045, 420 + Math.random() * 200, .6, 0, 'lowpass'); }, 1700);

  /* ---------------- 结局 ---------------- */
  let finishing = false;
  async function finish() {
    if (finishing) return; finishing = true; busy = true; drag = null;
    S.finished = true; save();
    narr('最后一块霉斑也化开了。四行梵文，第一次完整地出现在羊皮卷上。');
    await wait(2600);
    raining = false; S.windowOpen = true; apply();
    Snd.fx.magic();
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    const sb = $('#c3-sunbeam'), ss = $('#c3-sunSky');
    sb && sb.animate([{ opacity: 0 }, { opacity: .32 }], { duration: 2400, fill: 'forwards' });
    ss && ss.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 2400, fill: 'forwards' });
    root.classList.add('c3-sunny');
    narr('就在这时，雨停了——一共下了四年十一个月零两天。');
    await wait(3400);
    if (dead) return;
    const el = makeLeaf(`<div class="c1-sheet c3-sheet">${ART3.prophecy(LINES_ZH.map((l, i) => i % 2 ? l + '。' : l + '，'))}</div>`, 'Sánscrito, cien años antes', false);
    await pushLeaf(el);
    Snd.stopDrone(); Snd.fx.chime();
    narr('奥雷里亚诺第二把它抄在了本子上。很多年以后，另一个奥雷里亚诺才会明白，这句话说的是谁。');
    await wait(7000);
    busy = false;
    if (!dead && onComplete) onComplete();
  }

  /* ---------------- 提示 ---------------- */
  function stage() {
    if (!S.seen.dragged) return ['drag', '雨从屋顶的裂缝漏下来，正落在墙上那只锡盘里。羊皮卷上的霉斑，要用水慢慢冲。', '按住锡盘的一端上下拖动，让它斜过来，水就会顺着流到下面的板子上。'];
    const i = [0, 1, 2, 3].find(k => !S.clean[k]);
    if (i === undefined) return ['end', '雨已经停了。', '按 ↺ 可以重新经历这场雨。'];
    return [
      ['s0', '最左边那块霉斑。水要一路往左走。', '锡盘左端朝下，左边的木板也左端朝下（斜一点就够）。'],
      ['s1', '左边第二块霉斑，就在木板右端的正下方。', '锡盘左端朝下，左边的木板改成右端朝下。'],
      ['s2', '右边的铜片得斜得很陡，水才会落回中间来。', '锡盘右端朝下，铜片左端朝下，并且斜得陡一些（约 30° 以上）。'],
      ['s3', '最右边那块霉斑，水怎么也够不着……窗外的风正刮得紧。', '点左上角的百叶窗把它推开，风会把水滴吹向右边；锡盘和铜片都让右端朝下。']
    ][i];
  }
  function getHint() {
    if (dead) return '';
    const [k, soft, hard] = stage();
    const lvl = S.hints[k] || 0; S.hints[k] = lvl + 1; save();
    Snd.fx.chime(); narr('梅尔基亚德斯低语：' + (lvl === 0 ? soft : hard), true);
    lastAct = Date.now();
    if (lvl > 0 && k.startsWith('s')) { const r = $(`#c3-ring${k[1]}`); r && r.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 1400, iterations: 2 }); }
    return '';
  }

  /* ---------------- 自动解谜 ---------------- */
  async function autoSolve() {
    if (dead || finishing) return;
    if (S.finished) { if (onComplete) onComplete(); return; }
    narr('梅尔基亚德斯替你拨动了那几块板子……', true);
    busy = true;
    const plan = [[[-30, -30, -14], false, 0], [[-30, 30, -14], false, 1], [[30, 14, -36], false, 2], [[30, 14, 30], true, 3]];
    for (const [angs, win, i] of plan) {
      if (S.clean[i]) continue;
      S.windowOpen = win; S.angs = angs.slice(); apply();
      await wait(1100); if (dead) return;
      cleaned(i);
      if (finishing) return;
      await wait(900); if (dead) return;
    }
  }

  /* ---------------- 启动 ---------------- */
  apply();
  if (S.finished) { raining = false; root.classList.add('c3-sunny'); const sb = $('#c3-sunbeam'), ss = $('#c3-sunSky'); if (sb) sb.style.opacity = '.32'; if (ss) ss.style.opacity = '1'; }
  raf = requestAnimationFrame(frame);
  Snd.startDrone();
  every(() => { if (!nudged && !S.finished && Date.now() - lastAct > 50000) { nudged = true; narr('（卡住了？点右上角的 ✧，听听梅尔基亚德斯的低语。）', true); } }, 5000);
  if (!S.seen.intro) {
    later(() => { S.seen.intro = true; save(); narr('雨下个不停。梅尔基亚德斯房间的屋顶漏了，水滴答滴答地落进墙上的锡盘里。地上摊着他的羊皮卷——最要紧的几行，被霉斑盖住了。'); }, 500);
  } else if (S.finished) narr('雨已经停了。按右上角的 ↺ 可以重新经历这场雨。');
  else narr('雨还在下。书页停在你离开的地方。');

  function destroy() {
    if (dead) return; dead = true;
    cancelAnimationFrame(raf);
    timers.forEach(t => clearTimeout(t)); timers.clear();
    intervals.forEach(t => clearInterval(t));
    cleanups.forEach(f => f());
    Snd.stopDrone();
    root.innerHTML = '';
    root.classList.remove('c1-root', 'c3-root', 'c3-windy', 'c3-sunny', 'c3-grabme', 'c3-dragging');
  }
  return { destroy, getHint, autoSolve };
}
