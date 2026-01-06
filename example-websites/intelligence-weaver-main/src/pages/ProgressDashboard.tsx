import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Pause, X, Eye, Globe, ArrowLeft } from "lucide-react";
import { CircularProgress } from "@/components/CircularProgress";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

/**
 * ProgressDashboard - Full-page immersive experience for monitoring report generation
 * Features dark mode design with vibrant accent colors
 */
export default function ProgressDashboard() {
  const [isPaused, setIsPaused] = useState(false);

  // Hardcoded data for demonstration
  const reportData = {
    type: "Niche Intelligence",
    subject: "AI/ML Consulting",
    geography: "United States",
    progress: 60,
    currentStep: "Data Enrichment",
    elapsedTime: "4m 08s",
    estimatedRemaining: "~6 minutes",
    status: "Analyzing competitive landscape...",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Report ID:</span>
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">RPT-2024-001</code>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* Animated Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6 gradient-bg-primary rounded-2xl flex items-center justify-center"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              <Brain className="w-10 h-10 text-primary-foreground" />
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold font-display gradient-text mb-3">
              Generating {reportData.type}
            </h1>

            {/* Subject */}
            <div className="text-2xl font-semibold text-foreground mb-4">
              {reportData.subject}
            </div>

            {/* Geography Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">🇺🇸 {reportData.geography}</span>
            </motion.div>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center mb-12"
          >
            <CircularProgress percentage={reportData.progress} size={220} />

            {/* Time info */}
            <div className="flex items-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Elapsed</div>
                <div className="text-lg font-semibold font-display text-foreground">
                  {reportData.elapsedTime}
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="text-lg font-semibold font-display text-foreground">
                  {reportData.estimatedRemaining}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-32"
          >
            <h2 className="text-xl font-bold font-display text-foreground mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg gradient-bg-secondary flex items-center justify-center text-white text-sm">
                📋
              </span>
              Progress Steps
            </h2>

            <ProgressTimeline />
          </motion.div>
        </div>
      </main>

      {/* Bottom Action Bar - Sticky */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-30"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            {/* Status text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
                <span className="text-sm text-muted-foreground truncate">
                  {reportData.status}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors",
                  isPaused
                    ? "bg-success text-success-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                <Pause className="w-4 h-4" />
                {isPaused ? "Resume" : "Pause"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-destructive text-destructive-foreground"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-muted text-foreground hover:bg-muted/80"
              >
                <Eye className="w-4 h-4" />
                Background
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
