/* =====================================================================
   Chat / asistente con IA — módulo reutilizable para TODAS las páginas.
   Requiere: data.js (CONFIG), supabase.js (DB), chat-assistant.js.
   Se auto-inicializa si en la página existe el widget (#chatPanel).
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (m) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
    ));
  }
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg; t.classList.add("is-open");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("is-open"), 2400);
  }

  function setupChat() {
    const panel = $("#chatPanel"), msgs = $("#chatMsgs"), input = $("#chatInput");
    if (!panel || !msgs || !input) return;

    // Asegura el cliente de datos (por si esta pagina no carga store.js).
    // OJO: DB se declara con `const` en supabase.js, no vive en window.
    const hasDB = (typeof DB !== "undefined");
    if (hasDB && typeof DB.init === "function" && !DB.ready) {
      try { DB.init(); } catch (e) {}
    }

    let sid;
    try { sid = localStorage.getItem("csc_chat_session"); if (!sid) { sid = "s" + Date.now() + Math.random().toString(36).slice(2, 7); localStorage.setItem("csc_chat_session", sid); } }
    catch (e) { sid = "s" + Date.now(); }
    const history = [];
    let greeted = false;

    function bubble(role, htmlStr, extraClass = "") {
      const d = document.createElement("div");
      d.className = `chat__bubble chat__bubble--${role === "user" ? "user" : "bot"} ${extraClass}`.trim();
      d.innerHTML = htmlStr; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
    }
    function waUrl(text) {
      const msg = `Hola Car Seat Clinic, vengo del asistente web. Mi pregunta es: ${text}`;
      return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    }
    function smartReply(text) {
      if (window.ChatAssistant && typeof window.ChatAssistant.generateSmartReply === "function") {
        return window.ChatAssistant.generateSmartReply(text, { whatsapp: CONFIG.whatsapp, horario: CONFIG.horario, ubicacion: CONFIG.ubicacion, email: CONFIG.email, instagram: CONFIG.instagram });
      }
      return { intent: "unknown", needsHuman: true, answer: "Gracias por tu pregunta. Para responder bien necesito un poco mas de informacion. Puedes continuar por WhatsApp y un asesor te ayuda." };
    }
    function answerHtml(answer, showWhatsapp, originalText) {
      const safe = esc(answer || "").replace(/\n/g, "<br>");
      if (!showWhatsapp) return safe;
      return `${safe}<br><a class="chat__wa" href="${waUrl(originalText)}" target="_blank" rel="noopener">Continuar por WhatsApp</a>`;
    }
    function serviceOptionFor(reply) {
      const normalized = (reply?.capture?.service || "").toLowerCase();
      if (/limpieza/.test(normalized)) return "Limpieza y desinfeccion";
      if (/instalacion/.test(normalized)) return "Instalacion profesional";
      if (/alquiler/.test(normalized)) return "Alquiler";
      if (/asesoria|compra|cotizacion/.test(normalized)) return "Asesoria de compra";
      return "Revision de seguridad";
    }
    // Se guarda en el CRM toda pregunta real (no saludos ni "gracias").
    const NO_GUARDAR = ["greeting", "thanks", "empty"];
    async function saveAdvisorLead(reply, originalText, status = "nuevo") {
      if (!reply || !hasDB || NO_GUARDAR.includes(reply.intent)) return;
      await DB.guardarLead({
        type: reply.action === "book" ? "cita-sugerida" : "consulta-ia",
        source: "asistente-web",
        status,
        priority: reply.capture?.priority || (reply.intent === "crash" ? "urgente" : "media"),
        service: reply.capture?.service || "Consulta IA",
        message: originalText,
        session_id: sid,
        details: { intent: reply.intent, confidence: reply.confidence, answer: reply.answer },
      });
    }
    function prefillAppointment(reply, originalText) {
      const serviceSelect = $("#citaServicio");
      if (serviceSelect) {
        // Estamos en la pagina principal: prellena el calendario.
        serviceSelect.value = serviceOptionFor(reply);
        serviceSelect.dispatchEvent(new Event("change"));
        const comments = $("input[name='comentarios']");
        if (comments && !comments.value) comments.value = originalText;
        close();
        document.getElementById("citas")?.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("El calendario quedo preparado con tu solicitud");
      } else {
        // Otra pagina: llevamos a la seccion de citas en la principal.
        window.location.href = "index.html#citas";
      }
    }
    function renderAdvisorActions(reply, originalText) {
      if (!reply || !reply.needsHuman) return;
      const wrap = document.createElement("div");
      wrap.className = "chat__actions";
      if (reply.action === "book") {
        const book = document.createElement("button");
        book.type = "button"; book.textContent = "Reservar horario";
        book.addEventListener("click", () => { saveAdvisorLead(reply, originalText, "esperando_reserva"); prefillAppointment(reply, originalText); });
        wrap.appendChild(book);
      }
      const save = document.createElement("button");
      save.type = "button";
      save.textContent = reply.action === "case" ? "Guardar caso" : "Guardar consulta";
      save.addEventListener("click", async () => { await saveAdvisorLead(reply, originalText, "nuevo"); toast("Consulta guardada en el CRM"); });
      wrap.appendChild(save);
      const wa = document.createElement("a");
      wa.href = waUrl(originalText); wa.target = "_blank"; wa.rel = "noopener"; wa.textContent = "WhatsApp";
      wrap.appendChild(wa);
      msgs.appendChild(wrap); msgs.scrollTop = msgs.scrollHeight;
    }
    function clearQuickActions() { $$(".chat__quick", msgs).forEach((el) => el.remove()); }
    function quickActions() {
      const wrap = document.createElement("div");
      wrap.className = "chat__quick";
      ["¿Qué silla usa una niña de 5 años?", "Quiero instalar una silla", "Quiero cotizar un producto"].forEach((label) => {
        const btn = document.createElement("button");
        btn.type = "button"; btn.textContent = label;
        btn.addEventListener("click", () => { input.value = label; clearQuickActions(); $("#chatForm").requestSubmit(); });
        wrap.appendChild(btn);
      });
      msgs.appendChild(wrap); msgs.scrollTop = msgs.scrollHeight;
    }
    function open() {
      panel.hidden = false; $("#chatLaunch").classList.add("is-open");
      if (!greeted) {
        greeted = true;
        const hello = smartReply("hola");
        bubble("bot", answerHtml(hello.answer, false, "hola"), "chat__bubble--smart");
        quickActions();
      }
      input.focus();
    }
    function close() { panel.hidden = true; $("#chatLaunch").classList.remove("is-open"); }
    $("#chatLaunch").addEventListener("click", () => (panel.hidden ? open() : close()));
    $("#chatClose").addEventListener("click", close);
    $("#chatForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim(); if (!text) return; input.value = "";
      clearQuickActions();
      bubble("user", esc(text)); history.push({ role: "user", content: text });
      if (hasDB) DB.guardarMensaje(sid, "user", text);
      const typing = bubble("bot", '<span class="chat__typing">Escribiendo…</span>');
      let answer = "";
      const local = smartReply(text);
      try { const r = hasDB ? await DB.preguntarIA(history) : null; answer = (r && r.answer) ? r.answer : ""; } catch (err) { answer = ""; }
      typing.remove();
      if (answer) {
        bubble("bot", answerHtml(answer, !!local.needsHuman, text), "chat__bubble--ai");
        history.push({ role: "assistant", content: answer });
        if (hasDB) DB.guardarMensaje(sid, "asistente", answer);
        saveAdvisorLead({ ...local, answer }, text);
        renderAdvisorActions({ ...local, answer }, text);
      } else {
        bubble("bot", answerHtml(local.answer, !!local.needsHuman, text), "chat__bubble--smart");
        history.push({ role: "assistant", content: local.answer });
        if (hasDB) DB.guardarMensaje(sid, "asistente", "[asistente local] " + local.answer);
        saveAdvisorLead(local, text);
        renderAdvisorActions(local, text);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupChat);
  } else {
    setupChat();
  }
})();
