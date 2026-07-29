/** @type {import('next').NextConfig} */

// 🔥 Configuración de internacionalización
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  // 🌍 Internacionalización (ES/EN)
  i18n: i18n,

  // 🔄 Rewrites para API (local y producción)
  async rewrites() {
    // Detectar si estamos en producción o desarrollo
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },

  // ⚙️ Otras configuraciones opcionales
  reactStrictMode: true,
  swcMinify: true,
  
  // 📦 Imágenes (si usas Next/Image)
  images: {
    domains: ['localhost', 'agente-sap-hcm.onrender.com'],
  },

  // 🚀 Compresión
  compress: true,
};

module.exports = nextConfig;