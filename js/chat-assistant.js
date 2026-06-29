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
    if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hello|que tal)\b/.test(text)) return "greeting";
    if (/\bgracias\b/.test(text) && text.length <= 30) return "thanks";
    if (/\b(choque|accidente|impacto|chocaron|colision|crash)\b/.test(text)) return "crash";
    if (/\b(horario|abren|cierran|abierto|atienden|a que hora|que hora|dias atienden|que dias)\b/.test(text)) return "hours";
    if (/\b(donde estan|donde quedan|ubicacion|ubicados|ubicado|direccion|como llego|como llegar|tienda fisica|sucursal)\b/.test(text)) return "location";
    if (/\b(envio|envios|envian|envias|enviar|envia|delivery|domicilio|mandan|despacho|llega a|a domicilio)\b/.test(text)) return "shipping";
    if (/\b(yappy|efectivo|transferencia|metodos de pago|metodo de pago|formas de pago|forma de pago|tarjeta|pagar|como pago|cuotas)\b/.test(text)) return "payment";
    if (/\b(garantia|original|originales|autentic|falsific|que marcas|cuales marcas|marca tienen|son nuevas|son nuevos)\b/.test(text)) return "warranty";
    if (/\b(como instalar|como se instala|como instalo|como la instalo|como se pone|como pongo|como la pongo|isofix|latch|anclaje|contramarcha|a contramarcha|mirando atras|hacia atras|girar|voltear|dar vuelta)\b/.test(text)) return "install-how";
    if (/\b(reservar|reserva|agendar|agenda|cita|calendario|disponible|manana|mañana)\b/.test(text)) return "booking";
    if (/\b(lavar|lavado|limpiar|limpieza|desinfectar|mancha|sucio|correas|arnes)\b/.test(text)) return "cleaning";
    if (/\b(vencid|vence|vencimiento|caduc|expir|etiqueta|fabricante|segunda mano|usada|modelo de la silla)\b/.test(text)) return "seat-review";
    if (/\b(mi|la|esta|esa)\s+silla\b.*\b(puede|sirve|usar|uso|segura)\b/.test(text)) return "seat-review";
    if (/\b(precio|cuanto|cuesta|vale|cotizar|cotizacion|costo)\b/.test(text)) return "price";
    if (/\b(instalar|instalacion|revisar|revision|chequeo|asesoria|alquiler|alquilar|alquilo|renta|rentar|servicio)\b/.test(text)) return "service";
    if (/\b(silla|car seat|asiento|booster|bebe|nino|nina|hijo|hija|peso|talla|estatura|edad|anos|meses|kg|libras)\b/.test(text)) return "seat-fit";
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

  function withAdvisorMeta(reply, extra) {
    return { confidence: 0.75, needsHuman: true, action: "case", capture: {}, ...reply, ...extra };
  }

  function seatFitReply(raw) {
    const data = extractChildData(raw);
    const label = humanLabel(data);
    const age = ageSummary(data);
    const intro = age ? `Para ${label} de ${age}, no elegiria solo por edad.` : "Para elegir bien la silla, necesito cruzar edad, peso, estatura y el auto.";
    let guidance = "";

    if (data.ageMonths !== null && data.ageMonths < 15) {
      guidance = "Como guia, normalmente miramos una silla de recien nacido o convertible, instalada mirando hacia atras mientras este dentro de los limites del fabricante.";
    } else if (data.ageYears !== null && data.ageYears <= 3) {
      guidance = "Como guia, suele convenir una convertible o 360°, idealmente mirando hacia atras el mayor tiempo que permita la silla.";
    } else if (data.ageYears !== null && data.ageYears >= 4 && data.ageYears <= 7) {
      guidance = "A esa edad puede ser una combinada con arnes o un booster con respaldo, pero solo si ya supero los limites del arnes y se sienta bien todo el viaje.";
      if (data.weight !== null) {
        const kg = /lb|lbs|libras/.test(data.weightUnit) ? data.weight * 0.453592 : data.weight;
        guidance = kg < 18
          ? "Con ese peso yo revisaria primero una silla combinada o convertible con arnes, no pasaria directo a booster."
          : "Con ese peso podria entrar una combinada o un booster con respaldo, pero hay que confirmar estatura, ajuste del cinturon y madurez.";
      }
    } else if (data.ageYears !== null && data.ageYears >= 8) {
      guidance = "Puede que necesite booster hasta que el cinturon del carro le quede bien: banda baja sobre muslos y banda diagonal sobre hombro y pecho, no cuello ni barriga.";
    } else {
      guidance = "Si me das esos datos, te puedo orientar entre recien nacido, convertible, 360°, combinada o booster.";
    }

    const ask = missingDetails(data).join(", ");
    const safety = "Revisa siempre los limites de peso/estatura del fabricante y el manual del carro.";
    return withAdvisorMeta({
      intent: "seat-fit",
      confidence: data.ageYears !== null || data.ageMonths !== null || data.weight !== null ? 0.82 : 0.62,
      action: "case",
      capture: { service: "Asesoria de compra", child: data },
      answer: `${intro}\n${guidance}\n${safety}\nPara confirmarlo mejor, dime ${ask}. Si prefieres, te puedo dejar el caso listo para un asesor o puedes continuar por WhatsApp con foto de la silla o del asiento del carro.`,
    });
  }

  function seatReviewReply() {
    return withAdvisorMeta({
      intent: "seat-review",
      confidence: 0.84,
      action: "case",
      capture: { service: "Revision de seguridad", priority: "alta" },
      answer: "Para saber si una silla aun se puede usar necesitamos revisar etiqueta, modelo, fecha de fabricacion/vencimiento, historial de choques y piezas completas. Si falta alguno de esos datos, no conviene adivinar. Puedes enviarnos fotos de la etiqueta y de la silla, o reservar una revision para confirmarlo con seguridad.",
    });
  }

  function cleaningReply() {
    return withAdvisorMeta({
      intent: "cleaning",
      confidence: 0.86,
      action: "book",
      capture: { service: "Limpieza y desinfeccion", priority: "media" },
      answer: "Si quieres lavar la silla, primero revisa el manual del fabricante. Muchas telas se pueden limpiar de forma controlada, pero el arnes y las correas no se deben lavar agresivamente ni remojar porque pueden perder resistencia. Nosotros podemos revisar la silla, limpiar lo que corresponde y decirte que partes conviene tratar con cuidado. Puedes reservar un horario o continuar por WhatsApp.",
    });
  }

  function bookingReply() {
    return withAdvisorMeta({
      intent: "booking",
      confidence: 0.9,
      action: "book",
      capture: { service: "Revision de seguridad", priority: "alta" },
      answer: "Claro. Puedes usar el calendario de la pagina para escoger servicio, fecha y horario disponible. Si es por instalacion, revision o limpieza, agrega el modelo de la silla y del auto para que lleguemos preparados. Tambien puedes continuar por WhatsApp si necesitas confirmar algo antes de reservar.",
    });
  }

  function priceReply() {
    return withAdvisorMeta({
      intent: "price",
      confidence: 0.9,
      action: "whatsapp",
      capture: { service: "Cotizacion", priority: "media" },
      answer: "Para precios prefiero no inventarte nada. Te cotizamos segun modelo, disponibilidad y si necesitas instalacion o revision. Escribenos el producto que viste y lo confirmamos por WhatsApp.",
    });
  }

  function serviceReply(raw) {
    const text = normalizeText(raw);
    const service = /\blimpiez|lavado|desinfectar\b/.test(text) ? "Limpieza y desinfeccion"
      : /\balquiler|alquilar|alquilo|renta|rentar\b/.test(text) ? "Alquiler"
        : /\brevis|cheque\b/.test(text) ? "Revision de seguridad"
          : /\basesoria|elegir|compra\b/.test(text) ? "Asesoria de compra"
            : "Instalacion profesional";
    if (service === "Alquiler") {
      return withAdvisorMeta({
        intent: "service",
        confidence: 0.88,
        action: "book",
        capture: { service: "Alquiler", priority: "alta" },
        answer: "Si, podemos ayudarte con alquiler para viaje. Para confirmar disponibilidad necesito equipo, fecha de entrega, fecha de devolucion, lugar de entrega, lugar de recogida, edad y peso del nino. Puedes reservarlo en el calendario y dejar todo listo, o continuar por WhatsApp si tienes dudas antes de agendar.",
      });
    }
    return withAdvisorMeta({
      intent: "service",
      confidence: 0.86,
      action: "book",
      capture: { service, priority: service.includes("Revision") ? "alta" : "media" },
      answer: `Si, podemos ayudarte con ${service.toLowerCase()}. Para coordinar bien, dime que silla tienes, modelo del auto y zona donde estas. Tambien puedes reservar un horario desde el calendario o continuar por WhatsApp con un asesor.`,
    });
  }

  function crashReply() {
    return withAdvisorMeta({
      intent: "crash",
      confidence: 0.9,
      action: "case",
      capture: { service: "Revision por choque", priority: "urgente" },
      answer: "Si la silla estuvo en un choque, no la volveria a usar sin revision. En choques moderados o fuertes normalmente se recomienda reemplazarla. Guarda fotos, etiqueta, fecha del choque y modelo de silla. Te recomiendo continuar por WhatsApp o reservar una revision para documentar el caso.",
    });
  }

  function thanksReply() {
    return {
      intent: "thanks", confidence: 0.8, needsHuman: false, action: "guide", capture: {},
      answer: "Con gusto. Si te queda otra duda sobre sillas, instalacion, alquiler o limpieza, aqui estoy. Y cuando quieras, puedes cotizar o reservar por WhatsApp.",
    };
  }

  function hoursReply(ctx) {
    const h = (ctx && ctx.horario) ? ctx.horario : "Lunes a Sabado, horario de oficina";
    return {
      intent: "hours", confidence: 0.9, needsHuman: false, action: "guide", capture: {},
      answer: `Nuestro horario de atencion es: ${h}. Puedes agendar una cita en la pagina o escribirnos por WhatsApp para coordinar.`,
    };
  }

  function locationReply(ctx) {
    const u = (ctx && ctx.ubicacion) ? ctx.ubicacion : "Ciudad de Panama";
    return {
      intent: "location", confidence: 0.88, needsHuman: false, action: "guide", capture: {},
      answer: `Estamos en ${u}. En la seccion de Contacto de la pagina tienes el mapa y un codigo de Waze para llegar. Tambien coordinamos instalacion y entrega; escribenos por WhatsApp y confirmamos la zona.`,
    };
  }

  function shippingReply() {
    return {
      intent: "shipping", confidence: 0.85, needsHuman: false, action: "guide", capture: { service: "Envio" },
      answer: "Si, hacemos envios a todo el pais. El costo y el tiempo dependen de la zona y del producto. Dime que producto te interesa y a donde lo necesitas, y lo confirmamos por WhatsApp.",
    };
  }

  function paymentReply() {
    return {
      intent: "payment", confidence: 0.82, needsHuman: false, action: "whatsapp", capture: { service: "Consulta de pago" },
      answer: "El pago lo coordinamos al cerrar tu pedido por WhatsApp y te indicamos las opciones disponibles (por ejemplo transferencia, Yappy o efectivo, segun acordemos). Pronto habilitaremos el pago con tarjeta directo en la web.",
    };
  }

  function warrantyReply() {
    return {
      intent: "warranty", confidence: 0.82, needsHuman: false, action: "guide", capture: { service: "Consulta de producto" },
      answer: "Trabajamos sillas de marcas con normas internacionales de seguridad, nuevas y garantizadas. La garantia exacta depende del modelo; dime cual te interesa y confirmamos marca, garantia y disponibilidad por WhatsApp.",
    };
  }

  function installHowReply() {
    return withAdvisorMeta({
      intent: "install-how", confidence: 0.8, action: "book", capture: { service: "Instalacion profesional", priority: "media" },
      answer: "La instalacion correcta depende de la silla y del auto (ISOFIX/LATCH o cinturon de seguridad). Como guia general: la silla debe quedar firme (que no se mueva mas de 2-3 cm), el arnes ajustado sin holgura y el broche del pecho a la altura de las axilas. Los bebes deben ir a contramarcha (mirando hacia atras) el mayor tiempo posible. Nosotros te la instalamos y te enseñamos a usarla: puedes reservar una instalacion o continuar por WhatsApp con foto de la silla y del asiento del carro.",
    });
  }

  function greetingReply() {
    return {
      intent: "greeting",
      confidence: 0.75,
      needsHuman: false,
      action: "guide",
      capture: {},
      answer: "Hola, soy el asistente de Car Seat Clinic. Te puedo orientar con silla ideal, instalacion, revision, limpieza, alquiler, envios, horario o cotizacion. Para elegir silla, dime edad, peso, estatura y modelo del auto.",
    };
  }

  function unknownReply() {
    return withAdvisorMeta({
      intent: "unknown",
      confidence: 0.35,
      action: "whatsapp",
      capture: { service: "Consulta general", priority: "media" },
      answer: "Puedo ayudarte con dudas sobre sillas de carro, boosters, instalacion, revision, limpieza, alquiler, envios, horario, ubicacion, formas de pago y citas. No quiero adivinar si faltan datos, asi que tambien puedes continuar por WhatsApp con un asesor.",
    });
  }

  function generateSmartReply(text, ctx) {
    const intent = detectIntent(text);
    if (intent === "greeting") return greetingReply();
    if (intent === "thanks") return thanksReply();
    if (intent === "hours") return hoursReply(ctx);
    if (intent === "location") return locationReply(ctx);
    if (intent === "shipping") return shippingReply();
    if (intent === "payment") return paymentReply();
    if (intent === "warranty") return warrantyReply();
    if (intent === "install-how") return installHowReply();
    if (intent === "booking") return bookingReply();
    if (intent === "cleaning") return cleaningReply();
    if (intent === "seat-review") return seatReviewReply();
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
