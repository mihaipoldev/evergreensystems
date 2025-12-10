/**
 * SEO Configuration and Utilities
 * Centralized SEO constants and helper functions
 */

export const SEO_CONFIG = {
  siteName: 'Evergreen Systems | AI Automation',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://evergreensystems.ai',
  defaultTitle: 'Evergreen Systems | AI Automation',
  defaultDescription: 'AI automation agency specializing in AI workflow automation, outbound systems, and B2B automation. We build custom AI-powered lead generation and business process automation solutions.',
  // Homepage specific SEO
  homepageTitle: 'Evergreen Systems | AI Automation & Outbound Systems for B2B',
  homepageDescription: 'Evergreen Systems builds AI-powered outbound and workflow automations for B2B companies. Done-for-you cold email systems, lead scraping, CRM enrichment, and custom n8n workflows. Book a strategy call.',
  author: 'Evergreen Systems',
  locale: 'en_US',
  language: 'en',
} as const;

// Primary Keywords
export const PRIMARY_KEYWORDS = [
  'AI automation agency',
  'AI workflow automation',
  'AI outbound systems',
  'B2B automation agency',
  'AI business automation',
  'cold email automation',
  'lead generation automation',
  'AI-powered lead generation',
  'outbound automation',
  'AI systems for business',
];

// Secondary Keywords
export const SECONDARY_KEYWORDS = [
  'business process automation',
  'AI agents for business',
  'AI lead scraping',
  'sales automation systems',
  'outbound workflow automation',
  'cold outreach automation',
  'data enrichment automation',
  'n8n workflow consulting',
  'AI integration services',
  'custom business automations',
];

// Long-Tail Keywords
export const LONG_TAIL_KEYWORDS = [
  'AI automation for agencies',
  'AI outbound system setup',
  'done-for-you automation workflows',
  'cold email automation workflows',
  'automating outbound prospecting with AI',
  'n8n automation expert',
  'AI-powered CRM enrichment',
  'automation for B2B companies',
];

// Combined keywords for meta tag
export const ALL_KEYWORDS = [
  ...PRIMARY_KEYWORDS,
  ...SECONDARY_KEYWORDS,
  ...LONG_TAIL_KEYWORDS,
].join(', ');

/**
 * Generate comprehensive metadata for pages
 */
export function generatePageMetadata({
  title,
  description,
  url,
  image,
  keywords,
  skipTitleTemplate = false,
}: {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  keywords?: string;
  skipTitleTemplate?: boolean;
}) {
  const pageTitle = title 
    ? (skipTitleTemplate ? title : `${title} | ${SEO_CONFIG.siteName}`)
    : SEO_CONFIG.defaultTitle;
  
  const pageDescription = description || SEO_CONFIG.defaultDescription;
  const pageUrl = url || SEO_CONFIG.siteUrl;
  const pageImage = image || `${SEO_CONFIG.siteUrl}/og-image.jpg`; // Placeholder for future image
  const pageKeywords = keywords || ALL_KEYWORDS;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: SEO_CONFIG.siteName,
      type: 'website',
      locale: SEO_CONFIG.locale,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      // site: '@evergreensystems', // Add when social account is created
      // creator: '@evergreensystems', // Add when social account is created
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      'author': SEO_CONFIG.author,
      'robots': 'index, follow',
      'language': SEO_CONFIG.language,
    },
  };
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(additionalData?: {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: additionalData?.name || SEO_CONFIG.siteName,
    description: additionalData?.description || SEO_CONFIG.defaultDescription,
    url: additionalData?.url || SEO_CONFIG.siteUrl,
    ...(additionalData?.logo && { logo: additionalData.logo }),
    sameAs: [
      // Add social media URLs when available
      // 'https://twitter.com/evergreensystems',
      // 'https://linkedin.com/company/evergreensystems',
    ],
  };
}

/**
 * Generate Service/ServiceArea structured data
 */
export function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'AI Automation Services',
    provider: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    description: SEO_CONFIG.defaultDescription,
    offers: {
      '@type': 'Offer',
      description: 'AI automation services including workflow automation, outbound systems, lead generation, and business process automation',
    },
  };
}

/**
 * Generate WebSite structured data with potential search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.defaultDescription,
    // potentialAction: {
    //   '@type': 'SearchAction',
    //   target: {
    //     '@type': 'EntryPoint',
    //     urlTemplate: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`,
    //   },
    //   'query-input': 'required name=search_term_string',
    // },
  };
}
