/* pulponalua · portfolio — comportamiento (sin dependencias) */
(() => {
  'use strict';
  const CFG = window.PORTFOLIO || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const EASE = 'cubic-bezier(.65,0,.25,1)';
  const body = document.body;

  /* ---------- enlaces configurables ---------- */
  $$('[data-link="email"]').forEach((a) => (a.href = 'mailto:' + CFG.email));
  $$('[data-link="instagram"]').forEach((a) => (a.href = CFG.instagram));
  $$('[data-link="linkedin"]').forEach((a) => (a.href = CFG.linkedin));

  /* ---------- elementos ---------- */
  const views = Object.fromEntries($$('.view').map((v) => [v.dataset.view, v]));
  const viewTrabajos = views['trabajos'];
  const introStage = $('#intro-stage');
  const nav = $('#nav');
  const navBurger = $('#nav-burger');
  const navLinksEl = $('#nav-links');
  const introStageInner = $('#intro-stage-inner');
  const rain = $('#rain');
  const waveFront = $('#waveFront');
  const waterClipPath = $('#waterClipPath');
  const umbrellaWrap = $('#umbrellaWrap');
  const umbrellaAnchor = $('#umbrellaAnchor');
  const umbrella = $('#umbrella');
  const covers = $$('.cover[data-proyecto]');
  const proyectos = $$('.view--proyecto').map((v) => v.dataset.view);

  let current = null;
  let phase = 'intro'; // intro | playing | done

  /* =========================================================
     ROUTER (hash)
     ========================================================= */
  function routeName() {
    const h = location.hash.replace(/^#\/?/, '');
    return views[h] !== undefined ? h : '';
  }

  function show(name) {
    if (name === current) return;
    if (name === '') resetIntro();
    proyectos.forEach((p) => { if (p !== name) views[p].classList.remove('from-cover', 'hold-hero', 'hold-rest'); });
    Object.entries(views).forEach(([k, v]) => v.classList.toggle('is-active', k === name));
    current = name;
    body.classList.toggle('is-intro', name === '');
    $$('.nav__links a').forEach((a) =>
      a.dataset.nav === name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')
    );
    const titles = { '': 'pulponalua · portfolio de Flavia Alonso', trabajos: 'trabajos', 'sobre-mi': 'sobre mí', contacto: 'contacto' };
    proyectos.forEach((p) => { titles[p] = $('.h1', views[p]).textContent; });
    document.title = name === '' ? titles[''] : `${titles[name]} · pulponalua`;
    window.scrollTo(0, 0);
    if (proyectos.includes(name)) requestAnimationFrame(alignEquipo);
    if (name === 'sobre-mi') restartDibujo();
    requestAnimationFrame(ajustarNotas);
  }

  // al entrar en "sobre mi" la flecha dibujada vuelve a empezar desde cero;
  // luego se repite sola cada 10s (encadenado dentro del propio SVG)
  function restartDibujo() {
    const svg = $('#sobre-dibujo');
    if (svg && svg.setCurrentTime) { try { svg.setCurrentTime(0); } catch (_) {} }
  }

  // "equipo del proyecto" a la misma altura que la última foto del proyecto
  function alignEquipo() {
    const page = views[current];
    if (!page) return;
    const eq = $('.proyecto__equipo', page);
    const imgs = $$('.proyecto__img', page);
    const img = imgs[imgs.length - 1];
    if (!eq || !img || !page.classList.contains('is-active')) return;
    if (getComputedStyle(eq).position !== 'absolute') { eq.style.top = ''; eq.style.bottom = ''; return; } // móvil: flujo normal
    const der = $('.proyecto__der', page);
    const dTop = der.getBoundingClientRect().top;
    const iTop = img.getBoundingClientRect().top;
    eq.style.top = Math.round(iTop - dTop) + 'px';
    eq.style.bottom = 'auto';
  }
  window.addEventListener('resize', () => { if (proyectos.includes(current)) alignEquipo(); });
  window.addEventListener('load', () => { if (proyectos.includes(current)) alignEquipo(); }); // por si alguna imagen tarda

  window.addEventListener('hashchange', () => show(routeName()));

  /* ---------- menú hamburguesa (móvil) ---------- */
  if (navBurger) {
    const cerrarMenu = () => { nav.classList.remove('is-open'); navBurger.setAttribute('aria-expanded', 'false'); };
    navBurger.addEventListener('click', () => {
      const abierto = nav.classList.toggle('is-open');
      navBurger.setAttribute('aria-expanded', String(abierto));
    });
    navLinksEl.addEventListener('click', (e) => { if (e.target.closest('a')) cerrarMenu(); });
    window.addEventListener('hashchange', cerrarMenu);
    window.addEventListener('resize', () => { if (window.innerWidth > 900) cerrarMenu(); });
    // si está abierto y se toca fuera del propio menú (en cualquier otra parte
    // de la pantalla), se cierra
    document.addEventListener('pointerdown', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (e.target.closest('#nav')) return;
      cerrarMenu();
    });
  }

  // los textos sobre las imágenes de un proyecto nunca se salen del borde de la imagen:
  // si con la fuente cargada no caben, se reducen lo justo para que quepan
  function ajustarNotas() {
    $$('.proyecto__nota').forEach((n) => {
      const bloque = n.parentElement;
      if (!bloque.offsetWidth) return;
      n.style.setProperty('--k', 1);
      const l = parseFloat(getComputedStyle(n).getPropertyValue('--l')) || 0;
      const margen = bloque.clientWidth * 24 / 1781;
      const libre = bloque.clientWidth * (1 - l / 1781) - margen;
      const ancho = Math.max(...[...n.children].map((p) => p.scrollWidth));
      if (ancho > libre) n.style.setProperty('--k', (libre / ancho).toFixed(4));
    });
  }
  window.addEventListener('resize', ajustarNotas);
  if (document.fonts) document.fonts.ready.then(ajustarNotas);

  // textos justificados sin ríos: en los párrafos cuyo ancho depende de la pantalla,
  // se prueba un interletrado casi imperceptible (de -0,03em a +0,02em) y se queda el
  // que deja los espacios más parejos, para que nunca se abran huecos grandes entre
  // palabras. Se recalcula solo cuando cambia el ancho del párrafo.
  const PASOS_LS = [0, -0.01, 0.01, -0.02, -0.03, 0.02];
  function holguraMax(p) {
    const r = document.createRange(); r.selectNodeContents(p);
    const lineas = new Map();
    for (const x of r.getClientRects()) {
      if (!x.width) continue;
      const k = Math.round(x.top);
      lineas.set(k, Math.max(lineas.get(k) || 0, x.right));
    }
    const ks = [...lineas.keys()].sort((a, b) => a - b).slice(0, -1);
    const der = p.getBoundingClientRect().right;
    const ch = parseFloat(getComputedStyle(p).fontSize) * 0.6;
    return { n: ks.length + 1, h: ks.reduce((m, k) => Math.max(m, (der - lineas.get(k)) / ch), 0) };
  }
  function sinRios(p) {
    if (!p.offsetWidth) return;
    p.style.textAlign = 'left';
    let mejor = null, base = null;
    for (const ls of PASOS_LS) {
      p.style.letterSpacing = ls ? ls + 'em' : '';
      const m = holguraMax(p);
      if (!base) base = m;
      // nunca con más líneas que sin ajuste; entre las válidas, la de huecos más pequeños
      if (m.n <= base.n && (!mejor || m.h < mejor.h - .05)) mejor = { ls, ...m };
    }
    p.style.letterSpacing = mejor.ls ? mejor.ls + 'em' : '';
    p.style.textAlign = '';
  }
  if ('ResizeObserver' in window) {
    const anchos = new WeakMap();
    const roRios = new ResizeObserver((entradas) => entradas.forEach((e) => {
      const w = Math.round(e.contentRect.width);
      if (!w || anchos.get(e.target) === w) return;
      anchos.set(e.target, w); sinRios(e.target);
    }));
    $$('.sobre__texto p, .proyecto__texto p, .contacto__sub, .card__aviso').forEach((p) => roRios.observe(p));
    if (document.fonts) document.fonts.ready.then(() => $$('.sobre__texto p, .proyecto__texto p, .contacto__sub, .card__aviso').forEach(sinRios));
  }

  /* =========================================================
     PRINCIPAL: paraguas → lluvia → inundación → paraguas azul
     (réplica exacta de pulponalua-animacion-inicial.html: arranca
     al pulsar el paraguas cerrado y termina revelando "trabajos")
     ========================================================= */
  const DUR_INTRO = 4.6;        // segundos totales de la secuencia
  const BLUE = '#0000ff';
  const pageH = () => window.innerHeight;  // trabajos empieza justo debajo de la principal
  const REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // posiciones de las gotas (lienzo de diseño 1920×1080)
  const POINTS = [
    [381, 783],
    [371, 329], [1633, 323], [1450, 779],
    [1201, 427], [1633, 868], [891, 627], [308, 685],
    [1754, 810], [1054, 359], [474, 563], [292, 908], [219, 318], [643, 413], [1019, 859], [1574, 510],
    [679, 813], [137, 613], [1302, 877], [844, 299], [489, 278], [1382, 277], [1211, 624], [1706, 322],
    [711, 853], [1334, 917]
  ];
  const RAIN_FROM = 0.2, RAIN_TO = 2.5;
  const FALL = 0.38, FALL_DIST = 150;
  const LIFE = 1.5;
  const FADE = 0.6;
  const ARM = 24;
  const SPAN = [60, 82, 105], OPA = [1, 0.5, 0.1];

  function bezier(x1, y1, x2, y2) {
    const a = (p1, p2) => 1 - 3 * p2 + 3 * p1;
    const b = (p1, p2) => 3 * p2 - 6 * p1;
    const c = (p1) => 3 * p1;
    const calc = (t, p1, p2) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
    const slope = (t, p1, p2) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const s = slope(t, x1, x2); if (Math.abs(s) < 1e-6) break;
        t -= (calc(t, x1, x2) - x) / s;
      }
      return calc(t, y1, y2);
    };
  }
  const easeOutP = bezier(0.23, 1, 0.32, 1);
  const easeInOutP = bezier(0.77, 0, 0.175, 1);
  const gentleP = bezier(0.45, 0, 0.55, 1);
  const fallP = bezier(0.55, 0, 0.9, 0.6);

  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const prog = (t, a, b) => clamp01((t - a) / (b - a));
  const lerp = (a, b, p) => a + (b - a) * p;

  const NS = 'http://www.w3.org/2000/svg';
  const DIRS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  let drops = [];
  // zona del lienzo 1920×1080 que de verdad se ve en pantalla (la calcula fitIntroStage).
  // Lluvia y ola se reparten sobre ESA zona, así la animación es la misma en móvil y en
  // ordenador: en una pantalla vertical no se pierden las gotas de los lados ni la ola.
  const VIS = { left: 0, top: 0, w: 1920, h: 1080 };
  const visX = (x) => VIS.left + (x / 1920) * VIS.w;
  const visY = (y) => VIS.top + (y / 1080) * VIS.h;

  /* ─── sonido de la animación principal: paraguas, lluvia y ola (sintetizado con Web Audio,
     igual que el sonido del papel en "trabajos"): clic al abrir el paraguas, un lecho de
     lluvia continuo más el repiqueteo de cada gota al caer, y el oleaje grave que crece
     hasta la inundación final ─── */
  const SonidoIntro = (() => {
    let ctx, out, ruido;
    let activos = [];
    function iniciar() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      out = ctx.createGain(); out.gain.value = .85;
      out.connect(ctx.destination);
      const len = ctx.sampleRate * 2;
      ruido = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return ctx;
    }
    const rndA = (a, b) => a + Math.random() * (b - a);
    const marca = (nodo) => { activos.push(nodo); return nodo; };

    function detener() {
      activos.forEach((n) => { try { n.stop(); } catch (e) {} });
      activos = [];
    }

    // clic seco del paraguas al abrirse: golpe grave del mango + resorte/tela agudos
    function clicParaguas() {
      if (!iniciar()) return;
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime + .01;
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(230, t);
      o.frequency.exponentialRampToValueAtTime(65, t + .16);
      const og = ctx.createGain();
      og.gain.setValueAtTime(.0001, t);
      og.gain.exponentialRampToValueAtTime(.5, t + .008);
      og.gain.exponentialRampToValueAtTime(.0001, t + .22);
      o.connect(og).connect(out);
      marca(o).start(t); o.stop(t + .25);

      const s = ctx.createBufferSource(); s.buffer = ruido; s.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 1.1;
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(.0001, t);
      sg.gain.exponentialRampToValueAtTime(.3, t + .01);
      sg.gain.exponentialRampToValueAtTime(.0001, t + .14);
      s.connect(bp).connect(sg).connect(out);
      marca(s).start(t, rndA(0, 1.5)); s.stop(t + .16);
    }

    // impacto suave de una gota: solo ruido filtrado (sin tono, que sonaba a pájaro),
    // un "tap" apagado con un poco de cuerpo grave
    function gota(t0, vol = .16) {
      if (!iniciar() || ctx.state !== 'running') return;
      const t = ctx.currentTime + t0;
      const s = ctx.createBufferSource(); s.buffer = ruido;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = rndA(900, 2000); bp.Q.value = rndA(.6, 1.1);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(.0001, t);
      sg.gain.exponentialRampToValueAtTime(vol * .55, t + .004);
      sg.gain.exponentialRampToValueAtTime(.0001, t + rndA(.04, .07));
      s.connect(bp).connect(lp).connect(sg).connect(out);
      marca(s).start(t, rndA(0, 1.5)); s.stop(t + .09);
    }

    // lecho continuo de lluvia de fondo: ruido ancho tipo "shhh" (sin filtro de banda
    // estrecha, que lo apagaba demasiado), con una envolvente lenta que crece y se apaga
    // cuando llega la ola; "puntos" son pares [segundos desde t0, ganancia]
    function lluvia(t0, puntos) {
      if (!iniciar() || ctx.state !== 'running') return;
      const t = ctx.currentTime + t0;
      const dur = puntos[puntos.length - 1][0];
      const s = ctx.createBufferSource(); s.buffer = ruido; s.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 350;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; lp.Q.value = .5;
      const sh = ctx.createBiquadFilter(); sh.type = 'highshelf'; sh.frequency.value = 2500; sh.gain.value = -6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t);
      puntos.forEach(([dt, v]) => g.gain.linearRampToValueAtTime(Math.max(v, .0001), t + dt));
      s.connect(hp).connect(lp).connect(sh).connect(g).connect(out);
      marca(s).start(t, rndA(0, 1)); s.stop(t + dur + .3);
    }

    // repiqueteo denso de la lluvia (muchos impactos diminutos y aleatorios, como gotas
    // sobre una superficie): lo que de verdad hace que el lecho de fondo suene a lluvia
    // y no a simple siseo de viento. "en" = inicio en segundos desde ahora.
    function lluviaPatter(en, dur, { densidad = 60, vol = .05 } = {}) {
      if (!iniciar() || ctx.state !== 'running') return;
      const t0 = ctx.currentTime + en;
      let t = 0;
      while (t < dur) {
        t += -Math.log(1 - Math.random()) / densidad;
        if (t >= dur) break;
        const st = t0 + t;
        const s = ctx.createBufferSource(); s.buffer = ruido;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = rndA(1200, 3400); bp.Q.value = rndA(.5, 1.2);
        const g = ctx.createGain();
        const a = vol * (.3 + Math.random() * .6);
        g.gain.setValueAtTime(.0001, st);
        g.gain.exponentialRampToValueAtTime(Math.max(a, .0003), st + .003);
        g.gain.exponentialRampToValueAtTime(.0001, st + rndA(.015, .035));
        s.connect(bp).connect(g).connect(out);
        marca(s).start(st, rndA(0, 1.8)); s.stop(st + .05);
      }
    }

    // oleaje grave que crece hasta inundar: ruido grave con un balanceo lento (como el
    // vaivén de una ola real), un cuerpo sub-grave que le da peso, espuma aguda que
    // crece justo antes de romper, y un golpe de "splash" final
    function ola(t0, dur) {
      if (!iniciar() || ctx.state !== 'running') return;
      const t = ctx.currentTime + t0;

      // cuerpo principal: ruido grave con balanceo (LFO sobre el filtro de paso bajo)
      const s = ctx.createBufferSource(); s.buffer = ruido; s.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(260, t);
      lp.frequency.linearRampToValueAtTime(110, t + dur);
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = .35;
      const lfoG = ctx.createGain(); lfoG.gain.value = 45;
      lfo.connect(lfoG).connect(lp.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t);
      g.gain.linearRampToValueAtTime(.4, t + dur * .55);
      g.gain.linearRampToValueAtTime(.34, t + dur * .75);
      g.gain.linearRampToValueAtTime(.6, t + dur);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur + .9);
      s.connect(lp).connect(g).connect(out);
      marca(lfo).start(t); lfo.stop(t + dur + 1);
      marca(s).start(t, rndA(0, 1)); s.stop(t + dur + 1);

      // sub-grave: un seno muy bajo que da peso y cuerpo a la masa de agua
      const sub = ctx.createOscillator(); sub.type = 'sine';
      sub.frequency.setValueAtTime(70, t);
      sub.frequency.linearRampToValueAtTime(48, t + dur);
      const subG = ctx.createGain();
      subG.gain.setValueAtTime(.0001, t);
      subG.gain.linearRampToValueAtTime(.16, t + dur * .85);
      subG.gain.linearRampToValueAtTime(.22, t + dur);
      subG.gain.exponentialRampToValueAtTime(.0001, t + dur + .7);
      sub.connect(subG).connect(out);
      marca(sub).start(t); sub.stop(t + dur + .8);

      // espuma: ruido agudo que crece justo antes de romper la ola
      const esp = ctx.createBufferSource(); esp.buffer = ruido; esp.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = .6;
      const espG = ctx.createGain();
      espG.gain.setValueAtTime(.0001, t);
      espG.gain.linearRampToValueAtTime(.0001, t + dur * .55);
      espG.gain.linearRampToValueAtTime(.2, t + dur * .95);
      espG.gain.linearRampToValueAtTime(.26, t + dur);
      espG.gain.exponentialRampToValueAtTime(.0001, t + dur + .5);
      esp.connect(bp).connect(espG).connect(out);
      marca(esp).start(t, rndA(0, 1)); esp.stop(t + dur + .6);

      // splash final: golpe amplio de ruido al inundar
      const t2 = t + dur;
      const sp = ctx.createBufferSource(); sp.buffer = ruido;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
      const spg = ctx.createGain();
      spg.gain.setValueAtTime(.0001, t2);
      spg.gain.exponentialRampToValueAtTime(.55, t2 + .04);
      spg.gain.exponentialRampToValueAtTime(.0001, t2 + .9);
      sp.connect(hp).connect(spg).connect(out);
      marca(sp).start(t2, rndA(0, 1)); sp.stop(t2 + 1);
    }

    return { iniciar, detener, clicParaguas, gota, lluvia, lluviaPatter, ola };
  })();

  function buildDrops() {
    rain.innerHTML = '';
    seed = 11;
    const frag = document.createDocumentFragment();
    drops = POINTS.map((pt, i) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('stroke', BLUE); g.setAttribute('stroke-width', '4'); g.setAttribute('fill', 'none');
      const lines = [];
      for (let k = 0; k < 4; k++) { const l = document.createElementNS(NS, 'line'); g.appendChild(l); lines.push(l); }
      frag.appendChild(g);
      const p = Math.pow((i + 0.5) / POINTS.length, 0.8);
      const land = RAIN_FROM + p * (RAIN_TO - RAIN_FROM) + (rnd() - 0.5) * 0.18;
      // tamaño de cada gota proporcional al área visible: misma densidad que en ordenador
      const k = Math.min(1, Math.sqrt((VIS.w * VIS.h) / (1920 * 1080)));
      return { x: visX(pt[0]), y: visY(pt[1]), k, land, g, lines };
    });
    rain.appendChild(frag);
  }

  function setDrop(d, half, inner, op, dy, stretch) {
    half *= d.k; inner *= d.k; dy *= d.k;
    for (let k = 0; k < 4; k++) {
      const sx = DIRS[k][0], sy = DIRS[k][1], l = d.lines[k];
      l.setAttribute('x1', (d.x + sx * half).toFixed(2));  l.setAttribute('y1', (d.y + dy + sy * half * stretch).toFixed(2));
      l.setAttribute('x2', (d.x + sx * inner).toFixed(2)); l.setAttribute('y2', (d.y + dy + sy * inner * stretch).toFixed(2));
    }
    d.g.setAttribute('opacity', op.toFixed(3));
  }

  function through(arr, p) {
    const x = p * (arr.length - 1), i = Math.min(Math.floor(x), arr.length - 2);
    return lerp(arr[i], arr[i + 1], gentleP(x - i));
  }

  const TAU = Math.PI * 2;
  const WAVE_PTS = [];
  for (let x = -40; x <= 1960; x += 12) WAVE_PTS.push(x);
  function wavePath(level, amp, t, ph) {
    const parts = new Array(WAVE_PTS.length + 2);
    const fondo = (VIS.top + VIS.h + 220).toFixed(1);
    parts[0] = 'M ' + visX(-40).toFixed(1) + ' ' + fondo;
    for (let i = 0; i < WAVE_PTS.length; i++) {
      const x = WAVE_PTS[i];
      // la ola conserva su forma (alto proporcional al ancho visible): en móvil es la
      // misma ola que en ordenador, a escala, y no un pico estrecho
      const osc = amp * 0.66 * Math.sin(x * TAU / 1350 - t * 2.4 + ph)
        + amp * 0.34 * Math.sin(x * TAU / 2900 - t * 1.3 + ph * 1.7 + 1.2);
      const y = visY(level) + osc * Math.min(1, VIS.w / 1920);
      parts[i + 1] = 'L ' + visX(x).toFixed(1) + ' ' + y.toFixed(1);
    }
    parts[parts.length - 1] = 'L ' + visX(1960).toFixed(1) + ' ' + fondo + ' Z';
    return parts.join(' ');
  }
  const WAVE_FROM = 2.0, WAVE_TO = 3.9;
  const riseP = bezier(0.35, 0.05, 0.65, 0.95);

  // el paraguas grande sube enganchado al mismo reloj que la ola, nunca antes de que
  // el mar empiece a subir (WAVE_FROM): usa la misma curva y "rebote" que tenía la
  // animación CSS original, pero calculados a partir de t para ir siempre sincronizados.
  const UMBRELLA_DELAY = WAVE_FROM + 0.6, UMBRELLA_DUR = 0.8;
  const umbrellaEase = bezier(0.22, 1, 0.36, 1);
  function umbrellaY(t) {
    if (REDUCE) return 0;
    const p = clamp01((t - UMBRELLA_DELAY) / UMBRELLA_DUR);
    const e = umbrellaEase(p);
    if (e <= 0.70) return lerp(760, -14, e / 0.70);
    if (e <= 0.85) return lerp(-14, 5, (e - 0.70) / 0.15);
    return lerp(5, 0, (e - 0.85) / 0.15);
  }

  function renderIntro(t) {
    // lluvia: cada gota cae y se abre en una salpicadura en forma de aspa
    drops.forEach((d) => {
      const s = t - d.land;
      if (s < -FALL) { d.g.setAttribute('opacity', 0); return; }
      if (s < 0) {
        const p = (s + FALL) / FALL;
        const dy = REDUCE ? 0 : -FALL_DIST * (1 - fallP(p));
        setDrop(d, 22, 4, easeOutP(clamp01(p * 1.6)), dy, REDUCE ? 1 : 1.5);
        return;
      }
      const q = clamp01(s / LIFE);
      const e = easeOutP(q);
      const half = lerp(22, SPAN[2] / 2, e);
      const inner = Math.max(half - ARM, lerp(4, 0, clamp01(s / 0.12)));
      const op = through(OPA, q) * (1 - gentleP(clamp01((s - LIFE) / FADE)));
      const settle = lerp(1.5, 1, easeOutP(clamp01(s / 0.18)));
      setDrop(d, half, inner, op, 0, REDUCE ? 1 : settle);
    });

    // ola que sube poco a poco hasta inundar de azul la pantalla
    const wp = prog(t, WAVE_FROM, WAVE_TO);
    if (wp <= 0) {
      if (waveFront.getAttribute('d')) waveFront.setAttribute('d', '');
    } else {
      const amp = 560 * (1 - 0.72 * Math.pow(wp, 2.2)) * (REDUCE ? 0.4 : 1);
      const surge = REDUCE ? 0 : 18 * Math.sin(TAU * (t - WAVE_FROM) / 1.3) * (1 - wp);
      const lv = lerp(1700, -170, riseP(wp)) + surge;
      waveFront.setAttribute('d', wavePath(lv, amp, t, 0));
    }

    // el paraguas grande sube enganchado al reloj de la ola (ver umbrellaY);
    // se oculta con opacidad (no solo desplazándolo fuera del lienzo) para que,
    // aunque se encoja en pantallas estrechas, nunca asome durante la lluvia.
    umbrellaWrap.style.transform = 'translateY(' + umbrellaY(t).toFixed(2) + 'px)';
    umbrellaAnchor.style.opacity = t < UMBRELLA_DELAY ? '0' : '1';

    // tramo final: la principal sube y "trabajos", que va a continuación, ocupa la pantalla
    if (t >= 3.6) {
      const sc = easeInOutP(prog(t, 3.6, 4.6));
      const h = pageH();
      introStage.style.transform = 'translate3d(0,' + (-h * sc).toFixed(2) + 'px,0)';
      viewTrabajos.style.transform = 'translate3d(0,' + (h * (1 - sc)).toFixed(2) + 'px,0)';
    }
  }

  function fitIntroStage() {
    // el escenario ocupa el alto visible bajo el navbar (no detrás de él),
    // y el lienzo de diseño (1920x1080) se escala en modo "cover" para
    // llenar ese hueco entero, recortando lo que sobre por los lados.
    const navH = nav.getBoundingClientRect().height;
    introStage.style.top = navH + 'px';
    const availW = window.innerWidth;
    const availH = window.innerHeight - navH;
    const s = Math.max(availW / 1920, availH / 1080);
    introStageInner.style.transform = 'scale(' + s + ')';
    VIS.w = availW / s; VIS.h = availH / s;
    VIS.left = 960 - VIS.w / 2; VIS.top = 540 - VIS.h / 2;

    // el paraguas del fondo se reancla para que su posición relativa dentro
    // de la zona VISIBLE (ya recortada) sea siempre la misma, así nunca
    // queda fuera de los límites de la página, sea cual sea el tamaño.
    if (umbrellaAnchor) {
      const visW = availW / s, visH = availH / s;
      const visLeft = 960 - visW / 2, visTop = 540 - visH / 2;
      const b = umbrellaWrap.getBBox();
      const origX = b.x + b.width / 2, origY = b.y + b.height / 2;

      // el paraguas también es responsive en TAMAÑO: en pantallas estrechas el recorte
      // "cover" agranda la escena (s crece porque lo manda el alto), así que sin esto el
      // paraguas saldría enorme en un móvil. Se encoge para que su ancho en pantalla nunca
      // pase de una fracción cómoda del ancho real de la ventana (pero sin encogerse de más).
      const onScreenW = b.width * s;
      const maxOnScreenW = Math.min(availW * 0.62, 460);
      const k = onScreenW > maxOnScreenW ? Math.max(maxOnScreenW / onScreenW, 0.62) : 1;

      const halfW = (b.width * k) / 2, halfH = (b.height * k) / 2, margin = 10;
      // el paraguas azul siempre pegado al lado derecho de la zona visible (no se calcula
      // a partir de su posición original en el diseño, que dependía de medir la silueta con
      // getBBox: en algunos entornos de visualización esa medida podía salir mal y dejarlo
      // a la izquierda). Así queda garantizado el lado sea cual sea el tamaño de pantalla.
      // marginXRight > margin: un pelín más separado del borde que el mínimo de seguridad.
      const marginXRight = 40;
      const minX = visLeft + halfW + margin, maxX = visLeft + visW - halfW - marginXRight;
      let targetX = minX <= maxX ? maxX : visLeft + visW / 2;
      // en vertical, el paraguas siempre toca (de hecho, se asoma un poco por) el final
      // de la ola: nunca queda flotando a media altura.
      const marginYBottom = 26;
      let targetY = visTop + visH - halfH - marginYBottom;
      const minY = visTop + halfH + margin;
      if (targetY < minY) targetY = visTop + visH / 2;
      // transform = translate(dx,dy) scale(k): el punto p pasa a k·p + (dx,dy), así que
      // dx,dy se calculan para que el centro original acabe exactamente en el objetivo.
      const dx = targetX - k * origX, dy = targetY - k * origY;
      umbrellaAnchor.setAttribute('transform', `translate(${dx.toFixed(2)},${dy.toFixed(2)}) scale(${k.toFixed(4)})`);
    }
  }
  // ya colocado (aunque oculto) desde la carga, para que el primer clic no tenga que
  // maquetar de golpe un bloque de 1920×1080 (eso es lo que causaba el tirón inicial)
  fitIntroStage();
  window.addEventListener('resize', () => { if (phase !== 'done') fitIntroStage(); });

  function restartCss(el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }

  let introRaf = null, introLast = null, introElapsed = 0;
  // si el hueco entre dos frames es enorme (pestaña en segundo plano, GC largo...)
  // no se suma ese hueco entero (eso provocaba el salto al final), pero tampoco se
  // limita cada frame normal a un tope minúsculo (eso hacía la animación lenta/trabada
  // en cuanto un frame tardaba un poco más de lo habitual): solo se corrige el caso
  // anómalo, tratándolo como un frame normal más.
  const INTRO_STALL_GAP = 0.2;   // por encima de esto se considera un atasco real
  const INTRO_STALL_STEP = 1 / 60; // avance que se aplica en ese caso
  function introLoop() {
    introRaf = requestAnimationFrame((now) => {
      if (introLast === null) introLast = now;
      let dt = (now - introLast) / 1000;
      if (dt > INTRO_STALL_GAP) dt = INTRO_STALL_STEP;
      introElapsed += dt;
      introLast = now;
      renderIntro(Math.min(introElapsed, DUR_INTRO));
      if (introElapsed < DUR_INTRO) introLoop(); else finishIntro();
    });
  }

  function resetIntro() {
    phase = 'intro';
    if (introRaf) cancelAnimationFrame(introRaf);
    introLast = null;
    introElapsed = 0;
    introStage.classList.remove('is-on');
    introStage.style.transform = '';
    rain.innerHTML = '';
    waveFront.setAttribute('d', ''); waterClipPath.setAttribute('d', '');
    viewTrabajos.classList.remove('peek');
    viewTrabajos.style.transform = '';
    body.classList.remove('is-raining');
    umbrellaWrap.style.transform = '';
    umbrellaAnchor.style.opacity = '';
    SonidoIntro.detener();
  }

  // decodifica de antemano las imágenes de "trabajos" para que la revelación final no
  // tenga que decodificarlas de golpe (evita el tirón justo al terminar la animación)
  let trabajosPreloaded = false;
  function preloadTrabajos() {
    if (trabajosPreloaded) return;
    trabajosPreloaded = true;
    const urls = new Set($$('img', viewTrabajos).map((img) => img.currentSrc || img.src));
    $$('.cover', viewTrabajos).forEach((el) => {
      [el, ...$$('*', el)].forEach((node) => {
        const m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(node).backgroundImage);
        if (m) urls.add(m[1]);
      });
    });
    urls.forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
      if (img.decode) img.decode().catch(() => {});
    });
  }

  function startRain() {
    if (phase !== 'intro') return;
    phase = 'playing';
    body.classList.add('is-raining');
    introStage.classList.add('is-on');
    fitIntroStage();
    buildDrops();
    viewTrabajos.classList.add('is-active', 'peek');
    introStage.style.transform = '';
    viewTrabajos.style.transform = 'translate3d(0,' + pageH() + 'px,0)';
    setTimeout(preloadTrabajos, 400);
    SonidoIntro.clicParaguas();
    SonidoIntro.lluvia(0, [
      [RAIN_FROM, .0001], [RAIN_FROM + 1, .09], [RAIN_TO, .15],
      [WAVE_FROM + .6, .11], [WAVE_TO, .012], [WAVE_TO + .5, .0001]
    ]);
    SonidoIntro.lluviaPatter(RAIN_FROM, 1, { densidad: 40, vol: .025 });
    SonidoIntro.lluviaPatter(RAIN_FROM + .8, RAIN_TO - RAIN_FROM - .6, { densidad: 140, vol: .03 });
    SonidoIntro.lluviaPatter(WAVE_FROM + .4, WAVE_TO - WAVE_FROM - .2, { densidad: 80, vol: .022 });
    drops.forEach((d) => SonidoIntro.gota(d.land, rnd() * .02 + .035));
    SonidoIntro.ola(WAVE_FROM, WAVE_TO - WAVE_FROM);
    renderIntro(0);
    introLoop();
  }

  function finishIntro() {
    phase = 'done';
    introStage.classList.remove('is-on');
    $$('.cursor-bubble').forEach((el) => el.classList.remove('is-on'));
    body.classList.remove('show-cursor-bubble');
    introStage.style.transform = '';
    viewTrabajos.classList.remove('peek');
    viewTrabajos.style.transform = '';
    views[''].classList.remove('is-active');
    current = 'trabajos';
    body.classList.remove('is-intro', 'is-raining');
    $$('.nav__links a').forEach((a) =>
      a.dataset.nav === 'trabajos' ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')
    );
    document.title = 'trabajos · pulponalua';
    history.replaceState(null, '', '#/trabajos');
    window.scrollTo(0, 0);
  }

  umbrella.addEventListener('click', startRain);

  /* ----- bolita que sigue al cursor en la página principal ----- */
  if (matchMedia('(hover: hover)').matches) {
    const cursorBubble = document.createElement('div');
    cursorBubble.className = 'cursor-bubble';
    cursorBubble.setAttribute('aria-hidden', 'true');
    cursorBubble.textContent = 'AGARRA EL PARAGUAS';
    document.body.appendChild(cursorBubble);
    window.addEventListener('mousemove', (e) => {
      const show = current === '' && phase === 'intro';
      body.classList.toggle('show-cursor-bubble', show);
      cursorBubble.classList.toggle('is-on', show);
      if (show) {
        // la bolita se queda siempre por debajo del navbar (y del menú hamburguesa si está abierto)
        const menuAbierto = nav.classList.contains('is-open');
        const limite = menuAbierto ? navLinksEl.getBoundingClientRect().bottom : nav.getBoundingClientRect().bottom;
        const r = cursorBubble.offsetHeight / 2;
        const y = Math.max(e.clientY, limite + r + 8);
        const overNav = e.clientY < limite;
        cursorBubble.classList.toggle('is-on', !overNav);
        body.classList.toggle('show-cursor-bubble', !overNav);
        cursorBubble.style.transform = `translate(${e.clientX}px, ${y}px) translate(-50%,-50%)`;
      }
    });
  }

  /* =========================================================
     TRABAJOS: portada de Dobraondas — réplica exacta de la animación
     de referencia (obra.js/obra.css): la tarjeta se centra al pasar
     el ratón y, al pulsar, el papel se parte en dos mitades que giran
     en 3D dejando ver la foto. Al terminar (igual que antes), la foto
     se expande a pantalla completa y aterriza en la página del proyecto.
     ========================================================= */
  let opening = false;
  let generation = 0;
  let exEl = null;
  let veloEl = null;
  const canHover = matchMedia('(hover:hover)').matches;

  const AJ = {
    volumen: 0.9,
    hover: { dur: 400, easing: 'cubic-bezier(.22,1,.36,1)' },
    salida: { dur: 450, easing: 'cubic-bezier(.55,0,.75,.2)' },   // la tarjeta se va
    corte: { dur: 550, easing: 'cubic-bezier(.22,1,.36,1)', retraso: 280 }, // el papel se divide
    pausa: 160,
    apertura: { dur: 650, easing: 'cubic-bezier(.4,0,.2,1)' },    // el papel se desenvuelve
    crece: { dur: 1200, easing: 'cubic-bezier(.65,0,.2,1)' },     // la foto crece a pantalla completa
    corteX: -16.48,
    giro: 82
  };

  const T1 = 'translate(61.95%, 17.3%) rotate(-4.46deg) scale(.5993)';
  const T2 = 'translate(0%, 0%) rotate(0deg) scale(1)';
  const TFUERA = 'translate(3%, 122%) rotate(5deg) scale(1.02)';

  /* ─── sonido de papel (idéntico al de referencia: sintetizado con Web Audio) ─── */
  const Papel = (() => {
    let ctx, out, ruido;
    function iniciar() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 4;
      out = ctx.createGain(); out.gain.value = AJ.volumen;
      out.connect(comp).connect(ctx.destination);
      const len = ctx.sampleRate * 2;
      ruido = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return ctx;
    }
    const rnd = (a, b) => a + Math.random() * (b - a);
    const logRnd = (a, b) => Math.exp(rnd(Math.log(a), Math.log(b)));

    function roce({ en = 0, dur = .4, f0 = 1500, f1 = 4000, q = .7, vol = .25 } = {}) {
      if (!iniciar() || ctx.state !== 'running') return;
      const t = ctx.currentTime + en / 1000;
      const s = ctx.createBufferSource(); s.buffer = ruido; s.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
      bp.frequency.setValueAtTime(f0, t);
      bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + dur * .3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(bp).connect(hp).connect(g).connect(out);
      s.start(t, rnd(0, 1.5)); s.stop(t + dur + .05);
    }

    function cruje({ en = 0, dur = .5, densidad = 90, vol = .5, fmin = 1400, fmax = 7000 } = {}) {
      if (!iniciar() || ctx.state !== 'running') return;
      const t0 = ctx.currentTime + en / 1000;
      let t = 0;
      while (t < dur) {
        const x = t / dur;
        const env = Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.1)), .6) + .05;
        t += -Math.log(1 - Math.random()) / (densidad * env);
        if (t >= dur) break;
        const st = t0 + t;
        const len = logRnd(.01, .055);
        const s = ctx.createBufferSource(); s.buffer = ruido;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = logRnd(fmin, fmax); bp.Q.value = rnd(.6, 2.2);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; lp.Q.value = .5;
        const g = ctx.createGain();
        const a = vol * env * Math.pow(Math.random(), 1.6);
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(Math.max(a, .0002), st + .006);
        g.gain.exponentialRampToValueAtTime(0.0001, st + len);
        s.connect(bp).connect(lp).connect(g).connect(out);
        s.start(st, rnd(0, 1.9)); s.stop(st + len + .01);
      }
    }

    let ultimoHover = 0;
    return {
      iniciar,
      // solo suena al entrar, y no más de uno cada 350 ms para que no se solapen al pasar entre portadas
      hoverIn()  { const ahora = performance.now(); if (ahora - ultimoHover < 350) return; ultimoHover = ahora; roce({ dur: .38, f0: 1800, f1: 4200, vol: .16 }); cruje({ dur: .28, densidad: 45, vol: .22 }); },
      hoverOut() { roce({ dur: .32, f0: 3800, f1: 1600, vol: .12 }); cruje({ dur: .2, densidad: 35, vol: .16 }); },
      salida()   { roce({ dur: .4, f0: 2000, f1: 1000, vol: .16 }); cruje({ dur: .28, densidad: 40, vol: .16, fmin: 700, fmax: 3800 }); },
      corte(en)  { cruje({ en, dur: .4, densidad: 85, vol: .32, fmin: 700, fmax: 3800 }); roce({ en, dur: .4, f0: 650, f1: 2000, q: 1, vol: .14 }); },
      apertura(en) { cruje({ en, dur: .9, densidad: 55, vol: .3, fmin: 700, fmax: 3800 }); roce({ en, dur: .9, f0: 800, f1: 2400, q: .6, vol: .16 }); }
    };
  })();

  function animaCover(el, frames, { dur, easing = 'linear', retraso = 0 }) {
    el.getAnimations().forEach((a) => { try { a.commitStyles(); } catch (e) {} a.cancel(); });
    const cs = getComputedStyle(el);
    const desde = {};
    for (const k of Object.keys(frames[frames.length - 1])) if (k !== 'offset') desde[k] = cs[k];
    return el.animate([desde, ...frames], { duration: dur, easing, delay: retraso, fill: 'forwards' });
  }

  // sin scroll mientras dura la animación
  window.addEventListener('wheel', (e) => { if (opening) e.preventDefault(); }, { passive: false });
  window.addEventListener('touchmove', (e) => { if (opening) e.preventDefault(); }, { passive: false });

  const FULL = { top: '0px', left: '0px', right: '0px', bottom: '0px' };
  const insetOf = (r) => ({
    top: r.top + 'px', left: r.left + 'px',
    right: (innerWidth - r.right) + 'px', bottom: (innerHeight - r.bottom) + 'px'
  });
  const glide = (el, from, to, duration) =>
    el.animate([from, to], { duration, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'forwards' }).finished;
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  /* cada portada de "trabajos" con la misma animación que Dobraondas:
     la tarjeta se centra al pasar el ratón y, al pulsar, el papel se parte en
     dos mitades que giran en 3D dejando ver la foto, que crece a pantalla
     completa (de gris a color) y aterriza en la página de su proyecto */
  function montarCover(cover) {
    const slug = cover.dataset.proyecto;
    const page = views[slug];
    const etiqueta = cover.getAttribute('aria-label');
    const marco = $('.co-marco', cover);
    const tarjeta = $('.co-tarjeta', cover);
    const l2024 = $('.co-logo-2024', cover);
    const lA = $('.co-logo-a', cover);
    const izq = $$('.co-izq', marco);
    const der = $$('.co-der', marco);
    const capasCover = [...izq, ...der];
    const baseOpacity = new Map(capasCover.map((c) => [c, parseFloat(getComputedStyle(c).opacity)]));
    let estadoCover = 'cerrado'; // cerrado | abriendo | abierto
    let encima = false;

    const persp = () => `perspective(${Math.round(marco.clientWidth * 2.4)}px)`;
    const tIzq = (x, g) => `${persp()} translateX(${x}%) rotateY(${g}deg)`;
    const tDer = (x, g) => `${persp()} translateX(${x}%) rotateY(${g}deg)`;

    /* 1 ⇄ 2: la tarjeta se centra al pasar el ratón (o el foco) */
    function estado2(on) {
      const h = AJ.hover;
      animaCover(tarjeta, [{ transform: on ? T2 : T1 }], h);
      animaCover(l2024, [{ opacity: on ? 0 : 1, transform: on ? 'translateY(-8%) scale(.92)' : 'none' }], { ...h, dur: h.dur * .6 });
      animaCover(lA, [{ opacity: on ? 0 : 1, transform: on ? 'translate(-40%, 30%) scale(.6) rotate(-20deg)' : 'none' }], { ...h, dur: h.dur * .6 });
    }

    if (canHover) {
      cover.addEventListener('mouseenter', () => { encima = true; if (!opening && estadoCover === 'cerrado') { estado2(true); Papel.hoverIn(); } });
      cover.addEventListener('mouseleave', () => { encima = false; if (!opening && estadoCover === 'cerrado') estado2(false); });
    }
    cover.addEventListener('focus', () => { if (!opening && estadoCover === 'cerrado' && !encima) { encima = true; estado2(true); Papel.hoverIn(); } });
    cover.addEventListener('blur', () => { if (!opening && estadoCover === 'cerrado' && encima) { encima = false; estado2(false); } });

    // borra el inline que deja commitStyles para volver al estado de la hoja de estilos
    function limpiarInlineCover() {
      [tarjeta, l2024, lA, ...capasCover].forEach((el) => {
        el.style.removeProperty('transform');
        el.style.removeProperty('opacity');
      });
    }

    function reiniciar() {
      cover.getAnimations().forEach((a) => a.cancel());
      $$('.co-tarjeta,.co-logo-2024,.co-logo-a,.co-capa', cover).forEach((el) =>
        el.getAnimations().forEach((a) => a.cancel())
      );
      limpiarInlineCover();
      marco.classList.remove('co-partido');
      cover.setAttribute('aria-label', etiqueta);
    }

    // al salir de "trabajos" a medias, todo vuelve a su sitio
    function salir(abriendoEsta) {
      if (abriendoEsta) {
        reiniciar();
        page.classList.remove('from-cover', 'hold-hero', 'hold-rest');
      } else if (encima && estadoCover === 'cerrado') {
        estado2(false);
      }
      estadoCover = 'cerrado';
      encima = false;
    }

    /* 2 → 3 → 4: el papel se parte y se abre */
    async function abrirCover() {
      estadoCover = 'abriendo';
      cover.setAttribute('aria-label', etiqueta.split('.')[0] + ': cargando proyecto');
      Papel.iniciar();
      const s = AJ;

      animaCover(l2024, [{ opacity: 0, transform: 'translateY(-8%) scale(.92)' }], { dur: 350, easing: 'ease-out' });
      animaCover(lA, [{ opacity: 0, transform: 'translate(-40%, 30%) scale(.6) rotate(-20deg)' }], { dur: 350, easing: 'ease-out' });

      animaCover(tarjeta, [{ transform: 'translate(0%, -2%) rotate(-.5deg) scale(1.03)', offset: .22 }, { transform: TFUERA }], s.salida);
      Papel.salida();

      setTimeout(() => { if (estadoCover === 'abriendo') marco.classList.add('co-partido'); }, s.corte.retraso);
      izq.forEach((c) => animaCover(c, [{ transform: tIzq(s.corteX, 0) }], { ...s.corte, retraso: s.corte.retraso }));
      der.forEach((c) => animaCover(c, [{ transform: tDer(0, 0) }], { ...s.corte, retraso: s.corte.retraso }));
      Papel.corte(s.corte.retraso);
      await sleep(s.corte.retraso + s.corte.dur * .78 + s.pausa);
      if (estadoCover !== 'abriendo') return;

      const a = s.apertura;
      Papel.apertura(0);
      izq.forEach((c) => {
        const op = c.classList.contains('co-sombra') ? 0 : baseOpacity.get(c);
        animaCover(c, [
          { transform: tIzq(s.corteX - 8, -s.giro * .35), opacity: c.classList.contains('co-sombra') ? .8 : op, offset: .65 },
          { transform: tIzq(s.corteX - 34, -s.giro), opacity: 0 }
        ], a);
      });
      der.forEach((c) => {
        const op = c.classList.contains('co-sombra') ? 0 : baseOpacity.get(c);
        animaCover(c, [
          { transform: tDer(6, s.giro * .35), opacity: c.classList.contains('co-sombra') ? .8 : op, offset: .65 },
          { transform: tDer(26, s.giro), opacity: 0 }
        ], a);
      });
      await sleep(a.dur);
      if (estadoCover !== 'abriendo') return;
      estadoCover = 'abierto';
    }

    cover.addEventListener('click', async (e) => {
      e.preventDefault();
      if (opening) return;
      opening = slug;
      const myGen = generation;
      const vivo = () => myGen === generation;
      try {
        Papel.iniciar();

        if (estadoCover === 'cerrado' && !encima) { encima = true; estado2(true); Papel.hoverIn(); await sleep(AJ.hover.dur); }
        if (!vivo()) return;

        await abrirCover();
        if (!vivo() || estadoCover !== 'abierto') return;

        // transición: la foto se separa de la portada mientras "trabajos" se funde a blanco,
        // la página del proyecto se monta detrás y la foto vuela directamente a su sitio
        // (pasando de gris a color y a la imagen principal); después aparece el resto
        const r = cover.getBoundingClientRect();
        const velo = document.createElement('div');
        velo.className = 'velo';
        document.body.appendChild(velo);
        const ex = document.createElement('div');
        ex.className = 'expand expand--' + slug;
        Object.assign(ex.style, insetOf(r));
        const exColor = document.createElement('div');
        exColor.className = 'expand-color';
        ex.appendChild(exColor);
        document.body.appendChild(ex);
        exEl = ex; veloEl = velo;
        exColor.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        velo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease', fill: 'forwards' });
        ex.animate([{ transform: 'scale(1)', boxShadow: '0 0 0 rgba(0,0,0,0)' }, { transform: 'scale(1.018)', boxShadow: '0 20px 48px rgba(0,0,0,.18)' }],
          { duration: 380, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' });
        await sleep(360);
        if (!vivo()) return;

        page.classList.add('from-cover', 'hold-hero', 'hold-rest');
        show(slug);
        try { history.pushState(null, '', '#/' + slug); } catch (_) { location.hash = '#/' + slug; }
        reiniciar();
        estadoCover = 'cerrado';
        encima = false;
        await frame();
        if (!vivo()) return;

        const hero = $('.proyecto__hero', page);
        const hr = hero.getBoundingClientRect();
        const VUELO = 780;
        setTimeout(() => ex.classList.add('is-full'), 170);
        ex.animate([{ transform: 'scale(1.018)', boxShadow: '0 20px 48px rgba(0,0,0,.18)' }, { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0,0,0,0)' }],
          { duration: VUELO, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' });
        setTimeout(() => { if (vivo()) page.classList.remove('hold-rest'); }, VUELO * .8);
        await ex.animate([insetOf(r), insetOf(hr)], { duration: VUELO, easing: 'cubic-bezier(.45,0,.15,1)', fill: 'forwards' }).finished;
        if (!vivo()) return;

        hero.style.transition = 'none';
        page.classList.remove('hold-hero');
        void hero.offsetWidth;
        ex.remove(); velo.remove();
        exEl = null; veloEl = null;
        hero.style.transition = '';
      } catch (err) {
        salirDeTrabajos();
      } finally {
        if (vivo()) opening = false;
      }
    });

    return { slug, salir };
  }

  const coversMontadas = covers.map(montarCover);

  function salirDeTrabajos() {
    generation++;
    const abierta = opening;
    coversMontadas.forEach((c) => c.salir(c.slug === abierta || (exEl && c.slug === abierta)));
    if (exEl) { exEl.remove(); exEl = null; }
    if (veloEl) { veloEl.remove(); veloEl = null; }
    opening = false;
  }
  window.addEventListener('hashchange', () => { if (routeName() !== 'trabajos') salirDeTrabajos(); });

  /* =========================================================
     PROYECTOS: vídeo de YouTube que se reproduce (con sonido) al
     verlo en pantalla y se pausa al salir; carrusel de fotos
     ========================================================= */
  $$('iframe[data-yt]').forEach((ifr) => {
    let listo = false, visible = false, sonando = false, comprobacion = null;
    const cmd = (func, args = []) => {
      try { ifr.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*'); } catch (_) {}
    };
    const aplicar = () => {
      if (!listo) return;
      if (visible) {
        cmd('unMute'); cmd('setVolume', [100]); cmd('playVideo');
        // si el navegador no deja empezar con sonido, arranca en silencio
        clearTimeout(comprobacion);
        comprobacion = setTimeout(() => { if (visible && !sonando) { cmd('mute'); cmd('playVideo'); } }, 1200);
      } else {
        clearTimeout(comprobacion);
        cmd('pauseVideo');
      }
    };
    ifr.addEventListener('load', () => {
      listo = true;
      try { ifr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: ifr.dataset.yt }), '*'); } catch (_) {}
      aplicar();
    });
    window.addEventListener('message', (e) => {
      if (e.source !== ifr.contentWindow || typeof e.data !== 'string') return;
      let d; try { d = JSON.parse(e.data); } catch (_) { return; }
      const st = d.info && typeof d.info === 'object' ? d.info.playerState : (d.event === 'onStateChange' ? d.info : undefined);
      if (st === 1) sonando = true; else if (st === 2 || st === 0) sonando = false;
    });
    new IntersectionObserver((ents) => {
      ents.forEach((en) => { visible = en.isIntersecting && en.intersectionRatio >= .5; aplicar(); });
    }, { threshold: [0, .5, 1] }).observe(ifr.parentElement);
  });

  // vídeos propios: se reproducen con sonido al verlos en pantalla y se pausan al salir
  // (si el navegador no deja empezar con sonido, arrancan en silencio; un clic activa o
  // quita el sonido)
  $$('video.video-auto').forEach((v) => {
    let visible = false;
    const reproducir = () => {
      v.muted = false;
      const pr = v.play();
      if (pr && pr.catch) pr.catch(() => { v.muted = true; v.play().catch(() => {}); });
    };
    v.addEventListener('click', () => { v.muted = !v.muted; if (v.paused) v.play().catch(() => {}); });
    new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        const ahora = en.isIntersecting && en.intersectionRatio >= .5;
        if (ahora === visible) return;
        visible = ahora;
        if (visible) reproducir(); else v.pause();
      });
    }, { threshold: [0, .5, 1] }).observe(v);
  });

  $$('.carrusel').forEach((car) => {
    const pista = $('.carrusel__pista', car);
    const fotos = $$('.carrusel__foto', car);
    const puntos = $$('.carrusel__puntos button', car);
    const ant = $('.carrusel__btn--ant', car);
    const sig = $('.carrusel__btn--sig', car);
    const actual = () => Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth));
    const ir = (i) => {
      i = Math.max(0, Math.min(fotos.length - 1, i));
      pista.scrollTo({ left: i * pista.clientWidth, behavior: 'smooth' });
    };
    const pintar = () => {
      const i = actual();
      puntos.forEach((p, k) => p.setAttribute('aria-current', k === i ? 'true' : 'false'));
      ant.disabled = i === 0;
      sig.disabled = i === fotos.length - 1;
    };
    ant.addEventListener('click', () => ir(actual() - 1));
    sig.addEventListener('click', () => ir(actual() + 1));
    puntos.forEach((p, k) => p.addEventListener('click', () => ir(k)));
    pista.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); ir(actual() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir(actual() - 1); }
    });
    let t = null;
    pista.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(pintar, 60); }, { passive: true });
    window.addEventListener('resize', () => { pista.scrollLeft = actual() * pista.clientWidth; });
    // arrastrar con el ratón
    let arrastre = null;
    pista.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      arrastre = { x: e.clientX, i: actual() };
      pista.style.scrollSnapType = 'none'; pista.style.scrollBehavior = 'auto';
    });
    window.addEventListener('pointermove', (e) => {
      if (!arrastre) return;
      pista.scrollLeft = arrastre.i * pista.clientWidth - (e.clientX - arrastre.x);
    });
    window.addEventListener('pointerup', (e) => {
      if (!arrastre) return;
      const dx = e.clientX - arrastre.x, i0 = arrastre.i;
      arrastre = null;
      pista.style.scrollSnapType = ''; pista.style.scrollBehavior = '';
      ir(Math.abs(dx) > pista.clientWidth * .12 ? i0 + (dx < 0 ? 1 : -1) : i0);
    });
    pintar();
  });

  /* =========================================================
     CONTACTO: formulario + carta que entra en el sobre
     (pasos de las mesas CONTACTO 4 → 9 de Illustrator)
     ========================================================= */
  const form = $('#form-contacto');
  const wrap = $('#env-wrap');
  const sombra = $('#card-sombra');
  const solapaAtras = $('#solapa-atras');
  const solapaDelante = $('#solapa-delante');
  const status = $('#form-msg');
  const btn = $('#btn-enviar');
  const snd = $('#snd-enviado');
  const errs = { email: $('#err-email'), asunto: $('#err-asunto'), nota: $('#err-nota') };
  let sending = false;

  const play = (el, frames, opts) => el.animate(frames, { fill: 'forwards', ...opts }).finished;
  const clearAnims = () => [wrap, form, sombra, solapaAtras, solapaDelante].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  const setStatus = (html, kind) => {
    status.classList.toggle('is-ok', kind === 'ok');
    status.innerHTML = html || '';
  };

  /* ----- validación: el aviso sale debajo de cada campo ----- */
  const RULES = {
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : v ? 'Escribe un email válido.' : 'Escribe tu email.'),
    asunto: (v) => (v ? '' : 'Escribe un asunto.'),
    nota: (v) => (v ? '' : 'Escribe una nota.')
  };
  function check(name, shake) {
    const el = form[name];
    const msg = RULES[name](el.value.trim());
    errs[name].textContent = msg;
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    el.classList.remove('is-error');
    if (msg) { if (shake) void el.offsetWidth; el.classList.add('is-error'); }
    return !msg;
  }
  ['email', 'asunto', 'nota'].forEach((name) => {
    const el = form[name];
    el.addEventListener('input', () => { setStatus(''); if (errs[name].textContent) check(name); });
    el.addEventListener('blur', () => { if (el.value.trim()) check(name); });
  });

  async function sendForm() {
    if (CFG.demo) { await sleep(700); return true; }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const email = form.email.value.trim();
      const asunto = form.asunto.value.trim();
      const res = await fetch(CFG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          asunto,
          nota: form.nota.value.trim(),
          _subject: asunto,          // el asunto que escribe la persona es el asunto del correo que recibes
          _replyto: email,           // al pulsar "responder" contestas directamente a esa persona
          _template: 'table',
          _captcha: 'false',
          _honey: form._honey.value
        }),
        signal: ctrl.signal
      });
      clearTimeout(t);
      const data = await res.json().catch(() => ({}));
      return res.ok && String(data.success) !== 'false';
    } catch (_) { return false; }
  }

  /* coordenadas y tiempos calcados del CSS de referencia (animación en bucle de 7.7s);
     aquí arrancan en el instante del clic en vez de repetirse solas, y el tramo en que
     el sobre queda oculto (fuera de pantalla) espera a la respuesta real del envío */
  async function animateSend(request) {
    const u = wrap.offsetWidth / 1072;
    try { snd.currentTime = 0; snd.play().catch(() => {}); } catch (_) {}
    const T = (x, y) => `translate(${x * u}px, ${y * u}px)`;
    const Y = (v) => `translateY(${v * u}px)`;
    const OPEN = 'translateY(16.75px) scaleY(1) translateY(-16.75px)';
    const SHUT = 'translateY(16.75px) scaleY(-1) translateY(-16.75px)';

    btn.classList.add('is-away');

    // la carta se hunde en el sobre
    const cardIn = play(form, [{ transform: Y(0) }, { transform: Y(576) }],
      { duration: 1300, easing: 'cubic-bezier(.65,0,.35,1)' });
    play(sombra, [{ transform: Y(0) }, { transform: Y(576) }],
      { duration: 1300, easing: 'cubic-bezier(.65,0,.35,1)' }).catch(() => {});
    // la solapa gira sobre su borde superior hasta quedar boca abajo (sellada); al llegar
    // de canto (invisible) se cambia cuál de las dos copias se ve, para que el giro se vea
    // igual tanto por detrás como por delante de la carta
    const flipA = play(solapaAtras, [{ transform: OPEN }, { transform: SHUT }], { duration: 800, delay: 1350, easing: 'cubic-bezier(.37,0,.63,1)' });
    const flipD = play(solapaDelante, [{ transform: OPEN }, { transform: SHUT }], { duration: 800, delay: 1350, easing: 'cubic-bezier(.37,0,.63,1)' });
    play(solapaAtras, [{ opacity: 1 }, { opacity: 0 }], { duration: 1, delay: 1750 }).catch(() => {});
    play(solapaDelante, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: 1750 }).catch(() => {});
    // con el sobre ya sellado entero: sube, coge impulso a la izquierda y sale por la derecha
    const wRise = play(wrap, [{ transform: T(0, 0) }, { transform: T(0, -528) }], { duration: 1150, delay: 1950, easing: 'cubic-bezier(.65,0,.35,1)' });
    const wDrift = play(wrap, [{ transform: T(0, -528) }, { transform: T(-40, -528) }], { duration: 500, delay: 3250, easing: 'cubic-bezier(.5,1,.89,1)' });
    const wWhoosh = play(wrap, [{ transform: T(-40, -528) }, { transform: T(1530, -528) }], { duration: 550, delay: 3750, easing: 'cubic-bezier(.5,0,.75,0)' });
    await Promise.all([cardIn, flipA, flipD, wRise, wDrift, wWhoosh]);

    const ok = await request;
    if (!ok) {
      // no se ha podido enviar: todo vuelve atrás
      [wrap, form, sombra, solapaAtras, solapaDelante].forEach((el) => el.getAnimations().forEach((a) => { a.playbackRate = -1.6; a.play(); }));
      await Promise.all([wrap, form, sombra, solapaAtras, solapaDelante].flatMap((el) => el.getAnimations().map((a) => a.finished)));
      clearAnims();
      btn.classList.remove('is-away');
      return false;
    }

    // reaparece por abajo y sube hasta su sitio; en el instante del salto (oculto,
    // fuera de pantalla) la carta y la solapa vuelven a su estado de reposo
    clearAnims();
    form.reset();
    Object.values(errs).forEach((p) => (p.textContent = ''));
    $$('.field', form).forEach((f) => { f.classList.remove('is-error'); f.removeAttribute('aria-invalid'); });
    play(form, [{ transform: Y(576) }, { transform: Y(0) }], { duration: 1 }).catch(() => {});
    play(sombra, [{ transform: Y(576) }, { transform: Y(0) }], { duration: 1 }).catch(() => {});
    play(solapaAtras, [{ transform: SHUT, opacity: 0 }, { transform: OPEN, opacity: 1 }], { duration: 1 }).catch(() => {});
    play(solapaDelante, [{ transform: SHUT, opacity: 1 }, { transform: OPEN, opacity: 0 }], { duration: 1 }).catch(() => {});
    play(wrap, [{ transform: T(1530, -528) }, { transform: T(0, 957) }], { duration: 1 }).catch(() => {});
    const arrive = play(wrap, [{ transform: T(0, 957) }, { transform: T(0, 0) }], { duration: 1250, delay: 150, easing: 'cubic-bezier(.33,1,.68,1)' });
    setTimeout(() => btn.classList.remove('is-away'), 1400);
    await arrive;
    clearAnims();
    return true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    setStatus('');
    const valid = ['email', 'asunto', 'nota'].map((n) => check(n, true));
    if (valid.includes(false)) { form[['email', 'asunto', 'nota'][valid.indexOf(false)]].focus(); return; }
    sending = true; btn.disabled = true;
    $$('.field', form).forEach((f) => (f.readOnly = true));
    const ok = await animateSend(sendForm());
    $$('.field', form).forEach((f) => (f.readOnly = false));
    btn.disabled = false; sending = false;
    if (ok) {
      setStatus('¡Mensaje enviado! Te responderé pronto.', 'ok');
      setTimeout(() => { if (!sending) setStatus(''); }, 8000);
    } else {
      setStatus(`No se pudo enviar. Escríbeme a <a href="mailto:${CFG.email}">${CFG.email}</a>.`);
    }
  });

  /* ---------- arranque ---------- */
  show(routeName());
})();
