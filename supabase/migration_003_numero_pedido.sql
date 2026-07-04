-- Migración 003: número de pedido secuencial y global (no por servicio),
-- usado para armar el nombre del archivo del PDF. Arranca en 1001.
-- Correr una sola vez en el SQL Editor de Supabase.

create sequence if not exists compras_numero_seq start 1001;

alter table compras add column if not exists numero integer;
alter table compras alter column numero set default nextval('compras_numero_seq');

-- Pedidos ya existentes (si hubiera) que no tengan número asignado, en orden
-- de creación.
update compras set numero = nextval('compras_numero_seq')
where numero is null;

alter table compras alter column numero set not null;
create unique index if not exists compras_numero_idx on compras (numero);
