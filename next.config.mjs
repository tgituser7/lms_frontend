/** @type {import('next').NextConfig} */

const BACKEND_URL = "https://facechatappbackend.onrender.com" || 'http://localhost:5000';

const nextConfig = {
  images: {
    domains: ['localhost','facechatappbackend.onrender.com'],
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
