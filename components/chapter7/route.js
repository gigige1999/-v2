/* =========================================================
   第七章 · 一笔读完马孔多 —— 规则（纯函数，不碰 DOM；引擎和测试共用）
   地图是 W x H 的格子。从地标 1 出发，画一条不间断的路：
   · 每一格都要走到，且只能走一次（走过的地方被飓风抹去）；
   · 按编号顺序经过所有地标，最后停在最后一个地标上；
   · 河（walls）只能从桥上过；铁轨格（rails）只能顺着铁轨直着穿过。
   ========================================================= */
export const idx = (P, r, c) => r * P.W + c;
export const rc = (P, i) => [Math.floor(i / P.W), i % P.W];
const ek = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/* 预处理：邻接表、地标序号 */
export function prep(P) {
  if (P._adj) return P;
  const N = P.W * P.H, walls = new Set();
  for (const [r, c, s] of P.walls || []) walls.add(ek(idx(P, r, c), s === 'R' ? idx(P, r, c + 1) : idx(P, r + 1, c)));
  const rails = P.rails || {};
  const adj = [];
  for (let i = 0; i < N; i++) {
    const [r, c] = rc(P, i), out = [];
    for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
      const r2 = r + dr, c2 = c + dc;
      if (r2 < 0 || c2 < 0 || r2 >= P.H || c2 >= P.W) continue;
      const j = idx(P, r2, c2), ax = dr ? 'v' : 'h';
      if (walls.has(ek(i, j))) continue;
      if (rails[i] && rails[i] !== ax) continue;
      if (rails[j] && rails[j] !== ax) continue;
      out.push(j);
    }
    adj.push(out);
  }
  const markOf = new Array(N).fill(-1);
  P.marks.forEach((m, k) => { markOf[m] = k; });
  Object.defineProperties(P, { _adj: { value: adj }, _walls: { value: walls }, _markOf: { value: markOf }, _N: { value: N } });
  return P;
}
export const linked = (P, a, b) => prep(P)._adj[a].includes(b);
export const isWall = (P, a, b) => prep(P)._walls.has(ek(a, b));

/* 检查一段路：返回 { ok, reason, next(下一个该去的地标序号), done } */
export function check(P, path) {
  prep(P);
  const seen = new Set(); let next = 0;
  for (let k = 0; k < path.length; k++) {
    const v = path[k];
    if (seen.has(v)) return { ok: false, reason: 'repeat', at: k };
    if (k > 0 && !linked(P, path[k - 1], v)) return { ok: false, reason: 'blocked', at: k };
    const m = P._markOf[v];
    if (k === 0 && m !== 0) return { ok: false, reason: 'start', at: 0 };
    if (m >= 0) { if (m !== next) return { ok: false, reason: 'order', at: k, mark: m }; next++; }
    seen.add(v);
  }
  const done = path.length === P._N && next === P.marks.length && path[path.length - 1] === P.marks[P.marks.length - 1];
  return { ok: true, next, done };
}

/* 解的个数（数到 cap 为止），并返回第一组解 */
export const solve = (P, cap = 2, LIM = 4e5) => solveFrom(P, [P.marks[0]], cap, LIM);

/* 从一段（合法的）已画路线接着往下解 */
export function solveFrom(P, prefix, cap = 1, LIM = 2e5) {
  prep(P);
  const N = P._N, adj = P._adj, markOf = P._markOf, end = P.marks[P.marks.length - 1];
  const vis = new Uint8Array(N), path = prefix.slice(), stack = new Int32Array(N);
  let sols = 0, first = null, nodes = 0, next0 = 0;
  for (const v of prefix) { vis[v] = 1; if (markOf[v] >= 0) next0++; }
  function alive(cur, left) {
    // 死胡同：没走过的格子如果只剩一条路能进，它必须是终点
    for (let u = 0; u < N; u++) {
      if (vis[u]) continue;
      let d = 0;
      for (const v of adj[u]) if (!vis[v] || v === cur) d++;
      if (d === 0) return false;
      if (d === 1 && u !== end) return false;
    }
    // 连通：从当前格出发，没走过的格子都要够得着
    let top = 0, cnt = 0; const seen = new Uint8Array(N); seen[cur] = 1; stack[top++] = cur;
    while (top) { const a = stack[--top]; for (const b of adj[a]) if (!vis[b] && !seen[b]) { seen[b] = 1; cnt++; stack[top++] = b; } }
    return cnt === left;
  }
  function dfs(cur, cnt, next) {
    if (++nodes > LIM) return;
    if (cnt === N) { if (cur === end) { sols++; if (!first) first = path.slice(); } return; }
    if (cur === end) return;
    if (!alive(cur, N - cnt)) return;
    for (const v of adj[cur]) {
      if (vis[v]) continue;
      const m = markOf[v];
      if (m >= 0 && m !== next) continue;
      vis[v] = 1; path.push(v);
      dfs(v, cnt + 1, m >= 0 ? next + 1 : next);
      path.pop(); vis[v] = 0;
      if (sols >= cap) return;
    }
  }
  if (prefix.length) dfs(prefix[prefix.length - 1], prefix.length, next0);
  return { count: sols, path: first, nodes, aborted: nodes > LIM };
}

/* 已画路线里，最长的“还能走通”的前缀长度（可解性对前缀单调，二分即可） */
export function goodPrefix(P, path) {
  let lo = 1, hi = path.length;
  if (solveFrom(P, path).count) return path.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (solveFrom(P, path.slice(0, mid)).count) lo = mid; else hi = mid - 1;
  }
  return lo;
}
