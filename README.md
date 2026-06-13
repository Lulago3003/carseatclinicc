# 🪑 Car Seat Clinic Panamá — Tienda web

Tienda online con **catálogo**, **carrito**, **login (correo y Google)**, **base de datos**,
**control de stock** y un **panel de administración** para editar todo sin tocar código.

- Frontend: HTML/CSS/JS (se publica gratis en GitHub Pages / Netlify)
- Backend: [Supabase](https://supabase.com) (base de datos + login) — plan gratis

---

## 🧭 ¿Qué hace cada cosa?

| Necesitas… | Dónde se hace |
|---|---|
| Cambiar WhatsApp, correo, horario, colores | `js/data.js` y `css/styles.css` |
| Agregar / editar productos y **stock** | **Panel admin** (`admin.html`) — fácil, con formularios |
| Ver pedidos y cambiar su estado | **Panel admin** → pestaña Pedidos |
| Que los clientes inicien sesión y compren | Se activa al conectar Supabase (abajo) |

> Sin conectar Supabase, la tienda funciona en **modo demo**: se ve con productos de
> ejemplo y los pedidos van por WhatsApp, pero **el login y el stock real no funcionan**.
> Para activarlo todo, sigue los pasos siguientes (una sola vez).

---

## ✅ PASO 1 — Crear la base de datos (Supabase)

1. Entra a **[supabase.com](https://supabase.com)** → **Start your project** → crea cuenta (gratis).
2. **New project**: ponle un nombre (ej. `carseatclinic`), crea una contraseña y elige región. Espera ~1 min.
3. En el menú izquierdo entra a **SQL Editor → New query**.
4. Abre el archivo **`supabase-setup.sql`** de este proyecto, **copia todo** y pégalo. Presiona **Run**.
   ✔️ Eso crea las tablas, la seguridad, el stock y los productos de ejemplo.

## ✅ PASO 2 — Conectar la web con Supabase

1. En Supabase, menú **⚙️ Project Settings → API**.
2. Copia el **Project URL** y la clave **anon public**.
3. Pégalos en **`js/data.js`**:
   ```js
   supabaseUrl: "https://xxxxx.supabase.co",
   supabaseAnonKey: "eyJhbGci...(clave larga)...",
   ```
4. Guarda. ¡Listo, ya hay base de datos y login por correo! 🎉

## ✅ PASO 3 — Hacerte administradora

1. Abre la tienda, clic en **Ingresar → Regístrate** y crea tu cuenta con tu correo.
2. Vuelve a Supabase → **SQL Editor** y ejecuta (cambia el correo por el tuyo):
   ```sql
   update profiles set is_admin = true where email = 'TU_CORREO@gmail.com';
   ```
3. Recarga la tienda. Aparecerá el botón **⚙️ Administrar**. Desde ahí editas productos y stock. 💪

## ✅ PASO 4 (opcional) — Activar "Iniciar con Google"

1. En Supabase: **Authentication → Providers → Google → Enable**.
2. Te pedirá un **Client ID** y **Client Secret**. Para obtenerlos:
   - Entra a **[console.cloud.google.com](https://console.cloud.google.com)** → crea un proyecto.
   - **APIs y servicios → Pantalla de consentimiento OAuth** → tipo **Externo** → llena lo básico.
   - **Credenciales → Crear credenciales → ID de cliente OAuth → Aplicación web**.
   - En **URIs de redireccionamiento autorizados** pega la URL que te muestra Supabase
     (algo como `https://xxxxx.supabase.co/auth/v1/callback`).
   - Copia el **Client ID** y **Client Secret** y pégalos en Supabase. Guarda.
3. En Supabase: **Authentication → URL Configuration** → en **Site URL** y **Redirect URLs**
   agrega la dirección de tu tienda publicada, ej:
   `https://lulago3003.github.io/carseatclinicc/`
4. ¡Listo! El botón **Continuar con Google** ya funcionará.

---

## 🖼️ Fotos de productos

En el panel admin, campo **Imagen**, puedes poner:
- Una URL de internet (enlace directo a la foto), **o**
- `assets/mi-foto.jpg` (crea una carpeta `assets` y sube ahí tus fotos).

Si lo dejas vacío, se muestra un dibujo automático.

## 💳 Pago con tarjeta (PayPal, opcional)

En `js/data.js` pega tu `paypalClientId` (de [developer.paypal.com](https://developer.paypal.com)).
Mientras esté vacío, el cobro se coordina por WhatsApp.

## 🎨 Cambiar colores

En `css/styles.css` (arriba, en `:root`): `--brand` (principal) y `--accent` (acento).

---

## 🌐 Publicar / actualizar

Ya está en GitHub. Para subir cambios:
```bash
git add .
git commit -m "Cambios en la tienda"
git push
```
La web publicada se actualiza sola. (En GitHub: Settings → Pages, si no estuviera activo.)

## 📁 Archivos

```
carseatclinicc/
├── index.html          → la tienda
├── admin.html          → panel de administración
├── supabase-setup.sql  → ⭐ se pega una vez en Supabase
├── README.md           → esta guía
├── css/styles.css      → diseño y colores
└── js/
    ├── data.js         → ⭐ ajustes (WhatsApp, claves de Supabase, PayPal)
    ├── supabase.js     → conexión con la base de datos (no tocar)
    ├── store.js        → tienda (no tocar)
    └── admin.js        → panel admin (no tocar)
```

¿Dudas? Pídeme lo que quieras cambiar y lo ajustamos. 💛
