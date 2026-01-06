import { SectionWrapper } from "../../shared/SectionWrapper";
import { InsightList } from "../../shared/InsightList";
import { ChannelRanking } from "../../shared/ChannelRanking";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faXmarkCircle,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface TargetingStrategySectionProps {
  targeting: ReportData["data"]["lead_gen_strategy"]["targeting_strategy"];
}

export const TargetingStrategySection = ({ targeting }: TargetingStrategySectionProps) => {
  return (
    <SectionWrapper
      id="targeting-strategy"
      number="05"
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
        <div className="bg-card rounded-xl p-6 border border-border report-shadow">
          <ChannelRanking channels={targeting.best_channels_ranked} />
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

