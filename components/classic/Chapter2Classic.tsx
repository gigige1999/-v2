// 原版第2章（简单玩法），从 _101book 原样复制，仅改了导入路径与组件名。请勿修改玩法。

import React, { useState, useRef, useEffect } from 'react';
import { UI_TEXT } from '../../constants';
import { Language } from '../../types';

interface Chapter2Props {
  onComplete: () => void;
  lang: Language;
  triggerAutoSolve?: boolean;
}

// The correct sequence is: ☉ → ☿ → ☽ → ♄
const CORRECT_SEQUENCE = ['☉', '☿', '☽', '♄'];
const ALL_SYMBOLS = ['☉', '☽', '☿', '♄', '♃', '♂'];

export const Chapter2Classic: React.FC<Chapter2Props> = ({ onComplete, lang, triggerAutoSolve }) => {
  const [isMelted, setIsMelted] = useState(false);
  const [meltProgress, setMeltProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [shakeError, setShakeError] = useState(false);
  const [hintText, setHintText] = useState('');
  const t = UI_TEXT[lang];

  useEffect(() => {
    if (triggerAutoSolve) {
      setIsMelted(true);
      setInputSequence([...CORRECT_SEQUENCE]);
      setTimeout(onComplete, 1500);
    }
  }, [triggerAutoSolve, onComplete]);
  
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMelted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left) * scaleX;
    const y = (('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++;
    }
    const percent = transparent / (canvas.width * canvas.height);
    setMeltProgress(percent);
    if (percent > 0.45) setIsMelted(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0,0,320,384);
        grad.addColorStop(0, '#c9e2f5');
        grad.addColorStop(0.5, '#eef5fb');
        grad.addColorStop(1, '#b4d1eb');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        for(let i=0; i<50; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random()*320, Math.random()*384);
          ctx.lineTo(Math.random()*320, Math.random()*384);
          ctx.stroke();
        }
      }
    }
  }, []);

  const addSymbol = (s: string) => {
    if (!isMelted) return;
    
    setInputSequence(prev => {
      const next = [...prev, s];
      const currentIndex = next.length - 1;
      
      // Check if current symbol matches the correct position
      if (next[currentIndex] !== CORRECT_SEQUENCE[currentIndex]) {
        // Wrong symbol - shake and reset
        setShakeError(true);
        setHintText(lang === 'zh' ? '炼金序列错误，符文已重置...' : 'Wrong sequence, runes reset...');
        setTimeout(() => { setShakeError(false); setHintText(''); }, 1200);
        return [];
      }
      
      // Correct so far
      if (next.length === CORRECT_SEQUENCE.length) {
        // Complete!
        setHintText(lang === 'zh' ? '炼金术完成！冰中的秘密已揭示！' : 'Alchemy complete! The secret within ice is revealed!');
        setTimeout(onComplete, 1500);
      } else {
        setHintText(lang === 'zh' ? `正确！继续... (${next.length}/${CORRECT_SEQUENCE.length})` : `Correct! Continue... (${next.length}/${CORRECT_SEQUENCE.length})`);
        setTimeout(() => setHintText(''), 1500);
      }
      
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-4 md:p-8 space-y-4 md:space-y-6 select-none">
      <div className={`relative w-full max-w-[320px] aspect-[320/384] bg-[#f2e8cf] shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-4 border-amber-950 overflow-hidden deckle-edge transition-transform duration-300 ${shakeError ? 'animate-[shake_0.3s_ease-in-out_3]' : ''}`}>
        {/* Intricate Diagram Backdrop */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-900 fill-none" strokeWidth="0.2">
              <circle cx="50" cy="50" r="45" />
              <circle cx="50" cy="50" r="40" />
              <path d="M50 5 L50 95 M5 50 L95 50" />
              <path d="M15 15 L85 85 M15 85 L85 15" />
           </svg>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 p-8 z-10">
           <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-amber-900/20 border-dashed animate-[spin_20s_linear_infinite]" />
              <div className="w-14 h-14 bg-amber-100 rounded-sm rotate-45 border-2 border-amber-900/30 flex items-center justify-center shadow-inner">
                 <div className="text-3xl filter sepia">💎</div>
              </div>
           </div>
           
           <p className="text-amber-950 font-serif text-center italic text-xs tracking-tight leading-relaxed px-4 border-y border-amber-900/10 py-3">
              {t.largestDiamond}
           </p>

           {/* Hint for alchemy order */}
           {isMelted && (
             <div className="text-[9px] text-amber-900/50 font-serif text-center italic px-4">
               {lang === 'zh' 
                 ? '提示：炼金之道遵循天体秩序 — 从太阳开始，经水星、月亮，至土星终结' 
                 : 'Hint: Alchemy follows celestial order — Sun, Mercury, Moon, to Saturn'}
             </div>
           )}

           {/* Alchemy Symbols */}
           <div className="flex flex-wrap gap-4 justify-center">
              {ALL_SYMBOLS.map(s => (
                <button 
                  key={s} 
                  onClick={() => addSymbol(s)}
                  className={`text-4xl font-serif transition-all hover:scale-125 hover:text-amber-600 active:scale-90
                    ${inputSequence.includes(s) ? 'text-amber-900 drop-shadow-lg' : 'text-stone-400'}`}
                >
                  {s}
                </button>
              ))}
           </div>

           {/* Sequence Display */}
           <div className="flex gap-3 h-12 border-b border-amber-900/40 w-full justify-center items-center">
              {CORRECT_SEQUENCE.map((_, i) => (
                <div key={i} className={`w-10 h-10 border-2 border-dashed rounded-full flex items-center justify-center transition-all duration-500
                  ${inputSequence[i] ? 'border-amber-900 bg-amber-900/5' : 'border-stone-300'}`}>
                  {inputSequence[i] && (
                    <span className="text-2xl text-amber-900 animate-in fade-in zoom-in font-serif drop-shadow-md">
                      {inputSequence[i]}
                    </span>
                  )}
                </div>
              ))}
           </div>
        </div>

        <canvas 
          ref={canvasRef}
          width={320}
          height={384}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          className={`absolute inset-0 z-20 transition-opacity duration-2000 cursor-pointer ${isMelted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />
        
        {!isMelted && (
          <div className="absolute bottom-6 left-0 right-0 text-center text-amber-950/40 font-serif pointer-events-none text-[10px] uppercase tracking-[0.4em] z-30">
            {t.meltIce} • {Math.round(meltProgress * 100)}%
          </div>
        )}
      </div>

      {hintText && (
        <div className={`text-center font-serif italic text-sm tracking-wide px-6 py-2 rounded transition-all ${shakeError ? 'text-red-600/80 bg-red-50/50' : 'text-amber-900/80 bg-amber-50/50'}`}>
          {hintText}
        </div>
      )}

      {isMelted && !hintText && (
        <div className="text-amber-900/80 font-serif text-center italic text-base tracking-wide">
          {lang === 'zh' ? "按正确的天体顺序点击炼金符号..." : "Click the alchemy symbols in the correct celestial order..."}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};
