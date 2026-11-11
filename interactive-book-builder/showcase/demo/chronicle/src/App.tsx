import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BOOK } from './book.config';
import { CHAPTERS, roman } from './chapters';
import { Status, tr, type Lang } from './types';
import { KEYS, askHint, drop, load, store } from './services/store';
import { BookCover } from './components/BookCover';
import { TwoStageChapter } from './components/TwoStageChapter';
import { PagedChapter } from './components/PagedChapter';
import { Emblem } from './components/emblems';

// ================= 进度与解锁 =================
// progressive：第 1 章开放；通过某章第一关（图文章：读完）即解锁下一章；最后一章要等前面每章都完成
// open：全部章节直接开放（历史图文书默认）
type Saved = { statuses: Record<number, Status>; passed: number[]; veins: number[]; lang: Lang; dark: boolean };
const IDS = CHAPTERS.map(c => c.meta.id);
const LAST = IDS[IDS.length - 1];
const OPEN = BOOK.unlock === 'open';
const WITH_EXCERPT = CHAPTERS.filter(c => c.meta.excerpt);
function applyUnlocks(st: Record<number, Status>, passed: number[]) {
  const out: Record<number, Status> = {};
  IDS.forEach((id, i) => {
    if (st[id] === Status.COMPLETED) { out[id] = Status.COMPLETED; return; }
    const prev = IDS[i - 1];
    const open = OPEN || i === 0 ? true
      : id === LAST && IDS.length > 1 ? IDS.slice(0, i).every(p => st[p] === Status.COMPLETED)
      : st[id] === Status.UNLOCKED || st[prev] === Status.COMPLETED || passed.includes(prev);
    out[id] = open ? Status.UNLOCKED : Status.LOCKED;
  });
  return out;
}
function initial(): Saved {
  const s = load<Partial<Saved>>(KEYS.save, {});
  const passed = [...new Set([...(s.passed || []), ...IDS.filter(id => { try { return localStorage.getItem(KEYS.stage(id)) === '2'; } catch { return false; } })])];
  return { statuses: applyUnlocks(s.statuses || {}, passed), passed, veins: s.veins || [], lang: s.lang && BOOK.languages.includes(s.lang) ? s.lang : BOOK.languages[0], dark: !!s.dark };
}

const ChapterIllustration: React.FC<{ src?: string }> = ({ src }) => (
  <div className="w-full h-full relative group overflow-hidden">
    {src
      ? <img src={src} alt="" className="w-full h-full object-cover sepia-[0.35] grayscale-[0.2] transition-all duration-1000 group-hover:scale-110 group-hover:sepia-0 group-hover:grayscale-0" />
      : <div className="w-full h-full stained-parchment" />}
    <div className="absolute inset-0 border-r-4 border-black/20" />
  </div>
);
const Quill = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 line-art-icon">
    <path d="M24 86 Q36 52 80 14 Q84 36 64 56 Q48 72 26 86Z" /><path d="M24 86 Q46 54 80 14 M50 50 l-10 -3 M44 60 l-10 -2 M60 40 l-8 -5" strokeWidth="0.5" />
  </svg>
);

