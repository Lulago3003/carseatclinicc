-- =====================================================================
-- Car Seat Clinic Center - Disponibilidad de alquiler publicada
-- ---------------------------------------------------------------------
-- Pega ESTE archivo una sola vez en Supabase -> SQL Editor -> Run.
-- La administradora crea los bloques de fechas y horarios que la web
-- puede mostrar. Los visitantes solo leen los bloques activos.
-- =====================================================================

create table if not exists public.rental_availability (
  id          uuid primary key default gen_random_uuid(),
  equipment   text not null default 'Todos los equipos',
  start_date  date not null,
  end_date    date not null,
  slots       text[] not null default array[]::text[],
  note        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint rental_availability_dates_check check (end_date > start_date),
  constraint rental_availability_slots_check check (cardinality(slots) > 0)
);

create index if not exists rental_availability_public_idx
  on public.rental_availability (active, equipment, start_date, end_date);

create or replace function public.set_rental_availability_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rental_availability_updated_at on public.rental_availability;
create trigger rental_availability_updated_at
  before update on public.rental_availability
  for each row execute function public.set_rental_availability_updated_at();

alter table public.rental_availability enable row level security;

-- Quien visita la web solo puede leer fechas activas. No hay teléfonos,
-- nombres ni reservas en esta tabla.
drop policy if exists "Public can view active rental availability" on public.rental_availability;
create policy "Public can view active rental availability"
  on public.rental_availability for select
  to anon, authenticated
  using (active = true);

-- El CRM muestra, crea y edita también los bloques ocultos. is_admin()
-- ya existe en este proyecto gracias a supabase-admin.sql.
drop policy if exists "Admins manage rental availability" on public.rental_availability;
create policy "Admins manage rental availability"
  on public.rental_availability for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.rental_availability to anon, authenticated;
grant insert, update, delete on public.rental_availability to authenticated;
