"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { TableOfContents } from "./TableOfContents";

interface Section {
  id: string;
  number: string;
  title: string;
}

interface ReportLayoutProps {
  sections: Section[];
  children: ReactNode;
  showTableOfContents?: boolean;
  reportId?: string;
}

export const ReportLayout = ({ sections, children, showTableOfContents = true, reportId }: ReportLayoutProps) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!showTableOfContents) return;

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
  }, [sections, showTableOfContents]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background -mx-4 md:-mx-6 lg:-mx-8">

      {/* Mobile Sidebar Overlay */}
      {showTableOfContents && (
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
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
                <TableOfContents
                  sections={sections}
                  activeSection={activeSection}
                  onSectionClick={scrollToSection}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}

      <div className="flex relative print:block print:static">
        {/* Desktop Sidebar - positioned after IntelSidebar */}
        {showTableOfContents && (
          <aside className="hidden lg:block fixed left-64 top-0 bottom-0 w-[280px] bg-sidebar p-6 overflow-y-auto no-print z-30">
            <TableOfContents
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-screen ${showTableOfContents ? 'lg:ml-[280px]' : ''} print:ml-0 print:static`}>
          <div className={`max-w-4xl mx-auto px-6 py-0 dark:pt-4 print:max-w-full print:px-4`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

