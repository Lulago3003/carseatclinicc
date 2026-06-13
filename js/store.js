/* =====================================================================
   Car Seat Clinic Panamá — Lógica de la tienda
   (No necesitas editar este archivo.)
   ===================================================================== */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const money = (n) => CONFIG.moneda + Number(n).toLocaleString("en-US");

  const CAT_LABEL = { sillas: "Silla de carro", bases: "Base", accesorios: "Accesorio" };
  const CAT_ICON = { sillas: "🪑", bases: "🔩", accesorios: "🧸" };
  const CAT_BG = {
    sillas: "linear-gradient(135deg,#e4f5f4,#c7ebe9)",
    bases: "linear-gradient(135deg,#fdeee6,#ffe0cf)",
    accesorios: "linear-gradient(135deg,#eef3ff,#dde8ff)",
  };

  /* ---------- Estado ---------- */
  let products = [];
  let cart = load();
  let currentUser = null;
  let currentProfile = null;
  let authMode = "login"; // "login" | "register"
  let pendingCheckout = false;

  const productById = (id) => products.find((p) => p.id === id);

  function media(p, big) {
    if (p.imagen && p.imagen.trim() !== "") {
      return `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" />`;
    }
    const size = big ? "font-size:30px" : "font-size:64px";
    return `<div style="width:100%;height:100%;display:grid;place-items:center;background:${CAT_BG[p.categoria] || CAT_BG.accesorios};${size}">${CAT_ICON[p.categoria] || "📦"}</div>`;
  }

  /* ---------- Carrito (estado + persistencia) ---------- */
  const STORE_KEY = "csc_cart";
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); }

  function add(id) {
    const p = productById(id);
    if (!p) return;
    const current = cart[id] || 0;
    if (current + 1 > p.stock) { toast("No hay más stock disponible"); return; }
    cart[id] = current + 1;
    save(); renderCart(); openCart();
    toast("Agregado al carrito ✓");
  }
  function setQty(id, qty) {
    const p = productById(id);
    if (p && qty > p.stock) { toast(`Solo quedan ${p.stock}`); qty = p.stock; }
    if (qty <= 0) delete cart[id]; else cart[id] = qty;
    save(); renderCart();
  }
  function itemsCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
  function total() {
    return Object.entries(cart).reduce((s, [id, q]) => {
      const p = productById(id); return p ? s + p.precio * q : s;
    }, 0);
  }
  function cartList() {
    return Object.entries(cart).map(([id, qty]) => ({ id, qty, p: productById(id) })).filter((i) => i.p);
  }

  /* ---------- Render: productos ---------- */
  function renderProducts(cat = "todos") {
    const grid = $("#productGrid");
    const list = cat === "todos" ? products : products.filter((p) => p.categoria === cat);
    if (!list.length) { grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No hay productos en esta categoría.</p>`; return; }
    grid.innerHTML = list.map((p) => {
      const agotado = p.stock <= 0;
      let stockTag = "";
      if (agotado) stockTag = `<span class="card__stock card__stock--out">Agotado</span>`;
      else if (p.stock <= 5) stockTag = `<span class="card__stock card__stock--low">¡Solo quedan ${p.stock}!</span>`;
      return `<article class="card ${agotado ? "card--out" : ""}">
        <div class="card__media">
          ${media(p)}
          ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
        </div>
        <div class="card__body">
          <span class="card__cat">${CAT_LABEL[p.categoria] || ""}</span>
          <h3 class="card__title">${p.nombre}</h3>
          <p class="card__desc">${p.descripcion}</p>
          ${stockTag}
          <div class="card__foot">
            <div class="card__price">
              ${p.antes ? `<s>${money(p.antes)}</s>` : ""}
              <b>${money(p.precio)}</b>
            </div>
            <button class="card__add" data-add="${p.id}" ${agotado ? "disabled" : ""} aria-label="Agregar ${p.nombre}">${agotado ? "✕" : "+"}</button>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  function renderServices() {
    $("#serviceGrid").innerHTML = SERVICIOS.map((s) => {
      const precio = s.precio === 0
        ? `<div class="service__price free">Sin costo</div>`
        : `<div class="service__price">${s.desde ? "Desde " : ""}${money(s.precio)}</div>`;
      return `<div class="service"><div class="service__icon">${s.icono}</div>
        <h3>${s.nombre}</h3><p>${s.descripcion}</p>${precio}</div>`;
    }).join("");
  }

  /* ---------- Render: carrito ---------- */
  function renderCart() {
    const count = itemsCount();
    $("#cartCount").textContent = count;
    $("#cartCount").style.display = count ? "grid" : "none";
    $("#cart").classList.toggle("is-empty", count === 0);
    $("#cartItems").innerHTML = cartList().map(({ id, qty, p }) => `
      <div class="cart-item">
        <div class="cart-item__media">${media(p, true)}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${p.nombre}</div>
          <div class="cart-item__price">${money(p.precio * qty)}</div>
          <div class="cart-item__qty">
            <button data-dec="${id}" aria-label="Quitar uno">−</button>
            <span>${qty}</span>
            <button data-inc="${id}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-rm="${id}">Eliminar</button>
      </div>`).join("");
    $("#cartTotal").textContent = money(total());
  }

  function openCart() { $("#cart").classList.add("is-open"); $("#overlay").classList.add("is-open"); }
  function closeCart() { $("#cart").classList.remove("is-open"); $("#overlay").classList.remove("is-open"); }

  /* ---------- Checkout ---------- */
  function goCheckout() {
    if (itemsCount() === 0) { toast("Tu carrito está vacío"); return; }
    // En modo real, hay que iniciar sesión para comprar
    if (DB.ready && !currentUser) {
      pendingCheckout = true;
      closeCart();
      openAuth("login", "Inicia sesión para finalizar tu compra 🛒");
      return;
    }
    openCheckout();
  }
  function openCheckout() {
    $("#ckCount").textContent = itemsCount();
    $("#ckTotal").textContent = money(total());
    $("#checkoutModal").classList.add("is-open");
    setupPayPal();
  }
  function closeCheckout() { $("#checkoutModal").classList.remove("is-open"); }

  function buildOrderText(form) {
    const lineas = cartList().map(({ qty, p }) => `• ${qty}x ${p.nombre} — ${money(p.precio * qty)}`);
    let msg = `*Nuevo pedido — Car Seat Clinic*%0A%0A${lineas.join("%0A")}%0A%0A*Total: ${money(total())}*`;
    const d = Object.fromEntries(new FormData(form).entries());
    msg += `%0A%0A*Datos del cliente:*%0A`;
    if (d.nombre) msg += `Nombre: ${d.nombre}%0A`;
    if (d.telefono) msg += `Teléfono: ${d.telefono}%0A`;
    if (d.email) msg += `Correo: ${d.email}%0A`;
    if (d.direccion) msg += `Dirección: ${d.direccion}%0A`;
    if (d.notas) msg += `Notas: ${d.notas}`;
    return msg;
  }
  function customerData(form) {
    const d = Object.fromEntries(new FormData(form).entries());
    return { nombre: d.nombre, telefono: d.telefono, email: d.email, direccion: d.direccion, notas: d.notas };
  }

  // Registra el pedido en la base de datos (descuenta stock). Devuelve true si ok.
  async function registerOrder(form) {
    if (!DB.ready) return true; // modo demo: no hay base de datos
    try {
      await DB.placeOrder(cartList().map(({ id, qty }) => ({ id, qty })), customerData(form));
      return true;
    } catch (err) {
      toast(err.message || "No se pudo registrar el pedido");
      await loadProducts();
      return false;
    }
  }

  async function sendWhatsAppOrder() {
    const form = $("#checkoutForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const text = buildOrderText(form);
    const ok = await registerOrder(form);
    if (!ok) return;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${text}`, "_blank");
    clearCartAfterOrder();
    toast("¡Pedido enviado! Te escribimos por WhatsApp 💬");
  }

  function clearCartAfterOrder() {
    cart = {}; save(); renderCart(); closeCheckout(); closeCart();
    loadProducts();
  }

  /* ---------- PayPal ---------- */
  let paypalLoaded = false;
  function setupPayPal() {
    const note = $("#payNote");
    if (!CONFIG.paypalClientId) {
      note.textContent = "Pago con tarjeta disponible al configurar PayPal. Por ahora confirma por WhatsApp.";
      return;
    }
    note.textContent = "Pago seguro con PayPal (acepta tarjetas).";
    if (paypalLoaded) { renderPayPalButtons(); return; }
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CONFIG.paypalClientId)}&currency=${CONFIG.codigoMoneda}`;
    s.onload = () => { paypalLoaded = true; renderPayPalButtons(); };
    s.onerror = () => { note.textContent = "No se pudo cargar PayPal. Usa WhatsApp para confirmar."; };
    document.head.appendChild(s);
  }
  function renderPayPalButtons() {
    const c = $("#paypal-container"); c.innerHTML = "";
    if (!window.paypal) return;
    window.paypal.Buttons({
      style: { shape: "pill", color: "gold", layout: "vertical", label: "pay" },
      createOrder: (d, a) => a.order.create({ purchase_units: [{ amount: { value: String(total()), currency_code: CONFIG.codigoMoneda } }] }),
      onApprove: async (d, a) => {
        await a.order.capture();
        const form = $("#checkoutForm");
        await registerOrder(form);
        clearCartAfterOrder();
        toast("¡Pago recibido! Gracias por tu compra 🎉");
      },
    }).render("#paypal-container");
  }

  /* ---------- Autenticación (UI) ---------- */
  function openAuth(mode, subMsg) {
    setAuthMode(mode || "login");
    if (subMsg) $("#authSub").textContent = subMsg;
    $("#authError").textContent = "";
    $("#authDemoNote").style.display = DB.ready ? "none" : "block";
    $("#authModal").classList.add("is-open");
    $("#accountMenu").hidden = true;
  }
  function closeAuth() { $("#authModal").classList.remove("is-open"); }
  function setAuthMode(mode) {
    authMode = mode;
    const isReg = mode === "register";
    $("#authTitle").textContent = isReg ? "Crear cuenta" : "Iniciar sesión";
    $("#authSubmit").textContent = isReg ? "Registrarme" : "Ingresar";
    $("#nameField").style.display = isReg ? "block" : "none";
    $("#authSwitchText").textContent = isReg ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
    $("#authSwitch").textContent = isReg ? "Inicia sesión" : "Regístrate";
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    const err = $("#authError"); err.textContent = "";
    if (!DB.ready) { err.textContent = "Modo demo: conecta la base de datos para usar el login (ver guía)."; return; }
    const d = Object.fromEntries(new FormData(e.target).entries());
    try {
      if (authMode === "register") {
        const { error } = await DB.signUp(d.email, d.password, d.nombre);
        if (error) throw error;
        toast("¡Cuenta creada! Revisa tu correo si pide confirmación.");
      } else {
        const { error } = await DB.signIn(d.email, d.password);
        if (error) throw error;
      }
      closeAuth();
      await refreshAuthUI();
      if (pendingCheckout) { pendingCheckout = false; openCheckout(); }
    } catch (e2) {
      err.textContent = traducirError(e2.message);
    }
  }
  function traducirError(m) {
    if (!m) return "Ocurrió un error. Intenta de nuevo.";
    if (/Invalid login/i.test(m)) return "Correo o contraseña incorrectos.";
    if (/already registered/i.test(m)) return "Ese correo ya tiene cuenta. Inicia sesión.";
    if (/Password should/i.test(m)) return "La contraseña debe tener al menos 6 caracteres.";
    return m;
  }

  async function googleLogin() {
    if (!DB.ready) { toast("Disponible al conectar la base de datos (ver guía)"); return; }
    try { await DB.signInGoogle(); } catch (e) { toast("No se pudo abrir Google"); }
  }

  function isAdminUser(user, profile) {
    if (profile && profile.is_admin) return true;
    const emails = (CONFIG.adminEmails || []).map((e) => e.toLowerCase());
    return user && emails.includes((user.email || "").toLowerCase());
  }

  async function refreshAuthUI() {
    currentUser = await DB.getUser();
    currentProfile = currentUser ? await DB.getProfile() : null;
    const label = $("#accountLabel");
    if (currentUser) {
      const name = (currentProfile && currentProfile.full_name) || currentUser.email.split("@")[0];
      label.textContent = name.length > 12 ? name.slice(0, 11) + "…" : name;
      $("#accountMenuName").textContent = currentUser.email;
      const admin = isAdminUser(currentUser, currentProfile);
      $("#adminLink").style.display = admin ? "inline-block" : "none";
      $("#accountAdmin").style.display = admin ? "block" : "none";
    } else {
      label.textContent = "Ingresar";
      $("#adminLink").style.display = "none";
    }
  }

  async function showMyOrders() {
    $("#accountMenu").hidden = true;
    if (!DB.ready) { toast("Disponible al conectar la base de datos"); return; }
    let orders = [];
    try { orders = await DB.getMyOrders(); } catch { toast("No se pudieron cargar tus pedidos"); return; }
    const body = orders.length
      ? orders.map((o) => {
          const items = (o.items || []).map((i) => `${i.qty}x ${(productById(i.id) || {}).nombre || i.id}`).join(", ");
          const fecha = new Date(o.created_at).toLocaleDateString("es-PA");
          return `<div class="order-row"><div><strong>${fecha}</strong> · <span class="order-status">${o.status}</span><br><small>${items}</small></div><b>${money(o.total)}</b></div>`;
        }).join("")
      : `<p style="color:var(--muted);text-align:center;padding:20px">Aún no tienes pedidos.</p>`;
    showInfoModal("Mis pedidos", body);
  }

  function showInfoModal(title, html) {
    let m = $("#infoModal");
    if (!m) {
      m = document.createElement("div");
      m.id = "infoModal"; m.className = "modal";
      m.innerHTML = `<div class="modal__box modal__box--sm"><button class="icon-btn modal__close" id="closeInfo">✕</button><h3 id="infoTitle"></h3><div id="infoBody"></div></div>`;
      document.body.appendChild(m);
      m.addEventListener("click", (e) => { if (e.target === m || e.target.id === "closeInfo") m.classList.remove("is-open"); });
    }
    $("#infoTitle").textContent = title;
    $("#infoBody").innerHTML = html;
    m.classList.add("is-open");
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-open");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("is-open"), 2400);
  }

  /* ---------- Contacto ---------- */
  function fillContact() {
    $("#cInfoUbicacion").textContent = CONFIG.ubicacion;
    $("#cInfoHorario").textContent = CONFIG.horario;
    const mail = $("#cInfoEmail"); mail.textContent = CONFIG.email; mail.href = "mailto:" + CONFIG.email;
    $("#cInfoInsta").href = CONFIG.instagram;
    $("#cWhatsBtn").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Car Seat Clinic, tengo una consulta 👶")}`;
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Cargar productos ---------- */
  async function loadProducts() {
    products = await DB.getProducts();
    const active = $("#filters .chip.is-active");
    renderProducts(active ? active.dataset.cat : "todos");
    renderCart();
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
    const a = t.closest("[data-add]"); if (a && !a.disabled) { add(a.getAttribute("data-add")); return; }
    const inc = t.closest("[data-inc]"); if (inc) { const id = inc.getAttribute("data-inc"); setQty(id, (cart[id] || 0) + 1); return; }
    const dec = t.closest("[data-dec]"); if (dec) { const id = dec.getAttribute("data-dec"); setQty(id, (cart[id] || 0) - 1); return; }
    const rm = t.closest("[data-rm]"); if (rm) { setQty(rm.getAttribute("data-rm"), 0); return; }
    // cerrar menú de cuenta al hacer clic fuera
    if (!t.closest("#accountMenu") && !t.closest("#accountBtn")) $("#accountMenu").hidden = true;
  });

  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (!chip) return;
    $$("#filters .chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderProducts(chip.dataset.cat);
  });

  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  $("#cartEmptyShop").addEventListener("click", closeCart);
  $("#goCheckout").addEventListener("click", goCheckout);
  $("#closeCheckout").addEventListener("click", closeCheckout);
  $("#payWhatsapp").addEventListener("click", sendWhatsAppOrder);
  $("#checkoutModal").addEventListener("click", (e) => { if (e.target.id === "checkoutModal") closeCheckout(); });

  // Auth
  $("#accountBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentUser) $("#accountMenu").hidden = !$("#accountMenu").hidden;
    else openAuth("login");
  });
  $("#closeAuth").addEventListener("click", closeAuth);
  $("#authModal").addEventListener("click", (e) => { if (e.target.id === "authModal") closeAuth(); });
  $("#authForm").addEventListener("submit", handleAuthSubmit);
  $("#authSwitch").addEventListener("click", (e) => { e.preventDefault(); setAuthMode(authMode === "login" ? "register" : "login"); $("#authError").textContent = ""; });
  $("#googleBtn").addEventListener("click", googleLogin);
  $("#logoutBtn").addEventListener("click", async (e) => { e.preventDefault(); await DB.signOut(); currentUser = null; currentProfile = null; await refreshAuthUI(); $("#accountMenu").hidden = true; toast("Sesión cerrada"); });
  $("#myOrdersBtn").addEventListener("click", (e) => { e.preventDefault(); showMyOrders(); });

  // Menú móvil
  $("#navToggle").addEventListener("click", () => $("#nav").classList.toggle("is-open"));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("is-open")));

  // Formulario de contacto → WhatsApp
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=Hola Car Seat Clinic 👋%0A%0ANombre: ${d.nombre}%0AMensaje: ${d.mensaje}`, "_blank");
  });

  /* ---------- Inicio ---------- */
  document.title = `${CONFIG.nombre} ${CONFIG.eslogan} — Sillas de carro y seguridad infantil`;
  DB.init();
  renderServices();
  fillContact();
  loadProducts();
  if (DB.ready) {
    refreshAuthUI();
    DB.onAuthChange(async () => { await refreshAuthUI(); });
  } else {
    // modo demo: mostrar aviso en el botón de cuenta
    $("#accountLabel").textContent = "Ingresar";
  }
})();
