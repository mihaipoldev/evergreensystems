"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SettingsSidebar } from "@/components/admin/settings/SettingsSidebar";
import { SettingsContent } from "@/components/admin/settings/SettingsContent";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

type Section = "account" | "appearance-v2";

const SETTINGS_TAB_STORAGE_KEY = "settings-last-section";
const DEFAULT_SECTION: Section = "appearance-v2";

const SECTION_URL_MAP: Record<Section, string> = {
  account: "account",
  "appearance-v2": "appearance-v2",
};

const URL_SECTION_MAP: Record<string, Section> = {
  account: "account",
  "appearance-v2": "appearance-v2",
};

/**
 * Get the stored settings section from localStorage
 */
function getStoredSettingsSection(): Section | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SETTINGS_TAB_STORAGE_KEY);
  if (stored && (stored === "account" || stored === "appearance-v2")) {
    return stored as Section;
  }
  return null;
}

/**
 * Set the stored settings section in localStorage
 */
function setStoredSettingsSection(section: Section): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_TAB_STORAGE_KEY, section);
}

export function SettingsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  // Derive active section from URL or localStorage
  const getActiveSection = (): Section => {
    const tabParam = searchParams.get("tab");
    if (tabParam && URL_SECTION_MAP[tabParam]) {
      return URL_SECTION_MAP[tabParam];
    }
    const stored = getStoredSettingsSection();
    return stored || DEFAULT_SECTION;
  };

  const [activeSection, setActiveSection] = useState<Section>(getActiveSection);
  const isInitializedRef = useRef(false);
  const isUserClickRef = useRef(false);

  // Initialize on mount - set URL if missing, restore from localStorage
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const tabParam = searchParams.get("tab");
    
    if (tabParam && URL_SECTION_MAP[tabParam]) {
      // URL has valid tab - use it and save to localStorage
      const section = URL_SECTION_MAP[tabParam];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection(section);
      setStoredSettingsSection(section);
    } else {
      // No URL param - restore from localStorage or use default
      const storedSection = getStoredSettingsSection();
      const section = storedSection || DEFAULT_SECTION;
      setActiveSection(section);
      setStoredSettingsSection(section);
      router.replace(`/admin/settings?tab=${SECTION_URL_MAP[section]}`, { scroll: false });
    }
  }, [searchParams, router]);

  // Sync state with URL changes (browser back/forward only, not user clicks)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    // Skip if this is from a user click
    if (isUserClickRef.current) {
      isUserClickRef.current = false;
      return;
    }
    
    const tabParam = searchParams.get("tab");
    if (tabParam && URL_SECTION_MAP[tabParam]) {
      const section = URL_SECTION_MAP[tabParam];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSection((current) => {
        if (current !== section) {
          setStoredSettingsSection(section);
          return section;
        }
        return current;
      });
    }
  }, [searchParams]);

  const handleSectionChange = useCallback((section: Section) => {
    // Don't do anything if already on this section
    if (section === activeSection) return;
    
    // Mark as user click to prevent useEffect interference
    isUserClickRef.current = true;
    
    // Update state and localStorage immediately
    setActiveSection(section);
    setStoredSettingsSection(section);
    
    // Update URL (use replace to avoid history pollution)
    router.replace(`/admin/settings?tab=${SECTION_URL_MAP[section]}`, { scroll: false });
  }, [activeSection, router]);

  return (
    <>
      <div>
        {isMobile ? (
          <div className="space-y-6">
            <Tabs value={activeSection} onValueChange={(value) => handleSectionChange(value as Section)}>
              <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                <TabsTrigger value="account" className="w-full">Account</TabsTrigger>
                <TabsTrigger value="appearance-v2" className="w-full">Brand Colors</TabsTrigger>
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
