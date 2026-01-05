import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectByIdWithKB } from "@/features/rag/projects/data";
import { ProjectDocumentsList } from "@/features/rag/projects/components/ProjectDocumentsList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RAGDocument } from "@/features/rag/documents/document-types";

export const dynamic = "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default";
    case "onboarding":
      return "secondary";
    case "delivered":
      return "outline";
    case "archived":
      return "secondary";
    default:
      return "outline";
  }
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
      rag_documents (*)
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
  const linkedDocs: RAGDocument[] = (linkedDocsData || [])
    .map((item: any) => item.rag_documents)
    .filter((doc: any) => doc && !doc.deleted_at);

  // Combine all documents (workspace + linked)
  const allDocuments = [...(workspaceDocs || []), ...linkedDocs]
    .filter((doc, index, self) => 
      index === self.findIndex((d) => d.id === doc.id)
    ) // Remove duplicates
    .sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{project.client_name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusVariant(project.status)} className="text-xs capitalize">
              {project.status}
            </Badge>
            {project.rag_knowledge_bases && (
              <Badge variant="outline" className="text-xs">
                KB: {project.rag_knowledge_bases.name}
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-3">{project.description}</p>
          )}
        </div>
        <Button asChild>
          <Link href={`/intel/projects/${project.id}/edit`}>
            <FontAwesomeIcon icon={faPencil} className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Documents</h2>
        <ProjectDocumentsList projectId={id} initialDocuments={allDocuments} />
      </div>
    </div>
  );
}

