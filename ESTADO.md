# 📋 ESTADO DEL PROYECTO — Car Seat Clinic Center

> Documento de progreso para humanos y para cualquier IA que continúe el
> proyecto (Claude, Codex, Antigravity…). **Léelo junto con [AGENTS.md](AGENTS.md).**
> Mantenlo actualizado al terminar cada tanda de trabajo.
> Última actualización: ver historial de git.

Web en vivo: https://lulago3003.github.io/carseatclinicc/ · Repo: `Lulago3003/carseatclinicc`
Supabase ref: `fahqjwnwoznaerrwgdmc` · WhatsApp real: 6674-3012 · Acceso panel de prueba: `admin` / `admin`

---

## ✅ HECHO

**Tienda**
- [x] Tarjetas de producto premium: primera tarjeta destacada, miniaturas visibles, contador de fotos, respaldo visual y animaciones.
- [x] Catálogo desde Supabase (29 productos del inventario real: nombre, marca, stock, categoría, descripción, características).
- [x] Fotos reales alojadas en el repo (`assets/productos/`, rutas relativas) + galerías por producto.
- [x] Categorías: recién nacidos, convertibles, 360°, combinadas, booster, accesorios, limpieza, gift cards.
- [x] Filtros (tipo / marca / precio) + orden + contador.
- [x] Ficha de producto: galería con miniaturas, cantidad, miga de pan, características.
- [x] "Encuentra tu silla ideal" (cuestionario que recomienda silla).
- [x] Carrito persistente + checkout. Login obligatorio para comprar.
- [x] Precios en modo "Consultar / Cotizar por WhatsApp" + etiqueta de descuento "-X%" automática.

**Confianza / contenido**
- [x] Hero con carrusel de fotos (rota cada 4s, clickeable).
- [x] 3 pilares, Servicios, Recursos de seguridad, Testimonios (de ejemplo), Nosotros.
- [x] Reserva de cita (por WhatsApp), Newsletter (footer + pop-up).
- [x] Contacto + mapa + **QR de Waze** ("cómo llegar").

**Cuenta / auth**
- [x] Registro e inicio de sesión (correo + Google). `is_admin()` por correo.
- [x] Acceso admin de prueba: `admin/admin` (entra directo al CRM).

**CRM (panel `admin.html`) "Centro de control"**
- [x] Dashboard (resumen), Productos (lista + editor con varias fotos, características, stock), buscador, filtros.
- [x] Pedidos con estados (nuevo → pagado → listo para instalar…) y contacto por WhatsApp.
- [x] Conversaciones del chat (ver abajo).

**Asistente con IA (estructura)**
- [x] Chat flotante en la web con asistente inteligente local: responde dudas comunes, pide datos si faltan y ofrece WhatsApp cuando hace falta asesor. (Guía: `CHATBOT.md`)
- [x] Edge Function `asistente` (llama a Claude; clave secreta en Supabase).
- [x] Pestaña "Conversaciones" en el CRM.

**Pago (estructura)**
- [x] Botón "Pagar con tarjeta" (oculto hasta activarlo) + Edge Function `crear-pago`. (Guía: `PAGOS.md`)

**Técnico**
- [x] Animaciones (aparición al scroll, hero, barra de progreso) que respetan "reducir movimiento".
- [x] Responsive (PC / iPhone / Android) + modo claro forzado (`color-scheme: light`).
- [x] Rutas de imágenes relativas → portable a dominio propio sin romperse.
- [x] Scripts de verificación: `scripts/site-experience-check.mjs`, `scripts/admin-crm-check.mjs`.
- [x] Documentación para IAs: `AGENTS.md`, `CLAUDE.md`, `ESTADO.md`.

---

## ⬜ PENDIENTE — requiere ACCIÓN/CONTENIDO del dueño

- [ ] **Correr SQL pendientes en Supabase** (pegar y Run):
      `supabase-inventario.sql` (deja las fotos en rutas relativas) y
      `supabase-chat.sql` (tabla de conversaciones).
- [ ] **Activar pago** (BAC/Tilopay): cuenta de comercio → `supabase secrets set …`
      → `supabase functions deploy crear-pago` → `CONFIG.pago.activo=true`. Ver `PAGOS.md`.
- [ ] **Activar IA del chat**: API key de Anthropic → secret → `deploy asistente`. Ver `CHATBOT.md`.
- [ ] **Precios reales**: ponerlos en el panel (hoy dice "Consultar").
- [ ] **Corregir fotos mal asignadas**: el .docx ancla imágenes fuera de orden, algunas no son el modelo exacto → ajustar por producto en el CRM.
- [ ] **Testimonios reales** (reemplazar los de ejemplo en `js/data.js` → `TESTIMONIOS`).
- [ ] **Historia + foto de la fundadora/equipo** y **certificación CPST visible**.
- [ ] **Dirección exacta** del local → `CONFIG.mapsQuery` y `CONFIG.wazeUrl`.

## ⬜ PENDIENTE — antes de LANZAR al público

- [ ] **Asegurar el admin**: cambiar `admin/admin` (visible en el código) por algo fuerte.
- [x] **Páginas legales**: `terminos.html` y `privacidad.html` (enlazadas en el footer). ✅
- [x] **SEO + Open Graph**: meta tags + Twitter card + canonical + theme-color en index. ✅
- [ ] **Dominio + hosting**: comprar dominio en Cloudflare → publicar en **Cloudflare Pages** (gratis) → conectar dominio.
- [ ] **Correo con dominio**: Cloudflare Email Routing (recibir) + Zoho/Google Workspace (enviar).
- [ ] **Analítica** (Google Analytics o Meta Pixel).

## ⬜ MEJORAS opcionales (cuando haya tiempo)

- [ ] Blog / más recursos de seguridad (contenido educativo).
- [ ] Reserva de citas con calendario real (hoy es por WhatsApp).
- [ ] Categoría "Juguetes/Regalos" (hoy los kits están como "Accesorio").
- [x] Pop-up del newsletter menos intrusivo (16s y no sale sobre ventanas abiertas). ✅
- [ ] Feed de Instagram embebido.

---

## 🛠️ Notas para quien continúe

- **Todo lo editable** del negocio está en `js/data.js` (CONFIG, SERVICIOS, TESTIMONIOS, IMAGENES_CATEGORIA, pago, wazeUrl).
- **Cambios de datos/tablas en Supabase** se entregan como `.sql` para que el dueño los pegue (la IA no puede ejecutarlos).
- **Probar siempre en incógnito** (la caché del navegador es agresiva con el JS/CSS).
- **Al terminar:** `git add . && git commit && git push` y **actualizar este archivo**.
