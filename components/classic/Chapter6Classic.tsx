// 原版第6章（简单玩法），从 _101book 原样复制，仅改了导入路径与组件名。请勿修改玩法。

import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../../types';

interface Chapter6Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

const RemediosSymbol = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full line-art-icon text-amber-950 opacity-80">
    <path d="M50 20 Q60 10 70 20 T70 40 Q70 70 50 90 Q30 70 30 40 T30 20 Q40 10 50 20" />
    <path d="M50 20 V80 M35 35 Q50 45 65 35 M35 55 Q50 65 65 55" strokeWidth="0.5" opacity="0.5" />
    <circle cx="50" cy="30" r="4" fill="currentColor" />
    <path d="M40 15 Q50 5 60 15" strokeWidth="0.5" />
  </svg>
);

const ButterflyIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full line-art-icon text-yellow-600">
    <path d="M50 50 Q70 20 90 50 Q70 80 50 50 Q30 20 10 50 Q30 80 50 50" />
    <path d="M50 40 V60" strokeWidth="2" />
  </svg>
);

// Light source at top-left, target (Remedios) at top-center
// 5 mirrors that must be set to correct angles for light to bounce through them all to Remedios
// Each mirror has 8 possible angles (0, 45, 90, 135, 180, 225, 270, 315)
interface Mirror {
  x: number;  // percentage position
  y: number;
  targetAngle: number;
  label: string;
}

const MIRRORS: Mirror[] = [
  { x: 20, y: 70, targetAngle: 135, label: 'I' },    // Bottom-left: deflects light upward-right
  { x: 50, y: 75, targetAngle: 45, label: 'II' },     // Bottom-center: deflects light upward-left
  { x: 75, y: 55, targetAngle: 135, label: 'III' },    // Right-middle
  { x: 35, y: 45, targetAngle: 45, label: 'IV' },     // Center-left
  { x: 60, y: 30, targetAngle: 90, label: 'V' },      // Upper-right: final bounce to Remedios
];

// Light path segments - when mirror i is correct, segment i lights up
// The path goes: Source → Mirror1 → Mirror2 → ... → Remedios
const LIGHT_PATH = [
  { from: { x: 5, y: 85 }, to: { x: 20, y: 70 } },   // Source to Mirror I
  { from: { x: 20, y: 70 }, to: { x: 50, y: 75 } },   // Mirror I to Mirror II
  { from: { x: 50, y: 75 }, to: { x: 75, y: 55 } },   // Mirror II to Mirror III
  { from: { x: 75, y: 55 }, to: { x: 35, y: 45 } },   // Mirror III to Mirror IV
  { from: { x: 35, y: 45 }, to: { x: 60, y: 30 } },   // Mirror IV to Mirror V
  { from: { x: 60, y: 30 }, to: { x: 50, y: 10 } },   // Mirror V to Remedios
];

