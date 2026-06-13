/* =====================================================================
   Car Seat Clinic Panamá — Lógica de la tienda
   (No necesitas editar este archivo para usar la tienda.)
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- Utilidades ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const money = (n) => CONFIG.moneda + Number(n).toLocaleString("en-US");
  const productById = (id) => PRODUCTOS.find((p) => p.id === id);

  const CAT_LABEL = { sillas: "Silla de carro", bases: "Base", accesorios: "Accesorio" };
  const CAT_ICON = { sillas: "🪑", bases: "🔩", accesorios: "🧸" };
  const CAT_BG = {
    sillas: "linear-gradient(135deg,#e4f5f4,#c7ebe9)",
    bases: "linear-gradient(135deg,#fdeee6,#ffe0cf)",
    accesorios: "linear-gradient(135deg,#eef3ff,#dde8ff)",
  };

  /* Imagen del producto: foto real si existe, si no un dibujo de respaldo */
  function media(p, big) {
    if (p.imagen && p.imagen.trim() !== "") {
      return `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" />`;
    }
    const size = big ? "font-size:30px" : "font-size:64px";
    return `<div style="width:100%;height:100%;display:grid;place-items:center;background:${CAT_BG[p.categoria] || CAT_BG.accesorios};${size}">${CAT_ICON[p.categoria] || "📦"}</div>`;
  }

  /* ---------- Carrito (estado + persistencia) ---------- */
  const STORE_KEY = "csc_cart";
  let cart = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); }

  function add(id) {
    cart[id] = (cart[id] || 0) + 1;
    save(); renderCart();
    toast("Agregado al carrito ✓");
  }
  function setQty(id, qty) {
    if (qty <= 0) delete cart[id];
    else cart[id] = qty;
    save(); renderCart();
  }
  function itemsCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
  function total() {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = productById(id); return p ? sum + p.precio * qty : sum;
    }, 0);
  }

  /* ---------- Render: productos ---------- */
  function renderProducts(cat = "todos") {
    const grid = $("#productGrid");
    const list = cat === "todos" ? PRODUCTOS : PRODUCTOS.filter((p) => p.categoria === cat);
    grid.innerHTML = list.map((p) => `
      <article class="card">
        <div class="card__media">
          ${media(p)}
          ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
        </div>
        <div class="card__body">
          <span class="card__cat">${CAT_LABEL[p.categoria] || ""}</span>
          <h3 class="card__title">${p.nombre}</h3>
          <p class="card__desc">${p.descripcion}</p>
          <div class="card__foot">
            <div class="card__price">
              ${p.antes ? `<s>${money(p.antes)}</s>` : ""}
              <b>${money(p.precio)}</b>
            </div>
            <button class="card__add" data-add="${p.id}" aria-label="Agregar ${p.nombre}">+</button>
          </div>
        </div>
      </article>`).join("");
  }

  /* ---------- Render: servicios ---------- */
  function renderServices() {
    $("#serviceGrid").innerHTML = SERVICIOS.map((s) => {
      let precio;
      if (s.precio === 0) precio = `<div class="service__price free">Sin costo</div>`;
      else precio = `<div class="service__price">${s.desde ? "Desde " : ""}${money(s.precio)}</div>`;
      return `<div class="service">
        <div class="service__icon">${s.icono}</div>
        <h3>${s.nombre}</h3>
        <p>${s.descripcion}</p>
        ${precio}
      </div>`;
    }).join("");
  }

  /* ---------- Render: carrito ---------- */
  function renderCart() {
    const count = itemsCount();
    $("#cartCount").textContent = count;
    $("#cartCount").style.display = count ? "grid" : "none";
    $("#cart").classList.toggle("is-empty", count === 0);

    $("#cartItems").innerHTML = Object.entries(cart).map(([id, qty]) => {
      const p = productById(id); if (!p) return "";
      return `<div class="cart-item">
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
      </div>`;
    }).join("");

    $("#cartTotal").textContent = money(total());
  }

  /* ---------- Abrir / cerrar carrito ---------- */
  function openCart() { $("#cart").classList.add("is-open"); $("#overlay").classList.add("is-open"); }
  function closeCart() { $("#cart").classList.remove("is-open"); $("#overlay").classList.remove("is-open"); }

  /* ---------- Checkout ---------- */
  function openCheckout() {
    if (itemsCount() === 0) { toast("Tu carrito está vacío"); return; }
    $("#ckCount").textContent = itemsCount();
    $("#ckTotal").textContent = money(total());
    $("#checkoutModal").classList.add("is-open");
    setupPayPal();
  }
  function closeCheckout() { $("#checkoutModal").classList.remove("is-open"); }

  /* Texto del pedido para WhatsApp */
  function buildOrderText(form) {
    const lineas = Object.entries(cart).map(([id, qty]) => {
      const p = productById(id);
      return `• ${qty}x ${p.nombre} — ${money(p.precio * qty)}`;
    });
    let msg = `*Nuevo pedido — Car Seat Clinic*%0A%0A${lineas.join("%0A")}%0A%0A*Total: ${money(total())}*`;
    if (form) {
      const d = Object.fromEntries(new FormData(form).entries());
      msg += `%0A%0A*Datos del cliente:*%0A`;
      if (d.nombre) msg += `Nombre: ${d.nombre}%0A`;
      if (d.telefono) msg += `Teléfono: ${d.telefono}%0A`;
      if (d.email) msg += `Correo: ${d.email}%0A`;
      if (d.direccion) msg += `Dirección: ${d.direccion}%0A`;
      if (d.notas) msg += `Notas: ${d.notas}`;
    }
    return msg;
  }

  function sendWhatsAppOrder() {
    const form = $("#checkoutForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${buildOrderText(form)}`;
    window.open(url, "_blank");
  }

  /* ---------- PayPal (se activa solo si hay Client ID) ---------- */
  let paypalLoaded = false;
  function setupPayPal() {
    const note = $("#payNote");
    if (!CONFIG.paypalClientId) {
      note.textContent = "Pago con tarjeta disponible pronto. Por ahora confirma tu pedido por WhatsApp y coordinamos el pago.";
      return;
    }
    note.textContent = "Pago seguro procesado por PayPal (acepta tarjetas).";
    if (paypalLoaded) { renderPayPalButtons(); return; }

    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(CONFIG.paypalClientId)}&currency=${CONFIG.codigoMoneda}`;
    s.onload = () => { paypalLoaded = true; renderPayPalButtons(); };
    s.onerror = () => { note.textContent = "No se pudo cargar el pago en línea. Usa WhatsApp para confirmar tu pedido."; };
    document.head.appendChild(s);
  }

  function renderPayPalButtons() {
    const container = $("#paypal-container");
    container.innerHTML = "";
    if (!window.paypal) return;
    window.paypal.Buttons({
      style: { shape: "pill", color: "gold", layout: "vertical", label: "pay" },
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: String(total()), currency_code: CONFIG.codigoMoneda } }],
      }),
      onApprove: (data, actions) => actions.order.capture().then(() => {
        cart = {}; save(); renderCart(); closeCheckout(); closeCart();
        toast("¡Pago recibido! Gracias por tu compra 🎉");
      }),
    }).render("#paypal-container");
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-open");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-open"), 2200);
  }

  /* ---------- Rellenar datos de contacto desde CONFIG ---------- */
  function fillContact() {
    $("#cInfoUbicacion").textContent = CONFIG.ubicacion;
    $("#cInfoHorario").textContent = CONFIG.horario;
    const mail = $("#cInfoEmail"); mail.textContent = CONFIG.email; mail.href = "mailto:" + CONFIG.email;
    const insta = $("#cInfoInsta"); insta.href = CONFIG.instagram;
    $("#cWhatsBtn").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Car Seat Clinic, tengo una consulta 👶")}`;
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Eventos ---------- */
  // Delegación robusta de eventos de clic
  document.addEventListener("click", (e) => {
    const t = e.target;
    const addBtn = t.closest("[data-add]");
    if (addBtn) { add(addBtn.getAttribute("data-add")); openCart(); return; }
    const inc = t.closest("[data-inc]");
    if (inc) { const id = inc.getAttribute("data-inc"); setQty(id, (cart[id] || 0) + 1); return; }
    const dec = t.closest("[data-dec]");
    if (dec) { const id = dec.getAttribute("data-dec"); setQty(id, (cart[id] || 0) - 1); return; }
    const rm = t.closest("[data-rm]");
    if (rm) { setQty(rm.getAttribute("data-rm"), 0); return; }
  });

  // Filtros
  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $$("#filters .chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderProducts(chip.dataset.cat);
  });

  // Carrito abrir/cerrar
  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", () => { closeCart(); });
  $("#cartEmptyShop").addEventListener("click", closeCart);
  $("#goCheckout").addEventListener("click", openCheckout);

  // Checkout
  $("#closeCheckout").addEventListener("click", closeCheckout);
  $("#payWhatsapp").addEventListener("click", sendWhatsAppOrder);
  $("#checkoutModal").addEventListener("click", (e) => { if (e.target.id === "checkoutModal") closeCheckout(); });

  // Menú móvil
  $("#navToggle").addEventListener("click", () => $("#nav").classList.toggle("is-open"));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("is-open")));

  // Formulario de contacto → WhatsApp
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    const msg = `Hola Car Seat Clinic 👋%0A%0ANombre: ${d.nombre}%0AMensaje: ${d.mensaje}`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`, "_blank");
  });

  /* ---------- Inicio ---------- */
  document.title = `${CONFIG.nombre} ${CONFIG.eslogan} — Sillas de carro y seguridad infantil`;
  renderProducts();
  renderServices();
  renderCart();
  fillContact();
})();
