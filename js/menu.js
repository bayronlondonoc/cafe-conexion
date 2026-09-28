/* Café Conexión · la carta en el inicio
   Los métodos manuales, los favoritos y la barra salen de data/menu.js (window.CC_MENU).
   La carta completa vive en su propia página: negocio.menu_url en data/site.js. */

(function () {
  'use strict';

  var w = window, d = document, M = w.CC_MENU, CC = w.CC || {};
  if (!M || !M.grupos) return;

  var esc = CC.esc || function (s) { return String(s); };

  function precio(it) {
    return (it.desde ? 'desde ' : '') + '$' + Number(it.precio).toLocaleString('es-CO');
  }
  function seccion(grupo, nombre) {
    var g = M.grupos.filter(function (x) { return x.id === grupo; })[0];
    return g ? g.secciones.filter(function (s) { return s.nombre === nombre; })[0] : null;
  }
  function foto(it, clase) {
    return it.foto
      ? '<img class="' + clase + '" src="' + esc(it.foto) + '" alt="' + esc(it.foto_alt || it.nombre) + '" width="760" height="570" loading="lazy" decoding="async">'
      : '<figure class="' + clase + ' ph pendiente" data-pendiente="foto de ' + esc(it.nombre) + '">' + (CC.camara || '') +
        '<figcaption>' + esc(it.nombre) + '</figcaption></figure>';
  }
  function plato(it) {
    return '<li class="plato"><div class="plato__cab"><span class="plato__nombre">' + esc(it.nombre) + '</span>' +
      '<span class="plato__precio">' + precio(it) + '</span></div>' +
      (it.descripcion ? '<p class="plato__desc">' + esc(it.descripcion) + '</p>' : '') + '</li>';
  }

  /* El café: los cinco métodos manuales */
  var metodos = d.getElementById('metodos-lista'), sm = seccion('cafe', 'Métodos manuales');
  if (metodos && sm) {
    metodos.innerHTML = sm.items.map(function (it) {
      return '<li class="metodo" data-reveal>' + foto(it, 'metodo__foto') +
        '<div class="metodo__cuerpo"><h3 class="metodo__nombre">' + esc(it.nombre) + '</h3>' +
        '<p class="metodo__desc">' + esc(it.descripcion) + '</p>' +
        '<p class="metodo__precio">' + precio(it) + (sm.nota ? ' · ' + esc(sm.nota.toLowerCase()) : '') + '</p></div></li>';
    }).join('');
  }

  /* Favoritos de la casa: los platos con "destacado": true */
  var favoritos = d.getElementById('favoritos-lista');
  if (favoritos) {
    var lista = [];
    M.grupos.forEach(function (g) {
      g.secciones.forEach(function (s) {
        s.items.forEach(function (it) { if (it.destacado) lista.push(it); });
      });
    });
    favoritos.innerHTML = lista.map(function (it) {
      return '<li class="favorito" data-reveal>' + foto(it, 'favorito__foto') +
        '<div class="favorito__cuerpo"><h3 class="favorito__nombre">' + esc(it.nombre) + '</h3>' +
        (it.descripcion ? '<p class="favorito__desc">' + esc(it.descripcion) + '</p>' : '') +
        '<p class="favorito__precio">' + precio(it) + '</p></div></li>';
    }).join('');
  }

  /* La barra: cócteles y café con licor, con las leyendas legales */
  var barra = d.getElementById('barra-listas');
  if (barra) {
    barra.innerHTML = ['Cócteles', 'Café con licor'].map(function (nombre) {
      var s = seccion('bar', nombre);
      return s
        ? '<div class="barra__lista"><h3 class="barra__titulo">' + esc(s.nombre) + '</h3><ul class="platos" role="list">' +
          s.items.map(plato).join('') + '</ul></div>'
        : '';
    }).join('');
  }
  var legal = d.getElementById('barra-legal');
  if (legal && M.notas_legales_bar) {
    legal.innerHTML = M.notas_legales_bar.map(function (n) { return '<p>' + esc(n) + '</p>'; }).join('');
  }
})();
