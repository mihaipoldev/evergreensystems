"use client";

import { SectionWrapper } from "../../shared/SectionWrapper";
import { TagCloud } from "../../shared/TagCloud";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faExclamationCircle,
  faCheckCircle,
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import type { ReportData } from "../../../types";

interface MessagingInputsSectionProps {
  messaging: ReportData["data"]["messaging_inputs"];
}

export const MessagingInputsSection = ({ messaging }: MessagingInputsSectionProps) => {
  return (
    <SectionWrapper
      id="messaging-inputs"
      number="09"
      title="Messaging Inputs"
      subtitle="Industry vocabulary, pain language, and proof elements for copywriting"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl p-6 border border-border report-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faBook} className="w-5 h-5 text-accent" />
            <h4 className="text-lg font-display font-semibold text-foreground">
              Industry Jargon
            </h4>
          </div>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Key terms and acronyms used in this industry
          </p>
          <TagCloud tags={messaging.industry_jargon} variant="outline" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="text-lg font-display font-semibold text-foreground">
              Pain Language
            </h4>
          </div>
          <p className="text-sm text-muted-foreground font-body mb-4">
            How they describe their challenges and frustrations
          </p>
          <ul className="space-y-2">
            {messaging.pain_language.map((pain, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm font-body text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-2 flex-shrink-0" />
                {pain}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 dark:bg-green-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="text-lg font-display font-semibold text-foreground">
              Benefit Language
            </h4>
          </div>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Outcomes and improvements they seek
          </p>
          <ul className="space-y-2">
            {messaging.benefit_language.map((benefit, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm font-body text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 mt-2 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-accent/10 rounded-xl p-6 border border-accent/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faAward} className="w-5 h-5 text-accent" />
            <h4 className="text-lg font-display font-semibold text-foreground">
              Proof Language
            </h4>
          </div>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Credibility markers and trust signals
          </p>
          <ul className="space-y-2">
            {messaging.proof_language.map((proof, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm font-body text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                {proof}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

