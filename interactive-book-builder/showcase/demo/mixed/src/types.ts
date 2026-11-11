import type React from 'react';

export type Lang = 'zh' | 'en';
/** 可翻译文本：只写中文时直接用字符串；需要英文时写 { zh, en } */
export type T = string | { zh: string; en?: string };
export const tr = (t: T | undefined, lang: Lang): string =>
  !t ? '' : typeof t === 'string' ? t : (lang === 'en' && t.en) || t.zh;

export enum Status { LOCKED = 'locked', UNLOCKED = 'unlocked', COMPLETED = 'completed' }

/** 第一关 React 小游戏 / 第二关书页引擎共用的组件参数 */
export type StageProps = { onComplete: () => void; lang: Lang; triggerAutoSolve?: boolean };

export interface ChapterMeta {
  id: number;            // 章节序号，从 1 连续编号（= 目录顺序 = 存档 key）
  roman?: string;        // 罗马数字，缺省按 id 生成
  title: T;
  subtitle: T;           // 目录里标题下的小字（建议西文/拉丁文，增加书卷气）
  description: T;        // 进入章节后左页的导读
  stage1?: T;            // 解谜章：第一关玩法说明（📜 里显示，也是第一关的 ✧ 提示）
  stage2?: T;            // 解谜章：第二关玩法说明；图文章：📜 里的阅读说明（可省）
  excerpt?: { text: T; source: T }; // 完成后收集的摘录（图文章可省）
  image?: string;        // 左页插图（public/ 下的相对路径，如 'illustrations/ch1.svg'）
}

/** 一章有两种形态（同一本书可混用）：
 *  解谜章 = Classic（第一关 React 小游戏）+ spec（第二关书页引擎）
 *  图文章 = pages（历史介绍/图鉴类内页，每页选一种组件，见 src/blocks 与 references/blocks.md） */
export interface ChapterModule {
  meta: ChapterMeta;
  Classic?: React.FC<StageProps>;
  /** 第二关：书页引擎章节描述，见 references/engine-api.md */
  spec?: Record<string, unknown>;
  pages?: import('./blocks/types').Page[];
}

export type CoverLayout = 'classic' | 'heraldic' | 'emblem';

export interface BookConfig {
  storageKey: string;          // localStorage 前缀，每本书必须不同
  type: 'puzzle' | 'history';  // 解谜书 / 历史图文书（只影响默认值与说明文案）
  unlock: 'progressive' | 'open'; // progressive：通关解锁下一章；open：全部章节直接开放
  cover: string;               // 封面配色 id（themes.css 的 @cover）
  paper: string;               // 纸张主题 id（themes.css 的 @paper）
  coverLayout: CoverLayout;    // 封面版式：classic 烫金框 / heraldic 纹章合拢书 / emblem 徽章手抄本
  emblem: string;              // 封面徽章 id（src/components/emblems.tsx）
  languages: Lang[];           // ['zh'] 或 ['zh','en']（>1 时右上角出现语言切换）
  title: T;
  subtitle: T;
  author: T;
  coverText: {
    kicker: string;            // 封面顶部小字
    motto: string;             // 标题下方小字（classic）
    latin?: string;            // 西文标题/大字（heraldic 标题下一行；emblem 封面上的烫金大字）
    era?: string;              // 年代（如 'MCDLV — MCDLXXXVII'）
    prompt: T;                 // "轻触开始"
  };
  index: {
    heading: T;                // 右页目录标题
    leftKicker: string;        // 左页顶部小字
    leftEra: string;           // 左页标题下的年代/题记
    lines: T[];                // 左页的三句引文
    finalLockNote: T;          // 最后一章未解锁时的说明
  };
  guide: {
    name: T;                   // ✧ 提示的"引路人"名字（如梅尔基亚德斯）
    title: T;                  // 提示框标题
  };
}
