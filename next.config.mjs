/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
