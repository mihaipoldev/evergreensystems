"use client";

import { motion } from "framer-motion";
import { SectionWrapper, ContentCard, BlockHeader } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faUsers,
  faStar,
  faQuoteRight,
  faHandshake,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

type OfferAngle = {
  angle_name?: string;
  core_promise?: string;
  who_it_targets?: string;
  why_this_resonates?: string[];
  positioning_statement?: string;
};

type Differentiation = Record<string, { key_message?: string; proof_point?: string; our_approach?: string; their_approach?: string }>;

type ProofRequirement = string | { item?: string; priority?: string; purpose?: string };

type Positioning = {
  description?: string;
  offer_angles?: OfferAngle[];
  primary_wedge?: { statement?: string; why_it_works?: string[] };
  differentiation?: Differentiation;
  value_proposition?: {
    emotional_benefits?: string[];
    strategic_benefits?: string[];
    functional_benefits?: string[];
  };
  proof_requirements?: ProofRequirement[];
};

interface PositioningSectionProps {
  positioning: Positioning;
  sectionNumber?: string;
}

export const PositioningSection = ({
  positioning,
  sectionNumber = "08",
}: PositioningSectionProps) => {
  const angles = positioning?.offer_angles ?? [];
  const primaryWedge = positioning?.primary_wedge;
  const differentiation = positioning?.differentiation;
  const valueProp = positioning?.value_proposition;
  const rawProofReqs = positioning?.proof_requirements ?? [];
  const proofReqs = rawProofReqs.map((p) =>
    typeof p === "string" ? p : (p?.item ?? (p as { purpose?: string }).purpose ?? String(p))
  );

  return (
    <SectionWrapper
      id="positioning"
      number={sectionNumber}
      title="Positioning"
      subtitle={positioning?.description || undefined}
    >
      {/* Primary Wedge */}
      {primaryWedge?.statement && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Primary Wedge"
            icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />}
          />
          <ContentCard variant="primary" title="Core Statement">
            <p className="text-base font-body text-primary-foreground mb-4">
              {primaryWedge.statement}
            </p>
            {primaryWedge.why_it_works && primaryWedge.why_it_works.length > 0 && (
              <div>
                <h5 className="text-sm uppercase tracking-wider text-primary-foreground/80 font-body mb-2">
                  Why It Works
                </h5>
                <ul className="space-y-2">
                  {primaryWedge.why_it_works.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-primary-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ContentCard>
        </div>
      )}

      {/* Offer Angles */}
      {angles.length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Offer Angles"
            icon={<FontAwesomeIcon icon={faStar} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-6">
            {angles.map((angle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
              >
                <div className="bg-accent/10 p-5 border-b border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-accent" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                      Offer Angle {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    {angle.angle_name}
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {angle.who_it_targets && (
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                          Who It Targets
                        </span>
                        <p className="text-sm font-body text-foreground">{angle.who_it_targets}</p>
                      </div>
                    </div>
                  )}
                  {angle.core_promise && (
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                          Core Promise
                        </span>
                        <p className="text-sm font-body text-foreground font-medium">{angle.core_promise}</p>
                      </div>
                    </div>
                  )}
                  {angle.positioning_statement && (
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faQuoteRight} className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                          Positioning Statement
                        </span>
                        <p className="text-sm font-body text-foreground italic">{angle.positioning_statement}</p>
                      </div>
                    </div>
                  )}
                  {angle.why_this_resonates && angle.why_this_resonates.length > 0 && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">
                        Why This Resonates
                      </span>
                      <ul className="space-y-2">
                        {angle.why_this_resonates.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Differentiation */}
      {differentiation && Object.keys(differentiation).length > 0 && (
        <div className="mb-10">
          <BlockHeader
            variant="title"
            title="Differentiation"
            icon={<FontAwesomeIcon icon={faHandshake} className="w-5 h-5 text-accent" />}
          />
          <div className="space-y-6">
            {Object.entries(differentiation).map(([key, val]) => (
              <ContentCard
                key={key}
                title={key.replace(/^vs_/, "vs. ").replace(/_/g, " ")}
                titleVariant="title"
              >
                <div className="space-y-4">
                  {val.key_message && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                        Key Message
                      </span>
                      <p className="text-sm font-body text-foreground font-medium">{val.key_message}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                    {val.our_approach && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-green-600 dark:text-green-400 font-body block mb-1">
                          Our Approach
                        </span>
                        <p className="text-sm font-body text-foreground">{val.our_approach}</p>
                      </div>
                    )}
                    {val.their_approach && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
                          Their Approach
                        </span>
                        <p className="text-sm font-body text-foreground">{val.their_approach}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ContentCard>
            ))}
          </div>
        </div>
      )}

      {/* Value Proposition */}
      {valueProp && (
        <div className="mb-10">
          <BlockHeader variant="title" title="Value Proposition" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {valueProp.functional_benefits && valueProp.functional_benefits.length > 0 && (
              <ContentCard title="Functional Benefits">
                <ul className="space-y-2">
                  {valueProp.functional_benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {valueProp.emotional_benefits && valueProp.emotional_benefits.length > 0 && (
              <ContentCard variant="accent" title="Emotional Benefits">
                <ul className="space-y-2">
                  {valueProp.emotional_benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {valueProp.strategic_benefits && valueProp.strategic_benefits.length > 0 && (
              <ContentCard variant="primary" title="Strategic Benefits">
                <ul className="space-y-2">
                  {valueProp.strategic_benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-primary-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
          </div>
        </div>
      )}

      {/* Proof Requirements */}
      {proofReqs.length > 0 && (
        <div>
          <BlockHeader
            variant="title"
            title="Proof Requirements"
            icon={<FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5 text-accent" />}
          />
          <ul className="space-y-2">
            {proofReqs.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground p-3 rounded-lg bg-muted/30 border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionWrapper>
  );
};
