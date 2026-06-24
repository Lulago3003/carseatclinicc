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

  const LOCAL_KEY = "csc_local_admin";
  let localAdmin = sessionStorage.getItem(LOCAL_KEY) === "1";

  let products = [];          // cache para el panel
  let orders = [];
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
  // Inicia sesión en la cuenta admin (la crea sola la primera vez)
  async function adminSignIn() {
    const ac = CONFIG.adminCode || {};
    let res = await DB.signIn(ac.email, ac.password);
    if (res.error) { await DB.signUp(ac.email, ac.password, { full_name: "Administrador" }); res = await DB.signIn(ac.email, ac.password); }
    if (res.error) throw new Error(res.error.message || "No se pudo entrar");
  }

  async function boot() {
    DB.onAuthChange(gate);
    // Atajo: si vino desde "Ingresar" con admin/admin, entra automáticamente
    try {
      if (sessionStorage.getItem("csc_admin_go") === "1") { sessionStorage.removeItem("csc_admin_go"); await adminSignIn(); }
    } catch (e) {}
    await gate();
  }

  async function gate() {
    if (localAdmin) { showPanel(); return; }
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
    renderDashboard();
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
    localAdmin = false; sessionStorage.removeItem(LOCAL_KEY);
    await DB.signOut(); await gate();
  });

  $("#codeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#codeError"); err.textContent = "";
    const btn = e.target.querySelector("button");
    const d = Object.fromEntries(new FormData(e.target).entries());
    const ac = CONFIG.adminCode || {};
    if ((d.usuario || "").trim() !== ac.usuario || (d.clave || "") !== ac.clave) {
      err.textContent = "Usuario o clave incorrectos."; return;
    }
    if (!DB.ready) { localAdmin = true; sessionStorage.setItem(LOCAL_KEY, "1"); gate(); return; }
    btn.disabled = true; btn.textContent = "Entrando…";
    let ok = false;
    try { await adminSignIn(); ok = true; }
    catch (ex) { err.textContent = "No se pudo entrar: " + (ex && ex.message ? ex.message : ex); }
    btn.disabled = false; btn.textContent = "Entrar con código";
    if (ok) await gate();
  });

  /* ---------- Pestañas ---------- */
  function activateTab(name) {
    $$(".tab").forEach((x) => x.classList.toggle("is-active", x.dataset.tab === name));
    ["dashboard", "productos", "pedidos"].forEach((tab) => {
      const panel = $(`#tab-${tab}`);
      if (panel) panel.hidden = tab !== name;
    });
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
    $("#adminStats").innerHTML = `
      <div class="astat"><b>${products.length}</b><span>productos</span></div>
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
        (stock === "hidden" && !p.activo);
      return matchesQuery && matchesCategory && matchesStock;
    });
  }

  function rowHtml(p) {
    const img = p.imagen ? `<img src="${esc(p.imagen)}" alt="" loading="lazy" />` : `<span>Silla</span>`;
    const stockCls = p.stock <= 0 ? "is-out" : p.stock <= 5 ? "is-low" : "";
    const stockTxt = p.stock <= 0 ? "Agotado" : `${p.stock} en stock`;
    const issues = productIssues(p).slice(0, 3).map(([kind, label]) => `<span class="issue issue--${kind}">${label}</span>`).join("");
    return `<div class="prow" data-id="${p.id}">
      <div class="prow__img">${img}</div>
      <div class="prow__main">
        <strong>${esc(p.nombre)}${p.activo ? "" : ' <em class="prow__hidden">(oculto)</em>'}</strong>
        <span class="prow__meta">${catLabel(p.categoria)}${p.marca ? " · " + esc(p.marca) : ""} · ${Number(p.precio) ? money(p.precio) : "Consultar"}</span>
        <span class="prow__issues">${issues || '<span class="issue issue--ok">Listo para tienda</span>'}</span>
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
    const openOrders = orders.filter(orderIsOpen);
    const newOrders = orders.filter((o) => (o.status || "nuevo") === "nuevo");

    const stats = $("#dashboardStats");
    if (stats) {
      stats.innerHTML = `
        <article class="dash-card dash-card--primary"><span>Pedidos abiertos</span><b>${openOrders.length}</b><small>${newOrders.length} nuevos por contactar</small></article>
        <article class="dash-card"><span>Productos activos</span><b>${products.filter((p) => p.activo).length}</b><small>${products.length} total en inventario</small></article>
        <article class="dash-card dash-card--warn"><span>Stock bajo</span><b>${low.length}</b><small>${out.length} agotados</small></article>
        <article class="dash-card dash-card--rose"><span>Revisar ficha</span><b>${noPhoto.length + noPrice.length}</b><small>${noPhoto.length} sin foto · ${noPrice.length} sin precio</small></article>`;
    }

    renderAlerts();
    renderDashboardOrders();
    renderDashboardStock([...out, ...low].slice(0, 8));
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

  $("#crmAlerts").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-alert-edit]");
    if (!btn) return;
    openEditor(products.find((p) => p.id === btn.getAttribute("data-alert-edit")));
  });
  $("#dashboardStock").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-alert-edit]");
    if (!btn) return;
    openEditor(products.find((p) => p.id === btn.getAttribute("data-alert-edit")));
  });

  /* ---------- Ventana de edición ---------- */
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
    set("#f-badge", p ? p.badge : "");
    set("#f-sort", p && p.sort ? p.sort : 0);
    $("#f-activo").checked = p ? p.activo !== false : true;
    set("#f-descripcion", p ? p.descripcion : "");
    $("#imgStatus").textContent = "";
    renderImgList(); renderFeatList();
    $("#editModal").classList.add("is-open");
  }
  function closeEditor() { $("#editModal").classList.remove("is-open"); }

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
    const p = {
      id: editingId || "p_" + Date.now(),
      nombre: v("#f-nombre").trim(),
      categoria: v("#f-categoria"),
      marca: v("#f-marca").trim(),
      recomendado: v("#f-recomendado").trim(),
      precio: parseFloat(v("#f-precio")) || 0,
      antes: parseFloat(v("#f-antes")) || 0,
      stock: parseInt(v("#f-stock")) || 0,
      badge: v("#f-badge").trim(),
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
    try { orders = await DB.getMyOrders(); } catch (e) { return; }
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
