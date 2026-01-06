import { notFound } from "next/navigation";
import { getResearchSubjectById } from "@/features/rag/research/data";
import { ResearchDetailClient } from "./ResearchDetailClient";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RAGDocument } from "@/features/rag/documents/document-types";
import type { Run } from "@/features/rag/runs/types";

export const dynamic = "force-dynamic";

type ResearchDetailPageProps = {
  params: Promise<{ id: string }>;
};

type DocumentWithKB = RAGDocument & { 
  knowledge_base_name?: string | null;
};

type RunWithExtras = Run & { 
  knowledge_base_name?: string | null;
  workflow_name?: string | null;
  workflow_label?: string | null;
};

export default async function ResearchDetailPage({ params }: ResearchDetailPageProps) {
  const { id } = await params;
  const research = await getResearchSubjectById(id);

  if (!research) {
    notFound();
  }

  // Fetch documents for this research subject from junction table
  const supabase = createServiceRoleClient();

  // Get linked documents (from junction table)
  const { data: linkedDocsData } = await supabase
    .from("research_documents")
    .select(`
      document_id,
      rag_documents (
        *,
        rag_knowledge_bases (name)
      )
    `)
    .eq("research_subject_id", id);

  // Extract documents from junction table structure
  const linkedDocs: (RAGDocument & { rag_knowledge_bases?: { name: string } | null })[] = (linkedDocsData || [])
    .map((item: any) => item.rag_documents)
    .filter((doc: any) => doc && !doc.deleted_at);

  // Mark linked documents with knowledge_base_name
  const linkedDocsWithFlag: DocumentWithKB[] = linkedDocs.map((doc: any) => ({
    ...doc,
    knowledge_base_name: doc.rag_knowledge_bases?.name || null,
  }));

  // Sort by created_at descending
  const allDocuments: DocumentWithKB[] = linkedDocsWithFlag
    .sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // Fetch runs for this research subject with joins
  let initialRuns: RunWithExtras[] = [];
  try {
    const { data: runsData } = await supabase
      .from("rag_runs")
      .select(`
        *,
        rag_knowledge_bases (name),
        workflows (name, label)
      `)
      .eq("subject_id", id)
      .order("created_at", { ascending: false });

    if (runsData) {
      initialRuns = runsData.map((run: any) => ({
        ...run,
        knowledge_base_name: run.rag_knowledge_bases?.name || null,
        workflow_name: run.workflows?.name || null,
        workflow_label: run.workflows?.label || null,
      })) as RunWithExtras[];
    }
  } catch (error) {
    console.error("Error fetching runs:", error);
    // Continue with empty runs array if fetch fails
  }

  return (
    <ResearchDetailClient 
      research={research} 
      initialDocuments={allDocuments}
      initialRuns={initialRuns}
    />
  );
}

