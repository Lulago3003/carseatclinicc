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

  /* --- Acceso rápido por código (solo para ENTRAR y VER el panel) ---
     Útil para revisar el panel sin iniciar sesión. OJO: no es seguro
     (la clave queda visible en el código). Para GUARDAR cambios de verdad
     hay que iniciar sesión con un correo de adminEmails. */
  adminCode: { usuario: "admin", clave: "admin" },
};

/* =====================================================================
   SERVICIOS  (estos sí se editan aquí — cambian poco)
   ===================================================================== */
const SERVICIOS = [
  { icono: "🔧", nombre: "Instalación profesional",
    descripcion: "Instalamos y aseguramos la silla según el peso y la edad de tu pequeño, y te enseñamos a hacerlo tú misma con total confianza." },
  { icono: "🛡️", nombre: "Chequeo de seguridad",
    descripcion: "Revisamos que la silla esté bien anclada, sin holguras y dentro de su vida útil, con recomendaciones claras para viajar tranquila." },
  { icono: "🧭", nombre: "Asesoría para elegir tu silla",
    descripcion: "Te ayudamos a escoger la silla ideal según la edad, el peso del niño y el modelo de tu auto. Sin compromiso." },
  { icono: "✨", nombre: "Limpieza y desinfección",
    descripcion: "Lavado profundo y desinfección de la silla para devolverle higiene y frescura, cuidando cada uno de sus materiales." },
  { icono: "🚗", nombre: "Alquiler de sillas",
    descripcion: "¿De visita en Panamá o necesitas una silla temporal? Renta una silla certificada por el tiempo que la necesites." },
  { icono: "🏠", nombre: "Atención a domicilio",
    descripcion: "Llevamos la instalación y el chequeo hasta tu casa para tu mayor comodidad. Coordina tu cita fácilmente." },
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
