import { SectionWrapper } from "../SectionWrapper";
import { InsightList } from "../InsightList";
import { icpData } from "@/data/icpData";

export const WhyTheyBuySection = () => {
  const snapshot = icpData.data.buyer_icp.snapshot;

  return (
    <SectionWrapper
      id="why-they-buy"
      number="02"
      title="Buying Motivations"
      subtitle="Understanding what drives purchase decisions and what blocks them"
    >
      {/* Why They Buy */}
      <div className="mb-10">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-sm font-bold">+</span>
          </span>
          Why They Buy
        </h4>
        <InsightList items={snapshot.why_they_buy} type="success" numbered />
      </div>

      {/* Why They Don't Buy */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-sm font-bold">−</span>
          </span>
          Why They Don't Buy
        </h4>
        <InsightList items={snapshot.why_they_dont_buy} type="warning" numbered />
      </div>
    </SectionWrapper>
  );
};
