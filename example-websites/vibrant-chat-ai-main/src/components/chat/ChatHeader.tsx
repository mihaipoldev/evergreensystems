import { motion } from 'framer-motion';
import { Minus, Maximize2, X, ChevronDown, FileText, Settings, RefreshCw, History, Target } from 'lucide-react';
import { useState } from 'react';

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onOpenContextSwitcher: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export const ChatHeader = ({
  onClose,
  onMinimize,
  onMaximize,
  onOpenContextSwitcher,
  onOpenSettings,
  onOpenHistory,
}: ChatHeaderProps) => {
  const [contextExpanded, setContextExpanded] = useState(false);

  const quickActions = [
    { icon: Settings, label: 'Settings', onClick: onOpenSettings },
    { icon: RefreshCw, label: 'New Chat', onClick: () => {} },
    { icon: History, label: 'History', onClick: onOpenHistory },
    { icon: Target, label: 'Quick Actions', onClick: () => {} },
  ];

  return (
    <div className="gradient-purple-blue p-4 rounded-t-2xl">
      {/* Title and window controls */}
      <div className="flex items-center justify-between mb-4">
        <motion.h2
          className="text-xl font-bold text-white flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span>💬</span>
          <span>Intelligence Chat</span>
        </motion.h2>

        <div className="flex items-center gap-1">
          {[
            { icon: Minus, onClick: onMinimize },
            { icon: Maximize2, onClick: onMaximize },
            { icon: X, onClick: onClose },
          ].map((control, index) => (
            <motion.button
              key={index}
              onClick={control.onClick}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <control.icon size={16} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Context display card */}
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 cursor-pointer"
        onClick={onOpenContextSwitcher}
        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.15)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="text-3xl"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            📄
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate">
                3D Printing Service Providers Report
              </span>
              <motion.div
                animate={{ rotate: contextExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-white/70" />
              </motion.div>
            </div>
            
            {/* Context details */}
            <motion.div
              className="flex items-center gap-3 mt-1 flex-wrap"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                className="text-xs text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <AnimatedNumber value={8} /> sections analyzed
              </motion.span>
              <motion.span
                className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.span
                  className="w-1.5 h-1.5 bg-secondary rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <AnimatedNumber value={47} /> sources
              </motion.span>
              <motion.span
                className="text-xs text-success flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ✓ Fully indexed
              </motion.span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick action chips */}
      <div className="mt-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium whitespace-nowrap border border-white/10 hover:bg-white/20 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.95 }}
            >
              <action.icon size={14} />
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Animated number component
const AnimatedNumber = ({ value }: { value: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {value}
    </motion.span>
  );
};
