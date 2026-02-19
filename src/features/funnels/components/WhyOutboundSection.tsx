"use client";

import { motion } from "framer-motion";
import { RichText } from "@/components/ui/RichText";
import { staggerContainer, staggerItem, staggerItemTransition } from "../animations";
import type { WhyOutboundContent } from "../types";

interface WhyOutboundSectionProps {
  content: WhyOutboundContent;
}

const WhyOutboundSection = ({ content }: WhyOutboundSectionProps) => {
  const { whyItWorks, traditionalFails, enrichment, sending, keyInsight } = content;

  return (
    <section id={content.sectionId} className="relative section-spacing dark:bg-muted/15 bg-muted/80 overflow-hidden">
      {/* Top Decorative Separator - Clean Diagonal Cut */}
      <div className="absolute top-0 left-0 right-0 h-12 md:h-16 pointer-events-none">
        <div className="absolute inset-0 bg-background"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)'
          }}
        />
      </div>

      {/* Bottom Decorative Separator - Clean Diagonal Cut */}
      <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 pointer-events-none">
        <div className="absolute inset-0 bg-background"
          style={{
            clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)'
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 md:pt-20 pt-12 md:pb-20 pb-12 md:px-6 px-4">

        {/* Main Card Container */}
        <div className="rounded-2xl md:p-12 p-6 py-12">

          {/* Why Outbound Works */}
          <div className="md:mb-16 mb-8">
            <h2 className="md:heading-lg heading-md md:mb-6 mb-4 hero-align">
              {whyItWorks.heading}
            </h2>

            <p className="md:body-md body-sm md:mb-8 mb-4 hero-align">
              {whyItWorks.introText}
            </p>

            <motion.div
              className="grid md:grid-cols-3 md:gap-4 gap-3 md:mb-8 mb-6"
              {...staggerContainer}
            >
              {whyItWorks.methods.map((method, index) => (
                <motion.div
                  key={index}
                  className={`md:p-5 p-3 rounded-xl text-center font-semibold border-2 transition-all md:text-base text-sm ${
                    index === whyItWorks.methods.length - 1
                      ? "text-primary border-primary bg-primary/5 shadow-sm"
                      : "text-foreground border-border bg-background/50"
                  }`}
                  variants={staggerItem}
                  transition={staggerItemTransition}
                >
                  {method}
                </motion.div>
              ))}
            </motion.div>

            {whyItWorks.paragraphs.map((paragraph, index) => (
              <RichText
                key={index}
                text={paragraph}
                as="p"
                className="md:body-md body-sm md:mb-6 mb-4 hero-align"
              />
            ))}

            <RichText
              text={whyItWorks.closingStatement}
              as="p"
              className="md:body-lg body-md text-foreground font-semibold hero-align"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 md:mb-16 mb-8 max-w-4xl mx-auto"></div>

          {/* The Problem with Traditional Lead Gen */}
          <div className="max-w-4xl mx-auto">
            <h2 className="md:heading-lg heading-md md:mb-6 mb-4 hero-align">
              {traditionalFails.heading}
            </h2>

            <p className="md:body-md body-sm md:mb-6 mb-4 hero-align">
              {traditionalFails.introText}
            </p>

            <ul className="md:space-y-3 space-y-2 md:mb-10 mb-6">
              {traditionalFails.failurePoints.map((item, index) => (
                <li
                  key={index}
                  className="md:body-md body-sm flex items-start hero-align-bullet gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-destructive font-bold text-sm">✗</span>
                  </span>
                  <span className="pt-0.5">{item}</span>
                </li>
              ))}
            </ul>

            {/* Key Message */}
            <div className="md:mb-10 mb-6 md:p-8 p-3 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/20">
              <RichText
                text={traditionalFails.keyMessage}
                as="p"
                className="md:body-lg body-md hero-align text-foreground font-semibold text-center"
              />
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-2 md:gap-4 gap-3 md:mb-8 mb-6">
              <div className="md:p-6 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 md:mb-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-destructive font-bold text-sm">✗</span>
                  </div>
                  <p className="text-xs md:text-sm font-semibold">{traditionalFails.oldWay.label}</p>
                </div>
                <p className="md:body-sm text-sm text-foreground/80">
                  {traditionalFails.oldWay.text}
                </p>
              </div>

              <div className="md:p-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 md:mb-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">✓</span>
                  </div>
                  <p className="text-xs md:text-sm font-semibold">{traditionalFails.newWay.label}</p>
                </div>
                <RichText
                  text={traditionalFails.newWay.text}
                  as="p"
                  className="md:body-sm text-sm text-foreground/80"
                />
              </div>
            </div>

            <RichText
              text={traditionalFails.closingStatement}
              as="p"
              className="md:body-lg body-md hero-align font-semibold text-foreground text-center"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 md:mb-16 mb-8 md:mt-16 mt-8 max-w-4xl mx-auto"></div>

          {/* How the System Works - Enrichment */}
          <div className="md:mb-16 mb-8 max-w-4xl mx-auto">
            <h3 className="md:heading-lg heading-md md:mb-6 mb-4">
              {enrichment.heading}
            </h3>
            <RichText
              text={enrichment.introText}
              as="p"
              className="md:body-md body-sm md:mb-8 mb-6 leading-relaxed"
            />

            <motion.div
              className="grid md:grid-cols-2 md:gap-4 gap-3 md:mb-8 mb-6"
              {...staggerContainer}
            >
              {enrichment.checks.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 md:p-4 p-3 rounded-xl bg-primary/5 border border-primary/10"
                  variants={staggerItem}
                  transition={staggerItemTransition}
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">✓</span>
                  </div>
                  <span className="md:body-sm text-sm font-medium text-foreground pt-0.5">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            <RichText
              text={enrichment.closingText}
              as="p"
              className="md:body-lg body-md text-foreground/80 text-center font-medium"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 md:mb-16 mb-8 max-w-4xl mx-auto"></div>

          {/* Sending Infrastructure */}
          <div className="md:mb-8 mb-6 max-w-4xl mx-auto">
            <h3 className="md:heading-lg heading-md md:mb-6 mb-4">
              {sending.heading}
            </h3>
            <RichText
              text={sending.introText}
              as="p"
              className="md:body-md body-sm md:mb-8 mb-6 leading-relaxed"
            />

            <ul className="md:space-y-3 space-y-2 md:mb-8 mb-6">
              {sending.items.map((item, index) => (
                <li
                  key={index}
                  className="md:body-md body-sm flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="pt-0.5">{item}</span>
                </li>
              ))}
            </ul>

            <div className="md:p-6 p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">ℹ</span>
                </div>
                <div className="flex-1">
                  <p className="md:body-sm text-sm font-semibold text-foreground md:mb-2 mb-1">{sending.infoBox.title}</p>
                  <p className="md:body-sm text-sm text-foreground/80 leading-relaxed">
                    {sending.infoBox.text}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl" />
            <div className="relative bg-primary/5 rounded-2xl md:p-8 p-4 md:p-10 border-2 border-primary/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 md:mb-6 mb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{keyInsight.badgeText}</span>
              </div>

              <h3 className="md:heading-md heading-sm md:mb-6 mb-4">{keyInsight.heading}</h3>

              <p className="md:body-md body-sm md:mb-6 mb-4 text-foreground/90">
                {keyInsight.introText}
              </p>

              <ul className="md:space-y-3 space-y-2 md:mb-8 mb-6">
                {keyInsight.failureReasons.map((reason, index) => (
                  <li key={index} className="md:body-md body-sm flex items-start gap-3">
                    <span className="text-destructive font-bold">✗</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>

              <div className="md:pt-6 pt-4 border-t border-primary/20">
                <p className="md:body-lg body-md font-semibold text-foreground">
                  {keyInsight.closingStatement}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyOutboundSection;