const App: React.FC = () => {
  const [showCover, setShowCover] = useState(true);
  const [st, setSt] = useState<Saved>(initial);
  const [cur, setCur] = useState<number | null>(null);
  const [session, setSession] = useState(0);
  const [autoSolve, setAutoSolve] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [transition, setTransition] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [showExcerpts, setShowExcerpts] = useState(false);
  const [excerpts, setExcerpts] = useState<number[]>(() => load<number[]>(KEYS.excerpts, []));
  const L = st.lang, zh = L === 'zh';
  const ch = useMemo(() => CHAPTERS.find(c => c.meta.id === cur) || null, [cur]);

  useEffect(() => { document.body.classList.toggle('dark-mode', st.dark); store(KEYS.save, st); }, [st]);
  useEffect(() => { store(KEYS.excerpts, excerpts); }, [excerpts]);
  useEffect(() => { document.title = tr(BOOK.title, L); }, [L]);

  const openChapter = (id: number) => {
    if (st.statuses[id] === Status.LOCKED) return;
    setCur(id); setSession(s => s + 1); setHint(null); setShowInfo(false); setFinished(false); setAutoSolve(0);
  };
  const closeChapter = () => { setCur(null); setFinished(false); setShowInfo(false); setTransition(null); setHint(null); };
  const restart = () => {
    if (cur !== null) drop(KEYS.chapter(cur), KEYS.stage(cur), KEYS.page(cur));
    setFinished(false); setTransition(null); setAutoSolve(0); setSession(s => s + 1); setHint(null);
  };
  const stageOne = useCallback((id: number) => setSt(p => {
    const passed = [...new Set([...p.passed, id])];
    return { ...p, passed, statuses: applyUnlocks(p.statuses, passed) };
  }), []);
  const complete = useCallback((id: number) => {
    setSt(p => ({ ...p, statuses: applyUnlocks({ ...p.statuses, [id]: Status.COMPLETED }, p.passed), veins: [...new Set([...p.veins, id])] }));
    if (CHAPTERS.find(c => c.meta.id === id)?.meta.excerpt) { setExcerpts(p => [...new Set([...p, id])]); setTransition(id); }
    else setFinished(true);
  }, []);
  const askForHint = () => {
    if (cur === null) return;
    const h = askHint(cur);
    if (h) setHint(h); // '' = 关卡已在书页里自己说了
  };

  const puzzle = !!ch?.Classic;
  const excerptOf = (id: number) => CHAPTERS.find(c => c.meta.id === id)?.meta.excerpt;

  // 右页浮层：工具按钮 / 过场摘录 / 本章终 / 提示 / 说明（两种章节形态共用）
  const overlays = cur !== null && ch && (
    <>
      <div className="absolute top-3 right-3 md:top-5 md:right-6 flex flex-row items-center gap-2 z-40">
        <button onClick={closeChapter} title={zh ? '回到目录' : 'Index'} className="page-tool">←</button>
        <button onClick={() => setShowInfo(true)} title={zh ? '说明' : 'Instructions'} className="page-tool">📜</button>
        <button onClick={restart} title={zh ? '重来本章' : 'Replay'} className="page-tool"><span className="transition-transform duration-700 hover:rotate-180">↺</span></button>
        <button onClick={askForHint} title={tr(BOOK.guide.name, L)} className="page-tool">✧</button>
      </div>

      {transition !== null && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 overflow-hidden fade-in" style={{ background: 'var(--pp-ink)' }}>
          <div className="relative z-10 max-w-md w-full text-center space-y-8" style={{ color: 'var(--pp-bg)' }}>
            <div className="opacity-40 text-[10px] uppercase tracking-[0.8em] font-serif font-bold">Chapter {roman(transition)} · {zh ? '完成' : 'Complete'}</div>
            <div className="flex items-center justify-center gap-4 opacity-40"><div className="h-px w-16 bg-current" /><div>❂</div><div className="h-px w-16 bg-current" /></div>
            <p className="font-serif italic text-xl md:text-2xl leading-relaxed px-6">{tr(excerptOf(transition)?.text, L)}</p>
            <p className="opacity-50 font-serif text-sm tracking-widest">{tr(excerptOf(transition)?.source, L)}</p>
            <div className="opacity-40 text-[9px] uppercase tracking-[0.4em] font-bold animate-pulse">✧ {zh ? '摘录已收入书中' : 'Excerpt collected'} ✧</div>
            <button onClick={() => { setTransition(null); setFinished(true); }} className="px-12 py-4 border font-serif tracking-[0.4em] text-[11px] hover:bg-white/10 transition-all rounded-sm" style={{ borderColor: 'color-mix(in srgb, var(--pp-bg) 30%, transparent)' }}>
              {zh ? '继续' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {finished && (
        <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-8 fade-in">
          <div className="parchment p-8 md:p-14 border-4 border-ink shadow-2xl space-y-8 max-w-md w-full text-center text-ink">
            <h3 className="text-4xl font-display italic font-bold">{zh ? '本章终' : 'Chapter Concluded'}</h3>
            <div className="flex flex-col gap-5">
              <button onClick={closeChapter} className="btn-ink w-full py-5 rounded-sm font-serif shadow-xl transition-all active:scale-95 text-sm tracking-[0.3em] font-bold">{zh ? '回到目录' : 'Back to Index'}</button>
              <button onClick={puzzle ? restart : () => setFinished(false)} className="w-full border-2 border-ink/40 py-4 rounded-sm font-serif hover:bg-ink/5 transition-all active:scale-95 text-[11px] tracking-[0.4em]">{puzzle ? (zh ? '重玩本章' : 'Replay') : (zh ? '留在这一页' : 'Stay here')}</button>
            </div>
          </div>
        </div>
      )}

      {hint && (
        <div className="absolute bottom-4 left-4 right-4 md:bottom-16 md:left-10 md:right-10 parchment p-5 md:p-8 border-l-4 md:border-l-8 border-accent shadow-2xl text-base md:text-lg font-serif italic text-ink fade-in z-50">
          <button onClick={() => setHint(null)} className="absolute top-4 right-5 opacity-50 hover:opacity-100 text-2xl">&times;</button>
          <div className="mb-3 uppercase text-[11px] tracking-[0.4em] opacity-60 font-bold not-italic">{tr(BOOK.guide.title, L)}</div>
          <div className="leading-relaxed">{hint}</div>
        </div>
      )}

      {showInfo && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
          <div className="stained-parchment w-full max-w-sm p-6 md:p-12 shadow-2xl border-2 border-ink/40 relative overflow-y-auto max-h-[90%] text-ink">
            <button onClick={() => setShowInfo(false)} className="absolute top-4 right-5 text-3xl font-serif hover:scale-110 transition-transform">&times;</button>
            <h3 className="text-2xl md:text-4xl font-display mb-6 font-bold italic">{puzzle ? (zh ? '玩法说明' : 'Instructions') : tr(ch.meta.title, L)}</h3>
            <div className="font-serif italic leading-relaxed mb-8 text-base md:text-lg border-y border-ink/10 py-6 space-y-5">
              {puzzle ? <>
                <div><div className="not-italic font-bold text-sm tracking-[0.2em] mb-1">{zh ? '第一关' : 'Stage I'}</div>{tr(ch.meta.stage1, L)}</div>
                <div><div className="not-italic font-bold text-sm tracking-[0.2em] mb-1">{zh ? '第二关' : 'Stage II'}</div>{tr(ch.meta.stage2, L)}</div>
              </> : <>
                <p>{tr(ch.meta.description, L)}</p>
                <p className="text-sm opacity-75">{tr(ch.meta.stage2, L) || (zh ? '用页脚的 ‹ › 翻页；左页点选条目，右页展开详情。卡住了就点 ✧。' : 'Turn pages with ‹ ›. Tap entries on the left; details open on the right.')}</p>
              </>}
            </div>
            <div className="flex flex-col gap-4">
              {puzzle && <button onClick={() => { setAutoSolve(n => n + 1); setShowInfo(false); }} className="btn-ink w-full py-4 rounded-sm font-serif shadow-xl transition-all active:scale-95 tracking-[0.2em] font-bold">{zh ? '自动完成本关' : 'Auto-solve this stage'}</button>}
              <button onClick={() => setShowInfo(false)} className="w-full border-2 border-ink/20 opacity-70 py-3 rounded-sm font-serif transition-all text-sm tracking-[0.3em] font-bold">{zh ? '关闭' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center p-1 md:p-4 overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }}>
      {showCover && <BookCover onOpen={() => setShowCover(false)} lang={L} />}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, var(--pp-shadow), transparent 80%)' }} />

      {/* 右上角：暗色 / 语言 */}
      <div className={`fixed top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 md:gap-4 z-50 ${cur !== null ? 'max-md:hidden' : ''}`}>
        <button onClick={() => setSt(p => ({ ...p, dark: !p.dark }))} className="text-ink/50 border border-ink/20 px-2 py-1 md:px-4 md:py-2 rounded-full hover:bg-ink/10 transition-all text-[10px] md:text-sm backdrop-blur-sm">
          {st.dark ? '☀️' : '🌙'}
        </button>
        {BOOK.languages.length > 1 && (
          <button onClick={() => setSt(p => ({ ...p, lang: p.lang === 'zh' ? 'en' : 'zh' }))} className="text-ink/50 font-serif border border-ink/20 px-2 py-1 md:px-4 md:py-2 rounded-full hover:bg-ink/10 transition-all text-[10px] md:text-sm tracking-[0.2em] backdrop-blur-sm">
            {zh ? 'EN' : '中'}
          </button>
        )}
      </div>

      <div className={`relative flex items-center justify-center w-full max-w-6xl z-10 transition-all duration-1000 ${showCover ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
        <div className="book-frame relative w-full max-w-5xl h-[100dvh] md:h-[88vh] flex flex-col md:flex-row overflow-hidden rounded-sm">
          {ch?.pages ? (
            <PagedChapter key={`${cur}-${session}`} ch={ch} lang={L} done={st.statuses[ch.meta.id] === Status.COMPLETED} onComplete={() => complete(ch.meta.id)} overlay={overlays} />
          ) : <>
          {/* ============ 左页（桌面端） ============ */}
          <div className="hidden md:flex md:w-1/2 md:flex-none md:min-w-0 stained-parchment border-r border-ink/40 relative flex-col items-center justify-center overflow-hidden p-12">
            <div className="corner-accent corner-tl" /><div className="corner-accent corner-tr" /><div className="corner-accent corner-bl" /><div className="corner-accent corner-br" />
            {ch === null ? (
              <div className="w-full h-full flex flex-col items-center justify-between text-ink text-center">
                <div className="mt-10 space-y-6">
                  <div className="log-header text-[13px] tracking-[0.4em] opacity-60 font-bold">{BOOK.index.leftKicker}</div>
                  <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight italic">
                    {tr(BOOK.title, L)}
                    <span className="text-2xl opacity-80 block mt-2">{tr(BOOK.subtitle, L)}</span>
                    <span className="text-sm tracking-[0.5em] uppercase font-normal opacity-40 block mt-8 not-italic">{BOOK.index.leftEra}</span>
                  </h1>
                </div>
                <div className="w-full space-y-5 text-left handwritten px-8 text-base italic leading-relaxed">
                  {BOOK.index.lines.map((l, i) => (
                    <p key={i} className="border-b border-ink/10 pb-2"><span className="opacity-40 mr-4 font-bold not-italic">{roman(i + 1)}.</span>{tr(l, L)}</p>
                  ))}
                </div>
                <div className="w-full flex justify-around items-end px-4 opacity-60"><div className="-rotate-6"><Quill /></div><Emblem id={BOOK.emblem} className="w-24 h-24 text-ink/60 [--em-b:var(--pp-bg2)]" /><div className="rotate-6"><Quill /></div></div>
                <div className="mb-4 h-10">
                  {excerpts.length > 0 && (
                    <button onClick={() => setShowExcerpts(true)} className="px-12 py-3 border-2 border-ink/30 text-ink/70 font-serif hover:bg-ink/5 transition-all tracking-[0.3em] text-[11px] rounded-sm">
                      📜 {zh ? '收集的摘录' : 'Excerpts'} ({excerpts.length}/{WITH_EXCERPT.length})
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col -m-12">
                <div className="flex-1 relative overflow-hidden">
                  <ChapterIllustration src={ch.meta.image} />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 55%, color-mix(in srgb, var(--pp-bg2) 85%, transparent))' }} />
                </div>
                <div className="px-14 pb-14 pt-10 relative z-10 border-t border-ink/10 text-ink" style={{ background: 'color-mix(in srgb, var(--pp-bg2) 55%, transparent)' }}>
                  <div className="flex items-center gap-4 mb-3 opacity-50 font-serif uppercase tracking-[0.4em] text-[11px] font-bold"><div className="h-px w-10 bg-ink/40" />Chapter {ch.meta.roman || roman(ch.meta.id)}</div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold italic leading-tight mb-4">{tr(ch.meta.title, L)}</h3>
                  <div className="w-16 h-1 bg-ink/10 mb-6 rounded-full" />
                  <p className="font-serif leading-relaxed italic text-lg opacity-90">{tr(ch.meta.description, L)}</p>
                </div>
              </div>
            )}
          </div>

          {/* ============ 右页 ============ */}
          <div className="w-full max-md:flex-1 max-md:min-h-0 md:w-1/2 md:flex-none md:min-w-0 parchment relative flex flex-col overflow-hidden md:border-l border-ink/30">
            <div className="corner-accent corner-tl" /><div className="corner-accent corner-tr" /><div className="corner-accent corner-bl" /><div className="corner-accent corner-br" />
            <div className={`flex-1 min-h-0 ${ch ? 'overflow-hidden' : 'overflow-y-auto'} custom-scrollbar`}>
              {ch === null ? (
                <div className="flex flex-col h-full w-full p-8 md:p-14 text-ink">
                  <h2 className="log-header text-2xl text-center font-bold mt-6 mb-10 tracking-[0.2em] border-b border-ink/20 pb-6">{tr(BOOK.index.heading, L)}</h2>
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {CHAPTERS.map(({ meta }) => {
                      const s = st.statuses[meta.id], locked = s === Status.LOCKED, finalLocked = locked && meta.id === LAST;
                      return (
                        <div key={meta.id} onClick={() => openChapter(meta.id)}
                          className={`flex items-start gap-6 p-4 border-b border-ink/5 transition-all duration-300 ${locked ? `${finalLocked ? 'opacity-40' : 'opacity-15'} grayscale cursor-not-allowed` : 'cursor-pointer hover:bg-ink/5 hover:-translate-x-1'}`}>
                          <div className="w-12 h-12 border border-ink/30 rounded-sm flex items-center justify-center shrink-0 font-serif italic text-lg bg-white/10 shadow-inner">{meta.roman || roman(meta.id)}</div>
                          <div className="flex-1">
                            <div className="handwritten text-xl leading-tight">{s === Status.COMPLETED ? '✓ ' : ''}{tr(meta.title, L)}</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 mt-2 font-bold">{tr(meta.subtitle, L)}</div>
                            {finalLocked && <div className="text-[11px] italic font-serif opacity-80 mt-2 tracking-wider">🔒 {tr(BOOK.index.finalLockNote, L)}</div>}
                          </div>
                          {!locked && <div className="opacity-30 text-xs mt-1">»</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 pt-6 border-t border-ink/10 flex justify-between items-center opacity-40 italic font-serif text-xs tracking-widest">
                    <button onClick={() => setShowCover(true)} className="hover:text-accent transition-colors uppercase font-bold tracking-[0.3em]">« {zh ? '返回封面' : 'Back to cover'}</button>
                    {excerpts.length > 0 && <button onClick={() => setShowExcerpts(true)} className="md:hidden hover:text-accent">📜 {excerpts.length}/{WITH_EXCERPT.length}</button>}
                  </div>
                </div>
              ) : (
                <div key={`${cur}-${session}`} className="page-turn-in h-full relative flex flex-col">
                  <TwoStageChapter ch={ch} lang={L} autoSolveCount={autoSolve}
                    isLast={ch.meta.id === LAST} nextIsLast={IDS[IDS.indexOf(ch.meta.id) + 1] === LAST}
                    onStageOneComplete={() => stageOne(ch.meta.id)} onComplete={() => complete(ch.meta.id)} />
                </div>
              )}
            </div>
            {overlays}
          </div>
          </>}
        </div>
      </div>

      {/* 摘录收藏 */}
      {showExcerpts && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-8 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar stained-parchment border-4 border-ink shadow-2xl p-8 md:p-14 text-ink">
            <button onClick={() => setShowExcerpts(false)} className="absolute top-5 right-7 text-4xl font-serif hover:scale-110 transition-transform">&times;</button>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-display italic font-bold">{zh ? '收集的摘录' : 'Collected Excerpts'}</h2>
              <div className="opacity-40 text-sm font-serif mt-2">{excerpts.length} / {WITH_EXCERPT.length}</div>
            </div>
            <div className="space-y-8">
              {WITH_EXCERPT.map(({ meta }) => {
                const got = excerpts.includes(meta.id);
                return (
                  <div key={meta.id} className={`border-b border-ink/10 pb-6 transition-all ${got ? '' : 'opacity-25 blur-[2px]'}`}>
                    <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-bold mb-3 font-serif">Chapter {meta.roman || roman(meta.id)} — {tr(meta.title, L)}</div>
                    {got ? <>
                      <p className="font-serif italic text-lg leading-relaxed">{tr(meta.excerpt?.text, L)}</p>
                      <p className="opacity-40 font-serif text-xs mt-2 tracking-widest">{tr(meta.excerpt?.source, L)}</p>
                    </> : <p className="opacity-40 font-serif italic text-lg">{zh ? '[ 完成本章解锁 ]' : '[ Complete this chapter to unlock ]'}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 金脉：每章通关点亮一颗 */}
      <div className={`fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 md:gap-6 bg-black/50 backdrop-blur-2xl px-5 py-2 md:px-10 md:py-4 rounded-full border border-white/5 shadow-2xl z-20 transition-all duration-700 ${cur !== null || showCover ? 'opacity-0 translate-y-8 pointer-events-none' : ''}`}>
        {IDS.map(id => (
          <div key={id} className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full transition-all duration-1000"
            style={st.veins.includes(id) ? { background: 'var(--cv-foil)', boxShadow: '0 0 20px var(--cv-foil)' } : { background: '#1c1917', border: '1px solid #292524' }} />
        ))}
      </div>
    </div>
  );
};

export default App;
