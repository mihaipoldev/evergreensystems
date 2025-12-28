import { getAllAIKnowledge } from "@/features/ai-knowledge/data";
import { AIKnowledgeList } from "@/features/ai-knowledge/components/AIKnowledgeList";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-dynamic";

export default async function AIKnowledgePage() {
  const knowledgeWithCounts = await getAllAIKnowledge();

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="AI Knowledge"
          description="Manage your AI knowledge bases for intelligent responses"
          icon={faBook}
        />
      </div>
      <AIKnowledgeList initialKnowledge={knowledgeWithCounts} />
    </div>
  );
}

