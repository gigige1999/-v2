/* =========================================================
   第六章 · 镜子房间 —— 关卡引擎（三页：缝纫室 → 秋海棠走廊 → 晾衣院）
   mountChapter6(root, { onComplete }) => { destroy, getHint, autoSolve }
   光会穿过书页：上一页从哪个窗口漏出去，翻过一页它就从哪里照进来。
   镜子每次转 22.5°（点一下转一格，按住拖动可连续转），光撞镜子会反弹，
   可以连着撞好几面。院子里还有轨道上的小车和能升降床单的摇柄。
   ========================================================= */
import { ART } from '../chapter1/art.js';
import { ART6, ROOMS } from './art.js';
import { trace, STEP, norm180 } from './optics.js';
import { Snd } from '../shared/sound.js';

const SAVE_KEY = 'macondo2_ch6';
const VER = 3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const D2R = Math.PI / 180;
const angOf = (dx, dy) => Math.atan2(dy, dx) / D2R;
const wrap180 = d => ((d + 180) % 360 + 360) % 360 - 180;
const MN = { stand: '立镜', chain: '吊镜', bracket: '铁架上的镜子', rail: '小车上的镜子' };
const SIDE = { left: '左墙上', right: '右墙上', top: '屋顶上', bottom: '地上' };
const CRANK = { x: 352, y: 250 };

const initSt = r => ({ m: r.mirrors.map(m => ({ a: m.a0, ...(m.rail ? { x: m.x0 } : {}) })), lift: 0 });
const cloneSt = s => ({ m: s.m.map(x => ({ ...x })), lift: s.lift || 0 });
const INIT = () => ({ v: VER, page: 0, st: ROOMS.map(initSt), done: [false, false, false], finished: false, hint: [0, 0, 0], seen: {} });
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.v === VER) {
      const b = INIT();
      return { ...b, ...s, st: b.st.map((x, i) => (s.st && s.st[i] && Array.isArray(s.st[i].m) && s.st[i].m.length === x.m.length) ? cloneSt(s.st[i]) : x), seen: { ...s.seen } };
    }
  } catch (e) { }
  return INIT();
}

