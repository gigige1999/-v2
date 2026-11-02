// 本地分级提示注册表：各章节挂载时注册自己的提示函数，App 的 ✧ 按钮优先使用本地提示
type HintFn = () => string;
const registry: Record<number, HintFn> = {};

export const registerHint = (chapterId: number, fn: HintFn) => {
  registry[chapterId] = fn;
  return () => {
    if (registry[chapterId] === fn) delete registry[chapterId];
  };
};

export const getLocalHint = (chapterId: number): string | null => {
  const fn = registry[chapterId];
  return fn ? fn() : null;
};

// 关卡内存档的 key（↺ 重开时清除）
export const chapterSaveKey = (chapterId: number) => `macondo2_ch${chapterId}`;

// 两关制：记录本章是否已通过第一关（原版玩法），值为 '2' 表示进入第二关
export const chapterStageKey = (chapterId: number) => `macondo2_stage${chapterId}`;
