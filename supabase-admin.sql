-- =====================================================================
-- Car Seat Clinic Center — Habilitar la cuenta admin del panel (CRM)
-- ---------------------------------------------------------------------
-- Esto permite que el acceso por código (admin / admin) pueda EDITAR
-- productos, stock y pedidos (no solo verlos).
-- Pégalo en: Supabase → SQL Editor → New query → Run.
-- =====================================================================

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
      or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array[
           'luislassogonzalez@gmail.com',   -- tu correo personal (admin)
           'admin@carseatclinic.app'        -- cuenta del acceso por código
         ]);
$$;

-- Nota: para que "admin / admin" pueda crear su cuenta y entrar al instante,
-- ve a Authentication → Providers → Email y DESACTIVA "Confirm email".
