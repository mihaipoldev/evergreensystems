import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Globe, BookOpen, FolderOpen, Target } from 'lucide-react';
import { useState } from 'react';

interface ContextSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContext: (context: string) => void;
  currentContext: string;
}

interface Category {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  gradient: string;
  count?: string;
  items?: { id: string; name: string; meta: string; preview: string }[];
}

const categories: Category[] = [
  {
    id: 'general',
    icon: <Globe size={24} />,
    label: 'General',
    description: 'Chat without specific context',
    gradient: 'from-blue-500 to-blue-600',
    items: [],
  },
  {
    id: 'knowledge',
    icon: <BookOpen size={24} />,
    label: 'Knowledge Bases',
    description: 'Your indexed documents',
    gradient: 'from-purple-500 to-purple-600',
    count: '67 docs',
    items: [
      { id: 'kb1', name: '3D Printing Service Providers Report', meta: '47 sources • Updated 2h ago', preview: 'Comprehensive analysis of the 3D printing market...' },
      { id: 'kb2', name: 'SaaS Pricing Strategies', meta: '23 sources • Updated 1d ago', preview: 'Best practices for SaaS pricing models...' },
      { id: 'kb3', name: 'B2B Lead Generation Playbook', meta: '31 sources • Updated 3d ago', preview: 'Step-by-step guide to B2B lead generation...' },
    ],
  },
  {
    id: 'projects',
    icon: <FolderOpen size={24} />,
    label: 'Projects',
    description: 'Your active projects',
    gradient: 'from-teal-500 to-teal-600',
    count: '3 active',
    items: [
      { id: 'p1', name: 'Q1 Marketing Campaign', meta: '12 docs • 5 collaborators', preview: 'Multi-channel campaign targeting...' },
      { id: 'p2', name: 'Product Launch 2024', meta: '8 docs • 3 collaborators', preview: 'Launch strategy for new product line...' },
    ],
  },
  {
    id: 'research',
    icon: <Target size={24} />,
    label: 'Research Subjects',
    description: 'Your tracked niches',
    gradient: 'from-orange-500 to-orange-600',
    count: '12 niches',
    items: [
      { id: 'r1', name: 'Manufacturing Automation', meta: '156 signals • High activity', preview: 'Latest trends in manufacturing automation...' },
      { id: 'r2', name: 'Healthcare SaaS', meta: '89 signals • Medium activity', preview: 'Healthcare technology market analysis...' },
      { id: 'r3', name: 'EdTech Platforms', meta: '67 signals • Growing', preview: 'Educational technology platform trends...' },
    ],
  },
];

export const ContextSwitcher = ({ isOpen, onClose, onSelectContext, currentContext }: ContextSwitcherProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSelectItem = (item: { name: string }) => {
    onSelectContext(item.name);
    onClose();
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

          {/* Modal */}
          <motion.div
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-card rounded-2xl shadow-elevated z-50 overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">Switch Context</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contexts..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className={`w-full p-4 rounded-xl bg-gradient-to-r ${category.gradient} text-white text-left transition-all`}
                    whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          {category.icon}
                        </motion.div>
                        <div>
                          <div className="font-semibold">{category.label}</div>
                          <div className="text-sm text-white/80">{category.description}</div>
                        </div>
                      </div>
                      {category.count && (
                        <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                          {category.count}
                        </span>
                      )}
                    </div>
                  </motion.button>

                  {/* Expanded items */}
                  <AnimatePresence>
                    {expandedCategory === category.id && category.items && category.items.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <motion.button
                              key={item.id}
                              onClick={() => handleSelectItem(item)}
                              className={`w-full p-3 rounded-xl bg-card border text-left transition-all ${
                                currentContext === item.name
                                  ? 'border-primary shadow-glow-sm'
                                  : 'border-border hover:border-primary/30'
                              }`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: itemIndex * 0.05 }}
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{item.name}</span>
                                    {currentContext === item.name && (
                                      <motion.span
                                        className="w-5 h-5 rounded-full bg-success flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                      >
                                        <Check size={12} className="text-white" />
                                      </motion.span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">{item.meta}</div>
                                  <div className="text-xs text-muted-foreground/70 mt-1 truncate">{item.preview}</div>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
