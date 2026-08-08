-- =====================================================================
--  VIDEO DEL FABRICANTE EN LA FICHA DEL PRODUCTO
--  ---------------------------------------------------------------------
--  Guarda SOLO el enlace del video (YouTube), no el archivo.
--
--  Por qué el enlace y no subir el video: un video de producto pesa
--  cientos de megas. Subirlo llenaría el almacenamiento y haría lenta
--  la página. Con el enlace, el video se ve igual dentro de la ficha,
--  no ocupa nada, y lo sigue sirviendo el fabricante desde YouTube.
--
--  Cómo se corre: entra a Supabase -> SQL Editor, pega esto y dale RUN.
--  Se puede correr varias veces sin problema.
-- =====================================================================

alter table public.products
  add column if not exists video_url text;

comment on column public.products.video_url is
  'Enlace de YouTube del video del producto. Se guarda el enlace, nunca el archivo.';
