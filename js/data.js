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
  eslogan: "Panamá",

  /* --- Contacto --- */
  // WhatsApp en formato internacional, SIN signos. Panamá = 507.
  whatsapp: "50760000000",
  email: "hola@carseatclinic.com",
  instagram: "https://www.instagram.com/carseatclinicc",
  ubicacion: "Ciudad de Panamá, Panamá",
  horario: "Lun a Sáb · 9:00 a.m. – 6:00 p.m.",

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

  /* --- Administradores ---
     Cualquier persona que inicie sesión con uno de estos correos será
     administradora automáticamente (puede editar productos, stock y pedidos).
     Puedes agregar más separados por coma. */
  adminEmails: ["luislassogonzalez@gmail.com"],
};

/* =====================================================================
   SERVICIOS  (estos sí se editan aquí — cambian poco)
   ===================================================================== */
const SERVICIOS = [
  { icono: "🔧", nombre: "Instalación profesional", precio: 25, desde: false,
    descripcion: "Instalamos tu silla según el peso y edad del niño, y te enseñamos a hacerlo." },
  { icono: "🛡️", nombre: "Revisión de seguridad", precio: 15, desde: false,
    descripcion: "Verificamos que tu silla esté bien anclada, sin holguras y dentro de su vida útil." },
  { icono: "🧭", nombre: "Asesoría para elegir silla", precio: 0, desde: false,
    descripcion: "Te ayudamos a escoger la silla ideal según edad, peso y el auto de tu familia." },
  { icono: "✨", nombre: "Limpieza y desinfección", precio: 30, desde: true,
    descripcion: "Lavado profundo y desinfección de la silla, sin dañar los materiales." },
];

/* =====================================================================
   PRODUCTOS DE MUESTRA (solo respaldo "modo demo")
   Cuando conectes Supabase, los productos reales vienen de la base de
   datos y estos se ignoran.
   ===================================================================== */
const PRODUCTOS_DEMO = [
  { id: "p1", nombre: "Silla para bebé (Grupo 0+)", categoria: "sillas", precio: 189, antes: 0, badge: "Más vendido", imagen: "", stock: 8,
    descripcion: "Silla para recién nacidos de 0 a 13 kg. Reductor acolchado e instalación a contramarcha." },
  { id: "p2", nombre: "Silla convertible 360° (Grupo 0-1-2-3)", categoria: "sillas", precio: 329, antes: 379, badge: "Oferta", imagen: "", stock: 5,
    descripcion: "Acompaña al niño de 0 a 36 kg. Giro 360° y respaldo reclinable." },
  { id: "p3", nombre: "Booster con respaldo (Grupo 2-3)", categoria: "sillas", precio: 119, antes: 0, badge: "", imagen: "", stock: 12,
    descripcion: "Para niños de 15 a 36 kg. Reposacabezas ajustable en altura." },
  { id: "p4", nombre: "Base ISOFIX universal", categoria: "bases", precio: 99, antes: 0, badge: "", imagen: "", stock: 3,
    descripcion: "Instalación rápida y firme con anclajes ISOFIX. Indicadores de clic seguro." },
  { id: "p5", nombre: "Espejo retrovisor para bebé", categoria: "accesorios", precio: 24, antes: 0, badge: "Nuevo", imagen: "", stock: 20,
    descripcion: "Observa a tu bebé sin voltearte. Cristal de seguridad y ángulo ajustable." },
  { id: "p6", nombre: "Protector de asiento antideslizante", categoria: "accesorios", precio: 29, antes: 0, badge: "", imagen: "", stock: 0,
    descripcion: "Cuida la tapicería de marcas y suciedad. Material impermeable." },
  { id: "p7", nombre: "Reductor para recién nacido", categoria: "accesorios", precio: 19, antes: 0, badge: "", imagen: "", stock: 15,
    descripcion: "Cojín ergonómico que da soporte a la cabeza y el cuerpo del bebé." },
  { id: "p8", nombre: "Parasol para ventana (pack x2)", categoria: "accesorios", precio: 16, antes: 22, badge: "Oferta", imagen: "", stock: 9,
    descripcion: "Bloquea los rayos del sol. Se adhiere sin pegamento y se quita sin marcas." },
];
