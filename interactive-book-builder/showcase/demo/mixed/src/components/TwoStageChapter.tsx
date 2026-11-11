import React, { useCallback, useEffect, useRef, useState } from 'react';
import { tr, type ChapterModule, type Lang } from '../types';
import { KEYS, registerHint } from '../services/store';
import { BookPage } from '../engine/BookPage';
import { roman } from '../chapters';

type Stage = 'classic' | 'between' | 'advanced';
interface Props {
  ch: ChapterModule;
  isLast: boolean;
  nextIsLast: boolean;
  lang: Lang;
  autoSolveCount: number;
  onStageOneComplete: () => void;   // 通过第一关 → App 解锁下一章
  onComplete: () => void;           // 通过第二关 → App 标记完成、播放过场
}

/** 每章两关：第一关 = React 小游戏（轻、快、教会主题），第二关 = 书页引擎解谜（深、慢、讲故事） */
export const TwoStageChapter: React.FC<Props> = ({ ch, isLast, nextIsLast, lang, autoSolveCount, onStageOneComplete, onComplete }) => {
  const { meta, Classic, spec } = ch;
  const key = KEYS.stage(meta.id);
  const zh = lang === 'zh';
  const [stage, setStage] = useState<Stage>(() => { try { return localStorage.getItem(key) === '2' ? 'advanced' : 'classic'; } catch { return 'classic'; } });
  // 自动通关只作用于当前小关：记下进入本小关时的计数
  const solveBase = useRef(autoSolveCount);
  const countRef = useRef(autoSolveCount); countRef.current = autoSolveCount;
  const doneRef = useRef(onComplete); doneRef.current = onComplete;
  const oneRef = useRef(onStageOneComplete); oneRef.current = onStageOneComplete;

  const classicDone = useCallback(() => {
    solveBase.current = countRef.current;
    oneRef.current();
    setStage(s => (s === 'classic' ? 'between' : s));
  }, []);
  const advancedDone = useCallback(() => doneRef.current(), []);
  const enterAdvanced = () => {
    try { localStorage.setItem(key, '2'); } catch { /* ignore */ }
    solveBase.current = countRef.current;
    setStage('advanced');
  };

  // 第一关 / 过渡页的 ✧ 提示（第二关由引擎自己注册）
  useEffect(() => {
    if (stage === 'advanced') return;
    return registerHint(meta.id, () => stage === 'between'
      ? (zh ? '第一关已完成。点击「翻开下一页」进入第二关。' : 'Stage one is done. Turn the page to enter stage two.')
      : (zh ? '第一关：' : 'Stage one: ') + tr(meta.stage1, lang));
  }, [stage, meta, lang, zh]);

  useEffect(() => {
    if (stage === 'between' && autoSolveCount > solveBase.current) enterAdvanced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSolveCount, stage]);

  const trigger = autoSolveCount > solveBase.current;
  if (stage === 'advanced') return <BookPage id={meta.id} spec={spec} onComplete={advancedDone} lang={lang} triggerAutoSolve={trigger} />;

  const unlockNote = isLast ? null : nextIsLast
    ? (zh ? '最后一章要等前面每一章的两关都通过，才会解锁。' : 'The final chapter unlocks only after every chapter is fully cleared.')
    : (zh ? '下一章已经解锁——也可以先回目录，往下读。' : 'The next chapter is now unlocked.');

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-none flex items-center gap-3 px-6 md:px-10 pt-4 pb-2 text-ink/70 font-serif text-xs tracking-[0.25em] select-none max-md:pr-40 md:pr-52">
        <span className="font-bold text-ink">{zh ? '第一关' : 'STAGE I'}</span>
        <span className="h-px w-6 bg-ink/40" />
        <span className="opacity-50">{zh ? '第二关' : 'STAGE II'}</span>
      </div>
      {stage === 'classic' ? (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <Classic onComplete={classicDone} lang={lang} triggerAutoSolve={trigger} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center p-8 page-turn-in">
          <div className="text-center text-ink max-w-sm space-y-6">
            <div className="font-serif italic tracking-[0.35em] text-xs opacity-60">CAP. {meta.roman || roman(meta.id)} · {zh ? '第一关完成' : 'STAGE I COMPLETE'}</div>
            <div className="h-px w-24 mx-auto bg-ink/30" />
            <p className="font-serif text-lg md:text-xl leading-relaxed">
              {zh ? '这一页写完了。可故事还没有结束——书页背后，还藏着另一道谜。' : 'This page is written. But another riddle waits behind it.'}
            </p>
            <button onClick={enterAdvanced} className="px-8 py-3 bg-ink text-paper font-serif tracking-[0.3em] text-sm hover:bg-accent active:scale-95 transition-all shadow-lg">
              {zh ? '翻开下一页 · 第二关' : 'Turn the page · Stage II'}
            </button>
            {unlockNote && <p className="font-serif italic text-xs tracking-wider opacity-60">{unlockNote}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
