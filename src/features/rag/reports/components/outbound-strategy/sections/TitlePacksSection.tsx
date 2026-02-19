"use client";

import { useState } from "react";
import { SectionWrapper } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faUserXmark,
  faCrown,
  faWrench,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

type TitlePacks = {
  description?: string;
  champion_titles?: string[];
  titles_to_exclude?: string[];
  economic_buyer_titles?: string[];
  technical_evaluator_titles?: string[];
};

interface TitlePacksSectionProps {
  titlePacks: TitlePacks;
  sectionNumber?: string;
}

const TitleGroup = ({
  title,
  icon,
  items,
  variant = "default",
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  variant?: "default" | "exclude";
}) => {
  const [expanded, setExpanded] = useState(true);
  const borderClass =
    variant === "exclude"
      ? "border-amber-200 dark:border-amber-800"
      : "border-border";
  const bgClass =
    variant === "exclude"
      ? "bg-amber-50/50 dark:bg-amber-950/20"
      : "bg-card";

  return (
    <div
      className={`rounded-xl border ${borderClass} ${bgClass} report-shadow overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            {icon}
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground font-body">
              {items.length} title{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <FontAwesomeIcon
          icon={expanded ? faChevronUp : faChevronDown}
          className="w-4 h-4 text-muted-foreground"
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-border">
              <ul className="space-y-2 mt-4">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm font-body text-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const TitlePacksSection = ({
  titlePacks,
  sectionNumber = "01",
}: TitlePacksSectionProps) => {
  const champion = titlePacks?.champion_titles ?? [];
  const exclude = titlePacks?.titles_to_exclude ?? [];
  const economic = titlePacks?.economic_buyer_titles ?? [];
  const technical = titlePacks?.technical_evaluator_titles ?? [];

  if (champion.length === 0 && exclude.length === 0 && economic.length === 0 && technical.length === 0) {
    return (
      <SectionWrapper
        id="title-packs"
        number={sectionNumber}
        title="Title Packs"
        subtitle="Decision-maker titles to target and exclude"
      >
        <p className="text-sm text-muted-foreground font-body">
          No title packs available
        </p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="title-packs"
      number={sectionNumber}
      title="Title Packs"
      subtitle={titlePacks?.description || undefined}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TitleGroup
          title="Champion Titles"
          icon={<FontAwesomeIcon icon={faUserTie} className="w-5 h-5" />}
          items={champion}
        />
        <TitleGroup
          title="Titles to Exclude"
          icon={<FontAwesomeIcon icon={faUserXmark} className="w-5 h-5" />}
          items={exclude}
          variant="exclude"
        />
        <TitleGroup
          title="Economic Buyer Titles"
          icon={<FontAwesomeIcon icon={faCrown} className="w-5 h-5" />}
          items={economic}
        />
        <TitleGroup
          title="Technical Evaluator Titles"
          icon={<FontAwesomeIcon icon={faWrench} className="w-5 h-5" />}
          items={technical}
        />
      </div>
    </SectionWrapper>
  );
};
