"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { SettingsContent } from "@/components/admin/settings/SettingsContent";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

type Section = "account" | "appearance";

const SECTION_URL_MAP: Record<Section, string> = {
  account: "account",
  appearance: "appearance",
};

const URL_SECTION_MAP: Record<string, Section> = {
  account: "account",
  appearance: "appearance",
};

export function SettingsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<Section>("account");

  // Get section from URL or localStorage
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && URL_SECTION_MAP[tabParam]) {
      const section = URL_SECTION_MAP[tabParam];
      // Use requestAnimationFrame to defer state update
      requestAnimationFrame(() => {
        setActiveSection(section);
        localStorage.setItem("intel-settings-last-section", section);
      });
    } else {
      const lastSection = localStorage.getItem("intel-settings-last-section") as Section;
        if (lastSection && (lastSection === "account" || lastSection === "appearance")) {
        // Use requestAnimationFrame to defer state update
        requestAnimationFrame(() => {
          setActiveSection(lastSection);
        });
      }
    }
  }, [searchParams]);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    localStorage.setItem("intel-settings-last-section", section);
    router.push(`/intel/settings?tab=${SECTION_URL_MAP[section]}`, { scroll: false });
  };

  return (
    <>
      <div>
        {isMobile ? (
          <div className="space-y-6">
            <Tabs value={activeSection} onValueChange={(value) => handleSectionChange(value as Section)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>
            </Tabs>
            <SettingsContent activeSection={activeSection} />
          </div>
        ) : (
          <div className="flex gap-3">
            <SettingsSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
            <SettingsContent activeSection={activeSection} />
          </div>
        )}
      </div>
    </>
  );
}

