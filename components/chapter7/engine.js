/* =========================================================
   第七章 · 消逝的地图 —— 关卡引擎（一笔读完马孔多）
   mountChapter7(root, { onComplete }) => { destroy, getHint, autoSolve }
   梅尔基亚德斯的马孔多地图有三个年代（建村 / 战争 / 香蕉热）。每一页：
   从①出发拖出一条不间断的路，按编号经过每个地标、走遍每一格，停在最后一个地标上。
   走过的格子会被飓风抹去——所以不能走回头路；河只能走桥，铁轨只能顺着走，
   电网和院墙翻不过去。三页都画完，马孔多就从地图上消失了（终幕由 React 层播放）。
   ========================================================= */
import { ART } from '../chapter1/art.js';
import { ART7, MAPS, GX, GY, GS, center } from './art.js';
import { prep, check, linked, isWall, solve, solveFrom, goodPrefix } from './route.js';
import { Snd } from '../shared/sound.js';

const SAVE_KEY = 'macondo2_ch7';
const VER = 3;
const NUM = '①②③④⑤⑥⑦⑧⑨';
MAPS.forEach(prep);
const SOL = MAPS.map(P => solve(P, 1).path);

const INIT = () => ({ v: VER, page: 0, paths: MAPS.map(() => []), done: MAPS.map(() => false), finished: false, hint: MAPS.map(() => 0), seen: {} });
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.v === VER) {
      const b = INIT();
      const paths = b.paths.map((p, i) => { const q = (s.paths && s.paths[i]) || []; return check(MAPS[i], q).ok ? q : []; });
      return { ...b, ...s, paths, seen: { ...s.seen } };
    }
  } catch (e) { }
  return INIT();
}

