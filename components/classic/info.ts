// 原版（第一关）玩法说明，从 _101book/constants.ts 原样摘出。
// 2.0 调整了章节顺序：1 冰（原 2）、2 雨（原 3）、3 失眠症（原 1），文字不变
export const CLASSIC_INSTRUCTIONS: Record<number, { en: string; zh: string }> = {
  1: {
    en: "First rub the ice block with your finger or mouse to melt it (45%). Then click the alchemical symbols in the correct celestial order: Sun (☉) → Mercury (☿) → Moon (☽) → Saturn (♄). A wrong order resets! There are 6 symbols, only 4 are correct.",
    zh: "先用手指或鼠标摩擦冰块使其融化（45%）。然后按正确的天体顺序点击炼金符号：太阳(☉) → 水星(☿) → 月亮(☽) → 土星(♄)。顺序错误会重置！共有6个符号，只有4个是正确的。"
  },
  2: {
    en: "Catch the falling raindrops by clicking them. Each 3 drops allow you to clear a segment of the manuscript. Reveal all 4 segments of the prophecy to complete.",
    zh: "点击接住落下的雨滴。每积攒3颗雨滴可以清洗一段模糊的手稿文字。揭示全部4段预言即可通关。"
  },
  3: {
    en: "Click an item to select it, then spell its English name with the keyboard or the letters below (HOUSE, COW, CLOCK, TREE, SUN, RIVER). BEWARE: named items are forgotten after 20 seconds! Keep all 6 items named at the same time to complete.",
    zh: "点击物品选中后，用键盘或底部字母拼写英文名称（HOUSE、COW、CLOCK、TREE、SUN、RIVER）。注意：已命名的物品会在20秒后被遗忘！必须同时保持6个物品全部命名才能通关。"
  },
  4: {
    en: "Rotate the name wheels to align ALL names with the central Fate Ray (0°). BEWARE: wheels are interlinked! Rotating one wheel will also rotate another. Inner wheel affects the next, and the outermost loops back to the innermost.",
    zh: "旋转名字轮盘，将所有名字对准中心的命运射线（0°）。注意：轮盘互相牵连！转动一个轮盘会同时影响另一个。内圈影响下一圈，最外圈影响最内圈。"
  },
  5: {
    en: "Watch the glowing sequence of goldfish forge slots, then reproduce it from memory. Each round the sequence gets longer (3→4→5→6). Click the wrong slot and the round restarts. Complete all 4 rounds to break the loop.",
    zh: "观察金鱼铸造槽的发光序列，然后凭记忆重现。每轮序列会变长（3→4→5→6个）。点错则重新观察本轮序列。完成全部4轮即可打破循环。"
  },
  6: {
    en: "Adjust 5 mirrors to guide the light from the bottom-left source to Remedios at the top-center. Each click rotates a mirror 45°. Light travels through correctly aligned mirrors in sequence — align them one by one from the source. The path is shown as a faint guide.",
    zh: "将光线从光源（左下角）引导至蕾梅黛丝（顶部中央），通过调整5面镜子的角度。每次点击旋转45°。光线会依次通过正确对齐的镜子 — 从光源开始逐个调整。路径有淡色引导线提示。"
  },
  7: {
    en: "Select a map fragment, rotate it to 0° with the rotation button, then click the correct grid cell to place it. WARNING: placed fragments FADE and disappear after 12 seconds! You must place all 4 fragments in the correct positions with the correct rotation before any fade away.",
    zh: "选择地图碎片，用旋转按钮将其转到0°，然后点击正确的网格位置放置。注意：放置的碎片会在12秒后开始淡出并消失！你必须在任何碎片消失之前，把4块碎片都以正确的朝向放进正确的格子。"
  }
};
