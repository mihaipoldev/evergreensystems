"use client";

import {
  SectionWrapper,
  StatCard,
  ContentCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faChartLine,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";

interface BasicProfile {
  name?: string;
  category?: string;
  summary?: string;
  primary_focus?: string;
  market_value?: string;
}

interface BasicProfileSectionProps {
  profile: BasicProfile;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const BasicProfileSection = ({ profile, sectionNumber = "01" }: BasicProfileSectionProps) => {
  return (
    <SectionWrapper
      id="basic-profile"
      number={sectionNumber}
      title="Basic Profile"
      subtitle="Market overview and niche summary"
    >
      <div className="space-y-6 mb-8">
        <ContentCard variant="default" style="summary" title="Summary">
          <p className="text-base font-body text-foreground leading-relaxed">
            {getText(profile.summary, "No summary available")}
          </p>
        </ContentCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Market Value"
          value={getText(profile.market_value, "—")}
          icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Category"
          value={getText(profile.category, "—")}
          icon={<FontAwesomeIcon icon={faBox} className="w-5 h-5" />}
        />
        <StatCard
          label="Primary Focus"
          value={getText(profile.primary_focus, "—")}
          icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />}
        />
      </div>
    </SectionWrapper>
  );
};
