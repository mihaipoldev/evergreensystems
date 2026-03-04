import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Star, Crown, Check } from 'lucide-react';
import { useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const models = [
  { id: 'haiku', name: 'Claude Haiku', icon: Zap, badge: 'Fast', color: 'from-green-500 to-emerald-500', description: 'Quick responses for simple questions' },
  { id: 'sonnet', name: 'Claude Sonnet', icon: Star, badge: 'Balanced', color: 'from-blue-500 to-indigo-500', description: 'Best for most use cases' },
  { id: 'opus', name: 'Claude Opus', icon: Crown, badge: 'Best', color: 'from-purple-500 to-pink-500', description: 'Most capable for complex tasks' },
];

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const [selectedModel, setSelectedModel] = useState('sonnet');
  const [responseStyle, setResponseStyle] = useState(50);
  const [showCitations, setShowCitations] = useState(true);
  const [highlightInReport, setHighlightInReport] = useState(true);
  const [maxDocuments, setMaxDocuments] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[85vh] bg-card rounded-2xl shadow-elevated z-50 overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
                  <span>⚙️</span>
                  Customize Your Experience
                </h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {/* Model Selection */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Model Selection</h3>
                <div className="grid gap-3">
                  {models.map((model) => (
                    <motion.button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedModel === model.id
                          ? 'border-primary shadow-glow-sm bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${model.color} text-white`}>
                          <model.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{model.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${model.color} text-white`}>
                              {model.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                        </div>
                        {selectedModel === model.id && (
                          <motion.div
                            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check size={14} className="text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Response Style */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Response Style</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">💬 Concise</span>
                    <span className="flex items-center gap-1">📚 Detailed</span>
                  </div>
                  <div className="relative h-3">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-primary opacity-30" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={responseStyle}
                      onChange={(e) => setResponseStyle(Number(e.target.value))}
                      className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary [&::-webkit-slider-thumb]:to-secondary [&::-webkit-slider-thumb]:shadow-glow-sm [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Citations & Highlighting</h3>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm">Show source citations</span>
                  <motion.button
                    onClick={() => setShowCitations(!showCitations)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      showCitations ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ x: showCitations ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm">Highlight in report</span>
                  <motion.button
                    onClick={() => setHighlightInReport(!highlightInReport)}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${
                      highlightInReport ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ x: highlightInReport ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </div>

              {/* Max Documents */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Context Controls</h3>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm">Max documents to load</span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => setMaxDocuments(Math.max(1, maxDocuments - 1))}
                      className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-lg font-medium hover:border-primary/50 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      −
                    </motion.button>
                    <span className="w-8 text-center font-semibold">{maxDocuments}</span>
                    <motion.button
                      onClick={() => setMaxDocuments(Math.min(20, maxDocuments + 1))}
                      className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-lg font-medium hover:border-primary/50 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border">
              <motion.button
                onClick={handleSave}
                className="w-full py-3 rounded-xl gradient-purple-blue text-white font-semibold shadow-glow-sm flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                {saved ? (
                  <>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check size={18} />
                    </motion.span>
                    Saved!
                  </>
                ) : (
                  'Save Settings'
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
