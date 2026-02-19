"use client";

import { SectionWrapper, BlockHeader } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

interface BehavioralSignalsSectionProps {
  behavioralSignals: string[];
  sectionNumber?: string;
}

export const BehavioralSignalsSection = ({
  behavioralSignals,
  sectionNumber = "07",
}: BehavioralSignalsSectionProps) => {
  if (!behavioralSignals || behavioralSignals.length === 0) return null;

  return (
    <SectionWrapper
      id="behavioral-signals"
      number={sectionNumber}
      title="Behavioral Signals"
      subtitle="Intent and engagement signals to prioritize outreach"
    >
      <ul className="space-y-2">
        {behavioralSignals.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground p-3 rounded-lg bg-accent/5 border border-accent/20">
            <FontAwesomeIcon icon={faBolt} className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            {s}
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
};
