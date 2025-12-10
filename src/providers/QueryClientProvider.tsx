"use client";

import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { getQueryClient } from "@/lib/react-query/client";

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}
