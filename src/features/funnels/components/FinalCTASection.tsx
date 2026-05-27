"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { RichText } from "@/components/ui/RichText";
import { trackEvent } from "@/lib/analytics";
import { ctaHover } from "../animations";
import type { FinalCTAContent } from "../types";

interface FinalCTASectionProps {
  content: FinalCTAContent;
}

const FinalCTASection = ({ content }: FinalCTASectionProps) => {
  return (
    <section className="section-spacing">
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
            {content.worstCase && content.bestCase && (
              <div className="grid md:grid-cols-2 md:gap-4 gap-3 md:mb-10 mb-6 max-w-4xl mx-auto">
                <div className="md:p-6 p-4 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 text-left">
                  <p className="text-xs md:text-sm font-semibold text-muted-foreground md:mb-2 mb-1">{content.worstCase.label}</p>
                  <p className="md:body-sm text-sm text-foreground">
                    {content.worstCase.text}
                  </p>
                </div>
                <div className="md:p-6 p-4 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 text-left">
                  <p className="text-xs md:text-sm font-semibold text-primary md:mb-2 mb-1">{content.bestCase.label}</p>
                  <p className="md:body-sm text-sm text-foreground">
                    {content.bestCase.text}
                  </p>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="md:mb-4 mb-3">
              <motion.div {...ctaHover} className="inline-block">
                <Button variant="cta" size="xl" className="md:min-w-[280px] min-w-[220px] shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-0" asChild>
                  <Link
                    href={content.ctaUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (content.ctaId) {
                        trackEvent({
                          event_type: "link_click",
                          entity_type: "cta_button",
                          entity_id: content.ctaId,
                          metadata: { location: "funnel_final_cta" },
                        });
                      }
                    }}
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
