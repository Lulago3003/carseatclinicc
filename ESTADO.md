# 📋 ESTADO DEL PROYECTO — Car Seat Clinic Center

> Documento de progreso para humanos y para cualquier IA que continúe el
> proyecto (Claude, Codex, Antigravity…). **Léelo junto con [AGENTS.md](AGENTS.md).**
> Mantenlo actualizado al terminar cada tanda de trabajo.
> Última actualización: ver historial de git.

Web en vivo: https://lulago3003.github.io/carseatclinicc/ · Repo: `Lulago3003/carseatclinicc`
Supabase ref: `fahqjwnwoznaerrwgdmc` · WhatsApp real: 6674-3012

> ⚠️ **PRIMERO QUE TODO:** corre en Supabase → SQL Editor los archivos
> `supabase-admin.sql` (cierra el panel) y `supabase-limpiar-pruebas.sql`
> (borra unas solicitudes de prueba del CRM). Ver la sección de abajo.

---

## 🆕 REESTRUCTURACIÓN (julio 2026)

- [x] **El sitio ahora tiene pestañas de verdad**: Inicio · Tienda · Alquiler ·
      Servicios · Preguntas · Contacto, iguales en todas las páginas.
- [x] **`tienda.html` (nueva)**: el catálogo completo (filtros, buscador, orden,
      ficha, comparador y carrito) salió de la portada y vive aquí. Acepta
      `tienda.html?cat=booster` para llegar ya filtrado.
- [x] **`alquiler.html` (nueva)**: el alquiler **ya no está en la página de
      comprar**. Tiene su propia página con equipo disponible, cómo funciona,
      calendario de fechas, formulario de reserva y preguntas del alquiler.
      Desde la ficha de una silla, "Alquilar" lleva aquí con el modelo ya puesto
      (`alquiler.html?modelo=...&equipo=...`).
- [x] **`index.html` es ahora la portada**: hero, confianza, 4 destacados que
      llevan a la tienda, guía por etapas, test, ruta segura, servicios,
      nosotros, testimonios, cita y contacto.
- [x] **`servicios.html`**: se le quitó el alquiler (ahora enlaza a su página) y
      se le agregó **Revisión de seguridad**.
- [x] **Checkout que termina en WhatsApp**: el cliente agrega al carrito, pulsa
      finalizar, llena nombre/teléfono/dirección/notas y el pedido completo se
      abre en WhatsApp listo para enviar. Funciona igual si los precios están en
      "Consultar" (manda una cotización). El botón de pago con tarjeta sigue
      oculto tras `CONFIG.pago.activo` para cuando haya pasarela.
- [x] **`js/shell.js` (nuevo)**: el carrito, el checkout, la ficha, el login, el
      chat y los botones flotantes se insertan solos en todas las páginas. Ya no
      están copiados en cada HTML → el carrito funciona en todo el sitio.
- [x] **`scripts/sync-layout.mjs` (nuevo)**: copia el menú y el pie a las 7
      páginas de una vez, y pone `?v=fecha` a css/js para vencer la caché.
- [x] **`scripts/site-check.mjs` (nuevo)**: avisa si un menú quedó distinto,
      falta un script o hay un enlace/ancla roto.
- [x] **Rediseño visual**: encabezado tipo pestañas que ya no se amontona (pasa a
      menú hamburguesa desde 1000px), pie de página de 4 columnas con las dos
      cuentas de Instagram, portadas propias para Tienda y Alquiler, tarjetas de
      equipo, pasos "cómo funciona" y calendario de alquiler a tamaño normal.

- [x] **Sección de Instagram en la portada**: "Lo último que publicamos" con las
      publicaciones de la cuenta **oficial @carseatclinicc**, debajo de la franja
      de confianza. Cabecera tipo perfil (foto, arroba, botón Seguir) + tarjetas
      con la publicación real incrustada. En teléfono es un riel que se desliza
      de lado. Se edita pegando enlaces en `js/data.js` → `INSTAGRAM.publicaciones`;
      con la lista vacía se convierte sola en "Síguenos en Instagram".

