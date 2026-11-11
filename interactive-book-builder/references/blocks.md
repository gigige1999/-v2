# 图文章与内页组件（历史图文书）

图文章 = `src/chapters/chN/index.ts` 里只有 `meta` + `pages`，不需要 Classic / spec / art。同一本书里图文章和解谜章可以混用，App 会根据有没有 `pages` 自动选择外壳。

```ts
import type { ChapterModule } from '../../types';
const chapter: ChapterModule = {
  meta: { id: 3, title: '王朝的兴衰', subtitle: 'De Regno', description: '📜 里显示的导读', image: 'illustrations/h-town.svg' },
  pages: [
    { kind: 'timeline', variant: 'seals', title: '三代国王', groups: [...], items: [...] },
    { kind: 'map', variant: 'journey', title: '远征路线', image: 'illustrations/map.svg', places: [...] },
  ],
};
export default chapter;
```

- 一页 = 一个跨页：**左页** = 页眉（kicker / title / intro）+ 组件左半；**右页** = 组件右半 + 页脚翻页栏（‹ 上一页 · 圆点 · 下一页 ›；最后一页是「读完本章」）。
- 手机端左右两页改为上下排列；点选条目后会自动滚到详情。
- 当前页存档在 `KEYS.page(id)`，↺ 会清除。✧ 提示依次取 `page.tip`、kind 的默认提示。
- 「读完本章」会把章节标为完成；有 `meta.excerpt` 的章节还会播放摘录过场并收入摘录册，没有就直接显示「本章终」。
- 文本字段类型都是 `T`：直接写字符串（只有中文），或写 `{ zh, en }`。
- 图片路径相对 `public/`。SVG 要写 `width`/`height` 属性，否则没有固有尺寸。

## 通用字段

每页都可以写：

| 字段 | 说明 |
|---|---|
| `title` | 必填，左页大标题 |
| `kicker` | 页眉小字，默认是 `Chapter II · 3/12` |
| `intro` | 标题下的导语 |
| `tip` | ✧ 提示文案 |

**Entry**（时间线节点 / 卡片 / 人物 / 地点 / 分期 / 热点共用），右页由 `<Detail>` 统一渲染：

```ts
{ title, kicker?, short?, text?: T | T[], image?, caption?, points?: T[], quote?: { text, source? }, icon? }
```

| 字段 | 说明 |
|---|---|
| `kicker` | 年份或标签，显示为详情顶部的彩色小字 |
| `short` | 列表里的一句话摘要 |
| `text` | 正文，数组表示多段 |
| `points` | ◆ 要点列表 |
| `icon` | 徽章 id（rose / crown / seal…，见 themes.md），或单个字符 / emoji |

**Group** `{ id, label, color?, years? }`：用于分组、分类和图例。`color` 不写时按顺序取 accent / sep / 绿 / 蓝 / 金 / 紫。

## 8 种组件 × 交互样式

