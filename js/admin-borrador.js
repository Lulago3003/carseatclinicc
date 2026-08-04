/* =====================================================================
   CRM — no perder el trabajo a medio hacer
   ---------------------------------------------------------------------
   Dos protecciones que faltaban en el panel:

   1. AVISO AL SALIR: si hay un formulario con cambios sin guardar y se
      cierra la pestaña o se recarga, el navegador pregunta antes.

   2. BORRADOR DEL BLOG: el artículo se va guardando solo en el
      navegador mientras se escribe. Si se va la luz, se cierra el
      navegador o se toca "atrás" sin querer, al volver está todo.
      El borrador se borra al guardar el artículo de verdad.

   Escribir un artículo toma media hora; perderlo por un clic en la X
   es el tipo de cosa que hace que alguien no vuelva a usar el CRM.
   ===================================================================== */
(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ===================================================================
     1 — Avisar antes de salir con cambios sin guardar
     =================================================================== */
  let sucio = false;

  function marcarSucio() { sucio = true; }
  function marcarLimpio() { sucio = false; }

  /* Cualquier campo dentro de un formulario del panel ensucia el estado */
  document.addEventListener("input", (ev) => {
    if (ev.target.closest("form")) marcarSucio();
  });

  /* Al guardar o cancelar, ya no hay nada pendiente */
  document.addEventListener("submit", () => setTimeout(marcarLimpio, 60), true);
  document.addEventListener("click", (ev) => {
    const b = ev.target;
    if (!b.closest) return;
    if (b.closest("#cancelBlogPost, #cancelEdit, [data-cancelar]")) {
      setTimeout(marcarLimpio, 60);
    }
  });

  window.addEventListener("beforeunload", (ev) => {
    if (!sucio) return;
    ev.preventDefault();
    /* El texto lo decide el navegador; basta con devolver algo. */
    ev.returnValue = "";
    return "";
  });

  /* ===================================================================
     2 — Borrador automático del artículo del blog
     =================================================================== */
  const CLAVE = "csc_borrador_blog";
  const CAMPOS = ["#bl-title", "#bl-excerpt", "#bl-body", "#bl-cover", "#bl-author"];

  function leerBorrador() {
    try { return JSON.parse(localStorage.getItem(CLAVE)); } catch (_) { return null; }
  }
  function guardarBorrador(datos) {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (_) {}
  }
  function borrarBorrador() {
    try { localStorage.removeItem(CLAVE); } catch (_) {}
  }

  function iniciarBorrador() {
    const form = $("#blogPostForm");
    if (!form) return;

    const campos = CAMPOS.map((s) => $(s)).filter(Boolean);
    if (!campos.length) return;

    /* --- Aviso visual de que se está guardando solo --- */
    const nota = document.createElement("p");
    nota.className = "muted borrador-nota";
    nota.hidden = true;
    form.appendChild(nota);

    let reloj = null;
    function anunciar(texto) {
      nota.textContent = texto;
      nota.hidden = false;
    }

    function recolectar() {
      const d = {};
      campos.forEach((c) => { d[c.id] = c.value; });
      return d;
    }

    function hayAlgo(d) {
      return Object.values(d).some((v) => (v || "").trim());
    }

    /* --- Guardar mientras escribe (esperando a que pare) --- */
    campos.forEach((c) => {
      c.addEventListener("input", () => {
        clearTimeout(reloj);
        reloj = setTimeout(() => {
          const d = recolectar();
          if (!hayAlgo(d)) { borrarBorrador(); nota.hidden = true; return; }
          d._cuando = Date.now();
          guardarBorrador(d);
          /* El formato en español ya trae su punto ("5:02 a. m."), así que
             no agregamos otro detrás o queda "a. m..". */
          const h = new Date().toLocaleTimeString("es-PA", { hour: "numeric", minute: "2-digit" });
          anunciar("Borrador guardado en este navegador a las " + h + " — todavía no se ha publicado.");
        }, 800);
      });
    });

    /* --- Al guardar de verdad, el borrador ya no hace falta --- */
    form.addEventListener("submit", () => {
      setTimeout(() => { borrarBorrador(); nota.hidden = true; }, 200);
    });

    const cancelar = $("#cancelBlogPost");
    if (cancelar) {
      cancelar.addEventListener("click", () => {
        borrarBorrador();
        nota.hidden = true;
      });
    }

    /* --- Si quedó algo de la vez pasada, ofrecer recuperarlo --- */
    const guardado = leerBorrador();
    if (!guardado || !hayAlgo(guardado)) return;

    const aviso = document.createElement("div");
    aviso.className = "borrador-aviso";
    const cuando = guardado._cuando
      ? new Date(guardado._cuando).toLocaleString("es-PA", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })
      : "hace un rato";
    aviso.innerHTML =
      '<div><strong>Tienes un artículo a medio escribir</strong>' +
      '<span>Se guardó solo el ' + cuando + ' y no llegó a publicarse.</span></div>' +
      '<div class="borrador-aviso__btns">' +
        '<button class="btn btn--primary btn--sm" type="button" data-borrador="recuperar">Seguir escribiéndolo</button>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-borrador="descartar">Descartarlo</button>' +
      '</div>';

    form.parentNode.insertBefore(aviso, form);

    aviso.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-borrador]");
      if (!b) return;
      if (b.dataset.borrador === "recuperar") {
        campos.forEach((c) => { if (guardado[c.id] != null) c.value = guardado[c.id]; });
        marcarSucio();
      } else {
        borrarBorrador();
      }
      aviso.remove();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(iniciarBorrador, 400));
  } else {
    setTimeout(iniciarBorrador, 400);
  }
})();
