/* =====================================================================
   CONFIGURACIÓN — Car Seat Clinic Panamá
   ---------------------------------------------------------------------
   👉 Edita SOLO el texto entre comillas. No borres comillas ni comas.
   Los PRODUCTOS y el STOCK ya NO se editan aquí: se manejan desde la
   base de datos (panel de administrador o Supabase). Los de abajo son
   solo un respaldo de muestra por si la base de datos no está conectada.
   ===================================================================== */

const CONFIG = {
  /* --- Datos del negocio --- */
  nombre: "Car Seat Clinic",
  eslogan: "Center",

  /* --- Contacto --- */
  // WhatsApp en formato internacional, SIN signos. Panamá = 507.
  whatsapp: "50766743012",
  email: "info@carseatclinic.com.pa",
  // Cuenta principal (servicios, educación, comunidad)
  instagram: "https://www.instagram.com/carseatclinicc",
  // Cuenta de la tienda (productos a la venta)
  instagramTienda: "https://www.instagram.com/carseatclinic.shop",
  // Página de Facebook del negocio
  facebook: "https://www.facebook.com/mibbshower",
  ubicacion: "PH City Towers, Vía España · Ciudad de Panamá",
  horario: "Lun a Sáb · 9:00 a.m. – 6:00 p.m.",
  // Dirección que se muestra en el mapa. Cambia por la dirección real
  // (puedes poner el nombre del local o una dirección exacta).
  mapsQuery: "Car Seat Clinic Center, PH City Towers, Vía España, Panamá",
  // Enlace de Waze para "cómo llegar" (QR junto al mapa). Si lo dejas vacío,
  // se arma con la ubicación. Lo ideal: pon el enlace exacto de tu local
  // (en Waze: compartir → copiar enlace) o coordenadas.
  wazeUrl: "",
  // Enlace directo para DEJAR una reseña en Google. Cómo sacarlo: entra a
  // Google Maps → busca tu negocio → botón "Escribir una reseña" → copia el
  // enlace del navegador y pégalo aquí. Si lo dejas vacío, se abre tu ficha
  // de Google Maps (usando mapsQuery) para que el cliente reseñe desde ahí.
  googleReviewUrl: "",

  /* --- Moneda --- */
  moneda: "$",
  codigoMoneda: "USD",

  /* --- Base de datos + login (Supabase) ---
     Pega aquí los datos de tu proyecto Supabase (mira la guía del README).
     Mientras estén vacíos, la tienda funciona en "modo demo" con los
     productos de muestra y sin login real. */
  supabaseUrl: "https://fahqjwnwoznaerrwgdmc.supabase.co",
  supabaseAnonKey: "sb_publishable_e52thJbAZrWPpq4KJOsaRg_KrHEuNcC",

  /* --- PayPal (opcional, pago con tarjeta) --- */
  paypalClientId: "",

  /* --- Pago en línea con pasarela del banco (BAC / Tilopay) ---
     Estructura lista. Ponlo en activo:true cuando tengas la cuenta de comercio
     y hayas configurado la Edge Function en Supabase (ver PAGOS.md).
     ⚠️ Las CLAVES SECRETAS NO van aquí (este archivo es público): van en
     los "secrets" de Supabase. */
  pago: {
    activo: false,
    etiqueta: "Pagar con tarjeta",
  },

  /* --- Chat / asistente ---
     Hoy el sitio responde con el asistente inteligente local (gratis, sin llave).
     Para la IA real GRATIS: saca una llave en https://aistudio.google.com/apikey,
     corre `supabase secrets set GEMINI_API_KEY=AIza...`, luego
     `supabase functions deploy asistente` y pon iaActiva en true.
     Cambia guardarConversaciones a true cuando corras supabase-chat.sql. */
  chat: {
    iaActiva: true,
    guardarConversaciones: true,
    funcion: "super-service", // nombre de la Edge Function en Supabase
    // El asistente local es el que atiende la web: responde de forma breve y
    // deriva cotizaciones/casos a WhatsApp. Déjalo en false para que una IA
    // remota no vuelva a reemplazarlo por respuestas largas o imprecisas.
    respuestasRemotasEnChat: false,
  },

  /* --- CRM inteligente / agenda ---
     Cambia guardarSolicitudes a true cuando corras supabase-crm-atencion.sql.
     Mientras este en false, las citas y casos se guardan en este navegador
     para probar el flujo sin errores de Supabase. */
  crm: {
    guardarSolicitudes: true,
  },

  /* --- Alquiler con fechas publicadas ---
     La administradora agrega desde el CRM únicamente los periodos y horarios
     que realmente puede atender. La web no ofrece un calendario libre: la
     familia solo puede solicitar una de esas disponibilidades. */
  alquiler: {
    equipos: [
      "Silla de carro",
      "Booster",
      "Coche / stroller",
      "Corral / pack n play",
      "Varios equipos",
    ],
    horariosSugeridos: ["9:00 a.m.", "11:00 a.m.", "2:00 p.m.", "4:30 p.m."],
  },

  /* --- Administradores ---
     Quien inicie sesión con uno de estos correos entra al panel (puede editar
     productos, stock y pedidos). Puedes agregar más separados por coma.

     🔒 La CONTRASEÑA nunca se escribe aquí. Este archivo es público (cualquiera
     puede leerlo en GitHub), así que la clave vive solo en Supabase. Para entrar
     al panel: abre admin.html e inicia sesión con tu correo y tu contraseña, o
     con el botón de Google. Si olvidas la clave, se cambia desde Supabase →
     Authentication → Users. */
  adminEmails: ["luislassogonzalez@gmail.com", "sripanama1@gmail.com"],
};

