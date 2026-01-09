"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles, faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

interface FloatingActionBarProps {
  selectedCount: number;
  onGenerate?: () => void;
  onDelete?: () => void;
  onClear?: () => void;
  generateLabel?: string;
  deleteLabel?: string;
}

export function FloatingActionBar({
  selectedCount,
  onGenerate,
  onDelete,
  onClear,
  generateLabel = "Generate",
  deleteLabel = "Delete",
}: FloatingActionBarProps) {
  const [leftPosition, setLeftPosition] = useState<string>('50vw');
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const windowWidth = window.innerWidth;
      const isDesktop = windowWidth >= 768; // md breakpoint
      
      let calculatedLeft: string;
      
      if (isDesktop) {
        // On desktop: sidebar is 256px, so center of remaining space is 256px + (100vw - 256px)/2 = 128px + 50vw
        calculatedLeft = 'calc(128px + 50vw)';
      } else {
        // On mobile: just center of viewport
        calculatedLeft = '50vw';
      }
      
      setLeftPosition(calculatedLeft);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    return () => window.removeEventListener('resize', updatePosition);
  }, [selectedCount]);

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="floating-action-bar"
        ref={barRef}
        data-action-bar
        initial={{ y: 100, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        exit={{ y: 100, opacity: 0, x: '-50%' }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 z-50"
        style={{
          left: leftPosition,
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-background border border-border rounded-full shadow-lg">
          <span className="text-sm font-medium text-foreground px-2">
            {selectedCount} {selectedCount === 1 ? "item" : "items"}
          </span>

          <div className="h-4 w-px bg-border" />

          {onGenerate && (
            <Button
              onClick={onGenerate}
              size="sm"
              className="h-8 px-4 rounded-full gap-2"
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
              <span className="text-sm font-medium">{generateLabel}</span>
            </Button>
          )}

          {onDelete && (
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="h-8 px-4 rounded-full gap-2"
            >
              <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
              <span className="text-sm font-medium">{deleteLabel}</span>
            </Button>
          )}

          {onClear && (
            <>
              <div className="h-4 w-px bg-border" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                className="h-8 w-8 rounded-full bg-transparent hover:bg-transparent text-foreground/80 hover:text-foreground"
              >
                <FontAwesomeIcon icon={faX} className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

