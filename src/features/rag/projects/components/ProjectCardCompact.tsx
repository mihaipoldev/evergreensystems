"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faDatabase } from "@fortawesome/free-solid-svg-icons";
import type { Project } from "../types";
import { cn } from "@/lib/utils";

type ProjectCardCompactProps = {
  project: Project;
  linkedKBName?: string | null;
};

export function ProjectCardCompact({
  project,
  linkedKBName,
}: ProjectCardCompactProps) {
  const statusColors: Record<string, string> = {
    active: "bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20",
    draft: "bg-muted text-muted-foreground border-border",
    archived: "bg-muted text-muted-foreground border-border",
    delivered: "bg-primary/10 text-primary border-primary/20",
    onboarding: "bg-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-600/20",
  };

  const statusColorClass = statusColors[project.status] || statusColors.draft;

  return (
    <Card className="h-full border-0">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <FontAwesomeIcon
              icon={faFolder}
              className="h-4 w-4 text-primary"
            />
          </div>
          <Link href={`/intel/projects/${project.id}`} className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground truncate hover:text-primary transition-colors">
              {project.client_name}
            </h3>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Badge variant="outline" className={cn("w-fit capitalize", statusColorClass)}>
          {project.status}
        </Badge>
        {linkedKBName && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FontAwesomeIcon icon={faDatabase} className="h-3.5 w-3.5" />
            <span className="truncate">{linkedKBName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

