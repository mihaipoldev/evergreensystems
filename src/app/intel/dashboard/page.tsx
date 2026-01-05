"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faBook,
  faFolder,
  faDatabase,
  faFileText,
  faChartLine,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { StatCard } from "@/features/rag/shared/components/StatCard";
import { SectionHeader } from "@/features/rag/shared/components/SectionHeader";
import { KnowledgeBaseCardCompact } from "@/features/rag/knowledge-bases/components/KnowledgeBaseCardCompact";
import { ProjectCardCompact } from "@/features/rag/projects/components/ProjectCardCompact";
import { DocumentCardCompact } from "@/features/rag/documents/components/DocumentCardCompact";
import { RunCardCompact } from "@/features/rag/runs/components/RunCardCompact";
import type { KnowledgeBaseWithCount } from "@/features/rag/knowledge-bases/data";
import type { Project } from "@/features/rag/projects/types";
import type { RAGDocument } from "@/features/rag/documents/document-types";
import type { Run } from "@/features/rag/runs/types";

type ProjectWithCount = Project & { document_count?: number; linked_kb_name?: string | null };
type DocumentWithKB = RAGDocument & { knowledge_base_name?: string | null };
type RunWithKB = Run & { knowledge_base_name?: string | null };

export default function IntelDashboardPage() {
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseWithCount[]>([]);
  const [knowledgeBasesCount, setKnowledgeBasesCount] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [runsCount, setRunsCount] = useState(0);
  const [recentDocuments, setRecentDocuments] = useState<DocumentWithKB[]>([]);
  const [recentRuns, setRecentRuns] = useState<RunWithKB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [projectsRes, kbsRes, documentsRes, runsRes] = await Promise.all([
          fetch("/api/intel/projects?status=active"),
          fetch("/api/intel/knowledge-base"),
          fetch("/api/intel/documents"),
          fetch("/api/intel/runs"),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(
            projectsData
              .filter((p: ProjectWithCount) => p.status === "active")
              .slice(0, 3)
          );
        }

        if (kbsRes.ok) {
          const kbsData = await kbsRes.json();
          setKnowledgeBases(kbsData.slice(0, 3));
          setKnowledgeBasesCount(kbsData.length);
        }

        if (documentsRes.ok) {
          const documentsData = await documentsRes.json();
          setDocumentsCount(documentsData.length || 0);
          // Get recent 3 documents
          const sortedDocuments = (documentsData || []).sort((a: DocumentWithKB, b: DocumentWithKB) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setRecentDocuments(sortedDocuments.slice(0, 3));
        }

        if (runsRes.ok) {
          const runsData = await runsRes.json();
          // Count runs from last 24 hours
          const now = new Date();
          const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const runsLast24h = (runsData || []).filter((run: any) => {
            const runDate = new Date(run.created_at);
            return runDate >= last24h;
          });
          setRunsCount(runsLast24h.length || 0);
          // Get recent 3 runs
          const sortedRuns = (runsData || []).sort((a: RunWithKB, b: RunWithKB) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setRecentRuns(sortedRuns.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const activeProjectsCount = projects.length;

  return (
    <div className="w-full space-y-10 relative">
        {/* Stats Grid */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Knowledge Bases"
            value={knowledgeBasesCount}
            icon={faDatabase}
          />
          <StatCard
            title="Active Projects"
            value={activeProjectsCount}
            icon={faFolder}
          />
          <StatCard
            title="Documents"
            value={documentsCount}
            icon={faFileText}
          />
          <StatCard
            title="API Calls (24h)"
            value={runsCount}
            icon={faChartLine}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button 
            asChild 
            className="h-auto p-5 flex flex-col items-center gap-3 relative overflow-hidden group bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-150 hover:scale-[1.02] border-0"
          >
            <Link href="/intel/knowledge-bases/new" className="relative z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              <FontAwesomeIcon icon={faBook} className="h-5 w-5 drop-shadow-sm" />
              <span className="font-semibold text-sm">New Knowledge Base</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto p-5 flex flex-col items-center gap-3 relative overflow-hidden group border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
          >
            <Link href="/intel/projects/new" className="relative z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              <FontAwesomeIcon icon={faFolder} className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-150" />
              <span className="font-semibold text-sm">New Project</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto p-5 flex flex-col items-center gap-3 relative overflow-hidden group border-2 border-dashed hover:border-primary/30 hover:bg-primary/3 transition-all duration-150 cursor-not-allowed opacity-60"
            disabled
          >
            <Link href="#" className="relative z-10 pointer-events-none">
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
              <span className="font-semibold text-sm">Generate Report</span>
              <span className="text-xs text-muted-foreground mt-1">Coming soon</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Recent Knowledge Bases */}
      <section className="relative">
        <div className="mb-6">
          <SectionHeader
            title="Recent Knowledge Bases"
            icon={faDatabase}
            action={
              <Button variant="ghost" size="sm" asChild className="hover:bg-transparent hover:text-primary transition-colors">
                <Link href="/intel/knowledge-bases">
                  View all
                </Link>
              </Button>
            }
          />
        </div>
        {knowledgeBases.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm p-12 text-center text-muted-foreground relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              No knowledge bases.{" "}
              <Link
                href="/intel/knowledge-bases/new"
                className="text-primary hover:underline font-medium transition-all hover:drop-shadow-sm"
              >
                Create one
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeBases.map((kb) => (
              <div key={kb.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                <KnowledgeBaseCardCompact
                  knowledge={kb}
                  documentCount={kb.document_count || 0}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Projects */}
      <section className="relative">
        <div className="mb-6">
          <SectionHeader
            title="Active Projects"
            icon={faFolder}
            action={
              <Button variant="ghost" size="sm" asChild className="hover:bg-transparent hover:text-primary transition-colors">
                <Link href="/intel/projects">View all</Link>
              </Button>
            }
          />
        </div>
        {projects.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm p-12 text-center text-muted-foreground relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              No active projects.{" "}
              <Link
                href="/intel/projects/new"
                className="text-primary hover:underline font-medium transition-all hover:drop-shadow-sm"
              >
                Create one
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                <ProjectCardCompact
                  project={project}
                  linkedKBName={project.linked_kb_name}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Documents */}
      <section className="relative">
        <div className="mb-6">
          <SectionHeader
            title="Recent Documents"
            icon={faFileText}
            action={
              <Button variant="ghost" size="sm" asChild className="hover:bg-transparent hover:text-primary transition-colors">
                <Link href="/intel/documents">View all</Link>
              </Button>
            }
          />
        </div>
        {recentDocuments.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm p-12 text-center text-muted-foreground relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              No documents.{" "}
              <Link
                href="/intel/knowledge-bases"
                className="text-primary hover:underline font-medium transition-all hover:drop-shadow-sm"
              >
                Create a knowledge base
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                <DocumentCardCompact document={doc} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Runs */}
      <section className="relative">
        <div className="mb-6">
          <SectionHeader
            title="Recent Runs"
            icon={faPlay}
            action={
              <Button variant="ghost" size="sm" asChild className="hover:bg-transparent hover:text-primary transition-colors">
                <Link href="/intel/runs">View all</Link>
              </Button>
            }
          />
        </div>
        {recentRuns.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm p-12 text-center text-muted-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative z-10">No runs yet.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRuns.map((run) => (
              <div key={run.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                <RunCardCompact run={run} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
