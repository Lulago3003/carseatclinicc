// =====================================================================
// Edge Function: asistente
// ---------------------------------------------------------------------
// El chatbot de la web llama aquí. Esta función habla con la IA (Claude)
// de forma SEGURA: la clave de la IA va en los "secrets" de Supabase,
// nunca en el sitio (que es público). Devuelve { answer }.
//
// CÓMO ACTIVAR:
//   1) Consigue una API key en https://console.anthropic.com
//   2) supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   3) supabase functions deploy asistente
//   Listo: el chat de la web empezará a responder con IA.
//   (Sin clave, el chat sigue guardando las preguntas y ofrece WhatsApp.)
// =====================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Personalidad del asistente (edítalo a gusto)
const SYSTEM = `Eres el asistente virtual de "Car Seat Clinic Center", un centro
especializado en seguridad infantil en Panamá, con técnicos certificados (CPST).
Hablas español, con tono cálido, cercano y sin juicios ("de familia a familia").
Ayudas a: elegir la silla correcta según edad/peso/talla del niño y el auto;
explicar servicios (instalación profesional, revisión de seguridad, limpieza,
alquiler, asesoría); y dudas de seguridad infantil en el auto.
Responde corto (2 a 4 frases). No inventes precios: si preguntan precio, di que
con gusto cotizan por WhatsApp. Si conviene, invita a usar el buscador
"Encuentra tu silla ideal", a agendar una cita, o a escribir por WhatsApp.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { messages } = await req.json();
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return json({ error: "IA no configurada" }, 501);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // económico y rápido; cámbialo si quieres
        max_tokens: 400,
        system: SYSTEM,
        messages: (messages || []).slice(-12), // últimos mensajes como contexto
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return json({ error: "Error de IA", detail: t }, 502);
    }
    const data = await res.json();
    const answer = data?.content?.[0]?.text ?? "";
    return json({ answer });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
