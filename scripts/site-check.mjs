/* =====================================================================
   site-check.mjs — revisión rápida del sitio SIN abrir el navegador.
   ---------------------------------------------------------------------
   Comprueba, en todas las páginas: que el menú tenga las mismas pestañas,
   que los scripts estén completos y en orden, que no queden bloques
   duplicados (carrito/chat) y que ningún enlace apunte a un archivo o
   sección que no existe.

   Uso:  node scripts/site-check.mjs
   ===================================================================== */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES = ["index.html", "tienda.html", "alquiler.html", "servicios.html", "faq.html", "terminos.html", "privacidad.html", "admin.html"];
const MENU = ["Inicio", "Tienda", "Alquiler", "Servicios", "Preguntas", "Contacto"];
const SCRIPTS = ["js/data.js", "js/supabase.js", "js/chat-assistant.js", "js/shell.js", "js/store.js", "js/chat-widget.js"];

const problemas = [];
const aviso = (page, msg) => problemas.push(`${page}: ${msg}`);

// Guarda los id="..." de cada página para validar los enlaces con #
const idsPorPagina = {};
const htmlPorPagina = {};

for (const page of PAGES) {
  const path = join(ROOT, page);
  if (!existsSync(path)) { aviso(page, "el archivo no existe"); continue; }
  const html = readFileSync(path, "utf8");
  htmlPorPagina[page] = html;
  idsPorPagina[page] = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}

for (const [page, html] of Object.entries(htmlPorPagina)) {
  const esAdmin = page === "admin.html";

  // 1. Menú igual en todas (el panel de admin va aparte)
  if (!esAdmin) {
    const nav = html.match(/<nav class="nav"[\s\S]*?<\/nav>/);
    if (!nav) aviso(page, "no tiene menú (<nav class=\"nav\">)");
    else {
      const etiquetas = [...nav[0].matchAll(/>([^<>]+)<\/a>/g)].map((m) => m[1].trim()).filter((t) => t !== "Administrar");
      if (etiquetas.join("|") !== MENU.join("|")) aviso(page, `el menú no coincide: ${etiquetas.join(", ")}`);
    }

    // 2. Scripts completos y en orden
    const orden = SCRIPTS.filter((s) => html.includes(s));
    if (orden.length !== SCRIPTS.length) {
      aviso(page, `faltan scripts: ${SCRIPTS.filter((s) => !html.includes(s)).join(", ")}`);
    } else {
      const posiciones = SCRIPTS.map((s) => html.indexOf(s));
      if (posiciones.some((p, i) => i > 0 && p < posiciones[i - 1])) aviso(page, "los scripts están en el orden equivocado");
    }

    // 3. Sin bloques duplicados (ahora los pone js/shell.js)
    for (const [sel, nombre] of [['id="cart"', "carrito"], ['id="chatWidget"', "chat"], ['id="toast"', "aviso flotante"], ['class="float-whatsapp"', "botón de WhatsApp"]]) {
      if (html.includes(sel)) aviso(page, `tiene el ${nombre} copiado en el HTML (debe venir de shell.js)`);
    }
  }

  // 4. Enlaces rotos
  for (const m of html.matchAll(/href="([^"#][^"]*?)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue;
    const [archivo] = href.split("?")[0].split("#");
    if (!archivo) continue;
    if (!existsSync(join(ROOT, archivo))) aviso(page, `enlace roto → ${href}`);
  }

  // 5. Anclas (#seccion) que no existen en la página destino
  for (const m of html.matchAll(/href="([^"]*#[^"]+)"/g)) {
    const href = m[1];
    if (/^https?:/.test(href)) continue;
    const [archivo, ancla] = href.split("#");
    const destino = archivo || page;
    const ids = idsPorPagina[destino];
    if (!ids) continue;
    if (!ids.has(ancla)) aviso(page, `ancla inexistente → ${href}`);
  }
}

if (problemas.length) {
  console.log(`\n❌ ${problemas.length} problema(s):\n`);
  problemas.forEach((p) => console.log("  · " + p));
  process.exitCode = 1;
} else {
  console.log("\n✅ Todo en orden: menús iguales, scripts completos y enlaces válidos.\n");
}
