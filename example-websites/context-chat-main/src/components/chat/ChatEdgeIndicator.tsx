import { motion } from 'framer-motion';
import { useChatContext } from './ChatContext';
import { MessageCircle } from 'lucide-react';

export const ChatEdgeIndicator = () => {
  const { isOpen, setIsOpen } = useChatContext();

  if (isOpen) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 20px hsl(217 91% 60% / 0.3)' }}
      onClick={() => setIsOpen(true)}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center gap-3 w-8 py-6 bg-gradient-to-b from-muted to-card border-l border-t border-b border-border rounded-l-lg cursor-pointer transition-all duration-200 hover:w-9 group"
    >
      <MessageCircle className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
      <span className="text-vertical text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        Chat
      </span>
    </motion.button>
  );
};
