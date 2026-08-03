/* =====================================================================
   FAMILIA — lógica de los añadidos de la versión 2 (laboratorio)
   ---------------------------------------------------------------------
   1. Calculadora "¿En qué etapa va tu peque?" (y lo recuerda)
   2. Auto-chequeo en 3 pasos
   3. Checklist "Antes de arrancar" (se guarda en el navegador)
   5. Contadores que suben solos
   6. Señal de "Abierto ahora" en hora de Panamá
   (4 y 7 son solo diseño, no necesitan JS)
   ===================================================================== */
(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* Guarda cosas en el navegador sin romperse si está bloqueado
     (modo incógnito, permisos, etc.). */
  const guardar = {
    leer(clave) {
      try { return JSON.parse(localStorage.getItem(clave)); }
      catch (_) { return null; }
    },
    escribir(clave, valor) {
      try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (_) {}
    },
    borrar(clave) {
      try { localStorage.removeItem(clave); } catch (_) {}
    }
  };

  /* Enlace de WhatsApp con mensaje, usando el número de data.js */
  function wa(mensaje) {
    const num = (typeof CONFIG !== "undefined" && CONFIG.whatsapp) || "";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(mensaje);
  }

  /* ===================================================================
     1 — ¿En qué etapa va tu peque?
     =================================================================== */
  (function etapaDelPeque() {
    const form = $("#pqForm");
    if (!form) return;

    const campoNombre = $("#pqNombre");
    const campoNace   = $("#pqNace");
    const caja        = $("#pqResult");
    const elHi        = $("#pqHi");
    const elStage     = $("#pqStage");
    const elTxt       = $("#pqTxt");
    const elBar       = $("#pqBar");
    const elNext      = $("#pqNext");
    const elVer       = $("#pqVer");
    const elWa        = $("#pqWa");
    const vuelve      = $("#pqBack");
    const vuelveN     = $("#pqBackName");
    const olvidar     = $("#pqOlvidar");

    const CLAVE = "csc_v2_peque";

    /* Rangos en meses. Son la misma guía por etapas que ya usa la página. */
    const ETAPAS = [
      { desde: 0,   hasta: 15,  cat: "recien-nacidos",
        nombre: "Silla de recién nacido",
        texto:  "Le toca viajar <strong>a contramarcha</strong>, con el arnés bien ceñido y el broche del pecho a la altura de las axilas." },
      { desde: 15,  hasta: 48,  cat: "convertibles",
        nombre: "Silla convertible",
        texto:  "Puede seguir <strong>a contramarcha el mayor tiempo posible</strong> mientras esté dentro del peso y la estatura de la silla. Es lo que mejor protege su cabeza y su cuello." },
      { desde: 48,  hasta: 96,  cat: "combinadas",
        nombre: "Silla combinada",
        texto:  "Sigue con <strong>arnés de 5 puntos</strong> hasta que supere el límite de la silla. Después pasa a booster, no antes." },
      { desde: 96,  hasta: 144, cat: "booster",
        nombre: "Booster",
        texto:  "El booster lo <strong>eleva</strong> para que el cinturón le cruce el hombro y la cadera, no el cuello ni la barriga." }
    ];

    function mesesDesde(fechaISO) {
      const n = new Date(fechaISO + "T00:00:00");
      if (isNaN(n)) return null;
      const hoy = new Date();
      if (n > hoy) return null;                     // fecha en el futuro
      let m = (hoy.getFullYear() - n.getFullYear()) * 12 + (hoy.getMonth() - n.getMonth());
      if (hoy.getDate() < n.getDate()) m--;
      return Math.max(0, m);
    }

    function enPalabras(meses) {
      if (meses < 24) return meses + (meses === 1 ? " mes" : " meses");
      const a = Math.floor(meses / 12);
      const r = meses % 12;
      return a + (a === 1 ? " año" : " años") + (r ? " y " + r + (r === 1 ? " mes" : " meses") : "");
    }

    function pintar(nombre, fechaISO) {
      const meses = mesesDesde(fechaISO);
      if (meses === null) {
        elHi.textContent = "Revisa la fecha";
        elStage.textContent = "Esa fecha no nos cuadra";
        elTxt.innerHTML = "Parece una fecha futura o incompleta. Escríbela de nuevo y te decimos la etapa exacta.";
        elBar.style.width = "0%";
        elNext.textContent = "";
        caja.classList.add("is-on");
        return;
      }

      const tratamiento = nombre ? nombre : "tu peque";
      const etapa = ETAPAS.find((e) => meses < e.hasta);

      if (!etapa) {
        elHi.textContent = "Ya creció";
        elStage.textContent = "Puede usar el cinturón solo";
        elTxt.innerHTML = "Con " + enPalabras(meses) + ", " + tratamiento +
          " normalmente ya no necesita booster. Aun así vale la pena revisar que el cinturón le cruce bien el hombro y la cadera.";
        elBar.style.width = "100%";
        elNext.textContent = "¿Dudas? Lo revisamos contigo sin costo.";
        elVer.href = "servicios.html";
        elVer.textContent = "Ver el chequeo de seguridad";
        elWa.href = wa("Hola Car Seat Clinic, mi hijo tiene " + enPalabras(meses) + " y quiero saber si ya puede usar el cinturón solo.");
        caja.classList.add("is-on");
        return;
      }

      const dentro = (meses - etapa.desde) / (etapa.hasta - etapa.desde);
      const faltan = etapa.hasta - meses;

      elHi.textContent = nombre ? "Para " + nombre : "Según su edad";
      elStage.textContent = etapa.nombre;
      elTxt.innerHTML = "Con <strong>" + enPalabras(meses) + "</strong>, " + tratamiento + " va en esta etapa. " + etapa.texto;
      elBar.style.width = Math.round(Math.min(1, Math.max(0.04, dentro)) * 100) + "%";
      elNext.textContent = "Aproximadamente en " + enPalabras(faltan) +
        " toca revisar el cambio a la siguiente etapa. Recuerda: el cambio manda por peso y estatura, no solo por edad.";

      elVer.href = "tienda.html?cat=" + etapa.cat;
      elVer.textContent = "Ver sillas de esta etapa";
      elWa.href = wa("Hola Car Seat Clinic, " + tratamiento + " tiene " + enPalabras(meses) +
        " y quiero confirmar si la silla que uso es la correcta.");

      caja.classList.add("is-on");
    }

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const nombre = campoNombre.value.trim();
      const fecha  = campoNace.value;
      if (!fecha) { campoNace.focus(); return; }
      guardar.escribir(CLAVE, { nombre: nombre, nace: fecha });
      pintar(nombre, fecha);
      vuelve.classList.remove("is-on");
    });

    /* Si ya vino antes, lo saludamos y mostramos su etapa al instante */
    const memoria = guardar.leer(CLAVE);
    if (memoria && memoria.nace) {
      campoNombre.value = memoria.nombre || "";
      campoNace.value = memoria.nace;
      if (memoria.nombre) {
        vuelveN.textContent = memoria.nombre;
        vuelve.classList.add("is-on");
      }
      pintar(memoria.nombre || "", memoria.nace);
    }

    if (olvidar) {
      olvidar.addEventListener("click", () => {
        guardar.borrar(CLAVE);
        campoNombre.value = "";
        campoNace.value = "";
        caja.classList.remove("is-on");
        vuelve.classList.remove("is-on");
        campoNombre.focus();
      });
    }
  })();

  /* ===================================================================
     2 — Auto-chequeo en 3 pasos
     =================================================================== */
  (function autoChequeo() {
    const tabs = $$(".chk__tab");
    if (!tabs.length) return;
    const paneles = $$(".chk__panel");

    function mostrar(id) {
      tabs.forEach((t) => {
        const on = t.dataset.chk === id;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      paneles.forEach((p) => p.classList.toggle("is-on", p.dataset.chk === id));
    }

    tabs.forEach((t) => t.addEventListener("click", () => mostrar(t.dataset.chk)));
    mostrar(tabs[0].dataset.chk);
  })();

  /* ===================================================================
     3 — Checklist "Antes de arrancar"
     =================================================================== */
  (function antesDeArrancar() {
    const lista = $("#antesList");
    if (!lista) return;

    const cajas   = $$('input[type="checkbox"]', lista);
    const anillo  = $("#antesRing");
    const cuenta  = $("#antesCount");
    const listo   = $("#antesDone");
    const reiniciar = $("#antesReset");
    const contenedor = $("#antesRingWrap");
    const VUELTA = 389.56;                    // 2 · π · 62
    const CLAVE  = "csc_v2_antes";

    function refrescar(guardando) {
      const hechos = cajas.filter((c) => c.checked).length;

      cajas.forEach((c) => c.closest(".acheck").classList.toggle("is-done", c.checked));

      if (anillo) anillo.style.strokeDashoffset = (VUELTA * (1 - hechos / cajas.length)).toFixed(2);
      if (cuenta) cuenta.textContent = hechos + "/" + cajas.length;
      if (contenedor) contenedor.classList.toggle("is-full", hechos === cajas.length);
      if (listo) listo.classList.toggle("is-on", hechos === cajas.length);

      if (guardando) guardar.escribir(CLAVE, cajas.map((c) => c.checked));
    }

    cajas.forEach((c) => c.addEventListener("change", () => refrescar(true)));

    /* Recupera lo que ya había marcado en una visita anterior */
    const memoria = guardar.leer(CLAVE);
    if (Array.isArray(memoria)) {
      cajas.forEach((c, i) => { c.checked = !!memoria[i]; });
    }
    refrescar(false);

    if (reiniciar) {
      reiniciar.addEventListener("click", () => {
        cajas.forEach((c) => { c.checked = false; });
        refrescar(true);
      });
    }

    /* ---- Para qué sirve la lista: mandársela a quien maneja ----
       Es lo que le da sentido al checklist. Muchas veces quien lleva al
       niño no es quien instaló la silla (el papá, la abuela, el tío),
       así que la lista se arma en texto y se manda por WhatsApp. */
    const compartir = $("#antesCompartir");
    if (compartir) {
      const puntos = cajas.map((c) => {
        const t = c.closest(".acheck").querySelector(".acheck__t");
        const titulo = t.childNodes[0].textContent.trim();
        const detalle = (t.querySelector("small") || {}).textContent || "";
        return "• " + titulo + (detalle ? "\n   " + detalle.trim() : "");
      }).join("\n");

      compartir.href = wa(
        "Antes de arrancar con el peque, por favor revisa estos 6 puntos:\n\n" +
        puntos +
        "\n\n(Lista de Car Seat Clinic Center · carseatclinic.com.pa)");
    }

    const imprimir = $("#antesImprimir");
    if (imprimir) imprimir.addEventListener("click", () => window.print());
  })();

  /* ===================================================================
     5 — Contadores que suben solos al llegar a "Quiénes somos"
     =================================================================== */
  (function contadores() {
    const numeros = $$(".stats .stat strong");
    if (!numeros.length || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Separa "+500" en prefijo "+", número 500 y sufijo "" para poder
       animar solo la parte numérica sin perder el símbolo. */
    const piezas = numeros.map((el) => {
      const bruto = el.textContent.trim();
      const m = bruto.match(/^([^\d]*)([\d.,]+)(.*)$/);
      if (!m) return null;
      return {
        el: el,
        pre: m[1],
        fin: parseFloat(m[2].replace(",", ".")),
        pos: m[3],
        dec: (m[2].split(".")[1] || "").length
      };
    }).filter(Boolean);

    if (!piezas.length) return;

    /* OJO: no ponemos los números en cero al cargar. El valor real ya está en
       el HTML y ese es el que debe quedar si algo sale mal. Solo bajamos a
       cero en el instante en que de verdad vamos a animar. */

    const DUR = 1400;

    function fijar(p) {
      p.el.textContent = p.pre + p.fin.toFixed(p.dec) + p.pos;
    }

    function correr(p) {
      if (p.corriendo) return;
      p.corriendo = true;

      /* Usamos el reloj del sistema (Date.now) y no el de las animaciones:
         si el navegador frena la pestaña, igual llegamos al número correcto
         en vez de quedarnos en "+27 familias", que sería un dato falso. */
      const t0 = Date.now();
      p.el.textContent = p.pre + (0).toFixed(p.dec) + p.pos;

      function paso() {
        const t = Math.min(1, (Date.now() - t0) / DUR);
        const suave = 1 - Math.pow(1 - t, 3);         // desacelera al final
        p.el.textContent = p.pre + (p.fin * suave).toFixed(p.dec) + p.pos;
        if (t < 1) requestAnimationFrame(paso);
        else fijar(p);
      }
      requestAnimationFrame(paso);

      /* Red de seguridad: pase lo que pase con los frames, al terminar el
         tiempo el número queda en su valor real. */
      setTimeout(() => fijar(p), DUR + 120);
    }

    const ojo = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const p = piezas.find((x) => x.el === e.target);
        if (p) correr(p);
        ojo.unobserve(e.target);                       // solo una vez
      });
    }, { threshold: 0.6 });

    piezas.forEach((p) => ojo.observe(p.el));
  })();

  /* ===================================================================
     6 — ¿Estamos abiertos ahora? (hora de Panamá, no la del visitante)
     =================================================================== */
  (function abiertoAhora() {
    const chips = $$(".abierto");
    if (!chips.length) return;

    /* Debe coincidir con CONFIG.horario de data.js: Lun a Sáb, 9:00 – 18:00 */
    const ABRE = 9, CIERRA = 18;
    const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

    function horaPanama() {
      try {
        const f = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Panama",
          weekday: "short", hour: "numeric", minute: "numeric", hour12: false
        });
        const p = {};
        f.formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
        const mapa = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        return { dia: mapa[p.weekday], hora: parseInt(p.hour, 10) % 24, min: parseInt(p.minute, 10) };
      } catch (_) {
        const d = new Date();
        return { dia: d.getDay(), hora: d.getHours(), min: d.getMinutes() };
      }
    }

    function bonita(h) {
      const ampm = h >= 12 ? "p.m." : "a.m.";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return h12 + ":00 " + ampm;
    }

    function proximoDiaAbierto(dia) {
      for (let i = 1; i <= 7; i++) {
        const d = (dia + i) % 7;
        if (d !== 0) return { d: d, enDias: i };
      }
      return { d: 1, enDias: 1 };
    }

    function actualizar() {
      const ahora = horaPanama();
      const esLaboral = ahora.dia !== 0;                      // domingo cerrado
      const minutosAhora = ahora.hora * 60 + ahora.min;
      const abierto = esLaboral && minutosAhora >= ABRE * 60 && minutosAhora < CIERRA * 60;

      let etiqueta, detalle;

      if (abierto) {
        const faltan = CIERRA * 60 - minutosAhora;
        etiqueta = "Abierto ahora";
        detalle = faltan <= 60
          ? "· cerramos en " + faltan + " min"
          : "· hasta las " + bonita(CIERRA);
      } else {
        etiqueta = "Cerrado";
        if (esLaboral && minutosAhora < ABRE * 60) {
          detalle = "· abrimos hoy a las " + bonita(ABRE);
        } else {
          const sig = proximoDiaAbierto(ahora.dia);
          detalle = "· abrimos " + (sig.enDias === 1 ? "mañana" : "el " + DIAS[sig.d]) +
                    " a las " + bonita(ABRE);
        }
      }

      chips.forEach((chip) => {
        chip.classList.toggle("is-open", abierto);
        chip.classList.toggle("is-closed", !abierto);
        const t = $(".abierto__t", chip);
        const s = $(".abierto__d", chip);
        if (t) t.textContent = etiqueta;
        if (s) s.textContent = detalle;
      });
    }

    actualizar();
    setInterval(actualizar, 60000);           // se refresca cada minuto
  })();
})();
