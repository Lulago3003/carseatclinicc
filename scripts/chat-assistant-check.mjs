import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ChatAssistant = require("../js/chat-assistant.js");

function reply(text) {
  return ChatAssistant.generateSmartReply(text, { whatsapp: "50766743012" });
}

const ageReply = reply("Tengo una niña de 5 años, ¿qué silla puede usar?");
assert.equal(ageReply.intent, "seat-fit");
assert.equal(ageReply.needsHuman, true);
assert.match(ageReply.answer, /booster|combinada|arn[eé]s/i);
assert.match(ageReply.answer, /peso/i);
assert.match(ageReply.answer, /estatura|talla/i);

const priceReply = reply("¿Cuánto cuesta la silla Joie?");
assert.equal(priceReply.intent, "price");
assert.equal(priceReply.needsHuman, true);
assert.match(priceReply.answer, /cotiz|WhatsApp/i);
assert.doesNotMatch(priceReply.answer, /\$[0-9]/);

const serviceReply = reply("Necesito instalar una silla en mi carro");
assert.equal(serviceReply.intent, "service");
assert.equal(serviceReply.needsHuman, true);
assert.match(serviceReply.answer, /instalaci[oó]n|revisi[oó]n/i);

const greetingReply = reply("hola");
assert.equal(greetingReply.needsHuman, false);
assert.match(greetingReply.answer, /edad|peso|auto/i);

console.log("Chat assistant check passed");