export const Chapter6Classic: React.FC<Chapter6Props> = ({ onComplete, lang, triggerAutoSolve }) => {
  const [mirrorAngles, setMirrorAngles] = useState<number[]>([0, 180, 270, 90, 0]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (triggerAutoSolve) {
      setMirrorAngles(MIRRORS.map(m => m.targetAngle));
      setIsSuccess(true);
      setTimeout(onComplete, 3500);
    }
  }, [triggerAutoSolve, onComplete]);

  // How many consecutive mirrors from the start are correctly aligned
  const correctCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < MIRRORS.length; i++) {
      if (mirrorAngles[i] === MIRRORS[i].targetAngle) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [mirrorAngles]);

  const rotateMirror = (index: number) => {
    if (isSuccess) return;
    setMirrorAngles(prev => {
      const next = [...prev];
      next[index] = (next[index] + 45) % 360;
      
      // Check if all correct
      const allCorrect = MIRRORS.every((m, i) => next[i] === m.targetAngle);
      if (allCorrect) {
        setIsSuccess(true);
        setTimeout(onComplete, 4000);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-3 md:p-6 space-y-4 md:space-y-6 select-none overflow-hidden">
      <div className="relative w-full max-w-sm aspect-square border-2 border-amber-900/10 rounded-full flex items-center justify-center">
        {/* Ambient Halo */}
        <div className={`absolute inset-0 rounded-full transition-all duration-[3000ms] bg-yellow-400/5 ${isSuccess ? 'scale-150 blur-3xl opacity-40' : 'opacity-0'}`} />

        {/* Light source indicator */}
        <div className="absolute bottom-[10%] left-[2%] flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full transition-all duration-500 ${correctCount > 0 || isSuccess ? 'bg-yellow-400 shadow-[0_0_20px_#facc15]' : 'bg-yellow-400/50 shadow-[0_0_8px_#facc1580]'}`} />
          <span className="text-[8px] text-amber-900/40 font-serif mt-1">☉</span>
        </div>

        {/* Light path segments */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {LIGHT_PATH.map((seg, i) => (
            <line
              key={i}
              x1={seg.from.x} y1={seg.from.y}
              x2={seg.to.x} y2={seg.to.y}
              stroke={i < correctCount ? '#facc15' : i === correctCount ? '#fbbf2440' : 'transparent'}
              strokeWidth={i < correctCount ? '1.5' : '0.5'}
              strokeDasharray={i < correctCount ? 'none' : '2 2'}
              className="transition-all duration-700"
              style={{
                filter: i < correctCount ? 'drop-shadow(0 0 4px #facc15)' : 'none'
              }}
            />
          ))}
          {/* Show the complete path as dim guide */}
          {LIGHT_PATH.map((seg, i) => (
            <line
              key={`guide-${i}`}
              x1={seg.from.x} y1={seg.from.y}
              x2={seg.to.x} y2={seg.to.y}
              stroke="#92400e"
              strokeWidth="0.2"
              strokeDasharray="1 3"
              opacity="0.15"
            />
          ))}
        </svg>

        {/* Remedios Figure (target) */}
        <div className={`absolute top-[2%] left-1/2 -translate-x-1/2 w-20 h-28 transition-all duration-[4000ms] ${isSuccess ? '-translate-y-32 opacity-0 rotate-12 blur-sm' : 'opacity-100'}`}>
          <RemediosSymbol />
        </div>

        {/* Target indicator */}
        <div className={`absolute top-[5%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-dashed transition-all duration-500 ${isSuccess ? 'border-yellow-400 bg-yellow-400/30 shadow-[0_0_15px_#facc15]' : 'border-amber-900/20'}`} />

        {/* Butterflies on success */}
        {isSuccess && [...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-8 h-8 animate-ping"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <ButterflyIcon />
          </div>
        ))}

        {/* Divine Light Beam on success */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-t from-yellow-400 via-yellow-200 to-transparent shadow-[0_0_30px_#facc15] transition-all duration-[1500ms] ${isSuccess ? 'h-full opacity-60' : 'h-0 opacity-0'}`} />

        {/* Mirrors */}
        {MIRRORS.map((mirror, i) => {
          const isCorrect = mirrorAngles[i] === mirror.targetAngle;
          const isActive = i <= correctCount; // This mirror can be interacted with
          return (
            <div 
              key={i}
              onClick={() => rotateMirror(i)}
              className={`absolute cursor-pointer group transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}
              style={{ 
                left: `${mirror.x}%`,
                top: `${mirror.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className={`w-14 h-3 border-2 shadow-xl transition-all duration-500 hover:border-amber-900/60
                  ${isCorrect ? 'bg-yellow-100 border-yellow-500 shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'bg-stone-100 border-amber-900/20'}`}
                style={{ transform: `rotate(${mirrorAngles[i]}deg)` }}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-amber-900/30 font-bold font-serif whitespace-nowrap">
                {mirror.label} <span className="text-[7px] opacity-60">{mirrorAngles[i]}°</span>
              </div>
              {isCorrect && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 text-xs">✓</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center space-y-3 max-w-xs">
        <p className="text-amber-900/40 font-serif italic text-xs uppercase tracking-[0.3em]">
          {lang === 'zh' ? "调整镜面，引导光线照向蕾梅黛丝" : "Adjust mirrors to guide light to Remedios"}
        </p>
        {/* Progress bar */}
        <div className="flex justify-center gap-2">
          {MIRRORS.map((_, i) => (
            <div key={i} className={`w-6 h-1.5 rounded-full transition-all duration-500 ${i < correctCount ? 'bg-yellow-400 shadow-[0_0_6px_#facc15]' : 'bg-stone-200'}`} />
          ))}
        </div>
        <div className="text-amber-950 font-serif italic text-base tracking-wider h-7">
          {isSuccess 
            ? (lang === 'zh' ? "她正在化作光芒..." : "She is turning into light...") 
            : (lang === 'zh' 
              ? `${correctCount}/${MIRRORS.length} 面镜子已就位` 
              : `${correctCount}/${MIRRORS.length} mirrors aligned`)}
        </div>
      </div>
    </div>
  );
};
