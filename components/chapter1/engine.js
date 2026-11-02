/* =========================================================
   第一章 · 失眠症的标记 —— 关卡引擎
   mountChapter1(root, { onComplete }) => { destroy, getHint, autoSolve }
   场景切换 = 书页翻动（页栈）；命名 / 读笔记 / 笔记本 也都是“页”
   ========================================================= */
import { ART } from './art.js';
import { Snd } from '../shared/sound.js';

const SAVE_KEY = 'macondo2_ch3';
const SVGNS = 'http://www.w3.org/2000/svg';
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function svgEl(tag, attrs) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
function svgPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); }

/* ---------------- 数据 ---------------- */
const ITEMS = {
  labels: { name: '空白标签', desc: '何塞准备的空白标签，用来写下万物的名字。' },
  quill: { name: '羽毛笔', desc: '何塞的羽毛笔，笔尖是干的。' },
  inkDry: { name: '干涸的墨水瓶', desc: '瓶底的墨早已干成了硬块。' },
  jug: { name: '水罐', desc: '罐底还晃着一点清水。' },
  ink: { name: '墨水', desc: '化开的墨，黑得发亮。' },
  pen: { name: '蘸了墨的羽毛笔', desc: '可以写字了。选中它或标签，点一样东西为它命名。' },
  rooster: { name: '糖公鸡', desc: '乌尔苏拉做的糖果。吃过它的人，都再也睡不着。' },
  crank: { name: '铜摇柄', desc: '从钟肚子里找到的，末端是方形的。' },
  potion: { name: '柔光药水', desc: '梅尔基亚德斯带来的药水，颜色温柔得像黎明。' }
};
const RECIPES = {
  'inkDry+jug': { out: 'ink', msg: '你把清水倒进墨水瓶，干结的墨块慢慢化开了。' },
  'ink+quill': { out: 'pen', msg: '羽毛笔吸饱了墨。现在，可以写下名字了。' }
};
const BAD_COMBO = {
  'inkDry+quill': '墨水干了，笔尖什么也蘸不到。',
  'jug+quill': '把笔泡进水里？那只能写出看不见的字。'
};
const NAMEABLE = ['lamp', 'jar', 'clock', 'cow'];
const NAMING = {
  lamp: { word: '油灯', tiles: '油灯火烛由丁汕钉炉', desc: '它盛着油，夜里会发光。', done: '“油灯”。你写下这两个字，火苗忽然窜高——它想起了自己要发光。' },
  jar: { word: '糖罐', tiles: '糖罐唐缶塘灌盐瓶壶', desc: '乌尔苏拉用它装糖果做的小动物。', done: '“糖罐”。玻璃变得清晰了，盖子上的螺纹也清晰了。' },
  clock: { word: '时钟', tiles: '时钟寸日种中针表吋', desc: '它会走，会敲响，告诉人们时辰。', done: '“时钟”。钟摆晃了起来，滴答，滴答——它想起了时间。' },
  cow: { word: '奶牛', tiles: '奶牛乃午马羊扔件母', desc: '每天清晨要挤奶，奶煮沸后加上咖啡，就成了牛奶咖啡。', done: '“奶牛”。它甩了甩尾巴，像是终于想起了自己是谁。' }
};
const PIPS = [['lamp', '灯'], ['jar', '罐'], ['clock', '钟'], ['cow', '牛']];
const NAMES = {
  portrait: '乌尔苏拉的肖像', door: '门', melq: '梅尔基亚德斯', jar: '糖罐', window: '窗', jug: '水罐', clock: '时钟',
  machine: '记忆机器', drawer: '抽屉', lamp: '油灯', inkwell: '墨水瓶', quill: '羽毛笔', jose: '何塞·阿尔卡蒂奥·布恩迪亚',
  rebecca: '丽贝卡', sack: '骨头袋', moon: '月亮', tree: '栗树', sign: '路牌', cow: '奶牛', dLabels: '空白标签', dNote: '笔记',
  crank: '摇柄', cdoor: '小门', face: '钟面', wheel: '转轮', drum0: '滚筒', drum1: '滚筒', drum2: '滚筒', bag: '骨头袋'
};
const GARBLE = { lamp: '油…？', jar: '…罐？', clock: '时…？', cow: '……？' };
const TIPKEY = { face: 'clock', cow: 'cow', lamp: 'lamp', jar: 'jar', clock: 'clock' };
const ZMAP = { face: 'clock', cdoor: 'clock', wheel: 'machine', drum0: 'machine', drum1: 'machine', drum2: 'machine', cow: 'cow', bag: 'sack' };
const LINES = {
  portrait: ['乌尔苏拉的肖像。她的糖果小动物，把失眠症卖遍了全村。', '画里的眼睛……一直在看着你。', '她是这个家里唯一还记得一切的人——至少现在还是。'],
  rebecca: ['丽贝卡蹲在角落，抠下一块墙皮塞进嘴里。', '她的眼睛在黑暗里亮得像猫。失眠症，就是她带来的。', '她怀里的帆布袋发出咔啦咔啦的声音。'],
  rebecca2: ['丽贝卡舔着糖公鸡，第一次露出了笑容。', '她把骨头袋丢在了脚边，好像忘了它的存在。'],
  jose: ['何塞：“我们必须给每样东西写上名字，否则就全忘了。”', '何塞：“这是桌子，这是椅子，这是钟……这是什么来着？”', '何塞：“我已经五天没合眼了。”', '何塞：“我造了一台记忆机器……可我忘了怎么用它。”'],
  melq: ['梅尔基亚德斯：“孩子，名字是事物的灵魂。”', '梅尔基亚德斯：“我在死亡那边待过，那里太孤独了。”']
};
const NUM = ['一', '二', '三', '四', '五', '六'];
const DRUM_CODE = [2, 0, 3];   // 三 · 一 · 四
const BONES = [3, 1, 4];
const MILK_T = 300;            // 五点整
const MOOS = 5;
const MAIN_CAP = 'Lám. I · La casa de los Buendía';
const ZOOM = {
  drawer: { cap: 'Lám. II · El cajón', intro: '抽屉里塞满了何塞的杂物。' },
  yard: { cap: 'Lám. III · El patio', intro: '院子里一片寂静。月光下，所有东西都醒着。' },
  clock: { cap: 'Lám. IV · El reloj', intro: '一座落地钟，指针停在十点十分。' },
  machine: { cap: 'Lám. V · La máquina de la memoria', intro: '何塞造的记忆机器。转轮上贴满写着字的卡片，下面是三个可以拨动的滚筒。' },
  sack: { cap: 'Lám. VI · Los huesos', intro: '丽贝卡的帆布袋。里面装着她父母的骨头。' }
};

