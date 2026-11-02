/* =========================================================
   第三章 · 雨水的路线（纯函数，便于引擎与离线校准共用）
   坐标系：400 x 400 书页图版；角度 ang 为度，正值 = 右端朝下
   ========================================================= */
export const LEAK = { x: 200, y: 34 };
export const FLOOR = 344;
export const G = 820, WIND = 230;
export const PLANKS = [
  { id: 'a', cx: 200, cy: 116, half: 60, min: -48, max: 48 },
  { id: 'b', cx: 112, cy: 214, half: 52, min: -48, max: 48 },
  { id: 'c', cx: 288, cy: 214, half: 52, min: -48, max: 48 }
];
export const STAINS = [
  { x: 66, w: 17 },
  { x: 158, w: 17 },
  { x: 246, w: 17 },
  { x: 366, w: 15 }
];
const rad = d => d * Math.PI / 180;
export function ends(p, ang) {
  const c = Math.cos(rad(ang)) * p.half, s = Math.sin(rad(ang)) * p.half;
  return [p.cx - c, p.cy - s, p.cx + c, p.cy + s];
}
function hitSeg(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (Math.abs(d) < 1e-9) return null;
  const u = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const v = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  return { u, v };
}
export const newDrop = (jit = 0) => ({ x: LEAK.x + jit, y: LEAK.y, vx: 0, vy: 30, mode: 'fall', p: -1, t: 0, last: -1, age: 0 });

/* 推进一滴水；返回事件：null | {type:'hit',p} | {type:'tip',p} | {type:'floor',x} | {type:'pool',p} | {type:'out'} */
export function step(d, dt, angs, windOn) {
  d.age += dt;
  if (d.mode === 'slide') {
    const p = PLANKS[d.p], a = rad(angs[d.p]), dir = Math.sign(Math.sin(a));
    const v = 80 + 240 * Math.abs(Math.sin(a));
    d.t += dir * v * dt;
    const c = Math.cos(a), s = Math.sin(a);
    d.x = p.cx + c * d.t; d.y = p.cy + s * d.t - 2.2;
    if (Math.abs(d.t) >= p.half) {
      d.t = dir * p.half; d.x = p.cx + c * d.t; d.y = p.cy + s * d.t + 1;
      d.mode = 'fall'; d.vx = dir * c * v * .14; d.vy = Math.abs(s) * v * .2; d.last = d.p; d.p = -1;
      return { type: 'tip', p: d.last };
    }
    return null;
  }
  const ox = d.x, oy = d.y;
  if (windOn) d.vx += WIND * dt;
  d.vy += G * dt;
  d.x += d.vx * dt; d.y += d.vy * dt;
  for (let i = 0; i < PLANKS.length; i++) {
    if (i === d.last) continue;
    const [x3, y3, x4, y4] = ends(PLANKS[i], angs[i]);
    const h = hitSeg(ox, oy, d.x, d.y, x3, y3, x4, y4);
    if (!h) continue;
    if (Math.abs(angs[i]) < 4) { d.mode = 'dead'; d.x = x3 + (x4 - x3) * h.v; d.y = y3 + (y4 - y3) * h.v; return { type: 'pool', p: i }; }
    d.mode = 'slide'; d.p = i; d.t = (h.v - .5) * 2 * PLANKS[i].half;
    d.x = x3 + (x4 - x3) * h.v; d.y = y3 + (y4 - y3) * h.v;
    return { type: 'hit', p: i };
  }
  if (d.y >= FLOOR) { d.mode = 'dead'; d.y = FLOOR; return { type: 'floor', x: d.x }; }
  if (d.x < 10 || d.x > 390) { d.mode = 'dead'; return { type: 'out' }; }
  return null;
}
export function stainAt(x) {
  for (let i = 0; i < STAINS.length; i++) if (Math.abs(x - STAINS[i].x) <= STAINS[i].w) return i;
  return -1;
}
/* 离线：给定角度与风，计算水流落点 */
export function landing(angs, windOn) {
  const d = newDrop();
  for (let k = 0; k < 4000; k++) {
    const e = step(d, 1 / 120, angs, windOn);
    if (e && (e.type === 'floor')) return d.x;
    if (d.mode === 'dead') return null;
  }
  return null;
}
