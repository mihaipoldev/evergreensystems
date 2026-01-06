import { SectionWrapper } from "../../shared/SectionWrapper";
import { InsightList } from "../../shared/InsightList";
import { TagCloud } from "../../shared/TagCloud";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faBullseye,
  faArrowTrendUp,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface ValueDynamicsSectionProps {
  value: ReportData["data"]["value_dynamics"];
}

export const ValueDynamicsSection = ({ value }: ValueDynamicsSectionProps) => {
  return (
    <SectionWrapper
      id="value-dynamics"
      number="03"
      title="Value Dynamics"
      subtitle="Core pain points, desired outcomes, KPIs, and proof requirements"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-destructive" />
            Core Pain Points
          </h4>
          <InsightList items={value.core_pain_points} type="warning" numbered />
        </div>
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />
            Desired Outcomes
          </h4>
          <InsightList items={value.desired_outcomes} type="success" numbered />
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5 text-accent" />
          KPIs That Matter
        </h4>
        {value.kpis_that_matter_description && (
          <p className="text-sm text-muted-foreground font-body mb-4">
            {value.kpis_that_matter_description}
          </p>
        )}
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

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600 dark:text-green-400" />
          Must-Have Proof
        </h4>
        {value.must_have_proof_description && (
          <p className="text-sm text-muted-foreground font-body mb-4">
            {value.must_have_proof_description}
          </p>
        )}
        <InsightList items={value.must_have_proof} type="success" />
      </div>

      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Constraints & Risks
        </h4>
        <TagCloud tags={value.constraints_and_risks} variant="outline" />
      </div>
    </SectionWrapper>
  );
};

