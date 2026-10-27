/* Café Conexión · el colibrí del celular
   En el celular no hay cursor (ahí no está el colibrí que persigue el cacao, js/colibri-cacao.js),
   así que este colibrí pequeño acompaña a quien baja por la página y se deja «cazar»:

   - Aparece al salir de la portada, entrando por el borde derecho.
   - Mientras se baja o se sube, lo sigue con un poco de retraso, inclinado hacia donde va. Al
     parar visita el título más cercano (cada uno solo la primera vez).
   - Si lo tocan, sale disparado en zigzag a la esquina contraria, aleteando más rápido y soltando
     unas plumitas (en Android, además, una vibración corta). Allá se queda escondido mientras se
     baja; al rato, con el siguiente scroll, vuelve a acompañar.
   - Si tocan cerca de él, lo esquiva con un saltito. Si lo tocan 3 veces seguidas, antes de
     escapar da una voltereta en el aire.
   - Quieto unos segundos, queda casi transparente y deja de animar (no gasta batería). Así no
     recibe toques, pero si lo tocan igual se despierta asustado y huye.

   Despierto, el toque es del colibrí y no de lo que hay debajo: nadie abre un enlace por
   accidente al intentar tocarlo. Solo en pantallas táctiles y sin «reducir movimiento». Usa la
   misma imagen de aleteo que js/colibri-cacao.js, al 80 %. En la carta se carga con data-base="../". */

