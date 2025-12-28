"use client";

import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useRef } from "react";
import { getQueryClient } from "@/lib/react-query/client";
import { getTimestamp, getDuration, debugClientTiming } from "@/lib/debug-performance";

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const initStartTime = useRef<number>(getTimestamp());
  const queryClient = getQueryClient();

  useEffect(() => {
    const initDuration = getDuration(initStartTime.current);
    debugClientTiming("QueryClientProvider", "Initialization", initDuration);
  }, []);

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}
