"use client";

import {
  SectionWrapper,
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
      <div className="space-y-6">
        {data.core_pain_points && data.core_pain_points.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Core Pain Points"
              icon={<FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-2 mt-4">
              {data.core_pain_points.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-muted-foreground tabular-nums flex-shrink-0">
                    {index + 1}.
                  </span>
                  <p className="text-sm font-body text-foreground leading-snug">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.emotional_state && (
          <div>
            <BlockHeader
              variant="title"
              title="Emotional State"
              icon={<FontAwesomeIcon icon={faHeartPulse} className="w-5 h-5 text-accent" />}
            />
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mt-4">
              <p className="text-sm font-body text-foreground leading-relaxed">
                {getText(data.emotional_state, "")}
              </p>
            </div>
          </div>
        )}

        {data.bleeding_neck_trigger && (
          <div>
            <BlockHeader
              variant="title"
              title="Bleeding Neck Trigger"
              icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5 text-accent" />}
            />
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 mt-4">
              <p className="text-sm font-body text-foreground leading-relaxed">
                {getText(data.bleeding_neck_trigger, "")}
              </p>
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
