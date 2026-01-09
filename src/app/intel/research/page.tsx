"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { RunList } from "@/features/rag/runs/components/RunList";
import { StatCard } from "@/features/rag/shared/components/StatCard";
import type { Run } from "@/features/rag/runs/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faSpinner, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

type RunWithKB = Run & { knowledge_base_name?: string | null };

export default function ResearchReportsPage() {
  const [runs, setRuns] = useState<RunWithKB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/intel/runs");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch runs");
        }

        const data = await response.json();
        setRuns(data || []);
      } catch (err) {
        console.error("Error fetching runs:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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




