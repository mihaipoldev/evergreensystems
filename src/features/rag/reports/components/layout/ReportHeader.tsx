"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFileAlt, 
  faCalendar,
  faEllipsis,
  faPrint,
  faFilePdf,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import type { HeaderConfig } from "./ReportHeaderConfig";
import { RunInputTooltip } from "./RunInputTooltip";
import type { ReportMeta } from "../../types/meta";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { Button } from "@/components/ui/button";
import { downloadOutputJson } from "@/features/rag/runs/utils/downloadOutputJson";
import { toast } from "sonner";

interface ReportHeaderProps {
  title: string;
  geo: string;
  generatedAt: string;
  confidence: number;
  headerConfig: HeaderConfig;
  /** When set, enables "Download JSON" in the header menu (report id or run id for API lookup) */
  reportIdOrRunId?: string;
  runInput?: Record<string, unknown> | null;
  reportMeta?: ReportMeta | null;
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
  reportIdOrRunId,
  runInput,
  reportMeta,
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Open print dialog - user can save as PDF
    window.print();
  };

  const handleDownloadJSON = async () => {
    if (!reportIdOrRunId) return;
    try {
      await downloadOutputJson(reportIdOrRunId, `run-${reportIdOrRunId}.json`);
      toast.success("JSON downloaded");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to download JSON";
      toast.error(message);
    }
  };

  const actionMenuItems = [
    {
      label: "Print Report",
      icon: <FontAwesomeIcon icon={faPrint} className="h-4 w-4" />,
      onClick: handlePrint,
    },
    {
      label: "Download PDF",
      icon: <FontAwesomeIcon icon={faFilePdf} className="h-4 w-4" />,
      onClick: handleDownloadPDF,
    },
    ...(reportIdOrRunId
      ? [
          {
            label: "Download JSON",
            icon: <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />,
            onClick: handleDownloadJSON,
          },
        ]
      : []),
  ];

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
          <RunInputTooltip runInput={runInput ?? null} reportMeta={reportMeta ?? null} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          <ActionMenu
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-muted/50 hover:text-foreground no-print"
              >
                <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
              </Button>
            }
            items={actionMenuItems}
            align="end"
            width="w-48"
          />
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

