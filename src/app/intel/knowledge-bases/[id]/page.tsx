import { notFound } from "next/navigation";
import { getKnowledgeBaseById } from "@/features/rag/knowledge-bases/data";
import { getDocumentsByKnowledgeBaseId } from "@/features/rag/documents/data";
import { Badge } from "@/components/ui/badge";
import { KnowledgeBasePageActions } from "@/features/rag/knowledge-bases/components/KnowledgeBasePageActions";
import { KnowledgeBaseDocumentsClient } from "./KnowledgeBaseDocumentsClient";

export const dynamic = "force-dynamic";

type KnowledgeBaseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function KnowledgeBaseDetailPage({ params }: KnowledgeBaseDetailPageProps) {
  const { id } = await params;
  const knowledge = await getKnowledgeBaseById(id);

  if (!knowledge) {
    notFound();
  }

  // Fetch documents for this knowledge base
  const documents = await getDocumentsByKnowledgeBaseId(id);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Manage documents for this knowledge base.</p>
          <div className="flex items-center gap-2 flex-wrap">
            {knowledge.kb_type && (
              <Badge variant="outline" className="text-xs">
                {knowledge.kb_type}
              </Badge>
            )}
            <Badge
              variant={knowledge.visibility === "public" ? "default" : "outline"}
              className="text-xs"
            >
              {knowledge.visibility === "public" ? "Public" : "Private"}
            </Badge>
            <Badge
              variant={knowledge.is_active ? "default" : "secondary"}
              className="text-xs"
            >
              {knowledge.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <KnowledgeBasePageActions
          knowledgeBaseId={knowledge.id}
          knowledgeBaseName={knowledge.name}
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Documents</h2>
        <KnowledgeBaseDocumentsClient
          initialDocuments={documents}
          knowledgeBaseId={knowledge.id}
          knowledgeBaseName={knowledge.name}
        />
      </div>
    </div>
  );
}

