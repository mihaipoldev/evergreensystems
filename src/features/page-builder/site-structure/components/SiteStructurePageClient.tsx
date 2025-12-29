"use client";

import { useState, useCallback } from "react";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { SiteStructureList } from "./SiteStructureList";
import { PagesList } from "@/features/page-builder/pages/components/PagesList";
import { Button } from "@/components/ui/button";
import type { Page } from "@/features/page-builder/pages/types";
import type { SiteStructureWithPage } from "../types";

type SiteStructurePageClientProps = {
  pagesByType: Record<string, Page[]>;
  siteStructure: SiteStructureWithPage[];
  allPages: Page[];
};

export function SiteStructurePageClient({ pagesByType, siteStructure, allPages }: SiteStructurePageClientProps) {
  const [saveButtonState, setSaveButtonState] = useState<{
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => Promise<void>;
  }>({
    hasChanges: false,
    isSaving: false,
    onSave: async () => {},
  });

  const handleSaveButtonStateChange = useCallback((state: {
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => Promise<void>;
  }) => {
    setSaveButtonState(state);
  }, []);

  return (
    <>
      <AdminPageTitle
        title="Site Structure"
        rightSideContent={
          <Button
            onClick={saveButtonState.onSave}
            disabled={!saveButtonState.hasChanges || saveButtonState.isSaving}
            className="min-w-[140px]"
          >
            {saveButtonState.isSaving ? "Saving..." : "Save Changes"}
          </Button>
        }
      />
      <div className="space-y-8">
        <SiteStructureList 
          pagesByType={pagesByType} 
          siteStructure={siteStructure}
          onSaveButtonStateChange={handleSaveButtonStateChange}
        />
        
        {/* Pages Section */}
        <div className="pt-8">
          <PagesList initialPages={allPages} />
        </div>
      </div>
    </>
  );
}
