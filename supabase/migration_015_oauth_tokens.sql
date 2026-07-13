-- Tabla genérica para tokens OAuth que hay que persistir y refrescar solos
-- (a diferencia de YouTube, que usa una API key pública estática). Sirve para
-- TikTok ahora y para Instagram Graph API más adelante, mismo esquema.

create table if not exists oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  plataforma text not null unique check (plataforma in ('tiktok', 'instagram')),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  open_id text,
  actualizado_en timestamptz not null default now()
);
alter table oauth_tokens enable row level security;
grant all on oauth_tokens to service_role;
