import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import "./globals.css";
import { StylePresetProvider } from "@/providers/StylePresetProvider";
import { AdminColorStyle } from "@/components/admin/styling/AdminColorStyle";
import { InstantColorApply } from "@/components/admin/styling/InstantColorApply";
import { AdminFontStyle } from "@/components/admin/styling/AdminFontStyle";
import { InstantFontApply } from "@/components/admin/styling/InstantFontApply";
import { FontLoadingGuard } from "@/components/admin/styling/FontLoadingGuard";
import { WebsiteColorStyle } from "@/components/admin/styling/WebsiteColorStyle";
import { WebsiteFontStyle } from "@/components/admin/styling/WebsiteFontStyle";
import { getSelectedFontVariables, getAllFontVariables, nunitoSans } from "@/lib/fonts";
import { parseFontFamily, getDefaultFontFamily } from "@/lib/font-utils";
import { createClient } from "@/lib/supabase/server";
import type { FontId } from "@/types/fonts";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { FloatingProgressIndicatorWrapper } from "@/components/shared/FloatingProgressIndicatorWrapper";
import { ConsoleLogFilter } from "@/components/shared/ConsoleLogFilter";
import { SEO_CONFIG, ALL_KEYWORDS } from "@/lib/seo";
import { getTimestamp, getDuration, debugServerTiming, timeAsync } from "@/lib/debug-performance";

