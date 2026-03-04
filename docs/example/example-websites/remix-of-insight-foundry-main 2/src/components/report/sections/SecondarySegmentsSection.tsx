import { motion } from "framer-motion";
import { SectionWrapper } from "../SectionWrapper";
import { Clock, CheckCircle } from "lucide-react";
import { icpData } from "@/data/icpData";

export const SecondarySegmentsSection = () => {
  const segments = icpData.data.buyer_icp.segments.secondary;

  return (
    <SectionWrapper
      id="secondary-segments"
      number="09"
      title="Secondary Segments"
      subtitle="Lower priority segments that may be viable under specific conditions"
    >
      <div className="space-y-6">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-6 border border-border report-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
                S{index + 1}
              </span>
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {segment.name}
                </h3>
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {segment.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs uppercase tracking-wider text-amber-700 font-body font-medium">
                    Why Secondary
                  </span>
                </div>
                <p className="text-sm font-body text-amber-900 leading-relaxed">
                  {segment.why_secondary}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs uppercase tracking-wider text-green-700 font-body font-medium">
                    When to Pursue
                  </span>
                </div>
                <p className="text-sm font-body text-green-900 leading-relaxed">
                  {segment.when_to_pursue}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
