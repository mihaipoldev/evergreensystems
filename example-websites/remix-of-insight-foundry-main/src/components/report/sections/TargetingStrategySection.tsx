import { SectionWrapper } from "../SectionWrapper";
import { ChannelRanking } from "../ChannelRanking";
import { InsightList } from "../InsightList";
import { DataTable } from "../DataTable";
import { TagCloud } from "../TagCloud";
import { reportData } from "@/data/reportData";
import { CheckCircle, XCircle, Database } from "lucide-react";

export const TargetingStrategySection = () => {
  const targeting = reportData.data.lead_gen_strategy.targeting_strategy;

  return (
    <SectionWrapper
      id="targeting-strategy"
      number="05"
      title="Targeting Strategy"
      subtitle="Priority segments, qualification filters, channels, and data sources"
    >
      {/* Segments to Prioritize */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Priority Segments
        </h4>
        <InsightList items={targeting.segments_to_prioritize} type="target" numbered />
      </div>

      {/* Targeting Filters & Disqualifiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4">
            Targeting Filters
          </h4>
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <InsightList items={targeting.targeting_filters} type="success" />
          </div>
        </div>
        <div>
          <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            Disqualifiers
          </h4>
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <InsightList items={targeting.disqualifiers} type="warning" />
          </div>
        </div>
      </div>

      {/* Channel Rankings */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Best Channels (Ranked)
        </h4>
        <div className="bg-card rounded-xl p-6 border border-border report-shadow">
          <ChannelRanking channels={targeting.best_channels_ranked} />
        </div>
      </div>

      {/* Best List Sources */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-accent" />
          Recommended Data Sources
        </h4>
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