export function mountChapter6(root, { onComplete } = {}) {
  let S = loadState();
  let dead = false, busy = false, flipping = false, raf = 0, lastT = 0, t0 = 0, drag = null, onT = 0, asc = -1;
  const timers = new Set(), cleanups = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms); timers.add(t); return t; };
  const wait = ms => new Promise(r => later(r, ms));
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const save = () => { if (!dead) try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } };

  root.classList.add('c1-root', 'c6-root');
  root.innerHTML = `<svg class="c1-defs" aria-hidden="true">${ART.DEFS}${ART6.DEFS}</svg>
  <div class="c1-wrap">
    <div class="c1-head">
      <span class="c1-kicker"><b>CAP. VI</b>La habitación de los espejos</span>
    </div>
    <div class="c1-stage"><div class="c1-box"></div></div>
    <div class="c1-narr"><span></span></div>
    <div class="c1-bottom c6-bottom"><button class="c1-snd" type="button"></button>
      <button class="c6-nav" data-d="-1" type="button">‹ 上一页</button>
      <span class="c6-where"></span>
      <button class="c6-nav" data-d="1" type="button">下一页 ›</button>
    </div>
    <div class="c1-tip"></div><div class="c1-flash"></div>
  </div>`;
  const box = $('.c1-box'), narrSpan = $('.c1-narr span'), tipEl = $('.c1-tip'), flashEl = $('.c1-flash'), sndBtn = $('.c1-snd');
  const syncSnd = () => { sndBtn.textContent = '♪'; sndBtn.classList.toggle('off', !Snd.on); sndBtn.title = Snd.on ? '关闭声音' : '开启声音'; };
  syncSnd();

  /* ---------------- 翻页（书页里同时只有一页，避免同名元素串台） ---------------- */
  const leaves = [];
  let els = null, V = null;
  const FLIP = 560;
  function buildPage(i) {
    const el = document.createElement('div'); el.className = 'c1-leaf';
    el.innerHTML = `<div class="c1-plate">${ART6.rooms[i]()}</div>` + ART.FRAME('', true) + `<div class="c6-capt">${ROOMS[i].capt}</div><div class="c1-shade"></div>`;
    return el;
  }
  function bind() {
    const room = ROOMS[S.page], st = S.st[S.page];
    els = {
      svg: $('#c6-main'), beamWrap: $('#c6-beamWrap'), beam: $('#c6-beam'), beamG: $('#c6-beamG'), beamC: $('#c6-beamC'), sparks: $('#c6-sparks'),
      end: $('#c6-end'), end2: $('#c6-end2'), exit: $('#c6-exit'), entry: $('#c6-entry'),
      rot: room.mirrors.map((_, i) => $(`#c6-m${i} .c6-mrot`)), mir: room.mirrors.map((_, i) => $(`#c6-m${i}`)),
      cart: $('#c6-cart1'), line: $('#c6-line'), crank: $('#c6-crank'), rem: $('#c6-rem'), halo: $('#c6-halo'), bfly: $('#c6-bfly'),
    };
    if (els.sparks) els.sparks.innerHTML = [...Array(8)].map(() => `<g opacity="0"><circle r="9" fill="#ffd84a" opacity=".35"/><circle r="2.6" fill="#fffbe6"/></g>`).join('');
    V = { a: st.m.map(m => m.a), x: st.m.map(m => m.x), lift: st.lift || 0 };
    onT = 0;
  }
  async function gotoPage(i, back = false) {
    if (busy) return;
    busy = true; hideTip(); Snd.fx.page(); flipping = true; drag = null;
    const curL = leaves[0], nextL = buildPage(i);
    box.appendChild(nextL);
    nextL.style.zIndex = back ? 1 : 2; curL.style.zIndex = back ? 2 : 1;
    let a;
    if (back) {
      nextL.querySelector('.c1-shade').animate([{ opacity: .7 }, { opacity: 0 }], { duration: FLIP + 260, fill: 'forwards' });
      a = curL.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(92deg)' }], { duration: FLIP, easing: 'cubic-bezier(.55,.05,.8,.45)', fill: 'forwards' });
    } else {
      curL.querySelector('.c1-shade').animate([{ opacity: 0 }, { opacity: .85 }], { duration: FLIP, fill: 'forwards' });
      nextL.querySelector('.c1-shade').animate([{ opacity: .7 }, { opacity: 0 }], { duration: FLIP + 260, easing: 'ease-out' });
      a = curL.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-92deg)' }], { duration: FLIP, easing: 'cubic-bezier(.55,.05,.8,.45)', fill: 'forwards' });
    }
    await new Promise(res => { a.onfinish = () => { curL.remove(); res(); }; });
    if (dead) return;
    leaves.length = 0; leaves.push(nextL); nextL.style.zIndex = '';
    S.page = i; save(); bind(); render(); apply();
    busy = false; flipping = false;
    if (!S.done[i]) narr(INTRO[i]);
    else narr(`${ROOMS[i].name}的光路已经接好了。`);
  }
  const INTRO = [
    '午后的太阳从左墙的窗户斜进来。点一下镜子它就转一格——让光从右墙高处的气窗漏出去。',
    '翻过一页，那束光从走廊左墙照了进来。两面镜子要接力，把光送出顶上的天窗。',
    '光从走廊天窗笔直落进院子。让它拐进轨道上的小车，再从床单底下穿过去，照到蕾梅黛丝身上。',
  ];
  leaves.push(buildPage(S.page)); box.appendChild(leaves[0]); bind();

  /* ---------------- 渲染 ---------------- */
  function apply() {
    if (dead) return;
    const i = S.page, room = ROOMS[i];
    $('.c6-where').textContent = `${i + 1} / 3 · ${room.name}`;
    $$('.c6-nav').forEach(b => {
      const d = +b.dataset.d;
      b.disabled = busy || flipping || (d < 0 ? i === 0 : i === 2);
      b.classList.toggle('ready', d > 0 && i < 2 && S.done[i]);
    });
    $$('.c1-pip').forEach(p => p.classList.toggle('on', S.done[+p.dataset.i] || S.finished));
  }
  const ease = (v, t, k, dt) => v + (t - v) * Math.min(1, dt * k);
  function render(dt = 1) {
    if (!els || !els.svg || !V) return;
    const i = S.page, room = ROOMS[i], st = S.st[i];
    // 视觉状态平滑地追逻辑状态（拖动时追手指）
    room.mirrors.forEach((m, k) => {
      const tgt = drag && drag.hot === 'm' && drag.i === k ? drag.raw : st.m[k].a;
      V.a[k] += wrap180(2 * (tgt - V.a[k])) / 2 * Math.min(1, dt * 16);
      if (m.rail) V.x[k] = ease(V.x[k], drag && drag.hot === 's' && drag.i === k ? drag.rawX : st.m[k].x, 14, dt);
      if (els.rot[k]) els.rot[k].setAttribute('transform', `rotate(${V.a[k].toFixed(2)})`);
      if (m.rail && els.cart) els.cart.setAttribute('transform', `translate(${V.x[k].toFixed(1)} ${m.y})`);
    });
    if (room.sheets) {
      V.lift = ease(V.lift, st.lift || 0, 8, dt);
      const up = asc > 0 ? asc * asc * 90 : 0;
      if (els.line) els.line.setAttribute('transform', `translate(0 ${(room.sheets.top - V.lift - up).toFixed(1)})`);
      const cr = drag && drag.hot === 'k' ? drag.rot : V.lift / room.sheets.step * 90;
      if (els.crank) els.crank.setAttribute('transform', `rotate(${cr.toFixed(1)})`);
      if (els.rem && asc > 0) els.rem.setAttribute('transform', `translate(0 ${(-up).toFixed(1)})`);
    }
    const vis = { m: room.mirrors.map((m, k) => ({ a: V.a[k], x: m.rail ? V.x[k] : undefined })), lift: V.lift };
    const R = trace(room, vis), RL = trace(room, st);
    const d = 'M' + R.pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
    els.beam.setAttribute('d', d); els.beamG.setAttribute('d', d); els.beamC.setAttribute('d', d);
    const tip = R.pts[R.pts.length - 1], good = RL.pass || RL.onTarget;
    for (const e of [els.end, els.end2]) { e.setAttribute('cx', tip[0].toFixed(1)); e.setAttribute('cy', tip[1].toFixed(1)); }
    const fl = .85 + .15 * Math.sin(t0 * 9);
    els.end.setAttribute('opacity', good ? 1 : .75); els.end2.setAttribute('r', good ? 22 * fl : 11 * fl); els.end2.setAttribute('opacity', good ? .6 : .32);
    els.beamG.setAttribute('opacity', good ? .55 : .3);
    if (els.sparks) [...els.sparks.children].forEach((g, k) => {
      const p = k < R.bounces.length ? R.pts[k + 1] : null;
      g.setAttribute('opacity', p ? .9 : 0);
      if (p) g.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) scale(${(.85 + .2 * Math.sin(t0 * 7 + k)).toFixed(2)})`);
    });
    if (els.exit) els.exit.classList.toggle('lit', !!RL.pass);
    els.mir.forEach((g, k) => g && g.classList.toggle('hit', R.bounces.includes(k)));
    if (els.halo) els.halo.setAttribute('opacity', RL.onTarget || asc >= 0 ? (.75 + .2 * Math.sin(t0 * 4)).toFixed(2) : 0);
    if (els.halo && asc > 0) els.halo.setAttribute('transform', `translate(0 ${(-asc * asc * 90).toFixed(1)})`);
    if (els.beamWrap && asc > 0) els.beamWrap.setAttribute('opacity', Math.max(0, 1 - asc * .8).toFixed(2));
    // 光稳住了就算数（不必非得松手）
    if (!S.finished && !busy && !flipping) {
      if (i === 2) { onT = RL.onTarget ? onT + dt : 0; if (onT > 1) { onT = 0; finish(); } }
      else { onT = RL.pass ? onT + dt : 0; if (onT > .9 && !S.done[i]) { onT = 0; passPage(i); } }
    }
    return RL;
  }

  /* ---------------- 判定 / 过关 ---------------- */
  function passPage(i) {
    S.done[i] = true; save(); apply();
    Snd.fx.chime(); later(() => Snd.fx.shimmer && Snd.fx.shimmer(), 200);
    narr(i === 0 ? '光从气窗漏了出去，落到了下一页上——' : '光从天窗漏了出去，照进了院子——');
    later(() => { if (!dead && !busy && S.page === i) gotoPage(i + 1); }, 1300);
  }
  function explain() {
    const i = S.page, room = ROOMS[i], R = trace(room, S.st[i]);
    if (R.pass || R.onTarget) return;
    if (S.done[i]) { S.done[i] = false; save(); apply(); }
    const n = R.bounces.length;
    const via = n ? `光撞了 ${n} 面镜子，` : '光没碰到镜子，';
    if (R.hit === 'sheet') narr(via + '被床单挡住了。右边的摇柄能把晾衣绳升高。');
    else if (R.hit === 'obstacle') narr(`${via}被${R.name}挡住了。`);
    else if (R.hit === 'wall') {
      const ex = room.exit;
      if (ex && R.side === ex.side) narr(via + '打在出口旁边的墙上——方向对了，位置还差一点。');
      else narr(`${via}打在${SIDE[R.side] || '墙上'}。`);
    } else if (R.hit === 'target') { }
    else narr(via + '在屋里绕个不停。');
  }

  async function finish() {
    S.finished = true; S.done = [true, true, true]; save(); apply(); busy = true; Snd.fx.chime();
    narr('光照在蕾梅黛丝身上。一阵风吹起了床单。');
    await wait(1400); if (dead) return;
    Snd.fx.magic(); Snd.fx.hum && Snd.fx.hum();
    if (els && els.bfly) {
      els.bfly.setAttribute('opacity', 1);
      els.bfly.innerHTML = [...Array(14)].map((_, k) => {
        const x = 200 + ((k * 47) % 170), y = 250 + (k * 31) % 90, r = 1.4 + (k % 3);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff4b8" style="animation:c6mote ${2.6 + (k % 4) * .5}s ${(k * .17).toFixed(2)}s ease-out infinite"/>`;
      }).join('');
    }
    narr('她挥着手，在床单的裹拥下，身体和灵魂一起，离开了地面。');
    const T0 = performance.now();
    await new Promise(res => {
      const step = () => { if (dead) return res(); asc = Math.min(1.8, (performance.now() - T0) / 2600); if (asc >= 1.8) return res(); requestAnimationFrame(step); };
      step();
    });
    if (dead) return;
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    await wait(800); if (dead) return;
    const curL = leaves[0], nextL = document.createElement('div'); nextL.className = 'c1-leaf';
    nextL.innerHTML = `<div class="c1-sheet c6-sheet">${ART6.sheet()}</div>` + ART.FRAME('', false) + `<div class="c6-capt">La ascensión</div><div class="c1-shade"></div>`;
    box.appendChild(nextL); nextL.style.zIndex = 2; curL.style.zIndex = 1; flipping = true;
    curL.querySelector('.c1-shade').animate([{ opacity: 0 }, { opacity: .85 }], { duration: 560, fill: 'forwards' });
    await new Promise(res => { curL.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-92deg)' }], { duration: 560, easing: 'cubic-bezier(.55,.05,.8,.45)', fill: 'forwards' }).onfinish = () => { curL.remove(); res(); }; });
    if (dead) return;
    leaves.length = 0; leaves.push(nextL); nextL.style.zIndex = ''; els = null; flipping = false;
    Snd.fx.chime(); narr('马孔多的人至今说，她是升天去了。');
    await wait(7000);
    busy = false;
    if (!dead && onComplete) onComplete();
  }

  /* ---------------- 旁白 / 提示框 ---------------- */
  let narrT = null;
  function narr(text, whisper = false) {
    if (narrT) { clearTimeout(narrT); timers.delete(narrT); }
    narrSpan.classList.add('out');
    narrT = later(() => { narrT = null; narrSpan.textContent = text; narrSpan.classList.toggle('whisper', whisper); narrSpan.classList.remove('out'); }, 180);
  }
  function hideTip() { tipEl.classList.remove('show'); }
  const TIPS = { m: '镜子 · 点一下转 22.5°，按住可以连续转', s: '小车 · 沿轨道左右推', k: '摇柄 · 每转四分之一圈，绳子升一格' };
  function tip(e) {
    if (e.pointerType !== 'mouse' || drag) return hideTip();
    const h = e.target.closest('[data-hot]'); if (!h) return hideTip();
    const r = $('.c1-wrap').getBoundingClientRect();
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
    let t = TIPS[h.dataset.hot];
    if (h.dataset.hot === 'm') t = `${MN[ROOMS[S.page].mirrors[+h.dataset.i].mount]} · 点一下转 22.5°，按住可连续转`;
    tipEl.textContent = t; tipEl.classList.add('show');
  }

  /* ---------------- 交互 ---------------- */
  function svgPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  function on(target, type, fn, opt) { target.addEventListener(type, fn, opt); cleanups.push(() => target.removeEventListener(type, fn, opt)); }
  on(sndBtn, 'click', () => { Snd.unlock(); Snd.toggle(); syncSnd(); if (Snd.on) Snd.startDrone(); });
  on(root, 'pointerdown', () => { Snd.unlock(); Snd.startDrone(); }, { once: true });
  $$('.c6-nav').forEach(b => on(b, 'click', () => {
    if (busy || flipping) return;
    const d = +b.dataset.d, i = S.page;
    if (d < 0 && i > 0) gotoPage(i - 1, true);
    else if (d > 0 && i < 2) {
      if (!S.done[i]) { narr('光还没漏出这一页，下一页还是黑的。'); Snd.fx.wrong(); return; }
      gotoPage(i + 1);
    }
  }));

  const pivotOf = (room, st, k) => ({ x: room.mirrors[k].rail ? st.m[k].x : room.mirrors[k].x, y: room.mirrors[k].y });
  on(box, 'pointerdown', e => {
    if (busy || flipping || S.finished || drag || !els) return;
    const h = e.target.closest('[data-hot]'); if (!h) return;
    const q = svgPt(els.svg, e.clientX, e.clientY), room = ROOMS[S.page], st = S.st[S.page];
    const hot = h.dataset.hot, k = +h.dataset.i || 0;
    drag = { hot, i: k, x: q.x, y: q.y, moved: 0 };
    if (hot === 'm') {
      const p = pivotOf(room, st, k);
      Object.assign(drag, { px: p.x, py: p.y, ang: angOf(q.x - p.x, q.y - p.y), a0: st.m[k].a, raw: V.a[k], live: Math.hypot(q.x - p.x, q.y - p.y) > 10 });
    } else if (hot === 's') {
      Object.assign(drag, { off: q.x - st.m[k].x, rawX: st.m[k].x });
    } else if (hot === 'k') {
      Object.assign(drag, { ang: angOf(q.x - CRANK.x, q.y - CRANK.y), acc: 0, lift0: st.lift || 0, rot: (st.lift || 0) / room.sheets.step * 90 });
    }
    try { h.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault(); hideTip();
  });
  on(box, 'pointermove', e => {
    if (!drag) return tip(e);
    if (!els) return;
    const q = svgPt(els.svg, e.clientX, e.clientY), room = ROOMS[S.page], st = S.st[S.page];
    drag.moved += Math.hypot(q.x - drag.x, q.y - drag.y); drag.x = q.x; drag.y = q.y;
    if (drag.moved < 4) return;
    if (drag.hot === 'm') {
      const r = Math.hypot(q.x - drag.px, q.y - drag.py);
      if (r < 10) return;
      const a = angOf(q.x - drag.px, q.y - drag.py);
      if (!drag.live) { drag.live = true; drag.ang = a; return; }
      const d = wrap180(a - drag.ang); drag.ang = a;
      drag.raw += d;
      const sn = norm180(Math.round(drag.raw / STEP) * STEP);
      if (sn !== st.m[drag.i].a) { st.m[drag.i].a = sn; Snd.fx.tick(); }
    } else if (drag.hot === 's') {
      const m = room.mirrors[drag.i];
      drag.rawX = clamp(q.x - drag.off, m.rail[0], m.rail[1]);
      const sn = m.rail[0] + Math.round((drag.rawX - m.rail[0]) / m.step) * m.step;
      if (sn !== st.m[drag.i].x) { st.m[drag.i].x = sn; Snd.fx.tick(); }
    } else if (drag.hot === 'k') {
      const a = angOf(q.x - CRANK.x, q.y - CRANK.y), d = wrap180(a - drag.ang); drag.ang = a;
      const SH = room.sheets, lo = -drag.lift0 / SH.step * 90, hi = (SH.max - drag.lift0) / SH.step * 90;
      drag.acc = clamp(drag.acc + d, lo, hi);
      drag.rot = drag.lift0 / SH.step * 90 + drag.acc;
      const lf = clamp(drag.lift0 + Math.round(drag.acc / 90) * SH.step, 0, SH.max);
      if (lf !== st.lift) { st.lift = lf; Snd.fx.creak(); }
    }
  });
  function endDrag() {
    if (!drag) return;
    const d = drag; drag = null;
    const room = ROOMS[S.page], st = S.st[S.page];
    if (d.moved < 4) {
      if (d.hot === 'm') { st.m[d.i].a = norm180(st.m[d.i].a + STEP); Snd.fx.click(); }
      else if (d.hot === 'k') { const SH = room.sheets; st.lift = (st.lift || 0) + SH.step > SH.max ? 0 : (st.lift || 0) + SH.step; Snd.fx.creak(); if (!st.lift) narr('绳子松开，床单落回了原处。'); }
      else if (d.hot === 's') { Snd.fx.click(); narr('按住小车左右推，它会停在轨道的刻度上。'); save(); return; }
    } else {
      if (d.hot === 'm') V.a[d.i] = d.raw;
      Snd.fx.clack();
    }
    save();
    later(() => { if (!drag) explain(); }, 60);
  }
  on(box, 'pointerup', endDrag);
  on(box, 'pointercancel', endDrag);
  on(box, 'pointerleave', hideTip);

  /* ---------------- 提示 ---------------- */
  const HINT1 = [
    '梅尔基亚德斯低语：光撞上镜面，会像台球撞上台边一样弹开。气窗在右墙高处——光得斜着往右上走。',
    '梅尔基亚德斯低语：吊镜先把光往右下送，立镜再把它笔直地往上送出天窗。',
    '梅尔基亚德斯低语：铁架上的镜子把光斜着送到左下；小车去接住它；床单挡路时，摇柄能把晾衣绳升高——但升太高，又会挡住斜下来的光。',
  ];
  function steps(i) {
    const room = ROOMS[i], st = S.st[i], sol = room.sol, out = [];
    room.mirrors.forEach((m, k) => {
      if (m.rail && sol.m[k].x !== st.m[k].x) {
        const n = (sol.m[k].x - st.m[k].x) / m.step;
        out.push(`把小车往${n < 0 ? '左' : '右'}推 ${Math.abs(n)} 格`);
      }
      const n = Math.round(norm180(sol.m[k].a - st.m[k].a) / STEP) % 8;
      if (n) out.push(`${MN[m.mount]}点 ${n} 下`);
    });
    if (room.sheets && (sol.lift || 0) !== (st.lift || 0)) {
      const n = ((sol.lift || 0) - (st.lift || 0)) / room.sheets.step;
      out.push(n > 0 ? `摇柄顺时针摇 ${n} 格` : `摇柄倒着摇 ${-n} 格`);
    }
    return out;
  }
  function getHint() {
    if (dead) return '';
    const i = S.page;
    if (S.finished) { narr('蕾梅黛丝已经升天了。'); return ''; }
    if (S.done[i]) { narr('这一页的光已经漏出去了，翻到下一页吧。', true); return ''; }
    S.hint[i] = Math.min(3, (S.hint[i] || 0) + 1); save();
    Snd.fx.chime();
    const s = steps(i);
    if (S.hint[i] === 1) narr(HINT1[i], true);
    else if (S.hint[i] === 2 && s.length > 1) narr(`梅尔基亚德斯低语：先${s[0]}。`, true);
    else narr(s.length ? `梅尔基亚德斯低语：${s.join('，')}。` : '梅尔基亚德斯低语：已经对了，让光稳住一会儿。', true);
    return '';
  }

  async function autoSolve() {
    if (dead) return;
    if (S.finished) { if (!busy && onComplete) onComplete(); return; }
    if (busy) return;
    narr('梅尔基亚德斯把三页的镜子一次摆好……', true);
    ROOMS.forEach((r, i) => { S.st[i] = cloneSt(r.sol); S.done[i] = i < S.page; });
    save(); apply(); Snd.fx.magic();
    // 当前页的光一稳住，就会自己翻页、接力到下一页
  }

  /* ---------------- 主循环 ---------------- */
  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (dead) return;
    const dt = Math.min(.05, lastT ? (t - lastT) / 1000 : .016); lastT = t;
    if (document.hidden || flipping) return;
    t0 += dt;
    if (els && els.beam) try { render(dt); } catch (e) { console.error(e); }
  }

  apply(); render();
  raf = requestAnimationFrame(frame);
  Snd.startDrone();
  if (S.finished) narr('蕾梅黛丝已经升天了。按 ↺ 可以再来一遍。');
  else if (!S.seen.intro) { S.seen.intro = true; save(); later(() => narr('光会穿过书页。' + INTRO[S.page]), 500); }
  else later(() => narr(S.done[S.page] ? `${ROOMS[S.page].name}的光路已经接好了。` : INTRO[S.page]), 400);

  function destroy() {
    if (dead) return; dead = true;
    cancelAnimationFrame(raf);
    timers.forEach(t => clearTimeout(t)); timers.clear();
    cleanups.forEach(f => f());
    Snd.stopDrone();
    root.innerHTML = ''; root.classList.remove('c1-root', 'c6-root');
  }
  return { destroy, getHint, autoSolve };
}
