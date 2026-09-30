/* Café Conexión · comportamiento de la página
   Intro, animaciones al bajar, header, menú del celular, abierto/cerrado, WhatsApp, mapa,
   JSON-LD y medición.
   Los datos salen de data/site.js (window.CC_SITE). Si falta un dato, el bloque queda
   marcado como pendiente: se ve en modo preview y se oculta en producción. */

(function () {
  'use strict';

  var w = window, d = document, html = d.documentElement;
  var SITE = w.CC_SITE || {};
  var N = SITE.negocio || {};
  var CC = w.CC = w.CC || {};

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function listo(el) {
    if (!el) return;
    el.classList.remove('pendiente');
    el.removeAttribute('data-pendiente');
  }

  CC.esc = esc;
  CC.listo = listo;
  CC.plantilla = plantilla; // js/talleres.js arma con esto el mensaje de reserva
  CC.reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  CC.camara = '<svg class="ph__icono" aria-hidden="true"><use href="#i-camara"/></svg>';

  /* ---------- Medición ----------
     Envía a Vercel Web Analytics o a GA4 si alguno está puesto. Si no hay ninguno, no hace nada. */
  CC.track = function (evento, datos) {
    try {
      if (typeof w.va === 'function') w.va('event', { name: evento, data: datos || {} });
      else if (typeof w.gtag === 'function') w.gtag('event', evento, datos || {});
    } catch (e) { /* la medición nunca rompe la página */ }
  };

  /* ---------- WhatsApp y «Cómo llegar» ---------- */
  CC.waUrl = function (tipo) {
    var num = N.whatsapp && N.whatsapp.numero;
    if (!num) return '';
    var msj = (N.mensajes_whatsapp || {})[tipo || 'general'];
    return 'https://wa.me/' + num + (msj ? '?text=' + encodeURIComponent(msj) : '');
  };

  function enlaces() {
    $$('[data-wa]').forEach(function (a) {
      var url = CC.waUrl(a.getAttribute('data-wa'));
      if (!url) return;
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.addEventListener('click', function () {
        CC.track('click_whatsapp', { ubicacion: a.getAttribute('data-ubicacion') || '' });
      });
    });
    $$('[data-maps]').forEach(function (a) {
      if (!N.maps_url) return;
      a.href = N.maps_url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.addEventListener('click', function () {
        CC.track('click_como_llegar', { ubicacion: a.getAttribute('data-ubicacion') || '' });
      });
    });
    // «Ver menú»: la carta vive en su propia página y se abre en otra pestaña.
    $$('[data-menu]').forEach(function (a) {
      if (!N.menu_url) return;
      a.href = N.menu_url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.addEventListener('click', function () {
        CC.track('click_ver_menu', { ubicacion: a.getAttribute('data-ubicacion') || '' });
      });
    });
  }

  /* ---------- Formularios que abren WhatsApp con el mensaje listo ---------- */
  function plantilla(texto, valores) {
    return String(texto || '').replace(/\{(\w+)\}/g, function (_, k) { return valores[k] || ''; })
      .replace(/\.\./g, '.') // «7:30 p. m.» + «.» de la plantilla
      .replace(/\s+/g, ' ').trim();
  }
  function valoresDe(form) {
    var v = {};
    new FormData(form).forEach(function (valor, clave) { v[clave] = String(valor).trim(); });
    return v;
  }
  function abrirWhatsApp(mensaje, ubicacion) {
    var num = N.whatsapp && N.whatsapp.numero;
    if (!num) return;
    CC.track('click_whatsapp', { ubicacion: ubicacion });
    w.open('https://wa.me/' + num + '?text=' + encodeURIComponent(mensaje), '_blank', 'noopener');
  }
  function hoyEnBogota() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }
  function fechaLarga(iso) {
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    return new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
      .format(new Date(+p[0], +p[1] - 1, +p[2])).replace(',', '');
  }

  function formularios() {
    var mensajes = N.mensajes_whatsapp || {};
    $$('[data-reserva]').forEach(function (form) {
      var fecha = form.querySelector('[name="fecha"]');
      if (fecha) fecha.min = hoyEnBogota();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = valoresDe(form);
        abrirWhatsApp(plantilla(mensajes.reserva, {
          personas: v.personas,
          fecha: fechaLarga(v.fecha),
          hora: v.hora ? hora(minutos(v.hora)) : '',
          nombre: v.nombre,
          nota: v.nota ? 'Nota: ' + v.nota : ''
        }), 'reserva_' + (form.getAttribute('data-ubicacion') || ''));
      });
    });
    $$('[data-contacto]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        abrirWhatsApp(plantilla(mensajes.contacto, valoresDe(form)), 'contacto_formulario');
      });
    });
  }

  function datos() {
    var valores = {
      'direccion-completa': [N.direccion, N.zona].filter(Boolean).join(' · '),
      'whatsapp-visible': N.whatsapp && N.whatsapp.visible
    };
    $$('[data-dato]').forEach(function (el) {
      var v = valores[el.getAttribute('data-dato')];
      if (v) el.textContent = v;
    });
  }

  /* ---------- Redes y crédito del footer ---------- */
  function redesUrls() {
    var r = N.redes || {}, urls = [];
    if (r.instagram) urls.push(['Instagram', 'https://www.instagram.com/' + String(r.instagram).replace(/^@/, '')]);
    if (r.tiktok) urls.push(['TikTok', 'https://www.tiktok.com/@' + String(r.tiktok).replace(/^@/, '')]);
    return urls;
  }

  function redes() {
    var ul = $('[data-redes]'), urls = redesUrls();
    if (!ul || !urls.length) return;
    ul.innerHTML = urls.map(function (r) {
      return '<li><a class="pie__enlace" href="' + esc(r[1]) + '" target="_blank" rel="noopener">' + r[0] + '</a></li>';
    }).join('');
    listo(ul);
  }

  function credito() {
    var el = $('[data-credito]'), c = N.credito_desarrollo || {};
    if (!el || !c.texto) return;
    el.innerHTML = c.url
      ? '<a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.texto) + '</a>'
      : esc(c.texto);
    listo(el);
  }

  /* ---------- Horario y «Abierto ahora / Cerrado» ----------
     Se calcula con la hora de Colombia, sin importar dónde esté quien visita. */
  var DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  var NOMBRE_DIA = { dom: 'domingo', lun: 'lunes', mar: 'martes', mie: 'miércoles', jue: 'jueves', vie: 'viernes', sab: 'sábado' };

  function horariosListos(h) {
    return !!(h && h.dias) && DIAS.every(function (k) { return Array.isArray(h.dias[k]); });
  }
  function minutos(hhmm) {
    var p = String(hhmm).trim().split(':');
    return (+p[0]) * 60 + (+(p[1] || 0));
  }
  function rangos(lista) {
    return (lista || []).map(function (r) {
      var p = String(r).split('-'), a = minutos(p[0]), b = minutos(p[1]);
      if (b <= a) b += 1440; // cierra después de medianoche
      return [a, b];
    });
  }
  function hora(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' a. m.' : ' p. m.');
  }
  function ahora(zona) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: zona, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .forEach(function (x) { p[x.type] = x.value; });
    return { dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min: (+p.hour % 24) * 60 + (+p.minute) };
  }

  CC.estado = function (h) {
    var t = ahora(h.zona_horaria || 'America/Bogota'), cierres = [], aperturas = [];
    for (var dia = -1; dia <= 7; dia++) {
      rangos(h.dias[DIAS[(t.dia + dia + 7) % 7]]).forEach(function (r) {
        var a = dia * 1440 + r[0], b = dia * 1440 + r[1];
        if (a <= t.min && t.min < b) cierres.push(b);
        else if (a > t.min) aperturas.push({ a: a, dia: dia });
      });
    }
    if (cierres.length) return { abierto: true, texto: 'Abierto ahora · cierra a las ' + hora(Math.max.apply(null, cierres)) };
    if (!aperturas.length) return null;
    aperturas.sort(function (x, y) { return x.a - y.a; });
    var p = aperturas[0];
    var cuando = p.dia === 0 ? 'hoy' : p.dia === 1 ? 'mañana' : 'el ' + NOMBRE_DIA[DIAS[(t.dia + p.dia) % 7]];
    return { abierto: false, texto: 'Cerrado · abrimos ' + cuando + ' a las ' + hora(p.a) };
  };

  function horarios() {
    var h = N.horarios;
    if (!horariosListos(h)) return; // sin los 7 días, todo queda pendiente

    function pintarEstado() {
      var e = CC.estado(h);
      $$('[data-estado]').forEach(function (el) {
        listo(el);
        el.hidden = !e;
        if (!e) return;
        el.classList.toggle('estado--abierto', e.abierto);
        el.classList.toggle('estado--cerrado', !e.abierto);
        el.innerHTML = '<span class="estado__punto" aria-hidden="true"></span>' + esc(e.texto);
      });
    }
    pintarEstado();
    setInterval(pintarEstado, 60000);

    var cont = $('#horario');
    if (!cont) return;
    var hoy = DIAS[ahora(h.zona_horaria || 'America/Bogota').dia];
    cont.innerHTML = '<p class="horario__titulo">Horario</p><dl class="horario__lista">' +
      ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'].map(function (k) {
        var txt = h.dias[k].length
          ? h.dias[k].map(function (r) { var p = String(r).split('-'); return hora(minutos(p[0])) + ' – ' + hora(minutos(p[1])); }).join(' · ')
          : 'Cerrado';
        return '<div' + (k === hoy ? ' class="es-hoy"' : '') + '><dt>' + NOMBRE_DIA[k] + '</dt><dd>' + txt + '</dd></div>';
      }).join('') + '</dl>' +
      (h.festivos ? '<p class="horario__nota">Festivos: ' + esc(h.festivos) + '</p>' : '');
    listo(cont);
  }

  /* ---------- Datos prácticos (solo lo confirmado) ---------- */
  function practicos() {
    var ul = $('[data-practicos]'), s = N.servicios || {};
    if (!ul) return;
    var filas = [['parqueadero', 'Parqueadero'], ['mascotas', 'Mascotas'], ['medios_de_pago', 'Medios de pago']]
      .filter(function (c) { return s[c[0]] !== null && s[c[0]] !== undefined && s[c[0]] !== ''; })
      .map(function (c) {
        var v = s[c[0]];
        v = v === true ? 'sí' : v === false ? 'no' : Array.isArray(v) ? v.join(', ') : String(v);
        return '<li><strong>' + c[1] + ':</strong> ' + esc(v) + '</li>';
      });
    if (!filas.length) return;
    ul.innerHTML = filas.join('');
    listo(ul);
  }

  /* ---------- Nosotros y Reseñas: se publican cuando hay contenido real ---------- */
  function nosotros() {
    var s = (SITE.secciones || {}).nosotros || {}, sec = $('#historia'), cont = $('#nosotros-contenido');
    if (!sec || !cont || !s.publicar || !s.capitulos || !s.capitulos.length) return;
    var foto = s.foto
      ? '<figure class="nosotros__foto"><img src="' + esc(s.foto) + '" alt="' + esc(s.foto_alt || 'La dueña y el equipo de Café Conexión') + '" width="800" height="1000" loading="lazy" decoding="async"></figure>'
      : '<figure class="ph ph--retrato pendiente" data-pendiente="foto de la dueña y el equipo">' + CC.camara + '<figcaption>La dueña y el equipo</figcaption></figure>';
    cont.innerHTML = foto + '<div class="nosotros__historia">' +
      (s.titulo ? '<p class="nosotros__titulo">' + esc(s.titulo) + '</p>' : '') +
      '<ol class="capitulos">' + s.capitulos.map(function (c) {
        return '<li class="capitulo">' + (c.titulo ? '<h3>' + esc(c.titulo) + '</h3>' : '') + '<p>' + esc(c.texto) + '</p></li>';
      }).join('') + '</ol>' +
      (s.cita && s.cita.texto
        ? '<blockquote class="cita"><p>' + esc(s.cita.texto) + '</p>' + (s.cita.autor ? '<footer>' + esc(s.cita.autor) + '</footer>' : '') + '</blockquote>'
        : '') +
      '</div>';
    listo(sec);
    $$('[data-enlace-nosotros]').forEach(function (li) { li.hidden = false; });
  }

  function resenas() {
    var s = (SITE.secciones || {}).resenas || {}, sec = $('#resenas'), items = s.items || [];
    var boton = $('[data-resena]');
    if (boton && N.google_resena_url) {
      boton.href = N.google_resena_url;
      boton.target = '_blank';
      boton.rel = 'noopener';
      listo(boton);
    }
    if (!sec || !s.publicar || items.length < 3) return;
    $('#resenas-lista').innerHTML = items.map(function (r) {
      return '<li class="resena"><p class="resena__texto">«' + esc(r.texto) + '»</p><p class="resena__autor">' + esc(r.nombre) +
        (r.fecha ? ' · ' + esc(r.fecha) : '') +
        (r.url ? ' · <a href="' + esc(r.url) + '" target="_blank" rel="noopener">Ver en ' + esc(r.fuente || 'Google') +
          '<span class="visually-hidden"> la reseña de ' + esc(r.nombre) + '</span></a>' : '') +
        '</p></li>';
    }).join('');
    listo(sec);
  }

  /* ---------- Preguntas frecuentes y créditos ----------
     (Los talleres, que reemplazaron a «Eventos», están en js/talleres.js.) */
  function preguntas() {
    var cont = $('#preguntas-lista'), s = (SITE.secciones || {}).preguntas || {}, items = s.items || [];
    if (!cont || !items.length) return;
    cont.innerHTML = items.map(function (q) {
      return '<details class="pregunta"><summary>' + esc(q.p) + '</summary>' +
        (q.r ? '<p>' + esc(q.r) + '</p>' : '<p class="pendiente" data-pendiente="respuesta de la dueña"></p>') +
        '</details>';
    }).join('');
    if (s.publicar && items.every(function (q) { return q.r; })) listo($('#preguntas'));
  }

  function creditos() {
    var ol = $('#creditos-lista'), lista = w.CC_CREDITOS || [];
    if (!ol) return;
    if (!lista.length) { ol.closest('details').hidden = true; return; }
    ol.innerHTML = lista.map(function (c) {
      return '<li><span class="creditos__obra">«' + esc(c.obra) + '»</span>, ' + esc(c.autor) + ' · ' + esc(c.licencia) +
        ' · <a href="' + esc(c.origen) + '" target="_blank" rel="noopener">fuente<span class="visually-hidden"> de «' + esc(c.obra) + '»</span></a></li>';
    }).join('');
  }

  /* ---------- Mapa: Google Maps solo se carga al hacer clic ---------- */
  function mapa() {
    var boton = $('[data-mapa]');
    if (!boton) return;
    var c = N.coordenadas || {};
    var q = c.lat != null && c.lng != null
      ? c.lat + ',' + c.lng
      : (String(N.maps_url || '').split('q=')[1] || '').split('&')[0];
    if (!q) { boton.parentNode.hidden = true; return; }
    boton.addEventListener('click', function () {
      var f = d.createElement('iframe');
      f.src = 'https://maps.google.com/maps?q=' + q + '&z=17&output=embed';
      f.title = 'Mapa de ' + (N.nombre || 'Café Conexión') + ' en Google Maps';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      boton.replaceWith(f);
    });
  }

  /* ---------- Header ----------
     Transparente sobre la portada con foto ([data-hero]: inicio y café), sólido después.
     Se esconde al bajar y vuelve al subir. */
  function cabecera() {
    var cab = $('#cabecera'), hero = $('[data-hero]') || $('#inicio');
    if (!cab) return;
    if (hero && 'IntersectionObserver' in w) {
      cab.classList.add('cabecera--transparente');
      new IntersectionObserver(function (e) {
        var sobreInicio = e[0].isIntersecting;
        cab.classList.toggle('cabecera--transparente', sobreInicio);
        html.classList.toggle('pasado-hero', !sobreInicio);
      }, { rootMargin: '-' + cab.offsetHeight + 'px 0px 0px 0px' }).observe(hero);
    } else {
      html.classList.add('pasado-hero');
    }

    var antes = w.scrollY, esperando = false;
    w.addEventListener('scroll', function () {
      if (esperando) return;
      esperando = true;
      w.requestAnimationFrame(function () {
        var y = w.scrollY, dy = y - antes;
        if (Math.abs(dy) > 8) {
          html.classList.toggle('cabecera-oculta', dy > 0 && y > cab.offsetHeight * 3 && !html.classList.contains('menu-abierto'));
          antes = y;
        }
        esperando = false;
      });
    }, { passive: true });
  }

  /* ---------- Menú del celular ---------- */
  function menuMovil() {
    var boton = $('.hamburguesa'), panel = $('#menu-movil');
    if (!boton || !panel) return;
    var etiqueta = boton.querySelector('.visually-hidden');

    // Con el menú abierto, lo de atrás no se puede tocar ni leer con lector de pantalla.
    var fondo = $$('main, footer, .barra-movil, .wa-flotante');

    function abrir(si, devolverFoco) {
      boton.setAttribute('aria-expanded', si ? 'true' : 'false');
      if (etiqueta) etiqueta.textContent = si ? 'Cerrar menú' : 'Abrir menú';
      panel.hidden = !si;
      html.classList.toggle('menu-abierto', si);
      fondo.forEach(function (el) { el.inert = si; });
      if (si) {
        html.classList.remove('cabecera-oculta');
        var primero = panel.querySelector('a');
        if (primero) primero.focus();
      } else if (devolverFoco) {
        boton.focus();
      }
    }

    boton.addEventListener('click', function () { abrir(boton.getAttribute('aria-expanded') !== 'true', true); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) abrir(false, false); });
    d.addEventListener('keydown', function (e) {
      if (panel.hidden) return;
      if (e.key === 'Escape') { abrir(false, true); return; }
      if (e.key !== 'Tab') return;
      // El foco se queda entre el botón de cerrar y los enlaces del menú.
      var focos = [boton].concat($$('a', panel).filter(function (a) { return a.offsetParent !== null; }));
      var i = focos.indexOf(d.activeElement);
      if (i === -1) { e.preventDefault(); focos[0].focus(); }
      else if (e.shiftKey && i === 0) { e.preventDefault(); focos[focos.length - 1].focus(); }
      else if (!e.shiftKey && i === focos.length - 1) { e.preventDefault(); focos[0].focus(); }
    });
    if (w.matchMedia) {
      var escritorio = w.matchMedia('(min-width: 1024px)');
      var alCambiar = function (m) { if (m.matches) abrir(false, false); };
      if (escritorio.addEventListener) escritorio.addEventListener('change', alCambiar);
      else if (escritorio.addListener) escritorio.addListener(alCambiar);
    }
  }

  /* ---------- JSON-LD para buscadores (sin los campos que siguen en null) ---------- */
  function jsonLd() {
    if (!$('#inicio')) return;
    var s = SITE.seo || {}, h = N.horarios, c = N.coordenadas || {}, wa = N.whatsapp || {};
    var semana = { lun: 'Monday', mar: 'Tuesday', mie: 'Wednesday', jue: 'Thursday', vie: 'Friday', sab: 'Saturday', dom: 'Sunday' };
    var num = wa.numero ? String(wa.numero) : '';
    var datos = {
      '@context': 'https://schema.org',
      '@type': s.tipo || 'CafeOrCoffeeShop',
      name: N.nombre,
      url: s.url,
      image: s.imagen,
      telephone: num.length > 10 ? '+' + num.slice(0, num.length - 10) + ' ' + (wa.visible || num.slice(-10)) : null,
      address: {
        '@type': 'PostalAddress',
        streetAddress: N.direccion,
        addressLocality: N.ciudad,
        addressRegion: N.departamento,
        addressCountry: N.pais
      },
      servesCuisine: s.servesCuisine,
      hasMenu: N.menu_url,
      priceRange: s.priceRange,
      geo: c.lat != null && c.lng != null ? { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } : null,
      openingHoursSpecification: horariosListos(h)
        ? Object.keys(semana).reduce(function (lista, k) {
            h.dias[k].forEach(function (r) {
              var p = String(r).split('-');
              lista.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: semana[k], opens: p[0].trim(), closes: p[1].trim() });
            });
            return lista;
          }, [])
        : null,
      sameAs: redesUrls().map(function (r) { return r[1]; })
    };
    var limpio = JSON.stringify(datos, function (k, v) {
      return v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length) ? undefined : v;
    });
    var script = d.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = limpio;
    d.head.appendChild(script);
  }

  /* ---------- Intro «Conexión» ----------
     La coreografía está en CSS (styles.css → Movimiento). Acá solo se salta con clic, toque,
     tecla o scroll, se mide cuándo la saltaron y se retira la capa al terminar. */
  function intro() {
    var capa = $('.capa-intro');
    if (!capa) return;
    if (!html.classList.contains('intro')) { capa.remove(); return; }
    var eventos = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'], terminada = false;

    function terminar(saltada) {
      if (terminada) return;
      terminada = true;
      eventos.forEach(function (ev) { w.removeEventListener(ev, saltar, true); });
      if (saltada) {
        html.classList.add('intro-saltada');
        CC.track('intro_saltada', { ms_transcurridos: Math.round(w.performance ? w.performance.now() : 0) });
      }
      setTimeout(function () { capa.remove(); }, saltada ? 160 : 0);
    }
    function saltar() { terminar(true); }

    eventos.forEach(function (ev) { w.addEventListener(ev, saltar, { capture: true, passive: true }); });
    setTimeout(function () { terminar(false); }, 1850);
  }

  /* ---------- Bloques que entran al bajar ----------
     Los que entran juntos se escalonan. Al terminar se les quita la marca para que
     el efecto al pasar el mouse vuelva a ser el de la tarjeta. */
  function revelar() {
    var bloques = $$('[data-reveal]');
    if (!bloques.length) return;
    var estilo = w.getComputedStyle(html);
    var duracion = parseFloat(estilo.getPropertyValue('--t-reveal')) || 640;
    var escalon = parseFloat(estilo.getPropertyValue('--escalon')) || 70;
    var porGrupo = new Map();
    bloques.forEach(function (el) {
      var i = porGrupo.get(el.parentNode) || 0;
      el.style.setProperty('--i', i);
      porGrupo.set(el.parentNode, i + 1);
    });

    function mostrar(el) {
      el.classList.add('visible');
      var i = parseInt(el.style.getPropertyValue('--i'), 10) || 0;
      setTimeout(function () {
        el.removeAttribute('data-reveal');
        el.classList.remove('visible');
        el.style.removeProperty('--i');
      }, duracion + i * escalon + 60);
    }

    if (!('IntersectionObserver' in w)) { bloques.forEach(mostrar); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        mostrar(e.target);
      });
    }, { threshold: 0.15 });
    bloques.forEach(function (el) { io.observe(el); });
  }

  /* El color de la barra del navegador en el celular sale de tokens.css. */
  function colorNavegador() {
    var meta = $('meta[name="theme-color"]');
    var color = w.getComputedStyle(html).getPropertyValue('--fondo').trim();
    if (meta && color) meta.setAttribute('content', color);
  }

  /* ---------- Volver arriba ----------
     Un colibrí que sube: aparece cuando ya se bajó más de una pantalla y lleva al principio.
     El foco pasa a la marca del header, para que el teclado también quede arriba. */
  function subir() {
    var boton = d.createElement('button');
    boton.type = 'button';
    boton.className = 'subir';
    boton.setAttribute('aria-label', 'Volver arriba');
    boton.innerHTML =
      '<svg class="subir__colibri" viewBox="0 0 32 32" aria-hidden="true"><g transform="rotate(-40 16 16)">' +
      '<circle cx="20.6" cy="11.6" r="3"/><path d="M23.3 10.6 31.6 8.4 23.5 12.3z"/>' +
      '<path d="M18.4 10.2C14.8 11.4 11.2 14.6 9 19.4l-.6 1.4c4.2-.2 8.4-1.8 11.6-4.8 1.4-1.4 2.3-2.4 2.6-3.4z"/>' +
      '<path d="M16.6 12.4C14.6 8.2 11 4.4 6.2 1.8c.2 4.4 3.4 9.4 8.2 13.2z"/>' +
      '<path d="M9.8 18.8 3.4 22.2l4.2.2-1.8 4.8 5.4-6z"/></g></svg>';
    d.body.appendChild(boton);

    var visible = false, esperando = false;
    function revisar() {
      esperando = false;
      var abajo = w.scrollY > w.innerHeight * 1.2;
      if (abajo === visible) return;
      visible = abajo;
      boton.classList.toggle('subir--visible', abajo);
    }
    w.addEventListener('scroll', function () {
      if (esperando) return;
      esperando = true;
      w.requestAnimationFrame(revisar);
    }, { passive: true });
    revisar();

    boton.addEventListener('click', function () {
      w.scrollTo({ top: 0, behavior: CC.reduce ? 'auto' : 'smooth' });
      var marca = $('.marca');
      if (marca) marca.focus({ preventScroll: true });
    });
  }

  function iniciar() {
    html.classList.add('js-ok'); // desde acá manda este archivo: se apagan los seguros de CSS
    intro();
    revelar();
    datos();
    enlaces();
    formularios();
    redes();
    credito();
    horarios();
    practicos();
    nosotros();
    resenas();
    preguntas();
    creditos();
    mapa();
    cabecera();
    menuMovil();
    jsonLd();
    colorNavegador();
    subir();
  }

  // js/menu.js corre después de este archivo: se espera a que termine de armar la carta.
  if (d.readyState === 'complete') iniciar();
  else d.addEventListener('DOMContentLoaded', iniciar);
})();
