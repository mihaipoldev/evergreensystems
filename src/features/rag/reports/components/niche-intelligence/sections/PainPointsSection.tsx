"use client";

import {
  SectionWrapper,
  InsightList,
  ContentCard,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faHeartPulse,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

interface PainPoints {
  core_pain_points?: string[];
  emotional_state?: string;
  bleeding_neck_trigger?: string;
}

interface PainPointsSectionProps {
  data: PainPoints;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const PainPointsSection = ({ data, sectionNumber = "11" }: PainPointsSectionProps) => {
  return (
    <SectionWrapper
      id="pain-points"
      number={sectionNumber}
      title="Pain Points"
      subtitle="Core challenges, emotional state, and critical triggers"
    >
      <div className="space-y-8">
        {data.core_pain_points && data.core_pain_points.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Core Pain Points"
              icon={<FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-destructive" />}
            />
            <InsightList items={data.core_pain_points} type="warning" numbered />
          </div>
        )}

        {data.emotional_state && (
          <ContentCard
            variant="warning"
            style="summary"
            title="Emotional State"
            icon={<FontAwesomeIcon icon={faHeartPulse} className="w-5 h-5" />}
          >
            <p className="text-base font-body text-foreground leading-relaxed">
              {getText(data.emotional_state, "")}
            </p>
          </ContentCard>
        )}

        {data.bleeding_neck_trigger && (
          <ContentCard
            variant="danger"
            style="summary"
            title="Bleeding Neck Trigger"
            icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5" />}
          >
            <p className="text-base font-body text-foreground leading-relaxed">
              {getText(data.bleeding_neck_trigger, "")}
            </p>
          </ContentCard>
        )}
      </div>
    </SectionWrapper>
  );
};
