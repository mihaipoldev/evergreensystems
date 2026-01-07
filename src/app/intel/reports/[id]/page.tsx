import { notFound } from "next/navigation";
import { ReportHeader } from "@/features/rag/reports/components/layout/ReportHeader";
import { ReportLayout } from "@/features/rag/reports/components/layout/ReportLayout";
import { NicheReport } from "@/features/rag/reports/components/niche/NicheReport";
import { getReportData } from "@/features/rag/reports/data/getReportData";

const sections = [
  { id: "niche-profile", number: "01", title: "Niche Profile" },
  { id: "buyer-psychology", number: "02", title: "Buyer Psychology" },
  { id: "value-dynamics", number: "03", title: "Value Dynamics" },
  { id: "lead-gen-strategy", number: "04", title: "Lead Gen Strategy" },
  { id: "targeting-strategy", number: "05", title: "Targeting Strategy" },
  { id: "offer-angles", number: "06", title: "Offer Angles" },
  { id: "outbound-approach", number: "07", title: "Outbound Approach" },
  { id: "positioning-intel", number: "08", title: "Positioning Intel" },
  { id: "messaging-inputs", number: "09", title: "Messaging Inputs" },
];

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const { data: reportData, error } = await getReportData(id);

  if (error === "Unauthorized") {
    return (
      <ReportLayout sections={sections} showTableOfContents={false} reportId={id}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive font-body text-lg mb-2">Unauthorized</p>
            <p className="text-muted-foreground font-body">Please log in to view this report</p>
          </div>
        </div>
      </ReportLayout>
    );
  }

  if (error || !reportData) {
    notFound();
  }

  // Build sections array dynamically to include research_links if present
  const allSections = reportData.data.research_links
    ? [...sections, { id: "research-links", number: "10", title: "Research Links" }]
    : sections;

  return (
    <ReportLayout sections={allSections} showTableOfContents={false} reportId={id}>
      <ReportHeader
        nicheName={reportData.meta.input.niche_name}
        geo={reportData.meta.input.geo}
        generatedAt={reportData.meta.generated_at}
        confidence={reportData.meta.confidence}
      />

      <NicheReport data={reportData} reportId={id} />
          
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground font-body">
          Generated on {reportData.meta.generated_at} • Confidence:{" "}
          {(reportData.meta.confidence * 100).toFixed(0)}%
        </p>
        <p className="text-xs text-muted-foreground/60 font-body mt-2">
          Niche Intelligence Report • Lead Generation Targeting Mode
        </p>
      </footer>
    </ReportLayout>
  );
}
