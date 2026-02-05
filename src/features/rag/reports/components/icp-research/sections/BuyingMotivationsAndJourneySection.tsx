"use client";

import { WhyTheyBuySection } from "./WhyTheyBuySection";
import { BuyingCommitteeSection } from "./BuyingCommitteeSection";
import { PurchaseJourneySection } from "./PurchaseJourneySection";
import type { ReportData } from "../../../types";

/**
 * Section 5: Buying Motivations & Journey.
 * Wraps Why They Buy, Buying Committee, and Purchase Journey for a single TOC entry (id: buying-motivations-journey).
 */
interface BuyingMotivationsAndJourneySectionProps {
  data: ReportData;
}

export const BuyingMotivationsAndJourneySection = ({ data }: BuyingMotivationsAndJourneySectionProps) => {
  return (
    <section id="buying-motivations-journey" className="scroll-mt-8 mb-16">
      <WhyTheyBuySection data={data} />
      <BuyingCommitteeSection data={data} />
      <PurchaseJourneySection data={data} />
    </section>
  );
};
