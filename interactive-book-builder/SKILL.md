---
name: interactive-book-builder
description: 快速搭建"可以玩/可以翻的书"的 React+Vite 框架，两种类型：① 解谜书（文学交互书 / 锈湖式点击解谜读物：每章两关 = React 小游戏 + 书页引擎拾取/组合/特写/提示）；② 历史图文书（历史介绍 / 图鉴 / 编年史：每章若干跨页，8 种内页组件 × 20 种交互样式——时间线、分类卡片、分期对比、人物关系/家谱、地图点位/路线、热点图、正文释义、小测）。提供 3 种封面版式（经典烫金 / 纹章合拢书 / 徽章手抄本）× 11 种徽章 × 10 套封面配色 × 10 套纸张、目录与章节解锁、摘录收藏、WebAudio 音效与存档。当用户要把小说/故事/名著做成交互书或解谜书，或要把一段历史、一个文明、一个主题做成可翻阅的交互图文书/电子图鉴，或要给这类项目加章节、换主题/封面、写内页时使用。源自《百年孤独》《玫瑰战争》《Vikings》交互书。
---

# Interactive Book Builder

一条命令生成可运行的交互书工程，之后只需按章写内容。框架（外壳、引擎、组件、主题、存档、音效）都已就绪，**不要重写它们**。

## 第 0 步：先问清楚书的类型（必须）

动手之前，先用一次提问确认下面几项。用户已经说清楚的就不要再问。

| 问题 | 选项 | 对应参数 |
|---|---|---|
| **书的类型** | **解谜书**：读故事、玩关卡（小说、名著、悬疑）<br>**历史图文书**：翻阅、点选、展开（历史、文明、人物、图鉴） | `--type puzzle` / `--type history` |
| 章节是否逐章解锁 | 逐章解锁（解谜默认）/ 全部开放（历史默认） | `--unlock progressive\|open` |
| 封面版式 | classic 烫金框 / heraldic 纹章合拢书 / emblem 徽章手抄本 | `--layout` |
| 封面徽章 | rose longship crown lily sun key feather seal boar compass candle | `--emblem` |
| 配色和纸张 | 跑 `themes.py gallery` 给用户看图挑选，或参考推荐搭配 | `--cover` `--paper` |

不确定时按类型取默认值：

- 解谜书：`classic + compass + progressive`
- 历史书：`heraldic + crown + open + wine/vellum`

北欧题材推荐 `emblem + longship + umber/linen`。

## 快速流程

```bash
S=<本 skill 目录>
python3 $S/scripts/themes.py list                 # 看配色/纸张（gallery 可生成预览页 theme-gallery.html）

# 解谜书
python3 $S/scripts/new_book.py <目录> --type puzzle --title 书名 [--en "English"] [--author 作者] \
        --cover leather --paper parchment --chapters 3 --install
# 历史图文书
python3 $S/scripts/new_book.py <目录> --type history --title 灰港编年史 --en "Chronicle of Greyhaven" \
        --layout heraldic --emblem rose --cover wine --paper vellum --era "MCDLV — MCDLXXXVII" --chapters 4 --install

cd <目录> && npm run dev     # http://localhost:3011
```

临时预览可以加地址参数：`?cover=&paper=&layout=&emblem=`。

其他参数：`--subtitle` 副标题、`--kicker` 封面顶部小字、`--latin` 封面西文大字、`--era` 年代、`--unlock`、`--key` 存档前缀。

生成后即可直接运行：

- 解谜书：ch1 是完整示例（书房之夜），ch2..chN 是它的副本。
- 历史书：ch1、ch2 是图文示例（虚构港城「灰港」，合起来覆盖全部 20 种组件样式），ch3..chN 是 ch1 的副本。
- 历史书的封面文字、目录题记和引路人（「史官」）都换成了编年史口吻。

之后的工作只在两个地方：

1. **`src/book.config.ts`**：书名、封面文字（`coverText`）、版式和徽章、解锁方式、目录左页题记、引路人名字（✧ 提示的说话人）。
2. **`src/chapters/chN/`**：每章一个文件夹，有两种形态，同一本书可以混用。
   - **解谜章**：`index.ts`（meta）+ `Classic.tsx`（第一关）+ `spec.js`（第二关书页引擎）+ `art.js`（SVG）。见 `references/chapter-recipe.md` 和 `references/engine-api.md`。
   - **图文章**：只有一个 `index.ts`，内容是 `meta` + `pages: Page[]`，纯数据，不写组件。见 `references/blocks.md`。
   - 左页插图和内页图片放在 `public/illustrations/`。

追加章节：`python3 $S/scripts/add_chapter.py <书目录> [N] [--kind same|puzzle|paged]`。`same` 复制本书的 ch1，`puzzle` 复制解谜示例章，`paged` 复制图文示例章。章节会自动发现，不需要注册。

