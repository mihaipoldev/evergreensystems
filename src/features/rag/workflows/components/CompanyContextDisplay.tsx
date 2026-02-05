"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export type CompanyContextField = {
  name?: string;
  type: string;
  knowledge_base?: string;
  document_ids?: string[];
  display_name?: string;
  description?: string;
  required?: boolean;
  locked?: boolean;
};

type CompanyContextDisplayProps = {
  field: CompanyContextField;
};

export function CompanyContextDisplay({ field }: CompanyContextDisplayProps) {
  const documentIds = field.document_ids ?? [];
  const displayName = field.display_name || (field.name ?? "").replace(/_/g, " ");
  const count = documentIds.length;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0" />
        <span>
          ✓ {displayName} ({count} document{count !== 1 ? "s" : ""})
        </span>
      </div>
      {field.description && (
        <p className="text-xs text-muted-foreground pl-6">
          {field.description}
        </p>
      )}
    </div>
  );
}
