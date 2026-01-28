"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { VSLPlayer } from "@/features/funnels/components/VSLPlayer";
import type { MediaWithSection } from "@/features/page-builder/media/types";

const BADGE_TEXT = "For B2B Founders Who Need Predictable Clients";

export type HeroVideoProps = {
  mainMedia?: MediaWithSection | null;
  videoId?: string | null;
  mediaUrl?: string | null;
};

type HeroSectionProps = {
  heroVideo?: HeroVideoProps | null;
};

const HeroSection = ({ heroVideo }: HeroSectionProps) => {
  const hasVideo = heroVideo && (heroVideo.mainMedia || heroVideo.videoId || heroVideo.mediaUrl);

  return (
    <section className="section-spacing pt-24 md:pt-32 py-6 md:py-8 text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
            {BADGE_TEXT}
          </span>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div 
        className="max-w-5xl mx-auto mb-6 md:mb-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="heading-xl leading-tight md:leading-none text-[24px] md:text-[54px] font-bold md:mb-4 mb-3">
          We Build & Run Outbound Systems That <br /> <b className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Books Qualified Sales Calls</b>
        </h1>
        <p className="body-lg text-[14px] md:text-[16px] max-w-2xl mx-auto">
        An always-on outbound system that runs in the background while you focus on closing.
        </p>
      </motion.div>

      {/* VSL Video Player */}
      <motion.div 
        className="max-w-3xl mx-auto mb-6 md:mb-8 md:px-0"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
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
                <p className="body-sm">Watch the overview</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="inline-block"
        >
          <Button variant="cta" size="xl" className="hover:-translate-y-0">
            Book a Qualification Call
            <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="text-muted-foreground/80 max-w-2xl mx-auto mt-3">
          10 booked calls a month <b className="text-primary">guaranteed!</b>
        </p>

      </motion.div>
    </section>
  );
};

export default HeroSection;
