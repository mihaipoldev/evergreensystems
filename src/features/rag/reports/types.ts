export type ReportData = {
  meta: {
    knowledge_base: string;
    mode: string;
    confidence: number;
    generated_at: string;
    sources_used?: string[];
    input: {
      niche_name: string;
      geo: string;
      notes?: string;
      ai_model?: string;
    };
  };
  data: {
    niche_profile: {
      confidence: number;
      sources_used?: string[];
      description?: string;
      name: string;
      category: string;
      summary: string;
      what_they_sell: string;
      common_service_lines: string[];
      typical_customer_types: string[];
      client_acquisition_dynamics: {
        how_they_currently_get_clients: string[];
        competitive_intensity: string;
        typical_sales_approach: string;
      };
      market_maturity: string;
      timing_intelligence?: {
        budget_approval_cycle: string;
        fiscal_year_timing?: string;
      };
      tam_analysis?: {
        total_companies_in_geography?: number;
        addressable_by_segment?: Record<string, string>;
        market_concentration?: string;
        geographic_clusters?: string[];
        regional_differences?: string;
      };
      deal_economics?: {
        typical_client_value_annually: string;
        average_deal_size: string;
        contract_length_months: number;
        retention_rate_percent: number;
      };
      existing_solutions: {
        operational_tools: string[];
        client_acquisition_methods: string[];
      };
    };
    buyer_psychology: {
      confidence: number;
      sources_used?: string[];
      description?: string;
      decision_makers: string[];
      buying_triggers: string[];
      common_objections: string[];
      budget_signal: string;
      urgency_level: string;
      sales_cycle_notes: string;
    };
    value_dynamics: {
      confidence: number;
      sources_used?: string[];
      description?: string;
      core_pain_points: string[];
      desired_outcomes: string[];
      kpis_that_matter: string[];
      kpis_that_matter_description?: string;
      must_have_proof: string[];
      must_have_proof_description?: string;
      constraints_and_risks: string[];
    };
    lead_gen_strategy: {
      confidence: number;
      sources_used?: string[];
      description?: string;
      lead_gen_fit_score?: number;
      fit_score_description?: string;
      fit_rationale?: string[];
      fit_rationale_description?: string;
      red_flags: string[];
      red_flags_description?: string;
      best_wedge: {
        confidence?: number;
        sources_used?: string[];
        description?: string;
        wedge_type: string;
        wedge_statement: string;
        why_it_works: string[];
      };
      verdict?: "pursue" | "test" | "avoid";
      verdict_description?: string;
      next_step_if_test?: string;
      strategic_assessment?: {
        opportunity_summary: string;
        key_advantages: string[];
        key_challenges: string[];
      };
      pilot_approach?: {
        recommended_pilot_size: string;
        pilot_duration: string;
        success_metrics: string[];
        timing_considerations: string;
      };
      targeting_strategy: {
        confidence?: number;
        sources_used?: string[];
        description?: string;
        segments_to_prioritize: string[];
        segments_to_prioritize_description?: string;
        targeting_filters: string[];
        targeting_filters_description?: string;
        disqualifiers: string[];
        disqualifiers_description?: string;
        best_channels_ranked: string[];
        best_list_sources: string[];
        best_list_sources_description?: string;
      };
    };
    generic_offer_angles: Array<{
      confidence?: number;
      description?: string;
      angle_name: string;
      who_it_targets: string;
      core_promise: string;
      why_this_resonates: string[];
      constraints?: string[];
    }>;
    outbound_approach: {
      confidence?: number;
      description?: string;
      primary_pain_to_hit: string;
      hook_themes: string[];
      proof_requirements: string[];
      personalization_vectors: string[];
      objection_themes: Array<{
        objection: string;
        positioning: string;
      }>;
    };
    positioning_intel: {
      confidence?: number;
      sources_used?: string[];
      description?: string;
      their_offer_angles: Array<{
        angle_name: string;
        who_it_targets: string;
        promise: string;
        proof_points: string[];
        keywords_to_use: string[];
      }>;
      value_propositions: string[];
      common_differentiators: string[];
    };
    messaging_inputs: {
      confidence?: number;
      sources_used?: string[];
      description?: string;
      industry_jargon: string[];
      pain_language: string[];
      benefit_language: string[];
      proof_language: string[];
    };
    research_links?: {
      confidence?: number;
      description?: string;
      google_search_links?: string[];
      linkedin_job_search_links?: string[];
      funding_search_links?: string[];
    };
    lead_gen_scoring?: {
      confidence: number;
      sources_used?: string[];
      description?: string;
      lead_gen_fit_score: number;
      verdict: "pursue" | "test" | "avoid";
      verdict_rationale: string;
      scorecard_evaluation: {
        offer_compatibility: {
          total_score: string;
          questions: Array<{
            question: string;
            answer: "yes" | "no";
            reasoning: string;
          }>;
        };
        market_size_and_access: {
          total_score: string;
          questions: Array<{
            question: string;
            answer: "yes" | "no";
            reasoning: string;
          }>;
        };
        fulfillment_feasibility: {
          total_score: string;
          questions: Array<{
            question: string;
            answer: "yes" | "no";
            reasoning: string;
          }>;
        };
        scorecard_summary: {
          total_yes: number;
          total_questions: number;
          percentage: number;
          interpretation: string;
        };
      };
      final_jury_results: {
        filters_passed: string;
        overall_pass: boolean;
        budget_filter: {
          pass: boolean;
          roi_multiple: number;
          reasoning: string;
        };
        scalability_filter: {
          pass: boolean;
          reasoning: string;
        };
        offer_market_fit: {
          pass: boolean;
          reasoning: string;
        };
      };
      dealbreakers: Array<{
        type: string;
        threshold: number;
        actual_value: number;
        severity: "critical" | "catastrophic";
        impact: string;
        score_cap_applied: number;
      }>;
      score_breakdown: {
        components: Array<{
          name: string;
          weight: number;
          score: number;
          max_score: number;
          value: string;
          reasoning: string;
        }>;
        total_before_caps: number;
        dealbreaker_cap_applied: number;
        final_score: number;
      };
      interpretation: {
        score_range: string;
        category: string;
        recommendation: string;
        key_reasons: string[];
      };
    };
  };
};

