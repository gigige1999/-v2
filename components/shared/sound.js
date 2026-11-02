/* =========================================================
   书页游戏共享音效（WebAudio 合成，无外部资源）
   各章节共用同一个声音开关（localStorage.macondo2_snd）
   ========================================================= */
const SND_KEY = 'macondo2_snd';

export const Snd = (() => {
  let ctx = null, drone = null, on = true;
  try { on = localStorage.getItem(SND_KEY) !== '0'; } catch (e) { }
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, d = .2, type = 'sine', g = .15, f2 = null, delay = 0) {
    if (!on) return; const c = ac(); if (!c) return;
    const t = c.currentTime + delay, o = c.createOscillator(), v = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(g, t + .015); v.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(v).connect(c.destination); o.start(t); o.stop(t + d + .05);
  }
  function noise(d = .08, g = .2, freq = 1800, q = 4, delay = 0, type = 'bandpass') {
    if (!on) return; const c = ac(); if (!c) return;
    const t = c.currentTime + delay, len = Math.max(1, Math.floor(c.sampleRate * d));
    const b = c.createBuffer(1, len, c.sampleRate), data = b.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const s = c.createBufferSource(); s.buffer = b;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const v = c.createGain(); v.gain.value = g;
    s.connect(f).connect(v).connect(c.destination); s.start(t);
  }
  const fx = {
    click: () => noise(.04, .1, 2500, 2),
    pick: () => { tone(660, .14, 'triangle', .09); tone(990, .2, 'triangle', .07, null, .07); },
    wrong: () => tone(150, .28, 'sawtooth', .045, 90),
    write: () => { for (let i = 0; i < 3; i++) noise(.06, .07, 4200, 1, i * .05, 'highpass'); },
    ink: () => { tone(420, .25, 'sine', .09, 900); noise(.2, .05, 600, 1, .05, 'lowpass'); },
    chime: (delay = 0) => { tone(880, 1.6, 'sine', .08, null, delay); tone(1318, 1.1, 'sine', .03, null, delay); tone(440, 1.8, 'sine', .045, null, delay); },
    clack: () => { noise(.05, .4, 1100, 6); noise(.03, .22, 2600, 8, .015); },
    knock: (delay = 0) => { noise(.1, .6, 200, 1.5, delay, 'lowpass'); tone(85, .14, 'sine', .3, 55, delay); },
    tick: () => noise(.018, .022, 3400, 8),
    magic: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 1.1, 'sine', .06, null, i * .09)); },
    page: () => { noise(.32, .09, 1300, .7); noise(.18, .05, 3200, 1, .12, 'highpass'); },
    moo: () => { tone(160, .8, 'sawtooth', .03, 115); tone(162, .8, 'triangle', .055, 118); },
    roll: () => noise(.07, .08, 900, 3),
    creak: () => { tone(70, 1.1, 'sawtooth', .035, 150); noise(.6, .05, 400, 2, .1); },
    unlock: () => { noise(.05, .25, 2000, 5); tone(330, .1, 'square', .035, null, .06); noise(.05, .25, 1500, 5, .13); },
    /* 第二章 */
    clink: (delay = 0) => { tone(1900 + Math.random() * 500, .25, 'triangle', .05, null, delay); noise(.03, .2, 5200, 6, delay); },
    coin: () => { [0, .07, .13, .2].forEach((d, i) => { tone(2100 + i * 180, .22, 'triangle', .045, null, d); noise(.02, .12, 6000, 8, d); }); },
    thud: () => { noise(.18, .5, 160, 1.2, 0, 'lowpass'); tone(70, .2, 'sine', .25, 45); },
    hum: () => tone(110, .25, 'sine', .035, 118),
    crack: () => { noise(.06, .35, 3000, 3); noise(.12, .2, 1500, 2, .05); tone(2400, .3, 'sine', .02, 1800, .02); },
    sizzle: () => noise(.07, .045, 6500, 1, 0, 'highpass'),
    hiss: () => { noise(.5, .12, 5000, .8, 0, 'highpass'); tone(300, .3, 'sawtooth', .03, 140); },
    mist: () => { noise(1.4, .08, 700, .6, 0, 'lowpass'); noise(1.1, .03, 4000, 1, .2, 'highpass'); },
    squawk: () => { tone(1300, .14, 'sawtooth', .04, 1900); tone(1700, .16, 'sawtooth', .035, 1100, .16); },
    shimmer: () => { [1568, 1976, 2349, 2637, 3136].forEach((f, i) => tone(f, .9, 'sine', .025, null, i * .06)); }
  };
  function startDrone() {
    if (!on || drone) return; const c = ac(); if (!c) return;
    const g = c.createGain(); g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(.02, c.currentTime + 4);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 360;
    const oscs = [55, 82.6, 110.4, 164.2].map(f => { const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.connect(lp); o.start(); return o; });
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .08; lg.gain.value = 120; lfo.connect(lg).connect(lp.frequency); lfo.start();
    lp.connect(g).connect(c.destination);
    drone = { g, oscs: [...oscs, lfo] };
  }
  function stopDrone() {
    if (!drone || !ctx) return; const d = drone; drone = null;
    d.g.gain.cancelScheduledValues(ctx.currentTime);
    d.g.gain.setValueAtTime(d.g.gain.value, ctx.currentTime);
    d.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    setTimeout(() => d.oscs.forEach(o => { try { o.stop(); } catch (e) { } }), 1200);
  }
  return {
    fx, tone, noise, startDrone, stopDrone, unlock: ac,
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem(SND_KEY, on ? '1' : '0'); } catch (e) { } if (!on) stopDrone(); else startDrone(); return on; }
  };
})();
