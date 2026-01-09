import { motion } from 'framer-motion';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const [model, setModel] = useState('sonnet');
  const [responseStyle, setResponseStyle] = useState(50);
  const [showCitations, setShowCitations] = useState(true);
  const [highlightCitations, setHighlightCitations] = useState(true);
  const [maxDocs, setMaxDocs] = useState(5);
  const [maxChunks, setMaxChunks] = useState(10);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-card border border-border rounded-xl chat-shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Chat Settings</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Model</label>
            <div className="space-y-2">
              {[
                { id: 'haiku', label: 'Claude Haiku', desc: 'Fast, cheaper' },
                { id: 'sonnet', label: 'Claude Sonnet', desc: 'Balanced' },
                { id: 'opus', label: 'Claude Opus', desc: 'Best quality' },
              ].map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="model"
                    checked={model === m.id}
                    onChange={() => setModel(m.id)}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({m.desc})</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Response Style Slider */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Response Style</label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Short</span>
              <input
                type="range"
                min="0"
                max="100"
                value={responseStyle}
                onChange={(e) => setResponseStyle(Number(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs text-muted-foreground">Detailed</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showCitations}
                onChange={(e) => setShowCitations(e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-foreground">Show source citations</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={highlightCitations}
                onChange={(e) => setHighlightCitations(e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-foreground">Highlight in report when cited</span>
            </label>
          </div>

          {/* Context Settings */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Context Settings</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max documents</label>
                <input
                  type="number"
                  value={maxDocs}
                  onChange={(e) => setMaxDocs(Number(e.target.value))}
                  min="1"
                  max="20"
                  className="w-full h-9 px-3 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max chunks/doc</label>
                <input
                  type="number"
                  value={maxChunks}
                  onChange={(e) => setMaxChunks(Number(e.target.value))}
                  min="1"
                  max="50"
                  className="w-full h-9 px-3 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Save Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
