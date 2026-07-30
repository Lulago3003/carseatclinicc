# AGENTS.md — Contexto del proyecto para cualquier IA (Claude, Codex, Antigravity, Cursor…)

> Este archivo es la **fuente de verdad** del proyecto. Si eres un agente de IA
> continuando este trabajo, **léelo completo antes de empezar**. El usuario es
> **no técnico y habla español** — comunícate en español, simple y al grano, y
> haz el trabajo de punta a punta (incluye pasos con clics para lo que solo él
> puede hacer, como crear cuentas o pegar SQL).
>
> 👉 **Para ver qué está hecho y qué falta, lee [ESTADO.md](ESTADO.md)** (lista
> de progreso). Actualízalo al terminar cada tanda de trabajo.

## 🧭 Qué es

Tienda web + "centro de confianza" para **Car Seat Clinic Center** (Panamá):
sillas de carro para bebé, accesorios, servicios (instalación, revisión,
limpieza, alquiler) y educación en seguridad infantil. Inspiración de estilo:
poppys.com (tienda) + safeintheseat.com (autoridad/educación).

## 🧱 Stack

- **Frontend:** HTML + CSS + JavaScript **puro** (sin framework, sin build step).
- **Backend:** **Supabase** (Postgres + Auth + Storage). Proyecto ref: `fahqjwnwoznaerrwgdmc`.
- **Hosting:** GitHub Pages. Repo: `Lulago3003/carseatclinicc`. En vivo:
  https://lulago3003.github.io/carseatclinicc/
- **Pagos:** estructura lista (ver `PAGOS.md`): botón "Pagar con tarjeta" oculto
tras `CONFIG.pago.activo`, `DB.crearPago()` → Edge Function `supabase/functions/crear-pago`
(claves secretas en Supabase, no en el sitio). Pasarela objetivo: BAC Credomatic
o Tilopay (Tilopay cubre BAC + Yappy). Hoy el flujo activo es cotización por WhatsApp.

**Hosting/dominio (plan):** mover de GitHub Pages a **Cloudflare Pages** (gratis,
conectado al repo) + dominio en **Cloudflare Registrar**. Las rutas de imágenes
son relativas para que el cambio de dominio no rompa nada. Correo con dominio:
Cloudflare Email Routing (recibir, gratis) + Zoho/Google Workspace (enviar).

## 📂 Estructura

**Menú del sitio (6 pestañas, iguales en todas las páginas):**
Inicio · Tienda · Alquiler · Servicios · Preguntas · Contacto

```
index.html              → INICIO: hero, franja de confianza, destacados (4 productos
                          que llevan a la tienda), guía por etapas, test "encuentra tu
                          silla", ruta segura, servicios en tarjetas, nosotros,
                          testimonios, reserva de cita y contacto + mapa.
tienda.html             → TIENDA: catálogo completo con filtros, buscador, orden,
                          ficha de producto, comparador y carrito. Acepta ?cat=...
alquiler.html           → ALQUILER (página propia): equipo disponible, cómo funciona,
                          disponibilidades publicadas desde CRM, formulario de
                          solicitud y preguntas. La familia no escribe fechas libres.
                          Acepta ?modelo=...&equipo=... desde la ficha de producto.
servicios.html          → SERVICIOS: Limpieza (comparador antes/después), Venta,
                          Instalación, Revisión + banner que lleva a alquiler.html
faq.html                → preguntas frecuentes (acordeón <details>)
terminos.html /
privacidad.html         → páginas legales (pie de página corto)
admin.html              → panel de administración (CRM). No usa shell.js ni store.js.
js/shell.js             → ⭐ piezas COMPARTIDAS que se insertan solas en todas las
                          páginas: carrito, checkout, ficha de producto, login,
                          pop-up del boletín, botón de WhatsApp, chat, comparador y
                          avisos. También el menú móvil y la pestaña activa.
js/chat-widget.js       → chat/asistente IA reutilizable (en TODAS las páginas)
css/styles.css          → todos los estilos (paleta + responsive + animaciones).
                          El rediseño 2026 está en un bloque AL FINAL del archivo.
scripts/sync-layout.mjs → ⭐ copia el MENÚ y el PIE a todas las páginas de una vez.
                          Si cambias el menú, edítalo ahí y corre el script.
scripts/site-check.mjs  → revisa menús iguales, scripts y enlaces rotos.
js/data.js              → ⭐ CONFIGURACIÓN editable: CONFIG (supabase keys, whatsapp,
                          adminEmails, mapsQuery, paypalClientId),
                          SERVICIOS, TESTIMONIOS, INSTAGRAM, IMAGENES_CATEGORIA,
                          PRODUCTOS_DEMO
js/supabase.js          → capa de datos/auth (objeto global DB) — no tocar salvo backend
js/store.js             → lógica de la tienda (catálogo, carrito, filtros, ficha,
                          quiz, citas, newsletter, auth, animaciones)
js/admin.js             → lógica del CRM (login, lista, editor, stats, búsqueda, pedidos)
supabase-setup-completo.sql   → esquema + datos: correr UNA vez en Supabase
supabase-admin.sql            → ⚠️ quién puede administrar (CORRER: cierra el panel)
supabase-limpiar-pruebas.sql  → borra solicitudes de prueba del CRM
supabase-fotos-prueba.sql     → fotos de prueba (opcional)
supabase-disponibilidad-alquiler.sql → ⚠️ cupos de alquiler: correr UNA vez
```

## 📸 Sección de Instagram (portada)

