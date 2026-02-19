"use client";

import { motion } from "framer-motion";
import {
  SectionWrapper,
  DataTable,
  BlockHeader,
} from "../../shared";
import { ReportCollapsibleCard } from "../../shared/ReportCollapsibleCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faDollarSign,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface ObjectionHandlingSectionProps {
  data: NonNullable<OfferArchitectData["objection_handling"]>;
  reportId: string;
  sectionNumber?: string;
}

export const ObjectionHandlingSection = ({
  data,
  reportId,
  sectionNumber = "09",
}: ObjectionHandlingSectionProps) => {
  return (
    <SectionWrapper
      id="objection-handling"
      number={sectionNumber}
      title="Objection Handling"
      subtitle="Anticipated objections with scripted response frameworks"
    >
      <div className="space-y-8">
        {/* Common Objections */}
        {data.common_objections && data.common_objections.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Common Objections"
              icon={<FontAwesomeIcon icon={faComments} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-3">
              {data.common_objections.map((obj, index) => (
                <ReportCollapsibleCard
                  key={index}
                  id={`common-objection-${index}`}
                  reportId={reportId}
                  title={
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-foreground">
                        {obj.objection || `Objection ${index + 1}`}
                      </span>
                      {obj.frequency && (
                        <span className="text-xs font-body text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-full px-2 py-0.5 border border-amber-200 dark:border-amber-800">
                          {obj.frequency}
                        </span>
                      )}
                    </div>
                  }
                  defaultOpen={index === 0}
                >
                  <div className="space-y-4">
                    {obj.underlying_concern && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                          Underlying Concern
                        </span>
                        <p className="text-sm font-body text-foreground mt-1">
                          {obj.underlying_concern}
                        </p>
                      </div>
                    )}

                    {/* Response Framework */}
                    {obj.response_framework && (
                      <div className="space-y-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                          Response Framework
                        </span>
                        <div className="space-y-2 mt-2">
                          {obj.response_framework.acknowledge && (
                            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                1
                              </span>
                              <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Acknowledge</span>
                                <p className="text-sm font-body text-foreground mt-0.5">{obj.response_framework.acknowledge}</p>
                              </div>
                            </div>
                          )}
                          {obj.response_framework.reframe && (
                            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                2
                              </span>
                              <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Reframe</span>
                                <p className="text-sm font-body text-foreground mt-0.5">{obj.response_framework.reframe}</p>
                              </div>
                            </div>
                          )}
                          {obj.response_framework.differentiate && (
                            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                3
                              </span>
                              <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Differentiate</span>
                                <p className="text-sm font-body text-foreground mt-0.5">{obj.response_framework.differentiate}</p>
                              </div>
                            </div>
                          )}
                          {obj.response_framework.close && (
                            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                4
                              </span>
                              <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Close</span>
                                <p className="text-sm font-body text-foreground mt-0.5">{obj.response_framework.close}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {obj.proof_to_overcome && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                          Proof to Overcome
                        </span>
                        <p className="text-sm font-body text-foreground mt-1">
                          {obj.proof_to_overcome}
                        </p>
                      </div>
                    )}
                  </div>
                </ReportCollapsibleCard>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Objections */}
        {data.pricing_objections && data.pricing_objections.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Pricing Objections"
              icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5 text-accent" />}
            />
            <DataTable
              headers={["Objection", "Response"]}
              rows={data.pricing_objections.map((po) => [
                po.objection || "—",
                po.response || "—",
              ])}
            />
          </div>
        )}

        {/* Guarantee Objections */}
        {data.guarantee_objections && data.guarantee_objections.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Guarantee Objections"
              icon={<FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 text-accent" />}
            />
            <DataTable
              headers={["Objection", "Response"]}
              rows={data.guarantee_objections.map((go) => [
                go.objection || "—",
                go.response || "—",
              ])}
            />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
