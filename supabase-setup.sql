-- =====================================================================
-- Car Seat Clinic Panamá — Configuración de la base de datos (Supabase)
-- ---------------------------------------------------------------------
-- CÓMO USAR:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Menú izquierdo → "SQL Editor" → "New query"
--   3. Copia y pega TODO este archivo y presiona "Run".
--   4. Listo: se crean las tablas, la seguridad, el stock y productos demo.
-- =====================================================================

-- ---------- 1) PERFILES DE USUARIO (para saber quién es admin) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  full_name  text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "perfil propio: ver" on public.profiles;
create policy "perfil propio: ver"
  on public.profiles for select using (id = auth.uid());

drop policy if exists "perfil propio: editar" on public.profiles;
create policy "perfil propio: editar"
  on public.profiles for update using (id = auth.uid());

-- Crear el perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Función auxiliar: ¿el usuario actual es admin?
-- Es admin si tiene is_admin=true en su perfil, O si su correo está en la
-- lista de correos admin de abajo (forma fácil: solo inicia sesión con ese correo).
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
      or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array[
           'luislassogonzalez@gmail.com'   -- ⭐ correos administradores (agrega más con coma)
         ]);
$$;

-- ---------- 2) PRODUCTOS (con STOCK) ----------
create table if not exists public.products (
  id          text primary key,
  name        text not null,
  category    text not null default 'accesorios',  -- sillas | bases | accesorios
  price       numeric not null default 0,
  compare_at  numeric,                              -- precio anterior tachado (oferta)
  badge       text,                                 -- "Más vendido", "Oferta", "Nuevo"...
  image_url   text,
  description text,
  stock       integer not null default 0,
  active      boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Todos pueden VER los productos
drop policy if exists "productos: ver" on public.products;
create policy "productos: ver"
  on public.products for select using (true);

-- Solo el admin puede crear / editar / borrar
drop policy if exists "productos: admin escribe" on public.products;
create policy "productos: admin escribe"
  on public.products for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 3) PEDIDOS ----------
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete set null,
  items      jsonb not null,
  customer   jsonb,
  total      numeric not null default 0,
  status     text not null default 'nuevo',  -- nuevo | pagado | enviado | entregado
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- El cliente ve sus propios pedidos; el admin ve todos
drop policy if exists "pedidos: ver propios o admin" on public.orders;
create policy "pedidos: ver propios o admin"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

-- El admin puede actualizar el estado de los pedidos
drop policy if exists "pedidos: admin actualiza" on public.orders;
create policy "pedidos: admin actualiza"
  on public.orders for update using (public.is_admin());

-- ---------- 4) CREAR PEDIDO + DESCONTAR STOCK (de forma segura) ----------
-- Valida el stock, lo descuenta y registra el pedido en una sola operación.
create or replace function public.place_order(p_items jsonb, p_customer jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid;
  v_item     jsonb;
  v_total    numeric := 0;
  v_stock    integer;
  v_price    numeric;
  v_name     text;
  v_qty      integer;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión para comprar';
  end if;

  -- Validar stock y calcular total
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'qty')::int;
    select stock, price, name into v_stock, v_price, v_name
      from public.products where id = (v_item->>'id') and active = true;
    if v_stock is null then
      raise exception 'Producto no disponible';
    end if;
    if v_stock < v_qty then
      raise exception 'Sin stock suficiente para: %', v_name;
    end if;
    v_total := v_total + v_price * v_qty;
  end loop;

  -- Descontar stock
  for v_item in select * from jsonb_array_elements(p_items) loop
    update public.products
      set stock = stock - (v_item->>'qty')::int
      where id = (v_item->>'id');
  end loop;

  -- Registrar el pedido
  insert into public.orders (user_id, items, customer, total)
    values (auth.uid(), p_items, p_customer, v_total)
    returning id into v_order_id;

  return v_order_id;
end; $$;

-- ---------- 5) PRODUCTOS DE EJEMPLO (puedes borrarlos o editarlos luego) ----------
insert into public.products (id, name, category, price, compare_at, badge, description, stock, sort) values
  ('p1','Silla para bebé (Grupo 0+)','sillas',189,null,'Más vendido','Silla para recién nacidos de 0 a 13 kg. Reductor acolchado e instalación a contramarcha.',8,1),
  ('p2','Silla convertible 360° (Grupo 0-1-2-3)','sillas',329,379,'Oferta','Acompaña al niño de 0 a 36 kg. Giro 360° y respaldo reclinable.',5,2),
  ('p3','Booster con respaldo (Grupo 2-3)','sillas',119,null,null,'Para niños de 15 a 36 kg. Reposacabezas ajustable en altura.',12,3),
  ('p4','Base ISOFIX universal','bases',99,null,null,'Instalación rápida y firme con anclajes ISOFIX. Indicadores de clic seguro.',3,4),
  ('p5','Espejo retrovisor para bebé','accesorios',24,null,'Nuevo','Observa a tu bebé sin voltearte. Cristal de seguridad y ángulo ajustable.',20,5),
  ('p6','Protector de asiento antideslizante','accesorios',29,null,null,'Cuida la tapicería de marcas y suciedad. Material impermeable.',0,6),
  ('p7','Reductor para recién nacido','accesorios',19,null,null,'Cojín ergonómico que da soporte a la cabeza y el cuerpo del bebé.',15,7),
  ('p8','Parasol para ventana (pack x2)','accesorios',16,22,'Oferta','Bloquea los rayos del sol. Se adhiere sin pegamento y se quita sin marcas.',9,8)
on conflict (id) do nothing;

-- =====================================================================
-- 6) HAZTE ADMINISTRADOR  ⭐ (haz esto DESPUÉS de registrarte en la web)
-- ---------------------------------------------------------------------
-- Regístrate una vez en la tienda con tu correo, luego vuelve aquí,
-- cambia el correo de abajo por el TUYO y ejecuta solo esta línea:
--
-- update public.profiles set is_admin = true where email = 'TU_CORREO@gmail.com';
-- =====================================================================
