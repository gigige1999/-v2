// 原版第1章（简单玩法），从 _101book 原样复制，仅改了导入路径与组件名。请勿修改玩法。

import React, { useState, useEffect, useCallback } from 'react';
import { UI_TEXT } from '../../constants';
import { Language } from '../../types';

interface Chapter1Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

interface ItemState {
  filled: boolean;
  fadeTimer: number | null;
  fading: boolean;
}

const ITEMS = [
  { id: 'house', label: 'HOUSE', labelZh: '房子', sketch: (
    <svg viewBox="0 0 100 100" className="w-20 h-20 stroke-stone-800 fill-none" strokeWidth="2">
       <path d="M20 90 L80 90 L80 50 L50 20 L20 50 Z" />
       <path d="M45 90 L45 70 L55 70 L55 90" />
       <path d="M30 60 L40 60 L40 70 L30 70 Z" />
       <path d="M60 60 L70 60 L70 70 L60 70 Z" />
    </svg>
  ) },
  { id: 'cow', label: 'COW', labelZh: '牛', sketch: (
    <svg viewBox="0 0 100 100" className="w-20 h-20 stroke-stone-800 fill-none" strokeWidth="2">
       <path d="M20 70 Q20 40 50 40 Q80 40 80 70 Q80 85 50 85 Q20 85 20 70 Z" />
       <path d="M30 40 L25 30 M70 40 L75 30" />
       <path d="M35 85 L35 95 M65 85 L65 95" />
    </svg>
  ) },
  { id: 'clock', label: 'CLOCK', labelZh: '钟', sketch: (
    <svg viewBox="0 0 100 100" className="w-20 h-20 stroke-stone-800 fill-none" strokeWidth="2">
       <circle cx="50" cy="50" r="35" />
       <path d="M50 50 L50 30" />
       <path d="M50 50 L70 50" />
       <path d="M50 15 L50 20 M85 50 L80 50 M50 85 L50 80 M15 50 L20 50" />
    </svg>
  ) },
  { id: 'tree', label: 'TREE', labelZh: '树', sketch: (
    <svg viewBox="0 0 100 100" className="w-20 h-20 stroke-stone-800 fill-none" strokeWidth="2">
       <path d="M50 90 L50 55" strokeWidth="3" />
       <path d="M50 55 Q30 50 25 35 Q20 15 50 15 Q80 15 75 35 Q70 50 50 55" />
       <path d="M35 55 L30 60 M65 55 L70 60" strokeWidth="1" />
    </svg>
  ) },
  { id: 'sun', label: 'SUN', labelZh: '日', sketch: (
    <svg viewBox="0 0 100 100" className="w-20 h-20 stroke-stone-800 fill-none" strokeWidth="2">
       <circle cx="50" cy="50" r="20" />
       <path d="M50 20 L50 10 M50 80 L50 90 M20 50 L10 50 M80 50 L90 50" />
       <path d="M29 29 L22 22 M71 29 L78 22 M29 71 L22 78 M71 71 L78 78" />
    </svg>
  ) },
  { id: 'river', label: 'RIVER', labelZh: '河', sketch: (
    <svg viewBox="0 0 100 100" className="w-20 h-20 stroke-stone-800 fill-none" strokeWidth="2">
       <path d="M10 30 Q30 20 50 30 Q70 40 90 30" />
       <path d="M10 50 Q30 40 50 50 Q70 60 90 50" />
       <path d="M10 70 Q30 60 50 70 Q70 80 90 70" />
    </svg>
  ) }
];

const FADE_DELAY = 20000; // 20 seconds before a name starts fading
const FADE_DURATION = 5000; // 5 seconds to fully fade

