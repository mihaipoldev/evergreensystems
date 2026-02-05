import { notFound } from "next/navigation";
import { ReportHeader } from "@/features/rag/reports/components/layout/ReportHeader";
import { getHeaderConfigForWorkflow } from "@/features/rag/reports/components/layout/ReportHeaderConfig";
import { StandaloneReportLayout } from "@/features/rag/reports/components/layout/StandaloneReportLayout";
import { ReportRouter } from "@/features/rag/reports/components/ReportRouter";
import { getReportData } from "@/features/rag/reports/data/getReportData";

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
  { id: "buyer-psychology", number: "02", title: "Buyer Psychology" },
  { id: "value-dynamics", number: "03", title: "Value Dynamics" },
  { id: "lead-gen-strategy", number: "04", title: "Lead Gen Strategy" },
  { id: "targeting-strategy", number: "05", title: "Targeting Strategy" },
  { id: "offer-angles", number: "06", title: "Offer Angles" },
  { id: "outbound-approach", number: "07", title: "Outbound Approach" },
  { id: "positioning-intel", number: "08", title: "Positioning Intel" },
  { id: "messaging-inputs", number: "09", title: "Messaging Inputs" },
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

const NICHE_EVALUATION_SECTIONS = [
  { id: "executive-summary", number: "01", title: "Executive Summary" },
  { id: "agent-consensus", number: "02", title: "Agent Consensus" },
  { id: "meta-synthesis", number: "03", title: "Meta Synthesis Deep Dive" },
  { id: "quantitative-summary", number: "04", title: "Quantitative Summary" },
  { id: "individual-evaluations", number: "05", title: "Individual Agent Evaluations" },
  { id: "research-sources", number: "06", title: "Research Sources" },
];

const LEGACY_NICHE_EVALUATION_SECTIONS = [
  { id: "synthesis", number: "01", title: "Synthesis" },
  { id: "concerns-opportunities", number: "02", title: "Concerns & Opportunities" },
  { id: "individual-scores", number: "03", title: "Individual Model Scores" },
  { id: "research-sources", number: "04", title: "Research Sources" },
];

function getNicheEvaluationSections(data: { data: unknown }): typeof NICHE_EVALUATION_SECTIONS {
  const dataAny = data.data as Record<string, unknown>;
  const payload = Array.isArray(dataAny) ? (dataAny as unknown[])[0] : dataAny;
  const p = payload as Record<string, unknown> | null;
  const isNewFormat = !!(
    p?.decision_card ??
    p?.meta_synthesis ??
    p?.individual_evaluations
  );
  return isNewFormat ? NICHE_EVALUATION_SECTIONS : LEGACY_NICHE_EVALUATION_SECTIONS;
}

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StandaloneReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const { data: reportData, error, workflowName, runInput } = await getReportData(id);

  if (error === "Unauthorized") {
    return (
      <StandaloneReportLayout sections={sections}>
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

  const isOutbound = workflowName === "outbound_strategy" || workflowName === "lead_gen_targeting";
  const isDescriptive = workflowName === "descriptive_intelligence" || (reportData.data as Record<string, unknown>)?.basic_profile != null;
  const isNicheEvaluation = workflowName === "niche_fit_evaluation";
  const baseSections =
    isNicheEvaluation
      ? getNicheEvaluationSections(reportData)
      : workflowName === "icp_research"
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
  } else if (workflowName !== "icp_research" && !isNicheEvaluation) {
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

  const headerConfig = getHeaderConfigForWorkflow(workflowName ?? null);

  return (
    <StandaloneReportLayout sections={allSections}>
      <ReportHeader
        title={reportData.meta.input.niche_name}
        geo={reportData.meta.input.geo}
        generatedAt={reportData.meta.generated_at}
        confidence={reportData.meta.confidence}
        headerConfig={headerConfig}
        runInput={runInput ?? undefined}
        usageMetrics={reportData.meta.usage_metrics}
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
