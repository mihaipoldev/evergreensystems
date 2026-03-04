import { motion } from "framer-motion";
import { SectionWrapper } from "../SectionWrapper";
import { XCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { icpData } from "@/data/icpData";

export const AvoidSegmentsSection = () => {
  const segments = icpData.data.buyer_icp.segments.avoid;

  return (
    <SectionWrapper
      id="avoid-segments"
      number="10"
      title="Segments to Avoid"
      subtitle="Customer types that typically don't fit this niche's offering"
    >
      <div className="space-y-6">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-red-200 report-shadow overflow-hidden"
          >
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-display font-semibold text-red-900">
                  {segment.name}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs uppercase tracking-wider text-red-700 font-body font-medium">
                    Why Avoid
                  </span>
                </div>
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {segment.why_avoid}
                </p>
              </div>

              {segment.exception && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span className="text-xs uppercase tracking-wider text-amber-700 font-body font-medium">
                      Exception
                    </span>
                  </div>
                  <p className="text-sm font-body text-amber-900 leading-relaxed">
                    {segment.exception}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
