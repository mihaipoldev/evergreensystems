import { notFound } from "next/navigation";
import { ReportLayout } from "@/features/rag/reports/components/layout/ReportLayout";
import { getReportData } from "@/features/rag/reports/data/getReportData";
import { ReportResultClient } from "./ReportResultClient";

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

type RunResultPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunResultPage({ params }: RunResultPageProps) {
  const { id } = await params; // This is the run_id
  const { data: reportData, error, workflowName, workflowLabel, projectName } = await getReportData(id); // getReportData already supports run_id lookup

  if (error === "Unauthorized") {
    return (
      <ReportLayout sections={sections} showTableOfContents={false} reportId={id}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive font-body text-lg mb-2">Unauthorized</p>
            <p className="text-muted-foreground font-body">Please log in to view this result</p>
          </div>
        </div>
      </ReportLayout>
    );
  }

  if (error || !reportData) {
    notFound();
  }

  return (
    <ReportResultClient 
      initialReportData={reportData} 
      runId={id}
      workflowName={workflowName}
      workflowLabel={workflowLabel}
      projectName={projectName}
    />
  );
}

