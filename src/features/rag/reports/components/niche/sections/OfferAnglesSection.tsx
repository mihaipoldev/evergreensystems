import { SectionWrapper } from "../../shared/SectionWrapper";
import { OfferAngleCard } from "../../shared/OfferAngleCard";
import type { ReportData } from "../../../types";

interface OfferAnglesSectionProps {
  angles: ReportData["data"]["generic_offer_angles"];
}

export const OfferAnglesSection = ({ angles }: OfferAnglesSectionProps) => {
  if (!angles || angles.length === 0) {
    return (
      <SectionWrapper
        id="offer-angles"
        number="06"
        title="Offer Angles"
        subtitle="Strategic positioning frameworks for lead generation services"
      >
        <p className="text-sm text-muted-foreground font-body">
          No offer angles available
        </p>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      id="offer-angles"
      number="06"
      title="Offer Angles"
      subtitle="Strategic positioning frameworks for lead generation services"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {angles.map((angle, index) => (
          <OfferAngleCard key={index} angle={angle} index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
};

