"use client";

import { motion } from "framer-motion";
import {
  SectionWrapper,
  StatCard,
  ContentCard,
  KeyValueBlock,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faRocket,
  faCrown,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData, PricingTier } from "../types";

interface PricingArchitectureSectionProps {
  data: NonNullable<OfferArchitectData["pricing_architecture"]>;
  sectionNumber?: string;
}

const TierCard = ({
  tier,
  index,
  isRecommended,
}: {
  tier: PricingTier;
  index: number;
  isRecommended: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className={`rounded-xl border p-6 report-shadow ${
      isRecommended
        ? "border-accent bg-accent/5 ring-1 ring-accent/20"
        : "border-border bg-card"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-lg font-display font-semibold text-foreground">
        {tier.name || `Tier ${index + 1}`}
      </h4>
      {isRecommended && (
        <span className="text-xs font-body text-accent bg-accent/10 rounded-full px-3 py-1 border border-accent/20">
          Recommended
        </span>
      )}
    </div>
    {tier.monthly_fee && (
      <p className="text-2xl font-display font-bold text-foreground mb-4">
        {tier.monthly_fee}
        <span className="text-sm font-body text-muted-foreground font-normal">/mo</span>
      </p>
    )}
    <div className="space-y-2 text-sm font-body">
      {tier.setup_fee && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Setup Fee</span>
          <span className="text-foreground font-medium">{tier.setup_fee}</span>
        </div>
      )}
      {tier.minimum_commitment && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Commitment</span>
          <span className="text-foreground font-medium">{tier.minimum_commitment}</span>
        </div>
      )}
      {tier.best_for && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Best For</span>
          <p className="text-foreground mt-1">{tier.best_for}</p>
        </div>
      )}
    </div>
  </motion.div>
);

export const PricingArchitectureSection = ({
  data,
  sectionNumber = "04",
}: PricingArchitectureSectionProps) => {
  const pilot = data.pilot_pricing;
  const production = data.production_pricing;
  const psychology = data.pricing_psychology;

  return (
    <SectionWrapper
      id="pricing-architecture"
      number={sectionNumber}
      title="Pricing Architecture"
      subtitle="Monetization strategy, tiered offerings, and pricing psychology"
    >
      <div className="space-y-10">
        {/* Pilot Pricing */}
        {pilot && (
          <div>
            <BlockHeader
              variant="title"
              title="Pilot Pricing"
              icon={<FontAwesomeIcon icon={faRocket} className="w-5 h-5 text-accent" />}
            />
            {pilot.strategy && (
              <ContentCard variant="accent" title="Strategy">
                <p className="text-base font-body text-foreground leading-relaxed">
                  {pilot.strategy}
                </p>
              </ContentCard>
            )}
            {pilot.structure && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {pilot.structure.upfront_fee && (
                  <KeyValueBlock label="Upfront Fee" value={pilot.structure.upfront_fee} />
                )}
                {pilot.structure.monthly_fee && (
                  <KeyValueBlock label="Monthly Fee" value={pilot.structure.monthly_fee} />
                )}
                {pilot.structure.contract_terms && (
                  <KeyValueBlock label="Contract Terms" value={pilot.structure.contract_terms} />
                )}
                {pilot.structure.billing_start_date && (
                  <KeyValueBlock label="Billing Start" value={pilot.structure.billing_start_date} />
                )}
              </div>
            )}
            {pilot.rationale && (
              <ContentCard variant="muted" title="Rationale" style="summary">
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {pilot.rationale}
                </p>
              </ContentCard>
            )}
          </div>
        )}

        {/* Production Pricing Tiers */}
        {production && (production.tier_1 || production.tier_2 || production.tier_3) && (
          <div>
            <BlockHeader
              variant="title"
              title="Production Pricing"
              icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {production.tier_1 && (
                <TierCard tier={production.tier_1} index={0} isRecommended={false} />
              )}
              {production.tier_2 && (
                <TierCard tier={production.tier_2} index={1} isRecommended={true} />
              )}
              {production.tier_3 && (
                <TierCard tier={production.tier_3} index={2} isRecommended={false} />
              )}
            </div>
          </div>
        )}

        {/* Pricing Psychology */}
        {psychology && (
          <div>
            <BlockHeader
              variant="title"
              title="Pricing Psychology"
              icon={<FontAwesomeIcon icon={faBrain} className="w-5 h-5 text-accent" />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {psychology.anchor_price && (
                <StatCard
                  label="Anchor Price"
                  value={psychology.anchor_price}
                  icon={<FontAwesomeIcon icon={faCrown} className="w-5 h-5" />}
                  variant="muted"
                />
              )}
              {psychology.recommended_tier && (
                <KeyValueBlock label="Recommended Tier" value={psychology.recommended_tier} />
              )}
              {psychology.discount_strategy && (
                <KeyValueBlock label="Discount Strategy" value={psychology.discount_strategy} />
              )}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
