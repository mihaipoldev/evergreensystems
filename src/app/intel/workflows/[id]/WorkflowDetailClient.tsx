"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faClock,
  faDollarSign,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";
import { usePageHeader } from "@/providers/PageHeaderProvider";
import { WorkflowActionsMenu } from "@/features/rag/workflows/components/WorkflowActionsMenu";
import { WorkflowModal } from "@/features/rag/workflows/components/WorkflowModal";
import type { Workflow } from "@/features/rag/workflows/types";
import { cn } from "@/lib/utils";

type WorkflowDetailClientProps = {
  workflow: Workflow;
};

export function WorkflowDetailClient({
  workflow: initialWorkflow,
}: WorkflowDetailClientProps) {
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { setHeader } = usePageHeader();

  const enabledColorClass = workflow.enabled
    ? "bg-green-600/10 text-green-600 dark:text-green-400 border-green-600/20"
    : "bg-muted text-muted-foreground border-border";

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
    setIsEditModalOpen(false);
  };

  useEffect(() => {
    setHeader({
      breadcrumbItems: [
        { href: "/intel/workflows", label: "Workflows" },
        { label: workflow.name },
      ],
      actions: <WorkflowActionsMenu workflow={workflow} onEdit={handleEdit} />,
    });
    return () => setHeader(null);
  }, [workflow, setHeader]);

  return (
    <>
      <div className="w-full space-y-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{workflow.name}</h1>
          <p className="text-sm text-muted-foreground mb-2">Manage workflow configuration and settings.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={cn("text-xs", enabledColorClass)}
            >
              {workflow.enabled ? "Enabled" : "Disabled"}
            </Badge>
            {workflow.estimated_cost !== null && (
              <Badge variant="outline" className="text-xs">
                ${workflow.estimated_cost}
              </Badge>
            )}
            {workflow.estimated_time_minutes !== null && (
              <Badge variant="outline" className="text-xs">
                {workflow.estimated_time_minutes} min
              </Badge>
            )}
          </div>
        </div>

        {/* Workflow Details */}
        <section className="relative">
          <div className="space-y-6">
            <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {workflow.icon ? (
                    <span className="text-2xl">{workflow.icon}</span>
                  ) : (
                    <FontAwesomeIcon
                      icon={faSitemap}
                      className="h-6 w-6 text-primary"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{workflow.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{workflow.slug}</p>
                </div>
              </div>

              {workflow.description && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                </div>
              )}

              {(workflow.estimated_cost !== null || workflow.estimated_time_minutes !== null || workflow.default_ai_model || workflow.default_synthesis_ai_model) && (
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center gap-6 text-sm flex-wrap">
                    {workflow.estimated_cost !== null && (
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">${workflow.estimated_cost}</span>
                        <span className="text-muted-foreground">estimated cost</span>
                      </div>
                    )}
                    {workflow.estimated_time_minutes !== null && (
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{workflow.estimated_time_minutes}</span>
                        <span className="text-muted-foreground">minutes</span>
                      </div>
                    )}
                    {workflow.default_ai_model && (
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBrain} className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{workflow.default_ai_model}</span>
                        <span className="text-muted-foreground">Research AI model</span>
                      </div>
                    )}
                    {workflow.default_synthesis_ai_model && (
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBrain} className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{workflow.default_synthesis_ai_model}</span>
                        <span className="text-muted-foreground">Synthesis AI model</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {workflow.input_schema && (
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Input Schema</h3>
                  <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(workflow.input_schema, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <WorkflowModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={workflow}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}

