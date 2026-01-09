import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { DataTable } from "../../shared/DataTable";
import { TagCloud } from "../../shared/TagCloud";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faUsers,
  faBox,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface NicheProfileSectionProps {
  profile: ReportData["data"]["niche_profile"];
  sectionNumber?: string;
}

export const NicheProfileSection = ({ profile, sectionNumber = "01" }: NicheProfileSectionProps) => {
  return (
    <SectionWrapper
      id="niche-profile"
      number={sectionNumber}
      title="Niche Profile"
      subtitle="Market overview, service offerings, and competitive landscape analysis"
    >
      <div className="bg-card rounded-xl p-6 border border-border report-shadow mb-8">
        {/* Summary Section */}
        <div className="mb-6">
          <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
            Summary
          </h4>
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

        {/* What They Sell Section */}
        {profile.what_they_sell && (
          <div>
            <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
              What They Sell
            </h4>
            <p className="text-base font-body text-foreground leading-relaxed">
              {typeof profile.what_they_sell === "string"
                ? profile.what_they_sell
                : (profile.what_they_sell as any)?.value ||
                  (profile.what_they_sell as any)?.text ||
                  (profile.what_they_sell as any)?.description ||
                  String(profile.what_they_sell || "")}
            </p>
          </div>
        )}
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
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />
          Client Acquisition Dynamics
        </h4>
        <p className="text-sm text-muted-foreground font-body mb-4">
          How these companies currently acquire clients and the operational tools they use in their sales process.
        </p>
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
    </SectionWrapper>
  );
};

