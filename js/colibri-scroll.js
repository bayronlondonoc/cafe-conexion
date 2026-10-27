/* Café Conexión · el colibrí que acompaña el scroll (celular)
   En el celular no hay cursor (ahí no está el colibrí que persigue el cacao, js/colibri-cacao.js),
   así que este colibrí pequeño acompaña a quien baja por la página:

   - Aparece al salir de la portada, entrando por el borde derecho.
   - Mientras se baja o se sube, lo sigue con un poco de retraso, inclinado hacia donde va.
   - Al parar, vuela junto al título más cercano y flota ahí un momento. Cada título lo visita
     solo la primera vez; después solo acompaña.
   - Si pasan unos segundos sin moverse, se aparta al borde y queda casi transparente. Quieto no
     anima nada, así que no gasta batería.
   - Lleva un granito de cacao en el pico (.cc-scroll__grano).

   Solo en pantallas táctiles sin mouse y sin «reducir movimiento». No tapa los toques
   (pointer-events: none). Usa la misma imagen de aleteo que js/colibri-cacao.js, al 80 %.
   En la carta se carga con data-base="../". */

(function () {
  'use strict';

  var w = window, d = document, html = d.documentElement;
  var script = d.currentScript;
  var base = (script && script.dataset.base) || '';

  if (!w.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  if (w.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ANCHO = 64, ALTO = 39.2, PICO = [48.8, 8]; // el colibrí y la punta del pico dentro de él
  var BORDE = 10;      // px entre la cola y el borde derecho
  var ARRIBA = 76;     // px libres arriba (el header)
  var ABAJO = 96;      // px libres abajo (la barra del celular)
  var QUIETO = 220;    // ms sin scroll para darlo por detenido
  var VISITA = 1400;   // ms que flota junto a un título
  var DORMIR = 2600;   // ms quieto antes de apartarse y quedar casi transparente
  var TITULOS = 'main h2, .seccion__titulo';
  var conMain = !!d.querySelector('script[src*="js/main.js"]'); // la carta no lo carga

  var estilo = d.createElement('style');
  estilo.textContent =
    '.cc-scroll{position:fixed;left:0;top:0;z-index:200;pointer-events:none;opacity:0;' +
      'transition:opacity .45s ease;will-change:transform}' +
    '.cc-scroll--visible{opacity:1}.cc-scroll--dormido{opacity:.28}' +
    '.cc-scroll__ave{position:absolute;left:0;top:0;width:' + ANCHO + 'px;height:' + ALTO + 'px;' +
      'transform-origin:' + PICO[0] + 'px ' + PICO[1] + 'px;' +
      'background:url("' + base + 'assets/colibri/persigue.webp") 0 0/' + ANCHO * 8 + 'px ' + ALTO * 6 + 'px no-repeat;' +
      'filter:drop-shadow(0 2px 3px rgb(0 0 0/.2))}' +
    '.cc-scroll__grano{position:absolute;left:' + (PICO[0] - 3) + 'px;top:' + (PICO[1] - 3) + 'px;width:8px;height:6px;' +
      'border-radius:50%;background:radial-gradient(circle at 35% 35%,#B5703F,#5A2B14 70%);' +
      'box-shadow:0 0 0 1px rgb(252 246 240/.7);transform:rotate(-12deg)}';
  d.head.appendChild(estilo);

  var el = d.createElement('div');
  el.className = 'cc-scroll';
  el.setAttribute('aria-hidden', 'true');
  var ave = d.createElement('div');
  ave.className = 'cc-scroll__ave';
  var grano = d.createElement('i');
  grano.className = 'cc-scroll__grano';
  ave.appendChild(grano);
  el.appendChild(ave);
  d.body.appendChild(el);

  // Estado. x en la pantalla; y en la página (así se queda atrás cuando se baja rápido).
  // p es la punta del pico; el cuerpo queda a su derecha porque mira hacia el contenido.
  var p = { x: 0, y: 0 }, v = { x: 0, y: 0 };
  var inclina = 0, t = 0, visible = false, dormido = false, andando = false;
  var modo = 'acompana', meta = null, finVisita = 0, ultimoScroll = 0, direccion = 1, antesY = w.scrollY;
  var visitados = [];

  function pasado() {
    return conMain ? html.classList.contains('pasado-hero') : w.scrollY > w.innerHeight * 0.6;
  }
  function borde() { return w.innerWidth - BORDE - PICO[0]; } // el cuerpo queda a la derecha del pico
  // Al bajar, el header se esconde (main.js → .cabecera-oculta) y deja libre la parte de arriba.
  function arriba() { return html.classList.contains('cabecera-oculta') ? 12 : ARRIBA; }
  function limitarY(yPantalla) { return Math.min(Math.max(yPantalla, arriba() + 12), w.innerHeight - ABAJO - 12); }

  // El título por visitar: el más cercano al centro, ya cómodo en la pantalla y no visitado.
  function tituloCercano() {
    var mejor = null, dist = Infinity, centro = w.innerHeight * 0.45;
    d.querySelectorAll(TITULOS).forEach(function (h) {
      if (visitados.indexOf(h) > -1) return;
      var r = d.createRange();
      r.selectNodeContents(h);
      var linea = r.getClientRects()[0];
      if (!linea || linea.width < 1) return;
      if (linea.top < arriba() + 24 || linea.bottom > w.innerHeight * 0.72) return;
      var dd = Math.abs(linea.top - centro);
      if (dd < dist) { dist = dd; mejor = { el: h, linea: linea }; }
    });
    return mejor;
  }

  // Junto al final de la primera línea del título; si no cabe a la derecha, encima de él.
  function puntoJunto(linea) {
    var x = linea.right + 18, y = linea.top + linea.height * 0.35;
    if (x + PICO[0] > w.innerWidth - BORDE) { x = borde(); y = linea.top - 16; }
    return { x: x, y: limitarY(y) + w.scrollY };
  }

  function despertar() {
    if (dormido) { dormido = false; el.classList.remove('cc-scroll--dormido'); }
    if (!andando) { andando = true; antes = performance.now(); w.requestAnimationFrame(cuadro); }
  }

  w.addEventListener('scroll', function () {
    var y = w.scrollY;
    if (Math.abs(y - antesY) > 2) direccion = y > antesY ? 1 : -1;
    antesY = y;
    ultimoScroll = performance.now();
    var debe = pasado();
    if (debe && !visible) { // entra volando por el borde derecho
      p.x = w.innerWidth + 30; p.y = y + w.innerHeight * 0.5; v.x = 0; v.y = 0;
    }
    if (debe !== visible) { visible = debe; el.classList.toggle('cc-scroll--visible', debe); }
    if (modo !== 'visita') modo = 'acompana';
    despertar();
  }, { passive: true });

  function suavizar(actual, objetivo, rapidez, dt) { return actual + (objetivo - actual) * (1 - Math.exp(-rapidez * dt)); }

  var antes = performance.now();
  function cuadro(ahora) {
    var dt = Math.min((ahora - antes) / 1000, 1 / 30);
    antes = ahora; t += dt;
    var quieto = ahora - ultimoScroll;

    if (visible) {
      if (modo === 'acompana') {
        // Va un poco adelante en la dirección del scroll, contra el borde derecho.
        meta = { x: borde(), y: w.scrollY + limitarY(w.innerHeight * (direccion > 0 ? 0.6 : 0.4)) };
        if (quieto > QUIETO) {
          var tit = tituloCercano();
          if (tit) { modo = 'visita'; meta = puntoJunto(tit.linea); finVisita = ahora + VISITA + 600; visitados.push(tit.el); }
          else modo = 'reposo';
        }
      } else if (modo === 'visita') {
        if (ahora > finVisita) modo = 'reposo';
      }
      if (modo === 'reposo') meta = { x: borde(), y: w.scrollY + limitarY(p.y - w.scrollY) };

      // Resorte: lo sigue con retraso; en la visita, un poco más ágil.
      var w0 = modo === 'visita' ? 7 : 5.5, z = 0.85, tope = 1100;
      v.x += (w0 * w0 * (meta.x - p.x) - 2 * z * w0 * v.x) * dt;
      v.y += (w0 * w0 * (meta.y - p.y) - 2 * z * w0 * v.y) * dt;
      var rapidez = Math.hypot(v.x, v.y);
      if (rapidez > tope) { v.x *= tope / rapidez; v.y *= tope / rapidez; }
      p.x += v.x * dt; p.y += v.y * dt;

      // Mira hacia el contenido (a la izquierda): pico abajo al bajar, arriba al subir.
      inclina = suavizar(inclina, -Math.max(-20, Math.min(20, v.y * 0.03)), 7, dt);
      var flota = rapidez < 60 ? Math.sin(t * Math.PI * 2 * 1.6) * 1.5 : 0;
      el.style.transform = 'translate(' + (p.x - PICO[0]).toFixed(1) + 'px,' + (p.y - w.scrollY + flota - PICO[1]).toFixed(1) + 'px)';
      ave.style.transform = 'rotate(' + inclina.toFixed(1) + 'deg) scaleX(-1)';
      var n = Math.floor(t * 24) % 48;
      ave.style.backgroundPosition = -(n % 8) * ANCHO + 'px ' + -Math.floor(n / 8) * ALTO + 'px';

      // Quieto un rato y ya en el borde: se aparta, queda casi transparente y deja de animar.
      if (modo === 'reposo' && quieto > DORMIR && rapidez < 4) {
        dormido = true;
        el.classList.add('cc-scroll--dormido');
        andando = false;
        return;
      }
    } else if (quieto > 600) {
      andando = false; // escondido y sin scroll: no hay nada que animar
      return;
    }
    w.requestAnimationFrame(cuadro);
  }
})();
