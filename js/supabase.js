/* =====================================================================
   Car Seat Clinic — Capa de datos y autenticación (Supabase)
   No necesitas editar este archivo.
   Expone un objeto global "DB" con todo lo que la tienda necesita.
   ===================================================================== */

const DB = (function () {
  "use strict";

  let client = null;
  let ready = false; // ¿Supabase está configurado?

  // Inicializa el cliente si hay credenciales en CONFIG
  function init() {
    if (CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase) {
      client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
        auth: {
          persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
          // Lock "pass-through": evita el deadlock de navigator.locks que colgaba
          // las consultas/el login cuando había una sesión guardada.
          lock: (_name, _acquireTimeout, fn) => fn(),
        },
      });
      ready = true;
    }
    return ready;
  }

  function toArr(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim()) { try { const a = JSON.parse(v); return Array.isArray(a) ? a : []; } catch { return []; } }
    return [];
  }

  const LEADS_KEY = "csc_service_leads";
  function readLocalLeads() {
    try {
      const rows = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      return [];
    }
  }
  function writeLocalLeads(rows) {
    try { localStorage.setItem(LEADS_KEY, JSON.stringify(rows)); } catch (e) {}
  }
  function normalizeLead(row) {
    const details = row.details || row.detalles || {};
    return {
      id: row.id || `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: row.type || row.tipo || "consulta",
      status: row.status || row.estado || "nuevo",
      source: row.source || row.origen || "web",
      priority: row.priority || row.prioridad || "media",
      service: row.service || row.servicio || "Consulta general",
      name: row.name || row.nombre || "",
      phone: row.phone || row.telefono || "",
      date: row.date || row.fecha || "",
      slot: row.slot || row.horario || "",
      message: row.message || row.mensaje || "",
      details,
      session_id: row.session_id || "",
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || row.created_at || new Date().toISOString(),
    };
  }
  function leadToRow(lead) {
    const normalized = normalizeLead(lead);
    return {
      id: normalized.id,
      tipo: normalized.type,
      estado: normalized.status,
      origen: normalized.source,
      prioridad: normalized.priority,
      servicio: normalized.service,
      nombre: normalized.name || null,
      telefono: normalized.phone || null,
      fecha: normalized.date || null,
      horario: normalized.slot || null,
      mensaje: normalized.message || null,
      detalles: normalized.details || {},
      session_id: normalized.session_id || null,
      created_at: normalized.created_at,
      updated_at: new Date().toISOString(),
    };
  }

  // Normaliza una fila de la base de datos al formato que usa la tienda
  function normalize(row) {
    const imagenes = toArr(row.images);
    return {
      id: row.id,
      nombre: row.name,
      categoria: row.category,
      marca: row.brand || "",
      recomendado: row.fit || "",
      precio: Number(row.price),
      antes: row.compare_at ? Number(row.compare_at) : 0,
      badge: row.badge || "",
      imagen: row.image_url || imagenes[0] || "",
      imagenes: imagenes,
      caracteristicas: toArr(row.features),
      descripcion: row.description || "",
      stock: Number(row.stock ?? 0),
      activo: row.active !== false,
    };
  }

  /* ---------- Productos ---------- */
  async function getProducts() {
    if (!ready) {
      // Modo demo: usa los productos de muestra de data.js
      return (typeof PRODUCTOS_DEMO !== "undefined" ? PRODUCTOS_DEMO : []).map((p) => ({ ...p, activo: true }));
    }
    const { data, error } = await client
      .from("products").select("*").eq("active", true).order("sort", { ascending: true });
    if (error) { console.error(error); return []; }
    return data.map(normalize);
  }

  // Versión para el panel admin (incluye los desactivados)
  async function getProductsAdmin() {
    if (!ready) return [];
    const { data, error } = await client
      .from("products").select("*").order("sort", { ascending: true });
    if (error) throw error;
    return data.map((r) => ({ ...normalize(r), activo: r.active !== false, sort: r.sort }));
  }

  async function saveProduct(p) {
    if (!ready) throw new Error("Base de datos no conectada");
    const imagenes = Array.isArray(p.imagenes) ? p.imagenes : [];
    const row = {
      id: p.id, name: p.nombre, category: p.categoria, price: p.precio,
      compare_at: p.antes || null, badge: p.badge || null,
      image_url: imagenes[0] || p.imagen || null,
      images: imagenes,
      features: Array.isArray(p.caracteristicas) ? p.caracteristicas : [],
      description: p.descripcion || null, stock: p.stock, active: p.activo, sort: p.sort || 0,
      brand: p.marca || null, fit: p.recomendado || null,
    };
    const { error } = await client.from("products").upsert(row);
    if (error) throw error;
  }

  /* ---------- Chat con IA ---------- */
  // Guarda un mensaje del chat (lo usa para captar consultas aunque la IA no esté lista)
  async function guardarMensaje(session_id, rol, mensaje, nombre) {
    if (!CONFIG.chat?.guardarConversaciones) return;
    if (!ready) return;
    try { await client.from("conversaciones").insert({ session_id, rol, mensaje, nombre: nombre || null }); } catch (e) {}
  }
  // Pregunta a la IA (vía Edge Function segura). Devuelve { answer }.
  async function preguntarIA(messages) {
    if (!CONFIG.chat?.iaActiva) throw new Error("IA no activa");
    if (!ready) throw new Error("DEMO");
    // Nombre de la Edge Function (en Supabase quedó como "super-api").
    const fnName = CONFIG.chat?.funcion || "asistente";
    const { data, error } = await client.functions.invoke(fnName, { body: { messages } });
    if (error) throw error;
    return data;
  }
  // Conversaciones para el CRM (solo admin)
  async function getConversaciones() {
    if (!ready) return [];
    const { data, error } = await client.from("conversaciones").select("*").order("created_at", { ascending: true });
    if (error) throw error; return data || [];
  }

  /* ---------- CRM inteligente: citas, revisiones y consultas IA ---------- */
  // Si la solicitud no se puede guardar en Supabase, queda solo en ESTE
  // navegador y el dueño nunca la ve. Antes fallaba en silencio; ahora lo
  // avisa en la consola para que se pueda arreglar.
  let crmAvisado = false;
  function avisarCrmCaido(error) {
    if (crmAvisado) return;
    crmAvisado = true;
    const msg = (error && (error.message || error.msg)) || String(error || "");
    console.warn(
      "[Car Seat Clinic] La solicitud NO se guardó en el CRM y quedó solo en este navegador.\n" +
      "Motivo: " + msg + "\n" +
      "Si dice 'row-level security', falta correr supabase-crm-atencion.sql en Supabase → SQL Editor."
    );
  }

  async function guardarLead(lead) {
    const normalized = normalizeLead(lead);
    const row = leadToRow(normalized);
    if (ready && CONFIG.crm?.guardarSolicitudes) {
      try {
        const { error } = await client.from("crm_leads").insert(row);
        if (!error) return normalized;
        avisarCrmCaido(error);
      } catch (e) { avisarCrmCaido(e); }
    }
    const rows = readLocalLeads();
    const existing = rows.findIndex((item) => item.id === normalized.id);
    if (existing >= 0) rows[existing] = normalized;
    else rows.unshift(normalized);
    writeLocalLeads(rows.slice(0, 80));
    return normalized;
  }

  async function getServiceLeads() {
    const localRows = readLocalLeads().map(normalizeLead);
    if (!ready || !CONFIG.crm?.guardarSolicitudes) return localRows;
    try {
      const { data, error } = await client.from("crm_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const remoteRows = (data || []).map(normalizeLead);
      /* Si una actualización no llegó al servidor (por falta de señal o
         permisos), conservamos la copia más reciente de este navegador.
         Antes la fila remota ocultaba esa copia local al recargar y parecía
         que el cambio se había guardado cuando en realidad se perdía. */
      const localById = new Map(localRows.map((row) => [row.id, row]));
      const merged = remoteRows.map((remote) => {
        const local = localById.get(remote.id);
        const localTime = new Date(local?.updated_at || 0).getTime();
        const remoteTime = new Date(remote.updated_at || 0).getTime();
        return local && localTime > remoteTime ? local : remote;
      });
      const seen = new Set(remoteRows.map((row) => row.id));
      return merged.concat(localRows.filter((row) => !seen.has(row.id)));
    } catch (e) {
      avisarCrmCaido(e);
      return localRows;
    }
  }

  async function updateLeadStatus(id, status, currentLead) {
    return updateLead(id, { status }, currentLead);
  }

  // Actualiza campos de una solicitud (estado, notas/seguimiento en details, etc.).
  // Siempre deja una copia local de respaldo y devuelve si Supabase confirmó
  // el cambio para que el CRM no prometa algo que el servidor rechazó.
  async function updateLead(id, patch, currentLead) {
    const rows = readLocalLeads();
    let item = rows.find((row) => row.id === id);
    if (!item && currentLead) {
      item = normalizeLead(currentLead);
      rows.unshift(item);
    }
    let savedLocally = false;
    if (item) {
      if (patch.status !== undefined) item.status = patch.status;
      if (patch.details !== undefined) item.details = patch.details;
      if (patch.priority !== undefined) item.priority = patch.priority;
      item.updated_at = new Date().toISOString();
      writeLocalLeads(rows);
      savedLocally = true;
    }
    const usesRemote = ready && CONFIG.crm?.guardarSolicitudes;
    if (!usesRemote) return { savedLocally, savedToServer: false, offline: true };

    const row = { updated_at: new Date().toISOString() };
    if (patch.status !== undefined) row.estado = patch.status;
    if (patch.details !== undefined) row.detalles = patch.details;
    if (patch.priority !== undefined) row.prioridad = patch.priority;
    if (ready && CONFIG.crm?.guardarSolicitudes) {
      try {
        const { error } = await client.from("crm_leads").update(row).eq("id", id);
        if (error) {
          avisarCrmCaido(error);
          return { savedLocally, savedToServer: false, error };
        }
        return { savedLocally, savedToServer: true };
      } catch (error) {
        avisarCrmCaido(error);
        return { savedLocally, savedToServer: false, error };
      }
    }
  }

  // Inicia un pago con la pasarela del banco (vía Edge Function segura).
  // Devuelve { url } a donde redirigir al cliente para pagar.
  async function crearPago(order) {
    if (!ready) throw new Error("DEMO");
    const { data, error } = await client.functions.invoke("crear-pago", { body: order });
    if (error) throw error;
    return data;
  }

  // Sube una foto al almacenamiento y devuelve su URL pública
  async function uploadImage(file) {
    if (!ready) throw new Error("DEMO");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await client.storage.from("productos").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = client.storage.from("productos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function deleteProduct(id) {
    if (!ready) throw new Error("Base de datos no conectada");
    const { error } = await client.from("products").delete().eq("id", id);
    if (error) throw error;
  }

  /* ---------- Pedidos ---------- */
  async function placeOrder(items, customer) {
    if (!ready) throw new Error("DEMO");
    const p_items = items.map((i) => ({ id: i.id, qty: i.qty }));
    const { data, error } = await client.rpc("place_order", { p_items, p_customer: customer });
    if (error) throw error;
    return data; // id del pedido
  }

  async function getMyOrders() {
    if (!ready) return [];
    const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error; return data || [];
  }

  async function updateOrderStatus(id, status) {
    if (!ready) throw new Error("DEMO");
    const { error } = await client.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  }

  /* ---------- Novedades de Instagram (CRM) ---------- */
  // La web usa nombres en español; la tabla mantiene nombres cortos en inglés.
  // Esta conversión deja el resto del sitio sencillo y evita duplicar lógica.
  function normalizeInstagramPost(row = {}) {
    return {
      id: row.id || null,
      enlace: row.url || row.enlace || "",
      titulo: row.title || row.titulo || "Nuevo en Instagram",
      texto: row.message || row.texto || "",
      // Una foto propia es opcional. Sirve para que la tarjeta cargue rápido
      // y se vea igual de bien aunque Instagram cambie su incrustado.
      imagen: row.image_url || row.imagen || "",
      activo: row.active !== undefined ? Boolean(row.active) : row.activo !== false,
      destacado: row.featured !== undefined ? Boolean(row.featured) : Boolean(row.destacado),
      ocultarEl: row.expires_at || row.ocultarEl || null,
      created_at: row.created_at || null,
      updated_at: row.updated_at || row.created_at || null,
    };
  }

  // Aunque el visitante normal ya está protegido por RLS, una persona admin
  // puede leer todos los registros. Esta segunda barrera garantiza que una
  // publicación oculta o vencida nunca se pinte en la portada.
  function isPublicInstagramPost(post) {
    if (!post || !post.activo) return false;
    if (!post.ocultarEl) return true;
    const expiresAt = new Date(post.ocultarEl).getTime();
    return Number.isFinite(expiresAt) && expiresAt > Date.now();
  }

  // Consulta pública: la política de Supabase ya deja pasar únicamente lo que
  // está activo y no vencido. Si la tabla aún no existe, la portada conserva
  // su bloque normal de Instagram sin mostrar un error al visitante.
  async function getInstagramPosts() {
    if (!ready) return [];
    const { data, error } = await client
      .from("instagram_posts")
      .select("*")
      // La consulta también se limita explícitamente a lo público. Es
      // importante cuando quien visita la portada es una administradora,
      // porque ese perfil puede leer el historial completo por RLS.
      .eq("active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(6);
    if (error) {
      console.warn("[Car Seat Clinic] No se pudieron cargar las novedades de Instagram.", error.message || error);
      return [];
    }
    return (data || []).map(normalizeInstagramPost).filter(isPublicInstagramPost);
  }

  // Consulta del CRM: incluye también los anuncios ocultos y vencidos.
  async function getInstagramPostsAdmin() {
    if (!ready) return [];
    const { data, error } = await client
      .from("instagram_posts")
      .select("*")
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(normalizeInstagramPost);
  }

  async function saveInstagramPost(post) {
    if (!ready) throw new Error("Base de datos no conectada");
    const item = normalizeInstagramPost(post);
    // Guardar y cambiar la destacada sucede en UNA operación del servidor.
    // Así, si algo falla, la novedad anterior no desaparece de la web.
    const { data, error } = await client.rpc("save_instagram_post", {
      p_id: item.id,
      p_url: item.enlace,
      p_title: item.titulo || "Nuevo en Instagram",
      p_message: item.texto || null,
      p_image_url: item.imagen || null,
      p_active: item.activo,
      p_featured: item.activo && item.destacado,
      p_expires_at: item.ocultarEl || null,
    }).single();
    if (error) throw error;
    return normalizeInstagramPost(data);
  }

  async function deleteInstagramPost(id) {
    if (!ready) throw new Error("Base de datos no conectada");
    const { error } = await client.from("instagram_posts").delete().eq("id", id);
    if (error) throw error;
  }

  /* ---------- Disponibilidad de alquiler ---------- */
  function normalizeRentalAvailability(row = {}) {
    const slots = Array.isArray(row.slots) ? row.slots : toArr(row.slots);
    return {
      id: row.id || null,
      equipo: row.equipment || row.equipo || "Todos los equipos",
      inicio: row.start_date || row.inicio || "",
      fin: row.end_date || row.fin || "",
      horarios: slots.map((slot) => String(slot || "").trim()).filter(Boolean),
      nota: row.note || row.nota || "",
      activo: row.active !== undefined ? Boolean(row.active) : row.activo !== false,
      created_at: row.created_at || null,
      updated_at: row.updated_at || row.created_at || null,
    };
  }

  function rentalAvailabilityRow(item = {}) {
    const normalized = normalizeRentalAvailability(item);
    return {
      equipment: normalized.equipo || "Todos los equipos",
      start_date: normalized.inicio || null,
      end_date: normalized.fin || null,
      slots: normalized.horarios,
      note: normalized.nota || null,
      active: normalized.activo !== false,
    };
  }

  // Consulta pública: solo bloques activos y todavía útiles. La política RLS
  // también limita el resultado, para que la web nunca exponga datos privados.
  async function getRentalAvailability(equipment) {
    if (!ready) return [];
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const { data, error } = await client
      .from("rental_availability")
      .select("*")
      .eq("active", true)
      .gte("end_date", localToday)
      .order("start_date", { ascending: true });
    if (error) {
      console.warn("[Car Seat Clinic] No se pudo cargar la disponibilidad de alquiler.", error.message || error);
      return [];
    }
    const requested = String(equipment || "").trim().toLowerCase();
    return (data || []).map(normalizeRentalAvailability).filter((item) =>
      item.activo && (!requested || item.equipo.toLowerCase() === "todos los equipos" || item.equipo.toLowerCase() === requested)
    );
  }

  // El CRM ve también los bloques ocultos o vencidos para poder reactivarlos
  // o corregirlos sin tener que volver a escribirlos.
  async function getRentalAvailabilityAdmin() {
    if (!ready) return [];
    const { data, error } = await client
      .from("rental_availability")
      .select("*")
      .order("start_date", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(normalizeRentalAvailability);
  }

  async function saveRentalAvailability(item) {
    if (!ready) throw new Error("Base de datos no conectada");
    const row = rentalAvailabilityRow(item);
    let response;
    if (item && item.id) {
      response = await client.from("rental_availability").update(row).eq("id", item.id).select().single();
    } else {
      response = await client.from("rental_availability").insert(row).select().single();
    }
    if (response.error) throw response.error;
    return normalizeRentalAvailability(response.data);
  }

  /* ---------- Autenticación ---------- */
  async function signUp(email, password, meta) {
    if (!ready) throw new Error("DEMO");
    return client.auth.signUp({ email, password, options: { data: meta || {} } });
  }

  async function subscribe(sub) {
    if (!ready) throw new Error("DEMO");
    const { error } = await client.from("subscribers").insert(sub);
    if (error) throw error;
  }
  async function signIn(email, password) {
    if (!ready) throw new Error("DEMO");
    return client.auth.signInWithPassword({ email, password });
  }
  async function signInGoogle() {
    if (!ready) throw new Error("DEMO");
    const redirectTo = window.location.origin + window.location.pathname;
    return client.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  }
  async function signOut() { if (ready) await client.auth.signOut(); }

  async function getUser() {
    if (!ready) return null;
    const { data } = await client.auth.getUser();
    return data ? data.user : null;
  }

  async function getProfile() {
    if (!ready) return null;
    const user = await getUser();
    if (!user) return null;
    const { data } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return data || { id: user.id, email: user.email, is_admin: false };
  }

  function onAuthChange(cb) {
    // Importante: diferimos con setTimeout para NO llamar a Supabase dentro
    // del callback de onAuthStateChange (eso causa un deadlock que cuelga el login).
    if (ready) client.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => cb(session ? session.user : null), 0);
    });
  }

  return {
    init, get ready() { return ready; },
    getProducts, getProductsAdmin, saveProduct, deleteProduct, uploadImage,
    placeOrder, getMyOrders, updateOrderStatus, crearPago,
    guardarMensaje, preguntarIA, getConversaciones,
    guardarLead, getServiceLeads, updateLeadStatus, updateLead,
    getInstagramPosts, getInstagramPostsAdmin, saveInstagramPost, deleteInstagramPost,
    getRentalAvailability, getRentalAvailabilityAdmin, saveRentalAvailability,
    signUp, signIn, signInGoogle, signOut, getUser, getProfile, onAuthChange, subscribe,
  };
})();
