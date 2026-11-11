import type { ChapterModule } from '../../types';
import { Classic } from './Classic';
import spec from './spec.js';

// 每章 = 一个文件夹：meta（目录/左页/说明/摘录）+ Classic（第一关）+ spec（第二关）
const chapter: ChapterModule = {
  meta: {
    id: 2,
    title: { zh: '第二章（待命名）', en: 'Chapter 2' },
    subtitle: 'La noche del estudio',
    description: { zh: '门从里面锁上了。只有一截蜡烛、一封看不清的信，和窗外不肯睡去的星星。', en: 'The door is locked from inside. A candle, an unreadable letter, and stars that will not sleep.' },
    stage1: { zh: '散落的句子：按正确的顺序点击碎片，拼回书页上的第一句话。点错会重来。', en: 'Tap the scattered fragments in the right order to restore the first sentence.' },
    stage2: { zh: '点击书页上的东西去查看、拾取；物品会收进下方的口袋。点一件物品再点另一件可以组合，选中物品再点场景里的东西就是使用。卡住了就点 ✧。', en: 'Tap things to look and pick up. Tap two items to combine; select an item then tap the scene to use it. Stuck? Tap ✧.' },
    excerpt: {
      text: { zh: '“很多年以后，他仍会想起那个点亮蜡烛的夜晚。”', en: '“Many years later, he would still remember the night the candle was lit.”' },
      source: { zh: '—— 示例摘录（替换为原著）', en: '— Sample excerpt (replace with the original text)' },
    },
    image: 'illustrations/ch2.svg',
  },
  Classic,
  spec,
};
export default chapter;
