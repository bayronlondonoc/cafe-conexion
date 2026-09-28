/* Café Conexión · datos del negocio
   Todo lo que la web dice del negocio sale de este archivo: el HTML no los repite.
   null = dato pendiente. En modo preview se ve marcado como PENDIENTE; en producción no aparece.
   Cómo llenar cada campo: README.md. Lo que falta: PENDIENTES.md. */

window.CC_SITE = {
  "negocio": {
    "nombre": "Café Conexión",
    "direccion": "Cl. 49 #78A-21",
    "zona": "Sector Estadio, Medellín",
    "zona_seo": "La Floresta, Laureles – Estadio, Medellín, Antioquia",
    "ciudad": "Medellín",
    "departamento": "Antioquia",
    "pais": "CO",
    "maps_url": "https://maps.google.com/?q=Cl.+49+%2378a-21,+La+Floresta,+Medell%C3%ADn,+Laureles,+Antioquia",
    "coordenadas": { "lat": null, "lng": null },

    "whatsapp": { "numero": "573186545916", "visible": "318 654 5916" },
    "mensajes_whatsapp": {
      "general": "Hola, Café Conexión. Vi su página web y quiero más información.",
      "menu": "Hola, Café Conexión. Tengo una pregunta sobre el menú.",
      "reserva": "Hola, Café Conexión. Quiero reservar para {personas} personas el {fecha} a las {hora}. Mi nombre es {nombre}. {nota}"
    },

    "redes": { "instagram": null, "tiktok": null },
    "google_perfil_url": null,
    "google_resena_url": null,

    "horarios": {
      "zona_horaria": "America/Bogota",
      "dias": { "lun": null, "mar": null, "mie": null, "jue": null, "vie": null, "sab": null, "dom": null },
      "festivos": null
    },

    "servicios": {
      "reservas": null,
      "domicilios": null,
      "para_llevar": null,
      "eventos_privados": null,
      "wifi_para_trabajar": null,
      "mascotas": null,
      "parqueadero": null,
      "medios_de_pago": null
    },

    "credito_desarrollo": { "texto": null, "url": null }
  },

  "secciones": {
    "nosotros": { "publicar": false, "foto": null, "capitulos": [], "cita": null },
    "resenas": { "publicar": false, "items": [] }
  },

  "seo": {
    "url": null,
    "imagen": null,
    "tipo": "CafeOrCoffeeShop",
    "servesCuisine": ["Café de especialidad", "Brunch", "Hamburguesas", "Pizzas", "Cócteles"],
    "priceRange": "$$"
  }
};
