-- =====================================================================
-- Car Seat Clinic — QUIÉN PUEDE ADMINISTRAR (versión segura)
-- ---------------------------------------------------------------------
-- ⚠️ CORRE ESTE ARCHIVO CUANTO ANTES.
--
-- Qué pasaba: el sitio traía escritos en el código (público, en GitHub) un
-- usuario "admin", una clave "admin" y la contraseña de la cuenta
-- admin@carseatclinic.app. Cualquiera que leyera el repositorio podía entrar
-- al panel y ver los datos de las clientas.
--
-- Ya quitamos esas claves de la web. Pero la base de datos TAMBIÉN le daba
-- permisos a esa cuenta, así que hay que quitárselos aquí. Eso hace este
-- archivo:
--   1. Deja que solo TU correo (y quien marques a mano) sea administrador.
--   2. Le quita los permisos a la cuenta vieja admin@carseatclinic.app.
--
-- Cómo correrlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- =====================================================================


-- 1) Quién es administrador
-- ---------------------------------------------------------------------
-- 👉 CAMBIA el correo de abajo por el tuyo (con el que inicias sesión).
--    Puedes poner varios separados por coma, entre comillas simples.
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
      or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array[
           'luislassogonzalez@gmail.com'   -- 👈 pon aquí el correo de la dueña
         ]);
$$;


-- 2) Quitarle los permisos a la cuenta comprometida
-- ---------------------------------------------------------------------
update public.profiles
   set is_admin = false
 where id in (select id from auth.users
               where lower(email) = 'admin@carseatclinic.app');


-- 3) (Opcional, recomendado) Borrar del todo la cuenta vieja
-- ---------------------------------------------------------------------
-- Solo si NO la usas para entrar. Primero entra con tu correo, comprueba que
-- ves el panel, y después quita los guiones "--" de la línea de abajo y corre
-- otra vez el archivo.
--
-- delete from auth.users where lower(email) = 'admin@carseatclinic.app';


-- 4) Comprobación: esto debe devolver 0 filas
-- ---------------------------------------------------------------------
select u.email, p.is_admin
  from auth.users u
  left join public.profiles p on p.id = u.id
 where lower(u.email) = 'admin@carseatclinic.app'
   and coalesce(p.is_admin, false) = true;


-- =====================================================================
-- DESPUÉS DE CORRER ESTO
-- ---------------------------------------------------------------------
-- a) Entra a admin.html con tu correo (o con el botón de Google) y confirma
--    que ves el panel.
-- b) En Supabase → Authentication → Providers → Email, ACTIVA de nuevo
--    "Confirm email". Estaba apagado para que la cuenta admin/admin pudiera
--    crearse sola; ya no hace falta, y así nadie crea cuentas con correos
--    falsos.
-- =====================================================================
