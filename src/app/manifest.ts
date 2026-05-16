import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EG DESK | AI Taekwondo Management',
    short_name: 'EG DESK',
    description: 'AI-powered Taekwondo management system',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'apple touch icon',
      },
    ],
  };
}
