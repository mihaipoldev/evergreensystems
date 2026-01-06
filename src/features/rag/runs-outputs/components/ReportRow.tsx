"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faDatabase, faClock, faExternalLink } from "@fortawesome/free-solid-svg-icons";
import type { RunOutput } from "../types";
import { cn } from "@/lib/utils";

type ReportRowProps = {
  report: RunOutput & {
    run?: {
      id: string;
      run_type: string;
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

  const runTypeLabels: Record<string, string> = {
    niche_intelligence: "Niche Intelligence",
    kb_query: "KB Query",
    doc_ingest: "Document Ingest",
  };

  const runTypeLabel = report.run?.run_type
    ? runTypeLabels[report.run.run_type] || report.run.run_type
    : "Unknown";

  const hasPDF = !!report.pdf_storage_path;

  return (
    <Card className="flex items-center gap-4 p-4 border-none shadow-card-light hover:shadow-card transition-shadow h-20">
      {/* Icon + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex flex-col h-full justify-center">
          <Link 
            href={`/intel/reports/${report.id}`}
            className="font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer"
          >
            {runTypeLabel} Report
          </Link>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {report.run?.knowledge_base_name || "Unknown KB"}
          </p>
        </div>
      </div>

      {/* Type */}
      <div className="w-32 shrink-0">
        <Badge variant="outline" className="w-fit capitalize">
          {runTypeLabel}
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

      {/* Actions */}
      <div className="w-20 shrink-0 flex items-center justify-end gap-2">
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
  );
}

