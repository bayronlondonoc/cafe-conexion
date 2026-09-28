/* Café Conexión · la carta
   Un plato por línea. Para cambiar un precio, se cambia el número de "precio":
   sin puntos, sin signo de pesos y sin comillas (24900, no "$24.900").
   "desde": true muestra "desde $7.500". "destacado": true lo sube a Favoritos de la casa.
   "foto": ruta de la foto del favorito (ej. "assets/img/capuchino-cafe-conexion.webp"); null = pendiente.
   Instrucciones completas en README.md. */

window.CC_MENU = {
  "moneda": "COP",
  "nota_publica": "Precios en pesos colombianos.",
  "notas_legales_bar": [
    "El exceso de alcohol es perjudicial para la salud. Ley 30 de 1986.",
    "Prohíbase el expendio de bebidas embriagantes a menores de edad. Ley 124 de 1994."
  ],
  "grupos": [
    {
      "id": "cafe",
      "nombre": "Café",
      "secciones": [
        {
          "nombre": "Espresso y con leche",
          "items": [
            { "nombre": "Espresso", "descripcion": "Shot concentrado de café, extraído a presión.", "precio": 5000 },
            { "nombre": "Americano", "descripcion": "Espresso con agua caliente: una taza ligera y fluida.", "precio": 5000 },
            { "nombre": "Latte", "descripcion": "Espresso con leche vaporizada, suave y equilibrado.", "precio": 6500 },
            { "nombre": "Capuchino", "descripcion": "Espresso con espuma de leche densa y sedosa.", "precio": 7500, "desde": true, "destacado": true, "foto": "assets/img/capuchino.webp" },
            { "nombre": "Moccachino", "descripcion": "Café con chocolate oscuro fundido en leche cremosa.", "precio": 9000 },
            { "nombre": "Café con leche de almendras", "descripcion": "Café con bebida vegetal de almendras.", "precio": 11000 }
          ]
        },
        {
          "nombre": "Métodos manuales",
          "nota": "Para 2 tazas",
          "items": [
            { "nombre": "Prensa francesa", "descripcion": "Inmersión: cuerpo intenso, textura sedosa y los aceites naturales del café.", "precio": 15800, "foto": "assets/img/prensa-francesa.webp" },
            { "nombre": "V60", "descripcion": "Vertido circular: aromas vivos, notas dulces y acidez equilibrada.", "precio": 15800, "foto": "assets/img/v60.webp" },
            { "nombre": "Sifón japonés", "descripcion": "Una taza limpia y brillante.", "precio": 15800, "foto": "assets/img/sifon-japones.webp" },
            { "nombre": "Origami", "descripcion": "Taza limpia y luminosa, de perfil delicado.", "precio": 15800, "foto": "assets/img/origami.webp" },
            { "nombre": "Chemex", "descripcion": "Filtrado lento: taza limpia y suave, con notas florales y acidez brillante.", "precio": 15800, "foto": "assets/img/chemex.webp" }
          ]
        }
      ]
    },
    {
      "id": "frias",
      "nombre": "Bebidas frías",
      "secciones": [
        {
          "nombre": "Café frío",
          "items": [
            { "nombre": "Affogato", "descripcion": "Helado artesanal de vainilla con un shot de espresso caliente.", "precio": 12000 },
            { "nombre": "Cold brew", "descripcion": "Café de molienda gruesa infusionado en frío durante 24 horas: suave y naturalmente dulce.", "precio": 10800 },
            { "nombre": "Frappé de café", "descripcion": "Café frappé con salsa de chocolate, caramelo y crema chantilly.", "precio": 13500 },
            { "nombre": "Limonada de café", "descripcion": "Espresso con jugo natural de limón y panela.", "precio": 11500 },
            { "nombre": "Moka frío", "descripcion": "Espresso, leche cremosa y chocolate, con chantilly.", "precio": 13900 },
            { "nombre": "Orange coffee", "descripcion": "Café con la frescura de la naranja.", "precio": 13000 }
          ]
        },
        {
          "nombre": "Malteadas",
          "items": [
            { "nombre": "Malteada de Oreo", "descripcion": "Galleta Oreo y crema.", "precio": 16900 },
            { "nombre": "Malteada de café", "descripcion": "Con café tostado artesanal.", "precio": 16900 },
            { "nombre": "Malteada de Milo", "descripcion": "Milo y malta.", "precio": 16900 }
          ]
        },
        {
          "nombre": "Sodas y limonadas",
          "items": [
            { "nombre": "Soda saborizada", "descripcion": "Maracuyá, frutos rojos o mango biche.", "precio": 13900 },
            { "nombre": "Limonada de coco", "descripcion": "", "precio": 13900 },
            { "nombre": "Limonada natural", "descripcion": "", "precio": 9900 },
            { "nombre": "Limonada de cereza o hierbabuena", "descripcion": "", "precio": 11900 }
          ]
        }
      ]
    },
    {
      "id": "te",
      "nombre": "Té y matcha",
      "secciones": [
        {
          "nombre": "Té y matcha",
          "items": [
            { "nombre": "Latte matcha", "descripcion": "Matcha ceremonial con leche vaporizada.", "precio": 15800, "desde": true, "destacado": true, "foto": "assets/img/latte-de-matcha.webp" },
            { "nombre": "Té de leche dorada", "descripcion": "Leche con cúrcuma, jengibre y pimienta negra.", "precio": 13800 },
            { "nombre": "Té pu-erh", "descripcion": "Mezcla de té verde y rojo con jengibre y cola de caballo.", "precio": 9800 },
            { "nombre": "Té herbal", "descripcion": "Té rojo y té verde.", "precio": 7000 },
            { "nombre": "Té de flor de Jamaica", "descripcion": "Infusión de flor de Jamaica.", "precio": 7000 },
            { "nombre": "Infusión de frutas", "descripcion": "Frutos rojos o amarillos deshidratados, en infusión.", "precio": 7000 }
          ]
        }
      ]
    },
    {
      "id": "brunch",
      "nombre": "Brunch",
      "secciones": [
        {
          "nombre": "Brunch",
          "items": [
            { "nombre": "Wafles", "descripcion": "Queso crema, tocineta crujiente y miel de maple.", "precio": 26000, "desde": true, "destacado": true, "foto": "assets/img/waffles-con-tocineta.webp" },
            { "nombre": "Croissant", "descripcion": "Jamón de pavo, jamón ahumado de cerdo, queso búfala, tomate asado, aguacate y reducción de balsámico.", "precio": 22000 },
            { "nombre": "Croissant relleno", "descripcion": "Pollo o vegetales, lechuga, tocineta, salsa de pimientos y mozzarella.", "precio": 26000 },
            { "nombre": "Huevos al gusto", "descripcion": "Con 2 toppings (sofrito, maicitos, mozzarella, jamón, tocineta o brócoli) y arepa o tostada de masa madre.", "precio": 15900 },
            { "nombre": "Tostada de aguacate", "descripcion": "Masa madre, puré de aguacate, huevos revueltos, tocineta y cebolla puerro.", "precio": 18000 },
            { "nombre": "Bowl de yogur", "descripcion": "Yogur griego o kéfir, granola, arándanos, fresa y miel.", "precio": 18000 },
            { "nombre": "Tostada de masa madre", "descripcion": "Tomate asado o cherry, huevos revueltos, queso búfala y pesto.", "precio": 20000 },
            { "nombre": "Bowl salad", "descripcion": "Mix de lechugas, balsámico, tomate cherry, champiñones, mango, puerro caramelizado, lentejas crocantes y pollo teriyaki.", "precio": 36000 },
            { "nombre": "Ensalada César", "descripcion": "Lechugas frescas, pechuga de pollo, parmesano, aderezo César, tomate cherry y crotones a las finas hierbas.", "precio": 26000, "desde": true, "destacado": true, "foto": "assets/img/ensalada-cesar.webp" }
          ]
        }
      ]
    },
    {
      "id": "cocina",
      "nombre": "Cocina",
      "secciones": [
        {
          "nombre": "Entradas",
          "items": [
            { "nombre": "Pan de masa madre", "descripcion": "Rebanadas de masa madre o tostadas con finas hierbas, queso crema, tomate asado, albahaca, reducción de balsámico y sal marina. 5 porciones.", "precio": 12000, "desde": true, "destacado": true, "foto": "assets/img/pan-de-masa-madre.webp" },
            { "nombre": "Patacones", "descripcion": "Patacón crocante con guacamole fresco y hogao. 5 porciones.", "precio": 15000 },
            { "nombre": "Nachos", "descripcion": "400 g con guacamole, salsa agria, cebolla encurtida, frijol refrito y salsa picante tatemada.", "precio": 18000 }
          ]
        },
        {
          "nombre": "Hamburguesas",
          "items": [
            { "nombre": "Burger Conexión", "descripcion": "Carne artesanal de 150 g, cheddar, tocineta, cebolla caramelizada, lechuga cogollo y salsa secreta en pan brioche.", "precio": 24900 },
            { "nombre": "Burger tropical", "descripcion": "Carne artesanal, tocineta, puerro caramelizado, queso para asar y piña asada con tajín, en pan brioche.", "precio": 35000 },
            { "nombre": "Burger de lenteja", "descripcion": "Carne vegetal de lentejas en pan de masa madre, mozzarella light, tomate asado, lechugas, reducción de pimentón con miel y salsa de la casa.", "precio": 38000 }
          ]
        },
        {
          "nombre": "Pizzas personales",
          "nota": "Porción personal",
          "items": [
            { "nombre": "Americana", "descripcion": "Pepperoni, salsa napolitana y mozzarella.", "precio": 24000 },
            { "nombre": "Hawaiana", "descripcion": "Piña calada, jamón, salsa napolitana y mozzarella.", "precio": 24000 },
            { "nombre": "Ibérica", "descripcion": "Chorizo español, dátiles, aceitunas, salsa napolitana y mozzarella.", "precio": 24000 },
            { "nombre": "Toscana", "descripcion": "Manzana caramelizada, queso azul, almendras, salsa pesto y mozzarella.", "precio": 24000 },
            { "nombre": "Catalana", "descripcion": "Pepperoni, salami, cábano, salsa napolitana y mozzarella.", "precio": 24000 },
            { "nombre": "Napolitana", "descripcion": "Tomates secos, queso búfala, albahaca, salsa napolitana y mozzarella.", "precio": 24000 }
          ]
        },
        {
          "nombre": "Pastas y más",
          "items": [
            { "nombre": "Ensalada tipo sushi", "descripcion": "Salmón marinado, surimi, aguacate y pepino sobre arroz avinagrado, alga nori, reducción de teriyaki con café y semillas de sésamo.", "precio": 40000, "desde": true, "destacado": true, "foto": "assets/img/ensalada-de-salmon-estilo-sushi.webp" },
            { "nombre": "Pasta a tu gusto", "descripcion": "Spaghetti o penne, 2 proteínas. Salsa: napolitana casera, Alfredo o pesto de albahaca. Proteína: pollo a la plancha o salmón. Incluye ensalada de lechuga y tomate cherry.", "precio": 25000, "desde": true, "destacado": true, "foto": "assets/img/pasta-a-tu-gusto.jpg" },
            { "nombre": "Sándwich vegano", "descripcion": "Croissant con lechuga, tomates asados, cebolla caramelizada, brócoli y champiñones.", "precio": 20000 }
          ]
        },
        {
          "nombre": "Combos",
          "items": [
            { "nombre": "Combo burger", "descripcion": "Burger Conexión + papas + gaseosa.", "precio": 30900 },
            { "nombre": "Combo burger y cerveza", "descripcion": "Burger Conexión + cerveza Club Colombia.", "precio": 35000 },
            { "nombre": "Combo vino", "descripcion": "2 copas de vino + porción de papas nativas.", "precio": 40000 },
            { "nombre": "Combo café y croissant", "descripcion": "Americano + croissant de jamón y queso.", "precio": 12500 }
          ]
        }
      ]
    },
    {
      "id": "horno",
      "nombre": "Horno y postres",
      "secciones": [
        {
          "nombre": "Horneados",
          "items": [
            { "nombre": "Empanada argentina", "descripcion": "Carne sazonada con hierbas aromáticas y sofrito, en masa crujiente horneada.", "precio": 8500 },
            { "nombre": "Pastel de arequipe y queso", "descripcion": "Queso fresco y arequipe artesanal.", "precio": 8500 },
            { "nombre": "Pastel de pollo con verduras", "descripcion": "Pollo desmechado, zanahoria, arvejas y especias suaves.", "precio": 8500 },
            { "nombre": "Pastel de tres quesos", "descripcion": "Relleno cremoso de quesos con un toque de tocineta.", "precio": 8500 },
            { "nombre": "Empanada de espinaca", "descripcion": "Espinaca fresca con queso suave.", "precio": 8500 },
            { "nombre": "Pastel de jamón y queso", "descripcion": "", "precio": 8500 },
            { "nombre": "Rollos de canela", "descripcion": "", "precio": 4000 },
            { "nombre": "Horneados del día", "descripcion": "Variedad del día.", "precio": 6000 }
          ]
        },
        {
          "nombre": "Postres",
          "items": [
            { "nombre": "Tortas", "descripcion": "Zanahoria, red velvet o chocolate.", "precio": 10000 },
            { "nombre": "Waffle con helado", "descripcion": "Helado de vainilla, salsa de arequipe, frutos rojos y Nutella.", "precio": 16000 },
            { "nombre": "Arroz con leche o tres leches", "descripcion": "El tres leches se sirve bañado en mezcla de tres leches y crema ligera.", "precio": 12000 }
          ]
        }
      ]
    },
    {
      "id": "bar",
      "nombre": "Bar",
      "secciones": [
        {
          "nombre": "Café con licor",
          "items": [
            { "nombre": "Café irlandés", "descripcion": "Espresso largo, whisky, crema de leche y chantilly.", "precio": 11500 },
            { "nombre": "Carajillo", "descripcion": "Café de la casa con brandy o aguardiente.", "precio": 7500 },
            { "nombre": "Frapuchino con licor", "descripcion": "Café, leche, crema y chocolate con Amaretto o Baileys.", "precio": 16000 },
            { "nombre": "Capuchino con licor", "descripcion": "Espresso y leche vaporizada con canela, y Amaretto o Baileys.", "precio": 10500 },
            { "nombre": "Café bombón", "descripcion": "Espresso largo sobre leche condensada.", "precio": 9500 },
            { "nombre": "Mimosa clásica", "descripcion": "", "precio": 13900 }
          ]
        },
        {
          "nombre": "Cócteles",
          "items": [
            { "nombre": "Mojito", "descripcion": "Ron blanco, hierbabuena fresca y lima.", "precio": 25000 },
            { "nombre": "Margarita", "descripcion": "Tequila, licor de naranja y borde de sal marina.", "precio": 25000 },
            { "nombre": "Moscow mule", "descripcion": "Vodka, cerveza de jengibre artesanal y limón.", "precio": 25000 },
            { "nombre": "Espresso martini", "descripcion": "Vodka, licor de café y un shot de espresso recién extraído.", "precio": 25000 },
            { "nombre": "Mimosa", "descripcion": "Espumante con jugo de naranja, frutos rojos o amarillos.", "precio": 19900 }
          ]
        },
        {
          "nombre": "Cervezas, vino y más",
          "items": [
            { "nombre": "Michelada", "descripcion": "Cerveza fría con limón y sal.", "precio": 8000 },
            { "nombre": "Copa de vino", "descripcion": "Tinto, blanco o rosado de la casa.", "precio": 14000 },
            { "nombre": "Cerveza importada", "descripcion": "Corona · Stella Artois", "precio": 9000 },
            { "nombre": "Cerveza nacional", "descripcion": "Águila Light · Poker · Águila Original", "precio": 5000 },
            { "nombre": "Cerveza premium nacional", "descripcion": "Club Colombia Dorada, Roja o Negra", "precio": 7500 },
            { "nombre": "Copa de sangría", "descripcion": "", "precio": 18000 },
            { "nombre": "Jarra de sangría", "descripcion": "", "precio": 100000 },
            { "nombre": "Gaseosa 350 ml", "descripcion": "", "precio": 5000 }
          ]
        }
      ]
    }
  ]
};
