import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, BarChart3, Users, Zap, ArrowRight, Moon, Sun } from "lucide-react";
import { GenerateReportModal } from "@/components/GenerateReportModal";
import { FloatingProgressIndicator } from "@/components/FloatingProgressIndicator";
import { ToastNotification, ToastType } from "@/components/ToastNotification";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

/**
 * Index Page - Main dashboard showcasing the AI Intelligence Platform
 * Features bold gradients, card-based design, and smooth animations
 */
export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([
    {
      id: "welcome",
      type: "info",
      title: "Welcome to Intelligence Hub",
      description: "Start generating insights with AI-powered reports",
    },
  ]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const addToast = (toast: Omit<Toast, "id">) => {
    const newToast = { ...toast, id: Date.now().toString() };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(newToast.id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGenerate = (data: any) => {
    setIsModalOpen(false);
    addToast({
      type: "loading",
      title: "Report Generation Started",
      description: `Generating ${data.workflowType} report for ${data.subject}`,
    });

    // Simulate success after 2 seconds
    setTimeout(() => {
      addToast({
        type: "success",
        title: "Report Ready!",
        description: "Your intelligence report has been generated",
      });
    }, 2000);
  };

  // Stats for the dashboard
  const stats = [
    { label: "Reports Generated", value: "1,247", icon: BarChart3, color: "gradient-bg-primary" },
    { label: "Markets Analyzed", value: "89", icon: Brain, color: "gradient-bg-secondary" },
    { label: "Active Users", value: "456", icon: Users, color: "gradient-bg-accent" },
    { label: "Insights Delivered", value: "12.5k", icon: Zap, color: "gradient-bg-success" },
  ];

  // Recent reports
  const recentReports = [
    { title: "AI/ML Consulting", type: "Niche Intelligence", status: "completed", date: "2 hours ago" },
    { title: "3D Printing Services", type: "Competitor Deep-Dive", status: "in-progress", date: "4 hours ago" },
    { title: "HVAC Contractors", type: "Market Leader Profile", status: "completed", date: "1 day ago" },
  ];

  return (
    <div className={cn("min-h-screen bg-background transition-colors duration-500")}>
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Floating Progress Indicator */}
      <FloatingProgressIndicator />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center"
              >
                <Brain className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <span className="text-xl font-bold font-display gradient-text">
                Intelligence Hub
              </span>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="gradient-bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
                style={{ boxShadow: "0 4px 20px -4px hsla(262, 83%, 58%, 0.4)" }}
              >
                <Sparkles className="w-4 h-4" />
                New Report
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4">
            <span className="gradient-text">AI-Powered</span>{" "}
            <span className="text-foreground">Market Intelligence</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate comprehensive market analysis, competitor insights, and industry reports
            powered by advanced AI agents.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="card-elevated p-6"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.color)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold font-display text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: "📊",
              title: "Niche Intelligence",
              description: "Comprehensive market analysis",
              price: "$1.50",
            },
            {
              icon: "👥",
              title: "Competitor Deep-Dive",
              description: "Detailed competitor profiling",
              price: "$2.00",
            },
            {
              icon: "🏆",
              title: "Market Leader Profile",
              description: "Industry leader analysis",
              price: "$1.75",
            },
          ].map((action, index) => (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="card-elevated p-6 text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{action.icon}</span>
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold">
                  {action.price}
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-foreground mb-1 group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
              <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm">
                Generate Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display text-foreground">Recent Reports</h2>
            <Link
              to="/progress"
              className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              View Active Run
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <motion.div
                key={report.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card-elevated p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      report.status === "completed" ? "bg-success" : "bg-primary animate-pulse"
                    )}
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      report.status === "completed"
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {report.status === "completed" ? "Completed" : "In Progress"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{report.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
      />
    </div>
  );
}
