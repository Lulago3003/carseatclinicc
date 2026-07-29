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
  image_url text,
  active boolean not null default true,
  featured boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint instagram_posts_url_not_blank check (length(btrim(url)) > 0),
  constraint instagram_posts_title_not_blank check (length(btrim(title)) > 0)
);

-- La columna se agrega también en proyectos donde la tabla ya existía antes
-- de que el CRM pudiera subir una foto para la tarjeta de la portada.
alter table public.instagram_posts
  add column if not exists image_url text;

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

-- Guardado atómico: si se destaca una novedad, la anterior se desmarca dentro
-- de la misma transacción. Si algo falla, la web conserva exactamente el
-- estado que tenía antes. Solo la puede ejecutar quien ya sea admin.
create or replace function public.save_instagram_post(
  p_id uuid,
  p_url text,
  p_title text,
  p_message text,
  p_image_url text,
  p_active boolean,
  p_featured boolean,
  p_expires_at timestamptz
)
returns public.instagram_posts
language plpgsql
security invoker
set search_path = public
as $$
declare
  saved public.instagram_posts;
begin
  if not public.is_admin() then
    raise exception 'Solo administradores pueden guardar novedades de Instagram';
  end if;

  -- Una publicación vencida no puede desplazar la novedad actual. Sin esta
  -- validación, un clic tardío dejaría la banda superior sin contenido.
  if coalesce(p_active, false)
     and coalesce(p_featured, false)
     and p_expires_at is not null
     and p_expires_at <= now() then
    raise exception 'Una publicación vencida no puede mostrarse arriba de la web';
  end if;

  if coalesce(p_active, false) and coalesce(p_featured, false) then
    update public.instagram_posts
       set featured = false,
           updated_at = now()
     where active = true
       and featured = true
       and (p_id is null or id <> p_id);
  end if;

  if p_id is null then
    insert into public.instagram_posts
      (url, title, message, image_url, active, featured, expires_at, updated_at)
    values
      (p_url, p_title, p_message, p_image_url, coalesce(p_active, true),
       coalesce(p_active, true) and coalesce(p_featured, false), p_expires_at, now())
    returning * into saved;
  else
    insert into public.instagram_posts
      (id, url, title, message, image_url, active, featured, expires_at, updated_at)
    values
      (p_id, p_url, p_title, p_message, p_image_url, coalesce(p_active, true),
       coalesce(p_active, true) and coalesce(p_featured, false), p_expires_at, now())
    on conflict (id) do update set
      url = excluded.url,
      title = excluded.title,
      message = excluded.message,
      image_url = excluded.image_url,
      active = excluded.active,
      featured = excluded.featured,
      expires_at = excluded.expires_at,
      updated_at = excluded.updated_at
    returning * into saved;
  end if;

  return saved;
end;
$$;

revoke all on function public.save_instagram_post(uuid, text, text, text, text, boolean, boolean, timestamptz) from public;
grant execute on function public.save_instagram_post(uuid, text, text, text, text, boolean, boolean, timestamptz) to authenticated;
