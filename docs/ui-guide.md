# UI Design Brief: Offer Architect

> **Purpose**: This document specifies how to visually present offer architecture data. It explains what each section means conceptually and how to organize it for lead generation agencies building complete service offerings for specific niches.

---

## 1. Automation Overview

| Property | Value |
|----------|-------|
| **Automation Name** | `offer-architect` |
| **Report Type** | `complete_offer_architecture` |
| **Perspective** | `lead_gen_agency` |
| **Primary Use Case** | Designing complete offer architecture including pricing, guarantees, positioning, and lead magnets |
| **Target Audience** | Lead gen agencies, service providers, consultants building packaged offers for niches |
| **Total Sections** | 14 sections (target market through implementation roadmap) |

**Description:** Designs complete offer architecture including pricing, guarantees, positioning, and lead magnets for specific niches. This automation provides a comprehensive blueprint for agencies to package and sell their services effectively.

---

## 2. Data Schema

**This is the exact data structure you'll receive from the automation:**

```json
{
  "meta": {
    "automation_name": "offer-architect",
    "report_type": "complete_offer_architecture",
    "description": "Designs complete offer architecture including pricing, guarantees, positioning, and lead magnets for specific niches",
    "perspective": "lead_gen_agency",
    "sources_used": [],
    "sources_count": 0,
    "generated_at": "",
    "input": {
      "niche_name": "",
      "geography": "",
      "notes": "",
      "run_id": ""
    },
    "ai_models": {
      "research": "",
      "synthesis": ""
    },
    "analysis_summary": {
      "total_agents": 3,
      "agents_included": [
        "Market & Offer Foundation",
        "Pricing & Guarantee Architect",
        "Positioning & Sales Enablement"
      ],
      "per_agent_confidence": {},
      "domain_insights": {
        "offer_angles_generated": 0,
        "pricing_tiers": 0,
        "objections_mapped": 0,
        "lead_magnets_designed": 0
      }
    },
    "usage_metrics": {},
    "confidence_rationale": "",
    "confidence": 0
  },
  "data": {
    "target_market": {
      "who_you_sell_to": {
        "primary_audience": "string",
        "company_size": "string",
        "decision_makers": [
          {
            "role": "string",
            "influence_level": "string",
            "what_they_care_about": "string"
          }
        ]
      },
      "their_icp": {
        "description": "string",
        "example_segments": ["string"],
        "your_responsibility": ["string"],
        "not_your_responsibility": ["string"]
      }
    },
    "what_you_sell": {
      "core_promise": "string",
      "what_you_are_not_selling": ["string"],
      "what_you_are_actually_selling": "string",
      "why_this_distinction_matters": ["string"],
      "offer_statement": {
        "primary_statement": "string",
        "secondary_statement": "string"
      }
    },
    "offer_structure": {
      "phases": [
        {
          "phase_name": "string",
          "duration": "string",
          "purpose": "string",
          "what_happens": ["string"],
          "deliverables": ["string"],
          "guarantee_applies": false,
          "billing_applies": false
        }
      ],
      "timeline_logic": {
        "phase_1": "string",
        "phase_2": "string",
        "phase_3": "string"
      }
    },
    "pricing_architecture": {
      "pilot_pricing": {
        "strategy": "string",
        "structure": {
          "upfront_fee": "string",
          "monthly_fee": "string",
          "contract_terms": "string",
          "billing_start_date": "string"
        },
        "rationale": "string"
      },
      "production_pricing": {
        "tier_1": {
          "name": "string",
          "monthly_fee": "string",
          "setup_fee": "string",
          "minimum_commitment": "string",
          "best_for": "string"
        },
        "tier_2": { /* same structure */ },
        "tier_3": { /* same structure */ }
      },
      "pricing_psychology": {
        "anchor_price": "string",
        "recommended_tier": "string",
        "discount_strategy": "string"
      }
    },
    "guarantee_design": {
      "guaranteed_metric": "string",
      "qualified_criteria": ["string"],
      "guarantee_mechanics": {
        "how_it_works": "string",
        "evaluation_period": "string",
        "if_met": "string",
        "if_missed": "string",
        "no_retroactive_billing": true
      },
      "guarantee_statement": "string",
      "mathematical_safety": {
        "why_this_is_safe_for_you": ["string"],
        "why_this_is_fair_for_them": ["string"]
      },
      "exit_conditions": {
        "you_stop_working_if": ["string"]
      }
    },
    "value_proposition": {
      "value_equation": {
        "dream_outcome": "string",
        "likelihood_of_achievement": "string",
        "time_delay": "string",
        "effort_and_sacrifice": "string",
        "calculated_value": "string"
      },
      "functional_benefits": ["string"],
      "emotional_benefits": ["string"],
      "strategic_benefits": ["string"],
      "why_this_works_for_this_niche": "string"
    },
    "offer_naming_and_framing": {
      "recommended_offer_name": "string",
      "naming_rationale": "string",
      "alternative_names": [
        {
          "name": "string",
          "positioning": "string"
        }
      ],
      "headline_formulas": [
        {
          "formula": "string",
          "example": "string",
          "when_to_use": "string"
        }
      ],
      "copywriting_angles": [
        {
          "angle_name": "string",
          "hook": "string",
          "promise": "string",
          "proof_needed": "string"
        }
      ]
    },
    "lead_magnet_strategy": {
      "mini_offer_approach": {
        "concept": "string",
        "why_it_works": "string"
      },
      "recommended_lead_magnets": [
        {
          "type": "string",
          "name": "string",
          "what_it_solves": "string",
          "how_to_deliver": "string",
          "cta": "string",
          "conversion_path": "string"
        }
      ],
      "free_trial_strategy": {
        "offer": "string",
        "structure": "string",
        "qualification_criteria": ["string"],
        "conversion_mechanism": "string"
      }
    },
    "objection_handling": {
      "common_objections": [
        {
          "objection": "string",
          "frequency": "string",
          "underlying_concern": "string",
          "response_framework": {
            "acknowledge": "string",
            "reframe": "string",
            "differentiate": "string",
            "close": "string"
          },
          "proof_to_overcome": "string"
        }
      ],
      "pricing_objections": [
        {
          "objection": "string",
          "response": "string"
        }
      ],
      "guarantee_objections": [
        {
          "objection": "string",
          "response": "string"
        }
      ]
    },
    "proof_requirements": {
      "what_you_need_to_show": [
        {
          "proof_type": "string",
          "priority": "string",
          "how_to_get_it": "string",
          "alternative_if_unavailable": "string"
        }
      ],
      "case_study_framework": {
        "sections": ["string"],
        "key_metrics_to_highlight": ["string"]
      },
      "testimonial_strategy": {
        "ideal_testimonial_format": "string",
        "questions_to_ask": ["string"]
      }
    },
    "sales_enablement": {
      "discovery_call_framework": {
        "duration": "string",
        "goals": ["string"],
        "key_questions": ["string"],
        "qualification_criteria": ["string"],
        "disqualification_signals": ["string"]
      },
      "presentation_sequence": [
        {
          "step": "string",
          "what_to_say": "string",
          "goal": "string"
        }
      ],
      "closing_strategy": {
        "ask": "string",
        "handle_hesitation": "string",
        "next_steps": ["string"]
      }
    },
    "outreach_strategy": {
      "cold_outreach_approach": {
        "tone": "string",
        "aca_framework": {
          "acknowledge": "string",
          "compliment": "string",
          "ask": "string"
        },
        "volume_targets": {
          "messages_per_day": 0,
          "follow_up_sequence": ["string"]
        }
      },
      "personalization_vectors": [
        {
          "vector": "string",
          "where_to_find": "string",
          "how_to_use": "string",
          "impact": "string"
        }
      ],
      "sample_sequences": [
        {
          "sequence_name": "string",
          "target_segment": "string",
          "messages": [
            {
              "day": 0,
              "subject": "string",
              "body": "string"
            }
          ]
        }
      ]
    },
    "competitive_differentiation": {
      "vs_alternatives": [
        {
          "alternative": "string",
          "their_approach": "string",
          "our_approach": "string",
          "key_message": "string"
        }
      ],
      "unique_mechanisms": ["string"],
      "positioning_wedge": "string"
    },
    "implementation_roadmap": {
      "phase_1_actions": [
        {
          "action": "string",
          "timeline": "string",
          "owner": "string"
        }
      ],
      "phase_2_actions": [
        {
          "action": "string",
          "timeline": "string",
          "owner": "string"
        }
      ],
      "phase_3_actions": [
        {
          "action": "string",
          "timeline": "string",
          "owner": "string"
        }
      ],
      "quick_wins": ["string"]
    }
  }
}
```

