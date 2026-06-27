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

```
index.html              → la tienda (todas las secciones)
admin.html              → panel de administración (CRM)
css/styles.css          → todos los estilos (paleta + responsive + animaciones)
js/data.js              → ⭐ CONFIGURACIÓN editable: CONFIG (supabase keys, whatsapp,
                          adminEmails, adminCode, mapsQuery, paypalClientId),
                          SERVICIOS, TESTIMONIOS, IMAGENES_CATEGORIA, PRODUCTOS_DEMO
js/supabase.js          → capa de datos/auth (objeto global DB) — no tocar salvo backend
js/store.js             → lógica de la tienda (catálogo, carrito, filtros, ficha,
                          quiz, citas, newsletter, auth, animaciones)
js/admin.js             → lógica del CRM (login, lista, editor, stats, búsqueda, pedidos)
supabase-setup-completo.sql   → esquema + datos: correr UNA vez en Supabase
supabase-admin.sql            → habilita la cuenta admin en is_admin()
supabase-fotos-prueba.sql     → fotos de prueba (opcional)
```

## ✅ Qué está hecho

- Catálogo desde Supabase: categorías (recién nacidos, convertibles, 360°,
  combinadas, booster, accesorios, limpieza, gift cards), marca, stock,
  "recomendado para", varias fotos y características por producto.
- Tienda estilo e-commerce: sidebar de filtros (tipo/marca/precio), orden,
  ficha de producto con galería + cantidad + características.
- "Encuentra tu silla ideal" (quiz que recomienda silla).
- Servicios, Testimonios, Recursos de seguridad, 3 pilares, Reserva de cita
  (vía WhatsApp), Newsletter (footer + pop-up), Nosotros/Contacto + mapa.
- Auth (correo + Google) con **login obligatorio para comprar**; carrito persistente.
- **CRM** (`admin.html`): lista de productos, editor (subir varias fotos a Storage,
  características, stock, precio…), estadísticas, buscador, pedidos.
- Animaciones (reveal al scroll, hover, etc.), responsive (PC/iPhone/Android),
  modo claro forzado (`color-scheme: light`).

## 🔐 Acceso admin (versión de prueba)

- **Atajo:** en la tienda → "Ingresar" → usuario `admin` / clave `admin`
  (definido en `CONFIG.adminCode` en `js/data.js`). Redirige a `admin.html` y
  hace login automático en la cuenta real `admin@carseatclinic.app`.
- También sirve el correo personal del dueño (`adminEmails` en `data.js`).
- Seguridad: `is_admin()` en Supabase autoriza esos correos (ver `supabase-admin.sql`).
- ⚠️ El usuario/clave están en el código (público) → para producción, cambiarlos.

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
- **Publicar:** `git add . && git commit -m "..." && git push` → GitHub Pages
  se actualiza solo. (Recordar al usuario abrir en incógnito por la caché.)
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
