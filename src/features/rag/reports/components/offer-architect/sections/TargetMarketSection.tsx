"use client";

import {
  SectionWrapper,
  StatCard,
  ContentCard,
  InsightList,
  BlockHeader,
  DataTable,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBuilding,
  faBullseye,
  faCheckCircle,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface TargetMarketSectionProps {
  data: NonNullable<OfferArchitectData["target_market"]>;
  sectionNumber?: string;
}

export const TargetMarketSection = ({
  data,
  sectionNumber = "01",
}: TargetMarketSectionProps) => {
  const who = data.who_you_sell_to;
  const icp = data.their_icp;

  return (
    <SectionWrapper
      id="target-market"
      number={sectionNumber}
      title="Target Market"
      subtitle="Who you sell to and their ideal customer profile"
    >
      <div className="space-y-8">
        {/* Primary Audience & Company Size */}
        {(who?.primary_audience || who?.company_size) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {who?.primary_audience && (
              <ContentCard
                variant="accent"
                title="Primary Audience"
                icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5" />}
              >
                <p className="text-base font-body text-foreground leading-relaxed">
                  {who.primary_audience}
                </p>
              </ContentCard>
            )}
            {who?.company_size && (
              <StatCard
                label="Company Size"
                value={who.company_size}
                icon={<FontAwesomeIcon icon={faBuilding} className="w-5 h-5" />}
                variant="default"
              />
            )}
          </div>
        )}

        {/* Decision Makers */}
        {who?.decision_makers && who.decision_makers.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Decision Makers"
              icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-accent" />}
            />
            <DataTable
              headers={["Role", "Influence Level", "What They Care About"]}
              rows={who.decision_makers.map((dm) => [
                dm.role || "—",
                dm.influence_level || "—",
                dm.what_they_care_about || "—",
              ])}
            />
          </div>
        )}

        {/* ICP Description */}
        {icp?.description && (
          <ContentCard
            variant="default"
            title="Ideal Customer Profile"
            icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />}
          >
            <p className="text-base font-body text-foreground leading-relaxed">
              {icp.description}
            </p>
          </ContentCard>
        )}

        {/* Example Segments */}
        {icp?.example_segments && icp.example_segments.length > 0 && (
          <div>
            <BlockHeader variant="title" title="Example Segments" />
            <InsightList items={icp.example_segments} type="accent" />
          </div>
        )}

        {/* Responsibilities: What you DO vs DON'T */}
        {(icp?.your_responsibility || icp?.not_your_responsibility) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {icp?.your_responsibility && icp.your_responsibility.length > 0 && (
              <div>
                <BlockHeader
                  variant="title"
                  title="Your Responsibility"
                  icon={<FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-500" />}
                />
                <InsightList items={icp.your_responsibility} type="success" />
              </div>
            )}
            {icp?.not_your_responsibility && icp.not_your_responsibility.length > 0 && (
              <div>
                <BlockHeader
                  variant="title"
                  title="Not Your Responsibility"
                  icon={<FontAwesomeIcon icon={faBan} className="w-5 h-5 text-red-500" />}
                />
                <InsightList items={icp.not_your_responsibility} type="danger" />
              </div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
