/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'muoxstvqqsuhgsywddhr.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'behzeswwogslfydvmowg.supabase.co',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);