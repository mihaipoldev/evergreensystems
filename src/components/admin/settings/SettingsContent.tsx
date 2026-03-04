"use client";

import { AccountSettings } from "./AccountSettings";

export function SettingsContent() {
  return (
    <div className="flex-1 min-w-0">
      <div
        className="animate-in fade-in-0 duration-200"
        style={{
          animation: "fadeIn 0.2s ease-in-out",
        }}
      >
        <AccountSettings />
      </div>
    </div>
  );
}
