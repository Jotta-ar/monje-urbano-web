-- CRM ligero: un perfil por email que une compras, consultas y
-- newsletter_subscribers, con estado de funnel. Los tres inserts de origen
-- son client-side directos (anon key) sin ninguna API route de por medio, así
-- que la única forma confiable de mantener esto sincronizado sin tocar los
-- flujos de pago/consulta ya probados es con triggers de Postgres — primera
-- vez que se usa la técnica en este proyecto.

create table if not exists contactos (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nombre text,
  apellido text,
  whatsapp text,
  es_newsletter boolean not null default false,
  tiene_consulta boolean not null default false,
  compras_completadas integer not null default 0,
  etapa text not null default 'lead' check (etapa in ('lead', 'consulto', 'comprador', 'recurrente')),
  primera_interaccion_en timestamptz not null default now(),
  ultima_interaccion_en timestamptz not null default now(),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
alter table contactos enable row level security;
grant all on contactos to service_role;

create index if not exists contactos_etapa_idx on contactos (etapa);
create index if not exists contactos_ultima_interaccion_idx on contactos (ultima_interaccion_en desc);

-- Función central: dado un email, recalcula todo desde cero consultando las
-- tres tablas de origen y hace upsert en contactos. security definer +
-- search_path fijo porque el anon (que no tiene SELECT en compras/consultas)
-- es quien dispara el insert que a su vez dispara esta función — sin esto,
-- la función no podría leer las tablas de origen para calcular nada.
create or replace function sync_contacto(p_email text) returns void as $$
declare
  v_email text := lower(trim(p_email));
  v_nombre text;
  v_apellido text;
  v_whatsapp text;
  v_es_newsletter boolean;
  v_tiene_consulta boolean;
  v_compras_completadas integer;
  v_etapa text;
begin
  if v_email is null or v_email = '' then
    return;
  end if;

  select comprador_nombre, comprador_apellido, comprador_whatsapp
    into v_nombre, v_apellido, v_whatsapp
    from compras
    where lower(comprador_email) = v_email
    order by creado_en desc
    limit 1;

  if v_nombre is null then
    select nombre, apellido, whatsapp
      into v_nombre, v_apellido, v_whatsapp
      from consultas
      where lower(email) = v_email
      order by creado_en desc
      limit 1;
  end if;

  if v_nombre is null then
    select nombre into v_nombre
      from newsletter_subscribers
      where lower(email) = v_email
      limit 1;
  end if;

  select exists(select 1 from newsletter_subscribers where lower(email) = v_email) into v_es_newsletter;
  select exists(select 1 from consultas where lower(email) = v_email) into v_tiene_consulta;
  select count(*) into v_compras_completadas
    from compras
    where lower(comprador_email) = v_email and estado = 'completado';

  v_etapa := case
    when v_compras_completadas >= 2 then 'recurrente'
    when v_compras_completadas >= 1 then 'comprador'
    when v_tiene_consulta then 'consulto'
    else 'lead'
  end;

  insert into contactos (
    email, nombre, apellido, whatsapp, es_newsletter, tiene_consulta,
    compras_completadas, etapa, ultima_interaccion_en, actualizado_en
  )
  values (
    v_email, v_nombre, v_apellido, v_whatsapp, v_es_newsletter, v_tiene_consulta,
    v_compras_completadas, v_etapa, now(), now()
  )
  on conflict (email) do update set
    nombre = coalesce(excluded.nombre, contactos.nombre),
    apellido = coalesce(excluded.apellido, contactos.apellido),
    whatsapp = coalesce(excluded.whatsapp, contactos.whatsapp),
    es_newsletter = excluded.es_newsletter,
    tiene_consulta = excluded.tiene_consulta,
    compras_completadas = excluded.compras_completadas,
    etapa = excluded.etapa,
    ultima_interaccion_en = now(),
    actualizado_en = now();
end;
$$ language plpgsql security definer set search_path = public;

-- ---------- Triggers ----------

create or replace function trg_sync_contacto_from_compras() returns trigger as $$
begin
  perform sync_contacto(new.comprador_email);
  if new.es_regalo and new.destinatario_email is not null then
    perform sync_contacto(new.destinatario_email);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists sync_contacto_compras on compras;
create trigger sync_contacto_compras
  after insert or update of estado on compras
  for each row execute function trg_sync_contacto_from_compras();

create or replace function trg_sync_contacto_from_consultas() returns trigger as $$
begin
  perform sync_contacto(new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists sync_contacto_consultas on consultas;
create trigger sync_contacto_consultas
  after insert on consultas
  for each row execute function trg_sync_contacto_from_consultas();

create or replace function trg_sync_contacto_from_newsletter() returns trigger as $$
begin
  perform sync_contacto(new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists sync_contacto_newsletter on newsletter_subscribers;
create trigger sync_contacto_newsletter
  after insert on newsletter_subscribers
  for each row execute function trg_sync_contacto_from_newsletter();

-- ---------- Backfill de datos históricos ----------

do $$
declare r record;
begin
  for r in
    select comprador_email as email from compras where comprador_email is not null
    union
    select destinatario_email from compras where es_regalo and destinatario_email is not null
    union
    select email from consultas
    union
    select email from newsletter_subscribers
  loop
    perform sync_contacto(r.email);
  end loop;
end $$;
