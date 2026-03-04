import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toolbar } from "@/components/shared/Toolbar";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateProjectDialog } from "@/components/forms/CreateProjectDialog";

const projects = [
  {
    name: "Q4 Customer Analysis",
    status: "Active" as const,
    description: "Analyzing customer feedback and support tickets to identify product improvement opportunities.",
    linkedKB: "Customer Support",
    taskCount: 12,
    updatedAt: "1 hour ago"
  },
  {
    name: "Documentation Refresh",
    status: "Active" as const,
    description: "Updating all product documentation for the v3.0 release with new features and API changes.",
    linkedKB: "Product Documentation",
    taskCount: 28,
    updatedAt: "3 hours ago"
  },
  {
    name: "Compliance Audit 2024",
    status: "Completed" as const,
    description: "Annual compliance review and documentation update for regulatory requirements.",
    linkedKB: "Legal Compliance",
    taskCount: 45,
    updatedAt: "1 day ago"
  },
  {
    name: "Sales Training Materials",
    status: "Active" as const,
    description: "Creating AI-powered training content for the sales team using existing playbooks.",
    linkedKB: "Sales Enablement",
    taskCount: 8,
    updatedAt: "2 days ago"
  },
  {
    name: "Knowledge Graph POC",
    status: "Draft" as const,
    description: "Proof of concept for implementing knowledge graph capabilities across engineering documentation.",
    linkedKB: "Engineering Wiki",
    taskCount: 3,
    updatedAt: "3 days ago"
  },
  {
    name: "Onboarding Automation",
    status: "Active" as const,
    description: "Automating employee onboarding using AI-powered document retrieval from HR knowledge base.",
    linkedKB: "HR Policies",
    taskCount: 15,
    updatedAt: "4 days ago"
  },
  {
    name: "Content Optimization",
    status: "Archived" as const,
    description: "SEO and engagement optimization for marketing content using AI analysis.",
    linkedKB: "Marketing Content",
    taskCount: 22,
    updatedAt: "2 weeks ago"
  },
  {
    name: "Financial Forecasting",
    status: "Draft" as const,
    description: "Building predictive models using historical financial data and market trends.",
    linkedKB: "Financial Reports",
    taskCount: 5,
    updatedAt: "3 weeks ago"
  },
];

export default function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      <AppLayout 
        title="Projects" 
        subtitle="Manage AI-powered projects and workflows"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      >
        <div>
          <Toolbar 
            searchPlaceholder="Search projects..."
            filters={["All", "Active", "Draft", "Completed", "Archived"]}
            primaryAction={{ label: "New", onClick: () => setIsCreateDialogOpen(true) }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.name}
                {...project}
                onView={() => {}}
                onMenuClick={() => {}}
              />
            ))}
          </div>
        </div>
      </AppLayout>

      <CreateProjectDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </>
  );
}
