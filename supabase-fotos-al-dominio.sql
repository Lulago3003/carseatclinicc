-- =====================================================================
--  TODO LO PUBLICO PASA AL DOMINIO DE LA CLIENTA
--  ---------------------------------------------------------------------
--  Varios productos tenian sus fotos apuntando a
--  lulago3003.github.io, que es nuestra copia de trabajo. Las fotos son
--  las mismas y ya estan en carseatclinic.com.pa: lo unico que cambia
--  es por que puerta se piden.
--
--  Esto NO borra ninguna foto ni ningun producto. Solo reemplaza un
--  texto por otro dentro de la direccion. Se puede correr las veces que
--  haga falta.
--
--  Cómo se corre: Supabase -> SQL Editor -> pegar -> RUN.
-- =====================================================================

-- ---------- Productos: foto principal ----------
update public.products
set image_url = replace(image_url,
      'https://lulago3003.github.io/carseatclinicc/',
      'https://carseatclinic.com.pa/')
where image_url like '%lulago3003.github.io%';

-- ---------- Productos: galeria de fotos ----------
update public.products
set images = (
  select jsonb_agg(
    replace(valor #>> '{}',
      'https://lulago3003.github.io/carseatclinicc/',
      'https://carseatclinic.com.pa/')
    order by orden
  )
  from jsonb_array_elements(images) with ordinality as t(valor, orden)
)
where images::text like '%lulago3003.github.io%';

-- ---------- Blog: portada y cuerpo ----------
update public.blog_posts
set cover = replace(cover,
      'https://lulago3003.github.io/carseatclinicc/',
      'https://carseatclinic.com.pa/')
where cover like '%lulago3003.github.io%';

update public.blog_posts
set body = replace(body,
      'https://lulago3003.github.io/carseatclinicc/',
      'https://carseatclinic.com.pa/')
where body like '%lulago3003.github.io%';

-- =====================================================================
--  COMPROBACION: las tres consultas deben devolver 0 filas
-- =====================================================================
select 'productos' as tabla, id, name from public.products
where image_url like '%github.io%' or images::text like '%github.io%'
union all
select 'blog', id::text, title from public.blog_posts
where cover like '%github.io%' or body like '%github.io%';
