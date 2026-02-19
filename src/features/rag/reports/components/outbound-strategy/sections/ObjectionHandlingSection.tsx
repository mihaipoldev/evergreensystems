"use client";

import { SectionWrapper } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faArrowRight,
  faCheck,
  faLightbulb,
  faHandshake,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

type ResponseFramework = {
  acknowledge?: string;
  reframe?: string;
  proof?: string;
  differentiate?: string;
  close?: string;
};

type CommonObjection = {
  objection?: string;
  response_framework?: ResponseFramework;
  underlying_concern?: string;
};

type ObjectionHandling = {
  description?: string;
  common_objections?: CommonObjection[];
};

interface ObjectionHandlingSectionProps {
  objectionHandling: ObjectionHandling;
  sectionNumber?: string;
}

const frameworkLabels: { key: keyof ResponseFramework; label: string; icon: typeof faCheck }[] = [
  { key: "acknowledge", label: "Acknowledge", icon: faCheck },
  { key: "reframe", label: "Reframe", icon: faLightbulb },
  { key: "differentiate", label: "Differentiate", icon: faArrowRight },
  { key: "close", label: "Close", icon: faHandshake },
];

export const ObjectionHandlingSection = ({
  objectionHandling,
  sectionNumber = "10",
}: ObjectionHandlingSectionProps) => {
  const objections = objectionHandling?.common_objections ?? [];

  if (objections.length === 0) {
    return (
      <SectionWrapper
        id="objection-handling"
        number={sectionNumber}
        title="Objection Handling"
        subtitle={objectionHandling?.description || undefined}
      >
        <p className="text-sm text-muted-foreground font-body">
          No objection handling strategies available
        </p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="objection-handling"
      number={sectionNumber}
      title="Objection Handling"
      subtitle={objectionHandling?.description || undefined}
    >
      <div className="space-y-6">
        {objections.map((obj, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
          >
            <div className="p-5 bg-muted/50 border-b border-border">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faComment} className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                    Objection
                  </span>
                  <p className="text-sm font-body font-medium text-foreground italic">
                    &ldquo;{obj.objection}&rdquo;
                  </p>
                </div>
              </div>
              {obj.underlying_concern && (
                <div className="mt-3 flex items-start gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground font-body italic">
                    Underlying concern: {obj.underlying_concern}
                  </p>
                </div>
              )}
            </div>

            {obj.response_framework && (
              <div className="p-5 space-y-4">
                {frameworkLabels.map(({ key, label, icon }) => {
                  const value = obj.response_framework?.[key];
                  if (!value) return null;
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <FontAwesomeIcon icon={icon} className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                          {label}
                        </span>
                        <p className="text-sm font-body text-foreground leading-relaxed">
                          {value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
