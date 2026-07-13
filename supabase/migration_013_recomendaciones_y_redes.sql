-- Panel de Crecimiento: dos tablas nuevas, internas 100% (nunca se leen desde
-- el cliente público). RLS enabled sin ninguna policy — igual que "compras" y
-- "consultas", todo acceso pasa por service_role desde /api/admin/*.

create table if not exists recomendaciones (
  id uuid primary key default gen_random_uuid(),
  area text not null,               -- ADS, VTA, PAG, ONB, EML, CRM, SUP, DOC, CNT, REP, SEG
  titulo text not null,
  descripcion text,
  prioridad text not null default 'media' check (prioridad in ('alta', 'media', 'baja')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_progreso', 'hecho', 'descartada')),
  origen text not null default 'manual' check (origen in ('diagnostico', 'agente', 'manual')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
alter table recomendaciones enable row level security;

create table if not exists redes_metricas (
  id uuid primary key default gen_random_uuid(),
  plataforma text not null check (plataforma in ('youtube', 'instagram', 'tiktok')),
  seguidores integer,
  publicaciones integer,
  metrica_extra jsonb,               -- ej. { "vistas_totales": 1234 } para YouTube
  capturado_en timestamptz not null default now()
);
alter table redes_metricas enable row level security;

create index if not exists recomendaciones_estado_idx on recomendaciones (estado);
create index if not exists redes_metricas_plataforma_capturado_idx on redes_metricas (plataforma, capturado_en desc);

-- service_role bypassa RLS pero igual necesita el GRANT de tabla explícito
-- en este proyecto (ver schema.sql, sección GRANTS) — sin esto, /api/admin/*
-- recibe "permission denied" aunque requireAdmin() ya haya validado la sesión.
grant all on recomendaciones, redes_metricas to service_role;

-- Seed: los ítems "automatizar ahora" del diagnóstico de arquitectura de
-- automatización (11 áreas), más la de conectar IG/TikTok que pidió Jose el
-- 12-jul-2026 con prioridad alta. Idempotente: solo inserta si la tabla está
-- vacía, para no duplicar en cada re-run de la migración.
insert into recomendaciones (area, titulo, descripcion, prioridad, estado, origen)
select * from (values
  ('CRM', 'Unificar contactos en una tabla', 'Una tabla de contactos que una compras, consultas y newsletter en un solo perfil por email, con estado de funnel (lead → consultó → compró → recurrente).', 'alta', 'pendiente', 'diagnostico'),
  ('REP', 'Armar el reporte semanal automático', 'Resumen por mail cada lunes: ventas por producto, ingreso por moneda, conversión por "cómo me encontraste", pedidos abandonados, consultas sin responder.', 'alta', 'pendiente', 'diagnostico'),
  ('VTA', 'Recuperar pedidos abandonados', 'Mail automático a pedidos en pendiente_pago sin confirmar en 24-48 horas.', 'alta', 'pendiente', 'diagnostico'),
  ('ONB', 'Generar el borrador del entregable al confirmarse el pago', 'El webhook de pago dispara la skill correspondiente (Manifiesto, Ritual, Cartografía) y deja el texto listo para que Jose apruebe antes de enviarlo.', 'alta', 'pendiente', 'diagnostico'),
  ('CNT', 'Conectar Instagram Graph API y TikTok Content Posting API', 'Pasar las cuentas a Business/Creator y vincularlas para poder medir seguidores automático y, más adelante, publicar solo (Fase 2 y 3 del roadmap de redes ya acordado).', 'alta', 'pendiente', 'manual'),
  ('VTA', 'Venta cruzada en el mail de confirmación', 'Sugerir el producto complementario según lo comprado (ej. Manifiesto → Ritual Matutino).', 'media', 'pendiente', 'diagnostico'),
  ('PAG', 'Recordatorio de comprobante de transferencia', 'Avisar automático si no se sube el comprobante de una transferencia en 48 horas.', 'media', 'pendiente', 'diagnostico'),
  ('EML', 'Secuencia de bienvenida al newsletter', 'Mail automático al suscribirse, en vez de solo guardar el email sin ninguna respuesta.', 'media', 'pendiente', 'diagnostico'),
  ('EML', 'Reactivar consultas frías', 'A los 15 días de una consulta sin compra, mandar un mail de reactivación de baja presión.', 'media', 'pendiente', 'diagnostico'),
  ('SEG', 'Pedir testimonio después de la entrega', 'Mail post-entrega invitando a dejar un testimonio para Semillas del Camino.', 'media', 'pendiente', 'diagnostico'),
  ('SUP', 'Respuesta automática a preguntas frecuentes', 'Clasificar consultas repetidas (precio, tiempos, métodos de pago) y responder solo lo mecánico, escalando el resto a Jose sin tocarlo.', 'media', 'pendiente', 'diagnostico'),
  ('CNT', 'Seguir con la Fase 1 del motor de contenido', 'YouTube Data API, según el roadmap de 6 agentes ya acordado para el pipeline de redes.', 'media', 'pendiente', 'diagnostico'),
  ('CRM', 'Panel de moderación de testimonios', 'Hoy no existe ninguna pantalla admin para revisar y publicar los testimonios de Semillas del Camino que ya llegan por el formulario público.', 'media', 'pendiente', 'diagnostico'),
  ('SEG', 'Aviso en luna nueva a compradores previos', 'Usar el Sincronario ya construido en el sitio para ofrecer el siguiente producto del catálogo en el ciclo lunar — gancho de marca, no genérico.', 'baja', 'pendiente', 'diagnostico'),
  ('DOC', 'Revisión mensual del Documento Maestro', 'Recordatorio periódico de que el documento siga reflejando el catálogo real, para que no quede desactualizado.', 'baja', 'pendiente', 'diagnostico'),
  ('ADS', 'Instrumentar el pixel de conversión', 'Agregar el evento de conversión al checkout ahora, aunque no haya campaña activa, para no perder datos el día que se prenda la pauta.', 'baja', 'pendiente', 'diagnostico')
) as seed(area, titulo, descripcion, prioridad, estado, origen)
where not exists (select 1 from recomendaciones);
