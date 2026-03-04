"use client";

import { useEffect, useState } from "react";
import type { SidebarSection } from "../types";

const DEFAULT_OPEN_SECTIONS: SidebarSection[] = ['overview', 'settings'];

export function useSidebarState() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(DEFAULT_OPEN_SECTIONS));

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

  const toggleSection = (sectionId: SidebarSection) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      try {
        localStorage.setItem("admin-sidebar-open-sections", JSON.stringify(Array.from(next)));
      } catch (error) {
        console.error("Error saving sidebar sections state:", error);
      }
      return next;
    });
  };

  return { openSections, toggleSection };
}
