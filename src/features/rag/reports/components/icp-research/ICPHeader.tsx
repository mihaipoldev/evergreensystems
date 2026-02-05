"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faGlobe,
  faShieldHalved,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../types";

type ICPHeaderProps = {
  data?: ReportData;
};

type ICPMeta = {
  input?: { geo?: string; geography?: string };
  confidence?: number;
  sources_used?: string[];
  data_quality?: { overall_confidence?: number; sources_total?: number; sources_used?: string[] };
};

type ICPBuyerIcp = {
  snapshot?: { ideal_customer_in_one_sentence?: string };
  segments?: { primary?: unknown[] };
};

export const ICPHeader = ({ data }: ICPHeaderProps) => {
  const meta = (data?.meta ?? {}) as ICPMeta;
  const buyerIcp = (data?.data as { buyer_icp?: ICPBuyerIcp })?.buyer_icp;
  const oneLiner = buyerIcp?.snapshot?.ideal_customer_in_one_sentence ?? "—";
  const geo = meta.input?.geo ?? meta.input?.geography ?? "—";
  const confidence =
    typeof meta.confidence === "number"
      ? meta.confidence
      : (meta.data_quality?.overall_confidence ?? 0);
  const sourcesTotal =
    meta.data_quality?.sources_used?.length ?? meta.data_quality?.sources_total ?? data?.meta?.sources_used?.length ?? 0;
  const primaryCount = buyerIcp?.segments?.primary?.length ?? 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Ideal Customer Profile one-liner */}
      <div className="bg-primary rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />
          <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body">
            Ideal Customer Profile
          </span>
        </div>
        <p className="text-lg font-body text-primary-foreground leading-relaxed">
          {oneLiner}
        </p>
      </div>

      {/* 4 summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Geography
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">{geo || "—"}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Confidence
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {(confidence * 100).toFixed(0)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faDatabase} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Sources
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {sourcesTotal} source{sourcesTotal !== 1 ? "s" : ""}
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
            {primaryCount} Primary
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
