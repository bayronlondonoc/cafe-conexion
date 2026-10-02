/* Café Conexión · colibrí de la portada (index.html)
   El colibrí entra volando desde la derecha, frena en el centro, se devuelve un poco y se da la
   vuelta; aparecen los textos y, por detrás de él, «Café Conexión». Después nunca se queda
   quieto: flota, cada tanto hace un «dardo» a otro punto, sigue el cursor y recorre una curva
   con el scroll.

   El video solo pone el aleteo: una secuencia de fotogramas WebP con transparencia
   (assets/colibri/d/ para escritorio y m/ para celular). El desplazamiento lo calcula este
   archivo. Usa GSAP y ScrollTrigger (js/vendor/).

   Con «reducir movimiento», sin JavaScript o si algo falla, el colibrí queda quieto (imagen fija)
   y todo se ve completo. README.md → «Colibrí de la portada». */

(function () {
  'use strict';

  var w = window, d = document, html = d.documentElement;
  var hero = d.querySelector('[data-colibri]');
  if (!hero) return;
  html.classList.add('hc-listo'); // el seguro del head ya no hace falta

  var CONFIG = {
    carpeta: 'assets/colibri/',
    fotogramas: 48, // cuántos hay en d/ y en m/ (000.webp, 001.webp…)
    fps: 24,
    mirada: 1, // hacia dónde mira el colibrí en los fotogramas: 1 derecha, -1 izquierda
    miradaFinal: 1, // hacia dónde queda mirando al terminar la entrada (1 como en las referencias)
    esperaIntro: 1.35 // s: con la intro «Conexión», el colibrí entra cuando la capa se abre
  };

  // Recorridos por tamaño de pantalla. Las curvas son fracciones del ancho y del alto del hero,
  // medidas desde el punto de reposo.
  var PERFILES = {
    ancho: {
      fijar: true, largo: 0.9, // la portada se queda fija 0,9 pantallas mientras el colibrí vuela
      // Baja un poco hacia la izquierda y sube en curva hacia la derecha, acercándose.
      curva: [[-0.1, 0.12], [0.12, 0.1], [0.26, -0.08]],
      profundidad: 0.28, // cuánto crece al final de la curva
      vaiven: 1, dardo: { x: 150, y: 62 }, cursor: { x: 70, y: 36 },
      nombreLento: 0.35, textosSuben: 36
    },
    alto: {
      fijar: false, largo: 0.6,
      curva: [[-0.12, 0.05], [0.1, 0.1], [0.14, 0.06]],
      profundidad: 0.12,
      vaiven: 0.6, dardo: { x: 50, y: 26 }, cursor: null,
      nombreLento: 0.22, textosSuben: 0
    }
  };
  var ES_ANCHO = '(min-width: 1024px)';

  var gsap = w.gsap, ST = w.ScrollTrigger;
  var reducido = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el = {
    fondo: hero.querySelector('[data-colibri-fondo]'),
    nombre: hero.querySelector('[data-colibri-nombre]'),
    nombreIn: hero.querySelector('[data-colibri-nombre-in]'),
    ave: hero.querySelector('[data-colibri-ave]'),
    poster: hero.querySelector('[data-colibri-poster]'),
    textos: [].slice.call(hero.querySelectorAll('.hero__seq > *')),
    tarjetas: [].slice.call(hero.querySelectorAll('[data-colibri-tarjeta]')),
    suben: [].slice.call(hero.querySelectorAll('.hero__contenido, [data-colibri-tarjetas]'))
  };

  cifras();

  // Sin GSAP o con movimiento reducido: imagen fija y todo visible.
  if (reducido || !gsap || !ST || !el.poster || !el.ave) {
    html.classList.remove('hc-motion');
    return;
  }
  gsap.registerPlugin(ST);

  /* ---------- Utilidades ---------- */

  function limitar(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mezclar(a, b, t) { return a + (b - a) * t; }
  function suavizar(a, b, rapidez, dt) { return mezclar(a, b, 1 - Math.exp(-rapidez * dt)); }
  function azar(a, b) { return a + Math.random() * (b - a); }
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  function easeInOutExpo(t) {
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  }
  // Bézier cúbica que sale de 0: p1 y p2 son de control, p3 es el final.
  function bezier(p1, p2, p3, t) { var u = 1 - t; return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3; }

  /* ---------- Estado ---------- */

  var lienzo = d.createElement('canvas');
  lienzo.className = 'colibri__lienzo';
  lienzo.setAttribute('aria-hidden', 'true');
  el.ave.appendChild(lienzo);
  var ctx = lienzo.getContext('2d');

  var P = PERFILES.ancho;
  var L = { W: 0, H: 0, x: 0, y: 0, ancho: 0, alto: 0 }; // hero y punto de reposo
  var entrada = { x: 0, y: 0, s: 1 };
  var dardo = { x: 0, y: 0, s: 1, desde: null, hacia: null, t0: 0, dur: 0, activo: false, proximo: Infinity };
  var mirada = { valor: CONFIG.miradaFinal, desde: CONFIG.miradaFinal, hacia: CONFIG.miradaFinal, t0: -9, dur: 0.24 };
  var amp = { vaiven: 1, cursor: 0 };
  var cur = { x: 0, y: 0 }, par = { x: 0, y: 0 }, puntero = { activo: false, x: 0, y: 0 };
  var t = 0, antes = 0, corriendo = false, visible = true, enVuelo = false;
  var entradaLista = false, bloqueoMirada = false;
  var avance = 0, avanceMeta = 0, despues = 0, st = null;
  var xPrev = null, vx = 0, giro = 0, mirandoCursor = 0;
  var fotos = null, cargando = false, pos = 0, cuadro = -1, redibujar = true, empujeAlas = 0;
  var intro = null;

  /* ---------- Medidas ---------- */

  function medir() {
    var r = hero.getBoundingClientRect(), p = el.poster.getBoundingClientRect();
    L.W = r.width; L.H = r.height;
    L.ancho = p.width; L.alto = p.height;
    L.x = p.left - r.left + p.width / 2;
    L.y = p.top - r.top + p.height / 2;
    var dpr = Math.min(w.devicePixelRatio || 1, 2);
    lienzo.style.width = L.ancho + 'px';
    lienzo.style.height = L.alto + 'px';
    lienzo.width = Math.max(1, Math.round(L.ancho * dpr));
    lienzo.height = Math.max(1, Math.round(L.alto * dpr));
    redibujar = true;
  }

  /* ---------- Fotogramas ---------- */

  function dibujar() {
    var img = fotos ? fotos[cuadro] : el.poster;
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
    redibujar = false;
  }

  // Se cargan después del poster, de a 4 y con prioridad baja: no frenan la carga de la página.
  function cargarFotogramas() {
    if (cargando) return;
    cargando = true;
    // Celular: el juego liviano (480 px). Tablet y escritorio: el de 800 px.
    var dpr = Math.min(w.devicePixelRatio || 1, 2);
    var chico = (w.matchMedia('(max-width: 1023px)').matches && L.ancho * dpr < 900) ||
      !!(navigator.connection && navigator.connection.saveData);
    var carpeta = CONFIG.carpeta + (chico ? 'm/' : 'd/');
    var lista = new Array(CONFIG.fotogramas), listos = 0, siguiente = 0;

    function uno() {
      if (siguiente >= CONFIG.fotogramas) return;
      var i = siguiente++, img = new Image();
      img.decoding = 'async';
      if ('fetchPriority' in img) img.fetchPriority = 'low';
      img.onload = img.onerror = function () {
        lista[i] = img;
        // Se decodifica aparte para que el primer bucle no dé tirones, sin frenar la carga.
        if (img.decode && img.naturalWidth) img.decode().catch(function () {});
        if (++listos === CONFIG.fotogramas) {
          // Si alguno falló, se queda el poster: mejor quieto que a saltos.
          if (lista.every(function (f) { return f.naturalWidth; })) { fotos = lista; redibujar = true; }
        } else {
          uno();
        }
      };
      img.src = carpeta + ('00' + i).slice(-3) + '.webp';
    }
    for (var k = 0; k < 4; k++) uno();
  }

  /* ---------- Mirada, vaivén y dardos ---------- */

  function voltear(dir) {
    if (!dir || dir === mirada.hacia) return;
    mirada.desde = mirada.valor;
    mirada.hacia = dir;
    mirada.t0 = t;
  }

  // Nunca quieto: dos senos de frecuencias distintas por eje (10–25 px) y una leve inclinación.
  function vaiven() {
    var a = amp.vaiven * P.vaiven;
    return {
      x: a * (14 * Math.sin(t * 1.35 + 0.4) + 7 * Math.sin(t * 3.1 + 1.7)),
      y: a * (10 * Math.sin(t * 1.9) + 6 * Math.sin(t * 4.3 + 0.9)),
      r: a * 1.6 * Math.sin(t * 2.2 + 0.3),
      s: 1 + a * 0.012 * Math.sin(t * 2.7)
    };
  }

  function programarDardo(min, max) { dardo.proximo = t + azar(min, max); }

  // Un dardo: gira hacia donde va, sale disparado a otro punto cercano y frena en seco.
  function lanzarDardo() {
    var R = P.dardo, tx = 0, ty = 0;
    for (var i = 0; i < 10; i++) {
      var ang = azar(0, Math.PI * 2), rr = azar(0.45, 1);
      tx = Math.cos(ang) * R.x * rr;
      ty = Math.sin(ang) * R.y * rr;
      if (Math.abs(tx - dardo.x) / R.x + Math.abs(ty - dardo.y) / R.y > 0.8) break;
    }
    var dir = tx > dardo.x ? 1 : -1, gira = dir !== mirada.hacia;
    voltear(dir);
    dardo.desde = { x: dardo.x, y: dardo.y, s: dardo.s };
    dardo.hacia = { x: tx, y: ty, s: azar(0.95, 1.06) };
    dardo.t0 = t + (gira ? 0.12 : 0);
    dardo.dur = azar(0.38, 0.56);
    dardo.activo = true;
  }

  function moverDardo() {
    if (dardo.activo) {
      var k = limitar((t - dardo.t0) / dardo.dur, 0, 1), e = easeInOutExpo(k);
      dardo.x = mezclar(dardo.desde.x, dardo.hacia.x, e);
      dardo.y = mezclar(dardo.desde.y, dardo.hacia.y, e);
      dardo.s = mezclar(dardo.desde.s, dardo.hacia.s, e);
      empujeAlas = k > 0 && k < 1 ? Math.sin(Math.PI * k) : 0;
      if (k >= 1) {
        dardo.activo = false;
        if (Math.random() < 0.25) programarDardo(0.45, 0.9); // a veces, dos seguidos
        else programarDardo(2.6, 5.4);
      }
    } else if (entradaLista && t >= dardo.proximo) {
      if (avance < 0.08) lanzarDardo(); else programarDardo(1, 2);
    }
  }

  // Con el cursor lejos a un lado por un rato, se voltea a mirarlo.
  function mirarCursor(x) {
    if (!P.cursor || !puntero.activo || dardo.activo) { mirandoCursor = 0; return; }
    var dx = puntero.x - x, quiere = dx > 0 ? 1 : -1;
    if (Math.abs(dx) > 160 && quiere !== mirada.hacia) {
      if (!mirandoCursor) mirandoCursor = t;
      if (t - mirandoCursor > 0.9 && t - mirada.t0 > 1.2) { voltear(quiere); mirandoCursor = 0; }
    } else {
      mirandoCursor = 0;
    }
  }

  /* ---------- Cuadro a cuadro ---------- */

  function paso() {
    var ahora = w.performance.now() / 1000;
    var dt = Math.min(0.05, ahora - antes);
    antes = ahora;
    if (dt <= 0) return;
    t += dt;

    // Scroll: la curva y la profundidad.
    avance = suavizar(avance, avanceMeta, 7, dt);
    var e = easeInOutSine(avance), c = P.curva;
    var cx = bezier(c[0][0], c[1][0], c[2][0], e) * L.W;
    var cy = bezier(c[0][1], c[1][1], c[2][1], e) * L.H;
    var hondo = 1 + P.profundidad * e;
    despues = st ? Math.max(0, w.scrollY - (P.fijar ? st.end : st.start)) : 0;

    var v = vaiven();
    moverDardo();

    // Cursor: el colibrí lo sigue con retraso y dentro de un rango; el nombre y el fondo, menos.
    if (P.cursor) {
      amp.cursor = suavizar(amp.cursor, entradaLista ? 1 : 0, 1.5, dt);
      var mx = puntero.activo ? limitar((puntero.x - L.x) * 0.1, -P.cursor.x, P.cursor.x) : 0;
      var my = puntero.activo ? limitar((puntero.y - L.y) * 0.1, -P.cursor.y, P.cursor.y) : 0;
      cur.x = suavizar(cur.x, mx * amp.cursor, 1.6, dt);
      cur.y = suavizar(cur.y, my * amp.cursor, 1.6, dt);
      par.x = suavizar(par.x, puntero.activo ? puntero.x / L.W - 0.5 : 0, 3, dt);
      par.y = suavizar(par.y, puntero.activo ? puntero.y / L.H - 0.5 : 0, 3, dt);
    } else {
      cur.x = suavizar(cur.x, 0, 2, dt); cur.y = suavizar(cur.y, 0, 2, dt);
      par.x = suavizar(par.x, 0, 2, dt); par.y = suavizar(par.y, 0, 2, dt);
    }

    var x = L.x + entrada.x + v.x + dardo.x + cur.x + cx;
    var y = L.y + entrada.y + v.y + dardo.y + cur.y + cy;
    var s = entrada.s * dardo.s * hondo * v.s;

    // Velocidad: inclina el cuerpo hacia donde va y lo voltea si cambia de dirección.
    if (xPrev === null) xPrev = x;
    vx = suavizar(vx, (x - xPrev) / dt, 9, dt);
    xPrev = x;
    if (!bloqueoMirada) {
      var dir = vx > 0 ? 1 : -1;
      if (Math.abs(vx) > 240 && dir !== mirada.hacia && t - mirada.t0 > 0.5) voltear(dir);
      else mirarCursor(x);
    }
    var km = limitar((t - mirada.t0) / mirada.dur, 0, 1);
    mirada.valor = mezclar(mirada.desde, mirada.hacia, easeInOutCubic(km));
    giro = suavizar(giro, limitar(vx * 0.016, -13, 13) + v.r, 7, dt);

    // Aleteo: la secuencia se repite; en los dardos bate un poco más rápido.
    if (fotos) {
      pos += dt * CONFIG.fps * (1 + 0.2 * empujeAlas);
      var i = Math.floor(pos) % CONFIG.fotogramas;
      if (i !== cuadro) { cuadro = i; redibujar = true; }
    }
    if (redibujar) dibujar();

    var sx = mirada.valor * CONFIG.mirada * s;
    lienzo.style.transform = 'translate3d(' + (x - L.ancho / 2).toFixed(1) + 'px,' + (y - L.alto / 2).toFixed(1) + 'px,0) rotate(' +
      giro.toFixed(2) + 'deg) scale(' + sx.toFixed(4) + ',' + s.toFixed(4) + ')';

    // Paralaje: el nombre se mueve más lento que todo lo demás; el fondo, todavía menos.
    if (el.nombreIn) {
      el.nombreIn.style.transform = 'translate3d(' + (-par.x * 18).toFixed(1) + 'px,' +
        (-par.y * 10 - avance * 22 + despues * P.nombreLento).toFixed(1) + 'px,0)';
    }
    if (el.fondo) {
      el.fondo.style.transform = 'translate3d(' + (-par.x * 10).toFixed(1) + 'px,' +
        (-par.y * 6 + despues * 0.18).toFixed(1) + 'px,0) scale(1.05)';
    }
    if (P.textosSuben) {
      var sube = 'translate3d(0,' + (-avance * P.textosSuben).toFixed(1) + 'px,0)';
      el.suben.forEach(function (n) { n.style.transform = sube; });
    }
  }

  // Vuela siempre; solo descansa mientras la portada no se ve o la pestaña está oculta.
  function actualizar() {
    var debe = visible && enVuelo && !d.hidden;
    if (debe === corriendo) return;
    corriendo = debe;
    if (debe) {
      antes = w.performance.now() / 1000;
      gsap.ticker.add(paso);
      if (intro && !entradaLista) intro.resume();
    } else {
      gsap.ticker.remove(paso);
      if (intro) intro.pause();
    }
  }

  /* ---------- Entrada ---------- */

  // «Café Conexión» letra por letra, para que salga de detrás del colibrí.
  function partirNombre() {
    [].slice.call(el.nombre.querySelectorAll('.colibri__palabra')).forEach(function (p) {
      var texto = p.textContent;
      p.textContent = '';
      Array.from(texto).forEach(function (letra) {
        var s = d.createElement('span');
        s.className = 'colibri__letra';
        s.textContent = letra;
        p.appendChild(s);
      });
    });
    el.nombre.classList.add('partido');
    return [].slice.call(el.nombre.querySelectorAll('.colibri__letra'));
  }

  // Solo opacidad (no visibility): mientras entran, los lectores de pantalla ya los leen.
  function revelarTextos() {
    var tl = gsap.timeline();
    tl.to(el.textos, { opacity: 1, y: 0, duration: 0.64, ease: 'expo.out', stagger: 0.12 });
    if (el.tarjetas.length) tl.to(el.tarjetas, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.14 }, 0.2);
    return tl;
  }

  function revelarNombre() {
    var letras = partirNombre();
    var tl = gsap.timeline();
    tl.set(el.nombre, { autoAlpha: 1 });
    // Cada letra arranca en el colibrí y se abre hacia su lugar, del centro hacia afuera.
    tl.fromTo(letras, {
      x: function (i, n) {
        var r = hero.getBoundingClientRect(), b = n.getBoundingClientRect();
        return (L.x + entrada.x - (b.left - r.left + b.width / 2)) * 0.9;
      },
      y: function (i, n) {
        var r = hero.getBoundingClientRect(), b = n.getBoundingClientRect();
        return (L.y + entrada.y - (b.top - r.top + b.height / 2)) * 0.5;
      },
      scale: 0.3, opacity: 0, filter: 'blur(12px)'
    }, {
      x: 0, y: 0, scale: 1, opacity: 1, filter: 'blur(0px)',
      duration: 1.3, ease: 'expo.out', stagger: { each: 0.045, from: 'center' },
      immediateRender: false, clearProps: 'filter'
    });
    return tl;
  }

  function armarEntrada() {
    var derecha = L.W - L.x + L.ancho * 0.75; // fuera de la pantalla, a la derecha
    entrada.x = derecha; entrada.y = -L.H * 0.12; entrada.s = 0.86;
    mirada.valor = mirada.desde = mirada.hacia = -1; // entra mirando hacia donde vuela
    amp.vaiven = 0.3;
    bloqueoMirada = true;
    var pasa = -Math.min(L.W * 0.07, 110);

    var tl = gsap.timeline({ paused: true });
    tl.to(entrada, { x: pasa, duration: 1.5, ease: 'power3.out' }, 0)
      .to(entrada, { y: L.H * 0.035, duration: 1.5, ease: 'sine.inOut' }, 0)
      .to(entrada, { s: 1, duration: 1.4, ease: 'power2.out' }, 0)
      // Frena un poco más allá del centro, se da la vuelta y se devuelve.
      .call(function () { voltear(1); }, null, 1.22)
      .to(entrada, { x: 0, y: 0, duration: 1.0, ease: 'power2.inOut' }, 1.3)
      .to(amp, { vaiven: 1, duration: 1.4, ease: 'sine.inOut' }, 1.1)
      .add(revelarTextos(), 1.65)
      .add(revelarNombre(), 2.1)
      .call(function () {
        if (CONFIG.miradaFinal !== 1) voltear(CONFIG.miradaFinal);
      }, null, 2.35)
      .call(terminarEntrada, null, 2.7);
    return tl;
  }

  function terminarEntrada() {
    entradaLista = true;
    bloqueoMirada = false;
    programarDardo(1.6, 3.2);
  }

  // Sin entrada (el seguro del head ya mostró todo): el colibrí aparece en su lugar y sigue volando.
  function sinEntrada() {
    entrada.x = entrada.y = 0; entrada.s = 1;
    mirada.valor = mirada.desde = mirada.hacia = CONFIG.miradaFinal;
    amp.vaiven = 1;
    gsap.set(el.textos.concat(el.tarjetas), { opacity: 1, y: 0 });
    if (el.nombre) gsap.set(el.nombre, { autoAlpha: 1 });
    terminarEntrada();
  }

  function despegar() {
    if (enVuelo) return;
    enVuelo = true;
    hero.classList.add('en-vuelo');
    medir();
    antes = w.performance.now() / 1000 - 1 / 60;
    paso(); // lo deja en su lugar desde el primer cuadro
    cargarFotogramas();
    actualizar();
  }

  /* ---------- Scroll ---------- */

  function scroll() {
    gsap.matchMedia().add({ ancho: ES_ANCHO, alto: 'not all and ' + ES_ANCHO }, function (m) {
      P = m.conditions.ancho ? PERFILES.ancho : PERFILES.alto;
      avanceMeta = 0;
      st = ST.create({
        trigger: hero,
        start: 'top top',
        end: function () { return '+=' + Math.round(P.fijar ? w.innerHeight * P.largo : hero.offsetHeight * P.largo); },
        pin: P.fijar,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) { avanceMeta = self.progress; },
        onRefresh: medir
      });
      return function () { st = null; el.suben.forEach(function (n) { n.style.transform = ''; }); };
    });
  }

  /* ---------- Arranque ---------- */

  function cifras() {
    // Las cifras de las tarjetas salen de data/menu.js, igual que en la página del café.
    var M = w.CC_MENU;
    if (!M || !M.grupos) return;
    var cafe = M.grupos.filter(function (g) { return g.id === 'cafe'; })[0];
    if (!cafe) return;
    [].slice.call(hero.querySelectorAll('[data-colibri-cifra]')).forEach(function (n) {
      var s = cafe.secciones.filter(function (x) { return x.nombre === n.getAttribute('data-colibri-cifra'); })[0];
      if (s) n.textContent = s.items.length;
    });
  }

  function iniciar() {
    scroll();

    hero.addEventListener('pointermove', function (ev) {
      if (ev.pointerType === 'touch') return;
      var r = hero.getBoundingClientRect();
      puntero.x = ev.clientX - r.left;
      puntero.y = ev.clientY - r.top;
      puntero.activo = true;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { puntero.activo = false; });

    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; actualizar(); }).observe(hero);
    }
    d.addEventListener('visibilitychange', actualizar);
    if ('ResizeObserver' in w) new ResizeObserver(medir).observe(hero);
    w.addEventListener('load', function () { ST.refresh(); });

    var conEntrada = html.classList.contains('hc-motion') && !html.classList.contains('hc-seguro');
    medir();

    if (!conEntrada) {
      sinEntrada();
      despegar();
      return;
    }

    intro = armarEntrada();
    var empezar = function () {
      if (intro.isActive() || intro.progress() > 0) return;
      despegar();
      intro.play(0);
    };
    // Con la intro «Conexión» encima, el colibrí entra cuando la capa se abre (o al saltarla).
    if (html.classList.contains('intro') && !html.classList.contains('intro-saltada')) {
      var espera = gsap.delayedCall(Math.max(0, CONFIG.esperaIntro - w.performance.now() / 1000), empezar);
      new MutationObserver(function (m, obs) {
        if (html.classList.contains('intro-saltada')) { espera.kill(); obs.disconnect(); empezar(); }
      }).observe(html, { attributes: true, attributeFilter: ['class'] });
    } else {
      empezar();
    }
  }

  // Se arranca con el colibrí quieto y el cafetal ya cargados, para que no entre sobre un fondo
  // vacío. Si la conexión es lenta, a los 2,5 s arranca igual.
  function cargada(img) {
    return new Promise(function (ok) {
      if (!img) { ok(); return; }
      var lista = function () { if (img.decode) img.decode().then(ok, ok); else ok(); };
      if (img.complete && img.naturalWidth) lista();
      else {
        img.addEventListener('load', lista, { once: true });
        img.addEventListener('error', ok, { once: true });
      }
    });
  }
  Promise.race([
    Promise.all([cargada(el.poster), cargada(el.fondo && el.fondo.querySelector('img'))]),
    new Promise(function (ok) { setTimeout(ok, 2500); })
  ]).then(iniciar);
})();
