import type { ReportData } from "../types";
import { NicheEvaluation } from "./niche-evaluation";
import { NicheReport } from "./niche/NicheReport";
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
  "niche_fit_evaluation": NicheEvaluation,
  // Add more mappings here as new workflows are added:
  // "company_intelligence": CompanyReport,
  // "market_research": MarketResearchReport,
};

/**
 * Default fallback component when workflow is unknown or missing
 */
const DEFAULT_REPORT_COMPONENT = NicheReport;

/**
 * Detects report type from data structure if workflow name is not available
 * This provides backward compatibility for reports created before workflow tracking
 */
function detectReportTypeFromData(data: ReportData): string {
  // Check for niche_profile - indicates niche intelligence report
  if (data.data.niche_profile) {
    return "niche_intelligence";
  }
  
  // Add more detection logic here as new report types are added
  // e.g., if (data.data.company_profile) return "company_intelligence";
  
  // Default to niche_intelligence for backward compatibility
  return "niche_intelligence";
}

/**
 * ReportRouter component that renders the appropriate report component
 * based on workflow name, with fallback to data structure detection
 * 
 * Decision flow:
 * 1. Primary: Use workflowName to look up component in WORKFLOW_TO_COMPONENT_MAP
 * 2. Secondary: Detect from data structure (for legacy reports)
 * 3. Fallback: Use DEFAULT_REPORT_COMPONENT (NicheReport)
 */
export function ReportRouter({ workflowName, reportData, reportId }: ReportRouterProps) {
  // Step 1: Try to get component from workflow name
  let ReportComponent: ReportComponent | undefined;
  let effectiveWorkflowName: string;

  if (workflowName && WORKFLOW_TO_COMPONENT_MAP[workflowName]) {
    ReportComponent = WORKFLOW_TO_COMPONENT_MAP[workflowName];
    effectiveWorkflowName = workflowName;
  } else {
    // Step 2: Try to detect from data structure
    const detectedType = detectReportTypeFromData(reportData);
    effectiveWorkflowName = workflowName || detectedType;
    
    // Step 3: Use detected type or fallback to default
    ReportComponent = WORKFLOW_TO_COMPONENT_MAP[detectedType] || DEFAULT_REPORT_COMPONENT;
    
    // Log when we fall back to default for debugging
    if (!WORKFLOW_TO_COMPONENT_MAP[effectiveWorkflowName]) {
      console.warn(
        `[ReportRouter] Unknown workflow "${effectiveWorkflowName}". ` +
        `Using ${ReportComponent === DEFAULT_REPORT_COMPONENT ? "default" : "detected"} component.`
      );
    }
  }

  // Render the selected component
  return <ReportComponent data={reportData} reportId={reportId} />;
}

/**
 * Helper function to get the report component for a workflow name
 * Useful for type checking or validation
 */
export function getReportComponentForWorkflow(workflowName: string | null): ReportComponent | null {
  if (!workflowName) return null;
  return WORKFLOW_TO_COMPONENT_MAP[workflowName] || null;
}

/**
 * Get list of all registered workflow names
 */
export function getRegisteredWorkflowNames(): string[] {
  return Object.keys(WORKFLOW_TO_COMPONENT_MAP);
}

