import { notFound } from "next/navigation";
import { getProjectByIdWithKB } from "@/features/rag/projects/data";
import { ProjectDetailClient } from "./ProjectDetailClient";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RAGDocument } from "@/features/rag/documents/document-types";

export const dynamic = "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

type DocumentWithKB = RAGDocument & { 
  knowledge_base_name?: string | null;
  is_workspace_document?: boolean;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProjectByIdWithKB(id);

  if (!project) {
    notFound();
  }

  // Fetch documents for this project
  const supabase = createServiceRoleClient();

  // Get linked documents (from junction table - research documents)
  const { data: linkedDocsData } = await supabase
    .from("project_documents")
    .select(`
      document_id,
      rag_documents (
        *,
        rag_knowledge_bases (name)
      )
    `)
    .eq("project_id", id);

  // Get workspace documents (documents in project's workspace KB)
  const { data: workspaceDocs } = await supabase
    .from("rag_documents")
    .select("*")
    .eq("knowledge_base_id", project.kb_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Combine linked documents (extract from junction table structure)
  const linkedDocs: (RAGDocument & { rag_knowledge_bases?: { name: string } | null })[] = (linkedDocsData || [])
    .map((item: any) => item.rag_documents)
    .filter((doc: any) => doc && !doc.deleted_at);

  // Combine all documents (workspace + linked) and add knowledge_base_name and is_workspace_document flag
  const kbName = project.rag_knowledge_bases?.name || null;
  
  // Mark workspace documents
  const workspaceDocsWithFlag: DocumentWithKB[] = (workspaceDocs || []).map((doc: any) => ({
    ...(doc as RAGDocument),
    knowledge_base_name: kbName,
    is_workspace_document: true,
  }));

  // Mark linked documents
  const linkedDocsWithFlag: DocumentWithKB[] = linkedDocs.map((doc: any) => ({
    ...doc,
    knowledge_base_name: doc.rag_knowledge_bases?.name || null,
    is_workspace_document: false,
  }));

  // Combine and deduplicate (workspace docs take precedence if duplicate)
  const allDocuments: DocumentWithKB[] = [...workspaceDocsWithFlag, ...linkedDocsWithFlag]
    .filter((doc, index, self) => 
      index === self.findIndex((d) => d.id === doc.id)
    )
    .sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <ProjectDetailClient
      project={project}
      initialDocuments={allDocuments}
    />
  );
}

