import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { InsightList } from "../InsightList";
import { DataTable } from "../DataTable";
import { Users, Clock, DollarSign, Zap } from "lucide-react";
import { reportData } from "@/data/reportData";

export const BuyerPsychologySection = () => {
  const buyer = reportData.data.buyer_psychology;

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
      {/* Key Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Budget Signal"
          value={budgetLabels[buyer.budget_signal] || buyer.budget_signal}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          label="Urgency Level"
          value="High"
          icon={<Zap className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Sales Cycle"
          value="1-2 Months"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Confidence"
          value={`${(buyer.confidence * 100).toFixed(0)}%`}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Decision Makers */}
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
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-sm font-body font-medium text-foreground">
                {role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Buying Triggers & Objections */}
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

      {/* Sales Cycle Notes */}
      <div className="bg-primary rounded-xl p-6">
        <h4 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body mb-2">
          Sales Cycle Notes
        </h4>
        <p className="text-base font-body text-primary-foreground leading-relaxed">
          {buyer.sales_cycle_notes}
        </p>
      </div>
    </SectionWrapper>
  );
};
