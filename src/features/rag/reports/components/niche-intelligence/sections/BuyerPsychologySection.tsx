"use client";

import {
  SectionWrapper,
  InsightList,
  BlockHeader,
  ContentCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBolt,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

interface DecisionMaker {
  role?: string;
  influence?: string;
  what_they_care_about?: string;
}

interface Objection {
  objection?: string;
  frequency?: string;
  underlying_concern?: string;
}

interface BuyerPsychology {
  decision_makers?: (string | DecisionMaker)[];
  buying_triggers?: string[];
  objections_they_face?: (string | Objection)[];
}

interface BuyerPsychologySectionProps {
  buyer: BuyerPsychology;
  sectionNumber?: string;
}

const getItemText = (item: string | Record<string, unknown>): string => {
  if (typeof item === "string") return item;
  return (item.role ?? item.name ?? item.value ?? item.text ?? item.label ?? JSON.stringify(item)) as string;
};

const isDecisionMakerObject = (item: unknown): item is DecisionMaker =>
  item != null && typeof item === "object" && "role" in item;

const isObjectionObject = (item: unknown): item is Objection =>
  item != null && typeof item === "object" && "objection" in item;

export const BuyerPsychologySection = ({ buyer, sectionNumber = "16" }: BuyerPsychologySectionProps) => {
  return (
    <SectionWrapper
      id="buyer-psychology"
      number={sectionNumber}
      title="Buyer Psychology"
      subtitle="Decision-making dynamics, triggers, objections, and sales cycle insights"
    >
      <div className="space-y-8">
        {buyer.decision_makers && buyer.decision_makers.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Key Decision Makers"
              icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-4">
              {buyer.decision_makers.map((dm, index) =>
                isDecisionMakerObject(dm) ? (
                  <ContentCard
                    key={index}
                    variant="default"
                    title={dm.role || `Decision Maker ${index + 1}`}
                    titleVariant="title"
                  >
                    {dm.influence && (
                      <p className="text-sm font-body text-foreground mb-2">
                        <span className="font-medium">Influence: </span>
                        {dm.influence}
                      </p>
                    )}
                    {dm.what_they_care_about && (
                      <p className="text-sm font-body text-muted-foreground">
                        <span className="font-medium text-foreground">What they care about: </span>
                        {dm.what_they_care_about}
                      </p>
                    )}
                  </ContentCard>
                ) : (
                  <ContentCard key={index} variant="default" title={getItemText(dm)} titleVariant="title" />
                )
              )}
            </div>
          </div>
        )}

        {buyer.buying_triggers && buyer.buying_triggers.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Buying Triggers"
              icon={<FontAwesomeIcon icon={faBolt} className="w-5 h-5 text-accent" />}
            />
            <InsightList items={buyer.buying_triggers} type="target" numbered />
          </div>
        )}

        {buyer.objections_they_face && buyer.objections_they_face.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Objections They Face"
              icon={<FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            />
            <div className="space-y-4">
              {buyer.objections_they_face.map((obj, index) =>
                isObjectionObject(obj) ? (
                  <ContentCard
                    key={index}
                    variant="warning"
                    title={obj.objection || `Objection ${index + 1}`}
                    titleVariant="title"
                  >
                    {obj.frequency && (
                      <p className="text-sm font-body text-foreground mb-2">
                        <span className="font-medium">Frequency: </span>
                        {obj.frequency}
                      </p>
                    )}
                    {obj.underlying_concern && (
                      <p className="text-sm font-body text-muted-foreground">
                        <span className="font-medium text-foreground">Underlying concern: </span>
                        {obj.underlying_concern}
                      </p>
                    )}
                  </ContentCard>
                ) : (
                  <ContentCard key={index} variant="warning" title={getItemText(obj)} titleVariant="title" />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
