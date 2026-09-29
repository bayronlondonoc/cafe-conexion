/* Café Conexión · la página del café (cafe.html)
   OJO: los datos de los dos cafés (origen, finca, variedad, proceso, altura, tueste y notas) son
   DE EJEMPLO, para diseñar la página. Se reemplazan por los reales antes de lanzar la web
   (PENDIENTES.md). Con "ejemplo": true, la vista previa los marca como «Datos de ejemplo».
   Las guías de los métodos y las proporciones de las bebidas son generales.
   Los precios salen de data/menu.js. */

window.CC_CAFE = {
  "cafes": [
    {
      "nombre": "Café de la casa",
      "uso": "Para el espresso y las bebidas con leche",
      "ejemplo": true,
      "origen": "Huila, Colombia",
      "finca": "Pequeños productores de Pitalito",
      "variedad": "Caturra y Castillo",
      "proceso": "Lavado",
      "altura": "1.650 – 1.800 m s. n. m.",
      "tueste": "Medio",
      "tueste_nivel": 3,
      "notas": ["Chocolate", "Panela", "Naranja"],
      "perfil": { "acidez": 3, "cuerpo": 4, "dulzor": 4 },
      "descripcion": "Redondo y dulce. Aguanta la leche sin perderse y en espresso deja un final de chocolate."
    },
    {
      "nombre": "Café de origen",
      "uso": "Para los métodos manuales",
      "ejemplo": true,
      "origen": "Nariño, Colombia",
      "finca": "Finca El Mirador, La Unión",
      "variedad": "Castillo",
      "proceso": "Honey",
      "altura": "1.900 – 2.100 m s. n. m.",
      "tueste": "Medio claro",
      "tueste_nivel": 2,
      "notas": ["Frutos rojos", "Miel", "Mandarina"],
      "perfil": { "acidez": 4, "cuerpo": 3, "dulzor": 4 },
      "descripcion": "Brillante y jugoso. En V60, Chemex u Origami se sienten la fruta y la miel."
    }
  ],

  // Guía general de cada método (cuerpo y acidez de 1 a 5).
  "guia_metodos": {
    "Prensa francesa": { "molienda": "Gruesa", "tiempo": "4 min", "proporcion": "1:15", "cuerpo": 5, "acidez": 2, "para": "Si te gusta el café con cuerpo." },
    "V60": { "molienda": "Media fina", "tiempo": "3 min", "proporcion": "1:16", "cuerpo": 3, "acidez": 4, "para": "Si quieres sentir la fruta del café." },
    "Sifón japonés": { "molienda": "Media", "tiempo": "3 – 4 min", "proporcion": "1:15", "cuerpo": 3, "acidez": 3, "para": "Si te gusta verlo: el agua sube y baja por el vidrio." },
    "Origami": { "molienda": "Media fina", "tiempo": "2 min 30 s", "proporcion": "1:16", "cuerpo": 2, "acidez": 5, "para": "Si buscas una taza ligera y brillante." },
    "Chemex": { "molienda": "Media gruesa", "tiempo": "4 min", "proporcion": "1:16", "cuerpo": 2, "acidez": 4, "para": "Si te gusta una taza limpia y suave." }
  },

  // Cómo se arma cada bebida, de abajo hacia arriba (porcentaje de la taza).
  "tazas": {
    "Espresso": [["espresso", 100]],
    "Americano": [["espresso", 30], ["agua", 70]],
    "Latte": [["espresso", 25], ["leche", 60], ["espuma", 15]],
    "Capuchino": [["espresso", 33], ["leche", 33], ["espuma", 34]],
    "Moccachino": [["chocolate", 20], ["espresso", 25], ["leche", 40], ["espuma", 15]],
    "Café con leche de almendras": [["espresso", 30], ["almendras", 70]]
  },

  // Platos de la sección «Café con licor» que no llevan café: no salen en esta página.
  "licor_sin_cafe": ["Mimosa clásica"],

  // Videos (por ejemplo, hechos con Higgsfield). Mientras estén en null, se ve la foto.
  // Formato y dónde guardarlos: README.md → «Videos». Prompts sugeridos: PENDIENTES.md → 6.
  "videos": {
    "portada": null,
    "metodos": null
  }
};
