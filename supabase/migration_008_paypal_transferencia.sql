-- Pagos internacionales (PayPal y transferencia bancaria en USD) para
-- visitantes fuera de Argentina. Mercado Pago (ARS) no se toca.

-- Comprobante de transferencia: el cliente sube una imagen del comprobante
-- (opcional, puede subirla después con el link de su pedido), y esa ruta se
-- usa para incrustar la imagen en el PDF del pedido cuando el admin lo
-- descarga — no se genera una URL firmada aparte para "verla" en el panel,
-- el PDF ya la incluye.
alter table compras add column if not exists comprobante_transferencia_url text;

-- ========== CONFIGURACIÓN (fila única, editable desde /admin) ==========
-- Hoy solo guarda los datos de la cuenta bancaria en EEUU para mostrarle al
-- cliente que elige pagar por transferencia — vacío hasta que Jose cargue
-- los datos reales desde el panel. Pensada para poder sumar más ajustes
-- globales más adelante sin crear una tabla nueva por cada uno.
create table if not exists configuracion (
  id int primary key default 1,
  datos_transferencia_usd text,
  actualizado_en timestamptz not null default now(),
  constraint configuracion_fila_unica check (id = 1)
);
insert into configuracion (id, datos_transferencia_usd) values (1, null)
on conflict (id) do nothing;

alter table configuracion enable row level security;
-- Lectura pública: la pantalla de "pagar por transferencia" necesita mostrar
-- estos datos a cualquier visitante, sin sesión.
create policy "configuracion: lectura pública" on configuracion for select using (true);
create policy "configuracion: admin puede actualizar" on configuracion for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

grant select on configuracion to anon, authenticated;
grant update on configuracion to authenticated;
grant all on configuracion to service_role;

-- El bucket "adjuntos" (creado en migration_007) ya acepta subidas públicas
-- para cualquier carpeta, así que el comprobante de transferencia
-- (compras/transferencia/<uuid>.<ext>) no necesita una policy nueva.
