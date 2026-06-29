/* ============================================================
   servicios.js — lógica ligera de la página de servicios.
   Solo: menú móvil, enlaces de WhatsApp y comparador antes/después.
   (No carga el carrito ni el catálogo: esta es una página informativa.)
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const wa = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

  /* ---------- Año en el footer ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const navToggle = $("#navToggle");
  const nav = $("#nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => nav.classList.toggle("is-open"));
    $$("#nav a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));
  }

  /* ---------- Enlaces de WhatsApp ---------- */
  // Cualquier elemento con data-wa usa su texto como mensaje predefinido.
  $$("[data-wa]").forEach((el) => {
    el.href = wa(el.getAttribute("data-wa") || "Hola Car Seat Clinic, quiero información.");
    el.target = "_blank";
    el.rel = "noopener";
  });
  const floatWhats = $("#floatWhatsBtn");
  if (floatWhats) floatWhats.href = wa("Hola Car Seat Clinic, quisiera recibir asesoría sobre sus servicios.");

  /* ---------- Comparador "antes y después" de limpieza ---------- */
  function setupBeforeAfter() {
    const frame = $(".ba__frame");
    if (!frame) return;
    const handle = frame.querySelector(".ba__handle");
    const tagBefore = frame.querySelector(".ba__tag--before");
    const tagAfter = frame.querySelector(".ba__tag--after");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pos = 50;
    let userInteracted = false;
    const apply = (p) => {
      pos = Math.max(0, Math.min(100, p));
      frame.style.setProperty("--pos", pos + "%");
      if (handle) handle.setAttribute("aria-valuenow", Math.round(pos));
      if (tagBefore) tagBefore.style.opacity = pos < 16 ? "0" : "1";
      if (tagAfter) tagAfter.style.opacity = pos > 84 ? "0" : "1";
    };
    apply(reduce ? 50 : 100); // sin movimiento: balanceado; con movimiento: arranca sucia para el demo

    const posFromX = (clientX) => {
      const r = frame.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    };
    let dragging = false;
    frame.addEventListener("pointerdown", (e) => {
      dragging = true; userInteracted = true; frame.classList.add("is-dragging");
      apply(posFromX(e.clientX));
      if (handle) handle.focus({ preventScroll: true });
    });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      apply(posFromX(e.clientX));
      e.preventDefault();
    }, { passive: false });
    const stop = () => { dragging = false; frame.classList.remove("is-dragging"); };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);

    if (handle) {
      handle.addEventListener("keydown", (e) => {
        const step = e.shiftKey ? 10 : 4;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { userInteracted = true; apply(pos - step); e.preventDefault(); }
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") { userInteracted = true; apply(pos + step); e.preventDefault(); }
        else if (e.key === "Home") { userInteracted = true; apply(0); e.preventDefault(); }
        else if (e.key === "End") { userInteracted = true; apply(100); e.preventDefault(); }
      });
    }

    if (reduce || !("IntersectionObserver" in window)) return;
    const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const sweep = (from, to, dur) => new Promise((res) => {
      const t0 = performance.now();
      const tick = (now) => {
        if (userInteracted) return res();
        const t = Math.min(1, (now - t0) / dur);
        apply(from + (to - from) * easeOutExpo(t));
        if (t < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
    const demo = async () => {
      if (userInteracted) return;
      await sweep(100, 18, 1100);        // sucia -> limpia
      await new Promise((r) => setTimeout(r, 600));
      if (userInteracted) return;
      await sweep(18, 50, 700);          // se queda al centro para invitar a arrastrar
    };
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { obs.disconnect(); demo(); } });
    }, { threshold: 0.4 });
    io.observe(frame);
  }
  setupBeforeAfter();
})();
