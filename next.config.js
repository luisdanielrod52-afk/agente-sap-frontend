/** @type {import('next').NextConfig} */

const nextConfig = {
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

  // 🖼️ Imágenes (actualizado)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'agente-sap-hcm.onrender.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // 🚀 Compresión
  compress: true,
};

module.exports = nextConfig;