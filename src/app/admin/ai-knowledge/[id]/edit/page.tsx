import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AIKnowledgeForm } from "@/features/ai-knowledge/components/AIKnowledgeForm";
import { getAIKnowledgeById } from "@/features/ai-knowledge/data";

export const dynamic = "force-dynamic";

type EditAIKnowledgePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAIKnowledgePage({ params }: EditAIKnowledgePageProps) {
  const { id } = await params;
  const knowledge = await getAIKnowledgeById(id);

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
      <AIKnowledgeForm initialData={knowledge} isEdit={true} />
    </div>
  );
}

