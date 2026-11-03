// 原版第7章（简单玩法），从 _101book 原样复制，仅改了导入路径与组件名。请勿修改玩法。
// 唯一改动：通关后不再播放「马孔多已从地图上消失」终幕，终幕移到整章通关后（见 chapter7/VanishFinale.tsx）。

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../../types';

interface Chapter7Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

interface MapFragment {
  id: string;
  label: { en: string; zh: string };
  correctRow: number;
  correctCol: number;
  rotation: number; // correct rotation is 0
  svg: React.ReactNode;
}

const FRAGMENTS: MapFragment[] = [
  { 
    id: 'swamp', 
    label: { en: "The Swamp", zh: "沼泽地" },
    correctRow: 0, correctCol: 0, rotation: 0,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-950 fill-none" strokeWidth="0.5">
        <path d="M10 50 Q30 20 50 50 T90 50" opacity="0.4" />
        <path d="M5 60 Q25 40 45 60 T85 60" opacity="0.3" />
        <path d="M20 70 L25 65 M40 75 L45 70" strokeWidth="1" />
        <text x="10" y="85" fontSize="6" className="font-serif italic opacity-30">Ciénaga</text>
      </svg>
    )
  },
  { 
    id: 'river', 
    label: { en: "The River", zh: "河流" },
    correctRow: 0, correctCol: 1, rotation: 0,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-950 fill-none" strokeWidth="0.8">
        <path d="M-10 20 Q50 80 110 20" strokeDasharray="2 2" />
        <path d="M-10 25 Q50 85 110 25" />
        <text x="60" y="45" fontSize="6" className="font-serif italic opacity-30">Río</text>
      </svg>
    )
  },
  { 
    id: 'mountains', 
    label: { en: "The Mountains", zh: "群山" },
    correctRow: 1, correctCol: 0, rotation: 0,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-950 fill-none" strokeWidth="0.5">
        <path d="M10 80 L30 30 L50 80 L70 40 L90 80" />
        <text x="40" y="25" fontSize="6" className="font-serif italic opacity-30">Sierra</text>
      </svg>
    )
  },
  { 
    id: 'village', 
    label: { en: "Macondo", zh: "马孔多" },
    correctRow: 1, correctCol: 1, rotation: 0,
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-950 fill-none" strokeWidth="0.8">
        <rect x="40" y="40" width="20" height="20" />
        <path d="M40 40 L50 30 L60 40" />
        <circle cx="50" cy="80" r="5" />
        <text x="35" y="70" fontSize="8" className="font-serif font-bold opacity-60">MACONDO</text>
      </svg>
    )
  }
];

const FADE_INTERVAL = 12000; // Placed fragments start fading after 12s
const FADE_DURATION = 6000;  // Takes 6s to fully fade

