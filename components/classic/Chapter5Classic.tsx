// 原版第5章（简单玩法），从 _101book 原样复制，仅改了导入路径与组件名。请勿修改玩法。

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../../types';

interface Chapter5Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

const GoldFishIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full line-art-icon">
    <path d="M20 50 Q40 20 70 40 L90 20 L90 80 L70 60 Q40 80 20 50 Z" />
    <circle cx="35" cy="45" r="3" fill="currentColor" />
    <path d="M45 40 Q55 35 65 45 M45 60 Q55 65 65 55" strokeWidth="0.5" />
  </svg>
);

// Memory sequence patterns - player must remember and reproduce
const PATTERNS = [
  [0, 2, 1],           // Round 1: 3 fish
  [3, 1, 0, 2],        // Round 2: 4 fish
  [2, 0, 3, 1, 4],     // Round 3: 5 fish
  [1, 4, 2, 0, 3, 1],  // Round 4: 6 fish (final)
];

const GRID_SIZE = 5; // 5 positions

export const Chapter5Classic: React.FC<Chapter5Props> = ({ onComplete, lang, triggerAutoSolve }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<'showing' | 'input' | 'success' | 'fail' | 'complete'>('showing');
  const [showIndex, setShowIndex] = useState(-1);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [fishCount, setFishCount] = useState(0);
  const [glowSlot, setGlowSlot] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timeoutRef.current.forEach(t => clearTimeout(t));
    timeoutRef.current = [];
  }, []);

  useEffect(() => {
    if (triggerAutoSolve) {
      setFishCount(17);
      setPhase('complete');
      setTimeout(onComplete, 1500);
    }
  }, [triggerAutoSolve, onComplete]);

  // Show pattern to player
  const showPattern = useCallback(() => {
    if (currentRound >= PATTERNS.length) return;
    setPhase('showing');
    setShowIndex(-1);
    setPlayerInput([]);
    clearTimers();
    
    const pattern = PATTERNS[currentRound];
    pattern.forEach((pos, i) => {
      const t1 = setTimeout(() => setShowIndex(pos), (i + 1) * 800);
      const t2 = setTimeout(() => setShowIndex(-1), (i + 1) * 800 + 500);
      timeoutRef.current.push(t1, t2);
    });
    
    const t3 = setTimeout(() => {
      setPhase('input');
      setShowIndex(-1);
    }, (pattern.length + 1) * 800);
    timeoutRef.current.push(t3);
  }, [currentRound, clearTimers]);

  useEffect(() => {
    if (phase === 'showing' && currentRound < PATTERNS.length) {
      showPattern();
    }
    return clearTimers;
  }, [currentRound, showPattern, clearTimers]);

  // Start first round on mount
  useEffect(() => {
    const t = setTimeout(() => showPattern(), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSlotClick = (slot: number) => {
    if (phase !== 'input') return;
    
    const pattern = PATTERNS[currentRound];
    const nextInput = [...playerInput, slot];
    setPlayerInput(nextInput);
    
    // Flash the slot
    setGlowSlot(slot);
    setTimeout(() => setGlowSlot(null), 300);
    
    // Check if current input matches so far
    const currentIdx = nextInput.length - 1;
    if (nextInput[currentIdx] !== pattern[currentIdx]) {
      // Wrong! Flash red and restart round
      setPhase('fail');
      setTimeout(() => {
        setPlayerInput([]);
        showPattern();
      }, 1200);
      return;
    }
    
    // If complete pattern matched
    if (nextInput.length === pattern.length) {
      const newFishCount = fishCount + pattern.length;
      setFishCount(newFishCount);
      setPhase('success');
      
      if (currentRound >= PATTERNS.length - 1) {
        // All rounds complete!
        setTimeout(() => {
          setPhase('complete');
          setTimeout(onComplete, 2000);
        }, 1500);
      } else {
        // Move to next round
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
        }, 1500);
      }
    }
  };

  const totalFish = PATTERNS.reduce((sum, p) => sum + p.length, 0);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-4 md:p-8 space-y-4 md:space-y-6 select-none">
      <div className="relative w-full max-w-lg vintage-table aspect-video rounded-lg shadow-[0_50px_100px_rgba(0,0,0,0.6)] border-4 md:border-8 border-stone-800 p-3 md:p-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Forge Glow */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${phase === 'showing' ? 'bg-orange-600/10 opacity-100' : 'bg-orange-600/5 opacity-0'}`} />
        <div className="absolute top-0 left-0 w-full h-2 bg-black/20" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-white/5" />

        {/* Phase indicator */}
        <div className="text-center mb-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-400/60 font-bold font-serif">
            {phase === 'showing' && (lang === 'zh' ? '观察铸造序列...' : 'Watch the forging sequence...')}
            {phase === 'input' && (lang === 'zh' ? '重现序列！' : 'Reproduce the sequence!')}
            {phase === 'success' && (lang === 'zh' ? '铸造成功！' : 'Forging successful!')}
            {phase === 'fail' && (lang === 'zh' ? '序列错误，重新观察...' : 'Wrong sequence, watch again...')}
            {phase === 'complete' && (lang === 'zh' ? '循环已打破' : 'The cycle is broken')}
          </div>
          <div className="text-amber-500/40 text-[9px] font-serif mt-1">
            {lang === 'zh' ? `回合 ${currentRound + 1} / ${PATTERNS.length}` : `Round ${currentRound + 1} / ${PATTERNS.length}`}
          </div>
        </div>

        {/* Forge slots */}
        <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
          {[...Array(GRID_SIZE)].map((_, i) => (
            <button
              key={i}
              onClick={() => handleSlotClick(i)}
              disabled={phase !== 'input'}
              className={`w-10 h-10 md:w-14 md:h-14 rounded-lg border-2 transition-all duration-300 flex items-center justify-center relative
                ${showIndex === i ? 'bg-amber-500/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110' : ''}
                ${glowSlot === i ? 'bg-amber-400/30 border-amber-400' : ''}
                ${phase === 'fail' && playerInput[playerInput.length - 1] === i ? 'bg-red-500/30 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}
                ${phase === 'input' ? 'border-amber-900/30 hover:bg-amber-900/10 hover:border-amber-700 cursor-pointer active:scale-90' : 'border-stone-700 cursor-default'}
                ${phase === 'success' ? 'border-green-500/30' : ''}
              `}
            >
              <div className={`w-6 h-6 md:w-8 md:h-8 transition-all ${showIndex === i || glowSlot === i ? 'text-amber-500 drop-shadow-[0_0_8px_#fbbf24]' : 'text-stone-600 opacity-30'}`}>
                <GoldFishIcon />
              </div>
              {/* Show input order */}
              {phase === 'input' && playerInput.includes(i) && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-800 text-amber-100 rounded-full text-[9px] flex items-center justify-center font-bold">
                  {playerInput.indexOf(i) + 1}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Fish collection */}
        <div className="grid grid-cols-6 md:grid-cols-9 gap-1">
          {[...Array(totalFish)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 md:w-6 md:h-6 transition-all duration-700 ${i < fishCount ? 'scale-100 opacity-100 text-amber-500 drop-shadow-[0_0_6px_#fbbf24]' : 'scale-50 opacity-10 text-stone-500'}`}
            >
              <GoldFishIcon />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-amber-900/60 font-serif italic text-sm tracking-wide px-8">
          {lang === 'zh' ? '\u201c他从未想过要把它们卖掉，只是为了在这个循环中活下去。\u201d' : '\u201cHe never intended to sell them, only to survive within this cycle.\u201d'}
        </p>
        <div className="flex items-center justify-center gap-4">
           <div className="h-px w-12 bg-amber-900/20" />
           <div className="text-amber-950 font-bold text-2xl font-serif tabular-nums">
             {fishCount} <span className="text-amber-900/30 font-normal">/</span> {totalFish}
           </div>
           <div className="h-px w-12 bg-amber-900/20" />
        </div>
      </div>
    </div>
  );
};
