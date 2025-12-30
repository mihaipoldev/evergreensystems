"use client";

import { ReactNode } from "react";
import { AccountSettings } from "./AccountSettings";
import { AppearanceSettings } from "./AppearanceSettings";

type Section = "account" | "appearance";

interface SettingsContentProps {
  activeSection: Section;
}

export function SettingsContent({ activeSection }: SettingsContentProps) {
  const getContent = (): ReactNode => {
    switch (activeSection) {
      case "account":
        return <AccountSettings />;
      case "appearance":
        return <AppearanceSettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div
        key={activeSection}
        className="animate-in fade-in-0 duration-200"
        style={{
          animation: "fadeIn 0.2s ease-in-out",
        }}
      >
        {getContent()}
      </div>
    </div>
  );
}
