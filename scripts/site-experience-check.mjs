import { readFileSync } from "node:fs";

const files = {
  html: readFileSync("index.html", "utf8"),
  css: readFileSync("css/styles.css", "utf8"),
  js: readFileSync("js/store.js", "utf8"),
  data: readFileSync("js/data.js", "utf8"),
  chat: readFileSync("js/chat-assistant.js", "utf8"),
};

const checks = [
  ["scroll progress markup", files.html.includes('id="scrollProgress"')],
  ["safe route section", files.html.includes('id="ruta-segura"')],
  ["safe route professional cards", files.html.includes("route-card__visual") && files.html.includes("route-card__icon")],
  ["safe route professional motion", files.css.includes("@keyframes routeIconFloat") && files.css.includes(".route-card__line")],
  ["safe route dynamic sparks", files.html.includes("route-card__spark") && files.css.includes(".route-card__spark") && files.css.includes("@keyframes routeSpark")],
  ["safe route animated path", files.css.includes(".route-card__line::before") && files.css.includes("@keyframes routePathDash")],
  ["safe route badge pulse", files.css.includes("@keyframes routeBadgePulse") && files.css.includes(".route-card:nth-child(2) .route-card__icon")],
  ["safe route reveal hover lift", files.css.includes(".route-card.reveal.is-visible:hover")],
  ["safe route reduced dynamic motion", files.css.includes(".route-card__icon, .route-card__num, .route-card__line::before, .route-card__spark")],
  ["safe route no large photos", !files.html.includes("route-card__photo") && !files.css.includes("routePhotoDrift")],
  ["quiz progress markup", files.html.includes('id="finderProgress"')],
  ["appointment planner markup", files.html.includes('id="appointmentSlots"') && files.html.includes("cita__stage")],
  ["appointment lead capture", files.js.includes("function selectedAppointmentSlot") && files.js.includes("guardarLead")],
  ["chat advisor actions", files.js.includes("renderAdvisorActions") && files.css.includes(".chat__actions")],
  ["safety tips strip", files.html.includes('class="safety-strip"')],
  ["contextual whatsapp data", files.html.includes('data-whatsapp-label')],
  ["motion tokens", files.css.includes("--ease-out-expo")],
  ["safe route styles", files.css.includes(".safe-route")],
  ["floating motion styles", files.css.includes(".motion-float")],
  ["quiz progress script", files.js.includes("function updateFinderProgress")],
  ["contextual whatsapp script", files.js.includes("function updateFloatingWhatsApp")],
  ["product stagger animation", files.js.includes("animateProductCards")],
  ["product image helper", files.js.includes("function productImageList")],
  ["product image fallback", files.js.includes("function setupMediaFallbacks") && files.css.includes(".card__fallback")],
  ["premium card markup", files.js.includes("card__peek") && files.js.includes("card__thumbs") && files.js.includes("card__thumb")],
  ["featured product card", files.js.includes("card--featured")],
  ["premium card styles", files.css.includes(".card__peek") && files.css.includes(".card__thumbs")],
  ["featured card styles", files.css.includes(".card--featured")],
  ["smart chat script", files.html.includes('src="js/chat-assistant.js"') && files.chat.includes("generateSmartReply")],
  ["smart chat fallback", files.js.includes("smartReply(text)") && files.js.includes("answerHtml")],
  ["smart chat quick actions", files.js.includes("quickActions") && files.css.includes(".chat__quick")],
  ["chat activation flags", files.data.includes("iaActiva") && files.data.includes("guardarConversaciones")],
  ["crm lead activation flag", files.data.includes("guardarSolicitudes")],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("Site experience check failed:");
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Site experience check passed: ${checks.length}/${checks.length}`);
