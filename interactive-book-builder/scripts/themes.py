#!/usr/bin/env python3
"""交互书主题工具：列出 / 切换 / 生成预览图库。

  python3 themes.py list                       # 列出全部封面与纸张
  python3 themes.py gallery [--out x.html]     # 生成可点选的主题图库（默认写到 skill 根目录 theme-gallery.html）
  python3 themes.py set <book_dir> --cover midnight --paper letter
  python3 themes.py current <book_dir>

主题定义来自 assets/template/src/styles/themes.css 中的 `/* @cover id | 名 | 描述 */` 注释；
若 <book_dir> 内有自己的 themes.css（新增过主题），set/current 会以书内的为准。
"""
import argparse, html, json, re, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
TEMPLATE_CSS = SKILL / 'assets/template/src/styles/themes.css'
META_RE = re.compile(r'/\*\s*@(cover|paper)\s+([\w-]+)\s*\|\s*([^|]+?)\s*\|\s*(.+?)\s*\*/')
PAIRS = [  # 推荐搭配（封面, 纸张, 说明）
    ('leather', 'parchment', '《百年孤独》原版：古典、魔幻现实'),
    ('midnight', 'letter', '悬疑 / 书信 / 星空'),
    ('burgundy', 'foxed', '爱情 / 宫廷 / 哥特'),
    ('forest', 'kraft', '冒险 / 自然 / 手作'),
    ('ivory', 'rice', '东方 / 散文 / 水墨'),
    ('ebony', 'ash', '史诗 / 黑白 / 克制'),
    ('celadon', 'celadon', '海洋 / 江南 / 奇幻'),
    ('rouge', 'blossom', '青春 / 治愈 / 浪漫'),
    ('wine', 'vellum', '历史：纹章 / 王朝 / 编年史（《玫瑰战争》）'),
    ('umber', 'linen', '历史：北欧 / 远征 / 图鉴（《Vikings》）'),
]


def parse(css_path: Path):
    text = css_path.read_text(encoding='utf-8')
    out = {'cover': [], 'paper': []}
    for kind, tid, name, desc in META_RE.findall(text):
        out[kind].append({'id': tid, 'name': name, 'desc': desc})
    return out, text


def book_css(book: Path) -> Path:
    p = book / 'src/styles/themes.css'
    return p if p.exists() else TEMPLATE_CSS


def cmd_list(_):
    meta, _ = parse(TEMPLATE_CSS)
    for kind, title in (('cover', '封面 cover'), ('paper', '内页纸张 paper')):
        print(f'\n== {title} ==')
        for t in meta[kind]:
            print(f"  {t['id']:<10} {t['name']:<8} {t['desc']}")
    print('\n== 推荐搭配 ==')
    for c, p, d in PAIRS:
        print(f'  --cover {c:<9} --paper {p:<10} {d}')


CFG_RE = {k: re.compile(rf"(\b{k}\s*:\s*')([\w-]+)(')") for k in ('cover', 'paper')}


def cmd_set(a):
    book = Path(a.book).resolve()
    cfg = book / 'src/book.config.ts'
    if not cfg.exists():
        sys.exit(f'找不到 {cfg}')
    meta, _ = parse(book_css(book))
    src = cfg.read_text(encoding='utf-8')
    for k in ('cover', 'paper'):
        v = getattr(a, k)
        if not v:
            continue
        ids = [t['id'] for t in meta[k]]
        if v not in ids:
            sys.exit(f'未知 {k}: {v}；可选：{", ".join(ids)}')
        src, n = CFG_RE[k].subn(rf'\g<1>{v}\g<3>', src, count=1)
        if not n:
            sys.exit(f"book.config.ts 中没找到 `{k}: '...'` 字段")
    cfg.write_text(src, encoding='utf-8')
    cmd_current(a)


def cmd_current(a):
    src = (Path(a.book) / 'src/book.config.ts').read_text(encoding='utf-8')
    cur = {k: (CFG_RE[k].search(src) or [None, '?'])[2] for k in ('cover', 'paper')}
    print(f"当前主题：cover={cur['cover']}  paper={cur['paper']}")
    print("临时预览可在地址后加 ?cover=xxx&paper=yyy")


