import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#050a1e',
    theme_color: '#5b3df5',
    orientation: 'portrait',
    categories: ['business', 'productivity', 'marketing'],
    icons: [
      {
        src: absoluteUrl('/favicon.ico'),
        sizes: '64x64',
        type: 'image/x-icon',
      },
    ],
  };
}
