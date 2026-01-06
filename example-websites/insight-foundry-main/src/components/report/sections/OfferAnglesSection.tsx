import { SectionWrapper } from "../SectionWrapper";
import { OfferAngleCard } from "../OfferAngleCard";
import { reportData } from "@/data/reportData";

export const OfferAnglesSection = () => {
  const angles = reportData.data.generic_offer_angles;

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
