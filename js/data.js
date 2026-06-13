/* =====================================================================
   CONFIGURACIÓN DE LA TIENDA — Car Seat Clinic Panamá
   ---------------------------------------------------------------------
   👉 Aquí cambias TODO lo importante sin tocar el resto del código.
   Edita los textos entre comillas. No borres las comillas ni las comas.
   ===================================================================== */

const CONFIG = {
  /* --- Datos del negocio --- */
  nombre: "Car Seat Clinic",
  eslogan: "Panamá",
  descripcion: "Seguridad infantil en cada viaje",

  /* --- Contacto --- */
  // Número de WhatsApp en formato internacional, SIN signos ni espacios.
  // Panamá = 507. Ejemplo: 50760000000
  whatsapp: "50760000000",
  email: "hola@carseatclinic.com",
  instagram: "https://www.instagram.com/carseatclinicc",
  ubicacion: "Ciudad de Panamá, Panamá",
  horario: "Lun a Sáb · 9:00 a.m. – 6:00 p.m.",

  /* --- Moneda --- */
  // Panamá usa el dólar (USD). Símbolo que se muestra junto a los precios.
  moneda: "$",
  codigoMoneda: "USD",

  /* --- Pago en línea con PayPal (opcional) ---
     1) Crea una cuenta de empresa en https://www.paypal.com
     2) Entra a https://developer.paypal.com → "Apps & Credentials"
     3) Copia tu "Client ID" (modo Live) y pégalo aquí abajo.
     Mientras esté vacío, el checkout usará WhatsApp como respaldo. */
  paypalClientId: "",
};

/* =====================================================================
   PRODUCTOS
   ---------------------------------------------------------------------
   Para CADA producto puedes editar: nombre, precio, categoria, descripcion.
   - categoria: usa una de estas → "sillas", "bases", "accesorios"
   - imagen: pega un enlace de foto (ej. "assets/silla1.jpg" o una URL).
             Si lo dejas vacío "", se muestra un dibujo automático.
   - badge:  etiqueta opcional (ej. "Más vendido", "Nuevo", "Oferta")
   - antes:  precio anterior tachado (opcional, para ofertas). 0 = sin oferta.
   Copia y pega un bloque { ... } para añadir más productos.
   ===================================================================== */

const PRODUCTOS = [
  {
    id: "p1",
    nombre: "Silla para bebé (Grupo 0+)",
    categoria: "sillas",
    precio: 189,
    antes: 0,
    badge: "Más vendido",
    imagen: "",
    descripcion:
      "Silla para recién nacidos de 0 a 13 kg. Reductor acolchado, instalación a contramarcha y manija de transporte.",
  },
  {
    id: "p2",
    nombre: "Silla convertible 360° (Grupo 0-1-2-3)",
    categoria: "sillas",
    precio: 329,
    antes: 379,
    badge: "Oferta",
    imagen: "",
    descripcion:
      "Acompaña al niño de 0 a 36 kg. Giro 360° para sentarlo fácil, contramarcha y respaldo reclinable.",
  },
  {
    id: "p3",
    nombre: "Booster con respaldo (Grupo 2-3)",
    categoria: "sillas",
    precio: 119,
    antes: 0,
    badge: "",
    imagen: "",
    descripcion:
      "Para niños de 15 a 36 kg. Eleva al niño para un cinturón seguro. Reposacabezas ajustable en altura.",
  },
  {
    id: "p4",
    nombre: "Base ISOFIX universal",
    categoria: "bases",
    precio: 99,
    antes: 0,
    badge: "",
    imagen: "",
    descripcion:
      "Instalación rápida y firme con anclajes ISOFIX. Indicadores de clic seguro y pata de apoyo regulable.",
  },
  {
    id: "p5",
    nombre: "Espejo retrovisor para bebé",
    categoria: "accesorios",
    precio: 24,
    antes: 0,
    badge: "Nuevo",
    imagen: "",
    descripcion:
      "Observa a tu bebé sin voltearte. Cristal de seguridad, ángulo ajustable y fácil de instalar.",
  },
  {
    id: "p6",
    nombre: "Protector de asiento antideslizante",
    categoria: "accesorios",
    precio: 29,
    antes: 0,
    badge: "",
    imagen: "",
    descripcion:
      "Cuida la tapicería de tu auto de marcas y suciedad. Material impermeable y fácil de limpiar.",
  },
  {
    id: "p7",
    nombre: "Reductor para recién nacido",
    categoria: "accesorios",
    precio: 19,
    antes: 0,
    badge: "",
    imagen: "",
    descripcion:
      "Cojín ergonómico que da soporte a la cabeza y el cuerpo del bebé en sus primeros meses.",
  },
  {
    id: "p8",
    nombre: "Parasol para ventana (pack x2)",
    categoria: "accesorios",
    precio: 16,
    antes: 22,
    badge: "Oferta",
    imagen: "",
    descripcion:
      "Bloquea los rayos del sol y protege la piel del bebé. Se adhiere sin pegamento y se quita sin marcas.",
  },
];

/* =====================================================================
   SERVICIOS
   ---------------------------------------------------------------------
   icono: usa un emoji. nombre / descripcion: edita libremente.
   precio: número, o usa el texto "desde" para mostrar "Desde $X".
   ===================================================================== */

const SERVICIOS = [
  {
    icono: "🔧",
    nombre: "Instalación profesional",
    precio: 25,
    desde: false,
    descripcion:
      "Instalamos tu silla correctamente según el peso y edad del niño, y te enseñamos a hacerlo tú mismo.",
  },
  {
    icono: "🛡️",
    nombre: "Revisión de seguridad",
    precio: 15,
    desde: false,
    descripcion:
      "Verificamos que tu silla esté bien anclada, sin holguras y dentro de su fecha de vida útil.",
  },
  {
    icono: "🧭",
    nombre: "Asesoría para elegir silla",
    precio: 0,
    desde: false,
    descripcion:
      "Te ayudamos a escoger la silla ideal según la edad, peso y el auto de tu familia. Sin costo al comprar.",
  },
  {
    icono: "✨",
    nombre: "Limpieza y desinfección",
    precio: 30,
    desde: true,
    descripcion:
      "Lavado profundo y desinfección de la silla. Devuelve la higiene y frescura sin dañar los materiales.",
  },
];
