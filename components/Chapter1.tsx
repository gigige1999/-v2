import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { registerHint } from '../services/localHints';
import { mountChapter1 } from './chapter1/engine.js';
import './chapter1/chapter1.css';

interface Chapter1Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

type Chapter1Api = { destroy: () => void; getHint: () => string; autoSolve: () => void };

// 第一章 2.0：锈湖式点击解谜，原生引擎挂进右页（场景切换 = 书页翻动）
export const Chapter1: React.FC<Chapter1Props> = ({ onComplete, triggerAutoSolve }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Chapter1Api | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const api: Chapter1Api = mountChapter1(host, { onComplete: () => completeRef.current() });
    apiRef.current = api;
    const unregister = registerHint(3, () => api.getHint());
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

export default Chapter1;
