"use client";

import {
  SectionWrapper,
  ContentCard,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faStar } from "@fortawesome/free-solid-svg-icons";

interface AspirationalWin {
  outcome?: string;
  why_it_matters?: string;
}

interface DesiredOutcomes {
  aspirational_wins?: AspirationalWin[];
  the_dream_scenario?: string;
}

interface DesiredOutcomesSectionProps {
  data: DesiredOutcomes;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const DesiredOutcomesSection = ({
  data,
  sectionNumber = "12",
}: DesiredOutcomesSectionProps) => {
  return (
    <SectionWrapper
      id="desired-outcomes"
      number={sectionNumber}
      title="Desired Outcomes"
      subtitle="Aspirational wins and the dream scenario"
    >
      <div className="space-y-8">
        {data.aspirational_wins && data.aspirational_wins.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Aspirational Wins"
              icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-4">
              {data.aspirational_wins.map((win, index) => (
                <ContentCard key={index} variant="success" title={getText(win.outcome, `Outcome ${index + 1}`)} titleVariant="title">
                  {win.why_it_matters && (
                    <p className="text-sm font-body text-muted-foreground">
                      <span className="font-medium text-foreground">Why it matters: </span>
                      {getText(win.why_it_matters, "")}
                    </p>
                  )}
                </ContentCard>
              ))}
            </div>
          </div>
        )}

        {data.the_dream_scenario && (
          <ContentCard
            variant="accent"
            style="summary"
            title="The Dream Scenario"
            icon={<FontAwesomeIcon icon={faStar} className="w-5 h-5" />}
          >
            <p className="text-base font-body text-foreground leading-relaxed">
              {getText(data.the_dream_scenario, "")}
            </p>
          </ContentCard>
        )}
      </div>
    </SectionWrapper>
  );
};
