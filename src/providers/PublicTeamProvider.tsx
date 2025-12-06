"use client";

import { createContext, useContext, ReactNode } from "react";

// Public team member type - simple, for display only
export type PublicTeamMember = {
  name: string;
  color: string;
  initial?: string;
};

interface PublicTeamContextType {
  teamMembers: PublicTeamMember[];
  totalTeamCount: number;
  displayCount: number;
}

const PublicTeamContext = createContext<PublicTeamContextType | undefined>(undefined);

// Static team members for public landing page display
// These are simple avatars for the CTA section
const PUBLIC_TEAM_DISPLAY: PublicTeamMember[] = [
  { name: 'Alex', color: 'bg-primary', initial: 'A' },
  { name: 'Sam', color: 'bg-cyan-500', initial: 'S' },
  { name: 'Jordan', color: 'bg-purple-500', initial: 'J' },
  { name: 'Taylor', color: 'bg-blue-400', initial: 'T' },
];

const TOTAL_TEAM_COUNT = 16; // Total team size shown as "+12" badge

export function PublicTeamProvider({ children }: { children: ReactNode }) {
  const displayCount = PUBLIC_TEAM_DISPLAY.length;
  
  return (
    <PublicTeamContext.Provider 
      value={{ 
        teamMembers: PUBLIC_TEAM_DISPLAY,
        totalTeamCount: TOTAL_TEAM_COUNT,
        displayCount
      }}
    >
      {children}
    </PublicTeamContext.Provider>
  );
}

export function usePublicTeam() {
  const context = useContext(PublicTeamContext);
  if (context === undefined) {
    throw new Error("usePublicTeam must be used within PublicTeamProvider");
  }
  return context;
}
