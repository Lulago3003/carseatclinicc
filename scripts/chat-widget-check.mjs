/* Comprueba que el chat público conserve una sola salida clara a WhatsApp.
   Uso: node scripts/chat-widget-check.mjs */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const widget = readFileSync("js/chat-widget.js", "utf8");
const css = readFileSync("css/styles.css", "utf8");
const data = readFileSync("js/data.js", "utf8");

assert.match(widget, /function needsWhatsApp/);
assert.match(widget, /function whatsappLabel/);
assert.match(widget, /function compactAnswer/);
assert.match(widget, /class="chat__wa chat__wa--direct"/);
assert.match(widget, /respuestasRemotasEnChat === true && !handoff/);
assert.doesNotMatch(widget, /wa\.textContent = "WhatsApp"/);
assert.doesNotMatch(widget, /DB\.updateLead\(savedLead\.id/);
assert.match(widget, /Tema: \$\{reply\.capture\.service\}/);
assert.match(css, /\.chat__wa--direct/);
assert.match(css, /100dvh/);
assert.match(data, /respuestasRemotasEnChat: false/);

console.log("Chat widget check passed");
