/* =========================================================
   第二章 · 冰的炼金术 —— 关卡引擎
   mountChapter2(root, { onComplete }) => { destroy, getHint, autoSolve }
   沿用第一章的书页框架：场景切换 = 翻页；物品放进纸口袋；旁白写在书页上
   玩法：磁铁淘泥 → 付钱进帐篷（卖头盔补差价）→ 擦去冰霜（手会冻僵）→ 挪动油灯，让冰把梦里的城投到白布上
   ========================================================= */
import { ART } from '../chapter1/art.js';
import { ART2, BURIED, ICE_POLY, ropeY } from './art.js';
import { Snd } from '../shared/sound.js';

const SAVE_KEY = 'macondo2_ch1';
const SVGNS = 'http://www.w3.org/2000/svg';
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function svgEl(tag, attrs) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
function svgPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function scrPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(svg.getScreenCTM()); return { x: q.x, y: q.y }; }

/* ---------------- 数据 ---------------- */
const ITEMS = {
  magnet: { name: '磁铁', desc: '梅尔基亚德斯留下的两块磁铁，能把藏起来的铁都唤出来。' },
  coins: { name: '里亚尔', desc: '银币。在马孔多，看一眼奇迹也要花钱。' },
  helmet: { name: '锈头盔', desc: '十五世纪盔甲上的头盔，锈成了一整块，敲起来像只空葫芦。' }
};
const NAMES = {
  sun: '太阳', poster: '告示', parrot: '鹦鹉', trader: '吉普赛商贩', sign: '木牌', tent: '帐篷入口', giant: '守门的巨人',
  jose: '何塞·阿尔卡蒂奥·布恩迪亚', arca: '小何塞·阿尔卡蒂奥', aure: '小奥雷里亚诺', mud: '泥地',
  magnet: '磁铁', giant2: '巨人', sheet: '白布', chest: '海盗箱', ice: '冰', kids: '孩子们', lamp: '油灯', frost: '冰霜'
};
const ZMAP = { chest: 'ice', ice: 'ice', giant2: 'ice', frost: 'ice' };
const PIPS = [['mag', '磁'], ['coin', '币'], ['ice', '冰'], ['city', '城']];
const LINES = {
  jose: ['何塞：“我昨夜梦见一座喧闹的城，所有房子的墙都是镜子做的。”', '何塞：“他们说梅尔基亚德斯死在新加坡的沙洲上了……可他的磁铁还在。”', '何塞：“我要让孩子们看看，这世界上还有多少奇迹。”'],
  arca: ['小何塞·阿尔卡蒂奥盯着巨人的胳膊，满眼羡慕。', '小何塞·阿尔卡蒂奥：“爸爸，里面是不是关着一头怪兽？”'],
  aure: ['小奥雷里亚诺一言不发，黑沉沉的眼睛盯着帐篷，像要把它看穿。', '小奥雷里亚诺悄悄说：“我觉得……那里面很冷。”'],
  giant: ['巨人一言不发，铜鼻环在暮光里一闪一闪。', '巨人胸口的毛，像一片黑森林。'],
  giant2: ['巨人守着箱子，像守着一件圣物。', '巨人瞥了一眼冰，又瞥了一眼你的钱袋。'],
  trader: ['商贩举起一块放大镜：“能把太阳变成武器！”——何塞上次就是这么把自己烫伤的。', '商贩把一副假牙泡进水杯：“梅尔基亚德斯的。戴上它，人就年轻了。”', '商贩摇了摇望远镜：“看得见天边的东西，不用出门。”'],
  parrot: ['鹦鹉：“里亚尔！三十！里亚尔！”', '鹦鹉：“冰！冰！最伟大！”', '鹦鹉歪着头看你，学了一声乌尔苏拉的叹气。'],
  sun: ['太阳快落了，热得像在烤面包。在马孔多，谁见过冷得冒烟的东西？', '何塞曾想用放大镜把太阳变成武器，结果把自己烫得满身是疮。'],
  kids: ['两个孩子踮着脚往箱子里看，一动也不敢动。', '小奥雷里亚诺小声说：“它在冒烟……”']
};
const ZOOM = {
  mud: { cap: 'Lám. II · El barro', intro: '帐篷前的一片泥地，被人和骡子踩得稀烂。几个小土包在暮光里闪着光。' },
  tent: { cap: 'Lám. III · La carpa', intro: '帐篷里闷热、昏暗。中央摆着一只海盗箱，巨人守在旁边；头顶的绳子上挂着一盏油灯。' },
  ice: { cap: 'Lám. IV · El hielo', intro: '冰面结着厚厚的白霜，凉气直往手指里钻。按住冰面来回擦。' }
};
const MAIN_CAP = 'Lám. I · Los gitanos';
const SHEET_X = 295, PROJ_Y = 124, LAMP_T = 200 - (SHEET_X - 200) / 0.95;
const projX = lx => 200 + (200 - lx) * 0.95;
const KEY_FINDS = ['pot', 'helmet', 'box'];

/* ---------------- 状态 ---------------- */
const INIT = () => ({
  inv: [], magnetTaken: false,
  found: { n1: false, n2: false, n3: false, pot: false, helmet: false, box: false }, magPos: [330, 70],
  helmetSold: false, entryPaid: false, chestOpen: false, touchPaid: false, iceClear: false,
  lampX: 250, cityShown: false, finished: false, numbs: 0,
  notes: ['何塞昨夜梦见一座喧闹的城：所有房子的墙，都是镜子做的。'], seen: {}, hints: {}
});
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s) { const b = INIT(); return { ...b, ...s, found: { ...b.found, ...s.found } }; }
  } catch (e) { }
  return INIT();
}

/* =========================================================
   挂载
   ========================================================= */
