import type { BookConfig } from './types';

// ============ 整本书唯一的全局配置 ============
// 章节内容不在这里：每章是 src/chapters/chN/ 下的独立文件夹（自动发现，按 meta.id 排序）
// 下面带 [scaffold] 的单行字段会被 scripts/new_book.py 改写，请保持单行格式
export const BOOK: BookConfig = {
  storageKey: 't2', // [scaffold]
  type: 'history', // [scaffold]
  unlock: 'progressive', // [scaffold]
  cover: 'umber', // [scaffold]
  paper: 'linen', // [scaffold]
  coverLayout: 'emblem', // [scaffold]
  emblem: 'longship', // [scaffold]
  languages: ['zh'],
  title: { zh: '维京时代', en: '维京时代' }, // [scaffold]
  subtitle: { zh: '北方的人', en: '北方的人' }, // [scaffold]
  author: { zh: '佚名', en: '佚名' }, // [scaffold]
  coverText: {
    kicker: 'An Illustrated Chronicle', // [scaffold]
    motto: '— 维京时代 —', // [scaffold]
    latin: 'VIKINGR', // [scaffold]
    era: 'DCCXCIII — MLXVI', // [scaffold]
    prompt: { zh: '轻触封面 · 翻开编年史', en: 'Touch to Open the Chronicle' }, // [scaffold]
  },
  index: {
    heading: { zh: '目 录', en: 'CONTENTS' },
    leftKicker: 'Chronicle', // [scaffold]
    leftEra: '— DCCXCIII — MLXVI —', // [scaffold]
    lines: [ // [scaffold]
      { zh: '凡事皆有其时，凡人皆有其名。', en: 'To every thing a season, to every name a page.' },
      { zh: '把发生过的事写下来，它就不会真正消失。', en: 'What is written does not wholly vanish.' },
      { zh: '翻开这一页，回到那个年代。', en: 'Turn the page; return to that age.' },
    ],
    finalLockNote: { zh: '读完前面每一章后解锁', en: 'Unlocks after every previous chapter is read' }, // [scaffold]
  },
  guide: {
    name: { zh: '史官', en: 'The Chronicler' }, // [scaffold]
    title: { zh: '史官的旁注', en: 'A Note from the Chronicler' }, // [scaffold]
  },
};
