# 🪑 Car Seat Clinic Panamá — Tienda web

Tienda web lista para usar: productos con carrito, servicios, sección "Nosotros" y contacto.
Está hecha en HTML/CSS/JavaScript puro — **no necesitas instalar nada**.

---

## 🚀 Cómo verla

1. Abre la carpeta `carseatclinicc`.
2. Haz **doble clic** en `index.html`. Se abre en tu navegador. ¡Listo!

> Consejo: para editar los archivos usa el **Bloc de notas** o, mejor, descarga gratis
> [Visual Studio Code](https://code.visualstudio.com/).

---

## ✏️ Lo único que tienes que editar: `js/data.js`

Abre el archivo **`js/data.js`**. Ahí cambias todo lo importante. Edita solo el texto
entre comillas `" "` y **no borres** las comas ni las llaves `{ }`.

### 1) Datos del negocio y contacto
En la sección `CONFIG` cambia:
- `whatsapp` → tu número con código de país, **sin** signos. Panamá = `507`. Ej: `"50761234567"`
- `email`, `instagram`, `ubicacion`, `horario`.

### 2) Tus productos
En `PRODUCTOS`, cada producto es un bloque como este:

```js
{
  id: "p1",                       // déjalo único (p1, p2, p3...)
  nombre: "Silla para bebé",
  categoria: "sillas",            // "sillas", "bases" o "accesorios"
  precio: 189,
  antes: 0,                       // precio anterior tachado (0 = sin oferta)
  badge: "Más vendido",           // etiqueta (deja "" si no quieres)
  imagen: "",                     // ver abajo cómo poner fotos
  descripcion: "Texto del producto...",
}
```

- Para **añadir** un producto: copia un bloque completo `{ ... },` y pégalo, cambiando el `id`.
- Para **quitar** uno: borra su bloque entero (incluida la coma final).

### 3) Tus servicios
Igual que arriba, pero en la lista `SERVICIOS`. `precio: 0` muestra "Sin costo".

---

## 🖼️ Cómo poner fotos a los productos

Si dejas `imagen: ""`, se muestra un dibujo automático bonito. Para usar tus fotos reales:

**Opción A — fotos en la carpeta:**
1. Crea una carpeta llamada `assets` dentro de `carseatclinicc`.
2. Copia tus fotos ahí (ej. `silla-bebe.jpg`).
3. En el producto pon: `imagen: "assets/silla-bebe.jpg"`

**Opción B — foto desde internet:** pega el enlace directo de la imagen:
`imagen: "https://...//foto.jpg"`

> Tip: usa fotos cuadradas o tipo 4:3 para que se vean parejas.

---

## 💳 Activar el pago con tarjeta (PayPal)

La tienda ya tiene carrito y checkout listos. Para cobrar con tarjeta en línea:

1. Crea una cuenta **de empresa** en [paypal.com](https://www.paypal.com).
2. Entra a [developer.paypal.com](https://developer.paypal.com) → **Apps & Credentials** → modo **Live**.
3. Copia tu **Client ID** y pégalo en `js/data.js`:
   ```js
   paypalClientId: "PEGA_AQUI_TU_CLIENT_ID",
   ```
4. Guarda. ¡El botón de PayPal aparecerá solo en el checkout!

Mientras no pongas el Client ID, el checkout permite confirmar el pedido por **WhatsApp**
(te llega el detalle del pedido y los datos del cliente), así la tienda funciona desde ya.

---

## 🌐 Cómo publicarla en internet (gratis)

La forma más fácil:

1. Entra a [netlify.com](https://www.netlify.com) y crea una cuenta gratis.
2. Ve a **"Add new site" → "Deploy manually"**.
3. **Arrastra la carpeta `carseatclinicc`** completa a la página.
4. En segundos te dan un enlace público (ej. `carseatclinic.netlify.app`).
5. Pon ese enlace en tu bio de Instagram. 🎉

> Más adelante puedes comprar un dominio propio (ej. `carseatclinic.com`) y conectarlo.

---

## 🎨 ¿Quieres cambiar colores?

En `css/styles.css`, arriba del todo (`:root`), cambia los colores:
- `--brand` = color principal (teal)
- `--accent` = color de acento (naranja/coral)

---

## Estructura de archivos

```
carseatclinicc/
├── index.html        → la página (no necesitas tocarla)
├── README.md         → este archivo
├── css/
│   └── styles.css    → diseño y colores
└── js/
    ├── data.js       → ⭐ AQUÍ editas productos, servicios y contacto
    └── store.js      → funcionamiento del carrito (no tocar)
```

¿Dudas? Cualquier cosa que quieras cambiar, pídelo y lo ajustamos. 💛
