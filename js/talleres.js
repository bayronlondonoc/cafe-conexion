/* Café Conexión · talleres
   - talleres.html: el próximo taller en la cabecera, los próximos talleres, las sesiones con cita
     y los que ya pasaron.
   - Inicio: la sección «Próximos talleres» y un anuncio pequeño que se cierra con la ×.
   - Reservas: una ventana con un formulario corto que abre WhatsApp con el mensaje listo, al
     número del taller o, si no tiene, al del café.
   Todo se calcula con la hora de Colombia: lo que ya terminó no se anuncia ni se reserva.
   Datos: data/talleres.js (CC_TALLERES). Mensajes: data/site.js → mensajes_whatsapp. */

(function () {
  'use strict';

  var w = window, d = document, T = w.CC_TALLERES, CC = w.CC || {};
  if (!T) return;
  var N = (w.CC_SITE || {}).negocio || {};
  var esc = CC.esc || function (s) { return String(s); };

  /* ---------- Fechas (Colombia: UTC−5 todo el año) ---------- */
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function instante(fecha, hhmm) { return new Date(fecha + 'T' + (hhmm || '00:00') + ':00-05:00').getTime(); }
  function hoy(dias) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date(Date.now() + (dias || 0) * 864e5));
  }
  function diaDeLaSemana(fecha) { var p = fecha.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay(); }
  function fechaLarga(fecha) { var p = fecha.split('-'); return DIAS[diaDeLaSemana(fecha)] + ' ' + (+p[2]) + ' de ' + MESES[+p[1] - 1]; }
  function fechaCorta(fecha) { var p = fecha.split('-'); return DIAS_CORTOS[diaDeLaSemana(fecha)] + ' ' + (+p[2]) + ' ' + MESES_CORTOS[+p[1] - 1]; }
  function hora(hhmm) {
    var p = hhmm.split(':'), h = +p[0], m = p[1] || '00';
    return (h % 12 || 12) + ':' + m + (h < 12 ? ' a. m.' : ' p. m.');
  }
  function horario(t) {
    if (!t.inicio) return '';
    if (!t.fin) return hora(t.inicio);
    var a = hora(t.inicio), b = hora(t.fin);
    // «4:00 a 8:00 p. m.» cuando las dos horas son de la tarde (o de la mañana)
    return a.slice(-5) === b.slice(-5) ? a.slice(0, -6) + ' a ' + b : a + ' a ' + b;
  }
  function fin(t) { return t.fin ? instante(t.fecha, t.fin) : instante(t.fecha, '23:59'); }
  function relativo(t) {
    if (t.fecha === hoy(0)) return instante(t.fecha, t.inicio) <= Date.now() ? 'Ahora' : 'Hoy';
    if (t.fecha === hoy(1)) return 'Mañana';
    var dias = Math.round((instante(t.fecha, '12:00') - instante(hoy(0), '12:00')) / 864e5);
    return dias <= 6 ? 'Este ' + DIAS[diaDeLaSemana(t.fecha)] : 'En ' + dias + ' días';
  }
  function precio(n) { return '$' + Number(n).toLocaleString('es-CO'); }

  /* ---------- Los talleres, según la fecha ---------- */
  var lista = T.talleres || [];
  var conFecha = lista.filter(function (t) { return t.tipo !== 'sesion' && t.fecha; });
  var proximos = conFecha.filter(function (t) { return fin(t) > Date.now(); })
    .sort(function (a, b) { return instante(a.fecha, a.inicio) - instante(b.fecha, b.inicio); });
  var pasados = conFecha.filter(function (t) { return fin(t) <= Date.now(); })
    .sort(function (a, b) { return instante(b.fecha, b.inicio) - instante(a.fecha, a.inicio); });
  var sesiones = lista.filter(function (t) { return t.tipo === 'sesion'; });
  var porId = {};
  lista.forEach(function (t) { porId[t.id] = t; });

  var ICONO_WA = '<svg class="icono" aria-hidden="true"><use href="#i-whatsapp"/></svg>';
  var FLECHA = '<svg class="flecha" aria-hidden="true"><use href="#i-flecha"/></svg>';

  function quienOrienta(t) {
    if (!t.instagram || !t.instagram.length) return esc(t.orienta || '');
    return t.instagram.map(function (u) {
      return '<a href="https://www.instagram.com/' + encodeURIComponent(u) + '/" target="_blank" rel="noopener">@' + esc(u) +
        '<span class="visually-hidden"> en Instagram (se abre en otra pestaña)</span></a>';
    }).join(' y ');
  }
  function cartel(t, clase, carga) {
    return '<img class="' + clase + '" src="' + esc(t.cartel) + '" alt="' + esc(t.alt || t.titulo) + '" width="' + (t.cartel_ancho || 720) +
      '" height="' + (t.cartel_alto || 1080) + '" loading="' + (carga || 'lazy') + '" decoding="async">';
  }
  function botonReserva(t, clases) {
    if (t.agotado) return '<span class="taller__agotado">Cupos agotados</span>';
    return '<button class="boton boton--primario ' + (clases || '') + '" type="button" data-reservar="' + esc(t.id) + '">' + ICONO_WA +
      (t.tipo === 'sesion' ? 'Agendar mi sesión' : 'Reservar mi cupo') + '</button>';
  }

  /* ---------- talleres.html ---------- */
  function tarjeta(t) {
    var sesion = t.tipo === 'sesion';
    var datos = [
      sesion ? ['Duración', esc(t.duracion || '')] : ['Hora', esc(horario(t))],
      [sesion ? 'Con' : 'Orienta', quienOrienta(t)],
      ['Lugar', 'Café Conexión' + (N.direccion ? ', ' + esc(N.direccion) : '')],
      t.incluye ? ['Incluye', esc(t.incluye)] : null,
      [esc(t.precio_nombre || 'Valor'), precio(t.precio)]
    ].filter(function (x) { return x && x[1]; });
    return '<article class="taller" id="' + esc(t.id) + '" data-reveal>' +
      '<a class="taller__cartel" href="' + esc(t.cartel) + '" target="_blank" rel="noopener">' + cartel(t, 'taller__img') +
      '<span class="visually-hidden"> (ver el afiche completo en otra pestaña)</span></a>' +
      '<div class="taller__cuerpo">' +
      '<p class="taller__cuando">' + (sesion ? '<span class="taller__insignia">Con cita</span>Cuando te sirva' :
        '<span class="taller__insignia">' + relativo(t) + '</span>' + fechaLarga(t.fecha)) + '</p>' +
      '<h3 class="taller__titulo">' + esc(t.titulo) + '</h3>' +
      (t.frase ? '<p class="taller__frase">' + esc(t.frase) + '</p>' : '') +
      (t.descripcion ? '<p class="taller__desc">' + esc(t.descripcion) + '</p>' : '') +
      '<dl class="taller__datos">' + datos.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="taller__acciones">' + botonReserva(t, 'boton--grande') +
      (t.cupos_limitados && !t.agotado ? '<span class="taller__cupos">Cupos limitados</span>' : '') + '</div>' +
      '</div></article>';
  }

  function pagina() {
    var el = d.getElementById('talleres-proximos');
    if (!el) return;
    el.innerHTML = proximos.length ? proximos.map(tarjeta).join('') :
      '<p class="talleres-vacio">Pronto anunciamos los próximos talleres. Escríbenos por WhatsApp y te avisamos.</p>';

    var cita = d.getElementById('talleres-cita');
    if (cita) {
      cita.innerHTML = sesiones.map(tarjeta).join('');
      var sec = cita.closest('section');
      if (sec && !sesiones.length) sec.hidden = true;
    }

    var ul = d.getElementById('talleres-pasados');
    if (ul) {
      ul.innerHTML = pasados.map(function (t) {
        return '<li class="taller-pasado">' + cartel(t, 'taller-pasado__img') +
          '<div><p class="taller-pasado__fecha">' + fechaLarga(t.fecha) + '</p>' +
          '<p class="taller-pasado__titulo">' + esc(t.titulo) + '</p>' +
          (t.orienta ? '<p class="taller-pasado__quien">Con ' + quienOrienta(t) + '</p>' : '') + '</div></li>';
      }).join('');
      var secP = ul.closest('section');
      if (secP && !pasados.length) secP.hidden = true;
    }

    // En la cabecera, el afiche del próximo taller.
    var fig = d.getElementById('taller-destacado');
    if (fig && proximos.length) {
      var t = proximos[0];
      fig.innerHTML = '<a class="destacado__enlace" href="#' + esc(t.id) + '">' + cartel(t, 'destacado__img', 'eager') +
        '<span class="destacado__insignia">' + relativo(t) + ' · ' + fechaCorta(t.fecha) + '</span>' +
        '<span class="visually-hidden">: ' + esc(t.titulo) + '</span></a>';
      fig.classList.add('destacado--cartel');
    }

    // Para buscadores: los próximos talleres como eventos.
    if (proximos.length) {
      var s = d.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(proximos.map(function (t) {
        return {
          '@context': 'https://schema.org', '@type': 'Event', name: t.titulo, description: t.descripcion,
          startDate: t.fecha + 'T' + t.inicio + ':00-05:00', endDate: t.fin ? t.fecha + 'T' + t.fin + ':00-05:00' : undefined,
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
          location: { '@type': 'Place', name: 'Café Conexión', address: { '@type': 'PostalAddress', streetAddress: N.direccion, addressLocality: N.ciudad, addressCountry: N.pais } },
          offers: { '@type': 'Offer', price: t.precio, priceCurrency: 'COP', availability: t.agotado ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
          image: new URL(t.cartel, w.location.href).href
        };
      }));
      d.head.appendChild(s);
    }
  }

  /* ---------- Inicio: la sección «Próximos talleres» ---------- */
  function seccionInicio() {
    var sec = d.getElementById('talleres-inicio'), ul = d.getElementById('talleres-inicio-lista');
    if (!sec || !ul || !proximos.length) return;
    ul.innerHTML = proximos.slice(0, 3).map(function (t) {
      return '<li class="taller-mini" data-reveal>' + cartel(t, 'taller-mini__img') +
        '<div class="taller-mini__cuerpo"><p class="taller-mini__cuando"><span class="taller__insignia">' + relativo(t) + '</span>' +
        fechaCorta(t.fecha) + ' · ' + esc(horario(t)) + '</p>' +
        '<h3 class="taller-mini__titulo"><a href="talleres.html#' + esc(t.id) + '">' + esc(t.titulo) + '</a></h3>' +
        '<p class="taller-mini__precio">' + esc(t.precio_nombre || 'Valor') + ': ' + precio(t.precio) + '</p>' +
        botonReserva(t, 'boton--chico') + '</div></li>';
    }).join('');
    sec.hidden = false;
  }

  /* ---------- Inicio: el anuncio ----------
     Sale una vez por visita, cuando la persona ya bajó más allá de la portada (nunca encima de
     ella ni de la animación del colibrí). Se cierra con la ×, con Esc o reservando; si lo
     cierran, ese anuncio no vuelve a salir. */
  function guardado(clave) { try { return w.localStorage.getItem(clave); } catch (e) { return null; } }
  function guardar(clave, valor) { try { w.localStorage.setItem(clave, valor); } catch (e) {} }

  function anuncio() {
    if (d.body.getAttribute('data-pagina') !== 'inicio') return;
    try { if (w.sessionStorage.getItem('cc_anuncio_visto')) return; } catch (e) {}

    var dia = new Date(Date.now() - 5 * 3600e3).getUTCDay();
    var avisos = proximos.filter(function (t) { return !t.agotado && !guardado('cc_anuncio_cerrado_' + t.id); }).map(function (t) {
      return {
        id: t.id, img: t.cartel, enlace: 'talleres.html#' + t.id, etiqueta: 'Taller · ' + relativo(t) + ' · ' + fechaCorta(t.fecha),
        titulo: t.titulo, detalle: horario(t) + ' · ' + precio(t.precio),
        acciones: botonReserva(t, 'boton--chico') + '<a class="aviso__enlace" href="talleres.html#' + esc(t.id) + '">Ver taller</a>'
      };
    });
    (T.promos || []).forEach(function (p) {
      var cerrado = +guardado('cc_anuncio_cerrado_' + p.id) || 0;
      if ((p.dias || []).indexOf(dia) === -1 || Date.now() - cerrado < 6 * 864e5) return;
      avisos.push({
        id: p.id, img: p.imagen, etiqueta: 'Promo · ' + (dia === 6 ? 'Hoy sábado' : p.cuando),
        titulo: p.titulo, detalle: p.texto,
        acciones: N.menu_url ? '<a class="boton boton--primario boton--chico" href="' + esc(N.menu_url) + '" target="_blank" rel="noopener">Ver menú<span class="visually-hidden"> (se abre en otra pestaña)</span></a>' : ''
      });
    });
    if (!avisos.length) return;

    var a = avisos[0], mas = proximos.filter(function (t) { return t.id !== a.id; }).length;
    var el = d.createElement('aside');
    el.className = 'aviso';
    el.setAttribute('aria-label', 'Anuncio');
    el.innerHTML = (a.img ? '<img class="aviso__img" src="' + esc(a.img) + '" alt="" width="72" height="96" decoding="async">' : '') +
      '<div class="aviso__cuerpo"><p class="aviso__etiqueta">' + esc(a.etiqueta) + '</p>' +
      '<p class="aviso__titulo">' + (a.enlace ? '<a href="' + esc(a.enlace) + '">' + esc(a.titulo) + '</a>' : esc(a.titulo)) + '</p>' +
      '<p class="aviso__detalle">' + esc(a.detalle) + '</p>' +
      '<div class="aviso__acciones">' + a.acciones + '</div>' +
      (mas > 0 ? '<a class="aviso__mas" href="talleres.html">' + (mas === 1 ? 'Y 1 taller más' : 'Y ' + mas + ' talleres más') + FLECHA + '</a>' : '') +
      '</div><button class="aviso__cerrar" type="button" aria-label="Cerrar anuncio"><span aria-hidden="true">×</span></button>';
    d.body.appendChild(el);

    var visto = false, esperando = false;
    function mostrar() {
      if (visto) return;
      visto = true;
      try { w.sessionStorage.setItem('cc_anuncio_visto', '1'); } catch (e) {}
      el.classList.add('aviso--visible');
      CC.track && CC.track('ver_anuncio', { id: a.id });
    }
    function cerrar(motivo) {
      guardar('cc_anuncio_cerrado_' + a.id, String(Date.now()));
      el.classList.remove('aviso--visible');
      setTimeout(function () { el.remove(); }, 400);
      CC.track && CC.track('cerrar_anuncio', { id: a.id, motivo: motivo });
    }
    // main.js pone la clase pasado-hero en <html> cuando la portada sale de la pantalla.
    var raiz = d.documentElement;
    function alPasar() {
      if (esperando || !raiz.classList.contains('pasado-hero')) return;
      esperando = true;
      if (vigia) vigia.disconnect();
      setTimeout(mostrar, 700);
    }
    var vigia = 'MutationObserver' in w ? new MutationObserver(alPasar) : null;
    if (vigia) vigia.observe(raiz, { attributes: true, attributeFilter: ['class'] });
    else w.addEventListener('scroll', alPasar, { passive: true });
    el.querySelector('.aviso__cerrar').addEventListener('click', function () { cerrar('x'); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar('esc'); });
    el.addEventListener('click', function (e) { if (e.target.closest('[data-reservar]')) cerrar('reservar'); });
  }

  /* ---------- Reservas por WhatsApp ---------- */
  var ventana = null;
  function numeroDe(t) { return String(t.whatsapp || (N.whatsapp && N.whatsapp.numero) || ''); }
  function mensaje(t, v) {
    var m = N.mensajes_whatsapp || {}, sesion = t.tipo === 'sesion';
    var plantilla = CC.plantilla || function (s) { return s; };
    return plantilla(m[sesion ? 'sesion' : 'taller'], {
      saludo: t.whatsapp ? 'Hola.' : 'Hola, Café Conexión.',
      web: t.whatsapp ? 'la web de Café Conexión' : 'su web',
      taller: t.titulo,
      cuando: t.fecha ? fechaLarga(t.fecha) + (t.inicio ? ' a las ' + hora(t.inicio) : '') : '',
      cupos: v.cupos, nombre: v.nombre,
      fecha: v.fecha ? fechaLarga(v.fecha) : '', franja: v.franja,
      nota: v.nota ? 'Nota: ' + v.nota : ''
    });
  }
  function abrirWhatsApp(t, texto) {
    CC.track && CC.track('click_whatsapp', { ubicacion: 'reserva_taller', taller: t.id });
    w.open('https://wa.me/' + numeroDe(t) + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  }

  function formulario(t) {
    var sesion = t.tipo === 'sesion';
    var cupos = [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + (n === 1 ? ' cupo' : ' cupos') + '">' + n + '</option>'; }).join('') +
      '<option value="6 cupos o más">6 o más</option>';
    return '<form class="reserva__form" novalidate>' +
      '<button class="reserva__cerrar" type="button" data-cerrar aria-label="Cerrar"><span aria-hidden="true">×</span></button>' +
      '<p class="reserva__sobre">' + (sesion ? 'Agendar sesión' : 'Reservar cupo') + '</p>' +
      '<h2 class="reserva__titulo" id="reserva-titulo">' + esc(t.titulo) + '</h2>' +
      '<p class="reserva__cuando">' + (sesion ? esc(t.duracion || '') + ' · ' + precio(t.precio) :
        fechaLarga(t.fecha) + ' · ' + esc(horario(t)) + ' · ' + precio(t.precio)) + '</p>' +
      '<div class="reserva__campos">' +
      '<label class="campo"><span class="campo__etiqueta">Tu nombre</span><input class="campo__control" name="nombre" type="text" autocomplete="name" required></label>' +
      (sesion ?
        '<label class="campo"><span class="campo__etiqueta">Qué día te sirve</span><input class="campo__control" name="fecha" type="date" min="' + hoy(0) + '" required></label>' +
        '<label class="campo"><span class="campo__etiqueta">En qué horario</span><select class="campo__control" name="franja"><option value="en la mañana">En la mañana</option><option value="en la tarde">En la tarde</option><option value="en la noche">En la noche</option></select></label>' :
        '<label class="campo"><span class="campo__etiqueta">Cupos</span><select class="campo__control" name="cupos">' + cupos + '</select></label>') +
      '<label class="campo"><span class="campo__etiqueta">Nota <span class="campo__opcional">(opcional)</span></span><textarea class="campo__control" name="nota" rows="2"></textarea></label>' +
      '</div>' +
      '<button class="boton boton--primario boton--grande boton--ancho" type="submit">' + ICONO_WA + 'Enviar por WhatsApp</button>' +
      '<p class="reserva__nota">Se abre WhatsApp con tu mensaje listo. ' +
      (sesion ? 'La sesión queda agendada' : 'El cupo queda reservado') + ' cuando te confirmen por ese medio.</p>' +
      '</form>';
  }

  function reservar(id) {
    var t = porId[id];
    if (!t || t.agotado || (t.tipo !== 'sesion' && fin(t) <= Date.now())) return;
    if (!ventana) {
      ventana = d.createElement('dialog');
      if (typeof ventana.showModal !== 'function') { // navegador viejo: WhatsApp directo
        ventana = null;
        abrirWhatsApp(t, mensaje(t, { cupos: '1 cupo', nombre: '' }));
        return;
      }
      ventana.className = 'reserva';
      ventana.setAttribute('aria-labelledby', 'reserva-titulo');
      d.body.appendChild(ventana);
      // Clic afuera del formulario (en el fondo oscuro) también cierra.
      ventana.addEventListener('click', function (e) { if (e.target === ventana || e.target.closest('[data-cerrar]')) ventana.close(); });
    }
    ventana.innerHTML = formulario(t);
    var form = ventana.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var faltan = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (c) { return !c.value.trim(); });
      if (faltan.length) { faltan[0].focus(); faltan[0].setAttribute('aria-invalid', 'true'); return; }
      var v = {};
      new FormData(form).forEach(function (valor, clave) { v[clave] = String(valor).trim(); });
      abrirWhatsApp(t, mensaje(t, v));
      ventana.close();
    });
    ventana.showModal();
    CC.track && CC.track('abrir_reserva', { taller: t.id });
  }

  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-reservar]');
    if (b) { e.preventDefault(); reservar(b.getAttribute('data-reservar')); }
  });

  pagina();
  seccionInicio();
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', anuncio);
  else anuncio();
})();
