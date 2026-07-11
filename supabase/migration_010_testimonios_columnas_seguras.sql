-- Migración 010: la tabla "testimonios" tenía GRANT SELECT completo (todas
-- las columnas) a anon y authenticated. La política RLS
-- "testimonios: lectura de publicados" solo filtra FILAS (publicado = true),
-- no columnas — así que cualquiera con la anon key pública podía pedir
-- directo a la API REST de Supabase (sin pasar por la app) columnas
-- sensibles de cualquier testimonio publicado, en particular:
--   - email          (dato personal del/la autor/a del testimonio)
--   - mejora_interna (comentado en schema.sql como "NUNCA se muestra
--                     públicamente": feedback interno para el negocio)
-- Confirmado en vivo contra la API pública del proyecto.
--
-- Esta migración retira el GRANT amplio y lo reemplaza por un GRANT a nivel
-- de columna con SOLO las columnas que el frontend público realmente lee:
--   - src/app/semillas-del-camino/page.tsx:
--       id, servicios, nombre, apellido, ciudad, privacidad, frase, hoy,
--       valoracion
--   - src/components/semillas/TestimonialTeaser.tsx:
--       id, nombre, apellido, privacidad, frase, valoracion
-- Se agrega también "publicado" porque la política RLS la referencia en su
-- cláusula USING y el rol necesita permiso de lectura sobre esa columna
-- para que el filtro se pueda evaluar.
--
-- Quedan EXCLUIDAS (no legibles por anon/authenticated): email,
-- mejora_interna, pais, foto_url, antes, proceso, autorizado, creado_en.
-- Ninguna de estas la lee el frontend público hoy.
--
-- El GRANT INSERT queda igual (los visitantes deben poder seguir
-- enviando testimonios vía /semillas-del-camino/compartir).
--
-- Correr una sola vez en el SQL Editor de Supabase.

revoke select on testimonios from anon, authenticated;

grant select (
  id,
  servicios,
  nombre,
  apellido,
  ciudad,
  privacidad,
  frase,
  hoy,
  valoracion,
  publicado
) on testimonios to anon, authenticated;
