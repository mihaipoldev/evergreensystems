/**
 * ════════════════════════════════════════════════════════════════
 *  AUTOMATION REGISTRY — single source of truth
 * ════════════════════════════════════════════════════════════════
 *
 * To add a new automation:
 *   1. Create the component folder under `components/<name>/`
 *      with types.ts (sections), transform.ts, and root component
 *   2. Add an entry to AUTOMATIONS below
 *   3. Done — transforms, router, header, and sections all read from here.
 *
 * Automations that share the same transform/component/sections but
 * have different headers are separate entries (e.g. descriptive-intelligence
 * reuses niche-intelligence's rendering but has its own header).
 */

import type { ReactElement } from "react";
import type { ReportData, ReportSection, HeaderConfig } from "./types";

// ── Components ──
import { NicheReport } from "./components/niche-intelligence/NicheReport";
import { ICPReport } from "./components/icp-research";
import { NicheEvaluation } from "./components/niche-evaluation";
import { OutboundStrategyReport } from "./components/outbound-strategy";
import { OfferArchitectReport } from "./components/offer-architect";

// ── Transforms ──
import { transformNicheIntelligence } from "./components/niche-intelligence/transform";
import { transformICPResearch } from "./components/icp-research/transform";
import { transformNicheEvaluation } from "./components/niche-evaluation/transform";
import { transformOutboundStrategy } from "./components/outbound-strategy/transform";
import { transformOfferArchitect } from "./components/offer-architect/transform";

// ── Section definitions ──
import { NICHE_INTELLIGENCE_SECTIONS } from "./components/niche-intelligence/types";
import { ICP_SECTIONS } from "./components/icp-research/types";
import { NICHE_EVALUATION_SECTIONS } from "./components/niche-evaluation/types";
import { OUTBOUND_SECTIONS } from "./components/outbound-strategy/types";
import { OFFER_ARCHITECT_SECTIONS } from "./components/offer-architect/types";

// ── Types ────────────────────────────────────────────────────────

export type AutomationTransform = (payload: {
  meta: Record<string, any>;
  data: Record<string, any>;
}) => ReportData;

export type ReportComponent = (props: {
  data: ReportData;
  reportId: string;
}) => ReactElement;

export type AutomationDescriptor = {
  /** Primary kebab-case automation_name */
  name: string;
  /** Additional automation_name values that route here (same header) */
  aliases: string[];
  /** Header configuration */
  header: HeaderConfig;
  /** Table-of-contents section definitions */
  sections: ReportSection[];
  /** Transform function: raw payload → ReportData */
  transform: AutomationTransform;
  /** Root report component */
  component: ReportComponent;
};

// ── The registry ──────────────────────────────────────────────────

export const AUTOMATIONS: AutomationDescriptor[] = [
  // ─ Niche Intelligence ─
  {
    name: "niche-intelligence",
    aliases: [],
    header: {
      reportTypeLabel: "Niche Intelligence Report",
      modeLabel: "Lead Generation Targeting Mode",
      subtitle:
        "Comprehensive Market Intelligence & Strategic Targeting Analysis",
      showStatsCards: true,
    },
    sections: NICHE_INTELLIGENCE_SECTIONS,
    transform: transformNicheIntelligence,
    component: NicheReport,
  },
  {
    name: "descriptive-intelligence",
    aliases: [],
    header: {
      reportTypeLabel: "Niche Intelligence Report",
      modeLabel: "Descriptive Intelligence Mode",
      subtitle: "Comprehensive Market Intelligence & Niche Analysis",
      showStatsCards: true,
    },
    sections: NICHE_INTELLIGENCE_SECTIONS,
    transform: transformNicheIntelligence,
    component: NicheReport,
  },

  // ─ ICP Research ─
  {
    name: "icp-research",
    aliases: ["customer-intelligence", "niche-customer-research"],
    header: {
      reportTypeLabel: "ICP Research Report",
      modeLabel: "Customer Research Mode",
      subtitle: "Ideal Customer Profile & Buyer Intelligence",
      showStatsCards: false,
    },
    sections: ICP_SECTIONS,
    transform: transformICPResearch,
    component: ICPReport,
  },

  // ─ Niche Fit Evaluation ─
  {
    name: "niche-fit-evaluation",
    aliases: [],
    header: {
      reportTypeLabel: "Niche Evaluation Report",
      modeLabel: "Strategic Assessment Mode",
      subtitle: "Detailed Niche Analysis & Opportunity Evaluation",
      showStatsCards: false,
    },
    sections: NICHE_EVALUATION_SECTIONS,
    transform: transformNicheEvaluation,
    component: NicheEvaluation,
  },

  // ─ Outbound Strategy ─
  {
    name: "outbound-strategy",
    aliases: ["lead-gen-targeting"],
    header: {
      reportTypeLabel: "Outbound Strategy Report",
      modeLabel: "Lead Gen Targeting Mode",
      subtitle:
        "Comprehensive Outbound Sales Strategy & Targeting Playbook",
      showStatsCards: true,
    },
    sections: OUTBOUND_SECTIONS,
    transform: transformOutboundStrategy,
    component: OutboundStrategyReport,
  },
  // ─ Offer Architect ─
  {
    name: "offer-architect",
    aliases: [],
    header: {
      reportTypeLabel: "Offer Architecture Report",
      modeLabel: "Offer Design Mode",
      subtitle:
        "Complete Offer Architecture Including Pricing, Guarantees & Positioning",
      showStatsCards: true,
    },
    sections: OFFER_ARCHITECT_SECTIONS,
    transform: transformOfferArchitect,
    component: OfferArchitectReport,
  },
];

// ── Derived lookup maps (built once at module load) ──────────────

function buildMap<T>(pick: (d: AutomationDescriptor) => T): Record<string, T> {
  const map: Record<string, T> = {};
  for (const d of AUTOMATIONS) {
    const value = pick(d);
    map[d.name] = value;
    for (const alias of d.aliases) {
      map[alias] = value;
    }
  }
  return map;
}

/** automation_name → AutomationTransform */
export const TRANSFORM_MAP = buildMap((d) => d.transform);

/** automation_name → ReportComponent */
export const COMPONENT_MAP = buildMap((d) => d.component);

/** automation_name → HeaderConfig */
export const HEADER_MAP = buildMap((d) => d.header);

/** automation_name → ReportSection[] */
export const SECTIONS_MAP = buildMap((d) => d.sections);
