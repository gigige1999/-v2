
export enum ChapterStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED'
}

export type Language = 'en' | 'zh';
export type Theme = 'light' | 'dark';

export interface Chapter {
  id: number;
  title: { en: string; zh: string };
  subtitle: { en: string; zh: string };
  description: { en: string; zh: string };
  instructions: { en: string; zh: string };
  status: ChapterStatus;
}

export interface GameState {
  currentChapter: number | null;
  chapters: Chapter[];
  unlockedGoldVeins: number[];
  hintCooldown: number;
  language: Language;
  theme: Theme;
  chapterImages: Record<number, string>; // Persisted images
  stageOnePassed?: number[]; // 已通过第一关的章节（用于解锁下一章）
}
