"use client";

import { ResearchCard } from "./ResearchCard";
import type { ResearchSubject } from "../types";
import { AnimatedGrid } from "@/features/rag/shared/components/AnimatedGrid";

interface ResearchGridProps {
  researchSubjects: ResearchSubject[];
  onDelete?: () => void;
  onEdit?: (research: ResearchSubject) => void;
}

export function ResearchGrid({
  researchSubjects,
  onDelete,
  onEdit,
}: ResearchGridProps) {
  return (
    <AnimatedGrid
      getKey={(_, index) => researchSubjects[index]?.id || index}
      staggerDelay={0.04}
    >
      {researchSubjects.map((research) => (
        <div key={research.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <ResearchCard
            research={research}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </AnimatedGrid>
  );
}

