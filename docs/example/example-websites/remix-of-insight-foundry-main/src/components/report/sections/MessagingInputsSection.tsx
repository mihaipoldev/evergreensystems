import { SectionWrapper } from "../SectionWrapper";
import { TagCloud } from "../TagCloud";
import { reportData } from "@/data/reportData";
import { motion } from "framer-motion";
import { BookOpen, AlertCircle, CheckCircle, Award } from "lucide-react";

export const MessagingInputsSection = () => {
  const messaging = reportData.data.messaging_inputs;

  return (
    <SectionWrapper
      id="messaging-inputs"
      number="09"
      title="Messaging Inputs"
      subtitle="Industry vocabulary, pain language, and proof elements for copywriting"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Industry Jargon */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl p-6 border border-border report-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-accent" />
            <h4 className="text-lg font-display font-semibold text-foreground">
              Industry Jargon
            </h4>
          </div>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Key terms and acronyms used in the 3PL industry
          </p>
          <TagCloud tags={messaging.industry_jargon} variant="outline" />
        </motion.div>

        {/* Pain Language */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 rounded-xl p-6 border border-amber-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
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
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                {pain}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Benefit Language */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
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
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Proof Language */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-accent/10 rounded-xl p-6 border border-accent/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-accent" />
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
