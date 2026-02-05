"use client";

import { SectionWrapper, BlockHeader, InsightList } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleMinus } from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

interface WhyTheyBuySectionProps {
  data: ReportData;
}

export const WhyTheyBuySection = ({ data }: WhyTheyBuySectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: { snapshot?: { why_they_buy?: string[]; why_they_dont_buy?: string[] } } })?.buyer_icp;
  const snapshot = buyerIcp?.snapshot;

  if (!snapshot?.why_they_buy?.length && !snapshot?.why_they_dont_buy?.length) {
    return (
      <SectionWrapper id="why-they-buy" number="5.1" title="Buying Motivations" subtitle="Understanding what drives purchase decisions and what blocks them">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="why-they-buy"
      number="5.1"
      title="Buying Motivations"
      subtitle="Understanding what drives purchase decisions and what blocks them"
    >
      <div className="mb-10">
        <BlockHeader
          variant="title"
          title="Why They Buy"
          icon={
            <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
              <FontAwesomeIcon icon={faCirclePlus} className="text-green-600 dark:text-green-400 w-4 h-4" />
            </span>
          }
        />
        <InsightList items={snapshot.why_they_buy ?? []} type="success" numbered />
      </div>

      <div>
        <BlockHeader
          variant="title"
          title="Why They Don't Buy"
          icon={
            <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/30">
              <FontAwesomeIcon icon={faCircleMinus} className="text-red-600 dark:text-red-400 w-4 h-4" />
            </span>
          }
        />
        <InsightList items={snapshot.why_they_dont_buy ?? []} type="warning" numbered />
      </div>
    </SectionWrapper>
  );
};
