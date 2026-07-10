-- Tercera opción de pago manual para clientes en USD: USDT (red TRC20, la
-- de comisiones más bajas). Mismo mecanismo que la transferencia bancaria
-- (migration_008): el cliente ve una dirección de wallet en vez de datos de
-- cuenta, puede subir una captura de la transacción como comprobante (misma
-- columna compras.comprobante_transferencia_url), y el admin confirma a
-- mano desde /admin cuando ve que llegó.
alter table configuracion add column if not exists wallet_usdt_trc20 text;
