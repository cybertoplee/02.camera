import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_EGDESK_BASE_PATH || process.env.EGDESK_BASE_PATH || '';

console.log('🔍 DEBUG next.config: NEXT_PUBLIC_EGDESK_BASE_PATH =', process.env.NEXT_PUBLIC_EGDESK_BASE_PATH);
console.log('🔍 DEBUG next.config: EGDESK_BASE_PATH =', process.env.EGDESK_BASE_PATH);
console.log('🔍 DEBUG next.config: Final config basePath =', basePath);

const nextConfig: NextConfig = {
  eslint: {
    // Always skip ESLint errors to prevent blocking on auto-generated files
    ignoreDuringBuilds: true,
  },
  // Only use basePath in production mode, not in dev mode
  basePath: process.env.NODE_ENV === 'development' ? '' : (process.env.EGDESK_BASE_PATH || ''),
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : (process.env.EGDESK_BASE_PATH || ''),

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        '*.loca.lt',
        '*.ngrok.io',
        '*.ngrok-free.app',
        '*.trycloudflare.com',
        '*.gitpod.io',
        '*.tryhook.io',
        '*.localto.net'
      ]
    }
  },

  // Allow external IP access for development resources (Fonts, HMR WebSocket, etc.)
  // This is required for mobile testing via IP address in Next.js 15/16 Turbopack
  allowedDevOrigins: ['192.168.0.7', 'localhost:3000'],

  typescript: {
    // Always skip TypeScript errors to prevent blocking on auto-generated files
    ignoreBuildErrors: true,
  },

};

console.log('🔍 DEBUG next.config: Final config basePath =', nextConfig.basePath);
console.log('🔍 DEBUG next.config: Final config assetPrefix =', nextConfig.assetPrefix);


export default nextConfig;
