/* Revisa que las piezas clave de la experiencia sigan en su sitio después de
   cualquier cambio. Uso: node scripts/site-experience-check.mjs */
import { readFileSync } from "node:fs";

const files = {
  home: readFileSync("index.html", "utf8"),
  tienda: readFileSync("tienda.html", "utf8"),
  alquiler: readFileSync("alquiler.html", "utf8"),
  servicios: readFileSync("servicios.html", "utf8"),
  css: readFileSync("css/styles.css", "utf8"),
  js: readFileSync("js/store.js", "utf8"),
  db: readFileSync("js/supabase.js", "utf8"),
  shell: readFileSync("js/shell.js", "utf8"),
  data: readFileSync("js/data.js", "utf8"),
  chat: readFileSync("js/chat-assistant.js", "utf8"),
};
const todas = [files.home, files.tienda, files.alquiler, files.servicios];
const enTodas = (txt) => todas.every((f) => f.includes(txt));

const checks = [
  // --- Estructura de páginas ---
  ["menú de 6 pestañas en todas", enTodas('href="alquiler.html"') && enTodas('href="tienda.html"')],
  ["shell compartido en todas", enTodas('src="js/shell.js')],
  ["shell trae el carrito y el checkout", files.shell.includes('id="cart"') && files.shell.includes('id="checkoutModal"')],
  ["shell trae el chat y el comparador", files.shell.includes('id="chatPanel"') && files.shell.includes('id="compareBar"')],
  ["el HTML ya no duplica el carrito", todas.every((f) => !f.includes('id="cartItems"'))],

  // --- Portada ---
  ["scroll progress markup", files.home.includes('id="scrollProgress"')],
  ["destacados en la portada", files.home.includes('id="featuredGrid"') && files.js.includes("function renderFeatured")],
  ["guía por etapas", files.home.includes('id="guia-etapas"') && files.css.includes(".gstep")],
  ["quiz progress markup", files.home.includes('id="finderProgress"')],
  ["quiz progress script", files.js.includes("function updateFinderProgress")],
  ["safe route section", files.home.includes('id="ruta-segura"')],
  ["safe route step cards", files.home.includes('class="route-steps"') && files.home.includes('class="rstep"')],
  ["safe route styles", files.css.includes(".safe-route") && files.css.includes(".rstep")],
  ["appointment planner markup", files.home.includes('id="appointmentSlots"') && files.home.includes("cita__stage")],
  ["appointment lead capture", files.js.includes("function selectedAppointmentSlot") && files.js.includes("guardarLead")],
  ["contacto + mapa", files.home.includes('id="mapFrame"') && files.home.includes('id="cInfoUbicacion"')],

  // --- Tienda ---
  ["catálogo en tienda.html", files.tienda.includes('id="productGrid"') && files.tienda.includes('id="shopFilters"')],
  ["buscador y orden", files.tienda.includes('id="shopSearch"') && files.tienda.includes('id="sortSelect"')],
  ["la portada ya no lleva el catálogo", !files.home.includes('id="productGrid"')],
  ["product stagger animation", files.js.includes("animateProductCards")],
  ["product image helper", files.js.includes("function productImageList")],
  ["product image fallback", files.js.includes("function setupMediaFallbacks") && files.css.includes(".card__fallback")],
  ["premium card markup", files.js.includes("card__peek") && files.js.includes("card__thumbs")],
  ["catálogo en 2 columnas en teléfono", !/\.grid[^{}]*\{\s*grid-template-columns:\s*1fr/.test(files.css)],
  ["sin destacado arbitrario (1er producto)", !files.js.includes("card--featured") && !files.css.includes(".card--featured")],
  ["tarjetas sin jerga interna", !files.js.includes("Foto editable") && !files.js.includes("Compatibilidad guiada") && !files.js.includes("Galería disponible")],
  ["filtro por URL (?cat=)", files.js.includes("function applyUrlParams") && files.js.includes("tienda.html?cat=")],

  // --- Alquiler (página propia) ---
  ["alquiler tiene página propia", files.alquiler.includes('id="reservar"') && files.css.includes(".renthero")],
  ["equipo y pasos del alquiler", files.alquiler.includes('class="eqgrid"') && files.alquiler.includes('class="howsteps"')],
  ["rental planner fields", files.alquiler.includes('id="rentalPanel"') && files.alquiler.includes('name="rental_end_date"') && files.alquiler.includes('name="rental_equipment"')],
  ["calendario de rango", files.alquiler.includes('id="rentalCalendar"') && files.js.includes("function setupRentalCalendar")],
  ["rental day calculation", files.js.includes("function rentalDays") && files.js.includes("function updateRentalPanel")],
  ["rental lead details", files.js.includes("rental_equipment") && files.js.includes("pickup_location")],
  ["la ficha manda al alquiler", files.js.includes("alquiler.html")],
  ["servicios enlaza al alquiler", files.servicios.includes("alquiler.html") && !files.servicios.includes('id="alquiler"')],

  // --- Checkout por WhatsApp ---
  ["checkout arma el pedido", files.js.includes("function buildOrderText") && files.js.includes("Mis datos")],
  ["checkout abre WhatsApp", files.js.includes("async function sendWhatsAppOrder") && files.js.includes("encodeURIComponent(text)")],
  ["cotización sin precio", files.js.includes("function cartHasUnpriced") && files.js.includes("Solicitar tu cotización")],

  // --- Chat y CRM ---
  ["chat advisor actions", files.js.includes("renderAdvisorActions") && files.css.includes(".chat__actions")],
  ["smart chat script", enTodas('src="js/chat-assistant.js') && files.chat.includes("generateSmartReply")],
  ["smart chat fallback", files.js.includes("smartReply(text)") && files.js.includes("answerHtml")],
  ["chat activation flags", files.data.includes("iaActiva") && files.data.includes("guardarConversaciones")],
  ["crm lead activation flag", files.data.includes("guardarSolicitudes")],

  // --- Detalles visuales ---
  ["contextual whatsapp data", enTodas("data-whatsapp-label")],
  ["contextual whatsapp script", files.js.includes("function updateFloatingWhatsApp")],
  ["motion tokens", files.css.includes("--ease-out-expo") && files.css.includes(".motion-float")],
  ["pie con las dos cuentas de Instagram", enTodas("data-ig-shop") && enTodas("data-ig-main")],
  ["instagram de la tienda configurado", files.data.includes("instagramTienda")],

  // --- Sección de Instagram en la portada ---
  ["sección de Instagram en la portada", files.home.includes('id="instagram"') && files.home.includes('id="igRail"')],
  ["lista de publicaciones editable", files.data.includes("const INSTAGRAM") && files.data.includes("publicaciones")],
  ["render de Instagram", files.js.includes("function renderInstagram") && files.js.includes("function instaId")],
  ["publicaciones incrustadas de la cuenta oficial", files.js.includes("/embed/") && files.js.includes("INSTAGRAM.usuario")],
  ["estilos de Instagram (con riel móvil)", files.css.includes(".ig__rail") && files.css.includes("scroll-snap-type")],
  ["aviso de Instagram en toda la web", files.shell.includes('id = "instagramNotice"') && files.js.includes("function renderInstagramNotice") && files.css.includes(".instagram-notice")],
  ["novedades públicas desde Supabase", files.db.includes("getInstagramPosts") && files.db.includes("instagram_posts")],
  ["enlace de Instagram validado", files.js.includes("function instagramPostInfo") && files.js.includes('host !== "instagram.com"')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("Site experience check failed:");
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Site experience check passed: ${checks.length}/${checks.length}`);
