
import { Chapter, ChapterStatus } from './types';

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: { en: "The Alchemy of Ice", zh: "冰的炼金术" },
    subtitle: { en: "The Miracle", zh: "吉普赛人的奇迹" },
    description: { 
      en: "The miracle brought by the Gypsies. Discover the secret hidden within the giant block of ice.", 
      zh: "吉普赛人带来的奇迹。探索隐藏在巨大冰块中的秘密。" 
    },
    instructions: {
      en: "The gypsy fair on the right page. Click people and things; items go into the pockets below — select one, then click where to use it. Drag Melquíades' magnet across the mud and iron things will leap out. Seeing the ice costs 30 reales, touching it 10 more. Rub the frost off the ice — if your hand goes numb, let go and rest. Finally drag the hanging lamp so the light through the ice falls on the white sheet. Stuck? ✧ whispers a hint; ask twice for the answer.",
      zh: "右页是吉普赛人的集市：点击人和物件查看，拾到的东西放进下方纸口袋，选中后点场景使用。按住梅尔基亚德斯的磁铁在泥地上拖动，铁做的东西会自己跳出来。看冰要付 30 里亚尔，摸一下再付 10。按住冰面来回擦去冰霜——手冻僵了就松开歇一歇。最后拖动绳上的油灯，让穿过冰块的光落在后墙的白布上。卡住时点 ✧ 听梅尔基亚德斯的低语，再点一次会给出答案。"
    },
    status: ChapterStatus.UNLOCKED,
  },
  {
    id: 2,
    title: { en: "Parchment in the Rain", zh: "雨中的羊皮卷" },
    subtitle: { en: "The Manuscripts", zh: "漫长的雨季" },
    description: { 
      en: "The long rainy season and the discovery of manuscripts. Recover the lost words.", 
      zh: "漫长的雨季与手稿的发现。找回那些失落的文字。" 
    },
    instructions: {
      en: "Melquíades' room, in the endless rain. The roof leaks onto a tin tray nailed to the wall. Press and drag either end of the tray, the board and the copper sheet to tilt them — the water runs down whichever way they lean. Steer the drops onto the four patches of mould on the parchment to wash them away and read the prophecy. The shutters can be opened: the wind will bend the falling water. Stuck? ✧ whispers a hint; ask twice for the answer.",
      zh: "雨下个不停，梅尔基亚德斯房间的屋顶漏了，水落进墙上的锡盘里。按住锡盘、木板、铜片的一端上下拖，让它们倾斜——水会顺着低的那头流下去。把水引到地上羊皮卷的四块霉斑上，冲掉霉斑，读出预言。左上角的百叶窗可以推开，风会把落下的水吹歪。卡住时点 ✧ 听梅尔基亚德斯的低语，再点一次会给出答案。"
    },
    status: ChapterStatus.LOCKED,
  },
  {
    id: 3,
    title: { en: "The Marking of Insomnia", zh: "失眠症的标记" },
    subtitle: { en: "The Naming", zh: "命名与遗忘" },
    description: { 
      en: "Macondo's early days of naming and forgetting. Help the villagers remember the world.", 
      zh: "马孔多初期的命名与遗忘。帮助村民们重新记住这个世界。" 
    },
    instructions: {
      en: "Explore the Buendía house on the right page. Click things to inspect or take them; items go into the pockets at the bottom. Select an item and click something to use it, or select two items to combine them. Forgotten objects look warped — write their names on a label with an inked quill to restore them (only 4 labels!). Some things open a close-up: the page turns, and '‹' turns it back. Stuck? ✧ gives a whisper, ask twice for the answer.",
      zh: "在右页探索布恩迪亚家的不眠之夜：点击物件查看或拾取，拾到的东西会放进下方的纸口袋。选中物品后点击场景即可使用；先后选中两件物品可以组合。被遗忘的东西会扭曲褪色——用蘸了墨的羽毛笔在标签上写下它的名字，它才会恢复（标签只有 4 张）。部分物件会翻到特写页，点「‹ 翻回」回到上一页。卡住时点 ✧ 听梅尔基亚德斯的低语，再点一次会给出答案。"
    },
    status: ChapterStatus.LOCKED,
  },
  {
    id: 4,
    title: { en: "The Labyrinth of Cycles", zh: "循环的迷宫" },
    subtitle: { en: "The Names", zh: "重复的名字" },
    description: { 
      en: "Repeating names and the wheel of fate. Reconstruct the family tree by aligning the names of the generations.", 
      zh: "重复的名字与命运的轮回。通过对齐世代的名字来重构家族的族谱。" 
    },
    instructions: {
      en: "A ribbon of scrambled characters is wound around Melquíades' wooden spindle. Drag the brass wheel at the left end up and down to make the spindle thicker or thinner. At exactly the right thickness the characters line up into rows along the spindle. Then drag the ribbon up and down to turn it, and rest each of the four rows on the red thread to read it. Stuck? ✧ whispers a hint; ask twice for the answer.",
      zh: "梅尔基亚德斯的木轴上缠着一条写满乱字的羊皮带。上下拖动左端的铜轮，改变木轴粗细；粗细刚好时，字会顺着木轴排成一行行。再上下拖动羊皮带转动木轴，把四行字逐一转到红线上停住读出来。卡住时点 ✧ 听梅尔基亚德斯的低语，再点一次会给出答案。"
    },
    status: ChapterStatus.LOCKED,
  },
  {
    id: 5,
    title: { en: "Time of the Goldfishes", zh: "小金鱼的时间" },
    subtitle: { en: "The Loop", zh: "上校的作坊" },
    description: { 
      en: "Colonel Aureliano's workshop and the loop. Break the cycle of repetition.", 
      zh: "奥雷里亚诺上校的作坊与循环。打破这永无止境的重复。" 
    },
    instructions: {
      en: "The Colonel's workshop. Light the candle on the shelf and a day begins; when it burns out, everything is melted down and the next day starts over. To cast the fish you must pump the bellows (drag the handle up and down until the gold glows), press the clamp down (so the mold is shut) and push the crucible handle up (to pour) — all at the same time, with only one hand. But whatever you did yesterday is repeated exactly today. Work together with your yesterdays. The bars below show when each of yesterday's hands is busy; \"Forget yesterday\" clears them. Stuck? ✧ whispers a hint; ask twice for the answer.",
      zh: "上校的作坊。点亮架子上的蜡烛，一天开始；蜡烛烧完，一切熔回坩埚，第二天从头再来。要铸成小金鱼，得同时做三件事：上下拉风箱把金子烧化、往下压住夹子把鱼模夹紧、往上推坩埚长柄把金水倒进去——可你只有一只手。好在昨天做过的事，今天会原样再做一遍：和昨天、前天的自己一起完成它。下方时间条标着昨天每只手忙碌的时段，弄乱了可以点「忘掉昨天」。卡住时点 ✧ 听梅尔基亚德斯的低语，再点一次会给出答案。"
    },
    status: ChapterStatus.LOCKED,
  },
  {
    id: 6,
    title: { en: "The Room of Mirrors", zh: "镜子房间" },
    subtitle: { en: "The Ascension", zh: "蕾梅黛丝升天" },
    description: { 
      en: "Remedios the Beauty's ascension. Find light in the fragments of memory.", 
      zh: "美人儿蕾梅黛丝的升天。在记忆的碎片中寻找光芒。" 
    },
    instructions: {
      en: "Guide light from the source (bottom-left) to Remedios (top-center) by adjusting 5 mirrors. Each click rotates a mirror 45°. Light travels through correctly aligned mirrors in sequence — align them one by one from the source. The path is shown as a faint guide.",
      zh: "将光线从光源（左下角）引导至蕾梅黛丝（顶部中央），通过调整5面镜子的角度。每次点击旋转45°。光线会依次通过正确对齐的镜子 — 从光源开始逐个调整。路径有淡色引导线提示。"
    },
    status: ChapterStatus.LOCKED,
  },
  {
    id: 7,
    title: { en: "The Vanishing Map", zh: "消逝的地图" },
    subtitle: { en: "The Final Act", zh: "最终的解码" },
    description: { 
      en: "The history of Macondo is coming to an end. Reconstruct the map of the village one last time before it vanishes forever.", 
      zh: "马孔多的历史即将终结。在它永远消失之前，最后一次拼凑出这座村庄的地图。" 
    },
    instructions: {
      en: "Select a map fragment, rotate it to 0° using the rotation button, then click the correct grid cell to place it. WARNING: placed fragments will FADE and disappear after 12 seconds! You must place all 4 fragments in correct positions with correct rotation before any fade away.",
      zh: "选择地图碎片，用旋转按钮将其转到0°，然后点击正确的网格位置放置。注意：放置的碎片会在12秒后逐渐消逝！必须在碎片消失前将全部4块碎片放到正确位置并旋转至正确角度。"
    },
    status: ChapterStatus.LOCKED,
  }
];

