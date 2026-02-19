"use client";

import { SectionWrapper, BlockHeader, InsightList, ContentCard, TagCloud } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faCheckCircle,
  faXmarkCircle,
  faBolt,
  faBriefcase,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";

type TargetProfile = {
  description?: string;
  must_haves?: string[];
  disqualifiers?: string[];
  strong_signals?: string[];
  employee_count?: string;
  company_revenue?: string;
  geographic_focus?: string;
  business_model?: string;
  growth_stage?: string;
};

interface TargetProfileSectionProps {
  targetProfile: TargetProfile;
  sectionNumber?: string;
}

export const TargetProfileSection = ({
  targetProfile,
  sectionNumber = "01",
}: TargetProfileSectionProps) => {
  const mustHaves = targetProfile?.must_haves ?? [];
  const disqualifiers = targetProfile?.disqualifiers ?? [];
  const strongSignals = targetProfile?.strong_signals ?? [];

  return (
    <SectionWrapper
      id="target-profile"
      number={sectionNumber}
      title="Target Profile"
      subtitle={targetProfile?.description || undefined}
    >
      {(targetProfile?.business_model || targetProfile?.growth_stage) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {targetProfile?.business_model && (
            <ContentCard title="Business Model" icon={<FontAwesomeIcon icon={faBriefcase} className="w-5 h-5 text-accent" />}>
              <p className="text-sm font-body text-foreground">{targetProfile.business_model}</p>
            </ContentCard>
          )}
          {targetProfile?.growth_stage && (
            <ContentCard title="Growth Stage" icon={<FontAwesomeIcon icon={faSeedling} className="w-5 h-5 text-accent" />}>
              <p className="text-sm font-body text-foreground">{targetProfile.growth_stage}</p>
            </ContentCard>
          )}
        </div>
      )}

      {targetProfile?.geographic_focus && (() => {
        const raw = targetProfile.geographic_focus.trim();
        const afterColon = raw.includes(":") ? raw.slice(raw.indexOf(":") + 1).trim() : raw;
        const tags = afterColon.includes(",")
          ? afterColon.split(",").map((s) => s.trim()).filter(Boolean)
          : [afterColon];
        return (
          <div className="mb-8">
            <BlockHeader
              variant="title"
              title="Geographic Clusters"
              icon={<FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5 text-accent" />}
            />
            <TagCloud tags={tags} variant="accent" />
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <BlockHeader
            variant="title"
            title="Must Haves"
            icon={<FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600" />}
          />
          <InsightList items={mustHaves} type="success" />
        </div>
        <div>
          <BlockHeader
            variant="title"
            title="Disqualifiers"
            icon={<FontAwesomeIcon icon={faXmarkCircle} className="w-5 h-5 text-destructive" />}
          />
          <InsightList items={disqualifiers} type="warning" />
        </div>
        <div>
          <BlockHeader
            variant="title"
            title="Strong Signals"
            icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5 text-accent" />}
          />
          <InsightList items={strongSignals} type="target" />
        </div>
      </div>
    </SectionWrapper>
  );
};
