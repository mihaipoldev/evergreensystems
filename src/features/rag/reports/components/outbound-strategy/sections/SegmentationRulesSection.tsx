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
  expected_conversion?: string;
};

type SegmentationRules = {
  description?: string;
  a_grade_criteria?: GradeCriteria;
  b_grade_criteria?: GradeCriteria;
  c_grade_criteria?: GradeCriteria;
  disqualify_criteria?: GradeCriteria;
};

interface SegmentationRulesSectionProps {
  segmentationRules: SegmentationRules;
  sectionNumber?: string;
};

const gradeConfig = {
  a: {
    icon: faFire,
    bgColor: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    labelColor: "text-green-700 dark:text-green-400",
  },
  b: {
    icon: faCheckCircle,
    bgColor: "bg-accent/10 border-accent/20",
    labelColor: "text-accent",
  },
  c: {
    icon: faClock,
    bgColor: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    labelColor: "text-amber-700 dark:text-amber-400",
  },
  disqualify: {
    icon: faBan,
    bgColor: "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    labelColor: "text-red-700 dark:text-red-400",
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
        <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
          <FontAwesomeIcon icon={Icon} className={`w-5 h-5 ${config.labelColor}`} />
        </div>
        <div>
          <h4 className={`font-display font-semibold ${config.labelColor}`}>
            {data.label ?? grade.toUpperCase()}
          </h4>
          {data.action && (
            <p className="text-sm text-muted-foreground font-body">{data.action}</p>
          )}
        </div>
      </div>
      <InsightList items={data.criteria} type="default" />
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {data.expected_volume && (
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-muted-foreground" />
            Volume: {data.expected_volume}
          </span>
        )}
        {data.expected_conversion && (
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-muted-foreground" />
            Conversion: {data.expected_conversion}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export const SegmentationRulesSection = ({
  segmentationRules,
  sectionNumber = "08",
}: SegmentationRulesSectionProps) => {
  const a = segmentationRules?.a_grade_criteria;
  const b = segmentationRules?.b_grade_criteria;
  const c = segmentationRules?.c_grade_criteria;
  const dq = segmentationRules?.disqualify_criteria;

  return (
    <SectionWrapper
      id="segmentation-rules"
      number={sectionNumber}
      title="Segmentation Rules"
      subtitle={segmentationRules?.description ?? "A/B/C grade criteria and disqualification rules"}
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
