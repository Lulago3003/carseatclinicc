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
      client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
      ready = true;
    }
    return ready;
  }

  // Normaliza una fila de la base de datos al formato que usa la tienda
  function normalize(row) {
    return {
      id: row.id,
      nombre: row.name,
      categoria: row.category,
      marca: row.brand || "",
      recomendado: row.fit || "",
      precio: Number(row.price),
      antes: row.compare_at ? Number(row.compare_at) : 0,
      badge: row.badge || "",
      imagen: row.image_url || "",
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
    const row = {
      id: p.id, name: p.nombre, category: p.categoria, price: p.precio,
      compare_at: p.antes || null, badge: p.badge || null, image_url: p.imagen || null,
      description: p.descripcion || null, stock: p.stock, active: p.activo, sort: p.sort || 0,
      brand: p.marca || null, fit: p.recomendado || null,
    };
    const { error } = await client.from("products").upsert(row);
    if (error) throw error;
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
    if (ready) client.auth.onAuthStateChange((_e, session) => cb(session ? session.user : null));
  }

  return {
    init, get ready() { return ready; },
    getProducts, getProductsAdmin, saveProduct, deleteProduct,
    placeOrder, getMyOrders, updateOrderStatus,
    signUp, signIn, signInGoogle, signOut, getUser, getProfile, onAuthChange, subscribe,
  };
})();
