"use client";

import { useMemo } from "react";
import { RunList } from "@/features/rag/runs/components/RunList";
import { StatCard } from "@/features/rag/shared/components/StatCard";
import { faPlay, faSpinner, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useRuns } from "@/features/rag/runs/hooks/useRuns";

type ResearchesContentProps = {
  projectTypeId?: string | null;
};

export function ResearchesContent({ projectTypeId }: ResearchesContentProps) {
  const { data: runs = [], error, isLoading } = useRuns(projectTypeId ?? null);

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
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading researches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Stat Cards - same as research page */}
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

      <RunList initialRuns={runs} projectTypeId={projectTypeId ?? undefined} />
    </div>
  );
}
