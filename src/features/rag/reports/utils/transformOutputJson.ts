import type { ReportData } from "../types";

/**
 * Transforms raw output_json from rag_run_outputs into a normalized ReportData structure.
 * Handles missing/null fields gracefully with sensible defaults.
 * 
 * @param outputJson - Raw JSON from rag_run_outputs.output_json
 * @returns Normalized ReportData structure
 */
export function transformOutputJson(outputJson: Record<string, any>): ReportData {
  // Helper to safely get nested values with defaults
  const get = (obj: any, path: string[], defaultValue: any = null) => {
    let current = obj;
    for (const key of path) {
      if (current == null || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    return current ?? defaultValue;
  };

  const meta = outputJson.meta || {};
  const data = outputJson.data || {};

  return {
    meta: {
      knowledge_base: meta.knowledge_base || "unknown",
      mode: meta.mode || "lead_gen_targeting",
      confidence: typeof meta.confidence === 'number' ? meta.confidence : 0,
      generated_at: meta.generated_at || new Date().toISOString().split('T')[0],
      sources_used: Array.isArray(meta.sources_used) ? meta.sources_used : undefined,
      input: {
        niche_name: meta.input?.niche_name || "",
        geo: meta.input?.geo || "",
        notes: meta.input?.notes,
        ai_model: meta.input?.ai_model,
      },
    },
    data: {
      niche_profile: {
        confidence: typeof data.niche_profile?.confidence === 'number' ? data.niche_profile.confidence : 0,
        sources_used: Array.isArray(data.niche_profile?.sources_used) ? data.niche_profile.sources_used : undefined,
        description: data.niche_profile?.description,
        name: data.niche_profile?.name || "",
        category: data.niche_profile?.category || "",
        summary: data.niche_profile?.summary || "",
        what_they_sell: data.niche_profile?.what_they_sell || "",
        common_service_lines: Array.isArray(data.niche_profile?.common_service_lines) 
          ? data.niche_profile.common_service_lines 
          : [],
        typical_customer_types: Array.isArray(data.niche_profile?.typical_customer_types)
          ? data.niche_profile.typical_customer_types
          : [],
        client_acquisition_dynamics: {
          how_they_currently_get_clients: Array.isArray(data.niche_profile?.client_acquisition_dynamics?.how_they_currently_get_clients)
            ? data.niche_profile.client_acquisition_dynamics.how_they_currently_get_clients
            : [],
          competitive_intensity: data.niche_profile?.client_acquisition_dynamics?.competitive_intensity || "",
          typical_sales_approach: data.niche_profile?.client_acquisition_dynamics?.typical_sales_approach || "",
        },
        market_maturity: data.niche_profile?.market_maturity || "",
        lead_gen_seasonality: data.niche_profile?.lead_gen_seasonality || "",
        existing_solutions: {
          operational_tools: Array.isArray(data.niche_profile?.existing_solutions?.operational_tools)
            ? data.niche_profile.existing_solutions.operational_tools
            : [],
          client_acquisition_methods: Array.isArray(data.niche_profile?.existing_solutions?.client_acquisition_methods)
            ? data.niche_profile.existing_solutions.client_acquisition_methods
            : [],
        },
        lead_gen_risks: Array.isArray(data.niche_profile?.lead_gen_risks)
          ? data.niche_profile.lead_gen_risks
          : [],
      },
      buyer_psychology: {
        confidence: typeof data.buyer_psychology?.confidence === 'number' ? data.buyer_psychology.confidence : 0,
        sources_used: Array.isArray(data.buyer_psychology?.sources_used) ? data.buyer_psychology.sources_used : undefined,
        description: data.buyer_psychology?.description,
        decision_makers: Array.isArray(data.buyer_psychology?.decision_makers)
          ? data.buyer_psychology.decision_makers
          : [],
        buying_triggers: Array.isArray(data.buyer_psychology?.buying_triggers)
          ? data.buyer_psychology.buying_triggers
          : [],
        common_objections: Array.isArray(data.buyer_psychology?.common_objections)
          ? data.buyer_psychology.common_objections
          : [],
        budget_signal: data.buyer_psychology?.budget_signal || "",
        urgency_level: data.buyer_psychology?.urgency_level || "",
        sales_cycle_notes: data.buyer_psychology?.sales_cycle_notes || "",
      },
      value_dynamics: {
        confidence: typeof data.value_dynamics?.confidence === 'number' ? data.value_dynamics.confidence : 0,
        sources_used: Array.isArray(data.value_dynamics?.sources_used) ? data.value_dynamics.sources_used : undefined,
        description: data.value_dynamics?.description,
        core_pain_points: Array.isArray(data.value_dynamics?.core_pain_points)
          ? data.value_dynamics.core_pain_points
          : [],
        desired_outcomes: Array.isArray(data.value_dynamics?.desired_outcomes)
          ? data.value_dynamics.desired_outcomes
          : [],
        kpis_that_matter: Array.isArray(data.value_dynamics?.kpis_that_matter)
          ? data.value_dynamics.kpis_that_matter
          : [],
        kpis_that_matter_description: data.value_dynamics?.kpis_that_matter_description,
        must_have_proof: Array.isArray(data.value_dynamics?.must_have_proof)
          ? data.value_dynamics.must_have_proof
          : [],
        must_have_proof_description: data.value_dynamics?.must_have_proof_description,
        constraints_and_risks: Array.isArray(data.value_dynamics?.constraints_and_risks)
          ? data.value_dynamics.constraints_and_risks
          : [],
      },
      lead_gen_strategy: {
        confidence: typeof data.lead_gen_strategy?.confidence === 'number' ? data.lead_gen_strategy.confidence : 0,
        sources_used: Array.isArray(data.lead_gen_strategy?.sources_used) ? data.lead_gen_strategy.sources_used : undefined,
        description: data.lead_gen_strategy?.description,
        lead_gen_fit_score: typeof data.lead_gen_strategy?.lead_gen_fit_score === 'number' 
          ? data.lead_gen_strategy.lead_gen_fit_score 
          : 0,
        fit_score_description: data.lead_gen_strategy?.fit_score_description,
        fit_rationale: Array.isArray(data.lead_gen_strategy?.fit_rationale)
          ? data.lead_gen_strategy.fit_rationale
          : [],
        fit_rationale_description: data.lead_gen_strategy?.fit_rationale_description,
        red_flags: Array.isArray(data.lead_gen_strategy?.red_flags)
          ? data.lead_gen_strategy.red_flags
          : [],
        red_flags_description: data.lead_gen_strategy?.red_flags_description,
        best_wedge: {
          confidence: typeof data.lead_gen_strategy?.best_wedge?.confidence === 'number' 
            ? data.lead_gen_strategy.best_wedge.confidence 
            : undefined,
          sources_used: Array.isArray(data.lead_gen_strategy?.best_wedge?.sources_used) 
            ? data.lead_gen_strategy.best_wedge.sources_used 
            : undefined,
          description: data.lead_gen_strategy?.best_wedge?.description,
          wedge_type: data.lead_gen_strategy?.best_wedge?.wedge_type || "",
          wedge_statement: data.lead_gen_strategy?.best_wedge?.wedge_statement || "",
          why_it_works: Array.isArray(data.lead_gen_strategy?.best_wedge?.why_it_works)
            ? data.lead_gen_strategy.best_wedge.why_it_works
            : [],
        },
        verdict: (data.lead_gen_strategy?.verdict === "pursue" || 
                 data.lead_gen_strategy?.verdict === "test" || 
                 data.lead_gen_strategy?.verdict === "avoid")
          ? data.lead_gen_strategy.verdict
          : "test",
        verdict_description: data.lead_gen_strategy?.verdict_description,
        next_step_if_test: data.lead_gen_strategy?.next_step_if_test || "",
        targeting_strategy: {
          confidence: typeof data.lead_gen_strategy?.targeting_strategy?.confidence === 'number'
            ? data.lead_gen_strategy.targeting_strategy.confidence
            : undefined,
          sources_used: Array.isArray(data.lead_gen_strategy?.targeting_strategy?.sources_used)
            ? data.lead_gen_strategy.targeting_strategy.sources_used
            : undefined,
          description: data.lead_gen_strategy?.targeting_strategy?.description,
          segments_to_prioritize: Array.isArray(data.lead_gen_strategy?.targeting_strategy?.segments_to_prioritize)
            ? data.lead_gen_strategy.targeting_strategy.segments_to_prioritize
            : [],
          segments_to_prioritize_description: data.lead_gen_strategy?.targeting_strategy?.segments_to_prioritize_description,
          targeting_filters: Array.isArray(data.lead_gen_strategy?.targeting_strategy?.targeting_filters)
            ? data.lead_gen_strategy.targeting_strategy.targeting_filters
            : [],
          targeting_filters_description: data.lead_gen_strategy?.targeting_strategy?.targeting_filters_description,
          disqualifiers: Array.isArray(data.lead_gen_strategy?.targeting_strategy?.disqualifiers)
            ? data.lead_gen_strategy.targeting_strategy.disqualifiers
            : [],
          disqualifiers_description: data.lead_gen_strategy?.targeting_strategy?.disqualifiers_description,
          best_channels_ranked: Array.isArray(data.lead_gen_strategy?.targeting_strategy?.best_channels_ranked)
            ? data.lead_gen_strategy.targeting_strategy.best_channels_ranked
            : [],
          best_list_sources: Array.isArray(data.lead_gen_strategy?.targeting_strategy?.best_list_sources)
            ? data.lead_gen_strategy.targeting_strategy.best_list_sources
            : [],
          best_list_sources_description: data.lead_gen_strategy?.targeting_strategy?.best_list_sources_description,
        },
      },
      generic_offer_angles: Array.isArray(data.generic_offer_angles)
        ? data.generic_offer_angles.map((angle: any) => ({
            confidence: typeof angle.confidence === 'number' ? angle.confidence : undefined,
            description: angle.description,
            angle_name: angle.angle_name || "",
            who_it_targets: angle.who_it_targets || "",
            core_promise: angle.core_promise || "",
            why_this_resonates: Array.isArray(angle.why_this_resonates) ? angle.why_this_resonates : [],
            constraints: Array.isArray(angle.constraints) ? angle.constraints : undefined,
          }))
        : [],
      outbound_approach: {
        confidence: typeof data.outbound_approach?.confidence === 'number' ? data.outbound_approach.confidence : undefined,
        description: data.outbound_approach?.description,
        primary_pain_to_hit: data.outbound_approach?.primary_pain_to_hit || "",
        hook_themes: Array.isArray(data.outbound_approach?.hook_themes)
          ? data.outbound_approach.hook_themes
          : [],
        proof_requirements: Array.isArray(data.outbound_approach?.proof_requirements)
          ? data.outbound_approach.proof_requirements
          : [],
        personalization_vectors: Array.isArray(data.outbound_approach?.personalization_vectors)
          ? data.outbound_approach.personalization_vectors
          : [],
        objection_themes: Array.isArray(data.outbound_approach?.objection_themes)
          ? data.outbound_approach.objection_themes.map((theme: any) => ({
              objection: theme.objection || "",
              positioning: theme.positioning || "",
            }))
          : [],
      },
      positioning_intel: {
        confidence: typeof data.positioning_intel?.confidence === 'number' ? data.positioning_intel.confidence : undefined,
        sources_used: Array.isArray(data.positioning_intel?.sources_used) ? data.positioning_intel.sources_used : undefined,
        description: data.positioning_intel?.description,
        their_offer_angles: Array.isArray(data.positioning_intel?.their_offer_angles)
          ? data.positioning_intel.their_offer_angles.map((angle: any) => ({
              angle_name: angle.angle_name || "",
              who_it_targets: angle.who_it_targets || "",
              promise: angle.promise || "",
              proof_points: Array.isArray(angle.proof_points) ? angle.proof_points : [],
              keywords_to_use: Array.isArray(angle.keywords_to_use) ? angle.keywords_to_use : [],
            }))
          : [],
        value_propositions: Array.isArray(data.positioning_intel?.value_propositions)
          ? data.positioning_intel.value_propositions
          : [],
        common_differentiators: Array.isArray(data.positioning_intel?.common_differentiators)
          ? data.positioning_intel.common_differentiators
          : [],
      },
      messaging_inputs: {
        confidence: typeof data.messaging_inputs?.confidence === 'number' ? data.messaging_inputs.confidence : undefined,
        sources_used: Array.isArray(data.messaging_inputs?.sources_used) ? data.messaging_inputs.sources_used : undefined,
        description: data.messaging_inputs?.description,
        industry_jargon: Array.isArray(data.messaging_inputs?.industry_jargon)
          ? data.messaging_inputs.industry_jargon
          : [],
        pain_language: Array.isArray(data.messaging_inputs?.pain_language)
          ? data.messaging_inputs.pain_language
          : [],
        benefit_language: Array.isArray(data.messaging_inputs?.benefit_language)
          ? data.messaging_inputs.benefit_language
          : [],
        proof_language: Array.isArray(data.messaging_inputs?.proof_language)
          ? data.messaging_inputs.proof_language
          : [],
      },
      research_links: data.research_links ? {
        confidence: typeof data.research_links.confidence === 'number' ? data.research_links.confidence : undefined,
        description: data.research_links.description,
        google_search_links: Array.isArray(data.research_links.google_search_links)
          ? data.research_links.google_search_links
          : undefined,
        linkedin_job_search_links: Array.isArray(data.research_links.linkedin_job_search_links)
          ? data.research_links.linkedin_job_search_links
          : undefined,
        funding_search_links: Array.isArray(data.research_links.funding_search_links)
          ? data.research_links.funding_search_links
          : undefined,
      } : undefined,
    },
  };
}

