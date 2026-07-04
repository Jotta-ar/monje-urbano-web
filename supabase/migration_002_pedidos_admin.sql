-- Migración 002: panel de pedidos + cierre de un permiso demasiado abierto.
-- Correr una sola vez en el SQL Editor de Supabase.

-- 1) Nuevas columnas para marcar pedidos como "enviados" desde /admin/pedidos.
alter table compras add column if not exists enviado boolean not null default false;
alter table compras add column if not exists enviado_en timestamptz;

-- 2) Cerrar el hueco de seguridad: las políticas anteriores permitían leer o
--    actualizar CUALQUIER pedido con la clave pública (anon), no solo el
--    propio. De ahora en más, el panel de admin y el link de regalo se
--    manejan del lado del servidor con la service_role key.
drop policy if exists "compras: lectura por token" on compras;
drop policy if exists "compras: completar por token" on compras;

revoke select, update on compras from anon, authenticated;
grant insert on compras to anon;
