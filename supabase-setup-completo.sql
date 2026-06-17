-- =====================================================================
-- Car Seat Clinic Center — CONFIGURACIÓN COMPLETA (todo en uno)
-- ---------------------------------------------------------------------
-- Corre este archivo UNA vez en: Supabase → SQL Editor → New query → Run.
-- Reúne categorías, marcas, fotos/características, almacenamiento y deja
-- 3 productos completos listos para mostrar. Seguro de re-ejecutar.
-- (Reemplaza a supabase-migracion-2.sql y supabase-migracion-3.sql.)
-- =====================================================================

-- 1) Campos nuevos del producto
alter table public.products add column if not exists brand    text;
alter table public.products add column if not exists fit      text;
alter table public.products add column if not exists images   jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists features jsonb not null default '[]'::jsonb;

-- 2) Recategorizar y completar los productos existentes
update public.products set category='recien-nacidos', brand='Chicco', fit='0–13 kg · 0–15 meses' where id='p1';
update public.products set category='giro-360',        brand='Britax', fit='0–36 kg · 0–12 años'  where id='p2';
update public.products set category='booster',         brand='Graco',  fit='15–36 kg · 4–12 años' where id='p3';
update public.products set category='accesorios' where id in ('p4','p5','p6','p7','p8');

-- 3) Productos nuevos (para mostrar todas las categorías)
insert into public.products (id, name, category, brand, fit, price, compare_at, badge, description, stock, sort) values
  ('p10','Silla convertible (Grupo 1)','convertibles','Evenflo','9–18 kg · 1–4 años',229,null,null,'Crece con tu hijo. Múltiples posiciones de reclinado y arnés de 5 puntos.',6,10),
  ('p11','Silla combinada 2 en 1','combinadas','Safety 1st','9–36 kg · 1–12 años',259,null,null,'Se usa con arnés y luego como booster. Una sola silla para varias etapas.',4,11),
  ('p12','Kit de limpieza y desinfección','limpieza',null,null,18,null,null,'Productos seguros para limpiar y desinfectar la silla sin dañar sus materiales.',14,12),
  ('p13','Gift Card Car Seat Clinic','gift-cards',null,'Ideal para regalar',50,null,null,'Tarjeta de regalo para usar en productos o servicios. El regalo perfecto para una familia.',99,13)
on conflict (id) do nothing;

-- 4) ⭐ 3 productos COMPLETOS con características (listos para mostrar)
update public.products set
  badge='Más vendido',
  description='Silla para recién nacidos hasta ~13 kg. Se instala a contramarcha, la posición más segura para los primeros meses. Ligera y fácil de transportar.',
  features='["Instalación a contramarcha (lo más seguro)","Arnés de 5 puntos acolchado","Reductor para recién nacido","Manija de transporte ergonómica","Compatible con base ISOFIX"]'::jsonb
  where id='p1';

update public.products set
  badge='Oferta', compare_at=379,
  description='Acompaña al niño de 0 a 36 kg en una sola silla. El giro 360° te permite sentarlo y bajarlo sin esfuerzo, y se usa a favor o a contramarcha según la edad.',
  features='["Giro 360° para sentar y bajar al niño fácil","Uso a favor y a contramarcha","Respaldo reclinable en varias posiciones","Anclajes ISOFIX + pata de apoyo","Acompaña de 0 a 36 kg"]'::jsonb
  where id='p2';

update public.products set
  description='Eleva al niño para que el cinturón del auto quede en la posición correcta sobre el hombro y la cadera. Reposacabezas ajustable que crece con tu hijo.',
  features='["Eleva al niño para el cinturón en posición correcta","Reposacabezas ajustable en altura","Protección lateral reforzada","Funda lavable a máquina","Para niños de 15 a 36 kg"]'::jsonb
  where id='p3';

-- 5) Newsletter (suscriptores)
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  name text, email text not null, whatsapp text, source text,
  created_at timestamptz not null default now()
);
alter table public.subscribers enable row level security;
drop policy if exists "subs: cualquiera se suscribe" on public.subscribers;
create policy "subs: cualquiera se suscribe" on public.subscribers for insert with check (true);
drop policy if exists "subs: admin lee" on public.subscribers;
create policy "subs: admin lee" on public.subscribers for select using (public.is_admin());

-- 6) Almacenamiento para subir fotos de productos
insert into storage.buckets (id, name, public) values ('productos','productos', true)
on conflict (id) do nothing;
drop policy if exists "productos: lectura publica" on storage.objects;
create policy "productos: lectura publica" on storage.objects for select using (bucket_id='productos');
drop policy if exists "productos: admin sube" on storage.objects;
create policy "productos: admin sube" on storage.objects for insert with check (bucket_id='productos' and public.is_admin());
drop policy if exists "productos: admin actualiza" on storage.objects;
create policy "productos: admin actualiza" on storage.objects for update using (bucket_id='productos' and public.is_admin());
drop policy if exists "productos: admin borra" on storage.objects;
create policy "productos: admin borra" on storage.objects for delete using (bucket_id='productos' and public.is_admin());

-- ¡Listo! Recarga la tienda: verás categorías, marcas, filtros y 3 productos
-- con sus características. Sube las fotos desde el panel (Editar → Subir fotos).
