"use client";

import {
  SectionWrapper,
  ContentCard,
  InsightList,
  BlockHeader,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faBan,
  faCheckCircle,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface WhatYouSellSectionProps {
  data: NonNullable<OfferArchitectData["what_you_sell"]>;
  sectionNumber?: string;
}

export const WhatYouSellSection = ({
  data,
  sectionNumber = "02",
}: WhatYouSellSectionProps) => {
  return (
    <SectionWrapper
      id="what-you-sell"
      number={sectionNumber}
      title="What You Sell"
      subtitle="Core promise, positioning, and offer statements"
    >
      <div className="space-y-8">
        {/* Core Promise — Hero */}
        {data.core_promise && (
          <ContentCard
            variant="accent"
            title="Core Promise"
            icon={<FontAwesomeIcon icon={faStar} className="w-5 h-5" />}
          >
            <p className="text-lg md:text-xl font-display font-semibold text-foreground leading-relaxed">
              {data.core_promise}
            </p>
          </ContentCard>
        )}

        {/* Not Selling vs Actually Selling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.what_you_are_not_selling && data.what_you_are_not_selling.length > 0 && (
            <div>
              <BlockHeader
                variant="title"
                title="What You Are NOT Selling"
                icon={<FontAwesomeIcon icon={faBan} className="w-5 h-5 text-muted-foreground" />}
              />
              <InsightList items={data.what_you_are_not_selling} type="default" />
            </div>
          )}
          {data.what_you_are_actually_selling && (
            <ContentCard
              variant="success"
              title="What You Are Actually Selling"
              icon={<FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />}
            >
              <p className="text-base font-body text-foreground leading-relaxed">
                {data.what_you_are_actually_selling}
              </p>
            </ContentCard>
          )}
        </div>

        {/* Why This Distinction Matters */}
        {data.why_this_distinction_matters && data.why_this_distinction_matters.length > 0 && (
          <div>
            <BlockHeader variant="title" title="Why This Distinction Matters" />
            <InsightList items={data.why_this_distinction_matters} type="info" />
          </div>
        )}

        {/* Offer Statements */}
        {data.offer_statement && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.offer_statement.primary_statement && (
              <ContentCard
                variant="accent"
                title="Primary Offer Statement"
                icon={<FontAwesomeIcon icon={faQuoteLeft} className="w-5 h-5" />}
              >
                <p className="text-base md:text-lg font-display font-medium text-foreground leading-relaxed italic">
                  &ldquo;{data.offer_statement.primary_statement}&rdquo;
                </p>
              </ContentCard>
            )}
            {data.offer_statement.secondary_statement && (
              <ContentCard
                variant="default"
                title="Secondary Offer Statement"
                icon={<FontAwesomeIcon icon={faQuoteLeft} className="w-5 h-5" />}
              >
                <p className="text-base font-body text-foreground leading-relaxed italic">
                  &ldquo;{data.offer_statement.secondary_statement}&rdquo;
                </p>
              </ContentCard>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
