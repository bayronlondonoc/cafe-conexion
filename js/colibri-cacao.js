/* Café Conexión · el colibrí que persigue el cacao
   El cursor es una mazorca de cacao (styles.css → «Cursor») y este colibrí la persigue: la sigue
   con un poco de retraso, se voltea hacia ella y, cuando el mouse se queda quieto, flota a su lado.
   Al hacer clic sale disparado, la alcanza con el pico y suelta un destello.

   - Solo con mouse (en el celular no hay cursor) y sin «reducir movimiento».
   - No tapa nada: los clics pasan a través de él (pointer-events: none) y los enlaces abren de una.
   - En la portada del inicio (y durante la intro) se aparta y deja solo al colibrí grande.
   - Es el colibrí de la portada en pequeño: assets/colibri/persigue.webp tiene sus 48 fotogramas
     de aleteo en una sola imagen (8 × 6, de 160 × 98 px), que acá se muestran a la mitad.

   Un solo archivo: dibuja el colibrí y pone sus estilos. En la carta se carga con data-base="../"
   para que encuentre la imagen de la web. */

(function () {
  'use strict';

  var w = window, d = document;
  var script = d.currentScript;
  var base = (script && script.dataset.base) || '';

  if (!w.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (w.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // El cacao del cursor tiene la punta en el punto del clic y baja en diagonal: su centro queda
  // unos 12 px abajo a la derecha. Hacia ahí vuela el colibrí.
  var CENTRO_CACAO = 12;
  var REPOSO = 30;  // px entre el pico y el cacao mientras lo persigue
  var ALCANCE = 7;  // px entre el pico y el cacao cuando lo alcanza
  var ANCHO = 80, ALTO = 49, PICO = [61, 10]; // tamaño del colibrí y punta del pico dentro de él

  var estilo = d.createElement('style');
  estilo.textContent =
    '.cc-colibri{position:fixed;left:0;top:0;z-index:200;pointer-events:none;opacity:0;' +
      'transition:opacity .35s ease;will-change:transform}' +
    '.cc-colibri--visible{opacity:1}' +
    '.cc-colibri__ave{position:absolute;left:0;top:0;width:' + ANCHO + 'px;height:' + ALTO + 'px;' +
      'transform-origin:' + PICO[0] + 'px ' + PICO[1] + 'px;' +
      'background:url("' + base + 'assets/colibri/persigue.webp") 0 0/' + ANCHO * 8 + 'px ' + ALTO * 6 + 'px no-repeat;' +
      'filter:drop-shadow(0 3px 4px rgb(0 0 0/.18))}' +
    '.cc-destello{position:fixed;left:0;top:0;z-index:200;pointer-events:none}' +
    '.cc-destello i{position:absolute;left:-3.5px;top:-3.5px;width:7px;height:7px;border-radius:50%}' +
    '.cc-destello .cc-destello__anillo{left:-19px;top:-19px;width:38px;height:38px;border:2.5px solid #D9A54A;background:none;' +
      'box-shadow:0 0 0 1px rgb(62 33 19/.3),inset 0 0 0 1px rgb(62 33 19/.3)}';
  d.head.appendChild(estilo);

  var el = d.createElement('div');
  el.className = 'cc-colibri';
  el.setAttribute('aria-hidden', 'true');
  var ave = d.createElement('div');
  ave.className = 'cc-colibri__ave';
  el.appendChild(ave);
  d.body.appendChild(el);

  // Estado: p es la punta del pico; m, el punto del clic del cursor.
  var p = { x: -200, y: -200 }, v = { x: 0, y: 0 }, m = { x: 0, y: 0 };
  var mira = 1, giro = 1, inclina = 0;
  var visible = false, apartado = false, escribiendo = false, visto = false;
  var atrapa = 0, tAbajo = 0;

  function campoDeTexto(objetivo) {
    return !!objetivo.closest('textarea, [contenteditable=""], [contenteditable="true"], ' +
      'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"])');
  }
  function mostrar(si) {
    if (si === visible) return;
    visible = si;
    el.classList.toggle('cc-colibri--visible', si);
  }

  d.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || !e.target.closest) return;
    m.x = e.clientX; m.y = e.clientY;
    apartado = !!e.target.closest('[data-colibri], .capa-intro');
    escribiendo = campoDeTexto(e.target);
    // Si viene de estar escondido, entra volando desde un poco más allá en vez de aparecer encima.
    if (!visible && !apartado) {
      if (!visto || Math.hypot(p.x - m.x, p.y - m.y) > 400) {
        p.x = m.x - 140; p.y = m.y + 70; v.x = 0; v.y = 0;
      }
      visto = true;
    }
    mostrar(!apartado);
  }, { passive: true });

  d.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !visible) return;
    atrapa = 1;
    tAbajo = performance.now();
  }, true);

  function destello(x, y) {
    var dd = d.createElement('div');
    dd.className = 'cc-destello';
    dd.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    var anillo = d.createElement('i');
    anillo.className = 'cc-destello__anillo';
    dd.appendChild(anillo);
    // Dorado, cacao y crema: siempre hay uno que resalta, sobre fondo claro u oscuro.
    var colores = ['#D9A54A', '#74401F', '#F2D9A0'];
    for (var i = 0; i < 8; i++) {
      var punto = d.createElement('i');
      punto.style.background = colores[i % 3];
      dd.appendChild(punto);
      var ang = (i / 8) * Math.PI * 2 + 0.3, r = 20 + (i % 2) * 9;
      punto.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + Math.cos(ang) * r + 'px,' + Math.sin(ang) * r + 'px) scale(.4)', opacity: 0 }
      ], { duration: 560, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    }
    anillo.animate([
      { transform: 'scale(.2)', opacity: 1 },
      { transform: 'scale(1.4)', opacity: 0 }
    ], { duration: 520, easing: 'ease-out', fill: 'forwards' });
    d.body.appendChild(dd);
    setTimeout(function () { dd.remove(); }, 620);
  }

  function limitar(n, a, b) { return n < a ? a : n > b ? b : n; }
  function suavizar(actual, meta, rapidez, dt) { return actual + (meta - actual) * (1 - Math.exp(-rapidez * dt)); }

  var antes = performance.now(), t = 0;
  function cuadro(ahora) {
    var dt = Math.min((ahora - antes) / 1000, 1 / 30);
    antes = ahora; t += dt;

    if (visto) {
      // Hacia dónde vuela: al lado del cacao, del lado por donde viene y casi a la misma altura,
      // como un colibrí frente a una flor. Al escribir se queda más lejos de la barra de texto.
      var c = escribiendo ? { x: m.x, y: m.y } : { x: m.x + CENTRO_CACAO, y: m.y + CENTRO_CACAO };
      var dx = p.x - c.x, dy = (p.y - c.y) * 0.45, largo = Math.hypot(dx, dy) || 1;
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) { dx = -mira; dy = 0; largo = 1; }
      var r = atrapa ? ALCANCE : escribiendo ? REPOSO + 16 : REPOSO;
      var meta = { x: c.x + dx / largo * r, y: c.y + dy / largo * r };

      // Resorte: más rápido y más fuerte cuando sale a atraparlo.
      var w0 = atrapa ? 30 : 7.5, z = 0.9, tope = atrapa ? 3200 : 1500;
      v.x += (w0 * w0 * (meta.x - p.x) - 2 * z * w0 * v.x) * dt;
      v.y += (w0 * w0 * (meta.y - p.y) - 2 * z * w0 * v.y) * dt;
      var rapidez = Math.hypot(v.x, v.y);
      if (rapidez > tope) { v.x *= tope / rapidez; v.y *= tope / rapidez; }
      p.x += v.x * dt; p.y += v.y * dt;

      if (atrapa && (Math.hypot(meta.x - p.x, meta.y - p.y) < 4 || performance.now() - tAbajo > 260)) {
        atrapa = 0;
        destello(p.x, p.y);
        v.x += (p.x - c.x > 0 ? 1 : -1) * 260; v.y -= 60; // rebota un poco hacia atrás
      }

      // Mira siempre al cacao; al cambiar de lado se da la vuelta (giro pasa por 0).
      var lado = c.x - p.x;
      if (lado > 4) mira = 1; else if (lado < -4) mira = -1;
      giro = suavizar(giro, mira, 16, dt);
      inclina = suavizar(inclina, limitar(v.y * 0.02, -16, 16) * mira, 8, dt);
      var flota = rapidez < 80 ? Math.sin(t * Math.PI * 2 * 1.7) * 1.6 : 0;

      el.style.transform = 'translate(' + (p.x - PICO[0]).toFixed(1) + 'px,' + (p.y + flota - PICO[1]).toFixed(1) + 'px)';
      ave.style.transform = 'rotate(' + inclina.toFixed(1) + 'deg) scaleX(' + (Math.abs(giro) < 0.08 ? 0.08 * mira : giro).toFixed(2) + ')';
      var n = Math.floor(t * 24) % 48;
      ave.style.backgroundPosition = -(n % 8) * ANCHO + 'px ' + -Math.floor(n / 8) * ALTO + 'px';
    }
    if (!d.hidden) w.requestAnimationFrame(cuadro);
  }
  d.addEventListener('visibilitychange', function () {
    if (!d.hidden) { antes = performance.now(); w.requestAnimationFrame(cuadro); }
  });
  w.requestAnimationFrame(cuadro);
})();
