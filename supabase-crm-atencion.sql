-- =====================================================================
-- Car Seat Clinic Center - CRM inteligente: citas, casos y consultas IA
-- Pega en Supabase -> SQL Editor -> Run.
-- =====================================================================

create table if not exists public.crm_leads (
  id          text primary key,
  tipo        text not null default 'consulta',
  estado      text not null default 'nuevo',
  origen      text not null default 'web',
  prioridad   text not null default 'media',
  servicio    text not null default 'Consulta general',
  nombre      text,
  telefono    text,
  fecha       date,
  horario     text,
  mensaje     text,
  detalles    jsonb not null default '{}'::jsonb,
  session_id  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists crm_leads_estado_idx on public.crm_leads (estado, created_at desc);
create index if not exists crm_leads_fecha_idx on public.crm_leads (fecha, horario);
create index if not exists crm_leads_session_idx on public.crm_leads (session_id);

alter table public.crm_leads enable row level security;

-- La web puede crear solicitudes sin login.
drop policy if exists "crm leads: cualquiera crea" on public.crm_leads;
create policy "crm leads: cualquiera crea"
  on public.crm_leads for insert with check (true);

-- Solo admin puede actualizar estados y seguimiento.
drop policy if exists "crm leads: admin actualiza" on public.crm_leads;
create policy "crm leads: admin actualiza"
  on public.crm_leads for update using (public.is_admin()) with check (public.is_admin());

-- Solo admin puede leer desde el CRM.
drop policy if exists "crm leads: admin lee" on public.crm_leads;
create policy "crm leads: admin lee"
  on public.crm_leads for select using (public.is_admin());

-- Solo admin puede borrar si algun dia hace falta limpiar datos.
drop policy if exists "crm leads: admin borra" on public.crm_leads;
create policy "crm leads: admin borra"
  on public.crm_leads for delete using (public.is_admin());
