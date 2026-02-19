"use client";

import {
  SectionWrapper,
  ContentCard,
  InsightList,
  BlockHeader,
  KeyValueBlock,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faQuoteLeft,
  faCogs,
  faCheckCircle,
  faBalanceScale,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface GuaranteeDesignSectionProps {
  data: NonNullable<OfferArchitectData["guarantee_design"]>;
  sectionNumber?: string;
}

export const GuaranteeDesignSection = ({
  data,
  sectionNumber = "05",
}: GuaranteeDesignSectionProps) => {
  const mechanics = data.guarantee_mechanics;
  const safety = data.mathematical_safety;

  return (
    <SectionWrapper
      id="guarantee-design"
      number={sectionNumber}
      title="Guarantee Design"
      subtitle="Risk reversal mechanism, mechanics, and mathematical safety"
    >
      <div className="space-y-8">
        {/* Guaranteed Metric */}
        {data.guaranteed_metric && (
          <ContentCard
            variant="success"
            title="Guaranteed Metric"
            icon={<FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5" />}
          >
            <p className="text-lg md:text-xl font-display font-semibold text-foreground leading-relaxed">
              {data.guaranteed_metric}
            </p>
          </ContentCard>
        )}

        {/* Guarantee Statement */}
        {data.guarantee_statement && (
          <ContentCard
            variant="accent"
            title="Guarantee Statement"
            icon={<FontAwesomeIcon icon={faQuoteLeft} className="w-5 h-5" />}
          >
            <p className="text-base md:text-lg font-display font-medium text-foreground leading-relaxed italic">
              &ldquo;{data.guarantee_statement}&rdquo;
            </p>
          </ContentCard>
        )}

        {/* Qualified Criteria */}
        {data.qualified_criteria && data.qualified_criteria.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Qualification Criteria"
              icon={<FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-accent" />}
            />
            <InsightList items={data.qualified_criteria} type="success" />
          </div>
        )}

        {/* Guarantee Mechanics */}
        {mechanics && (
          <div>
            <BlockHeader
              variant="title"
              title="How It Works"
              icon={<FontAwesomeIcon icon={faCogs} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mechanics.how_it_works && (
                <KeyValueBlock label="Mechanism" value={mechanics.how_it_works} />
              )}
              {mechanics.evaluation_period && (
                <KeyValueBlock label="Evaluation Period" value={mechanics.evaluation_period} />
              )}
              {mechanics.if_met && (
                <KeyValueBlock label="If Met" value={
                  <span className="text-green-600 dark:text-green-400">{mechanics.if_met}</span>
                } />
              )}
              {mechanics.if_missed && (
                <KeyValueBlock label="If Missed" value={
                  <span className="text-amber-600 dark:text-amber-400">{mechanics.if_missed}</span>
                } />
              )}
            </div>
          </div>
        )}

        {/* Mathematical Safety */}
        {safety && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safety.why_this_is_safe_for_you && safety.why_this_is_safe_for_you.length > 0 && (
              <div>
                <BlockHeader
                  variant="title"
                  title="Why This Is Safe For You"
                  icon={<FontAwesomeIcon icon={faBalanceScale} className="w-5 h-5 text-green-500" />}
                />
                <InsightList items={safety.why_this_is_safe_for_you} type="success" />
              </div>
            )}
            {safety.why_this_is_fair_for_them && safety.why_this_is_fair_for_them.length > 0 && (
              <div>
                <BlockHeader
                  variant="title"
                  title="Why This Is Fair For Them"
                  icon={<FontAwesomeIcon icon={faBalanceScale} className="w-5 h-5 text-accent" />}
                />
                <InsightList items={safety.why_this_is_fair_for_them} type="accent" />
              </div>
            )}
          </div>
        )}

        {/* Exit Conditions */}
        {data.exit_conditions?.you_stop_working_if && data.exit_conditions.you_stop_working_if.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Exit Conditions"
              icon={<FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 text-amber-500" />}
              subtitle="You stop working if..."
            />
            <InsightList items={data.exit_conditions.you_stop_working_if} type="warning" />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
