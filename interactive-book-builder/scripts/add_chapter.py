#!/usr/bin/env python3
"""给已有的书加一章：复制一个示例章 → src/chapters/chN，并改好 id / 存档前缀 / CSS 前缀 / 标题占位。

  python3 add_chapter.py <书目录> [N] [--kind same|puzzle|paged]

  N 缺省 = 现有最大章号 + 1
  --kind same    复制本书的 ch1（默认；解谜书得到解谜章，历史书得到图文章）
         puzzle  复制模板的解谜示例章（Classic + spec + art，两关）
         paged   复制图文示例章（pages：text/feature/timeline/cards/compare/graph/map/quiz）
  同一本书可以混用两种章节。新章可直接运行，之后按 references/chapter-recipe.md（解谜）或 references/blocks.md（图文）重写。
"""
import argparse, re, shutil, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
SOURCES = {
    'puzzle': SKILL / 'assets/template/src/chapters/ch1',
    'paged': SKILL / 'assets/samples/history/ch1',
}
CN = '零一二三四五六七八九十'


def cn(n):
    return CN[n] if n <= 10 else (f'十{CN[n - 10]}' if n < 20 else str(n))


def add_chapter(book, n=None, quiet=False, kind='same'):
    chs = book / 'src/chapters'
    src = chs / 'ch1' if kind == 'same' else SOURCES[kind]
    if not src.exists():
        sys.exit(f'找不到 {src}')
    if n is None:
        nums = [int(p.name[2:]) for p in chs.iterdir() if re.fullmatch(r'ch\d+', p.name)]
        n = max(nums, default=0) + 1
    dst = chs / f'ch{n}'
    if dst.exists():
        sys.exit(f'已存在：{dst}')
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns('.DS_Store'))
    paged = not (dst / 'spec.js').exists()
    for f in dst.iterdir():
        if f.suffix not in ('.ts', '.tsx', '.js', '.css'):
            continue
        s = f.read_text(encoding='utf-8')
        s = s.replace('ch1-', f'ch{n}-').replace('第一章', f'第{cn(n)}章')
        if f.name == 'index.ts':
            s = re.sub(r'id: \d+,', f'id: {n},', s, count=1)
            s = re.sub(r"title: \{ zh: '.*?', en: '.*?' \}", f"title: {{ zh: '第{cn(n)}章（待命名）', en: 'Chapter {n}' }}", s, count=1)
            s = s.replace("image: 'illustrations/ch1.svg'", f"image: 'illustrations/ch{n}.svg'")
        if f.name == 'spec.js':
            s = s.replace("tag: 'CAP. I'", f"tag: 'CAP. {n}'")
        f.write_text(s, encoding='utf-8')
    ill = book / 'public/illustrations'
    ill.mkdir(parents=True, exist_ok=True)
    if paged:  # 图文示例用到的插图
        for p in (SKILL / 'assets/samples/history/illustrations').iterdir():
            if not (ill / p.name).exists():
                shutil.copy(p, ill / p.name)
    else:
        first = ill / 'ch1.svg'
        if not first.exists():
            first = SKILL / 'assets/template/public/illustrations/ch1.svg'
        if not (ill / f'ch{n}.svg').exists():
            shutil.copy(first, ill / f'ch{n}.svg')
    if not quiet:
        print(f'已添加：{dst}（{"图文章" if paged else "解谜章"}）')
    return dst


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('book'); ap.add_argument('n', nargs='?', type=int)
    ap.add_argument('--kind', choices=('same', 'puzzle', 'paged'), default='same')
    a = ap.parse_args()
    add_chapter(Path(a.book).resolve(), a.n, kind=a.kind)
