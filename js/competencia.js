/* =====================================================================
   LISTA DE DESEOS + MESA DE REGALOS (versión 2, laboratorio)
   ---------------------------------------------------------------------
   Dos funciones que sí tienen las tiendas de bebé de Panamá y que aquí
   faltaban. Todo se guarda en el navegador de la familia: no toca la
   base de datos ni necesita que nadie cree una cuenta.

   La mesa de regalos se comparte metiendo la lista dentro del propio
   enlace, así que funciona aunque no haya servidor detrás.
   ===================================================================== */
(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const CLAVE = "csc_v2_favoritos";

  const store = {
    leer() {
      try { const v = JSON.parse(localStorage.getItem(CLAVE)); return Array.isArray(v) ? v : []; }
      catch (_) { return []; }
    },
    escribir(lista) {
      try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch (_) {}
    }
  };

  let favoritos = store.leer();

  function esFavorito(id) { return favoritos.some((f) => f.id === id); }

  function wa(mensaje) {
    const num = (typeof CONFIG !== "undefined" && CONFIG.whatsapp) || "";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(mensaje);
  }

  /* Guardamos una copia del nombre, precio y foto para poder mostrar la
     lista aunque el producto ya no esté en pantalla. */
  function datosDeTarjeta(card, id) {
    const img = $(".card__media img", card);
    return {
      id: id,
      nombre: ($(".card__title", card)?.textContent || "Producto").trim(),
      precio: ($(".card__price b", card)?.textContent || "").trim(),
      foto: img ? img.getAttribute("src") : ""
    };
  }

  /* ===================================================================
     Corazón en cada tarjeta
     =================================================================== */
  const CORAZON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-9.8a4.3 4.3 0 0 1 7.5-2.9 4.3 4.3 0 0 1 7.5 2.9c0 5.2-7.5 9.8-7.5 9.8z"/></svg>';

  function ponerCorazones() {
    $$(".card").forEach((card) => {
      const media = $(".card__media", card);
      if (!media || $(".favbtn", card)) return;

      const id = media.getAttribute("data-detail");
      if (!id) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "favbtn" + (esFavorito(id) ? " is-on" : "");
      btn.innerHTML = CORAZON;
      btn.setAttribute("aria-pressed", esFavorito(id) ? "true" : "false");
      btn.setAttribute("aria-label", "Guardar en mi lista de deseos");

      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();               // que no abra la ficha del producto
        if (esFavorito(id)) {
          favoritos = favoritos.filter((f) => f.id !== id);
          btn.classList.remove("is-on");
          btn.setAttribute("aria-pressed", "false");
        } else {
          favoritos.push(datosDeTarjeta(card, id));
          btn.classList.add("is-on");
          btn.setAttribute("aria-pressed", "true");
        }
        store.escribir(favoritos);
        refrescarTodo();
      });

      media.appendChild(btn);
    });
  }

  /* ===================================================================
     Botón y panel de la lista
     =================================================================== */
  function crearBotonEncabezado() {
    const zona = $(".header__actions");
    if (!zona || $("#favTop")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "favTop";
    btn.className = "cart-btn favtop";
    btn.setAttribute("aria-label", "Ver mi lista de deseos");
    btn.innerHTML = CORAZON.replace("<svg", '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"') +
                    '<span class="favtop__count" id="favTopCount" hidden>0</span>';
    btn.addEventListener("click", abrirPanel);

    const carrito = $("#openCart", zona);
    zona.insertBefore(btn, carrito || zona.firstChild);
  }

  /* Lo agregamos desde aquí y no en cada HTML para que aparezca igual en
     todas las páginas sin tocar el menú una por una. */
  function crearEnlaceMenu() {
    const nav = $("#nav");
    if (!nav || $("#navMesa")) return;
    const enlace = document.createElement("a");
    enlace.id = "navMesa";
    enlace.href = "mesa.html";
    /* Corto a propósito: con "Mesa de regalos" el menú se desbordaba y
       empezaba a apretar los demás enlaces. */
    enlace.textContent = "Regalos";
    const preguntas = $('a[href="faq.html"]', nav);
    nav.insertBefore(enlace, preguntas || null);
  }

  function crearPanel() {
    if ($("#favPanel")) return;

    const fondo = document.createElement("div");
    fondo.className = "favpanel__back";
    fondo.id = "favBack";
    fondo.addEventListener("click", cerrarPanel);

    const panel = document.createElement("aside");
    panel.className = "favpanel";
    panel.id = "favPanel";
    panel.setAttribute("aria-label", "Mi lista de deseos");
    panel.innerHTML =
      '<div class="favpanel__head">' +
        '<div><h3>Mi lista de deseos</h3><p>Guarda lo que te gusta y decide con calma.</p></div>' +
        '<button class="favpanel__close" type="button" id="favClose" aria-label="Cerrar la lista">&times;</button>' +
      '</div>' +
      '<div class="favpanel__list" id="favList"></div>' +
      '<div class="favpanel__foot" id="favFoot"></div>';

    document.body.appendChild(fondo);
    document.body.appendChild(panel);
    $("#favClose").addEventListener("click", cerrarPanel);
  }

  function abrirPanel() {
    crearPanel();
    pintarPanel();
    $("#favPanel").classList.add("is-open");
    $("#favBack").classList.add("is-open");
  }

  function cerrarPanel() {
    $("#favPanel")?.classList.remove("is-open");
    $("#favBack")?.classList.remove("is-open");
  }

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") cerrarPanel();
  });

  function pintarPanel() {
    const lista = $("#favList");
    const pie = $("#favFoot");
    if (!lista) return;

    if (!favoritos.length) {
      lista.innerHTML =
        '<div class="favpanel__empty"><strong>Todavía no has guardado nada</strong>' +
        'Toca el corazón de una silla para tenerla aquí y compararla con calma.</div>';
      pie.innerHTML = '<a class="btn btn--ghost" href="tienda.html">Ver la tienda</a>';
      return;
    }

    lista.innerHTML = favoritos.map((f) =>
      '<div class="favitem">' +
        '<span class="favitem__img">' + (f.foto ? '<img src="' + f.foto + '" alt="" />' : "") + '</span>' +
        '<span class="favitem__t">' + escapar(f.nombre) +
          (f.precio ? '<span class="favitem__p">' + escapar(f.precio) + '</span>' : "") +
        '</span>' +
        '<button class="favitem__del" type="button" data-quitar="' + f.id + '" aria-label="Quitar de la lista">&times;</button>' +
      '</div>').join("");

    $$("[data-quitar]", lista).forEach((b) => {
      b.addEventListener("click", () => {
        favoritos = favoritos.filter((f) => f.id !== b.dataset.quitar);
        store.escribir(favoritos);
        refrescarTodo();
        pintarPanel();
      });
    });

    const nombres = favoritos.map((f) => "· " + f.nombre).join("\n");
    pie.innerHTML =
      '<a class="btn btn--primary" href="mesa.html">Crear mi mesa de regalos</a>' +
      '<a class="btn btn--whatsapp" target="_blank" rel="noopener" href="' +
        wa("Hola Car Seat Clinic, estoy viendo estas opciones y quiero asesoría:\n" + nombres) +
      '">Pedir asesoría con esta lista</a>';
  }

  function escapar(t) {
    return String(t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function refrescarContador() {
    const c = $("#favTopCount");
    if (!c) return;
    c.textContent = String(favoritos.length);
    c.hidden = favoritos.length === 0;
  }

  function refrescarTodo() {
    refrescarContador();
    pintarMesa();
  }

  /* ===================================================================
     Mesa de regalos — armarla
     =================================================================== */
  function pintarMesa() {
    const caja = $("#mesaItems");
    if (!caja) return;

    if (!favoritos.length) {
      caja.innerHTML = '<p class="mesa__empty">Tu mesa está vacía. Ve a la tienda y toca el corazón ' +
        'de lo que te gustaría recibir.</p>';
      return;
    }

    caja.innerHTML = favoritos.map((f) =>
      '<div class="favitem">' +
        '<span class="favitem__img">' + (f.foto ? '<img src="' + f.foto + '" alt="" />' : "") + '</span>' +
        '<span class="favitem__t">' + escapar(f.nombre) +
          (f.precio ? '<span class="favitem__p">' + escapar(f.precio) + '</span>' : "") +
        '</span>' +
        '<button class="favitem__del" type="button" data-quitar-mesa="' + f.id + '" aria-label="Quitar del listado">&times;</button>' +
      '</div>').join("");

    $$("[data-quitar-mesa]", caja).forEach((b) => {
      b.addEventListener("click", () => {
        favoritos = favoritos.filter((f) => f.id !== b.dataset.quitarMesa);
        store.escribir(favoritos);
        refrescarTodo();
      });
    });
  }

  /* Metemos la lista dentro del enlace (base64) para que se pueda
     compartir sin base de datos. */
  function empaquetar(datos) {
    const json = JSON.stringify(datos);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function desempaquetar(txt) {
    try {
      let s = txt.replace(/-/g, "+").replace(/_/g, "/");
      while (s.length % 4) s += "=";
      return JSON.parse(decodeURIComponent(escape(atob(s))));
    } catch (_) { return null; }
  }

  function armarMesa() {
    const form = $("#mesaForm");
    if (!form) return;

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();

      if (!favoritos.length) {
        alert("Primero agrega al menos un regalo desde la tienda tocando el corazón.");
        return;
      }

      const datos = {
        b: $("#mesaBebe").value.trim(),
        f: $("#mesaFecha").value,
        m: $("#mesaMensaje").value.trim(),
        /* Solo lo necesario, para que el enlace no crezca de más */
        i: favoritos.map((x) => ({ n: x.nombre, p: x.precio, u: x.foto }))
      };

      const url = location.origin + location.pathname + "?lista=" + empaquetar(datos);

      $("#mesaUrl").value = url;
      $("#mesaLink").classList.add("is-on");
      $("#mesaShare").href = wa(
        "¡Hola! Armamos la mesa de regalos de " + (datos.b || "nuestro bebé") +
        " en Car Seat Clinic. Aquí puedes verla: " + url);
      $("#mesaUrl").select();
    });

    const copiar = $("#mesaCopiar");
    if (copiar) {
      copiar.addEventListener("click", async () => {
        const campo = $("#mesaUrl");
        campo.select();
        try {
          await navigator.clipboard.writeText(campo.value);
          copiar.textContent = "¡Copiado!";
        } catch (_) {
          copiar.textContent = "Copia el enlace de arriba";
        }
        setTimeout(() => { copiar.textContent = "Copiar el enlace"; }, 2200);
      });
    }
  }

  /* ===================================================================
     Mesa de regalos — verla (quien recibe el enlace)
     =================================================================== */
  function verMesa() {
    const zona = $("#mesaView");
    if (!zona) return;

    const crudo = new URLSearchParams(location.search).get("lista");
    if (!crudo) return;

    const datos = desempaquetar(crudo);
    if (!datos || !Array.isArray(datos.i) || !datos.i.length) return;

    /* Escondemos el armador y mostramos la lista compartida */
    const armador = $("#mesaBuild");
    if (armador) armador.hidden = true;
    zona.hidden = false;

    const bebe = datos.b || "nuestro bebé";
    let fecha = "";
    if (datos.f) {
      const d = new Date(datos.f + "T00:00:00");
      if (!isNaN(d)) {
        fecha = d.toLocaleDateString("es-PA", { day: "numeric", month: "long", year: "numeric" });
      }
    }

    zona.innerHTML =
      '<div class="mesaview__hero">' +
        '<span class="eyebrow">Mesa de regalos</span>' +
        '<h1 class="mesaview__baby">' + escapar(bebe) + '</h1>' +
        (datos.m ? '<p class="mesaview__msg">"' + escapar(datos.m) + '"</p>' : "") +
        (fecha ? '<span class="mesaview__fecha">Para el ' + escapar(fecha) + '</span>' : "") +
      '</div>' +
      '<div class="mesaview__grid">' +
        datos.i.map((it) =>
          '<article class="gift">' +
            '<div class="gift__img">' + (it.u ? '<img src="' + escapar(it.u) + '" alt="" loading="lazy" />' : "") + '</div>' +
            '<div class="gift__body">' +
              '<h3 class="gift__t">' + escapar(it.n || "Regalo") + '</h3>' +
              (it.p ? '<span class="gift__p">' + escapar(it.p) + '</span>' : "") +
              '<a class="btn btn--whatsapp" target="_blank" rel="noopener" href="' +
                wa('Hola Car Seat Clinic, quiero regalar "' + (it.n || "un artículo") +
                   '" de la mesa de regalos de ' + bebe + ".") +
              '">Quiero regalar esto</a>' +
            '</div>' +
          '</article>').join("") +
      '</div>';
  }

  /* ===================================================================
     Arranque
     =================================================================== */
  function iniciar() {
    crearBotonEncabezado();
    crearEnlaceMenu();
    ponerCorazones();
    refrescarContador();
    pintarMesa();
    armarMesa();
    verMesa();

    /* La tienda vuelve a dibujar las tarjetas al filtrar u ordenar, así que
       reponemos los corazones cuando eso pasa. */
    const grid = $("#productGrid") || $("#destacados");
    if (grid && "MutationObserver" in window) {
      new MutationObserver(() => ponerCorazones()).observe(grid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(iniciar, 80));
  } else {
    setTimeout(iniciar, 80);
  }
})();
