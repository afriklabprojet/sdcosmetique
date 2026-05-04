import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sdcosmetique.com';

const staticRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  { url: `${SITE_URL}/boutique`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${SITE_URL}/quiz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/avis`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${SITE_URL}/categorie/face`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${SITE_URL}/categorie/body`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${SITE_URL}/categorie/duo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${SITE_URL}/categorie/gammes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${SITE_URL}/categorie/kits`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${SITE_URL}/notre-histoire`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/engagements`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/ingredients`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/livraison`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${SITE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${SITE_URL}/cgv`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${SITE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes;
}
