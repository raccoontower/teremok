import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/listings/new', '/jobs/new', '/housing/new', '/services/new', '/profile'],
      },
    ],
    sitemap: 'https://teremok.live/sitemap.xml',
  };
}
