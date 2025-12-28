import { MetadataRoute } from 'next';
import { getActivePageBySlug } from '@/lib/supabase/queries';
import { SEO_CONFIG } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get home page for last modified date
  let homePage = null;
  try {
    homePage = await getActivePageBySlug('home');
  } catch (error) {
    console.error('Error fetching home page for sitemap:', error);
  }

  const lastModified = homePage?.updated_at 
    ? new Date(homePage.updated_at)
    : new Date();

  return [
    {
      url: SEO_CONFIG.siteUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    // Future: Add additional pages here as they are created
    // {
    //   url: `${SEO_CONFIG.siteUrl}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
  ];
}
