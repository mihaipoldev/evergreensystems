import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    // Allow images from Bunny CDN and other common domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
      },
      {
        protocol: 'https',
        hostname: 'fast.wistia.com',
      },
    ],
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum quality for optimized images
    minimumCacheTTL: 60,
  },
  
  // Compression (enabled by default in Next.js, but explicit)
  compress: true,
  
  // SWC minification is enabled by default in Next.js 13+ and cannot be configured
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Experimental features for performance
  experimental: {
    // Optimize CSS - DISABLED to prevent CSS caching issues
    // optimizeCss: true,
    // Disable optimized loading in development to prevent caching
    ...(isDevelopment && {
      disableOptimizedLoading: true,
    }),
  },
  
  // Headers for performance, security, and anti-caching in development
  async headers() {
    const baseHeaders = [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];

    // Development: Prevent ALL caching
    if (isDevelopment) {
      return [
        ...baseHeaders,
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, must-revalidate, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
      ];
    }

    // Production: Normal caching for static assets
    return [
      ...baseHeaders,
    {
      // HTML/SSR routes: always revalidate to avoid stale pages
      source: '/((?!_next/static|_next/image|.*\\.(?:js|css|jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)).*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, must-revalidate, max-age=0',
        },
      ],
    },
    {
      // API routes: no caching to ensure fresh data
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, must-revalidate, max-age=0',
        },
      ],
    },
      {
        // Cache static assets (images, fonts)
        source: '/:path*\\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    {
      // Cache built JS chunks served from _next/static
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
      {
        // Cache CSS in production
        source: '/:path*\\.css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
