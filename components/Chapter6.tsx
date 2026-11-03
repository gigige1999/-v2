import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { registerHint } from '../services/localHints';
import { mountChapter6 } from './chapter6/engine.js';
import './chapter1/chapter1.css';
import './chapter6/chapter6.css';

interface Chapter6Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

type ChapterApi = { destroy: () => void; getHint: () => string; autoSolve: () => void };

// 第六章 2.0：镜子房间 —— 光穿过书页。缝纫室 → 走廊 → 晾衣院，三页连成一条光路
export const Chapter6: React.FC<Chapter6Props> = ({ onComplete, triggerAutoSolve }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ChapterApi | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const api: ChapterApi = mountChapter6(host, { onComplete: () => completeRef.current() });
    apiRef.current = api;
    const unregister = registerHint(6, () => api.getHint());
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

export default Chapter6;