export function mountChapter2(root, { onComplete } = {}) {
  let S = loadState();
  let dead = false, sel = null, busy = false, flipping = false;
  let drag = null, dragMoved = false, lastAct = Date.now(), nudged = false;
  let frost = null, lampRot = 0, lastHum = 0, lastPing = 0;
  const arriving = new Set();
  const timers = new Set(), intervals = [], cleanups = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms); timers.add(t); return t; };
  const wait = ms => new Promise(r => later(r, ms));
  const every = (fn, ms) => intervals.push(setInterval(() => { if (!dead) fn(); }, ms));
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const save = () => { if (dead) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } };
  const lineIdx = {};
  const line = k => { const a = LINES[k]; const i = (lineIdx[k] || 0) % a.length; lineIdx[k] = i + 1; return a[i]; };
  function cond(expr) {
    return expr.split('+').every(term => {
      term = term.trim(); const neg = term[0] === '!'; if (neg) term = term.slice(1);
      const v = term.split('.').reduce((o, k) => (o == null ? undefined : o[k]), S);
      return neg ? !v : !!v;
    });
  }
  const has = id => S.inv.some(i => i.id === id);
  const coins = () => { const it = S.inv.find(i => i.id === 'coins'); return it ? it.n : 0; };
  function addItem(id, n = 1) { const it = S.inv.find(i => i.id === id); if (it) it.n += n; else S.inv.push({ id, n }); }
  function removeItem(id, n = 1) { const it = S.inv.find(i => i.id === id); if (!it) return; it.n -= n; if (it.n <= 0) S.inv = S.inv.filter(i => i !== it); if (sel === id && !has(id)) sel = null; }
  function addNote(t) {
    if (S.notes.includes(t)) return;
    S.notes.push(t);
    if (ribbon) { ribbon.classList.remove('new'); void ribbon.offsetWidth; ribbon.classList.add('new'); }
  }
  const pipOn = k => k === 'mag' ? (S.found.box && S.found.helmet) : k === 'coin' ? S.entryPaid : k === 'ice' ? S.iceClear : S.cityShown;

  /* ---------------- DOM ---------------- */
  root.classList.add('c1-root', 'c2-root');
  root.innerHTML = `<svg class="c1-defs" aria-hidden="true">${ART.DEFS}${ART2.DEFS}</svg>
  <div class="c1-wrap">
    <div class="c1-head">
      <span class="c1-kicker"><b>CAP. I</b>El gran invento de nuestro tiempo</span>
      <div class="c1-pips" title="冰的炼金术">${PIPS.map(([k, c]) => `<div class="c1-pip" data-k="${k}"><span>${c}</span></div>`).join('')}</div>
    </div>
    <div class="c1-stage"><div class="c1-box"></div></div>
    <div class="c1-narr"><span></span></div>
    <div class="c1-bottom"><button class="c1-snd" type="button"></button><div class="c1-inv"></div><button class="c1-ribbon" type="button" title="何塞的笔记本">笔记本</button></div>
    <div class="c1-tip"></div><div class="c1-flash c2-flash"></div>
  </div>`;
  const wrap = $('.c1-wrap'), box = $('.c1-box'), invEl = $('.c1-inv'), ribbon = $('.c1-ribbon');
  const narrSpan = $('.c1-narr span'), tipEl = $('.c1-tip'), flashEl = $('.c1-flash'), sndBtn = $('.c1-snd');
  const ghost = document.createElement('div'); ghost.className = 'c1-ghost'; document.body.appendChild(ghost);
  const syncSnd = () => { sndBtn.textContent = '♪'; sndBtn.classList.toggle('off', !Snd.on); sndBtn.title = Snd.on ? '关闭声音' : '开启声音'; };
  syncSnd();

  /* ---------------- 页栈 ---------------- */
  const leaves = [];
  const top = () => leaves[leaves.length - 1];
  function makeLeaf(inner, cap, plate, back) {
    const el = document.createElement('div'); el.className = 'c1-leaf';
    el.innerHTML = inner + ART.FRAME(cap, plate) + (back ? `<button class="c1-back" type="button" data-back="1">${back}</button>` : '') + '<div class="c1-shade"></div>';
    return el;
  }
  const plateLeaf = (svg, cap, back) => makeLeaf(`<div class="c1-plate">${svg}</div>`, cap, true, back);
  const sheetLeaf = (html, cap, back) => makeLeaf(`<div class="c1-sheet">${html}</div>`, cap, false, back);
  const FLIP = 560;
  function pushLeaf(el, kind, name) {
    const cur = top();
    leaves.push({ el, kind, name });
    box.appendChild(el);
    apply();
    if (!cur) return Promise.resolve();
    flipping = true; hideTip(); Snd.fx.page();
    el.style.zIndex = 1; cur.el.style.zIndex = 2;
    const csh = cur.el.querySelector('.c1-shade'), sh = el.querySelector('.c1-shade');
    const a = cur.el.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-92deg)' }], { duration: FLIP, easing: 'cubic-bezier(.55,.05,.8,.45)', fill: 'forwards' });
    const a2 = csh.animate([{ opacity: 0 }, { opacity: .85 }], { duration: FLIP, fill: 'forwards' });
    sh.animate([{ opacity: .7 }, { opacity: 0 }], { duration: FLIP + 260, easing: 'ease-out' });
    return new Promise(res => {
      a.onfinish = () => {
        cur.el.classList.add('c1-hidden'); a.cancel(); a2.cancel();
        cur.el.style.zIndex = ''; el.style.zIndex = ''; flipping = false; res();
      };
    });
  }
  function popLeaf() {
    if (leaves.length < 2) return Promise.resolve();
    const cur = leaves.pop(), prev = top();
    if (cur.name === 'ice') frost = null;
    flipping = true; hideTip(); Snd.fx.page();
    prev.el.classList.remove('c1-hidden'); prev.el.style.zIndex = 2; cur.el.style.zIndex = 1;
    const a = prev.el.animate([{ transform: 'rotateY(-92deg)' }, { transform: 'rotateY(0deg)' }], { duration: FLIP, easing: 'cubic-bezier(.2,.55,.45,1)' });
    prev.el.querySelector('.c1-shade').animate([{ opacity: .85 }, { opacity: 0 }], { duration: FLIP });
    cur.el.querySelector('.c1-shade').animate([{ opacity: 0 }, { opacity: .6 }], { duration: FLIP, fill: 'forwards' });
    return new Promise(res => {
      a.onfinish = () => { cur.el.remove(); prev.el.style.zIndex = ''; flipping = false; if (!dead) apply(); res(); };
    });
  }
  async function back() {
    const t = top(); if (!t || t.kind === 'main') return;
    await popLeaf();
    const n = top().name;
    if (n === 'tent' && S.iceClear && !S.cityShown) narr('冰清澈得像一扇窗。头顶那盏油灯的光，正从冰里穿过去……');
  }

  /* ---------------- 渲染 ---------------- */
  function apply() {
    if (dead) return;
    $$('[data-if]').forEach(el => { el.style.display = cond(el.dataset.if) ? '' : 'none'; });
    renderMag(); renderLamp(); renderInv();
    $$('.c1-pip').forEach(p => p.classList.toggle('on', pipOn(p.dataset.k)));
    save();
  }
  function renderInv() {
    let h = '';
    for (let i = 0; i < 7; i++) {
      const it = S.inv[i];
      if (it) h += `<div class="c1-slot ${sel === it.id ? 'sel' : ''} ${arriving.has(it.id) ? 'arriving' : ''}" data-id="${it.id}" title="${ITEMS[it.id].name}">${ART2.ICONS[it.id]}${it.n > 1 ? `<span class="cnt">${it.n}</span>` : ''}</div>`;
      else h += '<div class="c1-slot empty"></div>';
    }
    invEl.innerHTML = h;
  }
  function renderMag() {
    const m = $('#c2-mag'); if (m) m.setAttribute('transform', `translate(${S.magPos[0].toFixed(1)} ${S.magPos[1].toFixed(1)})`);
  }
  function renderLamp() {
    const lamp = $('#c2-lamp'); if (!lamp) return;
    const x = S.lampX, y = ropeY(x);
    lamp.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${lampRot.toFixed(1)})`);
    if (!S.chestOpen) return;
    const px = projX(x), d = Math.abs(px - SHEET_X);
    const pin = $('#c2-projIn'), blur = $('#c2-pblurS'), proj = $('#c2-proj');
    if (pin) pin.setAttribute('transform', `translate(${px.toFixed(1)} ${PROJ_Y}) scale(${S.iceClear ? 1 : 1.25})`);
    if (blur) blur.setAttribute('stdDeviation', S.cityShown ? '0.01' : S.iceClear ? Math.min(7, d / 7).toFixed(2) : '9');
    if (proj) proj.style.opacity = S.iceClear ? clamp(1 - d / 170, .35, 1).toFixed(2) : '.5';
    const b1 = $('#c2-beam1'), b2 = $('#c2-beam2');
    if (b1) b1.setAttribute('points', `${x.toFixed(1)},${(y + 58).toFixed(1)} 174,210 228,206`);
    if (b2) b2.setAttribute('points', `178,210 224,206 ${(px + 48).toFixed(1)},${PROJ_Y} ${(px - 48).toFixed(1)},${PROJ_Y}`);
    const g = $('#c2-sheetGlow'); if (g) g.classList.toggle('on', S.cityShown);
  }

  /* ---------------- 旁白 ---------------- */
  let narrT = null;
  function narr(text, whisper = false) {
    if (narrT) { clearTimeout(narrT); timers.delete(narrT); }
    narrSpan.classList.add('out');
    narrT = later(() => {
      narrT = null;
      narrSpan.textContent = text; narrSpan.classList.toggle('whisper', whisper);
      narrSpan.classList.remove('out');
    }, 200);
  }
  const fail = t => { Snd.fx.wrong(); narr(t); };
  function hideTip() { tipEl.classList.remove('show'); }
  function fly(id, pt) {
    const slot = invEl.querySelector(`.c1-slot[data-id="${id}"]`);
    if (!slot || !pt) { arriving.delete(id); renderInv(); return; }
    const r = slot.getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'c1-flyer'; f.innerHTML = ART2.ICONS[id]; document.body.appendChild(f);
    const x0 = pt.x - 26, y0 = pt.y - 26, x1 = r.left + r.width / 2 - 26, y1 = r.top + r.height / 2 - 26;
    const an = f.animate([
      { transform: `translate(${x0}px,${y0}px) scale(.5)`, opacity: 0 },
      { transform: `translate(${x0}px,${y0 - 46}px) scale(1.25)`, opacity: 1, offset: .32 },
      { transform: `translate(${x1}px,${y1}px) scale(1)`, opacity: 1 }
    ], { duration: 760, easing: 'cubic-bezier(.5,0,.3,1)' });
    an.onfinish = () => {
      f.remove(); if (dead) return; arriving.delete(id); renderInv();
      const s2 = invEl.querySelector(`.c1-slot[data-id="${id}"]`); if (s2) s2.classList.add('pop');
    };
  }
  function give(id, n, pt, msg) {
    addItem(id, n); arriving.add(id);
    apply(); fly(id, pt); Snd.fx.pick(); if (msg) narr(msg);
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
    if (dragMoved) { dragMoved = false; return; }
    if (busy || flipping) return;
    lastAct = Date.now();
    const t = e.target;
    if (t.closest('[data-back]')) { Snd.fx.click(); return back(); }
    const el = t.closest('[data-hot],[data-z]');
    if (!el) { if (sel) { sel = null; renderInv(); } return; }
    const id = el.dataset.hot || el.dataset.z, isZ = !el.dataset.hot;
    const pt = { x: e.clientX, y: e.clientY };
    if (sel) { const item = sel; sel = null; renderInv(); useOn(item, isZ ? (ZMAP[id] || id) : id, pt); return; }
    isZ ? actZ(id, pt) : act(id, pt);
  });

  on(box, 'pointerdown', e => {
    dragMoved = false;
    if (busy || flipping || sel) return;
    const cv = e.target.closest('.c2-frost');
    if (cv && frost) {
      drag = { z: 'rub', total: 0, lx: e.clientX, ly: e.clientY };
      frost.rubbing = true; frost.last = null;
      if (frost.numb) narr('手指还冻着……先等一下。');
      try { cv.setPointerCapture(e.pointerId); } catch (er) { }
      e.preventDefault(); rubAt(e);
      return;
    }
    const el = e.target.closest('.c1-drag'); if (!el) return;
    const z = el.dataset.z, svg = el.ownerSVGElement, p = svgPt(svg, e.clientX, e.clientY);
    if (z === 'magnet') drag = { z, svg, dx: S.magPos[0] - p.x, dy: S.magPos[1] - p.y, total: 0, lx: e.clientX, ly: e.clientY };
    else if (z === 'lamp') { if (S.cityShown) return; drag = { z, svg, dx: S.lampX - p.x, total: 0, lx: e.clientX, ly: e.clientY }; }
    else return;
    try { el.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault();
  });
  on(box, 'pointermove', e => {
    if (drag) {
      drag.total += Math.hypot(e.clientX - drag.lx, e.clientY - drag.ly); drag.lx = e.clientX; drag.ly = e.clientY;
      if (drag.total > 4) dragMoved = true;
      lastAct = Date.now();
      if (drag.z === 'rub') return rubAt(e);
      const p = svgPt(drag.svg, e.clientX, e.clientY);
      if (drag.z === 'magnet') moveMagnet(p.x + drag.dx, p.y + drag.dy);
      else if (drag.z === 'lamp') moveLamp(p.x + drag.dx);
      return;
    }
    if (flipping) return;
    tip(e);
  });
  const endDrag = () => {
    if (dragMoved) later(() => { dragMoved = false; }, 60);
    if (!drag) return; const z = drag.z; drag = null;
    if (z === 'rub') { if (frost) { frost.rubbing = false; frost.last = null; } return; }
    if (z === 'lamp') return lampEnd();
    save();
  };
  on(box, 'pointerup', endDrag);
  on(box, 'pointercancel', endDrag);
  on(box, 'pointerleave', hideTip);

  // 纸口袋：点击选择；拖到书页上使用
  let invDrag = null;
  on(invEl, 'pointerdown', e => {
    const slot = e.target.closest('.c1-slot[data-id]'); if (!slot || busy || flipping) return;
    e.preventDefault(); Snd.unlock();
    const id = slot.dataset.id, sx = e.clientX, sy = e.clientY; let dragging = false;
    const mv = ev => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        dragging = true; ghost.innerHTML = ART2.ICONS[id]; ghost.classList.add('on'); sel = id; renderInv();
      }
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
      const h = t.closest('[data-hot],[data-z]');
      if (h && box.contains(h)) { const hid = h.dataset.hot || h.dataset.z; useOn(id, h.dataset.hot ? hid : (ZMAP[hid] || hid), { x: ev.clientX, y: ev.clientY }); }
    };
    invDrag = stop;
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });
  on(document, 'keydown', e => {
    if (e.key !== 'Escape' || busy || flipping) return;
    if (top().kind !== 'main') back();
    else if (sel) { sel = null; renderInv(); }
  });

  function tip(e) {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('[data-hot],[data-z]');
    if (!el) return hideTip();
    const id = el.dataset.hot || el.dataset.z, name = NAMES[id];
    if (!name) return hideTip();
    const r = wrap.getBoundingClientRect();
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
    tipEl.textContent = sel ? `${ITEMS[sel].name} → ${name}` : name;
    tipEl.classList.remove('garble');
    tipEl.classList.add('show');
  }

  /* ---------------- 纸口袋 ---------------- */
  const descOf = id => id === 'coins' ? `${coins()} 枚银币。在马孔多，看一眼奇迹也要花钱。` : ITEMS[id].desc;
  function clickSlot(id) {
    Snd.fx.click();
    if (!sel) { sel = id; renderInv(); narr(`${ITEMS[id].name} —— ${descOf(id)}`); return; }
    if (sel === id) { sel = null; renderInv(); return; }
    sel = id; renderInv(); narr(`${ITEMS[id].name} —— ${descOf(id)}`);
  }

  /* ---------------- 主场景 ---------------- */
  function act(id, pt) {
    Snd.fx.click();
    switch (id) {
      case 'sun': return narr(line('sun'));
      case 'poster':
        addNote('告示：冰——本世纪最伟大的发明。入场 30 里亚尔，触摸 10 里亚尔。'); save();
        return narr('告示上写着：“冰——本世纪最伟大的发明。入场三十里亚尔，触摸十里亚尔。”');
      case 'parrot': Snd.fx.squawk(); return narr(line('parrot'));
      case 'sign':
        addNote('吉普赛商贩的货摊挂着木牌：收旧铁。'); save();
        return narr('木牌上写着：收旧铁。吉普赛人什么破烂都收——只要是金属的。');
      case 'trader':
        if (has('helmet')) return narr('商贩捻着八字胡，盯着你手里的锈头盔，眼睛亮了一下。');
        return narr(line('trader'));
      case 'tent':
        if (!S.entryPaid) return narr('巨人往门口一站，像一堵墙。门帘被绳子系得死死的。');
        return openZoom('tent');
      case 'giant':
        if (!S.entryPaid) return narr('巨人伸出三根粗手指：“入场，三十里亚尔。”');
        return narr(line('giant'));
      case 'jose':
        if (!S.magnetTaken) {
          S.magnetTaken = true; addNote('何塞把梅尔基亚德斯的磁铁交给了你。');
          return give('magnet', 1, pt, '何塞从口袋里掏出两块磁铁：“梅尔基亚德斯留下的。万物皆有灵，只需唤醒它们。”');
        }
        return narr(line('jose'));
      case 'arca': return narr(line('arca'));
      case 'aure': return narr(line('aure'));
      case 'mud': return openZoom('mud');
    }
  }
  function actZ(id) {
    Snd.fx.click();
    switch (id) {
      case 'magnet': return narr('按住磁铁，在泥地上慢慢拖动——靠近那些鼓起的小土包。');
      case 'giant2':
        if (!S.chestOpen) return narr('巨人守着那只箱子，一动不动。');
        if (!S.touchPaid) return narr('巨人伸手拦住：“摸一下，再付十个里亚尔。”');
        return narr(line('giant2'));
      case 'chest': if (!S.chestOpen) return openChest(); return actZ('ice');
      case 'ice':
        if (!S.chestOpen) return openChest();
        if (S.iceClear) return narr(S.cityShown ? '冰在箱子里静静地冒着白气。' : '冰清澈透亮。头顶的灯光正穿过它，落到后墙上……');
        if (!S.touchPaid) return narr('巨人伸手拦住：“摸一下，再付十个里亚尔。”');
        return openZoom('ice');
      case 'sheet':
        if (S.cityShown) return narr('白布上映着一座城——房子的墙全是冰做的，在灯光里亮晶晶的。');
        return narr('后墙上挂着一块白布，平平整整，像在等什么画面落上去。');
      case 'kids': return narr(line('kids'));
      case 'lamp': return narr(S.cityShown ? '油灯安安静静地挂在那里。' : '一盏挂在绳子上的油灯。按住它，可以沿着绳子左右拖动。');
      case 'frost': return narr(frost && frost.numb ? '手指冻僵了，先缓一缓。' : '按住冰面，来回摩擦，把霜擦掉。');
    }
  }
  function useOn(item, t, pt) {
    lastAct = Date.now();
    if (item === 'coins') {
      if (t === 'giant' || t === 'tent') {
        if (S.entryPaid) return fail('入场费已经付过了。');
        if (coins() < 30) return fail('巨人数了数，摇摇头：不够三十。');
        removeItem('coins', 30); S.entryPaid = true; Snd.fx.coin();
        addNote('付了 30 里亚尔，巨人让我们进了帐篷。'); apply();
        return narr('巨人一枚一枚数完三十个里亚尔，咧嘴一笑，解开了门帘的绳子。');
      }
      if (t === 'ice') {
        if (!S.chestOpen) return fail('先看看箱子里装的是什么吧。');
        if (S.touchPaid) return fail('已经付过了，去摸吧。');
        if (coins() < 10) return fail('摸一下要十个里亚尔——你的钱不够。');
        removeItem('coins', 10); S.touchPaid = true; Snd.fx.coin();
        addNote('又付了 10 里亚尔，巨人允许我们摸一摸冰。'); apply();
        return narr('巨人收下十个里亚尔，往旁边让了一步：“摸吧。”');
      }
      if (t === 'trader') return fail('商贩想卖给你一副假牙。还是把钱留着看冰吧。');
      if (t === 'jose') return fail('何塞摆摆手：“钱你拿着，看冰要紧。”');
      if (t === 'parrot') return fail('鹦鹉伸嘴就要啄走一枚。你赶紧收了回来。');
    }
    if (item === 'helmet') {
      if (t === 'trader' || t === 'sign') {
        removeItem('helmet'); S.helmetSold = true; Snd.fx.coin();
        addNote('把锈头盔卖给了商贩，换来 10 里亚尔。');
        return give('coins', 10, pt, '“十五世纪的盔甲！”商贩敲了敲头盔，听着那空葫芦一样的回声，数给你十个里亚尔。');
      }
      if (t === 'giant' || t === 'ice') return fail('巨人把头盔往头上一扣——太小了，像顶着一只碗。他又还给了你。');
      if (t === 'jose') return fail('何塞：“十五世纪的盔甲……要是早几年，我会拿它做研究。现在，我只想看冰。”');
      if (t === 'aure' || t === 'arca' || t === 'kids') return fail('孩子把头盔扣在头上，咣当一声——又摘了下来。');
    }
    if (item === 'magnet') {
      if (t === 'mud') return openZoom('mud');
      if (t === 'giant') return fail('巨人的铜鼻环被吸得往前一伸。他狠狠瞪了你一眼。');
      if (t === 'trader') return fail('货摊上的铃铛和望远镜全朝你这边叮当作响。商贩赶紧按住了它们。');
      if (t === 'ice') return fail('磁铁对冰毫无办法——冰不是铁做的。那它是什么做的呢？');
      if (t === 'jose') return fail('何塞：“你拿着。泥地里也许埋着什么。”');
      if (t === 'sun') return fail('磁铁吸不来太阳。');
      if (t === 'magnet') return actZ('magnet');
    }
    fail(pick(['这样没有用。', '什么也没发生。', '不是这样用的。']));
  }

  /* ---------------- 特写（翻到下一页） ---------------- */
  async function openZoom(name) {
    if (flipping) return;
    const leaf = plateLeaf(ART2[name](), ZOOM[name].cap, '翻回');
    if (name === 'ice') setupFrost(leaf);
    await pushLeaf(leaf, 'zoom', name);
    if (dead) return;
    if (name === 'mud') {
      if (!S.magnetTaken) return narr('泥里埋着什么硬东西，在暮光里一闪一闪，可用手怎么也抠不出来。');
      if (!S.seen.z_mud) { S.seen.z_mud = true; save(); return narr('按住磁铁，在泥地上拖动。铁做的东西，会自己跳出来。'); }
      if (KEY_FINDS.every(k => S.found[k])) return narr('泥地已经被翻了个遍，没什么可找的了。');
      return;
    }
    if (!S.seen['z_' + name]) { S.seen['z_' + name] = true; save(); narr(ZOOM[name].intro); }
    else if (name === 'tent' && S.iceClear && !S.cityShown) narr('头顶那盏油灯的光，正从冰里穿过去……');
  }

  /* ---------------- 泥地：磁铁 ---------------- */
  function moveMagnet(x, y) {
    S.magPos = [clamp(x, 32, 368), clamp(y, 40, 330)];
    renderMag();
    const tx = S.magPos[0], ty = S.magPos[1] + 30;
    let near = false;
    for (const k in BURIED) {
      if (S.found[k]) continue;
      const [bx, by] = BURIED[k], d = Math.hypot(bx - tx, by - ty);
      const m = $('#c2-m-' + k); if (m) m.classList.toggle('tremble', d < 80);
      if (d < 80) near = true;
      if (d < 32) pull(k);
    }
    const now = Date.now();
    if (near && now - lastHum > 420) { lastHum = now; Snd.fx.hum(); }
  }
  function pull(k) {
    S.found[k] = true;
    if (k[0] === 'n') {
      Snd.fx.clink(); Snd.fx.clink(.09); apply();
      const g = $(`#c2-mag [data-if="found.${k}"]`); if (g) g.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.3,1.8,.5,1)' });
      if (!S.seen.nail) { S.seen.nail = true; narr('叮叮当当——几根生锈的铁钉跳起来，粘在了磁铁上。'); }
      return;
    }
    apply(); hop(k);
  }
  async function hop(k) {
    const svg = $('#c2-mud'), layer = $('#c2-hopLayer'); if (!svg || !layer) return;
    const [bx, by] = BURIED[k], [mx, my] = S.magPos;
    const g = svgEl('g', {}); g.innerHTML = ART2.OBJ[k]; layer.appendChild(g);
    Snd.fx.thud(); Snd.fx.clink(.05);
    const a = g.animate([
      { transform: `translate(${bx}px,${by}px) scale(.6)` },
      { transform: `translate(${(bx + mx) / 2}px,${Math.min(by, my) - 30}px) scale(1.1)`, offset: .5 },
      { transform: `translate(${mx}px,${my + 42}px) scale(1)` }
    ], { duration: 460, easing: 'ease-out', fill: 'forwards' });
    await new Promise(r => { a.onfinish = r; });
    if (dead) return;
    Snd.fx.clink();
    if (k === 'pot') {
      const rx = bx + 36, ry = by + 10;
      const a2 = g.animate([
        { transform: `translate(${mx}px,${my + 42}px) rotate(0deg)` },
        { transform: `translate(${rx}px,${ry}px) rotate(-24deg)` }
      ], { duration: 520, delay: 380, easing: 'cubic-bezier(.5,0,.7,1.4)', fill: 'forwards' });
      await new Promise(r => { a2.onfinish = r; });
      g.remove(); if (dead) return; Snd.fx.thud();
      addNote('磁铁从泥里拽出一口铁锅——乌尔苏拉找了它整整一个月。');
      narr('一口铁锅！乌尔苏拉找了它整整一个月。它从磁铁上掉下来，咣当一声滚到了一边。');
      return checkDug();
    }
    const pt = scrPt(svg, mx, my + 42);
    later(() => {
      g.remove();
      if (k === 'helmet') {
        addNote('泥里挖出一顶十五世纪的锈头盔。');
        give('helmet', 1, pt, '一顶十五世纪的盔甲头盔！锈成了一整块，敲起来空空作响。');
      } else {
        addNote('泥里挖出一只铁皮钱匣，里面有 30 里亚尔。');
        give('coins', 30, pt, '一只铁皮钱匣！“咔哒”一声弹开——里面是三十枚里亚尔。不知是谁埋在这儿的。');
        Snd.fx.coin();
      }
      checkDug();
    }, 260);
  }
  function checkDug() {
    if (KEY_FINDS.every(k => S.found[k]) && !S.seen.dug) {
      S.seen.dug = true; save();
      later(() => narr('泥地被磁铁翻了个遍。钱有了——去帐篷门口找巨人吧。'), 2600);
    }
  }

  /* ---------------- 帐篷：海盗箱 ---------------- */
  function openChest() {
    S.chestOpen = true; Snd.fx.creak(); Snd.fx.mist();
    addNote('海盗箱里是一块巨大的透明石头，冒着白气。'); apply();
    narr('巨人掀开海盗箱的盖子，一股白色的寒气冒了出来——箱子里是一块巨大的透明石头，蒙着一层霜。');
    later(() => { if (!S.touchPaid) narr('何塞喃喃道：“这是世界上最大的钻石。”巨人纠正他：“不，这是冰。摸一下，十个里亚尔。”'); }, 3600);
  }

  /* ---------------- 冰：擦霜（手会冻僵） ---------------- */
  const STEP = 7;
  function setupFrost(leaf) {
    const plate = leaf.querySelector('.c1-plate');
    const cv = document.createElement('canvas'); cv.className = 'c2-frost'; cv.dataset.z = 'frost'; cv.width = 400; cv.height = 400;
    const coldEl = document.createElement('div'); coldEl.className = 'c2-cold';
    plate.appendChild(cv);
    plate.insertAdjacentHTML('beforeend', `<svg class="c2-iceEdge" viewBox="0 0 400 400"><path d="M${ICE_POLY.map(p => p.join(' ')).join(' L')}Z" fill="none" stroke="#2b1d12" stroke-width="2"/><path d="M78 110 L82 300" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/></svg>`);
    plate.appendChild(coldEl);
    const ctx = cv.getContext('2d');
    ctx.save(); ctx.beginPath(); ICE_POLY.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    const g = ctx.createLinearGradient(0, 40, 400, 360); g.addColorStop(0, 'rgba(247,248,242,.98)'); g.addColorStop(1, 'rgba(216,229,224,.97)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 400, 400);
    const branch = (x, y, len, a, w, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y);
      const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len; ctx.lineTo(ex, ey); ctx.stroke();
      for (let j = 1; j <= 3; j++) {
        const t = j / 4, sx = x + (ex - x) * t, sy = y + (ey - y) * t, l = len * (.35 - t * .06);
        [a + .7, a - .7].forEach(b => { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(b) * l, sy + Math.sin(b) * l); ctx.stroke(); });
      }
    };
    for (let i = 0; i < 26; i++) {
      const x = 70 + Math.random() * 270, y = 60 + Math.random() * 280, n = 5 + (i % 3);
      for (let k = 0; k < n; k++) branch(x, y, 10 + Math.random() * 18, k * Math.PI * 2 / n + i, 1.1, 'rgba(255,255,255,.95)');
    }
    for (let i = 0; i < 40; i++) branch(60 + Math.random() * 290, 50 + Math.random() * 300, 8 + Math.random() * 14, Math.random() * 6.28, .8, 'rgba(120,150,146,.45)');
    for (let i = 0; i < 260; i++) { ctx.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.9)' : 'rgba(150,175,170,.35)'; ctx.fillRect(60 + Math.random() * 290, 46 + Math.random() * 306, 1.4, 1.4); }
    ctx.font = 'italic 15px "Cormorant Garamond", serif'; ctx.fillStyle = 'rgba(90,110,106,.55)'; ctx.textAlign = 'center';
    ctx.fillText('— frótalo —', 200, 206);
    ctx.restore();
    const data = ctx.getImageData(0, 0, 400, 400).data; let total = 0;
    for (let p = 0; p < 160000; p += STEP) if (data[p * 4 + 3] > 40) total++;
    frost = { cv, ctx, coldEl, plate, total, moves: 0, cold: 0, numb: false, rubbing: false, last: null, dist: 0, done: false };
  }
  function brush(x, y) {
    const c = frost.ctx, g = c.createRadialGradient(x, y, 4, x, y, 26);
    g.addColorStop(0, 'rgba(0,0,0,.9)'); g.addColorStop(.6, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.fill();
  }
  function rubAt(e) {
    if (!frost || frost.done) return;
    if (frost.numb) { frost.last = null; return; }
    const r = frost.cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * 400 / r.width, y = (e.clientY - r.top) * 400 / r.height;
    const c = frost.ctx; c.globalCompositeOperation = 'destination-out';
    let d = 0;
    if (frost.last) {
      d = Math.hypot(x - frost.last[0], y - frost.last[1]);
      const n = Math.max(1, Math.ceil(d / 7));
      for (let i = 1; i <= n; i++) brush(frost.last[0] + (x - frost.last[0]) * i / n, frost.last[1] + (y - frost.last[1]) * i / n);
    } else brush(x, y);
    c.globalCompositeOperation = 'source-over';
    frost.last = [x, y];
    frost.cold += d * .11; frost.dist += d;
    if (frost.dist > 46) { frost.dist = 0; Snd.fx.sizzle(); }
    if (frost.cold >= 100) return numbHand();
    if (++frost.moves % 8 === 0) checkFrost();
  }
  function numbHand() {
    frost.numb = true; frost.cold = 100; frost.last = null; S.numbs++; save();
    Snd.fx.hiss();
    frost.plate.classList.remove('c2-numb'); void frost.plate.offsetWidth; frost.plate.classList.add('c2-numb');
    narr(S.numbs === 1 ? '嘶——！手指像被火燎了一下，猛地缩了回来。冻僵了，先松开缓一缓。'
      : pick(['嘶——！冰烫得像火。手指又冻僵了，歇一歇。', '手指冻得发麻，不听使唤了。等它缓过来。', '冷得钻心！先把手揣进怀里暖一暖。']));
  }
  function frostTick() {
    if (!frost || frost.done) return;
    frost.cold = Math.max(0, frost.cold - (frost.rubbing && !frost.numb ? .5 : 5));
    frost.coldEl.style.opacity = (Math.min(1, frost.cold / 100) * .95).toFixed(2);
    if (frost.numb && frost.cold < 25) { frost.numb = false; frost.last = null; narr('手指缓过来了。接着擦。'); }
  }
  function checkFrost() {
    const data = frost.ctx.getImageData(0, 0, 400, 400).data; let left = 0;
    for (let p = 0; p < 160000; p += STEP) if (data[p * 4 + 3] > 40) left++;
    if (1 - left / frost.total >= .62) iceCleared();
  }
  async function iceCleared() {
    if (!frost || frost.done) return;
    frost.done = true; drag = null; busy = true;
    frost.cv.classList.add('gone'); frost.coldEl.style.opacity = '0';
    S.iceClear = true; apply();
    Snd.fx.crack(); Snd.fx.shimmer();
    addNote('冰里有无数针尖，暮色在里面碎成了星星。');
    narr('霜化开了。冰里有无数针尖，暮色在里面碎成了五颜六色的星星。');
    await wait(3000);
    narr('小奥雷里亚诺把手按上去，又猛地缩回来：“它在沸腾！”');
    await wait(2800);
    addNote('何塞：“这是我们这个时代最伟大的发明。”');
    narr('何塞把手按在冰上，像对着《圣经》起誓：“这是我们这个时代最伟大的发明。”');
    await wait(3200);
    busy = false;
    if (top().name === 'ice') await popLeaf();
    if (!dead) narr('冰清澈得像一扇窗。头顶那盏油灯的光，正从冰里穿过去，落到后墙上……');
  }

  /* ---------------- 帐篷：油灯投影 ---------------- */
  function moveLamp(x) {
    const nx = clamp(x, 40, 360), d = nx - S.lampX;
    S.lampX = nx; lampRot = clamp(-d * 2.4, -16, 16);
    renderLamp();
    const now = Date.now();
    if (S.chestOpen && S.iceClear && !S.cityShown) {
      const dist = Math.abs(projX(nx) - SHEET_X);
      if (dist < 4) return lockCity();
      if (dist < 90 && now - lastPing > 260) { lastPing = now; Snd.tone(520 + (1 - dist / 90) * 700, .14, 'sine', .018); }
    } else if (now - lastPing > 500) { lastPing = now; Snd.fx.tick(); }
  }
  function lampEnd() {
    lampRot = 0; renderLamp(); save();
    if (!S.chestOpen) return narr('油灯晃了晃，照着那只紧闭的箱子。');
    if (!S.iceClear) {
      if (!S.seen.blob) { S.seen.blob = true; save(); }
      return narr('灯光透过结霜的冰，只在后墙上投下一团模糊的光。');
    }
    if (S.cityShown) return;
    const d = Math.abs(projX(S.lampX) - SHEET_X);
    if (d < 10) return lockCity();
    if (d < 40) return narr('白布上的影子越来越清楚了……再挪一点点。');
    if (d < 110) return narr('冰里的影子在后墙上晃动，像是一排房子。');
    narr('光从冰里穿出去，落在了别处。');
  }
  let locking = false;
  async function lockCity() {
    if (locking) return; locking = true;
    drag = null; lampRot = 0; S.lampX = LAMP_T; S.cityShown = true; busy = true;
    apply(); Snd.fx.shimmer(); Snd.fx.magic();
    addNote('灯光穿过冰块，在白布上映出一座城：房子的墙全是冰做的。');
    narr('白布上忽然映出一座城——一排排房子，墙壁亮晶晶的，像镜子，又像……冰。');
    await wait(3200);
    narr('何塞愣住了：“就是它！我梦里那座城——那些墙不是镜子，是冰！”');
    await wait(3000);
    busy = false;
    finish();
  }

  /* ---------------- 笔记本 ---------------- */
  function openNotebook() {
    if (flipping) return;
    pushLeaf(sheetLeaf(`
      <div class="c1-sh-k">CUADERNO DE JOSÉ ARCADIO</div>
      <div class="c1-sh-h">笔记本</div>
      <ul class="c1-lined">${S.notes.map(n => `<li>${n}</li>`).join('')}</ul>`, 'Memoria de la feria', '翻回'), 'notes');
    const ul = top().el.querySelector('.c1-lined'); if (ul) ul.scrollTop = ul.scrollHeight;
  }

  /* ---------------- 结局 ---------------- */
  let finishing = false;
  async function finish() {
    if (finishing) return; finishing = true;
    busy = true; Snd.fx.magic();
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    await wait(350);
    S.finished = true; apply();
    snow();
    narr('许多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起，父亲带他去见识冰块的那个遥远的下午。');
    Snd.stopDrone();
    await wait(6000);
    busy = false;
    if (onComplete) onComplete();
  }
  function snow() {
    const H = wrap.clientHeight, W = wrap.clientWidth;
    for (let i = 0; i < 26; i++) {
      const f = document.createElement('div'); f.className = 'c2-snow'; f.textContent = pick(['✻', '✼', '❄', '✱']);
      const x0 = W * Math.random(), s = .7 + Math.random() * .9;
      f.style.left = x0 + 'px'; f.style.top = '-20px'; f.style.fontSize = (10 + s * 8) + 'px'; wrap.appendChild(f);
      const dx = (Math.random() - .5) * 120;
      f.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
        { opacity: 1, offset: .1 },
        { transform: `translate(${dx}px,${H * .9}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], { duration: 4200 + Math.random() * 2600, delay: Math.random() * 1800, easing: 'linear', fill: 'both' }).onfinish = () => f.remove();
    }
  }

  /* ---------------- 提示 ---------------- */
  function stage() {
    if (!S.magnetTaken) return ['magnet', '何塞的口袋里，总揣着梅尔基亚德斯留下的宝贝。', '点何塞，他会把磁铁交给你。'];
    if (!S.found.box || !S.found.helmet) return ['dig', '帐篷前那片泥地里，有铁做的东西在闪光。', '点右下角的泥地翻到特写，按住磁铁在泥地上拖动，靠近那些鼓起的小土包。'];
    if (!S.entryPaid) return ['entry', '巨人守着入口。告示上写着价钱。', '选中纸口袋里的里亚尔，点帐篷门口的巨人（入场 30 里亚尔）。'];
    if (!S.chestOpen) return ['chest', '帐篷里那只海盗箱，装着“本世纪最伟大的发明”。', '点帐篷门口进去，再点中间的箱子。'];
    if (!S.touchPaid) {
      if (coins() < 10) return ['sell', '摸一下还要十个里亚尔。你身上没钱了——不过那顶旧头盔也许值点钱。', '翻回集市，选中锈头盔，点左边货摊的商贩——他的木牌上写着“收旧铁”。'];
      return ['touch', '巨人说：摸一下，十个里亚尔。', '在帐篷那一页，选中里亚尔，点箱子里的冰。'];
    }
    if (!S.iceClear) return ['rub', '冰面结满了霜，什么也看不清。', '点箱子里的冰翻到特写，按住冰面来回擦。手冻僵了就松开歇一会儿，再接着擦。'];
    if (!S.cityShown) return ['city', '何塞梦见过一座城，墙是镜子做的。让灯光穿过冰块。', '在帐篷那一页，按住绳子上的油灯往左拖，让冰里的影子正好落在后墙的白布上。'];
    return ['end', '这个下午已经结束了。', '按 ↺ 可以重新经历这个下午。'];
  }
  function getHint() {
    if (dead) return '';
    const [k, soft, hard] = stage();
    const lvl = S.hints[k] || 0;
    S.hints[k] = lvl + 1; save();
    Snd.fx.chime();
    narr('梅尔基亚德斯低语：' + (lvl === 0 ? soft : hard), true);
    lastAct = Date.now();
    return '';
  }

  /* ---------------- 自动解谜 ---------------- */
  async function autoSolve() {
    if (dead || S.finished || finishing) return;
    leaves.splice(1).forEach(l => l.el.remove());
    leaves[0].el.classList.remove('c1-hidden'); leaves[0].el.getAnimations().forEach(a => a.cancel());
    flipping = false; sel = null; frost = null; drag = null;
    Object.assign(S, {
      magnetTaken: true, found: { n1: true, n2: true, n3: true, pot: true, helmet: true, box: true },
      helmetSold: true, entryPaid: true, chestOpen: true, touchPaid: true, iceClear: true, cityShown: true, inv: [{ id: 'magnet', n: 1 }]
    });
    S.lampX = LAMP_T; busy = true;
    apply();
    narr('梅尔基亚德斯替你翻完了这个下午的书页……', true);
    await pushLeaf(plateLeaf(ART2.tent(), ZOOM.tent.cap, '翻回'), 'zoom', 'tent');
    if (dead) return;
    Snd.fx.shimmer();
    await wait(1600);
    finish();
  }

  /* ---------------- 启动 ---------------- */
  pushLeaf(plateLeaf(ART2.main(), MAIN_CAP, ''), 'main');
  Snd.startDrone();
  every(frostTick, 100);
  every(() => { if (!document.hidden && !flipping && !busy && top().kind === 'main' && Math.random() < .25) Snd.fx.squawk(); }, 9000);
  every(() => {
    if (!nudged && !S.finished && Date.now() - lastAct > 60000) { nudged = true; narr('（迷路了？点右上角的 ✧，听听梅尔基亚德斯的低语。）', true); }
  }, 5000);
  if (!S.seen.intro) {
    later(() => { S.seen.intro = true; save(); narr('三月，吉普赛人又回到了马孔多。帐篷外贴着告示：来看本世纪最伟大的发明。何塞带着两个儿子，挤在人群里。'); }, 500);
  } else if (S.finished) {
    narr('冰的下午已经过去了。按右上角的 ↺ 可以重新经历它。');
  } else {
    narr('书页还停在你离开的地方。集市的喧闹还没有散去。');
  }

  function destroy() {
    if (dead) return;
    dead = true;
    timers.forEach(t => clearTimeout(t)); timers.clear();
    intervals.forEach(t => clearInterval(t));
    cleanups.forEach(f => f());
    if (invDrag) invDrag();
    Snd.stopDrone();
    ghost.remove();
    document.querySelectorAll('.c1-flyer').forEach(f => f.remove());
    root.innerHTML = '';
    root.classList.remove('c1-root', 'c2-root');
  }

  return { destroy, getHint, autoSolve };
}