// Force dynamic rendering since we use headers() to detect admin pages
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: `%s | ${SEO_CONFIG.siteName}`,
  },
  description: SEO_CONFIG.defaultDescription,
  keywords: ALL_KEYWORDS,
  authors: [{ name: SEO_CONFIG.author }],
  creator: SEO_CONFIG.author,
  publisher: SEO_CONFIG.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: SEO_CONFIG.locale,
    url: SEO_CONFIG.siteUrl,
    siteName: SEO_CONFIG.siteName,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
  },
  alternates: {
    canonical: SEO_CONFIG.siteUrl,
  },
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  manifest: '/manifest.json',
  // Icons commented out until icon files are created
  // icons: {
  //   icon: [
  //     { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
  //     { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
  //     { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
  //     { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  //   ],
  //   apple: [
  //     { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  //   ],
  //   shortcut: '/favicon.ico',
  // },
  other: {
    'theme-color': '#000000', // Will be updated based on actual theme
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layoutStartTime = getTimestamp();
  
  // Safely get headers with fallback
  let pathname = "";
  let isAdminPage = false;
  
  const headerStartTime = getTimestamp();
  try {
    const headersList = await headers();
    pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
    isAdminPage = (pathname.includes("/admin") && !pathname.includes("/admin/login")) || pathname.includes("/intel");
    const headerDuration = getDuration(headerStartTime);
    debugServerTiming("Root Layout", "Header detection", headerDuration, { pathname, isAdminPage });
  } catch (error) {
    // If headers() fails, continue without admin features
    // This prevents the entire site from breaking
    const headerDuration = getDuration(headerStartTime);
    debugServerTiming("Root Layout", "Header detection (ERROR)", headerDuration, { error: error instanceof Error ? error.message : 'Unknown error' });
    console.warn('Failed to get headers in layout:', error);
  }

  // PERFORMANCE: Load only selected fonts, with safe fallback to all fonts
  // This reduces font loading from ~500-800KB to ~100-200KB when optimization works
  let fontClasses = "";
  const fontsToLoad: FontId[] = [];
  
  const fontSelectionStartTime = getTimestamp();
  try {
    if (isAdminPage) {
      // For admin pages: always load only nunito-sans (no dynamic font switching)
      fontsToLoad.push("nunito-sans");
      debugServerTiming("Root Layout", "Admin font load", getDuration(fontSelectionStartTime), {
        font: "nunito-sans"
      });
    } else {
      // For public pages: ALWAYS get landing fonts from website_settings preset
      // Don't use cookie - always query database to get the correct preset fonts
      try {
        const publicFontStartTime = getTimestamp();
        const supabase = await createClient();
        const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';
        
        const { data: settings } = await (supabase
          .from("website_settings") as any)
          .select(`
            preset_id,
            website_settings_presets (
              font_family
            )
          `)
          .eq("environment", environment)
          .maybeSingle();
        
        if (settings?.website_settings_presets) {
          const preset = Array.isArray(settings.website_settings_presets) 
            ? settings.website_settings_presets[0] 
            : settings.website_settings_presets;
          
          if (preset?.font_family) {
            const fonts = parseFontFamily(preset.font_family);
            // Add landing fonts from preset (these are the correct ones for the landing page)
            if (fonts.landing?.heading) {
              fontsToLoad.push(fonts.landing.heading);
            }
            if (fonts.landing?.body) {
              fontsToLoad.push(fonts.landing.body);
            }
          }
        }
        const publicFontDuration = getDuration(publicFontStartTime);
        debugServerTiming("Root Layout", "Public font query", publicFontDuration, { 
          environment,
          fontsLoaded: fontsToLoad.length 
        });
      } catch (error) {
        // Database query failed, will fall back to defaults below
        debugServerTiming("Root Layout", "Public font query (ERROR)", getDuration(getTimestamp()), {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.warn('Failed to get landing fonts from preset:', error);
      }
    }
    
    // Ensure we have the right fonts for the page type
    const defaults = getDefaultFontFamily();
    
    // For public pages, always ensure landing fonts are included
    if (!isAdminPage) {
      const hasLandingHeading = fontsToLoad.some(f => f === defaults.landing?.heading);
      const hasLandingBody = fontsToLoad.some(f => f === defaults.landing?.body);
      
      if (!hasLandingHeading && defaults.landing?.heading) {
        fontsToLoad.push(defaults.landing.heading);
      }
      if (!hasLandingBody && defaults.landing?.body) {
        fontsToLoad.push(defaults.landing.body);
      }
    }
    
    // Generate font classes - admin pages already have geist-sans, public pages have landing fonts
    const fontClassGenStartTime = getTimestamp();
    if (fontsToLoad.length > 0) {
      fontClasses = getSelectedFontVariables(fontsToLoad);
    } else {
      // Fallback to all defaults if nothing found (shouldn't happen with above logic)
      const defaultFonts: FontId[] = [
        defaults.admin.heading,
        defaults.admin.body,
      ];
      if (defaults.landing) {
        defaultFonts.push(defaults.landing.heading, defaults.landing.body);
      }
      fontClasses = getSelectedFontVariables(defaultFonts);
    }
    const fontClassGenDuration = getDuration(fontClassGenStartTime);
    debugServerTiming("Root Layout", "Font class generation", fontClassGenDuration, { 
      fontsCount: fontsToLoad.length,
      fontClasses: fontClasses.split(' ').length 
    });
    
    const fontSelectionDuration = getDuration(fontSelectionStartTime);
    debugServerTiming("Root Layout", "Font selection total", fontSelectionDuration, { 
      fontsToLoad: fontsToLoad,
      source: isAdminPage ? 'admin' : 'public'
    });
  } catch (error) {
    // CRITICAL: If anything fails, fall back to loading ALL fonts
    // This ensures fonts always work, even if optimization fails
    const fontSelectionDuration = getDuration(fontSelectionStartTime);
    debugServerTiming("Root Layout", "Font selection (ERROR)", fontSelectionDuration, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.warn('Font selection failed, falling back to all fonts:', error);
    fontClasses = getAllFontVariables();
  }
  
  // Final safety check: ensure fontClasses is never empty
  if (!fontClasses || fontClasses.trim() === "") {
    fontClasses = getAllFontVariables();
  }
  
  const layoutTotalDuration = getDuration(layoutStartTime);
  debugServerTiming("Root Layout", "Total render", layoutTotalDuration, { isAdminPage });

  // Ensure nunitoSans is included in the build for admin pages
  // Next.js needs to see the font object being used to include it
  const adminFontClass = isAdminPage ? nunitoSans.variable : "";

  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${fontClasses}${isAdminPage ? ` ${adminFontClass} preset-admin` : ""}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* CRITICAL: Server-side color injection - must be first in body */}
        {/* Next.js will move style tags to head automatically */}
        {isAdminPage && <AdminColorStyle />}
        {/* CRITICAL: Server-side font injection */}
        {isAdminPage && <AdminFontStyle />}
        {/* Website styles for landing page (always include) */}
        <WebsiteColorStyle />
        <WebsiteFontStyle />
        {/* Client-side fallback from sessionStorage */}
        {isAdminPage && <InstantColorApply />}
        {isAdminPage && <InstantFontApply />}
        {isAdminPage && <FontLoadingGuard />}
        <ConsoleLogFilter />
        <StylePresetProvider />
        <Toaster />
        <SonnerToaster />
        <FloatingProgressIndicatorWrapper />
        {children}
      </body>
    </html>
  );
}
