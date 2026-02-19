"use client";

import { SectionWrapper, BlockHeader, ContentCard } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaptop } from "@fortawesome/free-solid-svg-icons";

type TechnographicSignals = {
  description?: string;
  positive?: string[];
  negative?: string[];
};

interface TechnographicSignalsSectionProps {
  technographicSignals: TechnographicSignals;
  sectionNumber?: string;
}

export const TechnographicSignalsSection = ({
  technographicSignals,
  sectionNumber = "06",
}: TechnographicSignalsSectionProps) => {
  const positive = technographicSignals?.positive ?? [];
  const negative = technographicSignals?.negative ?? [];

  if (positive.length === 0 && negative.length === 0) return null;

  return (
    <SectionWrapper
      id="technographic-signals"
      number={sectionNumber}
      title="Technographic Signals"
      subtitle={technographicSignals?.description || undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {positive.length > 0 && (
          <ContentCard variant="green" title="Positive Signals">
            <ul className="space-y-2">
              {positive.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </ContentCard>
        )}
        {negative.length > 0 && (
          <ContentCard variant="danger" title="Negative Signals">
            <ul className="space-y-2">
              {negative.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </ContentCard>
        )}
      </div>
    </SectionWrapper>
  );
};
