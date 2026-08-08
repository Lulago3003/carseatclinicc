-- =====================================================================
--  PRODUCTO: Graco Extend2Fit (silla convertible)
--  ---------------------------------------------------------------------
--  Antes de correrlo hay DOS cosas que tienes que cambiar abajo:
--
--    1. EL PRECIO. Está en 0, que en la tienda se muestra como
--       "Consultar precio" y no como gratis. Pon el precio de venta de
--       Car Seat Clinic. No puse los US$239.99 de Amazon a propósito:
--       ese es el precio en Estados Unidos, sin el flete ni el margen
--       del negocio, y poner ahí un precio que no es el suyo terminaría
--       en un reclamo de una familia.
--
--    2. LA FOTO. Está vacía. Hay que subirla desde el CRM (Productos ->
--       editar -> Imágenes). No se puede usar la foto de Amazon: es de
--       ellos. Graco publica fotos para vendedores en su sitio de
--       marca, o se le toma una foto al producto en el local, que
--       además vende más porque se ve real.
--
--  El video se llena después desde el CRM, en el campo nuevo
--  "Video del fabricante". Se corre primero supabase-video-productos.sql.
--
--  Cómo se corre: Supabase -> SQL Editor -> pegar -> RUN.
-- =====================================================================

insert into public.products
  (id, name, category, brand, fit, price, image_url, images,
   features, description, stock, active, sort, video_url)
values (
  'graco-extend2fit',
  'Graco Extend2Fit — Silla convertible',
  'convertibles',
  'Graco',
  'A contramarcha 1.8–22.7 kg · Hacia adelante 10–29.5 kg',
  0,                      -- <<< 1. PON AQUÍ EL PRECIO DE VENTA
  null,                   -- <<< 2. LA FOTO SE SUBE DESDE EL CRM
  '[]'::jsonb,
  '["Panel que se extiende en 4 posiciones para más espacio para las piernas",
    "Se usa a contramarcha y luego hacia adelante, sin comprar otra silla",
    "Arnés de 5 puntos con ajuste sin necesidad de reenhebrar",
    "Instalación con LATCH o con el cinturón del carro",
    "Respaldo reclinable en varias posiciones",
    "Portavasos removibles y lavables"]'::jsonb,
  'Silla convertible que acompaña al niño desde recién nacido hasta que ya no la necesita. Su panel extensible da más espacio para las piernas, que es lo que suele hacer que las familias pasen al niño hacia adelante antes de tiempo. Te la instalamos y te enseñamos a dejarla bien puesta.',
  0,                      -- stock: ponlo cuando tengas unidades
  true,
  0,
  null
)
on conflict (id) do update set
  name        = excluded.name,
  category    = excluded.category,
  brand       = excluded.brand,
  fit         = excluded.fit,
  features    = excluded.features,
  description = excluded.description;
  -- Ojo: al volver a correrlo NO se pisan el precio, la foto, el stock
  -- ni el video, para no borrar lo que ya se haya cargado desde el CRM.
