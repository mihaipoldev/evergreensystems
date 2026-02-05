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

const DESCRIPTIVE_SECTIONS = [
  { id: "basic-profile", number: "01", title: "Basic Profile" },
  { id: "tam-analysis", number: "02", title: "TAM Analysis" },
  { id: "what-they-sell", number: "03", title: "What They Sell" },
  { id: "deal-economics", number: "04", title: "Deal Economics" },
  { id: "technology-stack", number: "05", title: "Technology Stack" },
  { id: "client-acquisition-dynamics", number: "06", title: "Client Acquisition Dynamics" },
  { id: "shadow-competitors", number: "07", title: "Shadow Competitors" },
  { id: "financial-reality", number: "08", title: "Financial Reality" },
  { id: "market-maturity", number: "09", title: "Market Maturity" },
  { id: "timing-intelligence", number: "10", title: "Timing Intelligence" },
  { id: "pain-points", number: "11", title: "Pain Points" },
  { id: "desired-outcomes", number: "12", title: "Desired Outcomes" },
  { id: "kpis-that-matter", number: "13", title: "KPIs That Matter" },
  { id: "how-they-position", number: "14", title: "How They Position" },
  { id: "their-customer-language", number: "15", title: "Their Customer Language" },
  { id: "buyer-psychology", number: "16", title: "Buyer Psychology" },
];

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

const ICP_SECTIONS = [
  { id: "quick-reference", number: "00", title: "Quick Reference" },
  { id: "icp-overview", number: "01", title: "ICP Overview" },
  { id: "target-segmentation", number: "02", title: "Target Segmentation" },
  { id: "targeting-criteria", number: "03", title: "Targeting Criteria" },
  { id: "triggers", number: "04", title: "Buying Triggers" },
  { id: "buying-motivations-journey", number: "05", title: "Buying Motivations & Journey" },
  { id: "competitive-context", number: "06", title: "Competitive Positioning" },
  { id: "tactical-playbooks", number: "07", title: "Tactical Playbooks" },
  { id: "data-quality", number: "08", title: "Data Quality & Sources" },
];

const OUTBOUND_SECTIONS = [
  { id: "target-profile", number: "01", title: "Target Profile" },
  { id: "targeting-strategy", number: "02", title: "Targeting Strategy" },
  { id: "enrichment-requirements", number: "03", title: "Enrichment Requirements" },
  { id: "segmentation-rules", number: "04", title: "Segmentation Rules" },
  { id: "exclusion-rules", number: "05", title: "Exclusion Rules" },
  { id: "title-packs", number: "06", title: "Title Packs" },
  { id: "targeting-quick-reference", number: "07", title: "Targeting Quick Reference" },
  { id: "our-positioning", number: "08", title: "Our Positioning" },
  { id: "buyer-psychology", number: "09", title: "Buyer Psychology" },
  { id: "objection-handling", number: "10", title: "Objection Handling" },
  { id: "messaging-strategy", number: "11", title: "Messaging Strategy" },
  { id: "sales-process", number: "12", title: "Sales Process" },
];

type ReportResultClientProps = {
  initialReportData: ReportData;
  runId: string;
  runStatus?: string | null;
  workflowName?: string | null;
  workflowLabel?: string | null;
  projectName?: string | null;
  runInput?: Record<string, unknown> | null;
};

export function ReportResultClient({ initialReportData, runId, runStatus, workflowName, workflowLabel, projectName, runInput }: ReportResultClientProps) {
  const [reportData, setReportData] = useState<ReportData>(initialReportData);

  // Sync initial report data when prop changes
  useEffect(() => {
    setReportData(initialReportData);
  }, [initialReportData]);

  const isComplete = runStatus === "complete";

  // Set up Supabase real-time subscription and polling only when run is not complete
  useEffect(() => {
    if (isComplete) {
      return;
    }

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
    
    // Poll only when run is not complete (every 2 seconds)
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
  }, [runId, isComplete]);

  // Normalize workflow for comparison (slug may have spaces from DB/API)
  const normalizedWorkflow = (workflowName && typeof workflowName === "string")
    ? workflowName.toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_").trim()
    : null;

  const isOutbound = normalizedWorkflow === "outbound_strategy" || normalizedWorkflow === "lead_gen_targeting";
  const isDescriptive = normalizedWorkflow === "descriptive_intelligence" || (reportData.data as Record<string, unknown>)?.basic_profile != null;
  const baseSections =
    normalizedWorkflow === "icp_research"
      ? ICP_SECTIONS
      : isDescriptive
        ? DESCRIPTIVE_SECTIONS
        : isOutbound
          ? OUTBOUND_SECTIONS
          : [...sections];
  const allSections = [...baseSections];
  if (isOutbound) {
    const dataAny = reportData.data as Record<string, unknown>;
    if (dataAny?.research_links) {
      allSections.push({ id: "research-links", number: "13", title: "Research Links" });
    }
    if (reportData.meta.sources_used && reportData.meta.sources_used.length > 0) {
      allSections.push({ id: "sources-used", number: "14", title: "Sources Used" });
    }
  } else if (isDescriptive) {
    const dataAny = reportData.data as Record<string, unknown>;
    if (dataAny?.research_links) {
      allSections.push({ id: "research-links", number: "17", title: "Research Links" });
    }
    if (reportData.meta.sources_used && reportData.meta.sources_used.length > 0) {
      allSections.push({ id: "sources-used", number: "18", title: "Sources Used" });
    }
  } else if (normalizedWorkflow !== "icp_research") {
    if (reportData.data.lead_gen_scoring) {
      allSections.push({ id: "lead-gen-scoring", number: "11", title: "Lead Gen Scoring" });
    }
    if (reportData.data.research_links) {
      allSections.push({ id: "research-links", number: "12", title: "Research Links" });
    }
    if (reportData.meta.sources_used && reportData.meta.sources_used.length > 0) {
      allSections.push({ id: "sources-used", number: "13", title: "Sources Used" });
    }
  } else if (reportData.meta.sources_used && reportData.meta.sources_used.length > 0) {
    allSections.push({ id: "sources-used", number: "09", title: "Sources Used" });
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

  // Format confidence for display (handle 0-1 scale, 0-100 scale, and string)
  const formatConfidence = (confidence: any): string => {
    if (typeof confidence === 'number') {
      const value = confidence <= 1 ? confidence * 100 : confidence;
      return `${Math.round(value)}%`;
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
          runInput={runInput ?? undefined}
          usageMetrics={reportData.meta.usage_metrics}
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

