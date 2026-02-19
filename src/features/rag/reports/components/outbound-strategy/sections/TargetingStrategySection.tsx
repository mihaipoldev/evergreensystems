"use client";

import {
  SectionWrapper,
  BlockHeader,
  NumberedCard,
  ContentCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faFilter,
  faStar,
  faChartBar,
  faIndustry,
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

type IndustryItem = {
  industry?: string;
  naics?: string;
  keywords?: string;
  qualification?: string;
  reason?: string;
};

type Industries = {
  primary_focus?: IndustryItem[];
  adjacent?: IndustryItem[];
  avoid?: IndustryItem[];
};

type TargetingStrategy = {
  description?: string;
  best_list_sources?: (ListSource | string)[];
  targeting_filters?: (TargetingFilter | string)[];
  segments_to_prioritize?: (SegmentToPrioritize | string)[];
  industries?: Industries;
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
  sectionNumber = "02",
}: TargetingStrategySectionProps) => {
  const sources = targetingStrategy?.best_list_sources ?? [];
  const filters = targetingStrategy?.targeting_filters ?? [];
  const segments = targetingStrategy?.segments_to_prioritize ?? [];
  const industries = targetingStrategy?.industries;

  return (
    <SectionWrapper
      id="targeting-strategy"
      number={sectionNumber}
      title="Targeting Strategy"
      subtitle={targetingStrategy?.description || undefined}
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
        <div className="mb-10">
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

      {industries && (
        <div>
          <BlockHeader
            variant="title"
            title="Industries"
            icon={<FontAwesomeIcon icon={faIndustry} className="w-5 h-5 text-accent" />}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {industries.primary_focus && industries.primary_focus.length > 0 && (
              <ContentCard variant="green" title="Primary Focus">
                <ul className="space-y-3">
                  {industries.primary_focus.map((item, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-foreground">{item.industry}</span>
                      {item.naics && (
                        <span className="text-muted-foreground ml-1">(NAICS: {item.naics})</span>
                      )}
                      {item.keywords && (
                        <p className="text-xs text-muted-foreground mt-1">{item.keywords}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {industries.adjacent && industries.adjacent.length > 0 && (
              <ContentCard variant="accent" title="Adjacent Opportunities">
                <ul className="space-y-3">
                  {industries.adjacent.map((item, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-foreground">{item.industry}</span>
                      {item.qualification && (
                        <p className="text-xs text-muted-foreground mt-1">{item.qualification}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {industries.avoid && industries.avoid.length > 0 && (
              <ContentCard variant="danger" title="Avoid">
                <ul className="space-y-3">
                  {industries.avoid.map((item, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-foreground">{item.industry}</span>
                      {item.reason && (
                        <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};
