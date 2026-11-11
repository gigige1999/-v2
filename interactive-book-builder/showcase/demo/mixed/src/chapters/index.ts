import type { ChapterModule } from '../types';

// 自动发现 src/chapters/ch*/index.ts —— 新增章节只要建文件夹（scripts/add_chapter.py），不用改这里
const mods = import.meta.glob<{ default: ChapterModule }>('./ch*/index.ts', { eager: true });
export const CHAPTERS: ChapterModule[] = Object.values(mods).map(m => m.default).sort((a, b) => a.meta.id - b.meta.id);

const R: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export const roman = (n: number) => { let s = ''; for (const [v, c] of R) while (n >= v) { s += c; n -= v; } return s; };
