import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveRun {
  id: string;
  title: string;
  subject: string;
  progress: number;
}

/**
 * Hardcoded active runs for the floating indicator
 */
const ACTIVE_RUNS: ActiveRun[] = [
  {
    id: "1",
    title: "Niche Intelligence",
    subject: "AI/ML Consulting",
    progress: 60,
  },
  {
    id: "2",
    title: "Competitor Deep-Dive",
    subject: "3D Printing Services",
    progress: 25,
  },
];

/**
 * FloatingProgressIndicator - Bottom-right corner indicator showing active report generations
 * Features expand/collapse animation and mini progress bars
 */
export function FloatingProgressIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            style={{ width: 320, boxShadow: "var(--shadow-float)" }}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between gradient-bg-modal">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold font-display text-foreground">Active Runs</h3>
                  <p className="text-xs text-muted-foreground">{ACTIVE_RUNS.length} reports generating</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="p-2 max-h-64 overflow-y-auto">
              {ACTIVE_RUNS.map((run, index) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground">{run.title}</span>
                    <span className="text-xs text-muted-foreground">{run.progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{run.subject}</p>
                  
                  {/* Mini progress bar */}
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${run.progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full gradient-bg-primary rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <button className="w-full py-2 text-sm text-center text-primary hover:text-primary/80 font-medium transition-colors">
                View All Reports
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="relative gradient-bg-primary rounded-2xl p-4 text-primary-foreground shadow-xl"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5" />
              <span className="font-semibold">{ACTIVE_RUNS.length} Active</span>
            </div>

            {/* Mini progress indicators */}
            <div className="flex gap-1 mt-3">
              {ACTIVE_RUNS.map((run) => (
                <div key={run.id} className="flex-1">
                  <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                    <motion.div
                      animate={{ width: `${run.progress}%` }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pulse animation */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl gradient-bg-primary"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
