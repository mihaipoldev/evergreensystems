"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faLightbulb,
  faChevronRight,
  faTriangleExclamation,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

const stageColors = [
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary/80",
  "bg-primary",
  "bg-accent",
];

interface PurchaseJourneySectionProps {
  data: ReportData;
}

export const PurchaseJourneySection = ({ data }: PurchaseJourneySectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: Record<string, unknown> }).buyer_icp;
  const journey = buyerIcp?.purchase_journey as Record<string, unknown> | undefined;

  if (!journey) {
    return (
      <SectionWrapper id="purchase-journey" number="5.3" title="Purchase Journey" subtitle="How these customers evaluate and buy solutions">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  const stages = (journey.stages as Array<Record<string, unknown>>) ?? [];
  const evaluationCriteria = (journey.evaluation_criteria as Record<string, unknown>) ?? {};
  const objectionsAndHandling = (journey.objections_and_handling as Array<Record<string, unknown>>) ?? [];
  const hasConfidence = typeof journey.confidence === "number";

  return (
    <SectionWrapper
      id="purchase-journey"
      number="5.3"
      title="Purchase Journey"
      subtitle="How these customers evaluate and buy solutions"
    >
      <div className={`grid grid-cols-1 gap-4 mb-8 ${hasConfidence ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {hasConfidence && (
          <StatCard
            label="Confidence"
            value={`${((journey.confidence as number) * 100).toFixed(0)}%`}
            icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />}
          />
        )}
        <StatCard
          label="Journey Stages"
          value={stages.length}
          icon={<FontAwesomeIcon icon={faClock} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Key Objections"
          value={objectionsAndHandling.length}
          icon={<FontAwesomeIcon icon={faMessage} className="w-5 h-5" />}
        />
      </div>

      <div className="mb-10">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Buying Journey Stages
        </h4>
        <div className="relative">
          <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-border hidden md:block" />
          <div className="space-y-6">
            {stages.map((stage: Record<string, unknown>, index: number) => (
              <motion.div
                key={stage.stage as string}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full ${stageColors[index % stageColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 z-10`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-card rounded-xl border border-border p-5 report-shadow">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h5 className="text-base font-display font-semibold text-foreground">
                        {stage.stage as string}
                      </h5>
                      <span className="px-2 py-1 bg-muted rounded-full text-xs font-body text-muted-foreground">
                        {stage.typical_duration as string}
                      </span>
                    </div>
                    <p className="text-sm font-body text-muted-foreground mb-4">
                      {stage.what_happens as string}
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body font-medium block mb-2">
                          Customer Activities
                        </span>
                        <ul className="space-y-1">
                          {(stage.customer_activities as string[]).slice(0, 3).map((activity: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs font-body text-foreground">
                              <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <span className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 font-body font-medium block mb-2">
                          What They Need
                        </span>
                        <p className="text-xs font-body text-blue-900 dark:text-blue-200">{stage.what_they_need as string}</p>
                      </div>
                      <div className="bg-primary rounded-lg p-3">
                        <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body font-medium block mb-2">
                          Your Goal
                        </span>
                        <p className="text-xs font-body text-primary-foreground">{stage.your_goal as string}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Evaluation Criteria
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border report-shadow">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faCircleCheck} className="w-5 h-5 text-green-600" />
              <h5 className="text-base font-display font-semibold text-foreground">
                Must-Haves
              </h5>
            </div>
            <ul className="space-y-2">
              {(evaluationCriteria.must_haves as string[]).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm font-body text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border report-shadow">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5 text-accent" />
              <h5 className="text-base font-display font-semibold text-foreground">
                Differentiators
              </h5>
            </div>
            <ul className="space-y-2">
              {(evaluationCriteria.differentiators as string[]).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm font-body text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border report-shadow">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faCircleXmark} className="w-5 h-5 text-red-600" />
              <h5 className="text-base font-display font-semibold text-foreground">
                Deal Breakers
              </h5>
            </div>
            <ul className="space-y-2">
              {(evaluationCriteria.deal_breakers as string[]).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm font-body text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-amber-500" />
          Common Objections & Handling
        </h4>
        <Accordion type="single" collapsible className="space-y-3">
          {objectionsAndHandling.map((obj: Record<string, unknown>) => (
            <AccordionItem
              key={obj.objection as string}
              value={obj.objection as string}
              className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3 w-full text-left">
                  <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 text-amber-600" />
                  </span>
                  <span className="text-sm font-display font-medium text-foreground">
                    &quot;{obj.objection as string}&quot;
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-5 pt-5 pb-5 space-y-4 border-t border-border">
                  <div>
                    <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-body font-medium mb-2">
                      Underlying Concern
                    </h5>
                    <p className="text-sm font-body text-foreground leading-relaxed">{obj.underlying_concern as string}</p>
                  </div>
                  <div>
                    <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-body font-medium mb-2">
                      Handling Approach
                    </h5>
                    <p className="text-sm font-body text-foreground leading-relaxed">{obj.handling_approach as string}</p>
                  </div>
                  <div>
                    <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-body font-medium mb-2">
                      Proof to Provide
                    </h5>
                    <p className="text-sm font-body text-foreground leading-relaxed">{obj.proof_to_provide as string}</p>
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
