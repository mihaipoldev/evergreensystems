"use client";

import { Suspense, useState, useEffect } from "react";
import { WorkflowList } from "@/features/rag/workflows/components/WorkflowList";
import type { Workflow } from "@/features/rag/workflows/types";
import { createClient } from "@/lib/supabase/client";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/intel/workflows");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch workflows");
        }
        
        const data = await response.json();
        setWorkflows(data || []);
      } catch (err) {
        console.error("Error fetching workflows:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Set up Supabase real-time subscription for workflows
  useEffect(() => {
    const supabase = createClient();
    
    console.log('🔌 Setting up workflow subscription...');
    
    const channel = supabase
      .channel('workflows_changes', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflows',
        },
        (payload) => {
          console.log('📋 Workflow change detected:', {
            eventType: payload.eventType,
            workflowId: (payload.new as any)?.id || (payload.old as any)?.id,
            enabled: (payload.new as any)?.enabled,
            timestamp: new Date().toISOString(),
          });

          if (payload.eventType === 'INSERT' && payload.new) {
            const newWorkflow = payload.new as any;
            
            // Only add if enabled (since API filters by enabled by default)
            if (!newWorkflow.enabled) {
              console.log('⏭️ Skipping INSERT - workflow is disabled');
              return;
            }
            
            setWorkflows((prev) => {
              const exists = prev.some((wf) => wf.id === newWorkflow.id);
              if (exists) {
                console.log('⚠️ Workflow already exists in list, skipping INSERT');
                return prev;
              }
              
              console.log('✅ Adding new workflow to list:', newWorkflow.id);
              // Add new workflow and sort by updated_at descending
              const updated = [newWorkflow as Workflow, ...prev];
              return updated.sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedWorkflow = payload.new as any;
            
            console.log('🔄 Processing UPDATE for workflow:', updatedWorkflow.id, {
              oldEnabled: (payload.old as any)?.enabled,
              newEnabled: updatedWorkflow.enabled,
            });
            
            setWorkflows((prev) => {
              const existingWorkflow = prev.find((wf) => wf.id === updatedWorkflow.id);
              
              // If workflow was disabled, remove it from the list (since we filter by enabled)
              if (!updatedWorkflow.enabled && existingWorkflow) {
                console.log('🗑️ Removing disabled workflow from list:', updatedWorkflow.id);
                return prev.filter((wf) => wf.id !== updatedWorkflow.id);
              }
              
              // If workflow was enabled and not in list, add it
              if (updatedWorkflow.enabled && !existingWorkflow) {
                console.log('✅ Adding enabled workflow to list via UPDATE:', updatedWorkflow.id);
                const updated = [updatedWorkflow as Workflow, ...prev];
                return updated.sort((a, b) => 
                  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                );
              }
              
              // Update existing workflow
              if (existingWorkflow) {
                console.log('✅ Updating existing workflow in list:', updatedWorkflow.id);
                const updated = prev.map((wf) =>
                  wf.id === updatedWorkflow.id
                    ? (updatedWorkflow as Workflow)
                    : wf
                );
                return updated;
              }
              
              return prev;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedWorkflow = payload.old as { id: string };
            
            console.log('🗑️ Processing DELETE for workflow:', deletedWorkflow.id);
            setWorkflows((prev) => {
              return prev.filter((wf) => wf.id !== deletedWorkflow.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Workflow subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to workflow changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - check Supabase real-time settings and ensure workflows table has Realtime enabled');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Subscription timed out - Realtime connection issue');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Subscription closed');
        }
      });

    return () => {
      console.log('🧹 Cleaning up workflow subscription');
      supabase.removeChannel(channel);
    };
  }, []); // Run once on mount, don't depend on loading

  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <WorkflowList initialWorkflows={workflows} />
    </div>
  );
}
