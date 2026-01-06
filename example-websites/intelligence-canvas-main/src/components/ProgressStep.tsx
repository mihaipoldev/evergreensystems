import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Clock, ChevronDown } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface StepDetails {
  duration?: string;
  sources?: number;
  companies?: number;
  insights?: number;
}

interface ProgressStepProps {
  title: string;
  agent: string;
  status: "completed" | "active" | "waiting";
  details?: StepDetails;
  chartData?: { name: string; value: number }[];
  chartType?: "bar" | "pie";
}

const CHART_COLORS = ["hsl(262, 83%, 58%)", "hsl(180, 70%, 45%)", "hsl(32, 95%, 55%)", "hsl(145, 70%, 45%)"];

export const ProgressStep = ({
  title,
  agent,
  status,
  details,
  chartData,
  chartType = "bar",
}: ProgressStepProps) => {
  const [isExpanded, setIsExpanded] = useState(status === "completed");

  return (
    <motion.div
      layout
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        status === "completed"
          ? "bg-success/10 border-2 border-success/30"
          : status === "active"
          ? "bg-primary/10 border-2 border-primary/50"
          : "bg-muted/50 border-2 border-transparent"
      }`}
    >
      {/* Pulse Animation for Active */}
      {status === "active" && (
        <motion.div
          className="absolute inset-0 bg-primary/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <button
        className="relative w-full flex items-center gap-4 p-4 text-left"
        onClick={() => status === "completed" && setIsExpanded(!isExpanded)}
      >
        {/* Status Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            status === "completed"
              ? "bg-success text-success-foreground"
              : status === "active"
              ? "gradient-bg text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {status === "completed" ? (
            <Check className="h-5 w-5" />
          ) : status === "active" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
        </div>

        {/* Title & Agent */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold font-display ${
              status === "waiting" ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {title}
          </h4>
          <p className="text-sm text-muted-foreground">{agent}</p>
        </div>

        {/* Duration Badge */}
        {details?.duration && status === "completed" && (
          <span className="px-3 py-1 rounded-lg bg-success/20 text-success text-sm font-medium">
            {details.duration}
          </span>
        )}

        {/* Active Status */}
        {status === "active" && (
          <motion.span
            className="px-3 py-1 rounded-lg gradient-bg text-primary-foreground text-sm font-medium"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Processing...
          </motion.span>
        )}

        {/* Expand Icon */}
        {status === "completed" && (
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && status === "completed" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-success/20">
              {/* Stats */}
              {details && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {details.sources && (
                    <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                      📚 {details.sources} sources
                    </span>
                  )}
                  {details.companies && (
                    <span className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary text-sm font-medium">
                      🏢 {details.companies.toLocaleString()} companies
                    </span>
                  )}
                  {details.insights && (
                    <span className="px-3 py-1 rounded-lg bg-accent/10 text-accent text-sm font-medium">
                      💡 {details.insights} insights
                    </span>
                  )}
                </div>
              )}

              {/* Mini Chart */}
              {chartData && (
                <div className="h-24 mt-2">
                  {chartType === "bar" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProgressStep;
