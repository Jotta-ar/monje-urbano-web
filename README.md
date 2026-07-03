# Monje Urbano Libre — sitio web

Next.js (App Router) + TypeScript + Supabase, siguiendo la recomendación técnica del
desarrollador (`MUL.pdf`).

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

## Poner en marcha el backend (Supabase)

El sitio funciona hoy sin backend (los formularios muestran las pantallas de
confirmación, pero no guardan nada todavía). Para que empiece a guardar consultas,
compras, newsletter y testimonios:

1. Creá un proyecto gratis en https://supabase.com
2. En el SQL Editor del proyecto, pegá y ejecutá el contenido de `supabase/schema.sql`
   (crea las tablas `precios`, `consultas`, `newsletter_subscribers`, `compras` y
   `testimonios`, con los permisos necesarios).
3. Copiá `.env.local.example` a `.env.local` y completá:
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
4. Reiniciá `npm run dev`. El panel `/admin` y todos los formularios ya van a guardar
   en la base de datos.
5. Para el panel de precios (`/admin`), creá un usuario administrador en
   Supabase → Authentication → Users, y usá ese email/contraseña para entrar.

## Pagos (Mercado Pago / Stripe)

Los botones de pago están armados (con selector de moneda ARS/USD) pero en "modo de
prueba" hasta que completes en `.env.local`:

- `MERCADOPAGO_ACCESS_TOKEN` / `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Conectar el checkout real de cada pasarela (crear la preferencia de pago / sesión de
Stripe y confirmar el pago por webhook) es el siguiente paso una vez que tengas las
cuentas creadas — avisame cuando las tengas y lo conectamos.

## Emails automáticos

Para que el link de regalo, las notificaciones de compra/consulta y el mail de
"contanos tu experiencia" (Semillas del Camino) se envíen solos, hace falta un
servicio de email transaccional (recomendado: Resend, resend.com) y su
`RESEND_API_KEY` en `.env.local`. Mientras tanto, todo lo demás (guardar en la base,
mostrar los formularios, etc.) funciona igual.

## Deploy

Recomendado: Vercel (gratis para empezar), conectando este repo y cargando las mismas
variables de entorno en el panel de Vercel. Los dominios `monjeurbanolibre.com` y
`monjeurbanolibre.com.ar` se apuntan ahí una vez que el proyecto esté conectado.
