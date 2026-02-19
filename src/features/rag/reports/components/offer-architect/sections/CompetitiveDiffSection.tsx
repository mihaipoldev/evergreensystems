"use client";

import {
  SectionWrapper,
  ContentCard,
  InsightList,
  DataTable,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faFingerprint,
  faCrosshairs,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface CompetitiveDiffSectionProps {
  data: NonNullable<OfferArchitectData["competitive_differentiation"]>;
  sectionNumber?: string;
}

export const CompetitiveDiffSection = ({
  data,
  sectionNumber = "13",
}: CompetitiveDiffSectionProps) => {
  return (
    <SectionWrapper
      id="competitive-differentiation"
      number={sectionNumber}
      title="Competitive Differentiation"
      subtitle="Positioning against alternatives, unique mechanisms, and strategic wedge"
    >
      <div className="space-y-8">
        {/* Positioning Wedge — prominent */}
        {data.positioning_wedge && (
          <ContentCard
            variant="success"
            title="Positioning Wedge"
            icon={<FontAwesomeIcon icon={faCrosshairs} className="w-5 h-5" />}
          >
            <p className="text-lg md:text-xl font-display font-semibold text-foreground leading-relaxed">
              {data.positioning_wedge}
            </p>
          </ContentCard>
        )}

        {/* Vs Alternatives */}
        {data.vs_alternatives && data.vs_alternatives.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Vs. Alternatives"
              icon={<FontAwesomeIcon icon={faExchangeAlt} className="w-5 h-5 text-accent" />}
            />
            <DataTable
              headers={["Alternative", "Their Approach", "Our Approach", "Key Message"]}
              rows={data.vs_alternatives.map((alt) => [
                alt.alternative || "—",
                alt.their_approach || "—",
                alt.our_approach || "—",
                alt.key_message || "—",
              ])}
            />
          </div>
        )}

        {/* Unique Mechanisms */}
        {data.unique_mechanisms && data.unique_mechanisms.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Unique Mechanisms"
              icon={<FontAwesomeIcon icon={faFingerprint} className="w-5 h-5 text-accent" />}
            />
            <InsightList items={data.unique_mechanisms} type="accent" />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
