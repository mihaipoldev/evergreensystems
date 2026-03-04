import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { SectionWrapper } from "../SectionWrapper";
import { evaluationData } from "@/data/evaluationData";

export const SynthesisSection = () => {
  return (
    <SectionWrapper
      id="synthesis"
      number="01"
      title="Synthesis"
      subtitle="Multi-model consensus analysis"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-xl p-6 border border-border report-shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-accent/10">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
              Model Consensus Summary
            </h3>
            <p className="text-foreground font-body leading-relaxed text-lg">
              {evaluationData.synthesis}
            </p>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};
