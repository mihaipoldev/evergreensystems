"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GenerateNicheReportModal } from "./GenerateNicheReportModal";

interface GenerateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectType: string | null;
  projectTypeId?: string | null;
  researchSubjectId: string;
  researchSubjectName?: string;
  researchSubjectGeography?: string | null;
  researchSubjectDescription?: string | null;
  researchSubjectCategory?: string | null;
  // Keep backward compatibility
  subjectType?: string | null;
  subjectTypeId?: string | null;
}

/**
 * GenerateReportModal - Wrapper component for report generation modals
 * This component handles the modal container, backdrop, and portal rendering.
 * The actual content is rendered by type-specific modal components (e.g., GenerateNicheReportModal).
 */
export function GenerateReportModal({
  open,
  onOpenChange,
  projectType,
  projectTypeId,
  researchSubjectId,
  researchSubjectName,
  researchSubjectGeography,
  researchSubjectDescription,
  researchSubjectCategory,
  // Backward compatibility
  subjectType,
  subjectTypeId,
}: GenerateReportModalProps) {
  if (!open) return null;

  // Use projectType if provided, otherwise fallback to subjectType for backward compatibility
  const effectiveProjectType = projectType ?? subjectType ?? null;
  const effectiveProjectTypeId = projectTypeId ?? subjectTypeId ?? null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100]"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-4 md:inset-[8%] lg:inset-[12%] xl:inset-[15%] z-[100] overflow-hidden rounded-2xl bg-card border border-border max-w-5xl mx-auto"
        style={{ boxShadow: "0 20px 60px -12px hsl(var(--primary) / 0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Render the appropriate modal content based on project type */}
          {effectiveProjectType === "niche" || !effectiveProjectType ? (
            <GenerateNicheReportModal
              open={open}
              onOpenChange={onOpenChange}
              projectType={effectiveProjectType}
              projectTypeId={effectiveProjectTypeId}
              researchSubjectId={researchSubjectId}
              researchSubjectName={researchSubjectName}
              researchSubjectGeography={researchSubjectGeography}
              researchSubjectDescription={researchSubjectDescription}
              researchSubjectCategory={researchSubjectCategory}
            />
          ) : (
            // Future: Add other modal types here (e.g., GenerateCompanyReportModal)
            <GenerateNicheReportModal
              open={open}
              onOpenChange={onOpenChange}
              projectType={effectiveProjectType}
              projectTypeId={effectiveProjectTypeId}
              researchSubjectId={researchSubjectId}
              researchSubjectName={researchSubjectName}
              researchSubjectGeography={researchSubjectGeography}
              researchSubjectDescription={researchSubjectDescription}
              researchSubjectCategory={researchSubjectCategory}
            />
          )}
        </div>
      </motion.div>
    </>
  );

  // Render modal in a portal at document body level to ensure proper z-index stacking
  if (typeof window === "undefined") return null;
  
  return createPortal(modalContent, document.body);
}