- [x] **Mejoras de diseño (julio 2026)**, medidas en teléfono de 375px:
      (1) **Pop-up del boletín**: antes salía a los 16 s y tapaba el 40% de la
      pantalla (los botones del hero, el contacto, los filtros). Ahora aparece
      solo cuando la persona ya bajó más de media página, es una franja
      compacta ARRIBA del asistente y del WhatsApp, no sale si hay una ventana
      abierta o si está comparando sillas, y se retira sola al llegar al
      formulario del pie (no ofrece lo mismo dos veces).
      (2) **Catálogo a 2 columnas**: estaba a 1 sola y cada tarjeta medía
      ~800px, o sea ~20.000px de scroll para 26 productos. Ahora la tarjeta
      mide 414px. En la tarjeta angosta se ocultan descripción, categoría y
      "recomendado para" (se ven en la ficha) y el botón de texto baja a su
      propia línea para no pisar el precio.
      (3) **Portada más corta**: de 15.698px a ~14.100px. Guía por etapas y
      ruta segura se quedan en 2 columnas (la tarjeta de ruta pasa a vertical
      para que no se salgan los títulos) y las tarjetas de servicio bajan de
      300 a 210px.
      (4) **Sin jerga interna**: se quitaron "Foto editable", "Galería
      disponible" y "Compatibilidad guiada" de las tarjetas (eran notas del
      proyecto, no info para la clienta).
      (5) **Emojis a íconos SVG**: carrito, calendario, comparar, WhatsApp y
      check ahora usan el mismo set de líneas del resto del sitio, en vez de
      emojis que cambian de forma según el teléfono.
      (6) **Sin destacado arbitrario**: el primer producto ocupaba doble ancho
      solo por salir primero, no por ser un destacado real.

### ⬜ Pendiente de esta tanda
- [ ] **Enlaces de las publicaciones de @carseatclinicc**: pegar de 3 a 6 en
      `js/data.js` → `INSTAGRAM.publicaciones` para que la sección muestre el
      contenido real. Mientras tanto se ve la invitación a seguir la cuenta.
- [ ] **Historias (stories)**: no salen sin la API Graph de Meta (cuenta de
      empresa + app + token renovable). Decidir si vale la pena montarlo.

- [x] **Asistente local mucho más completo** (`js/chat-assistant.js`), **sin
      ningún costo** (sigue siendo 100% local, no llama a ninguna IA de pago).
      Entiende 5 temas nuevos: alquiler de equipo (coche/corral/cuna, distinto
      de comprar en la tienda), "¿me conviene comprar o alquilar?", "¿cuándo
      cambio de silla?", regalos/gift cards, y preguntas sobre Instagram
      (menciona las dos cuentas). Los rangos de peso/edad que usa ahora son
      los mismos números que la guía por etapas y el test de la portada, para
      que nunca se contradigan entre sí.
- [x] **Arreglados 2 bugs reales que dejó la reestructuración en páginas**: el
      botón "Reservar horario" del chat, cuando la duda era de alquiler,
      llevaba al formulario de citas del Inicio en vez de a `alquiler.html`
      (y viceversa: una duda de instalación en `alquiler.html` intentaba usar
      el selector de esa página, que solo tiene la opción "Alquiler"). El
      botón "Ver catálogo" del chat todavía apuntaba a `index.html#productos`,
      una sección que ya no existe ahí (el catálogo vive en `tienda.html`).
      Los tres casos ya redirigen a la página correcta.

---

## ✅ HECHO

