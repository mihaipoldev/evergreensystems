import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citation?: {
    text: string;
    section: string;
  };
  action?: {
    label: string;
    icon?: string;
  };
}

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

export const ChatMessages = ({ messages, isTyping }: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
              🤖
            </div>
          )}
          <div
            className={`max-w-[85%] ${
              message.role === 'user'
                ? 'bg-chat-user text-chat-user-foreground rounded-2xl rounded-br-md'
                : 'bg-chat-ai text-chat-ai-foreground rounded-2xl rounded-bl-md'
            } px-4 py-2.5`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            
            {message.citation && (
              <button className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-80 hover:opacity-100">
                Source: {message.citation.section}
              </button>
            )}
            
            {message.action && (
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 h-7 text-xs gap-1.5"
              >
                <Play className="h-3 w-3" />
                {message.action.label}
              </Button>
            )}
          </div>
          {message.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm">
              👤
            </div>
          )}
        </motion.div>
      ))}
      
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 justify-start"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
            🤖
          </div>
          <div className="bg-chat-ai rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
