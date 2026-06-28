import { readFileSync } from "node:fs";

const files = {
  html: readFileSync("admin.html", "utf8"),
  js: readFileSync("js/admin.js", "utf8"),
  css: readFileSync("css/styles.css", "utf8"),
};

const checks = [
  ["dashboard tab", files.html.includes('data-tab="dashboard"')],
  ["dashboard panel", files.html.includes('id="tab-dashboard"')],
  ["inventory filters", files.html.includes('id="stockFilter"') && files.html.includes('id="categoryFilter"')],
  ["order filter", files.html.includes('id="orderStatusFilter"')],
  ["agenda tab", files.html.includes('data-tab="agenda"') && files.html.includes('id="tab-agenda"')],
  ["agenda filters", files.html.includes('id="leadStatusFilter"') && files.html.includes('id="leadTypeFilter"')],
  ["dashboard renderer", files.js.includes("function renderDashboard")],
  ["product filters", files.js.includes("function getFilteredProducts")],
  ["order status flow", files.js.includes("pendiente_pago") && files.js.includes("listo_instalar")],
  ["whatsapp order action", files.js.includes("wa.me") && files.js.includes("order-whatsapp")],
  ["lead renderer", files.js.includes("function renderServiceLeads") && files.js.includes("lead-whatsapp")],
  ["calendar board", files.js.includes("function renderScheduleBoard") && files.css.includes(".schedule-board")],
  ["rental crm rendering", files.js.includes("function rentalSummary") && files.js.includes("lead-rental")],
  ["rental crm styles", files.css.includes(".lead-rental") && files.css.includes(".rental-kpi")],
  ["dashboard styles", files.css.includes(".admin-dashboard")],
  ["crm shell styles", files.css.includes(".admin-shell")],
  ["lead card styles", files.css.includes(".lead-card") && files.css.includes(".ai-intake")],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("CRM check failed:");
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`CRM check passed: ${checks.length}/${checks.length}`);
