import type { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';
import { ALL_CITY_SLUGS } from '@/lib/utils/cityNames';

const BASE = 'https://teremok-app.vercel.app';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // не prerender во время build — env vars недоступны
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getAdminDb();

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/listings`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/jobs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/housing`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/safety`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    // SEO city pages
    ...ALL_CITY_SLUGS.map((slug) => ({
      url: `${BASE}/city/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];

  // Динамические страницы объявлений
  const dynamic: MetadataRoute.Sitemap = [];

  try {
    const [listings, jobs, housing, services, posts] = await Promise.all([
      db.collection('listings').where('status', '==', 'active').limit(200).get(),
      db.collection('jobs').where('status', '==', 'active').limit(200).get(),
      db.collection('housing').where('status', '==', 'active').limit(200).get(),
      db.collection('services').where('status', '==', 'active').limit(200).get(),
      db.collection('posts').where('status', '==', 'published').limit(100).get(),
    ]);

    listings.docs.forEach((d) => {
      dynamic.push({ url: `${BASE}/listings/${d.id}`, changeFrequency: 'weekly', priority: 0.7 });
    });
    jobs.docs.forEach((d) => {
      dynamic.push({ url: `${BASE}/jobs/${d.id}`, changeFrequency: 'weekly', priority: 0.7 });
    });
    housing.docs.forEach((d) => {
      dynamic.push({ url: `${BASE}/housing/${d.id}`, changeFrequency: 'weekly', priority: 0.7 });
    });
    services.docs.forEach((d) => {
      dynamic.push({ url: `${BASE}/services/${d.id}`, changeFrequency: 'weekly', priority: 0.6 });
    });
    posts.docs.forEach((d) => {
      const slug = d.data().slug as string | undefined;
      if (slug) dynamic.push({ url: `${BASE}/blog/${slug}`, changeFrequency: 'monthly', priority: 0.6 });
    });
  } catch (err) {
    console.error('[sitemap]', err);
  }

  return [...staticPages, ...dynamic];
}
