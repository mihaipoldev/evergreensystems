import { motion } from "framer-motion";
import { Brain, Pause, X, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CircularProgress from "@/components/ui/CircularProgress";
import ProgressStep from "./ProgressStep";

interface ProgressDashboardProps {
  subject: string;
  geography: string;
  workflowTitle: string;
  progress: number;
  currentStep: number;
  elapsedTime: string;
  remainingTime: string;
  statusText: string;
  onPause: () => void;
  onCancel: () => void;
  onBackground: () => void;
  onBack: () => void;
}

const steps = [
  {
    title: "Data Collection",
    agent: "Research Agent",
    details: { duration: "45s", sources: 23, companies: 156 },
    chartData: [
      { name: "Web", value: 45 },
      { name: "API", value: 32 },
      { name: "DB", value: 23 },
    ],
    chartType: "bar" as const,
  },
  {
    title: "Market Analysis",
    agent: "Market Analyst",
    details: { duration: "1m 23s", sources: 15, companies: 4500 },
    chartData: [
      { name: "TAM", value: 45 },
      { name: "SAM", value: 30 },
      { name: "SOM", value: 15 },
      { name: "Other", value: 10 },
    ],
    chartType: "pie" as const,
  },
  {
    title: "Competitive Landscape",
    agent: "Competitive Intel Agent",
    details: { duration: "2m 05s", sources: 8, insights: 24 },
    chartData: [
      { name: "Leader", value: 35 },
      { name: "Challenger", value: 28 },
      { name: "Niche", value: 22 },
      { name: "Emerging", value: 15 },
    ],
    chartType: "bar" as const,
  },
  {
    title: "Deal Economics",
    agent: "Finance Agent",
  },
  {
    title: "Report Generation",
    agent: "Synthesis Agent",
  },
];

export const ProgressDashboard = ({
  subject,
  geography,
  workflowTitle,
  progress,
  currentStep,
  elapsedTime,
  remainingTime,
  statusText,
  onPause,
  onCancel,
  onBackground,
  onBack,
}: ProgressDashboardProps) => {
  const getStepStatus = (index: number) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "waiting";
  };

  return (
    <div className="min-h-screen gradient-bg-dark">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Animated Icon */}
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full gradient-bg shadow-glow-primary mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-12 w-12 text-primary-foreground" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold font-display text-primary-foreground mb-4">
            Generating {workflowTitle}
          </h1>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-2xl text-primary-foreground/90">{subject}</span>
            <span className="px-4 py-2 rounded-full bg-primary/20 text-primary-foreground font-medium">
              {geography}
            </span>
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          className="flex flex-col items-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CircularProgress progress={progress} size={220} strokeWidth={14} />
          <div className="flex gap-6 mt-6 text-primary-foreground/70">
            <div className="text-center">
              <div className="text-sm">Elapsed</div>
              <div className="text-lg font-semibold text-primary-foreground">{elapsedTime}</div>
            </div>
            <div className="w-px bg-primary-foreground/20" />
            <div className="text-center">
              <div className="text-sm">Remaining</div>
              <div className="text-lg font-semibold text-primary-foreground">{remainingTime}</div>
            </div>
          </div>
        </motion.div>

        {/* Timeline Steps */}
        <motion.div
          className="space-y-4 mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold font-display text-primary-foreground mb-6">
            Progress Timeline
          </h3>
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <ProgressStep
                {...step}
                status={getStepStatus(index)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Action Bar */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border p-4"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="container max-w-5xl mx-auto flex items-center justify-between">
            <motion.div
              className="text-sm text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {statusText}
            </motion.div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onPause}
                className="gap-2 rounded-xl"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="gap-2 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={onBackground}
                className="gap-2 rounded-xl gradient-bg text-primary-foreground hover:opacity-90"
              >
                <Eye className="h-4 w-4" />
                Background
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