// Original excerpts from the novel, unlocked after completing each chapter
export const CHAPTER_EXCERPTS: Record<number, { en: string; zh: string; attribution: { en: string; zh: string } }> = {
  1: {
    en: `"That was when José Arcadio Buendía placed his hand on the ice and held it there for several minutes, his heart swelling with fear and jubilation at the contact with mystery."`,
    zh: `“就在那时，何塞·阿尔卡蒂奥·布恩迪亚把手放在冰上，几分钟内纹丝不动，在与这神秘之物的接触中，他的心充满了恐惧和喜悦。”`,
    attribution: { en: "— Chapter 1", zh: "— 第一章" }
  },
  2: {
    en: `"It rained for four years, eleven months, and two days."`,
    zh: `“雨一直下了四年十一个月零两天。”`,
    attribution: { en: "— Chapter 15", zh: "— 第十五章" }
  },
  3: {
    en: `"The world was so recent that many things lacked names, and in order to indicate them it was necessary to point."`,
    zh: `“世界新生伊始，许多事物还没有名字，提到它们的时候，不得不用手指指点点。”`,
    attribution: { en: "— Chapter 1", zh: "— 第一章" }
  },
  4: {
    en: `"The first of the line is tied to a tree and the last is being eaten by the ants."`,
    zh: `“家族的第一个人被捆在树上，家族的最后一个人正被蚂蚁吃掉。”`,
    attribution: { en: "— Chapter 20", zh: "— 第二十章" }
  },
  5: {
    en: `"Colonel Aureliano Buendía made little gold fishes. Two fishes a day, then he melted them down and started all over again the next day."`,
    zh: `“奥雷里亚诺·布恩迪亚上校制作小金鱼。每天做两条，然后把它们熔掉，第二天再从头开始。”`,
    attribution: { en: "— Chapter 10", zh: "— 第十章" }
  },
  6: {
    en: `"Remedios the Beauty went up to heaven body and soul, and her sheets billowed around her as she ascended."`,
    zh: `“美人儿蕾梅黛丝连灵魂带肉体升上了天空，床单在她周围飘荡着上升。”`,
    attribution: { en: "— Chapter 12", zh: "— 第十二章" }
  },
  7: {
    en: `"Races condemned to one hundred years of solitude did not have a second opportunity on earth."`,
    zh: `“注定经受百年孤独的家族，不会有第二次机会在大地上出现。”`,
    attribution: { en: "— Chapter 20, Final line", zh: "— 第二十章，全书终句" }
  }
};

