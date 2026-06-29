/* =====================================================================
   Car Seat Clinic Panamá — Lógica de la tienda
   (No necesitas editar este archivo.)
   ===================================================================== */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const money = (n) => CONFIG.moneda + Number(n).toLocaleString("en-US");
  const precioTxt = (p) => (p && p.precio > 0) ? money(p.precio) : "Consultar";
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const shortText = (s, max = 112) => {
    const t = String(s ?? "").replace(/\s+/g, " ").trim();
    return t.length > max ? t.slice(0, max - 1).trim() + "…" : t;
  };

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
  let fCat = "todos", fPrice = "all", fSort = "destacados";
  const fBrands = new Set();
  const PRICE_RANGES = [
    ["all", "Todos", () => true],
    ["consultar", "Precio por consultar", (p) => !p.precio || Number(p.precio) <= 0],
    ["lt50", "Menos de $50", (p) => Number(p.precio) > 0 && Number(p.precio) < 50],
    ["50-150", "$50 – $150", (p) => Number(p.precio) >= 50 && Number(p.precio) <= 150],
    ["150-300", "$150 – $300", (p) => Number(p.precio) > 150 && Number(p.precio) <= 300],
    ["gt300", "Más de $300", (p) => Number(p.precio) > 300],
  ];
  const CAT_ORDER = ["recien-nacidos", "convertibles", "giro-360", "combinadas", "booster", "accesorios", "limpieza", "gift-cards"];
  let detailPid = null, detailStock = 0;
  let currentUser = null;
  let currentProfile = null;
  let authMode = "login"; // "login" | "register"
  let pendingCheckout = false;

  const productById = (id) => products.find((p) => p.id === id);
  const isPriced = (p) => Number(p && p.precio) > 0;

  function consultUrl(p) {
    const name = p && p.nombre ? p.nombre : "un producto";
    const msg = `Hola Car Seat Clinic, quisiera consultar precio y disponibilidad de: ${name}`;
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  function consultProduct(p) {
    if (!p) return;
    window.open(consultUrl(p), "_blank");
  }

  function cleanCartForCatalog() {
    let changed = false;
    Object.keys(cart).forEach((id) => {
      const p = productById(id);
      if (!p || !isPriced(p) || p.stock <= 0) {
        delete cart[id];
        changed = true;
      } else if (cart[id] > p.stock) {
        cart[id] = p.stock;
        changed = true;
      }
    });
    if (changed) save();
  }

  function catImage(cat) { return (typeof IMAGENES_CATEGORIA !== "undefined" && IMAGENES_CATEGORIA[cat]) || ""; }
  function productImageList(p) {
    const list = Array.isArray(p.imagenes) ? p.imagenes.filter(Boolean) : [];
    if (p.imagen && !list.includes(p.imagen)) list.unshift(p.imagen);
    const fallback = catImage(p.categoria);
    if (!list.length && fallback) list.push(fallback);
    return [...new Set(list)];
  }

  function fallbackMedia(p, extraClass = "") {
    return `<div class="card__fallback ${extraClass}" aria-hidden="true"><span class="card__fallbackIcon">${svgFor(p.categoria)}</span></div>`;
  }

  function media(p) {
    const img = productImageList(p)[0];
    if (img) return `${fallbackMedia(p)}<img src="${esc(img)}" alt="${esc(p.nombre)}" loading="lazy" decoding="async" />`;
    return fallbackMedia(p, "card__fallback--visible");
  }

  function productThumbs(p) {
    const imgs = productImageList(p).slice(0, 4);
    if (imgs.length < 2) return "";
    return `<div class="card__thumbs" aria-hidden="true">${imgs.map((img, i) => `<span class="card__thumb ${i === 0 ? "is-active" : ""}"><img src="${img}" alt="" loading="lazy" decoding="async" /></span>`).join("")}</div>`;
  }

  /* ---------- Carrito (estado + persistencia) ---------- */
  const STORE_KEY = "csc_cart";
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); }

  function add(id, qty = 1) {
    const p = productById(id);
    if (!p) return;
    if (!isPriced(p)) { consultProduct(p); toast("Te abrimos WhatsApp para cotizar"); return; }
    if (p.stock <= 0) { toast("Producto agotado"); return; }
    const current = cart[id] || 0;
    if (current + qty > p.stock) { toast("No hay suficiente stock disponible"); return; }
    cart[id] = current + qty;
    save(); renderCart(); openCart();
    const cc = $("#cartCount"); if (cc) { cc.classList.remove("pop"); void cc.offsetWidth; cc.classList.add("pop"); }
    toast("Agregado al carrito ✓");
  }
  function setQty(id, qty) {
    const p = productById(id);
    if (p && !isPriced(p)) { delete cart[id]; save(); renderCart(); return; }
    if (p && qty > p.stock) { toast(`Solo quedan ${p.stock}`); qty = p.stock; }
    if (qty <= 0) delete cart[id]; else cart[id] = qty;
    save(); renderCart();
  }
  function cartList() {
    return Object.entries(cart).map(([id, qty]) => ({ id, qty, p: productById(id) })).filter((i) => i.p && isPriced(i.p));
  }
  function itemsCount() { return cartList().reduce((a, i) => a + i.qty, 0); }
  function total() { return cartList().reduce((s, { qty, p }) => s + p.precio * qty, 0); }

  /* ---------- Render: productos ---------- */
  function renderProducts(list) {
    const grid = $("#productGrid");
    if (!list || !list.length) { grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No hay productos con esos filtros.</p>`; return; }
    grid.innerHTML = list.map((p, index) => {
      const agotado = p.stock <= 0;
      const sinPrecio = !isPriced(p);
      const canBuy = !agotado && !sinPrecio;
      const desc = shortText(p.descripcion || p.recomendado || "", 118);
      const imgs = productImageList(p);
      const category = CAT_LABEL[p.categoria] || p.categoria || "Producto";
      let stockTag = "";
      if (agotado) stockTag = `<span class="card__stock card__stock--out">Agotado</span>`;
      else if (sinPrecio) stockTag = `<span class="card__stock card__stock--consult">Asesoría y cotización</span>`;
      else if (p.stock <= 5) stockTag = `<span class="card__stock card__stock--low">¡Solo quedan ${p.stock}!</span>`;
      else stockTag = `<span class="card__stock card__stock--ok">Disponible</span>`;
      return `<article class="card ${index === 0 ? "card--featured" : ""} ${agotado ? "card--out" : ""}">
        <div class="card__media" data-detail="${p.id}">
          <span class="card__shine" aria-hidden="true"></span>
          ${media(p)}
          <span class="card__peek">Ver detalles</span>
          <span class="card__imageCount">${imgs.length > 1 ? `${imgs.length} fotos` : "Foto principal"}</span>
          ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
          ${(p.antes && p.precio > 0 && p.antes > p.precio) ? `<span class="card__off">-${Math.round((1 - p.precio / p.antes) * 100)}%</span>` : ""}
          ${productThumbs(p)}
        </div>
        <div class="card__body">
          <div class="card__topline">
            <span class="card__brand">${p.marca || category}</span>
            <span class="card__cat">${category}</span>
          </div>
          <h3 class="card__title" data-detail="${p.id}">${p.nombre}</h3>
          ${p.recomendado ? `<span class="card__fit">${esc(p.recomendado)}</span>` : ""}
          ${desc ? `<p class="card__desc">${esc(desc)}</p>` : ""}
          <div class="card__promise">
            <span>Compatibilidad guiada</span>
            ${imgs.length > 1 ? `<span>Galería disponible</span>` : `<span>Foto editable</span>`}
          </div>
          <div class="card__status">${stockTag}</div>
          <div class="card__foot">
            <div class="card__price">${p.antes ? `<s>${money(p.antes)}</s>` : ""}<b>${precioTxt(p)}</b></div>
            ${canBuy
              ? `<button class="card__add" data-add="${p.id}" aria-label="Agregar ${esc(p.nombre)}">+</button>`
              : agotado
                ? `<button class="card__consult card__consult--disabled" disabled>Agotado</button>`
                : `<button class="card__consult" data-consult="${p.id}" aria-label="Cotizar ${esc(p.nombre)}">Cotizar</button>`}
          </div>
        </div>
      </article>`;
    }).join("");
    setupMediaFallbacks();
    animateProductCards();
  }

  function setupMediaFallbacks() {
    $$("#productGrid .card__media > img").forEach((img) => {
      const markMissing = () => {
        img.classList.add("is-missing");
        img.hidden = true;
        img.closest(".card__media")?.classList.add("card__media--fallback");
      };
      img.addEventListener("error", markMissing, { once: true });
      if (img.complete && img.naturalWidth === 0) markMissing();
    });
    $$("#productGrid .card__thumb img").forEach((img) => {
      const markMissing = () => {
        img.hidden = true;
        img.closest(".card__thumb")?.classList.add("is-missing");
      };
      img.addEventListener("error", markMissing, { once: true });
      if (img.complete && img.naturalWidth === 0) markMissing();
    });
  }

  function animateProductCards() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    $$("#productGrid .card").forEach((card, i) => {
      card.classList.remove("is-entering");
      card.style.animationDelay = `${Math.min(i, 7) * 42}ms`;
      requestAnimationFrame(() => card.classList.add("is-entering"));
    });
  }

  function buildFilters() {
    const present = CAT_ORDER.filter((c) => products.some((p) => p.categoria === c));
    $("#fTypes").innerHTML = [`<li><button class="flink ${fCat === "todos" ? "is-active" : ""}" data-cat="todos">Todos</button></li>`]
      .concat(present.map((c) => `<li><button class="flink ${fCat === c ? "is-active" : ""}" data-cat="${c}">${CAT_LABEL[c] || c}</button></li>`)).join("");
    const brands = [...new Set(products.map((p) => p.marca).filter(Boolean))].sort();
    $("#fBrands").innerHTML = brands.length
      ? brands.map((b) => `<li><label class="fcheck"><input type="checkbox" data-brand="${esc(b)}" ${fBrands.has(b) ? "checked" : ""}/> ${esc(b)}</label></li>`).join("")
      : `<li class="muted" style="list-style:none">Sin marcas aún</li>`;
    $("#fPrices").innerHTML = PRICE_RANGES.map(([v, l]) => `<li><label class="fcheck"><input type="radio" name="fprice" data-price="${v}" ${fPrice === v ? "checked" : ""}/> ${l}</label></li>`).join("");
  }

  function applyFilters() {
    let list = products.slice();
    if (fCat !== "todos") list = list.filter((p) => p.categoria === fCat);
    if (fBrands.size) list = list.filter((p) => fBrands.has(p.marca));
    const pr = PRICE_RANGES.find((r) => r[0] === fPrice); if (pr) list = list.filter(pr[2]);
    if (fSort === "precio-asc") list.sort((a, b) => (isPriced(a) ? a.precio : Number.MAX_SAFE_INTEGER) - (isPriced(b) ? b.precio : Number.MAX_SAFE_INTEGER));
    else if (fSort === "precio-desc") list.sort((a, b) => (isPriced(b) ? b.precio : -1) - (isPriced(a) ? a.precio : -1));
    else if (fSort === "nombre") list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    renderProducts(list);
    const c = $("#shopCount"); if (c) c.textContent = `${list.length} producto${list.length === 1 ? "" : "s"}`;
  }

  function renderServices() {
    const grid = $("#serviceGrid");
    if (!grid) return;
    grid.innerHTML = SERVICIOS.map((s) => {
      const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Car Seat Clinic 👋 Quisiera información sobre: " + s.nombre)}`;
      return `<div class="service"><div class="service__icon">${icon(s.icono)}</div>
        <h3>${s.nombre}</h3><p>${s.descripcion}</p>
        <a class="service__cta" href="${wa}" target="_blank" rel="noopener">Pedir información</a></div>`;
    }).join("");
  }

  function renderTestimonios() {
    const g = $("#testimonios-grid");
    if (!g || typeof TESTIMONIOS === "undefined") return;
    g.innerHTML = TESTIMONIOS.map((t) => `
      <figure class="tcard">
        <div class="tcard__stars">★★★★★</div>
        <blockquote>"${t.texto}"</blockquote>
        <figcaption>— ${t.nombre}${t.ciudad ? ", " + t.ciudad : ""}</figcaption>
      </figure>`).join("");
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

  /* ---------- Ficha de producto ---------- */
  function openDetail(id) {
    const p = productById(id); if (!p) return;
    detailPid = id; detailStock = p.stock;
    let imgs = (p.imagenes && p.imagenes.length) ? p.imagenes : (p.imagen ? [p.imagen] : []);
    if (!imgs.length && catImage(p.categoria)) imgs = [catImage(p.categoria)];
    const main = imgs.length
      ? `<div class="detail__main"><img id="detailMain" src="${imgs[0]}" alt="${p.nombre}" /></div>`
      : `<div class="detail__main">${svgFor(p.categoria)}</div>`;
    const thumbs = imgs.length > 1
      ? `<div class="detail__thumbs">${imgs.map((u, i) => `<img class="${i === 0 ? "is-active" : ""}" data-thumb="${u}" src="${u}" alt="" />`).join("")}</div>` : "";
    const feats = (p.caracteristicas && p.caracteristicas.length)
      ? `<ul class="detail__feats">${p.caracteristicas.map((f) => `<li>${f}</li>`).join("")}</ul>` : "";
    const agotado = p.stock <= 0;
    const sinPrecio = !isPriced(p);
    $("#detailBody").innerHTML = `
      <div>${main}${thumbs}</div>
      <div class="detail__info">
        <div class="detail__crumb">Inicio / ${CAT_LABEL[p.categoria] || "Productos"}</div>
        ${p.marca ? `<span class="detail__brand">${p.marca}</span>` : ""}
        <h3>${p.nombre}</h3>
        ${p.recomendado ? `<p class="card__fit">👶 ${p.recomendado}</p>` : ""}
        <div class="detail__price">${p.antes ? `<s>${money(p.antes)}</s>` : ""}<b>${precioTxt(p)}</b></div>
        <p class="detail__desc">${p.descripcion || ""}</p>
        ${feats}
        ${agotado
          ? `<button class="btn btn--primary btn--block" disabled>Agotado</button>`
          : sinPrecio
            ? `<a class="btn btn--whatsapp btn--block" href="${consultUrl(p)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
              <p class="detail__hint">Te confirmamos precio, disponibilidad y compatibilidad con tu auto.</p>`
            : `<div class="detail__buy">
              <div class="detail__qty"><button data-detqty="-1" aria-label="Menos">−</button><span id="detQty">1</span><button data-detqty="1" aria-label="Más">+</button></div>
              <button class="btn btn--primary detail__addbtn" id="detailAdd">Agregar al carrito</button>
            </div>`}
      </div>`;
    $("#detailModal").classList.add("is-open");
  }
  function closeDetail() { $("#detailModal").classList.remove("is-open"); }

  /* ---------- Checkout ---------- */
  function goCheckout() {
    if (itemsCount() === 0) { toast("Tu carrito está vacío"); return; }
    if (total() <= 0) { toast("Consulta precios por WhatsApp antes de finalizar"); return; }
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
    // Botón de pago con tarjeta (pasarela del banco), solo si está activo
    const pc = $("#payCard");
    if (pc) {
      const on = !!(CONFIG.pago && CONFIG.pago.activo);
      pc.style.display = on ? "block" : "none";
      if (on) pc.textContent = "💳 " + (CONFIG.pago.etiqueta || "Pagar con tarjeta");
    }
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
    const d = Object.fromEntries(new FormData(e.target).entries());
    // Atajo de administrador: escribir admin / admin entra al panel (CRM)
    const ac = CONFIG.adminCode || {};
    if (authMode === "login" && (d.email || "").trim() === ac.usuario && (d.password || "") === ac.clave) {
      try { sessionStorage.setItem("csc_admin_go", "1"); } catch (e3) {}
      window.location.href = "admin.html";
      return;
    }
    if (!DB.ready) { err.textContent = "Modo demo: conecta la base de datos para usar el login (ver guía)."; return; }
    try {
      if (authMode === "register") {
        if (!d.tyc) { err.textContent = "Debes aceptar los términos para crear tu cuenta."; return; }
        if ((d.password || "").length < 6) { err.textContent = "La contraseña debe tener al menos 6 caracteres."; return; }
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
    $("#cWhatsBtn").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Car Seat Clinic, tengo una consulta")}`;
    const floatWhats = $("#floatWhatsBtn");
    if (floatWhats) floatWhats.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola Car Seat Clinic, quisiera recibir asesoría")}`;
    const map = $("#mapFrame");
    if (map) map.src = `https://maps.google.com/maps?q=${encodeURIComponent(CONFIG.mapsQuery || CONFIG.ubicacion)}&z=13&output=embed`;
    // QR de Waze (cómo llegar)
    const wazeUrl = CONFIG.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(CONFIG.mapsQuery || CONFIG.ubicacion)}&navigate=yes`;
    const wl = $("#wazeLink"); if (wl) wl.href = wazeUrl;
    const qrEl = $("#wazeQr");
    if (qrEl && typeof qrcode === "function") {
      try { const qr = qrcode(0, "M"); qr.addData(wazeUrl); qr.make(); qrEl.innerHTML = qr.createImgTag(4, 0); } catch (e) {}
    }
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

  function updateFinderProgress() {
    const form = $("#finderForm");
    const bar = $("#finderProgressBar");
    const text = $("#finderProgressText");
    if (!form || !bar || !text) return;
    const fields = Array.from(form.querySelectorAll("select, input")).filter((el) => el.name);
    const answered = fields.filter((el) => {
      if (el.tagName === "SELECT") return el.selectedIndex > 0;
      return String(el.value || "").trim();
    }).length;
    const total = fields.length || 1;
    const pct = Math.round((answered / total) * 100);
    bar.style.width = `${pct}%`;
    text.textContent = `${answered} de ${total} respuestas`;
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
    updateFinderProgress();
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function applyFilter(cat) {
    fCat = cat; fBrands.clear(); fPrice = "all";
    buildFilters(); applyFilters();
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
  const APPOINTMENT_SLOTS = [
    ["09:00", "Mañana", "9:00 a.m."],
    ["11:00", "Mañana", "11:00 a.m."],
    ["14:00", "Tarde", "2:00 p.m."],
    ["16:30", "Final de tarde", "4:30 p.m."],
  ];

  function selectedAppointmentSlot() {
    return $("#citaHora") ? $("#citaHora").value : "";
  }

  function servicePriority(service) {
    const s = String(service || "").toLowerCase();
    if (/choque|revision|seguridad/.test(s)) return "alta";
    if (/limpieza|instalacion/.test(s)) return "media";
    return "normal";
  }

  function isRentalService(service) {
    return /alquiler|renta/.test(String(service || "").toLowerCase());
  }

  function rentalDays(start, end) {
    if (!start || !end) return 0;
    const from = new Date(`${start}T12:00:00`);
    const to = new Date(`${end}T12:00:00`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 0;
    return Math.ceil((to - from) / 86400000) + 1;
  }

  function rentalDetailsFromData(d) {
    return {
      rental_equipment: d.rental_equipment || "",
      rental_end_date: d.rental_end_date || "",
      rental_days: rentalDays(d.fecha, d.rental_end_date),
      delivery_location: d.delivery_location || d.zona || "",
      pickup_location: d.pickup_location || "",
      pickup_time: d.pickup_time || "",
      rental_child: d.rental_child || "",
      rental_installation: d.rental_installation || "No",
    };
  }

  function updateRentalPanel() {
    const panel = $("#rentalPanel");
    if (!panel) return;
    const service = $("#citaServicio")?.value || "";
    const isRental = isRentalService(service);
    panel.hidden = !isRental;
    const required = ["rentalEquipment", "rentalEndDate", "deliveryLocation", "pickupLocation", "rentalChild"];
    required.forEach((id) => {
      const field = $(`#${id}`);
      if (field) field.required = isRental;
    });
    const start = $("#citaFecha")?.value || "";
    const end = $("#rentalEndDate")?.value || "";
    const endDate = $("#rentalEndDate");
    if (endDate && start) endDate.min = start;
    const days = rentalDays(start, end);
    const kpi = $("#rentalKpi");
    if (kpi) {
      kpi.textContent = days
        ? `${days} dia${days === 1 ? "" : "s"} de alquiler para confirmar disponibilidad`
        : "Elige fecha de inicio y devolucion para calcular el periodo.";
    }
    updateCitaSummary();
  }

  function updateCitaSummary() {
    const box = $("#citaSummary");
    if (!box) return;
    const service = $("#citaServicio")?.value || "servicio";
    const date = $("#citaFecha")?.value || "";
    const slot = selectedAppointmentSlot();
    if (!date || !slot || !$("#citaServicio")?.value) {
      box.textContent = "Selecciona un servicio, fecha y horario para armar tu solicitud.";
      return;
    }
    const dateText = new Date(`${date}T12:00:00`).toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" });
    if (isRentalService(service)) {
      const equipment = $("#rentalEquipment")?.value || "equipo";
      const days = rentalDays(date, $("#rentalEndDate")?.value || "");
      const period = days ? `por ${days} dia${days === 1 ? "" : "s"}` : "con fechas por confirmar";
      box.textContent = `Alquiler de ${equipment} ${period}. Entrega el ${dateText} a las ${slot}. El CRM guardara entrega, recogida y datos del nino.`;
      return;
    }
    box.textContent = `${service} - ${dateText} a las ${slot}. El CRM guardara esta solicitud y WhatsApp llevara el resumen.`;
  }

  function renderAppointmentSlots() {
    const slots = $("#appointmentSlots");
    if (!slots) return;
    slots.innerHTML = APPOINTMENT_SLOTS.map(([value, label, display]) => `
      <button class="slot-btn" type="button" data-slot="${value}">
        <strong>${display}</strong>
        <span>${label}</span>
      </button>`).join("");
    slots.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-slot]");
      if (!btn) return;
      $("#citaHora").value = btn.getAttribute("data-slot");
      $$(".slot-btn", slots).forEach((item) => item.classList.toggle("is-selected", item === btn));
      updateCitaSummary();
    });
  }

  function setupAppointmentPlanner() {
    const date = $("#citaFecha");
    if (date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date.min = tomorrow.toISOString().slice(0, 10);
      date.addEventListener("change", updateRentalPanel);
    }
    $("#citaServicio")?.addEventListener("change", updateRentalPanel);
    ["rentalEndDate", "rentalEquipment", "deliveryLocation", "pickupLocation", "pickupTime", "rentalChild"].forEach((id) => {
      $(`#${id}`)?.addEventListener("input", updateRentalPanel);
      $(`#${id}`)?.addEventListener("change", updateRentalPanel);
    });
    $$("[data-rental-cta]").forEach((cta) => cta.addEventListener("click", () => {
      setTimeout(() => {
        const serviceSelect = $("#citaServicio");
        if (serviceSelect) serviceSelect.value = "Alquiler";
        updateRentalPanel();
      }, 0);
    }));
    renderAppointmentSlots();
    updateRentalPanel();
  }

  async function handleCita(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target).entries());
    if (!selectedAppointmentSlot()) {
      toast("Selecciona un horario disponible");
      return;
    }
    const isRental = isRentalService(d.servicio);
    const rentalDetails = rentalDetailsFromData(d);
    if (isRental && (!rentalDetails.rental_equipment || !rentalDetails.rental_end_date || !rentalDetails.delivery_location || !rentalDetails.pickup_location || !rentalDetails.rental_child || !rentalDetails.rental_days)) {
      toast("Completa equipo, fechas, entrega, recogida y datos del nino");
      return;
    }
    await DB.guardarLead({
      type: isRental ? "alquiler" : "cita",
      source: "calendario-web",
      status: "nuevo",
      priority: isRental ? "alta" : servicePriority(d.servicio),
      service: d.servicio,
      name: d.nombre,
      phone: d.telefono,
      date: d.fecha,
      slot: d.hora,
      message: d.comentarios,
      details: {
        zona: d.zona || "",
        modelo_silla: d.modelo_silla || "",
        modelo_auto: d.modelo_auto || "",
        ...(isRental ? rentalDetails : {}),
      },
    });
    let msg = `*Nueva solicitud de cita - Car Seat Clinic*%0A%0A`;
    msg += `Servicio: ${d.servicio}%0AFecha: ${d.fecha}%0AHora: ${d.hora}%0ANombre: ${d.nombre}%0ATelefono: ${d.telefono}`;
    if (d.zona) msg += `%0AZona: ${d.zona}`;
    if (isRental) {
      msg += `%0AEquipo: ${rentalDetails.rental_equipment}`;
      msg += `%0ADevolucion: ${rentalDetails.rental_end_date}`;
      msg += `%0ADias: ${rentalDetails.rental_days}`;
      msg += `%0AEntrega: ${rentalDetails.delivery_location}`;
      msg += `%0ARecogida: ${rentalDetails.pickup_location}`;
      if (rentalDetails.pickup_time) msg += `%0AHora de recogida: ${rentalDetails.pickup_time}`;
      msg += `%0AEdad/peso: ${rentalDetails.rental_child}`;
      msg += `%0AInstalacion al entregar: ${rentalDetails.rental_installation}`;
    }
    if (d.modelo_silla) msg += `%0AModelo de silla: ${d.modelo_silla}`;
    if (d.modelo_auto) msg += `%0AModelo de auto: ${d.modelo_auto}`;
    if (d.comentarios) msg += `%0AComentarios: ${d.comentarios}`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${msg}`, "_blank");
    toast("Solicitud guardada. Te confirmamos por WhatsApp");
    e.target.reset();
    $("#citaHora").value = "";
    $$("#appointmentSlots .slot-btn").forEach((item) => item.classList.remove("is-selected"));
    updateRentalPanel();
  }

  async function handleNewsletter(form, origen) {
    const d = Object.fromEntries(new FormData(form).entries());
    if (DB.ready) { try { await DB.subscribe({ name: d.nombre || null, email: d.email, source: origen }); } catch (e) {} }
    form.reset();
    toast("¡Gracias por suscribirte! 💌");
  }

  function closePopup() { $("#newsletterPopup").hidden = true; try { sessionStorage.setItem("csc_np", "1"); } catch (e) {} }
  function maybeShowPopup() {
    try { if (sessionStorage.getItem("csc_np") === "1") return; } catch (e) {}
    const tryShow = () => {
      try { if (sessionStorage.getItem("csc_np") === "1") return; } catch (e) {}
      // No mostrar si hay una ventana abierta (ficha, checkout, login, chat…)
      const modalOpen = !!document.querySelector(".modal.is-open") || !!document.querySelector(".cart.is-open");
      const chatOpen = $("#chatPanel") && !$("#chatPanel").hidden;
      if (modalOpen || chatOpen) { setTimeout(tryShow, 6000); return; }
      $("#newsletterPopup").hidden = false;
    };
    setTimeout(tryShow, 16000);
  }

  /* ---------- Cargar productos ---------- */
  async function loadProducts() {
    products = await DB.getProducts();
    cleanCartForCatalog();
    buildFilters();
    applyFilters();
    renderCart();
  }

  // Carrusel del hero (cambia cada 4s)
  function setupHeroSlider() {
    const slides = $$("#heroSlider .hero__slide");
    if (slides.length < 2) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    setInterval(() => {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 4000);
  }

  // Asistente / chat con IA (guarda las consultas en el CRM)
  function setupChat() {
    const panel = $("#chatPanel"), msgs = $("#chatMsgs"), input = $("#chatInput");
    if (!panel) return;
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
      return {
        intent: "unknown",
        needsHuman: true,
        answer: "Gracias por tu pregunta. Para responder bien necesito un poco más de información. Puedes continuar por WhatsApp y un asesor te ayuda.",
      };
    }
    function answerHtml(answer, showWhatsapp, originalText) {
      const safe = esc(answer || "").replace(/\n/g, "<br>");
      if (!showWhatsapp) return safe;
      return `${safe}<br><a class="chat__wa" href="${waUrl(originalText)}" target="_blank" rel="noopener">Continuar por WhatsApp</a>`;
    }
    function serviceOptionFor(reply) {
      const service = reply?.capture?.service || "";
      const normalized = service.toLowerCase();
      if (/limpieza/.test(normalized)) return "Limpieza y desinfeccion";
      if (/instalacion/.test(normalized)) return "Instalacion profesional";
      if (/alquiler/.test(normalized)) return "Alquiler";
      if (/asesoria|compra|cotizacion/.test(normalized)) return "Asesoria de compra";
      return "Revision de seguridad";
    }
    async function saveAdvisorLead(reply, originalText, status = "nuevo") {
      if (!reply || !reply.needsHuman) return;
      await DB.guardarLead({
        type: reply.action === "book" ? "cita-sugerida" : "consulta-ia",
        source: "asistente-web",
        status,
        priority: reply.capture?.priority || (reply.intent === "crash" ? "urgente" : "media"),
        service: reply.capture?.service || "Consulta IA",
        message: originalText,
        session_id: sid,
        details: {
          intent: reply.intent,
          confidence: reply.confidence,
          answer: reply.answer,
        },
      });
    }
    function prefillAppointment(reply, originalText) {
      const service = serviceOptionFor(reply);
      const serviceSelect = $("#citaServicio");
      if (serviceSelect) {
        serviceSelect.value = service;
        serviceSelect.dispatchEvent(new Event("change"));
      }
      const comments = $("input[name='comentarios']");
      if (comments && !comments.value) comments.value = originalText;
      close();
      document.getElementById("citas")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast("El calendario quedo preparado con tu solicitud");
    }
    function renderAdvisorActions(reply, originalText) {
      if (!reply || !reply.needsHuman) return;
      const wrap = document.createElement("div");
      wrap.className = "chat__actions";
      if (reply.action === "book") {
        const book = document.createElement("button");
        book.type = "button";
        book.textContent = "Reservar horario";
        book.addEventListener("click", () => {
          saveAdvisorLead(reply, originalText, "esperando_reserva");
          prefillAppointment(reply, originalText);
        });
        wrap.appendChild(book);
      }
      const save = document.createElement("button");
      save.type = "button";
      save.textContent = reply.action === "case" ? "Guardar caso" : "Guardar consulta";
      save.addEventListener("click", async () => {
        await saveAdvisorLead(reply, originalText, "nuevo");
        toast("Consulta guardada en el CRM");
      });
      wrap.appendChild(save);
      const wa = document.createElement("a");
      wa.href = waUrl(originalText);
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.textContent = "WhatsApp";
      wrap.appendChild(wa);
      msgs.appendChild(wrap);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function clearQuickActions() { $$(".chat__quick", msgs).forEach((el) => el.remove()); }
    function quickActions() {
      const wrap = document.createElement("div");
      wrap.className = "chat__quick";
      [
        "¿Qué silla usa una niña de 5 años?",
        "Quiero instalar una silla",
        "Quiero cotizar un producto",
      ].forEach((label) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = label;
        btn.addEventListener("click", () => {
          input.value = label;
          clearQuickActions();
          $("#chatForm").requestSubmit();
        });
        wrap.appendChild(btn);
      });
      msgs.appendChild(wrap);
      msgs.scrollTop = msgs.scrollHeight;
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
      DB.guardarMensaje(sid, "user", text);
      const typing = bubble("bot", '<span class="chat__typing">Escribiendo…</span>');
      let answer = "";
      const local = smartReply(text);
      try { const r = await DB.preguntarIA(history); answer = (r && r.answer) ? r.answer : ""; } catch (err) { answer = ""; }
      typing.remove();
      if (answer) {
        bubble("bot", answerHtml(answer, !!local.needsHuman, text), "chat__bubble--ai");
        history.push({ role: "assistant", content: answer });
        DB.guardarMensaje(sid, "asistente", answer);
        saveAdvisorLead({ ...local, answer }, text);
        renderAdvisorActions({ ...local, answer }, text);
      } else {
        bubble("bot", answerHtml(local.answer, !!local.needsHuman, text), "chat__bubble--smart");
        history.push({ role: "assistant", content: local.answer });
        DB.guardarMensaje(sid, "asistente", "[asistente local] " + local.answer);
        saveAdvisorLead(local, text);
        renderAdvisorActions(local, text);
      }
    });
  }

  // Aparición suave de secciones al hacer scroll
  function setupReveal() {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sel = ".section__head, .pillar, .tcard, .rcard, .feature, .service, .about__text, .about__art, .finder, .cita__form, .map, .newsletter, .rstep, .safe-route__intro, .safety-strip";
    const els = $$(sel);
    if (!els.length) return;
    const reveal = (el) => el.classList.add("is-visible");
    els.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${Math.min(i % 6, 5) * 45}ms`);
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { reveal(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) && r.bottom > 0) reveal(el); // ya visible al cargar
      else io.observe(el);
    });
    // Red de seguridad: que nada quede oculto si el scroll/observer falla
    setTimeout(() => els.forEach(reveal), 2500);
  }

  function setupScrollProgress() {
    const bar = $("#scrollProgress");
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const pct = Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.transform = `scaleX(${pct})`;
      ticking = false;
    };
    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  function updateFloatingWhatsApp(section) {
    const btn = $("#floatWhatsBtn");
    if (!btn || !section) return;
    const label = section.dataset.whatsappLabel || "WhatsApp";
    const message = section.dataset.whatsappMessage || "Hola Car Seat Clinic, quisiera recibir asesoría.";
    const span = btn.querySelector("span");
    if (span && span.textContent !== label && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      btn.classList.add("is-changing");
      setTimeout(() => {
        span.textContent = label;
        btn.classList.remove("is-changing");
      }, 160);
    } else if (span) {
      span.textContent = label;
    }
    btn.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  }

  function setupFloatingWhatsApp() {
    const sections = $$("[data-whatsapp-label]");
    if (!sections.length) return;
    let ticking = false;
    const choose = () => {
      const line = window.innerHeight * 0.38;
      let active = sections[0];
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > 90) active = section;
      });
      updateFloatingWhatsApp(active);
      ticking = false;
    };
    const requestChoose = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(choose);
      }
    };
    choose();
    window.addEventListener("scroll", requestChoose, { passive: true });
    window.addEventListener("resize", requestChoose);
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target;
    const consult = t.closest("[data-consult]"); if (consult) { consultProduct(productById(consult.getAttribute("data-consult"))); return; }
    const a = t.closest("[data-add]"); if (a && !a.disabled) { add(a.getAttribute("data-add")); closeDetail(); return; }
    const th = t.closest("[data-thumb]"); if (th) { const m = $("#detailMain"); if (m) m.src = th.getAttribute("data-thumb"); $$("#detailModal [data-thumb]").forEach((x) => x.classList.remove("is-active")); th.classList.add("is-active"); return; }
    const dq = t.closest("[data-detqty]"); if (dq) { const el = $("#detQty"); let q = (parseInt(el.textContent) || 1) + parseInt(dq.getAttribute("data-detqty")); el.textContent = Math.max(1, Math.min(q, detailStock || 1)); return; }
    if (t.closest("#detailAdd")) { const q = parseInt(($("#detQty") || {}).textContent) || 1; add(detailPid, q); closeDetail(); return; }
    const det = t.closest("[data-detail]"); if (det) { openDetail(det.getAttribute("data-detail")); return; }
    const inc = t.closest("[data-inc]"); if (inc) { const id = inc.getAttribute("data-inc"); setQty(id, (cart[id] || 0) + 1); return; }
    const dec = t.closest("[data-dec]"); if (dec) { const id = dec.getAttribute("data-dec"); setQty(id, (cart[id] || 0) - 1); return; }
    const rm = t.closest("[data-rm]"); if (rm) { setQty(rm.getAttribute("data-rm"), 0); return; }
    const vs = t.closest("[data-ver-sillas]"); if (vs) { applyFilter(vs.getAttribute("data-ver-sillas")); return; }
    // cerrar menú de cuenta al hacer clic fuera
    if (!t.closest("#accountMenu") && !t.closest("#accountBtn")) $("#accountMenu").hidden = true;
  });

  $("#shopFilters").addEventListener("click", (e) => {
    const t = e.target.closest("[data-cat]");
    if (t) { fCat = t.dataset.cat; buildFilters(); applyFilters(); }
  });
  $("#shopFilters").addEventListener("change", (e) => {
    if (e.target.matches("[data-brand]")) {
      const b = e.target.getAttribute("data-brand");
      if (e.target.checked) fBrands.add(b); else fBrands.delete(b);
      applyFilters();
    } else if (e.target.matches("[data-price]")) {
      fPrice = e.target.getAttribute("data-price"); applyFilters();
    }
  });
  $("#sortSelect").addEventListener("change", (e) => { fSort = e.target.value; applyFilters(); });
  $("#filtersToggle").addEventListener("click", () => $("#filtersBody").classList.toggle("is-open"));

  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  $("#cartEmptyShop").addEventListener("click", closeCart);
  $("#goCheckout").addEventListener("click", goCheckout);
  $("#detailClose").addEventListener("click", closeDetail);
  $("#detailModal").addEventListener("click", (e) => { if (e.target.id === "detailModal") closeDetail(); });
  $("#closeCheckout").addEventListener("click", closeCheckout);
  $("#payWhatsapp").addEventListener("click", sendWhatsAppOrder);
  $("#payCard").addEventListener("click", async () => {
    const form = $("#checkoutForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const ok = await registerOrder(form);
    if (!ok) return;
    try {
      const r = await DB.crearPago({ items: cartList().map(({ id, qty }) => ({ id, qty })), total: total(), customer: customerData(form) });
      if (r && r.url) { window.location.href = r.url; }
      else toast("No se pudo iniciar el pago. Intenta por WhatsApp.");
    } catch (e) {
      toast("El pago con tarjeta aún no está configurado (ver PAGOS.md).");
    }
  });
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
  $("#finderForm").addEventListener("input", updateFinderProgress);
  $("#finderForm").addEventListener("change", updateFinderProgress);

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
  document.title = `${CONFIG.nombre} ${CONFIG.eslogan} | Sillas de carro y seguridad infantil`;
  DB.init();
  renderServices();
  renderTestimonios();
  fillContact();
  setupAppointmentPlanner();
  loadProducts();
  maybeShowPopup();
  updateFinderProgress();
  setupScrollProgress();
  setupReveal();
  setupHeroSlider();
  setupChat();
  setupFloatingWhatsApp();
  if (DB.ready) {
    refreshAuthUI();
    DB.onAuthChange(async () => { await refreshAuthUI(); });
  } else {
    // modo demo: mostrar aviso en el botón de cuenta
    $("#accountLabel").textContent = "Ingresar";
  }
})();
