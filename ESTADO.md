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
- [x] **Pagina de servicios aparte** (`servicios.html`): Venta, Alquiler (estilo reserva de hotel) y Limpieza en grande, con fotos y secciones alternadas. En la home, **Servicios** son 3 tarjetas grandes con foto que llevan a esa pagina (`servicios.html#venta/#alquiler/#limpieza`). JS ligero propio en `js/servicios.js` (menu movil, enlaces WhatsApp, comparador).
- [x] Seccion **Limpieza: antes y despues** con comparador deslizable (imagen sucia -> limpia) en `servicios.html`: se autoanima al entrar en pantalla, se arrastra con mouse/dedo, soporta teclado y respeta "reducir movimiento". Imagenes en `assets/limpieza/`.
- [x] Orden de la home (optimizado con CRO): Hero -> Franja de confianza -> Catalogo -> Encuentra tu silla -> Ruta segura -> Servicios (tarjetas) -> Nosotros -> Testimonios -> Cita -> Contacto. Fondos beige/blanco alternados. Quitado el "1:1" confuso del hero. Se elimino "Proceso simple" (journey) por redundante.
- [x] **Página de Preguntas Frecuentes** (`faq.html`): acordeón con 15 preguntas en 4 grupos (productos/compra, envíos/pagos, servicios, seguridad), enlazada en el menú (FAQ) y los pies de página. Usa `<details>` nativo + chat IA. Refuerza la info que da el asistente.
- [x] Los "3 pilares" (Seguridad infantil, simple y clara) se movieron de la home a `servicios.html` (antes del CTA final), con enlaces arreglados: test -> `index.html#encuentra`, "Aprende lo que importa" -> WhatsApp (antes apuntaba a Recursos, ya oculto), ayuda -> `index.html#citas`. Quitado el texto "1:1". Se quito "Recursos" del menu en ambas paginas.
- [x] **Alquiler para viajes** y **Recursos de seguridad** estan OCULTAS en la home (guardadas como comentario `GUARDADO ... FIN GUARDADO` en `index.html`, faciles de reactivar). El alquiler completo sigue en `servicios.html`. Se quito el enlace "Recursos" del menu.
- [x] "Ruta segura" rediseñada limpia: 4 tarjetas alineadas (Paso 1-4: Diagnostico, Compatibilidad, Instalacion, Seguimiento) con icono + etiqueta + titulo + texto, sobre banda verde. Clases `.route-steps`/`.rstep` (se quitaron las `.route-card` recargadas con destellos/lineas).
- [x] Reserva de cita (por WhatsApp), Newsletter (footer + pop-up).
- [x] Seccion **Alquiler para viajes** inspirada en flujo tipo reserva: imagen real, pasos, CTA y formulario con equipo, fecha de entrega, devolucion, entrega, recogida, edad/peso e instalacion opcional.
- [x] Contacto + mapa + **QR de Waze** ("cómo llegar").

**Cuenta / auth**
- [x] Registro e inicio de sesión (correo + Google). `is_admin()` por correo.
- [x] Acceso admin de prueba: `admin/admin` (entra directo al CRM).

**CRM (panel `admin.html`) "Centro de control"**
- [x] Dashboard (resumen), Productos (lista + editor con varias fotos, características, stock), buscador, filtros.
- [x] Pedidos con estados (nuevo → pagado → listo para instalar…) y contacto por WhatsApp.
- [x] Conversaciones del chat (ver abajo).
- [x] Nueva pestaña **Agenda IA**: calendario de solicitudes, filtros por tipo/estado, tarjetas de casos, cambio de estado, resumen copiable y botón de WhatsApp.
- [x] Captura de leads/casos en `crm_leads`: citas, reservas sugeridas, consultas de IA, revisión de silla, lavado, instalación y cotización. Funciona con Supabase si se corre `supabase-crm-atencion.sql` y se activa `CONFIG.crm.guardarSolicitudes=true`; mientras tanto usa `localStorage`.
- [x] CRM reconoce solicitudes de **alquiler** como tipo propio: badge, dias, equipo, entrega, devolucion, recogida, edad/peso y resumen listo para WhatsApp.

