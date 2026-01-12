"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import type { ReportData } from "../../../types";

interface SynthesisSectionProps {
  data: ReportData;
  sectionNumber: string;
}

export const SynthesisSection = ({ data, sectionNumber }: SynthesisSectionProps) => {
  // Extract synthesis from evaluation data
  // Check multiple possible locations: data.data.evaluation, data.data (root level), or data itself
  const dataAny = data.data as any;
  
  // Check data.data.evaluation first (from transformOutputJson), then data.data root, then fallback
  const evaluationData = dataAny.evaluation || dataAny;
  const synthesis = evaluationData.synthesis || dataAny.synthesis || "";
  
  // Debug: log if no synthesis found to help identify data location
  if (!synthesis && process.env.NODE_ENV === 'development') {
    console.log('[SynthesisSection] No synthesis found. Available data keys:', Object.keys(dataAny));
    console.log('[SynthesisSection] Evaluation data:', dataAny.evaluation);
  }

  if (!synthesis) {
    return null;
  }

  return (
    <SectionWrapper
      id="synthesis"
      number={sectionNumber}
      title="Synthesis"
      subtitle="Multi-model analysis"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-xl p-4 md:p-6 border border-border report-shadow-lg overflow-hidden"
      >
        <div className="flex items-start gap-3 md:gap-4">
          <div className="hidden md:flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
            <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 md:w-6 md:h-6 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
              Summary
            </h3>
            <p className="text-foreground font-body leading-relaxed text-base md:text-lg break-words">
              {synthesis}
            </p>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

