/* =====================================================================
   Car Seat Clinic — Piezas compartidas de todas las páginas
   ---------------------------------------------------------------------
   Este archivo inserta, en TODAS las páginas, las ventanas y botones que
   antes estaban copiados dentro de index.html: el carrito, el checkout,
   la ficha de producto, el login, el pop-up del boletín, el botón de
   WhatsApp, la barra del comparador y el aviso flotante.

   Así el carrito funciona igual en Inicio, Tienda, Alquiler y Servicios,
   y solo hay que tocar UN archivo para cambiarlos.

   Se carga ANTES de js/store.js para que los elementos ya existan.
   (No necesitas editar este archivo.)
   ===================================================================== */

(function () {
  "use strict";

  if (document.getElementById("cscShell")) return;

  // La novedad destacada se llena después desde store.js. Se crea aquí para
  // que pueda aparecer igual en Inicio, Tienda, Alquiler, Servicios y FAQ.
  const instagramNotice = document.createElement("section");
  instagramNotice.id = "instagramNotice";
  instagramNotice.className = "instagram-notice";
  instagramNotice.hidden = true;
  instagramNotice.setAttribute("aria-live", "polite");
  const pageHeader = document.querySelector("header");
  if (pageHeader) pageHeader.insertAdjacentElement("afterend", instagramNotice);

  const shell = document.createElement("div");
  shell.id = "cscShell";
  shell.innerHTML = `
  <!-- ===================== CARRITO (PANEL LATERAL) ===================== -->
  <div class="overlay" id="overlay"></div>
  <aside class="cart" id="cart" aria-hidden="true" aria-label="Carrito de compras">
    <div class="cart__head">
      <h3>Tu carrito</h3>
      <button class="icon-btn" id="closeCart" aria-label="Cerrar carrito">&#10005;</button>
    </div>
    <div class="cart__items" id="cartItems"></div>
    <div class="cart__empty" id="cartEmpty">
      <span aria-hidden="true">&#128722;</span>
      <p>Tu carrito está vacío</p>
      <a href="tienda.html" class="btn btn--ghost" id="cartEmptyShop">Ver productos</a>
    </div>
    <div class="cart__foot" id="cartFoot">
      <div class="cart__total"><span>Total</span><strong id="cartTotal">$0</strong></div>
      <button class="btn btn--primary btn--block" id="goCheckout">Finalizar compra</button>
      <p class="cart__note">Confirmamos precio y disponibilidad por WhatsApp antes de cobrar.</p>
    </div>
  </aside>

  <!-- ===================== CHECKOUT (VENTANA) ===================== -->
  <div class="modal" id="checkoutModal" aria-hidden="true">
    <div class="modal__box">
      <button class="icon-btn modal__close" id="closeCheckout" aria-label="Cerrar">&#10005;</button>
      <h3 id="checkoutTitle">Finalizar pedido</h3>
      <p class="modal__sub" id="checkoutSub">Completa tus datos y te abrimos WhatsApp con el pedido listo.</p>

      <ol class="checkout__steps" aria-hidden="true">
        <li class="is-done">Carrito</li>
        <li class="is-active">Tus datos</li>
        <li>WhatsApp</li>
      </ol>

      <form class="checkout__form" id="checkoutForm">
        <div class="field-row">
          <label>Nombre y apellido <input type="text" name="nombre" required placeholder="Ej. María Pérez" autocomplete="name" /></label>
          <label>Teléfono / WhatsApp <input type="tel" name="telefono" required placeholder="Ej. 6000-0000" autocomplete="tel" /></label>
        </div>
        <label>Correo electrónico <input type="email" name="email" placeholder="tucorreo@email.com" autocomplete="email" /></label>
        <label>Dirección de entrega <input type="text" name="direccion" required placeholder="Provincia, distrito, calle..." autocomplete="street-address" /></label>
        <label>Notas (opcional) <input type="text" name="notas" placeholder="Referencias, horario de entrega, modelo de auto..." /></label>
        <label class="check-inline"><input type="checkbox" name="instalacion" /> Agregar instalación profesional (te la cotizamos)</label>
        <label class="check-inline"><input type="checkbox" name="entrega" /> Prefiero entrega a domicilio (si no, retiro en tienda)</label>
      </form>

      <div class="checkout__summary">
        <div class="checkout__line"><span>Productos</span><span id="ckCount">0</span></div>
        <div class="checkout__line checkout__line--total"><span>Total</span><strong id="ckTotal">$0</strong></div>
      </div>

      <div class="checkout__pay">
        <div id="paypal-container"></div>
        <button class="btn btn--primary btn--block" id="payCard" style="display:none">Pagar con tarjeta</button>
        <button class="btn btn--whatsapp btn--block" id="payWhatsapp">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-10.8 6.7L4 19.5l1.3-4.1A7.5 7.5 0 1 1 20 11.5z"/><path d="M9 10.5c.6 2 2 3.4 4 4l1.3-1.1 2 .5c.2.1.4.3.4.5v1.2c0 .3-.2.5-.5.6-4.3.7-8.1-3-8.4-7.2 0-.3.2-.5.5-.5h1.2c.2 0 .4.1.5.4l.5 1.6L9 10.5z"/></svg>
          Enviar pedido por WhatsApp
        </button>
        <p class="checkout__note" id="payNote">Te responde una persona real y coordinamos el pago y la entrega.</p>
      </div>
    </div>
  </div>

  <!-- ===================== FICHA DE PRODUCTO (VENTANA) ===================== -->
  <div class="modal" id="detailModal" aria-hidden="true">
    <div class="modal__box modal__box--lg">
      <button class="icon-btn modal__close" id="detailClose" aria-label="Cerrar">&#10005;</button>
      <div class="detail" id="detailBody"></div>
    </div>
  </div>

  <!-- ===================== LOGIN / REGISTRO (VENTANA) ===================== -->
  <div class="modal" id="authModal" aria-hidden="true">
    <div class="modal__box modal__box--sm">
      <button class="icon-btn modal__close" id="closeAuth" aria-label="Cerrar">&#10005;</button>
      <h3 id="authTitle">Iniciar sesión</h3>
      <p class="modal__sub" id="authSub">Ingresa para comprar y ver tus pedidos.</p>

      <button class="btn btn--google btn--block" id="googleBtn">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9 40.4 15.9 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.6 35.7 44 30.4 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
        Continuar con Google
      </button>

      <div class="auth-divider"><span>o con tu correo</span></div>

      <form class="auth-form" id="authForm">
        <label id="nameField" style="display:none">Nombre completo
          <input type="text" name="nombre" placeholder="Tu nombre" autocomplete="name" />
        </label>
        <label>Correo electrónico
          <input type="text" inputmode="email" name="email" required placeholder="tucorreo@email.com" autocomplete="email" />
        </label>
        <label>Contraseña
          <input type="password" name="password" required placeholder="Tu contraseña" autocomplete="current-password" />
        </label>
        <div id="regExtra" style="display:none">
          <label>Teléfono / WhatsApp <input type="tel" name="telefono" placeholder="6000-0000" /></label>
          <label>Edad del niño (opcional) <input type="text" name="edadnino" placeholder="Ej. 2 años" /></label>
          <label class="check-inline"><input type="checkbox" name="tyc" /> Acepto los términos y la política de privacidad</label>
          <label class="check-inline"><input type="checkbox" name="promos" checked /> Quiero recibir promociones y novedades</label>
        </div>
        <button type="submit" class="btn btn--primary btn--block" id="authSubmit">Ingresar</button>
        <p class="auth-error" id="authError"></p>
      </form>

      <p class="auth-switch">
        <span id="authSwitchText">¿No tienes cuenta?</span>
        <a href="#" id="authSwitch">Regístrate</a>
      </p>
      <p class="checkout__note" id="authDemoNote" style="display:none">
        Modo demo: el login se activa al conectar la base de datos.
      </p>
    </div>
  </div>

  <!-- Menú de cuenta (cuando hay sesión) -->
  <div class="account-menu" id="accountMenu" hidden>
    <div class="account-menu__head" id="accountMenuName"></div>
    <a href="#" id="myOrdersBtn">Mis pedidos</a>
    <a href="admin.html" id="accountAdmin" style="display:none">Administrar tienda</a>
    <a href="#" id="logoutBtn">Cerrar sesión</a>
  </div>

  <!-- Pop-up del boletín (no invasivo) -->
  <div class="np" id="newsletterPopup" hidden>
    <button class="np__close" id="npClose" aria-label="Cerrar">&#10005;</button>
    <h4>Únete a la comunidad</h4>
    <p>Promociones, consejos de seguridad y novedades para tu familia.</p>
    <form class="np__form" id="npForm">
      <input type="email" name="email" placeholder="Tu correo" required />
      <button class="btn btn--primary" type="submit">Suscribirme</button>
    </form>
  </div>

  <!-- Botón flotante de WhatsApp -->
  <a class="float-whatsapp" id="floatWhatsBtn" href="#" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp" data-whatsapp-label="WhatsApp">
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 11.5a7.5 7.5 0 0 1-10.8 6.7L4 19.5l1.3-4.1A7.5 7.5 0 1 1 20 11.5z"/>
      <path d="M9 10.5c.6 2 2 3.4 4 4l1.3-1.1 2 .5c.2.1.4.3.4.5v1.2c0 .3-.2.5-.5.6-4.3.7-8.1-3-8.4-7.2 0-.3.2-.5.5-.5h1.2c.2 0 .4.1.5.4l.5 1.6L9 10.5z"/>
    </svg>
    <span>WhatsApp</span>
  </a>

  <!-- Asistente / chat -->
  <div class="chat" id="chatWidget">
    <button class="chat__launch" id="chatLaunch" aria-label="Abrir asistente">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8 8 0 0 1-11.5 7.2L4 20.5l1.3-4.1A8 8 0 1 1 21 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>
      <span>Asistente</span>
    </button>
    <div class="chat__panel" id="chatPanel" hidden>
      <div class="chat__head">
        <div><strong>Asistente Car Seat</strong><small>Seguridad infantil · te ayudamos</small></div>
        <button class="chat__close" id="chatClose" aria-label="Cerrar">&#10005;</button>
      </div>
      <div class="chat__msgs" id="chatMsgs"></div>
      <form class="chat__form" id="chatForm">
        <input id="chatInput" placeholder="Ej: niña de 5 años, peso 20 kg…" autocomplete="off" />
        <button type="submit" aria-label="Enviar">&#10148;</button>
      </form>
    </div>
  </div>

  <!-- Barra flotante del comparador de sillas -->
  <div class="cmpbar" id="compareBar" hidden>
    <div class="cmpbar__items" id="compareBarItems"></div>
    <button class="cmpbar__go" id="compareGo" type="button">Comparar</button>
    <button class="cmpbar__clear" id="compareClear" type="button" aria-label="Vaciar comparador">Limpiar</button>
  </div>

  <!-- Aviso flotante -->
  <div class="toast" id="toast"></div>
  `;

  document.body.appendChild(shell);

  /* --- Menú móvil (funciona en todas las páginas) --- */
  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("#navToggle");
    const nav = document.getElementById("nav");
    if (!nav) return;
    if (toggle) {
      const abierto = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", abierto);
      toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
      return;
    }
    // Cerrar al tocar un enlace o fuera del menú
    if (e.target.closest("#nav a") || !e.target.closest("#nav")) {
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      document.getElementById("navToggle")?.setAttribute("aria-expanded", "false");
    }
  });

  /* --- Encabezado con sombra al bajar --- */
  const header = document.getElementById("header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Marca la pestaña actual en el menú --- */
  const archivo = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("#nav a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    // Los enlaces a una sección (con #) no marcan pestaña: "Contacto" no es
    // la página actual solo por vivir dentro de Inicio.
    if (href.includes("#")) return;
    const destino = (href.split("?")[0] || "index.html").toLowerCase();
    if (destino === archivo) { a.classList.add("is-current"); a.setAttribute("aria-current", "page"); }
  });
})();
