/* =========================================================
   第六章 · 光学：纯函数（不碰 DOM），引擎和测试共用
   房间内部是 [36,364] x [36,364]，四面墙上可以开一个出口。
   镜子是双面的线段，每次转 22.5°，所以光只会走 45° 的倍数方向。
   ========================================================= */
export const W0 = 36, W1 = 364, STEP = 22.5;
const D2R = Math.PI / 180;
export const dirOf = deg => [Math.cos(deg * D2R), Math.sin(deg * D2R)];
export const norm180 = a => ((a % 180) + 180) % 180;

function segSeg(px, py, dx, dy, ax, ay, bx, by) {
  const ex = bx - ax, ey = by - ay, den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-9) return Infinity;
  const t = ((ax - px) * ey - (ay - py) * ex) / den, u = ((ax - px) * dy - (ay - py) * dx) / den;
  return (t > 1e-6 && u >= -1e-9 && u <= 1 + 1e-9) ? t : Infinity;
}
function segRect(px, py, dx, dy, r) {
  const [x0, y0, x1, y1] = r;
  return Math.min(
    segSeg(px, py, dx, dy, x0, y0, x1, y0), segSeg(px, py, dx, dy, x1, y0, x1, y1),
    segSeg(px, py, dx, dy, x1, y1, x0, y1), segSeg(px, py, dx, dy, x0, y1, x0, y0));
}

/* 床单：挂在绳上，lift 越大越往上提 */
export function sheetRects(room, lift = 0) {
  const S = room.sheets; if (!S) return [];
  return S.items.map(s => [s.x, S.top - lift, s.x + s.w, S.top + S.h - lift]);
}
export function mirrorEnds(m, s) {
  const [ux, uy] = dirOf(s.a), cx = s.x ?? m.x;
  return [[cx - ux * m.L, m.y - uy * m.L], [cx + ux * m.L, m.y + uy * m.L]];
}

/* 光线追踪：返回经过的点、最后撞到什么、是否穿出出口 / 照到目标 */
export function trace(room, st) {
  let px = room.entry.x, py = room.entry.y, ang = room.entry.ang, last = -1;
  const pts = [[px, py]], bounces = [];
  const obs = [
    ...room.obstacles.map(o => ({ r: o, kind: 'obstacle', name: o[4] || '' })),
    ...sheetRects(room, st.lift || 0).map(r => ({ r, kind: 'sheet', name: '床单' })),
  ];
  for (let n = 0; n < 12; n++) {
    const [dx, dy] = dirOf(ang);
    let best = Infinity, what = null;
    const c = (t, w) => { if (t < best) { best = t; what = w; } };
    for (const o of obs) c(segRect(px, py, dx, dy, o.r), o);
    room.mirrors.forEach((m, i) => {
      if (i === last) return;
      const [a, b] = mirrorEnds(m, st.m[i]);
      c(segSeg(px, py, dx, dy, a[0], a[1], b[0], b[1]), { kind: 'mirror', i });
    });
    const T = room.target;
    if (T) {
      const fx = T.x - px, fy = T.y - py, pr = fx * dx + fy * dy;
      if (pr > 0) { const d2 = fx * fx + fy * fy - pr * pr; if (d2 < T.r * T.r) c(pr - Math.sqrt(T.r * T.r - d2), { kind: 'target' }); }
    }
    const tx = dx > 1e-9 ? (W1 - px) / dx : dx < -1e-9 ? (W0 - px) / dx : Infinity;
    const ty = dy > 1e-9 ? (W1 - py) / dy : dy < -1e-9 ? (W0 - py) / dy : Infinity;
    if (tx < ty) c(tx, { kind: 'wall', side: dx > 0 ? 'right' : 'left' });
    else c(ty, { kind: 'wall', side: dy > 0 ? 'bottom' : 'top' });
    if (!isFinite(best)) break;
    px += dx * best; py += dy * best; pts.push([px, py]);
    if (what.kind === 'mirror') { ang = 2 * st.m[what.i].a - ang; last = what.i; bounces.push(what.i); continue; }
    const res = { pts, hit: what.kind, name: what.name || '', side: what.side, bounces, pass: false, onTarget: what.kind === 'target' };
    if (what.kind === 'wall' && room.exit && what.side === room.exit.side) {
      const v = (what.side === 'left' || what.side === 'right') ? py : px;
      if (v >= room.exit.a && v <= room.exit.b) res.pass = true;
    }
    return res;
  }
  return { pts, hit: 'loop', name: '', bounces, pass: false, onTarget: false };
}
export const solved = (room, st) => { const R = trace(room, st); return room.target ? R.onTarget : R.pass; };
