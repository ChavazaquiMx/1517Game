// Música y efectos de 16 bits sintetizados con WebAudio (ondas cuadradas, triangulares y ruido).
// Tema principal: "Castillo fuerte es nuestro Dios" (Ein feste Burg), himno de Martín Lutero (c. 1529).
window.SND = (() => {
  let ac = null, comp, musicBus, sfxBus, echo, muted = false, cur = null, pending = null, step = 0, next = 0, pulse25 = null, pulse12 = null, noiseBuf = null;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function pulseWave(duty) { const n = 64, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) { re[k] = 0; im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty); } return ac.createPeriodicWave(re, im); }
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; return; }
    const master = ac.createGain(); master.gain.value = .8; master.connect(ac.destination);
    comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = .42; musicBus.connect(comp);
    sfxBus = ac.createGain(); sfxBus.gain.value = .6; sfxBus.connect(comp);
    // eco corto (como el chip de sonido de la consola)
    echo = ac.createDelay(); echo.delayTime.value = .16; const fb = ac.createGain(); fb.gain.value = .22; const eg = ac.createGain(); eg.gain.value = .25;
    musicBus.connect(echo); echo.connect(fb); fb.connect(echo); echo.connect(eg); eg.connect(comp);
    pulse25 = pulseWave(.25); pulse12 = pulseWave(.125);
    const n = ac.sampleRate; noiseBuf = ac.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    setInterval(sched, 30);
    if (pending) { const p = pending; pending = null; play(p); }
  }
  function env(g, t, a, v, hold, rel) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.setValueAtTime(v, t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel); }
  function tone(type, m, t, d, v, bus, vib) {
    const g = ac.createGain(); env(g, t, .005, v, Math.max(.01, d - .03), .06); g.connect(bus || musicBus);
    const o = ac.createOscillator(); if (type === 'p25') o.setPeriodicWave(pulse25); else if (type === 'p12') o.setPeriodicWave(pulse12); else o.type = type;
    o.frequency.value = mtof(m); o.connect(g); o.start(t); o.stop(t + d + .1);
    if (vib && d > .25) { const l = ac.createOscillator(); l.frequency.value = 5.5; const lg = ac.createGain(); lg.gain.value = 0; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(vib, t + d); l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + d + .1); }
    return o;
  }
  function noise(t, d, v, freq, type, bus) { const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = type || 'highpass'; f.frequency.value = freq || 5000; const g = ac.createGain(); env(g, t, .002, v, .005, d); s.connect(f); f.connect(g); g.connect(bus || musicBus); s.start(t, Math.random() * .5); s.stop(t + d + .05); return f; }
  const kick = (t, v) => { const g = ac.createGain(); env(g, t, .002, v || .5, .02, .12); g.connect(musicBus); const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + .12); o.connect(g); o.start(t); o.stop(t + .2); };
  const snare = (t, v) => noise(t, .12, v || .2, 1800, 'bandpass');
  const hat = (t, v) => noise(t, .03, v || .06, 7000);

  // ---- notación: números MIDI por corchea; null = mantener, 0 = silencio ----
  const _ = null;
  // "Castillo fuerte es nuestro Dios" (Ein feste Burg), en Do mayor
  const P1 = [72, _, 72, _, 72, _, 67, _, 69, _, 71, _, 72, _, _, _, 71, _, 69, _, 67, _, _, _];
  const P2 = [69, _, 71, _, 72, _, 67, _, 64, _, 65, _, 64, _, 62, _, 60, _, _, _, _, _, 0, _];
  const PB = [76, _, 76, _, 74, _, 72, _, 71, _, 69, _, 67, _, _, _, 69, _, 71, _, 72, _, 69, _, 71, _, _, _, 67, _, _, _];
  const BURG = [].concat(P1, P2, P1, P2, PB, P2);
  const rootOf = m => { const pc = ((m % 12) + 12) % 12; return { 0: 48, 4: 48, 7: 48, 5: 41, 9: 45, 11: 43, 2: 43 }[pc] || 48; };
  // tema de campo (original), Do mayor
  const FIELD = [76, _, 79, _, 84, _, 83, 81, 79, _, 76, _, 72, _, 74, 76, 77, _, 81, _, 79, _, 77, 76, 74, _, _, _, 67, _, 0, _,
    76, _, 79, _, 84, _, 83, 81, 79, _, 76, _, 72, _, 76, 79, 81, _, 79, _, 77, _, 74, _, 72, _, _, _, _, _, 0, _,
    81, _, 81, 79, 77, _, 81, _, 79, _, 79, 77, 76, _, 79, _, 77, _, 77, 76, 74, _, 77, _, 76, _, 74, _, 72, _, 71, _,
    69, _, 72, _, 77, _, 76, 74, 72, _, 71, _, 72, _, 74, _, 76, _, _, _, 79, _, 74, _, 72, _, _, _, 0, _, 0, _];
  const FIELD_B = [48, 48, 41, 43, 48, 48, 41, 43, 41, 41, 48, 45, 41, 43, 48, 43];
  // mercado (original), Sol mayor y alegre
  const MARKET = [79, 83, 86, 83, 79, _, 74, _, 76, 79, 83, 79, 76, _, 72, _, 74, 78, 81, 78, 74, _, 76, 78, 79, _, 83, _, 79, _, 0, _];
  const MARKET_B = [43, 48, 50, 43];
  const CH = { C: [60, 64, 67], F: [57, 60, 65], G: [55, 59, 62], Am: [57, 60, 64], Em: [55, 59, 64], Dm: [57, 62, 65], E: [56, 59, 64] };
  const TR = {
    title: { dt: .19, step(i, t) {
      const s = i % BURG.length, m = BURG[s];
      if (m) tone('p25', m, t, this.dt * (BURG[s + 1] === null ? (BURG[s + 2] === null && BURG[s + 3] === null ? 4 : 2) : 1) * .95, .07, null, 14);
      if (m) tone('p12', m - 12, t, this.dt * 1.8, .025);
      let r = 48; for (let k = s; k >= 0; k--) if (BURG[k]) { r = rootOf(BURG[k]); break; }
      if (s % 2 === 0) tone('triangle', s % 4 === 0 ? r - 12 : r, t, this.dt * 1.6, .22);
      if (s % 4 === 0) kick(t, .35); if (s % 8 === 4) snare(t, .14); if (s % 2 === 1) hat(t, .035);
    } },
    chorale: { dt: .34, step(i, t) {
      const s = i % BURG.length, m = BURG[s]; if (!m) return;
      let len = 1; while (BURG[s + len] === null && len < 8) len++;
      tone('p25', m, t, this.dt * len * .95, .05, null, 10); tone('triangle', rootOf(m) - 12, t, this.dt * len, .18); tone('p12', rootOf(m) + 16 > m ? m - 5 : m - 8, t, this.dt * len * .9, .02);
    } },
    field: { dt: .135, step(i, t) {
      const s = i % FIELD.length, m = FIELD[s], bar = Math.floor(s / 8);
      if (m) tone('p25', m, t, this.dt * (FIELD[s + 1] === null ? 2 : 1) * .9, .06, null, 10);
      const b = FIELD_B[bar % 16]; if (s % 2 === 0) tone('triangle', s % 4 === 0 ? b - 12 : b, t, this.dt * 1.5, .22);
      if (s % 4 === 2) { const ch = b === 41 ? CH.F : b === 43 ? CH.G : b === 45 ? CH.Am : CH.C; ch.forEach(n => tone('p12', n + 12, t, this.dt * .8, .015)); }
      if (s % 8 === 0) kick(t, .35); if (s % 8 === 4) snare(t, .12); if (s % 2 === 1) hat(t, .03);
    } },
    market: { dt: .13, step(i, t) {
      const s = i % 32, m = MARKET[s], rep = Math.floor(i / 32) % 2;
      if (m) tone('p25', m + (rep ? 0 : -12), t, this.dt * (MARKET[s + 1] === null ? 2 : 1) * .9, .055);
      const b = MARKET_B[Math.floor(s / 8)]; if (s % 2 === 0) tone('triangle', s % 4 === 0 ? b - 12 : b + 7 - 12, t, this.dt * 1.4, .22);
      if (s % 4 === 0) kick(t, .3); if (s % 4 === 2) hat(t, .06); if (s % 8 === 6) snare(t, .1);
    } },
    storm: { dt: .15, step(i, t) {
      const s = i % 32, bar = Math.floor(i / 32) % 4, roots = [45, 41, 43, 40];
      tone('triangle', roots[bar] - 12 + (s % 2 ? 12 : 0), t, this.dt * .9, .2);
      const mel = [69, 0, 72, 0, 71, 0, 64, 0, 69, 0, 72, 76, 74, 0, 71, 0][s % 16];
      if (mel && s < 16 + (bar % 2) * 16) tone('p25', mel - (bar === 3 ? 1 : 0), t, this.dt * 1.8, .045);
      if (s % 8 === 0) kick(t, .4); if (s % 8 === 4) snare(t, .12); if (s % 4 === 2) hat(t, .03);
    } },
    interior: { dt: .3, step(i, t) {
      const prog = [CH.Dm, CH.C, CH.F, CH.Am, CH.Dm, CH.G, CH.Am, CH.Dm], bar = Math.floor(i / 8) % 8, s = i % 8, ch = prog[bar];
      if (s === 0) tone('triangle', ch[0] - 12, t, this.dt * 7.5, .18);
      const arp = [0, 1, 2, 1, 0, 2, 1, 2]; tone('p12', ch[arp[s]] + 12, t, this.dt * .9, .03);
      const chant = [74, _, 72, 74, 77, _, 76, 74][s]; if (bar % 2 === 0 && chant) tone('p25', chant, t, this.dt * (s === 0 || s === 4 ? 1.9 : .9), .035, null, 8);
    } },
    castle: { dt: .14, step(i, t) {
      const s = i % 32, bar = Math.floor(i / 16) % 4, roots = [40, 36, 38, 35];
      if (s % 2 === 0) tone('triangle', roots[bar] + (s % 4 ? 12 : 0), t, this.dt * 1.6, .22);
      const mel = [64, _, 67, 71, 69, _, 67, 66, 64, _, 59, _, 62, 64, 66, _, 67, _, 69, 71, 72, _, 71, 69, 71, _, 66, _, 64, _, 0, _][s];
      if (mel) tone('p25', mel + 12, t, this.dt * (s < 31 && [64, 67, 71, 69, 66, 59, 62, 72].includes(mel) ? 1.8 : .9), .045, null, 8);
      if (s % 8 === 0) kick(t, .35); if (s % 8 === 4) snare(t, .12); if (s % 2 === 1) hat(t, .025);
    } },
    boss: { dt: .11, step(i, t) {
      const s = i % 16, bar = Math.floor(i / 16) % 4;
      const riff = [45, 45, 57, 45, 48, 45, 55, 45, 45, 45, 57, 45, 52, 51, 50, 49];
      tone('triangle', riff[s] - 12 + (bar === 3 ? 5 : 0), t, this.dt * .9, .24);
      const lead = [69, 0, 72, 0, 76, 0, 75, 0, 76, 0, 72, 0, 69, 0, 68, 0];
      if (bar % 2 === 1 && lead[s]) tone('p25', lead[s] + 12, t, this.dt * 1.6, .045);
      if (bar % 2 === 0 && s % 4 === 0) tone('p12', [81, 79, 77, 76][s / 4], t, this.dt * 3, .03);
      if (s % 4 === 0) kick(t, .45); if (s % 8 === 4) snare(t, .16); hat(t, .02);
    } },
    select: { dt: .16, step(i, t) {
      const s = i % 16, ch = [CH.C, CH.F, CH.G, CH.C][Math.floor(i / 16) % 4];
      tone('p12', ch[s % 3] + 12 + (s % 6 === 5 ? 12 : 0), t, this.dt * .8, .035);
      if (s % 4 === 0) tone('triangle', ch[0] - 12, t, this.dt * 3, .2);
      if (s % 8 === 0) kick(t, .25); if (s % 4 === 2) hat(t, .04);
    } },
    none: { dt: 1, step() {} }
  };

  function sched() {
    if (!ac || !cur || muted) { if (ac) next = ac.currentTime + .1; return; }
    const tr = TR[cur] || TR.none;
    while (next < ac.currentTime + .25) { try { tr.step(step, next); } catch (e) {} next += tr.dt; step++; }
  }
  function play(name) {
    if (!ac) { pending = name; return; }
    if (cur === name) return;
    cur = name; step = 0; next = ac.currentTime + .1;
  }

  // ---- efectos ----
  const now = () => ac.currentTime;
  function sweep(type, f0, f1, d, v) { const t = now(), g = ac.createGain(); env(g, t, .003, v, d * .4, d * .6); g.connect(sfxBus); const o = ac.createOscillator(); if (type === 'p25') o.setPeriodicWave(pulse25); else o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); o.connect(g); o.start(t); o.stop(t + d + .1); }
  function arp(notes, gap, type, v, d) { notes.forEach((m, i) => tone(type || 'p25', m, now() + i * gap, d || gap * 1.1, v || .06, sfxBus)); }
  const FX = {
    jump() { sweep('p25', 300, 700, .14, .06); },
    super() { sweep('p25', 200, 1400, .3, .07); },
    land() { noise(now(), .05, .12, 600, 'lowpass', sfxBus); },
    throw() { sweep('square', 900, 300, .12, .05); noise(now(), .08, .06, 3000, 'bandpass', sfxBus); },
    pluck() { sweep('p25', 200, 500, .08, .06); noise(now(), .1, .1, 1200, 'bandpass', sfxBus); },
    stomp() { sweep('square', 600, 80, .18, .07); },
    hurt() { arp([72, 66, 60], .06, 'square', .06); },
    die() { arp([71, 77, 76, 74, 72, 67, 64, 60], .1, 'p25', .07); },
    pick() { arp([84, 88, 91, 96], .05, 'p12', .06); },
    heal() { arp([72, 76, 79, 84], .06, 'triangle', .14); },
    blip() { tone('p12', 88 + Math.floor(Math.random() * 3), now(), .02, .02, sfxBus); },
    coin() { arp([83, 88], .06, 'p25', .05); },
    charge() { arp([60, 64, 67, 72, 76], .03, 'p12', .04); },
    sola() { arp([72, 76, 79, 84, 79, 84, 88, 91, 96], .07, 'p25', .07); arp([48, 55, 60, 64, 67, 72], .1, 'triangle', .18); },
    bossHit() { sweep('square', 300, 60, .25, .08); noise(now(), .2, .2, 800, 'lowpass', sfxBus); },
    bossDie() { for (let i = 0; i < 6; i++) setTimeout(() => { if (ac) noise(now(), .3, .25, 500, 'lowpass', sfxBus); }, i * 150); arp([60, 64, 67, 72, 76, 79, 84], .12, 'p25', .06); },
    fanfare() { const t = now(); [[72, 0, .15], [72, .15, .15], [72, .3, .15], [72, .45, .45], [68, .9, .45], [70, 1.35, .45], [72, 1.8, .2], [70, 2.0, .15], [72, 2.15, .8]].forEach(([m, o, d]) => { tone('p25', m, t + o, d, .07, sfxBus); tone('p25', m - 5, t + o, d, .04, sfxBus); }); [[48, 0], [44, .9], [46, 1.35], [48, 1.8]].forEach(([m, o]) => tone('triangle', m, t + o, .45, .2, sfxBus)); },
    choose() { arp([72, 79, 84], .07, 'p25', .07); },
    thunder() { noise(now(), 1.2, .5, 300, 'lowpass', sfxBus); },
    splash() { noise(now(), .25, .2, 1500, 'bandpass', sfxBus); },
    good() { arp([76, 79, 84, 88], .07, 'p25', .06); },
    bad() { arp([60, 55], .12, 'triangle', .18); },
    door() { arp([60, 67, 72], .08, 'triangle', .2); },
    gate() { arp([48, 55, 60, 64, 67], .1, 'triangle', .2); },
    chord() { [60, 64, 67, 72].forEach(m => tone('p12', m, now(), 1.2, .04, sfxBus)); arp([84, 88, 91], .15, 'p25', .05); },
    shoot() { sweep('p12', 700, 200, .2, .05); },
    hammer() { noise(now(), .06, .3, 2500, 'bandpass', sfxBus); tone('square', 96, now(), .04, .04, sfxBus); },
    bell() { [1, 2.76, 5.4].forEach((k, i) => { const t = now(), g = ac.createGain(); g.gain.setValueAtTime(.08 / (i + 1), t); g.gain.exponentialRampToValueAtTime(.0001, t + 1.5); g.connect(sfxBus); const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 392 * k; o.connect(g); o.start(t); o.stop(t + 1.6); }); }
  };
  function fx(name) { if (!ac || muted || !FX[name]) return; try { FX[name](); } catch (e) {} }
  function setMuted(m) { muted = m; if (ac) { musicBus.gain.value = m ? 0 : .42; sfxBus.gain.value = m ? 0 : .6; } }
  return { init, play, fx, setMuted, get muted() { return muted; }, get current() { return cur; } };
})();
