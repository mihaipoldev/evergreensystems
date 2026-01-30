"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faDatabase, faClock, faExternalLink } from "@fortawesome/free-solid-svg-icons";
import type { RunOutput } from "../types";
import { getRunLabel } from "@/features/rag/runs/types";
import { shouldIgnoreRowClick } from "@/features/rag/shared/utils/dropdownClickGuard";
import { cn } from "@/lib/utils";

type ReportRowProps = {
  report: RunOutput & {
    run?: {
      id: string;
      workflow_id?: string | null;
      workflow_name?: string | null;
      workflow_label?: string | null;
      status: string;
      knowledge_base_name?: string | null;
      created_at: string;
    } | null;
  };
  onView?: () => void;
};

export function ReportRow({ report, onView }: ReportRowProps) {
  const formattedDate = new Date(report.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Use workflow label if available
  const runLabel = report.run
    ? (report.run.workflow_label || 
       (report.run.workflow_name
         ? report.run.workflow_name
             .split('_')
             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
             .join(' ')
         : "Unknown"))
    : "Unknown";

  const hasPDF = !!report.pdf_storage_path;
  const reportHref = report.run?.id ? `/intel/research/${report.run.id}/result` : `/intel/reports/${report.id}`;

  return (
    <Link
      href={reportHref}
      className="block cursor-pointer"
      onClick={(e) => {
        if (shouldIgnoreRowClick(e)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card hover:bg-card/50 dark:hover:bg-muted/40 transition-shadow h-20">
        {/* Icon + Name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex flex-col h-full justify-center">
            <span className="font-medium text-foreground truncate">
              {runLabel} Report
            </span>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {report.run?.knowledge_base_name || "Unknown KB"}
            </p>
          </div>
        </div>

        {/* Type */}
        <div className="w-32 shrink-0">
          <Badge variant="outline" className="w-fit capitalize">
            {runLabel}
          </Badge>
        </div>

        {/* PDF Status */}
        <div className="w-24 shrink-0">
          {hasPDF ? (
            <Badge variant="secondary" className="bg-green-600/10 text-green-600 dark:text-green-400">
              PDF
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>

        {/* Knowledge Base */}
        <div className="w-32 shrink-0">
          <p className="text-sm text-muted-foreground truncate">
            {report.run?.knowledge_base_name || "—"}
          </p>
        </div>

        {/* Created */}
        <div className="w-36 shrink-0">
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>

        {/* Actions - exclude from row navigation (external link opens in new tab) */}
        <div className="w-20 shrink-0 flex items-center justify-end gap-2" data-action-menu onClick={(e) => e.stopPropagation()}>
          <a
            href={`/reports/${report.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Open standalone report in new tab"
          >
            <FontAwesomeIcon icon={faExternalLink} className="h-4 w-4" />
          </a>
        </div>
      </Card>
    </Link>
  );
}

