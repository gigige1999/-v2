
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_CHAPTERS, UI_TEXT, CHAPTER_EXCERPTS } from './constants';
import { Chapter, ChapterStatus, GameState, Language, Theme } from './types';
import { Chapter1 } from './components/Chapter1';
import { Chapter2 } from './components/Chapter2';
import { Chapter3 } from './components/Chapter3';
import { Chapter4 } from './components/Chapter4';
import { Chapter5 } from './components/Chapter5';
import { Chapter6 } from './components/Chapter6';
import { Chapter7 } from './components/Chapter7';
import { Chapter1Classic } from './components/classic/Chapter1Classic';
import { Chapter2Classic } from './components/classic/Chapter2Classic';
import { Chapter3Classic } from './components/classic/Chapter3Classic';
import { Chapter4Classic } from './components/classic/Chapter4Classic';
import { Chapter5Classic } from './components/classic/Chapter5Classic';
import { Chapter6Classic } from './components/classic/Chapter6Classic';
import { Chapter7Classic } from './components/classic/Chapter7Classic';
import { CLASSIC_INSTRUCTIONS } from './components/classic/info';
import { TwoStageChapter } from './components/TwoStageChapter';
import { getPuzzleHint } from './services/geminiService';
import { getLocalHint, chapterSaveKey, chapterStageKey } from './services/localHints';

// 2.0 的章节：每章两个小关——第一关是原版简单玩法（不改动），第二关是书页内原生引擎。
// 右页本身不滚动（第一关在组件内自行滚动），提示走本地分级低语
const BOOK_ENGINE_CHAPTERS = [1, 2, 3, 4, 5, 6, 7];
const isBookEngine = (id: number | null) => id !== null && BOOK_ENGINE_CHAPTERS.includes(id);

// 解锁规则：通过某章第一关即解锁下一章；最后一章要等前面每一章的两关都通过（COMPLETED）才解锁。
// 已解锁的普通章节不会被重新锁上。
const applyUnlocks = (chapters: Chapter[], passed: number[]): Chapter[] => {
  const lastId = chapters[chapters.length - 1]?.id;
  const done = (c: Chapter) => c.status === ChapterStatus.COMPLETED;
  return chapters.map((c, i) => {
    if (done(c)) return c;
    let open: boolean;
    if (i === 0) open = true;
    else if (c.id === lastId) open = chapters.slice(0, i).every(done);
    else open = c.status === ChapterStatus.UNLOCKED || done(chapters[i - 1]) || passed.includes(chapters[i - 1].id);
    const status = open ? ChapterStatus.UNLOCKED : ChapterStatus.LOCKED;
    return status === c.status ? c : { ...c, status };
  });
};
const readPassedFromStages = (chapters: Chapter[]) => {
  try { return chapters.filter(c => localStorage.getItem(chapterStageKey(c.id)) === '2').map(c => c.id); } catch { return []; }
};

// 章节顺序调整（冰 → 1、雨 → 2、失眠症 → 3）：把旧存档里的章节号一次性迁移到新编号
const ORDER_KEY = 'macondo2_order';
const ORDER_VER = 'ice-rain-insomnia';
const OLD_TO_NEW: Record<number, number> = { 1: 3, 2: 1, 3: 2 };
const remapId = (id: number) => OLD_TO_NEW[id] ?? id;
(function migrateChapterOrder() {
  try {
    if (localStorage.getItem(ORDER_KEY) === ORDER_VER) return;
    for (const prefix of ['macondo2_ch', 'macondo2_stage']) {
      const vals: Record<number, string | null> = {};
      for (const o of [1, 2, 3]) vals[OLD_TO_NEW[o]] = localStorage.getItem(prefix + o);
      for (const n of [1, 2, 3]) {
        const v = vals[n];
        if (v === null) localStorage.removeItem(prefix + n); else localStorage.setItem(prefix + n, v);
      }
    }
    const raw = localStorage.getItem('macondo_save');
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p.chapters)) p.chapters = p.chapters.map((c: { id: number }) => ({ ...c, id: remapId(c.id) }));
      if (typeof p.currentChapter === 'number') p.currentChapter = remapId(p.currentChapter);
      if (Array.isArray(p.unlockedGoldVeins)) p.unlockedGoldVeins = p.unlockedGoldVeins.map(remapId);
      localStorage.setItem('macondo_save', JSON.stringify(p));
    }
    const ex = localStorage.getItem('macondo_excerpts');
    if (ex) localStorage.setItem('macondo_excerpts', JSON.stringify((JSON.parse(ex) as number[]).map(remapId)));
    localStorage.setItem(ORDER_KEY, ORDER_VER);
  } catch (e) { /* ignore */ }
})();

