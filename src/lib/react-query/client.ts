"use client";

import { QueryClient } from "@tanstack/react-query";

// Create a singleton QueryClient instance
// This ensures we have a single instance across the app
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get cache configuration based on context
 * For admin routes: no cache (always fresh)
 * For public routes: light cache (30s stale, 2min gc)
 */
function getCacheConfig() {
  if (typeof window === "undefined") {
    // Server: minimal cache to ensure fresh data
    return {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: true,
    };
  }

  // Client: check if we're on admin route
  const isAdmin = window.location.pathname.startsWith("/admin");

  if (isAdmin) {
    return {
      staleTime: 0, // Always refetch
      gcTime: 0, // No cache retention
      refetchOnWindowFocus: true,
    };
  }

  // Public routes: light cache for performance
  return {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  };
}

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    const config = getCacheConfig();
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: config.staleTime,
          gcTime: config.gcTime,
          refetchOnWindowFocus: config.refetchOnWindowFocus,
          retry: 1,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  }

  // Browser: use singleton pattern to keep the same query client
  if (!browserQueryClient) {
    const config = getCacheConfig();
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: config.staleTime,
          gcTime: config.gcTime,
          refetchOnWindowFocus: config.refetchOnWindowFocus,
          retry: 1,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  }

  return browserQueryClient;
}