/* =====================================================================
   GRUPOS DE PRODUCTOS (menú de la tienda y del panel)
   ---------------------------------------------------------------------
   La tienda separa los productos en estos GRUPOS (como pidió la clienta).
   Cada grupo agrupa una o varias "categorías" (el campo `categoria` de
   cada producto). Para AGREGAR un grupo o mover una categoría, edita
   solo esta lista: el menú de arriba, los filtros de la tienda y el
   desplegable del panel se arman a partir de aquí.
   ===================================================================== */
const CATEGORIAS = {
  "recien-nacidos": "Recién nacidos",
  "convertibles":   "Convertible",
  "giro-360":       "Silla 360°",
  "combinadas":     "Combinada",
  "booster":        "Booster",
  "sillas-comer":   "Silla de comer",
  "dormir":         "A dormir",
  "accesorios":     "Accesorio",
  "limpieza":       "Limpieza",
  "gift-cards":     "Gift Card",
};
const GRUPOS = [
  { id: "sillas-auto",  label: "Sillas de auto",  cats: ["recien-nacidos", "convertibles", "giro-360", "combinadas", "booster"] },
  { id: "sillas-comer", label: "Sillas de comer", cats: ["sillas-comer"] },
  { id: "dormir",       label: "A dormir",        cats: ["dormir"] },
  { id: "accesorios",   label: "Accesorios",      cats: ["accesorios", "limpieza", "gift-cards"] },
];

/* =====================================================================
   FOTOS DE LA GUÍA POR ETAPAS ("¿Qué silla le toca a tu pequeño?")
   ---------------------------------------------------------------------
   Cada etapa de la portada muestra una foto debajo de su descripción.
   👉 PARA CAMBIARLAS: sube la foto a assets/guia/ y cambia la ruta aquí.
   Lo ideal son fotos cercanas y reales (un bebé en su silla, un niño en
   el booster…) porque conectan mucho más que la foto del producto solo.
   Se ven mejor en horizontal (por ejemplo 800x600).
   Si dejas una vacía (""), esa etapa simplemente no muestra foto.
   ===================================================================== */
const GUIA_ETAPAS = {
  "recien-nacidos": "assets/guia/recien-nacido.jpg",
  "convertibles":   "assets/guia/convertible.jpg",
  "combinadas":     "assets/guia/combinada.jpg",
  "booster":        "assets/guia/booster.jpg",
};

/* =====================================================================
   IMÁGENES POR CATEGORÍA (de respaldo)
   ---------------------------------------------------------------------
   Si un producto no tiene foto propia, se usa esta según su categoría.
   Así la tienda se ve con fotos SIN tener que editar la base de datos.
   Cambia los enlaces por los que quieras (o sube fotos en el panel).
   ===================================================================== */
const IMAGENES_CATEGORIA = {
  // Rutas locales (relativas): funcionan en cualquier dominio y no se rompen.
  "recien-nacidos": "assets/productos/inv01-1.jpg",
  "convertibles":   "assets/productos/inv04-1.jpg",
  "giro-360":       "assets/productos/inv08-1.jpg",
  "combinadas":     "assets/productos/inv11-1.jpg",
  "booster":        "assets/productos/inv12-1.jpg",
  // accesorios, limpieza y gift-cards usan ilustración si no pones foto
};

