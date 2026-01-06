"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileAlt, 
  faCalendar, 
  faBullseye, 
  faArrowTrendUp 
} from "@fortawesome/free-solid-svg-icons";

interface ReportHeaderProps {
  nicheName: string;
  geo: string;
  generatedAt: string;
  confidence: number;
}

export const ReportHeader = ({
  nicheName,
  geo,
  generatedAt,
  confidence,
}: ReportHeaderProps) => {
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
            <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">
              Niche Intelligence Report
            </span>
            <p className="text-sm text-muted-foreground">Lead Generation Targeting Mode</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
            <span>{generatedAt}</span>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-4 section-divider pb-4">
          {nicheName}
        </h1>
        <p className="text-xl text-muted-foreground font-body">
          Comprehensive Market Intelligence & Strategic Targeting Analysis
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
            <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Geography
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">{geo}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faArrowTrendUp} className="w-4 h-4 text-accent" />
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
            <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Focus
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">E-commerce</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Market Value
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">$900B</p>
        </motion.div>
      </div>
    </motion.header>
  );
};