export function mountChapter7(root, { onComplete } = {}) {
  let S = loadState();
  let dead = false, busy = false, drag = null, auto = false;
  const timers = new Set(), cleanups = [];
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms); timers.add(t); return t; };
  const wait = ms => new Promise(r => later(r, ms));
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const save = () => { if (!dead) try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } };

  root.classList.add('c1-root', 'c7-root');
  root.innerHTML = `<svg class="c1-defs" aria-hidden="true">${ART.DEFS}${ART7.DEFS}</svg>
  <div class="c1-wrap">
    <div class="c1-head">
      <span class="c1-kicker"><b>CAP. VII</b>El mapa que se borra</span>
    </div>
    <div class="c1-stage"><div class="c1-box"></div></div>
    <div class="c1-narr"><span></span></div>
    <div class="c1-bottom c7-bottom"><button class="c1-snd" type="button"></button>
      <button class="c7-btn" data-a="undo" type="button">↶ 退一步</button>
      <span class="c7-prog"></span>
      <button class="c7-btn" data-a="reset" type="button">重画这一页</button>
    </div>
    <div class="c1-tip"></div><div class="c1-flash"></div>
  </div>`;
  const box = $('.c1-box'), narrSpan = $('.c1-narr span'), tipEl = $('.c1-tip'), flashEl = $('.c1-flash'), sndBtn = $('.c1-snd');
  const syncSnd = () => { sndBtn.textContent = '♪'; sndBtn.classList.toggle('off', !Snd.on); sndBtn.title = Snd.on ? '关闭声音' : '开启声音'; };
  syncSnd();

  /* ---------------- 翻页（书页里只留一页） ---------------- */
  const leaves = [];
  let els = null;
  const FLIP = 560;
  function buildPage(i) {
    const el = document.createElement('div'); el.className = 'c1-leaf';
    el.innerHTML = `<div class="c1-plate">${ART7.map(i)}</div>` + ART.FRAME('', true) + `<div class="c7-capt">${MAPS[i].capt}</div><div class="c1-shade"></div>`;
    return el;
  }
  function bind() {
    const P = MAPS[S.page], q = s => leaves[0].querySelector(s);
    els = {
      svg: q('#c7-main'), path: q('#c7-path'), pathH: q('#c7-pathH'), pathS: q('#c7-pathS'), ghost: q('#c7-ghost'), head: q('#c7-head'),
      bad: q('#c7-bad'), badE: q('#c7-badE'), gust: q('#c7-gust'), next: q('#c7-next'),
      cells: [...Array(P.W * P.H)].map((_, k) => q('#c7-c' + k)),
    };
  }
  async function gotoPage(i) {
    busy = true; hideTip(); Snd.fx.page(); drag = null;
    const curL = leaves[0], nextL = buildPage(i);
    box.appendChild(nextL);
    nextL.style.zIndex = 1; curL.style.zIndex = 2;
    curL.querySelector('.c1-shade').animate([{ opacity: 0 }, { opacity: .85 }], { duration: FLIP, fill: 'forwards' });
    nextL.querySelector('.c1-shade').animate([{ opacity: .7 }, { opacity: 0 }], { duration: FLIP + 260, easing: 'ease-out' });
    const a = curL.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-92deg)' }], { duration: FLIP, easing: 'cubic-bezier(.55,.05,.8,.45)', fill: 'forwards' });
    await new Promise(res => { a.onfinish = () => { curL.remove(); res(); }; });
    if (dead) return;
    leaves.length = 0; leaves.push(nextL); nextL.style.zIndex = '';
    S.page = i; save(); bind(); render(); apply();
    busy = false;
    narr(MAPS[i].intro);
    if (auto) later(() => autoDraw(), 900);
  }
  leaves.push(buildPage(S.page)); box.appendChild(leaves[0]); bind();

  /* ---------------- 渲染 ---------------- */
  const path = () => S.paths[S.page];
  function apply() {
    if (dead) return;
    const P = MAPS[S.page], p = path();
    $('.c7-prog').textContent = `${P.era} · ${p.length} / ${P.W * P.H} 格`;
    $$('.c7-btn').forEach(b => { b.disabled = busy || S.finished || S.done[S.page] || !p.length; });
    $$('.c1-pip').forEach(pp => pp.classList.toggle('on', S.done[+pp.dataset.i] || S.finished));
  }
  function render() {
    if (!els || !els.svg) return;
    const P = MAPS[S.page], p = path(), pts = p.map(v => center(P, v).map(n => n.toFixed(1)).join(',')).join(' ');
    for (const e of [els.path, els.pathH, els.pathS]) e.setAttribute('points', p.length === 1 ? `${pts} ${pts}` : pts);
    const on = new Set(p);
    els.cells.forEach((g, k) => g && g.classList.toggle('gone', on.has(k) && k !== p[p.length - 1]));
    if (p.length) { const [x, y] = center(P, p[p.length - 1]); els.head.setAttribute('transform', `translate(${x} ${y})`); els.head.setAttribute('opacity', 1); }
    else els.head.setAttribute('opacity', 0);
    const R = check(P, p), nx = p.length ? R.next : 0;
    if (S.done[S.page]) els.next.textContent = `${P.era}的马孔多，已经被风抹去了。`;
    else if (nx < P.marks.length) els.next.textContent = `下一站  ${NUM[nx]} ${P.names[nx]}`;
    else els.next.textContent = '';
    els.cells.forEach((g, k) => g && g.classList.toggle('target', !S.done[S.page] && k === P.marks[nx]));
  }
  function ghost(cells) {
    const P = MAPS[S.page];
    if (!els || !cells || cells.length < 2) { if (els) els.ghost.setAttribute('opacity', 0); return; }
    els.ghost.setAttribute('points', cells.map(v => center(P, v).map(n => n.toFixed(1)).join(',')).join(' '));
    els.ghost.setAttribute('opacity', .9);
    els.ghost.animate([{ opacity: 0 }, { opacity: .9, offset: .15 }, { opacity: .9, offset: .8 }, { opacity: 0 }], { duration: 4200, fill: 'forwards' });
  }

  /* ---------------- 规则反馈 ---------------- */
  function flashCell(v) {
    const P = MAPS[S.page], [x, y] = center(P, v);
    els.bad.setAttribute('x', x - P.cs / 2); els.bad.setAttribute('y', y - P.cs / 2);
    els.bad.animate([{ opacity: .45 }, { opacity: 0 }], { duration: 520, fill: 'forwards' });
  }
  function flashEdge(a, b) {
    const P = MAPS[S.page], [x1, y1] = center(P, a), [x2, y2] = center(P, b), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, h = P.cs * .4;
    const d = x1 === x2 ? `M${mx - h} ${my} H${mx + h}` : `M${mx} ${my - h} V${my + h}`;
    els.badE.setAttribute('d', d);
    els.badE.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, fill: 'forwards' });
  }
  function why(msg) {
    Snd.fx.wrong();
    if (msg !== lastNarr) narr(msg);
  }
  function blockedWhy(a, b) {
    const P = MAPS[S.page];
    if (isWall(P, a, b)) {
      const f = (P.fences || []).find(f => { const top = f.r * P.W + f.c; return (a === top && b === top + P.W) || (b === top && a === top + P.W); });
      if (f) return f.kind === 'wire' ? '那是美国佬的电网，过不去。' : '那是老宅的院墙，翻不过去。';
      return '河上没有桥。只能从桥上过河。';
    }
    if (P.rails[a] || P.rails[b]) return '铁轨上只能顺着铁轨直着走，不能半路拐弯。';
    return '只能往相邻的格子走。';
  }
  /* 往前走一格；返回是否成功 */
  function step(v) {
    const P = MAPS[S.page], p = path(), end = p[p.length - 1];
    if (v === end) return true;
    if (p.length >= 2 && v === p[p.length - 2]) { p.pop(); Snd.fx.tick(); return true; }
    if (p.includes(v)) { flashCell(v); why('那里已经被风抹去了，不能再走第二次。'); return false; }
    if (!linked(P, end, v)) {
      const [r1, c1] = [Math.floor(end / P.W), end % P.W], [r2, c2] = [Math.floor(v / P.W), v % P.W];
      if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) { flashEdge(end, v); why(blockedWhy(end, v)); }
      return false;
    }
    const R = check(P, p), m = P.marks.indexOf(v);
    if (m >= 0 && m !== R.next) {
      flashCell(v);
      if (m < R.next) why(`${NUM[m]}已经去过了。`);
      else why(`得先去${NUM[R.next]}${P.names[R.next]}，再去${NUM[m]}。`);
      return false;
    }
    if (m === P.marks.length - 1 && p.length + 1 < P.W * P.H) {
      flashCell(v); why(`${NUM[m]}是最后一站——要等每一格都走过，才能进去。`); return false;
    }
    p.push(v);
    if (m >= 0) { Snd.fx.chime(); narr(`${NUM[m]} ${P.names[m]}。` + (m < P.marks.length - 1 ? `下一站：${NUM[m + 1]}${P.names[m + 1]}。` : '')); }
    else Snd.fx.write();
    return true;
  }
  /* 指针可能一次跨过好几格：沿着直线一格一格地走 */
  function walkTo(v) {
    const P = MAPS[S.page];
    for (let n = 0; n < 12; n++) {
      const p = path(), end = p[p.length - 1];
      if (end === v) return;
      const [r1, c1] = [Math.floor(end / P.W), end % P.W], [r2, c2] = [Math.floor(v / P.W), v % P.W];
      const dr = r2 - r1, dc = c2 - c1;
      const nxt = Math.abs(dr) >= Math.abs(dc) ? end + Math.sign(dr) * P.W : end + Math.sign(dc);
      if (p.length >= 2 && v === p[p.length - 2]) { step(v); return; }
      if (!step(nxt)) return;
    }
  }
  function afterChange() {
    const P = MAPS[S.page], R = check(P, path());
    save(); render(); apply();
    if (R.done && !S.done[S.page]) pageDone(S.page);
  }

  /* ---------------- 一页画完：飓风把它抹去 ---------------- */
  async function pageDone(i) {
    S.done[i] = true; save(); busy = true; apply(); drag = null;
    const P = MAPS[i], p = path();
    Snd.fx.chime(); later(() => Snd.fx.shimmer && Snd.fx.shimmer(), 220);
    narr(i < MAPS.length - 1 ? `一笔画完了。可飓风紧跟着你的笔迹，把${P.era}的马孔多一格一格抹去了——` : '最后一笔落在梅尔基亚德斯的房间里。就在这一刻，飓风到了。');
    await wait(900); if (dead) return;
    Snd.noise && Snd.noise(1.8, .26, 600, 1.6);
    const dur = Math.min(2600, 70 * p.length);
    p.forEach((v, k) => {
      const g = els.cells[v]; if (!g) return;
      g.animate([{ opacity: 1, transform: 'translate(0,0) rotate(0)' }, { opacity: 0, transform: `translate(${60 + (k % 5) * 14}px,${-40 - (k % 3) * 20}px) rotate(${90 + k * 23}deg)` }],
        { duration: 900, delay: (k / p.length) * dur, easing: 'ease-in', fill: 'forwards' });
      g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center';
    });
    for (const e of [els.path, els.pathH, els.pathS, els.head]) e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: dur * .7, fill: 'forwards' });
    gusts(dur + 900);
    await wait(dur + 1200); if (dead) return;
    if (i < MAPS.length - 1) {
      narr(`${P.era}的马孔多不见了。翻过这一页——`);
      await wait(1000); if (dead) return;
      busy = false;
      await gotoPage(i + 1);
    } else finish();
  }
  function gusts(ms) {
    if (!els || !els.gust) return;
    els.gust.innerHTML = [...Array(10)].map((_, k) => `<path d="M0 0 q14 -10 28 0 q14 10 28 0" fill="none" stroke="#2b1d12" stroke-opacity=".35" stroke-width="1.4" stroke-linecap="round" transform="translate(${-80 - k * 30} ${GY + 20 + (k * 53) % GS})"/>`).join('')
      + [...Array(10)].map((_, k) => `<path d="M0 0 q6 -6 12 0 q-6 6 -12 0Z" fill="${['#6f7a3a', '#c9a86a', '#8a7a3a'][k % 3]}" stroke="#2b1d12" stroke-width=".5" transform="translate(${-40 - k * 25} ${GY + (k * 37) % GS})"/>`).join('');
    [...els.gust.children].forEach((e, k) => e.animate([{ translate: '0 0' }, { translate: `${560 + (k % 4) * 40}px ${-30 + (k % 5) * 12}px` }], { duration: ms * (.6 + (k % 3) * .15), delay: k * 60, easing: 'ease-in', fill: 'forwards' }));
  }

  async function finish() {
    if (S.finished) return;
    S.finished = true; save(); busy = true; apply();
    Snd.fx.magic();
    flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go');
    narr('“这座镜子之城，将在羊皮卷被译完的那一刻，被飓风从世上抹去。”');
    await wait(2600); if (dead) return;
    busy = false;
    if (onComplete) onComplete();
  }

  /* ---------------- 旁白 / 提示框 ---------------- */
  let narrT = null, lastNarr = '';
  function narr(text, whisper = false) {
    if (!text) return;
    lastNarr = text;
    if (narrT) { clearTimeout(narrT); timers.delete(narrT); }
    narrSpan.classList.add('out');
    narrT = later(() => { narrT = null; narrSpan.textContent = text; narrSpan.classList.toggle('whisper', whisper); narrSpan.classList.remove('out'); }, 180);
  }
  function hideTip() { tipEl.classList.remove('show'); }
  function tip(e) {
    if (e.pointerType !== 'mouse' || drag || !els) return hideTip();
    const v = cellAt(e); if (v < 0) return hideTip();
    const P = MAPS[S.page], m = P.marks.indexOf(v);
    let t = '';
    if (m >= 0) t = `${NUM[m]} ${P.names[m]}`;
    else if (P.rails[v]) t = '铁轨 · 只能顺着走';
    if (!t) return hideTip();
    const r = $('.c1-wrap').getBoundingClientRect();
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
    tipEl.textContent = t; tipEl.classList.add('show');
  }

  /* ---------------- 交互 ---------------- */
  function svgPt(svg, x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  function cellAt(e) {
    const P = MAPS[S.page], q = svgPt(els.svg, e.clientX, e.clientY);
    const c = Math.floor((q.x - GX) / P.cs), r = Math.floor((q.y - GY) / P.cs);
    if (c < 0 || r < 0 || c >= P.W || r >= P.H) return -1;
    return r * P.W + c;
  }
  function on(target, type, fn, opt) { target.addEventListener(type, fn, opt); cleanups.push(() => target.removeEventListener(type, fn, opt)); }
  on(sndBtn, 'click', () => { Snd.unlock(); Snd.toggle(); syncSnd(); if (Snd.on) Snd.startDrone(); });
  on(root, 'pointerdown', () => { Snd.unlock(); Snd.startDrone(); }, { once: true });
  $$('.c7-btn').forEach(b => on(b, 'click', () => {
    if (busy || S.finished || S.done[S.page]) return;
    const p = path();
    if (b.dataset.a === 'undo') { if (p.length) { p.pop(); Snd.fx.tick(); } }
    else { if (p.length) { p.length = 0; Snd.fx.page(); narr('擦掉重画。从①出发。'); } }
    afterChange();
  }));

  on(box, 'pointerdown', e => {
    if (busy || S.finished || drag || !els || S.done[S.page]) return;
    const v = cellAt(e); if (v < 0) return;
    const P = MAPS[S.page], p = path();
    e.preventDefault(); hideTip();
    if (!p.length) {
      if (v !== P.marks[0]) { flashCell(v); why(`从${NUM[0]}${P.names[0]}出发。`); return; }
      p.push(v); Snd.fx.ink && Snd.fx.ink(); narr(`从${P.names[0]}出发。下一站：${NUM[1]}${P.names[1]}。`);
    } else if (p.includes(v)) {
      const k = p.indexOf(v);
      if (k < p.length - 1) { p.length = k + 1; Snd.fx.tick(); }
    } else {
      walkTo(v);
      if (path()[path().length - 1] !== v) { afterChange(); return; }
    }
    drag = { id: e.pointerId };
    try { e.target.setPointerCapture(e.pointerId); } catch (er) { }
    afterChange();
  });
  on(box, 'pointermove', e => {
    if (!drag) return tip(e);
    if (!els || busy) return;
    const v = cellAt(e); if (v < 0) return;
    const before = path().length;
    walkTo(v);
    if (path().length !== before) afterChange();
  });
  function endDrag() { if (!drag) return; drag = null; save(); }
  on(box, 'pointerup', endDrag);
  on(box, 'pointercancel', endDrag);
  on(box, 'pointerleave', hideTip);

  /* ---------------- 提示 ---------------- */
  const RULE = [
    '梅尔基亚德斯低语：每一格都要走到，走过的不能再走。先想想角落里的格子——它们只有两条路能进出。',
    '梅尔基亚德斯低语：河把镇子劈成两半，只有两座桥。路要过几次河，桥就得留几座给它。',
    '梅尔基亚德斯低语：铁轨那一排只能一口气直着穿过去——它的两头，就是你必须经过的入口和出口。电网里的美国佬镇子，只能从一侧进出。',
  ];
  function getHint() {
    if (dead) return '';
    if (S.finished) { narr('马孔多已经从地图上消失了。'); return ''; }
    const i = S.page, P = MAPS[i];
    if (S.done[i]) { narr('这一页已经画完了。', true); return ''; }
    S.hint[i] = Math.min(3, (S.hint[i] || 0) + 1); save();
    Snd.fx.chime();
    const p = path();
    if (S.hint[i] === 1 && p.length < 3) { narr(RULE[i], true); return ''; }
    if (!p.length) { const s = SOL[i]; ghost(s.slice(0, 5)); narr(`梅尔基亚德斯低语：从${NUM[0]}出发，先这样走几步——看金色的虚线。`, true); return ''; }
    const g = goodPrefix(P, p);
    if (g < p.length) {
      const bad = p[g];
      flashCell(bad);
      if (S.hint[i] >= 3) { p.length = g; afterChange(); narr(`梅尔基亚德斯低语：从这里往后就走不通了。我替你擦到了第 ${g} 格，从这儿接着画。`, true); }
      else narr(`梅尔基亚德斯低语：这条路画到第 ${g} 格还走得通，再往后就注定走不完了。退回去换个方向试试。`, true);
      return '';
    }
    const sol = solveFrom(P, p).path;
    const nx = check(P, p).next, k = sol.indexOf(P.marks[Math.min(nx, P.marks.length - 1)]);
    const n = S.hint[i] >= 3 ? Math.max(k + 1, p.length + 3) : p.length + 4;
    ghost(sol.slice(p.length - 1, n));
    narr(S.hint[i] >= 3 ? `梅尔基亚德斯低语：顺着金色虚线，一直走到${NUM[nx]}${P.names[nx]}。` : '梅尔基亚德斯低语：到目前为止都还走得通。接下来这样走——看金色的虚线。', true);
    return '';
  }

  async function autoDraw() {
    if (dead || busy || S.done[S.page]) return;
    const i = S.page, P = MAPS[i];
    let p = path();
    const g = p.length ? goodPrefix(P, p) : 0;
    p.length = g;
    const sol = p.length ? solveFrom(P, p).path : SOL[i];
    busy = true;
    for (let k = p.length; k < sol.length && !dead; k++) {
      p.push(sol[k]); save(); render(); apply();
      Snd.fx.write();
      await wait(55);
    }
    busy = false;
    if (!dead) afterChange();
  }
  async function autoSolve() {
    if (dead) return;
    if (S.finished) { if (!busy && onComplete) onComplete(); return; }
    if (busy && !auto) return;
    auto = true;
    narr('梅尔基亚德斯握住你的手，替你把马孔多一笔画完……', true);
    if (!busy) autoDraw();
  }

  apply(); render();
  Snd.startDrone();
  if (S.finished) narr('马孔多已经从地图上消失了。按 ↺ 可以再画一遍。');
  else if (!S.seen.intro) { S.seen.intro = true; save(); later(() => narr(MAPS[S.page].intro), 500); }
  else later(() => narr(S.done[S.page] ? `${MAPS[S.page].era}已经画完了。` : MAPS[S.page].intro), 400);
  if (!S.finished && S.done[S.page] && S.page < MAPS.length - 1) later(() => gotoPage(S.page + 1), 900);
  else if (!S.finished && S.done[S.page]) later(() => finish(), 900);

  function destroy() {
    if (dead) return; dead = true;
    timers.forEach(t => clearTimeout(t)); timers.clear();
    cleanups.forEach(f => f());
    Snd.stopDrone();
    root.innerHTML = ''; root.classList.remove('c1-root', 'c7-root');
  }
  return { destroy, getHint, autoSolve };
}
