import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type AdminPageProps = {
  searchParams: Promise<{ scope?: string; tab?: string }>;
};

// Redirect /admin to /admin/analytics
export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const scope = params.scope || "30";
  const urlTab = params.tab;
  
  // Try to read tab from cookie if not in URL
  let tab = urlTab;
  if (!tab) {
    try {
      const cookieStore = await cookies();
      const tabCookie = cookieStore.get("admin-analytics-tab");
      if (tabCookie?.value && ["visits", "pageviews", "clicks", "videos", "faq-clicks"].includes(tabCookie.value)) {
        tab = tabCookie.value;
      }
    } catch {
      // Silently ignore cookie errors - will use default
    }
  }
  
  // Build redirect URL with scope and tab parameters
  const urlParams = new URLSearchParams();
  if (scope && scope !== "30") {
    urlParams.set("scope", scope);
  }
  if (tab && tab !== "visits") {
    urlParams.set("tab", tab);
  }
  
  const queryString = urlParams.toString();
  const redirectUrl = queryString 
    ? `/admin/analytics?${queryString}`
    : "/admin/analytics";
  
  redirect(redirectUrl);
}
