/* =====================================================================
   Car Seat Clinic Center - Panel de administración (CRM)
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const money = (n) => CONFIG.moneda + Number(n || 0).toLocaleString("en-US");
  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-open");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("is-open"), 2600);
  }

  const CATS = [
    ["recien-nacidos", "Recién nacidos"], ["convertibles", "Convertible"], ["giro-360", "Silla 360°"],
    ["combinadas", "Combinada"], ["booster", "Booster"], ["accesorios", "Accesorio"],
    ["limpieza", "Limpieza"], ["gift-cards", "Gift Card"],
  ];
  const catLabel = (c) => (CATS.find((x) => x[0] === c) || [c, c])[1];

  // Una oferta existe únicamente cuando el precio normal es mayor que el
  // precio de venta. Así una cifra vieja o incompleta nunca se muestra como
  // descuento en la tienda.
  function saleInfo(p) {
    const price = Number(p && p.precio);
    const before = Number(p && p.antes);
    if (!Number.isFinite(price) || !Number.isFinite(before) || price <= 0 || before <= price) return null;
    const saving = before - price;
    return { price, before, saving, percent: Math.round((saving / before) * 100) };
  }

  // Las fechas del CRM son de Panamá. toISOString() usa UTC y desde las 7 p. m.
  // podía convertir "hoy" en mañana, dejando citas fuera de la agenda.
  function localDateKey(value = new Date()) {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const LEAD_ESTADOS = [
    ["nuevo", "Nuevo"],
    ["contactado", "Contactado"],
    ["cotizado", "Cotizado"],
    ["ganado", "Ganado"],
    ["perdido", "Perdido"],
    // compatibilidad con estados antiguos
    ["esperando_reserva", "Esperando reserva"],
    ["reservado", "Reservado"],
    ["completado", "Completado"],
    ["cancelado", "Cancelado"],
  ];
  const leadStatusLabel = (status) => (LEAD_ESTADOS.find(([value]) => value === status) || LEAD_ESTADOS[0])[1];
  // Embudo de ventas (orden de etapas)
  const PIPELINE = ["nuevo", "esperando_reserva", "contactado", "cotizado", "ganado", "perdido"];
  let convGroups = {}; // transcripciones del chat por sesión (para el resumen IA)

  let products = [];          // cache para el panel
  let orders = [];
  let serviceLeads = [];
  let ordersCount = 0;
  let editingId = null;
  let editorImages = [];
  let editorFeatures = [];

  /* ---------- Arranque ---------- */
  DB.init();
  if (!DB.ready) {
    $("#gateTitle").textContent = "Falta conectar la base de datos";
    $("#gateMsg").innerHTML = "Aún no has configurado Supabase. Sigue la guía del <strong>README</strong>.";
    $("#gateLogin").style.display = "none";
  } else {
    boot();
  }
  async function boot() {
    DB.onAuthChange(gate);
    await gate();
  }

  // Solo entra quien inicie sesión de verdad (correo/Google) y esté en
  // CONFIG.adminEmails o marcado como admin en la base de datos.
  async function gate() {
    const user = await DB.getUser();
    if (!user) { showGate("login"); return; }
    const profile = await DB.getProfile();
    const emails = (CONFIG.adminEmails || []).map((e) => e.toLowerCase());
    const adminByEmail = emails.includes((user.email || "").toLowerCase());
    if (!adminByEmail && (!profile || !profile.is_admin)) { showGate("noadmin", user.email); return; }
    showPanel();
  }

  function showGate(mode, email) {
    $("#gate").hidden = false; $("#panel").hidden = true; $("#logoutBtn").style.display = "none";
    if (mode === "noadmin") {
      $("#gateTitle").textContent = "Tu cuenta no es administradora";
      $("#gateMsg").innerHTML = `Estás como <strong>${email}</strong>, pero no tienes permisos de admin.`;
      $("#gateLogin").style.display = "none";
      $("#logoutBtn").style.display = "inline-flex";
    } else {
      $("#gateTitle").textContent = "Acceso de administrador";
      $("#gateMsg").textContent = "Inicia sesión con la cuenta de administrador.";
      $("#gateLogin").style.display = "block";
    }
  }

  async function showPanel() {
    $("#gate").hidden = true; $("#panel").hidden = false; $("#logoutBtn").style.display = "inline-flex";
    setAdminDate();
    setupCategoryFilter();
    await renderProducts();
    await renderOrders();
    await renderServiceLeads();
    renderDashboard();
    updateConvBadge();
  }

  /* ---------- Login ---------- */
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#loginError"); err.textContent = "";
    const d = Object.fromEntries(new FormData(e.target).entries());
    const { error } = await DB.signIn(d.email, d.password);
    if (error) { err.textContent = /Invalid login/i.test(error.message) ? "Correo o contraseña incorrectos." : error.message; return; }
    await gate();
  });
  $("#googleBtn").addEventListener("click", () => DB.signInGoogle());
  $("#logoutBtn").addEventListener("click", async () => {
    await DB.signOut(); await gate();
  });

  /* ---------- Pestañas ---------- */
  function activateTab(name) {
    $$(".tab").forEach((x) => {
      const active = x.dataset.tab === name;
      x.classList.toggle("is-active", active);
      x.setAttribute("aria-selected", String(active));
    });
    ["dashboard", "productos", "pedidos", "agenda", "conversaciones"].forEach((tab) => {
      const panel = $(`#tab-${tab}`);
      if (panel) panel.hidden = tab !== name;
    });
    if (name === "agenda") renderServiceLeads();
    if (name === "conversaciones") renderConversaciones();
  }

  async function renderConversaciones() {
    const cont = $("#convList"); if (!cont) return;
    cont.innerHTML = `<p class="muted">Cargando…</p>`;
    let rows = [];
    try { rows = await DB.getConversaciones(); }
    catch (e) { cont.innerHTML = `<p class="muted">No se pudieron cargar (¿corriste <code>supabase-chat.sql</code>?).</p>`; return; }
    if (!rows.length) { cont.innerHTML = `<p class="muted">Aún no hay conversaciones. Aparecerán cuando los clientes usen el chat.</p>`; return; }
    const groups = {};
    rows.forEach((r) => { (groups[r.session_id] = groups[r.session_id] || []).push(r); });
    convGroups = groups;
    const latest = (msgs) => msgs[msgs.length - 1] || {};
    const order = Object.keys(groups).sort((a, b) => new Date(latest(groups[b]).created_at || 0) - new Date(latest(groups[a]).created_at || 0));
    const todayIso = localDateKey();
    setBadge("badge-conversaciones", order.filter((sid) => localDateKey(latest(groups[sid]).created_at) === todayIso).length);
    let openedNewest = false;
    cont.innerHTML = order.map((sid) => {
      const msgs = groups[sid];
      const last = latest(msgs);
      const fecha = new Date(last.created_at).toLocaleString("es-PA", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
      const clientMessage = [...msgs].reverse().find((m) => m.rol === "user") || last;
      const excerpt = String(clientMessage.mensaje || "").replace(/\s+/g, " ").trim();
      const shortExcerpt = excerpt.length > 110 ? `${excerpt.slice(0, 109).trim()}…` : excerpt;
      const open = !openedNewest;
      openedNewest = true;
      const body = msgs.map((m) => `<div class="conv__msg conv__msg--${m.rol === "user" ? "user" : "bot"}"><b>${m.rol === "user" ? "Cliente" : "Asistente"}:</b> ${esc(m.mensaje)}</div>`).join("");
      return `<details class="admin__card conv-card" data-conv="${esc(sid)}" ${open ? "open" : ""}>
        <summary class="conv__head">
          <div><strong>Consulta</strong><span class="muted">${esc(fecha)} · ${msgs.length} mensaje${msgs.length === 1 ? "" : "s"}</span></div>
          ${shortExcerpt ? `<span class="conv__preview">${esc(shortExcerpt)}</span>` : ""}
        </summary>
        <div class="conv__body">
          <div class="conv__actions">
          <button class="btn btn--ghost btn--sm" type="button" data-summarize="${esc(sid)}">Resumir</button>
          </div>
          <div class="conv__summary" hidden></div>
          ${body}
        </div>
      </details>`;
    }).join("");
  }

  // Resumen con IA de una conversación
  $("#convList")?.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-summarize]");
    if (!btn) return;
    const sid = btn.getAttribute("data-summarize");
    const msgs = convGroups[sid] || [];
    const card = btn.closest("[data-conv]");
    const box = card ? card.querySelector(".conv__summary") : null;
    if (!box) return;
    box.hidden = false; box.textContent = "Resumiendo…";
    const transcript = msgs.map((m) => (m.rol === "user" ? "Cliente" : "Asistente") + ": " + m.mensaje).join("\n");
    try {
      const r = await DB.preguntarIA([{ role: "user", content: "Resume en UNA sola frase, en español, qué necesita o busca este cliente (incluye edad, peso o zona si aparecen). No saludes, solo el resumen:\n\n" + transcript }]);
      box.textContent = (r && r.answer) ? "📝 " + r.answer : "No se pudo resumir.";
    } catch (err) {
      box.textContent = "No se pudo resumir (la IA no respondió).";
    }
  });

  async function updateConvBadge() {
    try {
      const rows = await DB.getConversaciones();
      const groups = {};
      rows.forEach((r) => { (groups[r.session_id] = groups[r.session_id] || []).push(r); });
      const todayIso = localDateKey();
      const today = Object.keys(groups).filter((sid) => {
        const last = groups[sid][groups[sid].length - 1] || {};
        return localDateKey(last.created_at) === todayIso;
      }).length;
      setBadge("badge-conversaciones", today);
    } catch (e) {}
  }

  $$(".tab").forEach((t) => t.addEventListener("click", () => {
    activateTab(t.dataset.tab);
  }));

  $$("[data-jump-tab]").forEach((btn) => btn.addEventListener("click", () => {
    const filter = btn.getAttribute("data-product-filter");
    if (filter && $("#stockFilter")) {
      $("#stockFilter").value = filter;
      renderList();
    }
    activateTab(btn.getAttribute("data-jump-tab"));
  }));

  function setAdminDate() {
    const target = $("#adminDate");
    if (!target) return;
    const date = new Date().toLocaleDateString("es-PA", {
      weekday: "long", day: "numeric", month: "long",
    });
    target.textContent = date.charAt(0).toUpperCase() + date.slice(1);
  }

  function setupCategoryFilter() {
    const filter = $("#categoryFilter");
    if (!filter || filter.options.length) return;
    filter.innerHTML = `<option value="all">Todas</option>` + CATS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  }

  /* ---------- Lista de productos ---------- */
  async function renderProducts() {
    try { products = await DB.getProductsAdmin(); } catch (e) { toast("Error al cargar productos"); return; }
    renderStats();
    renderList();
  }

  function renderStats() {
    const out = products.filter((p) => p.stock <= 0).length;
    const low = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const noPhoto = products.filter((p) => !p.imagen).length;
    const sales = products.filter((p) => saleInfo(p)).length;
    $("#adminStats").innerHTML = `
      <div class="astat"><b>${products.length}</b><span>productos</span></div>
      <div class="astat astat--sale"><b>${sales}</b><span>en oferta</span></div>
      <div class="astat astat--warn"><b>${low}</b><span>stock bajo</span></div>
      <div class="astat astat--out"><b>${out}</b><span>agotados</span></div>
      <div class="astat"><b>${noPhoto}</b><span>sin foto</span></div>`;
  }

  function productIssues(p) {
    const issues = [];
    if (p.stock <= 0) issues.push(["out", "Agotado"]);
    else if (p.stock <= 5) issues.push(["low", "Stock bajo"]);
    if (!p.imagen) issues.push(["photo", "Sin foto"]);
    if (!Number(p.precio)) issues.push(["price", "Sin precio"]);
    if (!p.activo) issues.push(["hidden", "Oculto"]);
    if (!p.caracteristicas || !p.caracteristicas.length) issues.push(["features", "Sin características"]);
    return issues;
  }

  function getFilteredProducts() {
    const q = ($("#prodSearch")?.value || "").toLowerCase().trim();
    const category = $("#categoryFilter")?.value || "all";
    const stock = $("#stockFilter")?.value || "all";
    return products.filter((p) => {
      const text = `${p.nombre} ${p.marca || ""} ${catLabel(p.categoria)}`.toLowerCase();
      const matchesQuery = !q || text.includes(q);
      const matchesCategory = category === "all" || p.categoria === category;
      const matchesStock =
        stock === "all" ||
        (stock === "low" && p.stock > 0 && p.stock <= 5) ||
        (stock === "out" && p.stock <= 0) ||
        (stock === "no-photo" && !p.imagen) ||
        (stock === "no-price" && !Number(p.precio)) ||
        (stock === "sale" && Boolean(saleInfo(p))) ||
        (stock === "hidden" && !p.activo);
      return matchesQuery && matchesCategory && matchesStock;
    });
  }

  function rowHtml(p) {
    const img = p.imagen ? `<img src="${esc(p.imagen)}" alt="" loading="lazy" />` : `<span>Silla</span>`;
    const stockCls = p.stock <= 0 ? "is-out" : p.stock <= 5 ? "is-low" : "";
    const stockTxt = p.stock <= 0 ? "Agotado" : `${p.stock} en stock`;
    const sale = saleInfo(p);
    const issues = productIssues(p).slice(0, 3).map(([kind, label]) => `<span class="issue issue--${kind}">${label}</span>`).join("");
    const offerState = sale ? `<span class="issue issue--sale">Oferta · -${sale.percent}%</span>` : "";
    const price = sale
      ? `<span class="prow__price prow__price--sale"><s>${money(sale.before)}</s><b>${money(sale.price)}</b><em>Ahorras ${money(sale.saving)}</em></span>`
      : (Number(p.precio) ? money(p.precio) : "Consultar");
    return `<div class="prow ${sale ? "prow--sale" : ""}" data-id="${p.id}">
      <div class="prow__img">${img}</div>
      <div class="prow__main">
        <strong>${esc(p.nombre)}${p.activo ? "" : ' <em class="prow__hidden">(oculto)</em>'}</strong>
        <span class="prow__meta">${catLabel(p.categoria)}${p.marca ? " · " + esc(p.marca) : ""} · ${price}</span>
        <span class="prow__issues">${offerState}${issues || '<span class="issue issue--ok">Listo para tienda</span>'}</span>
      </div>
      <span class="prow__stock ${stockCls}">${stockTxt}</span>
      <div class="prow__quick" aria-label="Edición rápida">
        <label>Precio <input type="number" min="0" step="0.01" value="${Number(p.precio || 0)}" data-quick-price /></label>
        <label>Stock <input type="number" min="0" step="1" value="${Number(p.stock || 0)}" data-quick-stock /></label>
        <button class="btn btn--ghost btn--sm" data-quick-save="${p.id}" type="button">Guardar</button>
      </div>
      <div class="prow__act">
        <button class="btn btn--ghost btn--sm" data-edit="${p.id}" type="button">Editar</button>
        <button class="icon-btn" data-del="${p.id}" title="Eliminar" type="button">Borrar</button>
      </div>
    </div>`;
  }

  function renderList() {
    const list = getFilteredProducts();
    const cont = $("#productList");
    const counter = $("#productCount");
    if (counter) counter.textContent = `${list.length} de ${products.length} productos visibles con estos filtros.`;
    if (!list.length) { cont.innerHTML = `<p class="muted empty-state">No hay productos con estos filtros.</p>`; return; }
    cont.innerHTML = list.map(rowHtml).join("");
  }

  $("#productList").addEventListener("click", async (e) => {
    const ed = e.target.closest("[data-edit]");
    if (ed) { openEditor(products.find((p) => p.id === ed.getAttribute("data-edit"))); return; }
    const quick = e.target.closest("[data-quick-save]");
    if (quick) {
      const row = quick.closest(".prow");
      const p = products.find((item) => item.id === quick.getAttribute("data-quick-save"));
      if (!p || !row) return;
      const precio = parseFloat(row.querySelector("[data-quick-price]").value) || 0;
      const stock = parseInt(row.querySelector("[data-quick-stock]").value, 10) || 0;
      const sale = saleInfo(p);
      if (sale && (precio <= 0 || precio >= sale.before)) {
        toast("Este producto está en oferta. Usa Editar para cambiar su precio sin perder la oferta.");
        return;
      }
      quick.disabled = true; quick.textContent = "Guardando";
      try {
        await DB.saveProduct({ ...p, precio, stock });
        toast("Precio y stock actualizados");
        await renderProducts();
        renderDashboard();
      } catch (err) {
        toast("No se pudo guardar");
      }
      quick.disabled = false; quick.textContent = "Guardar";
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) {
      if (!confirm("¿Eliminar este producto? No se puede deshacer.")) return;
      try { await DB.deleteProduct(del.getAttribute("data-del")); toast("Eliminado"); await renderProducts(); renderDashboard(); }
      catch (err) { toast("No se pudo eliminar"); }
    }
  });

  $("#newProductBtn").addEventListener("click", () => openEditor(null));
  ["prodSearch", "categoryFilter", "stockFilter"].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.addEventListener("input", renderList);
    if (el) el.addEventListener("change", renderList);
  });
  $("#clearProductFilters").addEventListener("click", () => {
    $("#prodSearch").value = "";
    $("#categoryFilter").value = "all";
    $("#stockFilter").value = "all";
    renderList();
  });

  /* ---------- Resumen ---------- */
  function orderIsOpen(o) {
    return !["entregado", "cancelado"].includes(o.status || "nuevo");
  }

  function renderDashboard() {
    const low = products.filter((p) => p.stock > 0 && p.stock <= 5);
    const out = products.filter((p) => p.stock <= 0);
    const noPhoto = products.filter((p) => !p.imagen);
    const noPrice = products.filter((p) => !Number(p.precio));
    const sales = products.map((p) => ({ product: p, sale: saleInfo(p) })).filter((item) => item.sale);
    const openOrders = orders.filter(orderIsOpen);
    const newOrders = orders.filter((o) => (o.status || "nuevo") === "nuevo");
    const openLeads = serviceLeads.filter(leadIsOpen);
    const todayLeads = serviceLeads.filter(isLeadToday);

    const stats = $("#dashboardStats");
    if (stats) {
      stats.innerHTML = `
        <article class="dash-card dash-card--primary"><span>Pedidos abiertos</span><b>${openOrders.length}</b><small>${newOrders.length} nuevos por contactar</small></article>
        <article class="dash-card dash-card--rose"><span>Solicitudes pendientes</span><b>${openLeads.length}</b><small>${todayLeads.length} para hoy</small></article>
        <article class="dash-card"><span>Productos activos</span><b>${products.filter((p) => p.activo).length}</b><small>${products.length} total en inventario</small></article>
        <article class="dash-card dash-card--warn"><span>Stock bajo</span><b>${low.length}</b><small>${out.length} agotados</small></article>
        <article class="dash-card dash-card--sale"><span>Ofertas activas</span><b>${sales.length}</b><small>visibles con precio y ahorro</small></article>
        <article class="dash-card dash-card--rose"><span>Revisar ficha</span><b>${noPhoto.length + noPrice.length}</b><small>${noPhoto.length} sin foto · ${noPrice.length} sin precio</small></article>`;
    }

    renderAlerts();
    renderDashboardOrders();
    renderDashboardLeads();
    renderDashboardStock([...out, ...low].slice(0, 8));
    renderDashboardOffers(sales);
    updateBadges();
  }

  function renderAlerts() {
    const alerts = [];
    products.forEach((p) => {
      productIssues(p).forEach(([kind, label]) => alerts.push({ kind, label, product: p }));
    });
    const target = $("#crmAlerts");
    if (!target) return;
    if (!alerts.length) {
      target.innerHTML = `<p class="muted empty-state">Todo se ve en orden. No hay alertas de inventario.</p>`;
      return;
    }
    target.innerHTML = alerts.slice(0, 7).map(({ kind, label, product }) => `
      <button class="crm-alert crm-alert--${kind}" type="button" data-alert-edit="${product.id}">
        <span>${label}</span>
        <strong>${esc(product.nombre)}</strong>
        <small>${catLabel(product.categoria)} · ${Number(product.precio) ? money(product.precio) : "Consultar"}</small>
      </button>`).join("");
  }

  function renderDashboardOrders() {
    const target = $("#dashboardOrders");
    if (!target) return;
    const recent = orders.slice(0, 5);
    if (!recent.length) {
      target.innerHTML = `<p class="muted empty-state">Aún no hay pedidos registrados.</p>`;
      return;
    }
    target.innerHTML = recent.map((o) => {
      const c = o.customer || {};
      return `<div class="mini-row">
        <div><strong>${esc(c.nombre || "Cliente sin nombre")}</strong><span>${statusLabel(o.status)} · ${orderDate(o.created_at)}</span></div>
        <b>${money(o.total)}</b>
      </div>`;
    }).join("");
  }

  function leadIsOpen(lead) {
    return !["ganado", "perdido", "completado", "cancelado"].includes(lead.status || "nuevo");
  }

  function isLeadToday(lead) {
    if (!lead.date) return false;
    return lead.date === localDateKey();
  }

  function hasOverdueFollowup(lead) {
    const followup = (lead.details || {}).seguimiento;
    return Boolean(followup && followup < localDateKey() && leadIsOpen(lead));
  }

  function leadDateLabel(lead) {
    if (!lead.date) return "";
    const date = new Date(`${lead.date}T12:00:00`);
    return date.toLocaleDateString("es-PA", { day: "numeric", month: "short" });
  }

  function leadTimeLabel(lead) {
    const date = leadDateLabel(lead);
    if (!date) return "";
    return lead.slot ? `${date} · ${lead.slot}` : date;
  }

  function leadAttentionBucket(lead) {
    if (!leadIsOpen(lead)) return 4;
    if (hasOverdueFollowup(lead)) return 0;
    if (lead.status === "esperando_reserva") return 1;
    if (isLeadToday(lead)) return 2;
    return 3;
  }

  function leadPriorityRank(lead) {
    return ({ urgente: 0, alta: 1, media: 2, baja: 3 })[lead.priority] ?? 2;
  }

  // La cola no depende de cómo devolvió Supabase las filas: primero se ven
  // seguimientos vencidos, reservas pendientes, citas de hoy y luego el resto.
  function sortLeadsForAttention(a, b) {
    const bucket = leadAttentionBucket(a) - leadAttentionBucket(b);
    if (bucket) return bucket;
    const priority = leadPriorityRank(a) - leadPriorityRank(b);
    if (priority) return priority;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  }

  /* Cuándo entró la solicitud, en lenguaje normal: "hace 10 min", "ayer",
     "26 jul". Antes salía "07/26/2026, 12:14:37 a. m." (formato de EE.UU.,
     con segundos), que no se lee de un vistazo. */
  function cuandoLlego(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const min = Math.round((Date.now() - d.getTime()) / 60000);
    if (min < 1) return "hace un momento";
    if (min < 60) return `hace ${min} min`;
    const hrs = Math.round(min / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const dia = new Date(d); dia.setHours(0, 0, 0, 0);
    const dias = Math.round((hoy - dia) / 86400000);
    if (dias === 1) return "ayer";
    if (dias < 7) return `hace ${dias} días`;
    return d.toLocaleDateString("es-PA", { day: "numeric", month: "short" });
  }

  function renderDashboardLeads() {
    const target = $("#dashboardLeads");
    if (!target) return;
    const list = serviceLeads.filter(leadIsOpen).sort(sortLeadsForAttention).slice(0, 6);
    if (!list.length) {
      target.innerHTML = `<p class="muted empty-state">Todo al día: no hay solicitudes pendientes.</p>`;
      return;
    }
    target.innerHTML = list.map((lead) => `
      <button class="mini-product" type="button" data-jump-tab="agenda">
        <span>${esc(leadStatusLabel(lead.status))} · ${esc(lead.priority || "media")}</span>
        <strong>${esc(lead.service || "Consulta")}</strong>
        <small>${esc([lead.name || lead.phone || "Cliente sin datos", leadTimeLabel(lead)].filter(Boolean).join(" · "))}</small>
      </button>`).join("");
  }

  function renderDashboardStock(list) {
    const target = $("#dashboardStock");
    if (!target) return;
    if (!list.length) {
      target.innerHTML = `<p class="muted empty-state">No hay productos agotados ni con stock bajo.</p>`;
      return;
    }
    target.innerHTML = list.map((p) => `
      <button class="mini-product" type="button" data-alert-edit="${p.id}">
        <span>${p.stock <= 0 ? "Agotado" : `${p.stock} unidades`}</span>
        <strong>${esc(p.nombre)}</strong>
        <small>${catLabel(p.categoria)} · ${p.marca ? esc(p.marca) : "Sin marca"}</small>
      </button>`).join("");
  }

  function renderDashboardOffers(list) {
    const target = $("#dashboardOffers");
    if (!target) return;
    if (!list.length) {
      target.innerHTML = `<p class="muted empty-state">Aún no hay ofertas activas. Abre un producto y enciende “Este producto está en oferta”.</p>`;
      return;
    }
    target.innerHTML = list.slice(0, 6).map(({ product, sale }) => `
      <button class="mini-product mini-product--sale" type="button" data-offer-edit="${product.id}">
        <span>Oferta · -${sale.percent}% · Ahorras ${money(sale.saving)}</span>
        <strong>${esc(product.nombre)}</strong>
        <small><s>${money(sale.before)}</s> · Ahora ${money(sale.price)}</small>
      </button>`).join("");
  }

  $("#crmAlerts").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-alert-edit]");
    if (!btn) return;
    openEditor(products.find((p) => p.id === btn.getAttribute("data-alert-edit")));
  });
  $("#dashboardLeads")?.addEventListener("click", () => activateTab("agenda"));
  $("#dashboardStock").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-alert-edit]");
    if (!btn) return;
    openEditor(products.find((p) => p.id === btn.getAttribute("data-alert-edit")));
  });
  $("#dashboardOffers")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-offer-edit]");
    if (!btn) return;
    openEditor(products.find((p) => p.id === btn.getAttribute("data-offer-edit")));
  });

  /* ---------- Ventana de edición ---------- */
  /* ---------- Agenda IA / leads ---------- */
  function getFilteredLeads() {
    const q = ($("#leadSearch")?.value || "").toLowerCase().trim();
    const type = $("#leadTypeFilter")?.value || "all";
    const status = $("#leadStatusFilter")?.value || "all";
    return serviceLeads.filter((lead) => {
      const details = lead.details || {};
      const haystack = [
        lead.name, lead.phone, lead.service, lead.message, lead.source,
        details.modelo_silla, details.modelo_auto, details.zona,
        details.rental_equipment, details.delivery_location, details.pickup_location, details.rental_child,
        JSON.stringify(details),
      ].filter(Boolean).join(" ").toLowerCase();
      return (type === "all" || lead.type === type)
        && (status === "all" || (lead.status || "nuevo") === status)
        && (!q || haystack.includes(q));
    }).sort(sortLeadsForAttention);
  }

  function isRentalLead(lead) {
    const details = lead.details || {};
    return lead.type === "alquiler" || /alquiler|renta/i.test(lead.service || "") || !!details.rental_equipment;
  }

  function rentalSummary(lead) {
    if (!isRentalLead(lead)) return "";
    const details = lead.details || {};
    return [
      details.rental_equipment ? `Equipo: ${details.rental_equipment}` : "",
      details.rental_end_date ? `Devolucion: ${details.rental_end_date}` : "",
      details.rental_days ? `Dias: ${details.rental_days}` : "",
      details.delivery_location ? `Entrega: ${details.delivery_location}` : "",
      details.pickup_location ? `Recogida: ${details.pickup_location}` : "",
      details.pickup_time ? `Hora recogida: ${details.pickup_time}` : "",
      details.rental_child ? `Edad/peso: ${details.rental_child}` : "",
      details.rental_installation ? `Instalacion: ${details.rental_installation}` : "",
    ].filter(Boolean).join("\n");
  }

  /* De dónde vino la solicitud, en palabras normales. En la base se guardan
     claves técnicas ("carrito-web", "asistente-web") que no dicen nada. */
  const ORIGENES = {
    "carrito-web": "Desde el carrito",
    "calendario-web": "Desde el calendario",
    "asistente-web": "Desde el asistente",
    "web": "Desde la web",
  };
  const origenLabel = (o) => ORIGENES[o] || o || "Desde la web";

  /* Los datos sueltos de la tarjeta: solo se pintan los que tienen valor.
     Antes salían siempre y una tarjeta podía tener 6 líneas de
     "No indicada / Sin notas / No registrado". */
  function metaHtml(filas) {
    const items = filas.filter(([, v]) => v).map(([et, v]) =>
      `<span><i>${esc(et)}</i> ${esc(v)}</span>`).join("");
    return items ? `<div class="lead-meta">${items}</div>` : "";
  }

  /* Recuadro de detalle de una solicitud. Lo usan por igual el alquiler y los
     pedidos del carrito, con sus propias clases (antes el de pedidos reusaba
     las del alquiler y, al no llevar esa clase la tarjeta, salía todo pegado).

     kpis  = [[valor, etiqueta], ...]  → los 3 datos grandes de arriba
     filas = [[etiqueta, valor], ...]  → el detalle; las vacías no se pintan  */
  function leadBoxHtml(kpis, filas, extra = "") {
    const cajas = kpis.filter(([v]) => v).map(([v, et]) =>
      `<span class="lead-box__kpi"><b>${esc(v)}</b>${esc(et)}</span>`).join("");
    const detalle = filas.filter(([, v]) => v).map(([et, v]) =>
      `<span><i>${esc(et)}</i> ${esc(v)}</span>`).join("");
    if (!cajas && !detalle && !extra) return "";
    return `<div class="lead-box">
      ${cajas ? `<div class="lead-box__kpis">${cajas}</div>` : ""}
      ${extra}
      ${detalle ? `<div class="lead-box__grid">${detalle}</div>` : ""}
    </div>`;
  }

  function rentalCardHtml(lead) {
    if (!isRentalLead(lead)) return "";
    const d = lead.details || {};
    return leadBoxHtml(
      [
        [d.rental_days ? `${d.rental_days} días` : "", "de alquiler"],
        [d.rental_equipment, "equipo"],
        [d.rental_installation === "Si" || d.rental_installation === "Sí" ? "Sí" : "", "necesita instalación"],
      ],
      [
        ["Entrega en", d.delivery_location || d.zona],
        ["Devolución", d.rental_end_date],
        ["Recogida en", d.pickup_location],
        ["Hora de recogida", d.pickup_time],
        ["Edad y peso", d.rental_child],
      ]
    );
  }

  // ¿Es un pedido o cotización que vino del carrito de la tienda?
  function isCartLead(lead) {
    return lead.type === "pedido" || lead.type === "cotizacion" || !!(lead.details || {}).productos;
  }

  // Muestra el carrito (productos, total y entrega) dentro de la tarjeta.
  function cartCardHtml(lead) {
    if (!isCartLead(lead)) return "";
    const d = lead.details || {};
    const productos = Array.isArray(d.productos) ? d.productos : [];
    if (!productos.length) return "";
    const filas = productos.map((p) =>
      `<li><b>${esc(p.cantidad)}x</b> ${esc(p.nombre)}<span>${p.precio ? `${CONFIG.moneda}${esc(p.precio)}` : "por cotizar"}</span></li>`).join("");
    return leadBoxHtml(
      [
        [`${productos.length}`, productos.length === 1 ? "producto" : "productos"],
        [d.total, "total"],
        [d.instalacion === "Sí" ? "Sí" : "", "quiere instalación"],
      ],
      [
        ["Entrega", d.entrega],
        ["Dirección", d.direccion],
        ["Correo", d.email],
        ["Notas", d.notas],
      ],
      `<ul class="lead-box__items">${filas}</ul>`
    );
  }

  function cartSummary(lead) {
    if (!isCartLead(lead)) return "";
    const d = lead.details || {};
    const productos = Array.isArray(d.productos) ? d.productos : [];
    if (!productos.length) return "";
    return [
      "Pedido:",
      ...productos.map((p) => `- ${p.cantidad}x ${p.nombre}`),
      d.total ? `Total: ${d.total}` : "",
      d.entrega ? `Entrega: ${d.entrega}` : "",
      d.direccion ? `Direccion: ${d.direccion}` : "",
    ].filter(Boolean).join("\n");
  }

  function leadSummary(lead) {
    const details = lead.details || {};
    return [
      "Hola, te escribimos de Car Seat Clinic Center.",
      `Servicio: ${lead.service || "Consulta"}`,
      lead.date ? `Fecha: ${lead.date}` : "",
      lead.slot ? `Hora: ${lead.slot}` : "",
      details.modelo_silla ? `Silla: ${details.modelo_silla}` : "",
      details.modelo_auto ? `Auto: ${details.modelo_auto}` : "",
      details.zona ? `Zona: ${details.zona}` : "",
      rentalSummary(lead),
      cartSummary(lead),
      lead.message ? `Consulta: ${lead.message}` : "",
    ].filter(Boolean).join("\n");
  }

  function leadWhatsappUrl(lead) {
    const phone = normalizePhone(lead.phone);
    if (!phone) return "";
    return `https://wa.me/${phone}?text=${encodeURIComponent(leadSummary(lead))}`;
  }

  async function renderServiceLeads() {
    try { serviceLeads = await DB.getServiceLeads(); }
    catch (e) { serviceLeads = []; }
    renderPipeline();
    renderLeadStats();
    renderScheduleBoard();
    renderLeadList();
    renderDashboard();
  }

  /* ---------- Embudo de ventas (pipeline) ---------- */
  function renderPipeline() {
    const target = $("#leadPipeline");
    if (!target) return;
    const counts = {};
    PIPELINE.forEach((s) => { counts[s] = 0; });
    serviceLeads.forEach((l) => { const s = l.status || "nuevo"; if (counts[s] !== undefined) counts[s]++; });
    const activeFilter = $("#leadStatusFilter")?.value || "all";
    target.innerHTML = PIPELINE.map((s, i) => `
      <button class="pipe pipe--${s} ${activeFilter === s ? "is-active" : ""}" type="button" data-pipe="${s}">
        <b>${counts[s]}</b><span>${leadStatusLabel(s)}</span>
      </button>${i < PIPELINE.length - 1 ? '<span class="pipe-arrow">›</span>' : ""}`).join("");
  }

  /* ---------- Estadísticas de consultas ---------- */
  function renderLeadStats() {
    const target = $("#leadStats");
    if (!target) return;
    const now = new Date();
    const todayIso = localDateKey(now);
    const weekAgo = new Date(now.getTime() - 6 * 86400000);
    const total = serviceLeads.length;
    const hoy = serviceLeads.filter((l) => localDateKey(l.created_at) === todayIso).length;
    const semana = serviceLeads.filter((l) => new Date(l.created_at) >= weekAgo).length;
    const citas = serviceLeads.filter((l) => l.date).length;
    const ganados = serviceLeads.filter((l) => l.status === "ganado").length;
    const temas = {};
    serviceLeads.forEach((l) => { const t = l.service || "Consulta"; temas[t] = (temas[t] || 0) + 1; });
    const topTemas = Object.entries(temas).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const iso = localDateKey(d);
      const n = serviceLeads.filter((l) => localDateKey(l.created_at) === iso).length;
      days.push({ label: d.toLocaleDateString("es-PA", { weekday: "short" }), n });
    }
    const maxN = Math.max(1, ...days.map((d) => d.n));
    target.innerHTML = `
      <div class="lstat-cards">
        <div class="lstat"><b>${total}</b><span>consultas en total</span></div>
        <div class="lstat"><b>${hoy}</b><span>hoy</span></div>
        <div class="lstat"><b>${semana}</b><span>últimos 7 días</span></div>
        <div class="lstat"><b>${citas}</b><span>con cita/fecha</span></div>
        <div class="lstat lstat--win"><b>${ganados}</b><span>ganados</span></div>
      </div>
      <div class="lstat-cols">
        <div class="lstat-block">
          <strong>Consultas por día</strong>
          <div class="lstat-bars" aria-label="Consultas por día">
            ${days.map((d) => `<div class="lbar"><b>${d.n}</b><span class="lbar__fill" style="height:${Math.round(d.n / maxN * 100)}%"></span><small>${d.label}</small></div>`).join("")}
          </div>
        </div>
        <div class="lstat-block">
          <strong>Temas más preguntados</strong>
          ${topTemas.length ? topTemas.map(([t, n]) => `<div class="ltop"><span>${esc(t)}</span><b>${n}</b></div>`).join("") : '<p class="muted">Sin datos aún.</p>'}
        </div>
      </div>`;
  }

  /* ---------- Avisos (badges) en pestañas ---------- */
  function setBadge(id, n) {
    const el = $("#" + id);
    if (!el) return;
    if (n > 0) { el.textContent = n; el.hidden = false; } else { el.hidden = true; }
  }
  function updateBadges() {
    setBadge("badge-agenda", serviceLeads.filter((l) => ["nuevo", "esperando_reserva"].includes(l.status || "nuevo")).length);
    setBadge("badge-pedidos", orders.filter((o) => (o.status || "nuevo") === "nuevo").length);
  }

  /* ---------- Exportar a CSV/Excel ---------- */
  function downloadCSV(filename, rows) {
    const csv = rows.map((r) => r.map((c) => `"${String(c == null ? "" : c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }
  function exportLeadsCSV() {
    if (!serviceLeads.length) { toast("No hay consultas para exportar"); return; }
    const header = ["Creado", "Estado", "Prioridad", "Tipo", "Servicio", "Nombre", "Telefono", "Fecha", "Hora", "Mensaje", "Nota del cliente", "Nota interna", "Seguimiento"];
    const rows = getFilteredLeads().map((l) => {
      const d = l.details || {};
      return [
        new Date(l.created_at).toLocaleString("es-PA"),
        leadStatusLabel(l.status), l.priority || "", l.type || "", l.service || "",
        l.name || "", l.phone || "", l.date || "", l.slot || "",
        (l.message || "").replace(/\s+/g, " "), d.notas || "", d.nota_interna || "", d.seguimiento || "",
      ];
    });
    downloadCSV("consultas-crm.csv", [header, ...rows]);
    toast("Archivo descargado");
  }

  // El calendario muestra reservas reales, no pedidos ni cotizaciones que
  // llegaron hoy. Así no se confunde una venta con una cita por atender.
  function isScheduledLead(lead) {
    return Boolean(lead.date) && !isCartLead(lead) && ["cita", "alquiler", "cita-sugerida"].includes(lead.type);
  }

  function renderScheduleBoard() {
    const target = $("#scheduleBoard");
    if (!target) return;
    const days = Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const iso = localDateKey(date);
      const leads = serviceLeads
        .filter((lead) => lead.date === iso && leadIsOpen(lead) && isScheduledLead(lead))
        .sort((a, b) => String(a.slot || "").localeCompare(String(b.slot || "")));
      return { date, iso, leads };
    });
    target.innerHTML = days.map(({ date, leads }) => `
      <article class="schedule-day">
        <strong>${date.toLocaleDateString("es-PA", { weekday: "short", day: "numeric" })}</strong>
        <span>${date.toLocaleDateString("es-PA", { month: "long" })}</span>
        ${leads.length ? leads.map((lead) => {
          const rental = isRentalLead(lead);
          const details = lead.details || {};
          const label = rental ? `Alquiler ${details.rental_equipment || ""}` : (lead.service || "Consulta");
          const cls = rental ? " schedule-pill--rental" : "";
          return `<b class="schedule-pill schedule-pill--${esc(lead.priority || "media")}${cls}">${esc(lead.slot || "Sin hora")} - ${esc(label)}</b>`;
        }).join("") : '<em class="muted">Sin reservas</em>'}
      </article>`).join("");
  }

  function renderLeadList() {
    const list = getFilteredLeads();
    const count = $("#leadsCount");
    if (count) count.textContent = `${list.length} de ${serviceLeads.length} solicitudes visibles con estos filtros.`;
    const target = $("#leadList");
    if (!target) return;
    if (!list.length) {
      target.innerHTML = `<p class="muted empty-state">No hay solicitudes con estos filtros.</p>`;
      return;
    }
    let openedFirstOpenLead = false;
    target.innerHTML = list.map((lead) => {
      const details = lead.details || {};
      const rental = isRentalLead(lead);
      const wa = leadWhatsappUrl(lead);
      const currentStatus = lead.status || "nuevo";
      const opts = LEAD_ESTADOS.map(([value, label]) => `<option value="${value}" ${currentStatus === value ? "selected" : ""}>${label}</option>`).join("");
      const notas = esc(details.nota_interna || "");
      const seg = esc(details.seguimiento || "");
      const overdue = hasOverdueFollowup(lead);
      const idx = PIPELINE.indexOf(currentStatus);
      const next = idx >= 0 && idx < PIPELINE.length - 1 ? PIPELINE[idx + 1] : null;
      /* Cada solicitud va plegada: se ve el encabezado (quién, qué, cuándo y
         en qué estado) y el detalle se abre al tocarla. Antes todas estaban
         abiertas y con 5 solicitudes la página ya medía casi 4.000px, así que
         encontrar una era imposible. Solo abrimos la primera pendiente y las
         que ya tienen seguimiento vencido. */
      const abrir = overdue || (leadIsOpen(lead) && !openedFirstOpenLead);
      if (leadIsOpen(lead) && !openedFirstOpenLead) openedFirstOpenLead = true;
      return `<details class="lead-card ${rental ? "lead-rental" : ""} ${overdue ? "is-overdue" : ""}" data-lead="${esc(lead.id)}" ${abrir ? "open" : ""}>
        <summary class="lead-card__top">
          <div>
            <span class="lead-priority lead-priority--${esc(lead.priority || "media")}">${esc(lead.priority || "media")}</span>
            <span class="lead-status lead-status--${esc(currentStatus)}">${esc(leadStatusLabel(currentStatus))}</span>
            ${rental ? '<span class="lead-rental__badge">Alquiler</span>' : ""}
            ${overdue ? '<span class="lead-overdue">Seguimiento vencido</span>' : ""}
            <strong>${esc(lead.name || lead.phone || "Cliente pendiente")}</strong>
            <small>${esc([lead.service || "Consulta", leadTimeLabel(lead)].filter(Boolean).join(" · "))}</small>
          </div>
          <small>${esc([origenLabel(lead.source), cuandoLlego(lead.created_at)].filter(Boolean).join(" · "))}</small>
        </summary>
        <div class="lead-card__body">
          ${metaHtml([
            ["Teléfono", lead.phone],
            ["Silla", details.modelo_silla],
            ["Auto", details.modelo_auto],
            ["Zona", details.zona],
          ])}
          ${rentalCardHtml(lead)}
          ${cartCardHtml(lead)}
          ${lead.message ? `<p class="lead-message">${esc(lead.message)}</p>` : ""}
          <div class="lead-followup">
            <label>Nota interna <input type="text" data-lead-note value="${notas}" placeholder="Ej: le interesa la Joie 360, recontactar" /></label>
            <label>Seguir el <input type="date" data-lead-followup value="${seg}" /></label>
            <button class="btn btn--ghost btn--sm" type="button" data-save-note="${esc(lead.id)}">Guardar nota</button>
          </div>
          <div class="admin__card-actions">
            <label class="inline">Estado <select data-lead-status>${opts}</select></label>
            ${next ? `<button class="btn btn--primary btn--sm" type="button" data-advance="${esc(lead.id)}">Avanzar a ${leadStatusLabel(next)} →</button>` : ""}
            ${wa ? `<a class="btn btn--whatsapp btn--sm lead-whatsapp" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
            <button class="btn btn--ghost btn--sm" type="button" data-copy-lead="${esc(lead.id)}">Copiar resumen</button>
          </div>
        </div>
      </details>`;
    }).join("");
  }

  function leadSaveToast(result, successMessage) {
    if (result?.savedToServer) { toast(successMessage); return; }
    if (result?.savedLocally) {
      toast("Guardado solo en este navegador. Revisa la conexión del CRM.");
      return;
    }
    toast("No se pudo guardar el cambio. Inténtalo de nuevo.");
  }

  $("#leadList")?.addEventListener("change", async (e) => {
    if (!e.target.matches("[data-lead-status]")) return;
    const card = e.target.closest("[data-lead]");
    const lead = serviceLeads.find((item) => item.id === card.dataset.lead);
    if (!lead) return;
    const previous = lead.status;
    lead.status = e.target.value;
    try {
      const result = await DB.updateLead(lead.id, { status: lead.status }, lead);
      renderPipeline(); renderLeadStats(); renderLeadList(); renderScheduleBoard(); renderDashboard();
      leadSaveToast(result, "Solicitud actualizada");
    } catch (err) {
      lead.status = previous;
      renderLeadList();
      toast("No se pudo actualizar la solicitud.");
    }
  });

  $("#leadList")?.addEventListener("click", async (e) => {
    const copy = e.target.closest("[data-copy-lead]");
    if (copy) {
      const lead = serviceLeads.find((item) => item.id === copy.getAttribute("data-copy-lead"));
      if (!lead || !navigator.clipboard) { toast("No se pudo copiar"); return; }
      try { await navigator.clipboard.writeText(leadSummary(lead)); toast("Resumen copiado"); }
      catch (err) { toast("No se pudo copiar"); }
      return;
    }
    // Guardar nota + fecha de seguimiento
    const save = e.target.closest("[data-save-note]");
    if (save) {
      const card = save.closest("[data-lead]");
      const lead = serviceLeads.find((item) => item.id === save.getAttribute("data-save-note"));
      if (!lead || !card) return;
      const details = { ...(lead.details || {}) };
      // Las instrucciones del cliente se guardan en details.notas. La nota del
      // equipo interno va aparte para que una nunca borre a la otra.
      details.nota_interna = card.querySelector("[data-lead-note]").value.trim();
      details.seguimiento = card.querySelector("[data-lead-followup]").value || "";
      lead.details = details;
      save.disabled = true; save.textContent = "Guardando…";
      try {
        const result = await DB.updateLead(lead.id, { details }, lead);
        renderLeadList(); renderDashboard();
        leadSaveToast(result, "Nota guardada");
      } catch (err) {
        toast("No se pudo guardar la nota.");
      } finally {
        save.disabled = false; save.textContent = "Guardar nota";
      }
      return;
    }
    // Avanzar de etapa en el embudo
    const adv = e.target.closest("[data-advance]");
    if (adv) {
      const lead = serviceLeads.find((item) => item.id === adv.getAttribute("data-advance"));
      if (!lead) return;
      const idx = PIPELINE.indexOf(lead.status || "nuevo");
      const next = idx >= 0 && idx < PIPELINE.length - 1 ? PIPELINE[idx + 1] : null;
      if (!next) return;
      const previous = lead.status;
      lead.status = next;
      try {
        const result = await DB.updateLead(lead.id, { status: next }, lead);
        renderPipeline(); renderLeadStats(); renderLeadList(); renderScheduleBoard(); renderDashboard();
        leadSaveToast(result, "Movido a " + leadStatusLabel(next));
      } catch (err) {
        lead.status = previous;
        renderLeadList();
        toast("No se pudo mover la solicitud.");
      }
    }
  });

  // Embudo: clic en una etapa filtra por ese estado
  $("#leadPipeline")?.addEventListener("click", (e) => {
    const pipe = e.target.closest("[data-pipe]");
    if (!pipe) return;
    const stage = pipe.getAttribute("data-pipe");
    const filter = $("#leadStatusFilter");
    if (filter) { filter.value = filter.value === stage ? "all" : stage; }
    renderPipeline();
    renderLeadList();
  });

  $("#exportLeads")?.addEventListener("click", exportLeadsCSV);

  ["leadSearch", "leadTypeFilter", "leadStatusFilter"].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.addEventListener("input", () => { renderLeadList(); renderPipeline(); });
    if (el) el.addEventListener("change", () => { renderLeadList(); renderPipeline(); });
  });
  $("#clearLeadFilters")?.addEventListener("click", () => {
    $("#leadSearch").value = "";
    $("#leadTypeFilter").value = "all";
    $("#leadStatusFilter").value = "all";
    renderPipeline();
    renderLeadList();
  });

  function openEditor(p) {
    editingId = p ? p.id : null;
    editorImages = p && Array.isArray(p.imagenes) ? p.imagenes.slice() : [];
    editorFeatures = p && Array.isArray(p.caracteristicas) ? p.caracteristicas.slice() : [];
    $("#editTitle").textContent = p ? "Editar producto" : "Nuevo producto";
    $("#f-categoria").innerHTML = CATS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    const set = (id, v) => { $(id).value = v; };
    set("#f-nombre", p ? p.nombre : "");
    $("#f-categoria").value = p ? p.categoria : "recien-nacidos";
    set("#f-marca", p ? p.marca : "");
    set("#f-recomendado", p ? p.recomendado : "");
    set("#f-precio", p ? p.precio : 0);
    set("#f-antes", p && p.antes ? p.antes : "");
    set("#f-stock", p ? p.stock : 0);
    set("#f-badge", p && !(saleInfo(p) && String(p.badge || "").trim().toLowerCase() === "oferta") ? p.badge : "");
    set("#f-sort", p && p.sort ? p.sort : 0);
    $("#f-activo").checked = p ? p.activo !== false : true;
    $("#f-oferta").checked = Boolean(saleInfo(p));
    set("#f-descripcion", p ? p.descripcion : "");
    $("#imgStatus").textContent = "";
    renderImgList(); renderFeatList(); updateOfferEditor();
    $("#editModal").classList.add("is-open");
  }
  function closeEditor() { $("#editModal").classList.remove("is-open"); }

  function updateOfferEditor() {
    const enabled = $("#f-oferta").checked;
    const fields = $("#offerFields");
    const preview = $("#offerPreview");
    fields.hidden = !enabled;
    $("#f-precio-label").textContent = enabled ? "Precio de oferta ($)" : "Precio de venta ($)";
    if (!enabled) {
      preview.textContent = "";
      return;
    }
    const sale = saleInfo({ precio: $("#f-precio").value, antes: $("#f-antes").value });
    if (!sale) {
      preview.innerHTML = `<strong>Completa los dos precios</strong><span>El precio normal debe ser mayor que el precio de oferta.</span>`;
      return;
    }
    preview.innerHTML = `<strong>Ahora ${money(sale.price)}</strong><span>Antes ${money(sale.before)} · Ahorras ${money(sale.saving)} (${sale.percent}%)</span>`;
  }

  ["f-oferta", "f-precio", "f-antes"].forEach((id) => {
    const field = $(`#${id}`);
    if (!field) return;
    field.addEventListener(id === "f-oferta" ? "change" : "input", updateOfferEditor);
  });

  function renderImgList() {
    const c = $("#imgList");
    if (!editorImages.length) { c.innerHTML = `<p class="muted" style="margin:0">Aún no hay fotos.</p>`; return; }
    c.innerHTML = editorImages.map((u, i) => `
      <div class="img-chip">
        <img src="${esc(u)}" alt="" />
        <button data-imgrm="${i}" title="Quitar">✕</button>
        ${i === 0 ? '<span class="img-chip__main">Principal</span>' : `<button class="img-chip__set" data-imgmain="${i}">Hacer principal</button>`}
      </div>`).join("");
  }
  function renderFeatList() {
    const c = $("#featList");
    c.innerHTML = editorFeatures.map((f, i) => `<li>${esc(f)}<button data-featrm="${i}" title="Quitar">✕</button></li>`).join("")
      || `<li class="muted" style="list-style:none">Aún no hay características.</li>`;
  }

  // Imágenes: subir archivos
  $("#imgFile").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const status = $("#imgStatus");
    for (let i = 0; i < files.length; i++) {
      status.textContent = `Subiendo ${i + 1} de ${files.length}…`;
      try { const url = await DB.uploadImage(files[i]); editorImages.push(url); renderImgList(); }
      catch (err) { status.textContent = "Error al subir (¿corriste la migración 3?). Puedes pegar un enlace."; e.target.value = ""; return; }
    }
    status.textContent = "Fotos subidas"; e.target.value = "";
  });
  // Imágenes: por enlace
  $("#imgUrlAdd").addEventListener("click", () => {
    const inp = $("#imgUrl"); const u = inp.value.trim();
    if (!u) return; editorImages.push(u); inp.value = ""; renderImgList();
  });
  // Imágenes: quitar / hacer principal
  $("#imgList").addEventListener("click", (e) => {
    const rm = e.target.closest("[data-imgrm]");
    if (rm) { editorImages.splice(+rm.getAttribute("data-imgrm"), 1); renderImgList(); return; }
    const mk = e.target.closest("[data-imgmain]");
    if (mk) { const i = +mk.getAttribute("data-imgmain"); const [u] = editorImages.splice(i, 1); editorImages.unshift(u); renderImgList(); }
  });

  // Características
  function addFeat() {
    const inp = $("#featInput"); const v = inp.value.trim();
    if (!v) return; editorFeatures.push(v); inp.value = ""; renderFeatList(); inp.focus();
  }
  $("#featAdd").addEventListener("click", addFeat);
  $("#featInput").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addFeat(); } });
  $("#featList").addEventListener("click", (e) => {
    const rm = e.target.closest("[data-featrm]");
    if (rm) { editorFeatures.splice(+rm.getAttribute("data-featrm"), 1); renderFeatList(); }
  });

  $("#editClose").addEventListener("click", closeEditor);
  $("#editCancel").addEventListener("click", closeEditor);
  $("#editModal").addEventListener("click", (e) => { if (e.target.id === "editModal") closeEditor(); });

  $("#editSave").addEventListener("click", async () => {
    const v = (id) => $(id).value;
    const ofertaActiva = $("#f-oferta").checked;
    const precio = parseFloat(v("#f-precio")) || 0;
    const antes = ofertaActiva ? (parseFloat(v("#f-antes")) || 0) : 0;
    const oferta = saleInfo({ precio, antes });
    if (ofertaActiva && !oferta) {
      toast("Para activar la oferta, el precio normal debe ser mayor que el precio de oferta.");
      return;
    }
    const badge = v("#f-badge").trim();
    const p = {
      id: editingId || "p_" + Date.now(),
      nombre: v("#f-nombre").trim(),
      categoria: v("#f-categoria"),
      marca: v("#f-marca").trim(),
      recomendado: v("#f-recomendado").trim(),
      precio,
      antes,
      stock: parseInt(v("#f-stock")) || 0,
      // La palabra "Oferta" ya la pone la tienda automáticamente. Se reserva
      // esta etiqueta para mensajes distintos como "Nuevo" o "Más vendido".
      badge: oferta && badge.toLowerCase() === "oferta" ? "" : badge,
      sort: parseInt(v("#f-sort")) || 0,
      activo: $("#f-activo").checked,
      descripcion: v("#f-descripcion").trim(),
      imagenes: editorImages.slice(),
      caracteristicas: editorFeatures.slice(),
    };
    if (!p.nombre) { toast("Ponle un nombre al producto"); return; }
    const btn = $("#editSave"); btn.disabled = true; btn.textContent = "Guardando…";
    try { await DB.saveProduct(p); toast("Producto guardado"); closeEditor(); await renderProducts(); renderDashboard(); }
    catch (err) { toast("Error: " + (err.message || "no se pudo guardar")); }
    btn.disabled = false; btn.textContent = "Guardar producto";
  });

  /* ---------- Pedidos ---------- */
  const ESTADOS = [
    ["nuevo", "Nuevo"],
    ["contactado", "Contactado"],
    ["pendiente_pago", "Pendiente de pago"],
    ["pagado", "Pagado"],
    ["listo_instalar", "Listo para instalar"],
    ["enviado", "Enviado"],
    ["entregado", "Entregado"],
    ["cancelado", "Cancelado"],
  ];
  const statusLabel = (status) => (ESTADOS.find(([value]) => value === status) || ESTADOS[0])[1];
  const orderDate = (date) => date ? new Date(date).toLocaleDateString("es-PA", { day: "numeric", month: "short" }) : "Sin fecha";

  function productName(id) {
    const product = products.find((p) => p.id === id);
    return product ? product.nombre : id;
  }

  function normalizePhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.length === 8 ? `507${digits}` : digits;
  }

  function orderSummary(o) {
    const c = o.customer || {};
    const items = (o.items || []).map((i) => `${i.qty || 1} x ${productName(i.id)}`).join(", ");
    return [
      "Hola, te escribimos de Car Seat Clinic Center.",
      `Pedido: ${items || "sin productos detallados"}`,
      `Total: ${money(o.total)}`,
      `Estado actual: ${statusLabel(o.status || "nuevo")}`,
      c.instalacion ? "Incluye solicitud de instalación." : "",
    ].filter(Boolean).join("\n");
  }

  function getFilteredOrders() {
    const status = $("#orderStatusFilter")?.value || "all";
    const q = ($("#orderSearch")?.value || "").toLowerCase().trim();
    return orders.filter((o) => {
      const c = o.customer || {};
      const haystack = `${c.nombre || ""} ${c.telefono || ""} ${c.direccion || ""} ${o.id || ""}`.toLowerCase();
      return (status === "all" || (o.status || "nuevo") === status) && (!q || haystack.includes(q));
    });
  }

  async function renderOrders() {
    try { orders = await DB.getMyOrders(); }
    catch (e) {
      orders = [];
      ordersCount = 0;
      const count = $("#ordersCount");
      const list = $("#ordersList");
      if (count) count.textContent = "No se pudieron cargar los pedidos.";
      if (list) list.innerHTML = `<p class="muted empty-state">No pudimos cargar los pedidos. Revisa tu conexión e inténtalo de nuevo.</p>`;
      toast("No se pudieron cargar los pedidos");
      return;
    }
    ordersCount = orders.length;
    if ($("#adminStats")) renderStats();
    renderOrderList();
  }

  function renderOrderList() {
    const list = getFilteredOrders();
    const count = $("#ordersCount");
    if (count) count.textContent = `${list.length} de ${orders.length} pedidos visibles con estos filtros.`;
    if (!list.length) { $("#ordersList").innerHTML = `<p class="muted empty-state">No hay pedidos con estos filtros.</p>`; return; }
    $("#ordersList").innerHTML = list.map((o) => {
      const items = (o.items || []).map((i) => `<li><span>${i.qty || 1} x</span> ${esc(productName(i.id))}</li>`).join("");
      const c = o.customer || {};
      const fecha = new Date(o.created_at).toLocaleString("es-PA");
      const opts = ESTADOS.map(([value, label]) => `<option value="${value}" ${o.status === value ? "selected" : ""}>${label}</option>`).join("");
      const phone = normalizePhone(c.telefono);
      const wa = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(orderSummary(o))}` : "";
      return `<div class="order-card" data-order="${o.id}">
        <div class="order-card__top">
          <div>
            <span class="order-status order-status--${esc(o.status || "nuevo")}">${statusLabel(o.status || "nuevo")}</span>
            <strong>${esc(c.nombre || "Cliente sin nombre")}</strong>
            <small>${fecha}</small>
          </div>
          <b>${money(o.total)}</b>
        </div>
        <ul class="order-items">${items || "<li>Sin productos detallados</li>"}</ul>
        <div class="order-customer">
          <span>Teléfono: ${esc(c.telefono || "No registrado")}</span>
          <span>Dirección: ${esc(c.direccion || "No registrada")}</span>
          ${c.instalacion ? "<span>Solicita instalación</span>" : ""}
          ${c.notas ? `<span>Notas: ${esc(c.notas)}</span>` : ""}
        </div>
        <div class="admin__card-actions">
          <label class="inline">Estado <select data-status>${opts}</select></label>
          ${wa ? `<a class="btn btn--whatsapp btn--sm order-whatsapp" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
          <button class="btn btn--ghost btn--sm" type="button" data-copy-order="${o.id}">Copiar resumen</button>
        </div>
      </div>`;
    }).join("");
  }

  $("#ordersList").addEventListener("change", async (e) => {
    if (!e.target.matches("[data-status]")) return;
    const card = e.target.closest("[data-order]");
    try {
      await DB.updateOrderStatus(card.dataset.order, e.target.value);
      const order = orders.find((o) => o.id === card.dataset.order);
      if (order) order.status = e.target.value;
      renderOrderList();
      renderDashboard();
      toast("Estado actualizado");
    }
    catch (err) { toast("No se pudo actualizar"); }
  });

  $("#ordersList").addEventListener("click", async (e) => {
    const copy = e.target.closest("[data-copy-order]");
    if (!copy) return;
    const order = orders.find((o) => o.id === copy.getAttribute("data-copy-order"));
    if (!order || !navigator.clipboard) { toast("No se pudo copiar"); return; }
    try { await navigator.clipboard.writeText(orderSummary(order)); toast("Resumen copiado"); }
    catch (err) { toast("No se pudo copiar"); }
  });

  ["orderSearch", "orderStatusFilter"].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.addEventListener("input", renderOrderList);
    if (el) el.addEventListener("change", renderOrderList);
  });
})();
