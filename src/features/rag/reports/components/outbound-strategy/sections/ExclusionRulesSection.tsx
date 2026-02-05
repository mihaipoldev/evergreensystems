"use client";

import { SectionWrapper, BlockHeader } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

type ExclusionRule = {
  rule?: string;
  rationale?: string;
};

type ExclusionRules = {
  description?: string;
  rules?: ExclusionRule[];
};

interface ExclusionRulesSectionProps {
  exclusionRules: ExclusionRules;
  sectionNumber?: string;
}

export const ExclusionRulesSection = ({
  exclusionRules,
  sectionNumber = "10",
}: ExclusionRulesSectionProps) => {
  const rules = exclusionRules?.rules ?? [];

  if (rules.length === 0) {
    return (
      <SectionWrapper
        id="exclusion-rules"
        number={sectionNumber}
        title="Exclusion Rules"
        subtitle={exclusionRules?.description ?? "Companies and scenarios to exclude from targeting"}
      >
        <p className="text-sm text-muted-foreground font-body">
          No exclusion rules available
        </p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="exclusion-rules"
      number={sectionNumber}
      title="Exclusion Rules"
      subtitle={exclusionRules?.description ?? "Companies and scenarios to exclude from targeting"}
    >
      <div className="space-y-4">
        {rules.map((r, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
          >
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faBan} className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-foreground mb-1">
                  {r.rule}
                </h4>
                {r.rationale && (
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-body text-muted-foreground">{r.rationale}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
