"use client";

import { motion } from "framer-motion";
import {
  SectionWrapper,
  ContentCard,
  InsightList,
  BlockHeader,
  NumberedCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnet,
  faGift,
  faFlask,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface LeadMagnetSectionProps {
  data: NonNullable<OfferArchitectData["lead_magnet_strategy"]>;
  sectionNumber?: string;
}

export const LeadMagnetSection = ({
  data,
  sectionNumber = "08",
}: LeadMagnetSectionProps) => {
  const trial = data.free_trial_strategy;

  return (
    <SectionWrapper
      id="lead-magnet-strategy"
      number={sectionNumber}
      title="Lead Magnet Strategy"
      subtitle="Top-of-funnel strategy: mini offers, lead magnets, and free trials"
    >
      <div className="space-y-8">
        {/* Mini Offer Approach */}
        {data.mini_offer_approach && (
          <ContentCard
            variant="accent"
            title="Mini Offer Approach"
            icon={<FontAwesomeIcon icon={faMagnet} className="w-5 h-5" />}
          >
            <div className="space-y-3">
              {data.mini_offer_approach.concept && (
                <p className="text-base font-body text-foreground leading-relaxed">
                  {data.mini_offer_approach.concept}
                </p>
              )}
              {data.mini_offer_approach.why_it_works && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                    Why It Works
                  </span>
                  <p className="text-sm font-body text-foreground mt-1 leading-relaxed">
                    {data.mini_offer_approach.why_it_works}
                  </p>
                </div>
              )}
            </div>
          </ContentCard>
        )}

        {/* Recommended Lead Magnets */}
        {data.recommended_lead_magnets && data.recommended_lead_magnets.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Recommended Lead Magnets"
              icon={<FontAwesomeIcon icon={faGift} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-4">
              {data.recommended_lead_magnets.map((magnet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-border bg-card p-6 report-shadow"
                >
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-display font-semibold text-foreground">
                          {magnet.name || `Lead Magnet ${index + 1}`}
                        </h4>
                        {magnet.type && (
                          <span className="text-xs font-body text-accent bg-accent/10 rounded-full px-2 py-0.5 border border-accent/20">
                            {magnet.type}
                          </span>
                        )}
                      </div>
                      {magnet.what_it_solves && (
                        <p className="text-sm font-body text-foreground leading-relaxed">
                          <span className="font-medium text-muted-foreground">Solves: </span>
                          {magnet.what_it_solves}
                        </p>
                      )}
                      {magnet.how_to_deliver && (
                        <p className="text-sm font-body text-foreground leading-relaxed">
                          <span className="font-medium text-muted-foreground">Delivery: </span>
                          {magnet.how_to_deliver}
                        </p>
                      )}
                      {magnet.cta && (
                        <p className="text-sm font-body text-foreground leading-relaxed">
                          <span className="font-medium text-muted-foreground">CTA: </span>
                          {magnet.cta}
                        </p>
                      )}
                      {magnet.conversion_path && (
                        <p className="text-sm font-body text-foreground leading-relaxed">
                          <span className="font-medium text-muted-foreground">Conversion Path: </span>
                          {magnet.conversion_path}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Free Trial Strategy */}
        {trial && (
          <div>
            <BlockHeader
              variant="title"
              title="Free Trial Strategy"
              icon={<FontAwesomeIcon icon={faFlask} className="w-5 h-5 text-accent" />}
            />
            <ContentCard variant="default">
              <div className="space-y-3">
                {trial.offer && (
                  <p className="text-base font-body text-foreground leading-relaxed">
                    {trial.offer}
                  </p>
                )}
                {trial.structure && (
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    <span className="font-medium text-muted-foreground">Structure: </span>
                    {trial.structure}
                  </p>
                )}
                {trial.conversion_mechanism && (
                  <p className="text-sm font-body text-foreground leading-relaxed">
                    <span className="font-medium text-muted-foreground">Conversion: </span>
                    {trial.conversion_mechanism}
                  </p>
                )}
              </div>
            </ContentCard>
            {trial.qualification_criteria && trial.qualification_criteria.length > 0 && (
              <div className="mt-4">
                <BlockHeader variant="label" title="Qualification Criteria" />
                <InsightList items={trial.qualification_criteria} type="success" />
              </div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
