import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { InsightList } from "../../shared/InsightList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faBolt,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface BuyerPsychologySectionProps {
  buyer: ReportData["data"]["buyer_psychology"];
}

export const BuyerPsychologySection = ({ buyer }: BuyerPsychologySectionProps) => {
  const budgetLabels: Record<string, string> = {
    low: "$1k - $5k",
    medium: "$5k - $50k",
    high: "$50k+",
  };

  return (
    <SectionWrapper
      id="buyer-psychology"
      number="02"
      title="Buyer Psychology"
      subtitle="Decision-making dynamics, triggers, objections, and sales cycle insights"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Budget Signal"
          value={budgetLabels[buyer.budget_signal] || buyer.budget_signal}
          icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
        />
        <StatCard
          label="Urgency Level"
          value={buyer.urgency_level || "Unknown"}
          icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Sales Cycle"
          value="1-2 Months"
          icon={<FontAwesomeIcon icon={faClock} className="w-5 h-5" />}
        />
        <StatCard
          label="Confidence"
          value={`${(buyer.confidence * 100).toFixed(0)}%`}
          icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5" />}
        />
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Key Decision Makers
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {buyer.decision_makers.map((role, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-4 border border-border text-center report-shadow"
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-sm font-body font-medium text-foreground">
                {typeof role === "string"
                  ? role
                  : (role as any)?.name || (role as any)?.value || (role as any)?.text || (role as any)?.label || String(role)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4">
            Buying Triggers
          </h4>
          <InsightList items={buyer.buying_triggers} type="target" numbered />
        </div>
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4">
            Common Objections
          </h4>
          <InsightList items={buyer.common_objections} type="warning" />
        </div>
      </div>

      <div className="bg-primary rounded-xl p-6">
        <h4 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body mb-2">
          Sales Cycle Notes
        </h4>
        <p className="text-base font-body text-primary-foreground leading-relaxed">
          {typeof buyer.sales_cycle_notes === "string"
            ? buyer.sales_cycle_notes
            : (buyer.sales_cycle_notes as any)?.value ||
              (buyer.sales_cycle_notes as any)?.text ||
              (buyer.sales_cycle_notes as any)?.description ||
              (buyer.sales_cycle_notes as any)?.notes ||
              String(buyer.sales_cycle_notes || "No notes available")}
        </p>
      </div>
    </SectionWrapper>
  );
};

