"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faClock,
  faTriangleExclamation,
  faCircleXmark,
  faChevronRight,
  faBullseye,
  faArrowTrendDown,
  faCalendar,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import {
  SectionWrapper,
  StatCard,
  BlockHeader,
  ContentCard,
} from "../../shared";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

const urgencyBadges = {
  high: "bg-red-600 text-white",
  medium: "bg-yellow-600 text-white",
  low: "bg-blue-600 text-white",
};

type CoolingSignalItem = {
  signal: string;
  meaning?: string;
  action?: string;
  revisit_when?: string;
};

type DisqualifyingSignalItem = {
  signal: string;
  description?: string;
  why_disqualifying?: string;
  detection?: string;
};

interface TriggersSectionProps {
  data: ReportData;
}

/** Normalize cooling_signals from either { signals: [...] } or { signal_1: string, signal_2: string, ... } */
function normalizeCoolingSignals(cooling: Record<string, unknown> | undefined): CoolingSignalItem[] {
  if (!cooling) return [];
  const signalsArr = cooling.signals;
  if (Array.isArray(signalsArr)) {
    return (signalsArr as CoolingSignalItem[]).map((s) => ({
      signal: typeof s === "object" && s && "signal" in s ? String((s as CoolingSignalItem).signal) : String(s),
      meaning: typeof (s as CoolingSignalItem).meaning === "string" ? (s as CoolingSignalItem).meaning : undefined,
      action: typeof (s as CoolingSignalItem).action === "string" ? (s as CoolingSignalItem).action : undefined,
      revisit_when: typeof (s as CoolingSignalItem).revisit_when === "string" ? (s as CoolingSignalItem).revisit_when : undefined,
    }));
  }
  return Object.entries(cooling)
    .filter(([k]) => k.startsWith("signal_") && typeof (cooling as Record<string, string>)[k] === "string")
    .map(([key, value], i) => ({ signal: `Cooling signal ${i + 1}`, meaning: value as string }));
}

/** Normalize disqualifying_signals from either [{ signal, description, ... }] or string[] */
function normalizeDisqualifyingSignals(arr: unknown): DisqualifyingSignalItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === "string") return { signal: item, description: item };
    if (item && typeof item === "object" && "signal" in item) {
      const o = item as DisqualifyingSignalItem;
      return { signal: String(o.signal), description: o.description, why_disqualifying: o.why_disqualifying, detection: o.detection };
    }
    return { signal: String(item), description: String(item) };
  });
}

