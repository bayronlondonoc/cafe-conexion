/* Café Conexión · la carta y los favoritos
   Se arman solos con data/menu.js (window.CC_MENU): para cambiar un precio no se toca este archivo.
   Pestañas accesibles (flechas, Inicio/Fin) y enlaces directos: #menu-cafe, #menu-bar… */

(function () {
  'use strict';

  var w = window, d = document, M = w.CC_MENU, CC = w.CC || {};
  var pestanas = d.getElementById('carta-pestanas');
  var paneles = d.getElementById('carta-paneles');
  var seccion = d.getElementById('menu');
  if (!M || !M.grupos || !pestanas || !paneles) return;

  var esc = CC.esc || function (s) { return String(s); };
  var camara = CC.camara || '';
  function track(evento, datos) { if (CC.track) CC.track(evento, datos); }

  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function precio(it) {
    return (it.desde ? 'desde ' : '') + '$' + Number(it.precio).toLocaleString('es-CO');
  }

  var nota = d.getElementById('menu-nota');
  if (nota && M.nota_publica) nota.textContent = M.nota_publica;

  /* ---------- Pestañas y paneles ---------- */

  function platoHtml(it) {
    return '<li class="plato" id="plato-' + slug(it.nombre) + '">' +
      '<div class="plato__cab"><span class="plato__nombre">' + esc(it.nombre) +
      (it.destacado ? ' <span class="etiqueta">Favorito</span>' : '') + '</span>' +
      '<span class="plato__precio">' + precio(it) + '</span></div>' +
      (it.descripcion ? '<p class="plato__desc">' + esc(it.descripcion) + '</p>' : '') +
      '</li>';
  }

  function seccionHtml(s) {
    return '<div class="panel__seccion"><h3 class="panel__titulo">' + esc(s.nombre) + '</h3>' +
      (s.nota ? '<p class="panel__nota">' + esc(s.nota) + '</p>' : '') +
      '<ul class="platos" role="list">' + s.items.map(platoHtml).join('') + '</ul></div>';
  }

  function legalesHtml() {
    var notas = M.notas_legales_bar || [];
    return notas.length
      ? '<div class="panel__legal">' + notas.map(function (n) { return '<p>' + esc(n) + '</p>'; }).join('') + '</div>'
      : '';
  }

  M.grupos.forEach(function (g, i) {
    var tab = d.createElement('button');
    tab.type = 'button';
    tab.className = 'pestana';
    tab.id = 'pestana-' + g.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'menu-' + g.id);
    tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.setAttribute('data-grupo', g.id);
    tab.textContent = g.nombre;
    pestanas.appendChild(tab);

    var panel = d.createElement('div');
    panel.className = 'panel';
    panel.id = 'menu-' + g.id;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    panel.hidden = i !== 0;
    // Las leyendas de alcohol van al final de la pestaña Bar.
    panel.innerHTML = g.secciones.map(seccionHtml).join('') + (g.id === 'bar' ? legalesHtml() : '');
    paneles.appendChild(panel);
  });

  var tabs = Array.prototype.slice.call(pestanas.querySelectorAll('[role="tab"]'));

  function activar(id, opciones) {
    opciones = opciones || {};
    var elegida = null;
    tabs.forEach(function (t) {
      var si = t.getAttribute('data-grupo') === id;
      t.setAttribute('aria-selected', si ? 'true' : 'false');
      t.tabIndex = si ? 0 : -1;
      d.getElementById('menu-' + t.getAttribute('data-grupo')).hidden = !si;
      if (si) elegida = t;
    });
    if (!elegida) return false;
    if (opciones.foco) elegida.focus();
    // En el celular la fila de pestañas se desliza: la elegida queda a la vista.
    var izq = elegida.offsetLeft - pestanas.offsetLeft;
    if (izq < pestanas.scrollLeft || izq + elegida.offsetWidth > pestanas.scrollLeft + pestanas.clientWidth) {
      pestanas.scrollTo({ left: Math.max(0, izq - 16), behavior: CC.reduce ? 'auto' : 'smooth' });
    }
    if (!opciones.silencio) track('ver_pestana_menu', { grupo: id });
    return true;
  }

  pestanas.addEventListener('click', function (e) {
    var t = e.target.closest('[role="tab"]');
    if (t) activar(t.getAttribute('data-grupo'));
  });

  pestanas.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(d.activeElement);
    if (i < 0) return;
    var destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    activar(tabs[(destino + tabs.length) % tabs.length].getAttribute('data-grupo'), { foco: true });
  });

  /* ---------- Enlaces directos: #menu-cafe abre la pestaña Café ---------- */

  function irAlGrupo(id, plato) {
    if (!activar(id)) return false;
    var destino = plato ? d.getElementById('plato-' + plato) : null;
    (destino || seccion).scrollIntoView({ behavior: CC.reduce ? 'auto' : 'smooth', block: 'start' });
    if (destino) {
      destino.classList.remove('resaltado');
      void destino.offsetWidth; // reinicia la animación si se repite
      destino.classList.add('resaltado');
    }
    return true;
  }

  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#menu-"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(6);
    if (!d.getElementById('menu-' + id)) return;
    e.preventDefault();
    if (w.history && w.history.pushState) w.history.pushState(null, '', '#menu-' + id);
    irAlGrupo(id, a.getAttribute('data-plato'));
  });

  function desdeLaDireccion() {
    var m = /^#menu-([\w-]+)$/.exec(w.location.hash);
    if (m && d.getElementById('menu-' + m[1])) irAlGrupo(m[1]);
  }
  w.addEventListener('hashchange', desdeLaDireccion);
  desdeLaDireccion();

  /* ---------- Favoritos de la casa: los platos con "destacado": true ---------- */

  var lista = d.getElementById('favoritos-lista');
  if (lista) {
    var favoritos = [];
    M.grupos.forEach(function (g) {
      g.secciones.forEach(function (s) {
        s.items.forEach(function (it) { if (it.destacado) favoritos.push({ it: it, grupo: g.id }); });
      });
    });
    lista.innerHTML = favoritos.map(function (f) {
      var it = f.it;
      var foto = it.foto
        ? '<div class="favorito__foto"><img src="' + esc(it.foto) + '" alt="' + esc(it.foto_alt || it.nombre + ' en Café Conexión') + '" width="800" height="1000" loading="lazy" decoding="async"></div>'
        : '<figure class="favorito__foto ph pendiente" data-pendiente="foto de ' + esc(it.nombre) + '">' + camara +
          '<figcaption>' + esc(it.nombre) + ' · 45° o cenital · 4:5</figcaption></figure>';
      return '<li class="favorito" data-reveal>' + foto +
        '<div class="favorito__cuerpo"><h3 class="favorito__nombre">' + esc(it.nombre) + '</h3>' +
        (it.descripcion ? '<p class="favorito__desc">' + esc(it.descripcion) + '</p>' : '') +
        '<div class="favorito__pie"><span class="favorito__precio">' + precio(it) + '</span>' +
        '<a class="favorito__ir" href="#menu-' + f.grupo + '" data-plato="' + slug(it.nombre) + '">Ver ' +
        '<span class="visually-hidden">' + esc(it.nombre) + ' </span>en el menú</a></div></div></li>';
    }).join('');
  }
})();
