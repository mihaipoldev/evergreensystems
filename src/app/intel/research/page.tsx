"use client";

import { useMemo } from "react";
import { RunList } from "@/features/rag/runs/components/RunList";
import { PageTitle } from "@/features/rag/shared/components/PageTitle";
import { StatCard } from "@/features/rag/shared/components/StatCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faPlay, faSpinner, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useRuns } from "@/features/rag/runs/hooks/useRuns";

export default function ResearchReportsPage() {
  const { data: runs = [], error, isLoading } = useRuns(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = runs.length;
    const active = runs.filter(
      (run) =>
        run.status === "queued" ||
        run.status === "collecting" ||
        run.status === "ingesting" ||
        run.status === "generating"
    ).length;
    const completed = runs.filter((run) => run.status === "complete").length;

    return { total, active, completed };
  }, [runs]);

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageTitle
        icon={
          <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
        }
        title="Research"
      />
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Runs"
          value={stats.total}
          icon={faPlay}
          index={0}
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={faSpinner}
          index={1}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={faCheckCircle}
          index={2}
        />
      </div>

      <RunList initialRuns={runs} />
    </div>
  );
}
