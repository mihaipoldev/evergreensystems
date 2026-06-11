"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { ctaHover } from "../animations";
import SectionEyebrow from "./SectionEyebrow";
import type { FinalCTAContent } from "../types";

interface FinalCTASectionProps {
  content: FinalCTAContent;
}

const FinalCTASection = ({ content }: FinalCTASectionProps) => {
  const hasRiskCards = Boolean(content.worstCase && content.bestCase);

  if (!hasRiskCards) {
    return (
      <section
        className="px-4 md:px-0 pt-10 md:pt-16 pb-28 md:pb-48"
        data-analytics-section="final-cta"
      >
        <div className="max-w-3xl mx-auto text-center">
          <SectionEyebrow label="Let's Talk" className="mb-8 md:mb-10" />

          {/* Headline — plain Gotham with optional serif-italic accent.
              `whitespace-pre-line` honors \n in the heading copy. */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5 md:mb-6 text-foreground whitespace-pre-line">
            {content.heading}
            {content.headingAccent && (
              <>
                {" "}
                <span className="font-serif-italic font-normal text-primary/55 whitespace-normal">
                  {content.headingAccent}
                </span>
              </>
            )}
          </h2>

          {/* Subhead — fits on one line on desktop */}
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-10 md:mb-12">
            {content.subheading}
          </p>

          {/* Slim pill CTA */}
          <motion.div {...ctaHover} className="inline-block">
            <Button
              variant="cta"
              className="rounded-full h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-medium shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0"
              asChild
            >
              <Link
                href={content.ctaUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                // Declarative tracking: the global SiteAnalytics tracker fires the
                // link_click; the type/id attrs also feed the impression observer.
                data-analytics-type="cta_button"
                data-analytics-id={content.ctaId || undefined}
                data-analytics-label={content.ctaButtonText}
              >
                {content.ctaButtonText}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Subtext */}
          {content.subtext && (
            <RichText
              text={content.subtext}
              as="p"
              className="text-xs text-muted-foreground max-w-md mx-auto mt-6"
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="section-spacing" data-analytics-section="final-cta">
      <div className="max-w-4xl mx-auto">
        {/* Contained closing block */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/[0.07] to-transparent shadow-xl shadow-primary/5">
          {/* soft glow halo */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-56 w-2/3 rounded-full bg-primary/20 blur-[100px]" />

          <div className="relative text-center md:p-14 p-8">

            {/* Heading */}
            <h2 className="md:heading-lg heading-md mb-2">
              {content.heading}
            </h2>

            <p className="md:body-md body-sm md:mb-5 mb-4 max-w-xl mx-auto text-foreground/80">
              {content.subheading}
            </p>

            {/* Risk Reversal Cards */}
            <div className="grid md:grid-cols-2 md:gap-4 gap-3 md:mb-10 mb-6 max-w-4xl mx-auto">
              <div className="md:p-6 p-4 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 text-left">
                <p className="text-xs md:text-sm font-semibold text-muted-foreground md:mb-2 mb-1">{content.worstCase!.label}</p>
                <p className="md:body-sm text-sm text-foreground">
                  {content.worstCase!.text}
                </p>
              </div>
              <div className="md:p-6 p-4 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 text-left">
                <p className="text-xs md:text-sm font-semibold text-primary md:mb-2 mb-1">{content.bestCase!.label}</p>
                <p className="md:body-sm text-sm text-foreground">
                  {content.bestCase!.text}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="md:mb-4 mb-3">
              <motion.div {...ctaHover} className="inline-block">
                <Button variant="cta" size="xl" className="md:min-w-[280px] min-w-[220px] shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-0" asChild>
                  <Link
                    href={content.ctaUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Declarative tracking: the global SiteAnalytics tracker fires the
                    // link_click; the type/id attrs also feed the impression observer.
                    data-analytics-type="cta_button"
                    data-analytics-id={content.ctaId || undefined}
                    data-analytics-label={content.ctaButtonText}
                  >
                    {content.ctaButtonText}
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Subtext */}
            {content.subtext && (
              <RichText
                text={content.subtext}
                as="p"
                className="text-xs text-muted-foreground max-w-lg mx-auto"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
