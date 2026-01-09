import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Pin, Trash2, Plus, FileText, BookOpen, FolderOpen, Target } from 'lucide-react';
import { useState } from 'react';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  timestamp: string;
  icon: React.ReactNode;
  contextType: string;
  contextColor: string;
  pinned?: boolean;
}

const conversations: Conversation[] = [
  {
    id: '1',
    title: '3D Printing Market Analysis',
    preview: 'Looking at the key players in the 3D printing space and...',
    messageCount: 24,
    timestamp: '2 hours ago',
    icon: <FileText size={18} />,
    contextType: 'Report',
    contextColor: 'bg-purple-500',
    pinned: true,
  },
  {
    id: '2',
    title: 'Lead Generation Strategy',
    preview: 'Based on my analysis, the best approach for this niche...',
    messageCount: 15,
    timestamp: '5 hours ago',
    icon: <Target size={18} />,
    contextType: 'Research',
    contextColor: 'bg-orange-500',
  },
  {
    id: '3',
    title: 'Competitor Deep Dive',
    preview: 'The top 3 competitors in this space are focused on...',
    messageCount: 32,
    timestamp: 'Yesterday',
    icon: <BookOpen size={18} />,
    contextType: 'Knowledge Base',
    contextColor: 'bg-blue-500',
  },
  {
    id: '4',
    title: 'Q1 Campaign Planning',
    preview: 'For your Q1 campaign, I recommend starting with...',
    messageCount: 18,
    timestamp: 'Yesterday',
    icon: <FolderOpen size={18} />,
    contextType: 'Project',
    contextColor: 'bg-teal-500',
  },
  {
    id: '5',
    title: 'Pricing Analysis',
    preview: 'The average pricing in this market ranges from...',
    messageCount: 9,
    timestamp: '2 days ago',
    icon: <FileText size={18} />,
    contextType: 'Report',
    contextColor: 'bg-purple-500',
  },
  {
    id: '6',
    title: 'Industry Trends 2024',
    preview: 'Key trends to watch include automation, AI integration...',
    messageCount: 21,
    timestamp: '3 days ago',
    icon: <BookOpen size={18} />,
    contextType: 'Knowledge Base',
    contextColor: 'bg-blue-500',
  },
  {
    id: '7',
    title: 'Target Audience Research',
    preview: 'Your ideal customer profile based on the data shows...',
    messageCount: 14,
    timestamp: '4 days ago',
    icon: <Target size={18} />,
    contextType: 'Research',
    contextColor: 'bg-orange-500',
  },
  {
    id: '8',
    title: 'Email Sequence Draft',
    preview: 'Here is the 5-email sequence targeting decision makers...',
    messageCount: 7,
    timestamp: '1 week ago',
    icon: <FolderOpen size={18} />,
    contextType: 'Project',
    contextColor: 'bg-teal-500',
  },
];

const groupByTime = (convs: Conversation[]) => {
  const groups: { [key: string]: Conversation[] } = {
    'Pinned': [],
    'Today': [],
    'This Week': [],
    'Last Week': [],
    'Earlier': [],
  };

  convs.forEach((conv) => {
    if (conv.pinned) {
      groups['Pinned'].push(conv);
    } else if (conv.timestamp.includes('hour')) {
      groups['Today'].push(conv);
    } else if (conv.timestamp === 'Yesterday') {
      groups['This Week'].push(conv);
    } else if (conv.timestamp.includes('days')) {
      groups['This Week'].push(conv);
    } else {
      groups['Earlier'].push(conv);
    }
  });

  return groups;
};

export const ChatHistory = ({ isOpen, onClose, onSelectConversation }: ChatHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const groupedConversations = groupByTime(conversations);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 bg-card z-10 flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <h2 className="text-lg font-bold gradient-text flex items-center gap-2">
                <span>📚</span>
                Your Conversations
              </h2>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="relative">
              {/* Gradient line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary/30" />

              {/* Groups */}
              {Object.entries(groupedConversations).map(([groupName, convs], groupIndex) => {
                if (convs.length === 0) return null;
                
                return (
                  <div key={groupName} className="mb-6">
                    <motion.div
                      className="text-xs font-semibold text-muted-foreground mb-3 pl-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: groupIndex * 0.1 }}
                    >
                      {groupName}
                    </motion.div>

                    <div className="space-y-2">
                      {convs.map((conv, index) => (
                        <motion.div
                          key={conv.id}
                          className="relative pl-10"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                          onMouseEnter={() => setHoveredId(conv.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          {/* Timeline dot */}
                          <motion.div
                            className={`absolute left-2.5 top-4 w-3 h-3 rounded-full ${conv.contextColor} ring-4 ring-card`}
                            whileHover={{ scale: 1.3 }}
                            animate={hoveredId === conv.id ? { boxShadow: '0 0 15px currentColor' } : {}}
                          />

                          {/* Card */}
                          <motion.button
                            onClick={() => onSelectConversation(conv.id)}
                            className="w-full p-3 rounded-xl bg-muted/30 border border-border/50 text-left hover:border-primary/30 transition-all"
                            whileHover={{ x: 4, backgroundColor: 'hsl(var(--muted))' }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${conv.contextColor} text-white`}>
                                {conv.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold truncate">{conv.title}</span>
                                  {conv.pinned && (
                                    <Pin size={12} className="text-primary flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {conv.preview}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${conv.contextColor} text-white`}>
                                    {conv.contextType}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {conv.messageCount} messages • {conv.timestamp}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Hover actions */}
                            <AnimatePresence>
                              {hoveredId === conv.id && (
                                <motion.div
                                  className="absolute right-3 top-3 flex gap-1"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                >
                                  <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="p-1.5 rounded-lg bg-card hover:bg-muted transition-colors"
                                  >
                                    <Pin size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="p-1.5 rounded-lg bg-card hover:bg-destructive/10 text-destructive transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAB */}
          <motion.button
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full gradient-purple-blue text-white shadow-glow-md flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <Plus size={24} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
