import React, { useEffect, useRef } from 'react';
import { mountBookPage } from './engine.js';
import './engine.css';
import { BOOK } from '../book.config';
import { tr, type StageProps } from '../types';
import { KEYS, registerHint } from '../services/store';

type Api = { destroy: () => void; getHint: () => string; autoSolve: () => void };

/** 第二关：把章节 spec 挂进右页（原生 DOM 引擎，React 只负责生命周期） */
export const BookPage: React.FC<StageProps & { id: number; spec: Record<string, unknown> }> = ({ id, spec, onComplete, triggerAutoSolve }) => {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const done = useRef(onComplete);
  done.current = onComplete;

  useEffect(() => {
    if (!host.current) return;
    const a: Api = mountBookPage(host.current, spec, {
      onComplete: () => done.current(),
      saveKey: KEYS.chapter(id),
      guide: tr(BOOK.guide.name, 'zh'),
    });
    api.current = a;
    const off = registerHint(id, () => a.getHint());
    return () => { off(); a.destroy(); api.current = null; };
  }, [id, spec]);

  useEffect(() => { if (triggerAutoSolve) api.current?.autoSolve(); }, [triggerAutoSolve]);

  return <div ref={host} className="h-full w-full" />;
};
