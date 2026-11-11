# 书页引擎 API（第二关）

引擎是 `src/engine/engine.js`，由 `BookPage.tsx` 挂载，章节不需要直接调用它。章节只需要 `export default` 一个 spec 对象（即 `chN/spec.js`）。
完整示例见 `src/chapters/ch1/spec.js`，覆盖了全部常用能力。

## 页面结构

```
页眉：kicker（CAP. I + 小字） + pips（进度小方块）     ← 右侧留给 App 的 ← 📜 ↺ ✧
舞台：一叠书页（页栈）——主场景 / 特写(open) / 文字页(sheet) / 笔记本，切换时有翻页动画
旁白：narr 文本（✧ 提示用斜体红字）
底栏：♪ 音效开关 | 物品栏（默认 7 格）| 笔记本书签
```

## spec 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `kicker` | `{tag, text}` | 页眉，例如 `{tag:'CAP. II', text:'La lluvia'}` |
| `pips` | `[{when, label}]` | 页眉进度格，`when` 为条件表达式，成立时点亮 |
| `state()` | `() => obj` | 本章的初始状态，会合并进 S（S 还自带 `inv notes seen hints finished`） |
| `notes` | `string[]` | 笔记本的初始条目 |
| `items` | `{id:{name,desc,icon}}` | 物品；`icon` 为 60×60 的 SVG 字符串 |
| `recipes` | `{'a+b':{out,msg,note?}}` | 组合配方；key 是**两个 id 按字母排序后**用 `+` 连接 |
| `badCombos` | `{'a+b': '失败旁白'}` | 有意义的错误组合（可选） |
| `names` | `{hotId: '名字'}` 或 `(id,S)=>string` | 鼠标悬停时显示的名字；不写就不显示提示 |
| `lines` | `{key: string[]}` | 配合 `g.cycle(key)`，同一物件多次点击时轮流说不同的话 |
| `scenes` | `{main, ...}` | 每项为 `{cap, intro?, svg:(S,g)=>string}`；`main` 必填；其余用 `g.open(name)` 打开（特写） |
| `sheets` | `{name:{cap, html:(S,g)=>string, back?}}` | 文字页（信件、命名、拼字、密码）；页内按钮写 `data-act` |
| `act(id,g,pt,el)` | 函数 | 点击热区（`data-hot`）或按钮（`data-act`）时调用；**一律 `return g.xxx()`** |
| `use(item,target,g,pt)` | 函数 | 选中物品后点击热区，或把物品拖到热区时调用。返回真值表示已处理；返回假值时引擎给出默认失败旁白 |
| `hint(S,g)` | `=> [key, soft, hard]` | 两级提示：同一个 key 第一次显示 soft（方向），之后显示 hard（具体做法） |
| `solve(S,g)` | 函数 | 自动通关：把 S 改成"通关前一刻"的状态 |
| `finale(g)` | 函数 | 自动通关的最后一步，通常是 `g => g.finish('...')`；不写就直接调用 `finish()` |
| `intro` | string | 第一次进入时的旁白 |
| `onOpen(name,g)` / `onBack(name,g)` | 函数 | 特写翻开后 / 翻回后的回调 |
| `render(g)` | 函数 | 每次 `apply()` 之后调用，用来做 data-if 难以表达的 DOM 同步 |
| `mount(g)` | 函数 | 挂载后调用一次，可以在这里用 `g.every` 设计时器、用 `g.on` 绑事件 |
| `defs` | string | 追加的 SVG `<defs>`（本章专用的 pattern、gradient、filter，id 用 `chN-` 前缀） |
| `slots` | number | 物品栏格数，默认 7 |
| `text` | obj | 覆盖引擎内置文案：`back notebook already fail[] resume done nudge whisper auto` 等 |

## g 上下文（act / use / hint / mount 中可用）

**状态**：`g.S`（可直接修改，之后调用 `g.apply()` 或任意会触发 apply 的方法）、`g.sel`（当前选中的物品）、`g.busy`、`g.flipping`
**物品**：`g.has(id)`、`g.addItem(id,n?)`、`g.removeItem(id,n?)`、`g.item(id)`
**拾取**：`g.take(id, pt, msg?, flag?='${id}Taken', n?)`：设置 `S[flag]=true`、物品放入物品栏、从点击位置飞入。flag 为 `null` 表示可以重复拾取。
**文字**：`g.narr(text, whisper?)`、`g.fail(text?)`（播放错误音效 + 旁白）、`g.cycle(key)`、`g.addNote(text)`（笔记本书签会跳动提示）
**翻页**：`g.open(scene)`、`g.sheet(name)`、`g.back()`、`g.refresh()`（按 S 重画栈顶的图版）
**渲染/存档**：`g.apply()`（重新计算 data-if/data-cls/pips、刷新物品栏并存档）、`g.save()`
**流程**：`g.finish(text?, delay=5000)`（闪光 + 光点飞散 + 旁白，delay 毫秒后进入过场摘录）、`g.lock(bool)`（锁住交互）、`g.later(fn,ms)`、`g.wait(ms)`、`g.every(fn,ms)`；这些计时器在离开页面时会自动清理
**DOM**：`g.$(sel)`、`g.$$(sel)`、`g.on(target,type,fn)`（离开时自动解绑）、`g.top()`、`g.root`、`g.wrap`、`g.svgEl(tag,attrs)`、`g.svgPt(svg,x,y)`
**工具**：`g.cond(expr)`、`g.pick(arr)`、`g.shuffle(arr)`、`g.Snd`

