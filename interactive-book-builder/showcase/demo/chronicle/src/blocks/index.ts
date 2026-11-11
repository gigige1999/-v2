import type React from 'react';
import type { Kind } from './types';
import type { BlockProps } from './ui';
import { FeatureBlock, QuizBlock, TextBlock } from './reading';
import { CardsBlock, CompareBlock, TimelineBlock } from './explore';
import { GraphBlock, MapBlock } from './board';
import './blocks.css';

/** kind → 组件。新增组件：写一个 (p, lang, Spread) => <Spread left right/> 的组件，在这里注册，并在 types.ts 加类型 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLOCKS: Record<Kind, React.FC<BlockProps<any>>> = {
  text: TextBlock, feature: FeatureBlock, quiz: QuizBlock,
  timeline: TimelineBlock, cards: CardsBlock, compare: CompareBlock,
  graph: GraphBlock, map: MapBlock,
};

/** ✧ 默认提示（页面没写 tip 时） */
export const TIPS: Record<Kind, [string, string]> = {
  text: ['慢慢读。带下划线的词可以点开看释义。', 'Read slowly. Underlined words open a note.'],
  feature: ['看图读文；图上有编号时，点编号看注释。', 'Read the picture; tap numbers for notes.'],
  quiz: ['想一想再选。选错没关系，会告诉你为什么。', 'Think, then choose. Wrong answers explain themselves.'],
  timeline: ['点左页的年份，右页展开那一刻；也可以用 ‹ › 逐条翻。', 'Tap a year on the left; step with ‹ ›.'],
  cards: ['点卡片看详情；上方标签可以按类别筛选。', 'Tap a card; filter by category above.'],
  compare: ['切换不同时期，对照着看变化；图上编号可点。', 'Switch periods to compare; tap numbers on the picture.'],
  graph: ['点人物看生平；与他相连的线会亮起，右页可沿关系跳转。', 'Tap a person; follow ties on the right.'],
  map: ['点地图上的地点；路线模式可以用 ‹ › 一站站走。', 'Tap places; in journey mode step with ‹ ›.'],
};
