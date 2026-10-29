// Motor del juego: plataformas al estilo clásico (arrancar, cargar y lanzar), entidades, guiones, cámara e interfaz.
(() => {
  'use strict';
  const VW = 384, VH = 216, TS = 16, ROWS = 15;
  const $ = id => document.getElementById(id);
  const cv = $('game'), ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  const isTouch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  const A = ART, S = SND;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- guardado ----------
  const SAVE_KEY = 'reforma-lutero-v1';
  let save = { wis: 0, got: {}, done: {}, sola: {}, last: null, char: 'lutero' };
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s) save = Object.assign(save, s); } catch (e) {}
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

  // ---------- personajes jugables ----------
  const PLAYABLE = {
    lutero: { name: 'Lutero', desc: 'Martín Lutero, monje y profesor que redescubrió el evangelio. Equilibrado en todo.', jump: 336, speed: 102, pluck: .26, stats: [3, 3, 3] },
    katharina: { name: 'Katharina', desc: 'Katharina von Bora, la esposa de Lutero (1525). Mantén el salto y flota un momento.', jump: 322, speed: 98, pluck: .3, float: 1.3, stats: [2, 3, 2] },
    melanchthon: { name: 'Melanchthon', desc: 'Felipe Melanchthon, amigo de Lutero y gran maestro del griego. Salta más alto que nadie.', jump: 380, speed: 96, pluck: .32, flutter: true, stats: [2, 5, 2] },
    cranach: { name: 'Cranach', desc: 'Lucas Cranach, pintor e impresor amigo de Lutero. El más fuerte y rápido para arrancar.', jump: 304, speed: 110, pluck: .12, stats: [5, 2, 4] }
  };
  const ORDER = ['lutero', 'katharina', 'melanchthon', 'cranach'];
  function charOutfit(k) { if (k === 'lutero') return A.CH[W.flags.luteroOutfit || 'lutero']; return A.CH[k]; }

  // ---------- constructor de niveles ----------
  class Builder {
    constructor() { this.cols = []; this.plats = []; this.spk = []; this.ents = []; this.ceils = []; this.x = 0; }
    ground(n, h) { for (let i = 0; i < n; i++) this.cols.push({ h }); this.x += n; return this; }
    pit(n) { return this.ground(n, 0); }
    liquid(n, h, depth, kind) { for (let i = 0; i < n; i++) this.cols.push({ h, liq: depth, kind: kind || 'w' }); this.x += n; return this; }
    stairs(n, h0, h1) { for (let i = 0; i < n; i++) this.cols.push({ h: Math.round(h0 + (h1 - h0) * (i + 1) / n) }); this.x += n; return this; }
    plat(x, row, w) { this.plats.push([x, row, w || 3]); return this; }
    spikes(x, w) { this.spk.push([x, w || 1]); return this; }
    ceil(x0, x1, rows) { this.ceils.push([x0, x1, rows]); return this; }
    ent(type, x, o) { this.ents.push(Object.assign({ type, x }, o || {})); return this; }
  }
  function compile(B) {
    const Wd = B.cols.length, g = [];
    for (let y = 0; y < ROWS; y++) g.push(new Array(Wd).fill('.'));
    B.cols.forEach((c, x) => { for (let y = ROWS - c.h; y < ROWS; y++) if (y >= 0) g[y][x] = '#'; if (c.liq) for (let y = ROWS - c.h - c.liq; y < ROWS - c.h; y++) g[y][x] = c.kind; });
    B.ceils.forEach(([x0, x1, r]) => { for (let x = x0; x <= x1 && x < Wd; x++) for (let y = 0; y < r; y++) g[y][x] = '#'; });
    B.plats.forEach(([x, row, w]) => { for (let i = 0; i < w; i++) if (g[row] && x + i < Wd && g[row][x + i] === '.') g[row][x + i] = '='; });
    B.spk.forEach(([x, w]) => { for (let i = 0; i < w; i++) { const c = B.cols[x + i]; if (c) { const y = ROWS - c.h - 1; if (y >= 0) g[y][x + i] = '^'; } } });
    return { grid: g, W: Wd, cols: B.cols };
  }

  // ---------- estado ----------
  let mode = 'title', T = 0, scale = 3;
  const W = { ents: [], projs: [], thrown: [], parts: [], corpses: [], solids: [], waits: [], flags: {}, cam: { x: 0, y: 24, shake: 0, lock: null, target: null } };
  let CHAPTERS = null;
  const D = { open: false, q: [], res: null, full: '', shown: 0, typing: false, choice: -1 };
  let cardOpen = false, fade = 0, fadeTarget = 0, fadeSpeed = 2, flashA = 0;

  // ---------- entrada ----------
  const K = {}, KP = {};
  const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'jump', KeyK: 'jump', KeyZ: 'jump', KeyJ: 'atk', KeyX: 'atk', KeyE: 'talk', Enter: 'talk', KeyF: 'talk' };
  addEventListener('keydown', e => {
    if (cardOpen && !['Escape'].includes(e.code)) { if (/^Digit[1-3]$/.test(e.code)) cardKey(+e.code.slice(5) - 1); return; }
    if (selectOpen) { selectKey(e); return; }
    const k = KEYMAP[e.code];
    if (k) { e.preventDefault(); if (!K[k]) KP[k] = true; K[k] = true; }
    if (e.code === 'Escape' || e.code === 'KeyP') togglePause();
    if (e.code === 'KeyM') toggleMute();
    if (D.open && D.optsShown && /^Digit[1-4]$/.test(e.code)) pickChoice(+e.code.slice(5) - 1);
  });
  addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) K[k] = false; });
  addEventListener('blur', () => { for (const k in K) K[k] = false; });
  function bindBtn(id, key) {
    const b = $(id); if (!b) return;
    const on = e => { e.preventDefault(); if (!K[key]) KP[key] = true; K[key] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (_) {} };
    const off = () => { K[key] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  }
  ['tLeft:left', 'tRight:right', 'tDown:down', 'tJump:jump', 'tAtk:atk', 'tTalk:talk'].forEach(s => { const [id, k] = s.split(':'); bindBtn(id, k); });

  // ---------- mundo ----------
  function tileAt(tx, ty) { if (ty < 0) return '.'; if (ty >= ROWS) return '.'; if (tx < 0 || tx >= W.Wc) return '#'; return W.grid[ty][tx]; }
  function solidT(tx, ty) { return tileAt(tx, ty) === '#'; }
  function rectSolid(l, t, r, b) {
    for (let ty = Math.floor(t / TS); ty <= Math.floor((b - .01) / TS); ty++) for (let tx = Math.floor(l / TS); tx <= Math.floor((r - .01) / TS); tx++) if (solidT(tx, ty)) return true;
    for (const s of W.solids) if (s.on && r > s.x && l < s.x + s.w && b > s.y && t < s.y + s.h) return true;
    return false;
  }
  const collides = o => rectSolid(o.x - o.w / 2, o.y - o.h, o.x + o.w / 2, o.y);
  function moveX(o, dx) { const s = Math.sign(dx); let rem = Math.abs(dx); while (rem > 0) { const st = Math.min(1, rem); o.x += s * st; if (collides(o)) { o.x -= s * st; o.vx = 0; return true; } rem -= st; } return false; }
  function moveY(o, dy) {
    const s = Math.sign(dy); let rem = Math.abs(dy); let landed = false;
    while (rem > 0) {
      const st = Math.min(1, rem), y0 = o.y; o.y += s * st;
      let hit = collides(o);
      if (!hit && s > 0 && !o.drop) { const ty = Math.floor(o.y / TS); if (y0 <= ty * TS + .001 && o.y > ty * TS) { for (let tx = Math.floor((o.x - o.w / 2) / TS); tx <= Math.floor((o.x + o.w / 2 - .01) / TS); tx++) if (tileAt(tx, ty) === '=') { hit = true; o.y = ty * TS + st; break; } } }
      if (hit) { o.y -= s * st; if (s > 0) landed = true; o.vy = 0; break; }
      rem -= st;
    }
    return landed;
  }
  function liquidAt(x, y) { const t = tileAt(Math.floor(x / TS), Math.floor(y / TS)); return (t === '~' || t === 'w') ? t : null; }
  function groundY(x) { const c = W.cols[clamp(Math.floor(x / TS), 0, W.Wc - 1)]; return (ROWS - c.h) * TS; }
  function edgeAhead(e, dir) { const tx = Math.floor((e.x + dir * (e.w / 2 + 2)) / TS), ty = Math.floor((e.y + 2) / TS); const t = tileAt(tx, ty); return t !== '#' && t !== '='; }

  // ---------- partículas y textos ----------
  function burst(x, y, cols, n, spd, g) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = (spd || 40) * (.3 + Math.random()); W.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: .5 + Math.random() * .6, max: 1.1, col: cols[i % cols.length], g: g == null ? 120 : g, sz: Math.random() < .4 ? 2 : 1 }); } }
  function puff(x, y) { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; W.parts.push({ x, y, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, life: .35, max: .35, col: '#ffffff', g: 0, sz: 3 }); } }
  function floatText(txt, wx, wy, cls) { const el = document.createElement('div'); el.className = 'float ' + (cls || ''); el.textContent = txt; el.style.left = ((wx - W.cam.x) * scale) + 'px'; el.style.top = ((wy - W.cam.y) * scale) + 'px'; $('floats').appendChild(el); setTimeout(() => el.remove(), 1400); }
  let toastTimer = 0;
  function banner(t, s, long) { $('toastT').textContent = t; $('toastS').textContent = s || ''; const el = $('toast'); el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), long ? 4200 : 2800); }
  function shake(t, a) { W.cam.shake = Math.max(W.cam.shake, t); W.cam.shakeA = a || 3; }
  function flash(a) { flashA = a || 1; }

  // ---------- guiones ----------
  const wait = s => new Promise(r => W.waits.push({ t: s, r }));
  function lock() { if (W.player) { W.player.ctl = false; W.player.vx = 0; } }
  function unlock() { if (W.player) W.player.ctl = true; }
  function fadeOut(s) { fadeTarget = 1; fadeSpeed = 1 / (s || .5); return wait(s || .5); }
  function fadeIn(s) { fadeTarget = 0; fadeSpeed = 1 / (s || .5); return wait(s || .5); }
  async function walkTo(x, speed) { const p = W.player; lock(); p.auto = { x, speed: speed || 70 }; while (p.auto) await wait(.05); }
  function camTo(x, y) { W.cam.target = { x, y }; }
  function camFree() { W.cam.target = null; }

  // ---------- diálogos ----------
  const NAMES = {};
  function say(lines) { return new Promise(res => { D.q = lines.slice(); D.res = res; D.open = true; D.choice = -1; $('dialog').hidden = false; nextLine(); }); }
  function ask(who, text, opts) { return say([[who, text, opts]]); }
  function nextLine() {
    $('dopts').innerHTML = ''; D.optsShown = false;
    if (!D.q.length) { D.open = false; $('dialog').hidden = true; const r = D.res; D.res = null; if (r) r(D.choice); return; }
    const [who, txt, opts] = D.q.shift();
    $('dname').textContent = who === 'Narrador' ? '' : who;
    D.full = txt; D.shown = 0; D.typing = true; D.opts = opts || null; $('dtext').textContent = '';
    drawPortrait(who);
  }
  function showOpts() {
    if (!D.opts || D.optsShown) return; D.optsShown = true; D.sel = 0;
    D.opts.forEach((o, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'dopt'; b.textContent = (i + 1) + '. ' + o; b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); pickChoice(i); }); $('dopts').appendChild(b); });
    markSel();
  }
  function markSel() { [...$('dopts').children].forEach((b, i) => b.classList.toggle('sel', i === D.sel)); }
  function pickChoice(i) { if (!D.opts || i >= D.opts.length) return; D.choice = i; S.fx('blip'); nextLine(); }
  function advance() { if (D.typing) { D.shown = D.full.length; $('dtext').textContent = D.full; D.typing = false; showOpts(); } else if (!D.opts) nextLine(); }
  $('dialog').addEventListener('pointerdown', e => { if (e.target.closest('.dopt')) return; e.preventDefault(); if (D.open) advance(); });
  const pc = $('portrait').getContext('2d'); pc.imageSmoothingEnabled = false;
  function drawPortrait(who) {
    pc.clearRect(0, 0, 24, 24); pc.fillStyle = '#8fd0ff'; pc.fillRect(0, 0, 24, 24);
    let o = null;
    if (who === 'Lutero' || who === 'Martín') o = A.CH[W.flags.luteroOutfit || 'lutero'];
    else if (who === 'Katharina') o = A.CH.katharina; else if (who === 'Melanchthon') o = A.CH.melanchthon; else if (who === 'Cranach') o = A.CH.cranach;
    else if (who === 'Caballero Jorge') o = A.CH.junker;
    else if (NAMES[who]) o = A.NPC[NAMES[who]];
    if (who === 'Cofre de las indulgencias') { pc.drawImage(A.cofre(0, true), 8, 2, 40, 40, 0, 0, 24, 24); return; }
    if (who === 'Sombra de la Duda') { pc.drawImage(A.sombra(0, true), 6, 0, 48, 48, 0, 0, 24, 24); return; }
    if (o) pc.drawImage(A.person(o, 'idle', 0, 1), 5, 2, 24, 24, 0, 0, 24, 24);
    else pc.drawImage(A.scrollIcon(false), 3, 5);
  }

  // ---------- pergaminos ----------
  let cardRes = null, cardScroll = null;
  function openCard(s) {
    return new Promise(res => {
      cardRes = res; cardScroll = s; cardOpen = true;
      const total = CHAPTERS.reduce((a, c) => a + c.scrolls.length, 0), got = Object.keys(save.got).length;
      $('clabel').textContent = (s.cat ? 'Pergamino del catecismo' : 'Pergamino de la Palabra') + ' · ' + got + ' de ' + total;
      $('cref').textContent = s.ref; $('ctext').textContent = s.cat ? s.text : '«' + s.text + '»';
      $('csrc').textContent = s.src || ''; $('csrc').hidden = !s.src;
      $('cquiz').innerHTML = ''; $('cfoot').innerHTML = '';
      const b = document.createElement('button'); b.className = 'cbtn'; b.type = 'button'; b.textContent = 'Ya lo leí: a la pregunta'; b.onclick = () => showQuiz(s); $('cfoot').appendChild(b);
      $('card').hidden = false; setTimeout(() => b.focus({ preventScroll: true }), 30);
    });
  }
  function showQuiz(s) {
    $('cfoot').innerHTML = ''; const q = $('cquiz'); q.innerHTML = '<div id="cq"></div><div class="opts"></div><p id="cfb"></p>';
    $('cq').textContent = s.q; const box = q.querySelector('.opts');
    const ord = s.opts.map((_, i) => i); for (let i = ord.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; } s._ord = ord;
    ord.forEach((oi, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = (i + 1) + '. ' + s.opts[oi]; b.onclick = () => answer(s, i); box.appendChild(b); });
    box.firstChild.focus({ preventScroll: true });
  }
  function cardKey(i) { if (document.querySelector('.opt') && !document.querySelector('.opt').disabled) answer(cardScroll, i); }
  function answer(s, i) {
    const btns = [...document.querySelectorAll('.opt')]; if (!btns.length || btns[0].disabled || i >= btns.length) return; btns.forEach(b => b.disabled = true);
    const ord = s._ord || s.opts.map((_, k) => k), ok = ord[i] === s.a; btns[ord.indexOf(s.a)].classList.add('ok'); if (!ok) btns[i].classList.add('no');
    $('cfb').textContent = (ok ? '¡Correcto! ' : 'La respuesta es: «' + s.opts[s.a] + '». ') + s.note;
    if (ok) { addWis(20); S.fx('good'); } else { addWis(6); S.fx('bad'); }
    const b = document.createElement('button'); b.className = 'cbtn'; b.type = 'button'; b.textContent = '¡A seguir!'; b.onclick = closeCard; $('cfoot').appendChild(b); b.focus({ preventScroll: true });
  }
  function closeCard() { $('card').hidden = true; cardOpen = false; for (const k in K) K[k] = false; const r = cardRes; cardRes = null; if (r) r(); }

  function setHud(v) { $('hud').hidden = !v; $('menuBtn').hidden = !v; }
  // ---------- conocimiento ----------
  const LEVELS = [[0, 'Aprendiz'], [40, 'Estudiante'], [110, 'Lector de la Biblia'], [200, 'Maestro'], [320, 'Doctor de la Palabra'], [460, 'Reformador']];
  function levelOf(w) { let cur = LEVELS[0], next = null; for (let i = 0; i < LEVELS.length; i++) if (w >= LEVELS[i][0]) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; } return { cur, next }; }
  function addWis(n) { const before = levelOf(save.wis).cur[1]; save.wis += n; persist(); const after = levelOf(save.wis).cur[1]; updateHUD(); if (after !== before) setTimeout(() => banner('¡Nuevo nivel!', 'Ahora eres: ' + after), 600); }
  function updateHUD() {
    const { cur } = levelOf(save.wis); $('levelName').textContent = cur[1];
    const total = CHAPTERS ? CHAPTERS.reduce((a, c) => a + c.scrolls.length, 0) : 0; $('scrollCount').textContent = Object.keys(save.got).length + '/' + total;
    $('solaHud').textContent = '· Solas ' + Object.keys(save.sola).length + '/5';
  }

  // ---------- jugador ----------
  const ST = () => PLAYABLE[W.char || 'lutero'];
  function newPlayer(x, y) { return { x, y, vx: 0, vy: 0, w: 10, h: 26, face: 1, onGround: false, coyote: 0, jumpBuf: 0, inv: 0, hurtT: 0, hp: 3, max: 4, ctl: true, runT: 0, safe: { x, y }, safeT: 0, dead: false, carry: null, pluckT: 0, throwT: 0, duckT: 0, floatT: 0, standOn: null, kneel: false }; }
  function hurt(n, fromX) {
    const p = W.player; if (!p || p.inv > 0 || p.dead || W.flags.noHurt) return;
    p.hp -= n; p.inv = 1.4; p.hurtT = .3; p.vx = (p.x < fromX ? -1 : 1) * 130; p.vy = -200; p.onGround = false; p.standOn = null;
    if (p.carry) dropCarry();
    S.fx('hurt'); shake(.2, 2); burst(p.x, p.y - 16, ['#ff3a5a', '#ffffff'], 8, 60);
    if (p.hp <= 0) die();
  }
  async function die() {
    const p = W.player; p.dead = true; lock(); S.fx('die'); await wait(.8); await fadeOut(.5);
    p.x = W.cp.x; p.y = W.cp.y; p.vx = p.vy = 0; p.hp = 3; p.dead = false; p.inv = 2; p.hurtT = 0; p.carry = null;
    W.ents.forEach(e => { if (e.reset) e.reset(); }); W.projs = []; W.thrown = [];
    snapCam(); await fadeIn(.5);
    const v = [['Narrador', '¡Ánimo! «Porque siete veces cae el justo, y vuelve a levantarse». (Proverbios 24:16)'], ['Narrador', '«Bástate mi gracia; porque mi poder se perfecciona en la debilidad». (2 Corintios 12:9)'], ['Narrador', '«Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones». (Salmo 46:1)']];
    W.deaths = (W.deaths || 0) + 1; await say([v[W.deaths % v.length]]); unlock();
  }
  async function fallPit() {
    const p = W.player; if (p.dead) return; p.hp -= 1; S.fx('hurt'); lock(); p.carry = null;
    if (p.hp <= 0) { p.hp = 0; die(); return; }
    await fadeOut(.25); p.x = p.safe.x; p.y = p.safe.y; p.vx = p.vy = 0; p.inv = 1.2; snapCam(); await fadeIn(.25); unlock();
  }
  // cargar y lanzar
  function carryImg(c) { if (!c) return null; if (c.enemy) { const t = TYPES[c.enemy]; return t.icon ? t.icon(c) : null; } return A.item(c.kind); }
  function dropCarry() { const p = W.player; if (!p.carry) return; throwCarry(true); }
  function throwCarry(drop) {
    const p = W.player, c = p.carry; p.carry = null; p.throwT = .22; S.fx(drop ? 'land' : 'throw');
    const pow = W.char === 'cranach' ? 1.15 : 1;
    if (c.kind === 'llave' || c.keep) { // la llave se queda en el piso
      spawn({ type: 'pickup', kind: c.kind, px: p.x + p.face * 14, py: p.y, keep: true, id: c.id }); return;
    }
    W.thrown.push({ x: p.x + p.face * 6, y: p.y - 30, vx: drop ? p.face * 60 : p.face * 250 * pow, vy: drop ? -60 : -70, g: drop ? 700 : 260, c, img: carryImg(c), life: 1.6, spin: 0 });
  }
  function tryAction() {
    const p = W.player; if (p.pluckT > 0) return;
    if (p.carry) { throwCarry(false); return; }
    // levantar al enemigo sobre el que está parado
    if (p.standOn && p.standOn.liftable) { const e = p.standOn; e.alive = false; p.standOn = null; p.carry = { enemy: e.type, data: e.liftData ? e.liftData() : {} }; p.pluckT = ST().pluck * .6; p.pluckKind = 'enemy'; S.fx('pluck'); return; }
    if (!p.onGround) return;
    // objeto en el suelo
    for (const e of W.ents) if (e.alive && e.type === 'pickup' && Math.abs(e.x - p.x) < 14 && Math.abs(e.y - p.y) < 12) { e.alive = false; p.carry = { kind: e.kind, keep: e.keep, id: e.id }; p.pluckT = ST().pluck * .6; S.fx('pluck'); return; }
    // brote en la hierba
    for (const e of W.ents) if (e.alive && e.type === 'tuft' && !e.gone && Math.abs(e.x - p.x) < 11 && Math.abs(e.y - p.y) < 10) {
      e.gone = true; e.regrowT = e.regrow ? 3.5 : -1; p.pluckT = ST().pluck; p.pluckKind = e.item; p.vx = 0; S.fx('pluck');
      burst(e.x, e.y - 2, ['#7a4a1a', '#3ac04a'], 6, 40);
      const it = e.item; setTimeout(() => { if (W.player === p && !p.dead) { p.carry = { kind: it }; if (it === 'corazon') { p.carry = null; p.hp = Math.min(p.max, p.hp + 1); S.fx('heal'); floatText('+1 corazón', p.x, p.y - 34, 'gold'); } if (it === 'sorpresa') { p.carry = null; } } }, ST().pluck * 1000);
      return;
    }
  }

  function updatePlayer(dt) {
    const p = W.player; if (!p) return;
    const ctl = p.ctl && !p.dead && p.pluckT <= 0, st = ST();
    let ax = 0;
    if (p.auto) { const d = p.auto.x - p.x; if (Math.abs(d) < 3) { p.auto = null; p.vx = 0; } else { ax = Math.sign(d); p.face = ax; } }
    else if (ctl) { if (K.left) ax -= 1; if (K.right) ax += 1; }
    if (p.pluckT > 0) p.pluckT -= dt;
    const inL = liquidAt(p.x, p.y - 8); if (inL && !p.inL) { S.fx('splash'); burst(p.x, p.y - 10, ['#8ad0ff', '#ffffff'], 10, 50); } p.inL = inL;
    // agacharse y supersalto
    const ducking = ctl && K.down && p.onGround && !p.carry;
    if (ducking) { ax = 0; p.duckT += dt; if (p.duckT > 1 && !p.charged) { p.charged = true; S.fx('charge'); } } else if (!K.down || !p.onGround) { if (p.onGround) { p.duckT = 0; p.charged = false; } }
    p.duck = ducking;
    const maxV = p.auto ? p.auto.speed : (inL ? 46 : st.speed) * (p.carry ? .92 : 1);
    if (p.hurtT > 0) p.hurtT -= dt;
    else { const target = ax * maxV, acc = p.onGround ? 1100 : 700; if (Math.abs(target - p.vx) < acc * dt) p.vx = target; else p.vx += Math.sign(target - p.vx) * acc * dt; if (ax) p.face = ax; }
    // salto
    const near = ctl ? findInteract() : null;
    if (ctl && (KP.jump || (KP.up && !near))) p.jumpBuf = .14;
    p.jumpBuf -= dt; p.coyote = p.onGround ? .1 : p.coyote - dt;
    p.drop = false;
    if (p.jumpBuf > 0 && (p.coyote > 0 || inL)) {
      const sup = p.charged ? 1.42 : 1; p.vy = inL ? -200 : -st.jump * sup * (p.carry ? .95 : 1); p.jumpBuf = 0; p.coyote = 0; p.onGround = false; p.standOn = null; p.floatT = st.float || 0; p.flutT = st.flutter ? .55 : 0;
      if (p.charged) { S.fx('super'); burst(p.x, p.y, ['#ffffff', '#ffd23a'], 12, 60); } else S.fx('jump'); p.charged = false; p.duckT = 0;
    }
    if (!K.jump && !K.up && p.vy < -140 && !inL) p.vy = -140;
    // flotar (Katharina) y aletear (Melanchthon)
    p.floating = false;
    if (!p.onGround && (K.jump || K.up) && p.vy > 0) {
      if (st.float && p.floatT > 0) { p.floatT -= dt; p.vy = 0; p.floating = true; }
      else if (st.flutter && p.flutT > 0) { p.flutT -= dt; p.vy = Math.min(p.vy, 40); p.vy -= 900 * dt; p.floating = true; }
    }
    if (!p.floating) p.vy += (inL ? 360 : 960) * dt;
    p.vy = Math.min(p.vy, inL ? 60 : 440);
    // acción
    if (ctl && KP.atk) tryAction();
    if (p.throwT > 0) p.throwT -= dt;
    p.inv -= dt;
    // montado sobre un enemigo o un tronco
    if (p.standOn) { const e = p.standOn; if (!e.alive || Math.abs(e.x - p.x) > (e.rw || 10) + 4) p.standOn = null; else { moveX(p, (e.vx || 0) * dt); p.y = e.top(); p.vy = 0; p.onGround = true; } }
    moveX(p, p.vx * dt);
    const wasAir = !p.onGround, vyBefore = p.vy;
    if (!p.standOn) p.onGround = moveY(p, p.vy * dt) && vyBefore >= 0;
    // aterrizar sobre enemigos / troncos
    if (!p.standOn && vyBefore >= 0) {
      for (const e of W.ents) {
        if (!e.alive || !e.top || e.noRide) continue;
        const top = e.top();
        if (Math.abs(e.x - p.x) < (e.rw || 10) + 3 && p.y >= top - 1 && p.y - vyBefore * dt <= top + 3) { p.y = top; p.vy = 0; p.onGround = true; p.standOn = e; if (wasAir) S.fx('land'); break; }
      }
    }
    if (p.onGround && wasAir && vyBefore > 220) { burst(p.x, p.y, ['#ffffff', '#e8d8b0'], 4, 30, 40); }
    // pinchos
    const tl = Math.floor((p.x - 4) / TS), tr = Math.floor((p.x + 4) / TS), tb = Math.floor((p.y - 2) / TS);
    if (tileAt(tl, tb) === '^' || tileAt(tr, tb) === '^') { hurt(1, p.x + p.face * 10); p.vy = -280; }
    if (p.y > ROWS * TS + 40) fallPit();
    // lugar seguro
    p.safeT -= dt;
    if (p.onGround && !p.standOn && !inL && p.safeT <= 0) { const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS); if (solidT(tx - 1, ty) && solidT(tx + 1, ty) && solidT(tx, ty) && tileAt(tx, ty - 1) !== '^') { p.safe = { x: p.x, y: p.y }; p.safeT = .25; } }
    if (Math.abs(p.vx) > 8 && p.onGround) p.runT += dt * (Math.abs(p.vx) / 100) * 9;
  }
  function heroSprite() {
    const p = W.player, o = charOutfit(W.char || 'lutero');
    let anim = 'idle', f = Math.floor(T * 2.5) % 2;
    if (p.dead) { anim = 'hurt'; f = 0; }
    else if (p.kneel) { anim = 'kneel'; f = 0; }
    else if (p.cheer) { anim = 'cheer'; f = Math.floor(T * 4) % 2; }
    else if (p.hurtT > 0) { anim = 'hurt'; f = 0; }
    else if (p.pluckT > 0) { anim = 'pluck'; f = p.pluckT < ST().pluck * .5 ? 1 : 0; }
    else if (p.throwT > 0) { anim = 'throw'; f = 0; }
    else if (p.duck) { anim = 'duck'; f = 0; }
    else if (p.floating && !p.carry) { anim = 'float'; f = Math.floor(T * 8) % 2; }
    else if (!p.onGround && !p.inL) { anim = p.carry ? 'cjump' : (p.vy < 0 ? 'jump' : 'fall'); f = 0; }
    else if (Math.abs(p.vx) > 8) { anim = p.carry ? 'crun' : 'run'; f = Math.floor(p.runT) % 4; }
    else if (p.carry) anim = 'cidle';
    return A.person(o, anim, f, p.face);
  }

  // ---------- entidades ----------
  function interactRange(e) { return Math.abs(e.x - W.player.x) < (e.range || 22) && Math.abs(e.y - W.player.y) < 40; }
  function findInteract() {
    let best = null, bd = 1e9;
    for (const e of W.ents) { if (!e.alive || !e.talk || e.busy) continue; if (interactRange(e)) { const d = Math.abs(e.x - W.player.x); if (d < bd) { bd = d; best = e; } } }
    return best;
  }
  const TYPES = {};
  function makeEnt(d) {
    const e = Object.assign({ alive: true, t: Math.random() * 10 }, d);
    e.x = d.px != null ? d.px : d.x * TS + 8;
    e.y = d.row != null ? d.row * TS : (d.py != null ? d.py : groundY(e.x));
    e.hx = e.x; e.hy = e.y;
    if (TYPES[e.type] && TYPES[e.type].init) TYPES[e.type].init(e);
    return e;
  }
  function spawn(d) { const e = makeEnt(d); W.ents.push(e); return e; }
  function findEnt(id) { return W.ents.find(e => e.id === id); }
  function touchPlayer(e, w, h) { const p = W.player; return Math.abs(p.x - e.x) < (w + p.w) / 2 && p.y > e.y - h && p.y - p.h < e.y; }
  function killEnemy(e, dir) {
    e.alive = false; S.fx('stomp'); addWis(1); W.kills = (W.kills || 0) + 1;
    const img = TYPES[e.type].icon ? TYPES[e.type].icon(e) : null;
    if (img) W.corpses.push({ img, x: e.x, y: e.y - img.height / 2, vx: dir * 60, vy: -200, rot: 0 });
    burst(e.x, e.y - 8, ['#ffffff', '#ffd23a'], 8, 60);
    if (W.kills % 5 === 0) spawn({ type: 'heart', px: e.x, py: e.y - 10 });
  }

  // persona
  TYPES.npc = {
    init(e) { e.face = e.face || -1; e.anim = e.anim || 'idle'; },
    update(e, dt) {
      if (e.walk) { const d = e.walk.x - e.x; if (Math.abs(d) < 2) { const r = e.walk.r; e.walk = null; e.anim = 'idle'; if (r) r(); } else { e.x += Math.sign(d) * (e.walk.speed || 60) * dt; e.face = Math.sign(d); e.anim = 'run'; } }
      if (e.rise) e.y -= e.rise * dt;
      if (e.watch && !e.walk) e.face = W.player.x < e.x ? -1 : 1;
    },
    draw(e) {
      const o = A.NPC[e.key] || A.CH[e.key]; const f = e.anim === 'run' ? Math.floor(T * 10) % 4 : Math.floor(T * 2 + e.t) % 2;
      const spr = A.person(o, e.anim, f, e.face);
      if (e.alpha != null) ctx.globalAlpha = e.alpha;
      ctx.drawImage(spr, Math.round(e.x - 16 - W.cam.x), Math.round(e.y - 38 - W.cam.y));
      ctx.globalAlpha = 1;
      if (e.mark && e.talk && !e.talked) { const b = Math.round(Math.sin(T * 5) * 1.5), x = Math.round(e.x - W.cam.x), y = Math.round(e.y - 46 + b - W.cam.y); A.P(ctx, x - 3, y - 7, 6, 9, '#000'); A.P(ctx, x - 2, y - 6, 4, 7, '#ffd23a'); A.P(ctx, x - 1, y - 5, 2, 3, '#000'); A.P(ctx, x - 1, y - 1, 2, 1, '#000'); }
    }
  };
  TYPES.prop = {
    init(e) { e.img = A.prop(e.kind); },
    draw(e) { if (!e.img) return; const x = Math.round(e.x - e.img.width / 2 - W.cam.x), y = Math.round(e.y - e.img.height - W.cam.y + (e.dy || 0)); if (e.alpha != null) ctx.globalAlpha = e.alpha; ctx.drawImage(e.flip ? A.flip(e.img) : e.img, x, y); ctx.globalAlpha = 1;
      if (e.kind === 'hoguera' && e.lit) for (let i = 0; i < 4; i++) { const fx = x + 8 + i * 5, h = 10 + Math.sin(T * 12 + i) * 4; A.poly(ctx, [[fx - 4, y + 22], [fx, y + 22 - h - 8], [fx + 4, y + 22]], i % 2 ? '#ff8a2a' : '#ffd23a'); }
      if (e.kind === 'vela') A.P(ctx, x + 4 + (Math.random() < .2 ? 1 : 0), y, 2, 3, '#ffd23a');
      if (e.label && e.talk && !e.talked) { const b = Math.round(Math.sin(T * 5) * 1.5), cx = Math.round(e.x - W.cam.x); A.P(ctx, cx - 3, y - 12 + b, 6, 9, '#000'); A.P(ctx, cx - 2, y - 11 + b, 4, 7, '#ffd23a'); A.P(ctx, cx - 1, y - 10 + b, 2, 3, '#000'); A.P(ctx, cx - 1, y - 6 + b, 2, 1, '#000'); }
    }
  };
  // farol: punto de control
  TYPES.lamp = {
    init(e) { e.on = false; },
    update(e) { if (!e.on && Math.abs(W.player.x - e.x) < 14 && Math.abs(W.player.y - e.y) < 30) { e.on = true; W.cp = { x: e.x, y: e.y }; W.player.hp = Math.max(W.player.hp, 3); S.fx('heal'); burst(e.x, e.y - 34, ['#ffe060', '#ffffff'], 14, 40, -20); banner('¡Farol encendido!', '«Lámpara es a mis pies tu palabra» · Salmo 119:105'); } },
    draw(e) { const img = A.prop(e.on ? 'farolOn' : 'farol'); ctx.drawImage(img, Math.round(e.x - 7 - W.cam.x), Math.round(e.y - 40 - W.cam.y)); }
  };
  TYPES.scroll = {
    init(e) { e.alive = !save.got[e.sid]; },
    update(e) {
      if (Math.abs(W.player.x - e.x) < 14 && Math.abs(W.player.y - 10 - (e.y - 10)) < 26) {
        e.alive = false; save.got[e.sid] = true; persist(); S.fx('pick'); burst(e.x, e.y - 12, ['#ffffff', '#ffd23a', '#ff3a5a'], 18, 50, -10); updateHUD();
        runScript(async () => { lock(); await openCard(e.data); unlock(); });
      }
    },
    draw(e) { const b = Math.sin(T * 3 + e.t) * 2; ctx.drawImage(A.scrollIcon(e.data.cat), Math.round(e.x - 9 - W.cam.x), Math.round(e.y - 22 + b - W.cam.y)); if (Math.floor(T * 3 + e.t) % 3 === 0) A.P(ctx, Math.round(e.x + 6 - W.cam.x), Math.round(e.y - 26 + b - W.cam.y), 2, 2, '#ffffff'); }
  };
  // medalla de una de las cinco solas
  TYPES.sola = {
    init(e) { e.alive = !save.sola[e.ch]; },
    update(e) {
      if (Math.abs(W.player.x - e.x) < 16 && Math.abs(W.player.y - 14 - (e.y - 14)) < 28) {
        e.alive = false; save.sola[e.ch] = e.name; persist(); S.fx('sola'); flash(.6); burst(e.x, e.y - 14, ['#ffd23a', '#ffffff', '#ff8a2a'], 40, 90, 0); addWis(30); updateHUD();
        runScript(async () => { lock(); W.player.cheer = true; banner(e.name, e.meaning, true); await wait(1.4); W.player.cheer = false; if (e.onGet) await e.onGet(); unlock(); });
      }
    },
    draw(e) { const b = Math.sin(T * 2.5) * 3, img = A.solaMedal(e.letter), sq = Math.abs(Math.cos(T * 2)); const w = Math.max(2, Math.round(22 * sq)); ctx.drawImage(img, Math.round(e.x - w / 2 - W.cam.x), Math.round(e.y - 30 + b - W.cam.y), w, 22); if (Math.floor(T * 4) % 2) A.P(ctx, Math.round(e.x + 9 - W.cam.x), Math.round(e.y - 32 + b - W.cam.y), 2, 2, '#ffffff'); }
  };
  TYPES.trigger = {
    update(e) { if (e.done) return; const p = W.player; if (p.x >= e.x - 8 && p.x <= e.x + (e.w || 1) * TS && p.ctl) { if (e.cond && !e.cond()) return; e.done = true; runScript(e.run); } }
  };
  TYPES.exit = {
    init(e) { if (!e.auto) e.talk = async () => { const msg = e.need && e.need(); if (msg) { await say([['Narrador', msg]]); return; } await (e.go ? e.go() : nextArea()); }; },
    update(e) { if (!e.auto || e.done) return; if (W.player.x > e.x - 8 && W.player.ctl) { const msg = e.need && e.need(); if (msg) { if (!e.warned) { e.warned = true; runScript(async () => { lock(); await say([['Narrador', msg]]); W.player.x -= 16; unlock(); e.warned = false; }); } return; } e.done = true; runScript(async () => { lock(); await (e.go ? e.go() : nextArea()); }); } },
    draw(e) { if (e.kind) { const img = A.prop(e.kind); ctx.drawImage(img, Math.round(e.x - img.width / 2 - W.cam.x), Math.round(e.y - img.height - W.cam.y)); } }
  };
  // brote de hierba que se puede arrancar
  TYPES.tuft = {
    init(e) { e.item = e.item || 'nabo'; e.back = true; e.reset = () => { e.gone = false; }; },
    update(e, dt) { if (e.gone && e.regrowT > 0) { e.regrowT -= dt; if (e.regrowT <= 0) { e.gone = false; puff(e.x, e.y - 4); } } },
    draw(e) { if (e.gone) return; const img = A.item(e.item === 'tintero' ? 'tuftInk' : 'tuft'), w = Math.round(Math.sin(T * 3 + e.t) * .8); ctx.drawImage(img, Math.round(e.x - 7 + w - W.cam.x), Math.round(e.y - 8 - W.cam.y)); }
  };
  // objeto en el piso (la llave, etc.)
  TYPES.pickup = {
    draw(e) { const img = A.item(e.kind); const b = e.kind === 'llave' ? Math.round(Math.sin(T * 3) * 1.5) : 0; ctx.drawImage(img, Math.round(e.x - img.width / 2 - W.cam.x), Math.round(e.y - img.height - W.cam.y + b)); }
  };
  // corazón flotante
  TYPES.heart = {
    init(e) { e.life = 7; },
    update(e, dt) { e.life -= dt; e.y -= 18 * dt; e.x = e.hx + Math.sin(T * 3) * 8; if (e.life <= 0) e.alive = false; if (Math.abs(W.player.x - e.x) < 12 && Math.abs(W.player.y - 14 - e.y) < 20) { e.alive = false; W.player.hp = Math.min(W.player.max, W.player.hp + 1); S.fx('heal'); floatText('+1 corazón', e.x, e.y - 10, 'gold'); } },
    draw(e) { if (e.life < 2 && Math.floor(T * 10) % 2) return; ctx.drawImage(A.item('corazon'), Math.round(e.x - 6 - W.cam.x), Math.round(e.y - 6 - W.cam.y)); }
  };
  // tronco que se mueve (plataforma)
  TYPES.log = {
    init(e) { e.w = (e.wTiles || 3) * TS; e.rw = e.w / 2; e.x0 = (e.x0 != null ? e.x0 : e.x / TS - 2) * TS; e.x1 = (e.x1 != null ? e.x1 : e.x / TS + 2) * TS; e.vx = e.speed || 30; e.y = e.row * TS; e.top = () => e.y; e.noHurt = true; },
    update(e, dt) { e.x += e.vx * dt; if (e.x < e.x0) { e.x = e.x0; e.vx = Math.abs(e.vx); } if (e.x > e.x1) { e.x = e.x1; e.vx = -Math.abs(e.vx); } },
    draw(e) { const x = Math.round(e.x - e.w / 2 - W.cam.x), y = Math.round(e.y - W.cam.y); A.P(ctx, x, y, e.w, 8, '#000'); A.P(ctx, x + 1, y + 1, e.w - 2, 6, '#c07a3a'); A.P(ctx, x + 1, y + 1, e.w - 2, 1, '#ffb070'); A.P(ctx, x + 1, y + 6, e.w - 2, 1, '#8a4a1a'); A.disc(ctx, x + 4, y + 4, 2.5, '#f0c080'); A.disc(ctx, x + e.w - 5, y + 4, 2.5, '#f0c080'); }
  };
  // rayo de la tormenta
  TYPES.bolt = {
    update(e, dt) {
      const p = W.player; if (!p.ctl || p.x < e.x0 * TS || p.x > e.x1 * TS) return;
      e.t2 = (e.t2 == null ? 1.5 : e.t2) - dt;
      if (e.t2 <= 0) { e.t2 = rnd(1.6, 2.6); W.projs.push({ kind: 'warn', x: p.x + rnd(-30, 60) + p.vx * .5, y: 0, life: .7, strike: true }); }
    }
  };
  // ---- enemigos ----
  function walker(e, dt, sp) {
    e.vy = Math.min((e.vy || 0) + 900 * dt, 400);
    if (e.onG && (e.turnEdge !== false) && edgeAhead(e, Math.sign(e.vx))) e.vx = -e.vx;
    if (moveX(e, e.vx * dt)) e.vx = -e.vx;
    const vb = e.vy; e.onG = moveY(e, e.vy * dt) && vb >= 0;
    if (e.y > ROWS * TS + 30) e.alive = false;
  }
  function hitByThrown(e) { return e.hurtbox; }
  TYPES.bula = {
    init(e) { e.w = 12; e.h = 16; e.rw = 7; e.vx = (e.dir || -1) * (e.red ? 34 : 24); e.vy = 0; e.liftable = true; e.top = () => e.y - 18; e.hurtbox = () => [e.x - 7, e.y - 18, e.x + 7, e.y]; e.hit = d => killEnemy(e, d); e.reset = () => { e.x = e.hx; e.y = e.hy; e.alive = true; }; e.name = e.red ? 'Bula roja' : 'Bula'; },
    icon: e => A.bula(0, e && (e.red || (e.data && e.data.red))),
    liftData() { return {}; },
    update(e, dt) { walker(e, dt); if (W.player.standOn !== e && touchPlayer(e, 10, 16) && W.player.y > e.top() + 3) hurt(1, e.x); },
    draw(e) { let s = A.bula(Math.floor(T * 6 + e.t) % 2, e.red); if (e.vx > 0) s = A.flip(s); ctx.drawImage(s, Math.round(e.x - 10 - W.cam.x), Math.round(e.y - 21 - W.cam.y)); }
  };
  TYPES.moneda = {
    init(e) { e.w = 12; e.h = 14; e.rw = 7; e.vx = 0; e.vy = 0; e.cd = rnd(.4, 1.2); e.liftable = true; e.top = () => e.y - 15; e.hurtbox = () => [e.x - 7, e.y - 15, e.x + 7, e.y]; e.hit = d => killEnemy(e, d); e.reset = () => { if (e.spit) { e.alive = false; return; } e.x = e.hx; e.y = e.hy; e.alive = true; }; },
    icon: () => A.moneda(1),
    update(e, dt) {
      e.cd -= dt; const p = W.player;
      if (e.spit) { e.vy = Math.min(e.vy + 900 * dt, 400); if (moveX(e, e.vx * dt)) e.vx = -e.vx; const vb = e.vy; if (moveY(e, e.vy * dt) && vb >= 0) { e.onG = true; if (e.cd <= 0) { e.vy = -120; e.cd = .5; } } e.life = (e.life || 7) - dt; if (e.life <= 0) e.alive = false; }
      else { if (e.onG) { e.vx = 0; if (e.cd <= 0 && Math.abs(p.x - e.x) < 180) { e.vy = -250; e.vx = Math.sign(p.x - e.x) * 40; e.cd = rnd(1, 1.8); e.onG = false; S.fx('coin'); } } walker(e, dt); }
      if (e.y > ROWS * TS + 30) e.alive = false;
      if (W.player.standOn !== e && touchPlayer(e, 10, 14) && W.player.y > e.top() + 3) hurt(1, e.x);
    },
    draw(e) { const s = A.moneda(e.onG ? (e.cd < .3 ? 0 : 1) : 2); ctx.drawImage(s, Math.round(e.x - 9 - W.cam.x), Math.round(e.y - 17 - W.cam.y)); }
  };
  TYPES.cuervo = {
    init(e) { e.vx = (e.dir || -1) * 46; e.y = (e.rowY || 7) * TS; e.hy = e.y; e.hurtbox = () => [e.x - 9, e.y - 12, e.x + 9, e.y]; e.hit = d => killEnemy(e, d); e.reset = () => { e.x = e.hx; e.y = e.hy; e.alive = true; }; e.noRide = true; },
    icon: () => A.cuervo(0),
    update(e, dt) {
      const p = W.player; e.x += e.vx * dt; e.y = e.hy + Math.sin(e.t * 2) * 10;
      if (Math.abs(e.x - e.hx) > (e.range || 90)) e.vx = -e.vx;
      if (touchPlayer(e, 14, 12)) hurt(1, e.x);
    },
    draw(e) { let s = A.cuervo(Math.floor(T * 8) % 2); if (e.vx > 0) s = A.flip(s); ctx.drawImage(s, Math.round(e.x - 12 - W.cam.x), Math.round(e.y - 14 - W.cam.y)); }
  };
  // jefe 1: el cofre de las indulgencias
  TYPES.cofre = {
    init(e) { e.hp = 5; e.max = 5; e.state = 'wait'; e.st = 0; e.face = -1; e.inv = 0; e.w = 40; e.h = 40; e.vy = 0; e.hurtbox = () => [e.x - 20, e.y - 40, e.x + 20, e.y]; e.noRide = true;
      e.hit = d => { if (e.state === 'wait' || e.state === 'dying' || e.inv > 0) return; e.hp--; e.inv = 1; S.fx('bossHit'); shake(.3, 3); burst(e.x, e.y - 30, ['#ffd23a', '#ffffff'], 16, 90); updateBoss(e); if (e.hp <= 0) { e.state = 'dying'; e.st = 0; } };
      e.reset = () => { if (e.state !== 'wait' && e.state !== 'dying') { e.hp = Math.min(e.max, e.hp + 1); e.x = e.hx; updateBoss(e); } }; },
    update(e, dt) {
      if (e.state === 'wait') return;
      const p = W.player; e.st += dt; e.inv -= dt; e.face = p.x < e.x ? -1 : 1;
      e.vy = Math.min(e.vy + 900 * dt, 400); const vb = e.vy; const og = moveY(e, e.vy * dt) && vb >= 0;
      if (e.state === 'hop') { if (og && e.st > .6) { e.vy = -220; e.hopDir = (e.x < (e.ax0 + e.ax1) / 2 * TS) ? 1 : (Math.random() < .5 ? -1 : 1); S.fx('land'); e.st = 0; e.hops = (e.hops || 0) + 1; } if (!og) moveX(e, e.hopDir * 50 * dt); if (e.hops >= 2 && og) { e.state = 'spit'; e.st = 0; e.hops = 0; e.shots = 0; } }
      else if (e.state === 'spit') { e.open = true; const n = e.hp <= 2 ? 3 : 2; if (e.st > .5 + e.shots * .7 && e.shots < n) { e.shots++; S.fx('coin'); spawn({ type: 'moneda', px: e.x + e.face * 22, py: e.y - 22, spit: true, vx0: e.face * 70 }).vx = e.face * 75; } if (e.st > .6 + n * .7) { e.open = false; e.state = 'hop'; e.st = 0; } }
      else if (e.state === 'dying') { e.open = true; if (Math.random() < .5) burst(e.x + rnd(-20, 20), e.y - rnd(10, 40), ['#ffd23a', '#ffffff', '#ff8a2a'], 3, 70); if (e.st > 2 && !e.ended) { e.ended = true; e.alive = false; W.ents.forEach(o => { if (o.type === 'moneda') o.alive = false; }); burst(e.x, e.y - 20, ['#ffd23a', '#ffffff'], 50, 140); S.fx('bossDie'); shake(.6, 4); if (e.onDefeat) runScript(e.onDefeat); } }
      if (e.state !== 'dying' && touchPlayer(e, 34, 36)) hurt(1, e.x);
    },
    draw(e) { if (e.state === 'wait' && !e.showWait) return; if (e.inv > 0 && Math.floor(T * 16) % 2) return; let s = A.cofre(Math.floor(T * 4) % 2, !!e.open); if (e.face > 0) s = A.flip(s); ctx.drawImage(s, Math.round(e.x - 28 - W.cam.x), Math.round(e.y - 48 - W.cam.y)); }
  };
  // jefe 2: la Sombra de la Duda
  TYPES.sombraBoss = {
    init(e) { e.hp = 6; e.max = 6; e.state = 'wait'; e.st = 0; e.inv = 0; e.gy = e.y; e.y = e.gy - 70; e.hurtbox = () => [e.x - 22, e.y - 44, e.x + 22, e.y - 4]; e.noRide = true;
      e.hit = d => { if (e.state === 'wait' || e.state === 'dying' || e.inv > 0) return; e.hp--; e.inv = 1; S.fx('bossHit'); shake(.3, 3); burst(e.x, e.y - 24, ['#1a1a3a', '#7a5ac0', '#ffffff'], 18, 90); updateBoss(e); if (e.hp <= 0) { e.state = 'dying'; e.st = 0; } };
      e.reset = () => { if (e.state !== 'wait' && e.state !== 'dying') { e.hp = Math.min(e.max, e.hp + 1); updateBoss(e); e.state = 'float'; e.st = 0; } }; },
    update(e, dt) {
      if (e.state === 'wait') return;
      const p = W.player; e.st += dt; e.inv -= dt; const A0 = e.ax0 * TS + 30, A1 = e.ax1 * TS - 30;
      if (e.state === 'float') { const tx = clamp(p.x + Math.sin(T * .7) * 80, A0, A1); e.x += (tx - e.x) * dt * 1.2; e.y += (e.gy - 72 + Math.sin(T * 2) * 8 - e.y) * dt * 3; if (e.st > 1.6) { e.shots = 0; e.state = Math.random() < .5 ? 'shoot' : 'swoop'; e.st = 0; e.dir = p.x < e.x ? -1 : 1; } }
      else if (e.state === 'shoot') { const n = e.hp <= 3 ? 4 : 3; if (e.st > .4 + e.shots * .45 && e.shots < n) { e.shots++; S.fx('shoot'); const a = Math.atan2(p.y - 12 - (e.y - 26), p.x - e.x); W.projs.push({ kind: 'duda', x: e.x, y: e.y - 26, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, r: 5, dmg: 1 }); } if (e.st > .6 + n * .45) { e.state = 'float'; e.st = 0; } }
      else if (e.state === 'swoop') { if (e.st < .6) { e.y += (e.gy - 6 - e.y) * dt * 4; } else { e.x += e.dir * 130 * dt; if (e.x < A0 || e.x > A1 || e.st > 3) { e.x = clamp(e.x, A0, A1); e.state = 'float'; e.st = 0; } } }
      else if (e.state === 'dying') { e.y -= 10 * dt; if (Math.random() < .5) burst(e.x + rnd(-24, 24), e.y - rnd(4, 40), ['#7a5ac0', '#ffffff', '#ffd23a'], 3, 70); if (e.st > 2.2 && !e.ended) { e.ended = true; e.alive = false; burst(e.x, e.y - 24, ['#ffffff', '#ffd23a'], 60, 150); S.fx('bossDie'); flash(.7); if (e.onDefeat) runScript(e.onDefeat); } }
      if (e.state !== 'dying' && touchPlayer(e, 36, 40)) hurt(1, e.x);
    },
    draw(e) { if (e.state === 'wait') return; if (e.inv > 0 && Math.floor(T * 16) % 2) return; const s = A.sombra(Math.floor(T * 6) % 4, e.state !== 'float'); if (e.state === 'dying') ctx.globalAlpha = Math.max(0, 1 - e.st / 2.2); ctx.drawImage(s, Math.round(e.x - 30 - W.cam.x), Math.round(e.y - 50 - W.cam.y)); ctx.globalAlpha = 1; }
  };
  function updateBoss(e) { if (!e) { $('boss').hidden = true; return; } $('boss').hidden = false; $('bossName').textContent = e.bossName || 'Jefe'; $('bossBar').style.width = Math.max(0, e.hp / e.max * 100) + '%'; }

  // ---------- proyectiles ----------
  function updateProjs(dt) {
    const p = W.player;
    for (const q of W.projs) {
      q.life = (q.life == null ? 6 : q.life) - dt;
      if (q.kind === 'warn') { if (q.life <= 0) { q.dead = true; if (q.strike) { W.projs.push({ kind: 'bolt', x: q.x, y: 0, life: .25 }); S.fx('thunder'); W.lightning = .15; if (Math.abs(p.x - q.x) < 12) hurt(1, q.x); } } continue; }
      if (q.kind === 'bolt') { if (q.life <= 0) q.dead = true; continue; }
      q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (solidT(Math.floor(q.x / TS), Math.floor(q.y / TS))) { q.dead = true; puff(q.x, q.y); continue; }
      if (q.life <= 0 || q.y > ROWS * TS + 20) { q.dead = true; continue; }
      if (p && !p.dead && Math.abs(q.x - p.x) < q.r + 5 && q.y > p.y - p.h - q.r && q.y < p.y + q.r && p.inv <= 0) { q.dead = true; hurt(q.dmg, q.x - q.vx); }
    }
    W.projs = W.projs.filter(q => !q.dead);
    // objetos lanzados por el jugador
    for (const q of W.thrown) {
      q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; q.spin += dt * 14;
      if (solidT(Math.floor(q.x / TS), Math.floor(q.y / TS)) || q.life <= 0 || q.y > ROWS * TS + 20) { q.dead = true; puff(q.x, q.y); continue; }
      for (const e of W.ents) {
        if (!e.alive || !e.hurtbox || !e.hit) continue; const hb = e.hurtbox();
        if (q.x + 5 > hb[0] && q.x - 5 < hb[2] && q.y + 5 > hb[1] && q.y - 5 < hb[3]) { e.hit(Math.sign(q.vx) || 1); q.dead = true; puff(q.x, q.y); break; }
      }
    }
    W.thrown = W.thrown.filter(q => !q.dead);
    for (const c of W.corpses) { c.vy += 700 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += dt * 8; }
    W.corpses = W.corpses.filter(c => c.y < ROWS * TS + 60);
  }
  function drawProjs() {
    for (const q of W.projs) {
      const x = Math.round(q.x - W.cam.x), y = Math.round(q.y - W.cam.y);
      if (q.kind === 'warn') { if (Math.floor(T * 14) % 2) { A.P(ctx, x - 1, 0, 2, VH, 'rgba(255,255,160,.5)'); } }
      else if (q.kind === 'bolt') { let yy = 0, xx = x; while (yy < VH) { const nx = xx + rnd(-6, 6), ny = yy + 14; A.line(ctx, xx, yy, nx, ny, 4, '#fff6a0'); A.line(ctx, xx, yy, nx, ny, 2, '#ffffff'); xx = nx; yy = ny; } }
      else if (q.kind === 'duda') { A.disc(ctx, x, y, 6, '#000'); A.disc(ctx, x, y, 5, '#7a5ac0'); ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y + 1); }
    }
    for (const q of W.thrown) { if (!q.img) continue; ctx.save(); ctx.translate(Math.round(q.x - W.cam.x), Math.round(q.y - W.cam.y)); ctx.rotate(Math.round(q.spin / (Math.PI / 2)) * Math.PI / 2); ctx.drawImage(q.img, -q.img.width / 2, -q.img.height / 2); ctx.restore(); }
    for (const c of W.corpses) { ctx.save(); ctx.translate(Math.round(c.x - W.cam.x), Math.round(c.y - W.cam.y)); ctx.scale(1, -1); ctx.drawImage(c.img, -c.img.width / 2, -c.img.height / 2); ctx.restore(); }
  }

  // ---------- oscuridad (solo para la tormenta y la noche) ----------
  const lightCv = A.mk(VW, VH), lc = lightCv.getContext('2d');
  function drawLighting() {
    const ar = W.area; let dark = ar.dark || 0;
    if (W.lightning > 0) dark *= .1;
    if (dark <= 0.01) return;
    lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, VW, VH); lc.fillStyle = ar.darkCol || '#0a0820'; lc.globalAlpha = dark; lc.fillRect(0, 0, VW, VH); lc.globalAlpha = 1;
    lc.globalCompositeOperation = 'destination-out';
    const L = [[W.player.x, W.player.y - 16, 80]];
    for (const e of W.ents) if (e.alive && (e.type === 'lamp' && e.on)) L.push([e.x, e.y - 34, 60]);
    for (const e of W.ents) if (e.alive && e.lightR) L.push([e.x, e.y - 20, e.lightR]);
    for (const [x0, y0, r] of L) { const x = x0 - W.cam.x, y = y0 - W.cam.y; const g = lc.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); lc.fillStyle = g; lc.fillRect(x - r, y - r, r * 2, r * 2); }
    lc.globalCompositeOperation = 'source-over'; ctx.drawImage(lightCv, 0, 0);
  }

  // ---------- áreas ----------
  function loadArea(ch, ai) {
    const chap = CHAPTERS[ch], def = chap.areas[ai];
    const B = new Builder(); def.build(B);
    const L = compile(B);
    W.chap = ch; W.ai = ai; W.area = def; W.grid = L.grid; W.Wc = L.W; W.cols = L.cols; W.solids = [];
    W.tiles = A.tileLayer(L.grid, def.style || 'grass', TS);
    W.bg = A.background(def.theme, L.W * TS, VW, VH);
    W.liq = []; for (let y = 0; y < ROWS; y++) for (let x = 0; x < L.W; x++) { const t = L.grid[y][x]; if ((t === '~' || t === 'w')) W.liq.push([x, y, t, L.grid[y - 1] ? L.grid[y - 1][x] !== t : true]); }
    D.open = false; D.q = []; D.res = null; $('dialog').hidden = true; $('dopts').innerHTML = ''; if (cardOpen) { $('card').hidden = true; cardOpen = false; cardRes = null; }
    W.ents = []; W.projs = []; W.thrown = []; W.parts = []; W.corpses = []; W.waits = []; W.cam.lock = null; W.cam.target = null; W.lightning = 0; W.kills = 0;
    const sx = (def.start || 2) * TS + 8;
    const old = W.player; W.player = newPlayer(sx, groundY(sx)); if (old && old.hp > 0) W.player.hp = Math.max(old.hp, 3);
    W.cp = { x: sx, y: W.player.y };
    B.ents.forEach(d => W.ents.push(makeEnt(d)));
    (def.scrolls || []).forEach(([idx, x, row]) => { const s = chap.scrolls[idx]; W.ents.push(makeEnt({ type: 'scroll', x, row, sid: 'c' + (ch + 1) + 's' + idx, data: s })); });
    save.last = { ch, ai }; persist();
    S.play(def.music || 'field'); updateBoss(null); updateHUD();
    snapCam();
  }
  async function gotoArea(ai) {
    lock(); await fadeOut(.5);
    loadArea(W.chap, ai);
    await wait(.15); await fadeIn(.6);
    banner(W.area.name, W.area.sub, true);
    if (W.area.onEnter) await W.area.onEnter();
    unlock();
  }
  async function nextArea() { const chap = CHAPTERS[W.chap]; if (W.ai + 1 < chap.areas.length) return gotoArea(W.ai + 1); return endChapter(); }
  async function endChapter() {
    lock(); save.done[W.chap] = true; persist(); S.play('none'); S.fx('fanfare'); await fadeOut(.8); mode = 'menu';
    const chap = CHAPTERS[W.chap];
    $('ecNum').textContent = 'Capítulo ' + ROMAN[W.chap] + ' completado'; $('ecTitle').textContent = chap.title;
    $('ecSola').innerHTML = ''; if (chap.sola) { const s = document.createElement('span'); s.className = 'sola'; s.textContent = (save.sola[W.chap] ? '★ ' : '☆ ') + chap.sola; $('ecSola').appendChild(s); }
    $('ecVerse').textContent = chap.endVerse || '';
    const got = chap.scrolls.filter((s, i) => save.got['c' + (W.chap + 1) + 's' + i]).length;
    $('ecStats').textContent = 'Pergaminos de este capítulo: ' + got + ' de ' + chap.scrolls.length + ' · ' + levelOf(save.wis).cur[1];
    $('ecNext').textContent = W.chap + 1 < CHAPTERS.length ? 'Siguiente capítulo' : 'Volver al inicio';
    $('chapEnd').hidden = false; setHud(false); $('touch').classList.add('off'); S.play('select');
  }
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

  // ---------- elegir personaje ----------
  let selectOpen = false, selRes = null, selIdx = 0;
  function buildSelect() {
    const box = $('selList'); box.innerHTML = '';
    ORDER.forEach((k, i) => {
      const P0 = PLAYABLE[k], b = document.createElement('button'); b.type = 'button'; b.className = 'selBtn';
      const c = document.createElement('canvas'); c.width = 32; c.height = 32; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      x.drawImage(A.person(k === 'lutero' ? charOutfit('lutero') : A.CH[k], 'idle', 0, 1), 0, 4, 32, 32, 0, 0, 32, 32);
      b.appendChild(c);
      const n = document.createElement('span'); n.className = 'sn'; n.textContent = P0.name; b.appendChild(n);
      const bars = document.createElement('div'); bars.className = 'bars';
      ['Fuerza', 'Salto', 'Rapidez'].forEach((lab, j) => { const l = document.createElement('span'); l.textContent = lab; const bar = document.createElement('span'); bar.className = 'bar'; const fill = document.createElement('i'); fill.style.width = (P0.stats[j] * 20) + '%'; bar.appendChild(fill); bars.append(l, bar); });
      b.appendChild(bars);
      b.addEventListener('pointerenter', () => { selIdx = i; markSelect(); });
      b.addEventListener('click', () => { selIdx = i; confirmSelect(); });
      box.appendChild(b);
    });
    markSelect();
  }
  function markSelect() { [...$('selList').children].forEach((b, i) => b.classList.toggle('sel', i === selIdx)); $('selInfo').textContent = PLAYABLE[ORDER[selIdx]].desc; }
  function selectKey(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { selIdx = (selIdx + 3) % 4; markSelect(); S.fx('blip'); }
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') { selIdx = (selIdx + 1) % 4; markSelect(); S.fx('blip'); }
    else if (['Space', 'Enter', 'KeyX', 'KeyZ', 'KeyE'].includes(e.code)) { e.preventDefault(); confirmSelect(); }
  }
  function confirmSelect() { if (!selectOpen) return; selectOpen = false; $('select').hidden = true; W.char = save.char = ORDER[selIdx]; persist(); S.fx('choose'); const r = selRes; selRes = null; if (r) r(); }
  function chooseCharacter() { return new Promise(res => { selRes = res; selIdx = Math.max(0, ORDER.indexOf(save.char)); buildSelect(); $('select').hidden = false; selectOpen = true; S.play('select'); }); }

  async function startChapter(ch, ai) {
    mode = 'menu'; ['title', 'chapEnd', 'chapters'].forEach(id => $(id).hidden = true);
    const chap = CHAPTERS[ch]; W.flags = Object.assign({}, chap.flags || {}); W.player = null;
    fade = 1; fadeTarget = 1;
    $('ccNum').textContent = 'Capítulo ' + ROMAN[ch] + (chap.years ? ' · ' + chap.years : ''); $('ccTitle').textContent = chap.title; $('ccVerse').textContent = chap.verse;
    $('chapCard').hidden = false; S.play('title');
    await new Promise(r => { let done = false; const fin = () => { if (done) return; done = true; $('chapCard').removeEventListener('pointerdown', fin); removeEventListener('keydown', fin); r(); }; setTimeout(fin, 5200); setTimeout(() => { $('chapCard').addEventListener('pointerdown', fin); addEventListener('keydown', fin); }, 600); });
    $('chapCard').hidden = true;
    fade = 0; fadeTarget = 0; await chooseCharacter(); fade = 1; fadeTarget = 1;
    W.chap = ch; loadArea(ch, ai || 0); mode = 'play'; setHud(true); $('touch').classList.remove('off');
    lock(); await fadeIn(.6); banner(W.area.name, W.area.sub, true);
    if (W.area.onEnter) await W.area.onEnter();
    unlock();
  }
  function snapCam() { const p = W.player; if (!p) return; W.cam.x = clamp(p.x - VW / 2, 0, W.Wc * TS - VW); W.cam.y = clamp(p.y - 140, 0, ROWS * TS - VH); }

  // ---------- cinemáticas ----------
  let cine = null;
  function runCine(scenes, music) {
    return new Promise(res => {
      mode = 'cine'; setHud(false); $('touch').classList.add('off'); $('cine').hidden = false; if (music) S.play(music);
      cine = { scenes, i: 0, t: 0, res, shown: 0 }; setCaption(scenes[0].text || '');
    });
  }
  function setCaption(t) { cine.text = t; cine.shown = 0; $('cineText').textContent = ''; }
  function endCine() { if (!cine) return; const r = cine.res; cine = null; $('cine').hidden = true; r(); }
  $('cineSkip').addEventListener('click', e => { e.stopPropagation(); endCine(); });
  $('cine').addEventListener('pointerdown', e => { if (e.target.id === 'cineSkip' || !cine) return; const sc = cine.scenes[cine.i]; if (cine.shown < cine.text.length) cine.shown = cine.text.length; else if (cine.t > 1) cine.t = sc.dur; });
  function updateCine(dt) {
    if (!cine) return; cine.t += dt; const sc = cine.scenes[cine.i];
    if (cine.shown < cine.text.length) { const before = Math.floor(cine.shown); cine.shown += dt * 32; if (Math.floor(cine.shown) !== before && Math.floor(cine.shown) % 3 === 0) S.fx('blip'); $('cineText').textContent = cine.text.slice(0, Math.floor(cine.shown)); }
    if ((KP.talk || KP.jump || KP.atk)) { if (cine.shown < cine.text.length) cine.shown = cine.text.length; else if (cine.t > 1) cine.t = sc.dur; }
    if (cine.t >= sc.dur) { cine.i++; cine.t = 0; if (cine.i >= cine.scenes.length) { endCine(); return; } const n = cine.scenes[cine.i]; setCaption(n.text || ''); if (n.fx) S.fx(n.fx); if (n.music) S.play(n.music); }
  }
  function drawCine() { if (!cine) return; const sc = cine.scenes[cine.i]; ctx.save(); sc.draw(ctx, cine.t, sc.dur); ctx.restore(); const t = cine.t, d = sc.dur; const a = Math.max(0, 1 - t / .5, (t - (d - .5)) / .5); if (a > 0) { ctx.globalAlpha = Math.min(1, a); A.P(ctx, 0, 0, VW, VH, '#000'); ctx.globalAlpha = 1; } }

  // ---------- bucle ----------
  function runScript(fn) { Promise.resolve().then(fn).catch(err => { console.error(err); unlock(); }); }
  function update(dt) {
    T += dt;
    fade += Math.sign(fadeTarget - fade) * Math.min(Math.abs(fadeTarget - fade), fadeSpeed * dt); flashA = Math.max(0, flashA - dt * 2.5);
    if (mode === 'cine') { updateCine(dt); return; }
    if (mode !== 'play' || paused) return;
    if (D.open) {
      if (D.typing) { const before = Math.floor(D.shown); D.shown += dt * 50; const n = Math.min(D.full.length, Math.floor(D.shown)); if (n !== before && n % 3 === 0) S.fx('blip'); $('dtext').textContent = D.full.slice(0, n); if (n >= D.full.length) { D.typing = false; showOpts(); } }
      if (D.optsShown) { if (KP.up || KP.left) { D.sel = (D.sel + D.opts.length - 1) % D.opts.length; markSel(); S.fx('blip'); } else if (KP.down || KP.right) { D.sel = (D.sel + 1) % D.opts.length; markSel(); S.fx('blip'); } else if (KP.talk || KP.jump || KP.atk) pickChoice(D.sel); }
      else if (KP.talk || KP.jump || KP.atk || KP.up) advance();
      return;
    }
    if (cardOpen) return;
    for (const w of W.waits) { w.t -= dt; if (w.t <= 0 && !w.done) { w.done = true; w.r(); } }
    W.waits = W.waits.filter(w => !w.done);
    updatePlayer(dt);
    if (W.player.ctl && (KP.talk || KP.up)) { const it = findInteract(); if (it) { it.talked = true; it.busy = true; runScript(async () => { lock(); W.player.face = it.x > W.player.x ? 1 : -1; if (it.type === 'npc' && !it.keepFace) it.face = -W.player.face; await it.talk(it); it.busy = false; if (!W.flags.keepLock) unlock(); }); } }
    for (const e of W.ents) { if (!e.alive) continue; e.t += dt; const tp = TYPES[e.type]; if (tp && tp.update) tp.update(e, dt); }
    updateProjs(dt);
    const ar = W.area, pk = typeof ar.particles === 'function' ? ar.particles(W.player.x / TS) : ar.particles;
    if (pk) { const n = pk === 'rain' ? 5 : 1; for (let i = 0; i < n; i++) if (Math.random() < (pk === 'rain' ? 1 : dt * 20)) spawnAmbient(pk); }
    W.lightning = Math.max(0, (W.lightning || 0) - dt);
    for (const q of W.parts) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.g || 0) * dt; if (q.sway) q.vx += Math.sin(T * 2 + q.y * .05) * q.sway * dt; }
    W.parts = W.parts.filter(q => q.life > 0);
    const p = W.player, cam = W.cam;
    let tx = p.x + p.face * 30 - VW / 2, ty = p.y - 140;
    if (cam.target) { tx = cam.target.x - VW / 2; ty = cam.target.y != null ? cam.target.y - VH / 2 : ty; }
    const minX = cam.lock ? cam.lock[0] : 0, maxX = cam.lock ? cam.lock[1] - VW : W.Wc * TS - VW;
    cam.x += (clamp(tx, minX, maxX) - cam.x) * Math.min(1, dt * 5); cam.y += (clamp(ty, 0, ROWS * TS - VH) - cam.y) * Math.min(1, dt * 5);
    cam.shake = Math.max(0, cam.shake - dt);
  }
  function spawnAmbient(kind) {
    const x = W.cam.x + Math.random() * (VW + 40) - 20, y = W.cam.y - 6;
    if (kind === 'rain') W.parts.push({ x, y, vx: -50, vy: 380, life: .7, max: .7, col: 'rgba(180,200,255,.7)', g: 0, rain: 1 });
    if (kind === 'petals') W.parts.push({ x, y, vx: rnd(-10, 10), vy: rnd(14, 26), life: 9, max: 9, col: Math.random() < .5 ? '#ffb0c8' : '#ffffff', g: 0, sz: 2, sway: 10, amb: 1 });
    if (kind === 'leaves') W.parts.push({ x, y, vx: rnd(-14, 4), vy: rnd(16, 28), life: 9, max: 9, col: Math.random() < .5 ? '#ff8a2a' : '#ffd23a', g: 0, sz: 2, sway: 12, amb: 1 });
    if (kind === 'sparkle') W.parts.push({ x, y: W.cam.y + Math.random() * VH, vx: 0, vy: -6, life: 1.4, max: 1.4, col: '#ffffff', g: 0, sz: 1, amb: 1 });
    if (kind === 'snow') W.parts.push({ x, y, vx: rnd(-6, 6), vy: rnd(14, 24), life: 10, max: 10, col: '#ffffff', g: 0, sz: Math.random() < .3 ? 2 : 1, sway: 6, amb: 1 });
    if (kind === 'dust') W.parts.push({ x, y: W.cam.y + Math.random() * VH, vx: rnd(-3, 3), vy: rnd(-3, 3), life: 5, max: 5, col: '#fff0c0', g: 0, sz: 1, sway: 3, amb: 1 });
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
    if (mode === 'cine') { drawCine(); overlays(); return; }
    if (!W.area || !W.player) { drawTitleBg(); overlays(); return; }
    const cam = W.cam; let sx = 0, sy = 0; if (cam.shake > 0) { sx = rnd(-1, 1) * cam.shakeA; sy = rnd(-1, 1) * cam.shakeA; }
    const cx = Math.round(cam.x + sx), cy = Math.round(cam.y + sy); const saved = { x: cam.x, y: cam.y }; cam.x = cx; cam.y = cy;
    for (const L of W.bg) { if (L.fixed) { ctx.drawImage(L.cv, 0, 0); continue; } if (L.alpha != null) ctx.globalAlpha = L.alpha; ctx.drawImage(L.cv, Math.round(-cx * L.f), Math.round((L.y || 0) - cy * L.f * .6 - 20)); ctx.globalAlpha = 1; }
    if (W.lightning > 0) { ctx.globalAlpha = W.lightning * 3; A.P(ctx, 0, 0, VW, VH, '#ffffff'); ctx.globalAlpha = 1; }
    if (W.area.backDraw) W.area.backDraw(ctx, cx, cy, T);
    for (const e of W.ents) if (e.alive && e.back && TYPES[e.type].draw && e.type !== 'tuft') TYPES[e.type].draw(e);
    ctx.drawImage(W.tiles, cx, cy, VW, VH, 0, 0, VW, VH);
    for (const e of W.ents) if (e.alive && e.type === 'tuft') TYPES.tuft.draw(e);
    for (const s of W.solids) if (s.on && s.draw) s.draw(ctx, cx, cy);
    for (const e of W.ents) if (e.alive && !e.back && !e.front && TYPES[e.type].draw && e.type !== 'npc') TYPES[e.type].draw(e);
    for (const e of W.ents) if (e.alive && e.type === 'npc') TYPES.npc.draw(e);
    const p = W.player;
    if (!(p.inv > 0 && !p.dead && Math.floor(T * 16) % 2 === 0 && p.hurtT <= 0)) {
      let spr = heroSprite(); if (p.charged && Math.floor(T * 12) % 2) spr = A.tinted(spr, '#ffffff');
      ctx.drawImage(spr, Math.round(p.x - 16 - cx), Math.round(p.y - 38 - cy));
      if (p.carry) { const img = carryImg(p.carry); if (img) ctx.drawImage(img, Math.round(p.x - img.width / 2 - cx), Math.round(p.y - 30 - img.height - cy + (p.onGround && Math.abs(p.vx) > 8 ? (Math.floor(p.runT) % 2) : 0))); }
    }
    for (const e of W.ents) if (e.alive && e.front && TYPES[e.type].draw) TYPES[e.type].draw(e);
    drawProjs();
    for (const [x, y, t, top] of W.liq) {
      const ox = x * TS - cx, oy = y * TS - cy; if (ox < -16 || ox > VW) continue;
      ctx.globalAlpha = .7; A.P(ctx, ox, oy, TS, TS, t === 'w' ? '#2a7ae8' : '#c8a040'); ctx.globalAlpha = 1;
      if (top) { const w = Math.round(Math.sin(T * 3 + x) * 1.2); A.P(ctx, ox, oy + w, TS, 2, '#ffffff'); A.P(ctx, ox + ((T * 10 + x * 5) % 16 | 0), oy + 3 + w, 4, 1, '#8ad0ff'); }
    }
    for (const q of W.parts) {
      const x = q.x - cx, y = q.y - cy; if (x < -4 || x > VW + 4 || y < -10 || y > VH + 10) continue;
      ctx.globalAlpha = q.amb ? Math.min(1, q.life / 1.2, (q.max - q.life) / .6) : Math.min(1, q.life / (q.max * .5));
      if (q.rain) A.line(ctx, x, y, x + 1.5, y - 7, 1, q.col); else A.P(ctx, x, y, q.sz || 1, q.sz || 1, q.col);
    }
    ctx.globalAlpha = 1;
    if (p.ctl && !D.open) { const it = findInteract(); if (it) { const bx = Math.round(it.x - cx), by = Math.round(it.y - (it.bubbleY || 50) - cy + Math.sin(T * 5)); A.P(ctx, bx - 8, by - 7, 16, 11, '#000'); A.P(ctx, bx - 7, by - 6, 14, 9, '#ffffff'); A.P(ctx, bx - 2, by + 3, 4, 3, '#000'); A.P(ctx, bx - 1, by + 3, 2, 2, '#ffffff'); for (const o of [-4, -1, 2]) A.P(ctx, bx + o, by - 3, 2, 2, '#2a4ad8'); $('tTalk').classList.add('hot'); } else $('tTalk').classList.remove('hot'); }
    drawLighting();
    if (W.area.frontDraw) W.area.frontDraw(ctx, cx, cy, T);
    drawHUD();
    cam.x = saved.x; cam.y = saved.y;
    overlays();
  }
  // fondo animado de la pantalla de título
  let titleBg = null;
  function drawTitleBg() {
    if (!titleBg) titleBg = A.background(window.REFORMA.titleTheme, 3000, VW, VH);
    const off = T * 12;
    for (const L of titleBg) { if (L.fixed) { ctx.drawImage(L.cv, 0, 0); continue; } const w = L.cv.width - VW - 10; const x = -((off * L.f * 3) % Math.max(1, w)); ctx.drawImage(L.cv, Math.round(x), Math.round((L.y || 0) - 20)); }
    const gy = 184; A.P(ctx, 0, gy, VW, VH - gy, '#e8a050'); A.P(ctx, 0, gy, VW, 6, '#3ac04a'); A.P(ctx, 0, gy, VW, 2, '#8ae87a'); A.P(ctx, 0, gy - 1, VW, 1, '#000');
    for (let i = 0; i < 4; i++) { const k = ORDER[i]; const spr = A.person(k === 'lutero' ? A.CH.lutero : A.CH[k], 'run', Math.floor(T * 8 + i) % 4, 1); ctx.drawImage(spr, 40 + i * 30 + Math.sin(T + i) * 3, gy - 38); }
  }
  function overlays() { if (flashA > 0) { ctx.globalAlpha = Math.min(1, flashA); A.P(ctx, 0, 0, VW, VH, '#ffffff'); ctx.globalAlpha = 1; } if (fade > 0) { ctx.globalAlpha = fade; A.P(ctx, 0, 0, VW, VH, '#000'); ctx.globalAlpha = 1; } }
  function drawHUD() {
    const p = W.player; const x = 8, y = 8;
    for (let i = 0; i < p.max; i++) { const hy = y + i * 13; A.P(ctx, x, hy, 12, 11, '#000'); A.P(ctx, x + 1, hy + 1, 10, 9, i < p.hp ? '#ff3a5a' : '#ffffff'); if (i < p.hp) { A.P(ctx, x + 2, hy + 2, 3, 2, '#ffc0c8'); A.P(ctx, x + 1, hy + 8, 10, 2, '#c8102a'); } else A.P(ctx, x + 1, hy + 8, 10, 2, '#c0c0d0'); }
    const { cur, next } = levelOf(save.wis); const k = next ? (save.wis - cur[0]) / (next[0] - cur[0]) : 1;
    A.P(ctx, 24, 22, 72, 5, '#000'); A.P(ctx, 25, 23, 70, 3, '#3a2a6a'); A.P(ctx, 25, 23, Math.round(70 * k), 3, '#ffd23a');
  }

  // ---------- tamaño ----------
  const stage = $('stage'), frame = $('frame');
  function resize() {
    const cs = getComputedStyle(stage), portrait = isTouch && innerHeight > innerWidth; stage.classList.toggle('portrait', portrait);
    const Wd = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 8;
    const H = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 8 - (portrait ? 200 : 0);
    let s = Math.max(.5, Math.min(Wd / VW, H / VH)); if (s > 2) s = Math.floor(s * 4) / 4;
    frame.style.width = Math.floor(VW * s) + 'px'; frame.style.height = Math.floor(VH * s) + 'px'; scale = s; frame.style.setProperty('--u', s.toFixed(3));
  }
  addEventListener('resize', resize); resize();

  // ---------- menús ----------
  let paused = false;
  function togglePause() { if (mode !== 'play') return; paused = !paused; $('pause').hidden = !paused; if (paused) for (const k in K) K[k] = false; }
  function toggleMute() { S.setMuted(!S.muted); document.querySelectorAll('.muteBtn').forEach(b => b.textContent = 'Sonido: ' + (S.muted ? 'no' : 'sí')); }
  document.querySelectorAll('.muteBtn').forEach(b => b.addEventListener('click', () => { toggleMute(); b.blur(); }));
  $('menuBtn').addEventListener('click', e => { togglePause(); e.currentTarget.blur(); });
  $('pResume').addEventListener('click', togglePause);
  $('pChar').addEventListener('click', async () => { $('pause').hidden = true; const m = S.current; await chooseCharacter(); S.play(m); paused = false; });
  $('pTitle').addEventListener('click', () => { paused = false; $('pause').hidden = true; showTitle(); });
  function showTitle() {
    mode = 'title'; W.area = null; W.player = null; setHud(false); $('touch').classList.add('off'); ['chapters', 'chapEnd', 'chapCard', 'cine', 'select'].forEach(id => $(id).hidden = true); $('title').hidden = false; fade = 0; fadeTarget = 0;
    $('continueBtn').hidden = !save.last; S.play('title');
  }
  function buildChapterList() {
    const box = $('chapList'); box.innerHTML = '';
    CHAPTERS.forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chapBtn';
      const got = c.scrolls.filter((s, j) => save.got['c' + (i + 1) + 's' + j]).length;
      b.innerHTML = '<span class="cn"></span><span class="ct"></span><span class="cs"></span>';
      b.querySelector('.cn').textContent = 'Capítulo ' + ROMAN[i] + ' · ' + c.years + (save.done[i] ? ' · completado' : '');
      b.querySelector('.ct').textContent = c.title; b.querySelector('.cs').textContent = c.places + ' · pergaminos ' + got + '/' + c.scrolls.length + (save.sola[i] ? ' · ★ ' + c.sola : '');
      b.addEventListener('click', () => { S.init(); startChapter(i); });
      box.appendChild(b);
    });
  }
  $('newBtn').addEventListener('click', async () => { S.init(); $('title').hidden = true; await runCine(window.REFORMA.intro(api), 'storm'); startChapter(0); });
  $('continueBtn').addEventListener('click', () => { S.init(); const l = save.last || { ch: 0, ai: 0 }; startChapter(l.ch, l.ai); });
  $('chaptersBtn').addEventListener('click', () => { S.init(); buildChapterList(); $('title').hidden = true; $('chapters').hidden = false; });
  $('chapBack').addEventListener('click', () => { $('chapters').hidden = true; $('title').hidden = false; });
  $('introBtn').addEventListener('click', async () => { S.init(); $('title').hidden = true; await runCine(window.REFORMA.intro(api), 'storm'); showTitle(); });
  $('ecNext').addEventListener('click', () => { $('chapEnd').hidden = true; if (W.chap + 1 < CHAPTERS.length) startChapter(W.chap + 1); else showTitle(); });
  $('ecMenu').addEventListener('click', () => { $('chapEnd').hidden = true; showTitle(); });
  $('finalBtn').addEventListener('click', () => { $('final').hidden = true; showTitle(); });

  // ---------- API para el contenido ----------
  const api = {
    VW, VH, TS, ROWS, W, ctx, say, ask, wait, lock, unlock, fadeOut, fadeIn, walkTo, camTo, camFree, banner, shake, flash, spawn, findEnt, burst, floatText, addWis, nextArea, endChapter, runCine, updateBoss, snapCam,
    get player() { return W.player; }, get flags() { return W.flags; }, get T() { return T; }, get save() { return save; },
    fx: n => S.fx(n), music: n => S.play(n), heal() { W.player.hp = W.player.max; S.fx('heal'); },
    give(flag) { W.flags[flag] = true; updateHUD(); },
    solid(o) { o.on = true; W.solids.push(o); return o; },
    groundY: x => groundY(x * TS + 8), lockCam(x0, x1) { W.cam.lock = [x0 * TS, x1 * TS]; }, freeCam() { W.cam.lock = null; },
    carrying: kind => W.player && W.player.carry && W.player.carry.kind === kind, takeCarry() { W.player.carry = null; },
    finale: async () => { mode = 'menu'; await runCine(window.REFORMA.ending(api), 'chorale'); save.done[CHAPTERS.length - 1] = true; persist(); $('finalStats').textContent = 'Pergaminos: ' + Object.keys(save.got).length + ' de ' + CHAPTERS.reduce((a, c) => a + c.scrolls.length, 0) + ' · Solas: ' + Object.keys(save.sola).length + ' de 5 · ' + levelOf(save.wis).cur[1]; $('final').hidden = false; S.play('title'); },
    names: NAMES, A, isTouch,
    async cineInPlay(scenes, music) { const m = S.current; await runCine(scenes, music); mode = 'play'; setHud(true); $('touch').classList.remove('off'); S.play(m); },
    spawnScroll(idx, x, row) { const chap = CHAPTERS[W.chap], sid = 'c' + (W.chap + 1) + 's' + idx; if (save.got[sid]) return null; return spawn({ type: 'scroll', x, row, sid, data: chap.scrolls[idx] }); }
  };

  // ---------- inicio ----------
  CHAPTERS = window.REFORMA.chapters(api);
  Object.assign(NAMES, window.REFORMA.names);
  window.__reforma = api;
  api.startChapter = startChapter; api.gotoArea = gotoArea; api.loadArea = loadArea; api.chooseCharacter = chooseCharacter; api.confirmSelect = confirmSelect;
  W.char = save.char || 'lutero';
  if (isTouch) $('keysHint').textContent = 'Botones en pantalla: caminar, saltar, arrancar y hablar. Juega con el iPad en horizontal.';
  showTitle(); updateHUD();
  let last = performance.now();
  function loop(now) {
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
    try { update(dt); draw(); } catch (err) { console.error(err); }
    for (const k in KP) KP[k] = false;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