换主题：`python3 $S/scripts/themes.py set <书目录> --cover midnight --paper letter`。换版式或徽章：直接改 `book.config.ts` 的 `coverLayout` / `emblem`。

## 写一章的顺序（省 token）

**解谜章**

1. 先定**谜题链**：5~8 步，每步 = 动作 → 状态 flag → 画面变化，最后一步调用 `g.finish()`。把这条链写进 spec.js 顶部注释。
2. 写 `spec.js`：items / recipes / scenes / act / use / hint / solve。直接照抄 ch1 的结构改。
3. 写 `art.js`：先画热区和 `data-if` 状态，画面细节放到最后。
4. 写 `Classic.tsx`：一个 1~3 分钟能通过的小游戏，必须响应 `triggerAutoSolve`。
5. 改 `index.ts` 的 meta 文案和摘录。

**图文章**

1. 先列这一章的**页序**：6~12 页，按 `references/blocks.md` 的「选组件的思路」给每页选 kind 和 variant。阅读类（text / feature）和探索类（timeline / cards / map / graph…）交替排列，可以用 quiz 收尾。
2. 从示例章里找到同 kind·variant 的页面，复制它的数据结构，换成真实内容。年份写进 `kicker`；一句话摘要写进 `short`；详情写进 `text` 和 `points`。
3. 配图：热点图和地图的 `x` / `y` 是原图上的百分比。没有地图时省略 `image`，组件会画纸面经纬网。
4. `meta.description` 是 📜 里的导读；想让章末收集摘录，就写 `meta.excerpt`。

**两种章节都要**：运行 `npx tsc --noEmit && npm run build` 做检查。浏览器里，解谜章用 📜 →「自动完成本关」能快速走完整个流程；图文章用页脚圆点跳页。

## 只读不改的框架文件

| 文件 | 作用 |
|---|---|
| `src/App.tsx` | 外壳：封面 → 目录 → 章节 → 过场摘录；工具按钮 ← 📜 ↺ ✧；解锁规则 |
| `src/components/BookCover.tsx` + `emblems.tsx` | 3 种封面版式和徽章库（新增徽章见 `references/themes.md`） |
| `src/components/TwoStageChapter.tsx` | 解谜章：第一关 → 翻页 → 第二关，第二关进度可恢复 |
| `src/components/PagedChapter.tsx` | 图文章：跨页排版（手机端改为上下排列）、翻页栏、页码存档、✧ 提示 |
| `src/blocks/*` | 8 种内页组件（`types.ts` 定义数据，`index.ts` 注册） |
| `src/engine/engine.js` + `engine.css` | 书页引擎（第二关全部交互） |
| `src/engine/art-kit.js` | 版画框、共享 defs（排线、滤镜、渐变）、调色板、`hot()`、`tag()`、`spokes()` |
| `src/engine/sound.js` | 合成音效 `Snd.fx.*`（不依赖音频文件） |
| `src/styles/themes.css` | 封面和纸张主题变量；新增主题见 `references/themes.md` |
| `src/services/store.ts` | 存档 key（都带 `BOOK.storageKey` 前缀）和提示注册 |

解锁规则（`BOOK.unlock`）：

- `progressive`：第 1 章开放；通过某章第一关（图文章是读完）就解锁下一章；最后一章要等前面所有章节都完成后才解锁。
- `open`：所有章节直接开放。

## 案例与素材（`showcase/`）

`showcase/index.html` 是给人读的图文说明：20 个真实跨页的截图、每页的字段写法、封面版式对比、手机端效果、两章素材清单。设计新书或向用户展示能力时先看它。

`showcase/demo/` 下有两本可直接运行的完整工程（只有源码和 SVG 素材，不含 node_modules）：

| 目录 | 内容 |
|---|---|
| `demo/chronicle/` | 图文书：灰港编年史，ch1 8 页 + ch2 12 页，覆盖全部 20 种样式（heraldic · crown · wine/vellum） |
| `demo/mixed/` | 图文章 + 解谜章共存，emblem · longship · umber/linen |

写新章节时，从 demo 里找到同 `kind·variant` 的页面，复制数据结构改内容，比从零写快得多。

## 参考文档（按需读取）

- `references/blocks.md`：图文章的数据格式，8 种组件 × 20 种样式的字段表，选组件的思路，以及如何扩展新组件。写图文章时读。
- `references/engine-api.md`：spec 字段、`g` 上下文、SVG `data-*` 属性、可用 CSS 类和音效。写 spec.js / art.js 时读。
- `references/chapter-recipe.md`：解谜章的设计原则、两关的分工、美术约定、第一关常见玩法、验收清单。设计新解谜章时读。
- `references/themes.md`：配色和纸张清单、3 种封面版式、徽章库、推荐搭配、CSS 变量，以及如何新增主题或徽章。
- `showcase/index.html`：案例说明页（截图 + 数据写法）；`showcase/demo/` 是两本可运行的示例书。
