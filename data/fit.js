/* Café Conexión · la página Fit (fit.html)
   Productos y precios del volante de la línea Fit (29-sep-2026).
   Cambiar un precio: el número de "precio", sin puntos, sin signo de pesos y sin comillas.
   Los combos calculan solos el precio por separado y cuánto se ahorra.
   "grupo": tomar o comer (la sección donde sale). "tipo": bebida o waffle (el ícono de los
   combos). "corto": el nombre que se usa en los combos. "color": el punto de cada sabor.
   Los atributos (sin azúcar, sin lácteos, proteína) se confirman con la dueña (PENDIENTES → 7). */

window.CC_FIT = {
  "productos": [
    {
      "id": "malteada",
      "grupo": "tomar",
      "tipo": "bebida",
      "nombre": "Malteadas proteicas",
      "corto": "Malteada",
      "descripcion": "Cinco sabores, el mismo precio.",
      "atributos": ["Sin azúcar", "Sin lácteos", "18 g de proteína"],
      "sabores": [
        { "nombre": "Avellana de chocolate", "color": "#6B4028" },
        { "nombre": "Canela", "color": "#B8733A" },
        { "nombre": "Crocante de Oreo", "color": "#2B2A2A" },
        { "nombre": "Fresa", "color": "#E0475B" },
        { "nombre": "Frutos rojos", "color": "#9E2A4B" }
      ],
      "precio": 18000,
      "foto": "assets/img/fit-malteada.jpg",
      "alt": "Tres malteadas proteicas: fresa, avellana con chocolate y canela"
    },
    {
      "id": "soda",
      "grupo": "tomar",
      "tipo": "bebida",
      "nombre": "Sodas",
      "corto": "Soda",
      "descripcion": "Tres sabores, el mismo precio.",
      "sabores": [
        { "nombre": "Limón", "color": "#9CC43A" },
        { "nombre": "Mandarina", "color": "#F28C28" },
        { "nombre": "Mango biche con Tajín", "color": "#D9B52C" }
      ],
      "precio": 15000,
      "foto": "assets/img/fit-soda.jpg",
      "alt": "Tres sodas con hielo: limón, mandarina y mango biche con borde de sal y chile"
    },
    {
      "id": "waffle-dulce",
      "grupo": "comer",
      "tipo": "waffle",
      "nombre": "Waffles dulces",
      "corto": "Waffle dulce",
      "atributos": ["Sin azúcar", "15 g de proteína"],
      "sabores": [
        { "nombre": "Canela", "color": "#B8733A" },
        { "nombre": "Dulce de leche", "color": "#C98A3E" }
      ],
      "nota": "Con fruta y chantilly",
      "precio": 22000,
      "foto": "assets/img/fit-waffle-dulce.jpg",
      "alt": "Waffle con fresas, arándanos y banano, crema chantilly y canela"
    },
    {
      "id": "bono-salado",
      "grupo": "comer",
      "tipo": "waffle",
      "nombre": "Waffle bono salado",
      "corto": "Waffle bono salado",
      "descripcion": "Sándwich de jamón serrano y queso.",
      "precio": 25000,
      "foto": "assets/img/fit-bono-salado.jpg",
      "alt": "Sándwich de waffle de jamón serrano y queso, partido por la mitad"
    },
    {
      "id": "bono-dulce",
      "grupo": "comer",
      "tipo": "waffle",
      "nombre": "Waffle bono dulce",
      "corto": "Waffle bono dulce",
      "descripcion": "Con salsa de arequipe.",
      "precio": 20000,
      "foto": "assets/img/fit-bono-dulce.jpg",
      "alt": "Waffle con salsa de arequipe"
    }
  ],

  // Cada combo: los productos que incluye (por su "id") y el precio del combo.
  "combos": [
    { "incluye": ["malteada", "waffle-dulce"], "precio": 36000 },
    { "incluye": ["soda", "waffle-dulce"], "precio": 34000 },
    { "incluye": ["malteada", "bono-salado"], "precio": 40000 },
    { "incluye": ["malteada", "bono-dulce"], "precio": 35000 },
    { "incluye": ["soda", "bono-salado"], "precio": 37000 }
  ]
};