**Tienda**
- [x] Tarjetas de producto: miniaturas visibles, contador de fotos, respaldo visual y animaciones. (El "destacado" de doble ancho se quitó: dependía del orden, no de una decisión real.)
- [x] Catálogo desde Supabase (29 productos del inventario real: nombre, marca, stock, categoría, descripción, características).
- [x] Fotos reales alojadas en el repo (`assets/productos/`, rutas relativas) + galerías por producto.
- [x] Categorías: recién nacidos, convertibles, 360°, combinadas, booster, accesorios, limpieza, gift cards.
- [x] Filtros (tipo / marca / precio) + orden + contador.
- [x] Ficha de producto: galería con miniaturas, cantidad, miga de pan, características.
- [x] "Encuentra tu silla ideal" (cuestionario que recomienda silla).
- [x] Carrito persistente + checkout **sin registro obligatorio**: se compra con
      nombre y teléfono y el pedido se manda por WhatsApp. Quien ya tiene cuenta
      la sigue usando para ver sus pedidos.
- [x] **Carrito de cotización**: ahora se puede **agregar al carrito cualquier producto aunque diga "Consultar"** (sin precio). El carrito muestra "Consultar"/"A cotizar" y el botón pasa a **"Solicitar cotización por WhatsApp"** (manda la lista, sin pago/login). Cuando haya precios reales, vuelve al checkout normal.
- [x] **Barra de búsqueda** en el catálogo (`#shopSearch`): filtra por nombre, marca, etapa o recomendado.
- [x] **Comprar o Alquilar por producto**: en la ficha de cada silla (categorías de sillas/booster) hay botón "🛒 Agregar a mi cotización/carrito" y "📅 Alquilar esta silla por fechas" (abre el calendario de alquiler con el modelo pre-llenado → llega al CRM). Nota visible de "🔧 incluye opción de instalación".
- [x] **Íconos de contacto** con SVG (ubicación, horario, email y **logo de Instagram**) en lugar de emojis.
- [x] Etiqueta **"📅 También en alquiler"** en las tarjetas de sillas/booster del catálogo.
- [x] **Confirmación visible** al reservar cita/alquiler (banner verde "¡Recibimos tu solicitud!") además del WhatsApp.
- [x] Revisado **responsive (teléfono)**: catálogo, ficha (comprar/alquilar), calendario de alquiler, buscador y CRM (embudo/estadísticas) sin desbordes en 390px.
- [x] **El asistente recomienda con modelos + enlace**: tras una respuesta sobre sillas, muestra los **nombres reales del catálogo** y un botón "Ver [tipo] →" que abre el catálogo filtrado por esa etapa (`window.CSC_showCatalog` / `window.CSC_PRODUCTS`).
- [x] Precios en modo "Consultar / Cotizar por WhatsApp" + etiqueta de descuento "-X%" automática.
- [x] **Comparador de sillas**: botón "⇄ Comparar" en las tarjetas de sillas/booster (hasta 3), barra flotante abajo y modal con tabla lado a lado (foto, precio, etapa, marca, disponibilidad, características) + botón de asesoría por WhatsApp con los modelos elegidos. Código: `toggleCompare/openCompare` en `store.js`, estilos `.cmpbar`/`.cmp__table`.
- [x] **Guía por edad/peso** ("¿Qué silla le toca a tu pequeño?"): 4 etapas clickeables (recién nacido → convertible → combinada → booster) que filtran el catálogo, + consejo de contramarcha con enlace a sillas 360°. Sección `#guia-etapas` en la home, estilos `.gstep`.
- [x] **Bloque de reseñas de Google** bajo los testimonios: logo de Google, 5.0 estrellas y botones "Déjanos tu reseña" / "Ver todas las reseñas". El enlace directo se pone en `CONFIG.googleReviewUrl` (si está vacío abre la ficha de Google Maps).
- [x] Velocidad: precarga (`preload`) de la primera foto del hero para que la portada cargue más rápido; las fotos de productos ya usan lazy loading.

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
- [x] **Calendario visual de rango** para el alquiler (estilo reserva de hotel): el cliente toca el día de entrega y el de devolución, se marca el rango y muestra "X noches"; rellena `#citaFecha` y `#rentalEndDate` automáticamente. Código en `setupRentalCalendar()` (store.js), estilos `.rcal` en styles.css.
- [x] Seccion **Alquiler para viajes** inspirada en flujo tipo reserva: imagen real, pasos, CTA y formulario con equipo, fecha de entrega, devolucion, entrega, recogida, edad/peso e instalacion opcional.
- [x] Contacto + mapa + **QR de Waze** ("cómo llegar").

