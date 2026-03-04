import { motion } from "framer-motion";
import { Users, Calendar, Target, Database, Shield, Globe } from "lucide-react";
import { icpData } from "@/data/icpData";

export const ICPHeader = () => {
  const { meta, data } = icpData;
  const snapshot = data.buyer_icp.snapshot;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">
              ICP Intelligence Report
            </span>
            <p className="text-sm text-muted-foreground">Customer Research Mode</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{meta.generated_at}</span>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-4 section-divider pb-4">
          {meta.input.niche_name}
        </h1>
        <p className="text-xl text-muted-foreground font-body">
          {meta.focus}
        </p>
      </div>

      {/* Ideal Customer One-Liner */}
      <div className="bg-primary rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-accent" />
          <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body">
            Ideal Customer Profile
          </span>
        </div>
        <p className="text-lg font-body text-primary-foreground leading-relaxed">
          {snapshot.ideal_customer_in_one_sentence}
        </p>
      </div>

      {/* Meta Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Geography
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">{meta.input.geo}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Confidence
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {(meta.data_quality.overall_confidence * 100).toFixed(0)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Sources
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {meta.data_quality.sources_total} sources
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Segments
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {data.buyer_icp.segments.primary.length} Primary
          </p>
        </motion.div>
      </div>
    </motion.header>
  );
};
