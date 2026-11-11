import { BOOK } from '../book.config';

// ---------- 存档 key（全部带书的前缀，避免同域多本书互相覆盖） ----------
const P = BOOK.storageKey;
export const KEYS = {
  save: `${P}_save`,                         // App 进度（章节状态 / 金脉 / 语言 / 暗色）
  excerpts: `${P}_excerpts`,                 // 已收集摘录
  sound: `${P}_snd`,                         // 声音开关
  chapter: (id: number) => `${P}_ch${id}`,   // 第二关书页引擎的关内存档（↺ 重开时清除）
  stage: (id: number) => `${P}_stage${id}`,  // '2' = 已通过第一关、停在第二关
  page: (id: number) => `${P}_page${id}`,    // 图文章：停在第几页
};

export const load = <V>(k: string, fallback: V): V => {
  try { const r = localStorage.getItem(k); return r ? (JSON.parse(r) as V) : fallback; } catch { return fallback; }
};
export const store = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 存储满或被禁用 */ } };
export const drop = (...ks: string[]) => { try { ks.forEach(k => localStorage.removeItem(k)); } catch { /* ignore */ } };

// ---------- ✧ 提示注册表：当前挂载的关卡注册自己的提示函数 ----------
// 返回 '' 表示关卡已在书页内自己呈现了提示（不弹窗）；返回文字则由 App 弹出提示框
type HintFn = () => string;
const hints: Record<number, HintFn> = {};
export const registerHint = (id: number, fn: HintFn) => {
  hints[id] = fn;
  return () => { if (hints[id] === fn) delete hints[id]; };
};
export const askHint = (id: number): string | null => (hints[id] ? hints[id]() : null);