/* =====================================================================
   INSTAGRAM — "Lo último que publicamos"
   ---------------------------------------------------------------------
   Esta sección sale en la portada y muestra las publicaciones de la
   cuenta OFICIAL (@carseatclinicc), no la de la tienda.

   👉 FORMA RECOMENDADA (sin tocar código): entra al CRM → Instagram,
      pega el enlace de la publicación y elige si se muestra arriba de la web.
      Las publicaciones guardadas allí aparecen primero.

   La lista de abajo queda como RESPALDO: sirve si todavía no activaste
   supabase-instagram.sql o si quieres dejar publicaciones fijas.

   La foto y el texto se toman solos de Instagram, así que si editas la
   publicación allá, la web se actualiza sola. No hay que subir nada.

   ¿Quieres que cargue más rápido y con el estilo de la web? Entonces
   pon también una foto tuya y un texto corto:
      { enlace: "https://www.instagram.com/p/ABC123xyz/",
        imagen: "assets/instagram/booster.jpg",
        texto:  "Los boosters elevan a tu hijo para que el cinturón..." },

   Si dejas la lista vacía, la sección muestra solo la invitación a
   seguir la cuenta (no se ve rota).
   ===================================================================== */
const INSTAGRAM = {
  usuario: "carseatclinicc",
  nombre: "Car Seat Clinic",
  descripcion: "Consejos de seguridad infantil, novedades y lo que hacemos cada día en el taller.",

  // 👇 Pega aquí los enlaces de las publicaciones (de 3 a 6 se ven mejor)
  publicaciones: [
    // "https://www.instagram.com/p/PEGA-AQUI-EL-ENLACE/",
  ],
};

/* =====================================================================
   SERVICIOS  (estos sí se editan aquí — cambian poco)
   ===================================================================== */
const SERVICIOS = [
  { icono: "key", nombre: "Alquiler de equipo",
    descripcion: "¿De visita en Panamá o necesitas algo temporal? Renta sillas y coches certificados por el tiempo que lo necesites, con fechas publicadas." },
  { icono: "sparkles", nombre: "Limpieza de sillas y coches de paseo",
    descripcion: "Lavado profundo y desinfección de sillas de auto y coches de paseo, cuidando cada material para devolverles higiene y frescura." },
  { icono: "wrench", nombre: "Asesoría de uso e instalación",
    descripcion: "Te enseñamos a instalar y usar bien la silla según el peso y la edad de tu pequeño. Te la dejamos puesta y con total confianza." },
  { icono: "clipboard", nombre: "Chequeo de seguridad",
    descripcion: "Revisamos que la silla esté bien anclada, sin holguras y dentro de su vida útil, con recomendaciones claras para viajar tranquila." },
  { icono: "compass", nombre: "Asesoría para elegir tu silla",
    descripcion: "Te ayudamos a escoger la silla ideal según la edad, el peso del niño y el modelo de tu auto. Sin compromiso." },
  { icono: "home", nombre: "Atención a domicilio",
    descripcion: "Llevamos la instalación y el chequeo hasta tu casa para tu mayor comodidad. Coordina tu cita fácilmente." },
];

/* =====================================================================
   TESTIMONIOS  (edita libremente: nombre, ciudad y texto)
   ===================================================================== */
const TESTIMONIOS = [
  { nombre: "Ivohne Jensen", ciudad: "Reseña de Google", texto: "Excelente atención, productos de calidad y la chica es muy versada en el tema. La recomiendo mil por ciento." },
  { nombre: "Ana María Paredes", ciudad: "Reseña de Google", texto: "Me encantó la experiencia, servicio personalizado y de la mejor calidad. Regresaremos seguro." },
  { nombre: "Gianfranco Lo Medico", ciudad: "Reseña de Google", texto: "Muchísimas gracias, de mucha ayuda la mentoría de seguridad vial y sillas para bebés." },
];

/* =====================================================================
   PRODUCTOS DE MUESTRA (solo respaldo "modo demo")
   Cuando conectes Supabase, los productos reales vienen de la base de
   datos y estos se ignoran.
   ===================================================================== */
