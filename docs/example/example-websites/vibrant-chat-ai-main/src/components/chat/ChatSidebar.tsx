import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { SuggestedQuestions } from './SuggestedQuestions';
import { MessageList, TypingIndicator } from './MessageList';
import { ChatInput } from './ChatInput';
import { ContextSwitcher } from './ContextSwitcher';
import { SettingsPanel } from './SettingsPanel';
import { ChatHistory } from './ChatHistory';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { label: string; section: string }[];
  chart?: { name: string; value: number; color: string }[];
  actionButton?: { label: string; icon: string };
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'What are the main opportunities in the 3D printing service market?',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Based on my analysis of the 3D Printing Service Providers Report, here are the top opportunities:\n\n1. **Medical & Healthcare** - Custom prosthetics and dental applications are growing 35% YoY\n2. **Aerospace Parts** - High-margin precision parts with stringent quality requirements\n3. **Rapid Prototyping** - SMBs need faster turnaround than enterprise providers offer\n\nThe market is particularly underserved in the $5K-$50K project range.',
    sources: [
      { label: 'Market Overview', section: 'Section 2.1' },
      { label: 'Growth Drivers', section: 'Section 3.4' },
    ],
    chart: [
      { name: 'Medical', value: 35, color: '#8B5CF6' },
      { name: 'Aerospace', value: 28, color: '#14B8A6' },
      { name: 'Automotive', value: 22, color: '#F97316' },
      { name: 'Consumer', value: 15, color: '#10B981' },
    ],
    timestamp: '2 hours ago',
  },
  {
    id: '3',
    role: 'user',
    content: 'Can you help me create an outreach strategy for the medical segment?',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    role: 'assistant',
    content: 'I can help you build a targeted outreach strategy for the medical 3D printing segment. Here\'s what I recommend:\n\n**Target Decision Makers:**\n• Procurement Directors at hospitals\n• R&D leads at medical device companies\n• Dental lab owners\n\n**Key Value Props:**\n• FDA compliance expertise\n• Biocompatible materials\n• 48-hour turnaround for prototypes\n\nWould you like me to generate a complete email sequence workflow?',
    sources: [
      { label: 'Buyer Personas', section: 'Section 4.2' },
      { label: 'Competitive Analysis', section: 'Section 5.1' },
    ],
    actionButton: {
      label: 'Generate Email Sequence Workflow',
      icon: '▶️',
    },
    timestamp: '1 hour ago',
  },
];

export const ChatSidebar = ({ isOpen, onClose }: ChatSidebarProps) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [contextSwitcherOpen, setContextSwitcherOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentContext, setCurrentContext] = useState('3D Printing Service Providers Report');

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: String(messages.length + 1),
      role: 'user',
      content,
      timestamp: 'Just now',
    };
    setMessages([...messages, newMessage]);
    setShowSuggestions(false);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: String(messages.length + 2),
        role: 'assistant',
        content: 'I\'ve analyzed your question and found some interesting insights from the report. Let me break this down for you with specific data points and actionable recommendations.',
        sources: [{ label: 'Analysis', section: 'Section 6.3' }],
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 2000);
  };

  const handleSelectQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed right-0 top-0 bottom-0 w-full md:w-[550px] bg-card shadow-elevated z-50 flex flex-col overflow-hidden"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Glass overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          {/* Header */}
          <ChatHeader
            onClose={onClose}
            onMinimize={onClose}
            onMaximize={() => {}}
            onOpenContextSwitcher={() => setContextSwitcherOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)}
          />

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Suggested questions (shown when chat is empty or at start) */}
            {showSuggestions && messages.length <= 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SuggestedQuestions onSelectQuestion={handleSelectQuestion} />
              </motion.div>
            )}

            {/* Messages */}
            <MessageList messages={messages} />

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}

            {/* History overlay */}
            <ChatHistory
              isOpen={historyOpen}
              onClose={() => setHistoryOpen(false)}
              onSelectConversation={(id) => {
                setHistoryOpen(false);
              }}
            />
          </div>

          {/* Input */}
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />

          {/* Modals */}
          <ContextSwitcher
            isOpen={contextSwitcherOpen}
            onClose={() => setContextSwitcherOpen(false)}
            onSelectContext={setCurrentContext}
            currentContext={currentContext}
          />

          <SettingsPanel
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
