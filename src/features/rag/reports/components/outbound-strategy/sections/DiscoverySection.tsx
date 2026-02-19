"use client";

import {
  SectionWrapper,
  BlockHeader,
  ContentCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faClock } from "@fortawesome/free-solid-svg-icons";

type Discovery = {
  description?: string;
  duration?: string;
  goals?: string[];
  key_questions?: string[];
  qualification_criteria?: string[];
  disqualification_signals?: string[];
};

interface DiscoverySectionProps {
  discovery: Discovery;
  sectionNumber?: string;
}

export const DiscoverySection = ({
  discovery,
  sectionNumber = "12",
}: DiscoverySectionProps) => {
  const goals = discovery?.goals ?? [];
  const questions = discovery?.key_questions ?? [];
  const qualCriteria = discovery?.qualification_criteria ?? [];
  const disqualSignals = discovery?.disqualification_signals ?? [];

  return (
    <SectionWrapper
      id="discovery"
      number={sectionNumber}
      title="Discovery Call Framework"
      subtitle={discovery?.description || undefined}
    >
      {discovery?.duration && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground font-body">
          <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
          Duration: {discovery.duration}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {goals.length > 0 && (
          <ContentCard title="Goals">
            <ul className="space-y-2">
              {goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </ContentCard>
        )}
        {questions.length > 0 && (
          <ContentCard title="Key Questions">
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm italic">
                  <span className="text-accent font-semibold">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ul>
          </ContentCard>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {qualCriteria.length > 0 && (
          <ContentCard variant="green" title="Qualification Criteria">
            <ul className="space-y-2">
              {qualCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </ContentCard>
        )}
        {disqualSignals.length > 0 && (
          <ContentCard variant="danger" title="Disqualification Signals">
            <ul className="space-y-2">
              {disqualSignals.map((s, i) => (
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
