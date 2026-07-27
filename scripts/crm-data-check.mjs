/* =====================================================================
   crm-data-check.mjs — prueba de protección de datos del CRM
   ---------------------------------------------------------------------
   Comprueba sin tocar Supabase que, si el servidor rechaza un cambio de
   estado o nota, el panel conserva una copia local y lo puede volver a
   mostrar al cargar la lista. Uso: node scripts/crm-data-check.mjs
   ===================================================================== */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const storage = new Map();
const localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
};

let serverRejectsUpdate = true;
let remoteRows = [{
  id: "lead_prueba", tipo: "consulta-ia", estado: "nuevo", origen: "asistente-web",
  prioridad: "media", servicio: "Consulta", nombre: "Ana", telefono: "60000000",
  fecha: null, horario: null, mensaje: "Necesito ayuda", detalles: {}, session_id: null,
  created_at: "2026-07-20T12:00:00.000Z", updated_at: "2026-07-20T12:00:00.000Z",
}];

const client = {
  from(table) {
    assert.equal(table, "crm_leads");
    return {
      update: () => ({ eq: async () => ({ error: serverRejectsUpdate ? { message: "permisos de prueba" } : null }) }),
      select: () => ({ order: async () => ({ data: remoteRows, error: null }) }),
    };
  },
};

const context = {
  CONFIG: {
    supabaseUrl: "https://prueba.supabase.co",
    supabaseAnonKey: "clave-prueba",
    crm: { guardarSolicitudes: true },
    chat: {},
  },
  window: { supabase: { createClient: () => client } },
  localStorage,
  console: { warn() {}, error() {} },
};

const source = readFileSync("js/supabase.js", "utf8") + "\nglobalThis.__DB_PRUEBA__ = DB;";
vm.runInNewContext(source, context, { filename: "js/supabase.js" });
const DB = context.__DB_PRUEBA__;
assert.equal(DB.init(), true, "debe inicializar el cliente de prueba");

const lead = {
  id: "lead_prueba", type: "consulta-ia", status: "contactado", source: "asistente-web",
  priority: "media", service: "Consulta", name: "Ana", phone: "60000000",
  date: "", slot: "", message: "Necesito ayuda", details: { nota_interna: "Llamar mañana" },
  created_at: "2026-07-20T12:00:00.000Z", updated_at: "2026-07-27T12:00:00.000Z",
};

const rejected = await DB.updateLead(lead.id, { status: lead.status, details: lead.details }, lead);
assert.equal(rejected.savedLocally, true, "debe conservar copia local si Supabase rechaza el cambio");
assert.equal(rejected.savedToServer, false, "no debe fingir que Supabase aceptó el cambio");

const visibleAfterReject = await DB.getServiceLeads();
assert.equal(visibleAfterReject.find((item) => item.id === lead.id)?.status, "contactado", "la copia local reciente debe seguir visible");
assert.equal(visibleAfterReject.find((item) => item.id === lead.id)?.details?.nota_interna, "Llamar mañana", "debe preservar la nota interna");

serverRejectsUpdate = false;
const accepted = await DB.updateLead(lead.id, { status: "cotizado" }, { ...lead, status: "cotizado" });
assert.equal(accepted.savedToServer, true, "debe informar cuando Supabase confirma el cambio");

console.log("CRM data check passed: respaldo local y confirmación del servidor funcionan.");