> 约定：`narr / fail / take / open / sheet / back / finish` 都返回真值，所以 `act`/`use` 里统一写 `return g.xxx(...)`。

## 条件表达式（data-if / data-cls / pips.when / g.cond）

`"a+!b.c+has:key"` 表示 `S.a` 为真、`S.b.c` 为假，并且物品栏里有 key。`+` 表示"且"，`!` 表示取反，`.` 用来取嵌套属性。没有"或"，需要"或"时在 S 里加一个派生 flag。

## SVG / HTML 属性

| 属性 | 作用 |
|---|---|
| `data-hot="id"` | 可点击的热区，触发 `act(id)`；选中物品时触发 `use(item,id)`。透明矩形用 `hot(id,x,y,w,h,cond?)` 生成（class `bk-hot`） |
| `data-if="expr"` | 条件不成立时 `display:none`；每次 apply 都会重新计算 |
| `data-cls="cls:expr; cls2:expr2"` | 条件成立时加上对应 class（配合 CSS 过渡或动效） |
| `data-act="id"` | 文字页或图版里的按钮，触发 `act(id)` |
| `data-back` | 点击后翻回上一页（特写页自带返回按钮，一般不需要写） |

热区要放在 SVG 的最上层（文档顺序最后），否则会被图形挡住。

## 美术工具（`src/engine/art-kit.js`）

- `INK = 'currentColor'`：墨线颜色，跟随纸张主题；**所有描边都用 INK**。
- `PAL`：`sep umb och cre red wood wood2 wall floor night glass`，低饱和土色，和 multiply 混合模式配合效果好。
- `F` / `FI`：SVG `<text>` 的字体属性（正体 / 斜体）。
- 共享 defs：排线 `url(#bk-h)` / `#bk-hx`（交叉排线）/ `#bk-hf`（细排线）；墙纸 `#bk-wp`；渐变 `#bk-lamp`（暖光）/ `#bk-night`；滤镜 `#bk-wob`（手绘抖动，包在背景组上）/ `#bk-glow` / `#bk-soft`（投影）/ `#bk-forget`（溶解模糊，表示"被遗忘"或"还没解锁"）。
- `hot(id,x,y,w,h,cond?)`、`tag(x,y,text,rot?)`（会摆动的手写名签）、`spokes(cx,cy,r1,r2,n,sw?,col?)`（放射刻度线）。
- 尺寸：主场景 `<svg class="bk-scene" viewBox="0 0 800 800">`，特写 `viewBox="0 0 400 400"`，图标 `viewBox="0 0 60 60"`。

## 可用的 CSS 类（engine.css）

- 文字页：`bk-sh-k`（小标题）、`bk-sh-h`（大标题）、`bk-sh-sub`、`bk-lined`（横线信纸；里面的 `<p>` 首行缩进，`<em>` 显示为红色重点）、`bk-sign`（落款）、`bk-btn`（墨色按钮）。
- 字块谜题：`bk-tiles`（5 列网格）> `bk-tile`（加上 `.used` 表示已用）；`bk-shake` 表示答错时抖动。
- SVG 动效：`bk-flick`（火苗跳动）、`bk-blink`（眨眼）、`bk-fade`（1.6 秒透明度过渡）、`bk-roll`（数字转轮滚动，需要移除后重新添加）、`bk-tag`、`bk-drag`（抓手光标）。
- 章节自定义样式：写在 `chN/` 下的 `.css` 文件里，并在 spec.js 中 `import './chN.css'`；选择器一律加 `chN-` 前缀。

## 音效 `g.Snd.fx.*`

`click pick wrong write ink magic page roll tick creak unlock thud fire shimmer`。引擎已经自动播放翻页、拾取、组合（ink）、失败（wrong）、通关（magic）的音效；章节只需要在关键动作上补充，例如开锁用 `unlock`、门用 `creak`、点火用 `fire`、写字用 `write`、转轮用 `roll`。新增音效时在 `sound.js` 的 `fx` 里加一行 `tone()/noise()` 组合。

## 存档

S 保存在 `localStorage[storageKey + '_ch' + id]`，任何 apply 或 save 都会写入。刷新后会恢复，并显示"书页还停在你离开的地方"。↺ 按钮会清除本章存档并从第一关重新开始。所以 **S 里只能放可 JSON 序列化的数据**。
