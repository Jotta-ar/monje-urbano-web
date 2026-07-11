-- El bucket "adjuntos" (creado en migration_007) solo exigía
-- bucket_id = 'adjuntos' en la policy de INSERT: sin límite de tamaño ni de
-- tipo de archivo, así que cualquiera con la anon key podía subir un archivo
-- arbitrario (cualquier tamaño, cualquier mimetype) a un bucket privado
-- pensado solo para fotos de comprobantes/formularios.
--
-- Los únicos <input type="file"> del frontend que suben a este bucket piden
-- imágenes:
--   - src/components/TransferenciaInfo.tsx        accept="image/*"
--   - src/components/forms/MagiaSanadoraFields.tsx accept="image/jpeg,image/png"
--   - src/app/semillas-del-camino/compartir/page.tsx accept="image/jpeg,image/png"
-- No hay ningún input que acepte PDF, así que no lo incluimos en la lista de
-- mimetypes permitidos. Se agrega image/webp y image/heic/heif por si el
-- navegador (sobre todo Safari/iOS con accept="image/*") sube la foto de
-- cámara en esos formatos en vez de convertirla a jpeg.
--
-- file_size_limit y allowed_mime_types son columnas estándar de
-- storage.buckets desde hace varias versiones de Supabase Storage (paquete
-- @supabase/supabase-js ^2.110 en este proyecto es compatible). Si al correr
-- esto en el dashboard SQL Editor da error de columna inexistente, es porque
-- el proyecto corre una versión vieja de Storage: en ese caso hay que setear
-- el límite de tamaño y los mimetypes permitidos manualmente desde
-- Storage -> adjuntos -> Edit bucket en el dashboard, en vez de por SQL.

update storage.buckets
set
  file_size_limit = 5242880, -- 5 MB, de sobra para una foto de comprobante
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
where id = 'adjuntos';
