"use client";

import {
  SectionWrapper,
  ContentCard,
  TagCloud,
  BlockHeader,
} from "../../shared";

interface WhatTheySell {
  what_they_sell?: string;
  common_service_lines?: string[];
  typical_customer_types?: string[];
}

interface WhatTheySellSectionProps {
  data: WhatTheySell;
  sectionNumber?: string;
}

const getText = (v: unknown, fallback: string): string => {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  const o = v as Record<string, unknown>;
  return (o.value ?? o.text ?? o.description ?? String(v)) as string;
};

export const WhatTheySellSection = ({ data, sectionNumber = "03" }: WhatTheySellSectionProps) => {
  return (
    <SectionWrapper
      id="what-they-sell"
      number={sectionNumber}
      title="What They Sell"
      subtitle="Service offerings and typical customer types"
    >
      <div className="space-y-8">
        {data.what_they_sell && (
          <ContentCard variant="default" style="summary" title="Overview">
            <p className="text-base font-body text-foreground leading-relaxed">
              {getText(data.what_they_sell, "")}
            </p>
          </ContentCard>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.common_service_lines && data.common_service_lines.length > 0 && (
            <div>
              <BlockHeader variant="label" title="Common Service Lines" />
              <TagCloud tags={data.common_service_lines} variant="accent" />
            </div>
          )}
          {data.typical_customer_types && data.typical_customer_types.length > 0 && (
            <div>
              <BlockHeader variant="label" title="Typical Customer Types" />
              <TagCloud tags={data.typical_customer_types} />
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};
