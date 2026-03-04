import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronDown, FileText, Target, Globe } from "lucide-react";
import { WorkflowCard } from "./WorkflowCard";
import { cn } from "@/lib/utils";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: ReportFormData) => void;
}

interface ReportFormData {
  workflowType: string;
  subject: string;
  geography: string;
  notes: string;
}

/**
 * Workflow options for the report generation
 * Each workflow represents a different type of intelligence report
 */
const WORKFLOWS = [
  {
    id: "niche",
    icon: "📊",
    title: "Niche Intelligence",
    description: "Comprehensive market analysis with TAM, deal economics, and competitive landscape",
    price: "$1.50",
    time: "~10 minutes",
  },
  {
    id: "competitor",
    icon: "👥",
    title: "Competitor Deep-Dive",
    description: "Detailed analysis of key competitors, their strategies, and market positioning",
    price: "$2.00",
    time: "~15 minutes",
  },
  {
    id: "market-leader",
    icon: "🏆",
    title: "Market Leader Profile",
    description: "Executive summary of industry leaders with acquisition history and growth metrics",
    price: "$1.75",
    time: "~12 minutes",
  },
];

/**
 * Example subjects for the dropdown
 */
const SUBJECTS = [
  { value: "ai-ml", label: "AI/ML Consulting", icon: "🤖" },
  { value: "3d-printing", label: "3D Printing Services", icon: "🖨️" },
  { value: "hvac", label: "HVAC Contractors", icon: "❄️" },
  { value: "cybersecurity", label: "Cybersecurity Services", icon: "🔒" },
  { value: "fintech", label: "FinTech Platforms", icon: "💳" },
];

const GEOGRAPHIES = [
  { value: "us", label: "United States", icon: "🇺🇸" },
  { value: "eu", label: "European Union", icon: "🇪🇺" },
  { value: "uk", label: "United Kingdom", icon: "🇬🇧" },
  { value: "global", label: "Global", icon: "🌎" },
];

export function GenerateReportModal({
  isOpen,
  onClose,
  onGenerate,
}: GenerateReportModalProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [geography, setGeography] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isGeographyOpen, setIsGeographyOpen] = useState(false);

  const handleSubmit = () => {
    if (selectedWorkflow && subject && geography) {
      onGenerate({
        workflowType: selectedWorkflow,
        subject,
        geography,
        notes,
      });
    }
  };

  const selectedSubject = SUBJECTS.find((s) => s.value === subject);
  const selectedGeography = GEOGRAPHIES.find((g) => g.value === geography);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-[5%] lg:inset-[10%] z-50 overflow-hidden rounded-3xl gradient-bg-modal border border-border"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <div className="h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 p-6 md:p-8 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center"
                    >
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold font-display gradient-text">
                        Generate Your Intelligence Report
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Select a workflow and configure your analysis
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {/* Workflow Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {WORKFLOWS.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      {...workflow}
                      isSelected={selectedWorkflow === workflow.id}
                      onSelect={() => setSelectedWorkflow(workflow.id)}
                    />
                  ))}
                </div>

                {/* Expanded Form - Shows when workflow is selected */}
                <AnimatePresence>
                  {selectedWorkflow && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="space-y-6"
                    >
                      <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                        <h2 className="text-lg font-semibold font-display flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Configure Your Report
                        </h2>

                        {/* Subject Selector */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Research Subject
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                              className={cn(
                                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                                "bg-background hover:border-primary/50",
                                isSubjectOpen ? "border-primary ring-2 ring-primary/20" : "border-border"
                              )}
                            >
                              {selectedSubject ? (
                                <span className="flex items-center gap-3">
                                  <span className="text-xl">{selectedSubject.icon}</span>
                                  <span className="font-medium">{selectedSubject.label}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Select a subject...</span>
                              )}
                              <ChevronDown className={cn("w-5 h-5 transition-transform", isSubjectOpen && "rotate-180")} />
                            </button>
                            
                            <AnimatePresence>
                              {isSubjectOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden"
                                >
                                  {SUBJECTS.map((s) => (
                                    <button
                                      key={s.value}
                                      onClick={() => {
                                        setSubject(s.value);
                                        setIsSubjectOpen(false);
                                      }}
                                      className="w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                                    >
                                      <span className="text-xl">{s.icon}</span>
                                      <span className="font-medium">{s.label}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Geography Selector */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Geography
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => setIsGeographyOpen(!isGeographyOpen)}
                              className={cn(
                                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                                "bg-background hover:border-primary/50",
                                isGeographyOpen ? "border-primary ring-2 ring-primary/20" : "border-border"
                              )}
                            >
                              {selectedGeography ? (
                                <span className="flex items-center gap-3">
                                  <span className="text-xl">{selectedGeography.icon}</span>
                                  <span className="font-medium">{selectedGeography.label}</span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Select geography...</span>
                              )}
                              <ChevronDown className={cn("w-5 h-5 transition-transform", isGeographyOpen && "rotate-180")} />
                            </button>
                            
                            <AnimatePresence>
                              {isGeographyOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden"
                                >
                                  {GEOGRAPHIES.map((g) => (
                                    <button
                                      key={g.value}
                                      onClick={() => {
                                        setGeography(g.value);
                                        setIsGeographyOpen(false);
                                      }}
                                      className="w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                                    >
                                      <span className="text-xl">{g.icon}</span>
                                      <span className="font-medium">{g.label}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Notes Textarea */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any specific requirements or focus areas for your report..."
                            className="w-full p-4 rounded-xl border-2 border-border bg-background min-h-[120px] resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          />
                        </div>
                      </div>

                      {/* Generate Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={!subject || !geography}
                        className={cn(
                          "w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                          "gradient-bg-primary text-primary-foreground",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "hover:shadow-xl"
                        )}
                        style={{
                          boxShadow: subject && geography ? "0 8px 32px -8px hsla(262, 83%, 58%, 0.5)" : undefined,
                        }}
                      >
                        <Sparkles className="w-6 h-6" />
                        Generate Report
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
