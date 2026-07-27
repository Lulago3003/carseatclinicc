/* =====================================================================
   sync-layout.mjs — deja el MENÚ y el PIE DE PÁGINA iguales en todas las
   páginas del sitio.
   ---------------------------------------------------------------------
   Por qué existe: el sitio es HTML puro (sin framework), así que el menú
   está copiado en cada archivo. Si lo editas a mano en uno solo, las
   páginas quedan distintas. Este script lo copia a todas de una vez.

   Cómo se usa (desde la carpeta del proyecto):
       node scripts/sync-layout.mjs

   Si quieres CAMBIAR el menú o el pie, edítalo AQUÍ abajo (constantes
   HEADER y FOOTER) y vuelve a correr el comando.
   ===================================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* --- Páginas del sitio. "slim" = página legal (pie corto). --- */
const PAGES = [
  { file: "index.html" },
  { file: "tienda.html" },
  { file: "alquiler.html" },
  { file: "servicios.html" },
  { file: "faq.html" },
  { file: "terminos.html", slim: true },
  { file: "privacidad.html", slim: true },
];

/* --- Pestañas del menú (cambia aquí el orden o los nombres) --- */
const TABS = [
  ["index.html", "Inicio"],
  ["tienda.html", "Tienda"],
  ["alquiler.html", "Alquiler"],
  ["servicios.html", "Servicios"],
  ["faq.html", "Preguntas"],
  ["index.html#contacto", "Contacto"],
];

const HEADER = `  <header class="header" id="header">
    <div class="container header__inner">
      <a href="index.html" class="brand" aria-label="Car Seat Clinic, ir al inicio">
        <img src="logo.jpg" alt="" class="brand__logo" />
        <span class="brand__text">
          <strong>Car Seat Clinic</strong>
          <small>Seguridad infantil · Panamá</small>
        </span>
      </a>

      <nav class="nav" id="nav" aria-label="Menú principal">
${TABS.map(([href, label]) => `        <a href="${href}">${label}</a>`).join("\n")}
        <a href="admin.html" id="adminLink" class="nav__admin" style="display:none">Administrar</a>
      </nav>

      <div class="header__actions">
        <button class="account-btn" id="accountBtn" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span id="accountLabel">Ingresar</span>
        </button>
        <button class="cart-btn" id="openCart" type="button" aria-label="Abrir carrito">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span class="cart-btn__count" id="cartCount">0</span>
        </button>
        <button class="nav-toggle" id="navToggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;

const IG_LINKS = `        <div class="footer__social">
          <a href="#" data-ig-shop target="_blank" rel="noopener" aria-label="Instagram de la tienda">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>
            <span>@carseatclinic.shop</span>
          </a>
          <a href="#" data-ig-main target="_blank" rel="noopener" aria-label="Instagram principal">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>
            <span>@carseatclinicc</span>
          </a>
        </div>`;

const BRAND_MARK = `          <span class="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 50 Q50 13 75 50" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/>
              <path d="M18 50 Q20 87 50 87 Q80 87 82 50 Q78 43 70 47 Q66 58 50 58 Q34 58 30 47 Q22 43 18 50 Z" fill="#fff"/>
              <path d="M31 51 Q34 77 50 77 Q66 77 69 51 Q60 61 50 61 Q40 61 31 51 Z" fill="#2f3e34"/>
            </svg>
          </span>`;

const FOOTER = `  <footer class="footer">
    <div class="container">
      <div class="newsletter">
        <div class="newsletter__text">
          <h3>Únete a la comunidad Car Seat Clinic</h3>
          <p>Promociones, consejos de seguridad y recordatorios para viajar tranquilos con tus hijos.</p>
        </div>
        <form class="newsletter__form" id="newsletterForm">
          <input type="text" name="nombre" placeholder="Tu nombre" required />
          <input type="email" name="email" placeholder="Tu correo" required />
          <button class="btn btn--accent" type="submit">Suscribirme</button>
        </form>
      </div>
    </div>
    <div class="container footer__grid">
      <div class="footer__brand">
        <div class="brand brand--light">
${BRAND_MARK}
          <span class="brand__text"><strong>Car Seat Clinic</strong></span>
        </div>
        <p>Técnicos en seguridad infantil en Panamá. Te ayudamos a elegir, instalar y usar bien la silla de tu hijo.</p>
${IG_LINKS}
      </div>
      <div class="footer__col">
        <h4>Comprar</h4>
        <a href="tienda.html">Ver toda la tienda</a>
        <a href="tienda.html?cat=recien-nacidos">Recién nacidos</a>
        <a href="tienda.html?cat=convertibles">Convertibles</a>
        <a href="tienda.html?cat=booster">Boosters</a>
        <a href="tienda.html?cat=accesorios">Accesorios</a>
      </div>
      <div class="footer__col">
        <h4>Servicios</h4>
        <a href="alquiler.html">Alquiler para viajes</a>
        <a href="servicios.html#instalacion">Instalación</a>
        <a href="servicios.html#limpieza">Limpieza profunda</a>
        <a href="index.html#citas">Reservar una cita</a>
      </div>
      <div class="footer__col">
        <h4>Ayuda</h4>
        <a href="faq.html">Preguntas frecuentes</a>
        <a href="index.html#contacto">Contacto y ubicación</a>
        <a href="terminos.html">Términos</a>
        <a href="privacidad.html">Privacidad</a>
      </div>
    </div>
    <div class="container footer__bottom">
      <p>© <span data-year></span> Car Seat Clinic Center. Hecho con cuidado para las familias.</p>
    </div>
  </footer>`;

const FOOTER_SLIM = `  <footer class="footer">
    <div class="container footer__grid footer__grid--slim">
      <div class="footer__brand">
        <div class="brand brand--light">
