-- =====================================================================
-- Car Seat Clinic Center - Blog / artículos
-- ---------------------------------------------------------------------
-- Pega ESTE archivo una sola vez en Supabase -> SQL Editor -> Run.
-- La administradora escribe los artículos desde el CRM (pestaña Blog).
-- Los visitantes solo pueden leer los artículos publicados.
-- =====================================================================

create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,          -- va en la dirección: blog.html?post=...
  title        text not null,
  excerpt      text,                          -- resumen corto para la tarjeta
  body         text not null,                 -- el artículo (texto plano con saltos de línea)
  cover_url    text,                          -- foto de portada
  author       text,
  published    boolean not null default true,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint blog_posts_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- Para listar rápido lo publicado, de lo más nuevo a lo más viejo.
create index if not exists blog_posts_public_idx
  on public.blog_posts (published, published_at desc);

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_blog_posts_updated_at();

alter table public.blog_posts enable row level security;

-- Quien visita la web solo ve artículos publicados y con fecha ya llegada.
-- Así se puede dejar un artículo escrito para que salga más adelante.
drop policy if exists "Public can view published posts" on public.blog_posts;
create policy "Public can view published posts"
  on public.blog_posts for select
  to anon, authenticated
  using (published = true and published_at <= now());

-- El CRM ve, crea y edita también los borradores. is_admin() ya existe en
-- este proyecto gracias a supabase-admin.sql.
drop policy if exists "Admins manage blog posts" on public.blog_posts;
create policy "Admins manage blog posts"
  on public.blog_posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
