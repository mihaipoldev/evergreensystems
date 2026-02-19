"use client";

import { SectionWrapper, BlockHeader, InsightList } from "../../shared";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faCheckCircle,
  faClock,
  faBan,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

type GradeCriteria = {
  label?: string;
  action?: string;
  criteria?: string[];
  expected_volume?: string;
  exclusion_rules?: string[];
};

type SegmentationRules = {
  description?: string;
  a_grade?: GradeCriteria;
  b_grade?: GradeCriteria;
  c_grade?: GradeCriteria;
  disqualify?: GradeCriteria;
};

interface SegmentationRulesSectionProps {
  segmentationRules: SegmentationRules;
  sectionNumber?: string;
}

const gradeConfig = {
  a: {
    icon: faFire,
    bgColor: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    labelColor: "text-green-700 dark:text-green-400",
    innerBg: "bg-green-100/60 dark:bg-green-900/30 border-green-200/50 dark:border-green-800/50",
    listType: "green" as const,
    borderT: "border-green-200/50 dark:border-green-800/50",
  },
  b: {
    icon: faCheckCircle,
    bgColor: "bg-accent/10 border-accent/20",
    labelColor: "text-accent",
    innerBg: "bg-accent/5 dark:bg-accent/10 border-accent/15 dark:border-accent/20",
    listType: "accentSubtle" as const,
    borderT: "border-accent/20 dark:border-accent/25",
  },
  c: {
    icon: faClock,
    bgColor: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    labelColor: "text-amber-700 dark:text-amber-400",
    innerBg: "bg-amber-50/90 dark:bg-amber-900/25 border-amber-200/40 dark:border-amber-800/40",
    listType: "amber" as const,
    borderT: "border-amber-200/50 dark:border-amber-800/50",
  },
  disqualify: {
    icon: faBan,
    bgColor: "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    labelColor: "text-red-700 dark:text-red-400",
    innerBg: "bg-red-100/60 dark:bg-red-900/30 border-red-200/50 dark:border-red-800/50",
    listType: "danger" as const,
    borderT: "border-red-200/50 dark:border-red-800/50",
  },
};

function GradeCard({
  grade,
  data,
}: {
  grade: keyof typeof gradeConfig;
  data: GradeCriteria | undefined;
}) {
  if (!data || !data.criteria?.length) return null;

  const config = gradeConfig[grade];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-xl border p-6 ${config.bgColor}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${config.innerBg}`}>
          <FontAwesomeIcon icon={Icon} className={`w-5 h-5 ${config.labelColor}`} />
        </div>
        <div>
          <h4 className={`font-display font-semibold ${config.labelColor}`}>
            {data.label ?? grade.toUpperCase()}
          </h4>
          {data.action && (
            <p className={`text-sm font-body ${config.labelColor} opacity-90`}>{data.action}</p>
          )}
        </div>
      </div>
      <InsightList items={data.criteria} type={config.listType} />
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {data.expected_volume && (
          <span className={`flex items-center gap-1 ${config.labelColor}`}>
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4" />
            Volume: {data.expected_volume}
          </span>
        )}
      </div>
      {data.exclusion_rules && data.exclusion_rules.length > 0 && (
        <div className={`mt-4 pt-4 border-t ${config.borderT}`}>
          <p className={`text-xs uppercase tracking-wider font-body mb-2 ${config.labelColor}`}>
            Exclusion Rules
          </p>
          <ul className="space-y-2">
            {data.exclusion_rules.map((rule, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm font-body ${config.labelColor}`}>
                <FontAwesomeIcon icon={faBan} className="w-3 h-3 mt-1.5 flex-shrink-0 opacity-80" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export const SegmentationRulesSection = ({
  segmentationRules,
  sectionNumber = "04",
}: SegmentationRulesSectionProps) => {
  const a = segmentationRules?.a_grade;
  const b = segmentationRules?.b_grade;
  const c = segmentationRules?.c_grade;
  const dq = segmentationRules?.disqualify;

  return (
    <SectionWrapper
      id="segmentation-rules"
      number={sectionNumber}
      title="Segmentation Rules"
      subtitle={segmentationRules?.description || undefined}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradeCard grade="a" data={a} />
        <GradeCard grade="b" data={b} />
        <GradeCard grade="c" data={c} />
        <GradeCard grade="disqualify" data={dq} />
      </div>
    </SectionWrapper>
  );
};
