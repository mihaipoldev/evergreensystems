import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, FileText, Users, Trophy, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import WorkflowCard from "./WorkflowCard";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { workflow: string; subject: string; geography: string; notes: string }) => void;
}

const workflows = [
  {
    id: "niche",
    icon: "📊",
    title: "Niche Intelligence",
    description: "Comprehensive market analysis with TAM, deal economics, and competitive landscape",
    price: "$1.50",
    time: "~10 minutes",
  },
  {
    id: "stakeholder",
    icon: "👥",
    title: "Stakeholder Analysis",
    description: "Deep dive into key decision makers, org charts, and relationship mapping",
    price: "$2.00",
    time: "~15 minutes",
  },
  {
    id: "competitive",
    icon: "🏆",
    title: "Competitive Intel",
    description: "Detailed competitor profiles, SWOT analysis, and market positioning insights",
    price: "$2.50",
    time: "~20 minutes",
  },
];

const subjects = [
  { value: "ai-ml", label: "AI/ML Consulting", icon: "🤖" },
  { value: "3d-printing", label: "3D Printing Services", icon: "🖨️" },
  { value: "hvac", label: "HVAC Contractors", icon: "❄️" },
  { value: "cybersecurity", label: "Cybersecurity Services", icon: "🔒" },
];

const geographies = [
  { value: "us", label: "United States", icon: "🇺🇸" },
  { value: "eu", label: "European Union", icon: "🇪🇺" },
  { value: "uk", label: "United Kingdom", icon: "🇬🇧" },
  { value: "global", label: "Global", icon: "🌎" },
];

export const GenerateReportModal = ({ isOpen, onClose, onGenerate }: GenerateReportModalProps) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [geography, setGeography] = useState("");
  const [notes, setNotes] = useState("");
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [geoDropdownOpen, setGeoDropdownOpen] = useState(false);

  const handleGenerate = () => {
    if (selectedWorkflow && subject && geography) {
      onGenerate({ workflow: selectedWorkflow, subject, geography, notes });
    }
  };

  const selectedSubject = subjects.find((s) => s.value === subject);
  const selectedGeo = geographies.find((g) => g.value === geography);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl gradient-bg-dark p-1"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="bg-card rounded-[22px] p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl gradient-bg shadow-glow-primary">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-display gradient-text">
                      Generate Your Intelligence Report
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Select a workflow to get started
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Workflow Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    {...workflow}
                    isSelected={selectedWorkflow === workflow.id}
                    onSelect={() => setSelectedWorkflow(workflow.id)}
                  >
                    {/* Expanded Form */}
                    <div className="space-y-4 mt-6 pt-6 border-t border-border">
                      {/* Subject Dropdown */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Research Subject</Label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border hover:border-primary transition-colors text-left"
                          >
                            {selectedSubject ? (
                              <span className="flex items-center gap-2">
                                <span>{selectedSubject.icon}</span>
                                <span>{selectedSubject.label}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Select subject...</span>
                            )}
                            <ChevronDown className={`h-4 w-4 transition-transform ${subjectDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {subjectDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-strong border border-border z-10 overflow-hidden"
                              >
                                {subjects.map((s) => (
                                  <button
                                    key={s.value}
                                    className="w-full flex items-center gap-2 p-3 hover:bg-muted transition-colors text-left"
                                    onClick={() => {
                                      setSubject(s.value);
                                      setSubjectDropdownOpen(false);
                                    }}
                                  >
                                    <span>{s.icon}</span>
                                    <span>{s.label}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Geography Dropdown */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Geography</Label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setGeoDropdownOpen(!geoDropdownOpen)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border hover:border-primary transition-colors text-left"
                          >
                            {selectedGeo ? (
                              <span className="flex items-center gap-2">
                                <span>{selectedGeo.icon}</span>
                                <span>{selectedGeo.label}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Select geography...</span>
                            )}
                            <ChevronDown className={`h-4 w-4 transition-transform ${geoDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {geoDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-strong border border-border z-10 overflow-hidden"
                              >
                                {geographies.map((g) => (
                                  <button
                                    key={g.value}
                                    className="w-full flex items-center gap-2 p-3 hover:bg-muted transition-colors text-left"
                                    onClick={() => {
                                      setGeography(g.value);
                                      setGeoDropdownOpen(false);
                                    }}
                                  >
                                    <span>{g.icon}</span>
                                    <span>{g.label}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Additional Notes</Label>
                        <Textarea
                          placeholder="Any specific focus areas or requirements..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[80px] rounded-xl bg-muted/50 border-border resize-none"
                        />
                      </div>

                      {/* Generate Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className="w-full h-12 rounded-xl gradient-bg text-primary-foreground font-semibold text-lg shadow-glow-primary hover:shadow-glow-accent transition-shadow"
                          onClick={handleGenerate}
                          disabled={!subject || !geography}
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Report
                        </Button>
                      </motion.div>
                    </div>
                  </WorkflowCard>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerateReportModal;
