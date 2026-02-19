"use client";

import { motion } from "framer-motion";
import {
  SectionWrapper,
  ContentCard,
  BlockHeader,
} from "../../shared";
import { ReportCollapsibleCard } from "../../shared/ReportCollapsibleCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTag,
  faLightbulb,
  faPen,
  faBullhorn,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface OfferNamingSectionProps {
  data: NonNullable<OfferArchitectData["offer_naming_and_framing"]>;
  reportId: string;
  sectionNumber?: string;
}

export const OfferNamingSection = ({
  data,
  reportId,
  sectionNumber = "07",
}: OfferNamingSectionProps) => {
  return (
    <SectionWrapper
      id="offer-naming"
      number={sectionNumber}
      title="Offer Naming & Framing"
      subtitle="Messaging toolkit: names, headlines, and copywriting angles"
    >
      <div className="space-y-8">
        {/* Recommended Name */}
        {data.recommended_offer_name && (
          <ContentCard
            variant="success"
            title="Recommended Offer Name"
            icon={<FontAwesomeIcon icon={faTag} className="w-5 h-5" />}
          >
            <p className="text-xl md:text-2xl font-display font-bold text-foreground">
              {data.recommended_offer_name}
            </p>
          </ContentCard>
        )}

        {/* Naming Rationale */}
        {data.naming_rationale && (
          <ContentCard variant="muted" title="Naming Rationale" style="summary">
            <p className="text-sm font-body text-foreground leading-relaxed">
              {data.naming_rationale}
            </p>
          </ContentCard>
        )}

        {/* Alternative Names */}
        {data.alternative_names && data.alternative_names.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Alternative Names"
              icon={<FontAwesomeIcon icon={faLightbulb} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.alternative_names.map((alt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border bg-card p-4 report-shadow"
                >
                  <p className="text-base font-display font-semibold text-foreground">
                    {alt.name}
                  </p>
                  {alt.positioning && (
                    <p className="text-sm font-body text-muted-foreground mt-1">
                      {alt.positioning}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Headline Formulas */}
        {data.headline_formulas && data.headline_formulas.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Headline Formulas"
              icon={<FontAwesomeIcon icon={faPen} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-3">
              {data.headline_formulas.map((formula, index) => (
                <ReportCollapsibleCard
                  key={index}
                  id={`headline-formula-${index}`}
                  reportId={reportId}
                  title={formula.formula || `Formula ${index + 1}`}
                  defaultOpen={index === 0}
                >
                  <div className="space-y-3">
                    {formula.example && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                          Example
                        </span>
                        <p className="text-sm font-body text-foreground mt-1 italic">
                          &ldquo;{formula.example}&rdquo;
                        </p>
                      </div>
                    )}
                    {formula.when_to_use && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                          When to Use
                        </span>
                        <p className="text-sm font-body text-foreground mt-1">
                          {formula.when_to_use}
                        </p>
                      </div>
                    )}
                  </div>
                </ReportCollapsibleCard>
              ))}
            </div>
          </div>
        )}

        {/* Copywriting Angles */}
        {data.copywriting_angles && data.copywriting_angles.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Copywriting Angles"
              icon={<FontAwesomeIcon icon={faBullhorn} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-3">
              {data.copywriting_angles.map((angle, index) => (
                <ReportCollapsibleCard
                  key={index}
                  id={`copywriting-angle-${index}`}
                  reportId={reportId}
                  title={angle.angle_name || `Angle ${index + 1}`}
                  defaultOpen={index === 0}
                >
                  <div className="space-y-3">
                    {angle.hook && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                          Hook
                        </span>
                        <p className="text-sm font-body text-foreground mt-1">
                          {angle.hook}
                        </p>
                      </div>
                    )}
                    {angle.promise && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                          Promise
                        </span>
                        <p className="text-sm font-body text-foreground mt-1">
                          {angle.promise}
                        </p>
                      </div>
                    )}
                    {angle.proof_needed && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                          Proof Needed
                        </span>
                        <p className="text-sm font-body text-foreground mt-1">
                          {angle.proof_needed}
                        </p>
                      </div>
                    )}
                  </div>
                </ReportCollapsibleCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
