/* Café Conexión — la carta sin señal.
   Guarda la carta en el teléfono de quien ya la abrió: el segundo escaneo del
   código QR abre de una, y sigue abriendo aunque el wifi o los datos fallen.

   Regla: primero se muestra lo guardado y al mismo tiempo se pide la versión
   nueva por detrás, que queda lista para la próxima vez. Así nadie espera y
   un precio corregido entra solo, sin tocar este archivo.

   Esto no se edita para cambiar la carta. Los precios y los platos viven en
   data/menu.json. */

// El número de CACHE sube con cada diseño nuevo (igual que el ?v= de index.html):
// al activarse, este archivo borra lo guardado con el número anterior.
const CACHE = 'carta-v2';
const FOTOS = 'carta-fotos-v1';
const TOPE_FOTOS = 160; // cabe lo que alguien alcanza a mirar en una visita

// Lo mínimo para que la carta abra sola: la página, el estilo, el programa y
// los datos. Las fotos se van guardando a medida que se miran.
const BASE = [
  './',
  'index.html',
  'assets/css/carta.css?v=2',
  'assets/js/carta.js?v=2',
  'data/menu.json',
  'assets/img/espacio.webp',
  'assets/img/colibri.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(BASE))
      .catch(() => { /* si una falla, la carta igual funciona por red */ })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(llaves => Promise.all(
        llaves.filter(k => k !== CACHE && k !== FOTOS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Se deja lo último que se miró y se bota lo más viejo: la carpeta de fotos no
// crece sin control en un teléfono ajeno.
async function recortar(nombre, tope) {
  const c = await caches.open(nombre);
  const llaves = await c.keys();
  if (llaves.length <= tope) return;
  await Promise.all(llaves.slice(0, llaves.length - tope).map(k => c.delete(k)));
}

async function guardadoYFresco(req, nombre, tope) {
  const c = await caches.open(nombre);
  const guardado = await c.match(req);
  const red = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) {
      c.put(req, res.clone()).then(() => { if (tope) recortar(nombre, tope); });
    }
    return res;
  }).catch(() => null);
  return guardado || red.then(r => r || Response.error());
}

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const propio = url.origin === location.origin;
  const letras = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!propio && !letras) return;

  // Escribir la dirección a mano o abrir el QR: siempre se responde la carta,
  // aunque en ese momento no haya señal.
  if (req.mode === 'navigate') {
    ev.respondWith(
      guardadoYFresco(req, CACHE).catch(() => caches.match('index.html')));
    return;
  }

  // La carta puede vivir en una carpeta (…/menu/): la foto se reconoce por la
  // carpeta assets/img/ que está junto a este archivo, esté donde esté.
  const esFoto = propio && url.href.indexOf(new URL('assets/img/', self.registration.scope).href) === 0;
  ev.respondWith(esFoto
    ? guardadoYFresco(req, FOTOS, TOPE_FOTOS)
    : guardadoYFresco(req, CACHE));
});
