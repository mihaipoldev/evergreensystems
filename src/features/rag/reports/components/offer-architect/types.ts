import type { ReportSection } from "../../types/meta";

/* ── Decision maker in target market ── */
export type DecisionMaker = {
  role?: string;
  influence_level?: string;
  what_they_care_about?: string;
};

/* ── Offer phase ── */
export type OfferPhase = {
  phase_name?: string;
  duration?: string;
  purpose?: string;
  what_happens?: string[];
  deliverables?: string[];
  guarantee_applies?: boolean;
  billing_applies?: boolean;
};

/* ── Pricing tier ── */
export type PricingTier = {
  name?: string;
  monthly_fee?: string;
  setup_fee?: string;
  minimum_commitment?: string;
  best_for?: string;
};

/* ── Objection with response framework ── */
export type CommonObjection = {
  objection?: string;
  frequency?: string;
  underlying_concern?: string;
  response_framework?: {
    acknowledge?: string;
    reframe?: string;
    differentiate?: string;
    close?: string;
  };
  proof_to_overcome?: string;
};

/* ── Data shape for offer-architect reports ── */
export type OfferArchitectData = {
  target_market?: {
    who_you_sell_to?: {
      primary_audience?: string;
      company_size?: string;
      decision_makers?: DecisionMaker[];
    };
    their_icp?: {
      description?: string;
      example_segments?: string[];
      your_responsibility?: string[];
      not_your_responsibility?: string[];
    };
  };
  what_you_sell?: {
    core_promise?: string;
    what_you_are_not_selling?: string[];
    what_you_are_actually_selling?: string;
    why_this_distinction_matters?: string[];
    offer_statement?: {
      primary_statement?: string;
      secondary_statement?: string;
    };
  };
  offer_structure?: {
    phases?: OfferPhase[];
    timeline_logic?: Record<string, string>;
  };
  pricing_architecture?: {
    pilot_pricing?: {
      strategy?: string;
      structure?: {
        upfront_fee?: string;
        monthly_fee?: string;
        contract_terms?: string;
        billing_start_date?: string;
      };
      rationale?: string;
    };
    production_pricing?: {
      tier_1?: PricingTier;
      tier_2?: PricingTier;
      tier_3?: PricingTier;
    };
    pricing_psychology?: {
      anchor_price?: string;
      recommended_tier?: string;
      discount_strategy?: string;
    };
  };
  guarantee_design?: {
    guaranteed_metric?: string;
    qualified_criteria?: string[];
    guarantee_mechanics?: {
      how_it_works?: string;
      evaluation_period?: string;
      if_met?: string;
      if_missed?: string;
      no_retroactive_billing?: boolean;
    };
    guarantee_statement?: string;
    mathematical_safety?: {
      why_this_is_safe_for_you?: string[];
      why_this_is_fair_for_them?: string[];
    };
    exit_conditions?: {
      you_stop_working_if?: string[];
    };
  };
  value_proposition?: {
    value_equation?: {
      dream_outcome?: string;
      likelihood_of_achievement?: string;
      time_delay?: string;
      effort_and_sacrifice?: string;
      calculated_value?: string;
    };
    functional_benefits?: string[];
    emotional_benefits?: string[];
    strategic_benefits?: string[];
    why_this_works_for_this_niche?: string;
  };
  offer_naming_and_framing?: {
    recommended_offer_name?: string;
    naming_rationale?: string;
    alternative_names?: { name?: string; positioning?: string }[];
    headline_formulas?: {
      formula?: string;
      example?: string;
      when_to_use?: string;
    }[];
    copywriting_angles?: {
      angle_name?: string;
      hook?: string;
      promise?: string;
      proof_needed?: string;
    }[];
  };
  lead_magnet_strategy?: {
    mini_offer_approach?: {
      concept?: string;
      why_it_works?: string;
    };
    recommended_lead_magnets?: {
      type?: string;
      name?: string;
      what_it_solves?: string;
      how_to_deliver?: string;
      cta?: string;
      conversion_path?: string;
    }[];
    free_trial_strategy?: {
      offer?: string;
      structure?: string;
      qualification_criteria?: string[];
      conversion_mechanism?: string;
    };
  };
  objection_handling?: {
    common_objections?: CommonObjection[];
    pricing_objections?: { objection?: string; response?: string }[];
    guarantee_objections?: { objection?: string; response?: string }[];
  };
  proof_requirements?: {
    what_you_need_to_show?: {
      proof_type?: string;
      priority?: string;
      how_to_get_it?: string;
      alternative_if_unavailable?: string;
    }[];
    case_study_framework?: {
      sections?: string[];
      key_metrics_to_highlight?: string[];
    };
    testimonial_strategy?: {
      ideal_testimonial_format?: string;
      questions_to_ask?: string[];
    };
  };
  sales_enablement?: {
    discovery_call_framework?: {
      duration?: string;
      goals?: string[];
      key_questions?: string[];
      qualification_criteria?: string[];
      disqualification_signals?: string[];
    };
    presentation_sequence?: {
      step?: string;
      what_to_say?: string;
      goal?: string;
    }[];
    closing_strategy?: {
      ask?: string;
      handle_hesitation?: string;
      next_steps?: string[];
    };
  };
  outreach_strategy?: {
    cold_outreach_approach?: {
      tone?: string;
      aca_framework?: {
        acknowledge?: string;
        compliment?: string;
        ask?: string;
      };
      volume_targets?: {
        messages_per_day?: number;
        follow_up_sequence?: string[];
      };
    };
    personalization_vectors?: {
      vector?: string;
      where_to_find?: string;
      how_to_use?: string;
      impact?: string;
    }[];
    sample_sequences?: {
      sequence_name?: string;
      target_segment?: string;
      messages?: {
        day?: number;
        subject?: string;
        body?: string;
      }[];
    }[];
  };
  competitive_differentiation?: {
    vs_alternatives?: {
      alternative?: string;
      their_approach?: string;
      our_approach?: string;
      key_message?: string;
    }[];
    unique_mechanisms?: string[];
    positioning_wedge?: string;
  };
  implementation_roadmap?: {
    phase_1_actions?: { action?: string; timeline?: string; owner?: string }[];
    phase_2_actions?: { action?: string; timeline?: string; owner?: string }[];
    phase_3_actions?: { action?: string; timeline?: string; owner?: string }[];
    quick_wins?: string[];
  };
};

export const OFFER_ARCHITECT_SECTIONS: ReportSection[] = [
  { id: "target-market", number: "01", title: "Target Market" },
  { id: "what-you-sell", number: "02", title: "What You Sell" },
  { id: "offer-structure", number: "03", title: "Offer Structure" },
  { id: "pricing-architecture", number: "04", title: "Pricing Architecture" },
  { id: "guarantee-design", number: "05", title: "Guarantee Design" },
  { id: "value-proposition", number: "06", title: "Value Proposition" },
  { id: "offer-naming", number: "07", title: "Offer Naming & Framing" },
  { id: "lead-magnet-strategy", number: "08", title: "Lead Magnet Strategy" },
  { id: "objection-handling", number: "09", title: "Objection Handling" },
  { id: "proof-requirements", number: "10", title: "Proof Requirements" },
  { id: "sales-enablement", number: "11", title: "Sales Enablement" },
  { id: "outreach-strategy", number: "12", title: "Outreach Strategy" },
  {
    id: "competitive-differentiation",
    number: "13",
    title: "Competitive Differentiation",
  },
  {
    id: "implementation-roadmap",
    number: "14",
    title: "Implementation Roadmap",
  },
];
