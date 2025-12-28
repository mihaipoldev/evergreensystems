import { useQuery } from "@tanstack/react-query";
import { debugClientTiming } from "@/lib/debug-performance";

export type SidebarData = {
  pages: Array<{
    id: string;
    title: string;
    order: number;
  }>;
  sectionsByPage: Record<string, Array<{
    id: string;
    title: string | null;
    admin_title: string | null;
    type: string;
    position: number;
  }>>;
};

export function useSidebarData() {
  return useQuery<SidebarData>({
    queryKey: ["sidebar-data"],
    queryFn: async () => {
      const totalStartTime = performance.now();
      console.log("[useSidebarData] Starting fetch at", new Date().toISOString());
      
      // Network request (includes headers, but not body)
      const networkStartTime = performance.now();
      console.log("[useSidebarData] Fetching /api/admin/sidebar-data...");
      const response = await fetch("/api/admin/sidebar-data");
      const networkEndTime = performance.now();
      const networkDuration = networkEndTime - networkStartTime;
      console.log("[useSidebarData] Response received after", networkDuration, "ms");
      debugClientTiming("useSidebarData", "Network request (headers)", networkDuration, {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get("content-type")
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sidebar data");
      }

      // Read response body (this includes network transfer + parsing)
      const bodyStartTime = performance.now();
      console.log("[useSidebarData] Reading response body...");
      const data = await response.json();
      const bodyEndTime = performance.now();
      const bodyDuration = bodyEndTime - bodyStartTime;
      console.log("[useSidebarData] Body parsed after", bodyDuration, "ms");
      debugClientTiming("useSidebarData", "Response body read + parse", bodyDuration, {
        pagesCount: data.pages?.length || 0,
        sectionsPagesCount: Object.keys(data.sectionsByPage || {}).length,
        totalSections: (Object.values(data.sectionsByPage || {}) as any[][]).reduce((sum: number, sections: any[]) => sum + sections.length, 0)
      });

      const totalDuration = performance.now() - totalStartTime;
      console.log("[useSidebarData] Total time:", totalDuration, "ms (network:", networkDuration, "ms, body:", bodyDuration, "ms)");
      debugClientTiming("useSidebarData", "Total", totalDuration, {
        pagesCount: data.pages?.length || 0,
        totalSections: (Object.values(data.sectionsByPage || {}) as any[][]).reduce((sum: number, sections: any[]) => sum + sections.length, 0),
        networkDuration,
        bodyDuration
      });

      return data;
    },
    staleTime: 30 * 1000, // Cache for 30 seconds to reduce unnecessary refetches
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

