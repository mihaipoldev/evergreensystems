"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/intel/PageHeader";
import type { PageHeaderData } from "@/components/intel/PageHeader";
import { getDefaultPageHeader } from "@/components/intel/intel-route-breadcrumbs";

const PageHeaderContext = createContext<{
  headerData: PageHeaderData | null;
  setHeader: (data: PageHeaderData | null) => void;
}>({
  headerData: null,
  setHeader: () => {},
});

export function usePageHeader() {
  return useContext(PageHeaderContext);
}

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [headerData, setHeaderDataState] = useState<PageHeaderData | null>(null);
  const setHeader = useCallback((data: PageHeaderData | null) => setHeaderDataState(data), []);
  return (
    <PageHeaderContext.Provider value={{ headerData, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function PageHeaderSlot() {
  const { headerData } = usePageHeader();
  const pathname = usePathname();
  const data = headerData ?? getDefaultPageHeader(pathname);
  if (!data) return null;
  return <PageHeader data={data} />;
}
