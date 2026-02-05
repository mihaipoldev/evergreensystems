"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faDollarSign,
  faChartLine,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import {
  SectionWrapper,
  StatCard,
  BlockHeader,
  ContentCard,
  InsightList,
} from "../../shared";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

interface ICPSnapshotSectionProps {
  data: ReportData;
}

export const ICPSnapshotSection = ({ data }: ICPSnapshotSectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: { snapshot?: { summary?: string; primary_profile?: Record<string, unknown>; firmographic_alignment_notes?: { explanation?: string; implications?: string[]; recommendation?: string } } } })?.buyer_icp;
  const snapshot = buyerIcp?.snapshot;
  const profile = snapshot?.primary_profile as { company_size?: string; revenue_range?: string; budget_for_solution?: string; growth_stage?: string; technical_maturity?: string } | undefined;
  if (!snapshot) {
    return (
      <SectionWrapper id="icp-overview" number="01" title="ICP Overview" subtitle="Full ICP description, firmographic alignment, technical maturity">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="icp-overview"
      number="01"
      title="ICP Overview"
      subtitle="Full ICP description, firmographic alignment, technical maturity"
    >
      <div className="mb-8">
        <ContentCard variant="muted">
          <p className="text-base font-body text-foreground leading-relaxed whitespace-pre-line">
            {snapshot.summary ?? "—"}
          </p>
        </ContentCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Company Size"
          value={profile?.company_size ?? "—"}
          icon={<FontAwesomeIcon icon={faBuilding} className="w-5 h-5" />}
        />
        <StatCard
          label="Revenue Range"
          value={profile?.revenue_range ?? "—"}
          icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Budget for Solution"
          value={profile?.budget_for_solution ?? "—"}
          icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
        />
        <StatCard
          label="Growth Stage"
          value={profile?.growth_stage?.split(" - ")[0] ?? "—"}
          description={profile?.growth_stage?.split(" - ")[1]}
          icon={<FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />}
        />
      </div>

      <div className="mb-8">
        <ContentCard
          variant="accent"
          style="summary"
          title="Technical Maturity"
          icon={<FontAwesomeIcon icon={faMicrochip} className="w-5 h-5 text-accent" />}
        >
          <p className="text-sm font-body text-foreground leading-relaxed">
            {profile?.technical_maturity ?? "—"}
          </p>
        </ContentCard>
      </div>

      <div className="mb-8">
        <BlockHeader
          variant="title"
          title="Firmographic Alignment"
          icon={<FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-accent" />}
          subtitle="How employee count and revenue align with budget and qualification"
        />
        <p className="text-sm font-body text-foreground leading-relaxed mb-4">
          {snapshot.firmographic_alignment_notes?.explanation ?? "—"}
        </p>
        <InsightList
          items={snapshot.firmographic_alignment_notes?.implications ?? []}
          type="default"
          numbered
        />
      </div>

      <div className="mb-8">
        <ContentCard
          variant="default"
          style="summary"
          title="Qualification Recommendation"
        >
          <p className="text-sm font-body text-foreground leading-relaxed">
            {snapshot.firmographic_alignment_notes?.recommendation ?? "—"}
          </p>
        </ContentCard>
      </div>
    </SectionWrapper>
  );
};
