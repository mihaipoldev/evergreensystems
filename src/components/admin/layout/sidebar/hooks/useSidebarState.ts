"use client";

import { useEffect, useState } from "react";
import type { Page } from "@/features/page-builder/pages/types";
import type { SidebarSection } from "../types";

const DEFAULT_OPEN_SECTIONS: SidebarSection[] = ['overview', 'pageBuilder', 'settings', 'database'];

export function useSidebarState(pages: Page[]) {
  const [openPages, setOpenPages] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(DEFAULT_OPEN_SECTIONS));
  const [isInitialized, setIsInitialized] = useState(false);
  const [manuallyClosedPages, setManuallyClosedPages] = useState<Set<string>>(new Set());

  // Load persisted sidebar state from localStorage
  useEffect(() => {
    if (pages.length > 0 && !isInitialized) {
      try {
        const stored = localStorage.getItem("admin-sidebar-open-pages");
        if (stored) {
          const storedPageIds = JSON.parse(stored) as string[];
          const storedSet = new Set(storedPageIds.filter((id) => 
            pages.some((page) => page.id === id)
          ));
          setOpenPages(storedSet);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading sidebar state:", error);
        setIsInitialized(true);
      }
    }
  }, [pages, isInitialized]);

  // Load persisted sections state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin-sidebar-open-sections");
      if (stored) {
        const storedSections = JSON.parse(stored) as string[];
        setOpenSections(new Set(storedSections));
      }
    } catch (error) {
      console.error("Error loading sidebar sections state:", error);
    }
  }, []);

  const togglePage = (pageId: string) => {
    setOpenPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        // User is closing the page - mark it as manually closed
        next.delete(pageId);
        setManuallyClosedPages((prevClosed) => new Set([...prevClosed, pageId]));
      } else {
        // User is opening the page - remove from manually closed set
        next.add(pageId);
        setManuallyClosedPages((prevClosed) => {
          const nextClosed = new Set(prevClosed);
          nextClosed.delete(pageId);
          return nextClosed;
        });
      }
      // Persist to localStorage
      try {
        localStorage.setItem("admin-sidebar-open-pages", JSON.stringify(Array.from(next)));
      } catch (error) {
        console.error("Error saving sidebar state:", error);
      }
      return next;
    });
  };

  const toggleSection = (sectionId: SidebarSection) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      // Persist to localStorage
      try {
        localStorage.setItem("admin-sidebar-open-sections", JSON.stringify(Array.from(next)));
      } catch (error) {
        console.error("Error saving sidebar sections state:", error);
      }
      return next;
    });
  };

  // Auto-open page if we're on a page route (but don't persist this)
  // Only auto-open if the page wasn't manually closed by the user
  const autoOpenPage = (pageId: string | null) => {
    if (isInitialized && pageId && !openPages.has(pageId) && !manuallyClosedPages.has(pageId)) {
      setOpenPages((prev) => {
        const next = new Set([...prev, pageId]);
        // Store updated state
        try {
          localStorage.setItem("admin-sidebar-open-pages", JSON.stringify(Array.from(next)));
        } catch (error) {
          console.error("Error saving sidebar state:", error);
        }
        return next;
      });
    }
  };

  // Clear manually closed flag when navigating away from a page's sections
  const clearManuallyClosed = (pageId: string) => {
    setManuallyClosedPages((prev) => {
      const next = new Set(prev);
      next.delete(pageId);
      return next;
    });
  };

  return {
    openPages,
    openSections,
    isInitialized,
    togglePage,
    toggleSection,
    autoOpenPage,
    manuallyClosedPages,
    clearManuallyClosed,
  };
}

