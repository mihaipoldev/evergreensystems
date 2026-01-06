"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectModal } from "@/features/rag/projects/components/ProjectModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export const dynamic = "force-dynamic";

export default function CreateProjectPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="w-full space-y-6">
      <div className="mb-6 md:mb-8">
        <p className="text-sm text-muted-foreground">Create a new client project</p>
      </div>
      <ProjectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={null}
      />
    </div>
  );
}

