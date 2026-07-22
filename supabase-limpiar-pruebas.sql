-- =====================================================================
-- Car Seat Clinic — Borrar las solicitudes de PRUEBA del CRM
-- ---------------------------------------------------------------------
-- Al probar que el carrito guarda bien los pedidos, quedaron unas filas
-- falsas en la pestaña "Agenda" del panel. Este archivo las borra.
--
-- Son inventadas: "PRUEBA", "PRUEBA DUP" y una clienta "Ana Gómez" con el
-- teléfono 6123-4567. Ninguna es una clienta real.
--
-- Cómo correrlo: Supabase → SQL Editor → New query → pegar → Run.
-- =====================================================================

-- 1) Mira primero qué se va a borrar (opcional, para quedarte tranquila)
select id, tipo, servicio, nombre, telefono, created_at
  from public.crm_leads
 where nombre in ('PRUEBA', 'PRUEBA BORRAR', 'PRUEBA DUP')
    or (nombre = 'Ana Gómez' and telefono = '6123-4567')
    or id like 'test\_%'
    or id like 'dup\_%'
    or id like 't\_%'
 order by created_at desc;


-- 2) Borrarlas
delete from public.crm_leads
 where nombre in ('PRUEBA', 'PRUEBA BORRAR', 'PRUEBA DUP')
    or (nombre = 'Ana Gómez' and telefono = '6123-4567')
    or id like 'test\_%'
    or id like 'dup\_%'
    or id like 't\_%';


-- 3) Y las filas de prueba viejas del chat (de una sesión anterior)
delete from public.conversaciones where session_id = 'test_curl';
delete from public.crm_leads where id = 'test_curl_1';


-- 4) Comprobación: debe devolver 0
select count(*) as pruebas_restantes
  from public.crm_leads
 where nombre in ('PRUEBA', 'PRUEBA BORRAR', 'PRUEBA DUP')
    or (nombre = 'Ana Gómez' and telefono = '6123-4567');
