import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toolbar } from "@/components/shared/Toolbar";
import { KnowledgeBaseCard } from "@/components/shared/KnowledgeBaseCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateKnowledgeBaseDialog } from "@/components/forms/CreateKnowledgeBaseDialog";

const knowledgeBases = [
  {
    name: "Product Documentation",
    type: "Vector" as const,
    description: "Technical documentation, API references, and user guides for the main product suite.",
    documentCount: 342,
    size: "1.2 GB",
    updatedAt: "2 hours ago"
  },
  {
    name: "Customer Support",
    type: "Hybrid" as const,
    description: "Support tickets, FAQs, and resolution procedures for customer service teams.",
    documentCount: 1205,
    size: "890 MB",
    updatedAt: "5 hours ago"
  },
  {
    name: "Legal Compliance",
    type: "Graph" as const,
    description: "Regulatory documents, compliance checklists, and legal precedents.",
    documentCount: 89,
    size: "450 MB",
    updatedAt: "1 day ago"
  },
  {
    name: "HR Policies",
    type: "Vector" as const,
    description: "Employee handbook, policies, onboarding materials, and training resources.",
    documentCount: 156,
    size: "320 MB",
    updatedAt: "2 days ago"
  },
  {
    name: "Sales Enablement",
    type: "Hybrid" as const,
    description: "Sales playbooks, competitive analysis, case studies, and prospect research.",
    documentCount: 478,
    size: "1.5 GB",
    updatedAt: "3 days ago"
  },
  {
    name: "Engineering Wiki",
    type: "Graph" as const,
    description: "Architecture decisions, runbooks, incident reports, and technical specifications.",
    documentCount: 892,
    size: "2.1 GB",
    updatedAt: "4 days ago"
  },
  {
    name: "Marketing Content",
    type: "Vector" as const,
    description: "Brand guidelines, campaign materials, blog posts, and social media content.",
    documentCount: 234,
    size: "780 MB",
    updatedAt: "1 week ago"
  },
  {
    name: "Financial Reports",
    type: "Hybrid" as const,
    description: "Quarterly reports, budgets, forecasts, and financial analysis documents.",
    documentCount: 67,
    size: "290 MB",
    updatedAt: "1 week ago"
  },
];

export default function KnowledgeBases() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      <AppLayout 
        title="Knowledge Bases" 
        subtitle="Manage your organization's knowledge repositories"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Knowledge Base
          </Button>
        }
      >
        <div>
          <Toolbar 
            searchPlaceholder="Search knowledge bases..."
            filters={["All", "Vector", "Graph", "Hybrid"]}
            primaryAction={{ label: "New", onClick: () => setIsCreateDialogOpen(true) }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {knowledgeBases.map((kb) => (
              <KnowledgeBaseCard
                key={kb.name}
                {...kb}
                onView={() => {}}
                onMenuClick={() => {}}
              />
            ))}
          </div>
        </div>
      </AppLayout>

      <CreateKnowledgeBaseDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </>
  );
}
