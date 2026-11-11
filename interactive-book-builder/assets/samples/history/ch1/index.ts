import type { ChapterModule } from '../../types';

// 图文章示例（虚构的港城「灰港」）：每页 = { kind, variant, title, ... }，组件与字段见 references/blocks.md
// 本章演示：text·dropcap / feature·hotspot / timeline·rail / cards·grid / compare·tabs / graph·tree / map·pins / quiz·choice
const IMG = 'illustrations/h-town.svg', MAP = 'illustrations/h-map.svg';

const chapter: ChapterModule = {
  meta: {
    id: 1,
    title: { zh: '城与港', en: 'The City and the Harbour' },
    subtitle: 'Urbs et Portus',
    description: { zh: '一座靠潮汐吃饭的城：它怎样筑起城墙、点亮灯塔，又怎样被一个家族握在手里。', en: 'A town that lived by the tide: its walls, its lighthouse, and the house that ruled it.' },
    stage2: { zh: '用页脚的 ‹ › 翻页。左页点选条目，右页展开详情；卡住了就点 ✧。', en: 'Turn pages with ‹ ›. Tap entries on the left; details open on the right.' },
    image: 'illustrations/h-town.svg',
  },
  pages: [
    {
      kind: 'text', variant: 'dropcap',
      title: { zh: '潮水之城', en: 'A Town of Tides' },
      intro: { zh: '序言 · 关于这座城的第一件事，是它的水。', en: 'Prologue' },
      image: IMG, caption: { zh: '灰港全景，木刻（示例插图）', en: 'Greyhaven, woodcut (sample)' },
      quote: { text: { zh: '城是海借给人的。', en: 'The sea lends the town to men.' }, source: { zh: '—— 港务簿扉页', en: '— Harbour ledger' } },
      glossary: {
        '潮汐': { zh: '海水每日两涨两落。灰港的城门开闭、市集时辰，全按潮汐表来定。', en: 'Twice-daily rise and fall of the sea.' },
        '港务簿': { zh: '港口官员记录进出船只、货物与税额的账册，是今天研究灰港最重要的史料。', en: 'The harbour ledger.' },
        '盐': { zh: '灰港最早的财富来源。晒盐田就在城墙外的滩涂上。', en: 'The first wealth of Greyhaven.' },
      },
      text: [
        { zh: '灰港最早只是滩涂上几间晒盐的棚屋。人们靠潮汐过日子：涨潮时出海，退潮时收盐。没有人想到这里会长成一座城。', en: 'Greyhaven began as a few salt sheds on the mudflats.' },
        { zh: '第一批石屋出现在山坡上，是为了躲开最高的那几次大潮。后来有了教堂，有了集市，有了把货物和税额一笔笔记下来的港务簿。', en: 'Stone houses climbed the hill to escape the spring tides.' },
        { zh: '盐换来了木材，木材造出了船，船又带回了更多的盐和更远处的消息。三百年后，灰港的旗子出现在了半个海湾的桅杆上。', en: 'Salt bought timber, timber built ships.' },
      ],
    },
    {
      kind: 'feature', variant: 'hotspot',
      title: { zh: '一幅木刻里的城', en: 'The Town in a Woodcut' },
      intro: { zh: '点图上的编号，看每一处地方的故事。', en: 'Tap the numbers on the picture.' },
      image: IMG, caption: { zh: '约 1480 年的城景（示例）', en: 'c. 1480 (sample)' },
      text: [{ zh: '这幅木刻大约刻于十五世纪末，是灰港留存最早的城景图。刻工把城画得比实际更高、更挤，好像整座城都在向海面探出身子。', en: 'The earliest surviving view of the town.' }],
      spots: [
        { x: 50, y: 17, title: { zh: '圣灯大教堂', en: 'Cathedral' }, text: { zh: '尖塔是出海船只的第二座灯塔。钟声在雾天每刻钟敲一次。', en: 'Its spire was a second lighthouse.' } },
        { x: 13, y: 40, title: { zh: '岬角灯塔', en: 'Lighthouse' }, text: { zh: '1352 年建成，烧鲸油。守塔人一家世袭了两百年。', en: 'Built 1352.' } },
        { x: 50, y: 51, title: { zh: '盐市', en: 'Salt Market' }, text: { zh: '每逢退潮开市，潮水回来前必须收摊。', en: 'Opened at every ebb tide.' } },
        { x: 30, y: 58, title: { zh: '海墙', en: 'Sea Wall' }, text: { zh: '城墙一半挡敌人，一半挡海水。', en: 'Half against enemies, half against the sea.' } },
        { x: 28, y: 80, title: { zh: '码头', en: 'Quay' }, text: { zh: '三根石柱码头，是城里最早用石头修的东西。', en: 'The first stone structure in town.' } },
      ],
    },
    {
      kind: 'timeline', variant: 'rail',
      title: { zh: '城的年表', en: 'A Chronology' },
      intro: { zh: '从盐棚到海港，六个关键时刻。', en: 'Six moments from salt sheds to seaport.' },
      items: [
        { kicker: '1104', title: { zh: '盐棚', en: 'Salt sheds' }, text: { zh: '港务簿最早一页记下了十一户晒盐人。', en: 'Eleven salt families.' }, image: IMG },
        { kicker: '1190', title: { zh: '第一座石码头', en: 'First stone quay' }, text: { zh: '为了让大船在退潮时也能靠岸。', en: 'So ships could moor at low tide.' } },
        { kicker: '1268', title: { zh: '城墙合拢', en: 'Walls closed' }, text: { zh: '海墙与陆墙连成一圈，城门按潮汐开闭。', en: 'Gates opened by the tide.' }, points: [{ zh: '城门七座', en: 'Seven gates' }, { zh: '水门两座', en: 'Two water gates' }] },
        { kicker: '1352', title: { zh: '灯塔点亮', en: 'Lighthouse lit' }, text: { zh: '岬角灯塔建成，夜航从此成为可能。', en: 'Night sailing became possible.' } },
        { kicker: '1417', title: { zh: '大潮之年', en: 'The Great Tide' }, text: { zh: '一场风暴潮淹没下城，港务簿缺了整整一年。', en: 'A storm surge drowned the lower town.' }, quote: { text: { zh: '水到了教堂第三级台阶。', en: 'The water reached the third step of the church.' }, source: { zh: '—— 港务簿补记', en: '— Ledger' } } },
        { kicker: '1480', title: { zh: '木刻城景', en: 'The woodcut' }, text: { zh: '最早的城景图刻成，灰港开始出现在别人的地图上。', en: 'Greyhaven appears on other people\'s maps.' } },
      ],
    },
    {
      kind: 'cards', variant: 'grid',
      title: { zh: '城里的人', en: 'Trades of the Town' },
      intro: { zh: '一座港城靠哪些手艺活着？可按类别筛选。', en: 'Filter by category.' },
      cats: [{ id: 'sea', label: { zh: '海上', en: 'Sea' } }, { id: 'land', label: { zh: '岸上', en: 'Shore' } }, { id: 'pen', label: { zh: '纸上', en: 'Paper' } }],
      items: [
        { cat: 'sea', icon: '⚓', title: { zh: '船长', en: 'Captain' }, short: { zh: '按潮汐出海', en: 'Sails by the tide' }, text: { zh: '船长要会读潮汐表、星图和港务簿上的税则。', en: 'Reads tides, stars and tariffs.' } },
        { cat: 'sea', icon: '🐟', title: { zh: '渔夫', en: 'Fisher' }, short: { zh: '凌晨出、日中归', en: 'Out at dawn' }, text: { zh: '渔获在退潮时的鱼市上一次卖完。', en: 'Sold at the ebb market.' } },
        { cat: 'land', icon: 'seal', title: { zh: '盐商', en: 'Salt merchant' }, short: { zh: '城里最早的富人', en: 'The first rich' }, text: { zh: '盐商行会掌握城门钥匙长达百年。', en: 'Held the gate keys for a century.' } },
        { cat: 'land', icon: '🔨', title: { zh: '造船匠', en: 'Shipwright' }, short: { zh: '木材换来的手艺', en: 'Timber into ships' }, text: { zh: '船坞在海墙外侧，退潮时下水。', en: 'Launched at the ebb.' } },
        { cat: 'land', icon: 'candle', title: { zh: '守塔人', en: 'Lightkeeper' }, short: { zh: '世袭两百年', en: 'Hereditary' }, text: { zh: '守塔人一家只在灯塔里过节。', en: 'Celebrated only in the tower.' } },
        { cat: 'pen', icon: 'feather', title: { zh: '港务书记', en: 'Harbour clerk' }, short: { zh: '写下一切', en: 'Writes it all' }, text: { zh: '没有他们，就没有今天的这本书。', en: 'Without them, no history.' } },
      ],
    },
    {
      kind: 'compare', variant: 'tabs',
      title: { zh: '三个时代的港口', en: 'The Port in Three Ages' },
      intro: { zh: '切换不同时期，对照港口的变化。', en: 'Switch periods to compare.' },
      eras: [
        { icon: 'Ⅰ', kicker: { zh: '盐棚期', en: 'Salt age' }, title: { zh: '1100—1250 · 盐棚期', en: '1100–1250' }, image: MAP, text: { zh: '只有滩涂和河口，船靠在泥地上等涨潮。', en: 'Only mudflats and a river mouth.' }, spots: [{ x: 50, y: 43, title: { zh: '河口', en: 'River mouth' }, text: { zh: '最早的停泊处。', en: 'First anchorage.' } }] },
        { icon: 'Ⅱ', kicker: { zh: '城墙期', en: 'Walled' }, title: { zh: '1250—1420 · 城墙期', en: '1250–1420' }, image: IMG, text: { zh: '石码头、城墙和灯塔相继建成，港口第一次有了夜晚。', en: 'Quay, walls and light.' }, spots: [{ x: 13, y: 40, title: { zh: '灯塔', en: 'Lighthouse' }, text: { zh: '1352 年点亮。', en: 'Lit 1352.' } }, { x: 28, y: 80, title: { zh: '石码头', en: 'Quay' }, text: { zh: '退潮也能靠岸。', en: 'Usable at low tide.' } }] },
        { icon: 'Ⅲ', kicker: { zh: '远航期', en: 'Voyages' }, title: { zh: '1420—1600 · 远航期', en: '1420–1600' }, image: MAP, text: { zh: '港口向外扩出两道防波堤，灰港的船开始绕过岬角，驶向外海。', en: 'Breakwaters and open-sea voyages.' }, points: [{ zh: '防波堤两道', en: 'Two breakwaters' }, { zh: '船坞三处', en: 'Three docks' }] },
      ],
    },
    {
      kind: 'graph', variant: 'tree',
      title: { zh: '灯塔家族', en: 'The House of the Light' },
      intro: { zh: '世袭守塔人的家谱。点人物看生平。', en: 'Tap a person.' },
      groups: [{ id: 'keep', label: { zh: '守塔人', en: 'Keeper' } }, { id: 'kin', label: { zh: '亲族', en: 'Kin' } }],
      nodes: [
        { id: 'a', group: 'keep', title: { zh: '老奥斯', en: 'Old Os' }, kicker: '1310—1371', text: { zh: '第一代守塔人，原是渔夫。', en: 'First keeper, once a fisher.' } },
        { id: 'b', parent: 'a', group: 'keep', title: { zh: '马伦', en: 'Maren' }, kicker: '1338—1402', text: { zh: '把灯油从鱼油换成鲸油。', en: 'Switched to whale oil.' } },
        { id: 'c', parent: 'a', group: 'kin', title: { zh: '艾达', en: 'Ada' }, kicker: '1341—1399', text: { zh: '嫁给盐商，家族由此进入行会。', en: 'Married into the salt guild.' } },
        { id: 'd', parent: 'b', group: 'keep', title: { zh: '小奥斯', en: 'Young Os' }, kicker: '1366—1417', text: { zh: '死于大潮之年，守灯到最后一夜。', en: 'Died in the Great Tide.' } },
        { id: 'e', parent: 'b', group: 'kin', title: { zh: '林恩', en: 'Lynn' }, kicker: '1370—1430', text: { zh: '离开灰港去了外海。', en: 'Left for the open sea.' } },
        { id: 'f', parent: 'c', group: 'kin', title: { zh: '托马', en: 'Toma' }, kicker: '1368—1440', text: { zh: '盐商行会会长。', en: 'Head of the salt guild.' } },
      ],
    },
    {
      kind: 'map', variant: 'pins',
      title: { zh: '海湾地图', en: 'Map of the Bay' },
      intro: { zh: '点地图上的地点；上方标签按类别筛选。', en: 'Tap a place; filter above.' },
      image: MAP,
      kinds: [{ id: 'town', label: { zh: '城镇', en: 'Towns' } }, { id: 'sea', label: { zh: '海上', en: 'Sea' } }, { id: 'land', label: { zh: '地貌', en: 'Land' } }],
      places: [
        { x: 44, y: 54, kind: 'town', icon: '★', title: { zh: '灰港', en: 'Greyhaven' }, text: { zh: '海湾里唯一的深水港。', en: 'The only deep harbour.' } },
        { x: 53, y: 40, kind: 'land', title: { zh: '盐河口', en: 'Salt river mouth' }, text: { zh: '城市的起点。', en: 'Where it began.' } },
        { x: 13, y: 44, kind: 'sea', title: { zh: '鸥岛', en: 'Gull Isle' }, text: { zh: '渔夫的避风处。', en: 'Fishers\' shelter.' } },
        { x: 18, y: 80, kind: 'sea', title: { zh: '礁石屿', en: 'Reef islet' }, text: { zh: '无数船在这里沉没。', en: 'Graveyard of ships.' } },
        { x: 82, y: 9, kind: 'land', title: { zh: '北岭', en: 'North ridge' }, text: { zh: '造船木材的来源。', en: 'Source of timber.' } },
        { x: 84, y: 51, kind: 'town', title: { zh: '内陆集镇', en: 'Inland market' }, text: { zh: '盐从这里换成粮食。', en: 'Salt traded for grain.' } },
      ],
    },
    {
      kind: 'quiz', variant: 'choice',
      title: { zh: '小测', en: 'A Question' },
      question: { zh: '灰港的城门按什么来开闭？', en: 'What decided when the gates opened?' },
      image: IMG,
      options: [
        { text: { zh: '教堂的钟声', en: 'Church bells' }, why: { zh: '钟声只在雾天报时。', en: 'Bells rang only in fog.' } },
        { text: { zh: '潮汐表', en: 'The tide table' }, ok: true },
        { text: { zh: '日出日落', en: 'Sunrise and sunset' }, why: { zh: '港城的作息跟着水，而不是太阳。', en: 'The town followed water, not sun.' } },
      ],
      explain: { zh: '城门、市集、出海，全部按潮汐表安排——这正是"潮水之城"的由来。', en: 'Everything followed the tide table.' },
    },
  ],
};
export default chapter;
