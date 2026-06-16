-- =====================================================================
-- Car Seat Clinic Center — Migración 2 (categorías, datos de producto y newsletter)
-- ---------------------------------------------------------------------
-- CÓMO USAR: Supabase → SQL Editor → New query → pega TODO → Run.
-- Es seguro ejecutarlo aunque ya tengas datos.
-- =====================================================================

-- 1) Nuevos campos de producto: Marca y "Recomendado para"
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists fit text;

-- 2) Recategorizar y completar los productos de ejemplo existentes
update public.products set category='recien-nacidos', brand='Chicco',     fit='0–13 kg · 0–15 meses' where id='p1';
update public.products set category='giro-360',       brand='Britax',     fit='0–36 kg · 0–12 años'  where id='p2';
update public.products set category='booster',        brand='Graco',      fit='15–36 kg · 4–12 años' where id='p3';
update public.products set category='accesorios'                                                       where id='p4';
update public.products set category='accesorios'                                                       where id in ('p5','p6','p7','p8');

-- 3) Productos nuevos para mostrar todas las categorías (puedes editarlos/borrarlos luego)
insert into public.products (id, name, category, brand, fit, price, compare_at, badge, description, stock, sort) values
  ('p10','Silla convertible (Grupo 1)','convertibles','Evenflo','9–18 kg · 1–4 años',229,null,null,'Crece con tu hijo. Múltiples posiciones de reclinado y arnés de 5 puntos.',6,10),
  ('p11','Silla combinada 2 en 1','combinadas','Safety 1st','9–36 kg · 1–12 años',259,null,null,'Se usa con arnés y luego como booster. Una sola silla para varias etapas.',4,11),
  ('p12','Kit de limpieza y desinfección','limpieza',null,null,18,null,null,'Productos seguros para limpiar y desinfectar la silla sin dañar sus materiales.',14,12),
  ('p13','Gift Card Car Seat Clinic','gift-cards',null,'Ideal para regalar',50,null,null,'Tarjeta de regalo para usar en productos o servicios. El regalo perfecto para una familia.',99,13)
on conflict (id) do nothing;

-- 4) Tabla de suscriptores (newsletter / afiliación)
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  whatsapp   text,
  source     text,
  created_at timestamptz not null default now()
);
alter table public.subscribers enable row level security;

drop policy if exists "subs: cualquiera se suscribe" on public.subscribers;
create policy "subs: cualquiera se suscribe"
  on public.subscribers for insert with check (true);

drop policy if exists "subs: admin lee" on public.subscribers;
create policy "subs: admin lee"
  on public.subscribers for select using (public.is_admin());

-- ¡Listo! Recarga tu tienda para ver las categorías y los productos nuevos.
