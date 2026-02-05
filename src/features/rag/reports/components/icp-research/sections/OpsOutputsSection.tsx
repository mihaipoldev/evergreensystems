"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faBuilding,
  faMapPin,
  faChartLine,
  faCode,
  faBriefcase,
  faMagnifyingGlass,
  faFileLines,
  faChartBar,
  faCircleCheck,
  faCircleXmark,
  faChevronRight,
  faFilter,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { TagCloud } from "../../shared/TagCloud";
import { BlockHeader } from "../../shared/BlockHeader";
import { ContentCard } from "../../shared/ContentCard";
import { InsightList } from "../../shared/InsightList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ReportData } from "../../../types";

type OpsOutputsPayload = Record<string, unknown>;

interface OpsOutputsSectionProps {
  data?: ReportData;
}

/** Replaced in report flow by TargetingCriteriaSection (03) + TacticalPlaybooksSection (07). Kept for reference and exports. */
export const OpsOutputsSection = ({ data }: OpsOutputsSectionProps) => {
  const ops = data ? (data.data as { ops_outputs?: OpsOutputsPayload }).ops_outputs : undefined;

  if (!ops) return null;

  return (
    <SectionWrapper
      id="ops-outputs"
      number="07"
      title="Ops Outputs"
      subtitle="Actionable outputs for direct use in list building and campaign execution"
    >
      <Tabs defaultValue="targeting" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto bg-transparent mb-6">
          <TabsTrigger value="targeting" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-2">
            Targeting
          </TabsTrigger>
          <TabsTrigger value="titles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-2">
            Title Packs
          </TabsTrigger>
          <TabsTrigger value="segmentation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-2">
            Segmentation
          </TabsTrigger>
          <TabsTrigger value="messaging" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-2">
            Messaging
          </TabsTrigger>
          <TabsTrigger value="qualification" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs px-3 py-2">
            Qualification
          </TabsTrigger>
        </TabsList>

        {/* Targeting Tab */}
        <TabsContent value="targeting" className="space-y-6">
          <TargetingContent targeting={ops.targeting_quick_reference} exclusions={Array.isArray(ops.exclusion_rules) ? (ops.exclusion_rules as string[]) : undefined} />
        </TabsContent>

        {/* Title Packs Tab */}
        <TabsContent value="titles" className="space-y-6">
          <TitlePacksContent titles={ops.title_packs} />
        </TabsContent>

        {/* Segmentation Tab */}
        <TabsContent value="segmentation" className="space-y-6">
          <SegmentationContent rules={ops.segmentation_rules} />
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messaging" className="space-y-6">
          <MessagingContent messaging={ops.messaging_map} />
        </TabsContent>

        {/* Qualification Tab */}
        <TabsContent value="qualification" className="space-y-6">
          <QualificationContent 
            criteria={ops.qualification_criteria} 
            enrichment={ops.enrichment_checklist}
            handoff={ops.sales_handoff_template}
            monitoring={ops.monitoring_alerts}
            sizing={ops.market_sizing}
          />
        </TabsContent>
      </Tabs>
    </SectionWrapper>
  );
};

