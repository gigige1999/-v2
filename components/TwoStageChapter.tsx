import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { registerHint, chapterStageKey } from '../services/localHints';
import { CLASSIC_INSTRUCTIONS } from './classic/info';

type StageProps = { onComplete: () => void; lang: Language; triggerAutoSolve?: boolean };
type Stage = 'classic' | 'between' | 'advanced';

interface Props {
  id: number;
  Classic: React.FC<StageProps>;
  Advanced: React.FC<StageProps>;
  onComplete: () => void;
  /** 通过第一关时调用（用于解锁下一章） */
  onStageOneComplete?: () => void;
  /** 最后一章的编号：它需要前面每一章两关都通过才会解锁 */
  lastId?: number;
  lang: Language;
  autoSolveCount: number;
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// 每章两个小关卡：第一关 = 原版简单玩法（不改动），通过后进入第二关 = 2.0 新玩法
export const TwoStageChapter: React.FC<Props> = ({ id, Classic, Advanced, onComplete, onStageOneComplete, lastId = 7, lang, autoSolveCount }) => {
  const key = chapterStageKey(id);
  const [stage, setStage] = useState<Stage>(() => {
    try { return localStorage.getItem(key) === '2' ? 'advanced' : 'classic'; } catch { return 'classic'; }
  });
  // 自动通关只作用于当前小关：记下进入本小关时的计数
  const solveBase = useRef(autoSolveCount);
  const countRef = useRef(autoSolveCount);
  countRef.current = autoSolveCount;
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const stageOneRef = useRef(onStageOneComplete);
  stageOneRef.current = onStageOneComplete;
  const zh = lang === 'zh';

  const classicDone = useCallback(() => {
    solveBase.current = countRef.current;
    stageOneRef.current?.();
    setStage(s => (s === 'classic' ? 'between' : s));
  }, []);

  const unlockNote = id >= lastId ? null
    : id + 1 === lastId
      ? (zh ? '最后一章要等前面每一章的两关都通过，才会解锁。' : 'The final chapter unlocks only after both stages of every chapter are cleared.')
      : (zh ? '下一章已经解锁——也可以先回目录，往下读。' : 'The next chapter is now unlocked — you may also return to the index and read on.');
  const advancedDone = useCallback(() => completeRef.current(), []);

  const enterAdvanced = () => {
    try { localStorage.setItem(key, '2'); } catch { /* ignore */ }
    solveBase.current = autoSolveCount;
    setStage('advanced');
  };

  // 第一关 / 过渡页的 ✧ 提示（第二关由新引擎自己注册）
  useEffect(() => {
    if (stage === 'advanced') return;
    return registerHint(id, () => stage === 'between'
      ? (zh ? '第一关已完成。点击「翻开下一页」进入第二关。' : 'Stage one is done. Click "Turn the page" to enter stage two.')
      : (zh ? '第一关：' : 'Stage one: ') + CLASSIC_INSTRUCTIONS[id][lang]);
  }, [stage, id, lang, zh]);

  // 在过渡页点“自动完成”，直接进入第二关
  useEffect(() => {
    if (stage === 'between' && autoSolveCount > solveBase.current) enterAdvanced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSolveCount, stage]);

  const trigger = autoSolveCount > solveBase.current;

  if (stage === 'advanced') {
    return <div className="h-full w-full"><Advanced onComplete={advancedDone} lang={lang} triggerAutoSolve={trigger} /></div>;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-none flex items-center gap-3 px-6 md:px-10 pt-4 pb-2 text-amber-950/70 font-serif text-xs tracking-[0.25em] select-none max-md:pr-40 md:pr-52">
        <span className="font-bold text-amber-950">{zh ? '第一关' : 'STAGE I'}</span>
        <span className="h-px w-6 bg-amber-950/40" />
        <span className="opacity-50">{zh ? '第二关' : 'STAGE II'}</span>
      </div>
      {stage === 'classic' ? (
        <div className="flex-1 min-h-0 deckle-edge overflow-y-auto custom-scrollbar">
          <Classic onComplete={classicDone} lang={lang} triggerAutoSolve={trigger} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center p-8 page-turn-in">
          <div className="text-center text-amber-950 max-w-sm space-y-6">
            <div className="font-serif italic tracking-[0.35em] text-xs opacity-60">CAP. {ROMAN[id]} · {zh ? '第一关完成' : 'STAGE I COMPLETE'}</div>
            <div className="h-px w-24 mx-auto bg-amber-950/30" />
            <p className="font-serif text-lg md:text-xl leading-relaxed">
              {zh ? '这一页写完了。可故事还没有结束——书页背后，还藏着另一道谜。' : 'This page is written. But the story is not over — another riddle waits behind it.'}
            </p>
            <button onClick={enterAdvanced} className="px-8 py-3 border border-amber-950/60 bg-amber-950 text-amber-50 font-serif tracking-[0.3em] text-sm hover:bg-amber-900 active:scale-95 transition-all shadow-lg">
              {zh ? '翻开下一页 · 第二关' : 'Turn the page · Stage II'}
            </button>
            {unlockNote && <p className="font-serif italic text-xs tracking-wider opacity-60">{unlockNote}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoStageChapter;
