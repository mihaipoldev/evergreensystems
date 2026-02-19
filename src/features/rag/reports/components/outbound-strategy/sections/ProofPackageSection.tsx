"use client";

import {
  SectionWrapper,
  BlockHeader,
  NumberedCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

type ProofElement = {
  item?: string;
  priority?: string;
  purpose?: string;
};

type ProofPackage = {
  description?: string;
  elements?: ProofElement[];
  presentation_sequence?: string[];
};

interface ProofPackageSectionProps {
  proofPackage: ProofPackage;
  sectionNumber?: string;
}

const priorityColors: Record<string, string> = {
  Critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Important: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Nice-to-have": "bg-muted/50 text-muted-foreground border-border",
};

export const ProofPackageSection = ({
  proofPackage,
  sectionNumber = "15",
}: ProofPackageSectionProps) => {
  const elements = proofPackage?.elements ?? [];
  const sequence = proofPackage?.presentation_sequence ?? [];

  if (elements.length === 0 && sequence.length === 0) return null;

  return (
    <SectionWrapper
      id="proof-package"
      number={sectionNumber}
      title="Proof Package"
      subtitle={proofPackage?.description || undefined}
    >
      {elements.length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Proof Elements"
            icon={<FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-4">
            {elements.map((el, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl border border-border report-shadow p-6"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-display font-semibold text-foreground">
                    {el.item}
                  </h4>
                  {el.priority && (
                    <span
                      className={`text-xs font-body font-medium px-2 py-0.5 rounded-md border ${
                        priorityColors[el.priority] ?? priorityColors["Nice-to-have"]
                      }`}
                    >
                      {el.priority}
                    </span>
                  )}
                </div>
                {el.purpose && (
                  <p className="text-sm font-body text-muted-foreground">{el.purpose}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {sequence.length > 0 && (
        <div>
          <BlockHeader variant="title" title="Presentation Sequence" />
          <div className="space-y-3">
            {sequence.map((step, i) => (
              <NumberedCard key={i} number={i + 1} layout="inline">
                <p className="text-sm font-body text-foreground">{step}</p>
              </NumberedCard>
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};
