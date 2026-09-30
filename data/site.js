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

    // La carta vive en la carpeta menu/ de esta misma web y se abre en otra pestaña.
    // Con el dominio queda en https://cafeconexion.com/menu/ sin cambiar esta línea.
    "menu_url": "menu/",

    "whatsapp": { "numero": "573186545916", "visible": "318 654 5916" },
    "mensajes_whatsapp": {
      "general": "Hola, Café Conexión. Vi su página web y quiero más información.",
      "menu": "Hola, Café Conexión. Tengo una pregunta sobre el menú.",
      "cafe": "Hola, Café Conexión. Tengo una pregunta sobre sus cafés.",
      "fit": "Hola, Café Conexión. Quiero pedir de la línea Fit.",
      "taller": "{saludo} Vi en {web} el taller «{taller}» del {cuando}. Quiero reservar {cupos}. Mi nombre es {nombre}. {nota}",
      "sesion": "{saludo} Vi en {web} la sesión «{taller}». Quiero agendarla para el {fecha}, {franja}. Mi nombre es {nombre}. {nota}",
      "taller_propuesta": "Hola, Café Conexión. Quiero proponer un taller en el café.",
      "reserva": "Hola, Café Conexión. Quiero reservar para {personas} el {fecha} a las {hora}. Mi nombre es {nombre}. {nota}",
      "contacto": "Hola, Café Conexión. Soy {nombre}. {mensaje}"
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
    "resenas": { "publicar": false, "items": [] },
    // Eventos: { "titulo", "fecha", "hora", "detalle", "cover", "estado": "proximo" | "agotado" | "finalizado" }
    "preguntas": {
      "publicar": false,
      "items": [
        { "p": "¿Se puede reservar?", "r": null },
        { "p": "¿Hacen domicilios o pedidos para llevar?", "r": null },
        { "p": "¿Tienen parqueadero?", "r": null },
        { "p": "¿Aceptan mascotas?", "r": null },
        { "p": "¿Qué medios de pago reciben?", "r": null },
        { "p": "¿Hay wifi para trabajar?", "r": null }
      ]
    }
  },

  "seo": {
    "url": null,
    "imagen": null,
    "tipo": "CafeOrCoffeeShop",
    "servesCuisine": ["Café de especialidad", "Brunch", "Hamburguesas", "Pizzas", "Cócteles"],
    "priceRange": "$$"
  }
};
