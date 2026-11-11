import type { ChapterModule } from '../../types';

// 图文章示例 · 其余交互样式：
// text·columns / feature·split / feature·stack / timeline·seals / timeline·ribbon / cards·accordion / cards·flip
// compare·columns / graph·web / map·journey / quiz·order / text·plain
const IMG = 'illustrations/h-town.svg', MAP = 'illustrations/h-map.svg';

const chapter: ChapterModule = {
  meta: {
    id: 2,
    title: { zh: '潮汐与远航', en: 'Tides and Voyages' },
    subtitle: 'De Navigatione',
    description: { zh: '灯塔点亮之后，灰港的船第一次绕过了岬角。', en: 'After the light was lit, the ships rounded the cape.' },
    image: 'illustrations/h-map.svg',
  },
  pages: [
    {
      kind: 'text', variant: 'columns',
      title: { zh: '出海之前', en: 'Before Sailing' },
      intro: { zh: '正文跨左右两页连续排版。', en: 'Text flows across both pages.' },
      glossary: { '星盘': { zh: '测量星体高度、推算纬度的铜制仪器。', en: 'A brass instrument for latitude.' } },
      text: [
        { zh: '十五世纪初，灰港的船还只敢沿着海岸走。船长们认岸上的山、认教堂尖塔、认灯塔的光，看不见陆地就心里发慌。', en: 'Early ships hugged the coast.' },
        { zh: '改变始于一架从南方换来的星盘。港务书记在账上记下它的价钱：等于三船盐。', en: 'An astrolabe from the south changed that.' },
        { zh: '有了星盘，人们开始在夜里看天。灯塔守护近处，星星守护远处。', en: 'The light guarded the near, the stars the far.' },
        { zh: '第一次绕过岬角的航行用了十九天。船回来时，满城的人站在海墙上，数桅杆上的帆。', en: 'The first voyage round the cape took nineteen days.' },
      ],
    },
    {
      kind: 'feature', variant: 'split',
      title: { zh: '一张海图', en: 'A Sea Chart' },
      image: MAP, caption: { zh: '灰港海湾图（示例）', en: 'Chart of the bay (sample)' },
      text: [
        { zh: '海图上不画国界，只画水深、礁石和避风处。每一次远航回来，书记都会在上面补几笔。', en: 'Charts showed depths and reefs, not borders.' },
        { zh: '左下角的罗盘玫瑰，是灰港制图匠的签名。', en: 'The compass rose was the maker\'s signature.' },
      ],
    },
    {
      kind: 'feature', variant: 'stack',
      title: { zh: '港口的一天', en: 'A Day in the Port' },
      image: IMG,
      text: [
        { zh: '天还没亮，水门就开了。渔船先走，商船随后，最后是去北岭运木材的平底驳船。', en: 'Before dawn the water gate opened.' },
        { zh: '退潮时码头空出一大片滩涂，孩子们在泥里捡贝壳，盐商在岸边收盐。涨潮的钟一响，所有人都往高处走。', en: 'At ebb tide children gathered shells.' },
      ],
    },
    {
      kind: 'timeline', variant: 'seals',
      title: { zh: '三次远航', en: 'Three Voyages' },
      intro: { zh: '按航次分组，点蜡封展开。', en: 'Grouped by voyage; tap a seal.' },
      groups: [
        { id: 'v1', label: { zh: '第一次：绕岬', en: 'Round the cape' }, years: '1421' },
        { id: 'v2', label: { zh: '第二次：北岭', en: 'North ridge' }, years: '1433' },
        { id: 'v3', label: { zh: '第三次：外海', en: 'Open sea' }, years: '1452' },
      ],
      items: [
        { group: 'v1', kicker: '3月', title: { zh: '启航', en: 'Departure' }, text: { zh: '两条船，四十个人，一架星盘。', en: 'Two ships, forty men.' } },
        { group: 'v1', kicker: '4月', title: { zh: '归港', en: 'Return' }, text: { zh: '十九天后返回，带回了岬角另一侧的海图。', en: 'Back after nineteen days.' } },
        { group: 'v2', kicker: '6月', title: { zh: '沿河而上', en: 'Upriver' }, text: { zh: '驳船第一次溯盐河到达北岭脚下。', en: 'Barges reached the ridge.' } },
        { group: 'v2', kicker: '9月', title: { zh: '木材之路', en: 'Timber road' }, text: { zh: '从此造船不再依赖外来木料。', en: 'Local timber for ships.' } },
        { group: 'v3', kicker: '5月', title: { zh: '驶出海湾', en: 'Leaving the bay' }, text: { zh: '林恩带着三条船驶向外海。', en: 'Lynn led three ships out.' } },
        { group: 'v3', kicker: '?', title: { zh: '未归', en: 'Never returned' }, text: { zh: '港务簿上只留下一行：「船名待补」。', en: '"Names to be added."' } },
      ],
    },
    {
      kind: 'timeline', variant: 'ribbon',
      title: { zh: '灯塔的五次重建', en: 'Five Lighthouses' },
      intro: { zh: '横向年轴，点年份切换。', en: 'Tap a year on the ribbon.' },
      items: [
        { kicker: '1352', title: { zh: '木塔', en: 'Wooden tower' }, image: IMG, caption: { zh: '最初的木塔', en: 'The first tower' }, text: { zh: '烧鱼油，光只照得到鸥岛。', en: 'Fish oil; reached Gull Isle.' } },
        { kicker: '1390', title: { zh: '石基', en: 'Stone base' }, image: MAP, text: { zh: '改为石砌底座，加高一倍。', en: 'Doubled in height.' } },
        { kicker: '1417', title: { zh: '被潮水冲毁', en: 'Destroyed' }, text: { zh: '大潮之年只剩下底座。', en: 'Only the base survived.' } },
        { kicker: '1420', title: { zh: '重建', en: 'Rebuilt' }, image: IMG, text: { zh: '城里每户捐出一块石头。', en: 'Every household gave a stone.' } },
        { kicker: '1488', title: { zh: '镜灯', en: 'Mirror lamp' }, text: { zh: '加装铜镜，光能照到外海。', en: 'Brass mirrors reached the open sea.' } },
      ],
    },
    {
      kind: 'cards', variant: 'accordion',
      title: { zh: '船上的东西', en: 'Aboard' },
      intro: { zh: '一条远航船要带什么？点开每一项。', en: 'Tap to expand.' },
      items: [
        { icon: 'compass', title: { zh: '星盘与罗盘', en: 'Astrolabe & compass' }, short: { zh: '导航', en: 'Navigation' }, text: { zh: '星盘夜里用，罗盘雾里用。', en: 'Stars by night, needle in fog.' }, image: MAP },
        { icon: '🛢', title: { zh: '淡水桶', en: 'Water casks' }, short: { zh: '每人每天一升', en: 'A litre a day' }, text: { zh: '水比粮食先用完。', en: 'Water ran out before food.' } },
        { icon: 'seal', title: { zh: '盐', en: 'Salt' }, short: { zh: '货物，也是货币', en: 'Cargo and coin' }, text: { zh: '在外海港口，一袋盐能换一袋香料。', en: 'A sack for a sack of spice.' }, points: [{ zh: '腌鱼', en: 'Curing fish' }, { zh: '交易', en: 'Trade' }] },
        { icon: 'feather', title: { zh: '航海日志', en: 'Logbook' }, short: { zh: '书记随船', en: 'A clerk aboard' }, text: { zh: '每条船都配一名书记，记风向、水深和见闻。', en: 'Wind, depth, and wonders.' } },
      ],
    },
    {
      kind: 'cards', variant: 'flip',
      title: { zh: '水手的迷信', en: 'Sailors\' Lore' },
      intro: { zh: '点卡片翻面。', en: 'Tap to flip.' },
      items: [
        { icon: '🐈', title: { zh: '船猫', en: 'Ship\'s cat' }, kicker: 'I', short: { zh: '船上必须有一只猫，否则老鼠会吃掉海图。', en: 'Or rats eat the charts.' } },
        { icon: '🔔', title: { zh: '不敲钟', en: 'No bells' }, kicker: 'II', short: { zh: '出港时不能敲钟，那是给死者的。', en: 'Bells are for the dead.' } },
        { icon: '🌙', title: { zh: '新月不出海', en: 'No new moon' }, kicker: 'III', short: { zh: '新月夜灯塔之外一片漆黑。', en: 'Too dark beyond the light.' } },
        { icon: '🪶', title: { zh: '海鸥羽毛', en: 'Gull feather' }, kicker: 'IV', short: { zh: '藏在帽子里，能找到回家的路。', en: 'Finds the way home.' } },
      ],
    },
    {
      kind: 'compare', variant: 'columns',
      title: { zh: '两种船', en: 'Two Ships' },
      intro: { zh: '左右两页并排对比。', en: 'Side by side.' },
      eras: [
        { kicker: { zh: '近海', en: 'Coastal' }, title: { zh: '平底驳船', en: 'Flat barge' }, image: IMG, text: { zh: '吃水浅，能在退潮的滩涂上搁浅等潮。', en: 'Shallow draught.' }, points: [{ zh: '船员 6 人', en: 'Crew of 6' }, { zh: '单桅', en: 'One mast' }] },
        { kicker: { zh: '远洋', en: 'Ocean' }, title: { zh: '三桅帆船', en: 'Three-master' }, image: MAP, text: { zh: '龙骨深，必须停在深水码头。', en: 'Deep keel.' }, points: [{ zh: '船员 40 人', en: 'Crew of 40' }, { zh: '三桅', en: 'Three masts' }] },
      ],
    },
    {
      kind: 'graph', variant: 'web',
      title: { zh: '港口的势力', en: 'Powers of the Port' },
      intro: { zh: '谁和谁结盟，谁和谁争执？', en: 'Who allied with whom?' },
      groups: [{ id: 'guild', label: { zh: '行会', en: 'Guilds' } }, { id: 'church', label: { zh: '教会', en: 'Church' } }, { id: 'sea', label: { zh: '海上', en: 'Sea' } }],
      nodes: [
        { id: 'salt', group: 'guild', x: 28, y: 26, title: { zh: '盐商行会', en: 'Salt Guild' }, text: { zh: '掌握城门钥匙。', en: 'Held the keys.' } },
        { id: 'ship', group: 'guild', x: 72, y: 26, title: { zh: '造船行会', en: 'Shipwrights' }, text: { zh: '控制船坞。', en: 'Controlled the docks.' } },
        { id: 'bishop', group: 'church', x: 50, y: 52, icon: '✝', title: { zh: '主教', en: 'Bishop' }, text: { zh: '教堂尖塔也是航标。', en: 'His spire was a beacon.' } },
        { id: 'light', group: 'sea', x: 22, y: 76, title: { zh: '灯塔家族', en: 'Lightkeepers' }, text: { zh: '世袭守塔。', en: 'Hereditary keepers.' } },
        { id: 'capt', group: 'sea', x: 78, y: 76, title: { zh: '船长会', en: 'Captains' }, text: { zh: '远航派。', en: 'For the voyages.' } },
      ],
      links: [
        { a: 'salt', b: 'ship', label: { zh: '争执', en: 'Rivals' }, dashed: true },
        { a: 'salt', b: 'light', label: { zh: '联姻', en: 'Married' } },
        { a: 'ship', b: 'capt', label: { zh: '同盟', en: 'Allies' } },
        { a: 'bishop', b: 'light', label: { zh: '共管航标', en: 'Beacons' } },
        { a: 'bishop', b: 'salt', label: { zh: '什一税', en: 'Tithe' }, dashed: true },
      ],
    },
    {
      kind: 'map', variant: 'journey',
      title: { zh: '第一次绕岬', en: 'Round the Cape' },
      intro: { zh: '用 ‹ › 一站站走完这条航线。', en: 'Step through the route.' },
      image: MAP,
      places: [
        { x: 44, y: 54, kicker: { zh: '第 1 天', en: 'Day 1' }, title: { zh: '灰港启航', en: 'Leave Greyhaven' }, text: { zh: '清晨涨潮时出水门。', en: 'Out at the morning tide.' } },
        { x: 13, y: 44, kicker: { zh: '第 3 天', en: 'Day 3' }, title: { zh: '鸥岛', en: 'Gull Isle' }, text: { zh: '补充淡水。', en: 'Fresh water.' } },
        { x: 10, y: 15, kicker: { zh: '第 8 天', en: 'Day 8' }, title: { zh: '灰海', en: 'Mare Griseum' }, text: { zh: '看不见陆地的五天。', en: 'Five days without land.' } },
        { x: 18, y: 80, kicker: { zh: '第 15 天', en: 'Day 15' }, title: { zh: '礁石屿', en: 'Reef islet' }, text: { zh: '靠星盘绕开了暗礁。', en: 'The astrolabe saved them.' } },
        { x: 44, y: 54, kicker: { zh: '第 19 天', en: 'Day 19' }, title: { zh: '归港', en: 'Home' }, text: { zh: '满城的人站在海墙上数帆。', en: 'The town counted sails.' } },
      ],
    },
    {
      kind: 'quiz', variant: 'order',
      title: { zh: '排一排', en: 'In Order' },
      question: { zh: '把灯塔的历史按时间先后排好。', en: 'Put the lighthouse history in order.' },
      options: [
        { text: { zh: '木塔点亮', en: 'Wooden tower lit' } },
        { text: { zh: '加石砌底座', en: 'Stone base' } },
        { text: { zh: '被大潮冲毁', en: 'Destroyed by the tide' } },
        { text: { zh: '全城捐石重建', en: 'Rebuilt by the town' } },
        { text: { zh: '装上铜镜', en: 'Mirror lamp' } },
      ],
      explain: { zh: '1352 → 1390 → 1417 → 1420 → 1488。', en: '1352 → 1390 → 1417 → 1420 → 1488.' },
    },
    {
      kind: 'text', variant: 'plain',
      title: { zh: '尾声', en: 'Epilogue' },
      quote: { text: { zh: '灯塔守护近处，星星守护远处。', en: 'The light guards the near; the stars, the far.' } },
      text: [
        { zh: '林恩的船再也没有回来。港务簿上那一行「船名待补」，一直空到了今天。', en: 'Lynn\'s ships never returned.' },
        { zh: '但从那以后，灰港的每一条船出港时，守塔人都会把灯多点一刻钟。', en: 'Since then the light burns a quarter-hour longer.' },
      ],
    },
  ],
};
export default chapter;
