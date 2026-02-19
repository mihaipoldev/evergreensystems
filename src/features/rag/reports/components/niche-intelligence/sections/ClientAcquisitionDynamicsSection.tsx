"use client";

import {
  SectionWrapper,
  KeyValueBlock,
  BlockHeader,
  StatCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faUsers } from "@fortawesome/free-solid-svg-icons";

interface ClientAcquisitionDynamics {
  how_they_currently_get_clients?: string[];
  competitive_intensity?: string;
  typical_sales_approach?: string;
}

interface ClientAcquisitionDynamicsSectionProps {
  data: ClientAcquisitionDynamics;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const ClientAcquisitionDynamicsSection = ({
  data,
  sectionNumber = "06",
}: ClientAcquisitionDynamicsSectionProps) => {
  return (
    <SectionWrapper
      id="client-acquisition-dynamics"
      number={sectionNumber}
      title="Client Acquisition Dynamics"
      subtitle="How they get clients and typical sales approach"
    >
      <div className="space-y-8">
        {data.competitive_intensity && (
          <StatCard
            label="Competitive Intensity"
            value={getText(data.competitive_intensity, "—")}
            icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5" />}
            variant="highlight"
          />
        )}

        {data.how_they_currently_get_clients && data.how_they_currently_get_clients.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="How They Currently Get Clients"
              icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-2 mt-4">
              {data.how_they_currently_get_clients.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-muted-foreground tabular-nums flex-shrink-0">
                    {index + 1}.
                  </span>
                  <p className="text-sm font-body text-foreground leading-snug">
                    {getText(item, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.typical_sales_approach && (
          <KeyValueBlock
            label="Typical Sales Approach"
            value={getText(data.typical_sales_approach, "—")}
          />
        )}
      </div>
    </SectionWrapper>
  );
};
