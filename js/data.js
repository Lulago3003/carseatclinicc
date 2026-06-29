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
  email: "hola@carseatclinic.com",
  instagram: "https://www.instagram.com/carseatclinicc",
  ubicacion: "Ciudad de Panamá, Panamá",
  horario: "Lun a Sáb · 9:00 a.m. – 6:00 p.m.",
  // Dirección que se muestra en el mapa. Cambia por la dirección real
  // (puedes poner el nombre del local o una dirección exacta).
  mapsQuery: "Ciudad de Panamá, Panamá",
  // Enlace de Waze para "cómo llegar" (QR junto al mapa). Si lo dejas vacío,
  // se arma con la ubicación. Lo ideal: pon el enlace exacto de tu local
  // (en Waze: compartir → copiar enlace) o coordenadas.
  wazeUrl: "",

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
    funcion: "super-api", // nombre de la Edge Function en Supabase
  },

  /* --- CRM inteligente / agenda ---
     Cambia guardarSolicitudes a true cuando corras supabase-crm-atencion.sql.
     Mientras este en false, las citas y casos se guardan en este navegador
     para probar el flujo sin errores de Supabase. */
  crm: {
    guardarSolicitudes: true,
  },

  /* --- Administradores ---
     Cualquier persona que inicie sesión con uno de estos correos será
     administradora automáticamente (puede editar productos, stock y pedidos).
     Puedes agregar más separados por coma. */
  adminEmails: ["luislassogonzalez@gmail.com", "admin@carseatclinic.app"],

  /* --- Acceso por código al panel (CRM) ---
     Al entrar con este usuario/clave, el panel inicia sesión en una cuenta
     de administrador real, así puedes EDITAR todo (productos, stock, pedidos).
     ⚠️ Importante: estas claves son visibles en el código, así que cualquiera
     que lo vea podría entrar. Cambia "clave" y "password" por algo difícil
     antes de lanzar (o usa tu correo personal, que es lo más seguro). */
  adminCode: {
    usuario: "admin",
    clave: "admin",
    // Cuenta real de administrador (se crea sola la primera vez que entras):
    email: "admin@carseatclinic.app",
    password: "AdminCSC-2026",
  },
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
   SERVICIOS  (estos sí se editan aquí — cambian poco)
   ===================================================================== */
const SERVICIOS = [
  { icono: "wrench", nombre: "Instalación profesional",
    descripcion: "Instalamos y aseguramos la silla según el peso y la edad de tu pequeño, y te enseñamos a hacerlo tú misma con total confianza." },
  { icono: "clipboard", nombre: "Chequeo de seguridad",
    descripcion: "Revisamos que la silla esté bien anclada, sin holguras y dentro de su vida útil, con recomendaciones claras para viajar tranquila." },
  { icono: "compass", nombre: "Asesoría para elegir tu silla",
    descripcion: "Te ayudamos a escoger la silla ideal según la edad, el peso del niño y el modelo de tu auto. Sin compromiso." },
  { icono: "sparkles", nombre: "Limpieza y desinfección",
    descripcion: "Lavado profundo y desinfección de la silla para devolverle higiene y frescura, cuidando cada uno de sus materiales." },
  { icono: "key", nombre: "Alquiler de sillas",
    descripcion: "¿De visita en Panamá o necesitas una silla temporal? Renta una silla certificada por el tiempo que la necesites." },
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
