-- Migración 004: agrega los productos (Talismán, Porta Sahumerio) a la
-- tabla de precios — antes solo estaban los 4 servicios, por eso los
-- productos no tenían precio ni se podían editar desde /admin.
-- Correr una sola vez en el SQL Editor de Supabase.

insert into precios (id, label, monto_ars, monto_usd) values
  ('talisman', 'Talismán del Monje Urbano Libre', null, null),
  ('porta_sahumerio', 'Porta Sahumerio Invertido', null, null)
on conflict (id) do nothing;
