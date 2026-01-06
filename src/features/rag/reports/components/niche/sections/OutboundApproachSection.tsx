import { SectionWrapper } from "../../shared/SectionWrapper";
import { InsightList } from "../../shared/InsightList";
import { TagCloud } from "../../shared/TagCloud";
import { ObjectionHandler } from "../../shared/ObjectionHandler";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faComment,
  faCheckCircle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import type { ReportData } from "../../../types";

interface OutboundApproachSectionProps {
  outbound: ReportData["data"]["outbound_approach"];
}

export const OutboundApproachSection = ({ outbound }: OutboundApproachSectionProps) => {
  return (
    <SectionWrapper
      id="outbound-approach"
      number="07"
      title="Outbound Approach"
      subtitle="Messaging framework, hooks, proof requirements, and objection handling"
    >
      <div className="bg-primary rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FontAwesomeIcon icon={faBullseye} className="w-5 h-5 text-accent" />
          <h4 className="text-sm uppercase tracking-wider text-primary-foreground/70 font-body">
            Primary Pain Point to Hit
          </h4>
        </div>
        <p className="text-lg font-display text-primary-foreground">
          {typeof outbound.primary_pain_to_hit === "string"
            ? outbound.primary_pain_to_hit
            : (outbound.primary_pain_to_hit as any)?.value ||
              (outbound.primary_pain_to_hit as any)?.text ||
              (outbound.primary_pain_to_hit as any)?.description ||
              (outbound.primary_pain_to_hit as any)?.pain ||
              String(outbound.primary_pain_to_hit || "Unknown")}
        </p>
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faComment} className="w-5 h-5 text-accent" />
          Hook Themes
        </h4>
        <TagCloud tags={outbound.hook_themes} variant="gold" />
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600" />
          Proof Requirements
        </h4>
        <InsightList items={outbound.proof_requirements} type="success" numbered />
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-accent" />
          Personalization Vectors
        </h4>
        <InsightList items={outbound.personalization_vectors} type="info" />
      </div>

      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Objection Handling Playbook
        </h4>
        <ObjectionHandler objections={outbound.objection_themes} />
      </div>
    </SectionWrapper>
  );
};

