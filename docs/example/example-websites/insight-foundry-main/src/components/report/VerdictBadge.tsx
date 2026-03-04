import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface VerdictBadgeProps {
  verdict: "pursue" | "test" | "avoid";
  nextStep?: string;
}

const verdictConfig = {
  pursue: {
    icon: CheckCircle2,
    label: "Pursue",
    description: "High-confidence opportunity",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    iconColor: "text-green-600",
  },
  test: {
    icon: AlertCircle,
    label: "Test",
    description: "Worth piloting with controlled approach",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    iconColor: "text-amber-600",
  },
  avoid: {
    icon: XCircle,
    label: "Avoid",
    description: "Low-confidence opportunity",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    iconColor: "text-red-600",
  },
};

export const VerdictBadge = ({ verdict, nextStep }: VerdictBadgeProps) => {
  const config = verdictConfig[verdict];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`rounded-xl p-6 border-2 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${config.bgColor}`}>
          <Icon className={`w-8 h-8 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
              Strategic Verdict
            </span>
          </div>
          <h3 className={`text-2xl font-display font-semibold ${config.textColor} mb-1`}>
            {config.label}
          </h3>
          <p className="text-sm text-muted-foreground font-body mb-4">
            {config.description}
          </p>
          {nextStep && (
            <div className="bg-card/50 rounded-lg p-4 border border-border">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-2">
                Recommended Next Step
              </span>
              <p className="text-sm font-body text-foreground leading-relaxed">
                {nextStep}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
