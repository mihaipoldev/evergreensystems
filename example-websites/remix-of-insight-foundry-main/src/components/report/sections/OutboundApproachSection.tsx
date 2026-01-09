import { SectionWrapper } from "../SectionWrapper";
import { ObjectionHandler } from "../ObjectionHandler";
import { TagCloud } from "../TagCloud";
import { InsightList } from "../InsightList";
import { reportData } from "@/data/reportData";
import { MessageSquare, Target, CheckCircle, User } from "lucide-react";

export const OutboundApproachSection = () => {
  const outbound = reportData.data.outbound_approach;

  return (
    <SectionWrapper
      id="outbound-approach"
      number="07"
      title="Outbound Approach"
      subtitle="Messaging framework, hooks, proof requirements, and objection handling"
    >
      {/* Primary Pain to Hit */}
      <div className="bg-primary rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-accent" />
          <h4 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body">
            Primary Pain Point to Hit
          </h4>
        </div>
        <p className="text-lg font-display text-primary-foreground">
          {outbound.primary_pain_to_hit}
        </p>
      </div>

      {/* Hook Themes */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent" />
          Hook Themes
        </h4>
        <TagCloud tags={outbound.hook_themes} variant="gold" />
      </div>

      {/* Proof Requirements */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Proof Requirements
        </h4>
        <InsightList items={outbound.proof_requirements} type="success" numbered />
      </div>

      {/* Personalization Vectors */}
      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Personalization Vectors
        </h4>
        <InsightList items={outbound.personalization_vectors} type="info" />
      </div>

      {/* Objection Handling */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Objection Handling Playbook
        </h4>
        <ObjectionHandler objections={outbound.objection_themes} />
      </div>
    </SectionWrapper>
  );
};