**Cuenta / auth**
- [x] Registro e inicio de sesión (correo + Google). `is_admin()` por correo.
- [x] **Acceso al panel cerrado** (jul 2026): se quitaron del código el usuario
      `admin`/`admin` y la contraseña de la cuenta admin. Ahora solo se entra con
      correo y contraseña reales (o Google) de alguien en `CONFIG.adminEmails`.
- [x] **Accesos autorizados del CRM**: `luislassogonzalez@gmail.com` y
      `sripanama1@gmail.com`. La cuenta antigua `admin@carseatclinic.app` fue
      eliminada desde Supabase por seguridad. Falta ejecutar la versión actual de
      `supabase-admin.sql` para aplicar la misma lista en el servidor.

**CRM (panel `admin.html`) "Centro de control"**
- [x] Dashboard (resumen), Productos (lista + editor con varias fotos, características, stock), buscador, filtros.
- [x] Pedidos con estados (nuevo → pagado → listo para instalar…) y contacto por WhatsApp.
- [x] Conversaciones del chat (ver abajo).
- [x] Nueva pestaña **Solicitudes**: calendario de solicitudes, filtros por tipo/estado, tarjetas de casos, cambio de estado, resumen copiable y botón de WhatsApp.
- [x] **CRM potenciado (6 mejoras)**: (1) **Embudo de ventas** Nuevo→Reserva pendiente→Contactado→Cotizado→Ganado/Perdido con conteos y botón "Avanzar"; (2) **Notas + fecha de seguimiento** por consulta (guarda en `details`, marca "vencido"); (3) **Resumen IA** de cada conversación (botón que llama a la Edge Function); (4) **Estadísticas** (consultas total/hoy/semana, ganados, barras por día, temas top); (5) **Badges de "nuevos"** en pestañas Solicitudes/Pedidos/Conversaciones; (6) **Exportar a Excel/CSV**. Código en `js/admin.js` + `DB.updateLead` en `supabase.js` + estilos en `styles.css`.
- [x] Captura de leads/casos en `crm_leads`: citas, reservas sugeridas, consultas de IA, revisión de silla, lavado, instalación y cotización. Funciona con Supabase si se corre `supabase-crm-atencion.sql` y se activa `CONFIG.crm.guardarSolicitudes=true`; mientras tanto usa `localStorage`.
- [x] CRM reconoce solicitudes de **alquiler** como tipo propio: badge, dias, equipo, entrega, devolucion, recogida, edad/peso y resumen listo para WhatsApp.
- [x] **Cierre y mejora del CRM (27 jul 2026)**: las solicitudes se ordenan de verdad por seguimiento vencido, reserva pendiente, cita de hoy, prioridad y fecha; la cola aparece antes que estadísticas en teléfono y las tarjetas/conversaciones quedan compactas. Se separaron las notas internas de las instrucciones de la clienta, los pedidos ya no aparecen como citas, las fechas usan el día local de Panamá y el buscador cubre productos, dirección, notas y demás detalles.
- [x] **Seguimiento seguro**: el chat ya no duplica solicitudes al reservar, la reserva del chat se cierra al completar el formulario real, y el CRM avisa cuando un cambio solo quedó guardado en el navegador porque Supabase no lo confirmó. Pruebas: `scripts/admin-crm-check.mjs` + `scripts/crm-data-check.mjs`.
- [x] **Ofertas claras desde el CRM**: cada producto tiene el interruptor “Este producto está en oferta”, precio normal, precio de oferta y cálculo de ahorro/porcentaje en vivo. El panel muestra contador, filtro y lista de ofertas activas; las filas resaltan el descuento. La tienda, ficha y comparador muestran “Oferta”, precio anterior, precio actual y ahorro. Se valida que el precio normal sea mayor y no se necesita SQL nuevo.

