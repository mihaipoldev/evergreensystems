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
        {/* Main CTA Container */}
        <div className="text-center">

          {/* Heading */}
          <h2 className="md:heading-xl heading-lg md:mb-4 mb-3">
            {content.heading}
          </h2>

          <p className="md:body-lg body-md md:mb-10 mb-6 max-w-2xl mx-auto">
            {content.subheading}
          </p>

          {/* Risk Reversal Cards */}
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

          {/* CTA Button */}
          <div className="md:mb-6 mb-4">
            <motion.div {...ctaHover} className="inline-block">
              <Button variant="cta" size="xl" className="shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-0" asChild>
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
          <RichText
            text={content.subtext}
            as="p"
            className="md:body-sm text-sm text-muted-foreground"
          />
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