(function () {
  'use strict';

  var w = window, d = document, html = d.documentElement;
  var script = d.currentScript;
  var base = (script && script.dataset.base) || '';

  if (!w.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
  if (w.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ANCHO = 64, ALTO = 39.2;     // el colibrí; se mueve y gira desde su centro
  var PICO = [16.8, -11.6];        // la punta del pico respecto al centro, mirando a la derecha
  var BORDE = 10;                  // px entre el colibrí y el borde de la pantalla
  var ARRIBA = 76;                 // px libres arriba (el header)
  var ABAJO = 96;                  // px libres abajo (la barra del celular)
  var QUIETO = 220;                // ms sin scroll para darlo por detenido
  var VISITA = 1400;               // ms que flota junto a un título
  var DORMIR = 3200;               // ms sin nada antes de quedar casi transparente
  var ESCONDIDO = 2500;            // ms mínimos en la esquina antes de volver
  var CERCA = 90;                  // px: un toque a esta distancia lo hace esquivar
  var TITULOS = 'main h2, .seccion__titulo';
  var conMain = !!d.querySelector('script[src*="js/main.js"]'); // la carta no lo carga

  var estilo = d.createElement('style');
  estilo.textContent =
    '.cc-scroll{position:fixed;left:0;top:0;z-index:200;pointer-events:none;opacity:0;' +
      'transition:opacity .45s ease;will-change:transform}' +
    '.cc-scroll--visible{opacity:1}.cc-scroll--dormido{opacity:.28}' +
    '.cc-scroll__ave{position:absolute;left:0;top:0;width:' + ANCHO + 'px;height:' + ALTO + 'px;' +
      'background:url("' + base + 'assets/colibri/persigue.webp") 0 0/' + ANCHO * 8 + 'px ' + ALTO * 6 + 'px no-repeat;' +
      'filter:drop-shadow(0 2px 3px rgb(0 0 0/.2));pointer-events:none;-webkit-tap-highlight-color:transparent}' +
    '.cc-scroll--visible:not(.cc-scroll--dormido) .cc-scroll__ave{pointer-events:auto}' +
    '.cc-pluma{position:fixed;left:0;top:0;z-index:200;pointer-events:none;width:9px;height:4px;border-radius:50%}';
  d.head.appendChild(estilo);

  var el = d.createElement('div');
  el.className = 'cc-scroll';
  el.setAttribute('aria-hidden', 'true');
  var ave = d.createElement('div');
  ave.className = 'cc-scroll__ave';
  el.appendChild(ave);
  d.body.appendChild(el);

  // Estado. p es el centro del colibrí: x en la pantalla, y en la página (así se queda atrás
  // cuando se baja rápido). lado: 1 vive a la derecha, -1 a la izquierda. mira: hacia dónde.
  var p = { x: 0, y: 0 }, v = { x: 0, y: 0 };
  var lado = 1, mira = -1, giro = -1, inclina = 0, fase = 0, t = 0;
  var visible = false, dormido = false, andando = false;
  var modo = 'acompana', meta = null, ruta = [], rincon = 0;
  var finVisita = 0, tEscondido = 0, rapidoHasta = 0, ultimoScroll = 0, ultimoToque = 0;
  var direccion = 1, antesY = w.scrollY, visitados = [], toques = [];
  var vuelta = 0, vueltaDesde = 0; // la voltereta: 0 sin voltereta; si no, cuándo empezó

  function pasado() {
    return conMain ? html.classList.contains('pasado-hero') : w.scrollY > w.innerHeight * 0.6;
  }
  function bordeX(l) { return l > 0 ? w.innerWidth - BORDE - ANCHO / 2 : BORDE + ANCHO / 2; }
  // Al bajar, el header se esconde (main.js → .cabecera-oculta) y deja libre la parte de arriba.
  function arriba() { return html.classList.contains('cabecera-oculta') ? 12 : ARRIBA; }
  function limitarY(yPantalla) { return Math.min(Math.max(yPantalla, arriba() + 26), w.innerHeight - ABAJO - 26); }

  // El título por visitar: el más cercano al centro, ya cómodo en la pantalla y no visitado.
  function tituloCercano() {
    var mejor = null, dist = Infinity, centro = w.innerHeight * 0.45;
    d.querySelectorAll(TITULOS).forEach(function (h) {
      if (visitados.indexOf(h) > -1) return;
      var r = d.createRange();
      r.selectNodeContents(h);
      var linea = r.getClientRects()[0];
      if (!linea || linea.width < 1) return;
      if (linea.top < arriba() + 30 || linea.bottom > w.innerHeight * 0.72) return;
      var dd = Math.abs(linea.top - centro);
      if (dd < dist) { dist = dd; mejor = { el: h, linea: linea }; }
    });
    return mejor;
  }

  // Mirando hacia el título, con el pico junto al final de su primera línea; si no cabe a la
  // derecha, encima del final de la línea.
  function puntoJunto(linea) {
    var x = linea.right + 18 + PICO[0], y = linea.top + linea.height * 0.35 - PICO[1];
    if (x + ANCHO / 2 > w.innerWidth - BORDE) { x = bordeX(1); y = linea.top - 22; }
    return { x: x, y: limitarY(y) + w.scrollY };
  }

  function despertar() {
    if (dormido) { dormido = false; el.classList.remove('cc-scroll--dormido'); }
    if (!andando) { andando = true; antes = performance.now(); w.requestAnimationFrame(cuadro); }
  }

  // Huye a la esquina contraria (de lado y de altura), con dos quiebres en el camino.
  function huir() {
    var ahora = performance.now(), vh = w.innerHeight, yPant = p.y - w.scrollY;
    var nuevo = p.x > w.innerWidth / 2 ? -1 : 1;
    var destino = { x: bordeX(nuevo), y: yPant < vh / 2 ? vh - ABAJO - 40 : arriba() + 40 };
    var dx = destino.x - p.x, dy = destino.y - yPant, largo = Math.hypot(dx, dy) || 1;
    var nx = -dy / largo * 50, ny = dx / largo * 50;
    var dentro = function (x) { return Math.min(Math.max(x, bordeX(-1)), bordeX(1)); };
    ruta = [
      { x: dentro(p.x + dx * 0.35 + nx), y: limitarY(yPant + dy * 0.35 + ny) },
      { x: dentro(p.x + dx * 0.7 - nx), y: limitarY(yPant + dy * 0.7 - ny) },
      destino
    ];
    lado = nuevo;
    modo = 'huye';
    rapidoHasta = ahora + 900;
    ultimoToque = ahora;
    despertar();
  }

  function plumitas(x, y) {
    var colores = ['#7E9B5A', '#C9D3B4', '#E9E2D6', '#A33C3C'];
    for (var i = 0; i < 5; i++) {
      var pl = d.createElement('i');
      pl.className = 'cc-pluma';
      pl.style.background = colores[i % 4];
      d.body.appendChild(pl);
      var ang = Math.PI * (0.15 + 0.7 * Math.random()) + (i % 2 ? 0 : Math.PI), r = 18 + Math.random() * 18;
      pl.animate([
        { transform: 'translate(' + x + 'px,' + y + 'px) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + (x + Math.cos(ang) * r) + 'px,' + (y + Math.abs(Math.sin(ang)) * r + 26) + 'px) rotate(' +
          (200 + Math.random() * 300) + 'deg)', opacity: 0 }
      ], { duration: 750 + Math.random() * 250, easing: 'cubic-bezier(.25,.6,.4,1)', fill: 'forwards' })
        .onfinish = (function (x) { return function () { x.remove(); }; })(pl);
    }
  }

  // Lo tocaron: plumitas, vibración corta (Android) y a escapar. Al tercer toque seguido, voltereta.
  function tocado() {
    var ahora = performance.now();
    toques = toques.filter(function (t0) { return ahora - t0 < 4000; });
    toques.push(ahora);
    if (toques.length >= 3) { vuelta = 1; vueltaDesde = ahora; toques = []; }
    plumitas(p.x, p.y - w.scrollY);
    if (navigator.vibrate) navigator.vibrate(12);
    huir();
  }

  ave.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    tocado();
  });

  // Toques en el resto de la pantalla: cerca de él, lo esquiva; si estaba dormido y lo tocan
  // (dormido no recibe toques), se despierta asustado.
  d.addEventListener('pointerdown', function (e) {
    if (!visible || e.target === ave || e.pointerType === 'mouse') return;
    var dx = p.x - e.clientX, dy = p.y - w.scrollY - e.clientY, dist = Math.hypot(dx, dy) || 1;
    if (dormido && dist < ANCHO / 2 + 8) { tocado(); return; }
    if (dist < CERCA && modo !== 'huye') {
      v.x += dx / dist * 650; v.y += dy / dist * 650;
      rapidoHasta = performance.now() + 450;
      ultimoToque = performance.now();
      despertar();
    }
  }, { capture: true, passive: true });

  w.addEventListener('scroll', function () {
    var y = w.scrollY, ahora = performance.now();
    if (Math.abs(y - antesY) > 2) direccion = y > antesY ? 1 : -1;
    antesY = y;
    ultimoScroll = ahora;
    var debe = pasado();
    if (debe && !visible) { // entra volando por el borde derecho
      lado = 1; modo = 'acompana';
      p.x = w.innerWidth + 40; p.y = y + w.innerHeight * 0.5; v.x = 0; v.y = 0;
    }
    if (debe !== visible) { visible = debe; el.classList.toggle('cc-scroll--visible', debe); }
    // Escondido en la esquina: después de un rato, el siguiente scroll lo trae de vuelta.
    if (modo === 'escondido' && ahora - tEscondido > ESCONDIDO) { lado = 1; modo = 'acompana'; }
    else if (modo === 'reposo') modo = 'acompana';
    despertar();
  }, { passive: true });

  function suavizar(actual, objetivo, rapidez, dt) { return actual + (objetivo - actual) * (1 - Math.exp(-rapidez * dt)); }

  var antes = performance.now();
  function cuadro(ahora) {
    var dt = Math.min((ahora - antes) / 1000, 1 / 30);
    antes = ahora; t += dt;
    var quieto = ahora - Math.max(ultimoScroll, ultimoToque);

    if (visible) {
      if (modo === 'acompana') {
        // Va un poco adelante en la dirección del scroll, contra su borde.
        meta = { x: bordeX(lado), y: w.scrollY + limitarY(w.innerHeight * (direccion > 0 ? 0.6 : 0.4)) };
        if (quieto > QUIETO && Math.abs(p.x - bordeX(lado)) < 30) {
          var tit = lado > 0 && tituloCercano();
          if (tit) { modo = 'visita'; meta = puntoJunto(tit.linea); finVisita = ahora + VISITA + 600; visitados.push(tit.el); }
          else modo = 'reposo';
        }
      } else if (modo === 'visita') {
        if (ahora > finVisita) modo = 'reposo';
      } else if (modo === 'huye') {
        meta = { x: ruta[0].x, y: w.scrollY + ruta[0].y };
        if (Math.hypot(meta.x - p.x, meta.y - p.y) < 26) {
          ruta.shift();
          if (!ruta.length) { modo = 'escondido'; tEscondido = ahora; rincon = meta.y - w.scrollY; }
        }
      }
      if (modo === 'escondido') meta = { x: bordeX(lado), y: w.scrollY + rincon };
      if (modo === 'reposo') meta = { x: bordeX(lado), y: w.scrollY + limitarY(p.y - w.scrollY) };

      // Resorte: lo sigue con retraso; huyendo, rapidísimo.
      var huye = modo === 'huye';
      var w0 = huye ? 15 : modo === 'visita' ? 7 : 5.5, z = huye ? 0.7 : 0.85, tope = huye ? 2400 : 1100;
      v.x += (w0 * w0 * (meta.x - p.x) - 2 * z * w0 * v.x) * dt;
      v.y += (w0 * w0 * (meta.y - p.y) - 2 * z * w0 * v.y) * dt;
      var rapidez = Math.hypot(v.x, v.y);
      if (rapidez > tope) { v.x *= tope / rapidez; v.y *= tope / rapidez; }
      p.x += v.x * dt; p.y += v.y * dt;

      // Mira hacia donde vuela; quieto, hacia el contenido. Pico abajo al bajar, arriba al subir.
      if (Math.abs(v.x) > 150) mira = v.x > 0 ? 1 : -1; else if (!huye) mira = -lado;
      giro = suavizar(giro, mira, 14, dt);
      inclina = suavizar(inclina, Math.max(-22, Math.min(22, v.y * 0.03)) * mira, 7, dt);
      var extra = 0;
      if (vuelta) {
        var u = Math.min(1, (ahora - vueltaDesde) / 650);
        extra = -360 * (1 - Math.pow(1 - u, 3)) * mira;
        if (u >= 1) vuelta = 0;
      }
      var flota = rapidez < 60 ? Math.sin(t * Math.PI * 2 * 1.6) * 1.5 : 0;
      el.style.transform = 'translate(' + (p.x - ANCHO / 2).toFixed(1) + 'px,' + (p.y - w.scrollY + flota - ALTO / 2).toFixed(1) + 'px)';
      ave.style.transform = 'rotate(' + (inclina + extra).toFixed(1) + 'deg) scaleX(' + (Math.abs(giro) < 0.08 ? 0.08 * mira : giro).toFixed(2) + ')';
      fase += dt * (ahora < rapidoHasta ? 48 : 24); // asustado, aletea al doble
      var n = Math.floor(fase) % 48;
      ave.style.backgroundPosition = -(n % 8) * ANCHO + 'px ' + -Math.floor(n / 8) * ALTO + 'px';

      // Quieto un rato: queda casi transparente y deja de animar.
      if ((modo === 'reposo' || modo === 'escondido') && quieto > DORMIR && rapidez < 4 && !vuelta) {
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
