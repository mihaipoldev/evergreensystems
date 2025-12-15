import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { StylePresetProvider } from "@/providers/StylePresetProvider";
import { AdminColorStyle } from "@/components/admin/AdminColorStyle";
import { InstantColorApply } from "@/components/admin/InstantColorApply";
import { AdminFontStyle } from "@/components/admin/AdminFontStyle";
import { InstantFontApply } from "@/components/admin/InstantFontApply";
import { geistSans, geistMono, lato, getAllFontVariables } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { SEO_CONFIG, ALL_KEYWORDS } from "@/lib/seo";

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
  // Safely get headers with fallback
  let pathname = "";
  let isAdminPage = false;
  
  try {
    const headersList = await headers();
    pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
    isAdminPage = pathname.includes("/admin") && !pathname.includes("/admin/login");
  } catch (error) {
    // If headers() fails, continue without admin features
    // This prevents the entire site from breaking
    console.warn('Failed to get headers in layout:', error);
  }

  // Load all fonts for both admin and public pages so all font CSS variables are available
  // This allows the landing page to use any font from the font registry
  const fontClasses = getAllFontVariables();

  return (
    <html lang="en" suppressHydrationWarning className={fontClasses}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* CRITICAL: Server-side color injection - must be first in body */}
        {/* Next.js will move style tags to head automatically */}
        {isAdminPage && <AdminColorStyle />}
        {/* CRITICAL: Server-side font injection */}
        {isAdminPage && <AdminFontStyle />}
        {/* Client-side fallback from sessionStorage */}
        {isAdminPage && <InstantColorApply />}
        {isAdminPage && <InstantFontApply />}
        <StylePresetProvider />
        <Toaster />
        <SonnerToaster />
        {children}
      </body>
    </html>
  );
}
