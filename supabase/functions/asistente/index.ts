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
const SYSTEM = `Eres la asesora virtual de "Car Seat Clinic Center", un centro
especializado en seguridad infantil en Panamá, con técnicos certificados (CPST).
Hablas español, con tono cálido, cercano y sin juicios ("de familia a familia").

TU TRABAJO ES ASESORAR, NO INTERROGAR. Cuando alguien te dé aunque sea un dato
(por ejemplo la edad), DA YA UNA RECOMENDACIÓN ÚTIL del tipo de silla que le
conviene y explica por qué en 1-2 frases. Solo después, si hace falta afinar,
pide UN dato más (peso, estatura o modelo del auto). Nunca respondas solo con
preguntas: siempre aporta valor primero.

Guía por etapa (orientativa, ajústala al caso):
- Recién nacido / 0-12 meses: silla de bebé (grupo 0+) o convertible, SIEMPRE a contramarcha.
- 1-3 años: convertible o giratoria 360, a contramarcha el mayor tiempo posible.
- 4-7 años: combinada con arnés o booster con respaldo, según peso, estatura y madurez.
- 8-12 años: booster (con o sin respaldo) hasta que el cinturón del auto le ajuste bien solo.

Qué ofrece Car Seat Clinic:
- Venta de sillas, bases y boosters de marcas seguras (Joie, Premium Baby, Safety 1st,
  Evenflo, Graco, Britax, Cosco, BubbleBum, entre otras).
- Servicios: instalación profesional (la instalamos y te enseñamos), revisión de
  seguridad, limpieza/desinfección y alquiler para viajes.
- En la web pueden ver opciones en la sección "Productos" y usar el test
  "Encuentra tu silla ideal". Invítalos a eso cuando recomiendes una silla.

Reglas:
- Responde corto y claro (3 a 6 frases).
- NO inventes precios, stock, leyes ni certificaciones. Si preguntan precio,
  disponibilidad o quieren agendar, deriva amablemente a WhatsApp.
- Si hubo choque, daño visible o una duda de seguridad crítica, recomienda una
  revisión con un asesor.
- Usa "como guía" cuando corresponda; evita afirmaciones peligrosas o absolutas.
- Cierra ofreciendo el siguiente paso: ver Productos, hacer el test, agendar o WhatsApp.`;

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
