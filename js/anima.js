/* =====================================================================
   ANIMACIONES (versión 2, laboratorio)
   ---------------------------------------------------------------------
   · Aparición de las secciones al bajar la página
   · Parallax suave en fotos marcadas
   · Reparto automático de la aparición a secciones que no traen marca

   REGLA DE ORO: la página nunca se esconde sola. Solo ponemos la clase
   .js-anima (que es la que oculta) cuando confirmamos que podemos
   animar de verdad. Y aun así dejamos una red de seguridad por tiempo.
   ===================================================================== */
(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const suave = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sePuede = "IntersectionObserver" in window && !suave;

  /* ---------- Marcar automáticamente lo que debe aparecer ---------- */
  function marcarAutomatico() {
    /* Encabezados de sección y tarjetas: se animan sin tener que tocar
       el HTML de cada una. */
    $$(".section__head").forEach((el) => {
      if (!el.hasAttribute("data-anima")) el.setAttribute("data-anima", "sube");
    });

    const grupos = [
      ".features__grid .feature",
      ".svc-card",
      ".gstep",
      ".cinestage",
      ".cinelede__trust li",
      ".pcard",
      ".acheck",
      ".tcard",
      ".mo",
      ".bcard"
    ];

    grupos.forEach((sel) => {
      $$(sel).forEach((el, i) => {
        if (el.hasAttribute("data-anima")) return;
        el.setAttribute("data-anima", "sube");
        /* Escalonado: cada tarjeta entra un pelín después que la anterior */
        el.setAttribute("data-anima-espera", String(Math.min(i * 70, 420)));
      });
    });
  }

  /* ---------- Observador ---------- */
  function encender(el) {
    const espera = parseInt(el.getAttribute("data-anima-espera") || "0", 10);

    const prender = () => {
      el.classList.add("is-in");
      /* Pasada la transición fijamos el estado visible de forma definitiva.
         Si el navegador nunca corrió la transición, esto lo deja visible
         igual: preferimos perder la animación antes que perder el texto. */
      setTimeout(() => el.classList.add("is-done"), 1300);
    };

    if (espera > 0) setTimeout(prender, espera);
    else prender();
  }

  function iniciarAparicion() {
    const elementos = $$("[data-anima]");
    if (!elementos.length) return;

    const ojo = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        encender(e.target);
        ojo.unobserve(e.target);          // una sola vez, no cansa al usuario
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    elementos.forEach((el) => ojo.observe(el));

    /* ---------- Redes de seguridad ----------
       Nunca, por ningún motivo, puede quedar contenido invisible.

       1) A los 5 s revisamos si el observador dio señales de vida. Si no
          encendió NADA (pasa, por ejemplo, cuando el navegador reporta la
          ventana con altura cero), apagamos todo el sistema: se quita la
          clase que esconde y la página aparece completa de golpe.
       2) Si sí funciona, a los 10 s encendemos lo que haya quedado
          rezagado cerca de la pantalla. */
    setTimeout(() => {
      if (!document.querySelector("[data-anima].is-in")) {
        document.documentElement.classList.remove("js-anima");
        return;
      }
    }, 5000);

    setTimeout(() => {
      if (!document.documentElement.classList.contains("js-anima")) return;
      $$("[data-anima]:not(.is-in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 300) el.classList.add("is-in");
      });
    }, 10000);
  }

  /* ---------- Parallax ---------- */
  function iniciarParallax() {
    const capas = $$("[data-parallax]");
    if (!capas.length) return;

    let pendiente = false;

    function pintar() {
      pendiente = false;
      const mitad = window.innerHeight / 2;

      capas.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        const fuerza = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        /* Distancia del centro del elemento al centro de la pantalla */
        const centro = r.top + r.height / 2 - mitad;
        el.style.transform = "translate3d(0," + (-centro * fuerza).toFixed(1) + "px,0)";
      });
    }

    function alMover() {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(pintar);
    }

    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover, { passive: true });
    pintar();
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    marcarAutomatico();

    if (!sePuede) {
      /* Sin observador o con "menos movimiento": no escondemos nada.
         La página se ve completa desde el primer momento. */
      return;
    }

    document.documentElement.classList.add("js-anima");
    iniciarAparicion();
    iniciarParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(iniciar, 60));
  } else {
    setTimeout(iniciar, 60);
  }
})();
