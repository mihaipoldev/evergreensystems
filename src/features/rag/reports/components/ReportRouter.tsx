import type { ReportData } from "../types";
import { COMPONENT_MAP, type ReportComponent } from "../registry";

type ReportRouterProps = {
  workflowName: string | null;
  reportData: ReportData;
  reportId: string;
};

function NoReportView({ automationName }: { automationName: string | null }) {
  const displayName = automationName
    ? automationName.replace(/[-_]/g, " ")
    : "this workflow";
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
      <p className="font-body text-muted-foreground">
        No report view is available for{" "}
        <span className="font-semibold text-foreground">{displayName}</span>.
      </p>
      <p className="mt-2 text-sm font-body text-muted-foreground/80">
        This workflow type does not have a report template in this app.
      </p>
    </div>
  );
}

/**
 * ReportRouter renders the correct report component based on automation_name from meta.
 *
 * Uses the centralized COMPONENT_MAP from the automation registry.
 *
 * Fallback: if automation_name isn't set, tries to match the workflowName prop
 * by converting it to kebab-case and looking it up in the same map.
 */
export function ReportRouter({ workflowName, reportData, reportId }: ReportRouterProps) {
  const automationName = (reportData.meta as { automation_name?: string }).automation_name;

  // Primary: use automation_name from meta
  let Component: ReportComponent | null =
    automationName ? COMPONENT_MAP[automationName] ?? null : null;

  // Fallback: try workflowName converted to kebab-case
  if (!Component && workflowName) {
    const kebab = workflowName.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-").trim();
    Component = COMPONENT_MAP[kebab] ?? null;
  }

  if (Component) {
    return <Component data={reportData} reportId={reportId} />;
  }

  return <NoReportView automationName={automationName || workflowName} />;
}
