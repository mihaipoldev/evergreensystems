import { useState, useEffect } from "react";
import { Menu, Printer, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { icpData } from "@/data/icpData";
import { ICPHeader } from "@/components/report/ICPHeader";
import { TableOfContents } from "@/components/report/TableOfContents";
import { PageSwitcher } from "@/components/report/PageSwitcher";
import { ICPSnapshotSection } from "@/components/report/sections/ICPSnapshotSection";
import { WhyTheyBuySection } from "@/components/report/sections/WhyTheyBuySection";
import { BuyingCommitteeSection } from "@/components/report/sections/BuyingCommitteeSection";
import { TriggersSection } from "@/components/report/sections/TriggersSection";
import { PurchaseJourneySection } from "@/components/report/sections/PurchaseJourneySection";
import { CompetitiveContextSection } from "@/components/report/sections/CompetitiveContextSection";
import { OpsOutputsSection } from "@/components/report/sections/OpsOutputsSection";
import { PrimarySegmentsSection } from "@/components/report/sections/PrimarySegmentsSection";
import { SecondarySegmentsSection } from "@/components/report/sections/SecondarySegmentsSection";
import { AvoidSegmentsSection } from "@/components/report/sections/AvoidSegmentsSection";
import { DataQualitySection } from "@/components/report/sections/DataQualitySection";

const sections = [
  { id: "icp-snapshot", number: "01", title: "ICP Snapshot" },
  { id: "why-they-buy", number: "02", title: "Buying Motivations" },
  { id: "buying-committee", number: "03", title: "Buying Committee" },
  { id: "triggers", number: "04", title: "Buying Triggers" },
  { id: "purchase-journey", number: "05", title: "Purchase Journey" },
  { id: "competitive-context", number: "06", title: "Competitive Context" },
  { id: "ops-outputs", number: "07", title: "Ops Outputs" },
  { id: "primary-segments", number: "08", title: "Primary Segments" },
  { id: "secondary-segments", number: "09", title: "Secondary Segments" },
  { id: "avoid-segments", number: "10", title: "Segments to Avoid" },
  { id: "data-quality", number: "11", title: "Data Quality" },
];

const ICPIntelligence = () => {
  const [activeSection, setActiveSection] = useState("icp-snapshot");
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
          ICP Intelligence Report
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

          <ICPHeader />

          <ICPSnapshotSection />
          <WhyTheyBuySection />
          <BuyingCommitteeSection />
          <TriggersSection />
          <PurchaseJourneySection />
          <CompetitiveContextSection />
          <OpsOutputsSection />
          <PrimarySegmentsSection />
          <SecondarySegmentsSection />
          <AvoidSegmentsSection />
          <DataQualitySection />

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground font-body">
              Generated on {icpData.meta.generated_at} • Confidence:{" "}
              {(icpData.meta.data_quality.overall_confidence * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground/60 font-body mt-2">
              ICP Intelligence Report • Customer Research Mode
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ICPIntelligence;
