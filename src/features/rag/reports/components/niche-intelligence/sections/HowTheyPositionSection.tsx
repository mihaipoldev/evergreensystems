"use client";

import { SectionWrapper, TagCloud, BlockHeader } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faBullseye,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

interface CommonAngle {
  angle_name?: string;
  target_audience?: string;
  core_promise?: string;
  proof_points?: string[];
  keywords?: string[];
}

interface HowTheyPosition {
  common_angles?: CommonAngle[];
  value_propositions?: string[];
  common_differentiators?: string[];
}

interface HowTheyPositionSectionProps {
  data: HowTheyPosition;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const HowTheyPositionSection = ({
  data,
  sectionNumber = "14",
}: HowTheyPositionSectionProps) => {
  return (
    <SectionWrapper
      id="how-they-position"
      number={sectionNumber}
      title="How They Position"
      subtitle="Positioning angles, value propositions, and differentiators"
    >
      <div className="space-y-8">
        {data.common_angles && data.common_angles.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Common Positioning Angles"
              icon={<FontAwesomeIcon icon={faStar} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-4">
              {data.common_angles.map((angle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4">
                    <div className="bg-secondary p-5 lg:border-r border-border">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                        Angle
                      </span>
                      <h5 className="text-lg font-display font-semibold text-foreground">
                        {getText(angle.angle_name, `Angle ${index + 1}`)}
                      </h5>
                      <p className="text-sm text-muted-foreground font-body mt-2">
                        {getText(angle.target_audience, "")}
                      </p>
                    </div>
                    <div className="lg:col-span-3 p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                            Core Promise
                          </span>
                          <p className="text-sm font-body text-foreground">
                            {getText(angle.core_promise, "")}
                          </p>
                        </div>
                      </div>
                      {angle.proof_points && angle.proof_points.length > 0 && (
                        <div className="flex items-start gap-3 mb-4">
                          <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                              Proof Points
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {angle.proof_points.map((point, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-body rounded border border-green-200 dark:border-green-800"
                                >
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {angle.keywords && angle.keywords.length > 0 && (
                        <div>
                          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">
                            Keywords to Use
                          </span>
                          <TagCloud tags={angle.keywords} variant="outline" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.value_propositions && data.value_propositions.length > 0 && (
            <div>
              <BlockHeader variant="title" title="Value Propositions" />
              <TagCloud tags={data.value_propositions} variant="accent" />
            </div>
          )}
          {data.common_differentiators && data.common_differentiators.length > 0 && (
            <div>
              <BlockHeader variant="title" title="Common Differentiators" />
              <TagCloud tags={data.common_differentiators} />
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};
