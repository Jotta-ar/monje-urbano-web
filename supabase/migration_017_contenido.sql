-- Panel de Crecimiento: tab "Contenido" — lleva la planificación y revisión
-- del motor de contenido de redes (skill motor-contenido-redes) al dashboard,
-- en vez de vivir solo en archivos .md locales de una sesión de Claude Code.
-- Mismo patrón que recomendaciones: tabla 100% interna, sin policies públicas,
-- todo acceso vía /api/admin/contenido* con service_role.

create table if not exists contenido_piezas (
  id uuid primary key default gen_random_uuid(),
  tanda_fecha date not null,
  tipo text not null check (tipo in ('nucleo', 'youtube_largo')),
  cruce_principio text,
  cruce_eje text check (cruce_eje in ('elevarse', 'centrarse', 'enraizarse')),
  es_cta_directo boolean not null default false,
  puente_venta text,
  titulo text,
  -- Guion como lo consume ensamblar_pieza.py: [{ "texto": "...", "estilo": "hook"|"cuerpo"|"cierre" }]
  lineas jsonb not null,
  caption text,
  voz_provider text not null default 'piper' check (voz_provider in ('piper', 'elevenlabs')),
  video_url text,
  estado text not null default 'borrador'
    check (estado in ('borrador', 'aprobada', 'publicada', 'descartada')),
  origen text not null default 'agente' check (origen in ('agente', 'manual')),
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
alter table contenido_piezas enable row level security;
grant all on contenido_piezas to service_role;

create index if not exists contenido_piezas_estado_idx on contenido_piezas (estado);
create index if not exists contenido_piezas_tanda_idx on contenido_piezas (tanda_fecha desc);

-- Bucket público para los .mp4 generados por el ensamblador — público porque
-- es contenido de marketing gratuito, no hay nada sensible que proteger con
-- una URL firmada. Los inserts/updates de objetos igual requieren la
-- service_role key (la sube el script de Python, no el navegador).
insert into storage.buckets (id, name, public)
values ('contenido-redes', 'contenido-redes', true)
on conflict (id) do nothing;
