import type { ReportData } from "../types";
import { NicheEvaluation } from "./niche-evaluation";
import { NicheReport } from "./niche-intelligence/NicheReport";
import { ICPReport } from "./icp-research";
import { OutboundStrategyReport } from "./outbound-strategy";
import type { ReactElement } from "react";

type ReportRouterProps = {
  workflowName: string | null;
  reportData: ReportData;
  reportId: string;
};

type ReportComponentProps = {
  data: ReportData;
  reportId: string;
};

type ReportComponent = (props: ReportComponentProps) => ReactElement;

/**
 * WORKFLOW TO COMPONENT MAPPING
 * 
 * This is the central registry that binds workflow names (from database)
 * to their corresponding report component renderers.
 * 
 * To add a new workflow:
 * 1. Create a new report component (e.g., CompanyReport.tsx)
 * 2. Import it above
 * 3. Add an entry to this map: "workflow_name" => Component
 * 
 * The workflow name must match the `name` field in the `workflows` table.
 */
const WORKFLOW_TO_COMPONENT_MAP: Record<string, ReportComponent> = {
  "niche_intelligence": NicheReport,
  "descriptive_intelligence": NicheReport,
  "niche_fit_evaluation": NicheEvaluation,
  "icp_research": ICPReport,
  "outbound_strategy": OutboundStrategyReport,
  "lead_gen_targeting": OutboundStrategyReport, // alias for outbound_strategy (meta.mode)
};

/**
 * Normalize workflow slug for lookup (lowercase, hyphens and spaces -> underscores).
 * Ensures "icp_research", "icp-research", "ICP Research", "icp research" all match.
 */
function normalizeWorkflowSlug(slug: string | null): string | null {
  if (!slug || typeof slug !== "string") return null;
  return slug.toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_").trim() || null;
}

/**
 * Detects report type from data structure when workflow name is not available
 * (e.g. legacy reports created before workflow tracking).
 */
function detectReportTypeFromData(data: ReportData): string {
  const dataAny = data.data as {
    evaluation?: { verdict?: unknown };
    decision_card?: unknown;
    individual_evaluations?: unknown;
    niche_profile?: unknown;
    basic_profile?: unknown;
    buyer_icp?: unknown;
    title_packs?: unknown;
    sales_process?: unknown;
  };
  if (dataAny?.evaluation?.verdict) return "niche_fit_evaluation";
  if (dataAny?.decision_card ?? dataAny?.individual_evaluations) return "niche_fit_evaluation";
  if (dataAny?.buyer_icp) return "icp_research";
  if (dataAny?.title_packs != null || dataAny?.sales_process != null) return "outbound_strategy";
  if (dataAny?.basic_profile) return "descriptive_intelligence";
  if (dataAny?.niche_profile) return "niche_intelligence";
  return "niche_intelligence";
}

/**
 * "No report view" placeholder when the workflow has no registered report component.
 */
function NoReportView({ workflowName }: { workflowName: string | null }) {
  const displayName = workflowName ? workflowName.replace(/_/g, " ") : "this workflow";
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
      <p className="font-body text-muted-foreground">
        No report view is available for <span className="font-semibold text-foreground">{displayName}</span>.
      </p>
      <p className="mt-2 text-sm font-body text-muted-foreground/80">
        This workflow type does not have a report template in this app.
      </p>
    </div>
  );
}

/**
 * ReportRouter renders the report component for the run's workflow.
 * - If workflow has a registered report (e.g. icp_research, niche_intelligence): show it.
 * - If workflow is known but has no report: show "No report view".
 * - If workflow is unknown (null): try to detect from data; otherwise show "No report view".
 */
export function ReportRouter({ workflowName, reportData, reportId }: ReportRouterProps) {
  const normalizedSlug = normalizeWorkflowSlug(workflowName);
  let ReportComponent: ReportComponent | null = (normalizedSlug && WORKFLOW_TO_COMPONENT_MAP[normalizedSlug]) || null;

  if (!ReportComponent) {
    const detectedType = detectReportTypeFromData(reportData);
    ReportComponent = WORKFLOW_TO_COMPONENT_MAP[detectedType] || null;
  }

  if (ReportComponent) {
    return <ReportComponent data={reportData} reportId={reportId} />;
  }

  return <NoReportView workflowName={normalizedSlug || workflowName} />;
}

/**
 * Helper to get the report component for a workflow name (slug normalized for lookup).
 */
export function getReportComponentForWorkflow(workflowName: string | null): ReportComponent | null {
  const slug = normalizeWorkflowSlug(workflowName);
  if (!slug) return null;
  return WORKFLOW_TO_COMPONENT_MAP[slug] || null;
}

/**
 * Get list of all registered workflow names
 */
export function getRegisteredWorkflowNames(): string[] {
  return Object.keys(WORKFLOW_TO_COMPONENT_MAP);
}

