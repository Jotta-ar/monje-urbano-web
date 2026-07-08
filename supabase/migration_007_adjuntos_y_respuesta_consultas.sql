-- Bucket privado para los adjuntos de los formularios (Consultas, Magia
-- Sanadora, Semillas del Camino). Privado a propósito: algunas de estas
-- imágenes son sensibles (fotos de zonas del cuerpo, documentos personales),
-- así que no deben quedar en una URL pública adivinable — el acceso se hace
-- con URLs firmadas y temporales, generadas del lado del servidor con la
-- service_role key cuando el admin necesita verlas.
insert into storage.buckets (id, name, public)
values ('adjuntos', 'adjuntos', false)
on conflict (id) do nothing;

-- El público (anon) puede SUBIR archivos a este bucket (para completar los
-- formularios), pero no puede leerlos ni listarlos — solo el servidor
-- (service_role) puede generar URLs firmadas para mostrárselos al admin.
create policy "adjuntos: subida pública" on storage.objects
  for insert
  with check (bucket_id = 'adjuntos');

-- Para poder responder consultas desde el panel de admin y llevar registro.
alter table consultas add column if not exists respuesta text;
alter table consultas add column if not exists respondido_en timestamptz;
