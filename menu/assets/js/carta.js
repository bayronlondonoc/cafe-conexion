/* Café Conexión — carta digital
   Sin frameworks, sin build. Los datos salen de data/menu.json (y data/menu.en.json).
   Nada de esto se toca para cambiar un precio: eso se edita en el JSON. */

(() => {
  'use strict';

  const LLAVE = { lang: 'cc.lang' };
  const RUTA_IMG = 'assets/img/';

  // "foto" es la que sale en la tarjeta. "fotos" son las demas del detalle:
  // "fotos": ["capuchino-2.webp", "capuchino-3.webp"]. Sin ninguna no se hace
  // ninguna peticion: queda el marcador con el nombre.
  function fotosDe(p) {
    const lista = [p.foto].concat(Array.isArray(p.fotos) ? p.fotos : []);
    return lista.filter(Boolean).map(f =>
      (f.indexOf('/') >= 0 || f.indexOf(':') >= 0) ? f : RUTA_IMG + f);
  }

  function fotoHTML(p) {
    const src = fotosDe(p)[0];
    if (!src) return '';
    return `<img src="${esc(src)}" alt="${esc(p.nombre)}" loading="lazy" decoding="async" onerror="this.remove()">`;
  }

  /* ---------- textos de interfaz ---------- */

  const T = {
    es: {
      saltar: 'Ir a la carta',
      buscarLabel: 'Buscar en la carta',
      buscarPh: 'Buscar un plato o un ingrediente',
      verEspacio: 'El espacio',
      heroLugar: 'Sector Estadio · Medellín',
      sinResultados: 'No encontramos nada con eso. Prueba con otra palabra.',
      resultados: 'Resultados',
      encontrados: n => n === 1 ? '1 producto' : n + ' productos',
      pieCarta: 'Carta actualizada el',
      destacados: 'Lo que más piden',
      agotado: 'Agotado',
      foto: 'Foto',
      anterior: 'Foto anterior',
      siguiente: 'Foto siguiente',
      arriba: 'Volver arriba',
      espacioF: 'En el sector hay muchos cafés donde trabajar. Este es donde además te reconocen.',
      wifi: 'Wifi para toda la tarde',
      enchufes: 'Enchufe en la mayoría de las mesas',
      comoLlegar: 'Cómo llegar',
      idiomaBtn: 'EN',
      idiomaAria: 'Switch to English',
      badges: { vegetariano: 'Vegetariano', vegano: 'Vegano', 'sin-gluten': 'Sin gluten', picante: 'Picante', 'de-la-casa': 'De la casa' },
      fichaT: 'El café de la casa',
      ficha: {
        origen: 'Origen', finca: 'Finca', variedad: 'Variedad',
        proceso: 'Proceso', altura: 'Altura', tueste: 'Tueste', notas: 'En taza'
      }
    },
    en: {
      saltar: 'Skip to the menu',
      buscarLabel: 'Search the menu',
      buscarPh: 'Search a dish or an ingredient',
      verEspacio: 'The space',
      heroLugar: 'Estadio area · Medellín',
      sinResultados: 'Nothing matched that. Try another word.',
      resultados: 'Results',
      encontrados: n => n === 1 ? '1 item' : n + ' items',
      pieCarta: 'Menu updated on',
      destacados: 'Most ordered',
      agotado: 'Sold out',
      foto: 'Photo',
      anterior: 'Previous photo',
      siguiente: 'Next photo',
      arriba: 'Back to top',
      espacioF: 'There are plenty of cafés to work from around here. This is the one where they also know your name.',
      wifi: 'Wifi that holds all afternoon',
      enchufes: 'A power outlet at most tables',
      comoLlegar: 'Get directions',
      idiomaBtn: 'ES',
      idiomaAria: 'Cambiar a español',
      badges: { vegetariano: 'Vegetarian', vegano: 'Vegan', 'sin-gluten': 'Gluten free', picante: 'Spicy', 'de-la-casa': 'House' },
      fichaT: 'Our house coffee',
      ficha: {
        origen: 'Origin', finca: 'Farm', variedad: 'Variety',
        proceso: 'Process', altura: 'Altitude', tueste: 'Roast', notas: 'Cup notes'
      }
    }
  };

  /* ---------- estado ---------- */

  const S = {
    lang: 'es',
    datos: null,          // menú en el idioma activo
    cache: {},            // { es: {...}, en: {...} }
    q: ''
  };

  const t = () => T[S.lang];

  /* ---------- utilidades ---------- */

  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plata = n => '$' + Number(n || 0).toLocaleString('es-CO');
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } };

  const prod = id => (S.datos ? S.datos.productos.find(p => p.id === id) : null);

  function extra(p, mods) {
    if (!p || !mods || !mods.length) return 0;
    let suma = 0;
    (p.modificadores || []).forEach(g => {
      const grupo = S.datos.opciones[g];
      if (!grupo) return;
      grupo.items.forEach(it => { if (mods.indexOf(it.nombre) > -1) suma += Number(it.extra || 0); });
    });
    return suma;
  }

  const precioLinea = (p, mods) => Number(p.precio || 0) + extra(p, mods);

  /* ---------- carga ---------- */

  async function pedir(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error('No se pudo cargar ' + url);
    return r.json();
  }

  // menu.en.json solo trae traducciones. Los precios viven unicamente en menu.json.
  function fusionar(base, tr) {
    const m = JSON.parse(JSON.stringify(base));
    if (tr.config) Object.assign(m.config, tr.config);
    if (tr.espacio) Object.assign(m.espacio, tr.espacio);
    m.categorias.forEach(c => { const x = tr.categorias && tr.categorias[c.slug]; if (x) Object.assign(c, x); });
    Object.keys(m.opciones).forEach(k => {
      const x = tr.opciones && tr.opciones[k];
      if (!x) return;
      if (x.titulo) m.opciones[k].titulo = x.titulo;
      (x.items || []).forEach((nom, i) => { if (nom && m.opciones[k].items[i]) m.opciones[k].items[i].nombre = nom; });
    });
    m.productos.forEach(p => { const x = tr.productos && tr.productos[p.id]; if (x) Object.assign(p, x); });
    return m;
  }

  async function cargar(lang) {
    if (S.cache[lang]) return S.cache[lang];
    if (!S.cache.es) S.cache.es = await pedir('data/menu.json');
    if (lang === 'es') return S.cache.es;
    S.cache.en = fusionar(S.cache.es, await pedir('data/menu.en.json'));
    return S.cache.en;
  }

  /* ---------- pintado ---------- */

  // Cada marca lleva su simbolo ademas del texto: la ramita del vegano se
  // reconoce de lejos, y el texto queda para quien no reconoce el dibujo.
  // Los dibujos estan una sola vez en index.html y aca solo se llaman.
  const ICONO = {
    vegano: 'vegano', vegetariano: 'vegetariano',
    'sin-gluten': 'sin-gluten', picante: 'picante', 'de-la-casa': 'casa'
  };

  function badgesHTML(p) {
    const b = (p.badges || []).map(x => {
      const ico = ICONO[x]
        ? `<svg class="badge__ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${ICONO[x]}"></use></svg>`
        : '';
      return `<span class="badge badge--${x === 'de-la-casa' ? 'casa' : esc(x)}">${ico}${esc(t().badges[x] || x)}</span>`;
    });
    if (p.agotado) b.unshift(`<span class="badge badge--agotado">${esc(t().agotado)}</span>`);
    return b.length ? `<div class="badges">${b.join('')}</div>` : '';
  }

  /* ---------- el café de la casa ---------- */

  // Lo que separa un café de especialidad de un café: de donde viene el grano,
  // como se proceso y a que sabe. Sale de "cafe" en menu.json: el bloque de
  // config vale para todos los productos marcados con "especialidad": true, y
  // un producto puede traer el suyo si ese dia se prepara con otro lote.
  // Mientras los datos esten vacios no se pinta nada: nunca se inventa un
  // origen ni un tueste.
  function fichaHTML(p) {
    if (!p.especialidad) return '';
    const c = Object.assign({}, (S.datos.config && S.datos.config.cafe) || {}, p.cafe || {});
    const filas = ['origen', 'finca', 'variedad', 'proceso', 'altura', 'tueste']
      .filter(k => c[k])
      .map(k => `<div class="ficha__dato"><dt>${esc(t().ficha[k])}</dt><dd>${esc(c[k])}</dd></div>`)
      .join('');
    const notas = (c.notas || []).filter(Boolean);
    if (!filas && !notas.length) return '';
    return `<section class="ficha">
      <h3 class="ficha__titulo">${esc(t().fichaT)}</h3>
      ${filas ? `<dl class="ficha__datos">${filas}</dl>` : ''}
      ${notas.length ? `<p class="ficha__notas"><span>${esc(t().ficha.notas)}</span>${
        notas.map(n => `<em>${esc(n)}</em>`).join('')}</p>` : ''}
    </section>`;
  }

  function opcionesHTML(p, inst) {
    if (!p.modificadores || !p.modificadores.length || p.agotado) return '';
    const grupos = p.modificadores.map(g => {
      const grupo = S.datos.opciones[g];
      if (!grupo) return '';
      const n = Number(grupo.elige || 1);
      const tipo = n > 1 ? 'checkbox' : 'radio';
      const items = grupo.items.map((it, i) => {
        const marcado = n === 1 && i === 0 ? ' checked' : '';
        const dif = Number(it.extra || 0) > 0 ? `<em>+${plata(it.extra)}</em>` : '';
        return `<label class="opcion"><input type="${tipo}" name="${esc(p.id + '-' + g + '-' + inst)}"
          value="${esc(it.nombre)}" data-grupo="${esc(g)}" data-max="${n}"${marcado}>
          <span>${esc(it.nombre)}${dif}</span></label>`;
      }).join('');
      return `<div class="grupo" data-grupo="${esc(g)}" data-max="${n}">
        <div class="grupo__titulo">${esc(grupo.titulo)}</div>
        <div class="grupo__items">${items}</div></div>`;
    }).join('');
    return `<div class="opciones">${grupos}</div>`;
  }

  // En los capitulos cada plato es una fila, como en una carta impresa: foto
  // chica, nombre, precio a la derecha y dos lineas de descripcion. Las
  // opciones solo se anuncian; se miran y se marcan en el detalle.
  function platoHTML(p, opts) {
    const o = opts || {};
    const cat = o.cat ? S.datos.categorias.find(c => c.slug === p.categoria) : null;
    const grupos = (p.modificadores || []).map(g => S.datos.opciones[g]).filter(Boolean);
    const opc = grupos.length && !p.agotado
      ? `<span class="plato__opc">${esc(grupos.map(g => g.titulo).join(' · '))}</span>` : '';
    const marcas = badgesHTML(p);
    return `<article class="plato${p.agotado ? ' plato--agotado' : ''}" data-id="${esc(p.id)}"${o.ancla ? ` id="p-${esc(p.slug)}"` : ''}>
      <div class="plato__foto"><span class="plato__inicial" aria-hidden="true">${esc(String(p.nombre).charAt(0))}</span>${fotoHTML(p)}</div>
      <div class="plato__cab">
        <h3 class="plato__h"><button class="plato__nombre" type="button" data-abrir="${esc(p.slug)}">${esc(p.nombre)}</button></h3>
        ${p.nombre_casa ? `<span class="plato__casa">${esc(p.nombre_casa)}</span>` : ''}
      </div>
      <span class="precio">${plata(p.precio)}</span>
      <div class="plato__texto">
        ${cat ? `<span class="plato__cat">${esc(cat.nombre)}</span>` : ''}
        ${p.descripcion ? `<p class="plato__desc">${esc(p.descripcion)}</p>` : ''}
        ${marcas || opc ? `<div class="plato__meta">${marcas}${opc}</div>` : ''}
      </div>
    </article>`;
  }

  // Cabecera de cada capitulo: numero entre filetes, titulo grande y la nota.
  function cabeceraHTML(id, marca, titulo, nota) {
    return `<header class="seccion__cab">
      <span class="seccion__num" aria-hidden="true">${esc(marca)}</span>
      <h2 class="seccion__titulo" id="${esc(id)}">${esc(titulo)}</h2>
      ${nota ? `<p class="seccion__nota">${esc(nota)}</p>` : ''}
    </header>`;
  }

  // Las tarjetas con foto grande quedan para "Lo que mas piden": foto 4:3,
  // nombre, dos lineas y precio.
  function tarjetaHTML(p, opts) {
    const o = opts || {};
    const cat = o.cat ? S.datos.categorias.find(c => c.slug === p.categoria) : null;
    const grupos = (p.modificadores || []).map(g => S.datos.opciones[g]).filter(Boolean);
    return `<article class="tarjeta${p.agotado ? ' tarjeta--agotado' : ''}" data-id="${esc(p.id)}"${o.ancla ? ` id="p-${esc(p.slug)}"` : ''}>
      <div class="tarjeta__foto">
        <span class="tarjeta__placeholder">${esc(p.nombre)}</span>
        ${fotoHTML(p)}
        ${badgesHTML(p)}
      </div>
      <div class="tarjeta__cab">
        ${cat ? `<span class="tarjeta__cat">${esc(cat.nombre)}</span>` : ''}
        <h3><button class="tarjeta__nombre" type="button" data-abrir="${esc(p.slug)}">${esc(p.nombre)}${
          p.nombre_casa ? `<span class="tarjeta__casa">${esc(p.nombre_casa)}</span>` : ''
        }</button></h3>
        <p class="tarjeta__desc">${esc(p.descripcion)}</p>
      </div>
      <div class="tarjeta__pie">
        <span class="precio">${plata(p.precio)}</span>
        ${grupos.length && !p.agotado ? `<span class="tarjeta__opc">${esc(grupos.map(g => g.titulo).join(' · '))}</span>` : ''}
      </div>
    </article>`;
  }

  function pintarChips() {
    $('#chips').innerHTML = S.datos.categorias.map(c =>
      `<button class="chip" type="button" data-cat="${esc(c.slug)}">${esc(c.nombre)}</button>`).join('');
  }

  function pintarDestacados() {
    const cont = $('#destacados');
    const list = S.datos.productos.filter(p => p.destacado && !p.agotado);
    if (!list.length) { cont.innerHTML = ''; return; }
    cont.innerHTML = `<section class="seccion destacados reveal" aria-labelledby="destacados-h">
      ${cabeceraHTML('destacados-h', '✦', t().destacados)}
      <div class="carrusel">${list.map(p => tarjetaHTML(p, { cat: true })).join('')}</div>
    </section>`;
  }

  // Cada capitulo en su marco, con numero: 01 Calientes, 02 Metodos manuales…
  function pintarCatalogo() {
    const cont = $('#catalogo');
    let n = 0;
    cont.innerHTML = S.datos.categorias.map(c => {
      const list = S.datos.productos.filter(p => p.categoria === c.slug);
      if (!list.length) return '';
      n++;
      return `<section class="seccion reveal" data-cat="${esc(c.slug)}" id="c-${esc(c.slug)}" aria-labelledby="h-${esc(c.slug)}">
        <div class="marco">
          ${cabeceraHTML('h-' + c.slug, String(n).padStart(2, '0'), c.nombre, c.nota)}
          <div class="lista">${list.map(p => platoHTML(p, { ancla: true })).join('')}</div>
        </div>
      </section>`;
    }).join('');
  }

  function pintarBusqueda() {
    const q = norm(S.q);
    const list = S.datos.productos.filter(p =>
      norm(p.nombre).indexOf(q) > -1 ||
      norm(p.nombre_casa).indexOf(q) > -1 ||
      norm(p.descripcion).indexOf(q) > -1);
    $('#destacados').innerHTML = '';
    $('#vacio').hidden = list.length > 0;
    $('#catalogo').innerHTML = list.length
      ? `<section class="seccion reveal" aria-labelledby="resultados-h"><div class="marco">
          ${cabeceraHTML('resultados-h', '✦', t().resultados, t().encontrados(list.length))}
          <div class="lista">${list.map(p => platoHTML(p, { cat: true })).join('')}</div>
        </div></section>`
      : '';
    document.querySelectorAll('.chip').forEach(ch => ch.removeAttribute('aria-current'));
    revelar();
  }

  function pintarEspacio() {
    const e = S.datos.espacio || {};
    const items = [];
    if (e.wifi) items.push(`<li>${esc(t().wifi)}</li>`);
    if (e.enchufes) items.push(`<li>${esc(t().enchufes)}</li>`);
    if (e.direccion) items.push(`<li>${esc(e.direccion)}</li>`);
    (e.horario || []).forEach(h => items.push(`<li>${esc(h)}</li>`));
    $('#espacio-cont').innerHTML = `<div class="marco">
      ${cabeceraHTML('espacio-h', '✦', t().verEspacio, t().espacioF)}
      <ul class="espacio__datos">${items.join('')}</ul>
      ${e.maps ? `<a class="btn-mapa" href="${esc(e.maps)}" target="_blank" rel="noopener">${esc(t().comoLlegar)}</a>` : ''}
    </div>`;
  }

  function pintar() {
    if (S.q) { pintarBusqueda(); return; }
    $('#vacio').hidden = true;
    pintarDestacados();
    pintarCatalogo();
    revelar();
    observarSecciones();
  }

  /* ---------- selección de modificadores ---------- */

  function modsDe(caja) {
    if (!caja) return [];
    return Array.prototype.map.call(
      caja.querySelectorAll('.opcion input:checked'), i => i.value);
  }

  // El precio del detalle esta vivo: cambia con lo que se marca, para que el
  // diferencial se vea antes de pedirlo en la mesa.
  function sincronizarPrecio(caja) {
    if (!caja) return;
    const p = prod(caja.dataset.id);
    if (!p) return;
    const precio = caja.querySelector('[data-precio]');
    if (precio) precio.textContent = plata(precioLinea(p, modsDe(caja)));
    caja.querySelectorAll('.grupo').forEach(g => {
      const max = Number(g.dataset.max || 1);
      if (max <= 1) return;
      const marcados = g.querySelectorAll('input:checked').length;
      g.querySelectorAll('input').forEach(i => { i.disabled = !i.checked && marcados >= max; });
    });
  }

  /* ---------- galeria del detalle ---------- */

  function galeriaHTML(p) {
    const fotos = fotosDe(p);
    if (!fotos.length) {
      return `<div class="galeria__vacia"><span class="tarjeta__placeholder">${esc(p.nombre)}</span></div>`;
    }
    const slides = fotos.map((src, i) =>
      `<div class="galeria__slide"><img src="${esc(src)}" alt="${esc(p.nombre)}"${i ? ' loading="lazy"' : ''} decoding="async"></div>`).join('');
    if (fotos.length === 1) {
      return `<div class="galeria"><div class="galeria__pista">${slides}</div></div>`;
    }
    const puntos = fotos.map((f, i) =>
      `<button type="button" data-ir="${i}" aria-label="${esc(t().foto)} ${i + 1}"${i ? '' : ' aria-current="true"'}></button>`).join('');
    return `<div class="galeria">
      <div class="galeria__pista">${slides}</div>
      <button class="galeria__nav galeria__nav--izq" type="button" data-mover="-1" aria-label="${esc(t().anterior)}">‹</button>
      <button class="galeria__nav galeria__nav--der" type="button" data-mover="1" aria-label="${esc(t().siguiente)}">›</button>
      <div class="galeria__puntos">${puntos}</div>
    </div>`;
  }

  const galeriaActual = pista => Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth));

  function galeriaIr(g, i) {
    const pista = g.querySelector('.galeria__pista');
    const n = Math.max(0, Math.min(pista.children.length - 1, i));
    pista.scrollTo({ left: n * pista.clientWidth, behavior: 'smooth' });
  }

  function marcarPuntos(g) {
    const n = galeriaActual(g.querySelector('.galeria__pista'));
    g.querySelectorAll('.galeria__puntos button').forEach((b, i) => {
      if (i === n) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  function montarGaleria() {
    const g = $('#modal-cuerpo .galeria');
    if (!g || !g.querySelector('.galeria__puntos')) return;
    const pista = g.querySelector('.galeria__pista');
    let espera;
    pista.addEventListener('scroll', () => {
      clearTimeout(espera);
      espera = setTimeout(() => marcarPuntos(g), 90);
    }, { passive: true });
  }

  /* ---------- modal ---------- */

  const modal = $('#modal');

  function abrirProducto(slug) {
    const p = S.datos.productos.find(x => x.slug === slug);
    if (!p) return;
    const cat = S.datos.categorias.find(c => c.slug === p.categoria);
    $('#modal-cuerpo').innerHTML = `
      ${galeriaHTML(p)}
      <div class="modal__texto">
        ${cat ? `<span class="tarjeta__cat">${esc(cat.nombre)}</span>` : ''}
        <h2 class="modal__nombre">${esc(p.nombre)}</h2>
        ${p.nombre_casa ? `<span class="tarjeta__casa">${esc(p.nombre_casa)}</span>` : ''}
        <p class="modal__desc">${esc(p.descripcion)}</p>
        ${badgesHTML(p)}
        ${fichaHTML(p)}
        <div class="modal__opciones" data-id="${esc(p.id)}">
          ${opcionesHTML(p, 'modal')}
          <div class="modal__pie">
            <span class="precio" data-precio>${plata(p.precio)}</span>
          </div>
        </div>
      </div>`;
    abrirModal();
    sincronizarPrecio($('#modal-cuerpo .modal__opciones'));
    montarGaleria();
  }

  function abrirModal() {
    if (typeof modal.showModal === 'function') { if (!modal.open) modal.showModal(); }
    else modal.setAttribute('open', '');
  }
  function cerrarModal() {
    if (typeof modal.close === 'function') { if (modal.open) modal.close(); }
    else modal.removeAttribute('open');
    if (location.hash.indexOf('#/producto/') === 0) history.replaceState(null, '', location.pathname + location.search);
  }

  /* ---------- aviso ---------- */

  let avisoT;
  function aviso(txt) {
    let el = document.querySelector('.aviso');
    if (!el) { el = document.createElement('div'); el.className = 'aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = txt;
    clearTimeout(avisoT);
    avisoT = setTimeout(() => el.remove(), 2600);
  }

  /* ---------- scroll-spy y reveal ---------- */

  let obsSec;
  function observarSecciones() {
    if (obsSec) obsSec.disconnect();
    const alto = document.querySelector('.barra').offsetHeight;
    obsSec = new IntersectionObserver(entradas => {
      entradas.forEach(e => { if (e.isIntersecting) activarChip(e.target.dataset.cat); });
    }, { rootMargin: `-${alto + 4}px 0px -68% 0px`, threshold: 0 });
    document.querySelectorAll('.seccion[data-cat]').forEach(s => obsSec.observe(s));
  }

  function activarChip(slug) {
    const chips = $('#chips');
    document.querySelectorAll('.chip').forEach(ch => {
      const on = ch.dataset.cat === slug;
      if (on) {
        ch.setAttribute('aria-current', 'true');
        const meta = ch.offsetLeft - chips.clientWidth / 2 + ch.clientWidth / 2;
        if (Math.abs(chips.scrollLeft - meta) > 24) chips.scrollTo({ left: meta, behavior: 'smooth' });
      } else ch.removeAttribute('aria-current');
    });
  }

  let obsRev, revT;
  function todoVisible() {
    if (obsRev) obsRev.disconnect();
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  function revelar() {
    if (!('IntersectionObserver' in window)) { todoVisible(); return; }
    if (obsRev) obsRev.disconnect();
    obsRev = new IntersectionObserver(entradas => {
      entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obsRev.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => obsRev.observe(el));
    // Red de seguridad: la animacion es un adorno, la carta no. Si el observador
    // no responde (pestana en segundo plano, navegador raro), se muestra todo.
    clearTimeout(revT);
    revT = setTimeout(() => { if (!document.querySelector('.reveal.visible')) todoVisible(); }, 900);
  }

  /* ---------- rutas ---------- */

  function ruta() {
    const h = location.hash;
    if (h.indexOf('#/producto/') === 0) { abrirProducto(h.slice(11)); return; }
    if (h.indexOf('#/categoria/') === 0) {
      const sec = document.getElementById('c-' + h.slice(12));
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    cerrarModal();
  }

  /* ---------- idioma ---------- */

  // 2026-09-10 -> 10 de septiembre de 2026
  function fechaLarga(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(S.lang === 'en' ? 'en-US' : 'es-CO',
      { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function aplicarTextos() {
    document.documentElement.lang = S.lang;
    document.querySelectorAll('[data-t]').forEach(el => {
      const v = t()[el.dataset.t]; if (v) el.textContent = v;
    });
    document.querySelectorAll('[data-t-attr]').forEach(el => {
      const [attr, llave] = el.dataset.tAttr.split(':');
      const v = t()[llave]; if (v) el.setAttribute(attr, v);
    });
    const b = $('#btn-idioma');
    b.textContent = t().idiomaBtn;
    b.setAttribute('aria-label', t().idiomaAria);
    document.title = (S.lang === 'es' ? 'Carta · ' : 'Menu · ') + 'Café Conexión';
    if (S.datos.config) {
      $('#tagline').textContent = S.datos.config.tagline || '';
      $('#pie-fecha').textContent = fechaLarga(S.datos.config.actualizado);
    }
  }

  async function cambiarIdioma(lang) {
    try {
      S.datos = await cargar(lang);
      S.lang = lang;
      guardar(LLAVE.lang, lang);
      aplicarTextos();
      pintarChips();
      pintarEspacio();
      pintar();
    } catch (e) {
      aviso('No se pudo cargar el idioma.');
    }
  }

  /* ---------- eventos ---------- */

  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-abrir],[data-cat],[data-mover],[data-ir]');
    if (!el) return;

    if (el.dataset.abrir) { location.hash = '#/producto/' + el.dataset.abrir; return; }
    if (el.dataset.cat) { location.hash = '#/categoria/' + el.dataset.cat; return; }

    if (el.dataset.mover !== undefined) {
      const g = el.closest('.galeria');
      galeriaIr(g, galeriaActual(g.querySelector('.galeria__pista')) + Number(el.dataset.mover));
      return;
    }
    if (el.dataset.ir !== undefined) { galeriaIr(el.closest('.galeria'), Number(el.dataset.ir)); return; }

  });

  document.addEventListener('change', ev => {
    if (ev.target.closest('.opcion')) sincronizarPrecio(ev.target.closest('.modal__opciones'));
  });

  // imagen que no existe todavía: se retira y queda el marcador con el nombre
  document.addEventListener('error', ev => {
    if (ev.target && ev.target.tagName === 'IMG') ev.target.remove();
  }, true);

  document.addEventListener('click', ev => {
    const id = ev.target.id;
    if (id === 'modal-cerrar') cerrarModal();
    else if (id === 'btn-espacio') $('#espacio').scrollIntoView({ behavior: 'smooth' });
    else if (id === 'btn-idioma') cambiarIdioma(S.lang === 'es' ? 'en' : 'es');
    else if (id === 'btn-arriba') window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Toda la tarjeta o la fila abre el detalle, no solo el nombre: en el
  // celular se toca la foto antes que el texto.
  document.addEventListener('click', ev => {
    if (ev.target.closest('[data-abrir],a,input,label')) return;
    const tarjeta = ev.target.closest('.tarjeta,.plato');
    if (!tarjeta) return;
    const p = prod(tarjeta.dataset.id);
    if (p) location.hash = '#/producto/' + p.slug;
  });

  // El boton de volver arriba aparece cuando ya hay carta arriba que recuperar.
  const btnArriba = $('#btn-arriba');
  let pidioArriba;
  window.addEventListener('scroll', () => {
    if (pidioArriba) return;
    pidioArriba = requestAnimationFrame(() => {
      pidioArriba = 0;
      btnArriba.classList.toggle('visible', window.scrollY > 600);
    });
  }, { passive: true });

  modal.addEventListener('click', ev => { if (ev.target === modal) cerrarModal(); });
  modal.addEventListener('close', () => {
    if (location.hash.indexOf('#/producto/') === 0) history.replaceState(null, '', location.pathname + location.search);
  });

  let debounce;
  $('#q').addEventListener('input', ev => {
    clearTimeout(debounce);
    const v = ev.target.value;
    debounce = setTimeout(() => { S.q = v.trim(); pintar(); }, 130);
  });

  window.addEventListener('hashchange', ruta);

  function medirTop() {
    document.documentElement.style.setProperty('--top-h', document.querySelector('.barra').offsetHeight + 'px');
  }
  window.addEventListener('resize', medirTop);

  /* ---------- arranque ---------- */

  (async () => {
    // la carta ya no arma pedidos ni guarda favoritos: se borra lo que quedo
    // de antes en el telefono de quien ya la habia abierto
    try { localStorage.removeItem('cc.cart'); localStorage.removeItem('cc.favs'); } catch (e) { /* modo privado */ }
    const elegido = leer(LLAVE.lang, null);
    const lang = elegido || ((navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es');
    try {
      S.cache.es = await cargar('es');
      S.datos = S.cache.es;
      if (lang === 'en') { try { S.datos = await cargar('en'); S.lang = 'en'; } catch (e) { S.lang = 'es'; } }
      aplicarTextos();
      pintarChips();
      pintarEspacio();
      pintar();
      medirTop();
      ruta();
    } catch (e) {
      $('#catalogo').innerHTML = '<p class="vacio">No pudimos cargar la carta. Revisa la conexión y vuelve a intentar.</p>';
    }

    // La carta queda guardada en el telefono: el segundo escaneo del codigo abre
    // de una y aguanta el wifi malo. Lo hace sw.js. Si el navegador es viejo o
    // se esta viendo por file://, sencillamente no pasa nada.
    // Se hace despues de pintar para no pelearle ancho de banda a las fotos.
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      const guardar = () => navigator.serviceWorker.register('sw.js')
        .catch(() => { /* sin guardar, y ya */ });
      if (document.readyState === 'complete') setTimeout(guardar, 1200);
      else window.addEventListener('load', () => setTimeout(guardar, 1200));
    }
  })();

})();