export const UI_TEXT = {
  en: {
    enterStudio: "Enter Melquíades' Studio",
    returnPages: "Return to Pages",
    selectBookmark: "Select a Bookmark",
    historyWritten: "The history of Macondo is written on these pages.",
    wait: "Wait",
    naming: "Naming the world...",
    identifying: "Identified.",
    dissolving: "The name dissolves...",
    insomniaTitle: "The villagers are losing their memory. Label the world.",
    meltIce: "Melt the giant block of ice",
    largestDiamond: "It is the largest diamond in the world.",
    studioTitle: "Melquíades' Studio",
    studioSub: "Capture a fragment of eternity.",
    applyAlchemy: "Apply Alchemy",
    developing: "Developing...",
    openLens: "Open Lens",
    capture: "Capture",
    another: "Take another",
    revealShadows: "What to reveal in the shadows?",
    instructions: "Instructions",
    autoSolve: "Read the Prophecy (Auto-Solve)",
    close: "Close",
    adminTitle: "Memory Archive Management",
    generateImage: "Generate AI",
    uploadImage: "Upload Local",
    syncImages: "Sync to Book",
    generating: "Working...",
    synced: "Synced!",
    noImage: "No image set.",
    adminSubtitle: "Configure the visual soul of Macondo.",
    finishChapter: "Close the Page",
    concluded: "This chapter has concluded.",
    replayChapter: "Replay Chapter",
    backToIndex: "Back to Index",
    excerptTitle: "From the Manuscripts of Melquíades",
    excerptCollected: "Excerpt Collected",
    viewExcerpts: "View Collected Excerpts",
    closeExcerpts: "Close"
  },
  zh: {
    enterStudio: "进入梅尔基亚德斯的作坊",
    returnPages: "回到书页",
    selectBookmark: "选择一个书签",
    historyWritten: "马孔多的历史就写在这些书页之上。",
    wait: "等待",
    naming: "命名世界...",
    identifying: "已确认。",
    dissolving: "名字正在消融...",
    insomniaTitle: "村民们正在失去记忆。为世界贴上标签。",
    meltIce: "融化巨大的冰块",
    largestDiamond: "这是世界上最大的一颗钻石。",
    studioTitle: "梅尔基亚德斯的作坊",
    studioSub: "捕捉永恒的碎片。",
    applyAlchemy: "施展炼金术",
    developing: "显影中...",
    openLens: "开启镜头",
    capture: "捕捉",
    another: "重新拍摄",
    revealShadows: "在阴影中揭示什么？",
    instructions: "通关指南",
    autoSolve: "阅读预言（自动完成）",
    close: "关闭",
    adminTitle: "记忆档案馆管理",
    generateImage: "AI 生成",
    uploadImage: "本地上传",
    syncImages: "同步到书本",
    generating: "生成中...",
    synced: "已同步！",
    noImage: "尚未设置图片。",
    adminSubtitle: "配置马孔多的视觉灵魂。",
    finishChapter: "合上书页",
    concluded: "此篇章已告一段落。",
    replayChapter: "重新开始本章",
    backToIndex: "返回目录",
    excerptTitle: "梅尔基亚德斯的手稿",
    excerptCollected: "摘录已收集",
    viewExcerpts: "查看已收集的摘录",
    closeExcerpts: "关闭"
  }
};

export const HINT_COOLDOWN_MS = 180000;
