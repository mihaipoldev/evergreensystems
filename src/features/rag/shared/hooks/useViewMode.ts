"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ViewMode } from "../components/Toolbar";

const VIEW_MODE_STORAGE_PREFIX = "rag-view-mode-";

/**
 * Get a storage key for the current page based on pathname
 */
function getStorageKey(pathname: string): string {
  // Use the pathname to generate a unique key
  // e.g., "/intel/documents" -> "rag-view-mode-intel-documents"
  const normalizedPath = pathname.replace(/^\//, "").replace(/\//g, "-");
  return `${VIEW_MODE_STORAGE_PREFIX}${normalizedPath}`;
}

/**
 * Get stored view mode for a page
 */
function getStoredViewMode(storageKey: string): ViewMode | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(storageKey);
  if (stored === "grid" || stored === "table") {
    return stored as ViewMode;
  }
  return null;
}

/**
 * Set stored view mode for a page
 */
function setStoredViewMode(storageKey: string, mode: ViewMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, mode);
}

/**
 * Custom hook for per-page view mode persistence
 * Automatically uses the current pathname to generate a unique storage key
 * 
 * @param defaultMode - The default view mode if no stored preference exists
 * @returns A tuple of [viewMode, setViewMode] similar to useState
 * 
 * @example
 * const [viewMode, setViewMode] = useViewMode("grid");
 */
export function useViewMode(defaultMode: ViewMode = "grid"): [ViewMode, (mode: ViewMode) => void] {
  const pathname = usePathname();
  
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // Initialize from localStorage on mount
    if (typeof window === "undefined") return defaultMode;
    const initialKey = getStorageKey(pathname);
    const stored = getStoredViewMode(initialKey);
    return stored ?? defaultMode;
  });

  // Handle pathname changes (user navigates to different page)
  useEffect(() => {
    const newStorageKey = getStorageKey(pathname);
    const stored = getStoredViewMode(newStorageKey);
    if (stored) {
      setViewModeState(stored);
    } else {
      setViewModeState(defaultMode);
    }
  }, [pathname, defaultMode]);

  // Update storage when viewMode changes
  // This will also run when pathname changes and viewMode is loaded, which is fine (idempotent)
  useEffect(() => {
    const currentStorageKey = getStorageKey(pathname);
    setStoredViewMode(currentStorageKey, viewMode);
  }, [viewMode, pathname]);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
  };

  return [viewMode, setViewMode];
}

