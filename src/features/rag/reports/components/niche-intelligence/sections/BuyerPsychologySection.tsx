"use client";

import {
  SectionWrapper,
  BlockHeader,
  ContentCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBolt,
  faExclamationTriangle,
  faUserTie,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {buyer.decision_makers.map((dm, index) =>
                isDecisionMakerObject(dm) ? (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl border border-border report-shadow overflow-hidden flex flex-col"
                  >
                    <div className="flex items-start gap-4 p-5">
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faUserTie} className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-display font-semibold text-foreground">
                          {dm.role || `Decision Maker ${index + 1}`}
                        </h3>
                        {dm.influence && (
                          <p className="text-sm font-body text-muted-foreground mt-1.5 leading-relaxed">
                            {dm.influence}
                          </p>
                        )}
                      </div>
                    </div>
                    {dm.what_they_care_about && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="flex gap-3 rounded-lg bg-muted/50 border border-border p-4">
                          <FontAwesomeIcon icon={faQuoteLeft} className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-body text-muted-foreground leading-relaxed">
                            {dm.what_they_care_about}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {buyer.buying_triggers.map((trigger, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4"
                >
                  <span className="text-sm font-semibold text-primary tabular-nums flex-shrink-0">
                    {index + 1}.
                  </span>
                  <p className="text-sm font-body text-foreground leading-snug">
                    {typeof trigger === "string" ? trigger : getItemText(trigger)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {buyer.objections_they_face && buyer.objections_they_face.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Objections They Face"
              icon={<FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-2 mt-4">
              {buyer.objections_they_face.map((obj, index) =>
                isObjectionObject(obj) ? (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-muted/40 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {obj.objection || `Objection ${index + 1}`}
                    </p>
                    {(obj.frequency || obj.underlying_concern) && (
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {obj.frequency && (
                          <span><span className="font-medium text-foreground">Frequency:</span> {obj.frequency}</span>
                        )}
                        {obj.underlying_concern && (
                          <span><span className="font-medium text-foreground">Concern:</span> {obj.underlying_concern}</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-body text-foreground"
                  >
                    {getItemText(obj)}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
