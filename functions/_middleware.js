/* =====================================================================
   VISTA PREVIA AL COMPARTIR UNA SILLA
   ---------------------------------------------------------------------
   Cuando alguien pega en WhatsApp el enlace de una silla
   (…/tienda?producto=lo-que-sea), WhatsApp NO abre la página: pide el
   HTML y lee solamente las etiquetas <meta> de arriba. Como la tienda
   arma los productos en el navegador, para WhatsApp todos los enlaces
   se veían igual: la foto y el texto generales del sitio.

   Esta función corre en el servidor de Cloudflare ANTES de entregar la
   página: busca ese producto en la base y reemplaza el título, la
   descripción y la foto por los suyos. La persona ve la silla real, con
   su foto y su precio, antes de tocar el enlace.

   Si algo falla —la base no responde, el producto no existe— se
   devuelve la página tal cual. Nunca se rompe por esto.
   ===================================================================== */

/* La misma clave pública que ya usa la web; solo permite leer. */
const SUPABASE_URL = "https://fahqjwnwoznaerrwgdmc.supabase.co";
const SUPABASE_KEY = "sb_publishable_e52thJbAZrWPpq4KJOsaRg_KrHEuNcC";
const SITIO = "https://carseatclinic.com.pa";
const MARCA = "Car Seat Clinic";

/* Reemplaza el contenido de una etiqueta <meta> */
class PonerContenido {
  constructor(valor) { this.valor = valor; }
  element(el) { el.setAttribute("content", this.valor); }
}
/* Reemplaza el texto de una etiqueta (para el <title>) */
class PonerTexto {
  constructor(valor) { this.valor = valor; }
  element(el) { el.setInnerContent(this.valor); }
}
/* Borra la etiqueta. Se usa con el ancho y alto de la imagen: están
   puestos para la foto de portada (1200x630) y no coinciden con las
   fotos de los productos. Si se dejan, WhatsApp recorta la silla. */
class Borrar {
  element(el) { el.remove(); }
}

/* Las fotos tienen que ir con dirección completa: WhatsApp no sabe
   resolver una ruta relativa. */
function fotoAbsoluta(u) {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return SITIO + "/" + String(u).replace(/^\/+/, "");
}

/* WhatsApp y Facebook solo muestran JPEG, PNG y GIF en la vista previa.
   Con .webp o .avif dejan el recuadro vacío, y varias sillas del
   catálogo están guardadas en esos formatos. Así que de todas las fotos
   del producto se elige la primera que sí se pueda mostrar. */
function esCompatible(u) {
  return /\.(jpe?g|png|gif)(\?|$)/i.test(u || "");
}
function fotoParaCompartir(prod) {
  const galeria = Array.isArray(prod.images) ? prod.images.filter(Boolean) : [];
  const todas = [prod.image_url, ...galeria].filter(Boolean).map(fotoAbsoluta);
  return todas.find(esCompatible) || null;
}

function precioBonito(p) {
  const n = Number(p);
  if (!n || n <= 0) return null;
  return "B/. " + n.toFixed(2);
}

/* Un texto corto y limpio para la vista previa. */
function resumen(prod) {
  const partes = [];
  const precio = precioBonito(prod.price);
  if (precio) partes.push(precio);
  if (prod.brand) partes.push(prod.brand);
  if (prod.fit) partes.push(prod.fit);
  let txt = partes.join(" · ");
  const desc = (prod.description || "").replace(/\s+/g, " ").trim();
  if (desc) txt = txt ? txt + " — " + desc : desc;
  if (!txt) txt = "Sillas de auto y seguridad infantil en Panamá.";
  return txt.length > 200 ? txt.slice(0, 197).trimEnd() + "…" : txt;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("producto");

  const respuesta = await next();

  /* Solo la tienda, solo si viene un producto, solo si es HTML. */
  if (!id) return respuesta;
  if (!/^\/tienda(\.html)?\/?$/.test(url.pathname)) return respuesta;
  const tipo = respuesta.headers.get("content-type") || "";
  if (!tipo.includes("text/html")) return respuesta;

  try {
    const consulta =
      `${SUPABASE_URL}/rest/v1/products` +
      `?select=id,name,price,description,image_url,images,brand,fit` +
      `&id=eq.${encodeURIComponent(id)}&active=eq.true&limit=1`;

    const r = await fetch(consulta, {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
      /* Se guarda un rato: así compartir la misma silla no consulta la
         base cada vez que alguien reenvía el mensaje. */
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!r.ok) return respuesta;

    const datos = await r.json();
    const prod = Array.isArray(datos) ? datos[0] : null;
    if (!prod) return respuesta;

    const foto = fotoParaCompartir(prod);
    const titulo = `${prod.name} | ${MARCA} Panamá`;
    const texto = resumen(prod);
    const enlace = `${SITIO}/tienda?producto=${encodeURIComponent(prod.id)}`;

    let rw = new HTMLRewriter()
      .on("title", new PonerTexto(titulo))
      .on('meta[property="og:title"]', new PonerContenido(titulo))
      .on('meta[property="og:description"]', new PonerContenido(texto))
      .on('meta[property="og:url"]', new PonerContenido(enlace))
      .on('meta[name="description"]', new PonerContenido(texto))
      .on('meta[name="twitter:title"]', new PonerContenido(titulo))
      .on('meta[name="twitter:description"]', new PonerContenido(texto));

    /* Si no hay ninguna foto que WhatsApp sepa mostrar, se deja la del
       sitio: es mejor una imagen de la marca que un hueco. */
    if (foto) {
      rw = rw
        .on('meta[property="og:image"]', new PonerContenido(foto))
        .on('meta[property="og:image:alt"]', new PonerContenido(prod.name))
        .on('meta[name="twitter:image"]', new PonerContenido(foto))
        .on('meta[property="og:image:width"]', new Borrar())
        .on('meta[property="og:image:height"]', new Borrar());
    }

    return rw.transform(respuesta);
  } catch (_) {
    return respuesta;
  }
}
