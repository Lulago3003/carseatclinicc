# 🤖 Asistente con IA — Guía

El chat flotante de la web ya está puesto. Funciona en 2 niveles:

1. **Ahora (sin configurar nada):** capta las preguntas de los clientes y las
   **guarda** para verlas en el CRM, y ofrece seguir por WhatsApp.
2. **Con IA (cuando la actives):** responde solo, con la info del negocio.

## Paso 1 — Crear la tabla (para guardar las conversaciones)

Pega [supabase-chat.sql](supabase-chat.sql) en Supabase → SQL Editor → **Run**.
Listo: las preguntas empiezan a guardarse y aparecen en el panel, pestaña
**"Conversaciones"**.

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

La personalidad del asistente se edita en
[supabase/functions/asistente/index.ts](supabase/functions/asistente/index.ts)
(variable `SYSTEM`).

## En el CRM

Panel → pestaña **"Conversaciones"**: ves cada charla agrupada
(*"el cliente preguntó X, el asistente respondió Y"*). Te sirve para captar
consultas y mejorar la atención.
