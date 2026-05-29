"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faStar, faShieldHalved, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/ui/RichText";
import { trackEvent } from "@/lib/analytics";
import { staggerContainer, staggerItem, staggerItemTransition, ctaHover } from "../animations";
import SectionEyebrow from "./SectionEyebrow";
import type { PricingContent } from "../types";

interface PricingSectionProps {
  content: PricingContent;
}

const PricingSection = ({ content }: PricingSectionProps) => {
  if (content.layout === "two-column") {
    return <PricingSectionTwoColumn content={content} />;
  }

  return (
    <section id={content.sectionId} className="section-spacing">
      <div className="max-w-4xl mx-auto">

        {/* Price */}
        {content.price && (
          <div className="text-center md:mb-12 mb-8">
            {content.price.badgeText && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 md:mb-6 mb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{content.price.badgeText}</span>
              </div>
            )}
            <div className="flex items-end justify-center md:gap-8 gap-5 flex-wrap">
              <div>
                <div className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-none">{content.price.setupAmount}</div>
                <div className="md:body-sm text-sm text-muted-foreground mt-2">{content.price.setupLabel}</div>
              </div>
              <div className="text-3xl md:text-4xl font-light text-muted-foreground pb-1">+</div>
              <div>
                <div className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-none">{content.price.monthlyAmount}</div>
                <div className="md:body-sm text-sm text-muted-foreground mt-2">{content.price.monthlyLabel}</div>
              </div>
            </div>
            {content.price.roiNote && (
              <RichText
                text={content.price.roiNote}
                as="p"
                className="md:body-md body-sm text-foreground/80 md:mt-8 mt-6 max-w-md mx-auto"
              />
            )}
            <RichText
              text={content.pricingNote}
              as="p"
              className="text-xs text-muted-foreground mt-3 max-w-md mx-auto"
            />
          </div>
        )}

        {/* What's Included */}
        {content.includes && content.includes.length > 0 && (
          <div className="md:mb-12 mb-6">
            <div className="text-center md:mb-10 mb-6">
              {content.includedHeading && (
                <h3 className="md:heading-lg heading-md md:mb-3 mb-2">{content.includedHeading}</h3>
              )}
              {content.includedSubheading && (
                <p className="md:body-md body-sm text-foreground/70">{content.includedSubheading}</p>
              )}
            </div>

            <div className="rounded-2xl">
              <motion.div
                className="grid md:grid-cols-2 md:gap-4 gap-3"
                {...staggerContainer}
              >
                {content.includes.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 md:p-4 p-3 rounded-lg bg-primary/5 border border-border/30 hover:border-primary/30 hover:shadow-sm transition-all"
                    variants={staggerItem}
                    transition={staggerItemTransition}
                  >
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="md:body-sm text-sm text-foreground font-medium">{item}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {/* Performance Guarantee */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl" />
          <div className="relative bg-primary/5 rounded-2xl md:p-8 p-4 md:p-10 border-2 border-primary/20">

            <div className="text-center md:mb-8 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 md:mb-4 mb-3">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{content.guarantee.badgeText}</span>
              </div>
              <h3 className="md:heading-lg heading-md">{content.guarantee.heading}</h3>
            </div>

            {/* Guarantee Steps */}
            <motion.div
              className="md:space-y-4 space-y-3 md:mb-8 mb-6"
              {...staggerContainer}
            >
              {content.guarantee.steps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`flex items-start gap-4 md:p-4 p-3 backdrop-blur-sm rounded-xl ${
                    step.highlighted
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-background/50 border border-border/50"
                  }`}
                  variants={staggerItem}
                  transition={staggerItemTransition}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm flex-shrink-0 ${
                    step.highlighted
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {index + 1}
                  </div>
                  <RichText
                    text={step.text}
                    as="p"
                    className="md:body-md body-sm"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits List */}
            <div className="md:space-y-2 space-y-1.5 md:mb-6 mb-4 text-center">
              {content.guarantee.benefits.map((benefit, index) => (
                <p key={index} className="md:body-sm text-sm text-foreground/80">{benefit}</p>
              ))}
            </div>

            {/* Bottom Statement */}
            <div className="md:pt-6 pt-4 border-t border-primary/20">
              <p className="md:body-lg body-md font-semibold text-foreground text-center">
                {content.guarantee.closingStatement}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSectionTwoColumn = ({ content }: PricingSectionProps) => {
  return (
    <section id={content.sectionId} className="section-spacing">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Eyebrow + Title */}
        <div className="text-center mb-10 md:mb-14">
          <SectionEyebrow label="Pricing" />
          {content.sectionTitle && (
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground">
              {content.sectionTitle}
            </h2>
          )}
        </div>

        {/* Two cards */}
        <div className="grid lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          {/* LEFT — Price card */}
          {content.price && (
            <div className="rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md md:p-10 p-6 shadow-sm flex flex-col transition-all">
              {/* Badge */}
              {content.price.badgeText && (
                <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 md:mb-10">
                  <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {content.price.badgeText}
                  </span>
                </div>
              )}

              {/* Setup price */}
              <div className="flex items-baseline gap-3 flex-wrap mb-1">
                <div className="text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-none">
                  {content.price.setupAmount}
                </div>
                <div className="text-sm text-muted-foreground">
                  {content.price.setupLabel}
                </div>
              </div>

              {/* PLUS divider */}
              <div className="flex items-center gap-3 my-6 md:my-7">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
                  Plus
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* Monthly price */}
              <div className="flex items-baseline gap-3 flex-wrap mb-8 md:mb-10">
                <div className="text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-none">
                  {content.price.monthlyAmount}
                </div>
                <div className="text-sm text-muted-foreground">
                  {content.price.monthlyLabel}
                </div>
              </div>

              {/* ROI callout */}
              {content.price.roiNote && (
                <div className="rounded-xl bg-primary/[0.06] border border-primary/15 p-4 md:p-5 mb-6">
                  <RichText
                    text={content.price.roiNote}
                    as="p"
                    className="text-sm md:text-base text-foreground/85 leading-relaxed"
                  />
                </div>
              )}

              {/* Footer note */}
              <RichText
                text={content.pricingNote}
                as="p"
                className="text-xs text-muted-foreground mt-auto"
              />
            </div>
          )}

          {/* RIGHT — Guarantee card */}
          <div className="rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md md:p-10 p-6 shadow-sm flex flex-col transition-all">
            {/* Badge */}
            <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {content.guarantee.badgeText}
              </span>
            </div>

            {/* Heading */}
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6 md:mb-8 leading-tight">
              {content.guarantee.heading}
            </h3>

            {/* Steps */}
            <motion.div className="space-y-3 mb-6" {...staggerContainer}>
              {content.guarantee.steps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`flex items-start gap-4 p-4 md:p-5 rounded-xl border ${
                    step.highlighted
                      ? "bg-primary/[0.06] border-primary/30"
                      : "bg-background border-border"
                  }`}
                  variants={staggerItem}
                  transition={staggerItemTransition}
                >
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0 ${
                      step.highlighted
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <RichText
                    text={step.text}
                    as="p"
                    className="text-sm md:text-base text-foreground leading-relaxed"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits (checkmarks) */}
            <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4 mb-6">
              {content.guarantee.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-primary flex-shrink-0" />
                  <span>{benefit.replace(/^[✓✗\s]+/, "")}</span>
                </div>
              ))}
            </div>

            {/* Closing statement */}
            <p className="text-base md:text-lg font-medium text-foreground mt-auto">
              {content.guarantee.closingStatement}
            </p>
          </div>
        </div>

        {/* Inline CTA */}
        {content.cta && (
          <div className="mt-10 md:mt-14 text-center">
            <motion.div {...ctaHover} className="inline-block">
              <Button
                variant="cta"
                className="rounded-full h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-medium shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0"
                asChild
              >
                <Link
                  href={content.cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (content.cta?.id) {
                      trackEvent({
                        event_type: "link_click",
                        entity_type: "cta_button",
                        entity_id: content.cta.id,
                        metadata: { location: "funnel_pricing" },
                      });
                    }
                  }}
                >
                  {content.cta.label}
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
