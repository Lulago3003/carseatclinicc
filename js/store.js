/* =====================================================================
   Car Seat Clinic Panamá — Lógica de la tienda
   (No necesitas editar este archivo.)
   ===================================================================== */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const money = (n) => CONFIG.moneda + Number(n).toLocaleString("en-US");

  const CAT_LABEL = {
    "recien-nacidos": "Recién nacidos", "convertibles": "Convertible", "giro-360": "Silla 360°",
    "combinadas": "Combinada", "booster": "Booster", "accesorios": "Accesorio",
    "limpieza": "Limpieza", "gift-cards": "Gift Card",
    // compatibilidad con datos antiguos
    "sillas": "Silla de carro", "bases": "Base",
  };
  const SEAT_CATS = ["recien-nacidos", "convertibles", "giro-360", "combinadas", "booster", "sillas"];

  function bgFor(cat) {
    if (SEAT_CATS.includes(cat)) return "linear-gradient(135deg,#e7ede7,#d6e0d6)";
    if (cat === "gift-cards") return "linear-gradient(135deg,#f4eaea,#ecd9d9)";
    if (cat === "limpieza") return "linear-gradient(135deg,#eef2ee,#dfe8e0)";
    return "linear-gradient(135deg,#f5f1eb,#ece3d5)"; // accesorios / bases
  }

  // Ilustraciones de respaldo en los colores de la marca.
  const SVG_SEAT = `<svg viewBox="0 0 100 100" width="60%" height="60%" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 50 Q50 13 75 50" stroke="#232e26" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M18 50 Q20 87 50 87 Q80 87 82 50 Q78 43 70 47 Q66 58 50 58 Q34 58 30 47 Q22 43 18 50 Z" fill="#2f3e34"/>
      <path d="M31 51 Q34 77 50 77 Q66 77 69 51 Q60 61 50 61 Q40 61 31 51 Z" fill="#f5f1eb"/>
      <path d="M50 61 L43 77" stroke="#a9706f" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M50 61 L57 77" stroke="#a9706f" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="50" cy="61" r="3.6" fill="#a9706f"/></svg>`;
  const SVG_STAR = `<svg viewBox="0 0 100 100" width="56%" height="56%" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 22 L58 44 L80 50 L58 56 L50 78 L42 56 L20 50 L42 44 Z" fill="#2f3e34"/>
      <path d="M75 24 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" fill="#d8a7a7"/></svg>`;
  const SVG_GIFT = `<svg viewBox="0 0 100 100" width="56%" height="56%" xmlns="http://www.w3.org/2000/svg">
      <rect x="26" y="48" width="48" height="32" rx="4" fill="#2f3e34"/>
      <rect x="22" y="40" width="56" height="12" rx="3" fill="#7a8f7c"/>
      <rect x="46" y="40" width="8" height="40" fill="#d8a7a7"/>
      <path d="M50 40 C42 28 30 32 35 40 M50 40 C58 28 70 32 65 40" stroke="#d8a7a7" stroke-width="4" fill="none"/></svg>`;
  const SVG_CLEAN = `<svg viewBox="0 0 100 100" width="54%" height="54%" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="44" width="26" height="38" rx="6" fill="#2f3e34"/>
      <rect x="45" y="30" width="14" height="14" rx="2" fill="#7a8f7c"/>
      <path d="M45 32 L31 28 M45 36 L31 36 M45 40 L31 44" stroke="#7a8f7c" stroke-width="3" stroke-linecap="round"/>
      <rect x="43" y="54" width="20" height="13" rx="2" fill="#f5f1eb"/></svg>`;

  function svgFor(cat) {
    if (SEAT_CATS.includes(cat)) return SVG_SEAT;
    if (cat === "gift-cards") return SVG_GIFT;
    if (cat === "limpieza") return SVG_CLEAN;
    return SVG_STAR;
  }

  // Set de íconos line-art coherentes (un solo grosor, color de marca)
  const ICONS = {
    shield: '<path d="M12 3l7 2.5v5.5c0 4-2.8 6.8-7 8-4.2-1.2-7-4-7-8V5.5L12 3z"/><path d="M9 12l2 2 4-4"/>',
    truck: '<path d="M3 6.5h11v9H3z"/><path d="M14 9.5h3.4L21 12.6v2.9h-7z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
    seal: '<path d="M12 3l2.1 1.6 2.6-.2.6 2.5 2.2 1.4-1 2.4 1 2.4-2.2 1.4-.6 2.5-2.6-.2L12 21l-2.1-1.6-2.6.2-.6-2.5-2.2-1.4 1-2.4-1-2.4 2.2-1.4.6-2.5 2.6.2z"/><path d="M9.3 12l1.9 1.9 3.5-3.7"/>',
    chat: '<path d="M20 11.5a7.5 7.5 0 0 1-10.8 6.7L4 19.5l1.3-4.1A7.5 7.5 0 1 1 20 11.5z"/><path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01"/>',
    wrench: '<path d="M15.5 7a3.5 3.5 0 0 0-4.6 4.3l-5.6 5.6a1.6 1.6 0 0 0 2.3 2.3l5.6-5.6A3.5 3.5 0 0 0 17 9.5L14.8 11.7 12.3 9.2 14.5 7z"/>',
    clipboard: '<rect x="6" y="5" width="12" height="15" rx="2"/><rect x="9" y="3.4" width="6" height="3.2" rx="1"/><path d="M9 13l2 2 4-4"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.2 5-5 2.2 2.2-5z"/>',
    sparkles: '<path d="M11 4l1.6 4.4L17 10l-4.4 1.6L11 16l-1.6-4.4L5 10l4.4-1.6z"/><path d="M18 14l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"/>',
    key: '<circle cx="8" cy="14" r="3.6"/><path d="M10.6 11.4L19 3"/><path d="M16.5 5.5l2 2"/><path d="M14 8l2 2"/>',
    home: '<path d="M4 11l8-6 8 6"/><path d="M6 10.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8.5"/><path d="M10 20v-5h4v5"/>',
    heart: '<path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z"/>',
  };
  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.shield}</svg>`;
  }

  /* ---------- Estado ---------- */
  let products = [];
  let cart = load();
  let currentUser = null;
  let currentProfile = null;
  let authMode = "login"; // "login" | "register"
  let pendingCheckout = false;

  const productById = (id) => products.find((p) => p.id === id);

  function media(p) {
    if (p.imagen && p.imagen.trim() !== "") {
      return `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" />`;
    }
    return `<div style="width:100%;height:100%;display:grid;place-items:center;background:${bgFor(p.categoria)}">${svgFor(p.categoria)}</div>`;
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
          <span class="card__cat">${CAT_LABEL[p.categoria] || ""}${p.marca ? ` · ${p.marca}` : ""}</span>
          <h3 class="card__title">${p.nombre}</h3>
          ${p.recomendado ? `<p class="card__fit">👶 ${p.recomendado}</p>` : ""}
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
      const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Car Seat Clinic 👋 Quisiera información sobre: " + s.nombre)}`;
      return `<div class="service"><div class="service__icon">${icon(s.icono)}</div>
        <h3>${s.nombre}</h3><p>${s.descripcion}</p>
        <a class="service__cta" href="${wa}" target="_blank" rel="noopener">Más información →</a></div>`;
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
    msg += `Entrega: ${d.entrega ? "A domicilio" : "Retiro en tienda"}%0A`;
    if (d.instalacion) msg += `*Quiere instalación profesional* ✅%0A`;
    if (d.notas) msg += `Notas: ${d.notas}`;
    return msg;
  }
  function customerData(form) {
    const d = Object.fromEntries(new FormData(form).entries());
    return { nombre: d.nombre, telefono: d.telefono, email: d.email, direccion: d.direccion, notas: d.notas, instalacion: !!d.instalacion, entrega: d.entrega ? "domicilio" : "tienda" };
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
    $("#regExtra").style.display = isReg ? "block" : "none";
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
        if (!d.tyc) { err.textContent = "Debes aceptar los términos para crear tu cuenta."; return; }
        const meta = { full_name: d.nombre, telefono: d.telefono || "", edad_nino: d.edadnino || "", acepta_promos: !!d.promos };
        const { error } = await DB.signUp(d.email, d.password, meta);
        if (error) throw error;
        if (d.promos) { try { await DB.subscribe({ name: d.nombre || null, email: d.email, whatsapp: d.telefono || null, source: "registro" }); } catch (e2) {} }
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

  /* ---------- Encuentra tu silla ideal ---------- */
  const RECS = {
    infant: { nombre: "Silla para bebé (Grupo 0+)", cat: "recien-nacidos",
      desc: "Para recién nacidos hasta ~13 kg. Se instala a contramarcha, que es la posición más segura para los más pequeños.",
      servicio: "Te recomendamos nuestra instalación profesional a contramarcha." },
    convertible: { nombre: "Silla convertible / 360° (Grupo 0-1-2-3)", cat: "giro-360",
      desc: "Acompaña al niño desde el nacimiento hasta ~36 kg. El giro 360° facilita sentarlo y bajarlo.",
      servicio: "Incluye nuestra instalación profesional y revisión de seguridad." },
    booster: { nombre: "Booster con respaldo (Grupo 2-3)", cat: "booster",
      desc: "Para niños de ~15 a 36 kg. Eleva al niño para que el cinturón del auto quede en la posición correcta.",
      servicio: "Agenda una revisión para asegurar el ajuste correcto del cinturón." },
  };

  function recommend(d) {
    const w = parseFloat(d.peso) || 0;
    let rec;
    if (w > 0) rec = w <= 13 ? RECS.infant : w <= 18 ? RECS.convertible : RECS.booster;
    else if (d.edad === "0 a 12 meses") rec = RECS.infant;
    else if (d.edad === "1 a 3 años") rec = RECS.convertible;
    else rec = RECS.booster;
    return rec;
  }

  function handleFinder(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    const rec = recommend(d);
    const extra = (d.ninos && d.ninos !== "1")
      ? `<p class="finder__note">Como viajan ${d.ninos} niños, te ayudamos a elegir modelos compactos que quepan bien en tu ${d.vehiculo.toLowerCase()}.</p>` : "";
    const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Car Seat Clinic 👋 Usé el buscador y me recomendó: " + rec.nombre + ". Quisiera asesoría.")}`;
    const box = $("#finderResult");
    box.innerHTML = `
      <div class="finder__rec">
        <span class="finder__tag">Tu silla recomendada</span>
        <h3>${rec.nombre}</h3>
        <p>${rec.desc}</p>
        <p class="finder__svc">🛡️ ${rec.servicio}</p>
        ${extra}
        <div class="finder__actions">
          <button class="btn btn--primary" data-ver-sillas="${rec.cat}">Ver sillas recomendadas</button>
          <a class="btn btn--ghost" href="${wa}" target="_blank" rel="noopener">Agendar asesoría</a>
        </div>
      </div>`;
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function applyFilter(cat) {
    const chip = $(`#filters .chip[data-cat="${cat}"]`) || $('#filters .chip[data-cat="todos"]');
    $$("#filters .chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderProducts(chip.dataset.cat);
    document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
  }

  /* ---------- Reserva tu cita ---------- */
  function handleCita(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    let msg = `*Nueva solicitud de cita — Car Seat Clinic*%0A%0A`;
    msg += `Servicio: ${d.servicio}%0AFecha: ${d.fecha}%0AHora: ${d.hora}%0ANombre: ${d.nombre}%0ATeléfono: ${d.telefono}`;
    if (d.comentarios) msg += `%0AComentarios: ${d.comentarios}`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`, "_blank");
    toast("¡Listo! Te confirmamos la cita por WhatsApp 📅");
  }

  /* ---------- Newsletter / Afiliación ---------- */
  async function handleNewsletter(form, origen) {
    const d = Object.fromEntries(new FormData(form).entries());
    if (DB.ready) { try { await DB.subscribe({ name: d.nombre || null, email: d.email, source: origen }); } catch (e) {} }
    form.reset();
    toast("¡Gracias por suscribirte! 💌");
  }

  function closePopup() { $("#newsletterPopup").hidden = true; try { sessionStorage.setItem("csc_np", "1"); } catch (e) {} }
  function maybeShowPopup() {
    try { if (sessionStorage.getItem("csc_np") === "1") return; } catch (e) {}
    setTimeout(() => { try { if (sessionStorage.getItem("csc_np") !== "1") $("#newsletterPopup").hidden = false; } catch (e) {} }, 9000);
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
    const vs = t.closest("[data-ver-sillas]"); if (vs) { applyFilter(vs.getAttribute("data-ver-sillas")); return; }
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

  // Cuestionario "Encuentra tu silla ideal"
  $("#finderForm").addEventListener("submit", handleFinder);

  // Reserva tu cita
  $("#citaForm").addEventListener("submit", handleCita);

  // Newsletter (footer + pop-up)
  $("#newsletterForm").addEventListener("submit", (e) => { e.preventDefault(); handleNewsletter(e.target, "footer"); });
  $("#npForm").addEventListener("submit", (e) => { e.preventDefault(); handleNewsletter(e.target, "popup"); closePopup(); });
  $("#npClose").addEventListener("click", closePopup);

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
  maybeShowPopup();
  if (DB.ready) {
    refreshAuthUI();
    DB.onAuthChange(async () => { await refreshAuthUI(); });
  } else {
    // modo demo: mostrar aviso en el botón de cuenta
    $("#accountLabel").textContent = "Ingresar";
  }
})();
