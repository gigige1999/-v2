import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { registerHint } from '../services/localHints';
import { mountChapter2 } from './chapter2/engine.js';
import './chapter1/chapter1.css';
import './chapter2/chapter2.css';

interface Chapter2Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

type ChapterApi = { destroy: () => void; getHint: () => string; autoSolve: () => void };

// 第二章 2.0：冰的炼金术 —— 与第一章同一套书页框架（场景切换 = 翻页）
export const Chapter2: React.FC<Chapter2Props> = ({ onComplete, triggerAutoSolve }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ChapterApi | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const api: ChapterApi = mountChapter2(host, { onComplete: () => completeRef.current() });
    apiRef.current = api;
    const unregister = registerHint(1, () => api.getHint());
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

export default Chapter2;
