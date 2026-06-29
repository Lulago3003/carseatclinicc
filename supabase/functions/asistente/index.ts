// =====================================================================
// Edge Function: asistente
// ---------------------------------------------------------------------
// El chatbot de la web llama aquí. Esta función habla con la IA de forma
// SEGURA: la clave de la IA va en los "secrets" de Supabase, nunca en el
// sitio (que es público). Devuelve { answer }.
//
// Soporta TRES proveedores de IA. Usa el primero que tenga clave (en este orden):
//   1) GROQ_API_KEY     -> Groq (GRATIS, funciona en todo el mundo). Recomendado.
//   2) GEMINI_API_KEY   -> Google Gemini (gratis, pero NO en todos los países).
//   3) ANTHROPIC_API_KEY -> Claude (de pago).
//
// CÓMO ACTIVAR CON GROQ (gratis):
//   1) Saca una API key gratis en https://console.groq.com/keys
//   2) En Supabase -> Edge Functions -> Secrets, agrega GROQ_API_KEY = gsk_...
//   3) Despliega esta función (Deploy).
//   4) En js/data.js, CONFIG.chat.iaActiva = true (ya está).
//   (Sin clave, el chat sigue funcionando con el asistente local + WhatsApp.)
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
explicar servicios (venta, instalación profesional, revisión de seguridad,
limpieza, alquiler para viajes, asesoría); y dudas de seguridad infantil en el auto.
Reglas:
- Responde corto, claro y útil (3 a 6 frases).
- Para recomendar silla, pide o usa: edad, peso, estatura, modelo del auto y silla actual.
- Si faltan datos, da una orientación general, pero explica qué dato falta para confirmar.
- No inventes precios, stock, leyes ni certificaciones. Si preguntan precio, disponibilidad o cita, deriva a WhatsApp.
- Si hay choque/accidente, daño visible, instalación dudosa o una pregunta de seguridad crítica, recomienda revisión con asesor.
- Evita dar instrucciones peligrosas o absolutas. Usa "como guía" cuando corresponda.
- Cierra con una pregunta útil o una invitación a WhatsApp si hace falta atención humana.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { messages } = await req.json();
    const recent = (messages || []).slice(-12);

    const groqKey = Deno.env.get("GROQ_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (groqKey) return json({ answer: await askGroq(groqKey, recent) });
    if (geminiKey) return json({ answer: await askGemini(geminiKey, recent) });
    if (anthropicKey) return json({ answer: await askClaude(anthropicKey, recent) });
    return json({ error: "IA no configurada" }, 501);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

// --- Groq (plan gratuito, OpenAI-compatible) ---
async function askGroq(apiKey: string, messages: Array<{ role: string; content: string }>) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": "Bearer " + apiKey, "content-type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM },
        ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content ?? "") })),
      ],
    }),
  });
  if (!res.ok) throw new Error("Groq: " + (await res.text()));
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

// --- Google Gemini (plan gratuito) ---
async function askGemini(apiKey: string, messages: Array<{ role: string; content: string }>) {
  const model = "gemini-2.0-flash";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content ?? "") }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.6 },
      }),
    },
  );
  if (!res.ok) throw new Error("Gemini: " + (await res.text()));
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// --- Anthropic Claude (de pago) ---
async function askClaude(apiKey: string, messages: Array<{ role: string; content: string }>) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM,
      messages,
    }),
  });
  if (!res.ok) throw new Error("Claude: " + (await res.text()));
  const data = await res.json();
  return data?.content?.[0]?.text ?? "";
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
