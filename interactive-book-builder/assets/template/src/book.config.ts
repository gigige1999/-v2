import type { BookConfig } from './types';

// ============ 整本书唯一的全局配置 ============
// 章节内容不在这里：每章是 src/chapters/chN/ 下的独立文件夹（自动发现，按 meta.id 排序）
// 下面带 [scaffold] 的单行字段会被 scripts/new_book.py 改写，请保持单行格式
export const BOOK: BookConfig = {
  storageKey: 'ibook', // [scaffold]
  type: 'puzzle', // [scaffold] puzzle 解谜书 / history 历史图文书
  unlock: 'progressive', // [scaffold] progressive 逐章解锁 / open 全部开放
  cover: 'leather', // [scaffold] 封面配色：python3 scripts/themes.py list
  paper: 'parchment', // [scaffold] 纸张主题
  coverLayout: 'classic', // [scaffold] classic / heraldic / emblem
  emblem: 'compass', // [scaffold] 封面徽章：rose longship crown lily sun key feather seal boar compass candle
  languages: ['zh'],
  title: { zh: '记忆之书', en: 'The Book of Memory' }, // [scaffold]
  subtitle: { zh: '一本可以玩的书', en: 'A Playable Book' }, // [scaffold]
  author: { zh: '佚名', en: 'Anonymous' }, // [scaffold]
  coverText: {
    kicker: 'Literary Puzzle Book', // [scaffold]
    motto: '— THE BOOK OF MEMORY —', // [scaffold]
    latin: 'THE BOOK OF MEMORY', // [scaffold]
    era: 'ANNO MCMLXVII', // [scaffold]
    prompt: { zh: '轻触封面 · 翻开这本书', en: 'Touch to Begin' }, // [scaffold]
  },
  index: {
    heading: { zh: '目 录', en: 'CONTENTS' },
    leftKicker: 'Chronicle', // [scaffold]
    leftEra: '— ANNO MCMLXVII —', // [scaffold]
    lines: [ // [scaffold] 整个数组会被 --type history 替换
      { zh: '每一本书里，都住着一个不肯睡去的夜晚。', en: 'Every book holds a night that will not sleep.' },
      { zh: '名字被遗忘之前，先把它写下来。', en: 'Write the names down before they are forgotten.' },
      { zh: '翻过这一页，故事才刚刚开始。', en: 'Turn the page; the story has only begun.' },
    ],
    finalLockNote: { zh: '需通过前面每一章的两关后解锁', en: 'Unlocks after both stages of every previous chapter' }, // [scaffold]
  },
  guide: {
    name: { zh: '书灵', en: 'The Guide' }, // [scaffold]
    title: { zh: '书灵的低语', en: 'A Whisper from the Guide' }, // [scaffold]
  },
};
