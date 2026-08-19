-- =====================================================================
--  LAS FOTOS DE LOS PRODUCTOS PASAN AL DOMINIO PROPIO
--  ---------------------------------------------------------------------
--  24 de 35 productos tenían la foto apuntando a
--  lulago3003.github.io, que es la copia vieja del sitio en GitHub
--  Pages. Funcionaba, pero deja el catálogo colgando de una dirección
--  que no es de la clienta: el día que se apague esa copia (que es lo
--  que conviene hacer, porque Google la ve como sitio duplicado), todas
--  esas fotos se caen.
--
--  Los archivos son los mismos y ya están en el dominio, así que solo
--  hay que cambiar la dirección.
--
--  Cómo se corre: Supabase -> SQL Editor -> pegar -> RUN.
--  Se puede correr varias veces sin problema.
-- =====================================================================

-- Foto principal
update public.products
set image_url = replace(image_url,
      'https://lulago3003.github.io/carseatclinicc/',
      'https://carseatclinic.com.pa/')
where image_url like 'https://lulago3003.github.io/carseatclinicc/%';

-- Galería de fotos (es una lista, hay que recorrerla)
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

-- Comprobación: debe devolver 0 filas
select id, name
from public.products
where image_url like '%github.io%'
   or images::text like '%github.io%';
