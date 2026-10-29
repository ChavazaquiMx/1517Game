// Arte procedural en pixel art de 16 bits, alegre y colorido (estilo de plataformas clásicas de Super Nintendo).
window.ART = (() => {
  'use strict';
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; if (fn) fn(x, c); return c; };
  const P = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  function line(c, x0, y0, x1, y1, w, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    c.fillStyle = col; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy; const o = Math.floor(w / 2);
    for (;;) { c.fillRect(x0 - o, y0 - o, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  }
  function poly(c, pts, col) {
    c.fillStyle = col; let minY = 1e9, maxY = -1e9; for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const yc = y + .5, xs = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
      xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) { const x0 = Math.round(xs[i]), x1 = Math.round(xs[i + 1]); if (x1 > x0) c.fillRect(x0, y, x1 - x0, 1); }
    }
  }
  const disc = (c, cx, cy, r, col) => ell(c, cx, cy, r, r, col);
  function ell(c, cx, cy, rx, ry, col) { c.fillStyle = col; for (let y = -Math.floor(ry); y <= Math.floor(ry); y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + .01)))); if (w > 0) c.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, 1); } }
  function rrect(c, x, y, w, h, r, col) { P(c, x + r, y, w - 2 * r, h, col); P(c, x, y + r, w, h - 2 * r, col); for (let i = 0; i < r; i++) { const k = Math.round(r - Math.sqrt(r * r - (r - i - .5) * (r - i - .5))); P(c, x + k, y + i, w - 2 * k, 1, col); P(c, x + k, y + h - 1 - i, w - 2 * k, 1, col); } }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function shade(hx, d) { const [r, g, b] = hex(hx); const f = v => Math.max(0, Math.min(255, Math.round(v + d))).toString(16).padStart(2, '0'); return '#' + f(r) + f(g) + f(b); }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // contorno negro de 1px (lo que da el aspecto de 16 bits) + brillo opcional arriba
  function finish(cv, oc, rim) {
    oc = oc || '#000000';
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, id = c.getImageData(0, 0, w, h), d = id.data, out = new Uint8ClampedArray(d), [r, g, b] = hex(oc);
    const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : d[(y * w + x) * 4 + 3];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 40) { if (A(x - 1, y) > 40 || A(x + 1, y) > 40 || A(x, y - 1) > 40 || A(x, y + 1) > 40) { out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = 255; } }
      else if (rim && A(x, y - 1) < 40) { out[i] = Math.min(255, d[i] + rim); out[i + 1] = Math.min(255, d[i + 1] + rim); out[i + 2] = Math.min(255, d[i + 2] + rim); }
    }
    id.data.set(out); c.putImageData(id, 0, 0); return cv;
  }
  function flip(cv) { return mk(cv.width, cv.height, c => { c.translate(cv.width, 0); c.scale(-1, 1); c.drawImage(cv, 0, 0); }); }

  // ================= PERSONAJES (cabeza grande, cuerpo redondo) =================
  // lienzo 32x40, pies en (16,38), mirando a la derecha
  const SK = '#ffc89a', SKS = '#e09a6a';
  const CH = {
    lutero: { name: 'Lutero', skin: SK, skinS: SKS, hair: '#5a3418', robe: '#3c3c58', robeS: '#26263a', robeH: '#5c5c84', belt: '#e8d8a8', tonsure: true, long: true, shoe: '#5a3418' },
    luteroDr: { name: 'Lutero', skin: SK, skinS: SKS, hair: '#5a3418', robe: '#2a2a3a', robeS: '#18182a', robeH: '#4a4a66', collar: '#ffffff', hat: 'barett', hatCol: '#1a1a26', long: true, shoe: '#2a1a10' },
    junker: { name: 'Caballero Jorge', skin: SK, skinS: SKS, hair: '#4a2a14', beard: '#4a2a14', coat: '#2a8a4a', coatS: '#1a5a30', coatH: '#4ab06a', pants: '#7a4a2a', shoe: '#3a2010', hat: 'feather', hatCol: '#d0302a', belt: '#3a2010' },
    katharina: { name: 'Katharina', skin: SK, skinS: SKS, hair: '#b0501a', robe: '#3a6ae0', robeS: '#2240a8', robeH: '#6a94ff', apron: '#ffffff', hat: 'bonnet', hatCol: '#ffffff', long: true, dress: true, shoe: '#3a2010' },
    melanchthon: { name: 'Melanchthon', skin: SK, skinS: SKS, hair: '#a07a4a', beard: '#8a6a3a', coat: '#1a9a6a', coatS: '#0e6a48', coatH: '#3ac28a', pants: '#2a3a5a', shoe: '#2a1a10', hat: 'cap', hatCol: '#202030', tall: 3, thin: true },
    cranach: { name: 'Cranach', skin: SK, skinS: SKS, hair: '#8a8a8a', beard: '#c8c8c8', coat: '#d8302a', coatS: '#9a1a14', coatH: '#ff6a5a', fur: '#8a5a2a', pants: '#3a2a4a', shoe: '#2a1a10', hat: 'beret', hatCol: '#202020', wide: true, short: 2 }
  };
  const NPC = {
    staupitz: { skin: SK, skinS: SKS, hair: '#e8e8e8', robe: '#2a2a3a', robeS: '#18182a', robeH: '#4a4a66', belt: '#d8c890', tonsure: true, long: true, item: 'book' },
    monje: { skin: SK, skinS: SKS, hair: '#3a2410', robe: '#3c3c58', robeS: '#26263a', robeH: '#5c5c84', belt: '#e8d8a8', tonsure: true, long: true },
    monje2: { skin: '#f0b888', skinS: '#c88a5a', hair: '#c8a060', robe: '#3c3c58', robeS: '#26263a', robeH: '#5c5c84', belt: '#e8d8a8', tonsure: true, long: true, item: 'broom' },
    tetzel: { skin: '#ffb890', skinS: '#d88a60', hair: '#7a5a3a', robe: '#ffffff', robeS: '#d0d0e0', robeH: '#ffffff', cape: '#1a1a26', tonsure: true, long: true, item: 'bag', wide: true },
    hans: { skin: SK, skinS: SKS, hair: '#3a2410', beard: '#3a2410', coat: '#8a5a2a', coatS: '#5a3a18', coatH: '#b07a40', pants: '#3a3a3a', shoe: '#2a1a10', hat: 'cap', hatCol: '#3a2a1a', wide: true },
    carlos: { skin: '#ffd0a8', skinS: '#e0a070', hair: '#c89048', coat: '#c81a2a', coatS: '#8a0e18', coatH: '#ff4a5a', fur: '#ffffff', pants: '#2a1a4a', shoe: '#1a1020', hat: 'crown', long: false, item: 'scepter' },
    federico: { skin: SK, skinS: SKS, hair: '#a0a0a0', beard: '#d0d0d0', coat: '#2a5ad0', coatS: '#1a3a90', coatH: '#5a8aff', fur: '#7a4a2a', pants: '#2a2a2a', shoe: '#1a1010', hat: 'furhat', hatCol: '#5a3a1a', wide: true },
    eck: { skin: '#ffb890', skinS: '#d88a60', hair: '#2a1a10', robe: '#7a1a2a', robeS: '#4a0e18', robeH: '#a83a4a', hat: 'barett', hatCol: '#1a1a1a', long: true, wide: true },
    spalatin: { skin: SK, skinS: SKS, hair: '#5a3a1a', robe: '#4a3a8a', robeS: '#2a2060', robeH: '#6a5ab0', hat: 'barett', hatCol: '#202030', long: true, item: 'scroll' },
    aldeano: { skin: SK, skinS: SKS, hair: '#7a4a1a', coat: '#c8a040', coatS: '#8a6a20', coatH: '#e8c868', pants: '#5a4a3a', shoe: '#3a2010', hat: 'cap', hatCol: '#5a7a2a' },
    aldeana: { skin: SK, skinS: SKS, hair: '#e0b040', robe: '#d84a8a', robeS: '#a02a60', robeH: '#ff7ab0', apron: '#fff4d0', hat: 'bonnet', hatCol: '#ffffff', long: true, dress: true },
    nino: { skin: SK, skinS: SKS, hair: '#e0a030', coat: '#4aa0ff', coatS: '#2a6ad0', coatH: '#8ac8ff', pants: '#7a4a2a', shoe: '#3a2010', short: 6 },
    impresor: { skin: SK, skinS: SKS, hair: '#3a2410', beard: '#3a2410', coat: '#7a7a8a', coatS: '#4a4a5a', coatH: '#a0a0b0', apron: '#e8d8b0', pants: '#3a3a3a', shoe: '#2a1a10', wide: true },
    caballero: { skin: SK, skinS: SKS, hair: '#3a2410', coat: '#a8b4c8', coatS: '#6a7488', coatH: '#e0e8f4', pants: '#6a7488', shoe: '#4a5468', hat: 'helmet', hatCol: '#a8b4c8', cape: '#2a5ad0', item: 'spear' },
    guardia: { skin: SK, skinS: SKS, hair: '#3a2410', coat: '#e8c020', coatS: '#a88010', coatH: '#fff060', pants: '#c81a2a', shoe: '#2a1a10', hat: 'helmet', hatCol: '#b8c0d0', item: 'spear' },
    cardenal: { skin: '#ffd0a8', skinS: '#e0a070', hair: '#e0e0e0', robe: '#e0202a', robeS: '#a01018', robeH: '#ff5a5a', hat: 'redcap', long: true, wide: true },
    estudiante: { skin: SK, skinS: SKS, hair: '#2a1a10', coat: '#6a3aa8', coatS: '#4a2078', coatH: '#9a6ad8', pants: '#2a2a3a', shoe: '#1a1010', hat: 'cap', hatCol: '#2a2a3a', item: 'book' },
    hansito: { skin: SK, skinS: SKS, hair: '#e0b040', coat: '#e84a2a', coatS: '#a82a10', coatH: '#ff8a6a', pants: '#3a3a6a', shoe: '#2a1a10', short: 7 },
    magdalena: { skin: SK, skinS: SKS, hair: '#e0b040', robe: '#9a4ad8', robeS: '#6a2aa0', robeH: '#c08aff', apron: '#ffffff', long: true, dress: true, short: 8 }
  };
  for (const k in CH) CH[k].id = 'ch-' + k; for (const k in NPC) NPC[k].id = 'npc-' + k;

  function pose(anim, f) {
    const p = { bob: 0, lF: [2, 0], lB: [-2, 0], aF: .3, aB: -.3, carry: false, squat: 0, lean: 0, eye: 'open', dress: 0, mouth: 0 };
    if (anim === 'idle') { p.bob = f % 2; }
    else if (anim === 'run' || anim === 'crun') { const k = [[4, 0, -3, 2], [1, 2, 0, 0], [-3, 2, 4, 0], [0, 0, 1, 2]][f % 4]; p.lF = [k[0], k[1]]; p.lB = [k[2], k[3]]; p.bob = f % 2 ? -1 : 0; p.aF = [-.9, .2, .9, .2][f % 4]; p.aB = -p.aF; p.lean = 1; p.dress = f % 2; if (anim === 'crun') p.carry = true; }
    else if (anim === 'jump') { p.lF = [3, 4]; p.lB = [-2, 1]; p.aF = 2.6; p.aB = -1.2; p.bob = -1; p.dress = 2; }
    else if (anim === 'fall') { p.lF = [2, 1]; p.lB = [-3, 3]; p.aF = 2.2; p.aB = 2.4; p.dress = 3; }
    else if (anim === 'float') { p.lF = [2, 2]; p.lB = [-2, 2]; p.aF = 2.0; p.aB = 2.0; p.dress = 4 + (f % 2); p.mouth = 1; }
    else if (anim === 'cidle') { p.carry = true; p.bob = f % 2; }
    else if (anim === 'cjump') { p.carry = true; p.lF = [3, 4]; p.lB = [-2, 1]; p.dress = 2; }
    else if (anim === 'pluck') { p.squat = f ? 2 : 5; p.aF = f ? 3.0 : .1; p.aB = f ? 2.6 : .2; p.lean = f ? -1 : 3; p.mouth = 1; p.eye = f ? 'open' : 'closed'; }
    else if (anim === 'throw') { p.aF = 1.4; p.aB = -.6; p.lean = 2; p.mouth = 1; p.lF = [4, 0]; p.lB = [-3, 0]; }
    else if (anim === 'duck') { p.squat = 6; p.aF = .2; p.aB = -.2; }
    else if (anim === 'hurt') { p.eye = 'hurt'; p.aF = 2.6; p.aB = 2.6; p.lean = -2; p.mouth = 2; p.lF = [3, 2]; p.lB = [-3, 2]; }
    else if (anim === 'kneel') { p.squat = 6; p.aF = 1.7; p.aB = 1.7; p.eye = 'closed'; p.lean = 1; }
    else if (anim === 'cheer') { p.aF = 3.1; p.aB = 3.1; p.bob = -f % 2; p.mouth = 1; }
    else if (anim === 'talk') { p.bob = 0; p.aF = 1.2; p.mouth = f % 2; }
    return p;
  }
  function drawToon(c, o, p) {
    const X = 16 + (o.wide ? 0 : 0), G = 38, tall = o.tall || 0, short = o.short || 0, sq = p.squat;
    const hipY = G - 7 - tall + sq * .6 + short * .4, shY = hipY - 9 + (o.wide ? 1 : 0) + short * .3, bw = o.wide ? 7 : (o.thin ? 5 : 6);
    const lean = p.lean, headX = X + 1 + lean, headY = shY - 6 + p.bob + (sq > 4 ? 2 : 0);
    const coatMain = o.robe || o.coat, coatS = o.robeS || o.coatS, coatH = o.robeH || o.coatH;
    const legLen = Math.max(2, 7 + tall - sq - short * .4);
    // brazo trasero
    const arm = (sx, sy, a, col, colS, hand) => { const ex = sx + Math.sin(a) * 7, ey = sy + Math.cos(a) * 7; line(c, sx, sy, ex, ey, 4, '#000'); line(c, sx, sy, ex, ey, 2, col); line(c, sx + Math.sin(a), sy + Math.cos(a), ex, ey, 1, colS); disc(c, ex, ey, 2.4, '#000'); disc(c, ex, ey, 1.7, hand); return [ex, ey]; };
    const aB = p.aB;
    if (!p.carry) arm(X - 2 + lean, shY + 2 + p.bob, aB, coatS, shade(coatS, -12), o.skinS);
    // pierna trasera y zapato
    const leg = (lx, l, col) => { const fx = lx + l[0], fy = G - 1 - l[1]; if (!o.long) line(c, lx, hipY + p.bob * .5, fx, fy - 1, 3, col); ell(c, fx + 1.5, fy, 3, 1.6, o.shoe || '#3a2010'); P(c, fx, fy - 1, 3, 1, shade(o.shoe || '#3a2010', 40)); };
    leg(X - 2, p.lB, o.pants ? shade(o.pants, -20) : coatS);
    // capa
    if (o.cape) poly(c, [[X - 4 + lean, shY], [X + 3 + lean, shY], [X - 1, hipY + 7], [X - 8 - p.dress, hipY + 6]], o.cape);
    // cuerpo
    if (o.long) {
      const hem = G - 2 - (p.dress ? 1 : 0), fl = p.dress * 1.2;
      poly(c, [[X - bw + lean, shY + p.bob], [X + bw - 1 + lean, shY + p.bob], [X + bw + 2 + fl * .5, hem], [X - bw - 2 - fl, hem]], coatS);
      poly(c, [[X - bw + 2 + lean, shY + p.bob], [X + bw - 1 + lean, shY + p.bob], [X + bw + 1 + fl * .5, hem - 1], [X - bw + 1 - fl * .3, hem - 1]], coatMain);
      line(c, X + 1 + lean, shY + 2 + p.bob, X + 2, hem - 2, 1, coatH);
      if (o.dress) for (let i = 0; i < 4; i++) P(c, X - bw - 1 + i * 4 - fl * .5, hem - 1, 2, 1, coatS);
      if (o.apron) poly(c, [[X - 1 + lean, hipY - 3 + p.bob], [X + 5 + lean, hipY - 3 + p.bob], [X + 6, hem - 2], [X, hem - 2]], o.apron);
      if (o.belt) { P(c, X - bw + lean, hipY - 2 + p.bob, bw * 2, 2, o.belt); line(c, X - 2 + lean, hipY + p.bob, X - 3, hipY + 6, 1, o.belt); }
      if (o.cape && o.tonsure) { poly(c, [[X - bw - 1 + lean, shY - 1 + p.bob], [X + bw + lean, shY - 1 + p.bob], [X + bw + 1, shY + 6], [X - bw - 2, shY + 7]], o.cape); }
    } else {
      ell(c, X + lean * .5, shY + 5 + p.bob, bw + 1, 6, coatS);
      ell(c, X + 1 + lean * .5, shY + 4 + p.bob, bw, 5.5, coatMain);
      P(c, X - 1 + lean, shY + 1 + p.bob, 3, 2, coatH);
      if (o.fur) { ell(c, X + lean, shY + 1 + p.bob, bw, 2, o.fur); }
      if (o.apron) P(c, X - 1 + lean, shY + 4 + p.bob, 6, 7, o.apron);
      if (o.belt) P(c, X - bw + lean, shY + 7 + p.bob, bw * 2, 2, o.belt);
    }
    if (o.collar) { P(c, X - 2 + lean, shY - 1 + p.bob, 6, 2, o.collar); }
    // pierna delantera
    leg(X + 2, p.lF, o.pants || coatMain);
    // cabeza
    const hx = headX, hy = headY;
    if (p.carry) { const up = (sx, tx, col, hand) => { const sy = shY + 2 + p.bob, ty = hy - 9; line(c, sx, sy, tx, ty, 4, '#000'); line(c, sx, sy, tx, ty, 2, col); disc(c, tx, ty, 2.4, '#000'); disc(c, tx, ty, 1.7, hand); }; up(X - 3 + lean, hx - 4, coatS, o.skinS); up(X + 3 + lean, hx + 5, coatMain, o.skin); }
    ell(c, hx, hy, 6.5, 6, o.skin); ell(c, hx - 2, hy + 2, 4, 3, o.skinS); ell(c, hx + .5, hy - .5, 6, 5.5, o.skin);
    // oreja
    disc(c, hx - 2, hy + 1, 1.6, o.skinS);
    // pelo y sombreros
    const hc = o.hatCol || '#202020';
    if (o.tonsure) { ell(c, hx - 2, hy - 1, 4.5, 4, o.hair); ell(c, hx, hy - 3, 5, 2.5, o.hair); ell(c, hx + .5, hy - 4.5, 3.5, 1.6, o.skin); P(c, hx - 1, hy - 5, 3, 1, shade(o.skin, 25)); }
    else if (o.hat === 'bonnet') { ell(c, hx - 1, hy - 1, 7, 6.5, hc); ell(c, hx + 2, hy + .5, 4.5, 4.5, o.skin); P(c, hx - 6, hy + 3, 3, 4, o.hair); P(c, hx - 1, hy - 7, 4, 1, shade(hc, -30)); }
    else {
      ell(c, hx - 1.5, hy - 1.5, 6, 4.5, o.hair); P(c, hx - 6, hy - 1, 3, 5, o.hair); P(c, hx + 2, hy - 5, 4, 2, o.hair);
      if (o.hat === 'barett') { ell(c, hx, hy - 4.5, 7.5, 2.4, hc); ell(c, hx - 1, hy - 6, 5, 2, hc); P(c, hx - 4, hy - 7, 6, 1, shade(hc, 40)); }
      else if (o.hat === 'cap') { ell(c, hx - .5, hy - 4.5, 6.5, 2.6, hc); P(c, hx + 2, hy - 4, 6, 2, hc); P(c, hx - 3, hy - 7, 5, 1, shade(hc, 40)); }
      else if (o.hat === 'beret') { ell(c, hx - 1, hy - 5, 7.5, 3, hc); P(c, hx - 4, hy - 8, 6, 1, shade(hc, 50)); }
      else if (o.hat === 'feather') { ell(c, hx, hy - 5, 7.5, 2.6, hc); ell(c, hx - 1, hy - 6.5, 5, 2, hc); line(c, hx - 3, hy - 7, hx - 9, hy - 13, 2, '#ffffff'); line(c, hx - 5, hy - 9, hx - 8, hy - 11, 1, '#ffe060'); }
      else if (o.hat === 'crown') { P(c, hx - 5, hy - 7, 10, 3, '#ffd23a'); for (const k of [-5, -1, 3]) P(c, hx + k, hy - 10, 2, 3, '#ffd23a'); P(c, hx - 1, hy - 6, 2, 1, '#e8382c'); P(c, hx - 5, hy - 7, 10, 1, '#fff2a0'); }
      else if (o.hat === 'furhat') { ell(c, hx - .5, hy - 4.5, 7.5, 3.5, hc); ell(c, hx - .5, hy - 7, 5, 2.4, '#d0302a'); }
      else if (o.hat === 'helmet') { ell(c, hx, hy - 2.5, 7, 5, hc); P(c, hx - 7, hy - 1, 14, 2, shade(hc, -40)); P(c, hx - 3, hy - 7, 5, 1, '#ffffff'); }
      else if (o.hat === 'redcap') { ell(c, hx - .5, hy - 4.5, 6.5, 3, '#e0202a'); P(c, hx - 1, hy - 8, 2, 2, '#e0202a'); }
    }
    if (o.beard) { ell(c, hx + 2.5, hy + 4.5, o.thin ? 2.5 : 3.5, o.thin ? 2 : 3, o.beard); P(c, hx + 1, hy + 6, o.thin ? 3 : 4, 2, o.beard); }
    // cara: ojo grande con brillo, nariz, boca
    const ex = hx + 2.5, ey = hy - 1;
    if (p.eye === 'closed') P(c, ex - 1, ey + 1, 3, 1, '#000');
    else if (p.eye === 'hurt') { line(c, ex - 1, ey - 1, ex + 1, ey + 1, 1, '#000'); line(c, ex + 1, ey - 1, ex - 1, ey + 1, 1, '#000'); }
    else { P(c, ex, ey - 1, 2, 4, '#000'); P(c, ex, ey - 1, 1, 1, '#ffffff'); }
    if (!o.hat || o.hat === 'cap' || o.hat === 'barett' || o.tonsure) P(c, ex - 1, ey - 3, 3, 1, shade(o.hair, -20));
    disc(c, hx + 6, hy + 1.5, 1.8, shade(o.skin, -18)); P(c, hx + 5, hy, 1, 1, '#ffffff');
    if (!o.beard) { if (p.mouth === 1) P(c, hx + 3, hy + 4, 3, 2, '#7a1a10'); else if (p.mouth === 2) { P(c, hx + 3, hy + 4, 3, 2, '#7a1a10'); } else P(c, hx + 3, hy + 4, 3, 1, '#9a3a2a'); }
    else if (p.mouth) P(c, hx + 3, hy + 4, 3, 1, '#5a1a10');
    // mejilla
    P(c, hx + 1, hy + 2, 2, 1, '#ff9a8a');
    // brazo delantero
    let hX = hx + 6, hY = hy - 8;
    if (!p.carry) [hX, hY] = arm(X + 3 + lean, shY + 2 + p.bob, p.aF, coatMain, coatH, o.skin);
    const it = o.item;
    if (it === 'book') { P(c, hX - 1, hY - 3, 5, 5, '#8a1a1a'); P(c, hX, hY - 3, 4, 1, '#fff4d0'); P(c, hX + 1, hY - 1, 2, 1, '#ffd23a'); }
    else if (it === 'scroll') { P(c, hX - 1, hY - 3, 6, 4, '#fff4d0'); P(c, hX - 2, hY - 3, 1, 4, '#d0a050'); P(c, hX + 5, hY - 3, 1, 4, '#d0a050'); }
    else if (it === 'broom') { line(c, hX, hY - 8, hX - 2, G - 2, 1, '#9a6a2a'); P(c, hX - 5, G - 4, 6, 3, '#e0c060'); }
    else if (it === 'bag') { disc(c, hX + 1, hY + 2, 3, '#c8902a'); P(c, hX - 1, hY - 1, 4, 1, '#7a4a10'); P(c, hX, hY + 1, 2, 2, '#ffe060'); }
    else if (it === 'spear') { line(c, hX + 1, hY + 8, hX + 1, hY - 16, 1, '#8a5a2a'); poly(c, [[hX - 1, hY - 16], [hX + 3, hY - 16], [hX + 1, hY - 21]], '#e0e8f0'); }
    else if (it === 'scepter') { line(c, hX + 1, hY + 3, hX + 3, hY - 9, 1, '#ffd23a'); disc(c, hX + 3, hY - 10, 2, '#ffd23a'); }
    else if (it === 'hammer') { line(c, hX, hY, hX + 3, hY - 6, 1, '#8a5a2a'); P(c, hX + 1, hY - 9, 5, 3, '#9aa4b4'); }
  }
  const cache = {};
  function person(o, anim, f, dir) {
    f = ((Math.floor(f) || 0) % 4 + 4) % 4;
    const key = o.id + anim + f + dir;
    let s = cache[key]; if (s) return s;
    const base = finish(mk(32, 40, c => drawToon(c, o, pose(anim, f))), '#000', 0);
    s = dir < 0 ? flip(base) : base; cache[key] = s; return s;
  }
  // personaje dorado (al tomar la medalla) o blanco (destello)
  function tinted(spr, col) { return mk(spr.width, spr.height, c => { c.drawImage(spr, 0, 0); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = .65; c.fillStyle = col; c.fillRect(0, 0, spr.width, spr.height); }); }

  // ================= ENEMIGOS =================
  const ec = {};
  // Bula de indulgencia: un papel sellado que camina
  function bula(f, red) {
    const k = 'b' + f + (red ? 'r' : ''); if (ec[k]) return ec[k];
    return ec[k] = finish(mk(20, 22, c => {
      const b = f % 2;
      ell(c, 6 + b * 2, 20, 3, 1.6, '#7a3a1a'); ell(c, 14 - b * 2, 20, 3, 1.6, '#7a3a1a');
      P(c, 4, 4 + b, 12, 14, red ? '#ffe0e0' : '#fff6dc'); P(c, 13, 4 + b, 3, 14, red ? '#f0b0b0' : '#e8d4a0');
      ell(c, 10, 4 + b, 7, 2, red ? '#fff0f0' : '#fffaf0'); P(c, 3, 3 + b, 2, 3, '#d8c080'); P(c, 15, 3 + b, 2, 3, '#d8c080');
      for (let i = 0; i < 3; i++) P(c, 6, 13 + b + i * 2, 6, 1, '#b8a070');
      disc(c, 10, 9 + b, 3.5, red ? '#5a0a8a' : '#d0201a'); disc(c, 10, 9 + b, 2, red ? '#8a3ac0' : '#ff5a4a');
      P(c, 7, 6 + b, 2, 3, '#000'); P(c, 12, 6 + b, 2, 3, '#000'); P(c, 7, 6 + b, 1, 1, '#fff'); P(c, 12, 6 + b, 1, 1, '#fff');
    }), '#000', 0);
  }
  // Moneda saltarina: "cuando la moneda en el cofre suena…"
  function moneda(f) {
    const k = 'm' + f; if (ec[k]) return ec[k];
    return ec[k] = finish(mk(18, 18, c => {
      const sq = f === 0 ? 1 : 0;
      ell(c, 9, 9 + sq, 7, 7 - sq, '#c88a10'); ell(c, 8, 8 + sq, 6, 6 - sq, '#ffd23a'); ell(c, 7, 6 + sq, 2, 2, '#fff6a0');
      P(c, 6, 8, 2, 3, '#000'); P(c, 10, 8, 2, 3, '#000'); line(c, 5, 6, 8, 7, 1, '#7a4a00'); line(c, 13, 6, 10, 7, 1, '#7a4a00');
      P(c, 7, 12 + sq, 4, 1, '#7a4a00');
      if (f !== 0) { P(c, 4, 15, 3, 2, '#7a4a00'); P(c, 11, 15, 3, 2, '#7a4a00'); }
    }), '#000', 0);
  }
  // Cuervo de la Duda
  function cuervo(f) {
    const k = 'c' + f; if (ec[k]) return ec[k];
    return ec[k] = finish(mk(24, 18, c => {
      const up = f % 2 === 0;
      ell(c, 12, 10, 7, 5, '#3a2a5a'); ell(c, 12, 9, 6, 4, '#5a4a8a'); disc(c, 18, 7, 4, '#3a2a5a');
      poly(c, [[21, 7], [24, 8], [21, 9]], '#ffb020'); P(c, 18, 5, 2, 2, '#fff'); P(c, 19, 6, 1, 1, '#000');
      if (up) poly(c, [[8, 8], [14, 8], [6, 0]], '#2a1a4a'); else poly(c, [[8, 10], [14, 10], [5, 17]], '#2a1a4a');
      poly(c, [[5, 10], [0, 8], [1, 13]], '#2a1a4a'); P(c, 10, 14, 1, 3, '#ffb020'); P(c, 13, 14, 1, 3, '#ffb020');
    }), '#000', 0);
  }
  // Jefe: el cofre de las indulgencias (escupe monedas)
  function cofre(f, open) {
    const k = 'cf' + f + open; if (ec[k]) return ec[k];
    return ec[k] = finish(mk(56, 50, c => {
      const lid = open ? 12 : 0, b = f % 2;
      // patas
      ell(c, 14, 47, 6, 3, '#5a2a0a'); ell(c, 42, 47, 6, 3, '#5a2a0a');
      // caja
      P(c, 6, 24 + b, 44, 22, '#9a5a20'); P(c, 6, 24 + b, 44, 3, '#c07a30'); for (let x = 10; x < 50; x += 8) P(c, x, 28 + b, 1, 18, '#7a4210');
      P(c, 6, 32 + b, 44, 3, '#ffd23a'); P(c, 6, 32 + b, 44, 1, '#fff2a0'); P(c, 12, 24 + b, 3, 22, '#ffd23a'); P(c, 41, 24 + b, 3, 22, '#ffd23a');
      // cerradura
      rrect(c, 24, 30 + b, 8, 9, 2, '#ffd23a'); P(c, 27, 33 + b, 2, 4, '#3a1a00');
      // boca abierta
      if (open) { P(c, 8, 18 + b, 40, 7, '#5a0a0a'); for (let i = 0; i < 6; i++) disc(c, 12 + i * 6, 22 + b, 2.5, '#ffd23a'); }
      // tapa
      poly(c, [[4, 24 - lid * .3 + b], [52, 24 - lid * .3 + b], [50, 10 - lid + b], [6, 10 - lid + b]], '#b06a28');
      ell(c, 28, 10 - lid + b, 22, 6, '#c07a30'); P(c, 6, 18 - lid * .6 + b, 44, 3, '#ffd23a');
      // ojos enojados en la tapa
      for (const ex of [18, 36]) { ell(c, ex, 12 - lid + b, 5, 4, '#ffffff'); disc(c, ex + 1, 13 - lid + b, 2, '#000'); }
      line(c, 12, 6 - lid + b, 22, 9 - lid + b, 2, '#5a2a0a'); line(c, 42, 6 - lid + b, 32, 9 - lid + b, 2, '#5a2a0a');
    }), '#000', 0);
  }
  // Jefe: la Sombra de la Duda (en el castillo de Wartburg)
  function sombra(f, mad) {
    const k = 'sb' + f + mad; if (ec[k]) return ec[k];
    return ec[k] = finish(mk(60, 52, c => {
      const w = Math.sin(f / 4 * Math.PI * 2) * 2;
      for (let i = 0; i < 6; i++) disc(c, 8 + i * 9, 40 + (i % 2 ? w : -w), 6, '#4a2a7a');
      ell(c, 30, 26, 24, 18, '#5a3a9a'); ell(c, 28, 22, 20, 14, '#7a5ac0'); ell(c, 22, 15, 8, 4, '#a088e0');
      poly(c, [[14, 12], [10, 0], [20, 9]], '#3a1a6a'); poly(c, [[46, 12], [50, 0], [40, 9]], '#3a1a6a');
      for (const ex of [22, 38]) { ell(c, ex, 24, 5, mad ? 3 : 5, '#ffe060'); disc(c, ex + 1, 25, 2, '#000'); }
      if (mad) { line(c, 16, 18, 26, 21, 2, '#2a0a4a'); line(c, 44, 18, 34, 21, 2, '#2a0a4a'); }
      P(c, 24, 33, 12, 3, '#2a0a4a'); P(c, 26, 33, 2, 2, '#fff'); P(c, 32, 33, 2, 2, '#fff');
    }), '#000', 0);
  }

  // ================= OBJETOS =================
  const pc = {};
  const F = (k, w, h, fn, rim) => pc[k] || (pc[k] = finish(mk(w, h, fn), '#000', rim || 0));
  function item(kind) {
    switch (kind) {
      case 'nabo': return F('nabo', 14, 16, c => { poly(c, [[6, 5], [2, 0], [5, 0], [7, 4]], '#2aa84a'); poly(c, [[7, 5], [8, 0], [11, 1], [8, 5]], '#4ad86a'); ell(c, 7, 10, 5, 4.5, '#ffffff'); ell(c, 7, 8, 5, 2.5, '#c04ab0'); P(c, 6, 14, 2, 2, '#e8d8e0'); P(c, 4, 9, 2, 1, '#fff'); });
      case 'col': return F('col', 16, 15, c => { disc(c, 8, 8, 6.5, '#3ac04a'); disc(c, 7, 7, 4.5, '#7ae86a'); line(c, 8, 3, 8, 13, 1, '#2a8a3a'); line(c, 4, 6, 8, 9, 1, '#2a8a3a'); line(c, 12, 6, 8, 9, 1, '#2a8a3a'); });
      case 'pretzel': return F('pretzel', 16, 14, c => { ell(c, 8, 8, 7, 5, '#b8641e'); ell(c, 5, 7, 2.5, 2, 'rgba(0,0,0,0)'); c.clearRect(3, 6, 4, 3); c.clearRect(9, 6, 4, 3); c.clearRect(7, 10, 2, 2); P(c, 4, 4, 2, 1, '#fff'); P(c, 10, 5, 1, 1, '#fff'); P(c, 6, 11, 1, 1, '#fff'); });
      case 'tintero': return F('tintero', 12, 14, c => { rrect(c, 1, 5, 10, 9, 3, '#1a1a3a'); P(c, 3, 2, 6, 4, '#2a2a5a'); P(c, 3, 7, 2, 4, '#5a5aa0'); line(c, 8, 3, 11, 0, 1, '#ffffff'); });
      case 'corazon': return F('corazon', 13, 12, c => { disc(c, 4, 4, 3.5, '#ff3a5a'); disc(c, 9, 4, 3.5, '#ff3a5a'); poly(c, [[1, 5], [12, 5], [6.5, 11]], '#ff3a5a'); P(c, 3, 2, 2, 2, '#ffd0d8'); });
      case 'llave': return F('llave', 16, 9, c => { disc(c, 4, 4, 3.5, '#ffd23a'); P(c, 3, 3, 2, 2, '#7a4a00'); P(c, 7, 3, 9, 2, '#ffd23a'); P(c, 12, 5, 2, 3, '#ffd23a'); P(c, 15, 5, 1, 2, '#ffd23a'); P(c, 1, 2, 2, 1, '#fff6a0'); });
      case 'martillo': return F('martillo', 14, 14, c => { line(c, 3, 13, 9, 4, 2, '#9a6a2a'); P(c, 6, 1, 8, 5, '#9aa4b4'); P(c, 6, 1, 8, 1, '#e0e8f0'); });
      case 'moneda': return F('monedaI', 10, 10, c => { disc(c, 5, 5, 4, '#c88a10'); disc(c, 4.5, 4.5, 3, '#ffd23a'); P(c, 3, 3, 1, 2, '#fff6a0'); });
      case 'piedra': return F('piedra', 14, 12, c => { ell(c, 7, 6, 6, 5, '#8a8a9a'); ell(c, 6, 5, 4, 3, '#b0b0c0'); P(c, 4, 3, 2, 1, '#e0e0f0'); });
      case 'tuft': return F('tuft', 14, 8, c => { poly(c, [[2, 8], [4, 1], [6, 8]], '#1a8a2a'); poly(c, [[5, 8], [7, 0], [9, 8]], '#3ac04a'); poly(c, [[8, 8], [11, 2], [12, 8]], '#1a8a2a'); });
      case 'tuftInk': return F('tuftInk', 14, 8, c => { poly(c, [[3, 8], [5, 2], [7, 8]], '#3a3a6a'); poly(c, [[6, 8], [8, 0], [10, 8]], '#5a5aa0'); });
    }
    return null;
  }
  function solaMedal(letter) {
    return F('sola' + letter, 22, 22, c => {
      disc(c, 11, 11, 10, '#c88a10'); disc(c, 11, 11, 8.5, '#ffd23a'); disc(c, 10, 10, 7, '#ffe868');
      ell(c, 7, 6, 3, 2, '#fffbd0');
      c.fillStyle = '#9a5a00'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(letter, 11, 12);
    });
  }
  function scrollIcon(cat) {
    return F('scroll' + (cat ? 'c' : ''), 18, 14, c => {
      P(c, 3, 3, 12, 8, '#fff6dc'); P(c, 3, 9, 12, 2, '#e8d4a0'); rrect(c, 0, 1, 4, 12, 1, '#e0b060'); rrect(c, 14, 1, 4, 12, 1, '#e0b060');
      P(c, 5, 5, 7, 1, '#b89060'); P(c, 5, 7, 5, 1, '#b89060');
      if (cat) disc(c, 9, 7, 2, '#2a4ad8'); else P(c, 8, 3, 2, 8, '#e8382c');
    });
  }

  // ================= UTILERÍA =================
  function prop(kind) {
    if (pc['p' + kind]) return pc['p' + kind];
    const G = (w, h, fn) => (pc['p' + kind] = finish(mk(w, h, fn), '#000', 0));
    switch (kind) {
      case 'casa': return G(64, 72, c => { // casa de entramado alemán
        P(c, 6, 30, 52, 42, '#fff0d0'); for (const x of [6, 22, 38, 54]) P(c, x, 30, 4, 42, '#7a3a1a'); P(c, 6, 30, 52, 4, '#7a3a1a'); P(c, 6, 50, 52, 3, '#7a3a1a'); line(c, 8, 34, 22, 50, 2, '#7a3a1a'); line(c, 56, 34, 42, 50, 2, '#7a3a1a');
        poly(c, [[0, 32], [32, 0], [64, 32]], '#d8402a'); poly(c, [[4, 30], [32, 4], [60, 30]], '#ff5a3a'); for (let y = 10; y < 30; y += 5) P(c, 32 - (y - 2), y, (y - 2) * 2, 1, '#b8301a');
        rrect(c, 26, 56, 12, 16, 4, '#8a4a1a'); P(c, 35, 63, 2, 2, '#ffd23a'); rrect(c, 10, 38, 10, 9, 2, '#6ac0ff'); rrect(c, 44, 38, 10, 9, 2, '#6ac0ff'); P(c, 14, 38, 1, 9, '#7a3a1a'); P(c, 48, 38, 1, 9, '#7a3a1a'); P(c, 46, 4, 6, 14, '#a0a0a0'); });
      case 'iglesia': return G(80, 120, c => { // Iglesia del Castillo de Wittenberg (simplificada)
        P(c, 4, 60, 72, 60, '#f0e0c0'); P(c, 4, 60, 72, 4, '#c8a878'); poly(c, [[0, 62], [40, 34], [80, 62]], '#5a6a8a');
        P(c, 50, 10, 24, 110, '#e8d4b0'); P(c, 50, 10, 4, 110, '#fff4dc'); ell(c, 62, 10, 12, 8, '#4a7ab0'); P(c, 61, 0, 2, 6, '#ffd23a'); P(c, 59, 2, 6, 2, '#ffd23a');
        rrect(c, 56, 30, 12, 16, 6, '#6ac0ff'); rrect(c, 12, 70, 10, 18, 5, '#6ac0ff'); rrect(c, 30, 70, 10, 18, 5, '#6ac0ff');
        rrect(c, 22, 94, 22, 26, 10, '#8a4a1a'); P(c, 32, 94, 2, 26, '#5a2a0a'); for (let y = 98; y < 120; y += 5) P(c, 24, y, 18, 1, '#6a3a10'); });
      case 'puerta95': return G(32, 44, c => { rrect(c, 0, 0, 32, 44, 14, '#c8a878'); rrect(c, 3, 3, 26, 41, 12, '#8a4a1a'); P(c, 15, 3, 2, 41, '#5a2a0a'); for (let y = 10; y < 44; y += 6) P(c, 5, y, 22, 1, '#6a3a10'); disc(c, 12, 26, 1.5, '#ffd23a'); disc(c, 20, 26, 1.5, '#ffd23a'); });
      case 'tesis': return G(12, 16, c => { P(c, 0, 0, 12, 16, '#fff6dc'); for (let y = 2; y < 15; y += 2) P(c, 2, y, 8, 1, '#a08860'); P(c, 5, 0, 2, 2, '#9aa4b4'); });
      case 'puerta': return G(24, 34, c => { rrect(c, 0, 0, 24, 34, 10, '#5a2a0a'); rrect(c, 2, 2, 20, 32, 9, '#a0602a'); P(c, 11, 2, 2, 32, '#7a4210'); disc(c, 17, 19, 1.5, '#ffd23a'); });
      case 'puertaCerrada': return G(24, 34, c => { rrect(c, 0, 0, 24, 34, 10, '#3a3a4a'); rrect(c, 2, 2, 20, 32, 9, '#7a5a3a'); P(c, 2, 14, 20, 3, '#9aa4b4'); rrect(c, 8, 17, 8, 9, 2, '#ffd23a'); P(c, 11, 20, 2, 4, '#3a1a00'); });
      case 'arbol': return G(48, 64, c => { P(c, 20, 36, 8, 28, '#8a5a2a'); P(c, 20, 36, 3, 28, '#b07a40'); disc(c, 24, 24, 20, '#1a9a3a'); disc(c, 18, 18, 13, '#3ac04a'); disc(c, 30, 14, 10, '#3ac04a'); disc(c, 16, 14, 5, '#8ae87a'); for (const [x, y] of [[10, 28], [34, 30], [26, 22]]) disc(c, x, y, 2, '#e8382c'); });
      case 'pino': return G(36, 64, c => { P(c, 16, 50, 5, 14, '#7a4a1a'); for (let i = 0; i < 4; i++) poly(c, [[2 + i * 3, 52 - i * 12], [18, 18 - i * 6 + (i ? 10 : 0) - 10], [34 - i * 3, 52 - i * 12]], i % 2 ? '#1a8a3a' : '#2aa84a'); });
      case 'arbusto': return G(40, 20, c => { for (const [x, r] of [[9, 8], [20, 11], [31, 8]]) disc(c, x, 20, r, '#2aa84a'); disc(c, 18, 12, 4, '#7ae86a'); disc(c, 30, 14, 2, '#7ae86a'); });
      case 'flores': return G(24, 10, c => { for (let i = 0; i < 4; i++) { line(c, 3 + i * 6, 10, 3 + i * 6, 4, 1, '#1a8a2a'); disc(c, 3 + i * 6, 3, 2, ['#ff4a6a', '#ffd23a', '#ffffff', '#6a8aff'][i]); } });
      case 'valla': return G(48, 18, c => { for (let x = 1; x < 48; x += 8) { P(c, x, 2, 5, 16, '#fff0d0'); poly(c, [[x, 2], [x + 2.5, 0], [x + 5, 2]], '#fff0d0'); } P(c, 0, 6, 48, 3, '#e0c8a0'); P(c, 0, 12, 48, 3, '#e0c8a0'); });
      case 'farol': return G(14, 40, c => { P(c, 6, 12, 3, 28, '#3a3a5a'); P(c, 3, 38, 9, 2, '#3a3a5a'); rrect(c, 2, 2, 11, 12, 3, '#3a3a5a'); P(c, 4, 4, 7, 8, '#6a6a8a'); P(c, 6, 0, 3, 2, '#3a3a5a'); });
      case 'farolOn': return G(14, 40, c => { P(c, 6, 12, 3, 28, '#3a3a5a'); P(c, 3, 38, 9, 2, '#3a3a5a'); rrect(c, 2, 2, 11, 12, 3, '#3a3a5a'); P(c, 4, 4, 7, 8, '#ffe060'); P(c, 5, 5, 3, 3, '#ffffff'); P(c, 6, 0, 3, 2, '#3a3a5a'); });
      case 'cartel': return G(30, 30, c => { P(c, 13, 12, 4, 18, '#8a5a2a'); rrect(c, 1, 1, 28, 13, 3, '#c88a40'); P(c, 3, 3, 24, 1, '#e8b060'); P(c, 5, 6, 18, 1, '#5a3a10'); P(c, 5, 9, 14, 1, '#5a3a10'); });
      case 'barril': return G(20, 24, c => { ell(c, 10, 12, 9, 12, '#a0602a'); ell(c, 8, 12, 5, 11, '#c07a3a'); P(c, 1, 5, 18, 2, '#5a5a6a'); P(c, 1, 17, 18, 2, '#5a5a6a'); ell(c, 10, 2, 7, 2, '#7a4210'); });
      case 'mesa': return G(40, 24, c => { P(c, 0, 6, 40, 4, '#a0602a'); P(c, 0, 6, 40, 1, '#d08a4a'); P(c, 3, 10, 3, 14, '#7a4210'); P(c, 34, 10, 3, 14, '#7a4210'); P(c, 6, 0, 10, 6, '#c81a2a'); P(c, 7, 0, 8, 1, '#fff4d0'); P(c, 22, 2, 12, 4, '#fff4d0'); P(c, 27, 2, 1, 4, '#d0b080'); disc(c, 36, 2, 2, '#1a1a3a'); });
      case 'atril': return G(28, 34, c => { P(c, 12, 14, 4, 20, '#8a4a1a'); P(c, 6, 32, 16, 2, '#8a4a1a'); poly(c, [[1, 14], [27, 14], [24, 6], [4, 6]], '#a0602a'); P(c, 4, 4, 9, 7, '#fff4d0'); P(c, 15, 4, 9, 7, '#fff4d0'); P(c, 13, 4, 2, 7, '#c81a2a'); for (let i = 0; i < 6; i++) P(c, 22 + (i % 2), 14 + i * 3, 2, 2, '#9aa4b4'); });
      case 'estante': return G(36, 44, c => { P(c, 0, 0, 36, 44, '#8a4a1a'); for (let s = 0; s < 4; s++) { P(c, 2, 2 + s * 10, 32, 8, '#3a1a0a'); for (let i = 0; i < 7; i++) P(c, 3 + i * 4.4, 3 + s * 10 + (i % 3 === 0 ? 2 : 0), 3, 7 - (i % 3 === 0 ? 2 : 0), ['#e8382c', '#2a4ad8', '#2aa84a', '#ffd23a', '#9a4ad8'][(i + s) % 5]); } });
      case 'cruz': return G(24, 40, c => { P(c, 10, 0, 5, 40, '#a0602a'); P(c, 2, 9, 21, 5, '#a0602a'); P(c, 10, 0, 2, 40, '#d08a4a'); });
      case 'vela': return G(10, 16, c => { P(c, 3, 6, 4, 10, '#fff4d0'); disc(c, 5, 3, 2, '#ffd23a'); P(c, 5, 2, 1, 2, '#ffffff'); });
      case 'cama': return G(40, 20, c => { P(c, 0, 8, 40, 8, '#a0602a'); P(c, 2, 4, 36, 6, '#ffffff'); P(c, 2, 4, 10, 4, '#e8e8ff'); P(c, 14, 6, 24, 4, '#6a8aff'); P(c, 0, 0, 4, 20, '#7a4210'); P(c, 36, 2, 4, 18, '#7a4210'); });
      case 'puesto': return G(56, 48, c => { P(c, 4, 14, 3, 34, '#8a5a2a'); P(c, 49, 14, 3, 34, '#8a5a2a'); for (let i = 0; i < 7; i++) poly(c, [[i * 8, 4], [i * 8 + 8, 4], [i * 8 + 8, 16], [i * 8 + 4, 19], [i * 8, 16]], i % 2 ? '#ffffff' : '#e8382c'); P(c, 0, 0, 56, 5, '#e8382c'); P(c, 2, 32, 52, 6, '#a0602a'); for (let i = 0; i < 6; i++) disc(c, 10 + i * 7, 30, 3, ['#ffd23a', '#ff4a6a', '#7ae86a', '#ffd23a', '#c04ab0', '#ff8a2a'][i]); });
      case 'cofreNPC': return G(26, 20, c => { P(c, 1, 8, 24, 12, '#9a5a20'); ell(c, 13, 8, 12, 4, '#c07a30'); P(c, 1, 11, 24, 2, '#ffd23a'); rrect(c, 10, 12, 6, 6, 1, '#ffd23a'); for (let i = 0; i < 4; i++) disc(c, 6 + i * 5, 6, 2, '#ffd23a'); });
      case 'imprenta': return G(56, 60, c => { P(c, 4, 0, 6, 60, '#7a4210'); P(c, 46, 0, 6, 60, '#7a4210'); P(c, 4, 0, 48, 6, '#7a4210'); P(c, 6, 30, 44, 6, '#a0602a'); line(c, 28, 6, 28, 22, 4, '#5a5a6a'); P(c, 14, 22, 28, 6, '#5a5a6a'); line(c, 28, 12, 50, 8, 2, '#9a6a2a'); disc(c, 51, 8, 2.5, '#5a2a0a'); P(c, 12, 36, 32, 4, '#fff4d0'); P(c, 4, 54, 48, 6, '#7a4210'); });
      case 'trono': return G(40, 52, c => { rrect(c, 6, 0, 28, 40, 6, '#c81a2a'); rrect(c, 9, 3, 22, 34, 4, '#ff4a5a'); P(c, 2, 30, 36, 8, '#ffd23a'); P(c, 4, 38, 4, 14, '#ffd23a'); P(c, 32, 38, 4, 14, '#ffd23a'); disc(c, 20, 6, 3, '#ffd23a'); });
      case 'estandarte': return G(20, 44, c => { P(c, 0, 0, 2, 44, '#7a4210'); poly(c, [[2, 2], [20, 2], [20, 30], [11, 25], [2, 30]], '#ffd23a'); poly(c, [[4, 4], [18, 4], [18, 26], [11, 22], [4, 26]], '#1a1a1a'); disc(c, 11, 13, 4, '#ffd23a'); });
      case 'ventana': return G(24, 36, c => { rrect(c, 0, 0, 24, 36, 11, '#c8a878'); rrect(c, 3, 3, 18, 31, 9, '#6ac0ff'); P(c, 11, 3, 2, 31, '#c8a878'); P(c, 3, 18, 18, 2, '#c8a878'); P(c, 5, 6, 4, 8, '#b0e0ff'); });
      case 'vitral': return G(24, 40, c => { rrect(c, 0, 0, 24, 40, 11, '#5a5a6a'); rrect(c, 3, 3, 18, 35, 9, '#2a4ad8'); const cols = ['#e8382c', '#ffd23a', '#2aa84a', '#9a4ad8', '#ff8a2a']; for (let y = 6; y < 36; y += 6) for (let x = 4; x < 20; x += 6) P(c, x, y, 5, 5, cols[(x + y) % 5]); P(c, 11, 3, 2, 35, '#3a3a4a'); P(c, 3, 20, 18, 2, '#3a3a4a'); });
      case 'escalera': return G(30, 30, c => { for (let i = 0; i < 5; i++) P(c, i * 6, 24 - i * 6, 30 - i * 6, 6, i % 2 ? '#e8b8a0' : '#f0c8b0'); });
      case 'reliquias': return G(40, 36, c => { P(c, 0, 0, 40, 36, '#7a4210'); P(c, 2, 2, 36, 32, '#3a1a0a'); for (let s = 0; s < 3; s++) for (let i = 0; i < 4; i++) { const x = 4 + i * 9, y = 4 + s * 11; rrect(c, x, y, 7, 9, 2, '#ffd23a'); P(c, x + 2, y + 2, 3, 4, ['#ff4a6a', '#6ac0ff', '#fff4d0'][(i + s) % 3]); } });
      case 'hoguera': return G(32, 30, c => { for (let i = 0; i < 4; i++) line(c, 4 + i * 7, 28, 16, 18, 3, '#7a4210'); });
      case 'columna': return G(20, 80, c => { P(c, 2, 6, 16, 70, '#f0e0d0'); P(c, 2, 6, 4, 70, '#ffffff'); for (let x = 7; x < 18; x += 4) P(c, x, 8, 1, 66, '#d0b8a0'); P(c, 0, 0, 20, 7, '#e8d0b8'); P(c, 0, 74, 20, 6, '#e8d0b8'); });
      case 'castillo': return G(96, 90, c => { P(c, 10, 30, 76, 60, '#c8b8a0'); P(c, 10, 30, 76, 4, '#e8d8c0'); for (let x = 10; x < 86; x += 10) P(c, x, 24, 6, 6, '#c8b8a0'); P(c, 0, 10, 22, 80, '#b8a890'); poly(c, [[-2, 12], [11, -6], [24, 12]], '#d8402a'); P(c, 70, 18, 22, 72, '#b8a890'); poly(c, [[68, 20], [81, 2], [94, 20]], '#d8402a'); rrect(c, 38, 60, 20, 30, 10, '#5a2a0a'); for (const x of [6, 78, 30, 62]) rrect(c, x, 44, 7, 10, 3, '#3a3a5a'); });
      case 'pulpito': return G(34, 40, c => { P(c, 14, 20, 6, 20, '#7a4210'); rrect(c, 2, 4, 30, 18, 4, '#a0602a'); P(c, 4, 6, 26, 2, '#d08a4a'); P(c, 10, 0, 14, 5, '#fff4d0'); P(c, 16, 0, 2, 5, '#c81a2a'); });
      case 'nube': return G(48, 22, c => { for (const [x, y, r] of [[10, 14, 8], [22, 10, 10], [34, 12, 9], [40, 15, 6]]) disc(c, x, y, r, '#ffffff'); P(c, 6, 16, 38, 6, '#ffffff'); ell(c, 22, 18, 18, 3, '#c8e0ff'); });
      case 'cofreAbierto': return G(26, 20, c => { P(c, 1, 8, 24, 12, '#9a5a20'); P(c, 1, 11, 24, 2, '#ffd23a'); P(c, 3, 2, 20, 7, '#3a1a0a'); });
    }
    return null;
  }

  // ================= FONDOS (estilo de 16 bits, colores vivos) =================
  function sky(c, w, h, top, bot) { const n = 12; for (let i = 0; i < n; i++) { const t = i / (n - 1); const [r1, g1, b1] = hex(top), [r2, g2, b2] = hex(bot); c.fillStyle = `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`; c.fillRect(0, Math.floor(i * h / n), w, Math.ceil(h / n) + 1); } }
  function puffCloud(c, x, y, s, col, out, shadow) {
    const parts = [[0, 0, 1], [.9, -.4, 1.2], [1.9, 0, 1], [1, .3, 1]];
    for (const [dx, dy, k] of parts) disc(c, x + dx * s, y + dy * s, s * .7 * k + 1, out);
    for (const [dx, dy, k] of parts) disc(c, x + dx * s, y + dy * s, s * .7 * k, col);
    ell(c, x + s, y + s * .4, s * 1.3, s * .25, shadow);
    disc(c, x + s * .7, y - s * .5, s * .22, '#ffffff');
  }
  function smbHills(c, w, h, base, col, r, amp, opt) {
    let x = -20;
    while (x < w + 40) {
      const hw = 40 + r() * 70, hh = amp * (.6 + r() * .5), cx = x + hw / 2;
      ell(c, cx, base, hw / 2 + 1, hh + 1, opt.out || '#000');
      ell(c, cx, base, hw / 2, hh, col);
      P(c, cx - hw / 2, base, hw, h, col);
      if (opt.stripes) for (let s = -3; s <= 3; s++) { const sx = cx + s * hw / 8; for (let y = base - hh * .8 * Math.sqrt(Math.max(0, 1 - (s / 4) ** 2)); y < base + 80; y += 1) P(c, sx, y, 2, 1, opt.stripes); }
      if (opt.dots) for (let i = 0; i < 6; i++) { const dx = (r() - .5) * hw * .6, dy = -r() * hh * .7; disc(c, cx + dx, base + dy, 2, opt.dots); }
      if (opt.shine) ell(c, cx - hw * .2, base - hh * .75, hw * .12, hh * .1, opt.shine);
      x += hw * (.6 + r() * .4);
    }
  }
  function townRow(c, w, base, r, opt) {
    let x = 0; const roofs = opt.roofs || ['#d8402a', '#c8502a', '#a83a2a', '#5a6a8a'];
    while (x < w + 40) {
      const bw = 26 + r() * 22, bh = 26 + r() * 30, col = opt.wall || '#fff0d0';
      P(c, x, base - bh, bw, bh + 80, col); P(c, x, base - bh, 2, bh + 80, shade(col, 20));
      if (opt.timber) { P(c, x, base - bh, 2, bh, '#7a3a1a'); P(c, x + bw - 2, base - bh, 2, bh, '#7a3a1a'); P(c, x, base - bh * .5, bw, 2, '#7a3a1a'); line(c, x + 2, base - bh, x + bw / 2, base - bh * .5, 1, '#7a3a1a'); }
      const rf = roofs[(r() * roofs.length) | 0]; poly(c, [[x - 3, base - bh + 1], [x + bw / 2, base - bh - 14 - r() * 12], [x + bw + 3, base - bh + 1]], rf);
      for (let wy = base - bh + 8; wy < base - 6; wy += 11) for (let wx = x + 5; wx < x + bw - 6; wx += 9) P(c, wx, wy, 4, 5, opt.win || '#6ac0ff');
      if (opt.tower && r() < .18) { const tx = x + bw / 2 - 6; P(c, tx, base - bh - 50, 12, 50, shade(col, -10)); poly(c, [[tx - 2, base - bh - 50], [tx + 6, base - bh - 74], [tx + 14, base - bh - 50]], '#4a7ab0'); }
      x += bw + 2 + r() * 8;
    }
  }
  function domes(c, w, base, r) {
    let x = 0;
    while (x < w + 40) {
      const bw = 30 + r() * 30, bh = 20 + r() * 34;
      P(c, x, base - bh, bw, bh + 80, '#f0c8a0'); P(c, x, base - bh, bw, 3, '#ffe0c0');
      for (let wx = x + 4; wx < x + bw - 4; wx += 7) rrect(c, wx, base - bh + 8, 4, 9, 2, '#a0602a');
      if (r() < .35) { disc(c, x + bw / 2, base - bh, bw * .32, '#e8a878'); P(c, x + bw / 2 - 1, base - bh - bw * .32 - 8, 2, 8, '#ffd23a'); }
      else if (r() < .3) { P(c, x + bw / 2 - 4, base - bh - 36, 8, 36, '#f0c8a0'); poly(c, [[x + bw / 2 - 5, base - bh - 36], [x + bw / 2, base - bh - 46], [x + bw / 2 + 5, base - bh - 36]], '#d8402a'); }
      x += bw + r() * 6;
    }
  }
  function forest(c, w, base, r, col, col2) {
    for (let x = -10; x < w + 20; x += 10 + r() * 14) { const s = 10 + r() * 12; disc(c, x, base - s, s + 1, '#000'); disc(c, x, base - s, s, col); disc(c, x - s * .3, base - s * 1.3, s * .4, col2); }
    P(c, 0, base - 2, w, 80, col);
  }
  function pines(c, w, base, r, col) { for (let x = -10; x < w + 20; x += 7 + r() * 10) { const s = 20 + r() * 26; poly(c, [[x - s * .35, base], [x, base - s], [x + s * .35, base]], col); } P(c, 0, base, w, 80, col); }
  function brickWall(c, w, h, col, mort, win) {
    P(c, 0, 0, w, h, col);
    for (let y = 0; y < h; y += 8) { P(c, 0, y, w, 1, mort); for (let x = (y / 8 % 2) * 8; x < w; x += 16) P(c, x, y, 1, 8, mort); }
    if (win) for (let x = 30; x < w; x += 110) { const v = prop(win); c.drawImage(v, x, 50); }
    const g = c.createLinearGradient(0, h - 50, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = g; c.fillRect(0, h - 50, w, 50);
  }
  const BG = {};
  function background(theme, levelW, VW, VH) {
    const key = theme.id + levelW; if (BG[key]) return BG[key];
    const layers = [];
    layers.push({ f: 0, fixed: true, cv: mk(VW, VH, c => {
      sky(c, VW, VH, theme.sky[0], theme.sky[1]);
      if (theme.sun) { disc(c, theme.sun[0], theme.sun[1], theme.sun[2] + 3, 'rgba(255,255,220,.35)'); disc(c, theme.sun[0], theme.sun[1], theme.sun[2], theme.sunCol || '#fff6c0'); }
      if (theme.stars) { const r = mulberry(5); for (let i = 0; i < 60; i++) P(c, r() * VW, r() * VH * .6, 1, 1, r() < .3 ? '#ffffff' : '#a0b0ff'); }
    }) });
    (theme.layers || []).forEach((L, i) => {
      const w = Math.ceil(VW + Math.max(0, levelW - VW) * L.f) + 60, r = mulberry(L.seed || (i * 37 + 11)), H = VH + 60;
      const cv = mk(w, H, c => {
        const b = L.base;
        if (L.kind === 'clouds') for (let k = 0; k < w / 70; k++) puffCloud(c, r() * w, b + (r() - .5) * 50, 9 + r() * 9, L.col || '#ffffff', L.out || '#4a6ac8', L.sh || '#c8e0ff');
        else if (L.kind === 'hills') smbHills(c, w, H, b, L.col, r, L.amp || 40, L);
        else if (L.kind === 'town') { townRow(c, w, b, r, L); }
        else if (L.kind === 'domes') domes(c, w, b, r);
        else if (L.kind === 'forest') forest(c, w, b, r, L.col, L.col2);
        else if (L.kind === 'pines') pines(c, w, b, r, L.col);
        else if (L.kind === 'wall') brickWall(c, w, H, L.col, L.mort, L.win);
        else if (L.kind === 'castleHill') { smbHills(c, w, H, b, L.col, r, 50, {}); const v = prop('castillo'), cx0 = L.x || w * .55; ell(c, cx0 + 48, b + 4, 94, 58, '#000'); ell(c, cx0 + 48, b + 4, 92, 56, L.col); ell(c, cx0 + 30, b - 30, 30, 8, 'rgba(255,255,255,.18)'); c.drawImage(v, cx0, b - 130); }
        else if (L.kind === 'church') { const v = prop('iglesia'); c.drawImage(v, L.x, b - 120); }
        else if (L.kind === 'stormclouds') for (let k = 0; k < w / 40; k++) puffCloud(c, r() * w, b + (r() - .5) * 30, 10 + r() * 12, L.col, '#000', L.sh || '#2a2a4a');
        else if (L.kind === 'columns') { for (let x = 20; x < w; x += 90) { const v = prop('columna'); c.drawImage(v, x, b - 80); } }
      });
      layers.push({ f: L.f, cv, y: L.y || 0, alpha: L.alpha });
    });
    BG[key] = layers; return layers;
  }

  // ================= BLOQUES =================
  const STYLE = {
    grass: { top: '#3ac04a', topH: '#8ae87a', topS: '#1a8a2a', a: '#e8a050', b: '#c87a30', dot: '#a05a1a', hi: '#ffc070' },
    brick: { top: '#d07a50', topH: '#ffb090', topS: '#9a4a2a', a: '#c8603a', b: '#9a4026', dot: '#f0e0c0', brick: true },
    stone: { top: '#a8a8c0', topH: '#e0e0f0', topS: '#6a6a88', a: '#8a8aa8', b: '#6a6a88', dot: '#c0c0d8', block: true },
    wood: { top: '#d0904a', topH: '#ffc080', topS: '#8a5020', a: '#b8763a', b: '#8a5020', dot: '#e0a060', planks: true },
    marble: { top: '#ffe0c8', topH: '#ffffff', topS: '#d0a088', a: '#f0c8b0', b: '#d0a088', dot: '#fff0e0', block: true },
    sand: { top: '#ffd880', topH: '#fff4c0', topS: '#d0a040', a: '#f0c060', b: '#d0a040', dot: '#c08a30', hi: '#ffe8a0' },
    night: { top: '#2a8a5a', topH: '#5ac08a', topS: '#1a5a3a', a: '#7a5a8a', b: '#5a3a6a', dot: '#4a2a5a', hi: '#9a7aaa' },
    snow: { top: '#ffffff', topH: '#ffffff', topS: '#b0c8f0', a: '#8a9ab8', b: '#6a7a98', dot: '#a8b8d8', hi: '#c0d0f0' }
  };
  function tileLayer(grid, style, TS) {
    const H = grid.length, W = grid[0].length, S = STYLE[style] || STYLE.grass;
    return mk(W * TS, H * TS, c => {
      const solid = (x, y) => y >= 0 && y < H && x >= 0 && x < W && grid[y][x] === '#';
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const t = grid[y][x], ox = x * TS, oy = y * TS, r = mulberry(x * 7349 + y * 131 + 17);
        if (t === '#') {
          const topOpen = !solid(x, y - 1);
          P(c, ox, oy, TS, TS, S.a);
          if (S.brick) { for (let row = 0; row < 4; row++) { P(c, ox, oy + row * 4 + 3, TS, 1, S.b); P(c, ox + ((row % 2) * 8 + 3) % 16, oy + row * 4, 1, 3, S.b); P(c, ox + ((row % 2) * 8 + 11) % 16, oy + row * 4, 1, 3, S.b); } P(c, ox + 1, oy + 1, 3, 1, S.dot); }
          else if (S.block) { P(c, ox, oy, TS, 1, S.dot); P(c, ox, oy, 1, TS, S.dot); P(c, ox, oy + TS - 1, TS, 1, S.b); P(c, ox + TS - 1, oy, 1, TS, S.b); P(c, ox + 3, oy + 3, 2, 2, S.dot); }
          else if (S.planks) { for (let i = 0; i < TS; i += 5) P(c, ox, oy + i, TS, 1, S.b); P(c, ox + ((x * 5 + y * 3) % 12) + 2, oy, 1, TS, S.b); }
          else { for (let i = 0; i < 3; i++) disc(c, ox + 3 + r() * 10, oy + 3 + r() * 10, 1.2, S.dot); if (S.hi) P(c, ox + (r() * 12 | 0), oy + (r() * 12 | 0), 2, 1, S.hi); }
          if (topOpen) {
            P(c, ox, oy, TS, 6, S.top); P(c, ox, oy, TS, 2, S.topH);
            for (let i = 0; i < TS; i += 4) { const d = 2 + ((x * 4 + i) % 3); P(c, ox + i, oy + 6, 4, d, S.top); P(c, ox + i, oy + 6 + d, 4, 1, S.topS); }
            if (!solid(x - 1, y)) { P(c, ox, oy, 2, 9, S.topS); }
            if (!solid(x + 1, y)) { P(c, ox + TS - 2, oy, 2, 9, S.topS); }
          }
          if (!solid(x - 1, y)) P(c, ox, oy + (topOpen ? 9 : 0), 1, TS, '#000');
          if (!solid(x + 1, y)) P(c, ox + TS - 1, oy + (topOpen ? 0 : 0), 1, TS, '#000');
          if (topOpen) P(c, ox, oy, TS, 1, '#000');
          if (!solid(x, y + 1) && y < H - 1) P(c, ox, oy + TS - 1, TS, 1, '#000');
        } else if (t === '=') {
          // tronco/puente de troncos
          P(c, ox, oy, TS, 7, '#000'); P(c, ox, oy + 1, TS, 5, '#c07a3a'); P(c, ox, oy + 1, TS, 1, '#ffb070'); P(c, ox, oy + 5, TS, 1, '#8a4a1a');
          if (grid[y][x - 1] !== '=') { disc(c, ox + 3, oy + 3.5, 3, '#000'); disc(c, ox + 3, oy + 3.5, 2.2, '#f0c080'); P(c, ox + 3, oy + 3, 1, 1, '#a0602a'); }
          if (grid[y][x + 1] !== '=') { disc(c, ox + 12, oy + 3.5, 3, '#000'); disc(c, ox + 12, oy + 3.5, 2.2, '#f0c080'); P(c, ox + 12, oy + 3, 1, 1, '#a0602a'); }
        } else if (t === '^') {
          for (let i = 0; i < 2; i++) { const sx = ox + i * 8; poly(c, [[sx - 1, oy + TS], [sx + 4, oy + 3], [sx + 9, oy + TS]], '#000'); poly(c, [[sx, oy + TS], [sx + 4, oy + 5], [sx + 8, oy + TS]], '#c0c8d8'); poly(c, [[sx + 4, oy + 5], [sx + 8, oy + TS], [sx + 5, oy + TS]], '#7a849a'); P(c, sx + 3, oy + 8, 1, 3, '#ffffff'); }
        }
      }
    });
  }
  return { mk, P, line, poly, disc, ell, rrect, finish, flip, tinted, person, CH, NPC, bula, moneda, cuervo, cofre, sombra, item, solaMedal, scrollIcon, prop, background, tileLayer, mulberry, shade, STYLE };
})();
