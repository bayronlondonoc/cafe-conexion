/* Café Conexión · la página del café
   Arma los dos cafés, los métodos con su guía, el mapa de sabor, las bebidas con su taza
   dibujada, el café frío y el café con licor. Datos: data/cafe.js (CC_CAFE) y data/menu.js
   (CC_MENU, de donde salen nombres, descripciones, fotos y precios). */

(function () {
  'use strict';

  var w = window, d = document, C = w.CC_CAFE, M = w.CC_MENU, CC = w.CC || {};
  if (!C || !M) return;

  var esc = CC.esc || function (s) { return String(s); };
  function $(id) { return d.getElementById(id); }
  function precio(it) { return (it.desde ? 'desde ' : '') + '$' + Number(it.precio).toLocaleString('es-CO'); }
  function seccion(grupo, nombre) {
    var g = M.grupos.filter(function (x) { return x.id === grupo; })[0];
    return g ? g.secciones.filter(function (s) { return s.nombre === nombre; })[0] : null;
  }
  function barra(etiqueta, valor) {
    return '<div><dt>' + etiqueta + '</dt><dd><span class="medidor" style="--v:' + valor + '" role="img" aria-label="' +
      valor + ' de 5"></span></dd></div>';
  }

  var espresso = seccion('cafe', 'Espresso y con leche');
  var metodos = seccion('cafe', 'Métodos manuales');
  var frio = seccion('frias', 'Café frío');
  var licor = seccion('bar', 'Café con licor');
  var sinCafe = C.licor_sin_cafe || [];
  var conLicor = licor ? licor.items.filter(function (it) { return sinCafe.indexOf(it.nombre) === -1; }) : [];

  /* Cifras de la portada: salen de los datos, no se escriben a mano. */
  var cifras = $('cafe-cifras');
  if (cifras) {
    var bebidas = [espresso, metodos, frio].reduce(function (n, s) { return n + (s ? s.items.length : 0); }, 0) + conLicor.length;
    cifras.innerHTML = [
      [C.cafes.length, C.cafes.length === 1 ? 'café colombiano' : 'cafés colombianos'],
      [metodos ? metodos.items.length : 0, 'métodos manuales'],
      [bebidas, 'bebidas con café']
    ].map(function (c) { return '<li><span class="cifra__numero">' + c[0] + '</span><span class="cifra__texto">' + c[1] + '</span></li>'; }).join('');
  }

  /* Los dos cafés, como etiquetas de bolsa. */
  var COLORES_NOTA = { chocolate: '#6B4028', panela: '#C98A3E', naranja: '#E8893A', 'frutos rojos': '#C0404D', miel: '#E3AE45', mandarina: '#F29B45', caramelo: '#C77E3A', floral: '#D98FB0', nuez: '#9A6B45', 'cítricos': '#E9C23B' };
  var cafes = $('cafes-lista');
  if (cafes) {
    cafes.innerHTML = C.cafes.map(function (c, i) {
      var datos = [['Origen', c.origen], ['Finca', c.finca], ['Variedad', c.variedad], ['Proceso', c.proceso], ['Altura', c.altura]]
        .filter(function (x) { return x[1]; })
        .map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('');
      var escala = '';
      for (var n = 1; n <= 5; n++) escala += '<span' + (n <= c.tueste_nivel ? ' class="lleno"' : '') + '></span>';
      return '<article class="etiqueta-cafe" data-reveal>' +
        '<header class="etiqueta-cafe__cabeza"><p class="etiqueta-cafe__numero">0' + (i + 1) + '</p>' +
        '<div><p class="etiqueta-cafe__uso">' + esc(c.uso) + '</p><h3 class="etiqueta-cafe__nombre">' + esc(c.nombre) + '</h3></div>' +
        (c.ejemplo ? '<span class="ejemplo">Datos de ejemplo</span>' : '') + '</header>' +
        '<p class="etiqueta-cafe__desc">' + esc(c.descripcion) + '</p>' +
        '<dl class="etiqueta-cafe__datos">' + datos + '</dl>' +
        '<div class="tueste"><span class="tueste__texto">Tueste <strong>' + esc(c.tueste) + '</strong></span>' +
        '<span class="tueste__escala" role="img" aria-label="Tueste ' + esc(c.tueste).toLowerCase() + ', ' + c.tueste_nivel + ' de 5">' + escala + '</span></div>' +
        '<p class="etiqueta-cafe__subtitulo">En la taza</p>' +
        '<ul class="notas" role="list">' + (c.notas || []).map(function (nota) {
          return '<li><span class="notas__punto" style="background:' + (COLORES_NOTA[nota.toLowerCase()] || 'var(--primario)') + '"></span>' + esc(nota) + '</li>';
        }).join('') + '</ul>' +
        '<dl class="perfil">' + barra('Acidez', c.perfil.acidez) + barra('Cuerpo', c.perfil.cuerpo) + barra('Dulzor', c.perfil.dulzor) + '</dl>' +
        '</article>';
    }).join('');
  }

  /* Los cinco métodos, con su guía y su perfil. */
  var guia = C.guia_metodos || {};
  var listaMetodos = $('metodos-cafe');
  if (listaMetodos && metodos) {
    listaMetodos.innerHTML = metodos.items.map(function (it) {
      var g = guia[it.nombre] || {};
      return '<article class="metodo-cafe" data-reveal>' +
        (it.foto ? '<img class="metodo-cafe__foto" src="' + esc(it.foto) + '" alt="' + esc(it.nombre) + '" width="760" height="570" loading="lazy" decoding="async">' : '') +
        '<div class="metodo-cafe__cuerpo"><div class="metodo-cafe__cab"><h3>' + esc(it.nombre) + '</h3>' +
        '<span class="metodo-cafe__precio">' + precio(it) + '</span></div>' +
        '<p class="metodo-cafe__desc">' + esc(it.descripcion) + '</p>' +
        (g.para ? '<p class="metodo-cafe__para">' + esc(g.para) + '</p>' : '') +
        '<dl class="ficha"><div><dt>Molienda</dt><dd>' + esc(g.molienda || '—') + '</dd></div>' +
        '<div><dt>Tiempo</dt><dd>' + esc(g.tiempo || '—') + '</dd></div>' +
        '<div><dt>Café : agua</dt><dd>' + esc(g.proporcion || '—') + '</dd></div></dl>' +
        (g.cuerpo ? '<dl class="perfil">' + barra('Cuerpo', g.cuerpo) + barra('Acidez', g.acidez) + '</dl>' : '') +
        '</div></article>';
    }).join('');
  }

  /* Mapa de sabor: cada método según su cuerpo y su acidez. */
  var mapa = $('mapa-sabor');
  if (mapa && metodos) {
    mapa.innerHTML = metodos.items.filter(function (it) { return guia[it.nombre]; }).map(function (it) {
      var g = guia[it.nombre];
      return '<li class="mapa-sabor__punto" style="--x:' + ((g.cuerpo - 1) / 4) + ';--y:' + ((g.acidez - 1) / 4) + '">' +
        '<span class="visually-hidden">' + esc(it.nombre) + ': cuerpo ' + g.cuerpo + ' de 5, acidez ' + g.acidez + ' de 5</span>' +
        '<span aria-hidden="true">' + esc(it.nombre) + '</span></li>';
    }).join('');
  }

  /* Espresso y con leche: cada bebida con su taza dibujada. */
  var NOMBRE_CAPA = { espresso: 'Espresso', agua: 'Agua', leche: 'Leche', espuma: 'Espuma', chocolate: 'Chocolate', almendras: 'Bebida de almendras' };
  var bebidasEsp = $('espresso-lista');
  if (bebidasEsp && espresso) {
    bebidasEsp.innerHTML = espresso.items.map(function (it) {
      var capas = (C.tazas || {})[it.nombre] || [];
      var descripcionTaza = capas.map(function (c) { return (NOMBRE_CAPA[c[0]] || c[0]) + ' ' + c[1] + ' %'; }).join(', ');
      return '<article class="bebida" data-reveal>' +
        (capas.length ? '<div class="taza" role="img" aria-label="' + esc(it.nombre) + ': ' + descripcionTaza + '"><div class="taza__vaso">' +
          capas.map(function (c) { return '<span class="capa capa--' + c[0] + '" style="--h:' + c[1] + '%"></span>'; }).join('') +
          '</div><span class="taza__asa"></span><span class="taza__plato"></span></div>' : '') +
        '<div class="bebida__cuerpo"><div class="bebida__cab"><h3>' + esc(it.nombre) + '</h3><span class="bebida__precio">' + precio(it) + '</span></div>' +
        '<p class="bebida__desc">' + esc(it.descripcion) + '</p>' +
        (capas.length ? '<ul class="leyenda" role="list">' + capas.map(function (c) {
          return '<li><span class="leyenda__muestra capa--' + c[0] + '"></span>' + (NOMBRE_CAPA[c[0]] || c[0]) + '</li>';
        }).join('') + '</ul>' : '') +
        '</div></article>';
    }).join('');
  }

  /* Café frío y café con licor: listas con precio. */
  function lista(id, items) {
    var el = $(id);
    if (!el || !items.length) return;
    el.innerHTML = items.map(function (it) {
      return '<li class="plato"><div class="plato__cab"><span class="plato__nombre">' + esc(it.nombre) + '</span>' +
        '<span class="plato__precio">' + precio(it) + '</span></div>' +
        (it.descripcion ? '<p class="plato__desc">' + esc(it.descripcion) + '</p>' : '') + '</li>';
    }).join('');
  }
  lista('frio-lista', frio ? frio.items : []);
  lista('licor-lista', conLicor);
  var legal = $('licor-legal');
  if (legal && M.notas_legales_bar) legal.innerHTML = M.notas_legales_bar.map(function (n) { return '<p>' + esc(n) + '</p>'; }).join('');

  /* Regiones: se marcan las que salen en el origen de nuestros cafés. */
  Array.prototype.forEach.call(d.querySelectorAll('[data-region]'), function (li) {
    var region = li.getAttribute('data-region').toLowerCase();
    var cafe = C.cafes.filter(function (c) { return String(c.origen || '').toLowerCase().indexOf(region) === 0; })[0];
    if (!cafe) return;
    li.classList.add('es-nuestra');
    li.insertAdjacentHTML('beforeend', '<span class="region__tag">De aquí viene el ' + esc(cafe.nombre.charAt(0).toLowerCase() + cafe.nombre.slice(1)) + '</span>');
  });

  /* Las tazas se llenan cuando entran en pantalla. */
  var tazas = d.querySelectorAll('.taza');
  if (!('IntersectionObserver' in w) || CC.reduce) {
    Array.prototype.forEach.call(tazas, function (t) { t.classList.add('llena'); });
  } else {
    var llenar = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        llenar.unobserve(e.target);
        e.target.classList.add('llena');
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(tazas, function (t) { llenar.observe(t); });
  }

  /* Navegación de la página: se marca la sección que se está leyendo. */
  var chips = Array.prototype.slice.call(d.querySelectorAll('.cafe-nav a[href^="#"]'));
  if (chips.length && 'IntersectionObserver' in w) {
    var fila = chips[0].closest('ul');
    var porId = {};
    chips.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var leer = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var a = porId[e.target.id];
        chips.forEach(function (x) { if (x !== a) x.removeAttribute('aria-current'); });
        a.setAttribute('aria-current', 'true');
        // En el celular la fila se desliza para que la sección actual quede a la vista.
        var li = a.parentNode;
        if (li.offsetLeft < fila.scrollLeft || li.offsetLeft + li.offsetWidth > fila.scrollLeft + fila.clientWidth) {
          fila.scrollTo({ left: li.offsetLeft - 16, behavior: CC.reduce ? 'auto' : 'smooth' });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(porId).forEach(function (id) { var s = $(id); if (s) leer.observe(s); });
  }

  /* Videos: se prenden solos cuando data/cafe.js trae la ruta. Sin movimiento reducido ni ahorro de datos. */
  var ahorro = w.navigator.connection && w.navigator.connection.saveData;
  Array.prototype.forEach.call(d.querySelectorAll('[data-video]'), function (ranura) {
    var src = (C.videos || {})[ranura.getAttribute('data-video')];
    if (!src || CC.reduce || ahorro) return;
    var v = d.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.preload = 'metadata';
    v.setAttribute('aria-hidden', 'true');
    v.src = src;
    ranura.appendChild(v);
    var intento = v.play();
    if (intento && intento.catch) intento.catch(function () {});
  });
})();
