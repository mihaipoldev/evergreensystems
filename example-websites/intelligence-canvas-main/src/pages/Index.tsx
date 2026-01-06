import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BarChart3, Users, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GenerateReportModal from "@/components/GenerateReportModal";
import ProgressDashboard from "@/components/ProgressDashboard";
import FloatingProgressIndicator from "@/components/FloatingProgressIndicator";

type View = "home" | "progress";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>("home");
  const [activeRuns, setActiveRuns] = useState([
    {
      id: "1",
      title: "Niche Intelligence",
      subject: "AI/ML Consulting",
      progress: 60,
    },
  ]);

  const handleGenerate = (data: { workflow: string; subject: string; geography: string; notes: string }) => {
    setIsModalOpen(false);
    toast.success("Report generation started!", {
      description: `Generating ${data.workflow} for ${data.subject}`,
    });
    setCurrentView("progress");
  };

  const handleViewRun = (id: string) => {
    setCurrentView("progress");
  };

  if (currentView === "progress") {
    return (
      <>
        <ProgressDashboard
          subject="AI/ML Consulting"
          geography="🌎 United States"
          workflowTitle="Niche Intelligence"
          progress={60}
          currentStep={2}
          elapsedTime="4m 13s"
          remainingTime="~6 minutes"
          statusText="Analyzing competitive landscape..."
          onPause={() => toast.info("Report generation paused")}
          onCancel={() => {
            toast.error("Report generation cancelled");
            setCurrentView("home");
          }}
          onBackground={() => {
            toast.info("Running in background", { description: "We'll notify you when complete" });
            setCurrentView("home");
          }}
          onBack={() => setCurrentView("home")}
        />
        <FloatingProgressIndicator runs={activeRuns} onViewRun={handleViewRun} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 gradient-bg-dark opacity-5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container max-w-6xl mx-auto px-4 py-20 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Intelligence Platform</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
              <span className="gradient-text">Intelligence</span>
              <br />
              <span className="text-foreground">at Your Fingertips</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Generate comprehensive market intelligence, stakeholder analysis, and competitive insights in minutes. 
              Powered by advanced AI agents working in parallel.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                className="h-14 px-8 rounded-xl gradient-bg text-primary-foreground font-semibold text-lg shadow-glow-primary hover:shadow-glow-accent transition-all"
                onClick={() => setIsModalOpen(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Report
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-xl font-semibold text-lg"
                onClick={() => setCurrentView("progress")}
              >
                View Demo Progress
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Powered by <span className="gradient-text">AI Agents</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple specialized agents work in parallel to deliver comprehensive intelligence reports
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Market Analysis",
                description: "Deep TAM/SAM/SOM analysis with real-time market sizing and growth projections",
                color: "primary",
              },
              {
                icon: Users,
                title: "Stakeholder Mapping",
                description: "Identify key decision makers, org structures, and relationship networks",
                color: "secondary",
              },
              {
                icon: Target,
                title: "Competitive Intel",
                description: "Comprehensive competitor profiles with SWOT analysis and positioning insights",
                color: "accent",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-card rounded-2xl p-8 shadow-medium hover:shadow-strong transition-all hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 ${
                  feature.color === "primary" ? "gradient-bg" :
                  feature.color === "secondary" ? "gradient-bg-secondary" :
                  "gradient-bg-accent"
                }`}>
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold font-display mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Reports Generated" },
              { value: "5M+", label: "Companies Analyzed" },
              { value: "2 min", label: "Average Time" },
              { value: "99.9%", label: "Accuracy Rate" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold font-display gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
      />

      {/* Floating Progress Indicator */}
      <FloatingProgressIndicator runs={activeRuns} onViewRun={handleViewRun} />
    </div>
  );
};

export default Index;
