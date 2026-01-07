"use client";

import { Suspense, useState, useEffect } from "react";
import { ReportList } from "@/features/rag/runs-outputs/components/ReportList";
import type { RunOutput } from "@/features/rag/runs-outputs/types";

type ReportWithRun = RunOutput & {
  run?: {
    id: string;
    workflow_name?: string | null;
    workflow_label?: string | null;
    status: string;
    knowledge_base_name?: string | null;
    created_at: string;
  } | null;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportWithRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/intel/reports");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch reports");
        }

        const data = await response.json();
        setReports(data || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <ReportList initialReports={reports} />
    </div>
  );
}

