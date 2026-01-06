import { SectionWrapper } from "../SectionWrapper";
import { InsightList } from "../InsightList";
import { TagCloud } from "../TagCloud";
import { reportData } from "@/data/reportData";
import { Target, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";

export const ValueDynamicsSection = () => {
  const value = reportData.data.value_dynamics;

  return (
    <SectionWrapper
      id="value-dynamics"
      number="03"
      title="Value Dynamics"
      subtitle="Core pain points, desired outcomes, KPIs, and proof requirements"
    >
      {/* Pain Points & Desired Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Core Pain Points
          </h4>
          <InsightList items={value.core_pain_points} type="warning" numbered />
        </div>
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Desired Outcomes
          </h4>
          <InsightList items={value.desired_outcomes} type="success" numbered />
        </div>
      </div>

      {/* KPIs That Matter */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          KPIs That Matter
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {value.kpis_that_matter.map((kpi, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-4 border border-border text-center report-shadow hover:border-accent transition-colors"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-semibold text-sm">
                {index + 1}
              </div>
              <p className="text-sm font-body font-medium text-foreground">
                {kpi}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Must-Have Proof */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Must-Have Proof
        </h4>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-muted-foreground font-body mb-4">
            Evidence they expect before trusting a lead gen provider:
          </p>
          <InsightList items={value.must_have_proof} type="success" />
        </div>
      </div>

      {/* Constraints & Risks */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Constraints & Risks
        </h4>
        <TagCloud tags={value.constraints_and_risks} variant="outline" />
      </div>
    </SectionWrapper>
  );
};
