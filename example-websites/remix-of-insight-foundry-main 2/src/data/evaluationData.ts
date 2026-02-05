export const evaluationData = {
  niche_name: "Recruitment & Staffing Agencies",
  evaluation_timestamp: "2026-01-08T03:51:15.420Z",

  verdict: {
    label: "PURSUE",
    color: "green",
    score: 77.79,
    priority: 2,
    recommendation: "Strong candidate - proceed with full niche intelligence",
    confidence: "high"
  },

  synthesis: "All three models agree that recruitment and staffing agencies have strong budget capacity (one placement can cover lead-gen fees) and are easy to identify and target, but face intense competition from other lead-gen vendors and market saturation. The consensus is that this is a viable but challenging niche requiring differentiation through specialization, strong proof points, and potentially a pilot-first approach to overcome buyer skepticism.",

  critical_concerns: [
    "Highly competitive and saturated market with outbound-savvy agencies already heavily pitched by vendors",
    "Long sales cycles (60-120 days cold) driven by risk-aversion and past vendor burnout",
    "Fulfillment challenges and dependency on steady hiring demand, harder in cooling economy"
  ],

  key_opportunities: [
    "Excellent budget capability - single placement can cover entire lead-gen investment",
    "Large, easily targetable market with clear need for client acquisition",
    "Strong product-market fit fundamentals if positioned with niche specialization and credible proof"
  ],

  flags: {
    consensus: [
      {
        flag: "high_competition",
        category: "market_dynamics",
        mentioned_by: 3
      },
      {
        flag: "strong_budget",
        category: "economics",
        mentioned_by: 2
      },
      {
        flag: "long_sales_cycle",
        category: "sales_process",
        mentioned_by: 2
      }
    ],
    by_category: {
      market_dynamics: [
        { flag: "high_competition", mentioned_by: 3 },
        { flag: "sophisticated_buyers", mentioned_by: 1 }
      ],
      economics: [
        { flag: "strong_budget", mentioned_by: 2 },
        { flag: "price_sensitive_segment", mentioned_by: 1 }
      ],
      sales_process: [
        { flag: "long_sales_cycle", mentioned_by: 2 },
        { flag: "high_proof_required", mentioned_by: 1 }
      ],
      market_access: [
        { flag: "easy_to_target", mentioned_by: 1 },
        { flag: "active_buyers", mentioned_by: 1 }
      ],
      operations: [
        { flag: "economic_sensitivity", mentioned_by: 2 },
        { flag: "fulfillment_challenges", mentioned_by: 1 }
      ],
      fit_quality: [
        { flag: "growth_mindset", mentioned_by: 1 },
        { flag: "scalable", mentioned_by: 1 },
        { flag: "fast_results", mentioned_by: 1 }
      ]
    },
    category_summary: [
      {
        category: "market_dynamics",
        flag_count: 2,
        consensus_flags: 1
      },
      {
        category: "economics",
        flag_count: 2,
        consensus_flags: 1
      }
    ]
  },

  quick_stats: {
    has_strong_consensus: true,
    positive_signals: 3,
    negative_signals: 2,
    net_sentiment: 1,
    confidence_description: "Models agree"
  }
};
