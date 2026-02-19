"use client";

import {
  SectionWrapper,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboardTeacher, faClock } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

type DemoStep = {
  section?: string;
  duration?: string;
  what_to_show?: string;
  goal?: string;
};

type Demo = {
  description?: string;
  duration?: string;
  timing?: string;
  flow?: DemoStep[];
};

interface DemoSectionProps {
  demo: Demo;
  sectionNumber?: string;
}

export const DemoSection = ({
  demo,
  sectionNumber = "13",
}: DemoSectionProps) => {
  const flow = demo?.flow ?? [];

  if (flow.length === 0) return null;

  return (
    <SectionWrapper
      id="demo"
      number={sectionNumber}
      title="Demo Structure"
      subtitle={demo?.description || undefined}
    >
      {(demo?.timing || demo?.duration) && (
        <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground font-body">
          {demo.timing && (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
              Schedule: {demo.timing}
            </span>
          )}
          {demo.duration && (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
              Duration: {demo.duration}
            </span>
          )}
        </div>
      )}

      <div className="space-y-6">
        {flow.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl border border-border report-shadow p-6"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider text-accent font-body font-semibold">
                Step {i + 1}
              </span>
              {step.duration && (
                <span className="text-xs text-muted-foreground font-body">
                  {step.duration}
                </span>
              )}
            </div>
            <h4 className="font-display font-semibold text-foreground mb-2">
              {step.section}
            </h4>
            {step.goal && (
              <p className="text-sm text-muted-foreground font-body mb-3 italic">
                {step.goal}
              </p>
            )}
            {step.what_to_show && (
              <p className="text-sm font-body text-foreground">{step.what_to_show}</p>
            )}
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