**Asistente con IA (estructura)**
- [x] Chat flotante en la web con asistente inteligente local: responde dudas comunes, pide datos si faltan y ofrece WhatsApp cuando hace falta asesor. (Guía: `CHATBOT.md`)
- [x] Motor local en `js/chat-assistant.js`: entiende silla ideal, precio, instalación/servicios, choque, saludo, lavado, revisión de vencimiento/uso y reservas; orienta por edad/peso/estatura y no inventa precios. **Ampliado**: horario, ubicación, envíos, formas de pago, garantía/marcas, cómo instalar (ISOFIX/contramarcha) y agradecimientos. Usa datos de CONFIG (horario, ubicación) via `ctx`.
- [x] El asistente entiende alquiler/renta y pide datos de reserva: equipo, fechas, entrega, recogida, edad/peso y si necesita instalacion.
- [x] Acciones dentro del chat: reservar horario, guardar caso/consulta en CRM y continuar por WhatsApp cuando la IA tiene dudas o requiere asesor.
- [x] Interruptor del CRM inteligente en `js/data.js` → `CONFIG.crm.guardarSolicitudes=false` mientras no esté corrida la tabla `crm_leads`.
- [x] **IA activada**: `CONFIG.chat.iaActiva=true`, `guardarConversaciones=true`, `crm.guardarSolicitudes=true`. Tablas `conversaciones` y `crm_leads` creadas en Supabase.
- [x] **Chat en TODAS las páginas**: extraído a `js/chat-widget.js` (autocontenido, se auto-inicia). Está en `index.html`, `servicios.html`, `terminos.html` y `privacidad.html`. La copia vieja en `store.js` quedó como obsoleta (no se llama). Nota: `DB` es `const` (no `window.DB`); el módulo lo referencia directo.
- [x] La Edge Function quedó desplegada como **`super-api`** (no `asistente`). El sitio ya apunta ahí via `CONFIG.chat.funcion="super-api"`. La función soporta **Groq / Gemini / Claude** (usa el secret que exista, en ese orden).
- [ ] **Pendiente del dueño**: la llave de **Gemini da 0 cuota gratis** (limit:0, no disponible en su región). Solución: sacar llave gratis en console.groq.com/keys, agregar secret `GROQ_API_KEY` y redeploy de `super-api` con el código nuevo. Mientras tanto el chat usa el asistente local.
- [x] Prueba automática del asistente: `scripts/chat-assistant-check.mjs`; el chequeo general `scripts/site-experience-check.mjs` ya valida que el chat inteligente esté conectado.
- [x] Edge Function `asistente` soporta **Gemini (gratis)** o Claude (de pago): usa `GEMINI_API_KEY` si existe, si no `ANTHROPIC_API_KEY`. Para activar gratis: llave en aistudio.google.com/apikey -> `supabase secrets set GEMINI_API_KEY=...` -> `supabase functions deploy asistente` -> `CONFIG.chat.iaActiva=true`.
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
      `supabase-chat.sql` (tabla de conversaciones) y
      `supabase-crm-atencion.sql` (agenda/casos del CRM inteligente).
- [ ] **Activar pago** (BAC/Tilopay): cuenta de comercio → `supabase secrets set …`
      → `supabase functions deploy crear-pago` → `CONFIG.pago.activo=true`. Ver `PAGOS.md`.
- [ ] **Activar IA del chat**: API key de Anthropic → secret → `deploy asistente`. Ver `CHATBOT.md`.
- [ ] **Precios reales**: ponerlos en el panel (hoy dice "Consultar").
- [ ] **Corregir fotos mal asignadas**: el .docx ancla imágenes fuera de orden, algunas no son el modelo exacto → ajustar por producto en el CRM.
- [x] **Testimonios reales**: 3 reseñas reales de Google (Ivohne Jensen, Ana María Paredes, Gianfranco Lo Medico) en `js/data.js` → `TESTIMONIOS`.
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
- [x] Reserva de citas con calendario visual y guardado en CRM/WhatsApp.
- [ ] Categoría "Juguetes/Regalos" (hoy los kits están como "Accesorio").
- [x] Pop-up del newsletter menos intrusivo (16s y no sale sobre ventanas abiertas). ✅
- [ ] Feed de Instagram embebido.

---

## 🛠️ Notas para quien continúe

- **Todo lo editable** del negocio está en `js/data.js` (CONFIG, SERVICIOS, TESTIMONIOS, IMAGENES_CATEGORIA, pago, wazeUrl).
- **Chat actual:** funciona con respuestas inteligentes locales aunque la IA externa no esté activa. Para activar IA real: correr `supabase-chat.sql`, desplegar `supabase/functions/asistente`, guardar `ANTHROPIC_API_KEY` en Supabase y cambiar `CONFIG.chat.iaActiva=true` / `guardarConversaciones=true`.
- **Cambios de datos/tablas en Supabase** se entregan como `.sql` para que el dueño los pegue (la IA no puede ejecutarlos).
- **Probar siempre en incógnito** (la caché del navegador es agresiva con el JS/CSS).
- **Al terminar:** `git add . && git commit && git push` y **actualizar este archivo**.
