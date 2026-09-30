/* Café Conexión · la página Fit
   Arma las tarjetas de «Para tomar» y «Para comer» y la lista de combos a partir de
   data/fit.js (CC_FIT). Los combos calculan el precio por separado y el ahorro. */

(function () {
  'use strict';

  var w = window, d = document, F = w.CC_FIT, CC = w.CC || {};
  if (!F) return;

  var esc = CC.esc || function (s) { return String(s); };
  function precio(n) { return '$' + Number(n).toLocaleString('es-CO'); }
  function icono(id) { return '<svg class="icono" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }

  var porId = {};
  F.productos.forEach(function (p) { porId[p.id] = p; });

  function tarjeta(p) {
    var sabores = p.sabores || [], atributos = p.atributos || [];
    return '<article class="fit-producto" data-reveal>' +
      (p.foto ? '<img class="fit-producto__foto" src="' + esc(p.foto) + '" alt="' + esc(p.alt || p.nombre) + '" width="960" height="720" loading="lazy" decoding="async">' : '') +
      '<div class="fit-producto__cuerpo">' +
      '<h3 class="fit-producto__nombre">' + esc(p.nombre) + '</h3>' +
      (p.descripcion ? '<p class="fit-producto__desc">' + esc(p.descripcion) + '</p>' : '') +
      (atributos.length ? '<ul class="fit-sellos" role="list">' + atributos.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' : '') +
      (sabores.length ? '<p class="fit-producto__etiqueta">Sabores</p><ul class="fit-sabores" role="list">' + sabores.map(function (s) {
        return '<li><span class="fit-sabores__punto" style="background:' + esc(s.color || 'var(--primario)') + '"></span>' + esc(s.nombre) + '</li>';
      }).join('') + '</ul>' : '') +
      '<div class="fit-producto__pie">' +
      (p.nota ? '<p class="fit-producto__nota">' + esc(p.nota) + '</p>' : '') +
      '<p class="precio-fit">' + precio(p.precio) + (sabores.length > 1 ? '<small>cualquier sabor</small>' : '') + '</p>' +
      '</div></div></article>';
  }

  [['fit-tomar', 'tomar'], ['fit-comer', 'comer']].forEach(function (g) {
    var el = d.getElementById(g[0]);
    if (el) el.innerHTML = F.productos.filter(function (p) { return p.grupo === g[1]; }).map(tarjeta).join('');
  });

  var combos = d.getElementById('fit-combos');
  if (combos) {
    combos.innerHTML = (F.combos || []).map(function (c) {
      var partes = c.incluye.map(function (id) { return porId[id]; }).filter(Boolean);
      var separado = partes.reduce(function (s, p) { return s + p.precio; }, 0);
      var ahorro = partes.length === c.incluye.length ? separado - c.precio : 0;
      return '<li class="combo" data-reveal><div class="combo__texto">' +
        '<span class="combo__iconos" aria-hidden="true">' + partes.map(function (p) { return icono(p.tipo === 'waffle' ? 'waffle' : 'vaso'); }).join('<span class="combo__mas">+</span>') + '</span>' +
        '<p class="combo__nombre">' + partes.map(function (p) { return esc(p.corto || p.nombre); }).join(' + ') + '</p>' +
        (ahorro > 0 ? '<p class="combo__detalle">Por separado <s>' + precio(separado) + '</s></p>' : '') +
        '</div><div class="combo__precio"><strong>' + precio(c.precio) + '</strong>' +
        (ahorro > 0 ? '<span class="combo__ahorro">Ahorras ' + precio(ahorro) + '</span>' : '') +
        '</div></li>';
    }).join('');
  }
})();
