/* =====================================================================
   Chequeo de indexación (SEO técnico)
   ---------------------------------------------------------------------
   Lo pidió la asesora de la clienta y son cosas que se rompen sin que
   nadie se dé cuenta: alguien agrega una página y se olvida del sitemap,
   o cambia una dirección y la canonical queda apuntando a la vieja.
   Este chequeo lo agarra antes de publicar.
   ===================================================================== */
import { readFileSync, existsSync } from "node:fs";

const BASE = "https://carseatclinic.com.pa";

/* Páginas públicas: archivo -> dirección definitiva (sin .html, porque
   el servidor redirige /pagina.html a /pagina). */
const PAGINAS = {
  "index.html": "/",
  "tienda.html": "/tienda",
  "servicios.html": "/servicios",
  "alquiler.html": "/alquiler",
  "blog.html": "/blog",
  "faq.html": "/faq",
  "guia.html": "/guia",
  "mesa.html": "/mesa",
  "cookies.html": "/cookies",
  "terminos.html": "/terminos",
  "privacidad.html": "/privacidad",
};

let fallos = 0;
const mal = (m) => { console.error("  ✗ " + m); fallos++; };

/* ---- 1. El sitemap existe, es válido y trae todas las páginas ---- */
if (!existsSync("sitemap.xml")) {
  mal("no existe sitemap.xml");
} else {
  const xml = readFileSync("sitemap.xml", "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const ruta of Object.values(PAGINAS)) {
    if (!locs.includes(BASE + ruta)) mal(`el sitemap no incluye ${ruta}`);
  }
  /* El panel no es contenido público y no debe ofrecerse a Google. */
  if (locs.some((l) => /admin/.test(l))) mal("el sitemap incluye el panel de administración");
  /* Una dirección con .html en el sitemap manda a Google a un rebote. */
  const conHtml = locs.filter((l) => l.endsWith(".html"));
  if (conHtml.length) mal(`el sitemap tiene direcciones .html que rebotan: ${conHtml.join(", ")}`);
}

/* ---- 2. robots.txt existe, apunta al sitemap y no tapa lo público ---- */
if (!existsSync("robots.txt")) {
  mal("no existe robots.txt");
} else {
  const txt = readFileSync("robots.txt", "utf8");
  if (!txt.includes(`Sitemap: ${BASE}/sitemap.xml`)) mal("robots.txt no apunta al sitemap");
  const bloqueos = [...txt.matchAll(/^Disallow:\s*(\S+)/gm)].map((m) => m[1]);
  if (bloqueos.includes("/")) mal("robots.txt bloquea TODO el sitio");
  for (const [, ruta] of Object.entries(PAGINAS)) {
    if (bloqueos.some((b) => b !== "/" && ruta.startsWith(b))) mal(`robots.txt bloquea ${ruta}`);
  }
}

/* ---- 3. Cada página se apunta a sí misma con su dirección final ---- */
for (const [archivo, ruta] of Object.entries(PAGINAS)) {
  if (!existsSync(archivo)) { mal(`falta el archivo ${archivo}`); continue; }
  const html = readFileSync(archivo, "utf8");
  const can = (html.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1];
  if (!can) mal(`${archivo} no tiene etiqueta canonical`);
  else if (can !== BASE + ruta) mal(`${archivo} apunta a ${can} y debería apuntar a ${BASE + ruta}`);
  if (/name="robots"[^>]*noindex/i.test(html)) mal(`${archivo} tiene noindex y no debería`);
  const og = (html.match(/property="og:url"\s+content="([^"]+)"/) || [])[1];
  if (og && og !== BASE + ruta) mal(`${archivo} comparte como ${og} en vez de ${BASE + ruta}`);
}

/* ---- 4. www manda a la dirección oficial ---- */
if (!existsSync("_redirects")) {
  mal("no existe _redirects (www quedaría como sitio duplicado)");
} else {
  const r = readFileSync("_redirects", "utf8");
  if (!/www\.carseatclinic\.com\.pa.*carseatclinic\.com\.pa.*301/.test(r)) {
    mal("_redirects no manda www a la dirección sin www con 301");
  }
}

const total = Object.keys(PAGINAS).length;
if (fallos) { console.error(`\nSEO check: ${fallos} problema(s).`); process.exit(1); }
console.log(`SEO check passed: sitemap, robots, canonical y www correctos en ${total} páginas.`);
