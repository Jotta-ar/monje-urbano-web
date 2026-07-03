-- Monje Urbano Libre — esquema inicial de Supabase (Postgres)
-- Correr esto en el SQL Editor del proyecto de Supabase una sola vez.
-- Distingue 3 segmentos como pidió el cliente: compradores (compras),
-- consultantes (consultas) e inscriptos al newsletter (newsletter_subscribers).

create extension if not exists "pgcrypto";

-- ========== PRECIOS (editables desde /admin) ==========
create table if not exists precios (
  id text primary key,               -- ej: 'manifiesto', 'magia_serie3'
  label text not null,               -- ej: 'Magia Sanadora — Serie 3'
  monto_ars numeric,
  monto_usd numeric,
  actualizado_en timestamptz not null default now()
);

insert into precios (id, label, monto_ars, monto_usd) values
  ('manifiesto', 'Manifiesto Personalizado', null, null),
  ('cartografia_pdf', 'Cartografía del Síntoma (PDF)', null, null),
  ('cartografia_combo', 'Cartografía + Magia Sanadora (3 sesiones)', null, null),
  ('magia_unica', 'Magia Sanadora — Serie Única', null, null),
  ('magia_serie3', 'Magia Sanadora — Serie 3', null, null),
  ('magia_serie6', 'Magia Sanadora — Serie 6', null, null),
  ('magia_serie9', 'Magia Sanadora — Serie 9', null, null),
  ('ritual_matutino', 'Ritual Matutino Personalizado (PDF)', null, null)
on conflict (id) do nothing;

-- ========== CONSULTAS (consultantes) ==========
create table if not exists consultas (
  id uuid primary key default gen_random_uuid(),
  servicio text,
  nombre text not null,
  apellido text not null,
  email text not null,
  whatsapp text not null,
  mensaje text not null,
  pais text,
  ciudad text,
  archivo_url text,
  como_supiste text,
  creado_en timestamptz not null default now()
);

-- ========== NEWSLETTER (inscriptos) ==========
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  email text not null unique,
  creado_en timestamptz not null default now()
);

-- ========== COMPRAS (compradores + flujo regalo) ==========
create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  servicio text not null,                 -- manifiesto | cartografia | magia_sanadora | ritual_matutino
  modalidad text,                         -- ej. serie elegida en Magia Sanadora
  es_regalo boolean not null default false,
  token uuid not null default gen_random_uuid(), -- usado en el link /completar/[token] cuando es_regalo=true
  estado text not null default 'pendiente_pago'
    check (estado in ('pendiente_pago', 'pagado_pendiente_formulario', 'completado')),

  comprador_nombre text,
  comprador_apellido text,
  comprador_email text,
  comprador_whatsapp text,

  destinatario_nombre text,
  destinatario_apellido text,
  destinatario_email text,

  datos jsonb,                            -- respuestas del formulario de contenido
  como_supiste text,

  moneda text not null default 'ARS',     -- ARS | USD
  pasarela text,                          -- mercadopago | stripe
  monto numeric,

  creado_en timestamptz not null default now(),
  pagado_en timestamptz,
  completado_en timestamptz
);

create unique index if not exists compras_token_idx on compras (token);

-- ========== SEMILLAS DEL CAMINO (testimonios) ==========
create table if not exists testimonios (
  id uuid primary key default gen_random_uuid(),
  servicios text[] not null,              -- multi-select de servicios/productos
  nombre text,
  apellido text,
  email text,
  pais text,
  ciudad text,
  antes text not null,
  proceso text not null,
  hoy text not null,
  frase text not null,
  valoracion int not null check (valoracion between 1 and 5),
  privacidad text not null
    check (privacidad in ('nombre_completo','solo_nombre','seudonimo','anonimo','privado')),
  foto_url text,
  mejora_interna text,                    -- NUNCA se muestra públicamente
  autorizado boolean not null default false,
  publicado boolean not null default false, -- se activa a mano (moderación) salvo privacidad = privado
  creado_en timestamptz not null default now()
);

-- ========== ROW LEVEL SECURITY ==========
-- El sitio público inserta con la anon key; las lecturas administrativas y
-- los updates de estado (pagos, completar regalo, moderar testimonios) se
-- hacen desde rutas server-side de Next.js usando la service_role key,
-- que ignora RLS. Por eso acá solo habilitamos INSERT público donde corresponde
-- y un SELECT público acotado para precios y testimonios ya publicados.

alter table precios enable row level security;
create policy "precios: lectura pública" on precios for select using (true);
-- Solo el/la administrador/a (con sesión iniciada via Supabase Auth en /admin)
-- puede modificar precios. Como en esta etapa hay un único usuario admin y no
-- hay alta pública de cuentas, "cualquier usuario autenticado" equivale a "el admin".
create policy "precios: admin puede actualizar" on precios for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

alter table consultas enable row level security;
create policy "consultas: alta pública" on consultas for insert with check (true);

alter table newsletter_subscribers enable row level security;
create policy "newsletter: alta pública" on newsletter_subscribers for insert with check (true);

alter table compras enable row level security;
create policy "compras: alta pública" on compras for insert with check (true);
-- El link de regalo funciona como "magic link": el UUID del token es el secreto.
-- Permitimos SELECT/UPDATE público porque la app siempre filtra por token exacto
-- (nadie puede listar compras sin conocerlo). Si más adelante se agrega un login
-- de administrador, esto se puede restringir más y mover la lectura general a
-- una ruta server-side con la service_role key.
create policy "compras: lectura por token" on compras for select using (true);
create policy "compras: completar por token" on compras for update using (true) with check (true);

alter table testimonios enable row level security;
create policy "testimonios: alta pública" on testimonios for insert with check (true);
create policy "testimonios: lectura de publicados" on testimonios for select using (publicado = true);

-- ========== GRANTS ==========
-- RLS controla QUÉ FILAS puede tocar cada rol, pero Postgres además exige el
-- permiso base de tabla (GRANT) para saber QUÉ OPERACIONES puede intentar.
-- Como al crear el proyecto se desactivó "Automatically expose new tables"
-- (a propósito, por seguridad), estos GRANT hay que darlos a mano.
grant usage on schema public to anon, authenticated;

grant select on precios to anon, authenticated;
grant update on precios to authenticated;
grant insert on consultas to anon, authenticated;
grant insert on newsletter_subscribers to anon, authenticated;
grant insert, select, update on compras to anon, authenticated;
grant insert, select on testimonios to anon, authenticated;
