import { notFound } from "next/navigation";
import { getKnowledgeBaseById, getKnowledgeBaseStatsById } from "@/features/rag/knowledge-bases/data";
import { getDocumentsByKnowledgeBaseId } from "@/features/rag/documents/data";
import { Badge } from "@/components/ui/badge";
import { KnowledgeBaseDetailClient } from "./KnowledgeBaseDetailClient";

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

  // Fetch documents and stats in parallel for better performance
  const [documents, stats] = await Promise.all([
    getDocumentsByKnowledgeBaseId(id),
    getKnowledgeBaseStatsById(id),
  ]);

  return (
    <KnowledgeBaseDetailClient
      knowledge={knowledge}
      initialDocuments={documents}
      initialStats={stats}
    />
  );
}

