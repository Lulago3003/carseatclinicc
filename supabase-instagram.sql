-- ============================================================================
-- Car Seat Clinic | Novedades de Instagram desde el CRM
-- Ejecutar UNA sola vez en Supabase: SQL Editor -> New query -> pegar -> Run.
--
-- Después, desde admin.html -> Instagram se puede pegar un enlace de un post
-- o Reel, escoger si se ve arriba de la web y ocultarlo cuando ya no aplique.
-- No guarda contraseñas de Instagram ni Facebook.
-- ============================================================================

create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null default 'Nuevo en Instagram',
  message text,
  active boolean not null default true,
  featured boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint instagram_posts_url_not_blank check (length(btrim(url)) > 0),
  constraint instagram_posts_title_not_blank check (length(btrim(title)) > 0)
);

alter table public.instagram_posts enable row level security;

create index if not exists instagram_posts_visible_order_idx
  on public.instagram_posts (active, featured desc, updated_at desc);

-- Solo puede haber una publicación activa destacada a la vez. El CRM apaga
-- automáticamente la anterior antes de destacar la nueva.
create unique index if not exists instagram_posts_one_featured_idx
  on public.instagram_posts (featured)
  where featured = true and active = true;

drop policy if exists "Public can view active Instagram posts" on public.instagram_posts;
create policy "Public can view active Instagram posts"
  on public.instagram_posts
  for select
  to anon, authenticated
  using (active = true and (expires_at is null or expires_at > now()));

drop policy if exists "Admins manage Instagram posts" on public.instagram_posts;
create policy "Admins manage Instagram posts"
  on public.instagram_posts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.instagram_posts to anon, authenticated;
grant insert, update, delete on public.instagram_posts to authenticated;
