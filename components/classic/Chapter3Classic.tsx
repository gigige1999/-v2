// 原版第3章（简单玩法），从 _101book 原样复制，仅改了导入路径与组件名。请勿修改玩法。

import React, { useState, useEffect, useRef } from 'react';
import { UI_TEXT } from '../../constants';
import { Language } from '../../types';

interface Chapter3Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

interface Raindrop {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export const Chapter3Classic: React.FC<Chapter3Props> = ({ onComplete, lang, triggerAutoSolve }) => {
  const [drops, setDrops] = useState<Raindrop[]>([]);
  const [collectedDrops, setCollectedDrops] = useState(0);
  const [revealedParts, setRevealedParts] = useState<boolean[]>([false, false, false, false]);
  const [isRaining, setIsRaining] = useState(true);
  const t = UI_TEXT[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const dropIdCounter = useRef(0);

  const PROPHECY = lang === 'zh' 
    ? ["家族的第一个人", "被捆在树上", "家族的最后一个人", "正被蚂蚁吃掉"]
    : ["The first of the line", "is tied to a tree", "The last of the line", "is being eaten by ants"];

  useEffect(() => {
    if (triggerAutoSolve) {
      setRevealedParts([true, true, true, true]);
      setCollectedDrops(10);
      setIsRaining(false);
      setTimeout(onComplete, 2000);
    }
  }, [triggerAutoSolve, onComplete]);

  useEffect(() => {
    if (!isRaining) return;

    const interval = setInterval(() => {
      if (drops.length < 12) {
        const newDrop: Raindrop = {
          id: dropIdCounter.current++,
          x: Math.random() * 90 + 5,
          y: -10,
          speed: Math.random() * 0.5 + 0.3,
        };
        setDrops(prev => [...prev, newDrop]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRaining, drops.length]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function moveDrops() {
      setDrops(prev => prev
        .map(d => ({ ...d, y: d.y + d.speed }))
        .filter(d => d.y < 110)
      );
      requestAnimationFrame(moveDrops);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleDropClick = (id: number) => {
    setDrops(prev => prev.filter(d => d.id !== id));
    setCollectedDrops(prev => prev + 1);
  };

  const revealPart = (index: number) => {
    if (collectedDrops >= 3 && !revealedParts[index]) {
      setCollectedDrops(prev => prev - 3);
      const next = [...revealedParts];
      next[index] = true;
      setRevealedParts(next);

      if (next.every(v => v)) {
        setIsRaining(false);
        setTimeout(onComplete, 3000);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col h-full w-full items-center justify-center p-4 md:p-8 overflow-hidden select-none cursor-default">
      {/* Background Stains for manuscript feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-amber-900/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-800/20 rounded-full blur-3xl" />
      </div>

      {/* Rain Layer */}
      {isRaining && drops.map(drop => (
        <div
          key={drop.id}
          onClick={(e) => { e.stopPropagation(); handleDropClick(drop.id); }}
          className="absolute group cursor-pointer"
          style={{ left: `${drop.x}%`, top: `${drop.y}%` }}
        >
          <div className="w-16 h-20 -mt-10 -ml-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-10 line-art-icon text-blue-950/40 group-hover:text-blue-600 transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
               <path d="M12 2.5 L6 13 Q6 19 12 19 Q18 19 18 13 L12 2.5 Z" />
            </svg>
          </div>
        </div>
      ))}

      <div className="z-10 w-full max-w-md space-y-8 text-center">
        <div className="parchment stained-parchment p-10 border-2 border-amber-900/40 shadow-2xl min-h-[350px] flex flex-col justify-center space-y-8 relative overflow-hidden deckle-edge">
          <div className={`absolute inset-0 bg-blue-900/5 pointer-events-none transition-opacity duration-1000 ${isRaining ? 'opacity-100' : 'opacity-0'}`} />
          
          <div className="uppercase tracking-[0.4em] text-[10px] text-amber-900/30 font-bold mb-4">Fragmentum Melquíades</div>

          {PROPHECY.map((part, i) => (
            <div
              key={i}
              onClick={() => revealPart(i)}
              className={`py-3 px-6 rounded transition-all duration-1000 cursor-pointer text-xl font-serif italic border-b border-amber-900/5
                ${revealedParts[i] 
                  ? 'text-amber-950 bg-amber-900/5' 
                  : 'text-transparent bg-stone-400/10 blur-md hover:bg-stone-400/20'}`}
            >
              {revealedParts[i] ? part : "• • • • • • • •"}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4 bg-white/40 px-6 py-2 rounded-full border border-amber-950/10 shadow-inner">
             <svg viewBox="0 0 24 24" className="w-6 h-6 line-art-icon text-blue-800 animate-bounce">
                <path d="M12 2 L7 12 Q7 18 12 18 Q17 18 17 12 L12 2 Z" />
             </svg>
             <span className="text-2xl font-bold font-serif text-amber-950">{collectedDrops}</span>
          </div>
          <p className="text-amber-900/40 font-serif text-xs uppercase tracking-[0.2em] italic">
            {lang === 'zh' 
              ? "轻触雨滴清洗手稿 (需3滴)" 
              : "Catch drops to clear ink (Costs 3)"}
          </p>
        </div>
      </div>
    </div>
  );
};
