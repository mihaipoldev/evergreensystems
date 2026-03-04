import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Target, Users, Filter, MessageSquare, CheckCircle, XCircle, ChevronRight, Building, MapPin, TrendingUp, Code, AlertTriangle, Briefcase, Search, FileText, BarChart3 } from "lucide-react";
import { icpData } from "@/data/icpData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TagCloud } from "../TagCloud";

export const OpsOutputsSection = () => {
  const ops = (icpData.data.buyer_icp as any).ops_outputs;
  
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
          <TargetingContent targeting={ops.targeting_quick_reference} exclusions={ops.exclusion_rules} />
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

// Targeting Content Component
const TargetingContent = ({ targeting, exclusions }: { targeting: any; exclusions: string[] }) => (
  <>
    {/* Firmographics */}
    <div className="bg-card rounded-xl border border-border p-5 report-shadow">
      <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Building className="w-5 h-5 text-accent" />
        Firmographic Filters
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">Employee Count</span>
          <p className="text-sm font-display font-semibold text-foreground">{targeting.firmographics.employee_count.range}</p>
          <p className="text-xs text-accent font-body mt-1">Sweet Spot: {targeting.firmographics.employee_count.sweet_spot}</p>
          <p className="text-xs text-muted-foreground font-body mt-2">{targeting.firmographics.employee_count.filter_format}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">Revenue Range</span>
          <p className="text-sm font-display font-semibold text-foreground">{targeting.firmographics.revenue_range.range}</p>
          <p className="text-xs text-accent font-body mt-1">Sweet Spot: {targeting.firmographics.revenue_range.sweet_spot}</p>
          <p className="text-xs text-muted-foreground font-body mt-2">{targeting.firmographics.revenue_range.note}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">Growth Rate</span>
          <p className="text-sm font-display font-semibold text-foreground">{targeting.firmographics.growth_rate}</p>
        </div>
      </div>
      
      {/* Geography */}
      <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-xs uppercase tracking-wider text-blue-700 font-body font-medium">Geography</span>
        </div>
        <p className="text-sm font-body text-blue-900 mb-2">{targeting.firmographics.geography.primary}</p>
        <TagCloud tags={targeting.firmographics.geography.concentrations} variant="outline" />
      </div>
    </div>

    {/* Industries */}
    <div className="bg-card rounded-xl border border-border p-5 report-shadow">
      <h4 className="text-lg font-display font-semibold text-foreground mb-4">Industry Fit</h4>
      <div className="space-y-4">
        {/* Strong Fit */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <span className="text-xs uppercase tracking-wider text-green-700 font-body font-medium block mb-3">Strong Fit</span>
          <div className="space-y-2">
            {targeting.industries.strong_fit.map((ind: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-body font-medium text-green-900">{ind.name}</span>
                  <p className="text-xs text-green-700 font-body">{ind.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Moderate Fit */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <span className="text-xs uppercase tracking-wider text-amber-700 font-body font-medium block mb-3">Moderate Fit</span>
          <div className="space-y-2">
            {targeting.industries.moderate_fit.map((ind: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-body font-medium text-amber-900">{ind.name}</span>
                  <p className="text-xs text-amber-700 font-body">{ind.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Fit */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <span className="text-xs uppercase tracking-wider text-red-700 font-body font-medium block mb-3">Weak Fit (Avoid)</span>
          <div className="space-y-2">
            {targeting.industries.weak_fit.map((ind: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-body font-medium text-red-900">{ind.name}</span>
                  <p className="text-xs text-red-700 font-body">{ind.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Technographics */}
    <div className="bg-card rounded-xl border border-border p-5 report-shadow">
      <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Code className="w-5 h-5 text-accent" />
        Technographic Signals
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <span className="text-xs uppercase tracking-wider text-green-700 font-body font-medium block mb-3">Positive Signals</span>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-green-600 font-body">Current CRM</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {targeting.technographics.positive_signals.current_crm.map((crm: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-body">{crm}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-green-600 font-body">Pain Indicators</span>
              <ul className="mt-1 space-y-1">
                {targeting.technographics.positive_signals.pain_indicators.slice(0, 3).map((pain: string, i: number) => (
                  <li key={i} className="text-xs font-body text-green-800 flex items-start gap-1">
                    <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    {pain}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <span className="text-xs uppercase tracking-wider text-red-700 font-body font-medium block mb-3">Negative Signals</span>
          <ul className="space-y-2">
            {targeting.technographics.negative_signals.map((signal: string, i: number) => (
              <li key={i} className="text-xs font-body text-red-800 flex items-start gap-2">
                <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* Behavioral Signals */}
    <div className="bg-accent/10 rounded-xl p-5 border border-accent/20">
      <h4 className="text-sm uppercase tracking-wider text-accent font-body font-medium mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Behavioral Signals to Monitor
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {targeting.behavioral_signals.map((signal: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-sm font-body text-foreground">
            <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            {signal}
          </div>
        ))}
      </div>
    </div>

    {/* Exclusion Rules */}
    <div className="bg-red-50 rounded-xl p-5 border border-red-200">
      <h4 className="text-lg font-display font-semibold text-red-900 mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-red-600" />
        Exclusion Rules
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {exclusions.map((rule: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-sm font-body text-red-800 bg-white/50 rounded-md p-2">
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            {rule}
          </div>
        ))}
      </div>
    </div>
  </>
);

// Title Packs Content Component
const TitlePacksContent = ({ titles }: { titles: any }) => (
  <>
    <p className="text-sm text-muted-foreground font-body mb-4">{titles.description}</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Champion Titles */}
      <div className="bg-accent/10 rounded-xl p-5 border border-accent/20">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-accent" />
          <h5 className="text-sm uppercase tracking-wider text-accent font-body font-medium">Champion Titles</h5>
        </div>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto">
          {titles.champion_titles.map((title: string, i: number) => (
            <li key={i} className="text-xs font-body text-foreground bg-white/50 rounded px-2 py-1">{title}</li>
          ))}
        </ul>
      </div>

      {/* Economic Buyer Titles */}
      <div className="bg-green-50 rounded-xl p-5 border border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-green-600" />
          <h5 className="text-sm uppercase tracking-wider text-green-700 font-body font-medium">Economic Buyer</h5>
        </div>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto">
          {titles.economic_buyer_titles.map((title: string, i: number) => (
            <li key={i} className="text-xs font-body text-green-900 bg-white/50 rounded px-2 py-1">{title}</li>
          ))}
        </ul>
      </div>

      {/* Technical Evaluator Titles */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-blue-600" />
          <h5 className="text-sm uppercase tracking-wider text-blue-700 font-body font-medium">Technical Evaluator</h5>
        </div>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto">
          {titles.technical_evaluator_titles.map((title: string, i: number) => (
            <li key={i} className="text-xs font-body text-blue-900 bg-white/50 rounded px-2 py-1">{title}</li>
          ))}
        </ul>
      </div>
    </div>

    {/* Titles to Exclude */}
    <div className="bg-red-50 rounded-lg p-4 border border-red-200 mt-4">
      <span className="text-xs uppercase tracking-wider text-red-700 font-body font-medium block mb-2">Titles to Exclude</span>
      <div className="flex flex-wrap gap-2">
        {titles.titles_to_exclude.map((title: string, i: number) => (
          <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-body">{title}</span>
        ))}
      </div>
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

// Messaging Content Component
const MessagingContent = ({ messaging }: { messaging: any }) => (
  <>
    <p className="text-sm text-muted-foreground font-body mb-4">{messaging.description}</p>
    
    <Accordion type="single" collapsible className="space-y-3">
      {messaging.mappings.map((msg: any, index: number) => (
        <AccordionItem
          key={index}
          value={`msg-${index}`}
          className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3 w-full text-left">
              <MessageSquare className="w-5 h-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm font-display font-semibold text-foreground">{msg.persona}</p>
                <p className="text-xs text-muted-foreground font-body">{msg.trigger_id} → {msg.segment}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="space-y-4">
              <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
                <span className="text-xs uppercase tracking-wider text-accent font-body font-medium block mb-1">Angle</span>
                <p className="text-sm font-body text-foreground">{msg.angle}</p>
              </div>
              
              <div className="bg-primary rounded-lg p-3">
                <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body font-medium block mb-1">Hook</span>
                <p className="text-sm font-body text-primary-foreground italic">"{msg.hook}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <span className="text-xs uppercase tracking-wider text-amber-700 font-body font-medium block mb-1">Pain to Hit</span>
                  <p className="text-xs font-body text-amber-900">{msg.pain_to_hit}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <span className="text-xs uppercase tracking-wider text-green-700 font-body font-medium block mb-1">Proof to Reference</span>
                  <p className="text-xs font-body text-green-900">{msg.proof_to_reference}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <span className="text-xs uppercase tracking-wider text-blue-700 font-body font-medium block mb-1">CTA</span>
                <p className="text-sm font-body text-blue-900">{msg.cta}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </>
);

// Qualification Content Component
const QualificationContent = ({ criteria, enrichment, handoff, monitoring, sizing }: { 
  criteria: any; 
  enrichment: any;
  handoff: any;
  monitoring: any;
  sizing: any;
}) => (
  <>
    {/* Qualification Grades */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* A Grade */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">A</span>
          <span className="text-sm font-display font-semibold text-green-800">{criteria.a_grade.label}</span>
        </div>
        <p className="text-xs text-green-700 font-body mb-2">Expected: {criteria.a_grade.expected_conversion}</p>
        <ul className="space-y-1">
          {criteria.a_grade.criteria.slice(0, 3).map((c: string, i: number) => (
            <li key={i} className="text-xs font-body text-green-900 flex items-start gap-1">
              <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* B Grade */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">B</span>
          <span className="text-sm font-display font-semibold text-blue-800">{criteria.b_grade.label}</span>
        </div>
        <p className="text-xs text-blue-700 font-body mb-2">Expected: {criteria.b_grade.expected_conversion}</p>
        <ul className="space-y-1">
          {criteria.b_grade.criteria.slice(0, 3).map((c: string, i: number) => (
            <li key={i} className="text-xs font-body text-blue-900 flex items-start gap-1">
              <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* C Grade */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">C</span>
          <span className="text-sm font-display font-semibold text-amber-800">{criteria.c_grade.label}</span>
        </div>
        <p className="text-xs text-amber-700 font-body mb-2">Expected: {criteria.c_grade.expected_conversion}</p>
        <ul className="space-y-1">
          {criteria.c_grade.criteria.slice(0, 3).map((c: string, i: number) => (
            <li key={i} className="text-xs font-body text-amber-900 flex items-start gap-1">
              <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Disqualify */}
      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">X</span>
          <span className="text-sm font-display font-semibold text-red-800">{criteria.disqualify.label}</span>
        </div>
        <ul className="space-y-1">
          {criteria.disqualify.criteria.slice(0, 3).map((c: string, i: number) => (
            <li key={i} className="text-xs font-body text-red-900 flex items-start gap-1">
              <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Market Sizing */}
    <div className="bg-card rounded-xl border border-border p-5 report-shadow mb-6">
      <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-accent" />
        Market Sizing
      </h4>
      <p className="text-sm text-muted-foreground font-body mb-4">{sizing.description}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{sizing.estimates.total_matching_firmographics.range}</p>
          <p className="text-xs text-muted-foreground font-body mt-1">Total Matching</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{sizing.estimates.with_relevant_technology.range}</p>
          <p className="text-xs text-muted-foreground font-body mt-1">With Technology</p>
        </div>
        <div className="bg-accent/10 rounded-lg p-4 text-center border border-accent/20">
          <p className="text-2xl font-display font-bold text-accent">{sizing.estimates.with_active_trigger.range}</p>
          <p className="text-xs text-muted-foreground font-body mt-1">Active Triggers</p>
        </div>
        <div className="bg-primary rounded-lg p-4 text-center">
          <p className="text-2xl font-display font-bold text-primary-foreground">{sizing.estimates.immediately_addressable.range}</p>
          <p className="text-xs text-primary-foreground/70 font-body mt-1">Addressable Now</p>
        </div>
      </div>
    </div>

    {/* Enrichment Sequence */}
    <div className="bg-card rounded-xl border border-border p-5 report-shadow">
      <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-accent" />
        Enrichment Sequence
      </h4>
      <div className="space-y-2">
        {enrichment.enrichment_sequence.map((step: string, i: number) => (
          <div key={i} className="flex items-start gap-3 bg-secondary/50 rounded-lg p-3">
            <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
              {i + 1}
            </span>
            <p className="text-sm font-body text-foreground">{step}</p>
          </div>
        ))}
      </div>
    </div>
  </>
);
