import { getAllKnowledgeBases } from "@/features/rag/knowledge-bases/data";
import { KnowledgeBaseList } from "@/features/rag/knowledge-bases/components/KnowledgeBaseList";
import { AdminPageTitle } from "@/components/admin/AdminPageTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-dynamic";

export default async function AIKnowledgePage() {
  const knowledgeWithCounts = await getAllKnowledgeBases();

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <AdminPageTitle
          title="AI Knowledge"
          description="Manage your AI knowledge bases for intelligent responses"
          icon={faBook}
        />
      </div>
      <KnowledgeBaseList initialKnowledge={knowledgeWithCounts} />
    </div>
  );
}

