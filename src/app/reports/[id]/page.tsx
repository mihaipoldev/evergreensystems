import { notFound } from "next/navigation";
import { ReportHeader } from "@/features/rag/reports/components/layout/ReportHeader";
import { getHeaderConfigForWorkflow } from "@/features/rag/reports/components/layout/ReportHeaderConfig";
import { StandaloneReportLayout } from "@/features/rag/reports/components/layout/StandaloneReportLayout";
import { ReportRouter } from "@/features/rag/reports/components/ReportRouter";
import { getReportData } from "@/features/rag/reports/data/getReportData";
import { getSectionsForReport } from "@/features/rag/reports/utils/getSectionsForReport";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StandaloneReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const { data: reportData, error, workflowName, runInput } = await getReportData(id);

  if (error === "Unauthorized") {
    return (
      <StandaloneReportLayout sections={[]}>
        <div className="flex justify-center min-h-[400px] items-center">
          <div className="text-center">
            <p className="mb-2 font-body text-lg text-destructive">Unauthorized</p>
            <p className="font-body text-muted-foreground">Please log in to view this report</p>
          </div>
        </div>
      </StandaloneReportLayout>
    );
  }

  if (error || !reportData) {
    notFound();
  }

  const automationName = (reportData.meta as { automation_name?: string }).automation_name;
  const allSections = getSectionsForReport(automationName, reportData);

  // Use automation_name for header config, fall back to workflowName
  const headerConfig = getHeaderConfigForWorkflow(automationName || workflowName || null);

  return (
    <StandaloneReportLayout sections={allSections}>
      <ReportHeader
        title={reportData.meta.input?.niche_name ?? ""}
        geo={reportData.meta.input?.geography ?? "—"}
        generatedAt={reportData.meta.generated_at}
        confidence={reportData.meta.confidence}
        headerConfig={headerConfig}
        reportIdOrRunId={id}
        runInput={runInput ?? undefined}
        reportMeta={reportData.meta}
      />

      <ReportRouter workflowName={workflowName ?? null} reportData={reportData} reportId={id} />

      <footer className="mt-16 pt-8 text-center border-t border-border">
        <p className="text-sm font-body text-muted-foreground">
          Generated on {reportData.meta.generated_at} • Confidence:{" "}
          {reportData.meta.confidence <= 1
            ? `${(reportData.meta.confidence * 100).toFixed(0)}%`
            : `${Math.round(reportData.meta.confidence)}%`}
        </p>
        <p className="mt-2 text-xs font-body text-muted-foreground/60">
          {headerConfig.reportTypeLabel} • {headerConfig.modeLabel}
        </p>
      </footer>
    </StandaloneReportLayout>
  );
}
