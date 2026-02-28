"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { VSLPlayer } from "@/features/funnels/components/VSLPlayer";
import { RichText } from "@/components/ui/RichText";
import { trackEvent } from "@/lib/analytics";
import { heroEntrance, ctaHover } from "../animations";
import type { MediaWithSection } from "@/features/page-builder/media/types";
import type { HeroContent } from "../types";

export type HeroVideoProps = {
  mainMedia?: MediaWithSection | null;
  videoId?: string | null;
  mediaUrl?: string | null;
};

interface HeroSectionProps {
  content: HeroContent;
  heroVideo?: HeroVideoProps | null;
}

const HeroSection = ({ content, heroVideo }: HeroSectionProps) => {
  const hasVideo = heroVideo && (heroVideo.mainMedia || heroVideo.videoId || heroVideo.mediaUrl);

  return (
    <section className="section-spacing pt-24 md:pt-32 py-6 md:py-8 text-center">
      {/* Badge */}
      <motion.div
        {...heroEntrance(0)}
        className="inline-flex mb-6 w-full sm:w-auto justify-center"
        style={{ maxWidth: "100%" }}
      >
        <div className="relative inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 rounded-full text-xs font-regular min-w-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(84deg, hsl(var(--primary)/50%), hsl(var(--secondary)/50%) 92%)",
              padding: "1px",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              zIndex: 0,
            }}
          />
          <span
            className="w-[12px] h-[12px] rounded-full animate-pulse flex-shrink-0 relative z-10"
            style={{
              backgroundImage:
                "linear-gradient(84deg, hsl(var(--primary)), hsl(var(--secondary)) 92%)",
            }}
          />
          <span className="uppercase font-medium text-[10px] md:text-[12px] text-foreground relative z-10">
            {content.badgeText}
          </span>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        className="max-w-5xl mx-auto mb-6 md:mb-6"
        {...heroEntrance(0.1)}
      >
        <RichText
          text={content.headline}
          as="h1"
          className="heading-xl leading-tight md:leading-none text-[24px] md:text-[54px] font-bold md:mb-4 mb-3"
        />
        <p className="body-lg text-[14px] md:text-[16px] max-w-3xl mx-auto">
          {content.subheadline}
        </p>
      </motion.div>

      {/* VSL Video Player */}
      <motion.div
        className="max-w-3xl mx-auto mb-6 md:mb-8 md:px-0"
        {...heroEntrance(0.2)}
      >
        <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border border-border shadow-sm ">
          {hasVideo ? (
            <div className="absolute inset-0 w-full h-full">
              <VSLPlayer
                mainMedia={heroVideo!.mainMedia}
                videoId={heroVideo!.videoId}
                mediaUrl={heroVideo!.mediaUrl}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <div className="w-0 h-0 border-l-[20px] border-l-primary border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                </div>
                <p className="body-sm">{content.videoPlaceholderText}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.div {...heroEntrance(0.3)}>
        <motion.div {...ctaHover} className="inline-block">
          <Button variant="cta" size="xl" className="hover:-translate-y-0" asChild>
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
                    metadata: { location: "funnel_hero" },
                  });
                }
              }}
            >
              {content.ctaButtonText}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div {...heroEntrance(0.4)}>
        <RichText
          text={content.bottomText}
          as="p"
          className="text-muted-foreground/80 max-w-2xl mx-auto mt-3"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