/* ---------------- 状态 ---------------- */
const INIT = () => ({
  inv: [], named: { lamp: false, jar: false, clock: false, cow: false },
  quillTaken: false, inkTaken: false, jugTaken: false, labelsTaken: false, noteTaken: false,
  jarOpen: false, roosterTaken: false, roosterGiven: false, heardBones: false, heardMoo: false,
  clockOpen: false, crankTaken: false, crankAttached: false, clockT: 610, mRot: 0,
  drums: [0, 0, 0], machineDone: false, knocked: false, doorOpen: false, potionTaken: false, finished: false,
  notes: ['失眠症：先忘记事物的名字，再忘记它们的用途，最后连自己是谁都会忘记。'], seen: {}, hints: {}
});
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s) { const b = INIT(); return { ...b, ...s, named: { ...b.named, ...s.named } }; }
  } catch (e) { }
  return INIT();
}

const READ_HTML = `
  <div class="c1-sh-k">PAPEL EN EL CAJÓN</div>
  <div class="c1-sh-h">何塞的笔记</div>
  <div class="c1-lined">
    <p>我已经开始忘记了。趁还记得，写下来：</p>
    <p>奶牛——每天清晨要挤奶。<em>钟敲几下，它便叫几声</em>，那就是挤奶的时辰。</p>
    <p>糖罐里的东西，千万别再给孩子们吃。</p>
    <p>丽贝卡的袋子里装着她父母的骨头。<em>它们会咔啦作响，像在说话。</em></p>
    <p>我造了一台记忆机器，它记得一切——只要把骨头说的话拨进滚筒里。</p>
  </div>
  <div class="c1-sign">—— 何·阿·布恩迪亚</div>
  <button class="c1-btn" type="button" data-read-done="1">记 下 了</button>`;

/* =========================================================
   挂载
   ========================================================= */
