/** @type {import('next').NextConfig} */

const nextConfig = {
  // 🔥 Configuración de internacionalización (sin localeDetection)
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
  },

  // 🔄 Rewrites para API
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },

  // 🚀 Compresión
  compress: true,

  // 🖼️ Imágenes
  images: {
    domains: ['localhost', 'agente-sap-hcm.onrender.com'],
  },
};

module.exports = nextConfig;