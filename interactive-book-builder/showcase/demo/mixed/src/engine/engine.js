/* =========================================================
   通用书页引擎（第二关）—— 锈湖式点击解谜，场景切换 = 书页翻动
   mountBookPage(root, spec, { onComplete, saveKey, guide }) => { destroy, getHint, autoSolve }
   章节只写"数据 + 少量回调"（spec），交互框架全部在这里。spec 格式见 references/engine-api.md
   约定：g.narr / g.fail / g.take / g.open / g.sheet / g.back / g.finish 都返回真值，
        spec.act / spec.use 里一律 `return g.xxx(...)`；spec.use 返回假值 = 没处理（引擎给默认失败旁白）
   ========================================================= */
import { DEFS, FRAME } from './art-kit.js';
import { Snd } from './sound.js';

const SVGNS = 'http://www.w3.org/2000/svg';
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function svgEl(tag, attrs) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
export function svgPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); }
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const getPath = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const FLIP = 560;

/**
 * @param {HTMLElement} root
 * @param {any} spec
 * @param {{ onComplete?: () => void, saveKey?: string, guide?: string }} [opts]
 * @returns {{ destroy: () => void, getHint: () => string, autoSolve: () => void }}
 */
export function mountBookPage(root, spec, { onComplete = undefined, saveKey = 'ibook_page', guide = '书灵' } = {}) {
  const T = {
    back: '翻回', notebook: '笔记本', notebookTitle: '笔记本', notebookKicker: 'NOTEBOOK', notebookCap: 'Memoria',
    sndOn: '关闭声音', sndOff: '开启声音', already: '已经拿过了。',
    fail: ['这样没有用。', '什么也没发生。', '不是这样用的。'],
    resume: '书页还停在你离开的地方。', done: '这一页已经读完了。按右上角的 ↺ 可以重来。',
    nudge: `（迷路了？点右上角的 ✧，听听${guide}的低语。）`,
    whisper: `${guide}低语：`, auto: `${guide}替你翻完了这一页……`,
    ...(spec.text || {})
  };
  const INIT = () => ({ inv: [], notes: [...(spec.notes || [])], seen: {}, hints: {}, finished: false, ...(spec.state ? spec.state() : {}) });
  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(saveKey));
      if (s) { const b = INIT(); for (const k in s) b[k] = isObj(b[k]) && isObj(s[k]) ? { ...b[k], ...s[k] } : s[k]; return b; }
    } catch (e) { }
    return INIT();
  }

  const S = loadState();
  let dead = false, sel = null, busy = false, flipping = false, lastAct = Date.now(), nudged = false, finishing = false;
  const arriving = new Set(), timers = new Set(), intervals = [], cleanups = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms); timers.add(t); return t; };
  const wait = ms => new Promise(r => later(r, ms));
  const every = (fn, ms) => intervals.push(setInterval(() => { if (!dead) fn(); }, ms));
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const save = () => { if (dead) return; try { localStorage.setItem(saveKey, JSON.stringify(S)); } catch (e) { } };
  // 条件表达式："a+!b.c" = S.a 为真 且 S.b.c 为假；"has:key" = 物品栏里有 key
  function cond(expr) {
    return expr.split('+').every(term => {
      term = term.trim(); const neg = term[0] === '!'; if (neg) term = term.slice(1);
      const v = term.startsWith('has:') ? has(term.slice(4)) : getPath(S, term);
      return neg ? !v : !!v;
    });
  }
  const has = id => S.inv.some(i => i.id === id);
  function addItem(id, n = 1) { const it = S.inv.find(i => i.id === id); if (it) it.n += n; else S.inv.push({ id, n }); }
  function removeItem(id, n = 1) { const it = S.inv.find(i => i.id === id); if (!it) return; it.n -= n; if (it.n <= 0) S.inv = S.inv.filter(i => i !== it); if (sel === id && !has(id)) sel = null; }
  function addNote(t) {
    if (S.notes.includes(t)) return;
    S.notes.push(t);
    ribbon.classList.remove('new'); void ribbon.offsetWidth; ribbon.classList.add('new');
  }
  const cycleIdx = {};
  const cycle = (key, arr = spec.lines?.[key]) => { if (!arr) return ''; const i = (cycleIdx[key] || 0) % arr.length; cycleIdx[key] = i + 1; return arr[i]; };
  const item = id => spec.items[id] || { name: id, desc: '', icon: '' };

  /* ---------------- DOM ---------------- */
  const K = spec.kicker || {};
  root.classList.add('bk-root');
  root.innerHTML = `<svg class="bk-defs" aria-hidden="true">${DEFS}${spec.defs || ''}</svg>
  <div class="bk-wrap">
    <div class="bk-head">
      <span class="bk-kicker"><b>${K.tag || ''}</b>${K.text || ''}</span>
      ${spec.pips ? `<div class="bk-pips">${spec.pips.map(p => `<div class="bk-pip" data-k="${p.when}"><span>${p.label}</span></div>`).join('')}</div>` : ''}
    </div>
    <div class="bk-stage"><div class="bk-box"></div></div>
    <div class="bk-narr"><span></span></div>
    <div class="bk-bottom"><button class="bk-snd" type="button"></button><div class="bk-inv"></div><button class="bk-ribbon" type="button">${T.notebook}</button></div>
    <div class="bk-tip"></div><div class="bk-flash"></div>
  </div>`;
  const wrap = $('.bk-wrap'), box = $('.bk-box'), invEl = $('.bk-inv'), ribbon = $('.bk-ribbon');
  const narrSpan = $('.bk-narr span'), tipEl = $('.bk-tip'), flashEl = $('.bk-flash'), sndBtn = $('.bk-snd');
  const ghost = document.createElement('div'); ghost.className = 'bk-ghost'; document.body.appendChild(ghost);
  const syncSnd = () => { sndBtn.textContent = '♪'; sndBtn.classList.toggle('off', !Snd.on); sndBtn.title = Snd.on ? T.sndOn : T.sndOff; };
  syncSnd();

  /* ---------------- 页栈：主场景 / 特写 / 文字页 / 笔记本 都是一张书页 ---------------- */
  const leaves = [];
  const top = () => leaves[leaves.length - 1];
  function makeLeaf(inner, cap, plate, back) {
    const el = document.createElement('div'); el.className = 'bk-leaf';
    el.innerHTML = inner + FRAME(cap, plate) + (back ? `<button class="bk-back" type="button" data-back="1">${back}</button>` : '') + '<div class="bk-shade"></div>';
    return el;
  }
  const plateLeaf = (svg, cap, back) => makeLeaf(`<div class="bk-plate">${svg}</div>`, cap, true, back);
  const sheetLeaf = (html, cap, back) => makeLeaf(`<div class="bk-sheet">${html}</div>`, cap, false, back);
  function pushLeaf(el, kind, name) {
    const cur = top();
    leaves.push({ el, kind, name });
    box.appendChild(el);
    apply();
    if (!cur) return Promise.resolve(true);
    flipping = true; hideTip(); Snd.fx.page();
    el.style.zIndex = 1; cur.el.style.zIndex = 2;
    const csh = cur.el.querySelector('.bk-shade'), sh = el.querySelector('.bk-shade');
    const a = cur.el.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-92deg)' }], { duration: FLIP, easing: 'cubic-bezier(.55,.05,.8,.45)', fill: 'forwards' });
    const a2 = csh.animate([{ opacity: 0 }, { opacity: .85 }], { duration: FLIP, fill: 'forwards' });
    sh.animate([{ opacity: .7 }, { opacity: 0 }], { duration: FLIP + 260, easing: 'ease-out' });
    return new Promise(res => {
      a.onfinish = () => { cur.el.classList.add('bk-hidden'); a.cancel(); a2.cancel(); cur.el.style.zIndex = ''; el.style.zIndex = ''; flipping = false; res(true); };
    });
  }
  function popLeaf() {
    if (leaves.length < 2) return Promise.resolve(true);
    const cur = leaves.pop(), prev = top();
    flipping = true; hideTip(); Snd.fx.page();
    prev.el.classList.remove('bk-hidden'); prev.el.style.zIndex = 2; cur.el.style.zIndex = 1;
    const a = prev.el.animate([{ transform: 'rotateY(-92deg)' }, { transform: 'rotateY(0deg)' }], { duration: FLIP, easing: 'cubic-bezier(.2,.55,.45,1)' });
    prev.el.querySelector('.bk-shade').animate([{ opacity: .85 }, { opacity: 0 }], { duration: FLIP });
    cur.el.querySelector('.bk-shade').animate([{ opacity: 0 }, { opacity: .6 }], { duration: FLIP, fill: 'forwards' });
    return new Promise(res => { a.onfinish = () => { cur.el.remove(); prev.el.style.zIndex = ''; flipping = false; if (!dead) apply(); res(true); }; });
  }
  /** 翻到特写页 spec.scenes[name] */
  async function open(name) {
    const sc = spec.scenes[name]; if (!sc || flipping) return true;
    await pushLeaf(plateLeaf(sc.svg(S, g), sc.cap || '', T.back), 'zoom', name);
    if (sc.intro && !S.seen['z_' + name]) { S.seen['z_' + name] = true; save(); narr(sc.intro); }
    spec.onOpen?.(name, g);
    return true;
  }
  /** 翻到文字页 spec.sheets[name]（读信、命名、拼字等）；页内按钮写 data-act="xxx" → spec.act('xxx') */
  function sheet(name) {
    const sh = spec.sheets?.[name]; if (!sh || flipping) return true;
    pushLeaf(sheetLeaf(sh.html(S, g), sh.cap || '', sh.back ?? T.back), 'sheet', name);
    return true;
  }
  function openNotebook() {
    if (flipping) return;
    pushLeaf(sheetLeaf(`<div class="bk-sh-k">${T.notebookKicker}</div><div class="bk-sh-h">${T.notebookTitle}</div>
      <ul class="bk-lined">${S.notes.map(n => `<li>${n}</li>`).join('')}</ul>`, T.notebookCap, T.back), 'notes', 'notes');
    const ul = top().el.querySelector('.bk-lined'); if (ul) ul.scrollTop = ul.scrollHeight;
  }
  async function back() {
    const t = top(); if (!t || t.kind === 'main' || flipping) return true;
    await popLeaf();
    if (!dead) spec.onBack?.(t.name, g);
    return true;
  }
  /** 按当前 S 重画栈顶图版（画面变化复杂、不想写 data-if 时用） */
  function refresh() {
    const t = top(); if (!t) return;
    const sc = t.kind === 'main' ? spec.scenes.main : spec.scenes[t.name];
    const plate = t.el.querySelector('.bk-plate');
    if (sc && plate) { plate.innerHTML = sc.svg(S, g); apply(); }
  }

  /* ---------------- 渲染 ---------------- */
  function apply() {
    if (dead) return;
    $$('[data-if]').forEach(el => { el.style.display = cond(el.dataset.if) ? '' : 'none'; });
    // data-cls="lit:candleLit; open:boxOpen" —— 条件成立时加 class（配合 CSS 动效）
    $$('[data-cls]').forEach(el => el.dataset.cls.split(';').forEach(pair => {
      const [c, ex] = pair.split(':').map(s => s && s.trim()); if (c && ex) el.classList.toggle(c, cond(ex));
    }));
    $$('.bk-pip').forEach(p => p.classList.toggle('on', cond(p.dataset.k)));
    spec.render?.(g);
    renderInv();
    save();
  }
  function renderInv() {
    let h = '';
    for (let i = 0; i < (spec.slots || 7); i++) {
      const it = S.inv[i];
      if (it) h += `<div class="bk-slot ${sel === it.id ? 'sel' : ''} ${arriving.has(it.id) ? 'arriving' : ''}" data-id="${it.id}" title="${item(it.id).name}">${item(it.id).icon}${it.n > 1 ? `<span class="cnt">${it.n}</span>` : ''}</div>`;
      else h += '<div class="bk-slot empty"></div>';
    }
    invEl.innerHTML = h;
  }

  /* ---------------- 旁白 / 物品飞入 ---------------- */
  let narrT = null;
  function narr(text, whisper = false) {
    if (narrT) { clearTimeout(narrT); timers.delete(narrT); }
    narrSpan.classList.add('out');
    narrT = later(() => { narrT = null; narrSpan.textContent = text; narrSpan.classList.toggle('whisper', whisper); narrSpan.classList.remove('out'); }, 200);
    return true;
  }
  const fail = t => { Snd.fx.wrong(); narr(t || pick(T.fail)); return true; };
  function hideTip() { tipEl.classList.remove('show'); }
  function fly(id, pt) {
    const slot = invEl.querySelector(`.bk-slot[data-id="${id}"]`);
    if (!slot || !pt) { arriving.delete(id); renderInv(); return; }
    const r = slot.getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'bk-flyer'; f.innerHTML = item(id).icon; document.body.appendChild(f);
    const x0 = pt.x - 26, y0 = pt.y - 26, x1 = r.left + r.width / 2 - 26, y1 = r.top + r.height / 2 - 26;
    const an = f.animate([
      { transform: `translate(${x0}px,${y0}px) scale(.5)`, opacity: 0 },
      { transform: `translate(${x0}px,${y0 - 46}px) scale(1.25)`, opacity: 1, offset: .32 },
      { transform: `translate(${x1}px,${y1}px) scale(1)`, opacity: 1 }
    ], { duration: 760, easing: 'cubic-bezier(.5,0,.3,1)' });
    an.onfinish = () => {
      f.remove(); if (dead) return; arriving.delete(id); renderInv();
      const s2 = invEl.querySelector(`.bk-slot[data-id="${id}"]`); if (s2) s2.classList.add('pop');
    };
  }
  /** 拾取：S[flag]=true、入物品栏、从点击处飞入。flag 默认 `${id}Taken`；flag=null 表示可重复拾取 */
  function take(id, pt, msg, flag = id + 'Taken', n = 1) {
    if (flag && S[flag]) return narr(T.already);
    if (flag) S[flag] = true;
    addItem(id, n); arriving.add(id);
    apply(); fly(id, pt); Snd.fx.pick(); if (msg) narr(msg);
    return true;
  }

  /* ---------------- 事件 ---------------- */
  function on(target, type, fn, opt) { target.addEventListener(type, fn, opt); cleanups.push(() => target.removeEventListener(type, fn, opt)); }
  on(sndBtn, 'click', () => { Snd.unlock(); Snd.toggle(); syncSnd(); });
  on(ribbon, 'click', () => {
    if (busy || flipping) return; lastAct = Date.now(); Snd.unlock();
    if (top().kind === 'notes') return back();
    openNotebook();
  });
  on(root, 'pointerdown', () => { Snd.unlock(); Snd.startDrone(); }, { once: true });

  on(box, 'click', e => {
    if (g.dragMoved) { g.dragMoved = false; return; }
    if (busy || flipping) return;
    lastAct = Date.now();
    const t = e.target;
    if (t.closest('[data-back]')) { Snd.fx.click(); return back(); }
    const pt = { x: e.clientX, y: e.clientY };
    const a = t.closest('[data-act]'); if (a) { Snd.fx.click(); spec.act?.(a.dataset.act, g, pt, a); return; }
    const el = t.closest('[data-hot]');
    if (!el) { if (sel) { sel = null; renderInv(); } return; }
    const id = el.dataset.hot;
    if (sel) { const it = sel; sel = null; renderInv(); return useOn(it, id, pt); }
    Snd.fx.click();
    spec.act?.(id, g, pt, el);
  });
  on(box, 'pointermove', e => { if (!flipping) tip(e); });
  on(box, 'pointerleave', hideTip);

  // 物品栏：点击 = 选中（再点另一件 = 组合）；拖到书页热区 = 使用；拖到另一格 = 组合
  let invDrag = null;
  on(invEl, 'pointerdown', e => {
    const slot = e.target.closest('.bk-slot[data-id]'); if (!slot || busy || flipping) return;
    e.preventDefault(); Snd.unlock();
    const id = slot.dataset.id, sx = e.clientX, sy = e.clientY; let dragging = false;
    const mv = ev => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) { dragging = true; ghost.innerHTML = item(id).icon; ghost.classList.add('on'); sel = id; renderInv(); }
      if (dragging) ghost.style.transform = `translate(${ev.clientX - 23}px,${ev.clientY - 23}px)`;
    };
    const stop = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); invDrag = null; };
    const up = ev => {
      stop(); if (dead) return;
      lastAct = Date.now();
      if (!dragging) return clickSlot(id);
      ghost.classList.remove('on');
      const t = document.elementFromPoint(ev.clientX, ev.clientY);
      sel = null; renderInv();
      if (!t || flipping || busy) return;
      const s2 = t.closest('.bk-slot[data-id]'); if (s2 && invEl.contains(s2)) return combine(id, s2.dataset.id);
      const h = t.closest('[data-hot]');
      if (h && box.contains(h)) useOn(id, h.dataset.hot, { x: ev.clientX, y: ev.clientY });
    };
    invDrag = stop;
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });
  on(document, 'keydown', e => {
    if (e.key !== 'Escape' || busy || flipping) return;
    if (top().kind !== 'main') back(); else if (sel) { sel = null; renderInv(); }
  });

  function hotName(id) {
    const n = typeof spec.names === 'function' ? spec.names(id, S) : spec.names?.[id];
    return n || '';
  }
  function tip(e) {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('[data-hot]');
    if (!el) return hideTip();
    const name = hotName(el.dataset.hot);
    if (!name) return hideTip();
    const r = wrap.getBoundingClientRect();
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
    tipEl.textContent = sel ? `${item(sel).name} → ${name}` : name;
    tipEl.classList.add('show');
  }

  /* ---------------- 物品：选中 / 组合 / 使用 ---------------- */
  function clickSlot(id) {
    Snd.fx.click();
    if (!sel) { sel = id; renderInv(); narr(`${item(id).name} —— ${item(id).desc}`); return; }
    if (sel === id) { sel = null; renderInv(); return; }
    combine(sel, id);
  }
  function combine(a, b) {
    if (a === b) return;
    const k = [a, b].sort().join('+');
    const r = spec.recipes?.[k];
    if (r) {
      removeItem(a); removeItem(b); addItem(r.out); sel = null;
      if (r.note) addNote(r.note);
      apply(); Snd.fx.ink(); narr(r.msg);
      const s = invEl.querySelector(`.bk-slot[data-id="${r.out}"]`); if (s) s.classList.add('pop');
      return;
    }
    if (spec.badCombos?.[k]) { sel = null; renderInv(); return fail(spec.badCombos[k]); }
    sel = b; renderInv(); narr(`${item(b).name} —— ${item(b).desc}`);
  }
  function useOn(it, target, pt) {
    lastAct = Date.now();
    if (spec.use?.(it, target, g, pt)) return;
    fail();
  }

  /* ---------------- 结局 ---------------- */
  /** 通关：闪光 + 光点飞散 + 旁白，delay 毫秒后通知 App（进入过场页） */
  async function finish(text, delay = 5000) {
    if (finishing) return true; finishing = true;
    busy = true; Snd.fx.magic();
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    await wait(350);
    S.finished = true; apply();
    motes();
    if (text) narr(text);
    Snd.stopDrone();
    await wait(delay);
    busy = false;
    onComplete?.();
    return true;
  }
  function motes() {
    const H = wrap.clientHeight, W = wrap.clientWidth;
    for (let i = 0; i < 18; i++) {
      const b = document.createElement('div'); b.className = 'bk-mote';
      const x0 = W * (.15 + Math.random() * .7), y0 = H * (.4 + Math.random() * .4);
      b.style.left = x0 + 'px'; b.style.top = y0 + 'px'; wrap.appendChild(b);
      const dx = (Math.random() - .5) * W * .6, dy = -(y0 + 40);
      b.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(.6)', opacity: 0 },
        { opacity: 1, offset: .12 },
        { transform: `translate(${dx * .5}px,${dy * .5}px) rotate(${Math.random() * 60 - 30}deg) scale(1)`, opacity: 1, offset: .55 },
        { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 80 - 40}deg) scale(.8)`, opacity: 0 }
      ], { duration: 4200 + Math.random() * 2400, delay: Math.random() * 1500, easing: 'ease-out', fill: 'both' }).onfinish = () => b.remove();
    }
  }

  /* ---------------- 提示（两级：第一次给方向，再点给做法） ---------------- */
  function getHint() {
    if (dead) return '';
    const [k, soft, hard] = S.finished ? ['end', T.done, T.done] : spec.hint(S, g);
    const lvl = S.hints[k] || 0;
    S.hints[k] = lvl + 1; save();
    Snd.fx.chime();
    narr(T.whisper + (lvl === 0 ? soft : hard), true);
    lastAct = Date.now();
    return '';
  }

  /* ---------------- 自动通关（📜 里的按钮） ---------------- */
  async function autoSolve() {
    if (dead || S.finished || finishing) return;
    leaves.splice(1).forEach(l => l.el.remove());
    leaves[0].el.classList.remove('bk-hidden'); leaves[0].el.getAnimations().forEach(a => a.cancel());
    flipping = false; sel = null;
    spec.solve?.(S, g);
    refresh(); Snd.fx.page();
    narr(T.auto, true);
    busy = true;
    await wait(1600);
    busy = false;
    spec.finale ? spec.finale(g) : finish();
  }

  /* ---------------- 章节可用的上下文 g ---------------- */
  const g = {
    get S() { return S; }, get sel() { return sel; }, get busy() { return busy; }, get flipping() { return flipping; },
    lock(v = true) { busy = v; }, dragMoved: false,
    has, addItem, removeItem, addNote, cond, cycle, item,
    narr, fail, take, open, sheet, back, refresh, apply, save, finish,
    later, wait, every, on, $, $$, top, root, wrap, Snd, svgEl, svgPt, pick, shuffle,
  };

  /* ---------------- 启动 ---------------- */
  pushLeaf(plateLeaf(spec.scenes.main.svg(S, g), spec.scenes.main.cap || '', ''), 'main', 'main');
  Snd.startDrone();
  every(() => {
    if (!nudged && !S.finished && Date.now() - lastAct > 60000) { nudged = true; narr(T.nudge, true); }
  }, 5000);
  spec.mount?.(g);
  if (!S.seen.intro) later(() => { S.seen.intro = true; save(); narr(spec.intro || ''); }, 500);
  else narr(S.finished ? T.done : T.resume);

  function destroy() {
    if (dead) return;
    dead = true;
    timers.forEach(t => clearTimeout(t)); timers.clear();
    intervals.forEach(t => clearInterval(t));
    cleanups.forEach(f => f());
    if (invDrag) invDrag();
    Snd.stopDrone();
    ghost.remove();
    document.querySelectorAll('.bk-flyer').forEach(f => f.remove());
    root.innerHTML = '';
    root.classList.remove('bk-root');
  }

  return { destroy, getHint, autoSolve };
}
