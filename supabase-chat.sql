-- =====================================================================
-- Car Seat Clinic Center — Chat con IA: tabla de conversaciones
-- Pega en Supabase → SQL Editor → Run.
-- =====================================================================

create table if not exists public.conversaciones (
  id         uuid primary key default gen_random_uuid(),
  session_id text not null,                 -- agrupa los mensajes de una charla
  rol        text not null,                 -- 'user' | 'asistente'
  mensaje    text not null,
  nombre     text,                          -- opcional (si el cliente lo da)
  created_at timestamptz not null default now()
);
create index if not exists conversaciones_session_idx on public.conversaciones (session_id, created_at);

alter table public.conversaciones enable row level security;

-- Cualquiera puede escribir (para que el chat funcione sin login)
drop policy if exists "chat: cualquiera escribe" on public.conversaciones;
create policy "chat: cualquiera escribe"
  on public.conversaciones for insert with check (true);

-- Solo el admin puede leer las conversaciones (desde el CRM)
drop policy if exists "chat: admin lee" on public.conversaciones;
create policy "chat: admin lee"
  on public.conversaciones for select using (public.is_admin());
