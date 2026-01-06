import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Clock, ChevronDown, ChevronUp, BarChart3, Users, Database, FileSearch, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  status: "completed" | "active" | "waiting";
  duration?: string;
  stats?: {
    label: string;
    value: string;
  }[];
  icon: React.ReactNode;
}

/**
 * Hardcoded steps for the progress timeline
 * Shows realistic data for an AI intelligence report generation process
 */
const STEPS: Step[] = [
  {
    id: "1",
    title: "Market Analyst",
    description: "Gathering market data and analyzing industry trends",
    status: "completed",
    duration: "1m 23s",
    icon: <BarChart3 className="w-5 h-5" />,
    stats: [
      { label: "Sources analyzed", value: "15" },
      { label: "Companies identified", value: "4,500" },
      { label: "Market segments", value: "12" },
    ],
  },
  {
    id: "2",
    title: "Competitor Intelligence",
    description: "Profiling key competitors and their market positions",
    status: "completed",
    duration: "2m 45s",
    icon: <Users className="w-5 h-5" />,
    stats: [
      { label: "Competitors profiled", value: "28" },
      { label: "Pricing data points", value: "156" },
      { label: "Feature comparisons", value: "42" },
    ],
  },
  {
    id: "3",
    title: "Data Enrichment",
    description: "Enriching data with financial and operational metrics",
    status: "active",
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: "4",
    title: "Deep Research",
    description: "Conducting in-depth analysis of market leaders",
    status: "waiting",
    icon: <FileSearch className="w-5 h-5" />,
  },
  {
    id: "5",
    title: "Report Generation",
    description: "Compiling insights into comprehensive report",
    status: "waiting",
    icon: <Zap className="w-5 h-5" />,
  },
];

function MiniBarChart({ values }: { values: number[] }) {
  const maxValue = Math.max(...values);
  return (
    <div className="flex items-end gap-1 h-12">
      {values.map((value, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          animate={{ height: `${(value / maxValue) * 100}%` }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="w-3 bg-gradient-to-t from-primary to-secondary rounded-t"
        />
      ))}
    </div>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const [isExpanded, setIsExpanded] = useState(step.status === "completed");

  const statusConfig = {
    completed: {
      bg: "bg-success/10",
      border: "border-success/30",
      iconBg: "gradient-bg-success",
      text: "text-success",
    },
    active: {
      bg: "bg-primary/10",
      border: "border-primary/30",
      iconBg: "gradient-bg-primary pulse-active",
      text: "text-primary",
    },
    waiting: {
      bg: "bg-muted",
      border: "border-border",
      iconBg: "bg-muted",
      text: "text-muted-foreground",
    },
  };

  const config = statusConfig[step.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className="relative"
    >
      {/* Timeline connector */}
      {index < STEPS.length - 1 && (
        <div
          className={cn(
            "absolute left-6 top-16 w-0.5 h-8",
            step.status === "completed" ? "bg-success" : "bg-border"
          )}
        />
      )}

      <motion.div
        layout
        className={cn(
          "rounded-2xl border-2 transition-all overflow-hidden",
          config.bg,
          config.border,
          step.status === "active" && "ring-4 ring-primary/20"
        )}
      >
        {/* Header */}
        <button
          onClick={() => step.status === "completed" && setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center gap-4"
        >
          {/* Status Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0",
              config.iconBg
            )}
          >
            {step.status === "completed" ? (
              <Check className="w-6 h-6" />
            ) : step.status === "active" ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <span className={config.text}>{step.icon}</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold font-display text-foreground">{step.title}</h3>
              {step.duration && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success">
                  {step.duration}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>

            {/* Active step dots animation */}
            {step.status === "active" && (
              <div className="flex items-center gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Expand button for completed */}
          {step.status === "completed" && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-muted-foreground"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          )}
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {step.status === "completed" && isExpanded && step.stats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-success/20"
            >
              <div className="p-4 grid grid-cols-3 gap-4">
                {step.stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold font-display text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Mini chart */}
              <div className="px-4 pb-4">
                <MiniBarChart values={[65, 40, 85, 72, 90, 55, 78]} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function ProgressTimeline() {
  return (
    <div className="space-y-4">
      {STEPS.map((step, index) => (
        <StepCard key={step.id} step={step} index={index} />
      ))}
    </div>
  );
}
