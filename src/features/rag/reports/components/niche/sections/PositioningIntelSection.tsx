"use client";

import { SectionWrapper } from "../../shared/SectionWrapper";
import { TagCloud } from "../../shared/TagCloud";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faBullseye,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import type { ReportData } from "../../../types";

interface PositioningIntelSectionProps {
  positioning: ReportData["data"]["positioning_intel"];
}

export const PositioningIntelSection = ({ positioning }: PositioningIntelSectionProps) => {
  return (
    <SectionWrapper
      id="positioning-intel"
      number="08"
      title="Positioning Intelligence"
      subtitle="How companies in this niche position themselves to their customers"
    >
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faStar} className="w-5 h-5 text-accent" />
          Their Positioning Angles
        </h4>
        <div className="space-y-4">
          {positioning.their_offer_angles.map((angle, index) => (
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
                    {angle.angle_name}
                  </h5>
                  <p className="text-sm text-muted-foreground font-body mt-2">
                    {angle.who_it_targets}
                  </p>
                </div>

                <div className="lg:col-span-3 p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                        Promise
                      </span>
                      <p className="text-sm font-body text-foreground">
                        {angle.promise}
                      </p>
                    </div>
                  </div>

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

                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">
                      Keywords to Use
                    </span>
                    <TagCloud tags={angle.keywords_to_use} variant="outline" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4">
            Value Propositions
          </h4>
          <TagCloud tags={positioning.value_propositions} variant="gold" />
        </div>
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4">
            Common Differentiators
          </h4>
          <TagCloud tags={positioning.common_differentiators} />
        </div>
      </div>
    </SectionWrapper>
  );
};

