import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { TagCloud } from "../../shared/TagCloud";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faCalendar,
  faDollarSign,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface MarketIntelligenceSectionProps {
  profile: ReportData["data"]["niche_profile"];
  sectionNumber?: string;
}

export const MarketIntelligenceSection = ({ profile, sectionNumber = "02" }: MarketIntelligenceSectionProps) => {
  return (
    <SectionWrapper
      id="market-intelligence"
      number={sectionNumber}
      title="Market Intelligence"
      subtitle="Deal economics, competitive landscape, and timing intelligence for market entry"
    >
      {/* Deal Economics Section */}
      {profile.deal_economics && (
        <div className="mb-8">
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-accent" />
            Deal Economics
          </h4>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Financial metrics and contract terms that define the economic viability of this niche.
          </p>
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                label="Contract Length"
                value={`${profile.deal_economics.contract_length_months} months`}
                icon={<FontAwesomeIcon icon={faCalendar} className="w-5 h-5" />}
              />
              <StatCard
                label="Retention Rate"
                value={`${profile.deal_economics.retention_rate_percent}%`}
                icon={<FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5" />}
                variant="highlight"
              />
            </div>

            {/* Descriptive Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-body text-muted-foreground">
                  <strong className="text-foreground">Typical Client Value Annually:</strong>{" "}
                  {typeof profile.deal_economics.typical_client_value_annually === "string"
                    ? profile.deal_economics.typical_client_value_annually
                    : (profile.deal_economics.typical_client_value_annually as any)?.value ||
                      (profile.deal_economics.typical_client_value_annually as any)?.text ||
                      (profile.deal_economics.typical_client_value_annually as any)?.description ||
                      String(profile.deal_economics.typical_client_value_annually || "Unknown")}
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-body text-muted-foreground">
                  <strong className="text-foreground">Average Deal Size:</strong>{" "}
                  {typeof profile.deal_economics.average_deal_size === "string"
                    ? profile.deal_economics.average_deal_size
                    : (profile.deal_economics.average_deal_size as any)?.value ||
                      (profile.deal_economics.average_deal_size as any)?.text ||
                      (profile.deal_economics.average_deal_size as any)?.description ||
                      String(profile.deal_economics.average_deal_size || "Unknown")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAM Analysis Section */}
      {profile.tam_analysis && (
        <div className="mb-8">
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-accent" />
            Total Addressable Market Analysis
          </h4>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Market size, segmentation, and geographic distribution of companies in this niche.
          </p>
          <div className="space-y-6">
            {/* Total Companies - Use StatCard if available, otherwise descriptive field */}
            {profile.tam_analysis.total_companies_in_geography && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  label="Total Companies"
                  value={profile.tam_analysis.total_companies_in_geography.toLocaleString()}
                  icon={<FontAwesomeIcon icon={faBuilding} className="w-5 h-5" />}
                  variant="highlight"
                />
                {profile.tam_analysis.market_concentration && (
                  <StatCard
                    label="Market Concentration"
                    value={profile.tam_analysis.market_concentration}
                    icon={<FontAwesomeIcon icon={faArrowTrendUp} className="w-5 h-5" />}
                  />
                )}
              </div>
            )}

            {/* Addressable by Segment - Use descriptive fields style */}
            {profile.tam_analysis.addressable_by_segment && Object.keys(profile.tam_analysis.addressable_by_segment).length > 0 && (
              <div>
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-4">
                  Addressable by Segment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.tam_analysis.addressable_by_segment).map(([segment, count], index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-body text-muted-foreground">
                        <strong className="text-foreground">{segment}:</strong> {count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geographic Clusters - Use TagCloud */}
            {profile.tam_analysis.geographic_clusters && profile.tam_analysis.geographic_clusters.length > 0 && (
              <div>
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-4">
                  Geographic Clusters
                </h4>
                <TagCloud tags={profile.tam_analysis.geographic_clusters} variant="gold" />
              </div>
            )}

            {/* Regional Differences - Use descriptive field style */}
            {profile.tam_analysis.regional_differences && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-body text-muted-foreground">
                  <strong className="text-foreground">Regional Differences:</strong>{" "}
                  {profile.tam_analysis.regional_differences}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timing Intelligence Section */}
      {profile.timing_intelligence && (profile.timing_intelligence.budget_approval_cycle || profile.timing_intelligence.fiscal_year_timing) && (
        <div className="mb-8">
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-primary" />
            Timing Intelligence
          </h4>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Optimal timing for market entry based on budget approval cycles and fiscal year timing.
          </p>
          <div className="space-y-6">
            {profile.timing_intelligence.budget_approval_cycle && (
              <div className="bg-card rounded-xl p-6 border border-border report-shadow">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
                  Budget Approval Cycle
                </h4>
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {typeof profile.timing_intelligence.budget_approval_cycle === "string"
                    ? profile.timing_intelligence.budget_approval_cycle
                    : (profile.timing_intelligence.budget_approval_cycle as any)?.value ||
                      (profile.timing_intelligence.budget_approval_cycle as any)?.text ||
                      (profile.timing_intelligence.budget_approval_cycle as any)?.description ||
                      String(profile.timing_intelligence.budget_approval_cycle || "Unknown")}
                </p>
              </div>
            )}

            {profile.timing_intelligence.fiscal_year_timing && (
              <div className="bg-card rounded-xl p-6 border border-border report-shadow">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
                  Fiscal Year Timing
                </h4>
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {typeof profile.timing_intelligence.fiscal_year_timing === "string"
                    ? profile.timing_intelligence.fiscal_year_timing
                    : (profile.timing_intelligence.fiscal_year_timing as any)?.value ||
                      (profile.timing_intelligence.fiscal_year_timing as any)?.text ||
                      (profile.timing_intelligence.fiscal_year_timing as any)?.description ||
                      String(profile.timing_intelligence.fiscal_year_timing || "Unknown")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

