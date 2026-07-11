import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Origen de Supabase (usado tanto por el cliente browser en varios
// componentes -inserts directos, auth del admin, subida a Storage- como
// para las llamadas del propio proyecto). Si en algún momento cambia el
// proyecto de Supabase, esto se ajusta solo via env var; si la env var no
// está seteada en build time usamos un wildcard *.supabase.co como red de
// seguridad para no romper el sitio.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "https://*.supabase.co";

// CSP conservadora: no usamos nonces (requeriría forzar render dinámico en
// todas las páginas vía proxy, ver docs de Next), así que seguimos el
// ejemplo oficial "Without Nonces" de la guía de CSP de Next.js y sumamos
// 'unsafe-inline' en script-src y style-src. Es necesario porque:
//   - Next.js inyecta scripts inline (hydration data / RSC payload) sin
//     nonce cuando no hay proxy generando uno.
//   - El sitio usa MUCHO style={{...}} (atributo style inline de React) en
//     JSX, lo cual cae bajo style-src si no se permite 'unsafe-inline'.
// 'unsafe-eval' solo se permite en dev, porque el fast refresh / eval
// source maps de webpack en desarrollo lo necesitan (en producción ni
// React ni Next usan eval).
// No hace falta whitelistear mercadopago.com / paypal.com: el pago se
// arma en el servidor (route handlers /api/mercadopago, /api/paypal) y el
// navegador solo hace `window.location.href = initPoint`, una navegación
// de página completa que CSP no restringe (no es un fetch/XHR ni un
// iframe). Tampoco hay imágenes servidas desde Supabase Storage en el
// DOM: el comprobante de transferencia solo se incrusta en un PDF
// generado en el servidor, nunca se muestra como <img> en el browser.
// No hay fuentes de Google Fonts (son locales, next/font/local) ni
// iframes propios en el sitio (grep sin resultados), así que
// frame-ancestors 'none' + X-Frame-Options: DENY son seguros.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self' ${supabaseOrigin};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  /* config options here */

  async headers() {
    return [
      {
        // Aplica a todas las rutas del sitio.
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            // No usamos SAMEORIGIN porque no hay ningún iframe propio que
            // embeba el sitio en sí mismo (confirmado por grep).
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Strict-Transport-Security NO se agrega acá: Vercel ya lo
          // envía a nivel de plataforma (confirmado con curl).
        ],
      },
    ];
  },
};

export default nextConfig;
