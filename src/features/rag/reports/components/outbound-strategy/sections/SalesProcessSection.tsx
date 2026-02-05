"use client";

import {
  SectionWrapper,
  BlockHeader,
  ContentCard,
  NumberedCard,
} from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faChalkboardTeacher,
  faRocket,
  faComments,
  faShieldHalved,
  faChartLine,
  faCalendarCheck,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

type SalesProcess = {
  description?: string;
  proof_package?: {
    must_provide?: string[];
    nice_to_have?: string[];
    presentation_sequence?: string[];
  };
  demo_structure?: {
    flow?: Array<{
      goal?: string;
      section?: string;
      duration?: string;
      what_to_show?: string;
    }>;
    timing?: string;
    duration?: string;
    objections_to_preempt?: string[];
  };
  pilot_structure?: {
    duration?: string;
    guarantee?: Record<string, string>;
    investment?: Record<string, string>;
    deliverable?: Record<string, unknown>;
    success_metrics?: { primary?: string[]; secondary?: string[] };
    transition_to_ongoing?: Record<string, string>;
  };
  discovery_call_framework?: {
    goals?: string[];
    duration?: string;
    key_questions?: string[];
    qualification_checklist?: string[];
    disqualification_signals?: string[];
  };
};

interface SalesProcessSectionProps {
  salesProcess: SalesProcess;
  sectionNumber?: string;
}