export const TriggersSection = ({ data }: TriggersSectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: Record<string, unknown> }).buyer_icp;
  const raw = buyerIcp?.triggers as Record<string, unknown> | undefined;

  if (!raw) {
    return (
      <SectionWrapper id="triggers" number="03" title="Buying Triggers" subtitle="High, medium, and low urgency triggers; cooling and disqualifying signals">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  const highUrgency = Array.isArray(raw.high_urgency) ? raw.high_urgency : [];
  const mediumUrgency = Array.isArray(raw.medium_urgency) ? raw.medium_urgency : [];
  const lowUrgency = Array.isArray(raw.low_urgency) ? raw.low_urgency : [];
  const hasConfidence = typeof raw.confidence === "number";
  const coolingSignals = normalizeCoolingSignals(raw.cooling_signals as Record<string, unknown> | undefined);
  const coolingDescription = raw.cooling_signals && typeof raw.cooling_signals === "object" && "description" in raw.cooling_signals
    ? String((raw.cooling_signals as { description?: string }).description ?? "")
    : "";
  const disqualifyingSignals = normalizeDisqualifyingSignals(raw.disqualifying_signals);

  return (
    <SectionWrapper
      id="triggers"
      number="03"
      title="Buying Triggers"
      subtitle="Events and circumstances that cause customers to actively seek solutions"
    >
      <div className={`grid grid-cols-1 gap-4 mb-8 ${hasConfidence ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {hasConfidence && (
          <StatCard
            label="Confidence"
            value={`${((raw.confidence as number) * 100).toFixed(0)}%`}
            icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />}
          />
        )}
        <StatCard
          label="High Urgency Triggers"
          value={highUrgency.length}
          icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Total Triggers"
          value={highUrgency.length + mediumUrgency.length + lowUrgency.length}
          icon={<FontAwesomeIcon icon={faClock} className="w-5 h-5" />}
        />
      </div>

      <TriggerCategory
        title="High Urgency Triggers"
        triggers={highUrgency as Array<Record<string, unknown>>}
        urgency="high"
        description="Act quickly - these signals indicate immediate buying intent"
      />
      <TriggerCategory
        title="Medium Urgency Triggers"
        triggers={mediumUrgency as Array<Record<string, unknown>>}
        urgency="medium"
        description="Engage and nurture - these signals indicate sustained but not immediate interest"
      />
      <TriggerCategory
        title="Low Urgency Triggers"
        triggers={lowUrgency as Array<Record<string, unknown>>}
        urgency="low"
        description="Long-term nurture - these signals indicate research phase, not active buying"
      />

      {coolingSignals.length > 0 && (
        <div className="mb-8">
          <BlockHeader
            variant="title"
            title="Cooling Signals"
            icon={<FontAwesomeIcon icon={faArrowTrendDown} className="w-5 h-5 text-muted-foreground" />}
            subtitle={coolingDescription || undefined}
          />
          <Accordion type="single" collapsible className="space-y-3">
            {coolingSignals.map((signal) => (
              <AccordionItem
                key={signal.signal}
                value={signal.signal}
                className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-center gap-3 w-full text-left">
                    <FontAwesomeIcon icon={faArrowTrendDown} className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-display font-semibold text-foreground">
                        {signal.signal}
                      </h3>
                      <p className="text-sm text-muted-foreground font-body mt-0.5 line-clamp-1">
                        {signal.meaning ?? signal.signal}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-5 pt-5 pb-5 space-y-4 border-t border-border">
                    <div>
                      <BlockHeader variant="label" title="What This Means" />
                      <p className="text-sm font-body text-foreground leading-relaxed">{signal.meaning ?? signal.signal}</p>
                    </div>
                    {signal.action != null && (
                      <div>
                        <BlockHeader variant="label" title="Recommended Action" />
                        <p className="text-sm font-body text-foreground leading-relaxed">{signal.action}</p>
                      </div>
                    )}
                    {signal.revisit_when != null && (
                      <div>
                        <BlockHeader variant="label" title="Revisit When" />
                        <p className="text-sm font-body text-foreground leading-relaxed">{signal.revisit_when}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      <div>
        <BlockHeader
          variant="title"
          title="Disqualifying Signals"
          icon={<FontAwesomeIcon icon={faCircleXmark} className="w-5 h-5 text-destructive" />}
          subtitle="Hard stops - these signals indicate the prospect is not a fit and should be removed from pipeline"
        />
        <Accordion type="single" collapsible className="space-y-3">
          {disqualifyingSignals.map((signal) => (
            <AccordionItem
              key={signal.signal}
              value={signal.signal}
              className="bg-card rounded-xl border border-border report-shadow overflow-hidden border-l-4 border-l-red-500/60"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-3 w-full text-left">
                  <FontAwesomeIcon icon={faCircleXmark} className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-display font-semibold text-foreground">
                      {signal.signal}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body mt-0.5 line-clamp-1">
                      {signal.description ?? signal.signal}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-5 pt-5 pb-5 space-y-4 border-t border-border">
                  <div>
                    <BlockHeader variant="label" title="Description" />
                    <p className="text-sm font-body text-foreground leading-relaxed">{signal.description ?? signal.signal}</p>
                  </div>
                  {signal.why_disqualifying != null && (
                    <div>
                      <BlockHeader variant="label" title="Why Disqualifying" />
                      <p className="text-sm font-body text-foreground leading-relaxed">{signal.why_disqualifying}</p>
                    </div>
                  )}
                  {signal.detection != null && (
                    <div>
                      <BlockHeader variant="label" title="Detection" />
                      <p className="text-sm font-body text-foreground leading-relaxed">{signal.detection}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionWrapper>
  );
};

interface TriggerCategoryProps {
  title: string;
  triggers: Array<Record<string, unknown>>;
  urgency: "high" | "medium" | "low";
  description: string;
}

const TriggerCategory = ({ title, triggers, urgency, description }: TriggerCategoryProps) => {
  const badge = urgencyBadges[urgency];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${badge}`}>
          {urgency.toUpperCase()}
        </span>
        <h4 className="text-lg font-display font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-sm text-muted-foreground font-body mb-4">{description}</p>

      <Accordion type="single" collapsible className="space-y-3">
        {triggers.map((trigger: Record<string, unknown>) => (
          <AccordionItem
            key={trigger.trigger as string}
            value={trigger.trigger as string}
            className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-4 w-full text-left">
                <div className={`w-10 h-10 rounded-full ${badge} flex items-center justify-center flex-shrink-0`}>
                  <FontAwesomeIcon icon={faBolt} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-display font-semibold text-foreground">
                    {trigger.trigger as string}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mt-0.5 line-clamp-1">
                    {trigger.description as string}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-5 pt-5 pb-5 space-y-6 border-t border-border">
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {trigger.description as string}
                </p>
                <ContentCard variant="primary" title="Why This Trigger Works">
                  <p className="text-sm font-body text-primary-foreground leading-relaxed">
                    {trigger.why_it_works as string}
                  </p>
                </ContentCard>
                <div>
                  <BlockHeader variant="label" title="Timing Windows" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trigger.timing && typeof trigger.timing === "object" ? (
                      <>
                        <ContentCard variant="green" style="summary" title="Peak Urgency">
                          {(trigger.timing as Record<string, string>).peak_urgency}
                        </ContentCard>
                        <ContentCard variant="green" style="summary" title="Still Good">
                          {(trigger.timing as Record<string, string>).still_good}
                        </ContentCard>
                        <ContentCard variant="warning" style="summary" title="Urgency Fading">
                          {(trigger.timing as Record<string, string>).urgency_fading}
                        </ContentCard>
                        <ContentCard variant="danger" style="summary" title="Likely Too Late">
                          {(trigger.timing as Record<string, string>).likely_too_late}
                        </ContentCard>
                      </>
                    ) : null}
                  </div>
                </div>
                <div>
                  <BlockHeader variant="label" title="Detection Sources" />
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Array.isArray(trigger.detection_sources) &&
                      (trigger.detection_sources as string[]).map((source: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-muted/50 rounded-md p-2 border border-border">
                          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{source}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
