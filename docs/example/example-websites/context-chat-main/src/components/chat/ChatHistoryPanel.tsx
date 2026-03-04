import { motion } from 'framer-motion';
import { X, History, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

interface ConversationItem {
  id: string;
  icon: string;
  title: string;
  messages: number;
  time: string;
}

const historyData: { label: string; conversations: ConversationItem[] }[] = [
  {
    label: 'Today',
    conversations: [
      { id: '1', icon: '📄', title: '3D Printing deep dive', messages: 15, time: '2 hours ago' },
      { id: '2', icon: '📚', title: 'Market size analysis', messages: 8, time: '5 hours ago' },
    ],
  },
  {
    label: 'This Week',
    conversations: [
      { id: '3', icon: '📁', title: 'Acme project kickoff', messages: 23, time: '2 days ago' },
      { id: '4', icon: '🎯', title: 'AI/ML niche comparison', messages: 12, time: '3 days ago' },
      { id: '5', icon: '📄', title: 'Competitor research', messages: 19, time: '4 days ago' },
    ],
  },
  {
    label: 'Last Week',
    conversations: [
      { id: '6', icon: '📚', title: 'Industry overview', messages: 7, time: '8 days ago' },
    ],
  },
];

export const ChatHistoryPanel = ({ isOpen, onClose, onNewChat }: ChatHistoryPanelProps) => {
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
        className="w-full max-w-md bg-card border border-border rounded-xl chat-shadow-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Chat History</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
          {historyData.map((group) => (
            <div key={group.label}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.conversations.map((convo) => (
                  <button
                    key={convo.id}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <span className="text-lg">{convo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {convo.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <MessageSquare className="h-3 w-3" />
                        <span>{convo.messages} messages</span>
                        <span>•</span>
                        <span>{convo.time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex-shrink-0">
          <Button onClick={onNewChat} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
