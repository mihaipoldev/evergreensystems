"use client";

import { motion } from 'framer-motion';
import { useChatContext } from '../contexts/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';

export const ChatEdgeIndicator = () => {
  const { isOpen, setIsOpen } = useChatContext();

  if (isOpen) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      onClick={() => setIsOpen(true)}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[70] flex flex-col items-center justify-center gap-3 w-8 py-6 bg-gradient-to-b from-muted to-card border-l border-t border-b border-border rounded-l-lg cursor-pointer group transition-all duration-200 hover:bg-gradient-to-b hover:from-muted/90 hover:to-card/90"
    >
      <FontAwesomeIcon icon={faMessage} className="w-4 h-4 text-primary transition-opacity duration-200 group-hover:opacity-80" />
      <span className="text-vertical text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80">
        Chat
      </span>
    </motion.button>
  );
};

