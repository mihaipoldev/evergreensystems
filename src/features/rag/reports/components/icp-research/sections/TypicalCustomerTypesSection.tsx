"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper, BlockHeader, ContentCard, InsightList } from "../../shared";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

type TypicalCustomerTypesData = {
  description?: string;
  customer_types?: string[];
};

export const TypicalCustomerTypesSection = ({ data }: { data: ReportData }) => {
  const payload = (data.data as { typical_customer_types?: TypicalCustomerTypesData })
    ?.typical_customer_types;

  if (!payload?.customer_types?.length) {
    return (
      <SectionWrapper
        id="typical-customer-types"
        number="08"
        title="Typical Customer Types"
        subtitle="Categories of customers served by this niche"
      >
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="typical-customer-types"
      number="08"
      title="Typical Customer Types"
      subtitle="Categories of customers served by this niche"
    >
      {payload.description && (
        <div className="mb-6">
          <ContentCard variant="muted" style="summary">
            <p className="text-sm font-body text-foreground leading-relaxed">
              {payload.description}
            </p>
          </ContentCard>
        </div>
      )}
      <BlockHeader
        variant="title"
        title="Customer Types"
        icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-accent" />}
      />
      <InsightList items={payload.customer_types} type="default" numbered />
    </SectionWrapper>
  );
};
