"use client";

import { SectionWrapper, BlockHeader } from "../../shared";
import {
  TitlePacksContent,
  MessagingContent,
  QualificationContent,
} from "./OpsOutputsSection";
import type { ReportData } from "../../../types";

type OpsOutputsShape = {
  title_packs?: unknown;
  messaging_map?: unknown;
  qualification_criteria?: unknown;
  enrichment_checklist?: unknown;
  sales_handoff_template?: unknown;
  monitoring_alerts?: unknown;
  market_sizing?: unknown;
};

const NO_DATA = "No data";

interface TacticalPlaybooksSectionProps {
  data: ReportData;
}

export const TacticalPlaybooksSection = ({ data }: TacticalPlaybooksSectionProps) => {
  const ops = (data.data as { ops_outputs?: OpsOutputsShape }).ops_outputs;

  if (!ops) {
    return (
      <SectionWrapper id="tactical-playbooks" number="07" title="Tactical Playbooks" subtitle="Title packs, messaging frameworks, and qualification scripts for execution">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="tactical-playbooks"
      number="07"
      title="Tactical Playbooks"
      subtitle="Title packs, messaging frameworks, and qualification scripts for execution"
    >
      <div className="space-y-12">
        {ops.title_packs ? (
          <div>
            <BlockHeader variant="title" title="Title Packs" />
            <TitlePacksContent titles={ops.title_packs} />
          </div>
        ) : null}
        {ops.messaging_map ? (
          <div>
            <BlockHeader variant="title" title="Messaging Frameworks" />
            <MessagingContent messaging={ops.messaging_map} />
          </div>
        ) : null}
        {(ops.qualification_criteria || ops.enrichment_checklist) ? (
          <div>
            <BlockHeader variant="title" title="Qualification Scripts" />
            <QualificationContent
              criteria={ops.qualification_criteria ?? { a_grade: {}, b_grade: {}, c_grade: {}, disqualify: {} }}
              enrichment={ops.enrichment_checklist ?? { enrichment_sequence: [] }}
              handoff={ops.sales_handoff_template}
              monitoring={ops.monitoring_alerts}
              sizing={ops.market_sizing ?? {
                description: "",
                estimates: {
                  total_matching_firmographics: { range: "—" },
                  with_relevant_technology: { range: "—" },
                  with_active_trigger: { range: "—" },
                  immediately_addressable: { range: "—" },
                },
              }}
            />
          </div>
        ) : null}
      </div>
    </SectionWrapper>
  );
};
