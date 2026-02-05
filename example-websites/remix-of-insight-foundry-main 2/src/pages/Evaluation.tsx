import { useState, useEffect } from "react";
import { Menu, Printer, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { evaluationData } from "@/data/evaluationData";
import { EvaluationHeader } from "@/components/report/EvaluationHeader";
import { TableOfContents } from "@/components/report/TableOfContents";
import { SynthesisSection } from "@/components/report/sections/SynthesisSection";
import { ConcernsOpportunitiesSection } from "@/components/report/sections/ConcernsOpportunitiesSection";
import { ConsensusFlagsSection } from "@/components/report/sections/ConsensusFlagsSection";
import { QuickStatsSection } from "@/components/report/sections/QuickStatsSection";
import { PageSwitcher } from "@/components/report/PageSwitcher";

const sections = [
  { id: "synthesis", number: "01", title: "Synthesis" },
  { id: "concerns-opportunities", number: "02", title: "Concerns & Opportunities" },
  { id: "consensus-flags", number: "03", title: "Consensus Flags" },
  { id: "quick-stats", number: "04", title: "Quick Stats" },
];

const Evaluation = () => {
  const [activeSection, setActiveSection] = useState("synthesis");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between no-print">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-display font-semibold text-foreground">
          Niche Evaluation Report
        </span>
        <button
          onClick={() => window.print()}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <Printer className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-foreground/50 z-50 no-print"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar z-50 p-6 no-print"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <PageSwitcher />
              <TableOfContents
                sections={sections}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar p-6 overflow-y-auto no-print">
        <PageSwitcher />
        <TableOfContents
          sections={sections}
          activeSection={activeSection}
          onSectionClick={scrollToSection}
        />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[280px] min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8 pt-20 lg:pt-8">
          {/* Print Button - Desktop */}
          <div className="hidden lg:flex justify-end mb-4 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-body text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>

          <EvaluationHeader />

          <SynthesisSection />
          <ConcernsOpportunitiesSection />
          <ConsensusFlagsSection />
          <QuickStatsSection />

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground font-body">
              Generated on{" "}
              {new Date(evaluationData.evaluation_timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              • Confidence: {evaluationData.verdict.confidence}
            </p>
            <p className="text-xs text-muted-foreground/60 font-body mt-2">
              Niche Evaluation Report • Quick Assessment Mode
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Evaluation;
