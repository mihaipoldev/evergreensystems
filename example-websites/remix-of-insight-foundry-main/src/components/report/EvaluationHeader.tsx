import { motion } from "framer-motion";
import { FileText, Calendar, Target, TrendingUp, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { evaluationData } from "@/data/evaluationData";

const verdictConfig = {
  PURSUE: {
    icon: CheckCircle2,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    iconColor: "text-green-600",
  },
  TEST: {
    icon: AlertCircle,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    iconColor: "text-amber-600",
  },
  AVOID: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    iconColor: "text-red-600",
  },
};

export const EvaluationHeader = () => {
  const { verdict, niche_name, evaluation_timestamp, quick_stats } = evaluationData;
  const config = verdictConfig[verdict.label as keyof typeof verdictConfig];
  const Icon = config.icon;

  const formattedDate = new Date(evaluation_timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">
              Niche Evaluation Report
            </span>
            <p className="text-sm text-muted-foreground">Quick Assessment Mode</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-primary mb-4 section-divider pb-4">
          {niche_name}
        </h1>
        <p className="text-xl text-muted-foreground font-body">
          Multi-Model Consensus Evaluation & Strategic Recommendation
        </p>
      </div>

      {/* Verdict Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-xl p-6 border-2 ${config.bgColor} ${config.borderColor} mb-8`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full ${config.bgColor}`}>
            <Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h2 className={`text-3xl font-display font-bold ${config.textColor}`}>
                {verdict.label}
              </h2>
              <span className={`text-4xl font-display font-bold ${config.textColor}`}>
                {verdict.score.toFixed(1)}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <p className="text-foreground font-body">{verdict.recommendation}</p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-body block mb-1">
              Priority Level
            </span>
            <span className={`text-2xl font-display font-semibold ${config.textColor}`}>
              #{verdict.priority}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Meta Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Confidence
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground capitalize">
            {verdict.confidence}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Positive Signals
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {quick_stats.positive_signals}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Negative Signals
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {quick_stats.negative_signals}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-lg p-4 report-shadow border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Model Consensus
            </span>
          </div>
          <p className="text-lg font-display font-medium text-foreground">
            {quick_stats.confidence_description}
          </p>
        </motion.div>
      </div>
    </motion.header>
  );
};
