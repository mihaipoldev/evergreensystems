import { notFound } from "next/navigation";
import Link from "next/link";
import { getAIKnowledgeById, getDocumentsByKnowledgeBaseId } from "@/features/ai-knowledge/data";
import { DocumentsList } from "@/features/ai-knowledge/components/DocumentsList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-dynamic";

type AIKnowledgeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AIKnowledgeDetailPage({ params }: AIKnowledgeDetailPageProps) {
  const { id } = await params;
  const knowledge = await getAIKnowledgeById(id);

  if (!knowledge) {
    notFound();
  }

  // Fetch documents for this knowledge base
  const documents = await getDocumentsByKnowledgeBaseId(id);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{knowledge.name}</h1>
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
        <Button asChild>
          <Link href={`/admin/ai-knowledge/${knowledge.id}/edit`}>
            <FontAwesomeIcon icon={faPencil} className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Documents</h2>
        <DocumentsList knowledgeBaseId={id} initialDocuments={documents} />
      </div>
    </div>
  );
}

