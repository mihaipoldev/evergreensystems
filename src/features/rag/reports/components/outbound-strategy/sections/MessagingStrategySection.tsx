"use client";

import { SectionWrapper, BlockHeader } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faMapMarkerAlt,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

type PersonalizationVector = {
  impact?: string;
  vector?: string;
  how_to_use?: string;
  where_to_find?: string;
};

type MessagingStrategy = {
  description?: string;
  personalization_vectors?: PersonalizationVector[];
};

interface MessagingStrategySectionProps {
  messagingStrategy: MessagingStrategy;
  sectionNumber?: string;
}

const impactColors: Record<string, string> = {
  "Very High": "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  High: "bg-accent/10 text-accent border-accent/20",
  Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Low: "bg-muted/50 text-muted-foreground border-border",
};

export const MessagingStrategySection = ({
  messagingStrategy,
  sectionNumber = "11",
}: MessagingStrategySectionProps) => {
  const vectors = messagingStrategy?.personalization_vectors ?? [];

  if (vectors.length === 0) return null;

  return (
    <SectionWrapper
      id="messaging-strategy"
      number={sectionNumber}
      title="Messaging Strategy"
      subtitle={messagingStrategy?.description || undefined}
    >
      <BlockHeader
        variant="title"
        title="Personalization Vectors"
        icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />}
      />
      <div className="space-y-6">
        {vectors.map((v, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
          >
            <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
              <h4 className="font-display font-semibold text-foreground">
                {v.vector?.replace(/_/g, " ") ?? `Vector ${index + 1}`}
              </h4>
              {v.impact && (
                <span
                  className={`text-xs font-body font-medium px-2.5 py-1 rounded-md border ${
                    impactColors[v.impact] ?? impactColors.Medium
                  }`}
                >
                  {v.impact} Impact
                </span>
              )}
            </div>
            <div className="p-5 space-y-4">
              {v.how_to_use && (
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                      How to Use
                    </span>
                    <p className="text-sm font-body text-foreground whitespace-pre-wrap">
                      {v.how_to_use}
                    </p>
                  </div>
                </div>
              )}
              {v.where_to_find && (
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                      Where to Find
                    </span>
                    <p className="text-sm font-body text-foreground">{v.where_to_find}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
