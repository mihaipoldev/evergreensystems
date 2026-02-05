"use client";

import {
  SectionWrapper,
  BlockHeader,
  InsightList,
  NumberedCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faFilter,
  faStar,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

type ListSource = {
  source?: string;
  how_to_use?: string;
  data_quality?: string;
  expected_coverage?: string;
};

type TargetingFilter = {
  filter?: string;
  rationale?: string;
};

type SegmentToPrioritize = {
  segment?: string;
  why?: string;
  priority?: number;
};

type TargetingStrategy = {
  description?: string;
  best_list_sources?: (ListSource | string)[];
  targeting_filters?: (TargetingFilter | string)[];
  segments_to_prioritize?: (SegmentToPrioritize | string)[];
};

interface TargetingStrategySectionProps {
  targetingStrategy: TargetingStrategy;
  sectionNumber?: string;
}

function isListSource(x: ListSource | string): x is ListSource {
  return typeof x === "object" && x !== null && ("source" in x || "how_to_use" in x);
}

function isTargetingFilter(x: TargetingFilter | string): x is TargetingFilter {
  return typeof x === "object" && x !== null && ("filter" in x || "rationale" in x);
}

function isSegmentToPrioritize(x: SegmentToPrioritize | string): x is SegmentToPrioritize {
  return typeof x === "object" && x !== null && ("segment" in x || "why" in x);
}

export const TargetingStrategySection = ({
  targetingStrategy,
  sectionNumber = "09",
}: TargetingStrategySectionProps) => {
  const sources = targetingStrategy?.best_list_sources ?? [];
  const filters = targetingStrategy?.targeting_filters ?? [];
  const segments = targetingStrategy?.segments_to_prioritize ?? [];

  return (
    <SectionWrapper
      id="targeting-strategy"
      number={sectionNumber}
      title="Targeting Strategy"
      subtitle={targetingStrategy?.description ?? "List sources, filters, and prioritized segments"}
    >
      {sources.length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Best List Sources"
            icon={<FontAwesomeIcon icon={faDatabase} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-4">
            {sources.map((item, index) => {
              if (isListSource(item)) {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl border border-border report-shadow p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-display font-semibold text-foreground">
                        {item.source}
                      </h4>
                      {item.data_quality && (
                        <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent font-body">
                          {item.data_quality}
                        </span>
                      )}
                      {item.expected_coverage && (
                        <span className="text-xs text-muted-foreground font-body">
                          Coverage: {item.expected_coverage}
                        </span>
                      )}
                    </div>
                    {item.how_to_use && (
                      <p className="text-sm font-body text-foreground">{item.how_to_use}</p>
                    )}
                  </motion.div>
                );
              }
              return (
                <NumberedCard key={index} number={index + 1} layout="inline">
                  <p className="text-sm font-body text-foreground">{String(item)}</p>
                </NumberedCard>
              );
            })}
          </div>
        </div>
      )}

      {filters.length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Targeting Filters"
            icon={<FontAwesomeIcon icon={faFilter} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-3">
            {filters.map((item, index) => {
              if (isTargetingFilter(item)) {
                return (
                  <div
                    key={index}
                    className="bg-muted/50 rounded-lg p-4 border border-border"
                  >
                    <p className="font-body font-medium text-foreground">
                      {item.filter}
                    </p>
                    {item.rationale && (
                      <p className="text-sm text-muted-foreground font-body mt-1">
                        {item.rationale}
                      </p>
                    )}
                  </div>
                );
              }
              return (
                <NumberedCard key={index} number={index + 1} layout="inline">
                  <p className="text-sm font-body text-foreground">{String(item)}</p>
                </NumberedCard>
              );
            })}
          </div>
        </div>
      )}

      {segments.length > 0 && (
        <div>
          <BlockHeader
            variant="title"
            title="Segments to Prioritize"
            icon={<FontAwesomeIcon icon={faStar} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-4">
            {segments.map((item, index) => {
              if (isSegmentToPrioritize(item)) {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl border border-border report-shadow p-6 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display font-semibold text-foreground">
                          {item.segment}
                        </h4>
                        {item.priority != null && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded font-body">
                            Priority #{item.priority}
                          </span>
                        )}
                      </div>
                      {item.why && (
                        <p className="text-sm font-body text-muted-foreground">{item.why}</p>
                      )}
                    </div>
                  </motion.div>
                );
              }
              return (
                <NumberedCard key={index} number={index + 1} layout="inline">
                  <p className="text-sm font-body text-foreground">{String(item)}</p>
                </NumberedCard>
              );
            })}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};
