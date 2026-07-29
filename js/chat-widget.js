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
    function waUrl(reply, text) {
      const child = reply?.capture?.child || {};
      const childDetails = [
        child.ageYears != null ? `${child.ageYears} años` : "",
        child.ageMonths != null ? `${child.ageMonths} meses` : "",
        child.weight != null ? `${child.weight} ${child.weightUnit || "kg"}` : "",
        child.heightCm != null ? `${child.heightCm} cm` : "",
      ].filter(Boolean).join(", ");
      const msg = [
        "Hola Car Seat Clinic, vengo del asistente de la web.",
        reply?.capture?.service ? `Tema: ${reply.capture.service}.` : "",
        text ? `Consulta: ${text}` : "",
        childDetails ? `Datos compartidos: ${childDetails}.` : "",
      ].filter(Boolean).join("\n");
      return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    }
    function smartReply(text) {
      if (window.ChatAssistant && typeof window.ChatAssistant.generateSmartReply === "function") {
        return window.ChatAssistant.generateSmartReply(text, { whatsapp: CONFIG.whatsapp, horario: CONFIG.horario, ubicacion: CONFIG.ubicacion, email: CONFIG.email, instagram: CONFIG.instagram, instagramTienda: CONFIG.instagramTienda });
      }
      return { intent: "unknown", needsHuman: true, answer: "Gracias por tu pregunta. Para responder bien necesito un poco mas de informacion. Puedes continuar por WhatsApp y un asesor te ayuda." };
    }
    function needsWhatsApp(reply) {
      return Boolean(reply && (reply.handoff === "whatsapp" || reply.needsHuman));
    }
    function whatsappLabel(reply) {
      const intent = reply?.intent || "";
      const service = (reply?.capture?.service || "").toLowerCase();
      if (intent === "price") return "Cotizar por WhatsApp";
      if (intent === "crash") return "Hablar ahora por WhatsApp";
      if (intent === "rental" || intent === "rental-equipment" || /alquiler/.test(service)) return "Consultar alquiler por WhatsApp";
      if (intent === "install-how" || /instalaci/.test(service)) return "Hablar sobre la instalación";
      if (intent === "seat-fit" || intent === "seat-review" || intent === "stage-change") return "Hablar sobre este caso";
      return "Enviar mi pregunta por WhatsApp";
    }
    function compactAnswer(answer, limit = 285) {
      const text = String(answer || "").replace(/\s+/g, " ").trim();
      if (text.length <= limit) return text;
      const slice = text.slice(0, limit + 1);
      const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
      return (lastStop > Math.floor(limit * 0.45) ? slice.slice(0, lastStop + 1) : slice.slice(0, limit).trim()) + "…";
    }
    function answerHtml(answer, reply, originalText) {
      const safe = esc(answer || "").replace(/\n/g, "<br>");
      if (!needsWhatsApp(reply)) return safe;
      const label = whatsappLabel(reply);
      return `${safe}<a class="chat__wa chat__wa--direct" href="${waUrl(reply, originalText)}" target="_blank" rel="noopener" aria-label="${esc(label)}">${esc(label)}</a><small class="chat__handoff-note">Se abrirá WhatsApp con tu consulta lista.</small>`;
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
      return DB.guardarLead({
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
      const isRental = serviceOptionFor(reply) === "Alquiler";
      // El alquiler vive en su propia pagina (alquiler.html), con su propio
      // calendario. Nunca lo mezclamos con el formulario de citas del Inicio.
      if (isRental) {
        if (location.pathname.endsWith("alquiler.html")) {
          close();
          document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth", block: "start" });
          toast("Elige tus fechas en el calendario de abajo");
        } else {
          window.location.href = "alquiler.html#reservar";
        }
        return;
      }
      const serviceSelect = $("#citaServicio");
      // El select de alquiler.html solo trae la opcion "Alquiler" (fija), no
      // sirve para otros servicios aunque exista en esa pagina.
      const usable = serviceSelect && serviceSelect.options.length > 1;
      if (usable) {
        // Estamos en el Inicio: prellena el calendario de citas.
        serviceSelect.value = serviceOptionFor(reply);
        serviceSelect.dispatchEvent(new Event("change"));
        const comments = $("input[name='comentarios']");
        if (comments && !comments.value) comments.value = originalText;
        close();
        document.getElementById("citas")?.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("El calendario quedo preparado con tu solicitud");
      } else {
        // Otra pagina: llevamos a la seccion de citas en el Inicio.
        window.location.href = "index.html#citas";
      }
    }
    function renderAdvisorActions(reply, originalText) {
      if (!reply || reply.action !== "book") return;
      const wrap = document.createElement("div");
      wrap.className = "chat__actions chat__actions--secondary";
      const book = document.createElement("button");
      book.type = "button";
      book.textContent = serviceOptionFor(reply) === "Alquiler" ? "Reservar fechas en la web" : "Ver horarios en la web";
      book.addEventListener("click", () => prefillAppointment(reply, originalText));
      wrap.appendChild(book);
      msgs.appendChild(wrap); msgs.scrollTop = msgs.scrollHeight;
    }
    // Recomendación: tras una respuesta sobre sillas, sugiere ver el catálogo filtrado
    function recommendCategory(t) {
      t = (t || "").toLowerCase();
      if (/recien nacid|reci[eé]n nacid|porta ?beb|grupo 0|0 a 12 mes/.test(t)) return ["recien-nacidos", "sillas para recién nacido"];
      if (/360|giratori/.test(t)) return ["giro-360", "sillas giratorias 360°"];
      if (/booster|elevador/.test(t)) return ["booster", "boosters"];
      if (/combinad/.test(t)) return ["combinadas", "sillas combinadas"];
      if (/convertibl/.test(t)) return ["convertibles", "sillas convertibles"];
      if (/silla|asiento|car ?seat|beb[eé]/.test(t)) return ["todos", "nuestras sillas"];
      return null;
    }
    function recoActions(text) {
      const rec = recommendCategory(text);
      if (!rec) return;
      const [cat, label] = rec;
      const prods = (Array.isArray(window.CSC_PRODUCTS) ? window.CSC_PRODUCTS : [])
        .filter((p) => (cat === "todos" || p.categoria === cat) && p.activo !== false).slice(0, 3);
      const wrap = document.createElement("div");
      wrap.className = "chat__reco";
      if (prods.length) wrap.innerHTML = `<small>En el catálogo: ${prods.map((p) => esc(p.nombre)).join(" · ")}</small>`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat__recobtn";
      btn.textContent = "Ver " + label + " →";
      btn.addEventListener("click", () => {
        close();
        // store.js define esto en todas las paginas; si por algo faltara,
        // vamos directo a la tienda (nunca a un enlace que ya no existe).
        if (typeof window.CSC_showCatalog === "function") window.CSC_showCatalog(cat);
        else window.location.href = `tienda.html${cat && cat !== "todos" ? "?cat=" + encodeURIComponent(cat) : ""}`;
      });
      wrap.appendChild(btn);
      msgs.appendChild(wrap);
      msgs.scrollTop = msgs.scrollHeight;
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
      const direct = document.createElement("a");
      direct.href = waUrl({ capture: { service: "Consulta general" } }, "Quiero hablar con una asesora.");
      direct.target = "_blank"; direct.rel = "noopener"; direct.textContent = "Hablar por WhatsApp";
      wrap.appendChild(direct);
      msgs.appendChild(wrap); msgs.scrollTop = msgs.scrollHeight;
    }
    function open() {
      panel.hidden = false; $("#chatLaunch").classList.add("is-open");
      if (!greeted) {
        greeted = true;
        const hello = smartReply("hola");
        bubble("bot", answerHtml(hello.answer, hello, "hola"), "chat__bubble--smart");
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
      const local = smartReply(text);
      const handoff = needsWhatsApp(local);
      // La respuesta local es la fuente principal del chat público: es corta,
      // segura y sabe cuándo debe llevar la consulta a una persona. La Edge
      // Function sigue disponible para resúmenes del CRM; solo se usa aquí si
      // se activa expresamente esta opción y nunca para una derivación humana.
      let answer = local.answer;
      let sourceClass = "chat__bubble--smart";
      if (CONFIG.chat?.respuestasRemotasEnChat === true && !handoff) {
        const typing = bubble("bot", '<span class="chat__typing">Escribiendo…</span>');
        try {
          const remote = hasDB ? await DB.preguntarIA(history) : null;
          if (remote?.answer) { answer = remote.answer; sourceClass = "chat__bubble--ai"; }
        } catch (err) {}
        typing.remove();
      }
      const visibleAnswer = compactAnswer(answer);
      const reply = { ...local, answer: visibleAnswer };
      bubble("bot", answerHtml(visibleAnswer, reply, text), sourceClass);
      history.push({ role: "assistant", content: visibleAnswer });
      if (hasDB) DB.guardarMensaje(sid, "asistente", sourceClass === "chat__bubble--ai" ? visibleAnswer : "[asistente local] " + visibleAnswer);
      await saveAdvisorLead(reply, text);
      renderAdvisorActions(reply, text);
      if (!handoff) recoActions(visibleAnswer + " " + text);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupChat);
  } else {
    setupChat();
  }
})();
