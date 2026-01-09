"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface BulkSelectionContextType {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectRange: (ids: string[], startIndex: number, endIndex: number) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  getSelectedCount: () => number;
}

const BulkSelectionContext = createContext<BulkSelectionContextType | undefined>(undefined);

export function BulkSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    // Update last selected index when toggling
    // We'll need to find the index from the parent component
  }, []);

  const selectRange = useCallback((ids: string[], startIndex: number, endIndex: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const start = Math.min(startIndex, endIndex);
      const end = Math.max(startIndex, endIndex);
      
      for (let i = start; i <= end; i++) {
        if (ids[i]) {
          next.add(ids[i]);
        }
      }
      return next;
    });
    setLastSelectedIndex(endIndex);
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  const getSelectedCount = useCallback(() => {
    return selectedIds.size;
  }, [selectedIds]);

  return (
    <BulkSelectionContext.Provider
      value={{
        selectedIds,
        isSelected,
        toggleSelection,
        selectRange,
        selectAll,
        clearSelection,
        getSelectedCount,
      }}
    >
      {children}
    </BulkSelectionContext.Provider>
  );
}

export function useBulkSelection() {
  const context = useContext(BulkSelectionContext);
  if (context === undefined) {
    throw new Error("useBulkSelection must be used within a BulkSelectionProvider");
  }
  return context;
}

/**
 * Optional hook that returns null if BulkSelectionProvider is not available.
 * Use this when the component may be used outside the provider context.
 */
export function useBulkSelectionOptional() {
  const context = useContext(BulkSelectionContext);
  return context ?? null;
}

