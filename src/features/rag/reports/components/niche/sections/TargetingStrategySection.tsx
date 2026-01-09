import { SectionWrapper } from "../../shared/SectionWrapper";
import { InsightList } from "../../shared/InsightList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faXmarkCircle,
  faDatabase,
  faEnvelope,
  faCalendar,
  faUsers,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import type { ReportData } from "../../../types";

interface TargetingStrategySectionProps {
  targeting: ReportData["data"]["lead_gen_strategy"]["targeting_strategy"];
  sectionNumber?: string;
}

export const TargetingStrategySection = ({ targeting, sectionNumber = "06" }: TargetingStrategySectionProps) => {
  return (
    <SectionWrapper
      id="targeting-strategy"
      number={sectionNumber}
      title="Targeting Strategy"
      subtitle="Priority segments, qualification filters, channels, and data sources"
    >
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600" />
          Priority Segments
        </h4>
        {targeting.segments_to_prioritize_description && (
          <p className="text-sm text-muted-foreground font-body mb-4">
            {targeting.segments_to_prioritize_description}
          </p>
        )}
        <InsightList items={targeting.segments_to_prioritize} type="target" numbered />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4">
            Targeting Filters
          </h4>
          {targeting.targeting_filters_description && (
            <p className="text-sm text-muted-foreground font-body mb-4">
              {targeting.targeting_filters_description}
            </p>
          )}
          <InsightList items={targeting.targeting_filters} type="success" />
        </div>
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faXmarkCircle} className="w-5 h-5 text-destructive" />
            Disqualifiers
          </h4>
          {targeting.disqualifiers_description && (
            <p className="text-sm text-muted-foreground font-body mb-4">
              {targeting.disqualifiers_description}
            </p>
          )}
          <InsightList items={targeting.disqualifiers} type="warning" />
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Best Channels (Ranked)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {targeting.best_channels_ranked.map((channel, index) => {
            const channelValue = typeof channel === "string" 
              ? channel 
              : (channel as any)?.name || (channel as any)?.channel || (channel as any)?.value || String(channel);
            
            const channelIcons: Record<string, any> = {
              cold_email: faEnvelope,
              linkedin: faLinkedin,
              events: faCalendar,
              partners: faUsers,
              cold_call: faPhone,
            };
            
            const channelLabels: Record<string, string> = {
              cold_email: "Cold Email",
              linkedin: "LinkedIn",
              events: "Events",
              partners: "Partners",
              cold_call: "Cold Call",
            };
            
            const icon = channelIcons[channelValue] || faEnvelope;
            const label = channelLabels[channelValue] || channelValue;
            const rankColors = [
              "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
              "bg-gradient-to-br from-gray-300/20 to-gray-400/20 border-gray-400/30",
              "bg-gradient-to-br from-amber-600/20 to-amber-700/20 border-amber-600/30",
            ];
            const rankColor = rankColors[index] || "bg-gradient-to-br from-muted/50 to-muted/60 border-border";
            
            return (
              <div
                key={index}
                className={`rounded-xl p-5 border ${rankColor} report-shadow hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                      <FontAwesomeIcon icon={icon} className="w-6 h-6 text-accent" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shadow-md">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-base font-display font-semibold text-foreground mb-1">
                      {label}
                    </h5>
                    <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
                      Rank #{index + 1} Channel
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faDatabase} className="w-5 h-5 text-accent" />
          Recommended Data Sources
        </h4>
        {targeting.best_list_sources_description && (
          <p className="text-sm text-muted-foreground font-body mb-4">
            {targeting.best_list_sources_description}
          </p>
        )}
        <div className="space-y-3">
          {targeting.best_list_sources.map((source, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-4 border border-border report-shadow flex items-start gap-4"
            >
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {index + 1}
              </span>
              <p className="text-sm font-body text-foreground">{source}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

