/* =====================================================================
   Asistente inteligente local
   ---------------------------------------------------------------------
   Responde dudas frecuentes SIN depender de ninguna IA de pago. La IA
   externa puede activarse de forma opcional, pero este motor local es la
   fuente principal del chat público: responde rápido, no inventa precios y
   sabe cuándo debe pasar el caso a una asesora por WhatsApp.

   Los números de peso/edad de aquí son los MISMOS que usan la guía por
   etapas de la portada y el test "Encuentra tu silla ideal" (ver RECS en
   store.js), para que el asistente nunca contradiga lo que ya dice la web.
   ===================================================================== */

(function (root) {
  "use strict";

  function normalizeText(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
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
      multiple: /\b(gemel|melliz|dos (hijos|hijas|ninos|ninas|bebes)|ambos ninos|los dos ninos|mis dos)\b/.test(text),
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
    if (/\b(instagram|facebook|tiktok|redes sociales|siguenos|sigueme|cuenta de instagram)\b/.test(text)) return "social";
    if (/\b(yappy|efectivo|transferencia|metodos de pago|metodo de pago|formas de pago|forma de pago|tarjeta|pagar|como pago|cuotas)\b/.test(text)) return "payment";
    if (/\b(regalo|regalar|obsequio|gift card|tarjeta de regalo|de regalo|para regalar)\b/.test(text)) return "gift";
    if (/\b(garantia|original|originales|autentic|falsific|que marcas|cuales marcas|marca tienen|son nuevas|son nuevos|es usada|son usadas)\b/.test(text)) return "warranty";
    if (/\b(comprar o alquilar|alquilar o comprar|conviene alquilar|conviene comprar|mejor alquilar|mejor comprar|comprarla o alquilarla|alquilarla o comprarla)\b/.test(text)) return "buy-vs-rent";
    if (/\b(coche|carriola|stroller|corral|cuna|moises|pack n play|pack-n-play|corralito)\b/.test(text)) return "rental-equipment";
    if (/\b(alquiler|alquilar|alquilo|renta|rentar|rento|prestan|prestar)\b/.test(text)) return "rental";
    if (/\b(ya no le sirve|ya no le cabe|se le quedo chica|se le quedo pequena|se le quedo pequeno|cuando cambio|momento de cambiar|paso a booster|paso al booster|siguiente etapa|cambiar de silla|cambiar de etapa)\b/.test(text)) return "stage-change";
    if (/\b(como instalar|como se instala|como instalo|como la instalo|como se pone|como pongo|como la pongo|isofix|latch|anclaje|contramarcha|a contramarcha|mirando atras|hacia atras|girar|voltear|dar vuelta)\b/.test(text)) return "install-how";
    if (/\b(reservar|reserva|agendar|agenda|cita|calendario|disponible|manana|mañana)\b/.test(text)) return "booking";
    if (/\b(lavar|lavado|limpiar|limpieza|desinfectar|mancha|sucio|correas|arnes)\b/.test(text)) return "cleaning";
    if (/\b(vencid|vence|vencimiento|caduc|expir|etiqueta|fabricante|segunda mano|usada|modelo de la silla)\b/.test(text)) return "seat-review";
    if (/\b(mi|la|esta|esa)\s+silla\b.*\b(puede|sirve|usar|uso|segura)\b/.test(text)) return "seat-review";
    if (/\b(precio|cuanto|cuesta|vale|cotizar|cotizacion|costo)\b/.test(text)) return "price";
    if (/\b(instalar|instalacion|revisar|revision|chequeo|asesoria|servicio)\b/.test(text)) return "service";
    if (/\b(silla|car seat|asiento|booster|bebe|nino|nina|hijo|hija|peso|talla|estatura|edad|anos|meses|kg|libras)\b/.test(text)) return "seat-fit";
    return "unknown";
  }

  function humanLabel(data) {
    if (data.multiple) return "tus peques";
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
    return { confidence: 0.75, needsHuman: true, handoff: "whatsapp", action: "case", capture: {}, ...reply, ...extra };
  }

  function seatFitReply(raw) {
    const data = extractChildData(raw);
    const label = humanLabel(data);
    const age = ageSummary(data);
    const intro = age ? `Para ${label} de ${age}, no elegiría solo por edad.` : "Para elegir bien la silla, necesito cruzar edad, peso, estatura y el auto.";
    let guidance = "";

    if (data.ageMonths !== null && data.ageMonths < 15) {
      guidance = "Como guía: hasta unos 13 kg va una silla de recién nacido o una convertible/360°, siempre instalada a contramarcha (mirando hacia atrás), que es la posición más segura a esa edad.";
    } else if (data.weight !== null) {
      const kg = /lb|lbs|libras/.test(data.weightUnit) ? data.weight * 0.453592 : data.weight;
      if (kg <= 13) {
        guidance = "Con ese peso todavía va una silla de recién nacido o convertible/360°, a contramarcha.";
      } else if (kg <= 18) {
        guidance = "Con ese peso encaja una convertible o 360°, y si el auto lo permite, seguiría siendo mejor a contramarcha el mayor tiempo posible.";
      } else if (kg <= 36) {
        guidance = "Con ese peso puede ir en una combinada (con arnés) o en un booster con respaldo si ya tiene la madurez para quedarse quieto y el cinturón le ajusta bien. Si aún no estás segura, yo primero probaría con arnés.";
      } else {
        guidance = "A ese peso ya suele ser booster: eleva al niño para que el cinturón del auto le quede en la posición correcta, banda baja sobre los muslos y banda diagonal sobre el hombro, nunca sobre el cuello.";
      }
    } else if (data.ageYears !== null && data.ageYears <= 3) {
      guidance = "Como guía, entre 1 y 4 años (unos 9 a 18 kg) suele convenir una convertible o 360°, idealmente a contramarcha el mayor tiempo que permita la silla.";
    } else if (data.ageYears !== null && data.ageYears >= 4 && data.ageYears <= 7) {
      guidance = "A esa edad puede ser una combinada con arnés o un booster con respaldo (grupo 2-3, unos 15 a 36 kg), pero solo si ya superó los límites del arnés y se sienta quieto todo el viaje.";
    } else if (data.ageYears !== null && data.ageYears >= 8) {
      guidance = "Puede que ya solo necesite booster hasta que el cinturón del carro le quede bien: banda baja sobre muslos y banda diagonal sobre hombro y pecho, no sobre cuello ni barriga.";
    } else {
      guidance = "Si me das esos datos te oriento entre recién nacido, convertible, 360°, combinada o booster. Si prefieres una sola silla que acompañe varias etapas, las 360° suelen ser la mejor inversión.";
    }

    if (data.multiple) {
      guidance += " Como son dos peques, también podemos confirmar que ambas sillas quepan juntas en el asiento trasero de tu auto antes de que compres.";
    }

    const ask = missingDetails(data).join(", ");
    const safety = "Revisa siempre los límites de peso/estatura del fabricante y el manual del carro.";
    return withAdvisorMeta({
      intent: "seat-fit",
      confidence: data.ageYears !== null || data.ageMonths !== null || data.weight !== null ? 0.82 : 0.62,
      action: "case",
      capture: { service: "Asesoria de compra", child: data },
      answer: `${intro}\n${guidance}\n${safety}\nPara confirmarlo mejor dime ${ask}. Si prefieres, te dejo el caso listo para un asesor, o puedes ver el catálogo y hacer el test "Encuentra tu silla ideal", o continuar por WhatsApp con foto de la silla o del asiento del carro.`,
    });
  }

  function seatReviewReply() {
    return withAdvisorMeta({
      intent: "seat-review",
      confidence: 0.84,
      action: "case",
      capture: { service: "Revision de seguridad", priority: "alta" },
      answer: "Para saber si una silla aún se puede usar necesitamos revisar etiqueta, modelo, fecha de fabricación/vencimiento, historial de choques y que estén todas sus piezas completas. Si falta alguno de esos datos, no conviene adivinar: una silla vencida o accidentada no protege igual aunque se vea bien. Puedes enviarnos fotos de la etiqueta y de la silla, o reservar una revisión para confirmarlo con seguridad.",
    });
  }

  function cleaningReply() {
    return withAdvisorMeta({
      intent: "cleaning",
      confidence: 0.86,
      action: "book",
      capture: { service: "Limpieza y desinfeccion", priority: "media" },
      answer: "Si quieres lavar la silla, primero revisa el manual del fabricante. Muchas telas se pueden limpiar de forma controlada, pero el arnés y las correas no se deben lavar agresivamente ni remojar porque pueden perder resistencia. Nosotros revisamos la silla, limpiamos y desinfectamos lo que corresponde, y te decimos qué partes conviene tratar con cuidado. Puedes reservar un horario o continuar por WhatsApp.",
    });
  }

  function bookingReply() {
    return withAdvisorMeta({
      intent: "booking",
      confidence: 0.9,
      action: "book",
      capture: { service: "Revision de seguridad", priority: "alta" },
      answer: "Claro. Puedes usar el calendario de la página para escoger servicio, fecha y horario disponible. Si es por instalación, revisión o limpieza, agrega el modelo de la silla y del auto para que lleguemos preparados. También puedes continuar por WhatsApp si necesitas confirmar algo antes de reservar.",
    });
  }

  function priceReply() {
    return withAdvisorMeta({
      intent: "price",
      confidence: 0.9,
      action: "whatsapp",
      capture: { service: "Cotizacion", priority: "media" },
      answer: "Agrega el producto que te interesa al carrito de la tienda y te confirmamos precio, disponibilidad y si necesitas instalación, todo por WhatsApp antes de cobrarte nada.",
    });
  }

  function serviceReply(raw) {
    const text = normalizeText(raw);
    const service = /\blimpiez|lavado|desinfectar\b/.test(text) ? "Limpieza y desinfeccion"
      : /\brevis|cheque\b/.test(text) ? "Revision de seguridad"
        : /\basesoria|elegir|compra\b/.test(text) ? "Asesoria de compra"
          : "Instalacion profesional";
    return withAdvisorMeta({
      intent: "service",
      confidence: 0.86,
      action: "book",
      capture: { service, priority: service.includes("Revision") ? "alta" : "media" },
      answer: `Sí, podemos ayudarte con ${service.toLowerCase()}. Para coordinar bien dime qué silla tienes, modelo del auto y zona donde estás. También puedes reservar un horario desde el calendario o continuar por WhatsApp con un asesor.`,
    });
  }

  function rentalReply() {
    return withAdvisorMeta({
      intent: "rental",
      confidence: 0.9,
      action: "book",
      capture: { service: "Alquiler", priority: "alta" },
      answer: "Sí, alquilamos silla de carro, booster, coche/stroller o corral para viajes. En la página de Alquiler verás solo las fechas y horarios que están publicados; eliges una opción y Glenda te confirma equipo, precio y logística por WhatsApp antes de reservarlo. También entregamos en el aeropuerto, tu hotel o tu casa.",
    });
  }

  function rentalEquipmentReply() {
    return withAdvisorMeta({
      intent: "rental-equipment",
      confidence: 0.87,
      action: "book",
      capture: { service: "Alquiler", priority: "alta" },
      answer: "Ese tipo de equipo (coche, corral o cuna) lo manejamos para alquiler de viajes, no está en la tienda para comprar. Se entrega limpio, revisado y dentro de su fecha de vigencia, en el aeropuerto, tu hotel o tu casa. En la página de Alquiler puedes ver las fechas publicadas o seguimos por WhatsApp.",
    });
  }

  function buyVsRentReply() {
    return {
      intent: "buy-vs-rent", confidence: 0.85, needsHuman: false, action: "guide", capture: { service: "Asesoria de compra" },
      answer: "Depende de cuánto la vayas a usar. Si es un viaje puntual (unos días de visita o vacaciones), casi siempre conviene alquilar: te sale más barato y no cargas con la silla después. Si es para el día a día, comprarla te conviene más a la larga. Un dato: si alquilas y después decides quedártela, te descontamos parte de lo pagado del alquiler. Cuéntame cuántos días la necesitas y te digo cuál te conviene más.",
    };
  }

  function stageChangeReply() {
    return withAdvisorMeta({
      intent: "stage-change",
      confidence: 0.85,
      action: "case",
      capture: { service: "Revision de seguridad", priority: "media" },
      answer: "Toca cambiar de etapa cuando pasa cualquiera de estas señales: superó el límite de peso o estatura que dice el fabricante, la cabeza le sobrepasa el respaldo (en modo contramarcha), o los hombros quedan por encima de las ranuras más altas del arnés. No hay una edad fija, cada silla y cada niño son distintos. Puedes hacer el test \"Encuentra tu silla ideal\" en la página o traerla para revisarla y confirmar si ya le toca la siguiente etapa.",
    });
  }

  function giftReply() {
    return {
      intent: "gift", confidence: 0.82, needsHuman: false, action: "guide", capture: { service: "Gift card" },
      answer: "Sí, tenemos gift cards para regalar, y también puedes regalar directamente una silla o un accesorio. Si no sabes cuál elegir, dinos la edad del bebé o niño que la va a usar y te ayudamos a armar el regalo. Mira la categoría Gift Card en la tienda o escríbenos por WhatsApp para coordinarlo.",
    };
  }

  function socialReply(ctx) {
    const principal = (ctx && ctx.instagram) || "https://www.instagram.com/carseatclinicc";
    const tienda = (ctx && ctx.instagramTienda) || "https://www.instagram.com/carseatclinic.shop";
    return {
      intent: "social", confidence: 0.8, needsHuman: false, action: "guide", capture: {},
      answer: `Claro, tenemos dos cuentas de Instagram: ${principal} con consejos de seguridad y novedades, y ${tienda} donde mostramos los productos de la tienda. Te esperamos por allá también.`,
    };
  }

  function crashReply() {
    return withAdvisorMeta({
      intent: "crash",
      confidence: 0.9,
      action: "case",
      capture: { service: "Revision por choque", priority: "urgente" },
      answer: "Si la silla estuvo en un choque, no la volvería a usar sin revisión. En choques moderados o fuertes normalmente se recomienda reemplazarla, aunque se vea bien por fuera. Guarda fotos, etiqueta, fecha del choque y modelo de silla. Te recomiendo continuar por WhatsApp o reservar una revisión para documentar el caso.",
    });
  }

  function thanksReply() {
    return {
      intent: "thanks", confidence: 0.8, needsHuman: false, action: "guide", capture: {},
      answer: "Con gusto. Si te queda otra duda sobre sillas, instalación, alquiler o limpieza, aquí estoy. Y cuando quieras, puedes cotizar o reservar por WhatsApp.",
    };
  }

  function hoursReply(ctx) {
    const h = (ctx && ctx.horario) ? ctx.horario : "Lunes a Sábado, horario de oficina";
    return {
      intent: "hours", confidence: 0.9, needsHuman: false, action: "guide", capture: {},
      answer: `Nuestro horario de atención es: ${h}. Puedes agendar una cita en la página o escribirnos por WhatsApp para coordinar.`,
    };
  }

  function locationReply(ctx) {
    const u = (ctx && ctx.ubicacion) ? ctx.ubicacion : "Ciudad de Panamá";
    return {
      intent: "location", confidence: 0.88, needsHuman: false, action: "guide", capture: {},
      answer: `Estamos en ${u}. En el Inicio, sección de Contacto, tienes el mapa y un código de Waze para llegar. También coordinamos instalación y entrega a domicilio; escríbenos por WhatsApp y confirmamos la zona.`,
    };
  }

  function shippingReply() {
    return withAdvisorMeta({
      intent: "shipping", confidence: 0.85, action: "whatsapp", capture: { service: "Envio" },
      answer: "Sí, hacemos envíos a todo el país. El costo y el tiempo dependen de la zona y del producto. Dime qué producto te interesa y a dónde lo necesitas, y lo confirmamos por WhatsApp.",
    });
  }

  function paymentReply() {
    return withAdvisorMeta({
      intent: "payment", confidence: 0.82, action: "whatsapp", capture: { service: "Consulta de pago" },
      answer: "El pago lo coordinamos al cerrar tu pedido por WhatsApp y te indicamos las opciones disponibles (por ejemplo transferencia, Yappy o efectivo, según acordemos). Pronto habilitaremos el pago con tarjeta directo en la web.",
    });
  }

  function warrantyReply() {
    return withAdvisorMeta({
      intent: "warranty", confidence: 0.82, action: "whatsapp", capture: { service: "Consulta de producto" },
      answer: "Trabajamos solo sillas nuevas, de marcas con normas internacionales de seguridad, y las revisamos antes de entregarlas. Nada usado ni reacondicionado. La garantía exacta depende del modelo; dime cuál te interesa y confirmamos marca, garantía y disponibilidad por WhatsApp.",
    });
  }

  function installHowReply() {
    return withAdvisorMeta({
      intent: "install-how", confidence: 0.8, action: "book", capture: { service: "Instalacion profesional", priority: "media" },
      answer: "La instalación correcta depende de la silla y del auto (ISOFIX/LATCH o cinturón de seguridad). Como guía general: la silla debe quedar firme (que no se mueva más de 2 a 3 cm), el arnés ajustado sin holgura y el broche del pecho a la altura de las axilas. Los bebés deben ir a contramarcha (mirando hacia atrás) el mayor tiempo posible. Nosotros te la instalamos y te enseñamos a usarla: puedes reservar una instalación o continuar por WhatsApp con foto de la silla y del asiento del carro.",
    });
  }

  function greetingReply() {
    return {
      intent: "greeting",
      confidence: 0.75,
      needsHuman: false,
      action: "guide",
      capture: {},
      answer: "Hola, ¿necesitas cotizar, alquilar o instalar/revisar una silla? También puedo orientarte para elegir la adecuada.",
    };
  }

  function unknownReply() {
    return withAdvisorMeta({
      intent: "unknown",
      confidence: 0.35,
      action: "whatsapp",
      capture: { service: "Consulta general", priority: "media" },
      answer: "Puedo ayudarte con dudas sobre sillas de carro, boosters, instalación, revisión, limpieza, alquiler de equipo para viajes, envíos, horario, ubicación, formas de pago y citas. No quiero adivinar si faltan datos, así que también puedes continuar por WhatsApp con un asesor.",
    });
  }

  function generateSmartReply(text, ctx) {
    const intent = detectIntent(text);
    if (intent === "greeting") return greetingReply();
    if (intent === "thanks") return thanksReply();
    if (intent === "hours") return hoursReply(ctx);
    if (intent === "location") return locationReply(ctx);
    if (intent === "shipping") return shippingReply();
    if (intent === "social") return socialReply(ctx);
    if (intent === "payment") return paymentReply();
    if (intent === "gift") return giftReply();
    if (intent === "warranty") return warrantyReply();
    if (intent === "buy-vs-rent") return buyVsRentReply();
    if (intent === "rental-equipment") return rentalEquipmentReply();
    if (intent === "rental") return rentalReply();
    if (intent === "stage-change") return stageChangeReply();
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