const PRODUCTOS_DEMO = [
  { id: "p1", nombre: "Silla para bebé (Grupo 0+)", categoria: "recien-nacidos", marca: "Chicco", recomendado: "0–13 kg · 0–15 meses", precio: 189, antes: 0, badge: "Más vendido", imagen: "", stock: 8,
    descripcion: "Silla para recién nacidos. Reductor acolchado e instalación a contramarcha." },
  { id: "p2", nombre: "Silla convertible (Grupo 1)", categoria: "convertibles", marca: "Evenflo", recomendado: "9–18 kg · 1–4 años", precio: 229, antes: 0, badge: "", imagen: "", stock: 6,
    descripcion: "Crece con tu hijo. Múltiples posiciones de reclinado y arnés de 5 puntos." },
  { id: "p3", nombre: "Silla 360° (Grupo 0-1-2-3)", categoria: "giro-360", marca: "Britax", recomendado: "0–36 kg · 0–12 años", precio: 329, antes: 379, badge: "Oferta", imagen: "", stock: 5,
    descripcion: "Acompaña al niño de 0 a 36 kg. Giro 360° para sentarlo fácil y respaldo reclinable." },
  { id: "p4", nombre: "Silla combinada 2 en 1", categoria: "combinadas", marca: "Safety 1st", recomendado: "9–36 kg · 1–12 años", precio: 259, antes: 0, badge: "", imagen: "", stock: 4,
    descripcion: "Se usa con arnés y luego como booster. Una sola silla para varias etapas." },
  { id: "p5", nombre: "Booster con respaldo (Grupo 2-3)", categoria: "booster", marca: "Graco", recomendado: "15–36 kg · 4–12 años", precio: 119, antes: 0, badge: "", imagen: "", stock: 12,
    descripcion: "Eleva al niño para que el cinturón quede en la posición correcta. Reposacabezas ajustable." },
  { id: "p6", nombre: "Espejo retrovisor para bebé", categoria: "accesorios", marca: "", recomendado: "", precio: 24, antes: 0, badge: "Nuevo", imagen: "", stock: 20,
    descripcion: "Observa a tu bebé sin voltearte. Cristal de seguridad y ángulo ajustable." },
  { id: "p7", nombre: "Protector de asiento antideslizante", categoria: "accesorios", marca: "", recomendado: "", precio: 29, antes: 0, badge: "", imagen: "", stock: 0,
    descripcion: "Cuida la tapicería de marcas y suciedad. Material impermeable." },
  { id: "p8", nombre: "Kit de limpieza y desinfección", categoria: "limpieza", marca: "", recomendado: "", precio: 18, antes: 0, badge: "", imagen: "", stock: 14,
    descripcion: "Productos seguros para limpiar y desinfectar la silla sin dañar sus materiales." },
  { id: "p9", nombre: "Gift Card Car Seat Clinic", categoria: "gift-cards", marca: "", recomendado: "Ideal para regalar", precio: 50, antes: 0, badge: "", imagen: "", stock: 99,
    descripcion: "Tarjeta de regalo para usar en productos o servicios. El regalo perfecto para una familia." },
];

/* =====================================================================
   VIDEO DEL FABRICANTE
   ---------------------------------------------------------------------
   Guardamos el ENLACE del video, nunca el archivo. Un video de producto
   pesa cientos de megas: subirlo llenaría el almacenamiento y haría
   lenta la página. Con el enlace se ve igual dentro de la ficha, no
   ocupa nada y lo sigue sirviendo el fabricante desde YouTube.

   Esta función saca el código del video de cualquiera de las formas en
   que YouTube reparte sus enlaces, porque la administradora va a copiar
   y pegar lo que le salga y no tiene por qué saber cuál es cuál:
     youtube.com/watch?v=CODIGO      (el de la barra del navegador)
     youtu.be/CODIGO                 (el del botón Compartir)
     youtube.com/embed/CODIGO        (el de "insertar")
     youtube.com/shorts/CODIGO       (los verticales)
   Devuelve null si no reconoce el enlace, y ahí el CRM avisa en vez de
   dejar un video roto en la ficha.
   ===================================================================== */
function idDeYouTube(url) {
  if (!url) return null;
  const t = String(url).trim();
  const patrones = [
    /(?:youtube\.com|youtube-nocookie\.com)\/(?:watch\?(?:[^#]*&)?v=)([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com|youtube-nocookie\.com)\/(?:embed|shorts|v|live)\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patrones) {
    const m = t.match(p);
    if (m) return m[1];
  }
  /* Por si pega solo el código suelto */
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  return null;
}
