import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { DataTable } from "../DataTable";
import { InsightList } from "../InsightList";
import { TagCloud } from "../TagCloud";
import { TrendingUp, Users, Package, AlertTriangle } from "lucide-react";
import { reportData } from "@/data/reportData";

export const NicheProfileSection = () => {
  const profile = reportData.data.niche_profile;

  return (
    <SectionWrapper
      id="niche-profile"
      number="01"
      title="Niche Profile"
      subtitle="Market overview, service offerings, and competitive landscape analysis"
    >
      {/* Summary Card */}
      <div className="bg-secondary/50 rounded-xl p-6 mb-8 border border-border">
        <p className="text-base font-body text-foreground leading-relaxed">
          {profile.summary}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Category"
          value={profile.category}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          label="Market Maturity"
          value="Growing"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Competitive Intensity"
          value="High"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Service Lines & Customer Types */}
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

      {/* Client Acquisition Dynamics */}
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
            {profile.client_acquisition_dynamics.typical_sales_approach}
          </p>
        </div>
      </div>

      {/* Seasonality */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Lead Generation Seasonality
        </h4>
        <div className="bg-accent/10 rounded-lg p-5 border border-accent/20">
          <p className="text-sm font-body text-foreground">
            {profile.lead_gen_seasonality}
          </p>
        </div>
      </div>

      {/* Lead Gen Risks */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Lead Generation Risks
        </h4>
        <InsightList items={profile.lead_gen_risks} type="warning" />
      </div>
    </SectionWrapper>
  );
};
