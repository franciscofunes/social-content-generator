/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['engine.prod.bria-api.com', 'storage.server', 'picsum.photos', 'via.placeholder.com', 'source.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
};

module.exports = nextConfig;