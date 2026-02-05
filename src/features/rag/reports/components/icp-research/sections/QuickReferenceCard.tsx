"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faDollarSign,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper, StatCard, BlockHeader, ContentCard, InsightList } from "../../shared";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

interface QuickReferenceCardProps {
  data: ReportData;
  reportId?: string;
}

export const QuickReferenceCard = ({ data }: QuickReferenceCardProps) => {
  const buyerIcp = (data.data as { buyer_icp?: { snapshot?: { primary_profile?: { company_size?: string; revenue_range?: string; budget_for_solution?: string; growth_stage?: string } }; triggers?: { disqualifying_signals?: Array<{ signal: string }> }; segments?: { primary?: Array<{ name?: string; description?: string }> } } })?.buyer_icp;
  if (!buyerIcp?.snapshot?.primary_profile) {
    return (
      <SectionWrapper id="quick-reference" number="00" title="Quick Reference" subtitle="Company size, top disqualifiers, primary segment at a glance">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }
  const snapshot = buyerIcp.snapshot!;
  const profile = snapshot.primary_profile!;
  const triggers = (buyerIcp as { triggers?: { disqualifying_signals?: Array<{ signal: string }> } }).triggers;
  const segments = buyerIcp.segments;
  const topDisqualifiers = (triggers?.disqualifying_signals ?? []).slice(0, 3);
  const primarySegment = segments?.primary?.[0] as { name?: string; description?: string } | undefined;
  const timeline = profile.growth_stage?.split(" - ")[0] ?? "—";

  return (
    <SectionWrapper
      id="quick-reference"
      number="00"
      title="Quick Reference"
      subtitle="Company size, top disqualifiers, primary segment at a glance"
    >
      <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Company size"
              value={profile.company_size ?? "—"}
              icon={<FontAwesomeIcon icon={faBuilding} className="w-5 h-5" />}
            />
            <StatCard
              label="Revenue"
              value={profile.revenue_range ?? "—"}
              icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
            />
            <StatCard
              label="Budget"
              value={profile.budget_for_solution ?? "—"}
              icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
            />
            <StatCard
              label="Timeline"
              value={timeline}
              icon={<FontAwesomeIcon icon={faClock} className="w-5 h-5" />}
            />
          </div>

          {topDisqualifiers.length > 0 && (
            <div>
              <BlockHeader variant="label" title="Top 3 disqualifiers" />
              <InsightList
                items={topDisqualifiers.map((d) => d.signal)}
                type="danger"
                numbered
              />
            </div>
          )}

          {primarySegment && (
            <div>
              <BlockHeader variant="label" title="Primary segment at a glance" />
              <ContentCard
                variant="accent"
                style="summary"
                title={primarySegment.name}
                icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-accent" />}
              >
                <p className="text-xs font-body text-muted-foreground line-clamp-3">
                  {primarySegment.description}
                </p>
              </ContentCard>
            </div>
          )}
      </div>
    </SectionWrapper>
  );
};