En la portada, debajo de la franja de confianza, va **"Lo último que
publicamos"** con las publicaciones de la cuenta **oficial `@carseatclinicc`**
(no la de la tienda). Se edita en `js/data.js` → `INSTAGRAM.publicaciones`:
solo se pegan los enlaces de las publicaciones.

- Con **solo el enlace** se incrusta la publicación real de Instagram
  (`/p/<id>/embed/`, sin llave ni API): si la editan en Instagram, la web se
  actualiza sola.
- Si además se pone `imagen` y `texto`, se dibuja una tarjeta propia: carga más
  rápido y con el estilo de la web, pero hay que subir la foto a `assets/`.
- Con la lista **vacía**, la sección cambia sola a "Síguenos en Instagram" con
  la invitación a la cuenta (nunca se ve rota ni vacía).
- En teléfono es un riel que se desliza de lado, con las tarjetas asomándose.

⚠️ **Las historias (stories) no se pueden mostrar** sin la API Graph de Meta
(cuenta de empresa + app de Meta + token que hay que renovar cada 60 días). Si
algún día se quiere, el token iría en una Edge Function de Supabase, nunca en
el sitio (este repo es público).

## ✅ Qué está hecho

- Catálogo desde Supabase: categorías (recién nacidos, convertibles, 360°,
  combinadas, booster, accesorios, limpieza, gift cards), marca, stock,
  "recomendado para", varias fotos y características por producto.
- Tienda estilo e-commerce: sidebar de filtros (tipo/marca/precio), orden,
  ficha de producto con galería + cantidad + características.
- "Encuentra tu silla ideal" (quiz que recomienda silla).
- Servicios, Testimonios, Recursos de seguridad, 3 pilares, Reserva de cita
  (vía WhatsApp), Newsletter (footer + pop-up), Nosotros/Contacto + mapa.
- Auth (correo + Google) opcional; **para comprar NO hace falta registrarse**.
  Carrito persistente y pedido por WhatsApp con nombre y teléfono.
- **CRM** (`admin.html`): lista de productos, editor (subir varias fotos a Storage,
  características, stock, precio…), estadísticas, buscador, pedidos.
- Animaciones (reveal al scroll, hover, etc.), responsive (PC/iPhone/Android),
  modo claro forzado (`color-scheme: light`).

## 🔐 Acceso admin

- Se entra **solo** en `admin.html`, con correo y contraseña (o con Google).
- Es admin quien esté en `CONFIG.adminEmails` (`js/data.js`) o tenga
  `is_admin = true` en la tabla `profiles`. El servidor lo verifica con la
  función `is_admin()` de Supabase (ver `supabase-admin.sql`).
- 🚫 **Nunca escribas una contraseña en `js/data.js`.** Ese archivo es público
  en GitHub. Las claves viven solo en Supabase.

> **Historial:** hasta julio de 2026 el código traía `admin`/`admin` y la
> contraseña de `admin@carseatclinic.app` a la vista. Ya se quitaron, pero
> siguen en el historial de git, así que esa cuenta se considera comprometida:
> hay que correr `supabase-admin.sql` para quitarle los permisos.

## ⏳ Pendiente (roadmap)

1. **Pasarela de pago real** (Yappy Comercial / Tilopay, o PayPal). Es lo que
   falta para vender de verdad. Depende de que el dueño consiga Yappy Comercial.
2. **Blog** y más **Recursos de seguridad** (contenido educativo).
3. Página dedicada de **Asesoría 1:1**.
4. Contenido real: fotos de productos del proveedor, testimonios reales,
   historia/foto de la fundadora, certificación CPST.

## 🛠️ Cómo trabajar aquí

- **Probar localmente:** es estático. Abre `index.html`, o sirve la carpeta:
  `python -m http.server 5577` y abre http://localhost:5577.
- **Antes de publicar:** `node scripts/site-check.mjs` (menús, scripts y enlaces).
- **Si tocas el menú o el pie:** edítalo en `scripts/sync-layout.mjs` y corre
  `node scripts/sync-layout.mjs` para copiarlo a las 7 páginas. NO lo edites
  a mano página por página.
- **Si tocas CSS o JS:** sube `VERSION` en `scripts/sync-layout.mjs` y vuelve a
  correrlo. Eso cambia el `?v=...` de los archivos y evita que el cliente vea
  una copia vieja guardada en caché.
- **Publicar:** `git add . && git commit -m "..." && git push` → GitHub Pages
  se actualiza solo (tarda 1-2 minutos).
- **Cambios de datos/categorías/tablas en Supabase:** entregar un `.sql` para
  que el usuario lo pegue en Supabase → SQL Editor → Run (no puede hacerlo el agente).
- **Imágenes sin tocar Supabase:** usar `IMAGENES_CATEGORIA` en `js/data.js`.

## 🎨 Convenciones

- UI en **español**. Paleta oficial: Verde Bosque `#2F3E34`, Verde Salvia
  `#7A8F7C`, Beige `#F5F1EB`, Rosa Empolvado `#D8A7A7`, Gris Carbón `#333`.
  Tipografías: **Playfair Display** (títulos) + **Poppins** (texto).
- Sin em dashes ni jerga en la UI; tono cálido y de confianza.
- Mantener todo editable desde `js/data.js` para que el dueño no toque código.
- Verificar cambios en el navegador antes de dar por hecho.

## 🔁 Continuidad entre IAs

El estado vive en **Git/GitHub**. Para continuar desde otra herramienta:
clona/abre la misma carpeta, lee este archivo y sigue. Haz commit + push al
terminar cada sesión para no perder nada.
