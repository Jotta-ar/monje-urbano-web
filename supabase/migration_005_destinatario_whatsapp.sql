-- Migración 005: WhatsApp del destinatario (para los regalos que genera el
-- admin desde /admin, donde email y WhatsApp son ambos obligatorios).
-- Correr una sola vez en el SQL Editor de Supabase.

alter table compras add column if not exists destinatario_whatsapp text;
