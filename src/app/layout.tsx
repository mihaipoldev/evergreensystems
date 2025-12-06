import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { StylePresetProvider } from "@/providers/StylePresetProvider";
import { AdminColorStyle } from "@/components/admin/AdminColorStyle";
import { InstantColorApply } from "@/components/admin/InstantColorApply";
import { AdminFontStyle } from "@/components/admin/AdminFontStyle";
import { InstantFontApply } from "@/components/admin/InstantFontApply";
import { getAllFontVariables } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Evergreen Labs",
  description: "Evergreen Labs - Building the future, one project at a time.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
  const isAdminPage = pathname.includes("/admin") && !pathname.includes("/admin/login");

  return (
    <html lang="en" suppressHydrationWarning className={getAllFontVariables()}>
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
        {children}
      </body>
    </html>
  );
}