export const SalesProcessSection = ({
  salesProcess,
  sectionNumber = "03",
}: SalesProcessSectionProps) => {
  const proof = salesProcess?.proof_package;
  const demo = salesProcess?.demo_structure;
  const pilot = salesProcess?.pilot_structure;
  const discovery = salesProcess?.discovery_call_framework;

  return (
    <SectionWrapper
      id="sales-process"
      number={sectionNumber}
      title="Sales Process"
      subtitle={salesProcess?.description ?? "Discovery, demo, and pilot framework"}
    >
      {/* Proof Package */}
      {proof && (
        <div className="mb-12">
          <BlockHeader
            variant="title"
            title="Proof Package"
            icon={<FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 text-accent" />}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContentCard variant="accent" title="Must Provide">
              <ul className="space-y-2">
                {(proof.must_provide ?? []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ContentCard>
            <ContentCard variant="muted" title="Nice to Have">
              <ul className="space-y-2">
                {(proof.nice_to_have ?? []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </ContentCard>
          </div>
          {proof.presentation_sequence && proof.presentation_sequence.length > 0 && (
            <div className="mt-6">
              <BlockHeader variant="label" title="Presentation Sequence" />
              <div className="space-y-3">
                {proof.presentation_sequence.map((step, i) => (
                  <NumberedCard key={i} number={i + 1} layout="inline">
                    <p className="text-sm font-body text-foreground">{step}</p>
                  </NumberedCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Demo Structure */}
      {demo && demo.flow && demo.flow.length > 0 && (
        <div className="mb-12">
          <BlockHeader
            variant="title"
            title="Demo Structure"
            icon={<FontAwesomeIcon icon={faChalkboardTeacher} className="w-5 h-5 text-accent" />}
            subtitle={demo.timing ? `Schedule: ${demo.timing} • Duration: ${demo.duration ?? "45-60 min"}` : undefined}
          />
          <div className="space-y-6">
            {demo.flow.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl border border-border report-shadow p-6"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs uppercase tracking-wider text-accent font-body font-semibold">
                    Step {i + 1}
                  </span>
                  {step.duration && (
                    <span className="text-xs text-muted-foreground font-body">
                      {step.duration}
                    </span>
                  )}
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">
                  {step.section}
                </h4>
                {step.goal && (
                  <p className="text-sm text-muted-foreground font-body mb-3 italic">
                    {step.goal}
                  </p>
                )}
                {step.what_to_show && (
                  <p className="text-sm font-body text-foreground">{step.what_to_show}</p>
                )}
              </motion.div>
            ))}
          </div>
          {demo.objections_to_preempt && demo.objections_to_preempt.length > 0 && (
            <div className="mt-6">
              <ContentCard variant="warning" title="Objections to Preempt">
              <ul className="space-y-2">
                {demo.objections_to_preempt.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
              </ContentCard>
            </div>
          )}
        </div>
      )}

      {/* Pilot Structure */}
      {pilot && (
        <div className="mb-12">
          <BlockHeader
            variant="title"
            title="Pilot Structure"
            icon={<FontAwesomeIcon icon={faRocket} className="w-5 h-5 text-accent" />}
            subtitle={pilot.duration ? `${pilot.duration} pilot` : undefined}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pilot.guarantee && Object.keys(pilot.guarantee).length > 0 && (
              <ContentCard
                variant="green"
                title="Guarantee"
                icon={<FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />}
              >
                <ul className="space-y-2">
                  {Object.entries(pilot.guarantee).map(([key, val]) => (
                    <li key={key} className="text-sm">
                      <span className="font-medium text-foreground">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      {val}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {pilot.investment && Object.keys(pilot.investment).length > 0 && (
              <ContentCard
                variant="accent"
                title="Investment"
                icon={<FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />}
              >
                <ul className="space-y-2">
                  {Object.entries(pilot.investment).map(([key, val]) => (
                    <li key={key} className="text-sm">
                      <span className="font-medium text-foreground">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      {String(val)}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
          </div>
          {pilot.success_metrics && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContentCard title="Primary Metrics">
                <ul className="space-y-2">
                  {(pilot.success_metrics.primary ?? []).map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-accent mt-0.5" />
                      {m}
                    </li>
                  ))}
                </ul>
              </ContentCard>
              <ContentCard title="Secondary Metrics">
                <ul className="space-y-2">
                  {(pilot.success_metrics.secondary ?? []).map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <FontAwesomeIcon icon={faCalendarCheck} className="w-4 h-4 text-muted-foreground mt-0.5" />
                      {m}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            </div>
          )}
          {pilot.transition_to_ongoing && Object.keys(pilot.transition_to_ongoing).length > 0 && (
            <div className="mt-6">
              <ContentCard variant="primary" title="Transition to Ongoing">
              <ul className="space-y-2">
                {Object.entries(pilot.transition_to_ongoing).map(([key, val]) => (
                  <li key={key} className="text-sm">
                    <span className="font-medium text-primary-foreground">
                      {key.replace(/_/g, " ")}:
                    </span>{" "}
                    {String(val)}
                  </li>
                ))}
              </ul>
              </ContentCard>
            </div>
          )}
        </div>
      )}

      {/* Discovery Call Framework */}
      {discovery && (
        <div>
          <BlockHeader
            variant="title"
            title="Discovery Call Framework"
            icon={<FontAwesomeIcon icon={faComments} className="w-5 h-5 text-accent" />}
            subtitle={discovery.duration ? `Duration: ${discovery.duration}` : undefined}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {discovery.goals && discovery.goals.length > 0 && (
              <ContentCard title="Goals">
                <ul className="space-y-2">
                  {discovery.goals.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {g}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {discovery.key_questions && discovery.key_questions.length > 0 && (
              <ContentCard title="Key Questions">
                <ul className="space-y-2">
                  {discovery.key_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm italic">
                      <span className="text-accent font-semibold">{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {discovery.qualification_checklist && discovery.qualification_checklist.length > 0 && (
              <ContentCard variant="green" title="Qualification Checklist">
                <ul className="space-y-2">
                  {discovery.qualification_checklist.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
            {discovery.disqualification_signals && discovery.disqualification_signals.length > 0 && (
              <ContentCard variant="danger" title="Disqualification Signals">
                <ul className="space-y-2">
                  {discovery.disqualification_signals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </ContentCard>
            )}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};
