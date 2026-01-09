import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ChatTabProps {
  isOpen: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

export const ChatTab = ({ isOpen, onClick, hasNotification = true }: ChatTabProps) => {
  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 50, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClick}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group"
        >
          <motion.div
          className="gradient-purple-teal rounded-l-xl shadow-glow-md flex flex-col items-center justify-center py-6 px-2 cursor-pointer relative overflow-hidden"
          initial={{ width: 40 }}
          whileHover={{ width: 48 }}
          animate={{
              boxShadow: [
                '0 0 20px hsl(262 83% 58% / 0.3)',
                '0 0 40px hsl(262 83% 58% / 0.5)',
                '0 0 20px hsl(262 83% 58% / 0.3)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            {/* Notification badge */}
            {hasNotification && (
              <motion.div
                className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full badge-pulse"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              />
            )}

            {/* Icon */}
            <motion.div
              className="text-white mb-2"
              whileHover={{ scale: 1.1 }}
            >
              <MessageCircle size={20} />
            </motion.div>

            {/* Rotated text */}
            <div
              className="text-white font-bold text-sm tracking-wide"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              Chat
            </div>

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent, white, transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