export const Chapter7Classic: React.FC<Chapter7Props> = ({ onComplete, lang, triggerAutoSolve }) => {
  // Grid state: which fragment is in which cell, and its current rotation
  const [grid, setGrid] = useState<(string | null)[][]>([[null, null], [null, null]]);
  const [rotations, setRotations] = useState<Record<string, number>>(() => {
    const r: Record<string, number> = {};
    // Start with random rotations (90, 180, 270 - NOT 0)
    FRAGMENTS.forEach(f => { r[f.id] = [90, 180, 270][Math.floor(Math.random() * 3)]; });
    return r;
  });
  const [availableFragments, setAvailableFragments] = useState<string[]>(FRAGMENTS.map(f => f.id));
  const [selectedFragment, setSelectedFragment] = useState<string | null>(null);
  const [fadingCells, setFadingCells] = useState<Set<string>>(new Set());
  const fadeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (triggerAutoSolve) {
      const newGrid: (string | null)[][] = [[null, null], [null, null]];
      const newRotations: Record<string, number> = {};
      FRAGMENTS.forEach(f => {
        newGrid[f.correctRow][f.correctCol] = f.id;
        newRotations[f.id] = 0;
      });
      setGrid(newGrid);
      setRotations(newRotations);
      setAvailableFragments([]);
      setDone(true);
      // 终幕过场移到整章（第二关）通关后播放
      setTimeout(onComplete, 1500);
    }
  }, [triggerAutoSolve, onComplete]);

  // Start fade timer when a fragment is placed
  const startFadeTimer = useCallback((fragId: string, row: number, col: number) => {
    if (done) return;
    const cellKey = `${row}-${col}`;
    
    // Clear existing timer for this fragment
    if (fadeTimers.current.has(fragId)) {
      clearTimeout(fadeTimers.current.get(fragId)!);
    }
    
    const timer = setTimeout(() => {
      // Start fading animation
      setFadingCells(prev => new Set(prev).add(cellKey));
      
      // After fade duration, remove fragment from grid
      setTimeout(() => {
        setGrid(prev => {
          const next = prev.map(r => [...r]);
          if (next[row][col] === fragId) {
            next[row][col] = null;
            setAvailableFragments(a => [...a, fragId]);
          }
          return next;
        });
        setFadingCells(prev => {
          const next = new Set(prev);
          next.delete(cellKey);
          return next;
        });
      }, FADE_DURATION);
    }, FADE_INTERVAL);
    
    fadeTimers.current.set(fragId, timer);
  }, [done]);

  // Clean up timers
  useEffect(() => {
    return () => {
      fadeTimers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const handleRotateFragment = (fragId: string) => {
    if (done) return;
    setRotations(prev => ({
      ...prev,
      [fragId]: (prev[fragId] + 90) % 360
    }));
  };

  const handleSelectFragment = (fragId: string) => {
    if (done) return;
    setSelectedFragment(prev => prev === fragId ? null : fragId);
  };

  const handleCellClick = (row: number, col: number) => {
    if (done || !selectedFragment) return;
    
    // Place the fragment
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      // If cell already has a fragment, return it to available
      if (next[row][col]) {
        const existing = next[row][col]!;
        setAvailableFragments(a => [...a, existing]);
        // Clear fade timer for the removed fragment
        if (fadeTimers.current.has(existing)) {
          clearTimeout(fadeTimers.current.get(existing)!);
        }
      }
      next[row][col] = selectedFragment;
      return next;
    });
    
    setAvailableFragments(prev => prev.filter(f => f !== selectedFragment));
    startFadeTimer(selectedFragment, row, col);
    setSelectedFragment(null);
    
    // Check completion after state update
    setTimeout(() => checkCompletion(), 100);
  };

  const checkCompletion = useCallback(() => {
    setGrid(currentGrid => {
      const allCorrect = FRAGMENTS.every(f => {
        return currentGrid[f.correctRow]?.[f.correctCol] === f.id;
      });
      
      if (allCorrect) {
        // Check all rotations are 0
        setRotations(currentRotations => {
          const allRotCorrect = FRAGMENTS.every(f => currentRotations[f.id] === 0);
          if (allRotCorrect && !done) {
            // Clear all fade timers
            fadeTimers.current.forEach(t => clearTimeout(t));
            setDone(true);
            setTimeout(onComplete, 2000);
          }
          return currentRotations;
        });
      }
      return currentGrid;
    });
  }, [done, onComplete]);

  // Re-check completion whenever grid or rotations change
  useEffect(() => {
    if (done) return;
    const allPlaced = FRAGMENTS.every(f => {
      return grid[f.correctRow]?.[f.correctCol] === f.id;
    });
    if (allPlaced) {
      const allRotCorrect = FRAGMENTS.every(f => rotations[f.id] === 0);
      if (allRotCorrect) {
        fadeTimers.current.forEach(t => clearTimeout(t));
        setDone(true);
        setTimeout(onComplete, 2000);
      }
    }
  }, [grid, rotations, done, onComplete]);

  return (
    <div className="relative flex flex-col h-full w-full items-center justify-center p-4 md:p-8 overflow-hidden bg-stone-900/5 select-none">
      
      <div className="absolute inset-4 border-[1px] border-amber-900/20 pointer-events-none">
        <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-amber-900/40 rounded-tl-xl" />
        <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-amber-900/40 rounded-tr-xl" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-amber-900/40 rounded-bl-xl" />
        <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-amber-900/40 rounded-br-xl" />
      </div>

      <div className={`w-full max-w-4xl h-full flex flex-col items-center justify-between py-4 transition-all duration-[4000ms] opacity-100`}>
        
        <div className="text-center space-y-1">
           <div className="text-[10px] tracking-[0.5em] text-amber-900/40 uppercase font-serif font-bold">Imago Mundi • Macondo</div>
           <h2 className="text-2xl font-serif text-amber-950 italic border-b border-amber-950/20 pb-2 px-12">
             {lang === 'zh' ? "消逝的地理" : "The Vanishing Geography"}
           </h2>
           <div className="text-[9px] text-red-800/40 font-serif uppercase tracking-[0.2em]">
             {lang === 'zh' ? '⚠ 碎片放置后会逐渐消逝 — 需要正确位置与旋转角度' : '⚠ Fragments fade after placement — correct position AND rotation required'}
           </div>
        </div>

        {/* Map Grid */}
        <div className="relative w-full max-w-md aspect-[4/3] parchment border-[8px] border-amber-950 shadow-2xl overflow-hidden deckle-edge">
           <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10 pointer-events-none" />
           <div className="absolute inset-4 border border-amber-900/10 pointer-events-none" />
           
           <div className="absolute inset-0 opacity-10 pointer-events-none">
             <svg width="100%" height="100%">
               <defs>
                 <pattern id="grid7" width="40" height="40" patternUnits="userSpaceOnUse">
                   <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                 </pattern>
               </defs>
               <rect width="100%" height="100%" fill="url(#grid7)" />
             </svg>
           </div>

           <div className="absolute w-24 h-24 opacity-15 pointer-events-none animate-[spin_120s_linear_infinite] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-amber-900" strokeWidth="1">
               <circle cx="50" cy="50" r="45" />
               <path d="M50 5 L50 95 M5 50 L95 50" strokeWidth="0.5" />
             </svg>
           </div>

           <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-6 gap-3">
              {[0, 1].map(row => 
                [0, 1].map(col => {
                  const cellKey = `${row}-${col}`;
                  const fragId = grid[row][col];
                  const frag = fragId ? FRAGMENTS.find(f => f.id === fragId) : null;
                  const isFading = fadingCells.has(cellKey);
                  const expectedFrag = FRAGMENTS.find(f => f.correctRow === row && f.correctCol === col);
                  
                  return (
                    <div 
                      key={cellKey}
                      onClick={() => handleCellClick(row, col)}
                      className={`border-2 border-dashed rounded flex items-center justify-center relative transition-all duration-700 cursor-pointer
                        ${fragId && !isFading ? 'border-amber-900/30 bg-amber-50/30' : ''}
                        ${isFading ? 'border-red-400/30 bg-red-50/20' : ''}
                        ${!fragId ? 'border-amber-900/20 bg-amber-900/5 hover:bg-amber-900/10' : ''}
                        ${selectedFragment ? 'hover:border-amber-600 hover:bg-amber-100/30' : ''}`}
                    >
                      {!fragId && (
                        <span className="text-[9px] font-serif text-amber-900/20 uppercase tracking-widest">
                          {expectedFrag?.label[lang]}
                        </span>
                      )}
                      {frag && (
                        <div 
                          className={`absolute inset-0 transition-all duration-700 ${isFading ? 'opacity-20 blur-[2px]' : 'opacity-100'}`}
                          style={{ transform: `rotate(${rotations[frag.id]}deg)` }}
                        >
                          {frag.svg}
                        </div>
                      )}
                      {isFading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <span className="text-red-500/60 text-[8px] uppercase tracking-widest font-bold animate-pulse">
                            {lang === 'zh' ? '消逝中...' : 'Fading...'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
           </div>
        </div>

        {/* Available fragments */}
        <div className="w-full max-w-2xl flex flex-wrap justify-center gap-4">
          {FRAGMENTS.map((f) => {
            const isAvailable = availableFragments.includes(f.id);
            const isSelected = selectedFragment === f.id;
            if (!isAvailable) return (
              <div key={f.id} className="w-14 h-14 md:w-20 md:h-20 opacity-10 border-2 border-dashed border-stone-300 rounded flex items-center justify-center">
                <span className="text-[8px] text-stone-400 font-serif">{f.label[lang]}</span>
              </div>
            );
            return (
              <div key={f.id} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleSelectFragment(f.id)}
                  className={`w-14 h-14 md:w-20 md:h-20 parchment stained-parchment border-2 p-1 shadow-lg transition-all active:scale-90
                    ${isSelected ? 'border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.3)] scale-105 ring-2 ring-amber-500/30' : 'border-amber-950/30 hover:-translate-y-1 hover:shadow-2xl'}`}
                >
                  <div className="w-full h-full relative" style={{ transform: `rotate(${rotations[f.id]}deg)` }}>
                    {f.svg}
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRotateFragment(f.id); }}
                  className="text-[8px] font-serif text-amber-900/50 hover:text-amber-900 transition-colors uppercase tracking-widest"
                >
                  ↻ {rotations[f.id]}°
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-amber-900/40 font-serif italic text-xs tracking-widest">
          {lang === 'zh' ? '\u201c被飓风刮走的历史，不会有第二次机会。\u201d' : '\u201cHistory swept by the storm has no second chance.\u201d'}
        </p>
      </div>

    </div>
  );
};