---

## 3. Architecture Reference

This automation follows the standard **4-file pattern**:

- **Architecture**: `reports/src/features/rag/reports/ARCHITECTURE.md`
- **Reference Implementation**: `reports/src/features/rag/reports/components/niche-intelligence/`
- **Shared Components**: `reports/src/features/rag/reports/components/shared/`
- **Registry**: `reports/src/features/rag/reports/registry.ts`

**Use niche-intelligence as your implementation reference for component patterns.**

---

## 4. Section-by-Section Design Guidance

### Section 1: Target Market

**Fields:** `who_you_sell_to` (object), `their_icp` (object with arrays)

**Conceptual Meaning:**
Defines WHO the agency will target - the specific businesses and decision-makers. This is the foundation that everything else builds on. Understanding their ICP (Ideal Customer Profile) clarifies what you ARE and AREN'T responsible for, preventing scope creep.

**Visual Organization:**
- Primary audience + company size: Large prominent display at top
- Decision makers: Table or cards showing role/influence/concerns
- ICP description: Text card
- Responsibilities: Two-column comparison (what you DO vs. what you DON'T)

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `primary_audience` | ContentCard | variant="accent", large text | Sets the stage, needs prominence |
| `company_size` | StatCard | variant="default" | Quick reference metric |
| `decision_makers` | DataTable or custom cards | Show role, influence, concerns | Structured multi-field data |
| `icp.description` | ContentCard | variant="default" | Contextual overview |
| `your_responsibility` | InsightList | green checkmarks | What you WILL do |
| `not_your_responsibility` | InsightList | red X marks | What you WON'T do |

**Custom Component Needs:**
Consider a two-column comparison component for responsibilities if side-by-side is important. Otherwise, InsightList with different icons works.

**Colors/Variants:**
- Primary audience: `accent` (blue) - foundational
- Responsibilities: `success` tones for what you do, `muted` for what you don't

**Spacing/Layout:**
- Desktop: 2-column for responsibilities comparison
- Mobile: Stack vertically

---

### Section 2: What You Sell

**Fields:** `core_promise`, `what_you_are_not_selling`, `what_you_are_actually_selling`, `why_this_distinction_matters`, `offer_statement`

**Conceptual Meaning:**
The CORE of the offer - what agencies promise vs. what they actually deliver. The distinction between "not selling" and "actually selling" is critical for positioning. Offer statements are the headline copy.

**Visual Organization:**
- Core promise: VERY large, prominent (this is the value prop)
- Two-column: "Not selling" vs. "Actually selling" (contrast is key)
- Why distinction matters: Supporting context below
- Offer statements: Highlighted boxes (primary + secondary)

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `core_promise` | ContentCard | variant="gradient" or "accent", very large text | Hero element, main promise |
| `what_you_are_not_selling` | InsightList | bullets, muted | Clarify boundaries |
| `what_you_are_actually_selling` | ContentCard | variant="success" | Positive framing of value |
| `why_this_distinction_matters` | InsightList | bullets | Supporting rationale |
| `offer_statement.primary` | ContentCard | variant="highlight", large | Headline copy |
| `offer_statement.secondary` | ContentCard | variant="default" | Alternative copy |

**Custom Component Needs:** None

**Colors/Variants:**
- Core promise: `gradient` or `accent` (HERO)
- Actually selling: `success` (positive)
- Not selling: `muted` (de-emphasize)
- Offer statements: `highlight` (copywriting focus)

**Spacing/Layout:**
- Core promise: Extra space above/below
- Offer statements: Side-by-side cards on desktop

---

### Section 3: Offer Structure

**Fields:** `phases` (array of objects with many fields), `timeline_logic`

**Conceptual Meaning:**
The SERVICE DELIVERY blueprint - what happens in each phase, what deliverables are provided, when billing/guarantees apply. This is operational choreography.

**Visual Organization:**
- Timeline visualization showing phases in sequence
- Each phase: Expandable card or numbered card with phase details inside
- Timeline logic: Text explanations for why phases are structured this way

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `phases` | NumberedCard per phase | numbered (1, 2, 3...) | Sequential delivery |
| Inside each phase: `what_happens` | InsightList | bullets | Action items |
| Inside each phase: `deliverables` | InsightList | checkmarks | Client receives these |
| `guarantee_applies` | Badge/tag | green if true | Visual flag |
| `billing_applies` | Badge/tag | blue if true | Financial flag |
| `timeline_logic` | ContentCard per phase | variant="muted" | Rationale context |

**Custom Component Needs:**
Consider a timeline visualization component (horizontal or vertical) with phases as nodes. If not, NumberedCard with nested content works well.

**Colors/Variants:**
- Phases: Numbered, neutral
- Guarantee applies: `success` badge
- Billing applies: `highlight` badge
- Timeline logic: `muted` (supporting explanation)

**Spacing/Layout:**
- Vertical stack of phase cards
- Inside each: Clear subsections for purpose, what happens, deliverables

---

### Section 4: Pricing Architecture

**Fields:** `pilot_pricing` (object), `production_pricing` (tier_1, tier_2, tier_3 objects), `pricing_psychology`

**Conceptual Meaning:**
The MONETIZATION strategy - how agencies price pilot vs. production clients, tiered offerings, and psychological anchoring. This is revenue model design.

**Visual Organization:**
- Pilot pricing: Separate prominent section at top (special case)
- Production tiers: 3-column grid (tier 1, 2, 3) with comparison
- Pricing psychology: Strategic notes below

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `pilot_pricing.strategy` | ContentCard | variant="accent" | Special pricing approach |
| `pilot_pricing.structure` | DataTable | key-value pairs | Financial details |
| `production_pricing.tier_X` | ContentCard or StatCard grid | Each tier as card | Comparison display |
| `tier_X.monthly_fee` | StatCard | variant="highlight" | Key pricing metric |
| `tier_X.best_for` | Text inside card | Helps buyer choose |
| `pricing_psychology` | ContentCard | variant="muted" | Strategic context |

**Custom Component Needs:**
Consider a pricing table component (3-column comparison) if detailed side-by-side is needed. Otherwise, 3 separate ContentCards work.

**Colors/Variants:**
- Pilot: `accent` (special case)
- Tier 2 (recommended): `highlight` or `success` (recommended tier)
- Tiers 1 & 3: `default`
- Psychology: `muted` (background strategy)

**Spacing/Layout:**
- Desktop: 3-column grid for production tiers
- Tablet: 2-column or stack
- Mobile: Stack vertically

---

### Section 5: Guarantee Design

**Fields:** `guaranteed_metric`, `qualified_criteria`, `guarantee_mechanics`, `guarantee_statement`, `mathematical_safety`, `exit_conditions`

**Conceptual Meaning:**
The RISK REVERSAL mechanism - what agencies guarantee, how it works, and why it's mathematically safe for them. This is the trust-builder that removes buyer hesitation.

**Visual Organization:**
- Guaranteed metric: VERY prominent (this is the promise)
- Guarantee statement: Large, highlighted (the actual copy)
- Mechanics: Step-by-step breakdown (how it works)
- Mathematical safety: Two-column (safe for you, fair for them)
- Exit conditions: Warning-styled list (when you stop working)

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `guaranteed_metric` | ContentCard | variant="success", very large | The promise |
| `guarantee_statement` | ContentCard | variant="highlight", large text | Copy for marketing |
| `guarantee_mechanics` | ContentCard or DataTable | structured explanation | How it works |
| `qualified_criteria` | InsightList | checkmarks | Requirements to qualify |
| `mathematical_safety.why_this_is_safe_for_you` | InsightList | green/success | Agency protection |
| `mathematical_safety.why_this_is_fair_for_them` | InsightList | blue/accent | Client fairness |
| `exit_conditions.you_stop_working_if` | InsightList | variant="danger" or "warning" | Boundaries |

**Custom Component Needs:** None

**Colors/Variants:**
- Guaranteed metric: `success` (positive promise)
- Guarantee statement: `highlight` (copywriting focus)
- Safety for you: `success` tones
- Fair for them: `accent` tones
- Exit conditions: `warning` or `danger` (serious boundaries)

**Spacing/Layout:**
- Guarantee statement: Extra prominent space
- Mathematical safety: Two-column on desktop

---

### Section 6: Value Proposition

**Fields:** `value_equation` (dream, likelihood, time delay, effort, calculated value), `functional_benefits`, `emotional_benefits`, `strategic_benefits`, `why_this_works_for_this_niche`

**Conceptual Meaning:**
The VALUE LOGIC - Alex Hormozi's value equation components, plus benefit categories. This explains WHY the offer is valuable from multiple angles (functional, emotional, strategic).

**Visual Organization:**
- Value equation: Large structured display (4 components + calculated value)
- Benefits: Three separate lists (functional, emotional, strategic)
- Why this works: Niche-specific context card

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `value_equation` | Custom display or ContentCard | Show all 4 components | Structured formula |
| `calculated_value` | StatCard | variant="highlight", large | Final value score |
| `functional_benefits` | InsightList | bullets | Practical outcomes |
| `emotional_benefits` | InsightList | bullets | Feeling outcomes |
| `strategic_benefits` | InsightList | bullets | Business outcomes |
| `why_this_works_for_this_niche` | ContentCard | variant="accent" | Niche fit explanation |

**Custom Component Needs:**
Consider a visual value equation component (formula display with icons). If not, DataTable or structured ContentCard works.

**Colors/Variants:**
- Calculated value: `highlight` (result)
- Benefits: All `default` (informational)
- Niche fit: `accent` (important context)

**Spacing/Layout:**
- Desktop: 3-column for benefits
- Mobile: Stack vertically

---

### Section 7: Offer Naming and Framing

**Fields:** `recommended_offer_name`, `naming_rationale`, `alternative_names`, `headline_formulas`, `copywriting_angles`

**Conceptual Meaning:**
The MESSAGING TOOLKIT - what to call the offer, why, alternative names, headline templates, and copywriting angles. This is the creative/marketing layer.

**Visual Organization:**
- Recommended name: Large, prominent (the winner)
- Naming rationale: Supporting context
- Alternative names: Comparison cards
- Headline formulas: Template cards (formula + example)
- Copywriting angles: Expandable cards (hook, promise, proof)

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `recommended_offer_name` | ContentCard | variant="success", very large | The chosen name |
| `naming_rationale` | ContentCard | variant="muted" | Why this works |
| `alternative_names` | ContentCard per option | Show name + positioning | Alternatives |
| `headline_formulas` | ContentCard or collapsible | Formula, example, when to use | Templates |
| `copywriting_angles` | Collapsible or NumberedCard | Hook, promise, proof | Detailed angles |

**Custom Component Needs:** None

**Colors/Variants:**
- Recommended name: `success` (approved choice)
- Alternatives: `default` (options)
- Formulas: `accent` (templates)
- Angles: `default` (tactical)

**Spacing/Layout:**
- Headline formulas: Stack vertically
- Copywriting angles: May need collapsible if many angles

---

### Section 8: Lead Magnet Strategy

**Fields:** `mini_offer_approach`, `recommended_lead_magnets`, `free_trial_strategy`

**Conceptual Meaning:**
The LEAD GENERATION playbook - how to attract prospects with mini-offers, what lead magnets to create, and free trial structure. This is top-of-funnel strategy.

**Visual Organization:**
- Mini offer concept: Overview card at top
- Lead magnets: Cards with type, name, what it solves, delivery, CTA
- Free trial: Separate section with structure and criteria

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `mini_offer_approach.concept` | ContentCard | variant="accent" | Strategic framework |
| `recommended_lead_magnets` | NumberedCard or ContentCard per magnet | Show all fields | Multiple lead magnet options |
| `free_trial_strategy` | ContentCard | variant="default" | Alternative approach |
| `qualification_criteria` | InsightList | checkmarks | Who qualifies |

**Custom Component Needs:** None

**Colors/Variants:**
- Mini offer: `accent` (strategic concept)
- Lead magnets: `default` or `highlight` (options)
- Free trial: `default`

**Spacing/Layout:**
- Lead magnets: Stack vertically or grid if many

---

### Section 9: Objection Handling

**Fields:** `common_objections` (array with response_framework), `pricing_objections`, `guarantee_objections`

**Conceptual Meaning:**
The SALES ARMOR - anticipated objections and scripted responses. The response framework (acknowledge, reframe, differentiate, close) is a tactical sales pattern.

**Visual Organization:**
- Common objections: Expandable cards (objection → response framework)
- Pricing objections: Q&A format
- Guarantee objections: Q&A format

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `common_objections` | Collapsible or NumberedCard | Objection as title | Detailed responses |
| `response_framework` | DataTable or structured display | 4 steps | Sales script |
| `pricing_objections` | DataTable or Q&A cards | Objection → response | Quick reference |
| `guarantee_objections` | DataTable or Q&A cards | Objection → response | Quick reference |

**Custom Component Needs:** None (collapsible + DataTable handle complexity)

**Colors/Variants:**
- Objections: `warning` or `muted` (challenges)
- Responses: `default` (solutions)

**Spacing/Layout:**
- Stack objections vertically
- Use collapsible if many objections

---

### Section 10: Proof Requirements

**Fields:** `what_you_need_to_show`, `case_study_framework`, `testimonial_strategy`

**Conceptual Meaning:**
The CREDIBILITY BLUEPRINT - what proof agencies need to build trust (case studies, testimonials, metrics). This is social proof strategy.

**Visual Organization:**
- Proof types: Priority-ranked list
- Case study framework: Template structure
- Testimonial strategy: Format + questions to ask

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `what_you_need_to_show` | NumberedCard or DataTable | Priority, type, how to get it | Ranked proof types |
| `case_study_framework.sections` | InsightList | ordered list | Template structure |
| `key_metrics_to_highlight` | InsightList | bullets | Key data points |
| `testimonial_strategy` | ContentCard | Format + questions | Collection strategy |

**Custom Component Needs:** None

**Colors/Variants:**
- High priority proof: `highlight` or `success`
- Frameworks: `default` (templates)

**Spacing/Layout:**
- Vertical stack
- Case study and testimonial as separate subsections

---

### Section 11: Sales Enablement

**Fields:** `discovery_call_framework`, `presentation_sequence`, `closing_strategy`

**Conceptual Meaning:**
The SALES PLAYBOOK - how to run discovery calls, present the offer, and close deals. This is process choreography for sales conversations.

**Visual Organization:**
- Discovery call: Duration, goals, questions, qualification criteria
- Presentation sequence: Step-by-step numbered flow
- Closing: The ask, handling hesitation, next steps

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `discovery_call_framework` | ContentCard with subsections | Multiple lists | Structured framework |
| `key_questions` | InsightList | numbered | Sales questions |
| `presentation_sequence` | NumberedCard per step | Step, what to say, goal | Sequential flow |
| `closing_strategy` | ContentCard | variant="success" | Final close |
| `next_steps` | InsightList | numbered | Post-close actions |

**Custom Component Needs:** None

**Colors/Variants:**
- Discovery: `accent` (framework)
- Presentation: Numbered, `default`
- Closing: `success` (final step)

**Spacing/Layout:**
- Three clear subsections
- Presentation sequence: Numbered vertical flow

---

### Section 12: Outreach Strategy

**Fields:** `cold_outreach_approach`, `personalization_vectors`, `sample_sequences`

**Conceptual Meaning:**
The PROSPECTING PLAYBOOK - how to cold outreach (tone, ACA framework, volume), personalization tactics, and sample email sequences. This is top-of-funnel execution.

**Visual Organization:**
- ACA framework: Structured breakdown (Acknowledge, Compliment, Ask)
- Volume targets: Metrics (messages per day, follow-ups)
- Personalization vectors: Table (where to find, how to use, impact)
- Sample sequences: Expandable per sequence (day-by-day messages)

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `aca_framework` | ContentCard or DataTable | 3 components | Messaging structure |
| `volume_targets.messages_per_day` | StatCard | variant="highlight" | Key metric |
| `personalization_vectors` | DataTable | 4 columns | Tactical table |
| `sample_sequences` | Collapsible per sequence | Day-by-day messages | Email templates |

**Custom Component Needs:** None

**Colors/Variants:**
- ACA framework: `accent` (strategic)
- Volume: `highlight` (key metric)
- Sequences: `default` (templates)

**Spacing/Layout:**
- ACA: Structured display
- Sequences: Collapsible to manage length

---

### Section 13: Competitive Differentiation

**Fields:** `vs_alternatives`, `unique_mechanisms`, `positioning_wedge`

**Conceptual Meaning:**
The COMPETITIVE POSITIONING - how this offer differs from alternatives (DIY, hiring in-house, other agencies). The positioning wedge is the strategic angle that makes competitors irrelevant.

**Visual Organization:**
- Vs alternatives: Comparison table (their approach, our approach, key message)
- Unique mechanisms: List of differentiators
- Positioning wedge: Large prominent statement (the strategic insight)

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `vs_alternatives` | DataTable or comparison cards | 3 columns | Side-by-side comparison |
| `unique_mechanisms` | InsightList | bullets | Differentiators |
| `positioning_wedge` | ContentCard | variant="success" or "accent", large | Strategic statement |

**Custom Component Needs:**
Consider a comparison table component (side-by-side). Otherwise, DataTable or repeated cards work.

**Colors/Variants:**
- Alternatives: `default` (comparison)
- Unique mechanisms: `highlight` (differentiators)
- Positioning wedge: `success` or `accent` (strategic insight)

**Spacing/Layout:**
- Positioning wedge: Extra prominent, large text
- Alternatives: Table or stacked comparison cards

---

### Section 14: Implementation Roadmap

**Fields:** `phase_1_actions`, `phase_2_actions`, `phase_3_actions`, `quick_wins`

**Conceptual Meaning:**
The ACTION PLAN - what agencies need to do to implement this offer, broken into phases. Quick wins are the immediate actions that show fast progress.

**Visual Organization:**
- Three phase sections (phase 1, 2, 3) with action lists
- Each action: Action, timeline, owner
- Quick wins: Highlighted list at top or bottom (easy wins)

**Component Recommendations:**

| Field | Component | Variant/Props | Rationale |
|-------|-----------|---------------|-----------|
| `phase_X_actions` | DataTable or ContentCard per action | Action, timeline, owner | Action items |
| `quick_wins` | InsightList | variant="success", checkmarks | Easy wins |

**Custom Component Needs:** None

**Colors/Variants:**
- Quick wins: `success` (positive, easy)
- Phase actions: `default` (tactical)

**Spacing/Layout:**
- Three phase sections clearly separated
- Quick wins: Prominent placement (top or bottom)

---

## 5. User Journey & Flow

### Section Prominence Hierarchy

1. **What You Sell + Core Promise** (Section 2) - The value prop (users start here)
2. **Pricing + Guarantee** (Sections 4, 5) - Financial/risk decision (critical for buy-in)
3. **Offer Structure** (Section 3) - What they get (operational understanding)
4. **Sales Enablement + Objection Handling** (Sections 9, 11) - Tactical execution (how to sell)
5. **Supporting sections** (All others) - Context and enablement

### Narrative Flow

- **Sections 1-2**: WHO and WHAT (target market, core promise)
- **Sections 3-5**: HOW and HOW MUCH (structure, pricing, guarantee)
- **Section 6-8**: WHY and HOW TO ATTRACT (value prop, naming, lead magnets)
- **Sections 9-12**: HOW TO SELL (objections, proof, sales enablement, outreach)
- **Sections 13-14**: COMPETITIVE EDGE and ACTION PLAN (differentiation, roadmap)

### Emphasis Patterns

- **Highest emphasis**: Core promise, guarantee statement, pricing tiers, positioning wedge
- **Medium emphasis**: Offer structure phases, objection responses, sales sequences
- **Lower emphasis**: Rationales, alternatives, supporting context

---

## 6. Custom Components Needed

### 1. Pricing Comparison Table (Optional)
**What it displays:** Three-column comparison of pricing tiers (tier 1, 2, 3) with features/pricing side-by-side

**Why shared might not work:** DataTable doesn't do side-by-side tier comparison elegantly. May need custom grid.

**Suggested design:**
- Three equal-width columns
- Header: Tier name
- Rows: Monthly fee, setup fee, commitment, best for
- Highlight recommended tier

### 2. Timeline Visualization (Optional)
**What it displays:** Horizontal or vertical timeline showing offer phases in sequence

**Why shared might not work:** NumberedCard works but doesn't show sequential flow visually

**Suggested design:**
- Horizontal timeline with phase nodes
- Lines connecting phases
- Expandable details per phase

### 3. Response Framework Display (Optional)
**What it displays:** 4-step objection response (acknowledge, reframe, differentiate, close)

**Why shared might not work:** DataTable works but may not show flow/progression clearly

**Suggested design:**
- 4-step visual flow (arrows or numbers)
- Each step: Label + response text

**If these custom components are too complex, use NumberedCard, DataTable, and ContentCard - they'll work fine.**

---

## 7. Visual Design Notes

### Color Meaning

| Variant | Color | Use For | Example Sections |
|---------|-------|---------|---------|
| `highlight` | Blue | Key metrics, important copy | Pricing, offer statements, volume targets |
| `success` | Green | Positive elements, wins | Guaranteed metric, recommended tier, quick wins, positioning wedge |
| `warning` | Yellow | Caution, boundaries | Exit conditions, objection flags |
| `danger` | Red | Serious boundaries, risks | Exit conditions |
| `muted` | Gray | Context, rationales, background | Timeline logic, pricing psychology, naming rationale |
| `accent` | Blue/purple | Strategic frameworks | Target market, ACA framework, mini offer concept |
| `gradient` | Gradient | Hero elements | Core promise |

### Emphasis Guidelines

- **Largest/boldest**: Core promise, guarantee statement, pricing tiers, positioning wedge (decision-critical)
- **Prominent**: Offer structure phases, objection responses, sales sequences (tactical execution)
- **Subtle**: Rationales, alternatives, supporting explanations (background context)

### Spacing & Grouping

- **Between sections**: `space-y-10` (generous, comprehensive report needs breathing room)
- **Within sections**: `space-y-6` (clear subsection grouping)
- **Between list items**: `space-y-3` (readable separation)
- **Between cards**: `space-y-4` or `gap-4` (visual clarity)

### Responsive Breakpoints

- **Mobile (< 768px)**: All single column, stack everything, collapsible sections for complex data
- **Tablet (768-1024px)**: 2-column grids for comparisons, single column for text
- **Desktop (> 1024px)**: 3-column for pricing tiers, 2-column for comparisons, full-width for complex tables

---

## Implementation Checklist

After reading this guide, you should understand:

- [ ] What each section means conceptually (offer design context)
- [ ] Which sections are decision-critical vs. tactical execution
- [ ] How to visually organize each section (layout, hierarchy, comparisons)
- [ ] Which shared components to use for each data type
- [ ] Which colors communicate the right meaning (promise, caution, strategic)
- [ ] Where custom components might be needed (pricing comparison, timeline, response framework)
- [ ] The user journey through the report (understand → decide → execute)

**Next Steps:**
1. Reference `reports/components/niche-intelligence/` for implementation patterns
2. Build the 4-file structure (types.ts, transform.ts, OfferArchitectReport.tsx, sections/)
3. Register in registry.ts
4. Test with real data
5. Consider custom components for pricing comparison and timeline if needed

---

**Remember:** This guide explains WHAT the offer architecture data means and HOW to present it visually. The reports project architecture docs explain HOW to implement with code. This is a comprehensive 14-section offer design system - prioritize clarity and scanability.
