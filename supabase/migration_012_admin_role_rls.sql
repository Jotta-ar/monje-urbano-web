-- Endurece las policies de "precios" y "configuracion": hasta ahora usaban
-- auth.role() = 'authenticated', que le da permiso de UPDATE a CUALQUIER
-- usuario autenticado de Supabase, no solo al admin. Las reemplazamos por
-- una comparación explícita contra el email del único admin del proyecto,
-- igual que hace requireAdmin() en src/lib/admin-auth.ts (defensa en
-- profundidad, en caso de que el alta pública de cuentas vuelva a activarse).
--
-- ---------- precios ----------
drop policy if exists "precios: admin puede actualizar" on precios;
create policy "precios: admin puede actualizar" on precios for update
  using (lower(auth.jwt() ->> 'email') = lower('monjeurbanolibre@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('monjeurbanolibre@gmail.com'));

-- ---------- configuracion ----------
drop policy if exists "configuracion: admin puede actualizar" on configuracion;
create policy "configuracion: admin puede actualizar" on configuracion for update
  using (lower(auth.jwt() ->> 'email') = lower('monjeurbanolibre@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('monjeurbanolibre@gmail.com'));
