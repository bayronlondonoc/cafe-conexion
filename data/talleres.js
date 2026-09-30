/* Café Conexión · talleres (talleres.html y la sección «Próximos talleres» del inicio)
   Cómo funciona:
   - Un taller con fecha sale en «Próximos talleres» (aquí y en el inicio) hasta que termina.
     Después pasa solo a «Ya pasaron», sin botón de reserva. No hay que borrarlo.
   - Una sesión con cita ("tipo": "sesion") no tiene fecha: sale siempre en «Sesiones con cita».
   - "fecha": AAAA-MM-DD. "inicio" y "fin": hora de 24 h ("16:00"), hora de Colombia.
   - "whatsapp": el número que recibe las reservas de ese taller, con 57 y sin espacios.
     Con null, las reservas llegan al WhatsApp del café.
   - "agotado": true muestra «Cupos agotados» y quita el botón de reservar.
   - "cartel": el afiche, en assets/talleres/. "cartel_ancho" y "cartel_alto": su tamaño.
   Los textos son neutros a propósito: la web del café no usa lenguaje holístico (PENDIENTES → 8). */

window.CC_TALLERES = {
  "talleres": [
    {
      "id": "estructuras-para-comunicar",
      "tipo": "taller",
      "titulo": "Estructuras para comunicar con claridad",
      "frase": "Ordena tus ideas y potencia tu mensaje.",
      "descripcion": "Taller presencial de oratoria: estructuras para ordenar lo que quieres decir y decirlo con claridad.",
      "orienta": "Erving La Voz, mentor en oratoria",
      "fecha": "2026-10-01",
      "inicio": "16:00",
      "fin": "20:00",
      "incluye": "Bebidas y sándwich gourmet",
      "precio": 70000,
      "precio_nombre": "Inversión",
      "cupos_limitados": true,
      "agotado": false,
      "whatsapp": "573027581772",
      "cartel": "assets/talleres/estructuras-para-comunicar.jpg",
      "cartel_ancho": 720,
      "cartel_alto": 1080,
      "alt": "Afiche del taller Estructuras para comunicar con claridad, con la foto de Erving La Voz"
    },
    {
      "id": "del-duelo-a-la-manifestacion",
      "tipo": "taller",
      "titulo": "Del duelo a la manifestación",
      "frase": "Pasa del dolor a la paz.",
      "descripcion": "Encuentro presencial para hablar del duelo y de cómo seguir adelante después de una pérdida.",
      "orienta": "@nataliagutierrezmentoradevida y @marceconecta",
      "instagram": ["nataliagutierrezmentoradevida", "marceconecta"],
      "fecha": "2026-10-17",
      "inicio": "08:30",
      "fin": "12:30",
      "precio": 187000,
      "precio_nombre": "Valor",
      "cupos_limitados": true,
      "agotado": false,
      "whatsapp": null,
      "cartel": "assets/talleres/del-duelo-a-la-manifestacion.jpg",
      "cartel_ancho": 686,
      "cartel_alto": 1024,
      "alt": "Afiche del encuentro Del duelo a la manifestación: el rostro de una mujer entre estrellas y flores"
    },
    {
      "id": "experiencia-agalma",
      "tipo": "sesion",
      "titulo": "Experiencia Agalma",
      "descripcion": "Sesión personal de autoconocimiento con Elita, coach y terapeuta, basada en su metodología Agalma, que parte de tu fecha de nacimiento.",
      "orienta": "Elita, coach y terapeuta",
      "duracion": "1 hora",
      "precio": 160000,
      "precio_nombre": "Valor",
      "whatsapp": "573196898946",
      "cartel": "assets/talleres/experiencia-agalma.jpg",
      "cartel_ancho": 720,
      "cartel_alto": 693,
      "alt": "Afiche de la Experiencia Agalma: una taza de café con arte latte junto a una planta"
    },
    {
      "id": "meditacion-amar-incondicionalmente",
      "tipo": "taller",
      "titulo": "Meditación: ¿qué es amar incondicionalmente?",
      "descripcion": "Meditación guiada en el café.",
      "orienta": "Felipe Giraldo",
      "fecha": "2026-09-22",
      "inicio": "18:00",
      "fin": null,
      "precio": 20000,
      "precio_nombre": "Aporte",
      "whatsapp": null,
      "cartel": "assets/talleres/meditacion-amar-incondicionalmente.jpg",
      "cartel_ancho": 200,
      "cartel_alto": 300,
      "alt": "Afiche de la meditación ¿Qué es amar incondicionalmente?"
    }
  ]
};
