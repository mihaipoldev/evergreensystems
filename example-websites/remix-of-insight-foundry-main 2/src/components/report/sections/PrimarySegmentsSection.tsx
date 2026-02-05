import { motion } from "framer-motion";
import { SectionWrapper } from "../SectionWrapper";
import { TagCloud } from "../TagCloud";
import { ChevronRight, Clock, DollarSign, Target, TrendingUp, AlertCircle } from "lucide-react";
import { icpData } from "@/data/icpData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const priorityColors: Record<number, string> = {
  1: "bg-accent text-accent-foreground",
  2: "bg-primary text-primary-foreground",
  3: "bg-blue-600 text-white",
  4: "bg-purple-600 text-white",
  5: "bg-slate-600 text-white",
};

export const PrimarySegmentsSection = () => {
  const segments = icpData.data.buyer_icp.segments;

  return (
    <SectionWrapper
      id="primary-segments"
      number="08"
      title="Primary Segments"
      subtitle="High-priority customer segments ranked by fit and deal economics"
    >
      {/* Assignment Logic Summary */}
      <div className="bg-secondary/50 rounded-lg p-5 border border-border mb-8">
        <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
          Segment Assignment Logic
        </h4>
        <p className="text-sm font-body text-foreground mb-3">
          <strong>Method:</strong> {segments.assignment_logic.method.replace(/_/g, ' ')}
        </p>
        <ul className="space-y-2">
          {segments.assignment_logic.rules.slice(0, 3).map((rule, index) => (
            <li key={index} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Primary Segments */}
      <Accordion type="single" collapsible className="space-y-4">
        {segments.primary.map((segment, index) => (
          <AccordionItem
            key={segment.name}
            value={segment.name}
            className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-4 w-full">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${priorityColors[segment.priority]}`}>
                  {segment.priority}
                </span>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-display font-semibold text-foreground">
                    {segment.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mt-1 line-clamp-1">
                    {segment.description.slice(0, 100)}...
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {/* Description */}
              <p className="text-sm font-body text-foreground mb-6 leading-relaxed">
                {segment.description}
              </p>

              {/* Deal Economics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-accent" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">Deal Size</span>
                  </div>
                  <p className="text-sm font-display font-semibold text-foreground">
                    {segment.deal_economics.typical_deal_size}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">Sales Cycle</span>
                  </div>
                  <p className="text-sm font-display font-semibold text-foreground">
                    {segment.deal_economics.sales_cycle.split(' (')[0]}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">Close Rate</span>
                  </div>
                  <p className="text-sm font-display font-semibold text-foreground">
                    {segment.deal_economics.close_rate_vs_average.split(' - ')[0]}
                  </p>
                </div>
              </div>

              {/* Typical Profile */}
              <div className="mb-6">
                <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
                  Typical Profile
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <span className="text-xs text-muted-foreground font-body block mb-1">Employees</span>
                    <span className="text-sm font-body font-medium text-foreground">{segment.typical_profile.employee_count}</span>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <span className="text-xs text-muted-foreground font-body block mb-1">Revenue</span>
                    <span className="text-sm font-body font-medium text-foreground">{segment.typical_profile.revenue_range}</span>
                  </div>
                  {'funding_stage' in segment.typical_profile && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <span className="text-xs text-muted-foreground font-body block mb-1">Funding</span>
                      <span className="text-sm font-body font-medium text-foreground">{segment.typical_profile.funding_stage}</span>
                    </div>
                  )}
                  {'geographic_concentration' in segment.typical_profile && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <span className="text-xs text-muted-foreground font-body block mb-1">Geography</span>
                      <span className="text-sm font-body font-medium text-foreground">{segment.typical_profile.geographic_concentration}</span>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-xs text-muted-foreground font-body block mb-2">Industries</span>
                  <TagCloud tags={segment.typical_profile.industries} variant="gold" />
                </div>
              </div>

              {/* How to Identify */}
              <div className="mb-6">
                <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
                  How to Identify
                </h5>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-accent font-body font-medium block mb-2">Required Signals</span>
                    <ul className="space-y-2">
                      {segment.how_to_identify.required_signals.map((signal, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-accent/10 rounded-md p-2 border border-accent/20">
                          <Target className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-body font-medium block mb-2">Supporting Signals</span>
                    <ul className="space-y-1.5">
                      {segment.how_to_identify.supporting_signals.slice(0, 4).map((signal, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="mb-6">
                <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
                  Timing Windows
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <span className="text-xs text-green-700 font-body font-medium block mb-1">Best Window</span>
                    <span className="text-sm font-body text-green-900">{segment.timing.best_window}</span>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <span className="text-xs text-amber-700 font-body font-medium block mb-1">Still Viable</span>
                    <span className="text-sm font-body text-amber-900">{segment.timing.still_viable}</span>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <span className="text-xs text-red-700 font-body font-medium block mb-1">Urgency Fades</span>
                    <span className="text-sm font-body text-red-900">{segment.timing.urgency_fades}</span>
                  </div>
                </div>
              </div>

              {/* Why They Buy */}
              <div className="bg-primary rounded-lg p-4">
                <h5 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body mb-2">
                  Why They Buy
                </h5>
                <p className="text-sm font-body text-primary-foreground leading-relaxed">
                  {segment.why_they_buy}
                </p>
              </div>

              {/* Best Angles */}
              <div className="mt-4">
                <span className="text-xs text-muted-foreground font-body block mb-2">Best Angles</span>
                <TagCloud 
                  tags={segment.best_angles.map(a => a.replace(/_/g, ' '))} 
                  variant="outline" 
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionWrapper>
  );
};
