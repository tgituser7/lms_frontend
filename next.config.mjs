/** @type {import('next').NextConfig} */

const BACKEND_URL = "https://facechatappbackend.onrender.com" || 'http://localhost:5000';
// const BACKEND_URL =  'http://localhost:5000';

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
      {
        source: '/technologies',
        destination: '/courses',
      },
      {
        source: '/technologies/:path*',
        destination: '/courses/:path*',
      },
    ];
  },
};

export default nextConfig;
