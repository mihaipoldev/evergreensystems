"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faClock,
  faDollarSign,
  faUserCheck,
  faTriangleExclamation,
  faBullseye,
  faChevronRight,
  faBriefcase,
  faScaleBalanced,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { SectionWrapper } from "../../shared/SectionWrapper";
import { StatCard } from "../../shared/StatCard";
import { TagCloud } from "../../shared/TagCloud";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ReportData } from "../../../types";

const NO_DATA = "No data";

const roleIcons: Record<string, React.ReactNode> = {
  "Champion / Revenue Operations Leader": <FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />,
  "Economic Buyer / CFO": <FontAwesomeIcon icon={faDollarSign} className="w-5 h-5" />,
  "Technical Buyer / CTO": <FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />,
  "End Users / Sales Leadership": <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />,
  "Procurement / Legal": <FontAwesomeIcon icon={faScaleBalanced} className="w-5 h-5" />,
  "IT Operations / Implementation Team": <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5" />,
  "Marketing Leadership (for CRM with Marketing Automation)": <FontAwesomeIcon icon={faUserCheck} className="w-5 h-5" />,
};

const influenceColors: Record<string, string> = {
  "Very High": "bg-accent text-accent-foreground",
  "High": "bg-accent/80 text-accent-foreground",
  "High to Very High": "bg-accent/80 text-accent-foreground",
  "Medium to High": "bg-accent/60 text-accent-foreground",
  "Medium": "bg-muted text-foreground",
  "Low to Medium": "bg-muted/70 text-foreground",
  "Low": "bg-muted/50 text-foreground",
};

interface BuyingCommitteeSectionProps {
  data: ReportData;
}

export const BuyingCommitteeSection = ({ data }: BuyingCommitteeSectionProps) => {
  const buyerIcp = (data.data as { buyer_icp?: Record<string, unknown> }).buyer_icp;
  const committee = buyerIcp?.buying_committee as Record<string, unknown> | undefined;

  if (!committee) {
    return (
      <SectionWrapper id="buying-committee" number="5.2" title="Buying Committee" subtitle="Who makes the buying decision, who influences it, and what each stakeholder cares about">
        <p className="font-body text-muted-foreground">{NO_DATA}</p>
      </SectionWrapper>
    );
  }

  const decisionStructure = (committee.decision_structure as Record<string, unknown>) ?? {};
  const approvalThresholds = (decisionStructure.approval_thresholds as Record<string, string>) ?? {};
  const roles = (committee.roles as Array<Record<string, unknown>>) ?? [];
  const committeeDynamics = (committee.committee_dynamics as Record<string, unknown>) ?? {};

  return (
    <SectionWrapper
      id="buying-committee"
      number="5.2"
      title="Buying Committee"
      subtitle="Who makes the buying decision, who influences it, and what each stakeholder cares about"
    >
      {/* Decision Structure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Committee Size"
          value={(decisionStructure.typical_committee_size as string)?.split(" for ")[0] ?? "—"}
          icon={<FontAwesomeIcon icon={faUsers} className="w-5 h-5" />}
        />
        <StatCard
          label="Decision Timeline"
          value="3-12 months"
          icon={<FontAwesomeIcon icon={faClock} className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Confidence"
          value={`${((committee.confidence as number) * 100).toFixed(0)}%`}
          icon={<FontAwesomeIcon icon={faBullseye} className="w-5 h-5" />}
        />
      </div>

      {/* Approval Thresholds */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Approval Thresholds
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 text-green-600" />
              <span className="text-xs uppercase tracking-wider text-green-700 dark:text-green-400 font-body font-medium">Under $50K</span>
            </div>
            <p className="text-sm font-body text-green-900 dark:text-green-200 leading-relaxed">
              {approvalThresholds.under_50k}
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 text-amber-600" />
              <span className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-body font-medium">$50K - $150K</span>
            </div>
            <p className="text-sm font-body text-amber-900 dark:text-amber-200 leading-relaxed">
              {approvalThresholds["50k_to_150k"]}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 text-red-600" />
              <span className="text-xs uppercase tracking-wider text-red-700 dark:text-red-400 font-body font-medium">Over $150K</span>
            </div>
            <p className="text-sm font-body text-red-900 dark:text-red-200 leading-relaxed">
              {approvalThresholds.over_150k}
            </p>
          </div>
        </div>
      </div>

      {/* How Decisions Get Made */}
      <div className="bg-secondary/50 rounded-lg p-5 border border-border mb-8">
        <h4 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
          How Decisions Get Made
        </h4>
        <p className="text-sm font-body text-foreground leading-relaxed">
          {decisionStructure.how_decisions_get_made as string}
        </p>
      </div>

      {/* Stakeholder Roles */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Key Stakeholder Roles
        </h4>
        <Accordion type="single" collapsible className="space-y-3">
          {roles.map((role: Record<string, unknown>, index: number) => (
            <AccordionItem
              key={role.role_name as string}
              value={role.role_name as string}
              className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {roleIcons[role.role_name as string] ?? <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-base font-display font-semibold text-foreground">
                      {role.role_name as string}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body mt-0.5">
                      {role.seniority as string}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${influenceColors[(role.influence as string).split(".")[0]] ?? "bg-slate-200 text-slate-800"}`}>
                    {(role.influence as string).split(".")[0]}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pt-5 pb-5">
                <div className="mb-5">
                  <span className="text-xs text-muted-foreground font-body block mb-2">Common Titles</span>
                  <TagCloud tags={(role.titles as string[]).slice(0, 6)} variant="outline" />
                </div>
                <div className="mb-5">
                  <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent" />
                    What They Care About
                  </h5>
                  <ul className="space-y-2">
                    {(role.what_they_care_about as string[]).slice(0, 4).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-accent/10 rounded-md p-2 border border-accent/20">
                        <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-5">
                  <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 text-amber-500" />
                    What Keeps Them Up at Night
                  </h5>
                  <ul className="space-y-2">
                    {(role.what_keeps_them_up as string[]).slice(0, 3).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-amber-50 dark:bg-amber-950/20 rounded-md p-2 border border-amber-200 dark:border-amber-800">
                        <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-primary rounded-lg p-4 mb-5">
                  <h5 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body mb-2">
                    How to Win Them
                  </h5>
                  <p className="text-sm font-body text-primary-foreground leading-relaxed">
                    {role.how_to_win_them as string}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 text-red-500" />
                    Red Flags to Watch For
                  </h5>
                  <ul className="space-y-1.5">
                    {(role.red_flags_from_them as string[]).slice(0, 3).map((flag: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                        <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Committee Dynamics */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Committee Dynamics
        </h4>
        <div className="mb-6">
          <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
            Typical Buying Process
          </h5>
          <div className="space-y-2">
            {(committeeDynamics.typical_buying_process as string[]).map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3 bg-card rounded-lg p-3 border border-border">
                <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm font-body text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 text-destructive" />
              Where Deals Stall
            </h5>
            <div className="space-y-2">
              {(committeeDynamics.where_deals_stall as string[]).slice(0, 4).map((item: string, i: number) => (
                <div key={i} className="text-sm font-body text-foreground bg-muted/50 rounded-lg p-3 border border-border border-l-4 border-l-red-500/60">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faBullseye} className="w-4 h-4 text-accent" />
              How to Unstall
            </h5>
            <div className="space-y-2">
              {(committeeDynamics.how_to_unstall as string[]).slice(0, 4).map((item: string, i: number) => (
                <div key={i} className="text-sm font-body text-foreground bg-muted/50 rounded-lg p-3 border border-border border-l-4 border-l-accent">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
