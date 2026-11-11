# 主题与封面

封面由四件事组合而成，彼此独立：

| 维度 | 字段（`src/book.config.ts`） | 可选值 |
|---|---|---|
| 封面配色 | `cover` | leather midnight burgundy forest ivory ebony celadon rouge **wine umber** |
| 内页纸张 | `paper` | parchment rice kraft foxed celadon ash blossom letter **vellum linen** |
| 封面版式 | `coverLayout` | `classic` / `heraldic` / `emblem` |
| 封面徽章 | `emblem` | rose longship crown lily sun key feather seal boar compass candle |

封面上的文字来自 `coverText`：`kicker`、`motto`、`latin`、`era`、`prompt`。

运行时由 `main.tsx` 把配色写到 `<html data-cover data-paper>` 上。地址栏参数可以临时预览：`?cover=wine&paper=vellum&layout=emblem&emblem=rose`。

```bash
python3 scripts/themes.py list                          # 列出全部配色/纸张和推荐搭配
python3 scripts/themes.py gallery [--out file.html]     # 生成预览页，给用户挑选
python3 scripts/themes.py set <书目录> --cover ebony --paper ash
python3 scripts/themes.py current <书目录>
```

## 封面版式

| 版式 | 样子 | 用到的文字 | 适合 |
|---|---|---|---|
| `classic` | 正面平放的精装书：烫金双框和四角，居中书名，作者名下方配小徽章 | kicker · title · subtitle · motto · author | 解谜书默认，文学 / 小说 |
| `heraldic` | 斜放的合拢书：可见书页厚度，有丝带书签和 ✧ 细框，中间是纹章大图；点击时书会翻开 | kicker · title · latin · subtitle · era | 历史书默认，纹章 / 王朝 / 编年史（《玫瑰战争》） |
| `emblem` | 书名写在书外；书面上只有烫金西文大字、中心徽章和罗马年份 | kicker · title · subtitle（书外），latin · era（书面） | 北欧 / 远征 / 图鉴（《Vikings》） |

- `latin` 不写时用书名代替。emblem 版式会按字数自动缩小字号（超过 8 个字符和超过 14 个字符各缩一档）。
- 目录左页底部也会显示同一个徽章。

## 徽章

徽章定义在 `src/components/emblems.tsx`，都是 SVG 字符串，颜色由 CSS 变量控制，所以会跟着封面配色变化：

- `.em-a`：主色块，默认是 `--cv-accent`（酒红一类）
- `.em-b`：浅色块，默认是 `--cv-title`
- 其余描边和填充用 `currentColor`（烫金色）

| id | 图案 | 来源 |
|---|---|---|
| `rose` | 都铎玫瑰（大图） | 《玫瑰战争》 |
| `longship` | 日轮长船（大图） | 《Vikings》 |
| `crown` `lily` `sun` `key` `feather` `seal` `boar` `compass` `candle` | 48×48 图形，外套勋章环 | 通用 |

**新增徽章**有两种写法：

- 简单图形：往 `SHAPES` 里加一个 48×48 的 path 字符串，会自动套上勋章环。
- 完整大图：往 `EMBLEMS` 里加 `{ vb: 'viewBox', svg: '...' }`。

写法上有两条要求：`class="em-a"` / `class="em-b"` 标记需要变色的区域；不要写死颜色。

## 推荐搭配

| 封面 | 纸张 | 适合 |
|---|---|---|
| leather 古典皮革 | parchment 羊皮纸 | 《百年孤独》原版：古典、魔幻现实 |
| midnight 午夜蓝 | letter 蓝墨信笺 | 悬疑 / 书信 / 星空 |
| burgundy 酒红丝绒 | foxed 旧书泛黄 | 爱情 / 宫廷 / 哥特 |
| forest 墨绿布面 | kraft 牛皮纸 | 冒险 / 自然 / 手作 |
| ivory 象牙白布面 | rice 宣纸 | 东方 / 散文 / 水墨 |
| ebony 黑金 | ash 素灰 | 史诗 / 黑白 / 克制 |
| celadon 青瓷 | celadon 青笺 | 海洋 / 江南 / 奇幻 |
| rouge 胭脂粉 | blossom 桃花笺 | 青春 / 治愈 / 浪漫 |
| **wine 玫瑰酒红** | **vellum 手抄羊皮** | 历史：纹章 / 王朝 / 编年史 —— 推荐 `heraldic` + `rose`/`crown`/`boar` |
| **umber 维京皮革** | **linen 北境手稿** | 历史：北欧 / 远征 / 图鉴 —— 推荐 `emblem` + `longship`/`sun` |

## 变量

- 封面 `--cv-*`：
  - `bg` `bg2`：主色和渐变色
  - `spine`：书脊
  - `edge`：封面压边
  - `foil`：烫金色，也用于进度金脉和通关光点
  - `title`、`soft`
  - `accent`：徽章主色块
  - `texture`：可选 `var(--leather|--cloth|--velvet)`
- 纸张 `--pp-*`：
  - `bg`：右页
  - `bg2`：左页
  - `leaf`：引擎图版底色
  - `ink-rgb` / `accent-rgb`：**R G B 三元组**，供 Tailwind 透明度使用
  - `sep`：分隔线颜色，图文组件的第二分组色
  - `stain`：左页污渍
  - `grain`：可选 `var(--grain-warm|--grain-cool|--fiber)`
  - `shadow`
  - `app-bg`：页面背景
- 派生变量：`--pp-ink`、`--pp-accent`（普通 CSS 中使用）。Tailwind 颜色：`ink accent paper paper2 foil`。
- 暗色模式（🌙）只替换 `--app-bg`，书页本身保持不变。

## 新增主题

在 `src/styles/themes.css` 对应的区块里照着现有格式添加。**元数据注释必须写**，`themes.py` 靠它来解析：

```css
/* @cover sepia | 棕褐 | 一句话描述 */
[data-cover="sepia"] { --cv-bg: …; --cv-bg2: …; --cv-spine: …; --cv-edge: …; --cv-foil: …; --cv-title: …; --cv-soft: …; --cv-accent: …; --cv-texture: var(--cloth); }

/* @paper sepia | 棕褐纸 | 一句话描述 */
[data-paper="sepia"] { --pp-bg: …; --pp-bg2: …; --pp-leaf: …; --pp-ink-rgb: 40 30 20; --pp-accent-rgb: 150 60 40; --pp-sep: …; --pp-stain: …; --pp-grain: var(--grain-warm); --pp-shadow: …; --app-bg: …; }
```

要让以后新建的书也能使用某个主题，就改 skill 里的 `assets/template/src/styles/themes.css`；只给某一本书用，就改那本书自己的副本。
