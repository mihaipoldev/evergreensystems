import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { DataTable } from "../../shared/DataTable";
import { InsightList } from "../../shared/InsightList";
import { TagCloud } from "../../shared/TagCloud";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faUsers,
  faBox,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface NicheProfileSectionProps {
  profile: ReportData["data"]["niche_profile"];
}

export const NicheProfileSection = ({ profile }: NicheProfileSectionProps) => {
  return (
    <SectionWrapper
      id="niche-profile"
      number="01"
      title="Niche Profile"
      subtitle="Market overview, service offerings, and competitive landscape analysis"
    >
      <div className="bg-secondary/50 rounded-xl p-6 mb-8 border border-border">
        <p className="text-base font-body text-foreground leading-relaxed">
          {typeof profile.summary === "string"
            ? profile.summary
            : (profile.summary as any)?.value ||
              (profile.summary as any)?.text ||
              (profile.summary as any)?.description ||
              (profile.summary as any)?.summary ||
              String(profile.summary || "No summary available")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Category"
          value={profile.category}
          icon={<FontAwesomeIcon icon={faBox} className="w-5 h-5" />}
        />
        <StatCard
          label="Market Maturity"
          value={profile.market_maturity || "Unknown"}
          icon={<FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Competitive Intensity"
          value={profile.client_acquisition_dynamics.competitive_intensity || "Unknown"}
          icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-4">
            Common Service Lines
          </h4>
          <TagCloud tags={profile.common_service_lines} variant="gold" />
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-4">
            Typical Customer Types
          </h4>
          <TagCloud tags={profile.typical_customer_types} />
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Client Acquisition Dynamics
        </h4>
        <DataTable
          headers={["Current Acquisition Methods", "Operational Tools in Use"]}
          rows={profile.client_acquisition_dynamics.how_they_currently_get_clients.map(
            (method, i) => [
              method,
              profile.existing_solutions.operational_tools[i] || "—",
            ]
          )}
        />
        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <p className="text-sm font-body text-muted-foreground">
            <strong className="text-foreground">Typical Sales Approach:</strong>{" "}
            {typeof profile.client_acquisition_dynamics.typical_sales_approach === "string"
              ? profile.client_acquisition_dynamics.typical_sales_approach
              : (profile.client_acquisition_dynamics.typical_sales_approach as any)?.value ||
                (profile.client_acquisition_dynamics.typical_sales_approach as any)?.text ||
                (profile.client_acquisition_dynamics.typical_sales_approach as any)?.description ||
                String(profile.client_acquisition_dynamics.typical_sales_approach || "Unknown")}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Lead Generation Seasonality
        </h4>
        <div className="bg-accent/10 rounded-lg p-5 border border-accent/20">
          <p className="text-sm font-body text-foreground">
            {typeof profile.lead_gen_seasonality === "string"
              ? profile.lead_gen_seasonality
              : (profile.lead_gen_seasonality as any)?.value ||
                (profile.lead_gen_seasonality as any)?.text ||
                (profile.lead_gen_seasonality as any)?.description ||
                String(profile.lead_gen_seasonality || "Unknown")}
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-amber-500" />
          Lead Generation Risks
        </h4>
        <InsightList items={profile.lead_gen_risks} type="warning" />
      </div>
    </SectionWrapper>
  );
};

