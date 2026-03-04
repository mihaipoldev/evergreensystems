import { motion } from "framer-motion";
import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { Database, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import { icpData } from "@/data/icpData";

export const DataQualitySection = () => {
  const quality = icpData.meta.data_quality;

  return (
    <SectionWrapper
      id="data-quality"
      number="11"
      title="Data Quality & Sources"
      subtitle="Research methodology, sources used, and known limitations"
    >
      {/* Quality Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Overall Confidence"
          value={`${(quality.overall_confidence * 100).toFixed(0)}%`}
          icon={<Database className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Sources Total"
          value={quality.sources_total}
          icon={<ExternalLink className="w-5 h-5" />}
        />
        <StatCard
          label="Next Refresh"
          value={quality.next_refresh_recommended}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      {/* Methodology */}
      <div className="bg-secondary/50 rounded-lg p-5 border border-border mb-8">
        <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
          Confidence Methodology
        </h4>
        <p className="text-sm font-body text-foreground leading-relaxed">
          {quality.confidence_methodology}
        </p>
      </div>

      {/* Known Limitations */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h4 className="text-lg font-display font-semibold text-foreground">
            Known Limitations
          </h4>
        </div>
        <ul className="space-y-3">
          {quality.known_limitations.map((limitation, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-md border bg-amber-50 border-amber-200"
            >
              <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-semibold text-amber-700 flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm font-body text-amber-900">{limitation}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Sources Used */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Sample Sources Used
        </h4>
        <div className="bg-card rounded-lg p-4 border border-border report-shadow">
          <ul className="space-y-2">
            {quality.sources_used.map((source, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-body text-accent hover:underline truncate"
                >
                  {source.replace('https://', '').replace('http://', '').split('/')[0]}
                </a>
              </motion.li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground font-body mt-3">
            Showing {quality.sources_used.length} of {quality.sources_total} total sources
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
