-- Reportes del agente asesor-crecimiento-mul (uno por corrida) + notas
-- personales de Jose sobre una recomendación puntual.

create table if not exists reportes_agente (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  contenido text not null,
  cantidad_recomendaciones integer not null default 0,
  creado_en timestamptz not null default now()
);
alter table reportes_agente enable row level security;
grant all on reportes_agente to service_role;

create index if not exists reportes_agente_creado_en_idx on reportes_agente (creado_en desc);

alter table recomendaciones add column if not exists notas text;
