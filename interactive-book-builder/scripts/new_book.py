#!/usr/bin/env python3
"""新建一本交互书（复制模板 + 写入书名/类型/主题/封面/章节数）。

  python3 new_book.py <目标目录> --type puzzle|history --title 书名 [--en "English Title"] [--author 作者]
        [--cover wine] [--paper vellum] [--layout heraldic] [--emblem rose] [--unlock open]
        [--subtitle 副标题] [--kicker 封面小字] [--latin 西文大字] [--era 年代]
        [--chapters 3] [--key mybook] [--install]

  --type     puzzle  解谜书：每章两关（React 小游戏 + 书页引擎），ch1 = 解谜示例
             history 历史图文书：每章若干内页（时间线/卡片/地图/家谱…），ch1、ch2 = 图文示例（覆盖全部交互样式）
  --layout   封面版式 classic（烫金框）/ heraldic（纹章合拢书）/ emblem（徽章手抄本）
  --emblem   封面徽章：rose longship crown lily sun key feather seal boar compass candle
  --unlock   progressive 逐章解锁 / open 全部开放
  不给的项按 --type 取默认（见 DEFAULTS）；交互终端下缺 --cover / --paper 会列出主题让你选。
  --chapters N：生成 ch1..chN；多出来的章是 ch1 的副本（id/标题已改好，内容待重写）。
"""
import argparse, re, shutil, subprocess, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
TEMPLATE = SKILL / 'assets/template'
SAMPLES = SKILL / 'assets/samples'
sys.path.insert(0, str(Path(__file__).parent))
from themes import parse, TEMPLATE_CSS  # noqa: E402
from add_chapter import add_chapter  # noqa: E402

IGNORE = shutil.ignore_patterns('node_modules', 'dist', '.DS_Store', '*.log')
LAYOUTS = ('classic', 'heraldic', 'emblem')
EMBLEMS = ('rose', 'longship', 'crown', 'lily', 'sun', 'key', 'feather', 'seal', 'boar', 'compass', 'candle')

# 按书的类型给默认值（命令行显式给出的优先）
DEFAULTS = {
    'puzzle': dict(cover=None, paper=None, layout='classic', emblem='compass', unlock='progressive',
                   subtitle=('一本可以玩的书', 'A Playable Book'), kicker='Literary Puzzle Book', era='ANNO MCMLXVII'),
    'history': dict(cover='wine', paper='vellum', layout='heraldic', emblem='crown', unlock='open',
                    subtitle=('一部可以翻阅的编年史', 'An Illustrated Chronicle'), kicker='An Illustrated Chronicle', era='ANNO DOMINI'),
}
# 历史图文书的目录 / 引路人文案（解谜书保留模板原文）
HISTORY_TEXT = {
    'prompt': ('轻触封面 · 翻开编年史', 'Touch to Open the Chronicle'),
    'leftKicker': 'Chronicle',
    'lines': [
        ('凡事皆有其时，凡人皆有其名。', 'To every thing a season, to every name a page.'),
        ('把发生过的事写下来，它就不会真正消失。', 'What is written does not wholly vanish.'),
        ('翻开这一页，回到那个年代。', 'Turn the page; return to that age.'),
    ],
    'finalLockNote': ('读完前面每一章后解锁', 'Unlocks after every previous chapter is read'),
    'guide': (('史官', 'The Chronicler'), ('史官的旁注', 'A Note from the Chronicler')),
}


def ask(kind, items):
    print(f'\n选择{"封面" if kind == "cover" else "内页纸张"}：')
    for i, t in enumerate(items, 1):
        print(f"  {i}. {t['id']:<10} {t['name']}  —— {t['desc']}")
    while True:
        v = input('输入编号或 id（回车 = 1）：').strip() or '1'
        if v.isdigit() and 1 <= int(v) <= len(items):
            return items[int(v) - 1]['id']
        if v in [t['id'] for t in items]:
            return v
        print('无效输入')


def sub1(src, pattern, repl, flags=re.M):
    out, n = re.subn(pattern, lambda _m: repl, src, count=1, flags=flags)
    if not n:
        sys.exit(f'模板字段没找到：{pattern}')
    return out


