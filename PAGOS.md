# 💳 Pago en línea (BAC / Tilopay) — Guía

> Estado: **estructura lista, desactivada.** Cuando tengas la cuenta de comercio
> y configures lo de abajo, se activa el botón "Pagar con tarjeta" en el checkout.

## ¿Cómo funciona (en simple)?

1. El cliente llena sus datos en el checkout y toca **"Pagar con tarjeta"**.
2. Tu sitio le pide a una función segura de Supabase (`crear-pago`) un **enlace de pago**.
3. El cliente paga en la **página del banco** (segura). Su tarjeta **nunca** toca tu web.
4. El banco confirma el pago y se marca el pedido como **pagado**.

Así no manejas tarjetas tú (seguro y sin certificaciones PCI).

## ¿Qué pasarela usar en Panamá?

- **Tilopay** (recomendado para empezar): conecta **BAC** y también **Yappy**, tiene API y página de pago lista. Una sola cuenta cubre tarjeta + Yappy.
- **BAC Credomatic** directo: si ella ya tiene su punto de pago/afiliación con BAC, pueden darte acceso a su pasarela de e-commerce. Pregúntale a su ejecutivo de BAC por "pasarela de pagos / e-commerce".

> Lo que necesitas pedirle al banco/Tilopay: **credenciales de comercio** (API key / usuario / contraseña) para cobros en línea.

## Pasos para activarlo

1. **Instala la CLI de Supabase** (una vez): https://supabase.com/docs/guides/cli
2. **Guarda las claves secretas** (ejemplo Tilopay):
   ```bash
   supabase secrets set TILOPAY_API_KEY=xxxx TILOPAY_API_USER=xxxx TILOPAY_API_PASSWORD=xxxx
   ```
3. **Completa la función** `supabase/functions/crear-pago/index.ts` (ya tiene el ejemplo de Tilopay; descomenta y ajusta según la doc de tu pasarela).
4. **Publica la función:**
   ```bash
   supabase functions deploy crear-pago
   ```
5. En **`js/data.js`** pon:
   ```js
   pago: { activo: true, etiqueta: "Pagar con tarjeta" },
   ```
6. Sube los cambios (`git push`). Listo: aparece el botón de pago.

## Confirmación del pago (webhook) — opcional pero recomendado

Para marcar el pedido como **pagado** automáticamente, la pasarela debe avisar
a una segunda función (un "webhook"). Cuando tengas la pasarela elegida,
creamos `supabase/functions/pago-webhook` que recibe el aviso y actualiza el
pedido (`update orders set status='pagado'`). Te guío cuando lleguemos a ese paso.

## Seguridad

- Las claves secretas **solo** viven en los *secrets* de Supabase (paso 2),
  nunca en el código del sitio (que es público).
- El cobro ocurre en la página del banco, no en tu web.
