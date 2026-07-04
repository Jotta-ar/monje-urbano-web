-- Migración 006: faltaba el permiso de USO sobre la secuencia del número de
-- pedido. Sin esto, CUALQUIER inserción nueva en "compras" falla (tanto las
-- compras/regalos de clientes como los regalos que genera el admin), porque
-- Postgres necesita permiso explícito para llamar nextval() en el default.
-- Correr una sola vez en el SQL Editor de Supabase.

grant usage on sequence compras_numero_seq to anon, service_role;
