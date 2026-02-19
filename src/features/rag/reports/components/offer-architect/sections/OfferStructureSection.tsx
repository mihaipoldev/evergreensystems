"use client";

import { motion } from "framer-motion";
import {
  SectionWrapper,
  InsightList,
  ContentCard,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faClock,
  faShieldAlt,
  faFileInvoiceDollar,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface OfferStructureSectionProps {
  data: NonNullable<OfferArchitectData["offer_structure"]>;
  sectionNumber?: string;
}

export const OfferStructureSection = ({
  data,
  sectionNumber = "03",
}: OfferStructureSectionProps) => {
  return (
    <SectionWrapper
      id="offer-structure"
      number={sectionNumber}
      title="Offer Structure"
      subtitle="Service delivery blueprint and phase-by-phase breakdown"
    >
      <div className="space-y-8">
        {/* Phases */}
        {data.phases && data.phases.length > 0 && (
          <div className="space-y-4">
            <BlockHeader
              variant="title"
              title="Delivery Phases"
              icon={<FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5 text-accent" />}
            />
            {data.phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 report-shadow"
              >
                {/* Phase header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <h4 className="text-lg font-display font-semibold text-foreground">
                    {phase.phase_name || `Phase ${index + 1}`}
                  </h4>
                  {phase.duration && (
                    <span className="flex items-center gap-1 text-xs font-body text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                      {phase.duration}
                    </span>
                  )}
                  {phase.guarantee_applies && (
                    <span className="flex items-center gap-1 text-xs font-body text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 rounded-full px-3 py-1 border border-green-200 dark:border-green-800">
                      <FontAwesomeIcon icon={faShieldAlt} className="w-3 h-3" />
                      Guarantee
                    </span>
                  )}
                  {phase.billing_applies && (
                    <span className="flex items-center gap-1 text-xs font-body text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded-full px-3 py-1 border border-blue-200 dark:border-blue-800">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-3 h-3" />
                      Billing
                    </span>
                  )}
                </div>

                {/* Purpose */}
                {phase.purpose && (
                  <p className="text-sm font-body text-muted-foreground mb-4 leading-relaxed">
                    {phase.purpose}
                  </p>
                )}

                {/* What Happens & Deliverables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.what_happens && phase.what_happens.length > 0 && (
                    <div>
                      <BlockHeader variant="label" title="What Happens" />
                      <InsightList items={phase.what_happens} type="info" />
                    </div>
                  )}
                  {phase.deliverables && phase.deliverables.length > 0 && (
                    <div>
                      <BlockHeader variant="label" title="Deliverables" />
                      <InsightList items={phase.deliverables} type="success" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Timeline Logic */}
        {data.timeline_logic && Object.keys(data.timeline_logic).length > 0 && (
          <div>
            <BlockHeader variant="title" title="Timeline Logic" />
            <div className="space-y-3">
              {Object.entries(data.timeline_logic).map(([key, value]) => (
                <ContentCard key={key} variant="muted" title={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}>
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    {value}
                  </p>
                </ContentCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
