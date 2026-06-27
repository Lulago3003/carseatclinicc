# 🤖 Asistente con IA — Guía

El chat flotante de la web ya está puesto. Funciona en 3 niveles:

1. **Ahora (sin configurar nada):** responde con un asistente inteligente local
   para dudas comunes de silla, edad/peso/talla, instalación, servicios, precios
   y choque. Si faltan datos, ofrece seguir por WhatsApp.
2. **CRM de conversaciones (cuando lo actives):** guarda las preguntas de los
   clientes para verlas en el panel.
3. **IA externa (cuando la actives):** usa la Edge Function `asistente` con una
   API key privada para respuestas más avanzadas.

## Paso 1 — Crear la tabla (para guardar las conversaciones)

Pega [supabase-chat.sql](supabase-chat.sql) en Supabase → SQL Editor → **Run**.
Listo: las preguntas empiezan a guardarse y aparecen en el panel, pestaña
**"Conversaciones"**.

Después de correr el SQL, cambia en [js/data.js](js/data.js):

```js
chat: {
  iaActiva: false,
  guardarConversaciones: true,
}
```

## Paso 2 — Activar las respuestas con IA (opcional)

1. Saca una API key en https://console.anthropic.com
2. Guárdala como secreto en Supabase:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Publica la función:
   ```bash
   supabase functions deploy asistente
   ```
   Listo: el chat empezará a responder con IA. La clave va **oculta** en
   Supabase, nunca en el sitio.

Después de desplegar la función y guardar la clave, cambia en
[js/data.js](js/data.js):

```js
chat: {
  iaActiva: true,
  guardarConversaciones: true,
}
```

La personalidad del asistente se edita en
[supabase/functions/asistente/index.ts](supabase/functions/asistente/index.ts)
(variable `SYSTEM`).

## En el CRM

Panel → pestaña **"Conversaciones"**: ves cada charla agrupada
(*"el cliente preguntó X, el asistente respondió Y"*). Te sirve para captar
consultas y mejorar la atención.
