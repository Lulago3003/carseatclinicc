// =====================================================================
// Edge Function: crear-pago
// ---------------------------------------------------------------------
// Esta función corre en Supabase (servidor seguro). Aquí SÍ van las claves
// secretas del banco/pasarela (como "secrets" de Supabase), nunca en la web.
//
// Qué hace: recibe el pedido (items, total, datos del cliente), le pide a la
// pasarela (BAC / Tilopay) un enlace de pago, y devuelve { url } para
// redirigir al cliente a la página segura del banco.
//
// La tarjeta NUNCA pasa por tu sitio → seguro y sin líos de PCI.
//
// CÓMO ACTIVAR (resumen, ver PAGOS.md):
//   1) Tener cuenta de comercio (BAC) o cuenta en Tilopay.
//   2) supabase secrets set TILOPAY_API_KEY=... TILOPAY_API_USER=... TILOPAY_API_PASSWORD=...
//   3) supabase functions deploy crear-pago
//   4) En js/data.js poner CONFIG.pago.activo = true
// =====================================================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const order = await req.json(); // { items, total, customer }
    const amount = Number(order?.total || 0);
    if (!amount || amount <= 0) {
      return json({ error: "Monto inválido" }, 400);
    }

    // --- AQUÍ va la llamada a TU pasarela --------------------------------
    // Ejemplo con TILOPAY (soporta BAC y Yappy en Panamá). Ajusta según la
    // documentación de tu pasarela. Descomenta y completa cuando la tengas:
    //
    // const apiKey = Deno.env.get("TILOPAY_API_KEY");
    // const user   = Deno.env.get("TILOPAY_API_USER");
    // const pass   = Deno.env.get("TILOPAY_API_PASSWORD");
    //
    // // 1) token
    // const tok = await fetch("https://app.tilopay.com/api/v1/loginToken", {
    //   method: "POST", headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ apiuser: user, password: pass }),
    // }).then(r => r.json());
    //
    // // 2) crear pago → devuelve la URL del checkout
    // const pay = await fetch("https://app.tilopay.com/api/v1/processPayment", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tok.access_token}` },
    //   body: JSON.stringify({
    //     key: apiKey,
    //     amount: amount.toFixed(2),
    //     currency: "USD",
    //     orderNumber: "CSC-" + Date.now(),
    //     redirect: "https://carseatclinic.com/gracias",   // a dónde vuelve tras pagar
    //     billToFirstName: order?.customer?.nombre ?? "",
    //     billToEmail: order?.customer?.email ?? "",
    //   }),
    // }).then(r => r.json());
    //
    // return json({ url: pay.url });
    // ---------------------------------------------------------------------

    // Mientras no esté configurada, avisamos claramente:
    return json({ error: "Pasarela no configurada todavía. Ver PAGOS.md." }, 501);
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
