// Contenido: la vida de Martín Lutero y la Reforma en 5 capítulos. Versículos: Reina-Valera 1960.
window.REFORMA = (() => {
  'use strict';
  const names = {
    'Staupitz': 'staupitz', 'Hermano Juan': 'monje', 'Hermano Lorenzo': 'monje2', 'Tetzel': 'tetzel', 'Hans Lutero': 'hans', 'Carlos V': 'carlos', 'Federico el Sabio': 'federico',
    'Juan von der Ecken': 'eck', 'Spalatin': 'spalatin', 'Campesino': 'aldeano', 'Campesina': 'aldeana', 'Niño': 'nino', 'Impresor': 'impresor', 'Caballero': 'caballero',
    'Heraldo': 'guardia', 'Estudiante': 'estudiante', 'Vendedor': 'aldeano', 'Hansito': 'hansito', 'Magdalena': 'magdalena', 'Cardenal': 'cardenal'
  };

  // ---------- temas de fondo ----------
  const TH = {
    title: { id: 'title', sky: ['#4a8aff', '#c8ecff'], sun: [330, 34, 12], layers: [{ kind: 'clouds', f: .08, base: 50 }, { kind: 'hills', f: .2, base: 150, col: '#8ad8a0', amp: 46, stripes: '#6ac088', out: '#2a7a4a' }, { kind: 'town', f: .45, base: 180, timber: true, tower: true }] },
    storm: { id: 'storm', sky: ['#1a1a40', '#5a5a90'], layers: [{ kind: 'stormclouds', f: .06, base: 30, col: '#4a4a7a', sh: '#2a2a50' }, { kind: 'hills', f: .2, base: 160, col: '#2a6a5a', amp: 40, stripes: '#1a5a4a', out: '#0a2a2a' }, { kind: 'forest', f: .4, base: 196, col: '#1a4a3a', col2: '#2a6a4a' }] },
    erfurt: { id: 'erfurt', sky: ['#c8b8a0', '#e8dcc8'], layers: [{ kind: 'wall', f: .35, col: '#d8c8a8', mort: '#b8a888', win: 'vitral' }] },
    rome: { id: 'rome', sky: ['#ff8a5a', '#ffe8a8'], sun: [300, 70, 16], sunCol: '#fff0c0', layers: [{ kind: 'clouds', f: .06, base: 40, col: '#ffe0d0', out: '#c86a5a', sh: '#ffc0a0' }, { kind: 'domes', f: .25, base: 170 }, { kind: 'columns', f: .5, base: 196 }] },
    witt: { id: 'witt', sky: ['#4a8aff', '#c8ecff'], sun: [60, 30, 11], layers: [{ kind: 'clouds', f: .08, base: 46 }, { kind: 'hills', f: .2, base: 150, col: '#8ad8a0', amp: 40, stripes: '#6ac088', out: '#2a7a4a' }, { kind: 'town', f: .45, base: 182, timber: true, tower: true }] },
    tower: { id: 'tower', sky: ['#8a5a3a', '#b07a4a'], layers: [{ kind: 'wall', f: .3, col: '#c88a5a', mort: '#a06a3a', win: 'ventana' }] },
    market: { id: 'market', sky: ['#5a9aff', '#d8f0ff'], sun: [320, 28, 11], layers: [{ kind: 'clouds', f: .08, base: 40 }, { kind: 'hills', f: .18, base: 140, col: '#a0e0a8', amp: 36, dots: '#7ac890', out: '#3a8a5a' }, { kind: 'town', f: .45, base: 184, timber: true, roofs: ['#ff6a3a', '#ffb02a', '#d84a8a', '#5a8aff'] }] },
    road: { id: 'road', sky: ['#5aa0ff', '#e0f4ff'], sun: [80, 30, 11], layers: [{ kind: 'clouds', f: .08, base: 46 }, { kind: 'hills', f: .2, base: 150, col: '#7ad090', amp: 52, stripes: '#5ab878', out: '#2a7a4a' }, { kind: 'forest', f: .4, base: 192, col: '#2aa84a', col2: '#6ad87a' }] },
    worms: { id: 'worms', sky: ['#7a2a2a', '#a84a3a'], layers: [{ kind: 'wall', f: .3, col: '#c8603a', mort: '#9a4026', win: 'ventana' }] },
    forest: { id: 'forest', sky: ['#ff9a6a', '#ffe0b0'], sun: [320, 80, 14], layers: [{ kind: 'clouds', f: .06, base: 40, col: '#fff0e0', out: '#c87a5a', sh: '#ffd0b0' }, { kind: 'pines', f: .2, base: 170, col: '#2a7a5a' }, { kind: 'forest', f: .45, base: 196, col: '#1a8a3a', col2: '#4ab85a' }] },
    wartburg: { id: 'wartburg', sky: ['#3a6ad8', '#b0d8ff'], sun: [60, 40, 11], layers: [{ kind: 'clouds', f: .06, base: 40 }, { kind: 'castleHill', f: .15, base: 150, col: '#5ab878', x: 160 }, { kind: 'pines', f: .4, base: 196, col: '#1a8a4a' }] },
    print: { id: 'print', sky: ['#ff8a6a', '#ffe8b0'], sun: [70, 60, 14], layers: [{ kind: 'clouds', f: .06, base: 40, col: '#fff0e0', out: '#c87a5a', sh: '#ffd0b0' }, { kind: 'hills', f: .2, base: 150, col: '#a8d890', amp: 40, stripes: '#88c078', out: '#4a7a3a' }, { kind: 'town', f: .45, base: 182, timber: true, tower: true }] },
    night: { id: 'night', sky: ['#0a0a30', '#2a2a6a'], stars: true, layers: [{ kind: 'hills', f: .2, base: 160, col: '#1a3a5a', amp: 40, out: '#0a1a2a' }, { kind: 'town', f: .45, base: 190, wall: '#3a3a6a', roofs: ['#2a2a50'], win: '#ffd23a' }] },
    church: { id: 'church', sky: ['#c8b8a0', '#e8dcc8'], layers: [{ kind: 'wall', f: .3, col: '#e0d0b8', mort: '#c0b098', win: 'vitral' }] }
  };

  // ---------- pergaminos ----------
  const SC = [
    [ // Capítulo I
      { ref: 'Salmo 46:1', text: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.', q: 'Según este salmo, ¿quién es nuestro amparo en la tormenta?', opts: ['Dios', 'Nuestras buenas obras', 'Un santo famoso'], a: 0, note: 'Años después, Lutero escribió el himno «Castillo fuerte es nuestro Dios» basado en el Salmo 46.' },
      { ref: 'Efesios 2:8-9', text: 'Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios; no por obras, para que nadie se gloríe.', q: 'La salvación es…', opts: ['Un regalo de Dios', 'Un premio por portarnos bien', 'Algo que se puede comprar'], a: 0, note: 'Lutero intentó ganarse el cielo con ayunos y oraciones. Tardó años en entender que es un regalo.' },
      { ref: 'Romanos 3:23-24', text: 'Por cuanto todos pecaron, y están destituidos de la gloria de Dios, siendo justificados gratuitamente por su gracia, mediante la redención que es en Cristo Jesús.', q: '¿Cómo somos justificados?', opts: ['Gratuitamente, por su gracia', 'Pagando con dinero', 'Rezando muchas horas'], a: 0, note: '«Gratuitamente» quiere decir gratis: Cristo pagó todo el precio.' },
      { ref: 'Salmo 119:105', text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.', q: '¿Qué es la Palabra de Dios para nuestro camino?', opts: ['Una lámpara que nos guía', 'Un libro solo para sacerdotes', 'Algo que no se entiende'], a: 0, note: 'En tiempos de Lutero casi nadie tenía una Biblia ni podía leerla en su idioma.' },
      { cat: true, ref: '¿Qué es el pecado?', text: 'El pecado es cualquier falta de conformidad con la ley de Dios, o cualquier transgresión de ella.', src: 'Catecismo Menor de Westminster, P. 14 (también en el Catecismo Bautista)', q: '¿Qué es el pecado?', opts: ['Cualquier falta de conformidad con la ley de Dios, o transgresión de ella', 'Solo los pecados muy grandes', 'Algo que se borra con dinero'], a: 0, note: 'Lutero sabía que era pecador; lo que todavía no sabía era cómo Dios perdona.' }
    ],
    [ // Capítulo II
      { ref: 'Romanos 1:17', text: 'Porque en el evangelio la justicia de Dios se revela por fe y para fe, como está escrito: Mas el justo por la fe vivirá.', q: '¿Por medio de qué vive el justo?', opts: ['Por la fe', 'Por sus obras', 'Por subir escaleras de rodillas'], a: 0, note: 'Este versículo cambió la vida de Lutero: la justicia de Dios es un regalo que se recibe por la fe.' },
      { ref: 'Habacuc 2:4', text: 'He aquí que aquel cuya alma no es recta, se enorgullece; mas el justo por su fe vivirá.', q: '¿En qué libro del Antiguo Testamento ya aparece «el justo por su fe vivirá»?', opts: ['Habacuc', 'Génesis', 'Apocalipsis'], a: 0, note: 'Pablo cita a Habacuc en Romanos y Gálatas: el evangelio siempre fue el mismo.' },
      { ref: 'Romanos 5:1', text: 'Justificados, pues, por la fe, tenemos paz para con Dios por medio de nuestro Señor Jesucristo.', q: '¿Qué tenemos con Dios cuando somos justificados por la fe?', opts: ['Paz', 'Miedo', 'Una deuda'], a: 0, note: 'En el monasterio Lutero no tenía paz. La encontró en Cristo, no en sus obras.' },
      { ref: 'Gálatas 2:16', text: 'Sabiendo que el hombre no es justificado por las obras de la ley, sino por la fe de Jesucristo, nosotros también hemos creído en Jesucristo, para ser justificados por la fe de Cristo.', q: '¿Somos justificados por las obras de la ley?', opts: ['No, por la fe en Jesucristo', 'Sí, si nos esforzamos mucho', 'Solo los monjes'], a: 0, note: 'Las buenas obras son el fruto de la salvación, no su precio.' },
      { cat: true, ref: '¿Qué es la justificación?', text: 'La justificación es un acto de la libre gracia de Dios, en el cual él perdona todos nuestros pecados, y nos acepta como justos ante sus ojos, solo por la justicia de Cristo imputada a nosotros y recibida solo por la fe.', src: 'Catecismo Menor de Westminster, P. 33 (también en el Catecismo Bautista)', q: '¿Cómo recibimos la justicia de Cristo?', opts: ['Solo por la fe', 'Por nuestras obras', 'Comprando una indulgencia'], a: 0, note: '«Imputada» quiere decir que Dios nos la pone a nuestra cuenta, como un regalo.' }
    ],
    [ // Capítulo III
      { ref: 'Mateo 4:17', text: 'Desde entonces comenzó Jesús a predicar, y a decir: Arrepentíos, porque el reino de los cielos se ha acercado.', q: '¿Con qué palabra de Jesús comienzan las 95 tesis?', opts: ['Arrepentíos', 'Pagad', 'Callad'], a: 0, note: 'Tesis 1: Jesús quiso que toda la vida de los creyentes fuera arrepentimiento.' },
      { ref: '1 Timoteo 2:5', text: 'Porque hay un solo Dios, y un solo mediador entre Dios y los hombres, Jesucristo hombre.', q: '¿Cuántos mediadores hay entre Dios y los hombres?', opts: ['Uno solo: Jesucristo', 'Muchos santos', 'El dinero de las indulgencias'], a: 0, note: 'No necesitamos otro intermediario: Cristo nos lleva al Padre.' },
      { ref: 'Hebreos 10:14', text: 'Porque con una sola ofrenda hizo perfectos para siempre a los santificados.', q: '¿Cuántas veces necesitó Cristo ofrecerse por nuestros pecados?', opts: ['Una sola vez, para siempre', 'Cada domingo', 'Cada vez que alguien paga'], a: 0, note: 'El sacrificio de Cristo en la cruz es completo. Nada se le puede añadir.' },
      { ref: 'Juan 14:6', text: 'Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.', q: '¿Por quién venimos al Padre?', opts: ['Solo por Jesús', 'Por una indulgencia', 'Por nuestros méritos'], a: 0, note: 'Solus Christus: solo Cristo es el camino.' },
      { cat: true, ref: 'Catecismo de Lutero: «Creo en Jesucristo»', text: 'Creo que Jesucristo, verdadero Dios engendrado del Padre en la eternidad, y también verdadero hombre nacido de la virgen María, es mi Señor, que me ha redimido a mí, hombre perdido y condenado, no con oro ni plata, sino con su santa y preciosa sangre y con su inocente pasión y muerte.', src: 'Catecismo Menor de Martín Lutero (1529), explicación del segundo artículo del Credo (resumen)', q: '¿Con qué nos rescató Cristo?', opts: ['Con su santa y preciosa sangre', 'Con oro y plata', 'Con indulgencias'], a: 0, note: 'Lutero tomó la idea de 1 Pedro 1:18-19.' }
    ],
    [ // Capítulo IV
      { ref: 'Hechos 5:29', text: 'Respondiendo Pedro y los apóstoles, dijeron: Es necesario obedecer a Dios antes que a los hombres.', q: '¿A quién debemos obedecer antes que a los hombres?', opts: ['A Dios', 'Al más poderoso', 'A lo que diga la mayoría'], a: 0, note: 'Ante el emperador, Lutero eligió obedecer la Palabra de Dios.' },
      { ref: '2 Timoteo 3:16-17', text: 'Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia, a fin de que el hombre de Dios sea perfecto, enteramente preparado para toda buena obra.', q: '¿Cuánta de la Escritura es inspirada por Dios?', opts: ['Toda', 'Solo una parte', 'La que nos gusta'], a: 0, note: 'Sola Scriptura: la Biblia es la autoridad más alta, por encima de papas, concilios y tradiciones.' },
      { ref: 'Isaías 40:8', text: 'Sécase la hierba, marchítase la flor; mas la palabra del Dios nuestro permanece para siempre.', q: '¿Cuánto tiempo permanece la Palabra de Dios?', opts: ['Para siempre', 'Mil años', 'Hasta que el emperador quiera'], a: 0, note: 'El lema de los amigos de Lutero era «La Palabra del Señor permanece para siempre».' },
      { ref: 'Salmo 46:7', text: 'Jehová de los ejércitos está con nosotros; nuestro refugio es el Dios de Jacob.', q: '¿Quién estaba con Lutero cuando parecía estar solo?', opts: ['Jehová de los ejércitos', 'Nadie', 'Solo sus amigos'], a: 0, note: 'Dios cuidó a Lutero por medio de amigos como Federico el Sabio.' },
      { cat: true, ref: '¿Qué regla nos ha dado Dios?', text: 'La Palabra de Dios, que está contenida en las Escrituras del Antiguo y del Nuevo Testamento, es la única regla para enseñarnos cómo podemos glorificarle y gozar de él.', src: 'Catecismo Menor de Westminster, P. 2 (también en el Catecismo Bautista)', q: '¿Cuál es la única regla para saber cómo glorificar a Dios?', opts: ['La Palabra de Dios en las Escrituras', 'Lo que digan los concilios', 'Nuestros sentimientos'], a: 0, note: 'Las confesiones y catecismos son útiles, pero solo la Biblia es la regla perfecta.' }
    ],
    [ // Capítulo V
      { ref: 'Romanos 10:17', text: 'Así que la fe es por el oír, y el oír, por la palabra de Dios.', q: '¿Cómo viene la fe?', opts: ['Por oír la palabra de Dios', 'Por ver milagros', 'Por nacer en una familia cristiana'], a: 0, note: 'Por eso Lutero tradujo la Biblia: para que el pueblo pudiera oírla y leerla en su idioma.' },
      { ref: 'Deuteronomio 6:6-7', text: 'Y estas palabras que yo te mando hoy, estarán sobre tu corazón; y las repetirás a tus hijos, y hablarás de ellas estando en tu casa, y andando por el camino, y al acostarte, y cuando te levantes.', q: '¿Dónde deben los padres enseñar la Palabra a sus hijos?', opts: ['En casa, en el camino, al acostarse y al levantarse', 'Solo en el templo', 'Solo cuando sean grandes'], a: 0, note: 'Lutero escribió el Catecismo Menor (1529) para que cada papá enseñara la fe en casa.' },
      { ref: '1 Corintios 10:31', text: 'Si, pues, coméis o bebéis, o hacéis otra cosa, hacedlo todo para la gloria de Dios.', q: '¿Para qué debemos hacer todo, hasta comer?', opts: ['Para la gloria de Dios', 'Para que nos admiren', 'Para ganar premios'], a: 0, note: 'Lutero enseñó que cualquier trabajo honesto hecho con fe, en casa o en el campo, agrada a Dios.' },
      { ref: 'Romanos 11:36', text: 'Porque de él, y por él, y para él, son todas las cosas. A él sea la gloria por los siglos. Amén.', q: '¿A quién es la gloria por los siglos?', opts: ['A Dios', 'A Lutero', 'A la iglesia'], a: 0, note: 'Soli Deo Gloria: solo a Dios la gloria. La Reforma no se trata de un hombre.' },
      { cat: true, ref: '¿Cuál es el fin principal del hombre?', text: 'El fin principal del hombre es glorificar a Dios, y gozar de él para siempre.', src: 'Catecismo Menor de Westminster, P. 1 (también en el Catecismo Bautista)', q: '¿Cuál es el fin principal del hombre?', opts: ['Glorificar a Dios y gozar de él para siempre', 'Ser famoso', 'Tener mucho dinero'], a: 0, note: 'Para esto fuimos creados.' }
    ]
  ];

  function chapters(E) {
    const { say, ask, wait, lock, unlock, fadeOut, fadeIn, walkTo, banner, shake, flash, spawn, findEnt, burst, floatText, addWis, nextArea, endChapter, A, TS } = E;
    const once = (first, later) => async e => { if (!e.n) { e.n = 1; await say(first); } else await say(later || first); };
    const sign = (x, lines, B) => B.ent('prop', x, { kind: 'cartel', label: true, back: true, talk: async () => say(lines) });
    const tufts = (B, xs, item, regrow) => xs.forEach(x => B.ent('tuft', x, { item: item || 'nabo', regrow }));
    const notPlaying = k => E.W.char !== k;
    const sola = (ch, x, letter, name, meaning, onGet) => spawn({ type: 'sola', x, ch, letter, name, meaning, onGet });
    const wall = x => E.solid({ wall: true, x: x * TS, y: 0, w: 16, h: 240, draw(c, cx, cy) { for (let y = 0; y < 240; y += 16) { A.P(c, this.x - cx, y - cy, 16, 16, '#000'); A.P(c, this.x - cx + 1, y - cy + 1, 14, 14, '#c8603a'); A.P(c, this.x - cx + 1, y - cy + 7, 14, 1, '#9a4026'); A.P(c, this.x - cx + 2, y - cy + 2, 4, 1, '#ffb090'); } } });

    // ===================== CAPÍTULO I =====================
    const c1 = {
      title: 'La tormenta y el monasterio', years: '1505-1507', places: 'Stotternheim · Erfurt', sola: 'Sola Gratia',
      verse: '«Porque por gracia sois salvos por medio de la fe… es don de Dios.» Efesios 2:8', endVerse: '«Siendo justificados gratuitamente por su gracia.» Romanos 3:24',
      flags: { luteroOutfit: 'lutero' }, scrolls: SC[0],
      areas: [
        { name: 'Camino de Stotternheim', sub: '2 de julio de 1505', theme: TH.storm, style: 'night', music: 'storm', particles: 'rain', dark: .2, start: 2,
          scrolls: [[0, 30, 8], [1, 50, 9]],
          onEnter: async () => { await say([['Narrador', 'Martín Lutero tenía 21 años. Estudiaba Derecho en la universidad de Erfurt, porque su padre quería que fuera abogado.'], ['Lutero', '¡Qué tormenta! Tengo que llegar pronto a Erfurt…']]); },
          build(B) {
            B.ground(20, 3);
            sign(5, [['Narrador', '¿Ves la hierba que se mueve? Párate encima y presiona X (o el botón «Arrancar») para sacar un nabo.'], ['Narrador', 'Presiona X otra vez para lanzarlo. ¡Así se vencen los enemigos!']], B);
            tufts(B, [8, 10, 12]); B.ent('bula', 16);
            sign(18, [['Narrador', 'Puedes pararte encima de los enemigos sin que te hagan daño. Párate sobre uno y presiona X para levantarlo… ¡y lánzalo!'], ['Narrador', 'Si mantienes ↓ un momento y luego saltas, darás un supersalto.']], B);
            B.pit(2); B.ground(6, 4); B.ent('bula', 25); tufts(B, [23]);
            B.ground(4, 3); B.plat(29, 9, 3); tufts(B, [31]);
            B.pit(3); B.ground(10, 3); B.ent('lamp', 36); B.ent('cuervo', 42, { rowY: 8, name: 'Miedo' }); B.ent('bula', 40); tufts(B, [38, 43]);
            B.stairs(3, 3, 5); B.ground(6, 5); tufts(B, [50]); B.ent('moneda', 52);
            B.ground(3, 3); B.pit(2); B.ground(14, 3);
            B.ent('bolt', 0, { x0: 58, x1: 82 });
            sign(60, [['Narrador', '¡Cuidado con los rayos! Cuando veas un destello amarillo, muévete rápido.']], B);
            B.ent('bula', 64); B.ent('bula', 69, { red: true }); tufts(B, [62, 66, 70]);
            B.ground(16, 3); B.ent('prop', 84, { kind: 'arbol', back: true });
            B.ent('trigger', 80, { run: async () => {
              lock(); E.fx('thunder'); flash(1); shake(1, 5); E.player.kneel = true; E.W.lightning = .4;
              await wait(.8);
              await say([['Narrador', '¡Un rayo cayó muy cerca de Martín y lo tiró al suelo!'], ['Lutero', '¡Ayúdame, santa Ana, y me haré monje!'], ['Narrador', 'Martín tenía mucho miedo de morir y presentarse ante Dios. Pensaba que Dios era un juez enojado, y que tenía que ganarse su favor.'], ['Narrador', 'Todavía no conocía bien el evangelio: que Dios salva a los pecadores por pura gracia, en Cristo.']]);
              E.player.kneel = false; await nextArea();
            } });
          }
        },
        { name: 'Monasterio de Erfurt', sub: '17 de julio de 1505', theme: TH.erfurt, style: 'stone', music: 'interior', particles: 'dust', start: 2,
          scrolls: [[2, 45, 7], [4, 64, 11]],
          build(B) {
            B.ground(12, 3);
            B.ent('trigger', 3, { run: async () => { lock(); await say([['Narrador', 'Martín cumplió su promesa. Contra el deseo de su padre, entró al monasterio de los agustinos en Erfurt.'], ['Lutero', 'Aquí haré todo lo necesario para que Dios me acepte: oraré, ayunaré y trabajaré más que nadie.']]); unlock(); } });
            B.ent('npc', 7, { key: 'monje', mark: true, talk: once([['Hermano Juan', '¡Bienvenido, hermano Martín! Aquí rezamos siete veces al día, ayunamos y trabajamos en silencio.'], ['Lutero', '¿Y así tendré paz con Dios?'], ['Hermano Juan', 'Eso esperamos todos…']]) });
            [4, 10, 15].forEach(x => B.ent('prop', x, { kind: 'vela', back: true }));
            B.ground(8, 3); B.ent('npc', 17, { key: 'monje2', mark: true, talk: once([['Hermano Lorenzo', '¡Hermano Martín! Dicen que te confiesas durante horas… ¡hasta por pecados pequeñitos!'], ['Lutero', 'Es que, cuando termino de confesarme, ya me acuerdo de otro pecado. Nunca me siento limpio.']]) });
            B.pit(2); B.ground(5, 3); B.ent('bula', 24);
            B.stairs(2, 3, 5); B.ground(8, 5); tufts(B, [30, 35]); B.ent('lamp', 32); B.ent('cuervo', 35, { rowY: 6, name: 'Miedo' });
            B.ground(3, 3); B.ground(10, 3); B.plat(41, 10, 2); B.plat(44, 8, 3);
            B.ent('pickup', 45, { kind: 'llave', row: 8, keep: true, id: 'llave' });
            sign(39, [['Narrador', 'La biblioteca está cerrada. Allá arriba hay una llave: levántala con X, llévala hasta la puerta y presiona E.']], B);
            B.ground(10, 3);
            B.ent('prop', 52, { kind: 'puertaCerrada', id: 'libDoor', label: true, range: 20, talk: async e => {
              if (E.carrying('llave')) { E.takeCarry(); E.fx('door'); const s = E.W.solids.find(o => o.lib); if (s) s.on = false; e.kind = 'puerta'; e.img = A.prop('puerta'); e.talk = null; banner('¡Puerta abierta!', 'La biblioteca del monasterio'); }
              else await say([['Narrador', 'La puerta de la biblioteca está cerrada con llave.']]);
            } });
            [55, 59].forEach(x => B.ent('prop', x, { kind: 'estante', back: true }));
            B.ent('prop', 57, { kind: 'atril', label: true, talk: async e => {
              await say([['Narrador', 'Según contó Lutero, por esos años vio por primera vez una Biblia completa. ¡Estaba encadenada a la mesa, porque era muy valiosa!'], ['Lutero', 'Aquí hay mucho más de lo que se lee en la misa… ¡Quisiera tener una Biblia para mí!'], ['Narrador', 'La Biblia estaba en latín. Muy pocas personas podían leerla.']]);
              if (!e.n) { e.n = 1; addWis(5); E.spawnScroll(3, 56, 11); }
            } });
            B.ground(14, 3);
            B.ent('npc', 67, { key: 'staupitz', mark: true, talk: async e => {
              await say([['Staupitz', 'Hermano Martín, ¿por qué estás tan triste?'], ['Lutero', 'Padre Staupitz, por más que me esfuerzo, no puedo amar a Dios. ¡Le tengo miedo! Él es justo y yo soy un pecador.'], ['Staupitz', 'No es Dios quien está enojado contigo; tú estás enojado con Dios.'], ['Staupitz', 'No mires tanto tus pecados. Mira las heridas de Cristo: allí verás cuánto te ama Dios.'], ['Narrador', 'Lutero todavía no lo entendía del todo, pero Staupitz lo estaba señalando hacia la gracia de Dios en Cristo.']]);
              if (!E.flags.metStaupitz) { E.flags.metStaupitz = true; sola(0, 70, 'G', 'Sola Gratia', 'Solo por gracia: la salvación es un regalo que no merecemos'); }
            } });
            B.ent('exit', 73, { kind: 'puerta', need: () => E.flags.metStaupitz ? null : 'Antes de salir, habla con el padre Staupitz.' });
          },
          onEnter: async () => { E.solid({ lib: true, x: 52 * TS, y: 0, w: 16, h: 240 }); }
        }
      ]
    };

    // ===================== CAPÍTULO II =====================
    const c2 = {
      title: 'El justo por la fe vivirá', years: '1510-1515', places: 'Roma · Wittenberg', sola: 'Sola Fide',
      verse: '«Mas el justo por la fe vivirá.» Romanos 1:17', endVerse: '«Justificados, pues, por la fe, tenemos paz para con Dios.» Romanos 5:1',
      flags: { luteroOutfit: 'lutero' }, scrolls: SC[1],
      areas: [
        { name: 'Roma, la «ciudad santa»', sub: 'Invierno de 1510 a 1511', theme: TH.rome, style: 'marble', music: 'market', start: 2,
          scrolls: [[2, 20, 10], [3, 48, 7]],
          build(B) {
            B.ground(14, 3);
            B.ent('trigger', 3, { run: async () => { lock(); await say([['Narrador', 'En 1510, Lutero viajó a pie hasta Roma por un asunto de su orden. ¡Esperaba encontrar una ciudad santa!'], ['Narrador', 'Pero vio a muchos sacerdotes que no tomaban en serio a Dios, y gente que pagaba para ver reliquias, pensando que así ganaba perdón.']]); unlock(); } });
            B.ent('prop', 9, { kind: 'puesto', back: true });
            B.ent('npc', 10, { key: 'aldeano', mark: true, talk: once([['Vendedor', '¡Reliquias! ¡Reliquias! ¡Huesos de santos, paja del pesebre! ¡Mírelas y ganará años de perdón!'], ['Lutero', '¿Años de perdón… por mirar huesos?'], ['Narrador', 'Lutero empezó a preguntarse si todo eso venía de la Biblia.']]) });
            B.ent('bula', 12);
            B.pit(2); B.ground(6, 4); tufts(B, [17, 21]); B.ent('moneda', 19);
            B.ground(4, 3); B.pit(3); B.ground(8, 3); B.ent('lamp', 30); B.ent('prop', 34, { kind: 'reliquias', back: true }); B.ent('bula', 33); B.ent('bula', 36, { red: true }); tufts(B, [31]);
            B.stairs(8, 3, 7); B.ground(6, 7);
            B.ent('trigger', 38, { run: async () => { lock(); await say([['Narrador', 'Esta es la «Escalera Santa». Decían que quien la subía de rodillas, rezando en cada escalón, podía sacar a un alma del purgatorio.'], ['Lutero', 'Lo haré por mi abuelo.']]); unlock(); } });
            B.ent('trigger', 46, { run: async () => { lock(); E.player.kneel = true; await wait(.6); await say([['Narrador', 'Lutero subió de rodillas, escalón por escalón. Pero al llegar arriba, pensó:'], ['Lutero', '¿Quién sabe si esto es verdad?'], ['Narrador', 'Lutero regresó a Alemania con más preguntas que respuestas.']]); E.player.kneel = false; unlock(); } });
            B.stairs(4, 7, 3); B.ground(16, 3); B.ent('cuervo', 58, { rowY: 8, name: 'Duda' }); B.ent('cuervo', 66, { rowY: 7, name: 'Duda' }); B.ent('bula', 61); B.ent('bula', 67); tufts(B, [57, 63, 69]);
            B.ent('exit', 70, { auto: true });
          }
        },
        { name: 'Wittenberg', sub: 'Lutero, doctor en Biblia (1512)', theme: TH.witt, style: 'grass', music: 'field', particles: 'petals', start: 2,
          scrolls: [[1, 46, 8]],
          build(B) {
            B.ground(16, 3);
            B.ent('trigger', 3, { run: async () => { lock(); await say([['Narrador', 'De vuelta en Alemania, Staupitz envió a Lutero a la nueva universidad de Wittenberg.']]); unlock(); } });
            B.ent('prop', 9, { kind: 'arbol', back: true });
            B.ent('npc', 10, { key: 'staupitz', mark: true, talk: once([['Staupitz', 'Martín, debes estudiar para ser doctor en Biblia, y predicar y enseñar las Escrituras.'], ['Lutero', '¡Pero eso me va a matar de cansancio!'], ['Staupitz', '¡Pues entonces Dios tendrá un hombre sabio más en el cielo! Allá también necesita gente así.'], ['Narrador', 'Así, en 1512, Lutero se hizo doctor y comenzó a enseñar los Salmos, Romanos y Gálatas.']]) });
            B.ent('npc', 14, { key: 'estudiante', mark: true, talk: once([['Estudiante', '¡Doctor Lutero! Sus clases son diferentes: usted explica lo que la Biblia dice de verdad.']]) });
            B.ground(6, 4); tufts(B, [17, 20]); B.ent('bula', 19);
            B.pit(2); B.ground(4, 4); B.pit(3); B.plat(28, 9, 3); B.ground(10, 3); B.ent('lamp', 32); B.ent('moneda', 36); B.ent('moneda', 39); tufts(B, [34, 38]);
            B.stairs(3, 3, 6); B.ground(5, 6); B.ent('cuervo', 46, { rowY: 5, name: 'Duda' }); tufts(B, [45]);
            B.stairs(3, 6, 3); B.ground(18, 3); B.ent('bula', 56); tufts(B, [54, 58]);
            B.ent('prop', 63, { kind: 'castillo', back: true });
            B.ent('exit', 63, { kind: 'puerta', go: async () => { E.fx('door'); await E.gotoArea(2); } });
            sign(60, [['Narrador', 'La torre del monasterio de Wittenberg. Allí estudiaba Lutero. Entra por la puerta con E.']], B);
          }
        },
        { name: 'En la torre', sub: 'Lutero estudia Romanos', theme: TH.tower, style: 'wood', music: 'interior', particles: 'dust', start: 2,
          scrolls: [[4, 20, 11]],
          build(B) {
            B.ground(26, 3);
            B.ent('prop', 6, { kind: 'estante', back: true }); B.ent('prop', 9, { kind: 'vela', back: true });
            B.ent('prop', 13, { kind: 'mesa', label: true, talk: async e => {
              if (e.n) { await say([['Lutero', '«Mas el justo por la fe vivirá». ¡Qué buena noticia!']]); return; }
              await say([['Narrador', 'Lutero estudiaba día y noche la carta a los Romanos. Pero una frase lo hacía temblar: «la justicia de Dios».'], ['Lutero', 'Yo pensaba que «la justicia de Dios» era su castigo contra los pecadores… pero aquí dice: «Mas el justo por la fe vivirá».']]);
              let c;
              do { c = await ask('Lutero', '¿Qué significa entonces «la justicia de Dios» en el evangelio?', ['Que Dios castiga a todos los pecadores sin remedio', 'Que Dios nos da su justicia como regalo, y la recibimos por la fe', 'Que tenemos que hacernos justos con nuestro esfuerzo']);
                if (c !== 1) await say([['Narrador', 'Piénsalo otra vez. El versículo dice que el justo vive por la fe, no por sus obras. ¡Es una buena noticia!']]);
              } while (c !== 1);
              e.n = 1; E.fx('chord'); flash(.9); burst(e.x, e.y - 20, ['#ffd23a', '#ffffff'], 40, 100, -10); E.player.cheer = true;
              await say([['Lutero', '¡Ahora lo entiendo! Dios nos declara justos por la fe en Cristo. ¡Es un regalo, no un premio!'], ['Lutero', 'Me sentí como si hubiera nacido de nuevo, y como si hubiera entrado por puertas abiertas al mismo paraíso.'], ['Narrador', 'Así lo contó Lutero muchos años después. Por fin tenía paz con Dios.']]);
              E.player.cheer = false; addWis(10); E.spawnScroll(0, 9, 11);
              sola(1, 17, 'F', 'Sola Fide', 'Solo por la fe: somos justificados al confiar en Cristo, no por obras');
            } });
            B.ent('prop', 18, { kind: 'ventana', back: true });
            B.ent('exit', 24, { kind: 'puerta', need: () => E.save.sola[1] ? null : 'Lee primero la carta a los Romanos en la mesa.', go: async () => { await endChapter(); } });
          }
        }
      ]
    };

    // ===================== CAPÍTULO III =====================
    const c3 = {
      title: 'Las 95 tesis', years: '1517', places: 'Jüterbog · Wittenberg', sola: 'Solus Christus',
      verse: '«Hay un solo Dios, y un solo mediador entre Dios y los hombres, Jesucristo hombre.» 1 Timoteo 2:5', endVerse: '«Con una sola ofrenda hizo perfectos para siempre a los santificados.» Hebreos 10:14',
      flags: { luteroOutfit: 'lutero' }, scrolls: SC[2],
      areas: [
        { name: 'El mercado de Jüterbog', sub: 'Primavera de 1517', theme: TH.market, style: 'grass', music: 'market', start: 2,
          scrolls: [[0, 30, 8], [1, 24, 10], [3, 45, 11]],
          build(B) {
            B.ground(18, 3);
            B.ent('trigger', 2, { run: async () => { lock(); await say([['Narrador', 'En 1517, un fraile llamado Juan Tetzel vendía indulgencias cerca de Wittenberg.'], ['Narrador', 'Una indulgencia era un papel que prometía quitar el castigo de los pecados… a cambio de dinero. Con ese dinero se construía la gran basílica de San Pedro en Roma.']]); unlock(); } });
            tufts(B, [6, 10]); B.ent('prop', 12, { kind: 'puesto', back: true });
            B.ent('npc', 8, { key: 'aldeana', mark: true, talk: once([['Campesina', '¡Compré una indulgencia para mi abuela! Y otra para mí. ¡Ya no tengo que preocuparme por mis pecados!'], ['Lutero', 'Pero hermana, el perdón de Dios no se compra. Jesús nos llama a arrepentirnos de verdad y a confiar en él.']]) });
            B.ent('bula', 14); B.ent('bula', 16);
            B.pit(2); B.ground(8, 4); B.ent('moneda', 22); B.ent('moneda', 26); tufts(B, [21, 25]);
            B.ground(4, 3); B.plat(29, 9, 3); B.pit(3); B.ground(12, 3); B.ent('lamp', 36); B.ent('bula', 40, { red: true }); B.ent('bula', 44, { red: true }); tufts(B, [38, 42]);
            B.ground(16, 3);
            B.ent('prop', 52, { kind: 'cofreNPC', back: true });
            B.ent('npc', 54, { key: 'tetzel', face: -1 });
            B.ent('trigger', 49, { run: async () => {
              lock(); E.camTo(52 * 16, null);
              await say([['Tetzel', '¡Acérquense, acérquense! ¡Compren su indulgencia!'], ['Tetzel', '¡Cuando la moneda en el cofre suena, el alma del purgatorio salta!'], ['Campesina', '¿Y mis pecados de mañana? ¿También me sirve?'], ['Tetzel', '¡Claro! ¡Paguen, paguen!']]);
              let c = await ask('Lutero', '¿Qué dice la Biblia sobre el perdón?', ['El perdón se compra con dinero', 'Dios perdona gratuitamente por la obra de Cristo, a los que se arrepienten y creen']);
              if (c === 1) { addWis(8); await say([['Lutero', '¡Exacto! «Siendo justificados gratuitamente por su gracia, mediante la redención que es en Cristo Jesús». (Romanos 3:24)']]); }
              else await say([['Narrador', 'No. La Biblia dice: «Venid, comprad sin dinero y sin precio» (Isaías 55:1). El perdón es gratis porque Cristo ya pagó todo.']]);
              await say([['Lutero', 'Tengo que hacer algo. Escribiré mis preguntas para debatir este asunto en la universidad.']]);
              E.camFree(); unlock();
            } });
            B.ent('bula', 58); B.ent('moneda', 60);
            B.ent('exit', 62, { auto: true });
          }
        },
        { name: 'El cofre glotón', sub: 'Wittenberg, octubre de 1517', theme: TH.witt, style: 'grass', music: 'field', start: 2,
          scrolls: [[4, 47, 11]],
          build(B) {
            B.ground(6, 3);
            B.ent('trigger', 2, { run: async () => { lock(); await say([['Narrador', 'Imagina que la venta de indulgencias es un cofre glotón que se traga el dinero de la gente y le quita la verdad del evangelio.'], ['Narrador', 'Lutero no peleó con espadas, sino con la Palabra de Dios. ¡Vamos a cerrar ese cofre!']]); unlock(); } });
            B.ground(24, 3); tufts(B, [9, 13, 17, 21, 26], 'nabo', true);
            B.ent('cofre', 25, { id: 'cofre', ax0: 6, ax1: 30, bossName: 'Cofre de las indulgencias', onDefeat: async () => {
              lock(); E.updateBoss(null); E.music('field'); await wait(.6);
              E.W.solids.forEach(s => { if (s.wall) s.on = false; }); E.freeCam();
              await say([['Lutero', '¡El perdón de Dios no se vende! Cristo ya lo pagó con su sangre en la cruz.']]);
              addWis(15); E.spawnScroll(2, 22, 11); unlock();
            } });
            B.ent('trigger', 10, { run: async () => {
              lock(); E.lockCam(6, 30); wall(6); wall(30); E.music('boss');
              const b = findEnt('cofre'); b.showWait = true; E.fx('bossHit'); shake(.6, 3);
              await say([['Cofre de las indulgencias', '¡Ja, ja! ¡Cada moneda me hace más fuerte! ¡Nadie me va a cerrar!'], ['Lutero', 'Solo Cristo pagó por nuestros pecados. ¡Tu negocio se acabó!'], ['Narrador', 'Arranca nabos y lánzaselos al cofre. También puedes pararte sobre las monedas que escupe, levantarlas y devolvérselas.']]);
              b.state = 'hop'; b.st = 0; E.updateBoss(b); unlock();
            } });
            B.ground(20, 3);
            B.ent('prop', 40, { kind: 'iglesia', back: true });
            B.ent('trigger', 37, { cond: () => !findEnt('cofre') || !findEnt('cofre').alive, run: async () => {
              lock(); await walkTo(40 * 16 - 10, 60); E.player.face = 1;
              await say([['Narrador', '31 de octubre de 1517. Lutero fue a la puerta de la Iglesia del Castillo de Wittenberg, que servía como tablero de anuncios de la universidad.']]);
              for (let i = 0; i < 3; i++) { E.fx('hammer'); shake(.1, 1); await wait(.35); }
              spawn({ type: 'prop', kind: 'tesis', px: 40 * 16 + 1, py: E.groundY(40) - 6 });
              await say([['Narrador', 'Allí clavó sus 95 tesis: noventa y cinco frases para debatir sobre las indulgencias.'], ['Lutero', 'Tesis 1: «Cuando nuestro Señor y Maestro Jesucristo dijo: Arrepentíos, quiso que toda la vida de los creyentes fuera arrepentimiento».'], ['Lutero', 'Tesis 62: «El verdadero tesoro de la iglesia es el sacrosanto evangelio de la gloria y de la gracia de Dios».'], ['Narrador', 'Gracias a la imprenta, en pocas semanas las tesis se leían por toda Alemania. ¡Había comenzado la Reforma!']]);
              addWis(10); sola(2, 45, 'C', 'Solus Christus', 'Solo Cristo: él es el único Salvador y Mediador'); unlock();
            } });
            B.ent('exit', 49, { auto: true, need: () => E.save.sola[2] ? null : 'Toma la medalla de oro antes de seguir.' });
          }
        }
      ]
    };

    // ===================== CAPÍTULO IV =====================
    const c4 = {
      title: '¡Aquí estoy!', years: '1520-1521', places: 'Wittenberg · Worms · Turingia', sola: 'Sola Scriptura',
      verse: '«Es necesario obedecer a Dios antes que a los hombres.» Hechos 5:29', endVerse: '«La palabra del Dios nuestro permanece para siempre.» Isaías 40:8',
      flags: { luteroOutfit: 'lutero' }, scrolls: SC[3],
      areas: [
        { name: 'Camino a Worms', sub: 'Abril de 1521', theme: TH.road, style: 'grass', music: 'field', particles: 'leaves', start: 2,
          scrolls: [[0, 44, 9], [2, 37, 10]],
          build(B) {
            B.ground(14, 3);
            B.ent('prop', 9, { kind: 'hoguera', back: true, lit: true });
            B.ent('trigger', 5, { run: async () => { lock(); await say([['Narrador', '10 de diciembre de 1520. El papa había enviado una bula, un documento que amenazaba con expulsar a Lutero de la iglesia si no se retractaba.'], ['Narrador', 'Lutero la quemó en público, delante de sus estudiantes, junto con libros de leyes de la iglesia.'], ['Narrador', 'Poco después, el emperador Carlos V lo llamó a presentarse ante la Dieta de Worms: una gran reunión de príncipes del imperio.']]); unlock(); } });
            B.ent('npc', 3, { key: 'spalatin', mark: true, face: 1, talk: once([['Spalatin', 'Martín, ¡no vayas! Muchos quieren hacerte daño.'], ['Lutero', 'Iré a Worms aunque haya allí tantos demonios como tejas en los tejados.']]) });
            B.ent('npc', 12, { key: 'guardia', mark: true, talk: once([['Heraldo', 'Doctor Lutero, traigo el salvoconducto del emperador: un permiso para ir y volver sin que nadie lo arreste.'], ['Lutero', 'Gracias. Pero mi confianza está en Dios.']]) });
            B.pit(9); B.ent('log', 18, { row: 11, x0: 17.5, x1: 20, speed: 26, wTiles: 3 }); B.ent('log', 22, { row: 11, x0: 21.5, x1: 23.5, speed: 34, wTiles: 3 });
            B.ground(10, 3); B.ent('lamp', 26); B.ent('npc', 29, { key: 'aldeano', mark: true, talk: once([['Campesino', '¡Viva el doctor Lutero! ¡Él nos explica la Biblia en alemán!']]) }); B.ent('npc', 31, { key: 'nino', face: -1 }); B.ent('bula', 33, { red: true });
            B.ground(6, 4); B.ent('cuervo', 38, { rowY: 7, name: 'Miedo' }); tufts(B, [36, 39]);
            B.pit(2); B.ground(4, 5); B.pit(2); B.ground(4, 4); B.ground(16, 3); B.ent('bula', 56, { red: true }); B.ent('bula', 62, { red: true }); B.ent('moneda', 59); tufts(B, [55, 60, 65]);
            B.ent('exit', 65, { auto: true });
          }
        },
        { name: 'La Dieta de Worms', sub: '17 y 18 de abril de 1521', theme: TH.worms, style: 'wood', music: 'interior', start: 2,
          scrolls: [[4, 7, 11]],
          build(B) {
            B.ground(42, 3);
            [5, 13, 31, 37].forEach(x => B.ent('prop', x, { kind: 'estandarte', back: true }));
            B.ent('prop', 25, { kind: 'trono', back: true });
            B.ent('npc', 25, { key: 'carlos', face: -1, keepFace: true });
            B.ent('npc', 21, { key: 'federico', face: -1, mark: true, talk: once([['Federico el Sabio', 'Soy Federico, príncipe de Sajonia. No estoy de acuerdo con todo lo que dices, doctor, pero me aseguraré de que tengas un juicio justo.']]) });
            B.ent('prop', 17, { kind: 'mesa', back: true }); B.ent('npc', 18, { key: 'eck', face: -1 });
            B.ent('npc', 29, { key: 'guardia', face: -1 }); B.ent('npc', 33, { key: 'cardenal', face: -1 });
            B.ent('trigger', 12, { run: async () => {
              lock(); await walkTo(14 * 16, 50); E.player.face = 1;
              await say([['Juan von der Ecken', 'Martín Lutero: ¿son tuyos estos libros? ¿Y te retractas de lo que enseñan?'], ['Lutero', 'Sí, son míos. Sobre retractarme… es un asunto muy serio. Pido tiempo para pensar.'], ['Narrador', 'Le dieron un día. Esa noche, Lutero oró.']]);
              await fadeOut(.6); E.player.kneel = true; await fadeIn(.6);
              await say([['Lutero', 'Oh Dios, si esta es tu causa, ayúdame. No confío en ningún hombre; confío en tu Palabra.']]);
              await fadeOut(.6); E.player.kneel = false; await fadeIn(.6);
              await say([['Narrador', 'Al día siguiente, el salón estaba lleno de antorchas y de gente.'], ['Juan von der Ecken', 'Responde sin rodeos: ¿te retractas, sí o no?']]);
              let c;
              do { c = await ask('Lutero', '¿Qué responderá Lutero?', ['Me retracto de todo lo que escribí', 'Si no me convencen con la Escritura y con razones claras, no me retractaré', 'Haré lo que diga el emperador']);
                if (c === 0) await say([['Narrador', 'Lutero no quería ir contra lo que la Biblia enseña, aunque eso le costara la vida. Piénsalo otra vez.']]);
                if (c === 2) await say([['Narrador', 'Lutero respetaba al emperador, pero la Biblia dice: «Es necesario obedecer a Dios antes que a los hombres». Piénsalo otra vez.']]);
              } while (c !== 1);
              E.music('chorale');
              await say([['Lutero', 'A menos que se me convenza por el testimonio de las Escrituras o por razones claras —porque no confío solo en el papa ni en los concilios, pues se han equivocado y contradicho muchas veces—,'], ['Lutero', 'estoy sujeto a las Escrituras que he citado, y mi conciencia está cautiva de la Palabra de Dios.'], ['Lutero', 'No puedo ni quiero retractarme de nada, porque ir contra la conciencia no es seguro ni correcto. ¡Que Dios me ayude! Amén.'], ['Narrador', 'Las primeras versiones impresas añadieron unas palabras que se hicieron famosas: «¡Aquí estoy! No puedo hacer otra cosa».'], ['Carlos V', 'Defenderé la fe de mis antepasados. Este monje no me hará cambiar.'], ['Narrador', 'Un mes después, el Edicto de Worms declaró a Lutero fuera de la ley: cualquiera podía entregarlo, y nadie debía ayudarlo.']]);
              E.flags.spoke = true; addWis(10); E.music('interior'); E.spawnScroll(1, 32, 11);
              sola(3, 36, 'E', 'Sola Scriptura', 'Solo la Escritura: la Biblia es la autoridad más alta'); unlock();
            } });
            B.ent('exit', 41, { auto: true, need: () => E.flags.spoke ? null : 'Primero responde ante la Dieta.' });
          }
        },
        { name: 'Bosque de Turingia', sub: '4 de mayo de 1521', theme: TH.forest, style: 'grass', music: 'castle', particles: 'leaves', start: 2,
          scrolls: [[3, 19, 8]],
          build(B) {
            B.ground(12, 3);
            B.ent('trigger', 3, { run: async () => { lock(); await say([['Narrador', 'Lutero regresaba a casa con su salvoconducto. Pero el príncipe Federico el Sabio tenía un plan secreto para protegerlo…']]); unlock(); } });
            tufts(B, [7, 10]);
            B.ground(6, 4); B.ent('cuervo', 15, { rowY: 7, name: 'Miedo' }); B.pit(3); B.plat(18, 9, 3);
            B.ground(10, 3); B.ent('lamp', 22); B.ent('bula', 26, { red: true }); B.ent('bula', 29, { red: true }); tufts(B, [24, 28]);
            B.stairs(2, 3, 5); B.ground(6, 5); B.ent('moneda', 36); tufts(B, [34]);
            B.ground(16, 3); tufts(B, [41]);
            B.ent('trigger', 45, { run: async () => {
              lock(); E.fx('bossHit');
              const k1 = spawn({ type: 'npc', key: 'caballero', x: 54, face: -1 }), k2 = spawn({ type: 'npc', key: 'caballero', x: 56, face: -1 });
              await new Promise(r => { k1.walk = { x: 49 * 16 + 8, speed: 80, r }; k2.walk = { x: 51 * 16 + 8, speed: 80 }; });
              await say([['Caballero', '¡Alto ahí! ¿Es usted el doctor Martín Lutero?'], ['Lutero', 'Sí… ¿quiénes son ustedes?'], ['Caballero', 'Silencio, doctor. Venga con nosotros. ¡Rápido!']]);
              await fadeOut(.8);
              await say([['Narrador', 'Los «secuestradores» eran amigos enviados por Federico el Sabio. Llevaron a Lutero en secreto al castillo de Wartburg.'], ['Narrador', '¡Mucha gente pensó que lo habían matado! Pero Dios lo estaba guardando.']]);
              await endChapter();
            } });
          }
        }
      ]
    };

    // ===================== CAPÍTULO V =====================
    const c5 = {
      title: 'La Palabra para el pueblo', years: '1521-1546', places: 'Wartburg · Wittenberg', sola: 'Soli Deo Gloria',
      verse: '«Así que la fe es por el oír, y el oír, por la palabra de Dios.» Romanos 10:17', endVerse: '«A él sea la gloria por los siglos. Amén.» Romanos 11:36',
      flags: { luteroOutfit: 'junker' }, scrolls: SC[4],
      areas: [
        { name: 'Castillo de Wartburg', sub: 'El «Caballero Jorge» (1521-1522)', theme: TH.wartburg, style: 'stone', music: 'castle', start: 2,
          scrolls: [[3, 26, 6]],
          build(B) {
            B.ground(10, 3);
            B.ent('trigger', 3, { run: async () => { lock(); await say([['Narrador', 'En el castillo de Wartburg, Lutero se disfrazó de caballero: se dejó crecer la barba y se hacía llamar «Caballero Jorge».'], ['Lutero', 'Aquí traduciré el Nuevo Testamento del griego al alemán. ¡Así cualquier campesino, mamá o niño podrá leer la Palabra de Dios!']]); unlock(); } });
            tufts(B, [6, 8], 'tintero');
            B.stairs(3, 3, 6); B.ground(6, 6); B.ent('cuervo', 16, { rowY: 5, name: 'Soledad' }); tufts(B, [14], 'tintero');
            B.pit(2); B.ground(4, 6); B.plat(25, 7, 3); B.pit(3); B.ground(6, 5); B.ent('lamp', 29); B.ent('bula', 32, { red: true });
            B.stairs(3, 5, 3); B.ground(8, 3); tufts(B, [39, 43], 'tintero');
            B.ent('trigger', 41, { run: async () => { lock(); await say([['Narrador', 'Lutero estaba solo y lejos de sus amigos. Muchas noches lo atacaban la tristeza, las dudas y las tentaciones.'], ['Narrador', 'Cuenta una leyenda que una noche le lanzó su tintero al diablo. ¡Pero lo que de verdad vence al enemigo es la Palabra de Dios!']]); unlock(); } });
            B.ground(24, 3); tufts(B, [48, 52, 56, 60, 64], 'tintero', true);
            B.ent('sombraBoss', 60, { id: 'sombra', ax0: 45, ax1: 69, bossName: 'Sombra de la Duda', onDefeat: async () => {
              lock(); E.updateBoss(null); E.music('chorale'); await wait(.6);
              E.W.solids.forEach(s => { if (s.wall) s.on = false; }); E.freeCam();
              await say([['Lutero', '«Que muestre su vigor Satán, y su furor; dañarnos no podrá, pues condenado es ya por la Palabra Santa».'], ['Narrador', 'Así dice una estrofa de su himno «Castillo fuerte es nuestro Dios».'], ['Narrador', 'En solo once semanas, Lutero tradujo todo el Nuevo Testamento. Se publicó en septiembre de 1522.']]);
              addWis(15); E.spawnScroll(0, 58, 11); E.music('castle'); unlock();
            } });
            B.ent('trigger', 47, { run: async () => {
              lock(); E.lockCam(45, 69); wall(45); wall(69); E.music('boss');
              const b = findEnt('sombra'); b.state = 'float'; b.st = 0; E.fx('bossHit');
              await say([['Sombra de la Duda', '¿De verdad crees que Dios te escucha? ¡Estás solo! ¡Todos te abandonaron!'], ['Lutero', 'No estoy solo. «Dios es nuestro amparo y fortaleza». ¡Y su Palabra no cambia!'], ['Narrador', 'Arranca tinteros de la hierba y lánzalos cuando la Sombra baje.']]);
              E.updateBoss(b); unlock();
            } });
            B.ground(10, 3); B.ent('exit', 78, { auto: true });
          }
        },
        { name: 'Wittenberg: la imprenta y el hogar', sub: '1522-1546', theme: TH.print, style: 'grass', music: 'field', particles: 'petals', start: 2,
          scrolls: [[1, 46, 11], [2, 34, 10], [4, 61, 11]],
          onEnter: async () => { E.flags.luteroOutfit = 'luteroDr'; await say([['Narrador', 'En 1522, Lutero volvió a Wittenberg para cuidar de la iglesia. Ya no se escondía: confiaba en que Dios lo guardaría.']]); },
          build(B) {
            B.ground(14, 3);
            B.ent('prop', 6, { kind: 'imprenta', back: true });
            B.ent('npc', 8, { key: 'impresor', mark: true, talk: once([['Impresor', '¡Doctor Lutero! Imprimimos miles de Nuevos Testamentos en alemán, ¡y se vendieron rapidísimo! Hasta los campesinos los compran.'], ['Lutero', '¡Gloria a Dios! Que su Palabra corra por todas partes.']]) });
            B.ent('npc', 12, { key: 'cranach', mark: true, hideIf: 'cranach', talk: once([['Cranach', '¡Hice grabados de madera para la Biblia! Así hasta los niños que no saben leer pueden ver las historias.']]) });
            B.ground(6, 4); tufts(B, [15, 18]); B.ent('moneda', 17);
            B.pit(2); B.ground(10, 3); B.ent('lamp', 23); [24, 26].forEach(x => B.ent('prop', x, { kind: 'barril', back: true }));
            B.ent('trigger', 25, { run: async () => { lock(); await say([['Narrador', 'En 1523, doce monjas escaparon de un convento escondidas en una carreta con barriles de arenque. Entre ellas estaba Katharina von Bora.'], ['Narrador', 'En 1525, Katharina y Martín se casaron. Tuvieron seis hijos, y su casa siempre estaba llena de estudiantes y visitas.']]); unlock(); } });
            B.ent('npc', 29, { key: 'katharina', mark: true, hideIf: 'katharina', talk: once([['Katharina', '¡Martín, la cena está lista! Hoy tenemos treinta estudiantes en la mesa…'], ['Lutero', '¡Mi querida Katie! ¿Qué haría yo sin ti?']]) });
            B.ground(6, 4); B.ent('cuervo', 35, { rowY: 7, name: 'Duda' }); tufts(B, [33, 36]);
            B.ground(16, 3); B.ent('prop', 45, { kind: 'casa', back: true });
            B.ent('npc', 40, { key: 'hansito', face: 1, mark: true, talk: async e => {
              await say([['Narrador', 'En 1529, Lutero escribió el Catecismo Menor, para que los papás enseñaran la fe en casa con preguntas y respuestas.'], ['Hansito', '¡Papá, papá! Pregúntame del catecismo, ya me lo sé.']]);
              const c = await ask('Lutero', 'Primer mandamiento: «No tendrás dioses ajenos delante de mí». ¿Qué significa esto?', ['Que debemos temer y amar a Dios, y confiar en él sobre todas las cosas', 'Que podemos tener otros dioses si queremos', 'Que solo es para los adultos']);
              if (c === 0) { await say([['Lutero', '¡Muy bien, Hansito! Así lo escribí en el Catecismo.']]); if (!e.n) { e.n = 1; addWis(8); } }
              else await say([['Lutero', 'Casi. La respuesta es: «Debemos temer y amar a Dios, y confiar en él sobre todas las cosas».']]);
            } });
            B.ent('npc', 42, { key: 'magdalena', face: 1, mark: true, talk: once([['Magdalena', '¡Papá canta muy bonito con su laúd! Siempre cantamos himnos en la casa.']]) });
            B.ent('npc', 50, { key: 'melanchthon', mark: true, hideIf: 'melanchthon', talk: once([['Melanchthon', 'Martín, en 1530 presentamos nuestra fe ante el emperador en Augsburgo. Lo llamaron la Confesión de Augsburgo.'], ['Lutero', 'Y la escribiste tú, Felipe. ¡Dios te ha dado un gran don para enseñar!']]) });
            B.ground(16, 3); B.ent('prop', 59, { kind: 'pulpito', back: true });
            B.ent('trigger', 56, { run: async () => {
              lock(); E.music('chorale');
              await say([['Narrador', 'Lutero también escribió himnos para que toda la congregación cantara en su idioma. El más famoso está basado en el Salmo 46:'], ['Lutero', '«Castillo fuerte es nuestro Dios, defensa y buen escudo. Con su poder nos librará en este trance agudo».'], ['Narrador', 'Hasta hoy, iglesias de todo el mundo cantan este himno.']]);
              sola(4, 64, 'D', 'Soli Deo Gloria', 'Solo a Dios la gloria: todo es de él, por él y para él');
              E.music('field'); unlock();
            } });
            B.ent('exit', 68, { kind: 'puerta', need: () => E.save.sola[4] ? null : 'Toma la medalla de oro antes de entrar.', go: async () => { await E.finale(); } });
          }
        }
      ]
    };
    // ocultar al personaje histórico cuando el jugador lo está usando
    [c1, c2, c3, c4, c5].forEach(ch => ch.areas.forEach(a => { const b = a.build; a.build = B => { b(B); B.ents = B.ents.filter(e => !(e.hideIf && e.hideIf === E.W.char)); }; }));
    return [c1, c2, c3, c4, c5];
  }

  // ---------- cinemáticas ----------
  function stage(E, c, theme, opt) {
    const A = E.A, bg = A.background(theme, 900, E.VW, E.VH), off = (opt && opt.off) || 0;
    for (const L of bg) { if (L.fixed) c.drawImage(L.cv, 0, 0); else c.drawImage(L.cv, Math.round(-off * L.f), (L.y || 0) - 20); }
    if (!opt || opt.ground !== false) { const gy = 176; A.P(c, 0, gy, E.VW, E.VH - gy, (opt && opt.dirt) || '#e8a050'); A.P(c, 0, gy, E.VW, 6, (opt && opt.grass) || '#3ac04a'); A.P(c, 0, gy, E.VW, 2, '#8ae87a'); A.P(c, 0, gy - 1, E.VW, 1, '#000'); }
  }
  const spr = (E, c, o, anim, f, dir, x, y) => c.drawImage(E.A.person(o, anim, f, dir), Math.round(x - 16), Math.round(y - 38));
  function intro(E) {
    const A = E.A;
    return [
      { dur: 7, text: '10 de noviembre de 1483. En el pueblo de Eisleben, Alemania, nació un niño llamado Martín Lutero.', draw(c, t) { stage(E, c, TH.night, { off: t * 6, dirt: '#5a4a7a', grass: '#2a6a5a' }); const k = Math.sin(t * 4) > 0; A.disc(c, 300, 40, k ? 3 : 2, '#ffffff'); A.P(c, 299, 30, 2, 20, 'rgba(255,255,255,.6)'); A.P(c, 290, 39, 20, 2, 'rgba(255,255,255,.6)'); c.drawImage(A.prop('casa'), 150, 104); A.P(c, 166, 142, 6, 5, '#ffd23a'); } },
      { dur: 7, text: 'Su padre, Hans, trabajaba en las minas de cobre. Soñaba con que Martín estudiara para ser un abogado rico.', draw(c, t) { stage(E, c, TH.title, { off: t * 10 }); spr(E, c, A.NPC.hans, 'run', Math.floor(t * 8) % 4, 1, 120 + t * 14, 176); spr(E, c, A.NPC.nino, 'run', Math.floor(t * 8 + 2) % 4, 1, 96 + t * 14, 176); c.drawImage(A.prop('arbol'), 260, 112); } },
      { dur: 8, text: 'En aquel tiempo, mucha gente pensaba que Jesús era un juez enojado, y que el perdón había que ganarlo con obras… o pagarlo con dinero.', draw(c, t) { stage(E, c, TH.church, { ground: false }); A.P(c, 0, 176, E.VW, 40, '#b8a888'); A.P(c, 0, 176, E.VW, 2, '#8a7a5a'); c.drawImage(A.prop('cofreNPC'), 150, 156); spr(E, c, A.NPC.tetzel, 'talk', Math.floor(t * 4) % 2, 1, 130, 176); spr(E, c, A.NPC.aldeana, 'idle', Math.floor(t * 2) % 2, -1, 210, 176); spr(E, c, A.NPC.aldeano, 'idle', 0, -1, 240, 176); const b = Math.floor(t * 3) % 2; c.drawImage(A.item('moneda'), 172, 140 - b * 6); } },
      { dur: 7, text: 'La Biblia estaba en latín, y casi nadie podía leerla. Los libros eran tan valiosos que a veces los encadenaban.', draw(c, t) { stage(E, c, TH.erfurt, { ground: false }); A.P(c, 0, 176, E.VW, 40, '#a8a8c0'); A.P(c, 0, 176, E.VW, 2, '#6a6a88'); c.save(); c.translate(192, 176); c.scale(2, 2); c.drawImage(A.prop('atril'), -14, -34); c.restore(); if (Math.floor(t * 3) % 2) A.P(c, 220, 100, 2, 2, '#ffffff'); } },
      { dur: 7, text: 'Julio de 1505. Martín, ya un joven estudiante, iba de camino a la universidad cuando lo sorprendió una terrible tormenta…', fx: 'thunder', draw(c, t) { stage(E, c, TH.storm, { off: t * 16, dirt: '#7a5a8a', grass: '#2a8a5a' }); spr(E, c, A.NPC.estudiante, 'run', Math.floor(t * 9) % 4, 1, 150, 176); for (let i = 0; i < 40; i++) { const x = (i * 53 + t * 300) % 400, y = (i * 37 + t * 600) % 216; A.line(c, x, y, x - 2, y - 7, 1, 'rgba(200,210,255,.7)'); } if (t > 4 && t < 4.3) { c.globalAlpha = .8; A.P(c, 0, 0, E.VW, E.VH, '#ffffff'); c.globalAlpha = 1; } } },
      { dur: 6, text: 'Dios iba a usar a este joven para que su Palabra volviera a brillar en toda Europa.', music: 'title', draw(c, t) { stage(E, c, TH.title, { off: t * 8 }); spr(E, c, A.CH.lutero, 'cheer', Math.floor(t * 4) % 2, 1, 192, 176); const s = Math.min(1, t / 1.5); c.globalAlpha = s; c.drawImage(A.solaMedal('★'), 181, 60); c.globalAlpha = 1; } }
    ];
  }
  function ending(E) {
    const A = E.A;
    return [
      { dur: 7, text: 'En 1534 se publicó toda la Biblia en alemán. ¡Ahora los campesinos, las mamás y los niños podían leerla en su propio idioma!', draw(c, t) { stage(E, c, TH.print, { off: t * 6 }); c.drawImage(A.prop('imprenta'), 120, 116); spr(E, c, A.NPC.impresor, 'talk', Math.floor(t * 4) % 2, 1, 110, 176); spr(E, c, A.NPC.hansito, 'cheer', Math.floor(t * 4) % 2, -1, 230, 176); spr(E, c, A.NPC.aldeana, 'idle', 0, -1, 260, 176); } },
      { dur: 8, text: 'Martín Lutero murió el 18 de febrero de 1546 en Eisleben, el mismo pueblo donde nació. Entre sus últimas palabras escribió: «Somos mendigos: esto es verdad».', draw(c, t) { stage(E, c, TH.night, { off: 0, dirt: '#5a4a7a', grass: '#2a6a5a' }); c.drawImage(A.prop('casa'), 150, 104); A.P(c, 166, 142, 6, 5, '#ffd23a'); A.disc(c, 300, 40, 3, '#ffffff'); } },
      { dur: 8, text: 'Lutero no era perfecto: fue un pecador, con errores como todos, salvado por gracia. La Reforma no se trata de un hombre, sino de volver a la Palabra de Dios.', draw(c, t) { stage(E, c, TH.church, { ground: false }); A.P(c, 0, 176, E.VW, 40, '#b8a888'); c.save(); c.translate(192, 176); c.scale(2, 2); c.drawImage(A.prop('atril'), -14, -34); c.restore(); } },
      { dur: 8, text: 'Después vinieron muchos otros: Zuinglio, Calvino, Tyndale, Knox… y hasta hoy, la iglesia de Cristo sigue volviendo siempre a la Escritura.', draw(c, t) { stage(E, c, TH.title, { off: t * 10 }); ['estudiante', 'spalatin', 'aldeano', 'aldeana', 'nino', 'impresor'].forEach((k, i) => spr(E, c, A.NPC[k], 'run', Math.floor(t * 8 + i) % 4, 1, 40 + i * 50 + t * 6, 176)); } },
      { dur: 9, text: '«Porque de él, y por él, y para él, son todas las cosas. A él sea la gloria por los siglos. Amén.» (Romanos 11:36)', draw(c, t) { stage(E, c, TH.title, { off: t * 4 }); const L = ['S', 'G', 'F', 'C', 'D'], N = ['Sola Scriptura', 'Sola Gratia', 'Sola Fide', 'Solus Christus', 'Soli Deo Gloria']; L.forEach((l, i) => { const k = Math.min(1, Math.max(0, t - i * .6)); c.globalAlpha = k; c.drawImage(A.solaMedal(l), 40 + i * 70, 50 + Math.sin(t * 2 + i) * 3); c.fillStyle = '#000'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText(N[i], 51 + i * 70, 84); c.fillStyle = '#ffffff'; c.fillText(N[i], 50 + i * 70, 83); c.globalAlpha = 1; }); ['lutero', 'katharina', 'melanchthon', 'cranach'].forEach((k, i) => spr(E, c, k === 'lutero' ? A.CH.luteroDr : A.CH[k], 'cheer', Math.floor(t * 4 + i) % 2, 1, 120 + i * 48, 176)); } }
    ];
  }
  return { names, titleTheme: TH.title, chapters, intro, ending };
})();
