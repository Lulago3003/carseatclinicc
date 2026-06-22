/* =====================================================================
   Car Seat Clinic Center — Panel de administración (CRM)
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const money = (n) => CONFIG.moneda + Number(n).toLocaleString("en-US");
  const esc = (s) => String(s ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;");

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
  async function boot() { DB.onAuthChange(gate); await gate(); }

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
    await renderProducts();
    await renderOrders();
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
    try {
      let res = await DB.signIn(ac.email, ac.password);
      if (res.error) {
        await DB.signUp(ac.email, ac.password, { full_name: "Administrador" });
        res = await DB.signIn(ac.email, ac.password);
      }
      if (res.error) err.textContent = "No se pudo entrar: " + res.error.message;
      else ok = true;
    } catch (ex) {
      err.textContent = "Error de conexión: " + (ex && ex.message ? ex.message : ex);
    }
    btn.disabled = false; btn.textContent = "Entrar con código";
    if (ok) await gate();
  });

  /* ---------- Pestañas ---------- */
  $$(".tab").forEach((t) => t.addEventListener("click", () => {
    $$(".tab").forEach((x) => x.classList.remove("is-active"));
    t.classList.add("is-active");
    $("#tab-productos").hidden = t.dataset.tab !== "productos";
    $("#tab-pedidos").hidden = t.dataset.tab !== "pedidos";
  }));

  /* ---------- Lista de productos ---------- */
  async function renderProducts() {
    try { products = await DB.getProductsAdmin(); } catch (e) { toast("Error al cargar productos"); return; }
    renderStats();
    renderList($("#prodSearch") ? $("#prodSearch").value : "");
  }

  function renderStats() {
    const out = products.filter((p) => p.stock <= 0).length;
    const low = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    $("#adminStats").innerHTML = `
      <div class="astat"><b>${products.length}</b><span>productos</span></div>
      <div class="astat astat--warn"><b>${low}</b><span>stock bajo</span></div>
      <div class="astat astat--out"><b>${out}</b><span>agotados</span></div>
      <div class="astat"><b>${ordersCount}</b><span>pedidos</span></div>`;
  }

  function rowHtml(p) {
    const img = p.imagen ? `<img src="${esc(p.imagen)}" alt="" loading="lazy" />` : `<span>🪑</span>`;
    const stockCls = p.stock <= 0 ? "is-out" : p.stock <= 5 ? "is-low" : "";
    const stockTxt = p.stock <= 0 ? "Agotado" : `${p.stock} en stock`;
    return `<div class="prow" data-id="${p.id}">
      <div class="prow__img">${img}</div>
      <div class="prow__main">
        <strong>${esc(p.nombre)}${p.activo ? "" : ' <em class="prow__hidden">(oculto)</em>'}</strong>
        <span class="prow__meta">${catLabel(p.categoria)}${p.marca ? " · " + esc(p.marca) : ""} · ${money(p.precio)}</span>
      </div>
      <span class="prow__stock ${stockCls}">${stockTxt}</span>
      <div class="prow__act">
        <button class="btn btn--ghost btn--sm" data-edit="${p.id}">Editar</button>
        <button class="icon-btn" data-del="${p.id}" title="Eliminar">🗑</button>
      </div>
    </div>`;
  }

  function renderList(query) {
    const q = (query || "").toLowerCase().trim();
    const list = q ? products.filter((p) => p.nombre.toLowerCase().includes(q)) : products;
    const cont = $("#productList");
    if (!list.length) { cont.innerHTML = `<p class="muted">${q ? 'Sin resultados para "' + esc(q) + '".' : 'No hay productos. Crea uno con "Nuevo producto".'}</p>`; return; }
    cont.innerHTML = list.map(rowHtml).join("");
  }

  $("#productList").addEventListener("click", async (e) => {
    const ed = e.target.closest("[data-edit]");
    if (ed) { openEditor(products.find((p) => p.id === ed.getAttribute("data-edit"))); return; }
    const del = e.target.closest("[data-del]");
    if (del) {
      if (!confirm("¿Eliminar este producto? No se puede deshacer.")) return;
      try { await DB.deleteProduct(del.getAttribute("data-del")); toast("Eliminado"); await renderProducts(); }
      catch (err) { toast("No se pudo eliminar"); }
    }
  });

  $("#newProductBtn").addEventListener("click", () => openEditor(null));
  $("#prodSearch").addEventListener("input", (e) => renderList(e.target.value));

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
    status.textContent = "Fotos subidas ✓"; e.target.value = "";
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
    try { await DB.saveProduct(p); toast("Guardado ✓"); closeEditor(); await renderProducts(); }
    catch (err) { toast("Error: " + (err.message || "no se pudo guardar")); }
    btn.disabled = false; btn.textContent = "💾 Guardar producto";
  });

  /* ---------- Pedidos ---------- */
  const ESTADOS = ["nuevo", "pagado", "enviado", "entregado"];
  async function renderOrders() {
    let orders = [];
    try { orders = await DB.getMyOrders(); } catch (e) { return; }
    ordersCount = orders.length;
    if ($("#adminStats")) renderStats();
    if (!orders.length) { $("#ordersList").innerHTML = `<p class="muted">Aún no hay pedidos.</p>`; return; }
    $("#ordersList").innerHTML = orders.map((o) => {
      const items = (o.items || []).map((i) => `${i.qty}x ${i.id}`).join(", ");
      const c = o.customer || {};
      const fecha = new Date(o.created_at).toLocaleString("es-PA");
      const opts = ESTADOS.map((s) => `<option ${o.status === s ? "selected" : ""}>${s}</option>`).join("");
      return `<div class="admin__card" data-order="${o.id}">
        <div class="order-head"><strong>${fecha}</strong> <b>${money(o.total)}</b></div>
        <p class="muted" style="margin:6px 0">${items}</p>
        <p style="font-size:.88rem">👤 ${esc(c.nombre || "—")} · 📞 ${esc(c.telefono || "—")}<br>📍 ${esc(c.direccion || "—")}${c.instalacion ? "<br>🔧 Quiere instalación" : ""}${c.notas ? "<br>📝 " + esc(c.notas) : ""}</p>
        <div class="admin__card-actions"><label class="inline">Estado <select data-status>${opts}</select></label></div>
      </div>`;
    }).join("");
  }
  $("#ordersList").addEventListener("change", async (e) => {
    if (!e.target.matches("[data-status]")) return;
    const card = e.target.closest("[data-order]");
    try { await DB.updateOrderStatus(card.dataset.order, e.target.value); toast("Estado actualizado ✓"); }
    catch (err) { toast("No se pudo actualizar"); }
  });
})();
