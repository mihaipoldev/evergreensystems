"use client";

import { Suspense, useState, useEffect } from "react";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { KnowledgeBaseList } from "@/features/rag/knowledge-bases/components/KnowledgeBaseList";
import { PageSkeleton } from "@/components/admin/ui/PageSkeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import type { KnowledgeBaseWithCount } from "@/features/rag/knowledge-bases/data";

export default function AIKnowledgePage() {
  const [knowledge, setKnowledge] = useState<KnowledgeBaseWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/admin/knowledge-base");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch knowledge bases");
        }
        
        const data = await response.json();
        setKnowledge(data || []);
      } catch (err) {
        console.error("Error fetching knowledge bases:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageSkeleton
        title="AI Knowledge"
        description="Manage your AI knowledge bases for intelligent responses"
        variant="list"
      />
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <AdminPageTitle
          title="AI Knowledge"
          description="Manage your AI knowledge bases for intelligent responses"
          icon={faBook}
        />
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="AI Knowledge"
          description="Manage your AI knowledge bases for intelligent responses"
          icon={faBook}
        />
      </div>
      <KnowledgeBaseList initialKnowledge={knowledge} />
    </div>
  );
}
