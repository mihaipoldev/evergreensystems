import { notFound } from "next/navigation";
import { getProjectByIdWithKB } from "@/features/rag/projects/data";
import { ProjectDetailClient } from "./ProjectDetailClient";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RAGDocument } from "@/features/rag/documents/document-types";
import type { RunWithExtras } from "@/features/rag/projects/config/ProjectTypeConfig";

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

  // Fetch project type if project_type_id exists
  let projectTypeName: string | null = null;
  let projectType: { name: string; label: string; icon: string | null } | null = null;
  if (project.project_type_id) {
    const { data: ptData } = await supabase
      .from("project_types")
      .select("name, label, icon")
      .eq("id", project.project_type_id)
      .single();
    if (ptData) {
      const typedPtData = ptData as { name: string; label: string; icon: string | null };
      projectTypeName = typedPtData.name || null;
      projectType = {
        name: typedPtData.name,
        label: typedPtData.label,
        icon: typedPtData.icon,
      };
    }
  }

  // Get linked documents (from junction table - project documents)
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

  // Fetch runs for this project
  const { data: runsData } = await supabase
    .from("rag_runs")
    .select(`
      *,
      rag_knowledge_bases (
        id,
        name
      ),
      workflows (
        id,
        name,
        label
      )
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  // Transform runs data to match RunWithExtras type
  const initialRuns: RunWithExtras[] = (runsData || []).map((run: any) => {
    return {
      ...run,
      knowledge_base_name: run.rag_knowledge_bases?.name || null,
      workflow_name: run.workflows?.name || null,
      workflow_label: run.workflows?.label || null,
      report_id: null, // Not loading rag_run_outputs
      // fit_score and verdict are already in the run object from the database
      fit_score: run.fit_score ?? null,
      verdict: run.verdict ?? null,
    };
  });

  // Fetch enabled workflows for this project type to get total count
  // Use the same logic as GenerateReportModal - filter by project_type_id via junction table
  let totalWorkflows = 0;
  if (project.project_type_id) {
    const { data: projectTypeWorkflowsData } = await supabase
      .from("project_type_workflows")
      .select(`
        workflows (
          id,
          enabled
        )
      `)
      .eq("project_type_id", project.project_type_id);
    
    // Filter to only enabled workflows
    const enabledWorkflows = (projectTypeWorkflowsData || [])
      .filter((item: any) => item.workflows !== null && item.workflows.enabled === true);
    
    totalWorkflows = enabledWorkflows.length;
  }

  return (
    <ProjectDetailClient
      project={project}
      initialDocuments={allDocuments}
      initialRuns={initialRuns}
      projectTypeName={projectTypeName}
      projectType={projectType}
      totalWorkflows={totalWorkflows}
    />
  );
}

