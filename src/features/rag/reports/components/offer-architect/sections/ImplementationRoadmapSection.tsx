"use client";

import {
  SectionWrapper,
  InsightList,
  DataTable,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faFlag,
  faMapSigns,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface ImplementationRoadmapSectionProps {
  data: NonNullable<OfferArchitectData["implementation_roadmap"]>;
  sectionNumber?: string;
}

const PhaseTable = ({
  actions,
  title,
  phaseNumber,
}: {
  actions: { action?: string; timeline?: string; owner?: string }[];
  title: string;
  phaseNumber: number;
}) => {
  if (!actions || actions.length === 0) return null;
  return (
    <div>
      <BlockHeader
        variant="title"
        title={title}
        icon={
          <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-semibold text-xs">
            {phaseNumber}
          </span>
        }
      />
      <DataTable
        headers={["Action", "Timeline", "Owner"]}
        rows={actions.map((a) => [
          a.action || "—",
          a.timeline || "—",
          a.owner || "—",
        ])}
      />
    </div>
  );
};

export const ImplementationRoadmapSection = ({
  data,
  sectionNumber = "14",
}: ImplementationRoadmapSectionProps) => {
  return (
    <SectionWrapper
      id="implementation-roadmap"
      number={sectionNumber}
      title="Implementation Roadmap"
      subtitle="Phased action plan with quick wins and ownership"
    >
      <div className="space-y-8">
        {/* Quick Wins — prominent placement */}
        {data.quick_wins && data.quick_wins.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Quick Wins"
              icon={<FontAwesomeIcon icon={faRocket} className="w-5 h-5 text-green-500" />}
              subtitle="Immediate actions that show fast progress"
            />
            <InsightList items={data.quick_wins} type="success" />
          </div>
        )}

        {/* Phase 1 */}
        <PhaseTable
          actions={data.phase_1_actions || []}
          title="Phase 1"
          phaseNumber={1}
        />

        {/* Phase 2 */}
        <PhaseTable
          actions={data.phase_2_actions || []}
          title="Phase 2"
          phaseNumber={2}
        />

        {/* Phase 3 */}
        <PhaseTable
          actions={data.phase_3_actions || []}
          title="Phase 3"
          phaseNumber={3}
        />
      </div>
    </SectionWrapper>
  );
};