const BookCover: React.FC<{ onOpen: () => void; lang: Language; theme: Theme }> = ({ onOpen, lang, theme }) => {
  const [opening, setOpening] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpen = () => {
    setOpening(true);
    setTimeout(onOpen, 800);
  };

  return (
    <div 
      className={`fixed inset-0 z-[300] flex items-center justify-center transition-all duration-1000 ${opening ? 'opacity-0 pointer-events-none scale-110 blur-3xl' : 'opacity-100'}`}
      style={{ backgroundColor: 'var(--app-bg)' }}
    >
      {/* Background Particle Layer - Visible on hover */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 overflow-hidden ${isHovered && !opening ? 'opacity-100' : 'opacity-0'}`}>
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-amber-500/20 blur-[1px] rounded-full"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
              animation: `float-up ${5 + Math.random() * 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* Dynamic dust particles for atmosphere (Static layer) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <div 
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-[340px] h-[500px] md:w-[460px] md:h-[660px] cursor-pointer transition-all duration-700 ease-in-out hover:rotate-1 hover:scale-[1.01] active:scale-95
          ${opening ? 'rotate-[-12deg] -translate-x-[200%] opacity-0' : 'scale-100'}`}
      >
        {/* Book Spine Edge - Gilded Detail */}
        <div className="absolute left-[-22px] top-0 bottom-0 w-[44px] bg-[#1a1410] rounded-l-lg shadow-2xl z-20 origin-right transform -skew-y-2 border-r-[3px] border-amber-600/20" />
        
        {/* Main Cover - Leather Texture */}
        <div className="absolute inset-0 bg-[#241c18] border-[16px] border-[#1a1410] rounded-r-xl shadow-[0_60px_120px_rgba(0,0,0,1)] overflow-hidden flex flex-col items-center justify-between p-14 text-center group">
          
          {/* Weathered Textures */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
          <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
          
          {/* Gilded Inner Borders */}
          <div className="absolute inset-4 border-[1px] border-amber-600/40 pointer-events-none shadow-[inset_0_0_20px_rgba(217,119,6,0.1)]" />
          <div className="absolute inset-6 border-[2.5px] border-amber-700/20 pointer-events-none" />

          {/* Golden Corner Ornaments (CSS generated) */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-[3px] border-l-[3px] border-amber-600/40 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-[3px] border-r-[3px] border-amber-600/40 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-[3px] border-l-[3px] border-amber-600/40 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-[3px] border-r-[3px] border-amber-600/40 rounded-br-sm pointer-events-none" />

          {/* Cover Typography in English */}
          <div className="z-10 mt-6 space-y-4">
            <div className="text-[11px] md:text-sm tracking-[0.6em] text-amber-500/50 uppercase font-serif font-bold">
              Literary Deconstruction
            </div>
            <div className="w-16 h-[2px] bg-amber-600/30 mx-auto rounded-full" />
          </div>

          <div className="z-10 space-y-2 py-4">
            <h1 className="text-4xl md:text-6xl font-serif text-[#f2e8cf] leading-[1.1] font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight">
              One Hundred <br/>
              <span className="italic font-normal text-amber-500/90">Years of Solitude</span>
            </h1>
            <div className="pt-6">
              <span className="text-[12px] md:text-sm tracking-[0.4em] text-amber-600/40 uppercase font-bold block">
                 — THE BOOK OF MEMORY —
              </span>
            </div>
          </div>

          <div className="z-10 mb-10 group-hover:scale-105 transition-transform duration-700">
            <p className="text-xl md:text-2xl font-serif italic text-[#f2e8cf]/60 leading-none tracking-wide">
              Gabriel García Márquez
            </p>
            <div className="mt-8 opacity-20 group-hover:opacity-40 transition-opacity">
               <svg viewBox="0 0 100 20" className="w-32 mx-auto stroke-amber-500 fill-none" strokeWidth="1">
                  <path d="M10 10 Q50 20 90 10" />
                  <circle cx="50" cy="12" r="2" fill="currentColor" />
               </svg>
            </div>
          </div>

          {/* Interaction Prompt */}
          <div className="absolute bottom-8 text-[10px] uppercase tracking-[0.5em] text-amber-600/30 font-bold group-hover:text-amber-500/60 transition-all duration-700 animate-pulse">
            Touch to Begin the Cycle
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-110vh) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Static chapter images (use import.meta.env.BASE_URL for correct path on GitHub Pages)
const BASE = import.meta.env.BASE_URL;
const CHAPTER_IMAGES: Record<number, string> = {
  1: `${BASE}2.png`,
  2: `${BASE}3.png`,
  3: `${BASE}1.png`,
  4: `${BASE}4.png`,
  5: `${BASE}5.png`,
  6: `${BASE}6.png`,
  7: `${BASE}7.png`,
};

const ChapterIllustration: React.FC<{ id: number }> = ({ id }) => {
  const imageUrl = CHAPTER_IMAGES[id];
  return (
    <div className="w-full h-full relative group overflow-hidden">
      <img src={imageUrl} alt={`Chapter ${id} illustration`} className="w-full h-full object-cover grayscale-[0.2] sepia-[0.4] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 group-hover:sepia-0" />
      <div className="absolute inset-0 border-r-4 border-black/20" />
    </div>
  );
};

const AnchorIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 line-art-icon opacity-40">
    <path d="M12 5V21 M7 17 Q12 21 17 17 M5 17 H19 M12 5 C14 5 14 3 12 3 C10 3 10 5 12 5" />
  </svg>
);

const CompassSketch = () => (
  <svg viewBox="0 0 100 100" className="w-28 h-28 line-art-icon">
    <circle cx="50" cy="50" r="40" />
    <path d="M50 10 L50 90 M10 50 L90 50" />
    <path d="M22 22 L78 78 M22 78 L78 22" strokeWidth="0.3" />
    <path d="M50 10 L55 30 L50 50 L45 30 Z" fill="currentColor" opacity="0.05" />
    <circle cx="50" cy="50" r="3" fill="currentColor" />
  </svg>
);

const AstrolabeSketch = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 line-art-icon">
    <circle cx="50" cy="50" r="35" />
    <circle cx="50" cy="50" r="30" />
    <path d="M50 15 V85 M15 50 H85" strokeWidth="0.4" />
    <path d="M50 50 L75 30" strokeWidth="1.5" />
    <circle cx="50" cy="15" r="4" />
  </svg>
);

const CrossStaffSketch = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 line-art-icon">
    <path d="M50 10 V90" strokeWidth="2.5" />
    <path d="M20 35 H80" strokeWidth="1.5" />
    <path d="M30 65 H70" strokeWidth="0.8" />
    <path d="M50 10 L55 15 L50 20 L45 15 Z" fill="currentColor" opacity="0.1" />
  </svg>
);

const App: React.FC = () => {
  const [showCover, setShowCover] = useState(true);
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('macondo_save');
    const initial = {
      currentChapter: null,
      chapters: INITIAL_CHAPTERS,
      unlockedGoldVeins: [],
      hintCooldown: 0,
      language: 'zh' as Language,
      theme: 'light' as Theme,
      chapterImages: {}
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 只从存档恢复章节进度，标题/说明等文案始终以最新 constants 为准
        const savedChapters: { id: number; status: ChapterStatus }[] = Array.isArray(parsed.chapters) ? parsed.chapters : [];
        const chapters = INITIAL_CHAPTERS.map(c => {
          const s = savedChapters.find(p => p.id === c.id);
          return s ? { ...c, status: s.status } : c;
        });
        // 按当前解锁规则重算：通过第一关解锁下一章；最后一章需前面全部完成
        const passed: number[] = [...new Set<number>([...(Array.isArray(parsed.stageOnePassed) ? parsed.stageOnePassed : []), ...readPassedFromStages(chapters)])];
        return { ...initial, ...parsed, stageOnePassed: passed, chapters: applyUnlocks(chapters, passed), chapterImages: {} };
      } catch (e) {
        return initial;
      }
    }
    return { ...initial, chapters: applyUnlocks(INITIAL_CHAPTERS, []) };
  });

  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [autoSolveTrigger, setAutoSolveTrigger] = useState(0);
  const [chapterSessionKey, setChapterSessionKey] = useState(0); 
  const [viewingFinished, setViewingFinished] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionChapterId, setTransitionChapterId] = useState<number | null>(null);
  const [showExcerpts, setShowExcerpts] = useState(false);
  const [collectedExcerpts, setCollectedExcerpts] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('macondo_excerpts');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    // Sync theme class to body
    if (gameState.theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    const { chapterImages, ...serializableState } = gameState;
    try {
      localStorage.setItem('macondo_save', JSON.stringify(serializableState));
    } catch (e) {
      console.warn("Could not save to localStorage. Quota might be exceeded.", e);
    }
  }, [gameState]);

  const t = UI_TEXT[gameState.language];

  useEffect(() => {
    if (gameState.hintCooldown > 0) {
      const timer = setInterval(() => {
        setGameState(prev => ({ ...prev, hintCooldown: Math.max(0, prev.hintCooldown - 1000) }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.hintCooldown]);

  const handleChapterSelect = (id: number) => {
    const chapter = gameState.chapters.find(c => c.id === id);
    if (chapter && chapter.status !== ChapterStatus.LOCKED) {
      setGameState(prev => ({ ...prev, currentChapter: id }));
      setChapterSessionKey(prev => prev + 1);
      setHint(null);
      setShowInstructions(false);
      setViewingFinished(false);
      setAutoSolveTrigger(0);
    }
  };

  // Save collected excerpts
  useEffect(() => {
    try {
      localStorage.setItem('macondo_excerpts', JSON.stringify([...collectedExcerpts]));
    } catch (e) { /* ignore */ }
  }, [collectedExcerpts]);

  const handleComplete = useCallback((id: number) => {
    setGameState(prev => {
      const marked = prev.chapters.map(c => (c.id === id ? { ...c, status: ChapterStatus.COMPLETED } : c));
      return {
        ...prev,
        chapters: applyUnlocks(marked, prev.stageOnePassed || []),
        unlockedGoldVeins: [...new Set([...prev.unlockedGoldVeins, id])]
      };
    });
    // Show transition animation first
    setTransitionChapterId(id);
    setShowTransition(true);
    setCollectedExcerpts(prev => new Set(prev).add(id));
  }, []);

  // 通过某章第一关：记下来并解锁下一章（最后一章仍需前面全部完成）
  const handleStageOne = useCallback((id: number) => {
    setGameState(prev => {
      const passed = [...new Set([...(prev.stageOnePassed || []), id])];
      return { ...prev, stageOnePassed: passed, chapters: applyUnlocks(prev.chapters, passed) };
    });
  }, []);

  const closeCurrentChapter = () => {
    setGameState(prev => ({ ...prev, currentChapter: null }));
    setViewingFinished(false);
    setShowInstructions(false);
    setShowTransition(false);
    setTransitionChapterId(null);
  };

  const handleTransitionEnd = () => {
    setShowTransition(false);
    setTransitionChapterId(null);
    setViewingFinished(true);
  };

  const handleRestartChapter = () => {
    if (gameState.currentChapter !== null) {
      try {
        localStorage.removeItem(chapterSaveKey(gameState.currentChapter));
        localStorage.removeItem(chapterStageKey(gameState.currentChapter));
      } catch (e) { /* ignore */ }
    }
    setViewingFinished(false);
    setShowTransition(false);
    setTransitionChapterId(null);
    setAutoSolveTrigger(0);
    setChapterSessionKey(prev => prev + 1);
    setHint(null);
  };

  const handleHintRequest = async () => {
    if (gameState.currentChapter === null) return;
    const local = getLocalHint(gameState.currentChapter);
    // 本地提示：返回空串表示章节已在书页内自行呈现（不弹窗）
    if (local !== null) { if (local) setHint(local); return; }
    if (gameState.hintCooldown > 0) return;
    setLoadingHint(true);
    const result = await getPuzzleHint(gameState.currentChapter, "Stuck in progress", gameState.language);
    setHint(result);
    setLoadingHint(false);
    setGameState(prev => ({ ...prev, hintCooldown: 180000 }));
  };

  const toggleLanguage = () => {
    setGameState(prev => ({ ...prev, language: prev.language === 'zh' ? 'en' : 'zh' }));
    setHint(null);
  };

  const toggleTheme = () => {
    setGameState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const currentChapterData = gameState.currentChapter 
    ? gameState.chapters.find(c => c.id === gameState.currentChapter) 
    : null;

  const handleAutoSolve = () => {
    setAutoSolveTrigger(prev => prev + 1);
    setShowInstructions(false);
  };

  const renderChapter = () => {
    const puzzleKey = `${gameState.currentChapter}-${chapterSessionKey}`;

    const getChapterComponent = () => {
      switch (gameState.currentChapter) {
        // 章节顺序：1 冰的炼金术（原第 2 章）、2 雨中的羊皮卷（原第 3 章）、3 失眠症的标记（原第 1 章）
        case 1: return <TwoStageChapter key={puzzleKey} id={1} Classic={Chapter2Classic} Advanced={Chapter2} onComplete={() => handleComplete(1)} onStageOneComplete={() => handleStageOne(1)} lastId={gameState.chapters.length} lang={gameState.language} autoSolveCount={autoSolveTrigger} />;
        case 2: return <TwoStageChapter key={puzzleKey} id={2} Classic={Chapter3Classic} Advanced={Chapter3} onComplete={() => handleComplete(2)} onStageOneComplete={() => handleStageOne(2)} lastId={gameState.chapters.length} lang={gameState.language} autoSolveCount={autoSolveTrigger} />;
        case 3: return <TwoStageChapter key={puzzleKey} id={3} Classic={Chapter1Classic} Advanced={Chapter1} onComplete={() => handleComplete(3)} onStageOneComplete={() => handleStageOne(3)} lastId={gameState.chapters.length} lang={gameState.language} autoSolveCount={autoSolveTrigger} />;
        case 4: return <TwoStageChapter key={puzzleKey} id={4} Classic={Chapter4Classic} Advanced={Chapter4} onComplete={() => handleComplete(4)} onStageOneComplete={() => handleStageOne(4)} lastId={gameState.chapters.length} lang={gameState.language} autoSolveCount={autoSolveTrigger} />;
        case 5: return <TwoStageChapter key={puzzleKey} id={5} Classic={Chapter5Classic} Advanced={Chapter5} onComplete={() => handleComplete(5)} onStageOneComplete={() => handleStageOne(5)} lastId={gameState.chapters.length} lang={gameState.language} autoSolveCount={autoSolveTrigger} />;
        case 6: return <TwoStageChapter key={puzzleKey} id={6} Classic={Chapter6Classic} Advanced={Chapter6} onComplete={() => handleComplete(6)} onStageOneComplete={() => handleStageOne(6)} lastId={gameState.chapters.length} lang={gameState.language} autoSolveCount={autoSolveTrigger} />;
        case 7: return <TwoStageChapter key={puzzleKey} id={7} Classic={Chapter7Classic} Advanced={Chapter7} onComplete={() => handleComplete(7)} onStageOneComplete={() => handleStageOne(7)} lastId={gameState.chapters.length} lang={gameState.language} autoSolveCount={autoSolveTrigger} />;
        default: return null;
      }
    };

    if (gameState.currentChapter === null) {
      return (
        <div className="flex flex-col h-full w-full p-8 md:p-14 relative overflow-hidden">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center space-x-8 opacity-20">
             <span className="text-sm font-serif">✡︎</span>
             <AnchorIcon />
             <span className="text-sm font-serif">✡︎</span>
          </div>

          <div className="relative z-10 flex flex-col h-full mt-6">
            <h2 className="log-header text-2xl text-center text-amber-950/90 font-bold mb-10 tracking-[0.2em] border-b border-amber-950/20 pb-6 uppercase">
               {gameState.language === 'zh' ? "马孔多海岸图志" : "SOUTHERN COASTE OF MACONDO"}
            </h2>
            
            <div className="flex-1 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
               {gameState.chapters.map((c, ci) => {
                 const isFinalLocked = c.status === ChapterStatus.LOCKED && ci === gameState.chapters.length - 1;
                 return (
                 <div 
                  key={c.id} 
                  className={`flex items-start gap-6 p-4 transition-all duration-300 relative group border-b border-amber-950/5
                    ${c.status === ChapterStatus.LOCKED 
                      ? `${isFinalLocked ? 'opacity-40' : 'opacity-10'} grayscale cursor-not-allowed` 
                      : 'cursor-pointer hover:bg-amber-950/5 hover:-translate-x-1'}`}
                  onClick={() => handleChapterSelect(c.id)}
                 >
                   <div className="w-12 h-12 border border-amber-950/30 rounded-sm flex items-center justify-center shrink-0 font-serif text-amber-950 italic text-lg bg-white/10 shadow-inner">
                     {c.id}
                   </div>
                   <div className="flex-1">
                      <div className="handwritten text-xl leading-tight text-amber-950/90">
                        {c.status === ChapterStatus.COMPLETED ? '✓ ' : ''}{c.title[gameState.language]}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-amber-900/40 mt-2 font-bold">{c.subtitle[gameState.language]}</div>
                      {isFinalLocked && (
                        <div className="text-[11px] italic font-serif text-amber-950/80 mt-2 tracking-wider">
                          🔒 {gameState.language === 'zh' ? '需通过前面每一章的两关后解锁' : 'Unlocks after both stages of every previous chapter'}
                        </div>
                      )}
                   </div>
                   {c.status !== ChapterStatus.LOCKED && (
                     <div className="text-amber-900/20 text-xs mt-1">»</div>
                   )}
                 </div>
                 );
               })}
            </div>

            <div className="mt-8 pt-6 border-t border-amber-950/10 flex justify-between items-center opacity-30 italic font-serif text-xs tracking-widest">
               <button 
                  onClick={() => setShowCover(true)}
                  className="hover:text-amber-500 transition-colors uppercase font-bold tracking-[0.3em]"
               >
                 « {gameState.language === 'zh' ? "返回封面" : "BACK TO COVER"}
               </button>
               <div className="flex gap-2">
                 <span>❂</span>
                 <span>⚓</span>
               </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full relative flex flex-col">
        <div key={puzzleKey} className="page-turn-in h-full relative flex flex-col">
          {getChapterComponent()}
        </div>

        {/* Chapter Transition Animation with Excerpt */}
        {showTransition && transitionChapterId && CHAPTER_EXCERPTS[transitionChapterId] && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 overflow-hidden">
            {/* Ink wash background animation */}
            <div className="absolute inset-0 bg-amber-950 animate-in fade-in duration-[2000ms]" />
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')]" />
            
            {/* Floating ink particles */}
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full bg-amber-200/20 animate-[float-up_8s_linear_infinite]"
                style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 4}s` }} />
            ))}

            <div className="relative z-10 max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-[3000ms]">
              {/* Chapter number ornament */}
              <div className="text-amber-400/30 text-[10px] uppercase tracking-[0.8em] font-serif font-bold">
                Chapter {transitionChapterId} {gameState.language === 'zh' ? '完成' : 'Complete'}
              </div>

              {/* Decorative line */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-amber-400/20" />
                <div className="text-amber-400/40 text-lg">❂</div>
                <div className="h-px w-16 bg-amber-400/20" />
              </div>

              {/* Excerpt */}
              <div className="px-8">
                <p className="text-amber-100/90 font-serif italic text-xl md:text-2xl leading-relaxed drop-shadow-lg">
                  {CHAPTER_EXCERPTS[transitionChapterId][gameState.language]}
                </p>
                <p className="text-amber-400/40 font-serif text-sm mt-4 tracking-widest">
                  {CHAPTER_EXCERPTS[transitionChapterId].attribution[gameState.language]}
                </p>
              </div>

              {/* Collected indicator */}
              <div className="text-amber-400/30 text-[9px] uppercase tracking-[0.4em] font-bold animate-pulse">
                ✧ {t.excerptCollected} ✧
              </div>

              {/* Continue button */}
              <button
                onClick={handleTransitionEnd}
                className="mt-4 px-12 py-4 border border-amber-400/20 text-amber-100/80 font-serif uppercase tracking-[0.4em] text-[11px] hover:bg-amber-400/10 transition-all active:scale-95 rounded-sm"
              >
                {gameState.language === 'zh' ? '继续' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {viewingFinished && (
          <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-700">
            <div className="parchment p-8 md:p-14 border-4 border-amber-950 shadow-[0_50px_100px_rgba(0,0,0,0.7)] space-y-8 deckle-edge max-w-md w-full text-center relative overflow-hidden">
                <div className="absolute inset-4 border border-amber-900/10 pointer-events-none" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-amber-900/10 text-6xl">❂</div>
                
                <h3 className="text-4xl font-serif text-amber-950 italic font-bold relative z-10">{t.concluded}</h3>
                
                <div className="flex flex-col gap-5 relative z-10">
                  <button onClick={closeCurrentChapter} className="w-full bg-amber-950 text-amber-50 py-5 rounded-sm font-serif hover:bg-amber-900 shadow-2xl transition-all active:scale-95 text-sm uppercase tracking-[0.3em] font-bold">
                    {t.finishChapter}
                  </button>
                  <button onClick={handleRestartChapter} className="w-full border-2 border-amber-950/40 text-amber-950 py-4 rounded-sm font-serif hover:bg-amber-950/5 transition-all active:scale-95 text-[11px] uppercase tracking-[0.4em]">
                    {t.replayChapter}
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-1 md:p-4 overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }}>
      {showCover && <BookCover onOpen={() => setShowCover(false)} lang={gameState.language} theme={gameState.theme} />}
      
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,var(--accent-gold),transparent_80%)]" />

      <div className={`fixed top-4 right-4 md:top-8 md:right-8 flex items-center space-x-2 md:space-x-4 z-50 ${gameState.currentChapter !== null ? 'max-md:hidden' : ''}`}>
        <button onClick={toggleTheme} className="text-amber-500/40 font-serif border border-amber-500/20 px-2 py-1 md:px-4 md:py-2 rounded-full hover:bg-amber-500/10 transition-all text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] backdrop-blur-sm shadow-xl">
          {gameState.theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={toggleLanguage} className="text-amber-500/40 font-serif border border-amber-500/20 px-2 py-1 md:px-4 md:py-2 rounded-full hover:bg-amber-500/10 transition-all text-[10px] md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] backdrop-blur-sm shadow-xl">
          {gameState.language === 'zh' ? 'EN' : 'ZH'}
        </button>
      </div>

      <div className={`relative flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl z-10 transition-all duration-1000 ${showCover ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
        <div className={`metallic-frame relative w-full max-w-5xl h-[100dvh] md:h-[88vh] flex flex-col md:flex-row overflow-hidden rounded-sm`}>
          
          {/* Left Page: Stained, Granular Logbook Cover */}
          <div className={`hidden md:flex w-full md:w-1/2 md:flex-none md:min-w-0 stained-parchment border-r border-amber-950/50 relative flex-col items-center justify-center overflow-hidden transition-all duration-1000 p-12`}>
            {/* Corner Accents */}
            <div className="corner-accent corner-tl" />
            <div className="corner-accent corner-tr" />
            <div className="corner-accent corner-bl" />
            <div className="corner-accent corner-br" />

            {gameState.currentChapter === null ? (
              <div className="w-full h-full flex flex-col items-center justify-between text-amber-950 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center space-x-6 opacity-20">
                   <span className="text-xs font-serif">✡︎</span>
                   <AnchorIcon />
                   <span className="text-xs font-serif">✡︎</span>
                </div>

                <div className="z-10 mt-14 space-y-6">
                  <div className="log-header text-[13px] tracking-[0.4em] text-amber-900/60 mb-2 font-bold uppercase">Chronicle of Macondo</div>
                  <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight text-amber-950/90 drop-shadow-md italic">
                    {gameState.language === 'zh' ? "百年孤独" : "One Hundred Years"} <br/>
                    <span className="text-2xl opacity-80 block mt-2">{gameState.language === 'zh' ? "记忆之书" : "of Solitude"}</span>
                    <span className="text-sm tracking-[0.5em] uppercase font-normal opacity-40 block mt-8">— A.D. MDCCCXX —</span>
                  </h1>
                </div>

                <div className="z-10 w-full space-y-6 text-left handwritten text-amber-950/90 px-8 text-base italic leading-relaxed mt-4">
                   <p className="border-b border-amber-950/10 pb-2">
                      <span className="opacity-40 mr-4 font-bold">I.</span> {gameState.language === 'zh' ? "巨大的冰块在帐篷中闪烁。" : "A giant block of ice glowing in the tent."}
                   </p>
                   <p className="border-b border-amber-950/10 pb-2">
                      <span className="opacity-40 mr-4 font-bold">II.</span> {gameState.language === 'zh' ? "世界太新，许多事物还无名称。" : "The world was so recent that many things lacked names."}
                   </p>
                   <p className="border-b border-amber-950/10 pb-2">
                      <span className="opacity-40 mr-4 font-bold">III.</span> {gameState.language === 'zh' ? "第一个人被捆在树上，最后一个人在被蚂蚁吃掉。" : "The first of the line is tied to a tree, the last being eaten by ants."}
                   </p>
                </div>

                <div className="relative z-10 w-full flex justify-around items-end mb-8 px-4">
                   <div className="sketch-container opacity-50 -rotate-6">
                      <CrossStaffSketch />
                   </div>
                   <div className="sketch-container opacity-70 scale-110">
                      <AstrolabeSketch />
                   </div>
                   <div className="sketch-container opacity-50 rotate-6">
                      <CompassSketch />
                   </div>
                </div>

                <div className="flex flex-col gap-3 z-10 mb-6">
                  {collectedExcerpts.size > 0 && (
                    <button onClick={() => setShowExcerpts(true)} className="group relative px-14 py-3 border-2 border-amber-950/30 text-amber-950/70 font-serif hover:bg-amber-950/5 transition-all uppercase tracking-[0.3em] text-[10px] rounded-sm active:scale-95">
                      📜 {t.viewExcerpts} ({collectedExcerpts.size}/7)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col -m-12">
                <div className="flex-1 relative overflow-hidden group">
                  <ChapterIllustration id={gameState.currentChapter} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f2e8cf]/80 opacity-70 pointer-events-none" />
                </div>
                <div className="px-14 pb-14 pt-10 relative z-10 bg-[#f2e8cf]/30 backdrop-blur-[4px] border-t border-amber-950/10">
                  <div className="flex items-center gap-4 mb-3 opacity-40 font-serif uppercase tracking-[0.4em] text-[11px] text-amber-950 font-bold">
                    <div className="h-px w-10 bg-amber-950/40" />
                    Chapter {gameState.currentChapter}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif text-amber-950 font-bold italic leading-tight mb-4 drop-shadow-sm">
                    {gameState.chapters.find(c => c.id === gameState.currentChapter)?.title[gameState.language]}
                  </h3>
                  <div className="w-16 h-1 bg-amber-950/10 mb-8 rounded-full" />
                  <p className="text-stone-800 font-serif leading-relaxed italic text-lg md:text-xl opacity-90 drop-shadow-sm">
                    {gameState.chapters.find(c => c.id === gameState.currentChapter)?.description[gameState.language]}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Page: Interaction / Selection */}
          <div className="w-full max-md:flex-1 max-md:min-h-0 md:w-1/2 md:flex-none md:min-w-0 parchment relative flex flex-col overflow-hidden md:border-l border-amber-950/40">
            {/* Corner Accents */}
            <div className="corner-accent corner-tl" />
            <div className="corner-accent corner-tr" />
            <div className="corner-accent corner-bl" />
            <div className="corner-accent corner-br" />
            
            <div className={`flex-1 ${isBookEngine(gameState.currentChapter) ? 'overflow-hidden' : 'deckle-edge overflow-y-auto'} custom-scrollbar`}>
              {renderChapter()}
            </div>

            {gameState.currentChapter !== null && (
              <div className="absolute top-3 right-3 md:top-5 md:right-6 flex flex-row items-center gap-2 z-40">
                <button onClick={closeCurrentChapter} title={t.backToIndex} className="page-tool group">
                  <span className="group-hover:-translate-x-0.5 transition-transform duration-300">←</span>
                </button>
                <button onClick={() => setShowInstructions(true)} title={t.instructions} className="page-tool group">
                  <span className="group-hover:scale-110 transition-transform">📜</span>
                </button>
                <button onClick={handleRestartChapter} title={t.replayChapter} className="page-tool group">
                  <span className="group-hover:rotate-180 transition-transform duration-700">↺</span>
                </button>
                <button onClick={handleHintRequest} disabled={(!isBookEngine(gameState.currentChapter) && gameState.hintCooldown > 0) || loadingHint} title="Melquíades" className="page-tool group disabled:opacity-20">
                  {loadingHint ? <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" /> : <span className="group-hover:scale-125 transition-transform">✧</span>}
                </button>
              </div>
            )}
            
            {hint && (
              <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-10 bg-[#fdfaf3]/95 p-5 md:p-10 border-l-4 md:border-l-8 border-amber-900 shadow-[0_30px_80px_rgba(0,0,0,0.5)] text-base md:text-lg font-serif italic text-stone-900 animate-in fade-in slide-in-from-bottom-6 backdrop-blur-xl z-50">
                <button onClick={() => setHint(null)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-950 transition-colors text-2xl font-serif">&times;</button>
                <div className="mb-3 uppercase text-[11px] tracking-[0.4em] text-amber-900/60 font-bold">A Message from Melquíades</div>
                <div className="leading-relaxed drop-shadow-sm">{hint}</div>
              </div>
            )}

            {showInstructions && currentChapterData && (
              <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-stone-950/70 backdrop-blur-sm">
                <div className="parchment stained-parchment w-full max-w-sm p-6 md:p-12 shadow-[0_50px_120px_rgba(0,0,0,0.8)] border-2 border-amber-950/40 relative deckle-edge overflow-y-auto max-h-[90vh]">
                  <button onClick={() => setShowInstructions(false)} className="absolute top-4 right-4 md:top-6 md:right-8 text-3xl md:text-4xl text-amber-950 font-serif hover:scale-110 transition-transform">&times;</button>
                  <h3 className="text-2xl md:text-4xl font-serif text-amber-950 mb-4 md:mb-8 font-bold italic tracking-tight">{t.instructions}</h3>
                  <div className="text-stone-900 font-serif italic leading-relaxed mb-6 md:mb-12 text-base md:text-xl border-y border-amber-950/10 py-4 md:py-8 drop-shadow-sm">
                    {CLASSIC_INSTRUCTIONS[currentChapterData.id] ? (
                      <div className="space-y-4 md:space-y-6">
                        <div><div className="not-italic font-bold text-amber-950 text-sm md:text-base tracking-[0.2em] mb-1">{gameState.language === 'zh' ? '第一关' : 'Stage I'}</div>{CLASSIC_INSTRUCTIONS[currentChapterData.id][gameState.language]}</div>
                        <div><div className="not-italic font-bold text-amber-950 text-sm md:text-base tracking-[0.2em] mb-1">{gameState.language === 'zh' ? '第二关' : 'Stage II'}</div>{currentChapterData.instructions[gameState.language]}</div>
                      </div>
                    ) : currentChapterData.instructions[gameState.language]}
                  </div>
                  <div className="flex flex-col space-y-5">
                    <button onClick={handleAutoSolve} className="w-full bg-amber-950 text-amber-50 py-5 rounded-sm font-serif hover:bg-amber-900 shadow-2xl transition-all active:scale-95 text-base tracking-[0.2em] font-bold uppercase">{t.autoSolve}</button>
                    <button onClick={() => setShowInstructions(false)} className="w-full border-2 border-amber-950/20 text-amber-950/70 py-4 rounded-sm font-serif hover:bg-stone-100/50 transition-all text-sm uppercase tracking-[0.3em] font-bold">{t.close}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Excerpts Collection Viewer */}
      {showExcerpts && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-stone-950/90 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar parchment stained-parchment border-4 border-amber-950 shadow-[0_50px_120px_rgba(0,0,0,0.8)] p-10 md:p-14 deckle-edge">
            <button onClick={() => setShowExcerpts(false)} className="absolute top-6 right-8 text-4xl text-amber-950 font-serif hover:scale-110 transition-transform">&times;</button>
            
            <div className="text-center mb-10">
              <div className="text-[10px] uppercase tracking-[0.5em] text-amber-900/40 font-bold mb-4">{t.excerptTitle}</div>
              <h2 className="text-3xl font-serif text-amber-950 italic font-bold">
                {gameState.language === 'zh' ? '收集的摘录' : 'Collected Excerpts'}
              </h2>
              <div className="text-amber-900/40 text-sm font-serif mt-2">{collectedExcerpts.size} / 7</div>
            </div>

            <div className="space-y-8">
              {[1, 2, 3, 4, 5, 6, 7].map(id => {
                const excerpt = CHAPTER_EXCERPTS[id];
                const isCollected = collectedExcerpts.has(id);
                const chapter = gameState.chapters.find(c => c.id === id);
                return (
                  <div key={id} className={`border-b border-amber-900/10 pb-6 transition-all ${isCollected ? 'opacity-100' : 'opacity-20 blur-sm'}`}>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-amber-900/50 font-bold mb-3 font-serif">
                      Chapter {id} — {chapter?.title[gameState.language]}
                    </div>
                    {isCollected ? (
                      <>
                        <p className="text-amber-950 font-serif italic text-lg leading-relaxed">
                          {excerpt[gameState.language]}
                        </p>
                        <p className="text-amber-900/40 font-serif text-xs mt-2 tracking-widest">
                          {excerpt.attribution[gameState.language]}
                        </p>
                      </>
                    ) : (
                      <p className="text-amber-900/30 font-serif italic text-lg">
                        {gameState.language === 'zh' ? '[ 完成本章解锁 ]' : '[ Complete this chapter to unlock ]'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className={`fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 md:space-x-6 bg-black/50 backdrop-blur-2xl px-5 py-2 md:px-10 md:py-4 rounded-full border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,1)] z-20 transition-all duration-700 ${gameState.currentChapter !== null ? 'opacity-0 translate-y-8 pointer-events-none' : ''}`}>
        {gameState.chapters.map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 md:w-4 md:h-4 rounded-full transition-all duration-1000 ${gameState.unlockedGoldVeins.includes(i + 1) ? 'bg-amber-400 shadow-[0_0_20px_#ffd700]' : 'bg-stone-900 border border-stone-800 shadow-inner'}`} />
        ))}
      </div>
    </div>
  );
};

export default App;
