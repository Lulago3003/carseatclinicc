/* =====================================================================
   Car Seat Clinic — Panel de administración
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const money = (n) => CONFIG.moneda + Number(n).toLocaleString("en-US");

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-open");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("is-open"), 2400);
  }

  const CATS = [["sillas", "Silla de carro"], ["bases", "Base"], ["accesorios", "Accesorio"]];

  /* ---------- Arranque ---------- */
  DB.init();
  if (!DB.ready) {
    $("#gateTitle").textContent = "Falta conectar la base de datos";
    $("#gateMsg").innerHTML = "Aún no has configurado Supabase. Sigue la guía del <strong>README</strong> (poner <code>supabaseUrl</code> y <code>supabaseAnonKey</code> en <code>js/data.js</code>).";
    $("#gateLogin").style.display = "none";
  } else {
    boot();
  }

  async function boot() {
    DB.onAuthChange(gate);
    await gate();
  }

  // Decide si mostrar login o el panel según la sesión y si es admin
  async function gate() {
    const user = await DB.getUser();
    if (!user) { showGate("login"); return; }
    const profile = await DB.getProfile();
    if (!profile || !profile.is_admin) {
      showGate("noadmin", user.email);
      return;
    }
    showPanel();
  }

  function showGate(mode, email) {
    $("#gate").hidden = false; $("#panel").hidden = true; $("#logoutBtn").style.display = "none";
    if (mode === "noadmin") {
      $("#gateTitle").textContent = "Tu cuenta no es administradora";
      $("#gateMsg").innerHTML = `Estás como <strong>${email}</strong>, pero no tienes permisos de admin.<br>Para activarte, ejecuta en Supabase (SQL):<br><code>update profiles set is_admin = true where email = '${email}';</code>`;
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
  $("#logoutBtn").addEventListener("click", async () => { await DB.signOut(); await gate(); });

  /* ---------- Pestañas ---------- */
  $$(".tab").forEach((t) => t.addEventListener("click", () => {
    $$(".tab").forEach((x) => x.classList.remove("is-active"));
    t.classList.add("is-active");
    $("#tab-productos").hidden = t.dataset.tab !== "productos";
    $("#tab-pedidos").hidden = t.dataset.tab !== "pedidos";
  }));

  /* ---------- Editor de productos ---------- */
  function blankProduct() {
    return { id: "p_" + Date.now(), nombre: "", categoria: "sillas", precio: 0, antes: 0, badge: "", imagen: "", descripcion: "", stock: 0, activo: true, sort: 0, _new: true };
  }

  function productForm(p) {
    const opts = CATS.map(([v, l]) => `<option value="${v}" ${p.categoria === v ? "selected" : ""}>${l}</option>`).join("");
    return `<div class="admin__card" data-id="${p.id}">
      <div class="admin__card-grid">
        <label class="col-2">Nombre <input data-f="nombre" value="${esc(p.nombre)}" placeholder="Ej. Silla convertible 360°" /></label>
        <label>Categoría <select data-f="categoria">${opts}</select></label>
        <label>Precio ($) <input data-f="precio" type="number" min="0" step="0.01" value="${p.precio}" /></label>
        <label>Precio antes ($) <input data-f="antes" type="number" min="0" step="0.01" value="${p.antes || ""}" placeholder="Opcional" /></label>
        <label>Stock <input data-f="stock" type="number" min="0" step="1" value="${p.stock}" /></label>
        <label>Etiqueta <input data-f="badge" value="${esc(p.badge)}" placeholder="Más vendido / Oferta" /></label>
        <label>Orden <input data-f="sort" type="number" step="1" value="${p.sort || 0}" /></label>
        <label class="col-2">Imagen (URL o assets/foto.jpg) <input data-f="imagen" value="${esc(p.imagen)}" placeholder="Opcional" /></label>
        <label class="col-3">Descripción <textarea data-f="descripcion" rows="2" placeholder="Texto del producto">${esc(p.descripcion)}</textarea></label>
        <label class="check"><input data-f="activo" type="checkbox" ${p.activo ? "checked" : ""} /> Visible en la tienda</label>
      </div>
      <div class="admin__card-actions">
        <button class="btn btn--primary" data-save>💾 Guardar</button>
        <button class="btn btn--ghost" data-del>🗑️ Eliminar</button>
      </div>
    </div>`;
  }

  function esc(s) { return String(s ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

  async function renderProducts() {
    let list = [];
    try { list = await DB.getProductsAdmin(); } catch (e) { toast("Error al cargar productos"); return; }
    $("#productEditor").innerHTML = list.map(productForm).join("") || `<p class="muted">No hay productos. Crea uno con "Nuevo producto".</p>`;
  }

  function readCard(card) {
    const get = (f) => { const el = card.querySelector(`[data-f="${f}"]`); return el.type === "checkbox" ? el.checked : el.value; };
    return {
      id: card.dataset.id,
      nombre: get("nombre").trim(), categoria: get("categoria"),
      precio: parseFloat(get("precio")) || 0, antes: parseFloat(get("antes")) || 0,
      stock: parseInt(get("stock")) || 0, badge: get("badge").trim(),
      imagen: get("imagen").trim(), descripcion: get("descripcion").trim(),
      sort: parseInt(get("sort")) || 0, activo: get("activo"),
    };
  }

  $("#newProductBtn").addEventListener("click", () => {
    const wrap = document.createElement("div");
    wrap.innerHTML = productForm(blankProduct());
    $("#productEditor").prepend(wrap.firstElementChild);
    window.scrollTo({ top: 180, behavior: "smooth" });
  });

  $("#productEditor").addEventListener("click", async (e) => {
    const card = e.target.closest(".admin__card"); if (!card) return;
    if (e.target.closest("[data-save]")) {
      const p = readCard(card);
      if (!p.nombre) { toast("Ponle un nombre al producto"); return; }
      try { await DB.saveProduct(p); toast("Guardado ✓"); await renderProducts(); }
      catch (err) { toast("Error: " + (err.message || "no se pudo guardar")); }
    }
    if (e.target.closest("[data-del]")) {
      if (!confirm("¿Eliminar este producto? No se puede deshacer.")) return;
      try { await DB.deleteProduct(card.dataset.id); toast("Eliminado"); card.remove(); }
      catch (err) { toast("Error al eliminar"); }
    }
  });

  /* ---------- Pedidos ---------- */
  const ESTADOS = ["nuevo", "pagado", "enviado", "entregado"];
  async function renderOrders() {
    let orders = [];
    try { orders = await DB.getMyOrders(); } catch (e) { return; }
    if (!orders.length) { $("#ordersList").innerHTML = `<p class="muted">Aún no hay pedidos.</p>`; return; }
    $("#ordersList").innerHTML = orders.map((o) => {
      const items = (o.items || []).map((i) => `${i.qty}x ${i.id}`).join(", ");
      const c = o.customer || {};
      const fecha = new Date(o.created_at).toLocaleString("es-PA");
      const opts = ESTADOS.map((s) => `<option ${o.status === s ? "selected" : ""}>${s}</option>`).join("");
      return `<div class="admin__card" data-order="${o.id}">
        <div class="order-head"><strong>${fecha}</strong> <b>${money(o.total)}</b></div>
        <p class="muted" style="margin:6px 0">${items}</p>
        <p style="font-size:.88rem">👤 ${esc(c.nombre || "—")} · 📞 ${esc(c.telefono || "—")}<br>📍 ${esc(c.direccion || "—")}${c.notas ? "<br>📝 " + esc(c.notas) : ""}</p>
        <div class="admin__card-actions">
          <label class="inline">Estado <select data-status>${opts}</select></label>
        </div>
      </div>`;
    }).join("");
  }
  // Actualizar el estado del pedido (permitido por la política RLS de admin)
  $("#ordersList").addEventListener("change", async (e) => {
    if (!e.target.matches("[data-status]")) return;
    const card = e.target.closest("[data-order]");
    try { await DB.updateOrderStatus(card.dataset.order, e.target.value); toast("Estado actualizado ✓"); }
    catch (err) { toast("No se pudo actualizar el estado"); }
  });

})();
