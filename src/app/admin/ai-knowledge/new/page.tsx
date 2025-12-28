import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { AIKnowledgeForm } from "@/features/ai-knowledge/components/AIKnowledgeForm";

export const dynamic = "force-dynamic";

export default async function NewAIKnowledgePage() {
  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="New AI Knowledge"
          description="Create a new knowledge base for AI-powered responses"
        />
      </div>
      <AIKnowledgeForm isEdit={false} />
    </div>
  );
}

