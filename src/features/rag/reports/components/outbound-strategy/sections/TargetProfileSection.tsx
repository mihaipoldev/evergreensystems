"use client";

import { SectionWrapper, StatCard, BlockHeader, InsightList } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faDollarSign,
  faMapMarkerAlt,
  faCheckCircle,
  faXmarkCircle,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

type TargetProfile = {
  description?: string;
  must_haves?: string[];
  disqualifiers?: string[];
  strong_signals?: string[];
  employee_count?: string;
  company_revenue?: string;
  geographic_focus?: string;
};

interface TargetProfileSectionProps {
  targetProfile: TargetProfile;
  sectionNumber?: string;
}

export const TargetProfileSection = ({
  targetProfile,
  sectionNumber = "02",
}: TargetProfileSectionProps) => {
  const mustHaves = targetProfile?.must_haves ?? [];
  const disqualifiers = targetProfile?.disqualifiers ?? [];
  const strongSignals = targetProfile?.strong_signals ?? [];

  return (
    <SectionWrapper
      id="target-profile"
      number={sectionNumber}
      title="Target Profile"
      subtitle={targetProfile?.description ?? "Ideal customer profile definition"}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {targetProfile?.employee_count && (
          <StatCard
            label="Employee Count"
            value={targetProfile.employee_count}
            icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5" />}
          />
        )}
        {targetProfile?.company_revenue && (
          <StatCard
            label="Company Revenue"
            value={targetProfile.company_revenue}
            icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
          />
        )}
        {targetProfile?.geographic_focus && (
          <StatCard
            label="Geographic Focus"
            value={targetProfile.geographic_focus}
            icon={<FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5" />}
          />
        )}
      </div>

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
