import { ProjectForm } from "@/features/rag/projects/components/ProjectForm";

export const dynamic = "force-dynamic";

export default function CreateProjectPage() {
  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <p className="text-sm text-muted-foreground">Create a new client project</p>
      </div>
      <ProjectForm />
    </div>
  );
}

