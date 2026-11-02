import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { registerHint } from '../services/localHints';
import { mountChapter5 } from './chapter5/engine.js';
import './chapter1/chapter1.css';
import './chapter5/chapter5.css';

interface Chapter5Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

type ChapterApi = { destroy: () => void; getHint: () => string; autoSolve: () => void };

// 第五章 2.0：小金鱼的时间 —— 单一场景：和“昨天的自己”一起拉风箱、压夹子、倒金水
export const Chapter5: React.FC<Chapter5Props> = ({ onComplete, triggerAutoSolve }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ChapterApi | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const api: ChapterApi = mountChapter5(host, { onComplete: () => completeRef.current() });
    apiRef.current = api;
    const unregister = registerHint(5, () => api.getHint());
    return () => {
      unregister();
      api.destroy();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (triggerAutoSolve) apiRef.current?.autoSolve();
  }, [triggerAutoSolve]);

  return <div ref={hostRef} className="h-full w-full" />;
};

export default Chapter5;
