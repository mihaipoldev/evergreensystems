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

  // Check if this is a niche evaluation report by checking for verdict and score_details at root
  const isEvaluationReport = outputJson.verdict && outputJson.score_details && !outputJson.meta && !outputJson.niche_profile;
  
  if (isEvaluationReport) {
    // For niche evaluation, return a minimal ReportData structure
    // The actual evaluation data will be in data.evaluation
    return {
      meta: {
        knowledge_base: "unknown",
        mode: "niche_fit_evaluation",
        confidence: 0,
        generated_at: outputJson.evaluation_timestamp || new Date().toISOString().split('T')[0],
        input: {
          niche_name: outputJson.niche_name || "",
          geo: "",
        },
      },
      data: {
        evaluation: outputJson, // Pass the entire evaluation object
      } as any,
    };
  }

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
      // Preserve additional meta fields that may exist in the JSON
      focus: meta.focus,
      market_value: meta.market_value,
    } as any,
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
        timing_intelligence: data.niche_profile?.timing_intelligence
          ? {
              budget_approval_cycle: data.niche_profile.timing_intelligence.budget_approval_cycle || "",
              fiscal_year_timing: data.niche_profile.timing_intelligence.fiscal_year_timing || "",
            }
          : undefined,
        tam_analysis: data.niche_profile?.tam_analysis
          ? {
              total_companies_in_geography: typeof data.niche_profile.tam_analysis.total_companies_in_geography === 'number'
                ? data.niche_profile.tam_analysis.total_companies_in_geography
                : undefined,
              addressable_by_segment: data.niche_profile.tam_analysis.addressable_by_segment || {},
              market_concentration: data.niche_profile.tam_analysis.market_concentration || "",
              geographic_clusters: Array.isArray(data.niche_profile.tam_analysis.geographic_clusters)
                ? data.niche_profile.tam_analysis.geographic_clusters
                : [],
              regional_differences: data.niche_profile.tam_analysis.regional_differences || "",
            }
          : undefined,
        deal_economics: data.niche_profile?.deal_economics
          ? {
              typical_client_value_annually: data.niche_profile.deal_economics.typical_client_value_annually || "",
              average_deal_size: data.niche_profile.deal_economics.average_deal_size || "",
              contract_length_months: typeof data.niche_profile.deal_economics.contract_length_months === 'number'
                ? data.niche_profile.deal_economics.contract_length_months
                : 0,
              retention_rate_percent: typeof data.niche_profile.deal_economics.retention_rate_percent === 'number'
                ? data.niche_profile.deal_economics.retention_rate_percent
                : 0,
            }
          : undefined,
        existing_solutions: {
          operational_tools: Array.isArray(data.niche_profile?.existing_solutions?.operational_tools)
            ? data.niche_profile.existing_solutions.operational_tools
            : [],
          client_acquisition_methods: Array.isArray(data.niche_profile?.existing_solutions?.client_acquisition_methods)
            ? data.niche_profile.existing_solutions.client_acquisition_methods
            : [],
        },
      } as any,
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
          : undefined,
        verdict_description: data.lead_gen_strategy?.verdict_description,
        next_step_if_test: data.lead_gen_strategy?.next_step_if_test,
        strategic_assessment: data.lead_gen_strategy?.strategic_assessment
          ? {
              opportunity_summary: data.lead_gen_strategy.strategic_assessment.opportunity_summary || "",
              key_advantages: Array.isArray(data.lead_gen_strategy.strategic_assessment.key_advantages)
                ? data.lead_gen_strategy.strategic_assessment.key_advantages
                : [],
              key_challenges: Array.isArray(data.lead_gen_strategy.strategic_assessment.key_challenges)
                ? data.lead_gen_strategy.strategic_assessment.key_challenges
                : [],
            }
          : undefined,
        pilot_approach: data.lead_gen_strategy?.pilot_approach
          ? {
              recommended_pilot_size: data.lead_gen_strategy.pilot_approach.recommended_pilot_size || "",
              pilot_duration: data.lead_gen_strategy.pilot_approach.pilot_duration || "",
              success_metrics: Array.isArray(data.lead_gen_strategy.pilot_approach.success_metrics)
                ? data.lead_gen_strategy.pilot_approach.success_metrics
                : [],
              timing_considerations: data.lead_gen_strategy.pilot_approach.timing_considerations || "",
            }
          : undefined,
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
      lead_gen_scoring: data.lead_gen_scoring ? {
        confidence: typeof data.lead_gen_scoring.confidence === 'number' ? data.lead_gen_scoring.confidence : 0,
        sources_used: Array.isArray(data.lead_gen_scoring.sources_used) ? data.lead_gen_scoring.sources_used : undefined,
        description: data.lead_gen_scoring.description,
        lead_gen_fit_score: typeof data.lead_gen_scoring.lead_gen_fit_score === 'number' 
          ? data.lead_gen_scoring.lead_gen_fit_score 
          : 0,
        verdict: (data.lead_gen_scoring.verdict === "pursue" || 
                 data.lead_gen_scoring.verdict === "test" || 
                 data.lead_gen_scoring.verdict === "avoid")
          ? data.lead_gen_scoring.verdict
          : "test",
        verdict_rationale: data.lead_gen_scoring.verdict_rationale || "",
        scorecard_evaluation: data.lead_gen_scoring.scorecard_evaluation ? {
          offer_compatibility: {
            total_score: data.lead_gen_scoring.scorecard_evaluation.offer_compatibility?.total_score || "",
            questions: Array.isArray(data.lead_gen_scoring.scorecard_evaluation.offer_compatibility?.questions)
              ? data.lead_gen_scoring.scorecard_evaluation.offer_compatibility.questions.map((q: any) => ({
                  question: q.question || "",
                  answer: (q.answer === "yes" || q.answer === "no") ? q.answer : "no",
                  reasoning: q.reasoning || "",
                }))
              : [],
          },
          market_size_and_access: {
            total_score: data.lead_gen_scoring.scorecard_evaluation.market_size_and_access?.total_score || "",
            questions: Array.isArray(data.lead_gen_scoring.scorecard_evaluation.market_size_and_access?.questions)
              ? data.lead_gen_scoring.scorecard_evaluation.market_size_and_access.questions.map((q: any) => ({
                  question: q.question || "",
                  answer: (q.answer === "yes" || q.answer === "no") ? q.answer : "no",
                  reasoning: q.reasoning || "",
                }))
              : [],
          },
          fulfillment_feasibility: {
            total_score: data.lead_gen_scoring.scorecard_evaluation.fulfillment_feasibility?.total_score || "",
            questions: Array.isArray(data.lead_gen_scoring.scorecard_evaluation.fulfillment_feasibility?.questions)
              ? data.lead_gen_scoring.scorecard_evaluation.fulfillment_feasibility.questions.map((q: any) => ({
                  question: q.question || "",
                  answer: (q.answer === "yes" || q.answer === "no") ? q.answer : "no",
                  reasoning: q.reasoning || "",
                }))
              : [],
          },
          scorecard_summary: {
            total_yes: typeof data.lead_gen_scoring.scorecard_evaluation.scorecard_summary?.total_yes === 'number'
              ? data.lead_gen_scoring.scorecard_evaluation.scorecard_summary.total_yes
              : 0,
            total_questions: typeof data.lead_gen_scoring.scorecard_evaluation.scorecard_summary?.total_questions === 'number'
              ? data.lead_gen_scoring.scorecard_evaluation.scorecard_summary.total_questions
              : 0,
            percentage: typeof data.lead_gen_scoring.scorecard_evaluation.scorecard_summary?.percentage === 'number'
              ? data.lead_gen_scoring.scorecard_evaluation.scorecard_summary.percentage
              : 0,
            interpretation: data.lead_gen_scoring.scorecard_evaluation.scorecard_summary?.interpretation || "",
          },
        } : {
          offer_compatibility: { total_score: "", questions: [] },
          market_size_and_access: { total_score: "", questions: [] },
          fulfillment_feasibility: { total_score: "", questions: [] },
          scorecard_summary: { total_yes: 0, total_questions: 0, percentage: 0, interpretation: "" },
        },
        final_jury_results: data.lead_gen_scoring.final_jury_results ? {
          filters_passed: data.lead_gen_scoring.final_jury_results.filters_passed || "",
          overall_pass: typeof data.lead_gen_scoring.final_jury_results.overall_pass === 'boolean'
            ? data.lead_gen_scoring.final_jury_results.overall_pass
            : false,
          budget_filter: {
            pass: typeof data.lead_gen_scoring.final_jury_results.budget_filter?.pass === 'boolean'
              ? data.lead_gen_scoring.final_jury_results.budget_filter.pass
              : false,
            roi_multiple: typeof data.lead_gen_scoring.final_jury_results.budget_filter?.roi_multiple === 'number'
              ? data.lead_gen_scoring.final_jury_results.budget_filter.roi_multiple
              : 0,
            reasoning: data.lead_gen_scoring.final_jury_results.budget_filter?.reasoning || "",
          },
          scalability_filter: {
            pass: typeof data.lead_gen_scoring.final_jury_results.scalability_filter?.pass === 'boolean'
              ? data.lead_gen_scoring.final_jury_results.scalability_filter.pass
              : false,
            reasoning: data.lead_gen_scoring.final_jury_results.scalability_filter?.reasoning || "",
          },
          offer_market_fit: {
            pass: typeof data.lead_gen_scoring.final_jury_results.offer_market_fit?.pass === 'boolean'
              ? data.lead_gen_scoring.final_jury_results.offer_market_fit.pass
              : false,
            reasoning: data.lead_gen_scoring.final_jury_results.offer_market_fit?.reasoning || "",
          },
        } : {
          filters_passed: "0/3",
          overall_pass: false,
          budget_filter: { pass: false, roi_multiple: 0, reasoning: "" },
          scalability_filter: { pass: false, reasoning: "" },
          offer_market_fit: { pass: false, reasoning: "" },
        },
        dealbreakers: Array.isArray(data.lead_gen_scoring.dealbreakers)
          ? data.lead_gen_scoring.dealbreakers.map((db: any) => ({
              type: db.type || "",
              threshold: typeof db.threshold === 'number' ? db.threshold : 0,
              actual_value: typeof db.actual_value === 'number' ? db.actual_value : 0,
              severity: (db.severity === "critical" || db.severity === "catastrophic") ? db.severity : "critical",
              impact: db.impact || "",
              score_cap_applied: typeof db.score_cap_applied === 'number' ? db.score_cap_applied : 0,
            }))
          : [],
        score_breakdown: data.lead_gen_scoring.score_breakdown ? {
          components: Array.isArray(data.lead_gen_scoring.score_breakdown.components)
            ? data.lead_gen_scoring.score_breakdown.components.map((c: any) => ({
                name: c.name || "",
                weight: typeof c.weight === 'number' ? c.weight : 0,
                score: typeof c.score === 'number' ? c.score : 0,
                max_score: typeof c.max_score === 'number' ? c.max_score : 0,
                value: c.value || "",
                reasoning: c.reasoning || "",
              }))
            : [],
          total_before_caps: typeof data.lead_gen_scoring.score_breakdown.total_before_caps === 'number'
            ? data.lead_gen_scoring.score_breakdown.total_before_caps
            : 0,
          dealbreaker_cap_applied: typeof data.lead_gen_scoring.score_breakdown.dealbreaker_cap_applied === 'number'
            ? data.lead_gen_scoring.score_breakdown.dealbreaker_cap_applied
            : 0,
          final_score: typeof data.lead_gen_scoring.score_breakdown.final_score === 'number'
            ? data.lead_gen_scoring.score_breakdown.final_score
            : 0,
        } : {
          components: [],
          total_before_caps: 0,
          dealbreaker_cap_applied: 0,
          final_score: 0,
        },
        interpretation: data.lead_gen_scoring.interpretation ? {
          score_range: data.lead_gen_scoring.interpretation.score_range || "",
          category: data.lead_gen_scoring.interpretation.category || "",
          recommendation: data.lead_gen_scoring.interpretation.recommendation || "",
          key_reasons: Array.isArray(data.lead_gen_scoring.interpretation.key_reasons)
            ? data.lead_gen_scoring.interpretation.key_reasons
            : [],
        } : {
          score_range: "",
          category: "",
          recommendation: "",
          key_reasons: [],
        },
      } : undefined,
      // Preserve evaluation data if it exists (for evaluation reports)
      // Evaluation data can be at root of outputJson or in data.evaluation
      // Evaluation data structure: verdict, synthesis, critical_concerns, key_opportunities, flags, quick_stats, score_details
      evaluation: (outputJson.verdict || outputJson.synthesis || data.evaluation) ? {
        // Check root level first, then data.evaluation
        verdict: (outputJson.verdict || data.evaluation?.verdict) ? {
          label: (outputJson.verdict || data.evaluation?.verdict)?.label || "",
          color: (outputJson.verdict || data.evaluation?.verdict)?.color || "",
          score: typeof (outputJson.verdict || data.evaluation?.verdict)?.score === 'number' 
            ? (outputJson.verdict || data.evaluation?.verdict).score 
            : 0,
          priority: typeof (outputJson.verdict || data.evaluation?.verdict)?.priority === 'number' 
            ? (outputJson.verdict || data.evaluation?.verdict).priority 
            : 0,
          recommendation: (outputJson.verdict || data.evaluation?.verdict)?.recommendation || "",
          confidence: (outputJson.verdict || data.evaluation?.verdict)?.confidence || "",
        } : undefined,
        synthesis: outputJson.synthesis || data.evaluation?.synthesis || "",
        critical_concerns: Array.isArray(outputJson.critical_concerns) 
          ? outputJson.critical_concerns 
          : (Array.isArray(data.evaluation?.critical_concerns) ? data.evaluation.critical_concerns : []),
        key_opportunities: Array.isArray(outputJson.key_opportunities) 
          ? outputJson.key_opportunities 
          : (Array.isArray(data.evaluation?.key_opportunities) ? data.evaluation.key_opportunities : []),
        flags: (outputJson.flags || data.evaluation?.flags) ? {
          consensus: Array.isArray((outputJson.flags || data.evaluation?.flags)?.consensus) 
            ? (outputJson.flags || data.evaluation?.flags).consensus 
            : [],
          by_category: (outputJson.flags || data.evaluation?.flags)?.by_category || {},
          category_summary: Array.isArray((outputJson.flags || data.evaluation?.flags)?.category_summary) 
            ? (outputJson.flags || data.evaluation?.flags).category_summary 
            : [],
        } : undefined,
        quick_stats: (outputJson.quick_stats || data.evaluation?.quick_stats) ? {
          has_strong_consensus: typeof (outputJson.quick_stats || data.evaluation?.quick_stats)?.has_strong_consensus === 'boolean' 
            ? (outputJson.quick_stats || data.evaluation?.quick_stats).has_strong_consensus 
            : false,
          positive_signals: typeof (outputJson.quick_stats || data.evaluation?.quick_stats)?.positive_signals === 'number' 
            ? (outputJson.quick_stats || data.evaluation?.quick_stats).positive_signals 
            : 0,
          negative_signals: typeof (outputJson.quick_stats || data.evaluation?.quick_stats)?.negative_signals === 'number' 
            ? (outputJson.quick_stats || data.evaluation?.quick_stats).negative_signals 
            : 0,
          net_sentiment: typeof (outputJson.quick_stats || data.evaluation?.quick_stats)?.net_sentiment === 'number' 
            ? (outputJson.quick_stats || data.evaluation?.quick_stats).net_sentiment 
            : 0,
          confidence_description: (outputJson.quick_stats || data.evaluation?.quick_stats)?.confidence_description || "",
        } : undefined,
        // Include score_details if it exists (for individual model scores)
        score_details: (outputJson.score_details || data.evaluation?.score_details) ? {
          std_dev: typeof (outputJson.score_details || data.evaluation?.score_details)?.std_dev === 'number'
            ? (outputJson.score_details || data.evaluation?.score_details).std_dev
            : 0,
          raw_average: typeof (outputJson.score_details || data.evaluation?.score_details)?.raw_average === 'number'
            ? (outputJson.score_details || data.evaluation?.score_details).raw_average
            : 0,
          adjusted_average: typeof (outputJson.score_details || data.evaluation?.score_details)?.adjusted_average === 'number'
            ? (outputJson.score_details || data.evaluation?.score_details).adjusted_average
            : 0,
          individual_scores: (outputJson.score_details || data.evaluation?.score_details)?.individual_scores || {},
        } : undefined,
      } : undefined,
    } as any,
  } as ReportData;
}

