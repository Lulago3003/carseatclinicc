/* =====================================================================
   Asistente inteligente local
   ---------------------------------------------------------------------
   Responde dudas frecuentes aunque la IA externa todavia no este activa.
   La IA real de Supabase sigue teniendo prioridad cuando devuelve respuesta.
   ===================================================================== */

(function (root) {
  "use strict";

  function normalizeText(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[¿?¡!.,;:()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractChildData(raw) {
    const text = normalizeText(raw);
    const years = text.match(/(\d{1,2})\s*(anos|ano|a\b)/);
    const months = text.match(/(\d{1,2})\s*(meses|mes\b)/);
    const weight = text.match(/(\d{1,3}(?:[.,]\d+)?)\s*(kg|kilos|kilogramos|lb|lbs|libras)/);
    const heightCm = text.match(/(\d{2,3})\s*(cm|centimetros)/);
    const heightM = text.match(/(\d(?:[.,]\d{1,2}))\s*(m|metro|metros)/);
    const parsedWeight = weight ? Number(weight[1].replace(",", ".")) : null;
    return {
      ageYears: years ? Number(years[1]) : null,
      ageMonths: months ? Number(months[1]) : null,
      weight: parsedWeight,
      weightUnit: weight ? weight[2] : "",
      heightCm: heightCm ? Number(heightCm[1]) : (heightM ? Math.round(Number(heightM[1].replace(",", ".")) * 100) : null),
      mentionsGirl: /\b(nina|hija|beba)\b/.test(text),
      mentionsBoy: /\b(nino|hijo|bebe)\b/.test(text),
    };
  }

  function detectIntent(raw) {
    const text = normalizeText(raw);
    if (!text) return "empty";
    if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hello)\b/.test(text)) return "greeting";
    if (/\b(precio|cuanto|cuesta|vale|cotizar|cotizacion|costo|pagar|tarjeta|yappy)\b/.test(text)) return "price";
    if (/\b(instalar|instalacion|revisar|revision|chequeo|cita|agendar|agenda|limpieza|lavado|alquiler|renta|servicio)\b/.test(text)) return "service";
    if (/\b(choque|accidente|impacto|chocaron|colision|crash)\b/.test(text)) return "crash";
    if (/\b(silla|car seat|asiento|booster|bebe|nino|nina|hijo|hija|arnes|cinturon|peso|talla|estatura|edad|anos|meses|kg|libras)\b/.test(text)) return "seat-fit";
    return "unknown";
  }

  function humanLabel(data) {
    if (data.mentionsGirl) return "tu niña";
    if (data.mentionsBoy) return "tu niño";
    return "tu peque";
  }

  function ageSummary(data) {
    if (data.ageYears !== null) return `${data.ageYears} años`;
    if (data.ageMonths !== null) return `${data.ageMonths} meses`;
    return "";
  }

  function missingDetails(data) {
    const missing = [];
    if (data.weight === null) missing.push("peso");
    if (data.heightCm === null) missing.push("estatura");
    missing.push("modelo del auto");
    return missing;
  }

  function seatFitReply(raw) {
    const data = extractChildData(raw);
    const label = humanLabel(data);
    const age = ageSummary(data);
    const intro = age ? `Para ${label} de ${age}, no elegiría solo por edad.` : "Para elegir bien la silla, necesito cruzar edad, peso, estatura y el auto.";
    let guidance = "";

    if (data.ageMonths !== null && data.ageMonths < 15) {
      guidance = "Como guía, normalmente miramos una silla de recién nacido o convertible, instalada mirando hacia atrás mientras esté dentro de los límites del fabricante.";
    } else if (data.ageYears !== null && data.ageYears <= 3) {
      guidance = "Como guía, suele convenir una convertible o 360°, idealmente mirando hacia atrás el mayor tiempo que permita la silla.";
    } else if (data.ageYears !== null && data.ageYears >= 4 && data.ageYears <= 7) {
      guidance = "A esa edad puede ser una combinada con arnés o un booster con respaldo, pero solo si ya superó los límites del arnés y se sienta bien todo el viaje.";
      if (data.weight !== null) {
        const kg = /lb|lbs|libras/.test(data.weightUnit) ? data.weight * 0.453592 : data.weight;
        guidance = kg < 18
          ? "Con ese peso yo revisaría primero una silla combinada o convertible con arnés, no pasaría directo a booster."
          : "Con ese peso podría entrar una combinada o un booster con respaldo, pero hay que confirmar estatura, ajuste del cinturón y madurez.";
      }
    } else if (data.ageYears !== null && data.ageYears >= 8) {
      guidance = "Puede que necesite booster hasta que el cinturón del carro le quede bien: banda baja sobre muslos y banda diagonal sobre hombro y pecho, no cuello ni barriga.";
    } else {
      guidance = "Si me das esos datos, te puedo orientar entre recién nacido, convertible, 360°, combinada o booster.";
    }

    const ask = missingDetails(data).join(", ");
    const safety = "Revisa siempre los límites de peso/estatura del fabricante y el manual del carro.";
    return {
      intent: "seat-fit",
      confidence: data.ageYears !== null || data.ageMonths !== null || data.weight !== null ? 0.82 : 0.62,
      needsHuman: true,
      answer: `${intro}\n${guidance}\n${safety}\nPara confirmarlo mejor, dime ${ask}. Si prefieres, lo vemos por WhatsApp con foto de la silla o del asiento del carro.`,
    };
  }

  function priceReply() {
    return {
      intent: "price",
      confidence: 0.9,
      needsHuman: true,
      answer: "Para precios prefiero no inventarte nada. Te cotizamos según modelo, disponibilidad y si necesitas instalación o revisión. Escríbenos el producto que viste y lo confirmamos por WhatsApp.",
    };
  }

  function serviceReply(raw) {
    const text = normalizeText(raw);
    const service = /\blimpiez|lavado\b/.test(text) ? "limpieza"
      : /\balquiler|renta\b/.test(text) ? "alquiler"
        : /\brevis|cheque\b/.test(text) ? "revisión de seguridad"
          : "instalación profesional";
    return {
      intent: "service",
      confidence: 0.86,
      needsHuman: true,
      answer: `Sí, podemos ayudarte con ${service}. Para coordinar bien, dime qué silla tienes, modelo del auto y zona donde estás. Si quieres hacerlo más rápido, continúa por WhatsApp y un asesor te agenda.`,
    };
  }

  function crashReply() {
    return {
      intent: "crash",
      confidence: 0.88,
      needsHuman: true,
      answer: "Si la silla estuvo en un choque, lo más seguro es revisarla antes de volver a usarla. En choques moderados o fuertes normalmente se recomienda reemplazarla. Escríbenos por WhatsApp y revisamos el caso con calma.",
    };
  }

  function greetingReply() {
    return {
      intent: "greeting",
      confidence: 0.75,
      needsHuman: false,
      answer: "Hola, soy el asistente de Car Seat Clinic. Te puedo orientar con silla ideal, instalación, revisión, limpieza o cotización. Para elegir silla, dime edad, peso, estatura y modelo del auto.",
    };
  }

  function unknownReply() {
    return {
      intent: "unknown",
      confidence: 0.35,
      needsHuman: true,
      answer: "Puedo ayudarte con dudas sobre sillas de carro, boosters, instalación, revisión, limpieza, alquiler y citas. No quiero adivinar si faltan datos, así que también puedes continuar por WhatsApp con un asesor.",
    };
  }

  function generateSmartReply(text) {
    const intent = detectIntent(text);
    if (intent === "greeting") return greetingReply();
    if (intent === "price") return priceReply();
    if (intent === "service") return serviceReply(text);
    if (intent === "crash") return crashReply();
    if (intent === "seat-fit") return seatFitReply(text);
    return unknownReply();
  }

  const api = { detectIntent, extractChildData, generateSmartReply, normalizeText };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ChatAssistant = api;
})(typeof window !== "undefined" ? window : globalThis);
