import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: SEO_CONFIG.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
