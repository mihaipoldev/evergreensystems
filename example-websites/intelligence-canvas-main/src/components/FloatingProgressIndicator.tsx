import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronUp, X } from "lucide-react";

interface ActiveRun {
  id: string;
  title: string;
  subject: string;
  progress: number;
}

interface FloatingProgressIndicatorProps {
  runs: ActiveRun[];
  onViewRun: (id: string) => void;
}

export const FloatingProgressIndicator = ({
  runs,
  onViewRun,
}: FloatingProgressIndicatorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (runs.length === 0) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            className="bg-card rounded-2xl shadow-strong border border-border overflow-hidden min-w-[320px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg gradient-bg">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold font-display">Active Runs</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {runs.length}
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Runs List */}
            <div className="max-h-[300px] overflow-y-auto">
              {runs.map((run) => (
                <motion.button
                  key={run.id}
                  className="w-full p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => onViewRun(run.id)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{run.title}</span>
                    <span className="text-xs text-muted-foreground">{run.progress}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{run.subject}</div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-bg rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${run.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            className="relative flex items-center gap-3 px-4 py-3 bg-card rounded-2xl shadow-strong border border-border hover:shadow-glow-primary transition-shadow"
            onClick={() => setIsExpanded(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse indicator */}
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            <div className="p-2 rounded-lg gradient-bg">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>

            <div className="text-left">
              <div className="text-sm font-medium">{runs.length} active run{runs.length > 1 ? "s" : ""}</div>
              <div className="text-xs text-muted-foreground">
                {runs[0].title} - {runs[0].progress}%
              </div>
            </div>

            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingProgressIndicator;
