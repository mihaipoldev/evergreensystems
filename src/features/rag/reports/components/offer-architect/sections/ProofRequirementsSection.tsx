"use client";

import { motion } from "framer-motion";
import {
  SectionWrapper,
  ContentCard,
  InsightList,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faBookOpen,
  faQuoteRight,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface ProofRequirementsSectionProps {
  data: NonNullable<OfferArchitectData["proof_requirements"]>;
  sectionNumber?: string;
}

export const ProofRequirementsSection = ({
  data,
  sectionNumber = "10",
}: ProofRequirementsSectionProps) => {
  const caseStudy = data.case_study_framework;
  const testimonial = data.testimonial_strategy;

  return (
    <SectionWrapper
      id="proof-requirements"
      number={sectionNumber}
      title="Proof Requirements"
      subtitle="Credibility blueprint: case studies, testimonials, and social proof"
    >
      <div className="space-y-8">
        {/* What You Need To Show */}
        {data.what_you_need_to_show && data.what_you_need_to_show.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="What You Need To Show"
              icon={<FontAwesomeIcon icon={faTrophy} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-3">
              {data.what_you_need_to_show.map((proof, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border bg-card p-4 report-shadow"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-base font-display font-semibold text-foreground">
                      {proof.proof_type || `Proof ${index + 1}`}
                    </span>
                    {proof.priority && (
                      <span className={`text-xs font-body rounded-full px-2 py-0.5 border ${
                        proof.priority.toLowerCase() === "high"
                          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : proof.priority.toLowerCase() === "medium"
                            ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                            : "text-muted-foreground bg-muted/50 border-border"
                      }`}>
                        {proof.priority}
                      </span>
                    )}
                  </div>
                  {proof.how_to_get_it && (
                    <p className="text-sm font-body text-foreground leading-relaxed">
                      <span className="font-medium text-muted-foreground">How to get: </span>
                      {proof.how_to_get_it}
                    </p>
                  )}
                  {proof.alternative_if_unavailable && (
                    <p className="text-sm font-body text-foreground leading-relaxed mt-1">
                      <span className="font-medium text-muted-foreground">Alternative: </span>
                      {proof.alternative_if_unavailable}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Case Study Framework */}
        {caseStudy && (
          <div>
            <BlockHeader
              variant="title"
              title="Case Study Framework"
              icon={<FontAwesomeIcon icon={faBookOpen} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {caseStudy.sections && caseStudy.sections.length > 0 && (
                <div>
                  <BlockHeader variant="label" title="Sections" />
                  <InsightList items={caseStudy.sections} type="info" numbered />
                </div>
              )}
              {caseStudy.key_metrics_to_highlight && caseStudy.key_metrics_to_highlight.length > 0 && (
                <div>
                  <BlockHeader variant="label" title="Key Metrics to Highlight" />
                  <InsightList items={caseStudy.key_metrics_to_highlight} type="accent" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Testimonial Strategy */}
        {testimonial && (
          <div>
            <BlockHeader
              variant="title"
              title="Testimonial Strategy"
              icon={<FontAwesomeIcon icon={faQuoteRight} className="w-5 h-5 text-accent" />}
            />
            <ContentCard variant="default">
              <div className="space-y-4">
                {testimonial.ideal_testimonial_format && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                      Ideal Format
                    </span>
                    <p className="text-sm font-body text-foreground mt-1 leading-relaxed">
                      {testimonial.ideal_testimonial_format}
                    </p>
                  </div>
                )}
                {testimonial.questions_to_ask && testimonial.questions_to_ask.length > 0 && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                      Questions to Ask
                    </span>
                    <div className="mt-2">
                      <InsightList items={testimonial.questions_to_ask} type="info" numbered />
                    </div>
                  </div>
                )}
              </div>
            </ContentCard>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
