import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ChatAssistant = require("../js/chat-assistant.js");

function reply(text) {
  return ChatAssistant.generateSmartReply(text, { whatsapp: "50766743012" });
}

const ageReply = reply("Tengo una niña de 5 años, que silla puede usar?");
assert.equal(ageReply.intent, "seat-fit");
assert.equal(ageReply.needsHuman, true);
assert.match(ageReply.answer, /booster|combinada|arn[eé]s/i);
assert.match(ageReply.answer, /peso/i);
assert.match(ageReply.answer, /estatura|talla/i);
assert.equal(ageReply.action, "case");

const priceReply = reply("Cuanto cuesta la silla Joie?");
assert.equal(priceReply.intent, "price");
assert.equal(priceReply.needsHuman, true);
assert.match(priceReply.answer, /cotiz|WhatsApp/i);
assert.doesNotMatch(priceReply.answer, /\$[0-9]/);

const serviceReply = reply("Necesito instalar una silla en mi carro");
assert.equal(serviceReply.intent, "service");
assert.equal(serviceReply.needsHuman, true);
assert.match(serviceReply.answer, /instalaci[oó]n|revisi[oó]n/i);
assert.equal(serviceReply.action, "book");
assert.ok(serviceReply.capture?.service);

const washReply = reply("Puedo lavar las correas de la silla con jabon?");
assert.equal(washReply.intent, "cleaning");
assert.equal(washReply.needsHuman, true);
assert.match(washReply.answer, /arn[eé]s|correas/i);
assert.match(washReply.answer, /manual|fabricante|lavado/i);
assert.equal(washReply.action, "book");

const reviewReply = reply("Mi silla tiene 6 anos y no se si aun se puede usar");
assert.equal(reviewReply.intent, "seat-review");
assert.equal(reviewReply.needsHuman, true);
assert.match(reviewReply.answer, /etiqueta|vencimiento|modelo/i);
assert.equal(reviewReply.action, "case");

const bookingReply = reply("Quiero reservar una cita para revisar mi silla manana");
assert.equal(bookingReply.intent, "booking");
assert.equal(bookingReply.needsHuman, true);
assert.match(bookingReply.answer, /calendario|reservar|horario/i);
assert.equal(bookingReply.action, "book");

const greetingReply = reply("hola");
assert.equal(greetingReply.needsHuman, false);
assert.match(greetingReply.answer, /edad|peso|auto/i);
assert.equal(greetingReply.action, "guide");

console.log("Chat assistant check passed");
