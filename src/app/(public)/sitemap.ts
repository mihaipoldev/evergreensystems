import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo';
import { SHOW_DRAFTS } from '@/lib/drafts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: SEO_CONFIG.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // /contact is dev-only until the capture backend exists (page 404s in prod).
    ...(SHOW_DRAFTS
      ? [
          {
            url: `${SEO_CONFIG.siteUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          },
        ]
      : []),
  ];
}
