import { SectionWrapper } from "../SectionWrapper";
import { StatCard } from "../StatCard";
import { motion } from "framer-motion";
import { Target, Swords, CheckCircle, XCircle, ChevronRight, Trophy, AlertCircle } from "lucide-react";
import { icpData } from "@/data/icpData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TagCloud } from "../TagCloud";

export const CompetitiveContextSection = () => {
  const competitive = (icpData.data.buyer_icp as any).competitive_context;
  
  if (!competitive) return null;

  return (
    <SectionWrapper
      id="competitive-context"
      number="06"
      title="Competitive Context"
      subtitle="What alternatives these customers consider and how to compete"
    >
      {/* Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Confidence"
          value={`${(competitive.confidence * 100).toFixed(0)}%`}
          icon={<Target className="w-5 h-5" />}
        />
        <StatCard
          label="Alternatives Analyzed"
          value={competitive.alternatives.length}
          icon={<Swords className="w-5 h-5" />}
          variant="highlight"
        />
        <StatCard
          label="Win Scenarios"
          value={competitive.positioning_guidance.when_clearly_wins.length}
          icon={<Trophy className="w-5 h-5" />}
        />
      </div>

      {/* Competitive Alternatives */}
      <div className="mb-10">
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Competitive Alternatives
        </h4>
        <Accordion type="single" collapsible className="space-y-4">
          {competitive.alternatives.map((alt: any, index: number) => (
            <AccordionItem
              key={alt.alternative}
              value={alt.alternative}
              className="bg-card rounded-xl border border-border report-shadow overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Swords className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-base font-display font-semibold text-foreground">
                      {alt.alternative}
                    </h3>
                    {alt.platforms && alt.platforms.length > 0 && (
                      <p className="text-sm text-muted-foreground font-body mt-0.5">
                        {alt.platforms.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                {/* Platforms */}
                {alt.platforms && alt.platforms.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs text-muted-foreground font-body block mb-2">Platforms</span>
                    <TagCloud tags={alt.platforms} variant="outline" />
                  </div>
                )}

                {/* When Chosen */}
                <div className="bg-secondary/50 rounded-lg p-4 border border-border mb-4">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-body font-medium block mb-2">
                    When This is Chosen
                  </span>
                  <p className="text-sm font-body text-foreground">{alt.when_chosen}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs uppercase tracking-wider text-green-700 font-body font-medium">
                        Their Strengths
                      </span>
                    </div>
                    <p className="text-sm font-body text-green-900">{alt.strengths}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs uppercase tracking-wider text-red-700 font-body font-medium">
                        Their Weaknesses
                      </span>
                    </div>
                    <p className="text-sm font-body text-red-900">{alt.weaknesses}</p>
                  </div>
                </div>

                {/* How Custom Wins */}
                <div className="bg-primary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-primary-foreground" />
                    <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-body font-medium">
                      How Custom CRM Wins
                    </span>
                  </div>
                  <p className="text-sm font-body text-primary-foreground">{alt.how_custom_wins}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Positioning Guidance */}
      <div>
        <h4 className="text-lg font-display font-semibold text-foreground mb-4">
          Positioning Guidance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* When Clearly Wins */}
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-green-600" />
              <h5 className="text-sm uppercase tracking-wider text-green-700 font-body font-medium">
                When Custom CRM Clearly Wins
              </h5>
            </div>
            <ul className="space-y-3">
              {competitive.positioning_guidance.when_clearly_wins.map((item: string, i: number) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 text-sm font-body text-green-900"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* When Probably Wrong */}
          <div className="bg-red-50 rounded-xl p-5 border border-red-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h5 className="text-sm uppercase tracking-wider text-red-700 font-body font-medium">
                When Custom CRM is Probably Wrong
              </h5>
            </div>
            <ul className="space-y-3">
              {competitive.positioning_guidance.when_probably_wrong.map((item: string, i: number) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 text-sm font-body text-red-900"
                >
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
