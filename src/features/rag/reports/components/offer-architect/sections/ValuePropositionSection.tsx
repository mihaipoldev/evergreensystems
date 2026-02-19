"use client";

import {
  SectionWrapper,
  StatCard,
  ContentCard,
  InsightList,
  BlockHeader,
  KeyValueBlock,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGem,
  faCog,
  faHeart,
  faChess,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface ValuePropositionSectionProps {
  data: NonNullable<OfferArchitectData["value_proposition"]>;
  sectionNumber?: string;
}

export const ValuePropositionSection = ({
  data,
  sectionNumber = "06",
}: ValuePropositionSectionProps) => {
  const eq = data.value_equation;

  return (
    <SectionWrapper
      id="value-proposition"
      number={sectionNumber}
      title="Value Proposition"
      subtitle="Value equation, benefits, and niche fit rationale"
    >
      <div className="space-y-8">
        {/* Value Equation */}
        {eq && (
          <div>
            <BlockHeader
              variant="title"
              title="Value Equation"
              icon={<FontAwesomeIcon icon={faGem} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {eq.dream_outcome && (
                <KeyValueBlock label="Dream Outcome" value={eq.dream_outcome} />
              )}
              {eq.likelihood_of_achievement && (
                <KeyValueBlock label="Likelihood of Achievement" value={eq.likelihood_of_achievement} />
              )}
              {eq.time_delay && (
                <KeyValueBlock label="Time Delay" value={eq.time_delay} />
              )}
              {eq.effort_and_sacrifice && (
                <KeyValueBlock label="Effort & Sacrifice" value={eq.effort_and_sacrifice} />
              )}
            </div>
            {eq.calculated_value && (
              <StatCard
                label="Calculated Value"
                value={eq.calculated_value}
                icon={<FontAwesomeIcon icon={faGem} className="w-5 h-5" />}
                variant="accent"
              />
            )}
          </div>
        )}

        {/* Benefits - 3 column grid */}
        {(data.functional_benefits || data.emotional_benefits || data.strategic_benefits) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.functional_benefits && data.functional_benefits.length > 0 && (
              <div>
                <BlockHeader
                  variant="title"
                  title="Functional Benefits"
                  icon={<FontAwesomeIcon icon={faCog} className="w-5 h-5 text-accent" />}
                />
                <InsightList items={data.functional_benefits} type="info" />
              </div>
            )}
            {data.emotional_benefits && data.emotional_benefits.length > 0 && (
              <div>
                <BlockHeader
                  variant="title"
                  title="Emotional Benefits"
                  icon={<FontAwesomeIcon icon={faHeart} className="w-5 h-5 text-accent" />}
                />
                <InsightList items={data.emotional_benefits} type="info" />
              </div>
            )}
            {data.strategic_benefits && data.strategic_benefits.length > 0 && (
              <div>
                <BlockHeader
                  variant="title"
                  title="Strategic Benefits"
                  icon={<FontAwesomeIcon icon={faChess} className="w-5 h-5 text-accent" />}
                />
                <InsightList items={data.strategic_benefits} type="info" />
              </div>
            )}
          </div>
        )}

        {/* Why This Works */}
        {data.why_this_works_for_this_niche && (
          <ContentCard
            variant="accent"
            title="Why This Works For This Niche"
            icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />}
          >
            <p className="text-base font-body text-foreground leading-relaxed">
              {data.why_this_works_for_this_niche}
            </p>
          </ContentCard>
        )}
      </div>
    </SectionWrapper>
  );
};
