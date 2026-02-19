"use client";

import {
  SectionWrapper,
  StatCard,
  BlockHeader,
  InsightList,
  ContentCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faBolt,
  faClock,
  faUsers,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";

type DecisionMaker = {
  role?: string;
  influence?: string;
  what_they_care_about?: string;
};

type BuyerPsychology = {
  description?: string;
  budget_signal?: string;
  urgency_level?: string;
  buying_triggers?: string[];
  decision_makers?: (DecisionMaker | string)[];
  sales_cycle_notes?: string;
};

interface BuyerPsychologySectionProps {
  buyerPsychology: BuyerPsychology;
  sectionNumber?: string;
}

const budgetLabels: Record<string, string> = {
  low: "$1k - $5k",
  medium: "$5k - $50k",
  high: "$50k+",
};

export const BuyerPsychologySection = ({
  buyerPsychology,
  sectionNumber = "09",
}: BuyerPsychologySectionProps) => {
  const decisionMakers = buyerPsychology?.decision_makers ?? [];
  const buyingTriggers = buyerPsychology?.buying_triggers ?? [];
  const budgetSignal = buyerPsychology?.budget_signal ?? "";
  const urgencyLevel = buyerPsychology?.urgency_level ?? "";

  return (
    <SectionWrapper
      id="buyer-psychology"
      number={sectionNumber}
      title="Buyer Psychology"
      subtitle={buyerPsychology?.description || undefined}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Budget Signal"
          value={budgetLabels[budgetSignal] || budgetSignal || "—"}
          icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
        />
        <StatCard
          label="Urgency Level"
          value={urgencyLevel || "—"}
          icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Sales Cycle"
          value="1-3 Months"
          icon={<FontAwesomeIcon icon={faClock} className="w-5 h-5" />}
        />
        <StatCard
          label="Decision Makers"
          value={`${decisionMakers.length} roles`}
          icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5" />}
        />
      </div>

      {decisionMakers.length > 0 && (
        <div className="mb-8">
          <BlockHeader
            variant="title"
            title="Decision Makers"
            icon={<FontAwesomeIcon icon={faUserTie} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-4">
            {decisionMakers.map((dm, index) => {
              if (typeof dm === "string") {
                return (
                  <div key={index} className="bg-card rounded-xl border border-border report-shadow p-6">
                    <p className="text-sm font-body text-foreground">{dm}</p>
                  </div>
                );
              }
              return (
                <div
                  key={index}
                  className="bg-card rounded-xl border border-border report-shadow p-6"
                >
                  <h4 className="font-display font-semibold text-foreground mb-2">
                    {dm.role}
                  </h4>
                  {dm.influence && (
                    <p className="text-sm text-muted-foreground font-body mb-3">
                      <span className="font-medium text-foreground">Influence:</span> {dm.influence}
                    </p>
                  )}
                  {dm.what_they_care_about && (
                    <p className="text-sm font-body text-foreground">
                      <span className="font-medium text-muted-foreground">What they care about:</span>{" "}
                      {dm.what_they_care_about}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {buyingTriggers.length > 0 && (
        <div className="mb-8">
          <BlockHeader variant="title" title="Buying Triggers" />
          <InsightList items={buyingTriggers} type="target" numbered />
        </div>
      )}

      {buyerPsychology?.sales_cycle_notes && (
        <ContentCard variant="primary" title="Sales Cycle Notes">
          <p className="text-sm font-body text-primary-foreground leading-relaxed">
            {buyerPsychology.sales_cycle_notes}
          </p>
        </ContentCard>
      )}
    </SectionWrapper>
  );
};
