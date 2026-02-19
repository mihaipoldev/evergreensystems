/** Usage metrics from meta (duration, costs) */
export type UsageMetrics = {
  duration_seconds?: number;
  costs?: {
    research?: number;
    agent_1?: number;
    agent_2?: number;
    agent_3?: number;
    meta?: number;
    total?: number;
    total_research?: number;
    total_synthesis?: number;
    [key: string]: number | undefined;
  };
  per_agent?: Record<
    string,
    {
      total_cost?: number;
      research_cost?: number;
      synthesis_cost?: number;
      queries?: number;
    }
  >;
  per_evaluation?: {
    total_cost?: number;
    breakdown?: {
      research?: number;
      agents?: number;
      meta?: number;
    };
  };
};

/**
 * Standardized meta structure for ALL automation reports.
 *
 * Every automation output_json MUST conform to this shape.
 * The only automation-specific part is `analysis_summary.domain_insights`.
 */
export type ReportMeta = {
  automation_name: string;
  report_type: string;
  description: string;
  perspective: string;
  sources_used: string[];
  sources_count: number;
  generated_at: string;
  input: {
    niche_name: string;
    geography: string;
    notes: string;
    run_id: string;
  };
  ai_models: {
    research: string;
    synthesis: string;
  };
  analysis_summary: {
    total_agents: number;
    agents_included: string[];
    per_agent_confidence: Record<
      string,
      { score?: number; rationale?: string } | number
    >;
    domain_insights: Record<string, unknown>;
  };
  usage_metrics: UsageMetrics;
  confidence_rationale: string;
  confidence: number;
};

/** Generic report shape: standardized meta + automation-specific data */
export type BaseReportData<TData = Record<string, unknown>> = {
  meta: ReportMeta;
  data: TData;
};

/**
 * Default report data type used throughout the codebase.
 * Alias for BaseReportData with untyped data — components cast data
 * to their automation-specific shape as needed.
 */
export type ReportData = BaseReportData;

/** Section definition for table of contents / sidebar navigation */
export type ReportSection = {
  id: string;
  number: string;
  title: string;
};

/** Header configuration for an automation's report page */
export type HeaderConfig = {
  reportTypeLabel: string;
  modeLabel: string;
  subtitle: string;
  showStatsCards: boolean;
};
