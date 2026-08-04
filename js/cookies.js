/* =====================================================================
   AVISO DE COOKIES
   ---------------------------------------------------------------------
   Barra de consentimiento como la que usan los sitios en Panamá.

   Importante: hoy el sitio NO carga Google Analytics ni el píxel de
   Meta, así que la elección del visitante todavía no activa ni apaga
   nada. Queda guardada para cuando se agreguen: cualquier script de
   análisis o publicidad debe consultar antes:

       window.cookiesAceptadas()   // true solo si el visitante aceptó

   Así el aviso no es de adorno: si mañana se instala Analytics, ya
   respeta lo que la persona respondió.
   ===================================================================== */
(function () {
  "use strict";

  const CLAVE = "csc_cookies";

  function leer() {
    try { return localStorage.getItem(CLAVE); } catch (_) { return null; }
  }
  function guardar(valor) {
    try { localStorage.setItem(CLAVE, valor); } catch (_) {}
  }

  /* Lo dejamos disponible para los scripts que se agreguen después */
  window.cookiesAceptadas = function () { return leer() === "todas"; };

  /* Si ya respondió, no lo volvemos a molestar */
  if (leer()) return;

  function mostrar() {
    if (document.getElementById("cookieAviso")) return;

    const aviso = document.createElement("div");
    aviso.className = "cookieaviso";
    aviso.id = "cookieAviso";
    aviso.setAttribute("role", "region");
    aviso.setAttribute("aria-label", "Aviso de cookies");
    aviso.innerHTML =
      '<div class="cookieaviso__txt">' +
        '<strong>Usamos cookies</strong>' +
        '<span>Las necesarias hacen que el sitio funcione. Las de análisis y ' +
        'publicidad solo se activan si las aceptas. ' +
        '<a href="cookies.html">Ver la política de cookies</a>.</span>' +
      '</div>' +
      '<div class="cookieaviso__btns">' +
        '<button class="btn btn--ghost" type="button" data-cookies="necesarias">Solo las necesarias</button>' +
        '<button class="btn btn--primary" type="button" data-cookies="todas">Aceptar todas</button>' +
      '</div>';

    document.body.appendChild(aviso);
    requestAnimationFrame(() => aviso.classList.add("is-on"));

    aviso.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-cookies]");
      if (!b) return;
      guardar(b.dataset.cookies);
      aviso.classList.remove("is-on");
      setTimeout(() => aviso.remove(), 350);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(mostrar, 900));
  } else {
    setTimeout(mostrar, 900);
  }
})();
