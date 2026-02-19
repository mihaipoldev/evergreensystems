"use client";

import { motion } from "framer-motion";
import {
  SectionWrapper,
  StatCard,
  ContentCard,
  InsightList,
  DataTable,
  BlockHeader,
  KeyValueBlock,
} from "../../shared";
import { ReportCollapsibleCard } from "../../shared/ReportCollapsibleCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faHandshake,
  faChartBar,
  faUserTag,
  faListOl,
} from "@fortawesome/free-solid-svg-icons";
import type { OfferArchitectData } from "../types";

interface OutreachStrategySectionProps {
  data: NonNullable<OfferArchitectData["outreach_strategy"]>;
  reportId: string;
  sectionNumber?: string;
}

export const OutreachStrategySection = ({
  data,
  reportId,
  sectionNumber = "12",
}: OutreachStrategySectionProps) => {
  const cold = data.cold_outreach_approach;

  return (
    <SectionWrapper
      id="outreach-strategy"
      number={sectionNumber}
      title="Outreach Strategy"
      subtitle="Prospecting playbook: cold outreach, personalization, and sequences"
    >
      <div className="space-y-8">
        {/* Cold Outreach Approach */}
        {cold && (
          <div className="space-y-4">
            {cold.tone && (
              <ContentCard variant="default" title="Tone">
                <p className="text-base font-body text-foreground leading-relaxed">
                  {cold.tone}
                </p>
              </ContentCard>
            )}

            {/* ACA Framework */}
            {cold.aca_framework && (
              <div>
                <BlockHeader
                  variant="title"
                  title="ACA Framework"
                  icon={<FontAwesomeIcon icon={faHandshake} className="w-5 h-5 text-accent" />}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {cold.aca_framework.acknowledge && (
                    <KeyValueBlock label="Acknowledge" value={cold.aca_framework.acknowledge} />
                  )}
                  {cold.aca_framework.compliment && (
                    <KeyValueBlock label="Compliment" value={cold.aca_framework.compliment} />
                  )}
                  {cold.aca_framework.ask && (
                    <KeyValueBlock label="Ask" value={cold.aca_framework.ask} />
                  )}
                </div>
              </div>
            )}

            {/* Volume Targets */}
            {cold.volume_targets && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cold.volume_targets.messages_per_day != null && (
                  <StatCard
                    label="Messages Per Day"
                    value={cold.volume_targets.messages_per_day}
                    icon={<FontAwesomeIcon icon={faChartBar} className="w-5 h-5" />}
                    variant="accent"
                  />
                )}
                {cold.volume_targets.follow_up_sequence && cold.volume_targets.follow_up_sequence.length > 0 && (
                  <div>
                    <BlockHeader variant="label" title="Follow-up Sequence" />
                    <InsightList items={cold.volume_targets.follow_up_sequence} type="info" numbered />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Personalization Vectors */}
        {data.personalization_vectors && data.personalization_vectors.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Personalization Vectors"
              icon={<FontAwesomeIcon icon={faUserTag} className="w-5 h-5 text-accent" />}
            />
            <DataTable
              headers={["Vector", "Where to Find", "How to Use", "Impact"]}
              rows={data.personalization_vectors.map((pv) => [
                pv.vector || "—",
                pv.where_to_find || "—",
                pv.how_to_use || "—",
                pv.impact || "—",
              ])}
            />
          </div>
        )}

        {/* Sample Sequences */}
        {data.sample_sequences && data.sample_sequences.length > 0 && (
          <div>
            <BlockHeader
              variant="title"
              title="Sample Sequences"
              icon={<FontAwesomeIcon icon={faListOl} className="w-5 h-5 text-accent" />}
            />
            <div className="space-y-3">
              {data.sample_sequences.map((seq, index) => (
                <ReportCollapsibleCard
                  key={index}
                  id={`sample-sequence-${index}`}
                  reportId={reportId}
                  title={
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-foreground">
                        {seq.sequence_name || `Sequence ${index + 1}`}
                      </span>
                      {seq.target_segment && (
                        <span className="text-xs font-body text-accent bg-accent/10 rounded-full px-2 py-0.5 border border-accent/20">
                          {seq.target_segment}
                        </span>
                      )}
                    </div>
                  }
                  defaultOpen={index === 0}
                >
                  {seq.messages && seq.messages.length > 0 && (
                    <div className="space-y-4">
                      {seq.messages.map((msg, msgIndex) => (
                        <div
                          key={msgIndex}
                          className="rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-body text-accent bg-accent/10 rounded-full px-2 py-0.5">
                              Day {msg.day ?? msgIndex + 1}
                            </span>
                            {msg.subject && (
                              <span className="text-sm font-display font-semibold text-foreground">
                                {msg.subject}
                              </span>
                            )}
                          </div>
                          {msg.body && (
                            <p className="text-sm font-body text-foreground leading-relaxed whitespace-pre-line">
                              {msg.body}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ReportCollapsibleCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};
