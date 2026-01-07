"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileAlt, 
  faCalendar, 
  faBullseye, 
  faArrowTrendUp,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";

interface ReportHeaderProps {
  nicheName: string;
  geo: string;
  generatedAt: string;
  confidence: number;
  focus?: string;
  marketValue?: string;
  tam?: string;
  leadGenFitScore?: number;
  verdict?: "pursue" | "test" | "avoid";
}

export const ReportHeader = ({
  nicheName,
  geo,
  generatedAt,
  confidence,
  focus,
  marketValue,
  tam,
  leadGenFitScore,
  verdict,
}: ReportHeaderProps) => {
  const getVerdictColor = (verdict?: "pursue" | "test" | "avoid", fallbackScore?: number) => {
    if (verdict === 'pursue') return 'text-green-600';
    if (verdict === 'test') return 'text-yellow-500';
    if (verdict === 'avoid') return 'text-red-600';
    // Fallback to score-based colors if no verdict
    if (fallbackScore !== undefined) {
      if (fallbackScore >= 70) return 'text-green-600';
      if (fallbackScore >= 50) return 'text-yellow-500';
      return 'text-red-600';
    }
    return 'text-foreground';
  };

  const getVerdictBadgeClasses = (verdict: "pursue" | "test" | "avoid") => {
    if (verdict === 'pursue') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
    if (verdict === 'test') {
      return 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

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

      {/* Meta Stats - 3x3 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Row 1: Context (Geography, Focus, Confidence) */}
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
            <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Focus
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {focus || "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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

        {/* Row 2: Market (Market Value, TAM) & Decision (Fit Score + Verdict) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Market Value
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {marketValue && marketValue.trim() ? marketValue : "—"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              TAM
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {tam || "—"}
          </p>
        </motion.div>

        {/* Combined Fit Score + Verdict Card */}
        {(leadGenFitScore !== undefined || verdict) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card rounded-lg p-4 cursor-pointer hover:bg-muted/40 transition-colors report-shadow border border-border"
            onClick={() => {
              const fitScoreSection = document.getElementById('lead-gen-strategy');
              if (fitScoreSection) {
                fitScoreSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Lead Gen Fit
                  </span>
                </div>
                {verdict && (
                  <span
                    className={`text-xs font-semibold uppercase px-2 py-0.5 rounded flex-shrink-0 ${getVerdictBadgeClasses(verdict)}`}
                  >
                    {verdict === 'pursue' ? '✓ Pursue' : verdict === 'test' ? '⚠ Test' : '✗ Avoid'}
                  </span>
                )}
              </div>
            </div>
            {leadGenFitScore !== undefined && (
              <p
                className={`text-2xl font-display font-bold ${getVerdictColor(verdict, leadGenFitScore)}`}
              >
                {leadGenFitScore}/100
              </p>
            )}
            {!leadGenFitScore && verdict && (
              <p
                className={`text-xl font-display font-semibold uppercase ${getVerdictColor(verdict)}`}
              >
                {verdict}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

