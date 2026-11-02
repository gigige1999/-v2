import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { registerHint } from '../services/localHints';
import { mountChapter3 } from './chapter3/engine.js';
import './chapter1/chapter1.css';
import './chapter3/chapter3.css';

interface Chapter3Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

type ChapterApi = { destroy: () => void; getHint: () => string; autoSolve: () => void };

// 第三章 2.0：雨中的羊皮卷 —— 单一场景：引导漏雨冲掉羊皮卷上的霉斑
export const Chapter3: React.FC<Chapter3Props> = ({ onComplete, triggerAutoSolve }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ChapterApi | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const api: ChapterApi = mountChapter3(host, { onComplete: () => completeRef.current() });
    apiRef.current = api;
    const unregister = registerHint(2, () => api.getHint());
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

export default Chapter3;
