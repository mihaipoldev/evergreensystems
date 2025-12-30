import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { KnowledgeBaseForm } from "@/features/rag/knowledge-bases/components/KnowledgeBaseForm";
import { getKnowledgeBaseById } from "@/features/rag/knowledge-bases/data";

export const dynamic = "force-dynamic";

type EditAIKnowledgePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAIKnowledgePage({ params }: EditAIKnowledgePageProps) {
  const { id } = await params;
  const knowledge = await getKnowledgeBaseById(id);

  if (!knowledge) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="Edit AI Knowledge"
          entityName={knowledge.name}
          description="Update the knowledge base details"
        />
      </div>
      <KnowledgeBaseForm initialData={knowledge} isEdit={true} returnTo={`/admin/knowledge-base/${knowledge.id}`} />
    </div>
  );
}