export const Chapter1Classic: React.FC<Chapter1Props> = ({ onComplete, lang, triggerAutoSolve }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(() => {
    const init: Record<string, ItemState> = {};
    ITEMS.forEach(i => { init[i.id] = { filled: false, fadeTimer: null, fading: false }; });
    return init;
  });
  const [currentInput, setCurrentInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [completedOnce, setCompletedOnce] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const t = UI_TEXT[lang];

  // Check completion: all items must be filled simultaneously
  const checkCompletion = useCallback((states: Record<string, ItemState>) => {
    if (ITEMS.every(item => states[item.id].filled)) {
      setDone(true);
      setTimeout(onComplete, 1500);
    }
  }, [onComplete]);

  // Forgetting mechanism - items fade after FADE_DELAY
  useEffect(() => {
    if (done) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    ITEMS.forEach(item => {
      const state = itemStates[item.id];
      if (state.filled && !state.fading) {
        const timer = setTimeout(() => {
          setItemStates(prev => {
            const next = { ...prev, [item.id]: { ...prev[item.id], fading: true } };
            return next;
          });
          // After fade duration, reset to unfilled
          const fadeOut = setTimeout(() => {
            setItemStates(prev => {
              const next = { ...prev, [item.id]: { filled: false, fadeTimer: null, fading: false } };
              return next;
            });
            setFeedback(lang === 'zh' ? `"${item.labelZh}"的记忆正在消逝...` : `The memory of "${item.label}" is fading...`);
            setTimeout(() => setFeedback(""), 2000);
          }, FADE_DURATION);
          timers.push(fadeOut);
        }, FADE_DELAY);
        timers.push(timer);
      }
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [itemStates, done, lang]);

  useEffect(() => {
    if (triggerAutoSolve) {
      const allStates: Record<string, ItemState> = {};
      ITEMS.forEach(i => { allStates[i.id] = { filled: true, fadeTimer: null, fading: false }; });
      setItemStates(allStates);
      setSelectedItem(null);
      setCurrentInput("");
      setDone(true);
      setTimeout(onComplete, 1000);
    }
  }, [triggerAutoSolve, onComplete]);

  const handleCharClick = useCallback((char: string) => {
    if (!selectedItem || done) return;
    const targetLabel = ITEMS.find(i => i.id === selectedItem)?.label || "";
    const nextInput = currentInput + char;
    
    if (targetLabel.startsWith(nextInput)) {
      setCurrentInput(nextInput);
      if (nextInput === targetLabel) {
        setCompletedOnce(prev => new Set(prev).add(selectedItem));
        setItemStates(prev => {
          const next = { ...prev, [selectedItem]: { filled: true, fadeTimer: null, fading: false } };
          checkCompletion(next);
          return next;
        });
        setSelectedItem(null);
        setCurrentInput("");
        setFeedback(t.identifying);
        setTimeout(() => setFeedback(""), 1500);
      }
    } else {
      setFeedback(t.dissolving);
      setCurrentInput("");
      setTimeout(() => setFeedback(""), 1000);
    }
  }, [selectedItem, currentInput, done, t, checkCompletion]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem || done) return;
      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        handleCharClick(char);
      } else if (e.key === 'Backspace') {
        setCurrentInput(prev => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        setSelectedItem(null);
        setCurrentInput("");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, done, handleCharClick]);

  const filledCount = ITEMS.filter(i => itemStates[i.id].filled).length;

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-3 md:p-6 space-y-4 md:space-y-8">
      {/* Warning banner about forgetting */}
      <div className="text-center text-[10px] uppercase tracking-[0.3em] text-amber-900/40 font-serif font-bold">
        {lang === 'zh' 
          ? `⚠ 记忆会消逝 — 已命名的物品会在20秒后遗忘` 
          : `⚠ Memory fades — named items will be forgotten after 20s`}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 w-full max-w-xl">
        {ITEMS.map(item => {
          const state = itemStates[item.id];
          return (
            <div 
              key={item.id}
              onClick={() => !state.filled && !done && (setSelectedItem(item.id), setCurrentInput(""))}
              className={`cursor-pointer transition-all duration-700 p-4 rounded-sm border-2 relative flex flex-col items-center
                ${state.filled && !state.fading ? 'bg-amber-900/5 border-amber-900/20 shadow-sm' : ''}
                ${state.fading ? 'border-red-400/40 bg-red-50/30' : 'border-stone-800/10 hover:border-amber-900/40'}
                ${!state.filled && !state.fading ? 'opacity-40' : ''}
                ${selectedItem === item.id ? 'scale-105 shadow-xl border-amber-900 bg-white ring-4 ring-amber-900/5 !opacity-100' : ''}`}
            >
              <div className={`mb-1 md:mb-3 flex items-center justify-center transition-all duration-1000 scale-75 md:scale-100 ${state.filled ? 'opacity-100' : 'opacity-60 grayscale'} ${state.fading ? 'opacity-30 blur-[2px]' : ''}`}>
                {item.sketch}
              </div>
              <div className={`text-center font-serif tracking-[0.2em] text-sm font-bold text-amber-950/80 uppercase transition-all duration-1000 ${state.fading ? 'opacity-20 blur-sm' : ''}`}>
                {state.filled ? item.label : (selectedItem === item.id ? currentInput.padEnd(item.label.length, '_') : '????')}
              </div>
              {state.filled && !state.fading && <div className="absolute top-1 right-2 text-amber-900 text-xs">✓</div>}
              {state.fading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-red-500/60 text-[9px] uppercase tracking-widest font-bold animate-pulse">
                    {lang === 'zh' ? '遗忘中...' : 'Forgetting...'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-lg bg-[#f2e8cf]/80 p-6 rounded-sm border-2 border-amber-950/20 shadow-2xl relative">
        <div className="absolute inset-2 border border-amber-950/5 pointer-events-none" />
        <p className="text-center italic text-amber-900/60 font-serif mb-4 h-5 text-xs">
          {feedback || (selectedItem 
            ? (lang === 'zh' ? `正在命名: ${ITEMS.find(i=>i.id===selectedItem)?.labelZh} (可用键盘输入)` : `Naming: ${selectedItem} (keyboard supported)`)
            : t.insomniaTitle)}
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char => (
            <button
              key={char}
              onClick={() => handleCharClick(char)}
              disabled={!selectedItem || done}
              className={`w-8 h-8 flex items-center justify-center border transition-all active:scale-95 disabled:opacity-20 font-serif font-bold text-xs
                ${selectedItem ? 'border-amber-950/30 text-amber-950 bg-white shadow-sm hover:bg-amber-900 hover:text-white' : 'border-stone-200 text-stone-300 bg-transparent'}`}
            >
              {char}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {ITEMS.map((item, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${itemStates[item.id].filled ? (itemStates[item.id].fading ? 'bg-red-400 animate-pulse' : 'bg-amber-700') : 'bg-stone-300'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
