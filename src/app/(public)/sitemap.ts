import { MetadataRoute } from 'next';
import { getPageBySlug } from '@/lib/supabase/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evergreenlabs.com';
  
  // Get home page for last modified date
  let homePage = null;
  try {
    homePage = await getPageBySlug('home');
  } catch (error) {
    console.error('Error fetching home page for sitemap:', error);
  }

  const lastModified = homePage?.updated_at 
    ? new Date(homePage.updated_at)
    : new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
