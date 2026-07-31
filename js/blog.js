/* =====================================================================
   blog.js — muestra los artículos del blog.
   ---------------------------------------------------------------------
   Los artículos los escribe la administradora desde el CRM (pestaña Blog)
   y se guardan en Supabase. Aquí solo se leen y se pintan.

   Dos vistas en la misma página:
     blog.html            -> lista de artículos
     blog.html?post=slug  -> el artículo completo
   ===================================================================== */
(() => {
  const lista = document.getElementById("blogList");
  const detalle = document.getElementById("blogPost");
  if (!lista || !detalle) return;   // no estamos en el blog

  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  // Fecha en palabras: "12 de marzo de 2026".
  function fechaLarga(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("es-PA", { day: "numeric", month: "long", year: "numeric" });
  }

  // El artículo se escribe como texto normal. Cada línea en blanco separa un
  // párrafo. No se interpreta HTML: lo que la administradora escriba se
  // muestra tal cual, así un símbolo suelto nunca rompe la página.
  function parrafos(texto) {
    return String(texto || "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${esc(p).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  function tarjeta(post) {
    const url = `blog.html?post=${encodeURIComponent(post.slug)}`;
    const foto = post.portada
      ? `<span class="bcard__media"><img src="${esc(post.portada)}" alt="" loading="lazy" /></span>`
      : `<span class="bcard__media bcard__media--empty" aria-hidden="true"></span>`;
    return `<a class="bcard" href="${url}">
      ${foto}
      <span class="bcard__body">
        <span class="bcard__date">${esc(fechaLarga(post.fecha))}</span>
        <strong class="bcard__title">${esc(post.titulo)}</strong>
        ${post.resumen ? `<span class="bcard__excerpt">${esc(post.resumen)}</span>` : ""}
        <span class="bcard__link">Leer el artículo →</span>
      </span>
    </a>`;
  }

  function vacio() {
    const wa = (typeof CONFIG !== "undefined" && CONFIG.whatsapp)
      ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Car Seat Clinic 👋 Tengo una duda sobre seguridad infantil.")}`
      : "index.html#contacto";
    return `<div class="blogempty">
      <p><strong>Muy pronto vas a encontrar aquí nuestros consejos.</strong></p>
      <p>Estamos preparando guías de instalación, etapas de la silla y todo lo que nos preguntan las familias.</p>
      <a class="btn btn--whatsapp" href="${wa}" target="_blank" rel="noopener">Mientras tanto, pregúntanos por WhatsApp</a>
    </div>`;
  }

  function pintarLista(posts) {
    document.getElementById("blogPost").hidden = true;
    lista.hidden = false;
    lista.innerHTML = posts.length ? posts.map(tarjeta).join("") : vacio();
  }

  function pintarArticulo(post) {
    lista.hidden = true;
    detalle.hidden = false;
    document.title = `${post.titulo} | Car Seat Clinic Center`;
    const crumb = document.getElementById("blogCrumb");
    if (crumb) crumb.innerHTML = `<a href="blog.html">Blog</a> <span>›</span> ${esc(post.titulo)}`;
    const head = document.getElementById("blogHead");
    if (head) head.hidden = true;
    detalle.innerHTML = `
      <header class="blogpost__head">
        <span class="eyebrow">${esc(fechaLarga(post.fecha))}</span>
        <h1>${esc(post.titulo)}</h1>
        ${post.autor ? `<p class="blogpost__author">Por ${esc(post.autor)}</p>` : ""}
      </header>
      ${post.portada ? `<img class="blogpost__cover" src="${esc(post.portada)}" alt="" />` : ""}
      <div class="blogpost__body">${parrafos(post.cuerpo)}</div>
      <p class="blogpost__back"><a href="blog.html">← Ver todos los artículos</a></p>`;
  }

  function noEncontrado() {
    lista.hidden = true;
    detalle.hidden = false;
    detalle.innerHTML = `<div class="blogempty">
      <p><strong>No encontramos ese artículo.</strong></p>
      <p>Puede que lo hayamos cambiado de lugar.</p>
      <a class="btn btn--primary" href="blog.html">Ver todos los artículos</a>
    </div>`;
  }

  async function iniciar() {
    const slug = new URLSearchParams(window.location.search).get("post");
    lista.innerHTML = `<p class="muted">Cargando artículos…</p>`;
    let posts = [];
    try {
      if (typeof DB !== "undefined" && DB.ready) posts = await DB.getBlogPosts();
    } catch (e) {
      console.warn("[Car Seat Clinic] No se pudieron cargar los artículos.", e);
    }
    if (slug) {
      const post = posts.find((p) => p.slug === slug);
      if (post) pintarArticulo(post); else noEncontrado();
      return;
    }
    pintarLista(posts);
  }

  // DB.init() lo hace store.js; esperamos un instante a que la conexión
  // esté lista para no pedir los artículos antes de tiempo.
  if (typeof DB !== "undefined") {
    try { DB.init(); } catch (e) {}
  }
  setTimeout(iniciar, 60);
})();
