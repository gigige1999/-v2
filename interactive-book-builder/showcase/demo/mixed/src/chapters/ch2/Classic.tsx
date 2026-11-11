import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { StageProps } from '../../types';

/* =========================================================
   第二章 · 第一关（React 小游戏）—— 示例：拼回散落的句子
   规则：按正确顺序点击散落的词句碎片，拼回原文；点错会整句散开重来
   第一关的要求：30 秒能看懂、1~3 分钟能通过；必须响应 triggerAutoSolve
   颜色一律用 ink / accent / paper（tailwind.config.js），不要写死颜色
   ========================================================= */
const SENTENCE = {
  zh: ['夜很深，', '书房里', '只剩一截', '没点着的', '蜡烛。'],
  en: ['The night was deep;', 'in the study', 'there was only', 'an unlit', 'candle.'],
};

export const Classic: React.FC<StageProps> = ({ onComplete, lang, triggerAutoSolve }) => {
  const parts = SENTENCE[lang] || SENTENCE.zh;
  const order = useMemo(() => {
    const a = parts.map((_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }, [parts]);
  const [picked, setPicked] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const done = picked.length === parts.length;
  const fired = useRef(false);

  const finish = () => { if (fired.current) return; fired.current = true; setTimeout(onComplete, 1600); };
  useEffect(() => { if (triggerAutoSolve) { setPicked(parts.map((_, i) => i)); finish(); } }, [triggerAutoSolve]); // eslint-disable-line react-hooks/exhaustive-deps

  const click = (i: number) => {
    if (done || picked.includes(i)) return;
    if (i !== picked.length) { setShake(true); setPicked([]); setTimeout(() => setShake(false), 450); return; }
    const next = [...picked, i];
    setPicked(next);
    if (next.length === parts.length) finish();
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-10 p-6 md:p-10 text-ink select-none">
      <div className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">Fragmentum I</div>
      <div className={`w-full max-w-md min-h-[120px] stained-parchment border border-ink/30 p-6 text-center font-serif text-xl md:text-2xl leading-relaxed ${shake ? 'bk-shake' : ''}`}
        style={shake ? { animation: 'bkshake .45s' } : undefined}>
        {picked.length === 0 ? <span className="opacity-30 italic text-base">{lang === 'zh' ? '按顺序点击下面的碎片' : 'Tap the fragments in order'}</span>
          : picked.map(i => <span key={i} className="fade-in inline-block mx-0.5">{parts[i]}</span>)}
      </div>
      <div className="flex flex-wrap justify-center gap-3 max-w-md">
        {order.map(i => (
          <button key={i} onClick={() => click(i)} disabled={picked.includes(i)}
            className={`px-4 py-2 border border-dashed border-ink/40 font-serif text-lg transition-all duration-500 hover:bg-ink/5 hover:-translate-y-0.5 disabled:opacity-10 disabled:blur-[1px]`}
            style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (2 + i)}deg)` }}>
            {parts[i]}
          </button>
        ))}
      </div>
      <p className={`font-serif italic text-sm tracking-wider transition-opacity duration-700 ${done ? 'opacity-80 text-accent' : 'opacity-0'}`}>
        {lang === 'zh' ? '句子回来了。' : 'The sentence returns.'}
      </p>
    </div>
  );
};
