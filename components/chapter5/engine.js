/* =========================================================
   第五章 · 小金鱼的时间 —— 关卡引擎（单一场景，无人物）
   mountChapter5(root, { onComplete }) => { destroy, getHint, autoSolve }
   核心玩法：「昨天的手」。作坊里有三件事要同时做：拉风箱（把金子烧化）、
   压住夹子（把鱼模夹紧）、推起坩埚（把金水倒进去）。可你只有一只手。
   点亮蜡烛，一天开始；蜡烛烧完，上校把一切熔回坩埚，第二天从头再来——
   但昨天的你会原样把昨天做过的事再做一遍。和昨天、前天的自己一起，铸出两条小金鱼。
   ========================================================= */
import { ART } from '../chapter1/art.js';
import { ART5, GEO } from './art.js';
import { Snd } from '../shared/sound.js';

const SAVE_KEY = 'macondo2_ch5';
const HZ = 30, DAY_S = 12, DAY = HZ * DAY_S, DT = 1 / HZ;
const KEYS = ['b', 'c', 't'];
const NAMES = { b: '风箱', c: '夹子', t: '坩埚' };
const PIP = { b: '风', c: '夹', t: '倒' };
const LIQ = .55, POUR = .55, CLAMP = .8, FILL_S = 1.6, GOLD = 1.3;
const ACTIVE = { b: .1, c: .5, t: .5 };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * clamp(t, 0, 1)).toString(16).padStart(2, '0')).join('');
function svgPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function rot(x, y, cx, cy, deg) { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; }
const emptyRec = () => ({ b: new Array(DAY).fill(0), c: new Array(DAY).fill(0), t: new Array(DAY).fill(0) });
const recActive = (rec, k) => rec[k].some(v => v > ACTIVE[k]);

const INIT = () => ({ day: 1, rec: null, finished: false, seen: {}, hints: {} });
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s) {
      const b = INIT(), out = { ...b, ...s, seen: { ...s.seen }, hints: { ...s.hints } };
      if (s.rec && KEYS.every(k => Array.isArray(s.rec[k]) && s.rec[k].length === DAY)) {
        out.rec = {}; KEYS.forEach(k => { out.rec[k] = s.rec[k].map(v => v / 100); });
      } else out.rec = null;
      return out;
    }
  } catch (e) { }
  return INIT();
}

/* 自动解谜用：三天的手叠在一起的“标准答案” */
function idealRec() {
  const r = emptyRec();
  for (let i = 0; i < DAY; i++) {
    if (i >= 15 && i < 330) r.b[i] = (1 - Math.cos(2 * Math.PI * (i - 15) / 14)) / 2;
    if (i >= 75 && i < 300) r.c[i] = Math.min(1, (i - 75) / 6);
    if (i >= 105 && i < 260) r.t[i] = Math.min(1, (i - 105) / 6);
  }
  return r;
}

