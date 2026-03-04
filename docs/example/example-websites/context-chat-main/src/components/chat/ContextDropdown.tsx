import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext, ContextItem } from './ChatContext';
import { ChevronRight, Check } from 'lucide-react';
import { useState } from 'react';

interface ContextDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContextCategory {
  id: string;
  icon: string;
  title: string;
  items?: ContextItem[];
}

const contextCategories: ContextCategory[] = [
  {
    id: 'general',
    icon: '🌐',
    title: 'General Assistant (no specific context)',
  },
  {
    id: 'knowledge-bases',
    icon: '📚',
    title: 'Knowledge Bases',
    items: [
      { id: 'kb-1', type: 'knowledgeBase', icon: '📚', title: 'Niche Intelligence', metadata: '47 reports' },
      { id: 'kb-2', type: 'knowledgeBase', icon: '📚', title: 'ICP Research', metadata: '12 reports' },
    ],
  },
  {
    id: 'projects',
    icon: '📁',
    title: 'Projects',
    items: [
      { id: 'proj-1', type: 'project', icon: '📁', title: 'Acme 3PL Logistics' },
      { id: 'proj-2', type: 'project', icon: '📁', title: 'Beta Consulting Project' },
    ],
  },
  {
    id: 'subjects',
    icon: '🎯',
    title: 'Research Subjects',
    items: [
      { id: 'subj-1', type: 'subject', icon: '🎯', title: 'AI/ML Consulting', metadata: '3 reports' },
      { id: 'subj-2', type: 'subject', icon: '🎯', title: '3D Printing', metadata: '2 reports' },
    ],
  },
];

const currentPageContext: ContextItem = {
  id: 'current-page',
  type: 'report',
  icon: '📄',
  title: '3D Printing Report',
  description: 'Current Page',
};

export const ContextDropdown = ({ isOpen, onClose }: ContextDropdownProps) => {
  const { activeContext, setActiveContext } = useChatContext();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['knowledge-bases']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectContext = (context: ContextItem) => {
    setActiveContext(context);
    onClose();
  };

  const isSelected = (id: string) => activeContext.id === id;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 right-4 top-full mt-2 z-50 bg-card border border-border rounded-xl chat-shadow-lg overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {/* Current Page - Selected */}
              <button
                onClick={() =>
                  selectContext({
                    ...currentPageContext,
                    title: '3D Printing Service Providers Report',
                    description: 'Context includes: Report content (8 sections), 47 source URLs, Market data',
                  })
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{currentPageContext.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">
                      Current Page - {currentPageContext.title}
                    </div>
                    <div className="text-xs text-muted-foreground">Active document</div>
                  </div>
                </div>
                {isSelected('1') && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>

              {/* General Assistant */}
              <button
                onClick={() =>
                  selectContext({
                    id: 'general',
                    type: 'general',
                    icon: '🌐',
                    title: 'General Assistant',
                    description: 'No specific context - general AI assistance',
                  })
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🌐</span>
                  <span className="text-sm font-medium text-foreground">
                    General Assistant (no specific context)
                  </span>
                </div>
                {isSelected('general') && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>

              {/* Expandable Categories */}
              {contextCategories.slice(1).map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{category.icon}</span>
                      <span className="text-sm font-medium text-foreground">
                        {category.title}
                      </span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedCategories.includes(category.id) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedCategories.includes(category.id) && category.items && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-muted/30"
                      >
                        {category.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => selectContext(item)}
                            className="w-full flex items-center justify-between pl-12 pr-4 py-2.5 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{item.icon}</span>
                              <span className="text-sm text-foreground">{item.title}</span>
                              {item.metadata && (
                                <span className="text-xs text-muted-foreground">
                                  ({item.metadata})
                                </span>
                              )}
                            </div>
                            {isSelected(item.id) && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
