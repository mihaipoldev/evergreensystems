"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../types";
import { ConfidenceBadge } from "../shared";

type ICPHeaderProps = {
  data?: ReportData;
};

type ICPMeta = {
  confidence?: number;
  confidence_rationale?: string;
  data_quality?: { overall_confidence?: number };
};

type ICPBuyerIcp = {
  snapshot?: { ideal_customer_in_one_sentence?: string };
};

export const ICPHeader = ({ data }: ICPHeaderProps) => {
  const meta = (data?.meta ?? {}) as ICPMeta;
  const buyerIcp = (data?.data as { buyer_icp?: ICPBuyerIcp })?.buyer_icp;
  const oneLiner = buyerIcp?.snapshot?.ideal_customer_in_one_sentence ?? "—";
  const confidence =
    typeof meta.confidence === "number"
      ? meta.confidence
      : (meta.data_quality?.overall_confidence ?? 0);
  const confidenceRationale = meta.confidence_rationale;

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Ideal Customer Profile one-liner */}
      <div className="bg-primary rounded-xl p-6 mb-6">
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

      {/* Confidence badge — same as Niche Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-6"
      >
        <ConfidenceBadge value={confidence} rationale={confidenceRationale} />
      </motion.div>
    </motion.section>
  );
};