def js(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")


def tt(zh, en=None):
    return f"{{ zh: '{js(zh)}', en: '{js(en or zh)}' }}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('dest')
    ap.add_argument('--type', choices=('puzzle', 'history'), default='puzzle')
    ap.add_argument('--title', required=True)
    ap.add_argument('--en', default='')
    ap.add_argument('--author', default='佚名')
    ap.add_argument('--cover'); ap.add_argument('--paper')
    ap.add_argument('--layout', choices=LAYOUTS)
    ap.add_argument('--emblem', choices=EMBLEMS)
    ap.add_argument('--unlock', choices=('progressive', 'open'))
    ap.add_argument('--subtitle'); ap.add_argument('--kicker'); ap.add_argument('--latin'); ap.add_argument('--era')
    ap.add_argument('--chapters', type=int, default=None, help='章节数（解谜书默认 1，历史书默认 2）')
    ap.add_argument('--key', help='localStorage 前缀（默认由目录名生成）')
    ap.add_argument('--install', action='store_true', help='复制后执行 npm install')
    a = ap.parse_args()
    d = DEFAULTS[a.type]
    history = a.type == 'history'
    for k in ('layout', 'emblem', 'unlock', 'kicker', 'era'):
        if getattr(a, k) is None:
            setattr(a, k, d[k])
    chapters = a.chapters or (2 if history else 1)

    dest = Path(a.dest).resolve()
    if dest.exists() and any(dest.iterdir()):
        sys.exit(f'目标目录非空：{dest}')
    meta, _ = parse(TEMPLATE_CSS)
    for k in ('cover', 'paper'):
        v = getattr(a, k)
        ids = [t['id'] for t in meta[k]]
        if v and v not in ids:
            sys.exit(f'未知 {k}: {v}；可选：{", ".join(ids)}')
        if not v:
            setattr(a, k, ask(k, meta[k]) if sys.stdin.isatty() and not d[k] else (d[k] or ids[0]))

    shutil.copytree(TEMPLATE, dest, ignore=IGNORE, dirs_exist_ok=True)
    key = a.key or (re.sub(r'[^a-z0-9]+', '', dest.name.lower()) or 'ibook')[:16]
    en = a.en or a.title
    sub_zh, sub_en = (a.subtitle, a.subtitle) if a.subtitle else d['subtitle']

    cfg = dest / 'src/book.config.ts'
    s = cfg.read_text(encoding='utf-8')
    one = lambda field, val, ind=2: sub1(s, rf"^ {{{ind}}}{field}: .*?, // \[scaffold\].*$", f"{' ' * ind}{field}: {val}, // [scaffold]")  # noqa: E731
    s = one('storageKey', f"'{key}'")
    s = one('type', f"'{a.type}'")
    s = one('unlock', f"'{a.unlock}'")
    s = one('cover', f"'{a.cover}'")
    s = one('paper', f"'{a.paper}'")
    s = one('coverLayout', f"'{a.layout}'")
    s = one('emblem', f"'{a.emblem}'")
    s = one('title', tt(a.title, en))
    s = one('subtitle', tt(sub_zh, sub_en))
    s = one('author', tt(a.author))
    s = one('kicker', f"'{js(a.kicker)}'", 4)
    s = one('motto', f"'— {js(en.upper())} —'", 4)
    s = one('latin', f"'{js(a.latin or en.upper())}'", 4)
    s = one('era', f"'{js(a.era)}'", 4)
    s = one('leftEra', f"'— {js(a.era)} —'", 4)
    if a.en:
        s = sub1(s, r"^  languages: \[.*?\],", "  languages: ['zh', 'en'],")
    if history:
        h = HISTORY_TEXT
        s = one('prompt', tt(*h['prompt']), 4)
        s = one('leftKicker', f"'{h['leftKicker']}'", 4)
        s = one('finalLockNote', tt(*h['finalLockNote']), 4)
        s = one('name', tt(*h['guide'][0]), 4)
        s = one('title', tt(*h['guide'][1]), 4)
        lines = '\n'.join(f'      {tt(*x)},' for x in h['lines'])
        s = sub1(s, r"^    lines: \[ // \[scaffold\].*?\n    \],", f"    lines: [ // [scaffold]\n{lines}\n    ],", re.M | re.S)
    cfg.write_text(s, encoding='utf-8')

    html = dest / 'index.html'
    t = html.read_text(encoding='utf-8')
    t = re.sub(r'<title>.*?</title>', f'<title>{a.title}</title>', t)
    t = re.sub(r'data-cover="[\w-]+" data-paper="[\w-]+"', f'data-cover="{a.cover}" data-paper="{a.paper}"', t)
    html.write_text(t, encoding='utf-8')
    pkg = dest / 'package.json'
    pkg.write_text(pkg.read_text(encoding='utf-8').replace('"name": "interactive-book"', f'"name": "{key}"'), encoding='utf-8')

    chs = dest / 'src/chapters'
    if history:  # 解谜示例章换成图文示例章（ch1、ch2），并带上示例插图
        shutil.rmtree(chs / 'ch1')
        (dest / 'public/illustrations/ch1.svg').unlink(missing_ok=True)
        hs = SAMPLES / 'history'
        for n in (1, 2):
            if n <= chapters:
                shutil.copytree(hs / f'ch{n}', chs / f'ch{n}', ignore=IGNORE)
        shutil.copytree(hs / 'illustrations', dest / 'public/illustrations', ignore=IGNORE, dirs_exist_ok=True)
    for n in range(3 if history else 2, chapters + 1):
        add_chapter(dest, n, quiet=True)

    print(f'已创建：{dest}\n  类型：{a.type}  书名：{a.title}  封面：{a.cover}/{a.layout}/{a.emblem}  纸张：{a.paper}'
          f'  解锁：{a.unlock}  章节：{chapters}  存档前缀：{key}')
    if a.install:
        subprocess.run(['npm', 'install', '--no-audit', '--no-fund'], cwd=dest, check=True)
    print(f'下一步：cd "{dest}" && {"" if a.install else "npm install && "}npm run dev')


if __name__ == '__main__':
    main()
