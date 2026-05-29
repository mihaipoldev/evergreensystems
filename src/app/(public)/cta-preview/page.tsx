"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ctaHover } from "@/features/funnels/animations";

const CALENDLY = "https://calendly.com/mihai-evergreensystems/growth-strategy-call";
const LABEL = "Book a 15-minute call";

interface VariantProps {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

const Variant = ({ number, title, description, children }: VariantProps) => (
  <div className="border-b border-border py-12 md:py-16">
    <div className="max-w-2xl mx-auto px-6">
      <div className="text-center mb-6">
        <p className="text-[11px] md:text-xs font-medium tracking-[0.22em] uppercase text-muted-foreground mb-1">
          Variant {number}
        </p>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mb-1">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex justify-center">{children}</div>
    </div>
  </div>
);

export default function CtaPreviewPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <p className="text-[11px] md:text-xs font-medium tracking-[0.22em] uppercase text-muted-foreground mb-3">
          CTA Preview
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
          Pick your favorite button
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          Hover, click, scroll. Tell me the variant number.
        </p>
      </div>

      {/* 1 — Current baseline */}
      <Variant
        number={1}
        title="Current baseline"
        description="What's on the page today — pill, primary fill, soft shadow."
      >
        <motion.div {...ctaHover} className="inline-block">
          <Button
            variant="cta"
            className="rounded-full h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-medium shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0"
            asChild
          >
            <Link href={CALENDLY} target="_blank" rel="noopener noreferrer">
              {LABEL}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </Variant>

      {/* 2 — Primary-tinted glow */}
      <Variant
        number={2}
        title="Primary-tinted glow"
        description="On hover, shadow takes the brand color. Feels like it lights up."
      >
        <motion.div {...ctaHover} className="inline-block">
          <Button
            variant="cta"
            className="rounded-full h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-medium shadow-sm hover:shadow-lg hover:shadow-primary/30 transition-shadow hover:-translate-y-0"
            asChild
          >
            <Link href={CALENDLY} target="_blank" rel="noopener noreferrer">
              {LABEL}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </Variant>

      {/* 3 — Glow + arrow micro-slide */}
      <Variant
        number={3}
        title="Glow + arrow slide"
        description="Hover the glow. The arrow nudges right — invites the click."
      >
        <motion.div {...ctaHover} className="inline-block">
          <Button
            variant="cta"
            className="group rounded-full h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-medium shadow-sm hover:shadow-lg hover:shadow-primary/30 transition-shadow hover:-translate-y-0"
            asChild
          >
            <Link href={CALENDLY} target="_blank" rel="noopener noreferrer">
              {LABEL}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        </motion.div>
      </Variant>

      {/* 4 — Glow + slide + active press */}
      <Variant
        number={4}
        title="Glow + slide + active press"
        description="Adds a real click depression. Click it — it physically presses down."
      >
        <motion.div {...ctaHover} className="inline-block">
          <Button
            variant="cta"
            className="group rounded-full h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-medium shadow-sm hover:shadow-lg hover:shadow-primary/30 active:translate-y-0.5 active:shadow-sm transition-all hover:-translate-y-0"
            asChild
          >
            <Link href={CALENDLY} target="_blank" rel="noopener noreferrer">
              {LABEL}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        </motion.div>
      </Variant>

      {/* 5 — + inset ring */}
      <Variant
        number={5}
        title="+ inset highlight ring"
        description="Adds a faint white ring on the inside edge. Reads as glassy/premium."
      >
        <motion.div {...ctaHover} className="inline-block">
          <Button
            variant="cta"
            className="group rounded-full h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-medium shadow-sm hover:shadow-lg hover:shadow-primary/30 ring-1 ring-inset ring-white/15 active:translate-y-0.5 active:shadow-sm transition-all hover:-translate-y-0"
            asChild
          >
            <Link href={CALENDLY} target="_blank" rel="noopener noreferrer">
              {LABEL}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        </motion.div>
      </Variant>

      {/* 6 — Full premium: + soft gradient face */}
      <Variant
        number={6}
        title="Full premium (with gradient face)"
        description="Everything above + a subtle top-to-bottom gradient. Most physical, most premium."
      >
        <motion.div {...ctaHover} className="inline-block">
          <Button
            variant="cta"
            className="group rounded-full h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-medium bg-gradient-to-b from-primary to-primary/85 hover:from-primary hover:to-primary/85 shadow-sm hover:shadow-lg hover:shadow-primary/30 ring-1 ring-inset ring-white/15 active:translate-y-0.5 active:shadow-sm transition-all hover:-translate-y-0"
            asChild
          >
            <Link href={CALENDLY} target="_blank" rel="noopener noreferrer">
              {LABEL}
              <FontAwesomeIcon
                icon={faArrowRight}
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        </motion.div>
      </Variant>

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 text-center">
        <p className="text-sm text-muted-foreground">
          Done picking? Tell me the variant number and I&apos;ll wire it through
          a shared <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">FunnelCTA</code>{" "}
          component, replacing the four inline buttons on the page.
        </p>
      </div>
    </main>
  );
}
