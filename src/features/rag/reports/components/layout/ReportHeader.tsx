"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileAlt, 
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import type { HeaderConfig } from "./ReportHeaderConfig";
import { RunInputTooltip } from "./RunInputTooltip";
import { UsageMetricsSection } from "@/features/rag/reports/components/shared/UsageMetricsSection";
import type { UsageMetrics } from "@/features/rag/reports/types";

interface ReportHeaderProps {
  title: string;
  geo: string;
  generatedAt: string;
  confidence: number;
  headerConfig: HeaderConfig;
  runInput?: Record<string, unknown> | null;
  usageMetrics?: UsageMetrics | null;
  // Evaluation-specific props (kept for potential future use)
  evaluationVerdict?: {
    label: string;
    score: number;
    priority: number;
    recommendation: string;
    confidence: string;
  };
  evaluationQuickStats?: {
    positive_signals: number;
    negative_signals: number;
    confidence_description: string;
  };
}

export const ReportHeader = ({
  title,
  geo,
  generatedAt,
  confidence,
  headerConfig,
  runInput,
  usageMetrics,
  evaluationVerdict,
  evaluationQuickStats,
}: ReportHeaderProps) => {
  // Format date to match niche intelligence report format (e.g., "Jan 15, 2024")
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString; // Return original if error
    }
  };

  const formattedDate = formatDate(generatedAt);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">
              {headerConfig.reportTypeLabel}
            </span>
            <p className="text-xs text-muted-foreground">{headerConfig.modeLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {runInput && Object.keys(runInput).length > 0 && (
            <RunInputTooltip runInput={runInput} />
          )}
          {usageMetrics && <UsageMetricsSection usageMetrics={usageMetrics} />}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-primary mb-3 section-divider pb-3">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground font-body">
          {headerConfig.subtitle}
        </p>
      </div>

    </motion.header>
  );
};

