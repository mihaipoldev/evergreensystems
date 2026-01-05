"use client";

import { Suspense, useState, useEffect } from "react";
import { RunList } from "@/features/rag/runs/components/RunList";
import type { Run } from "@/features/rag/runs/types";

type RunWithKB = Run & { knowledge_base_name?: string | null };

export default function RunsPage() {
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
      <RunList initialRuns={runs} />
    </div>
  );
}

