import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { motion } from "framer-motion";
import { Target, Clock, CheckCircle, XCircle, Lightbulb, ChevronRight, AlertTriangle, MessageSquare } from "lucide-react";
import { icpData } from "@/data/icpData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const stageColors = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-rose-500",
];

export const PurchaseJourneySection = () => {
  const journey = (icpData.data.buyer_icp as any).purchase_journey;
  
  if (!journey) return null;

  return (
    <SectionWrapper
      id="purchase-journey"
      number="05"
      title="Purchase Journey"
      subtitle="How these customers evaluate and buy solutions"
    >
      {/* Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Confidence"
          value={`${(journey.confidence * 100).toFixed(0)}%`}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          label="Journey Stages"
          value={journey.stages.length}
          icon={<Clock className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Key Objections"
          value={journey.objections_and_handling.length}
          icon={<MessageSquare className="w-5 h-5" />}
        />
      </div>

      {/* Journey Stages */}
      <div className="mb-10">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Buying Journey Stages
        </h4>
        
        {/* Timeline visualization */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-border hidden md:block" />
          
          <div className="space-y-6">
            {journey.stages.map((stage: any, index: number) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  {/* Stage number */}
                  <div className={`w-10 h-10 rounded-full ${stageColors[index % stageColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 z-10`}>
                    {index + 1}
                  </div>
                  
                  {/* Stage content */}
                  <div className="flex-1 bg-card rounded-xl border border-border p-5 report-shadow">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h5 className="text-base font-display font-semibold text-foreground">
                        {stage.stage}
                      </h5>
                      <span className="px-2 py-1 bg-muted rounded-full text-xs font-body text-muted-foreground">
                        {stage.typical_duration}
                      </span>
                    </div>
                    
                    <p className="text-sm font-body text-muted-foreground mb-4">
                      {stage.what_happens}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Customer Activities */}
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body font-medium block mb-2">
                          Customer Activities
                        </span>
                        <ul className="space-y-1">
                          {stage.customer_activities.slice(0, 3).map((activity: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs font-body text-foreground">
                              <ChevronRight className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What They Need */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <span className="text-xs uppercase tracking-wider text-blue-700 font-body font-medium block mb-2">
                          What They Need
                        </span>
                        <p className="text-xs font-body text-blue-900">{stage.what_they_need}</p>
                      </div>

                      {/* Your Goal */}
                      <div className="bg-primary rounded-lg p-3">
                        <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body font-medium block mb-2">
                          Your Goal
                        </span>
                        <p className="text-xs font-body text-primary-foreground">{stage.your_goal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="mb-10">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Evaluation Criteria
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Must Haves */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h5 className="text-sm uppercase tracking-wider text-green-700 font-body font-medium">
                Must-Haves
              </h5>
            </div>
            <ul className="space-y-2">
              {journey.evaluation_criteria.must_haves.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm font-body text-green-900">
                  <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Differentiators */}
          <div className="bg-accent/10 rounded-xl p-5 border border-accent/20">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-accent" />
              <h5 className="text-sm uppercase tracking-wider text-accent font-body font-medium">
                Differentiators
              </h5>
            </div>
            <ul className="space-y-2">
              {journey.evaluation_criteria.differentiators.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground">
                  <ChevronRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deal Breakers */}
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-red-600" />
              <h5 className="text-sm uppercase tracking-wider text-red-700 font-body font-medium">
                Deal Breakers
              </h5>
            </div>
            <ul className="space-y-2">
              {journey.evaluation_criteria.deal_breakers.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm font-body text-red-900">
                  <ChevronRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Objections & Handling */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Common Objections & Handling
        </h4>
        <Accordion type="single" collapsible className="space-y-3">
          {journey.objections_and_handling.map((obj: any, index: number) => (
            <AccordionItem
              key={obj.objection}
              value={obj.objection}
              className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3 w-full text-left">
                  <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </span>
                  <span className="text-sm font-display font-medium text-foreground">
                    "{obj.objection}"
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <div className="ml-11 space-y-4">
                  {/* Underlying Concern */}
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <span className="text-xs uppercase tracking-wider text-amber-700 font-body font-medium block mb-1">
                      Underlying Concern
                    </span>
                    <p className="text-sm font-body text-amber-900">{obj.underlying_concern}</p>
                  </div>

                  {/* Handling Approach */}
                  <div className="bg-primary rounded-lg p-3">
                    <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body font-medium block mb-1">
                      Handling Approach
                    </span>
                    <p className="text-sm font-body text-primary-foreground">{obj.handling_approach}</p>
                  </div>

                  {/* Proof to Provide */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <span className="text-xs uppercase tracking-wider text-green-700 font-body font-medium block mb-1">
                      Proof to Provide
                    </span>
                    <p className="text-sm font-body text-green-900">{obj.proof_to_provide}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionWrapper>
  );
};
