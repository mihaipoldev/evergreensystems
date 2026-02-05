import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { Zap, Clock, AlertTriangle, XCircle, ChevronRight, Target, TrendingDown, Calendar, Search } from "lucide-react";
import { icpData } from "@/data/icpData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const urgencyColors = {
  high: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-600 text-white" },
  medium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-500 text-white" },
  low: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-500 text-white" },
};

export const TriggersSection = () => {
  const triggers = (icpData.data.buyer_icp as any).triggers;
  
  if (!triggers) return null;

  return (
    <SectionWrapper
      id="triggers"
      number="04"
      title="Buying Triggers"
      subtitle="Events and circumstances that cause customers to actively seek solutions"
    >
      {/* Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Confidence"
          value={`${(triggers.confidence * 100).toFixed(0)}%`}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          label="High Urgency Triggers"
          value={triggers.high_urgency.length}
          icon={<Zap className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Total Triggers"
          value={triggers.high_urgency.length + triggers.medium_urgency.length + triggers.low_urgency.length}
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* High Urgency Triggers */}
      <TriggerCategory 
        title="High Urgency Triggers" 
        triggers={triggers.high_urgency} 
        urgency="high"
        description="Act quickly - these signals indicate immediate buying intent"
      />

      {/* Medium Urgency Triggers */}
      <TriggerCategory 
        title="Medium Urgency Triggers" 
        triggers={triggers.medium_urgency} 
        urgency="medium"
        description="Engage and nurture - these signals indicate sustained but not immediate interest"
      />

      {/* Low Urgency Triggers */}
      <TriggerCategory 
        title="Low Urgency Triggers" 
        triggers={triggers.low_urgency} 
        urgency="low"
        description="Long-term nurture - these signals indicate research phase, not active buying"
      />

      {/* Cooling Signals */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-2 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-slate-500" />
          Cooling Signals
        </h4>
        <p className="text-sm text-muted-foreground font-body mb-4">
          {triggers.cooling_signals.description}
        </p>
        <div className="space-y-3">
          {triggers.cooling_signals.signals.map((signal: any, index: number) => (
            <motion.div
              key={signal.signal}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-lg border border-border p-4 report-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <h5 className="text-sm font-display font-semibold text-foreground">{signal.signal}</h5>
                  <p className="text-xs text-muted-foreground font-body mt-1">{signal.meaning}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
                <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
                  <span className="text-xs uppercase tracking-wider text-amber-700 font-body font-medium block mb-1">Recommended Action</span>
                  <p className="text-xs font-body text-amber-900">{signal.action}</p>
                </div>
                <div className="bg-green-50 rounded-md p-3 border border-green-200">
                  <span className="text-xs uppercase tracking-wider text-green-700 font-body font-medium block mb-1">Revisit When</span>
                  <p className="text-xs font-body text-green-900">{signal.revisit_when}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disqualifying Signals */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-2 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          Disqualifying Signals
        </h4>
        <p className="text-sm text-muted-foreground font-body mb-4">
          Hard stops - these signals indicate the prospect is not a fit and should be removed from pipeline
        </p>
        <div className="space-y-3">
          {triggers.disqualifying_signals.map((signal: any, index: number) => (
            <motion.div
              key={signal.signal}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-red-50 rounded-lg border border-red-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-display font-semibold text-red-900">{signal.signal}</h5>
                  <p className="text-xs text-red-700 font-body mt-1 mb-2">{signal.description}</p>
                  <div className="bg-white/50 rounded-md p-2 border border-red-200">
                    <span className="text-xs font-body font-medium text-red-800 block mb-1">Why Disqualifying:</span>
                    <p className="text-xs font-body text-red-700">{signal.why_disqualifying}</p>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs font-body font-medium text-red-800">Detection: </span>
                    <span className="text-xs font-body text-red-700">{signal.detection}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

interface TriggerCategoryProps {
  title: string;
  triggers: any[];
  urgency: 'high' | 'medium' | 'low';
  description: string;
}

const TriggerCategory = ({ title, triggers, urgency, description }: TriggerCategoryProps) => {
  const colors = urgencyColors[urgency];
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${colors.badge}`}>
          {urgency.toUpperCase()}
        </span>
        <h4 className="text-lg font-display font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground font-body mb-4">{description}</p>
      
      <Accordion type="single" collapsible className="space-y-3">
        {triggers.map((trigger: any, index: number) => (
          <AccordionItem
            key={trigger.trigger}
            value={trigger.trigger}
            className={`${colors.bg} rounded-xl border ${colors.border} overflow-hidden`}
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/50">
              <div className="flex items-center gap-4 w-full">
                <div className={`w-10 h-10 rounded-full ${colors.badge} flex items-center justify-center flex-shrink-0`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <h3 className={`text-base font-display font-semibold ${colors.text}`}>
                    {trigger.trigger}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mt-0.5 line-clamp-1">
                    {trigger.description}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 bg-white/30">
              {/* Full Description */}
              <p className="text-sm font-body text-foreground mb-5 leading-relaxed">
                {trigger.description}
              </p>

              {/* Why It Works */}
              <div className="bg-primary rounded-lg p-4 mb-5">
                <h5 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body mb-2">
                  Why This Trigger Works
                </h5>
                <p className="text-sm font-body text-primary-foreground leading-relaxed">
                  {trigger.why_it_works}
                </p>
              </div>

              {/* Timing */}
              <div className="mb-5">
                <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timing Windows
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <span className="text-xs text-green-700 font-body font-medium block mb-1">Peak Urgency</span>
                    <span className="text-sm font-body text-green-900">{trigger.timing.peak_urgency}</span>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <span className="text-xs text-emerald-700 font-body font-medium block mb-1">Still Good</span>
                    <span className="text-sm font-body text-emerald-900">{trigger.timing.still_good}</span>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <span className="text-xs text-amber-700 font-body font-medium block mb-1">Urgency Fading</span>
                    <span className="text-sm font-body text-amber-900">{trigger.timing.urgency_fading}</span>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <span className="text-xs text-red-700 font-body font-medium block mb-1">Likely Too Late</span>
                    <span className="text-sm font-body text-red-900">{trigger.timing.likely_too_late}</span>
                  </div>
                </div>
              </div>

              {/* Detection Sources */}
              <div>
                <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Detection Sources
                </h5>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {trigger.detection_sources.map((source: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-card rounded-md p-2 border border-border">
                      <ChevronRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
