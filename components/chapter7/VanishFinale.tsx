// 「马孔多已从地图上消失」终幕过场（原第七章第一关通关时播放，现移到整章完全通关后）
import React, { useEffect, useMemo, useRef } from 'react';
import { Language } from '../../types';

const HistoryIcon = ({ type }: { type: number }) => {
  const icons = [
    <path key="0" d="M4 6 Q12 2 20 6 Q20 18 12 22 Q4 18 4 6 M4 6 L4 18 M20 6 L20 18" />,
    <path key="1" d="M12 12 Q16 8 20 12 M12 12 Q8 8 4 12 M12 12 V18" />,
    <path key="2" d="M12 4 Q18 12 12 20 Q6 12 12 4 M12 4 V20" />,
    <path key="3" d="M12 6 Q6 14 12 20 Q18 14 12 6" />
  ];
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full line-art-icon opacity-40">
      {icons[type % icons.length]}
    </svg>
  );
};

export const VanishFinale: React.FC<{ lang: Language; onDone: () => void; duration?: number }> = ({ lang, onDone, duration = 8000 }) => {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => doneRef.current(), duration);
    return () => clearTimeout(t);
  }, [duration]);
  const bits = useMemo(() => [...Array(25)].map((_, i) => ({
    left: Math.random() * 100, top: Math.random() * 100, dur: 6 + Math.random() * 6, rot: Math.random() * 360, i,
  })), []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-[3000ms] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#efe3c3',
          backgroundImage: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(120,85,40,.24) 100%), radial-gradient(circle at 18% 82%, rgba(150,105,45,.12) 0, transparent 28%), radial-gradient(circle at 84% 16%, rgba(150,105,45,.1) 0, transparent 24%)',
        }}
      />
      <div className="relative z-10 space-y-12 max-w-2xl">
        <div className="h-px w-32 bg-amber-950/20 mx-auto" />
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif italic text-amber-950 drop-shadow-sm leading-tight animate-in zoom-in-95 duration-[4000ms]">
            {lang === 'zh' ? '马孔多已从地图上消失' : 'Macondo vanished from the map'}
          </h1>
          <p className="text-stone-600 font-serif italic text-lg md:text-2xl opacity-80 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-[6000ms]">
            {lang === 'zh'
              ? '被飓风刮走的历史，注定不会有第二次机会。'
              : 'The history swept away by the storm will never have a second opportunity.'}
          </p>
        </div>
        <div className="w-full h-0.5 bg-amber-950/10 rounded-full overflow-hidden mt-16 relative shadow-inner">
          <div className="absolute inset-0 bg-amber-950 origin-left" style={{ animation: `c7vf-progress ${duration}ms linear forwards` }} />
        </div>
        <div className="text-[10px] font-bold text-amber-950/30 uppercase tracking-[0.8em] pt-8">FINIS</div>
      </div>
      {bits.map(b => (
        <div
          key={b.i}
          className="absolute w-12 h-12"
          style={{
            left: `${b.left}%`, top: `${b.top}%`, transform: `rotate(${b.rot}deg)`,
            animation: `c7vf-drift ${b.dur}s ${b.i * 0.4}s infinite linear`, opacity: 0,
          }}
        >
          <HistoryIcon type={b.i} />
        </div>
      ))}
      <style>{`
        @keyframes c7vf-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes c7vf-drift {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.6; }
          85% { opacity: 0.6; }
          100% { transform: translate(500px, -600px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default VanishFinale;
