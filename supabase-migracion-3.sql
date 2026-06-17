-- =====================================================================
-- Car Seat Clinic Center — Migración 3 (varias fotos + características + subir imágenes)
-- ---------------------------------------------------------------------
-- Pégalo en: Supabase → SQL Editor → New query → Run. Seguro de re-ejecutar.
-- =====================================================================

-- 1) Campos nuevos en productos: varias fotos y varias características
alter table public.products add column if not exists images   jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists features jsonb not null default '[]'::jsonb;

-- 2) Almacenamiento para subir las fotos de los productos
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- Lectura pública de las fotos
drop policy if exists "productos: lectura publica" on storage.objects;
create policy "productos: lectura publica"
  on storage.objects for select using (bucket_id = 'productos');

-- Solo el admin puede subir / cambiar / borrar fotos
drop policy if exists "productos: admin sube" on storage.objects;
create policy "productos: admin sube"
  on storage.objects for insert with check (bucket_id = 'productos' and public.is_admin());

drop policy if exists "productos: admin actualiza" on storage.objects;
create policy "productos: admin actualiza"
  on storage.objects for update using (bucket_id = 'productos' and public.is_admin());

drop policy if exists "productos: admin borra" on storage.objects;
create policy "productos: admin borra"
  on storage.objects for delete using (bucket_id = 'productos' and public.is_admin());

-- ¡Listo! Ya puedes subir varias fotos y agregar características por producto.
