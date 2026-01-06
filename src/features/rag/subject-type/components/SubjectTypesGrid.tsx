"use client";

import { SubjectTypeCard } from "./SubjectTypeCard";
import type { SubjectType } from "../types";
import { AnimatedGrid } from "@/features/rag/shared/components/AnimatedGrid";

interface SubjectTypesGridProps {
  subjectTypes: SubjectType[];
  onDelete?: () => void;
  onEdit?: (subjectType: SubjectType) => void;
}

export function SubjectTypesGrid({
  subjectTypes,
  onDelete,
  onEdit,
}: SubjectTypesGridProps) {
  return (
    <AnimatedGrid
      getKey={(_, index) => subjectTypes[index]?.id || index}
      staggerDelay={0.04}
    >
      {subjectTypes.map((subjectType) => (
        <div key={subjectType.id} className="group transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
          <SubjectTypeCard
            subjectType={subjectType}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      ))}
    </AnimatedGrid>
  );
}

