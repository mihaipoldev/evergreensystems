"use client";

import {
  SectionWrapper,
  BlockHeader,
  ContentCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faShieldHalved,
  faDollarSign,
  faChartLine,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

type PilotDeliverable = {
  monthly_contacts?: string;
  qualification_criteria?: string[];
  delivery_method?: string;
};

type PilotInvestment = {
  monthly_fee?: string;
  setup_fee?: string;
  total_pilot_investment?: string;
};

type Pilot = {
  description?: string;
  duration?: string;
  deliverable?: PilotDeliverable;
  investment?: PilotInvestment;
  success_metrics?: string[];
  guarantee_summary?: string;
  ongoing_terms?: string;
};

interface PilotSectionProps {
  pilot: Pilot;
  sectionNumber?: string;
}

export const PilotSection = ({
  pilot,
  sectionNumber = "14",
}: PilotSectionProps) => {
  const successMetrics = pilot?.success_metrics ?? [];
  const qualCriteria = pilot?.deliverable?.qualification_criteria ?? [];

  return (
    <SectionWrapper
      id="pilot"
      number={sectionNumber}
      title="Pilot Structure"
      subtitle={pilot?.description || undefined}
    >
      {pilot?.duration && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground font-body">
          <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
          Duration: {pilot.duration}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {pilot?.investment && (
          <ContentCard
            variant="accent"
            title="Investment"
            icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
          >
            <ul className="space-y-2">
              {pilot.investment.monthly_fee && (
                <li className="text-sm">
                  <span className="font-medium text-foreground">Monthly fee:</span>{" "}
                  {pilot.investment.monthly_fee}
                </li>
              )}
              {pilot.investment.setup_fee && (
                <li className="text-sm">
                  <span className="font-medium text-foreground">Setup fee:</span>{" "}
                  {pilot.investment.setup_fee}
                </li>
              )}
              {pilot.investment.total_pilot_investment && (
                <li className="text-sm">
                  <span className="font-medium text-foreground">Total pilot investment:</span>{" "}
                  {pilot.investment.total_pilot_investment}
                </li>
              )}
            </ul>
          </ContentCard>
        )}

        {pilot?.deliverable && (
          <ContentCard title="Deliverable">
            <ul className="space-y-2">
              {pilot.deliverable.monthly_contacts && (
                <li className="text-sm">
                  <span className="font-medium text-foreground">Monthly contacts:</span>{" "}
                  {pilot.deliverable.monthly_contacts}
                </li>
              )}
              {pilot.deliverable.delivery_method && (
                <li className="text-sm">
                  <span className="font-medium text-foreground">Delivery method:</span>{" "}
                  {pilot.deliverable.delivery_method}
                </li>
              )}
            </ul>
          </ContentCard>
        )}
      </div>

      {qualCriteria.length > 0 && (
        <div className="mb-8">
          <BlockHeader variant="title" title="Qualification Criteria" />
          <ul className="space-y-2">
            {qualCriteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground p-3 rounded-lg bg-muted/30 border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {successMetrics.length > 0 && (
        <div className="mb-8">
          <BlockHeader variant="title" title="Success Metrics" />
          <ul className="space-y-2">
            {successMetrics.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground p-3 rounded-lg bg-muted/30 border border-border">
                <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pilot?.guarantee_summary && (
        <div className="mb-8">
          <ContentCard
            variant="green"
            title="Guarantee"
            icon={<FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />}
          >
            <p className="text-sm font-body text-foreground leading-relaxed">
              {pilot.guarantee_summary}
            </p>
          </ContentCard>
        </div>
      )}

      {pilot?.ongoing_terms && (
        <ContentCard variant="primary" title="Ongoing Terms">
          <p className="text-sm font-body text-primary-foreground leading-relaxed">
            {pilot.ongoing_terms}
          </p>
        </ContentCard>
      )}
    </SectionWrapper>
  );
};
