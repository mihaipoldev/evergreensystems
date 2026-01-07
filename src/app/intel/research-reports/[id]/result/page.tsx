import { notFound } from "next/navigation";
import { ReportHeader } from "@/features/rag/reports/components/layout/ReportHeader";
import { ReportLayout } from "@/features/rag/reports/components/layout/ReportLayout";
import { NicheReport } from "@/features/rag/reports/components/niche/NicheReport";
import { getReportData } from "@/features/rag/reports/data/getReportData";

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
  const { data: reportData, error } = await getReportData(id); // getReportData already supports run_id lookup

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

  // Build sections array dynamically to include research_links if present
  const allSections = reportData.data.research_links
    ? [...sections, { id: "research-links", number: "11", title: "Research Links" }]
    : sections;

  // Extract focus and market_value from meta (they may not be in the TypeScript type)
  const metaAny = reportData.meta as any;
  const focus = metaAny?.focus;
  const marketValue = metaAny?.market_value;
  
  // Extract TAM from niche_profile.tam_analysis
  const nicheProfileAny = reportData.data.niche_profile as any;
  const tam = nicheProfileAny?.tam_analysis?.total_companies_in_geography;

  return (
    <ReportLayout sections={allSections} showTableOfContents={false} reportId={id}>
      <div className="-mx-6 dark:-mx-0 rounded-2xl border border-border/60 bg-white px-6 py-8 shadow-sm dark:border-transparent dark:bg-transparent dark:shadow-none dark:px-0 dark:py-0 print:border-transparent print:shadow-none">
        <ReportHeader
          nicheName={reportData.meta.input.niche_name}
          geo={reportData.meta.input.geo}
          generatedAt={reportData.meta.generated_at}
          confidence={reportData.meta.confidence}
          focus={focus}
          marketValue={marketValue}
          tam={tam ? String(tam) : undefined}
          leadGenFitScore={reportData.data.lead_gen_strategy?.lead_gen_fit_score}
          verdict={reportData.data.lead_gen_strategy?.verdict as "pursue" | "test" | "avoid" | undefined}
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
      </div>
    </ReportLayout>
  );
}

