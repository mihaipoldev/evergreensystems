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
      
      // Network request (includes headers, but not body)
      const networkStartTime = performance.now();
      const response = await fetch("/api/admin/sidebar-data");
      const networkEndTime = performance.now();
      const networkDuration = networkEndTime - networkStartTime;
      debugClientTiming("useSidebarData", "Network request (headers)", networkStartTime, {
        status: response.status,
        ok: response.ok,
        duration: networkDuration,
        contentType: response.headers.get("content-type")
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sidebar data");
      }

      // Read response body (this includes network transfer + parsing)
      const bodyStartTime = performance.now();
      const data = await response.json();
      const bodyEndTime = performance.now();
      const bodyDuration = bodyEndTime - bodyStartTime;
      debugClientTiming("useSidebarData", "Response body read + parse", bodyStartTime, {
        pagesCount: data.pages?.length || 0,
        sectionsPagesCount: Object.keys(data.sectionsByPage || {}).length,
        duration: bodyDuration,
        totalSections: (Object.values(data.sectionsByPage || {}) as any[][]).reduce((sum: number, sections: any[]) => sum + sections.length, 0)
      });

      const totalDuration = performance.now() - totalStartTime;
      debugClientTiming("useSidebarData", "Total", totalStartTime, {
        pagesCount: data.pages?.length || 0,
        totalSections: (Object.values(data.sectionsByPage || {}) as any[][]).reduce((sum: number, sections: any[]) => sum + sections.length, 0),
        networkDuration,
        bodyDuration,
        totalDuration
      });

      return data;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

