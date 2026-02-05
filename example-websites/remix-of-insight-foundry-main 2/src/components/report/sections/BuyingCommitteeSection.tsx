import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { TagCloud } from "../TagCloud";
import { Users, Clock, DollarSign, UserCheck, AlertTriangle, Target, ChevronRight, Briefcase, Scale, Shield } from "lucide-react";
import { icpData } from "@/data/icpData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const roleIcons: Record<string, React.ReactNode> = {
  "Champion / Revenue Operations Leader": <Target className="w-5 h-5" />,
  "Economic Buyer / CFO": <DollarSign className="w-5 h-5" />,
  "Technical Buyer / CTO": <Shield className="w-5 h-5" />,
  "End Users / Sales Leadership": <Users className="w-5 h-5" />,
  "Procurement / Legal": <Scale className="w-5 h-5" />,
  "IT Operations / Implementation Team": <Briefcase className="w-5 h-5" />,
  "Marketing Leadership (for CRM with Marketing Automation)": <UserCheck className="w-5 h-5" />,
};

const influenceColors: Record<string, string> = {
  "Very High": "bg-accent text-accent-foreground",
  "High": "bg-primary text-primary-foreground",
  "High to Very High": "bg-primary text-primary-foreground",
  "Medium to High": "bg-blue-600 text-white",
  "Medium": "bg-slate-500 text-white",
  "Low to Medium": "bg-slate-400 text-white",
  "Low": "bg-slate-300 text-slate-800",
};

export const BuyingCommitteeSection = () => {
  const committee = (icpData.data.buyer_icp as any).buying_committee;
  
  if (!committee) return null;

  return (
    <SectionWrapper
      id="buying-committee"
      number="03"
      title="Buying Committee"
      subtitle="Who makes the buying decision, who influences it, and what each stakeholder cares about"
    >
      {/* Decision Structure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Committee Size"
          value={committee.decision_structure.typical_committee_size.split(' for ')[0]}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Decision Timeline"
          value="3-12 months"
          icon={<Clock className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Confidence"
          value={`${(committee.confidence * 100).toFixed(0)}%`}
          icon={<Target className="w-5 h-5" />}
        />
      </div>

      {/* Approval Thresholds */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Approval Thresholds
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs uppercase tracking-wider text-green-700 font-body font-medium">Under $50K</span>
            </div>
            <p className="text-sm font-body text-green-900 leading-relaxed">
              {committee.decision_structure.approval_thresholds.under_50k}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-xs uppercase tracking-wider text-amber-700 font-body font-medium">$50K - $150K</span>
            </div>
            <p className="text-sm font-body text-amber-900 leading-relaxed">
              {committee.decision_structure.approval_thresholds["50k_to_150k"]}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              <span className="text-xs uppercase tracking-wider text-red-700 font-body font-medium">Over $150K</span>
            </div>
            <p className="text-sm font-body text-red-900 leading-relaxed">
              {committee.decision_structure.approval_thresholds.over_150k}
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
          {committee.decision_structure.how_decisions_get_made}
        </p>
      </div>

      {/* Stakeholder Roles */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Key Stakeholder Roles
        </h4>
        <Accordion type="single" collapsible className="space-y-3">
          {committee.roles.map((role: any, index: number) => (
            <AccordionItem
              key={role.role_name}
              value={role.role_name}
              className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {roleIcons[role.role_name] || <Users className="w-5 h-5" />}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-base font-display font-semibold text-foreground">
                      {role.role_name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body mt-0.5">
                      {role.seniority}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${influenceColors[role.influence.split('.')[0]] || 'bg-slate-200 text-slate-800'}`}>
                    {role.influence.split('.')[0]}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                {/* Titles */}
                <div className="mb-5">
                  <span className="text-xs text-muted-foreground font-body block mb-2">Common Titles</span>
                  <TagCloud tags={role.titles.slice(0, 6)} variant="outline" />
                </div>

                {/* What They Care About */}
                <div className="mb-5">
                  <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    What They Care About
                  </h5>
                  <ul className="space-y-2">
                    {role.what_they_care_about.slice(0, 4).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-accent/10 rounded-md p-2 border border-accent/20">
                        <ChevronRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What Keeps Them Up */}
                <div className="mb-5">
                  <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    What Keeps Them Up at Night
                  </h5>
                  <ul className="space-y-2">
                    {role.what_keeps_them_up.slice(0, 3).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-amber-50 rounded-md p-2 border border-amber-200">
                        <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How to Win Them */}
                <div className="bg-primary rounded-lg p-4 mb-5">
                  <h5 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body mb-2">
                    How to Win Them
                  </h5>
                  <p className="text-sm font-body text-primary-foreground leading-relaxed">
                    {role.how_to_win_them}
                  </p>
                </div>

                {/* Red Flags */}
                <div>
                  <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Red Flags to Watch For
                  </h5>
                  <ul className="space-y-1.5">
                    {role.red_flags_from_them.slice(0, 3).map((flag: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
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
        
        {/* Buying Process */}
        <div className="mb-6">
          <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3">
            Typical Buying Process
          </h5>
          <div className="space-y-2">
            {committee.committee_dynamics.typical_buying_process.map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3 bg-card rounded-lg p-3 border border-border">
                <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm font-body text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Where Deals Stall */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Where Deals Stall
            </h5>
            <ul className="space-y-2">
              {committee.committee_dynamics.where_deals_stall.slice(0, 4).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-red-50 rounded-md p-2 border border-red-200">
                  <ChevronRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm uppercase tracking-wider text-muted-foreground font-body mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              How to Unstall
            </h5>
            <ul className="space-y-2">
              {committee.committee_dynamics.how_to_unstall.slice(0, 4).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground bg-green-50 rounded-md p-2 border border-green-200">
                  <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