${BRAND_MARK}
          <span class="brand__text"><strong>Car Seat Clinic</strong></span>
        </div>
${IG_LINKS}
      </div>
      <div class="footer__col">
        <h4>Ir a</h4>
        <a href="index.html">Inicio</a>
        <a href="tienda.html">Tienda</a>
        <a href="alquiler.html">Alquiler</a>
        <a href="servicios.html">Servicios</a>
      </div>
      <div class="footer__col">
        <h4>Legal</h4>
        <a href="terminos.html">Términos</a>
        <a href="privacidad.html">Privacidad</a>
        <a href="faq.html">Preguntas frecuentes</a>
      </div>
    </div>
    <div class="container footer__bottom">
      <p>© <span data-year></span> Car Seat Clinic Center.</p>
    </div>
  </footer>`;

/* --- Versión de los archivos propios ---
   Se pega al final de css/js (?v=...) para que el navegador del cliente
   cargue los cambios enseguida y no una copia vieja guardada en caché.
   SUBE ESTE NÚMERO cada vez que cambies el CSS o el JS. */
const VERSION = "2026-07-27a";

/* --- Scripts al final del body (mismo orden en todas las páginas) --- */
const SCRIPTS = (page) => {
  const v = `?v=${VERSION}`;
  const extra = page === "index.html"
    ? `\n  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script>`
    : "";
  return `  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>${extra}
  <script src="js/data.js${v}"></script>
  <script src="js/supabase.js${v}"></script>
  <script src="js/chat-assistant.js${v}"></script>
  <script src="js/shell.js${v}"></script>
  <script src="js/store.js${v}"></script>
  <script src="js/chat-widget.js${v}"></script>
  <script src="js/servicios.js${v}"></script>`;
};

/* --- Bloques viejos que ahora viven en js/shell.js --- */
const LEGACY = [
  /\n *<!--[^\n]*(?:Asistente|chat con IA)[^\n]*-->/gi,
  /\n *<a class="float-whatsapp"[\s\S]*?<\/a>/gi,
  /\n *<div class="chat" id="chatWidget">[\s\S]*?\n *<\/div>\n *<\/div>/gi,
  /\n *<!-- Notificaci[^\n]*-->/gi,
  /\n *<div class="toast" id="toast"><\/div>/gi,
];

let cambiados = 0;
for (const { file, slim } of PAGES) {
  const path = join(ROOT, file);
  let html;
  try { html = readFileSync(path, "utf8"); }
  catch { console.log(`  (saltada) ${file} no existe`); continue; }
  const original = html;

  // 1. Encabezado
  html = html.replace(/ *<header[\s\S]*?<\/header>/, HEADER);

  // 2. Pie de página
  html = html.replace(/ *<footer[\s\S]*?<\/footer>/, slim ? FOOTER_SLIM : FOOTER);

  // 3. Quitar piezas duplicadas que ahora inserta shell.js
  for (const re of LEGACY) html = html.replace(re, "");

  // 4. Scripts finales
  html = html.replace(/ *<!-- Scripts -->[\s\S]*?(?=\n<\/body>)/, SCRIPTS(file));
  html = html.replace(/(?: *<script[\s\S]*?<\/script>\n?)+(?=<\/body>)/, SCRIPTS(file) + "\n");

  // 5. Misma versión para la hoja de estilos
  html = html.replace(/href="css\/styles\.css(?:\?v=[^"]*)?"/g, `href="css/styles.css?v=${VERSION}"`);

  // 5. Limpiar líneas en blanco de más
  html = html.replace(/\n{3,}/g, "\n\n");

  if (html !== original) { writeFileSync(path, html); cambiados++; console.log(`  ✓ ${file}`); }
  else console.log(`  = ${file} (sin cambios)`);
}

/* --- El panel (admin.html) ---
   No lleva el menú ni el pie del sitio, pero SÍ necesita la versión en sus
   archivos: sin ella, quien ya entró al panel se queda con el CSS y el JS
   viejos guardados en el navegador y no ve los cambios. */
{
  const path = join(ROOT, "admin.html");
  try {
    let html = readFileSync(path, "utf8");
    const original = html;
    html = html.replace(/href="css\/styles\.css(?:\?v=[^"]*)?"/g, `href="css/styles.css?v=${VERSION}"`);
    html = html.replace(/src="(js\/(?:data|supabase|admin)\.js)(?:\?v=[^"]*)?"/g, `src="$1?v=${VERSION}"`);
    if (html !== original) { writeFileSync(path, html); cambiados++; console.log("  ✓ admin.html (versión de css/js)"); }
    else console.log("  = admin.html (sin cambios)");
  } catch { console.log("  (saltada) admin.html no existe"); }
}

console.log(`\nListo: ${cambiados} página(s) actualizada(s).`);
