// 原版第4章（简单玩法），从 _101book 原样复制，仅改了导入路径与组件名。请勿修改玩法。

import React, { useState, useEffect } from 'react';
import { Language } from '../../types';

interface Chapter4Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

const LINEAGE = [
  { id: 'aureliano', name: 'AURELIANO', color: '#78350f' },
  { id: 'arcadio', name: 'JOSÉ ARCADIO', color: '#1e3a8a' },
  { id: 'ursula', name: 'ÚRSULA', color: '#9d174d' },
  { id: 'amaranta', name: 'AMARANTA', color: '#065f46' }
];

// Target angles for each wheel (all must reach 0° to align with Fate Ray)
const TARGET = [0, 0, 0, 0];

// Interlock rules: rotating wheel i affects other wheels
// wheel 0 (innermost): rotating it also rotates wheel 1 by +22.5°
// wheel 1: rotating it also rotates wheel 2 by -22.5°
// wheel 2: rotating it also rotates wheel 3 by +45°
// wheel 3 (outermost): rotating it also rotates wheel 0 by -22.5°
const INTERLOCK: Record<number, { target: number; delta: number }[]> = {
  0: [{ target: 1, delta: 22.5 }],
  1: [{ target: 2, delta: -22.5 }],
  2: [{ target: 3, delta: 45 }],
  3: [{ target: 0, delta: -22.5 }],
};

const normalizeAngle = (a: number): number => {
  let r = a % 360;
  if (r < 0) r += 360;
  // Round to nearest 0.5 to avoid floating point drift
  return Math.round(r * 2) / 2;
};

export const Chapter4Classic: React.FC<Chapter4Props> = ({ onComplete, lang, triggerAutoSolve }) => {
  const [angles, setAngles] = useState<number[]>([90, 180, 270, 135]);
  const [placed, setPlaced] = useState<boolean[]>([false, false, false, false]);
  const [lastRotated, setLastRotated] = useState<number | null>(null);

  useEffect(() => {
    if (triggerAutoSolve) {
      setAngles([0, 0, 0, 0]);
      setPlaced([true, true, true, true]);
      setTimeout(onComplete, 2000);
    }
  }, [triggerAutoSolve, onComplete]);

  const rotate = (index: number) => {
    if (placed.every(v => v)) return;
    
    setLastRotated(index);
    setAngles(prev => {
      const next = [...prev];
      // Rotate clicked wheel by 45°
      next[index] = normalizeAngle(next[index] + 45);
      
      // Apply interlock effects
      const effects = INTERLOCK[index] || [];
      for (const effect of effects) {
        next[effect.target] = normalizeAngle(next[effect.target] + effect.delta);
      }
      
      // Check if all wheels are at 0°
      const allAligned = next.every(a => a === 0 || a === 360);
      if (allAligned) {
        const allPlaced = [true, true, true, true];
        setPlaced(allPlaced);
        setTimeout(onComplete, 2500);
      }
      
      return next;
    });
  };

  const allDone = placed.every(v => v);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-4 md:p-8 space-y-4 md:space-y-8 select-none">
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
        {/* Ornate Background Geometry */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-900 fill-none" strokeWidth="0.1">
              {[...Array(24)].map((_, i) => (
                <line key={i} x1="50" y1="50" x2={50 + 50 * Math.cos(i * Math.PI / 12)} y2={50 + 50 * Math.sin(i * Math.PI / 12)} />
              ))}
              <circle cx="50" cy="50" r="10" />
              <circle cx="50" cy="50" r="20" />
              <circle cx="50" cy="50" r="30" />
              <circle cx="50" cy="50" r="40" />
           </svg>
        </div>

        {/* Vertical Fate Line */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-600/60 via-amber-600/40 to-amber-600/60 left-1/2 -translate-x-1/2 z-0 shadow-[0_0_15px_rgba(217,119,6,0.3)]" />

        {/* Ornate Hub Marker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
           <div className="w-4 h-4 rounded-full bg-amber-900 shadow-lg" />
           <div className="text-[10px] font-bold text-amber-900/60 font-serif tracking-widest mt-1">FATE</div>
        </div>

        {/* Rotating Wheels */}
        {LINEAGE.map((person, i) => {
          const isAligned = angles[i] === 0 || angles[i] === 360;
          return (
            <div 
              key={person.id}
              onClick={() => rotate(i)}
              className={`absolute rounded-full border transition-all duration-700 cursor-pointer flex items-center justify-center
                ${isAligned ? 'border-amber-900/80 bg-amber-900/5 shadow-2xl' : 'border-stone-400 hover:border-amber-900/50 hover:bg-white/10'}
                ${lastRotated === i ? 'ring-2 ring-amber-500/30' : ''}`}
              style={{ 
                width: `${(i + 1) * 80}px`, 
                height: `${(i + 1) * 80}px`,
                transform: `rotate(${angles[i]}deg)`,
                zIndex: 10 - i,
                backgroundImage: `radial-gradient(circle, transparent 95%, rgba(120,53,15,0.05) 100%)`
              }}
            >
              {/* Tick marks */}
              {[...Array(8)].map((_, tick) => (
                <div 
                  key={tick} 
                  className="absolute w-px h-2 bg-amber-900/10" 
                  style={{ 
                    transform: `rotate(${tick * 45}deg) translateY(-${(i + 1) * 40 - 4}px)` 
                  }} 
                />
              ))}

              <div 
                className={`absolute top-0 -translate-y-1/2 px-3 py-0.5 border text-[10px] font-serif font-bold tracking-[0.15em] whitespace-nowrap transition-all
                  ${isAligned ? 'text-amber-950 border-amber-950 bg-amber-100 shadow-md' : 'text-stone-400 border-stone-300 bg-stone-50/80'}`}
              >
                {person.name}
              </div>
            </div>
          );
        })}
        
        {/* Central Core */}
        <div className="w-14 h-14 bg-amber-950 rounded-full flex items-center justify-center text-amber-100 text-xl font-serif z-20 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 border-amber-600/30">
           <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
              <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
           </svg>
        </div>
      </div>

      <div className="text-center space-y-3 max-w-sm">
        {/* Interlock warning */}
        <div className="text-[9px] uppercase tracking-[0.2em] text-red-800/40 font-serif font-bold bg-red-50/30 px-4 py-1.5 rounded">
          {lang === 'zh' 
            ? '⚠ 命运的轮盘相互牵连 — 转动一个会影响其他' 
            : '⚠ Wheels of fate are interlinked — rotating one affects others'}
        </div>
        <p className="text-stone-600 font-serif italic text-sm leading-relaxed px-6 py-3 bg-stone-900/5 border-x border-stone-200">
          {lang === 'zh' ? '\u201c他感觉名字正像生锈的轮盘一样磨损。\u201d' : '\u201cHe felt his names wearing out like rusty wheels.\u201d'}
        </p>
        <div className="flex justify-center gap-4">
           {LINEAGE.map((_, i) => {
             const isAligned = angles[i] === 0 || angles[i] === 360;
             return (
               <div key={i} className="flex flex-col items-center gap-1">
                 <div className={`w-4 h-1 transition-all duration-700 ${isAligned ? 'bg-amber-800 shadow-[0_0_10px_rgba(120,53,15,0.5)]' : 'bg-stone-200'}`} />
                 <span className="text-[8px] text-stone-400 font-serif">{Math.round(angles[i])}°</span>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};
