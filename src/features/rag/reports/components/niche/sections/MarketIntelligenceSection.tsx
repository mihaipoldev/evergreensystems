import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { TagCloud } from "../../shared/TagCloud";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faCalendar,
  faDollarSign,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface MarketIntelligenceSectionProps {
  profile: ReportData["data"]["niche_profile"];
}

export const MarketIntelligenceSection = ({ profile }: MarketIntelligenceSectionProps) => {
  return (
    <SectionWrapper
      id="market-intelligence"
      number="02"
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

      {/* Lead Gen Competitive Landscape Section */}
      {profile.lead_gen_competitive_landscape && (
        <div className="mb-8">
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-accent" />
            Lead Gen Competitive Landscape
          </h4>
          <div className="space-y-6">
            {/* Existing Lead Gen Providers */}
            {profile.lead_gen_competitive_landscape.existing_lead_gen_providers &&
              profile.lead_gen_competitive_landscape.existing_lead_gen_providers.length > 0 && (
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-4">
                    Existing Lead Gen Providers
                  </h4>
                  <TagCloud 
                    tags={profile.lead_gen_competitive_landscape.existing_lead_gen_providers} 
                    variant="gold"
                  />
                </div>
              )}

            {/* Typical Pricing Benchmarks */}
            {profile.lead_gen_competitive_landscape.typical_pricing_benchmarks && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-body text-muted-foreground">
                  <strong className="text-foreground">Typical Pricing Benchmarks:</strong>{" "}
                  {typeof profile.lead_gen_competitive_landscape.typical_pricing_benchmarks === "string"
                    ? profile.lead_gen_competitive_landscape.typical_pricing_benchmarks
                    : (profile.lead_gen_competitive_landscape.typical_pricing_benchmarks as any)?.value ||
                      (profile.lead_gen_competitive_landscape.typical_pricing_benchmarks as any)?.text ||
                      (profile.lead_gen_competitive_landscape.typical_pricing_benchmarks as any)?.description ||
                      String(profile.lead_gen_competitive_landscape.typical_pricing_benchmarks || "Unknown")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timing Intelligence Section */}
      {(profile.timing_intelligence || profile.lead_gen_seasonality) && (
        <div className="mb-8">
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-primary" />
            Timing Intelligence
          </h4>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Optimal timing for market entry based on seasonality patterns and budget approval cycles.
          </p>
          {profile.timing_intelligence ? (
            <div className="space-y-6">
              {/* Lead Gen Seasonality */}
              <div className="bg-card rounded-xl p-6 border border-border report-shadow">
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
                  Lead Generation Seasonality
                </h4>
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {typeof profile.timing_intelligence.lead_gen_seasonality === "string"
                    ? profile.timing_intelligence.lead_gen_seasonality
                    : (profile.timing_intelligence.lead_gen_seasonality as any)?.value ||
                      (profile.timing_intelligence.lead_gen_seasonality as any)?.text ||
                      (profile.timing_intelligence.lead_gen_seasonality as any)?.description ||
                      String(profile.timing_intelligence.lead_gen_seasonality || "Unknown")}
                </p>
              </div>

              {/* Best Months to Launch */}
              {profile.timing_intelligence.best_months_to_launch &&
                profile.timing_intelligence.best_months_to_launch.length > 0 && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-4">
                      Best Months to Launch
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.timing_intelligence.best_months_to_launch.map((month, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                        >
                          {month}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Budget Approval Cycle */}
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
            </div>
          ) : (
            // Fallback for old structure (backward compatibility)
            <div className="bg-card rounded-xl p-6 border border-border report-shadow">
              <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
                Lead Generation Seasonality
              </h4>
              <p className="text-sm font-body text-foreground leading-relaxed">
                {typeof profile.lead_gen_seasonality === "string"
                  ? profile.lead_gen_seasonality
                  : (profile.lead_gen_seasonality as any)?.value ||
                    (profile.lead_gen_seasonality as any)?.text ||
                    (profile.lead_gen_seasonality as any)?.description ||
                    String(profile.lead_gen_seasonality || "Unknown")}
              </p>
            </div>
          )}
        </div>
      )}
    </SectionWrapper>
  );
};