export function mountChapter1(root, { onComplete } = {}) {
  let S = loadState();
  let dead = false, sel = null, busy = false, flipping = false, cardShown = false;
  let drag = null, dragMoved = false, lastAct = Date.now(), nudged = false, naming = null;
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
  function addItem(id, n = 1) { const it = S.inv.find(i => i.id === id); if (it) it.n += n; else S.inv.push({ id, n }); }
  function removeItem(id, n = 1) { const it = S.inv.find(i => i.id === id); if (!it) return; it.n -= n; if (it.n <= 0) S.inv = S.inv.filter(i => i !== it); if (sel === id && !has(id)) sel = null; }
  function addNote(t) {
    if (S.notes.includes(t)) return;
    S.notes.push(t);
    if (ribbon) { ribbon.classList.remove('new'); void ribbon.offsetWidth; ribbon.classList.add('new'); }
  }

  /* ---------------- DOM ---------------- */
  root.classList.add('c1-root');
  root.innerHTML = `<svg class="c1-defs" aria-hidden="true">${ART.DEFS}</svg>
  <div class="c1-wrap">
    <div class="c1-head">
      <span class="c1-kicker"><b>CAP. III</b>La noche del insomnio</span>
      <div class="c1-pips" title="已被命名之物">${PIPS.map(([k, c]) => `<div class="c1-pip" data-k="${k}"><span>${c}</span></div>`).join('')}</div>
    </div>
    <div class="c1-stage"><div class="c1-box"></div></div>
    <div class="c1-narr"><span></span></div>
    <div class="c1-bottom"><button class="c1-snd" type="button"></button><div class="c1-inv"></div><button class="c1-ribbon" type="button" title="何塞的笔记本">笔记本</button></div>
    <div class="c1-tip"></div><div class="c1-flash"></div>
  </div>`;
  const wrap = $('.c1-wrap'), box = $('.c1-box'), invEl = $('.c1-inv'), ribbon = $('.c1-ribbon');
  const narrSpan = $('.c1-narr span'), tipEl = $('.c1-tip'), flashEl = $('.c1-flash'), sndBtn = $('.c1-snd');
  const ghost = document.createElement('div'); ghost.className = 'c1-ghost'; document.body.appendChild(ghost);
  const syncSnd = () => { sndBtn.textContent = '♪'; sndBtn.classList.toggle('off', !Snd.on); sndBtn.title = Snd.on ? '关闭声音' : '开启声音'; };
  syncSnd();

  /* ---------------- 页栈：每个场景 / 特写 / 文字页都是一张书页 ---------------- */
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
    if (t.kind === 'read') return readDone();
    if (t.kind === 'name') naming = null;
    cardShown = false;
    await popLeaf();
    if (!dead && top().kind === 'main' && S.machineDone && !S.knocked) later(triggerKnock, 700);
  }

  /* ---------------- 渲染 ---------------- */
  function apply() {
    if (dead) return;
    $$('[data-if]').forEach(el => { el.style.display = cond(el.dataset.if) ? '' : 'none'; });
    $$('[data-forget]').forEach(el => {
      if (S.named[el.dataset.forget]) el.removeAttribute('filter'); else el.setAttribute('filter', 'url(#c1-forget)');
    });
    const m = $('#c1-main');
    if (m) {
      m.classList.toggle('c1-lit', S.named.lamp);
      m.classList.toggle('c1-ticking', S.named.clock);
      m.classList.toggle('c1-knocked', S.knocked && !S.doorOpen);
      const w = $('#c1-mainWheel'); if (w) w.classList.toggle('spin', S.machineDone);
      const d = $('#c1-darkness'); if (d) d.style.opacity = S.finished ? .2 : S.named.lamp ? .55 : 1;
    }
    const zd = $('#c1-zDoor'); if (zd) zd.classList.toggle('open', S.clockOpen);
    setHands(S.clockT); setWheel(); renderDrums();
    renderInv();
    $$('.c1-pip').forEach(p => p.classList.toggle('on', !!S.named[p.dataset.k]));
    save();
  }
  function renderInv() {
    let h = '';
    for (let i = 0; i < 7; i++) {
      const it = S.inv[i];
      if (it) h += `<div class="c1-slot ${sel === it.id ? 'sel' : ''} ${arriving.has(it.id) ? 'arriving' : ''}" data-id="${it.id}" title="${ITEMS[it.id].name}">${ART.ICONS[it.id]}${it.n > 1 ? `<span class="cnt">${it.n}</span>` : ''}</div>`;
      else h += '<div class="c1-slot empty"></div>';
    }
    invEl.innerHTML = h;
  }
  function setHands(t) {
    const mm = ((t % 60) + 60) % 60 * 6, hh = (((t % 720) + 720) % 720) / 2;
    [['#c1-zMin', mm, 200, 145], ['#c1-zHour', hh, 200, 145], ['#c1-mMin', mm, 590, 120], ['#c1-mHour', hh, 590, 120]].forEach(([s, a, x, y]) => {
      const el = $(s); if (el) el.setAttribute('transform', `rotate(${a.toFixed(2)} ${x} ${y})`);
    });
  }
  function setWheel() {
    ['#c1-zWheel', '#c1-zCrank'].forEach(s => { const el = $(s); if (el) el.setAttribute('transform', `rotate(${S.mRot.toFixed(1)} 200 160)`); });
    const mw = $('#c1-mainWheel'); if (mw && !S.machineDone) mw.setAttribute('transform', `rotate(${S.mRot.toFixed(1)} 680 440)`);
  }
  function renderDrums(rollIdx) {
    for (let i = 0; i < 3; i++) {
      const g = $('#c1-drum' + i); if (!g) continue;
      const cx = 130 + i * 70, v = S.drums[i], ff = 'font-family="Songti SC, STSong, Noto Serif SC, serif"';
      g.innerHTML = `<text x="${cx}" y="347" text-anchor="middle" font-size="11" fill="#2b1d12" opacity=".3" font-weight="700" ${ff}>${NUM[(v + 5) % 6]}</text>
        <text x="${cx}" y="369" text-anchor="middle" font-size="26" fill="#2b1d12" font-weight="900" ${ff}>${NUM[v]}</text>
        <text x="${cx}" y="381" text-anchor="middle" font-size="11" fill="#2b1d12" opacity=".3" font-weight="700" ${ff}>${NUM[(v + 1) % 6]}</text>`;
      if (rollIdx === i) { g.classList.remove('roll'); void g.getBoundingClientRect(); g.classList.add('roll'); }
    }
  }

  /* ---------------- 旁白：直接写在书页下方 ---------------- */
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
    const f = document.createElement('div'); f.className = 'c1-flyer'; f.innerHTML = ART.ICONS[id]; document.body.appendChild(f);
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
  function take(flag, id, n, pt, msg) {
    S[flag] = true; addItem(id, n); arriving.add(id);
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
    if (t.closest('[data-read-done]')) return readDone();
    const tile = t.closest('.c1-tile'); if (tile) return pickTile(tile);
    const el = t.closest('[data-hot],[data-z]');
    if (!el) { if (sel) { sel = null; renderInv(); } return; }
    const id = el.dataset.hot || el.dataset.z, isZ = !el.dataset.hot;
    const pt = { x: e.clientX, y: e.clientY };
    if (sel && id !== 'card') { const item = sel; sel = null; renderInv(); useOn(item, isZ ? (ZMAP[id] || id) : id, pt); return; }
    isZ ? actZ(id, pt) : act(id, pt);
  });

  on(box, 'pointerdown', e => {
    dragMoved = false;
    const el = e.target.closest('.c1-drag'); if (!el || busy || flipping || sel) return;
    const z = el.dataset.z;
    if (z === 'face' && (!S.named.clock || S.clockOpen)) return;
    if (z === 'wheel' && (!S.crankAttached || cardShown || S.machineDone)) return;
    const svg = el.ownerSVGElement, c = z === 'face' ? { x: 200, y: 145 } : { x: 200, y: 160 };
    const ang = ev => { const p = svgPt(svg, ev.clientX, ev.clientY); return Math.atan2(p.x - c.x, -(p.y - c.y)) * 180 / Math.PI; };
    const a0 = ang(e);
    let hand = 'm';
    if (z === 'face') {
      const t = S.clockT, mA = (((t % 60) + 60) % 60) * 6, hA = (((t % 720) + 720) % 720) / 2;
      const df = (x, y) => { let d = Math.abs(((x - y) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };
      const a = (a0 + 360) % 360;
      hand = df(a, hA) + 6 < df(a, mA) ? 'h' : 'm';
    }
    drag = { z, ang, last: a0, total: 0, acc: 0, hand, step: Math.round(S.clockT / 5), rollAcc: 0 };
    try { el.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault();
  });
  on(box, 'pointermove', e => {
    if (drag) {
      const a = drag.ang(e); let d = a - drag.last; if (d > 180) d -= 360; if (d < -180) d += 360;
      drag.last = a; drag.total += Math.abs(d); if (drag.total > 3) dragMoved = true;
      lastAct = Date.now();
      drag.z === 'face' ? onClockDrag(d) : onWheelDrag(d);
      return;
    }
    if (flipping) return;
    eyes(e); tip(e);
  });
  const endDrag = () => {
    if (dragMoved) later(() => { dragMoved = false; }, 60);
    if (!drag) return; const z = drag.z; drag = null; z === 'face' ? onClockEnd() : save();
  };
  on(box, 'pointerup', endDrag);
  on(box, 'pointercancel', endDrag);
  on(box, 'pointerleave', hideTip);

  // 纸口袋：点击选择 / 组合；拖到书页上使用
  let invDrag = null;
  on(invEl, 'pointerdown', e => {
    const slot = e.target.closest('.c1-slot[data-id]'); if (!slot || busy || flipping) return;
    e.preventDefault(); Snd.unlock();
    const id = slot.dataset.id, sx = e.clientX, sy = e.clientY; let dragging = false;
    const mv = ev => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        dragging = true; ghost.innerHTML = ART.ICONS[id]; ghost.classList.add('on'); sel = id; renderInv();
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
      const s2 = t.closest('.c1-slot[data-id]'); if (s2 && invEl.contains(s2)) return combine(id, s2.dataset.id);
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

  function eyes(e) {
    if (top().kind !== 'main') return;
    const svg = $('#c1-main'); if (!svg) return;
    const p = svgPt(svg, e.clientX, e.clientY), dx = p.x - 110, dy = p.y - 112, d = Math.hypot(dx, dy) || 1, k = Math.min(1.7, d / 30);
    const ox = dx / d * k, oy = dy / d * k * .6;
    $('#c1-pupL').setAttribute('cx', 104 + ox); $('#c1-pupL').setAttribute('cy', 112 + oy);
    $('#c1-pupR').setAttribute('cx', 116 + ox); $('#c1-pupR').setAttribute('cy', 112 + oy);
  }
  function tip(e) {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('[data-hot],[data-z]');
    if (!el || el.dataset.z === 'card') return hideTip();
    const id = el.dataset.hot || el.dataset.z, k = TIPKEY[id];
    let name = NAMES[id], garble = false;
    if (k && !S.named[k]) { name = GARBLE[k]; garble = true; }
    if (!name) return hideTip();
    const r = wrap.getBoundingClientRect();
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
    tipEl.textContent = sel ? `${ITEMS[sel].name} → ${name}` : name;
    tipEl.classList.toggle('garble', garble && !sel);
    tipEl.classList.add('show');
  }

  /* ---------------- 纸口袋 ---------------- */
  function clickSlot(id) {
    Snd.fx.click();
    if (!sel) { sel = id; renderInv(); narr(`${ITEMS[id].name} —— ${ITEMS[id].desc}`); return; }
    if (sel === id) { sel = null; renderInv(); return; }
    combine(sel, id);
  }
  function combine(a, b) {
    if (a === b) return;
    const k = [a, b].sort().join('+');
    const r = RECIPES[k];
    if (r) {
      removeItem(a); removeItem(b); addItem(r.out); sel = null;
      apply(); Snd.fx.ink(); narr(r.msg);
      const s = invEl.querySelector(`.c1-slot[data-id="${r.out}"]`); if (s) s.classList.add('pop');
      return;
    }
    if (BAD_COMBO[k]) { sel = null; renderInv(); return fail(BAD_COMBO[k]); }
    sel = b; renderInv(); narr(`${ITEMS[b].name} —— ${ITEMS[b].desc}`);
  }

  /* ---------------- 主场景 ---------------- */
  function act(id, pt) {
    Snd.fx.click();
    switch (id) {
      case 'portrait': return narr(line('portrait'));
      case 'door':
        if (S.knocked) {
          S.doorOpen = true; apply(); Snd.fx.creak();
          addNote('门外站着梅尔基亚德斯——那个本该死去的吉普赛人。'); save();
          return narr('你拉开门。门外站着一个戴大帽子、金色眼镜的老人，身上带着远方的气味——梅尔基亚德斯。');
        }
        return narr('门外是无边的黑夜。你想不起门外有谁值得等待。');
      case 'melq':
        if (!S.potionTaken) {
          addNote('梅尔基亚德斯带回了治愈失眠的药水。');
          return take('potionTaken', 'potion', 1, pt, '“我在死亡那边待过，可我受不了孤独，所以回来了。”他递给你一小瓶颜色柔和的药水。');
        }
        return narr(line('melq'));
      case 'jar':
        if (!S.named.jar) return narr('一个玻璃的……什么？里面装着彩色的小动物。你想不起它叫什么，自然也想不起怎么打开它。');
        if (!S.jarOpen) { S.jarOpen = true; apply(); Snd.fx.unlock(); return narr('糖罐。对，是糖罐。你拧开了盖子，一股甜腻的气味飘了出来。'); }
        if (!S.roosterTaken) return take('roosterTaken', 'rooster', 1, pt, '你拿出一只糖做的小公鸡。红得发亮，甜得危险。');
        return narr('剩下的糖果动物看起来一样甜，也一样危险。');
      case 'window': return openZoom('yard');
      case 'jug': return take('jugTaken', 'jug', 1, pt, '一只陶水罐，罐底还晃着一点清水。');
      case 'clock': return openZoom('clock');
      case 'machine': return openZoom('machine');
      case 'drawer': return openZoom('drawer');
      case 'lamp': return narr(S.named.lamp ? '油灯。灯光让黑暗退后了一步。' : '火苗只剩豆大一点，随时会灭。这东西……是用来做什么的？');
      case 'inkwell': return take('inkTaken', 'inkDry', 1, pt, '墨水瓶。瓶底的墨已经干成了硬块。');
      case 'quill': return take('quillTaken', 'quill', 1, pt, '何塞的羽毛笔。笔尖是干的。');
      case 'jose':
        if (S.finished) return narr('何塞伏在桌上睡着了。五天来的第一次。');
        return narr(line('jose'));
      case 'rebecca':
        if (S.finished) return narr('丽贝卡也睡着了，手里还攥着半只糖公鸡。');
        return narr(line(S.roosterGiven ? 'rebecca2' : 'rebecca'));
      case 'sack':
        if (!S.roosterGiven) return narr('丽贝卡死死抱着那只帆布袋，里面传来咔啦咔啦的声音。也许一点甜的东西能让她松手。');
        return openZoom('sack');
    }
  }
  function actZ(id, pt) {
    switch (id) {
      case 'dLabels':
        addNote('抽屉里有四张空白标签——只够写下四个名字。');
        return take('labelsTaken', 'labels', 4, pt, '一叠空白标签，用红线捆着。何塞本打算把整个马孔多都贴满。');
      case 'dNote':
        if (!S.named.lamp) { Snd.fx.page(); return narr('纸上的字迹在昏暗里扭成一团，什么也看不清。要是灯再亮一点……'); }
        return openRead();
      case 'moon': Snd.fx.click(); return narr('月亮也睁着眼睛。在马孔多，连月亮都失眠了。');
      case 'tree': Snd.fx.click(); return narr('一棵栗树。很多年后，何塞·阿尔卡蒂奥·布恩迪亚会被绑在这棵树下，一直到死。');
      case 'sign': Snd.fx.click(); return narr('路口立着两块牌子：“马孔多”，以及——“上帝存在”。');
      case 'cow':
        if (!S.named.cow) { Snd.fx.click(); return narr('一头……长着角的、温顺的……你想不起来它叫什么。'); }
        return moo();
      case 'face':
        Snd.fx.click();
        if (!S.named.clock) return narr('指针纹丝不动。你忘了这东西是用来做什么的。');
        if (S.clockOpen) return narr('五点整。钟肚子里的小门开着。');
        return narr('按住指针拖动来拨钟。靠近哪根指针，就拨动哪根。');
      case 'cdoor':
        Snd.fx.click();
        if (!S.named.clock) return narr('钟下面有一扇小门，铜牌上的字……你看不懂了。');
        return narr('小门锁着。铜牌上写着：“挤奶的时辰，我便开门。”');
      case 'crank':
        addNote('钟肚子里藏着一根铜摇柄。');
        return take('crankTaken', 'crank', 1, pt, '一根铜摇柄，末端是方形的。它应该能插进什么东西的轴心里。');
      case 'wheel':
        Snd.fx.click();
        if (S.machineDone) return narr('转轮停下了。它已经说出了它记得的名字。');
        if (!S.crankAttached) return narr('转轮的轴心是一个方孔，空着——少了一个摇柄。');
        return narr('握住转轮拖动，让它转满一整圈。');
      case 'drum0': case 'drum1': case 'drum2': {
        if (S.machineDone) return narr('滚筒已经锁住了。');
        const i = +id.slice(-1); S.drums[i] = (S.drums[i] + 1) % 6; Snd.fx.roll(); renderDrums(i); save(); return;
      }
      case 'card': return hideCard();
      case 'bag': return playBones();
    }
  }
  function useOn(item, t, pt) {
    lastAct = Date.now();
    if (NAMEABLE.includes(t) && (item === 'labels' || item === 'pen')) {
      if (S.named[t]) return fail('它已经有名字了。');
      if (!has('pen')) return fail(has('quill') ? '笔尖是干的，写不出字。' : '没有能写字的笔。');
      if (!has('labels')) return fail('需要一张空白标签来写下名字。');
      return openNaming(t);
    }
    if (item === 'rooster' && (t === 'rebecca' || t === 'sack')) {
      removeItem('rooster'); S.roosterGiven = true; Snd.fx.pick();
      addNote('丽贝卡用骨头袋换走了糖公鸡。'); apply();
      return narr('丽贝卡一把抓过糖公鸡，黑眼睛亮了起来。怀里的骨头袋“咚”地一声掉在了地上。');
    }
    if (item === 'crank' && t === 'machine') {
      removeItem('crank'); S.crankAttached = true; apply(); Snd.fx.unlock();
      return narr('摇柄严丝合缝地卡进了转轮的轴心。');
    }
    if (item === 'potion' && t === 'jose') return finish();
    if (item === 'potion') return fail('这瓶药水，应该给最需要记起一切的人。');
    if (item === 'jug' && t === 'lamp') return fail('这是水，不是灯油。');
    if (item === 'rooster' && t === 'jose') return fail('何塞摇摇头：“就是这些糖果，让全村人都睡不着。”');
    if (item === 'rooster' && t === 'melq') return fail('老人笑了笑：“我不吃甜的。”');
    if (item === 'crank' && t === 'clock') return fail('摇柄和钟的上弦孔对不上。');
    if ((item === 'labels' || item === 'pen') && !NAMEABLE.includes(t)) return fail('这个你还记得它叫什么。标签只有四张，别浪费。');
    fail(pick(['这样没有用。', '什么也没发生。', '不是这样用的。']));
  }

  /* ---------------- 特写（翻到下一页） ---------------- */
  async function openZoom(name) {
    if (flipping) return;
    cardShown = false;
    await pushLeaf(plateLeaf(ART[name](), ZOOM[name].cap, '翻回'), 'zoom', name);
    if (!S.seen['z_' + name]) { S.seen['z_' + name] = true; save(); narr(ZOOM[name].intro); }
  }

  /* ---------------- 命名页 ---------------- */
  function openNaming(k) {
    if (flipping) return;
    const N = NAMING[k];
    naming = { k, input: '' };
    const tiles = shuffle([...N.tiles]).map(c => `<button class="c1-tile" type="button" data-c="${c}" style="--r:${(Math.random() * 8 - 4).toFixed(1)}deg;animation-delay:-${(Math.random() * 2.6).toFixed(2)}s">${c}</button>`).join('');
    pushLeaf(sheetLeaf(`
      <div class="c1-sh-k">NOMBRAR LAS COSAS</div>
      <div class="c1-sh-h">写下它的名字</div>
      <div class="c1-sh-sub">${N.desc}</div>
      <div class="c1-prev">${ART.PREVIEW[k]}</div>
      <div class="c1-ntag">${[...N.word].map(() => '<div class="c1-ls"></div>').join('')}</div>
      <div class="c1-tiles">${tiles}</div>
      <div class="c1-msg"></div>`, 'Nombrar · ' + ({ lamp: 'La lámpara', jar: 'El tarro', clock: 'El reloj', cow: 'La vaca' })[k], '算了'), 'name');
  }
  function pickTile(tile) {
    if (!naming || tile.classList.contains('used')) return;
    const leaf = top().el, N = NAMING[naming.k], c = tile.dataset.c, want = N.word[naming.input.length];
    const slots = [...leaf.querySelectorAll('.c1-ls')], msg = leaf.querySelector('.c1-msg'), sheet = leaf.querySelector('.c1-sheet');
    if (c === want) {
      slots[naming.input.length].textContent = c; slots[naming.input.length].classList.add('inked');
      tile.classList.add('used'); naming.input += c; Snd.fx.write(); msg.textContent = '';
      if (naming.input === N.word) {
        const k = naming.k; naming = null; busy = true;
        later(async () => {
          S.named[k] = true; removeItem('labels'); apply();
          await popLeaf();
          busy = false; Snd.fx.magic(); narr(N.done);
        }, 650);
      }
    } else {
      Snd.fx.wrong();
      tile.classList.remove('blot'); void tile.offsetWidth; tile.classList.add('blot');
      sheet.classList.remove('c1-shake'); void sheet.offsetWidth; sheet.classList.add('c1-shake');
      naming.input = ''; slots.forEach(s => { s.textContent = ''; s.classList.remove('inked'); });
      leaf.querySelectorAll('.c1-tile').forEach(t => t.classList.remove('used'));
      msg.textContent = pick(['笔尖一抖，墨迹晕开了——不是这个字。', '这个字……不对。它在纸上慢慢褪去了。', '你犹豫了。名字从指缝里溜走了。']);
    }
  }

  /* ---------------- 笔记 / 笔记本 ---------------- */
  function openRead() {
    if (flipping) return;
    pushLeaf(sheetLeaf(READ_HTML, 'Lám. II bis · Las notas de José', '翻回'), 'read');
  }
  async function readDone() {
    if (flipping) return;
    const first = !S.noteTaken;
    if (first) {
      S.noteTaken = true;
      addNote('奶牛：钟敲几下，它便叫几声——那是挤奶的时辰。');
      addNote('丽贝卡的骨头会咔啦作响，像在说话。');
      addNote('记忆机器：把骨头说的话拨进三个滚筒。');
    }
    await popLeaf();
    if (first) { Snd.fx.write(); narr('你把要紧的几句抄进了笔记本——书页下方那根红色书签。'); }
  }
  function openNotebook() {
    if (flipping) return;
    pushLeaf(sheetLeaf(`
      <div class="c1-sh-k">CUADERNO DE JOSÉ ARCADIO</div>
      <div class="c1-sh-h">笔记本</div>
      <ul class="c1-lined">${S.notes.map(n => `<li>${n}</li>`).join('')}</ul>`, 'Memoria contra el olvido', '翻回'), 'notes');
    const ul = top().el.querySelector('.c1-lined'); if (ul) ul.scrollTop = ul.scrollHeight;
  }

  /* ---------------- 院子：奶牛 ---------------- */
  async function moo() {
    busy = true; const svg = top().el.querySelector('svg.c1-scene');
    narr('奶牛抬起头，朝着月亮叫了起来——');
    await wait(500);
    for (let i = 0; i < MOOS; i++) {
      Snd.fx.moo();
      const t = svgEl('text', { x: 300 + (i % 2 ? 16 : -12), y: 244, class: 'c1-clk', 'font-size': 20, fill: '#f4ebd5', 'text-anchor': 'middle', 'font-family': 'Songti SC, STSong, serif' });
      t.textContent = '哞'; svg && svg.appendChild(t); later(() => t.remove(), 1400);
      await wait(820);
    }
    busy = false;
    if (!S.heardMoo) { S.heardMoo = true; addNote('院子里的奶牛叫了好几声。'); apply(); }
  }

  /* ---------------- 时钟 ---------------- */
  function onClockDrag(d) {
    S.clockT += drag.hand === 'h' ? d * 2 : d / 6;
    const st = Math.round(S.clockT / 5);
    if (st !== drag.step) { drag.step = st; Snd.fx.tick(); }
    setHands(S.clockT);
  }
  function onClockEnd() {
    S.clockT = Math.round(S.clockT / 5) * 5;
    S.clockT = ((S.clockT % 720) + 720) % 720;
    setHands(S.clockT); save();
    if (S.clockT === MILK_T && !S.clockOpen) openClock();
  }
  async function openClock() {
    busy = true;
    narr('当——');
    for (let i = 0; i < MOOS; i++) { Snd.fx.chime(); await wait(750); }
    S.clockOpen = true; addNote('五点整，钟敲了五下，钟下的小门开了。'); apply(); Snd.fx.unlock();
    narr('钟敲了五下。“咔哒”——钟肚子下面的小门弹开了。');
    busy = false;
  }

  /* ---------------- 记忆机器 ---------------- */
  function onWheelDrag(d) {
    S.mRot += d; drag.acc += d; drag.rollAcc += Math.abs(d);
    if (drag.rollAcc > 30) { drag.rollAcc = 0; Snd.fx.roll(); }
    setWheel();
    if (Math.abs(drag.acc) >= 360) { drag = null; save(); showCard(); }
  }
  function showCard() {
    const ok = S.drums.every((v, i) => v === DRUM_CODE[i]);
    cardShown = true;
    $('#c1-mCardText').textContent = ok ? '梅尔基亚德斯' : pick(['锅？', '椅子？', '盐？', '镜子？', '冰？', '雨？']);
    $('#c1-mCardSub').textContent = ok ? '记 忆 卡 片' : '一 个 陌 生 的 名 字';
    $('#c1-mCard').classList.add('show');
    if (ok) {
      S.machineDone = true; addNote('记忆机器吐出一个名字：梅尔基亚德斯。'); apply(); Snd.fx.magic();
      narr('转轮“咔哒”一声停下，吐出一张卡片：梅尔基亚德斯。一个你本该记得的名字。');
    } else {
      Snd.fx.wrong(); narr('转轮吐出一张卡片，上面的名字毫无意义。滚筒的位置不对。');
    }
  }
  function hideCard() {
    const c = $('#c1-mCard'); if (c) c.classList.remove('show');
    cardShown = false; Snd.fx.click();
    if (S.machineDone) later(back, 250);
  }
  function triggerKnock() {
    if (S.knocked) return;
    S.knocked = true; apply(); knockSeq();
    narr('咚、咚、咚。有人在敲门。');
  }
  function knockSeq() {
    const leaf = $('#c1-doorLeaf'); if (!leaf) return;
    [0, 380, 760].forEach(d => later(() => {
      Snd.fx.knock(); leaf.classList.remove('knock'); void leaf.getBoundingClientRect(); leaf.classList.add('knock');
    }, d));
  }

  /* ---------------- 骨头袋 ---------------- */
  async function playBones() {
    busy = true;
    const g = $('#c1-sackG'), clk = $('#c1-sackClk'), dots = $('#c1-sackDots');
    dots.innerHTML = ''; dots.classList.remove('fade');
    const centers = [120, 200, 280];
    for (let gi = 0; gi < BONES.length; gi++) {
      const n = BONES[gi];
      for (let k = 0; k < n; k++) {
        Snd.fx.clack();
        g.classList.remove('jolt'); void g.getBoundingClientRect(); g.classList.add('jolt');
        const t = svgEl('text', { x: 140 + Math.random() * 120, y: 110 + Math.random() * 70, class: 'c1-clk', 'font-size': 17, fill: '#f4ebd5', 'text-anchor': 'middle', 'font-family': 'Songti SC, STSong, serif' });
        t.textContent = '咔'; clk.appendChild(t); later(() => t.remove(), 1300);
        dots.appendChild(svgEl('circle', { cx: centers[gi] + (k - (n - 1) / 2) * 15, cy: 368, r: 5, fill: '#2b1d12', class: 'c1-kdot' }));
        await wait(240);
      }
      await wait(720);
    }
    busy = false;
    if (!S.heardBones) { S.heardBones = true; addNote('骨头袋发出了三段节奏，像在说话。'); apply(); }
    narr('骨头安静下来了。它们说了三段话。');
    later(() => dots.classList.add('fade'), 3200);
  }

  /* ---------------- 结局 ---------------- */
  let finishing = false;
  async function finish() {
    if (finishing) return; finishing = true;
    busy = true; removeItem('potion'); Snd.fx.magic();
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    await wait(350);
    S.finished = true; addNote('何塞喝下了药水。所有的名字都回来了。'); apply();
    butterflies();
    narr('何塞喝下药水。一道光从他眼底亮起——他想起来了，所有的名字，所有的事。然后，五天来第一次，他睡着了。');
    Snd.stopDrone();
    await wait(5200);
    busy = false;
    if (onComplete) onComplete();
  }
  function butterflies() {
    const H = wrap.clientHeight, W = wrap.clientWidth;
    for (let i = 0; i < 18; i++) {
      const b = document.createElement('div'); b.className = 'c1-bf';
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

  /* ---------------- 提示（梅尔基亚德斯的低语，两级） ---------------- */
  function stage() {
    if (!S.named.lamp) {
      if (!has('pen')) {
        if (!S.quillTaken || !S.inkTaken) return ['tools', '人们正在遗忘一切。先在书桌上找找写字要用的东西。', '书桌右侧有一支羽毛笔和一只墨水瓶，把它们都拿上。'];
        if (has('inkDry')) return S.jugTaken
          ? ['mix', '干掉的墨，需要一点水。', '在纸口袋里先点水罐，再点墨水瓶，把它们组合起来。']
          : ['jug', '干掉的墨，需要一点水。', '窗台上有一只水罐。'];
        return ['pen', '墨有了，笔呢？', '在纸口袋里先点墨水，再点羽毛笔，让笔蘸上墨。'];
      }
      if (!S.labelsTaken) return ['labels', '名字要写在什么上面？', '翻开书桌正中的抽屉，里面有一叠空白标签。'];
      return ['lamp', '房间太暗了。从那盏快熄灭的灯开始吧。', '选中标签（或蘸墨的笔），点桌上的油灯，然后依次点出：油、灯。'];
    }
    if (!S.noteTaken) return ['note', '灯亮了，抽屉里那张纸上的字也许能看清了。', '翻开书桌抽屉，读一读何塞的笔记。'];
    if (!S.named.clock) return ['clock', '墙上的钟停了——它忘了自己是什么。', '选中标签，点时钟，写下：时、钟。'];
    if (!S.named.cow) return ['cow', '笔记里提到了一头动物。看看窗外。', '点窗户翻到院子，再用标签给院子里的动物命名：奶、牛。'];
    if (!S.clockOpen) {
      if (!S.heardMoo) return ['moo', '“钟敲几下，它便叫几声。”', '在院子里点奶牛，数一数它叫了几声。'];
      return ['time', '把钟拨到挤奶的时辰。', '奶牛叫了五声：翻到时钟，拖动指针拨到五点整（时针指 V，分针指 XII）。'];
    }
    if (!S.crankTaken) return ['crank', '钟肚子里的小门开了。', '在时钟那一页点下方打开的小门，拿走里面的东西。'];
    if (!S.roosterGiven) {
      if (!S.named.jar) return ['jar', '架子上那个玻璃罐子，你还记得它叫什么吗？', '用标签给架子上的罐子命名：糖、罐。'];
      if (!S.roosterTaken) return ['rooster', '罐子里的糖果，也许有人很想要。', '点糖罐拧开盖子，再点一次拿出糖公鸡。'];
      return ['give', '丽贝卡抱着骨头袋不放。也许一点甜头能让她松手。', '选中糖公鸡，点角落里的丽贝卡。'];
    }
    if (!S.heardBones) return ['bones', '骨头在说话。', '点地上的骨头袋翻到特写，再点袋子，仔细听它的节奏。'];
    if (!S.crankAttached) return ['attach', '记忆机器的轴心空着。', '选中铜摇柄，点右边的记忆机器。'];
    if (!S.machineDone) return ['drums', '“把骨头说的话拨进滚筒里。”', '骨头响了 3·1·4 下：把三个滚筒拨到 三、一、四，再拖动转轮转满一圈。'];
    if (!S.doorOpen) return ['door', '有人在敲门。', '点左边的门。'];
    if (!S.potionTaken) return ['melq', '老人手里有一瓶发光的东西。', '点门口的梅尔基亚德斯。'];
    if (!S.finished) return ['drink', '药水该给最需要记住的人。', '选中药水，点何塞·阿尔卡蒂奥·布恩迪亚。'];
    return ['end', '这一夜已经结束了。', '按 ↺ 可以重新经历这一夜。'];
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
    flipping = false; naming = null; cardShown = false; sel = null;
    Object.assign(S, {
      named: { lamp: true, jar: true, clock: true, cow: true },
      quillTaken: true, inkTaken: true, jugTaken: true, labelsTaken: true, noteTaken: true,
      jarOpen: true, roosterTaken: true, roosterGiven: true, heardBones: true, heardMoo: true,
      clockOpen: true, crankTaken: true, crankAttached: true, clockT: MILK_T, drums: [...DRUM_CODE],
      machineDone: true, knocked: true, doorOpen: true, potionTaken: true, inv: [{ id: 'potion', n: 1 }]
    });
    apply(); Snd.fx.page();
    narr('梅尔基亚德斯替你翻完了这一夜的书页……', true);
    busy = true;
    await wait(1600);
    finish();
  }

  /* ---------------- 启动 ---------------- */
  pushLeaf(plateLeaf(ART.main(), MAIN_CAP, ''), 'main');
  Snd.startDrone();
  every(() => { if (S.named.clock && !S.finished && !document.hidden && !flipping && ['main', 'clock'].includes(top().name || top().kind)) Snd.fx.tick(); }, 1000);
  every(() => { if (S.knocked && !S.doorOpen && top().kind === 'main' && !busy && !flipping) knockSeq(); }, 9000);
  every(() => {
    if (!nudged && !S.finished && Date.now() - lastAct > 60000) { nudged = true; narr('（迷路了？点右上角的 ✧，听听梅尔基亚德斯的低语。）', true); }
  }, 5000);
  if (S.machineDone && !S.knocked) later(triggerKnock, 1200);
  if (!S.seen.intro) {
    later(() => { S.seen.intro = true; save(); narr('那一夜，马孔多所有人都睁着眼睛。何塞想给万物写上名字——可他连笔和墨放在哪儿都快忘了。'); }, 500);
  } else if (S.finished) {
    narr('所有的名字都回来了。按右上角的 ↺ 可以重新经历这一夜。');
  } else {
    narr('书页还停在你离开的地方。马孔多的夜还没有结束。');
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
    root.classList.remove('c1-root');
  }

  return { destroy, getHint, autoSolve };
}
