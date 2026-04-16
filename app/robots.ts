import type { MetadataRoute } from 'next';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';

const privatePaths = [
  '/dashboard',
  '/analytics',
  '/billing',
  '/embed-library',
  '/import',
  '/inbox',
  '/integrations',
  '/landing-pages',
  '/request-builder',
  '/settings',
  '/wall-of-love',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/collect/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths,
      },
    ],
    sitemap: [absoluteUrl('/sitemap.xml')],
    host: getSiteUrl().host,
  };
}