export function mountChapter5(root, { onComplete } = {}) {
  let S = loadState();
  let rec = S.rec || emptyRec();
  let today = emptyRec();
  let phase = S.finished ? 'done' : 'idle';
  let dead = false, busy = false, flipping = false, raf = 0, lastT = 0, acc = 0, tick = 0;
  let drag = null, lastAct = Date.now(), nudged = false;
  const cur = { b: 0, c: 0, t: 0 }, pv = { b: 0, c: 0, t: 0 }, held = { b: false, c: false, t: false }, rel = { b: 0, c: 0, t: 0 };
  let heat = 0, fill = 0, gold = GOLD, spilled = 0, flowing = false, leaking = false, prevB = 0, pumpArmed = true, wasLiquid = false;
  let dayFlags = {};
  const timers = new Set(), intervals = [], cleanups = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms); timers.add(t); return t; };
  const wait = ms => new Promise(r => later(r, ms));
  const every = (fn, ms) => intervals.push(setInterval(() => { if (!dead) fn(); }, ms));
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const save = () => {
    if (dead) return;
    try {
      const out = { ...S, rec: null };
      if (S.rec) { out.rec = {}; KEYS.forEach(k => { out.rec[k] = S.rec[k].map(v => Math.round(v * 100)); }); }
      localStorage.setItem(SAVE_KEY, JSON.stringify(out));
    } catch (e) { }
  };

  /* ---------------- DOM ---------------- */
  root.classList.add('c1-root', 'c5-root');
  root.innerHTML = `<svg class="c1-defs" aria-hidden="true">${ART.DEFS}${ART5.DEFS}</svg>
  <div class="c1-wrap">
    <div class="c1-head">
      <span class="c1-kicker"><b>CAP. V</b>Los pescaditos de oro</span>
    </div>
    <div class="c1-stage"><div class="c1-box"></div></div>
    <div class="c1-narr"><span></span></div>
    <div class="c1-bottom c5-bottom"><button class="c1-snd" type="button"></button>
      <div class="c5-day"><b class="c5-dnum"></b><button class="c5-forget" type="button" title="清空昨天的记录，从只有一只手重新开始">忘掉昨天</button></div>
      <div class="c5-tl">${KEYS.map(k => `<div class="c5-row" data-k="${k}"><em>${NAMES[k]}</em><div class="c5-track"><span class="y"></span><span class="n"></span></div></div>`).join('')}</div>
    </div>
    <div class="c1-tip"></div><div class="c1-flash"></div>
  </div>`;
  const wrapEl = $('.c1-wrap'), box = $('.c1-box');
  const narrSpan = $('.c1-narr span'), tipEl = $('.c1-tip'), flashEl = $('.c1-flash'), sndBtn = $('.c1-snd');
  const dnum = $('.c5-dnum'), forgetBtn = $('.c5-forget'), tl = $('.c5-tl');
  const syncSnd = () => { sndBtn.textContent = '♪'; sndBtn.classList.toggle('off', !Snd.on); sndBtn.title = Snd.on ? '关闭声音' : '开启声音'; };
  syncSnd();

  /* ---------------- 书页 ---------------- */
  const leaves = [];
  function makeLeaf(inner, cap, plate) {
    const el = document.createElement('div'); el.className = 'c1-leaf';
    el.innerHTML = inner + ART.FRAME('', plate) + `<div class="c5-capt">${cap}</div><div class="c1-shade"></div>`;
    return el;
  }
  const FLIP = 560;
  function pushLeaf(el) {
    const curL = leaves[leaves.length - 1];
    leaves.push(el); box.appendChild(el);
    if (!curL) return Promise.resolve();
    flipping = true; hideTip(); Snd.fx.page();
    el.style.zIndex = 1; curL.style.zIndex = 2;
    const a = curL.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-92deg)' }], { duration: FLIP, easing: 'cubic-bezier(.55,.05,.8,.45)', fill: 'forwards' });
    curL.querySelector('.c1-shade').animate([{ opacity: 0 }, { opacity: .85 }], { duration: FLIP, fill: 'forwards' });
    el.querySelector('.c1-shade').animate([{ opacity: .7 }, { opacity: 0 }], { duration: FLIP + 260, easing: 'ease-out' });
    return new Promise(res => { a.onfinish = () => { curL.classList.add('c1-hidden'); curL.style.zIndex = ''; el.style.zIndex = ''; flipping = false; res(); }; });
  }
  pushLeaf(makeLeaf(`<div class="c1-plate">${ART5.main()}</div>`, 'Lám. V · El taller del coronel', true));
  const svg = $('#c5-main');
  const E = id => $('#c5-' + id);
  const el = {
    bTop: E('bTop'), leather: E('leather'), pleats: E('pleats'), puff: E('puff'), cru: E('cru'), goldIn: E('goldIn'),
    stream: E('stream'), leak: E('leak'), puddle: E('puddle'), fill: E('fill'), moldR: E('moldR'), lever: E('lever'),
    heat: E('heat'), fire: E('fire'), coals: E('coals'), sun: E('sun'), moon: E('moon'), sky: E('sky'),
    wax: E('wax'), wick: E('wick'), flame: E('flame'), night: E('night'), fishes: E('fishes'),
    g: { b: E('gB'), c: E('gC'), t: E('gT') },
  };

  /* ---------------- 渲染 ---------------- */
  const [hx, hy] = GEO.hinge, BL = GEO.boardL, [px, py] = GEO.pivot, [lx, ly] = GEO.lever, LL = GEO.leverL;
  const ybot = x => 292 + (284 - 292) * (x - GEO.bx0) / (hx - GEO.bx0);
  const angB = () => 16 * (1 - cur.b), angT = () => cur.t * 52, angC = () => -16 + cur.c * 26;
  const handle = {
    b: () => rot(hx - BL - 17, hy - 1, hx, hy, angB()),
    t: () => rot(px - 120, py - 48, px, py, angT()),
    c: () => rot(lx + LL + 4, ly, lx, ly, angC()),
  };
  let puffT = 0;
  function render() {
    // 风箱
    const aB = angB();
    el.bTop.setAttribute('transform', `rotate(${aB.toFixed(2)} ${hx} ${hy})`);
    const [plx, ply] = rot(hx - BL, hy + 2, hx, hy, aB);
    el.leather.setAttribute('d', `M${hx - 2} ${hy + 2} L${plx.toFixed(1)} ${ply.toFixed(1)} L${plx.toFixed(1)} ${ybot(plx).toFixed(1)} L${hx} 284 Z`);
    let pd = '';
    for (const f of [.25, .5, .75]) {
      const [tx, ty] = rot(hx - BL * f, hy + 2, hx, hy, aB), by = ybot(tx), my = (ty + by) / 2;
      pd += `M${tx.toFixed(1)} ${ty.toFixed(1)} L${(tx - 6).toFixed(1)} ${my.toFixed(1)} L${tx.toFixed(1)} ${by.toFixed(1)} `;
    }
    el.pleats.setAttribute('d', pd);
    el.puff.setAttribute('opacity', puffT > 0 ? (puffT * 1.6).toFixed(2) : 0);
    // 炉火
    el.heat.setAttribute('opacity', (heat * .95).toFixed(2));
    el.fire.setAttribute('opacity', (.12 + heat * .88).toFixed(2));
    el.coals.setAttribute('fill', mix('#3a2a22', '#d2561c', heat));
    // 坩埚
    el.cru.setAttribute('transform', `rotate(${angT().toFixed(2)} ${px} ${py})`);
    el.goldIn.setAttribute('fill', mix('#8a6a2a', '#ffd65a', heat < LIQ ? heat * .5 : .6 + (heat - LIQ) * .9));
    el.goldIn.setAttribute('opacity', gold > .02 ? 1 : 0);
    // 金水
    el.stream.setAttribute('opacity', flowing ? 1 : 0);
    if (flowing) el.stream.setAttribute('d', `M${px + 2} ${py} C${px + 18} ${py + 2} ${GEO.sprue[0]} ${py + 22} ${GEO.sprue[0]} ${GEO.sprue[1] - 2}`);
    el.leak.setAttribute('opacity', leaking ? 1 : 0);
    if (leaking) el.leak.setAttribute('d', `M${GEO.seam + 1} 262 q5 14 2 38`);
    el.puddle.setAttribute('rx', Math.min(34, spilled * 46).toFixed(1));
    const h = Math.min(1, fill) * 66;
    el.fill.setAttribute('y', (302 - h).toFixed(1)); el.fill.setAttribute('height', h.toFixed(1));
    // 夹子
    el.lever.setAttribute('transform', `rotate(${angC().toFixed(2)} ${lx} ${ly})`);
    if (phase !== 'done') el.moldR.setAttribute('transform', `translate(${((1 - cur.c) * 5).toFixed(2)} 0)`);
    // 一天：太阳 + 蜡烛
    const p = phase === 'day' ? tick / DAY : phase === 'idle' ? 0 : 1;
    el.sun.setAttribute('cx', (36 + p * 68).toFixed(1)); el.sun.setAttribute('cy', (104 - Math.sin(p * Math.PI) * 48).toFixed(1));
    el.sky.setAttribute('fill', mix('#f3e6c2', '#e9b98a', Math.max(0, p - .7) / .3));
    const wh = 38 * (1 - (phase === 'day' ? p : 0) * .82), wy = 116 - wh;
    el.wax.setAttribute('y', wy.toFixed(1)); el.wax.setAttribute('height', wh.toFixed(1));
    el.wick.setAttribute('d', `M362 ${wy.toFixed(1)} v-4`);
    el.flame.setAttribute('opacity', phase === 'day' || phase === 'done' ? 1 : 0);
    el.flame.setAttribute('transform', `translate(0 ${(wy - 78).toFixed(1)})`);
    // 昨天的手
    KEYS.forEach(k => {
      const on = phase === 'day' && !held[k] && rec[k][tick] > (k === 'b' ? .04 : .2);
      el.g[k].setAttribute('opacity', on ? .9 : 0);
      if (on) { const [x, y] = handle[k](); el.g[k].setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); }
    });
    tl.style.setProperty('--p', p.toFixed(4));
  }

  function trackHTML(arr, k, upto = DAY) {
    let s = '', st = -1;
    for (let i = 0; i <= upto; i++) {
      const on = i < upto && arr[i] > ACTIVE[k];
      if (on && st < 0) st = i;
      if (!on && st >= 0) { s += `<i style="left:${(st / DAY * 100).toFixed(2)}%;width:${((i - st) / DAY * 100).toFixed(2)}%"></i>`; st = -1; }
    }
    return s;
  }
  function drawYesterday() {
    KEYS.forEach(k => {
      const row = root.querySelector(`.c5-row[data-k="${k}"]`);
      row.querySelector('.y').innerHTML = trackHTML(rec[k], k);
      row.querySelector('.n').innerHTML = '';
      row.classList.toggle('on', recActive(rec, k));
    });
    $$('.c1-pip').forEach(p => p.classList.toggle('on', S.finished || recActive(rec, p.dataset.k)));
  }
  function drawToday() { KEYS.forEach(k => { root.querySelector(`.c5-row[data-k="${k}"] .n`).innerHTML = trackHTML(today[k], k, tick); }); }

  function apply() {
    if (dead) return;
    dnum.textContent = `第 ${S.day} 天`;
    forgetBtn.disabled = phase !== 'idle' || busy || !KEYS.some(k => recActive(rec, k));
    root.classList.toggle('c5-lightme', phase === 'idle' && !busy);
    root.classList.toggle('c5-daytime', phase === 'day');
  }

  /* ---------------- 旁白 / 提示框 ---------------- */
  let narrT = null;
  function narr(text, whisper = false) {
    if (narrT) { clearTimeout(narrT); timers.delete(narrT); }
    narrSpan.classList.add('out');
    narrT = later(() => { narrT = null; narrSpan.textContent = text; narrSpan.classList.toggle('whisper', whisper); narrSpan.classList.remove('out'); }, 200);
  }
  function hideTip() { tipEl.classList.remove('show'); }
  const TIPS = { b: '风箱 · 按住把手上下拉', c: '夹子 · 按住往下压', t: '坩埚 · 按住长柄往上推', candle: '蜡烛 · 点亮，开始新的一天' };
  function tip(e) {
    if (e.pointerType !== 'mouse' || drag) return hideTip();
    const h = e.target.closest('[data-hot]'); if (!h) return hideTip();
    const r = wrapEl.getBoundingClientRect();
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
    tipEl.textContent = TIPS[h.dataset.hot]; tipEl.classList.add('show');
  }

  /* ---------------- 一天 / 一夜 ---------------- */
  function resetDay() {
    tick = 0; acc = 0; today = emptyRec();
    heat = 0; fill = 0; gold = GOLD; spilled = 0; flowing = leaking = false; prevB = 0; pumpArmed = true; wasLiquid = false;
    dayFlags = {};
  }
  function startDay() {
    if (phase !== 'idle' || dead) return;
    resetDay(); phase = 'day'; lastAct = Date.now();
    Snd.noise(.12, .18, 2600, 2); Snd.tone(520, .3, 'sine', .03, 380, .05);
    const hands = KEYS.filter(k => recActive(rec, k));
    if (hands.length && !S.seen.ghost) {
      S.seen.ghost = true; save();
      narr(`咦——没有人碰，${NAMES[hands[0]]}却自己动了起来……那是昨天的你。昨天做过的事，今天会原样再做一遍。`);
    } else if (hands.length) narr(`第 ${S.day} 天。昨天的手还在：${hands.map(k => NAMES[k]).join('、')}。`);
    else if (S.day > 1) narr(`第 ${S.day} 天。作坊里只有你一只手。`);
    else narr('蜡烛点亮了，一天开始。蜡烛烧完以前，把金子铸成鱼。');
    apply();
  }
  async function endDay() {
    if (phase !== 'day') return;
    phase = 'night'; endDrag(); apply();
    Snd.fx.hiss();
    el.night.animate([{ opacity: 0 }, { opacity: .8, offset: .35 }, { opacity: .8, offset: .6 }, { opacity: 0 }], { duration: 2400, easing: 'ease-in-out' });
    el.moon.animate([{ opacity: 0 }, { opacity: 1, offset: .35 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: 2400 });
    const did = KEYS.some(k => recActive(today, k));
    narr('蜡烛烧完了。夜里，上校把今天的一切都熔回了坩埚。' + (did ? '可今天做过的事，明天还会再来一遍。' : ''));
    await wait(1100);
    rec = today; S.rec = rec; S.day += 1; save();
    resetDay(); drawYesterday();
    await wait(1300);
    if (dead || busy) return;
    phase = 'idle'; apply();
    if (!S.seen.night2) { S.seen.night2 = true; later(() => { if (phase === 'idle') narr('天又亮了。点亮蜡烛，开始新的一天。'); }, 2600); }
  }
  async function win() {
    if (phase === 'done') return;
    phase = 'done'; busy = true; endDrag(); apply();
    S.finished = true; save();
    flowing = leaking = false;
    Snd.fx.hiss(); Snd.fx.chime();
    narr('金水灌满了鱼模，嗤的一声冒起白烟。');
    await wait(1500); if (dead) return;
    Snd.fx.unlock();
    el.moldR.animate([{ transform: `translate(0px,0px)` }, { transform: 'translate(46px,0px)', opacity: 0 }], { duration: 900, easing: 'ease-in', fill: 'forwards' });
    el.fill.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, fill: 'forwards' });
    el.fishes.setAttribute('opacity', 1); root.classList.add('c5-cast');
    [0, 250].forEach(d => Snd.fx.clink(d / 1000));
    narr('开模——两条小金鱼，鳞片清清楚楚。上校给它们镶上了红宝石的眼睛。');
    await wait(3600); if (dead) return;
    narr('可到了晚上，他还是会把它们放回坩埚。第二天，再从头做起。');
    Snd.fx.magic();
    await wait(3000); if (dead) return;
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    await wait(900); if (dead) return;
    await pushLeaf(makeLeaf(`<div class="c1-sheet c5-sheet">${ART5.sheet()}</div>`, 'El círculo vicioso', false));
    Snd.stopDrone(); Snd.fx.chime();
    narr('他用金鱼换金币，再把金币熔成金鱼——做得越多，就越不必去想别的事。');
    await wait(7000);
    busy = false;
    if (!dead && onComplete) onComplete();
  }

  /* ---------------- 每一拍（固定 30Hz，保证“昨天”能原样重放） ---------------- */
  function step() {
    const c0 = cur.c, t0 = cur.t;
    KEYS.forEach(k => {
      const rv = rec[k][tick];
      if (held[k]) cur[k] = pv[k];
      else if (rel[k] > 0) { cur[k] += (rv - cur[k]) * .35; rel[k]--; }
      else cur[k] = rv;
      today[k][tick] = cur[k];
    });
    if (c0 < CLAMP && cur.c >= CLAMP) Snd.fx.clack();
    if (c0 >= CLAMP && cur.c < CLAMP) Snd.noise(.05, .2, 900, 4);
    if (t0 < POUR && cur.t >= POUR) Snd.fx.roll();
    // 风箱：往下压才鼓风
    const db = cur.b - prevB; prevB = cur.b;
    if (db > 0) heat += db * .62;
    heat = clamp(heat - DT * .45, 0, 1);
    if (cur.b > .6 && pumpArmed) { pumpArmed = false; puffT = .5; Snd.noise(.28, .07, 420, .8, 0, 'lowpass'); }
    if (cur.b < .3) pumpArmed = true;
    const liquid = heat >= LIQ;
    if (liquid && !wasLiquid) { Snd.tone(180, .5, 'sine', .03, 260); if (!S.seen.melt) { S.seen.melt = true; save(); narr('炉火呼呼地旺起来，坩埚里的金子化了，亮得晃眼。'); } }
    if (!liquid && wasLiquid && !held.b && !dayFlags.cool && !fill && !(drag && drag.kind === 'b') && cur.b < .05) {
      dayFlags.cool = true;
      if (!S.seen.cool) { S.seen.cool = true; narr('风箱一停，炉火就暗了，金子又凝住了——一只手，实在忙不过来。'); }
    }
    wasLiquid = liquid;
    // 倒
    const wasFlow = flowing;
    flowing = cur.t > POUR && liquid && gold > .001;
    leaking = flowing && cur.c < CLAMP;
    if (cur.t > POUR && !liquid && held.t && !dayFlags.cold) { dayFlags.cold = true; Snd.fx.thud(); narr('坩埚里的金子还是硬邦邦的，倒不出来。得先把炉火烧旺。'); }
    if (flowing) {
      const d = Math.min(gold, DT / FILL_S); gold -= d;
      if (leaking) { spilled += d; if (!dayFlags.leak) { dayFlags.leak = true; narr('金水顺着鱼模的缝漏到了桌上——两半模子没夹紧。'); } }
      else fill += d;
      if (tick % 6 === 0) Snd.fx.sizzle();
      if (gold <= .001 && fill < .999 && !dayFlags.empty) { dayFlags.empty = true; narr('坩埚倒空了。今天的金子，大半漏在了桌上。'); }
    }
    if (flowing && !wasFlow && !leaking && !S.seen.pour) { S.seen.pour = true; narr('金水顺着浇口流进了鱼模……别停。'); }
    if (fill >= .999) { win(); return; }
    if (tick % 6 === 0) drawToday();
    tick++;
    if (tick >= DAY) { tick = DAY - 1; endDay(); }
  }

  /* ---------------- 交互 ---------------- */
  function on(target, type, fn, opt) { target.addEventListener(type, fn, opt); cleanups.push(() => target.removeEventListener(type, fn, opt)); }
  on(sndBtn, 'click', () => { Snd.unlock(); Snd.toggle(); syncSnd(); if (Snd.on) Snd.startDrone(); });
  on(root, 'pointerdown', () => { Snd.unlock(); Snd.startDrone(); }, { once: true });
  on(forgetBtn, 'click', () => {
    if (phase !== 'idle' || busy) return;
    rec = emptyRec(); S.rec = null; save(); drawYesterday(); apply();
    Snd.fx.page(); narr('你把昨天忘掉了。明天的作坊里，又只剩你一只手。');
  });

  on(box, 'pointerdown', e => {
    if (busy || flipping || phase === 'done' || phase === 'night' || drag) return;
    const h = e.target.closest('[data-hot]'); if (!h) return;
    const kind = h.dataset.hot; lastAct = Date.now(); hideTip();
    if (kind === 'candle') {
      if (phase === 'idle') startDay(); else narr('蜡烛在烧。烧完，这一天就过去了。');
      return;
    }
    if (phase === 'idle') startDay();
    const q = svgPt(svg, e.clientX, e.clientY);
    drag = { kind, y: q.y, moved: 0 };
    held[kind] = true; pv[kind] = cur[kind];
    try { h.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault();
    root.classList.add('c5-dragging');
  });
  on(box, 'pointermove', e => {
    if (!drag) return tip(e);
    const q = svgPt(svg, e.clientX, e.clientY), dy = q.y - drag.y;
    drag.y = q.y; drag.moved += Math.abs(dy); lastAct = Date.now();
    const k = drag.kind;
    if (k === 'b') pv.b = clamp(pv.b + dy / 40, 0, 1);
    else if (k === 't') pv.t = clamp(pv.t - dy / 70, 0, 1);
    else if (k === 'c') pv.c = clamp(pv.c + dy / 28, 0, 1);
  });
  function endDrag() {
    if (!drag) return;
    const d = drag; drag = null; root.classList.remove('c5-dragging');
    held[d.kind] = false; rel[d.kind] = 8;
    if (d.moved < 3 && phase === 'day') {
      Snd.fx.click();
      narr({ b: '风箱。按住左边的把手上下拉，风就灌进炉膛。', c: '夹子。往下压，两半鱼模才会严丝合缝；一松手就弹开。', t: '坩埚的长柄。往上推，坩埚就倾过来，金水从右边的嘴里流出去。' }[d.kind]);
    }
  }
  on(box, 'pointerup', endDrag);
  on(box, 'pointercancel', endDrag);
  on(box, 'pointerleave', hideTip);

  /* ---------------- 主循环 ---------------- */
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (dead) return;
    const dt = Math.min(.1, lastT ? (t - lastT) / 1000 : .016); lastT = t;
    if (document.hidden || flipping) return;
    puffT = Math.max(0, puffT - dt);
    if (phase === 'day') {
      acc += dt;
      while (acc >= DT && phase === 'day') { acc -= DT; step(); }
    } else {
      KEYS.forEach(k => { cur[k] += (0 - cur[k]) * Math.min(1, dt * 8); });
      if (phase !== 'done') heat = Math.max(0, heat - dt * .6);
      flowing = leaking = false;
    }
    render();
  }

  /* ---------------- 提示 ---------------- */
  function stage() {
    if (S.finished) return ['end', '两条小金鱼已经铸好了。', '按 ↺ 可以再过一遍上校的日子。'];
    if (!S.seen.melt) return ['heat', '金子要先烧化，才倒得出来。看看左边的风箱。', '先点亮架子上的蜡烛。然后按住左边风箱的把手，上下来回拉，炉火变旺、坩埚里的金子发亮，就算化了。'];
    return ['hands', '拉风箱、压夹子、推坩埚，三件事得同时做——可你只有一只手。别忘了：今天做过的事，明天会原样再来一遍。',
      '第一天：点蜡烛，从头到尾一直拉风箱。第二天：昨天的手会替你拉风箱，你从中段开始一直压住右边的夹子。第三天：两只手都在帮你，趁它们都在忙，把坩埚长柄往上推，倒满鱼模。下方的时间条标着昨天每只手忙的时段；弄乱了就点「忘掉昨天」。'];
  }
  function getHint() {
    if (dead) return '';
    const [k, soft, hard] = stage();
    const lvl = S.hints[k] || 0; S.hints[k] = lvl + 1; save();
    Snd.fx.chime(); narr('梅尔基亚德斯低语：' + (lvl === 0 ? soft : hard), true);
    lastAct = Date.now();
    if (lvl > 0) {
      const ids = k === 'heat' ? ['#c5-arCandle', '#c5-arB'] : ['#c5-arB', '#c5-arC', '#c5-arT'];
      ids.forEach((id, i) => { const a = $(id); a && a.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 1200, iterations: 2, delay: i * 500 }); });
    }
    return '';
  }

  /* ---------------- 自动解谜 ---------------- */
  async function autoSolve() {
    if (dead) return;
    if (S.finished) { if (phase === 'done' && !busy && onComplete) onComplete(); return; }
    if (busy) return;
    busy = true; endDrag();
    while (phase === 'night') { await wait(200); if (dead) return; }
    phase = 'idle'; resetDay();
    rec = idealRec(); S.rec = rec; save(); drawYesterday(); apply();
    narr('梅尔基亚德斯翻出了上校记下的三天：风箱、夹子、坩埚，三只手叠在了同一天里……', true);
    await wait(1600); if (dead) return;
    startDay();
  }

  /* ---------------- 启动 ---------------- */
  drawYesterday(); apply(); render();
  raf = requestAnimationFrame(frame);
  Snd.startDrone();
  every(() => { if (!nudged && !S.finished && Date.now() - lastAct > 50000) { nudged = true; narr('（卡住了？点右上角的 ✧，听听梅尔基亚德斯的低语。）', true); } }, 5000);
  if (S.finished) {
    el.fishes.setAttribute('opacity', 1); el.moldR.setAttribute('opacity', 0); root.classList.add('c5-cast');
    narr('两条小金鱼躺在工作台上。按右上角的 ↺ 可以再过一遍上校的日子。');
  } else if (!S.seen.intro) {
    later(() => { S.seen.intro = true; save(); narr('奥雷里亚诺上校老了，整天关在作坊里做小金鱼。点亮架子上的蜡烛，一天就开始了。'); }, 500);
  } else narr(`第 ${S.day} 天。点亮蜡烛，作坊又开工了。`);

  function destroy() {
    if (dead) return; dead = true;
    cancelAnimationFrame(raf);
    timers.forEach(t => clearTimeout(t)); timers.clear();
    intervals.forEach(t => clearInterval(t));
    cleanups.forEach(f => f());
    Snd.stopDrone();
    root.innerHTML = '';
    root.classList.remove('c1-root', 'c5-root', 'c5-lightme', 'c5-daytime', 'c5-dragging', 'c5-cast');
  }
  return { destroy, getHint, autoSolve };
}
