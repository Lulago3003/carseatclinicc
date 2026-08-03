/* =====================================================================
   CINE — controlador de "El viaje" (versión 2, laboratorio)
   ---------------------------------------------------------------------
   Maneja el reloj de la pieza: cambia de escena, mueve el carrito por la
   carretera y deja que la familia toque una parada para saltar a esa etapa.
   También responde al teclado (← →, espacio) y a deslizar con el dedo.
   Se pausa solo si la persona sale de la pestaña o baja la página, para
   no gastar batería en el celular.
   ===================================================================== */
(function () {
  const cine = document.getElementById("cine");
  if (!cine) return;

  const shots   = Array.from(cine.querySelectorAll(".cine__shot"));
  const stops   = Array.from(cine.querySelectorAll(".cine__stop"));
  const etapas  = Array.from(document.querySelectorAll("#cineStages .cinestage"));
  const car     = cine.querySelector(".cine__car");
  const done    = cine.querySelector(".cine__done");
  const road    = cine.querySelector(".cine__road");
  const playBtn = cine.querySelector(".cine__play");
  const anillo  = cine.querySelector(".cine__ring-fg");
  const kicker  = cine.querySelector(".cine__kicker");
  const title   = cine.querySelector(".cine__title");
  const line    = cine.querySelector(".cine__line");

  /* Texto de cada escena. Editar aquí es seguro: no hay que tocar nada más. */
  const ESCENAS = [
    { kicker: "Etapa 1 · 0 a 15 meses",
      title:  "El primer viaje a casa",
      line:   "A contramarcha y bien ajustada. Te enseñamos a dejarla lista antes de salir del hospital." },
    { kicker: "Etapa 2 · 1 a 4 años",
      title:  "Crece con él, sin apuros",
      line:   "La silla convertible se va ajustando a su tamaño. Nosotros revisamos que siga quedando bien." },
    { kicker: "Etapa 3 · 4 a 8 años",
      title:  "Del arnés al booster",
      line:   "Cambiamos de etapa cuando tu hijo está listo, no cuando alguien dice que ya toca." },
    { kicker: "Etapa 4 · hasta 12 años",
      title:  "Que el cinturón le quede bien",
      line:   "El booster lo eleva a la posición correcta, para que el cinturón proteja donde debe." },
    { kicker: "Car Seat Clinic Center · Panamá",
      title:  "Cada etapa, protegida.",
      line:   "Emeline Velarde · Especialista Certificada en Seguridad de Niños Pasajeros (CPST), con más de 8 años acompañando familias panameñas." }
  ];

  const DURACION = 4300;                 // milisegundos por escena
  const TOTAL    = ESCENAS.length * DURACION;
  const VUELTA   = 131.95;               // perímetro del anillo de progreso
  const suave    = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let escena       = 0;
  let transcurrido = 0;                  // ms dentro de la escena actual
  let ultimoTic    = 0;
  let corriendo    = false;
  let raf          = 0;
  let tocado       = false;              // ya interactuó: ocultamos la pista

  /* ---------- Título palabra por palabra ---------- */
  function armarTitulo(texto) {
    title.textContent = "";
    texto.split(" ").forEach((palabra, i) => {
      const span = document.createElement("span");
      span.className = "cine__word";
      span.textContent = palabra;
      span.style.animationDelay = (0.14 + i * 0.055).toFixed(3) + "s";
      title.appendChild(span);
      title.appendChild(document.createTextNode(" "));
    });
  }

  /* ---------- Adelanta la foto siguiente para que el corte sea limpio ---------- */
  function precargarSiguiente() {
    const img = shots[(escena + 1) % shots.length].querySelector("img");
    if (!img || img.dataset.lista) return;
    img.dataset.lista = "1";
    const previa = new Image();
    previa.src = img.getAttribute("src");
  }

  /* ---------- Pintar una escena ---------- */
  function pintar(i) {
    escena = ((i % ESCENAS.length) + ESCENAS.length) % ESCENAS.length;
    const dato = ESCENAS[escena];

    shots.forEach((s, n) => s.classList.toggle("is-active", n === escena));

    kicker.textContent = dato.kicker;
    line.textContent   = dato.line;
    armarTitulo(dato.title);

    cine.dataset.scene = String(escena);

    /* Reinicia la animación de entrada del texto */
    cine.classList.remove("is-entering");
    void cine.offsetWidth;               // fuerza el reinicio
    cine.classList.add("is-entering");

    stops.forEach((b, n) => {
      b.classList.toggle("is-current", n === escena);
      b.classList.toggle("is-done", n < escena);
      b.setAttribute("aria-current", n === escena ? "true" : "false");
    });

    /* Las 4 tarjetas de abajo se iluminan junto con el video */
    etapas.forEach((a, n) => a.classList.toggle("is-live", n === escena));

    precargarSiguiente();
  }

  /* ---------- Mover el carrito y el anillo ---------- */
  function moverCarrito() {
    const avance = (escena * DURACION + transcurrido) / TOTAL;
    const pct = Math.min(100, Math.max(0, avance * 100));
    car.style.left = pct + "%";
    done.style.width = pct + "%";

    if (anillo) {
      const dentro = Math.min(1, transcurrido / DURACION);
      anillo.style.strokeDashoffset = (VUELTA * (1 - dentro)).toFixed(2);
    }
  }

  /* ---------- Reloj ---------- */
  function tic(ahora) {
    if (!corriendo) return;
    if (!ultimoTic) ultimoTic = ahora;

    const delta = ahora - ultimoTic;
    ultimoTic = ahora;
    transcurrido += delta;

    if (transcurrido >= DURACION) {
      transcurrido = 0;
      pintar(escena + 1);
    }

    moverCarrito();
    raf = requestAnimationFrame(tic);
  }

  function reproducir() {
    if (corriendo) return;
    corriendo = true;
    ultimoTic = 0;
    cine.classList.remove("is-paused");
    playBtn.setAttribute("aria-label", "Pausar el video");
    raf = requestAnimationFrame(tic);
  }

  function pausar() {
    corriendo = false;
    cancelAnimationFrame(raf);
    cine.classList.add("is-paused");
    playBtn.setAttribute("aria-label", "Reproducir el video");
  }

  /* ---------- Saltar a una etapa ---------- */
  function irA(i, manual) {
    transcurrido = 0;
    ultimoTic = 0;
    pintar(i);
    moverCarrito();

    if (manual) {
      marcarTocado();
      /* Deja el enlace listo para compartir por WhatsApp esa etapa exacta */
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("etapa", String(escena + 1));
        history.replaceState(null, "", url);
      } catch (_) { /* si el navegador no deja, no pasa nada */ }
    }
  }

  function marcarTocado() {
    if (tocado) return;
    tocado = true;
    cine.classList.add("is-touched");
  }

  /* ---------- Controles ---------- */
  stops.forEach((boton, i) => {
    boton.addEventListener("click", () => { irA(i, true); reproducir(); });
  });

  playBtn.addEventListener("click", () => {
    marcarTocado();
    corriendo ? pausar() : reproducir();
  });

  /* Tocar la carretera adelanta o retrocede a esa altura de la historia */
  road.addEventListener("click", (ev) => {
    if (ev.target.closest(".cine__stop")) return;   // las paradas ya se manejan solas
    const caja = road.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (ev.clientX - caja.left) / caja.width));
    const punto = p * TOTAL;
    irA(Math.floor(punto / DURACION), true);
    transcurrido = punto % DURACION;
    moverCarrito();
    reproducir();
  });

  /* Teclado: flechas para cambiar de etapa, espacio para pausar */
  cine.setAttribute("tabindex", "0");
  cine.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") { ev.preventDefault(); irA(escena + 1, true); reproducir(); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); irA(escena - 1, true); reproducir(); }
    else if (ev.key === " " || ev.key === "Spacebar") {
      ev.preventDefault();
      marcarTocado();
      corriendo ? pausar() : reproducir();
    }
  });

  /* Deslizar con el dedo en el celular */
  let tocoX = 0, tocoY = 0;
  cine.addEventListener("touchstart", (ev) => {
    tocoX = ev.changedTouches[0].clientX;
    tocoY = ev.changedTouches[0].clientY;
  }, { passive: true });

  cine.addEventListener("touchend", (ev) => {
    const dx = ev.changedTouches[0].clientX - tocoX;
    const dy = ev.changedTouches[0].clientY - tocoY;
    /* Solo cuenta si el gesto fue claramente horizontal: así no rompemos
       el desplazamiento normal de la página. */
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    irA(dx < 0 ? escena + 1 : escena - 1, true);
    reproducir();
  }, { passive: true });

  /* ---------- Ahorro de batería ---------- */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pausar();
    else if (!suave) reproducir();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) { if (!suave) reproducir(); }
        else pausar();
      });
    }, { threshold: 0.25 }).observe(cine);
  }

  /* ---------- Arranque ---------- */
  /* Si el enlace trae ?etapa=3, abre directo en esa etapa (útil para
     compartir por WhatsApp una etapa concreta). */
  let inicial = 0;
  const pedida = parseInt(new URLSearchParams(window.location.search).get("etapa"), 10);
  if (!isNaN(pedida) && pedida >= 1 && pedida <= ESCENAS.length) {
    inicial = pedida - 1;
    marcarTocado();
  }

  pintar(inicial);
  moverCarrito();

  if (suave) {
    /* Quien pidió menos movimiento ve la primera escena quieta y decide. */
    pausar();
  } else {
    reproducir();
  }
})();
