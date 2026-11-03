import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';
import { registerHint } from '../services/localHints';
import { mountChapter7 } from './chapter7/engine.js';
import { VanishFinale } from './chapter7/VanishFinale';
import './chapter1/chapter1.css';
import './chapter7/chapter7.css';

interface Chapter7Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

type ChapterApi = { destroy: () => void; getHint: () => string; autoSolve: () => void };

// 第七章 2.0：消逝的地图 —— 一笔读完马孔多（走过的地方被飓风抹去）。
// 整章（第二关）通关后，才播放「马孔多已从地图上消失」终幕。
export const Chapter7: React.FC<Chapter7Props> = ({ onComplete, lang, triggerAutoSolve }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ChapterApi | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const [finale, setFinale] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const api: ChapterApi = mountChapter7(host, { onComplete: () => setFinale(true) });
    apiRef.current = api;
    const unregister = registerHint(7, () => api.getHint());
    return () => {
      unregister();
      api.destroy();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (triggerAutoSolve) apiRef.current?.autoSolve();
  }, [triggerAutoSolve]);

  return (
    <div className="relative h-full w-full">
      <div ref={hostRef} className="h-full w-full" />
      {finale && <VanishFinale lang={lang} onDone={() => completeRef.current()} />}
    </div>
  );
};

export default Chapter7;