| kind | variant | 左页 | 右页 | 关键字段 |
|---|---|---|---|---|
| `text` | `plain` | 配图、引文 | 正文 | `text: T[]`, `image?`, `caption?`, `quote?`, `glossary?` |
| | `dropcap` | 同上 | 正文，首字下沉 | |
| | `columns` | 正文前半（首字下沉）+ 配图 | 正文后半 | |
| `feature` | `split` | 图（原比例） | 正文 | `image`, `caption?`, `text: T[]` |
| | `hotspot` | 图上有编号热点 | 正文和热点索引；点开热点后显示该热点的 Detail | `spots: (Entry & {x, y})[]` |
| | `stack` | 首段大字导语 | 上图下文 | |
| `timeline` | `rail` | 竖向里程碑列表 | Detail + ‹ › | `items: (Entry & {group?})[]`，`kicker` 写年份 |
| | `seals` | 蜡封分组，可折叠展开 | 同上（翻到别组时自动展开该组） | `groups` 必填（含 `years`），`item.group` |
| | `ribbon` | 当前条目的配图 | 横向菱形年轴 + Detail | 每条最好有 `image` |
| `cards` | `grid` | 分类标签 + 卡片网格 | Detail | `cats?: Group[]`，`item.cat`、`icon`、`short` |
| | `accordion` | 分类标签 + 当前项配图 | 手风琴列表 | |
| | `flip` | 翻开计数 | 2 列翻面卡（正面：icon + 标题；背面：`short`） | |
| `compare` | `tabs` | 蜡封分期按钮 + 图（可带编号点，点开在图下注释） | 当前分期的 Detail | `eras: (Entry & {spots?})[]`，`icon` 写 1~2 个字符时显示在蜡封上 |
| | `columns` | 第 1 项 | 第 2 项；超过 2 项时两边都有切换标签 | |
| `graph` | `web` | 自由坐标关系图（x, y 为 0–100；不写则排成环形） | 人物 Detail 和「关系」列表，点列表项可跳转 | `nodes: (Entry & {id, group?, x?, y?})[]`，`links: {a, b, label?, dashed?}[]` |
| | `tree` | 家谱：按 `parent` 自动分层，用直角连线 | 同上 | `node.parent`；`links` 可以额外画联姻等虚线 |
| `map` | `pins` | 图例筛选 + 地图点位 | 地点 Detail | `image?`（不写时画纸面经纬网和罗盘），`kinds?: Group[]`，`places: (Entry & {x, y, kind?})[]` |
| | `journey` | 按顺序连成虚线路线，只显示走到当前站的部分 | Detail + 「第 n / N 站」 | `places` 的顺序就是路线顺序 |
| `quiz` | `choice` | 题目和配图 | 选项；选错时抖动并显示 `why`，选对后显示 `explain` | `question`, `options: {text, ok?, why?}[]`, `explain?` |
| | `order` | 同上 | 按顺序点按；点错清空重来 | `options` **按正确顺序书写**，显示时会打乱 |

`text.glossary`：`{ '词': 释义 }`。词在正文里显示为下划线，点按后在右页顶部浮出释义。

坐标约定：热点、地图和关系图的 `x` / `y` 都是 0–100 的百分比。热点和地图底图按原图比例显示，所以百分比就对应原图上的位置。

## 选组件的思路

| 内容 | 首选 |
|---|---|
| 一段连续叙述 | `text`（dropcap 开篇；columns 用于长文） |
| 一幅需要讲解的图（城景、器物、画作） | `feature·hotspot` |
| 年代顺序 | `timeline·rail`；有阶段或王朝时用 `seals`；每个节点都有图时用 `ribbon` |
| 一组同类事物（兵种、食物、建筑、职业） | `cards·grid`（要分类时加 `cats`）；要看细节用 `accordion`；趣闻冷知识用 `flip` |
| 前后变化、两方对比 | `compare·tabs`（多期）/ `columns`（两方） |
| 人物关系、家族 | `graph·tree`（血缘）/ `web`（结盟、敌对） |
| 地点分布、行军航线 | `map·pins` / `map·journey` |
| 章末回顾 | `quiz·choice` / `quiz·order` |

一章建议 6~12 页。同一章里不要连续用同一种 kind，交替使用阅读类和探索类，翻页才有节奏。

## 示例

`assets/samples/history/ch1`、`ch2`（虚构港城「灰港」）合起来覆盖了上面全部 20 种组合，`new_book.py --type history` 会把它们复制成书的 ch1、ch2。写新章节时，直接照抄对应页面的数据结构改。

## 扩展新组件

1. 在 `src/blocks/types.ts` 中加一个 `XxxPage extends Base { kind: 'xxx'; ... }`，并加进 `Page` 联合类型。
2. 写组件 `({ p, lang, Spread }) => <Spread left={...} right={...} />`。可复用 `ui.tsx` 里的 `Detail`、`Img`、`Tabs`、`Seal`、`Pin`、`Stepper`、`Icon`、`Paras`、`reveal`。
3. 在 `src/blocks/index.ts` 的 `BLOCKS` 和 `TIPS` 里注册。
4. 颜色只能用 `ink` / `accent` / `paper` / `tint(k)` / `colorOf(groups, id)`，这样换纸张主题后仍然协调。
