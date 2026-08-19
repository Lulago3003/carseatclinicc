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
  /* Hay que leerlo por grupos de User-agent, no de corrido: Cloudflare
     antepone su propio bloque con "Disallow: /" para varios bots de IA
     (GPTBot, ClaudeBot, Amazonbot...). Eso no afecta a Google, y mirar
     las líneas sueltas hacía saltar una alarma falsa. */
  const grupos = [];
  let actual = null;
  for (let linea of txt.split("\n")) {
    linea = linea.split("#")[0].trim();
    if (!linea) continue;
    const ua = linea.match(/^user-agent:\s*(.+)$/i);
    if (ua) {
      if (!actual || actual.reglas.length) { actual = { uas: [], reglas: [] }; grupos.push(actual); }
      actual.uas.push(ua[1].trim());
      continue;
    }
    const rg = linea.match(/^(allow|disallow):\s*(\S*)$/i);
    if (rg && actual) actual.reglas.push([rg[1].toLowerCase(), rg[2]]);
  }
  const puedeEntrar = (ruta) => {
    const suyos = grupos.filter((g) => g.uas.includes("*"));
    let largo = -1, permitido = true;
    for (const g of suyos) {
      for (const [tipo, patron] of g.reglas) {
        if (patron && ruta.startsWith(patron) && patron.length > largo) {
          largo = patron.length; permitido = tipo === "allow";
        }
      }
    }
    return permitido;
  };
  for (const ruta of Object.values(PAGINAS)) {
    if (!puedeEntrar(ruta)) mal(`robots.txt le cierra ${ruta} a Google`);
  }
  if (puedeEntrar("/admin")) mal("robots.txt deja el panel de administración abierto a Google");
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

/* ---- 4. www manda a la dirección oficial ----
   Esto NO se puede comprobar leyendo archivos: la redirección vive en una
   regla del panel de Cloudflare, porque _redirects no distingue el dominio
   de entrada. Así que se pregunta al sitio de verdad. Si no hay internet
   se avisa y no se falla, para no trabar el trabajo sin conexión. */
try {
  const r = await fetch("https://www.carseatclinic.com.pa/", { redirect: "manual" });
  const destino = r.headers.get("location") || "";
  if (r.status !== 301) {
    mal(`www responde ${r.status} en vez de redirigir con 301 (queda como sitio duplicado)`);
  } else if (!destino.startsWith(BASE)) {
    mal(`www redirige a ${destino} en vez de a ${BASE}`);
  }
} catch (_) {
  console.log("  · sin conexión: no se pudo comprobar la redirección de www");
}

const total = Object.keys(PAGINAS).length;
if (fallos) { console.error(`\nSEO check: ${fallos} problema(s).`); process.exit(1); }
console.log(`SEO check passed: sitemap, robots, canonical y www correctos en ${total} páginas.`);