**Asistente con IA (estructura)**
- [x] Chat flotante en la web con asistente inteligente local: responde dudas comunes, pide datos si faltan y ofrece WhatsApp cuando hace falta asesor. (Guía: `CHATBOT.md`)
- [x] Motor local en `js/chat-assistant.js`: entiende silla ideal, precio, instalación/servicios, choque, saludo, lavado, revisión de vencimiento/uso y reservas; orienta por edad/peso/estatura y no inventa precios. **Ampliado**: horario, ubicación, envíos, formas de pago, garantía/marcas, cómo instalar (ISOFIX/contramarcha) y agradecimientos. Usa datos de CONFIG (horario, ubicación) via `ctx`.
- [x] El asistente entiende alquiler/renta y pide datos de reserva: equipo, fechas, entrega, recogida, edad/peso y si necesita instalacion.
- [x] Acciones dentro del chat: reservar horario, guardar caso/consulta en CRM y continuar por WhatsApp cuando la IA tiene dudas o requiere asesor.
- [x] Interruptor del CRM inteligente en `js/data.js` → `CONFIG.crm.guardarSolicitudes=false` mientras no esté corrida la tabla `crm_leads`.
- [x] **IA activada**: `CONFIG.chat.iaActiva=true`, `guardarConversaciones=true`, `crm.guardarSolicitudes=true`. Tablas `conversaciones` y `crm_leads` creadas en Supabase.
- [x] **Chat en TODAS las páginas**: extraído a `js/chat-widget.js` (autocontenido, se auto-inicia). Está en `index.html`, `servicios.html`, `terminos.html` y `privacidad.html`. La copia vieja en `store.js` quedó como obsoleta (no se llama). Nota: `DB` es `const` (no `window.DB`); el módulo lo referencia directo.
- [ ] **Confirmar la Edge Function del resumen de conversaciones**: `CONFIG.chat.funcion` hoy dice `super-service`, pero notas anteriores mencionan `super-api`. Probar "Resumir" tras iniciar sesión y dejar el nombre real en `js/data.js` antes de redeploy.
- [x] El asistente **guarda en el CRM toda pregunta real** automáticamente (no solo las que piden asesor): se quitó el filtro `needsHuman` en `saveAdvisorLead`. Verificado: inserts a `conversaciones` y `crm_leads` responden HTTP 201.
- [x] Prompt de la IA reescrito para **asesorar, no interrogar** (recomienda tipo de silla por etapa y guía a Productos/test). Marca/logo sin "Center"; menú dice "Preguntas".
- [ ] **Pendiente del dueño**: redeploy de `super-service` con el código nuevo (prompt mejorado) para que la IA asesore mejor. (Borra filas de prueba: `delete from conversaciones where session_id='test_curl'; delete from crm_leads where id='test_curl_1';`)
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
- [x] Scripts de verificación: `scripts/site-experience-check.mjs`, `scripts/admin-crm-check.mjs`, `scripts/crm-data-check.mjs`.
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
- [ ] **Enlace directo de reseña de Google**: en Google Maps → tu negocio → "Escribir una reseña" → copiar el enlace y pegarlo en `CONFIG.googleReviewUrl` (js/data.js). Mientras esté vacío, el botón abre la ficha de Maps.
- [x] **Dirección exacta** del local cargada: PH City Towers, Vía España (a un costado de Taller Rayo Import), Ciudad de Panamá. En `CONFIG.ubicacion` y `CONFIG.mapsQuery` (mapa + Waze).

## ⬜ PENDIENTE — antes de LANZAR al público

- [x] **Asegurar el admin**: hecho. Falta que el dueño corra `supabase-admin.sql`
      para quitarle los permisos a la cuenta vieja `admin@carseatclinic.app`, cuya
      contraseña quedó en el historial público de git.
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