GALLERY = r'''<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>交互书主题图库</title>
<style>
__THEMES__
*{box-sizing:border-box}
body{margin:0;font-family:"Songti SC","STSong","Noto Serif SC",Georgia,serif;background:#ece8df;color:#2b2622}
header{padding:28px 32px 8px}h1{margin:0;font-size:24px;letter-spacing:.2em}
header p{margin:8px 0 0;color:#6b625a;font-size:14px}
h2{font-size:15px;letter-spacing:.3em;margin:26px 32px 12px;color:#5b524a}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;padding:0 32px}
.card{cursor:pointer;border-radius:10px;padding:12px;background:#f8f6f1;border:2px solid transparent;transition:.2s;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.card:hover{transform:translateY(-3px)}.card.on{border-color:#2b2622;box-shadow:0 8px 22px rgba(0,0,0,.16)}
.card b{display:block;margin-top:10px;font-size:14px}.card small{display:block;color:#7a7066;font-size:12px;margin-top:3px;line-height:1.5}
.card code{font-size:11px;color:#9a8f84}
/* 迷你封面（与 App 封面同一套变量） */
.cv{position:relative;aspect-ratio:3/4.3;border-radius:2px 8px 8px 2px;background:linear-gradient(135deg,var(--cv-bg2),var(--cv-bg));
  border:7px solid var(--cv-edge);box-shadow:0 14px 26px rgba(0,0,0,.35);overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.cv::before{content:"";position:absolute;inset:0;background:var(--cv-texture);opacity:.9}
.cv::after{content:"";position:absolute;left:-7px;top:-7px;bottom:-7px;width:14px;background:var(--cv-spine);box-shadow:2px 0 4px rgba(0,0,0,.3)}
.cv i{position:absolute;inset:8px;border:1px solid color-mix(in srgb,var(--cv-foil) 45%,transparent)}
.cv .k{position:relative;font-size:8px;letter-spacing:.4em;color:var(--cv-soft)}
.cv .t{position:relative;font-size:21px;font-weight:700;color:var(--cv-title);margin:8px 0 4px;letter-spacing:.12em}
.cv .s{position:relative;font-size:11px;font-style:italic;color:var(--cv-foil)}
/* 迷你内页（左页做旧 + 右页书页引擎图版） */
.pp{display:flex;aspect-ratio:2/1.35;border-radius:3px;overflow:hidden;box-shadow:0 10px 22px rgba(0,0,0,.18);background:var(--app-bg);padding:6px}
.pp .l,.pp .r{flex:1;position:relative;padding:10px 9px;font-size:10px;line-height:1.6;color:var(--pp-ink)}
.pp .l{background-color:var(--pp-bg2);background-image:var(--pp-stain),var(--pp-grain);box-shadow:inset 0 0 40px var(--pp-shadow)}
.pp .r{background-color:var(--pp-bg);background-image:var(--pp-grain);box-shadow:inset 0 0 40px var(--pp-shadow);border-left:1px solid rgb(var(--pp-ink-rgb)/.25)}
.pp h4{margin:0 0 4px;font-size:12px;letter-spacing:.1em}.pp em{color:var(--pp-accent);font-style:normal}
.pp .leaf{margin-top:6px;height:46%;background:var(--pp-leaf);border:1px solid rgb(var(--pp-ink-rgb)/.5);position:relative}
.pp .leaf::after{content:"";position:absolute;left:18%;right:18%;bottom:22%;height:38%;border:1.5px solid var(--pp-ink);border-bottom:0;border-radius:50% 50% 0 0}
.pp .slot{display:inline-block;width:12px;height:13px;border:1px dashed rgb(var(--pp-ink-rgb)/.45);margin:5px 2px 0 0}
.pairs{display:flex;flex-wrap:wrap;gap:10px;padding:0 32px}
.pair{cursor:pointer;padding:7px 12px;border-radius:999px;background:#f8f6f1;border:1px solid #d6cfc4;font-size:13px}
.pair:hover{background:#2b2622;color:#f8f6f1}
#bar{position:sticky;bottom:0;margin-top:30px;background:#2b2622;color:#f2ede4;padding:14px 32px;display:flex;gap:20px;align-items:center;flex-wrap:wrap}
#bar .prev{display:flex;gap:12px;align-items:center}#bar .cv{width:54px;border-width:4px}#bar .cv .t{font-size:10px}#bar .cv .k,#bar .cv .s{display:none}
#bar .pp{width:120px;padding:3px}#bar .pp .l,#bar .pp .r{font-size:0;padding:4px}
#bar code{background:#141210;padding:8px 12px;border-radius:6px;font-size:13px;user-select:all;color:#e6c46a}
#bar button{background:#e6c46a;border:0;border-radius:6px;padding:8px 14px;cursor:pointer;font-family:inherit}
</style></head><body>
<header><h1>交互书主题图库</h1><p>点选一个「封面」和一个「内页纸张」，底部会生成可直接复制的命令（两者可任意组合）。</p></header>
<h2>推荐搭配</h2><div class="pairs" id="pairs"></div>
<h2>封面 COVER</h2><div class="grid" id="covers"></div>
<h2>内页纸张 PAPER</h2><div class="grid" id="papers"></div>
<div id="bar"><div class="prev"><div class="cv" id="pc"><i></i><div class="t">书名</div></div>
<div class="pp" id="pq"><div class="l"></div><div class="r"></div></div></div>
<div><div id="sel" style="font-size:13px;margin-bottom:6px"></div><code id="cmd"></code></div><button id="copy">复制命令</button></div>
<script>
const META=__META__, PAIRS=__PAIRS__;
let cover=PAIRS[0][0], paper=PAIRS[0][1];
const $=s=>document.querySelector(s);
const cvHTML=t=>`<div class="cv" data-cover="${t.id}"><i></i><div class="k">A BOOK OF</div><div class="t">书 名</div><div class="s">${t.name}</div></div>`;
const ppHTML=t=>`<div class="pp" data-paper="${t.id}"><div class="l"><h4>第一章</h4>雨下了四年十一个月零两天。<em>朱批</em></div><div class="r"><div class="leaf"></div><span class="slot"></span><span class="slot"></span><span class="slot"></span></div></div>`;
$('#covers').innerHTML=META.cover.map(t=>`<div class="card" data-c="${t.id}">${cvHTML(t)}<b>${t.name}</b><small>${t.desc}</small><code>${t.id}</code></div>`).join('');
$('#papers').innerHTML=META.paper.map(t=>`<div class="card" data-p="${t.id}">${ppHTML(t)}<b>${t.name}</b><small>${t.desc}</small><code>${t.id}</code></div>`).join('');
$('#pairs').innerHTML=PAIRS.map(([c,p,d])=>`<span class="pair" data-c="${c}" data-p="${p}">${c} × ${p} · ${d}</span>`).join('');
const name=(k,id)=>(META[k].find(t=>t.id===id)||{}).name;
function sync(){
  document.querySelectorAll('[data-c]').forEach(e=>e.classList.toggle('on',e.dataset.c===cover&&!e.dataset.p));
  document.querySelectorAll('.card[data-p]').forEach(e=>e.classList.toggle('on',e.dataset.p===paper));
  $('#pc').dataset.cover=cover; $('#pq').dataset.paper=paper;
  $('#sel').textContent=`已选：封面「${name('cover',cover)}」 × 纸张「${name('paper',paper)}」`;
  $('#cmd').textContent=`--cover ${cover} --paper ${paper}`;
}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-c],[data-p]'); if(!el) return;
  if(el.dataset.c) cover=el.dataset.c; if(el.dataset.p) paper=el.dataset.p; sync();
});
$('#copy').onclick=()=>navigator.clipboard&&navigator.clipboard.writeText($('#cmd').textContent).then(()=>{$('#copy').textContent='已复制';setTimeout(()=>$('#copy').textContent='复制命令',1200)});
sync();
</script></body></html>'''


def cmd_gallery(a):
    meta, css = parse(TEMPLATE_CSS)
    out = Path(a.out) if a.out else SKILL / 'theme-gallery.html'
    page = (GALLERY.replace('__THEMES__', css)
            .replace('__META__', json.dumps(meta, ensure_ascii=False))
            .replace('__PAIRS__', json.dumps(PAIRS, ensure_ascii=False)))
    out.write_text(page, encoding='utf-8')
    print(f'已生成主题图库：{out}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('list').set_defaults(fn=cmd_list)
    g = sub.add_parser('gallery'); g.add_argument('--out'); g.set_defaults(fn=cmd_gallery)
    s = sub.add_parser('set'); s.add_argument('book'); s.add_argument('--cover'); s.add_argument('--paper'); s.set_defaults(fn=cmd_set)
    c = sub.add_parser('current'); c.add_argument('book'); c.set_defaults(fn=cmd_current)
    a = ap.parse_args(); a.fn(a)


if __name__ == '__main__':
    main()
