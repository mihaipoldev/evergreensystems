"use client";

import { motion } from "framer-motion";
import {
  SectionWrapper,
  StatCard,
  ContentCard,
  InsightList,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faChalkboardTeacher,
  faHandshake,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface SalesEnablementSectionProps {
  data: NonNullable<OfferArchitectData["sales_enablement"]>;
  sectionNumber?: string;
}

export const SalesEnablementSection = ({
  data,
  sectionNumber = "11",
}: SalesEnablementSectionProps) => {
  const discovery = data.discovery_call_framework;
  const closing = data.closing_strategy;

  return (
    <SectionWrapper
      id="sales-enablement"
      number={sectionNumber}
      title="Sales Enablement"
      subtitle="Sales playbook: discovery calls, presentations, and closing"
    >
      <div className="space-y-8">
        {/* Discovery Call Framework */}
        {discovery && (
          <div>
            <BlockHeader
              variant="title"
              title="Discovery Call Framework"
              icon={<FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-accent" />}
            />

            {discovery.duration && (
              <div className="mb-4">
                <StatCard
                  label="Call Duration"
                  value={discovery.duration}
                  icon={<FontAwesomeIcon icon={faClock} className="w-5 h-5" />}
                  variant="muted"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {discovery.goals && discovery.goals.length > 0 && (
                <div>
                  <BlockHeader variant="label" title="Goals" />
                  <InsightList items={discovery.goals} type="accent" />
                </div>
              )}
              {discovery.key_questions && discovery.key_questions.length > 0 && (
                <div>
                  <BlockHeader variant="label" title="Key Questions" />
                  <InsightList items={discovery.key_questions} type="info" numbered />
                </div>
              )}
              {discovery.qualification_criteria && discovery.qualification_criteria.length > 0 && (
                <div>
                  <BlockHeader variant="label" title="Qualification Criteria" />
                  <InsightList items={discovery.qualification_criteria} type="success" />
                </div>
              )}
              {discovery.disqualification_signals && discovery.disqualification_signals.length > 0 && (
                <div>
                  <BlockHeader variant="label" title="Disqualification Signals" />
                  <InsightList items={discovery.disqualification_signals} type="danger" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Presentation Sequence */}
        {data.presentation_sequence && data.presentation_sequence.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Presentation Sequence"
              icon={<FontAwesomeIcon icon={faChalkboardTeacher} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-3">
              {data.presentation_sequence.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 report-shadow"
                >
                  <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-base font-display font-semibold text-foreground">
                      {step.step || `Step ${index + 1}`}
                    </h4>
                    {step.what_to_say && (
                      <p className="text-sm font-body text-foreground mt-1 leading-relaxed">
                        {step.what_to_say}
                      </p>
                    )}
                    {step.goal && (
                      <p className="text-xs font-body text-muted-foreground mt-2">
                        <span className="font-medium text-accent">Goal: </span>
                        {step.goal}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Closing Strategy */}
        {closing && (
          <div>
            <BlockHeader
              variant="title"
              title="Closing Strategy"
              icon={<FontAwesomeIcon icon={faHandshake} className="w-5 h-5 text-accent" />}
            />
            <ContentCard variant="success">
              <div className="space-y-3">
                {closing.ask && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                      The Ask
                    </span>
                    <p className="text-base font-body text-foreground mt-1 leading-relaxed font-medium">
                      {closing.ask}
                    </p>
                  </div>
                )}
                {closing.handle_hesitation && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                      Handle Hesitation
                    </span>
                    <p className="text-sm font-body text-foreground mt-1 leading-relaxed">
                      {closing.handle_hesitation}
                    </p>
                  </div>
                )}
              </div>
            </ContentCard>
            {closing.next_steps && closing.next_steps.length > 0 && (
              <div className="mt-4">
                <BlockHeader variant="label" title="Next Steps" />
                <InsightList items={closing.next_steps} type="info" numbered />
              </div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