// Exported for use in TargetingCriteriaSection and TacticalPlaybooksSection
export const TargetingContent = ({ targeting, exclusions }: { targeting: any; exclusions?: string[] }) => {
  if (!targeting?.firmographics) return null;
  const firmographics = targeting.firmographics;
  const industries = targeting.industries ?? {};
  const technographics = targeting.technographics ?? {};
  const positiveSignals = technographics.positive_signals ?? {};
  const exclusionList = Array.isArray(exclusions) ? exclusions : [];
  // DB schema may use current_property_management; fallback to current_crm for legacy
  const currentCrm = positiveSignals.current_property_management ?? positiveSignals.current_crm ?? [];
  const painIndicators = positiveSignals.pain_indicators ?? [];
  const negativeSignals = technographics.negative_signals ?? [];
  const behavioralSignals = Array.isArray(targeting.behavioral_signals) ? targeting.behavioral_signals : [];
  const strongFit = Array.isArray(industries.strong_fit) ? industries.strong_fit : [];
  const moderateFit = Array.isArray(industries.moderate_fit) ? industries.moderate_fit : [];
  const weakFit = Array.isArray(industries.weak_fit) ? industries.weak_fit : [];

  return (
  <div className="space-y-8">
    {/* Firmographics */}
    <div>
      <BlockHeader
        variant="title"
        title="Firmographic Filters"
        icon={<FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-accent" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">Employee Count</span>
          <p className="text-sm font-display font-semibold text-foreground">{firmographics.employee_count?.range ?? "—"}</p>
          <p className="text-xs text-accent font-body mt-1">Sweet Spot: {firmographics.employee_count?.sweet_spot ?? "—"}</p>
          <p className="text-xs text-muted-foreground font-body mt-2">{firmographics.employee_count?.filter_format ?? ""}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">Revenue Range</span>
          <p className="text-sm font-display font-semibold text-foreground">{firmographics.revenue_range?.range ?? "—"}</p>
          <p className="text-xs text-accent font-body mt-1">Sweet Spot: {firmographics.revenue_range?.sweet_spot ?? "—"}</p>
          <p className="text-xs text-muted-foreground font-body mt-2">{firmographics.revenue_range?.note ?? ""}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">Growth Rate</span>
          <p className="text-sm font-display font-semibold text-foreground">{firmographics.growth_rate ?? "—"}</p>
        </div>
      </div>

      <div className="mt-4">
        <BlockHeader variant="label" title="Geography" />
        <TagCloud
          tags={Array.isArray(firmographics.geography?.concentrations) ? firmographics.geography.concentrations : []}
          variant="accent"
        />
      </div>
    </div>

    {/* Industry Fit */}
    <div>
      <BlockHeader variant="title" title="Industry Fit" />
      <div className="space-y-4">
        <ContentCard variant="green" style="summary" title="Strong Fit">
          <div className="space-y-2">
            {strongFit.map((ind: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-body font-medium text-foreground">{ind.name}</span>
                  <p className="text-xs text-muted-foreground font-body">{ind.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
        <ContentCard variant="warning" style="summary" title="Moderate Fit">
          <div className="space-y-2">
            {moderateFit.map((ind: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-body font-medium text-foreground">{ind.name}</span>
                  <p className="text-xs text-muted-foreground font-body">{ind.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
        <ContentCard variant="danger" style="summary" title="Weak Fit (Avoid)">
          <div className="space-y-2">
            {weakFit.map((ind: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleXmark} className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-body font-medium text-foreground">{ind.name}</span>
                  <p className="text-xs text-muted-foreground font-body">{ind.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </div>

    {/* Technographics */}
    <div>
      <BlockHeader
        variant="title"
        title="Technographic Signals"
        icon={<FontAwesomeIcon icon={faCode} className="w-5 h-5 text-accent" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContentCard variant="green" style="summary" title="Positive Signals">
          <div className="space-y-3">
            <div>
              <BlockHeader variant="label" title="Current CRM / Property Mgmt" />
              <div className="flex flex-wrap gap-1 mt-1">
                {currentCrm.map((crm: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-muted text-foreground text-xs rounded-full font-body border border-border">{crm}</span>
                ))}
              </div>
            </div>
            <div>
              <BlockHeader variant="label" title="Pain Indicators" />
              <ul className="mt-1 space-y-1">
                {painIndicators.slice(0, 3).map((pain: string, i: number) => (
                  <li key={i} className="text-xs font-body text-foreground flex items-start gap-1">
                    <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                    {pain}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ContentCard>
        <ContentCard variant="danger" style="summary" title="Negative Signals">
          <ul className="space-y-2">
            {negativeSignals.map((signal: string, i: number) => (
              <li key={i} className="text-xs font-body text-foreground flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleXmark} className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                {signal}
              </li>
            ))}
          </ul>
        </ContentCard>
      </div>
    </div>

    {/* Behavioral Signals */}
    <div>
      <BlockHeader
        variant="title"
        title="Behavioral Signals to Monitor"
        icon={<FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-accent" />}
      />
      <InsightList items={behavioralSignals} type="accent" />
    </div>

    {/* Exclusion Rules */}
    <div>
      <BlockHeader
        variant="title"
        title="Exclusion Rules"
        icon={<FontAwesomeIcon icon={faFilter} className="w-5 h-5 text-destructive" />}
      />
      <InsightList items={exclusionList} type="danger" />
    </div>
  </div>
  );
};

export const TitlePacksContent = ({ titles }: { titles: any }) => (
  <>
    <p className="text-sm text-muted-foreground font-body mb-4">{titles.description}</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Champion Titles */}
      <div className="bg-card rounded-xl p-5 border border-border report-shadow border-l-4 border-l-accent">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />
          <h5 className="text-sm uppercase tracking-wider text-foreground font-body font-medium">Champion Titles</h5>
        </div>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto">
          {titles.champion_titles.map((title: string, i: number) => (
            <li key={i} className="text-xs font-body text-foreground bg-muted/50 rounded px-2 py-1">{title}</li>
          ))}
        </ul>
      </div>

      {/* Economic Buyer Titles */}
      <div className="bg-card rounded-xl p-5 border border-border report-shadow border-l-4 border-l-green-500">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5 text-green-500" />
          <h5 className="text-sm uppercase tracking-wider text-foreground font-body font-medium">Economic Buyer</h5>
        </div>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto">
          {titles.economic_buyer_titles.map((title: string, i: number) => (
            <li key={i} className="text-xs font-body text-foreground bg-muted/50 rounded px-2 py-1">{title}</li>
          ))}
        </ul>
      </div>

      {/* Technical Evaluator Titles */}
      <div className="bg-card rounded-xl p-5 border border-border report-shadow border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faCode} className="w-5 h-5 text-blue-500" />
          <h5 className="text-sm uppercase tracking-wider text-foreground font-body font-medium">Technical Evaluator</h5>
        </div>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto">
          {titles.technical_evaluator_titles.map((title: string, i: number) => (
            <li key={i} className="text-xs font-body text-foreground bg-muted/50 rounded px-2 py-1">{title}</li>
          ))}
        </ul>
      </div>
    </div>

    {/* Titles to Exclude */}
    <div className="mt-6">
      <BlockHeader variant="label" title="Titles to Exclude" />
      <TagCloud tags={titles.titles_to_exclude} variant="outline" />
    </div>
  </>
);

// Segmentation Content Component
const SegmentationContent = ({ rules }: { rules: any }) => (
  <>
    <p className="text-sm text-muted-foreground font-body mb-4">{rules.description}</p>
    
    <div className="space-y-3">
      {rules.rules.map((rule: any, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className="bg-card rounded-lg border border-border p-4 report-shadow"
        >
          <div className="flex items-start gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
              rule.then_priority === 'High' ? 'bg-red-500' : 
              rule.then_priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
            }`}>
              {rule.priority}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-body font-medium ${
                  rule.then_priority === 'High' ? 'bg-red-100 text-red-800' : 
                  rule.then_priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {rule.then_priority}
                </span>
                <span className="text-sm font-display font-semibold text-foreground">{rule.then_segment}</span>
              </div>
              <div className="space-y-2 text-xs font-body">
                <p><span className="text-accent font-medium">IF:</span> {rule.if}</p>
                <p><span className="text-muted-foreground font-medium">AND:</span> {rule.and}</p>
              </div>
              <div className="mt-3">
                <span className="text-xs text-muted-foreground font-body">Best Angles:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {rule.best_angles.map((angle: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-body">
                      {angle.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </>
);

export const MessagingContent = ({ messaging }: { messaging: any }) => (
  <>
    <p className="text-sm text-muted-foreground font-body mb-4">{messaging.description}</p>
    
    <div className="space-y-4">
      {messaging.mappings.map((msg: any, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4">
            <div className="bg-secondary p-5 lg:border-r border-border">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                Persona
              </span>
              <h5 className="text-lg font-display font-semibold text-foreground">
                {msg.persona}
              </h5>
              <p className="text-sm text-muted-foreground font-body mt-2">
                {msg.trigger_id} → {msg.segment}
              </p>
            </div>
            <div className="lg:col-span-3 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                    Angle
                  </span>
                  <p className="text-sm font-body text-foreground">
                    {msg.angle}
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                  Hook
                </span>
                <p className="text-sm font-body text-foreground italic">
                  "{msg.hook}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                    Pain to Hit
                  </span>
                  <p className="text-sm font-body text-foreground">
                    {msg.pain_to_hit}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                    Proof to Reference
                  </span>
                  <p className="text-sm font-body text-foreground">
                    {msg.proof_to_reference}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                  CTA
                </span>
                <p className="text-sm font-body text-foreground">
                  {msg.cta}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </>
);

export const QualificationContent = ({ criteria, enrichment, handoff, monitoring, sizing }: { 
  criteria: any; 
  enrichment: any;
  handoff: any;
  monitoring: any;
  sizing: any;
}) => (
  <>
    {/* Qualification Grades */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* A Grade */}
      <div className="bg-card rounded-xl p-4 border border-border report-shadow border-l-4 border-l-green-500">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">A</span>
          <span className="text-sm font-display font-semibold text-foreground">{criteria.a_grade.label}</span>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-3">Expected: {criteria.a_grade.expected_conversion}</p>
        <ul className="space-y-1.5">
          {criteria.a_grade.criteria.slice(0, 3).map((c: string, i: number) => (
            <li key={i} className="text-xs font-body text-foreground flex items-start gap-2">
              <FontAwesomeIcon icon={faCircleCheck} className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* B Grade */}
      <div className="bg-card rounded-xl p-4 border border-border report-shadow border-l-4 border-l-blue-500">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">B</span>
          <span className="text-sm font-display font-semibold text-foreground">{criteria.b_grade.label}</span>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-3">Expected: {criteria.b_grade.expected_conversion}</p>
        <ul className="space-y-1.5">
          {criteria.b_grade.criteria.slice(0, 3).map((c: string, i: number) => (
            <li key={i} className="text-xs font-body text-foreground flex items-start gap-2">
              <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* C Grade */}
      <div className="bg-card rounded-xl p-4 border border-border report-shadow border-l-4 border-l-yellow-500">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">C</span>
          <span className="text-sm font-display font-semibold text-foreground">{criteria.c_grade.label}</span>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-3">Expected: {criteria.c_grade.expected_conversion}</p>
        <ul className="space-y-1.5">
          {criteria.c_grade.criteria.slice(0, 3).map((c: string, i: number) => (
            <li key={i} className="text-xs font-body text-foreground flex items-start gap-2">
              <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Disqualify */}
      <div className="bg-card rounded-xl p-4 border border-border report-shadow border-l-4 border-l-red-500">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">X</span>
          <span className="text-sm font-display font-semibold text-foreground">{criteria.disqualify.label}</span>
        </div>
        <ul className="space-y-1.5 mt-6">
          {criteria.disqualify.criteria.slice(0, 3).map((c: string, i: number) => (
            <li key={i} className="text-xs font-body text-foreground flex items-start gap-2">
              <FontAwesomeIcon icon={faCircleXmark} className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Market Sizing */}
    {sizing && sizing.description && sizing.description !== "" && (
      <div className="mb-8">
        <BlockHeader
          variant="title"
          title="Market Sizing"
          icon={<FontAwesomeIcon icon={faChartBar} className="w-5 h-5 text-accent" />}
          subtitle={sizing.description}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
            <p className="text-2xl font-display font-bold text-foreground">{sizing.estimates.total_matching_firmographics.range}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Total Matching</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center border border-border">
            <p className="text-2xl font-display font-bold text-foreground">{sizing.estimates.with_relevant_technology.range}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">With Technology</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center border border-border border-l-4 border-l-accent">
            <p className="text-2xl font-display font-bold text-accent">{sizing.estimates.with_active_trigger.range}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Active Triggers</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center border border-border border-l-4 border-l-primary">
            <p className="text-2xl font-display font-bold text-primary">{sizing.estimates.immediately_addressable.range}</p>
            <p className="text-xs text-muted-foreground font-body mt-1">Addressable Now</p>
          </div>
        </div>
      </div>
    )}

    {/* Enrichment Sequence */}
    {enrichment && enrichment.enrichment_sequence && enrichment.enrichment_sequence.length > 0 && (
      <div>
        <BlockHeader
          variant="title"
          title="Enrichment Sequence"
          icon={<FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5 text-accent" />}
        />
        <div className="space-y-2">
          {enrichment.enrichment_sequence.map((step: string, i: number) => (
            <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3 border border-border">
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm font-body text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);
