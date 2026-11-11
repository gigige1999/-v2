/* =========================================================
   第二章 · 第二关（书页引擎）—— 示例：书房之夜
   解谜链：拿火柴盒 + 抽屉里的火柴 → 组合成燃着的火柴 → 点蜡烛 → 读信
          → 窗外三组星（2·7·4）→ 拨箱子密码 → 取钥匙 → 开门（通关）
   覆盖引擎的全部常用能力：拾取 / 组合 / 对物使用 / 特写翻页 / 文字页 / 笔记本 / 密码 / 两级提示 / 自动通关
   ========================================================= */
import { ART } from './art.js';

const CODE = [2, 7, 4];

export default {
  kicker: { tag: 'CAP. 2', text: 'La noche del estudio' },
  pips: [{ when: 'candleLit', label: '烛' }, { when: 'chestOpen', label: '匣' }, { when: 'finished', label: '门' }],

  state: () => ({ candleLit: false, chestOpen: false, dials: [0, 0, 0], letterRead: false }),
  notes: ['夜里，书房的门从里面锁上了。'],

  items: {
    matchbox: { name: '火柴盒', desc: '侧面有一条擦火的砂纸，里面却是空的。', icon: ART.ICONS.matchbox },
    match: { name: '火柴', desc: '只有一根。别浪费。', icon: ART.ICONS.match },
    litMatch: { name: '燃着的火柴', desc: '火苗很小，得快点用上。', icon: ART.ICONS.litMatch },
    key: { name: '铜钥匙', desc: '沉甸甸的，齿痕很深。', icon: ART.ICONS.key },
  },
  recipes: { 'match+matchbox': { out: 'litMatch', msg: '“嚓”——火柴亮了。' } },
  badCombos: {},

  names: { matchbox: '火柴盒', window: '窗', door: '门', candle: '蜡烛', drawer: '抽屉', chest: '箱子', shelf: '书架', match: '火柴', letter: '信', stars: '星星', key: '钥匙' },
  lines: {
    shelf: ['书脊上的字都褪色了。', '最上层少了一本书，留下一道灰印。'],
  },

  scenes: {
    main: { cap: 'Lám. I · El estudio', svg: () => ART.main() },
    drawer: { cap: 'Lám. II · El cajón', intro: '抽屉里很乱。', svg: () => ART.drawer() },
    window: { cap: 'Lám. III · Las estrellas', intro: '窗外的星星，三三两两地聚在一起。', svg: () => ART.window() },
    chest: { cap: 'Lám. IV · El cofre', intro: '箱子上有三枚可以拨动的数字转轮。', svg: S => ART.chest(S) },
  },
  sheets: {
    letter: {
      cap: 'Carta', html: () => `
        <div class="bk-sh-k">UNA CARTA</div><div class="bk-sh-h">一封信</div>
        <div class="bk-lined">
          <p>如果你读到这封信，说明你已经点亮了蜡烛。</p>
          <p>箱子的密码，<em>就写在窗外的星星里</em>——从左往右，数一数每一组有几颗。</p>
          <p>钥匙在箱子里。门，就交给你了。</p>
        </div>
        <div class="bk-sign">—— 一位旧友</div>
        <button class="bk-btn" type="button" data-act="letterDone">记 下 了</button>`,
    },
  },

  /** 点击热区 / data-act 按钮 */
  act(id, g, pt) {
    const S = g.S;
    switch (id) {
      case 'matchbox': return g.take('matchbox', pt, '一只红色的火柴盒，晃一晃——空的。');
      case 'shelf': return g.narr(g.cycle('shelf'));
      case 'window': return g.open('window');
      case 'drawer': return g.open('drawer');
      case 'chest': return g.open('chest');
      case 'candle': return g.narr(S.candleLit ? '烛光让书房暖了起来。' : '一截蜡烛。屋里太黑了，什么都看不清。');
      case 'door': return g.narr('门锁着。锁孔是铜的。');
      case 'match': return g.take('match', pt, '抽屉角落里，躺着一根火柴。');
      case 'letter':
        if (!S.candleLit) return g.narr('一封信。太暗了，看不清上面的字。');
        return g.sheet('letter');
      case 'letterDone':
        if (!S.letterRead) { S.letterRead = true; g.addNote('信：箱子的密码写在窗外的星星里——从左往右数每组几颗。'); g.Snd.fx.write(); }
        return g.back();
      case 'stars':
        if (S.letterRead) g.addNote('窗外的星星：左边一组、中间一组、右边一组。');
        return g.narr('星星分成了三组。你一颗一颗地数着……');
      case 'dial0': case 'dial1': case 'dial2': {
        if (S.chestOpen) return true;
        const i = +id.slice(-1);
        S.dials[i] = (S.dials[i] + 1) % 10; g.Snd.fx.roll();
        const t = g.$('#ch2-d' + i); if (t) { t.textContent = S.dials[i]; t.classList.remove('bk-roll'); void t.getBoundingClientRect(); t.classList.add('bk-roll'); }
        g.save();
        if (S.dials.every((v, k) => v === CODE[k])) {
          g.lock(true);
          g.later(() => { S.chestOpen = true; g.addNote('箱子打开了。'); g.apply(); g.Snd.fx.unlock(); g.narr('“咔哒”——箱盖弹开了。'); g.lock(false); }, 400);
        }
        return true;
      }
      case 'key': return g.take('key', pt, '一把铜钥匙。');
    }
  },

  /** 选中物品后点热区（或把物品拖到热区）。返回真值 = 已处理；否则引擎给默认失败旁白 */
  use(item, target, g) {
    const S = g.S;
    if (item === 'litMatch' && target === 'candle') {
      g.removeItem('litMatch'); S.candleLit = true; g.addNote('蜡烛点亮了。'); g.apply(); g.Snd.fx.fire();
      return g.narr('烛芯“噗”地亮了。黑暗退到了墙角——抽屉里那封信，现在能看清了。');
    }
    if (item === 'match' && target === 'candle') return g.fail('得先把火柴点着。');
    if (item === 'litMatch') return g.fail('火苗在指尖晃了晃。别浪费，它该去点亮什么。');
    if (item === 'key' && target === 'door') { g.removeItem('key'); g.Snd.fx.creak(); return g.finish('钥匙转动。门开了，外面是黎明。'); }
    if (item === 'key') return g.fail('锁孔不是这里。');
    return false;
  },

  /** 两级提示：返回 [key, 方向, 做法]，同一 key 第一次给方向，再点给做法 */
  hint(S, g) {
    if (!S.candleLit) {
      if (!g.has('litMatch')) {
        if (!S.matchboxTaken) return ['box', '先找能点火的东西。', '书架上有一只红色火柴盒，点它拿走。'];
        if (!S.matchTaken) return ['match', '火柴盒是空的，火柴在别处。', '点书桌中间的抽屉，拿走里面的火柴。'];
        return ['strike', '火柴要在盒子上擦。', '在物品栏里先点火柴，再点火柴盒，把它们组合。'];
      }
      return ['light', '屋里太黑了。', '选中燃着的火柴，点桌上的蜡烛。'];
    }
    if (!S.letterRead) return ['letter', '抽屉里那封信，现在能看清了。', '打开抽屉，点那封信读一读。'];
    if (!S.chestOpen) return ['code', '“密码写在窗外的星星里。”', '窗外三组星从左到右是 2·7·4：打开箱子，把三个转轮拨到 2、7、4。'];
    if (!S.keyTaken) return ['key', '箱子开了。', '在箱子特写里点钥匙拿走。'];
    return ['door', '门锁着。', '选中钥匙，点右边的门。'];
  },

  /** 自动通关：把状态改到“通关前一刻”，引擎随后调用 finale/finish */
  solve(S) {
    Object.assign(S, { matchboxTaken: true, matchTaken: true, candleLit: true, letterRead: true, chestOpen: true, keyTaken: true, dials: [...CODE], inv: [] });
  },
  finale: g => g.finish('门开了，外面是黎明。'),

  intro: '夜很深。书房里只剩一截没点着的蜡烛——门，从里面锁上了。',
};
