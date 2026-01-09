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

  // Optimized: Parallelize all independent queries for better performance
  // Fetch project type, documents, and runs in parallel since they don't depend on each other
  const [projectTypeResult, linkedDocsResult, workspaceDocsResult, runsResult, workflowsCountResult] = await Promise.all([
    // Fetch project type if project_type_id exists
    project.project_type_id
      ? supabase
          .from("project_types")
          .select("name, label, icon")
          .eq("id", project.project_type_id)
          .single()
      : Promise.resolve({ data: null, error: null } as { data: { name: string; label: string; icon: string | null } | null; error: null }),
    
    // Get linked documents (from junction table - project documents)
    // Optimized: Use * for rag_documents to avoid SQL alias column reference issues
    // We'll fetch KB names separately to avoid nested select problems
    // Index idx_project_documents_project_document is used here
    supabase
      .from("project_documents")
      .select(`
        document_id,
        created_at,
        rag_documents (*)
      `)
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    
    // Get workspace documents (documents in project's workspace KB)
    // Optimized: Index idx_rag_documents_kb_deleted_created is used here
    // Only query if kb_id exists
    project.kb_id
      ? supabase
          .from("rag_documents")
          .select("*")
          .eq("knowledge_base_id", project.kb_id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    
    // Fetch runs for this project
    // Optimized: Index idx_rag_runs_project_created_desc is used here
    // Note: fit_score and verdict are extracted from metadata.evaluation_result, not stored as columns
    supabase
      .from("rag_runs")
      .select(`
        id,
        project_id,
        knowledge_base_id,
        workflow_id,
        status,
        created_at,
        updated_at,
        error,
        metadata,
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
      .order("created_at", { ascending: false }),
    
    // Fetch enabled workflows count for this project type
    // Optimized: Index idx_project_type_workflows_type_workflow is used here
    project.project_type_id
      ? supabase
          .from("project_type_workflows")
          .select(`
            workflows!inner (
              id,
              enabled
            )
          `)
          .eq("project_type_id", project.project_type_id)
      : Promise.resolve({ data: [], error: null })
  ]);

  // Helper function to check if an error is meaningful (not empty)
  const isMeaningfulError = (error: any): boolean => {
    if (!error || error === null || error === undefined) return false;
    // Check if it's a plain object (not array, Date, etc.)
    if (typeof error !== 'object' || Array.isArray(error) || error instanceof Date) return false;
    // Check if it has any enumerable keys
    const keys = Object.keys(error);
    if (keys.length === 0) return false;
    // Check if it has meaningful error properties
    return !!(error.message || error.code || error.details || error.hint);
  };

  // Log errors for debugging (only log if error has meaningful information)
  if (linkedDocsResult.error && isMeaningfulError(linkedDocsResult.error)) {
    const error = linkedDocsResult.error;
    const errorInfo: Record<string, any> = {};
    if (error.message) errorInfo.message = error.message;
    if (error.code) errorInfo.code = error.code;
    if (error.details) errorInfo.details = error.details;
    if (error.hint) errorInfo.hint = error.hint;
    // Only log if we have meaningful error information
    const hasErrorInfo = Object.keys(errorInfo).length > 0;
    if (hasErrorInfo) {
      console.error("Error fetching linked documents:", errorInfo);
    }
  }
  if (workspaceDocsResult.error && isMeaningfulError(workspaceDocsResult.error)) {
    const error = workspaceDocsResult.error;
    const errorInfo: Record<string, any> = {};
    if (error.message) errorInfo.message = error.message;
    if (error.code) errorInfo.code = error.code;
    if (error.details) errorInfo.details = error.details;
    if (error.hint) errorInfo.hint = error.hint;
    const hasErrorInfo = Object.keys(errorInfo).length > 0;
    if (hasErrorInfo) {
      console.error("Error fetching workspace documents:", errorInfo);
    }
  }
  if (runsResult.error) {
    const error = runsResult.error;
    // Skip if it's an empty object (no keys at all)
    if (typeof error === 'object' && error !== null && !Array.isArray(error) && Object.keys(error).length === 0) {
      // Empty object - don't log or treat as error
    } else if (isMeaningfulError(error)) {
      const errorInfo: Record<string, any> = {};
      if (error.message) errorInfo.message = error.message;
      if (error.code) errorInfo.code = error.code;
      if (error.details) errorInfo.details = error.details;
      if (error.hint) errorInfo.hint = error.hint;
      const hasErrorInfo = Object.keys(errorInfo).length > 0;
      if (hasErrorInfo) {
        console.error("Error fetching runs:", errorInfo);
      }
    }
  }

  // Process project type result
  let projectTypeName: string | null = null;
  let projectType: { name: string; label: string; icon: string | null } | null = null;
  if (projectTypeResult.data) {
    const typedPtData = projectTypeResult.data as { name: string; label: string; icon: string | null };
    projectTypeName = typedPtData.name || null;
    projectType = {
      name: typedPtData.name,
      label: typedPtData.label,
      icon: typedPtData.icon,
    };
  }

  // Extract data with fallbacks for error cases (only treat meaningful errors as errors)
  // Helper to check if error should be treated as actual error (not empty object)
  const shouldTreatAsError = (error: any): boolean => {
    if (!error) return false;
    // Empty objects are not errors
    if (typeof error === 'object' && error !== null && !Array.isArray(error) && Object.keys(error).length === 0) {
      return false;
    }
    return isMeaningfulError(error);
  };
  
  const linkedDocsData = shouldTreatAsError(linkedDocsResult.error) ? [] : (linkedDocsResult.data || []);
  const workspaceDocs = shouldTreatAsError(workspaceDocsResult.error) ? [] : (workspaceDocsResult.data || []);
  const runsData = shouldTreatAsError(runsResult.error) ? [] : (runsResult.data || []);

  // Debug logging (temporary - remove after fixing)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Project Detail Page Debug:', {
      projectId: id,
      kbId: project.kb_id,
      linkedDocsCount: linkedDocsData.length,
      workspaceDocsCount: workspaceDocs.length,
      runsCount: runsData.length,
      linkedDocsSample: linkedDocsData.slice(0, 2),
      runsSample: runsData.slice(0, 2),
    });
  }

  // Combine linked documents (extract from junction table structure)
  // Handle nested structure from Supabase: project_documents -> rag_documents
  const linkedDocs: RAGDocument[] = (linkedDocsData || [])
    .map((item: any) => item.rag_documents)
    .filter((doc: any) => doc !== null && doc !== undefined && !doc.deleted_at);

  // Fetch KB names for linked documents (if needed)
  // Get unique KB IDs from linked documents
  const linkedKbIds = [...new Set(linkedDocs.map(doc => doc.knowledge_base_id).filter(Boolean))];
  const kbNamesMap = new Map<string, string>();
  
  if (linkedKbIds.length > 0) {
    const { data: kbData } = await supabase
      .from("rag_knowledge_bases")
      .select("id, name")
      .in("id", linkedKbIds);
    
    (kbData || []).forEach((kb: any) => {
      kbNamesMap.set(kb.id, kb.name);
    });
  }

  // Combine all documents (workspace + linked) and add knowledge_base_name and is_workspace_document flag
  const kbName = project.rag_knowledge_bases?.name || null;
  
  // Mark workspace documents
  const workspaceDocsWithFlag: DocumentWithKB[] = (workspaceDocs || []).map((doc: any) => ({
    ...(doc as RAGDocument),
    knowledge_base_name: kbName,
    is_workspace_document: true,
  }));

  // Mark linked documents with KB names from map
  const linkedDocsWithFlag: DocumentWithKB[] = linkedDocs.map((doc: any) => ({
    ...doc,
    knowledge_base_name: doc.knowledge_base_id ? (kbNamesMap.get(doc.knowledge_base_id) || null) : null,
    is_workspace_document: false,
  }));

  // Combine and deduplicate (workspace docs take precedence if duplicate)
  // Optimized: Use Map for O(n) deduplication instead of O(n²) findIndex
  const docMap = new Map<string, DocumentWithKB>();
  
  // Add workspace docs first (they take precedence)
  workspaceDocsWithFlag.forEach(doc => {
    docMap.set(doc.id, doc);
  });
  
  // Add linked docs (only if not already present)
  linkedDocsWithFlag.forEach(doc => {
    if (!docMap.has(doc.id)) {
      docMap.set(doc.id, doc);
    }
  });
  
  // Convert to array and sort by created_at DESC
  const allDocuments: DocumentWithKB[] = Array.from(docMap.values())
    .sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // Transform runs data to match RunWithExtras type
  const initialRuns: RunWithExtras[] = (runsData || []).map((run: any) => {
    // Extract fit_score and verdict from metadata
    const evaluationResult = run.metadata?.evaluation_result;
    let fit_score: number | null = null;
    let verdict: "pursue" | "test" | "caution" | "avoid" | null = null;
    
    if (evaluationResult && typeof evaluationResult === "object") {
      // Extract and normalize verdict
      if (evaluationResult.verdict && typeof evaluationResult.verdict === "string") {
        const normalizedVerdict = evaluationResult.verdict.toLowerCase();
        if (normalizedVerdict === "pursue" || normalizedVerdict === "test" || normalizedVerdict === "caution" || normalizedVerdict === "avoid") {
          verdict = normalizedVerdict;
        }
      }
      
      // Extract score
      if (typeof evaluationResult.score === "number") {
        fit_score = evaluationResult.score;
      } else if (typeof evaluationResult.score === "string") {
        const parsedScore = parseFloat(evaluationResult.score);
        if (!isNaN(parsedScore)) {
          fit_score = parsedScore;
        }
      }
    }
    
    return {
      ...run,
      knowledge_base_name: run.rag_knowledge_bases?.name || null,
      workflow_name: run.workflows?.name || null,
      workflow_label: run.workflows?.label || null,
      report_id: null, // Not loading rag_run_outputs
      fit_score,
      verdict,
    };
  });

  // Process workflows count result
  // Filter to only enabled workflows
  const enabledWorkflows = (workflowsCountResult.data || [])
    .filter((item: any) => item.workflows !== null && item.workflows.enabled === true);
  
  const totalWorkflows = enabledWorkflows.length;

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

