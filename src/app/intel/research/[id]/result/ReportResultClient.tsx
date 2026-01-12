"use client";

import { useState, useEffect } from "react";
import { ReportHeader } from "@/features/rag/reports/components/layout/ReportHeader";
import { ReportLayout } from "@/features/rag/reports/components/layout/ReportLayout";
import { getHeaderConfigForWorkflow } from "@/features/rag/reports/components/layout/ReportHeaderConfig";
import { ReportRouter } from "@/features/rag/reports/components/ReportRouter";
import type { ReportData } from "@/features/rag/reports/types";
import { transformOutputJson } from "@/features/rag/reports/utils/transformOutputJson";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

const sections = [
  { id: "niche-profile", number: "01", title: "Niche Profile" },
  { id: "market-intelligence", number: "02", title: "Market Intelligence" },
  { id: "buyer-psychology", number: "03", title: "Buyer Psychology" },
  { id: "value-dynamics", number: "04", title: "Value Dynamics" },
  { id: "lead-gen-strategy", number: "05", title: "Lead Gen Strategy" },
  { id: "targeting-strategy", number: "06", title: "Targeting Strategy" },
  { id: "offer-angles", number: "07", title: "Offer Angles" },
  { id: "outbound-approach", number: "08", title: "Outbound Approach" },
  { id: "positioning-intel", number: "09", title: "Positioning Intel" },
  { id: "messaging-inputs", number: "10", title: "Messaging Inputs" },
];

type ReportResultClientProps = {
  initialReportData: ReportData;
  runId: string;
  workflowName?: string | null;
  workflowLabel?: string | null;
  projectName?: string | null;
};

export function ReportResultClient({ initialReportData, runId, workflowName, workflowLabel, projectName }: ReportResultClientProps) {
  const [reportData, setReportData] = useState<ReportData>(initialReportData);

  // Sync initial report data when prop changes
  useEffect(() => {
    setReportData(initialReportData);
  }, [initialReportData]);

  // Set up Supabase real-time subscription for report updates
  useEffect(() => {
    const supabase = createClient();
    let pollInterval: NodeJS.Timeout | null = null;
    let channel: RealtimeChannel | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isUnmounted = false;
    
    // Function to fetch and update report data via API route
    const fetchReportUpdate = async () => {
      try {
        const response = await fetch(`/api/intel/reports/${runId}`);
        
        if (!response.ok) {
          // If we can't access the report (404, 401, etc.), stop polling
          if (response.status === 404 || response.status === 401 || response.status === 403) {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          }
          return;
        }
        
        const apiResponse = await response.json();
        
        if (apiResponse && apiResponse.output_json) {
          // Transform the output_json to ReportData format
          const transformedData = transformOutputJson(apiResponse.output_json);
          
          setReportData((prevData) => {
            // Check if anything actually changed by comparing updated_at or created_at
            // For now, we'll always update if we get new data
            return transformedData;
          });
        }
      } catch (error) {
        // Silently handle errors - don't spam console
        if (error instanceof TypeError && error.message.includes('fetch')) {
          // Network error, ignore
          return;
        }
      }
    };
    
    // Set up polling as fallback (every 2 seconds) - only for active runs
    // Check if the run is still in progress by looking at the run status
    pollInterval = setInterval(fetchReportUpdate, 2000);
    
    // Function to set up the subscription
    const setupSubscription = () => {
      if (isUnmounted) return;
      
      // Clean up existing channel if any
      if (channel) {
        try {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      // Create new channel
      channel = supabase
        .channel(`report-${runId}`, {
          config: {
            broadcast: { self: true },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "rag_run_outputs",
            filter: `run_id=eq.${runId}`,
          },
          async (payload) => {
            if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
              // When we get an update, fetch the full report data
              await fetchReportUpdate();
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("[ReportResultClient] ✅ Subscription active");
          } else if (status === "CHANNEL_ERROR") {
            console.error("[ReportResultClient] ❌ Channel error - subscription failed, will retry...");
            // Reconnect after a delay
            if (!isUnmounted && channel) {
              reconnectTimeout = setTimeout(() => {
                if (!isUnmounted) {
                  setupSubscription();
                }
              }, 2000);
            }
          } else if (status === "TIMED_OUT") {
            console.error("[ReportResultClient] ❌ Subscription timed out, will retry...");
            // Reconnect after a delay
            if (!isUnmounted && channel) {
              reconnectTimeout = setTimeout(() => {
                if (!isUnmounted) {
                  setupSubscription();
                }
              }, 2000);
            }
          } else if (status === "CLOSED") {
            console.log("[ReportResultClient] ⚠️ Subscription closed");
          }
        });
    };
    
    // Initial subscription setup
    setupSubscription();

    // Cleanup subscription and polling on unmount
    return () => {
      isUnmounted = true;
      
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      if (channel) {
        try {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [runId]);

  // Build sections array dynamically to include lead_gen_scoring, research_links, and sources_used if present
  let allSections = [...sections];
  if (reportData.data.lead_gen_scoring) {
    allSections.push({ id: "lead-gen-scoring", number: "11", title: "Lead Gen Scoring" });
  }
  if (reportData.data.research_links) {
    allSections.push({ id: "research-links", number: "12", title: "Research Links" });
  }
  if (reportData.meta.sources_used && reportData.meta.sources_used.length > 0) {
    allSections.push({ id: "sources-used", number: "13", title: "Sources Used" });
  }

  // Extract evaluation data (if this is an evaluation report)
  // Evaluation data is stored at data.data.evaluation in ReportData structure
  const evaluationData = (reportData.data as any).evaluation;
  const evaluationVerdict = evaluationData?.verdict;
  const evaluationQuickStats = evaluationData?.quick_stats;

  // Get header configuration based on workflow
  const headerConfig = getHeaderConfigForWorkflow(workflowName || null);

  // Get title - prioritize project name, then niche_name, then fallback
  const reportTitle = projectName || 
                     reportData.meta.input.niche_name || 
                     "Report";

  // Format confidence for display (handle both number and string cases)
  const formatConfidence = (confidence: any): string => {
    if (typeof confidence === 'number') {
      return `${(confidence * 100).toFixed(0)}%`;
    }
    if (typeof confidence === 'string') {
      return confidence;
    }
    return String(confidence || '0%');
  };

  const confidenceDisplay = formatConfidence(reportData.meta.confidence);

  return (
    <ReportLayout sections={allSections} showTableOfContents={false} reportId={runId}>
      <div className="-mx-8 dark:-mx-0 rounded-none md:rounded-2xl border border-border/60 bg-white px-8 md:px-8 py-8 md:pt-8 pt-3 shadow-none md:shadow-sm dark:border-transparent dark:bg-transparent dark:shadow-none dark:px-0 dark:py-0 print:border-transparent print:shadow-none">
        <ReportHeader
          title={reportTitle}
          geo={reportData.meta.input.geo}
          generatedAt={reportData.meta.generated_at}
          confidence={reportData.meta.confidence}
          headerConfig={headerConfig}
          evaluationVerdict={evaluationVerdict}
          evaluationQuickStats={evaluationQuickStats}
        />

        <ReportRouter 
          workflowName={workflowName || null}
          reportData={reportData}
          reportId={runId}
        />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground font-body">
            Generated on {reportData.meta.generated_at} • Confidence: {confidenceDisplay}
          </p>
          <p className="text-xs text-muted-foreground/60 font-body mt-2">
            {headerConfig.reportTypeLabel} • {headerConfig.modeLabel}
          </p>
        </footer>
      </div>
    </ReportLayout>
  );
}

