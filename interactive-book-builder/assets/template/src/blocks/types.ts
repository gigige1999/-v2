import type { T } from '../types';

/* =========================================================
   图文章的内页（历史介绍 / 图鉴 / 分类展开）—— 纯数据驱动
   每页 = { kind, variant?, title, ... }；跨页布局：左页 = 页眉 + 导航/视觉，右页 = 详情
   所有"条目"共用 Entry，右页详情统一由 <Detail> 渲染
   ========================================================= */

/** 通用条目：时间线节点 / 卡片 / 人物 / 地点 / 分期 / 热点 都是它 */
export interface Entry {
  id?: string;
  title: T;
  kicker?: T;          // 年份 / 日期 / 标签（详情顶部小字）
  short?: T;           // 列表里的一句话摘要
  text?: T | T[];      // 正文（数组 = 多段）
  image?: string;      // public/ 下的相对路径
  caption?: T;
  points?: T[];        // 要点列表
  quote?: { text: T; source?: T };
  icon?: string;       // emblem id（src/components/emblems.tsx）或单个字符/emoji
  facts?: { k: T; v: T }[];  // 事实卡：地点 / 参战方 / 结果 / 影响……（详情里排成两列）
  source?: T;          // 史料出处，详情末尾的小字
}
export interface Group { id: string; label: T; color?: string; years?: string }

interface Base {
  title: T;            // 页标题（左页页眉）
  kicker?: T;          // 页眉小字，缺省 = Chapter 罗马数字
  intro?: T;           // 左页导语
  tip?: T;             // ✧ 提示文案（缺省按 kind 给通用说明）
}

/** 章扉页。plate 满幅插图 / plain 文字书名页。一章的第一页用它开篇 */
export interface OpenerPage extends Base {
  kind: 'opener'; variant?: 'plate' | 'plain';
  chapter?: T;       // 章号或部名，如 '第三章' / 'PART II'
  latin?: T;         // 西文副题
  image?: string;    // plate 时的大图
  lede?: T;          // 导语（一两句）
  stats?: { n: string; label: T }[];  // 关键数字条：'240 年' / '3 个王朝'
  quote?: { text: T; source?: T };
}
/** 本章纲要。条目可展开摘要；page 只是页码标注，不跳转 */
export interface TocPage extends Base {
  kind: 'toc'; variant?: 'plain' | 'plate';
  items: (Entry & { page?: number })[];
  image?: string;
  note?: T;
}
/** 正文阅读。plain 单栏 / dropcap 首字下沉 / columns 跨左右两页连续排版；glossary 中的词在正文里高亮，点按出释义 */
export interface TextPage extends Base { kind: 'text'; variant?: 'plain' | 'dropcap' | 'columns'; text: T[]; image?: string; caption?: T; glossary?: Record<string, T>; quote?: { text: T; source?: T } }
/** 图文。split 左图右文 / hotspot 图上编号热点，点开看注释 / stack 右页上图下文 */
export interface FeaturePage extends Base { kind: 'feature'; variant?: 'split' | 'hotspot' | 'stack'; image: string; caption?: T; text: T[]; spots?: (Entry & { x: number; y: number })[] }
/** 时间线 / 里程碑。rail 竖向里程碑 / seals 分组蜡封折叠（groups + item.group）/ ribbon 横向年轴 */
export interface TimelinePage extends Base { kind: 'timeline'; variant?: 'rail' | 'seals' | 'ribbon'; groups?: Group[]; items: (Entry & { group?: string })[] }
/** 分类卡片。grid 网格 + 分类筛选 / accordion 手风琴展开 / flip 翻面卡片 */
export interface CardsPage extends Base { kind: 'cards'; variant?: 'grid' | 'accordion' | 'flip'; cats?: Group[]; items: (Entry & { cat?: string })[] }
/** 分期对比。tabs 切换分期（可带图上编号点）/ columns 左右两页并排对比（取前两项） */
export interface ComparePage extends Base { kind: 'compare'; variant?: 'tabs' | 'columns'; eras: (Entry & { spots?: (Entry & { x: number; y: number })[] })[] }
/** 人物关系。web 自由坐标关系图（x,y 为 0-100）/ tree 家谱（按 parent 自动分层） */
export interface GraphPage extends Base { kind: 'graph'; variant?: 'web' | 'tree'; groups?: Group[]; nodes: (Entry & { id: string; group?: string; x?: number; y?: number; parent?: string })[]; links?: { a: string; b: string; label?: T; dashed?: boolean }[] }
/** 地图。pins 点位 + 分类图例筛选 / journey 按顺序连成路线，逐站推进。x,y 为 0-100；image 缺省画纸面经纬网 */
export interface MapPage extends Base { kind: 'map'; variant?: 'pins' | 'journey'; image?: string; kinds?: Group[]; places: (Entry & { x: number; y: number; kind?: string })[] }
/** 小测。choice 单选 + 解析 / order 按正确顺序点击（options 按正确顺序书写，显示时打乱） */
export interface QuizPage extends Base { kind: 'quiz'; variant?: 'choice' | 'order'; question: T; image?: string; options: { text: T; ok?: boolean; why?: T }[]; explain?: T }

export type Page = OpenerPage | TocPage | TextPage | FeaturePage | TimelinePage | CardsPage | ComparePage | GraphPage | MapPage | QuizPage;
export type Kind = Page['kind'];
