import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from './ChatContext';
import { ChatHeader } from './ChatHeader';
import { ContextDropdown } from './ContextDropdown';
import { SuggestedQuestions } from './SuggestedQuestions';
import { ChatMessages, Message } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { SettingsPanel } from './SettingsPanel';
import { ChatHistoryPanel } from './ChatHistoryPanel';

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'What are the key findings about 3D printing service providers?',
  },
  {
    id: '2',
    role: 'assistant',
    content: `Based on my analysis of the report, here are the key findings:\n\n**Market Overview:**\n• The 3D printing services market is growing at 21% CAGR\n• Main segments: prototyping (45%), manufacturing (35%), and tooling (20%)\n\n**Key Players:**\n• Top 5 providers control 38% of the market\n• Strong regional fragmentation exists\n\n**Red Flags Identified:**\n• High customer concentration risk\n• Technology obsolescence concerns\n• Margin pressure from commoditization`,
    citation: {
      text: 'Market is growing at 21% CAGR',
      section: 'Section 3.2 - Market Analysis',
    },
  },
  {
    id: '3',
    role: 'user',
    content: 'How should I approach prospects in this niche?',
  },
  {
    id: '4',
    role: 'assistant',
    content: `Here's my recommended positioning strategy for 3D printing service providers:\n\n**Pain Points to Address:**\n1. Capacity utilization optimization\n2. Customer acquisition cost reduction\n3. Technical talent retention\n\n**Value Proposition:**\nPosition your services around operational efficiency and scalable growth, not just cost savings.\n\nWould you like me to generate an email sequence for this approach?`,
    action: {
      label: 'Generate Email Sequence Workflow',
    },
  },
];

export const ChatSidebar = () => {
  const { isOpen, isExpanded } = useChatContext();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContextDropdown, setShowContextDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I understand your question. Based on the current context of the 3D Printing Service Providers Report, I can provide detailed insights. Let me analyze the relevant sections and get back to you with specific recommendations.",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 2000);
  };

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
  };

  const handleNewChat = () => {
    setMessages([]);
    setShowHistory(false);
  };

  const sidebarWidth = isExpanded ? 700 : 500;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: sidebarWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed right-0 top-0 h-screen bg-card border-l border-border chat-shadow-lg flex flex-col z-40 overflow-hidden"
        >
          <div className="relative flex flex-col h-full">
            <ChatHeader
              onSettingsClick={() => setShowSettings(true)}
              onHistoryClick={() => setShowHistory(true)}
              onContextClick={() => setShowContextDropdown(true)}
              onNewChat={handleNewChat}
            />

            <div className="relative">
              <ContextDropdown
                isOpen={showContextDropdown}
                onClose={() => setShowContextDropdown(false)}
              />
            </div>

            {messages.length === 0 && (
              <SuggestedQuestions onQuestionClick={handleQuestionClick} />
            )}

            <ChatMessages messages={messages} isTyping={isTyping} />
            <div ref={messagesEndRef} />

            {messages.length > 0 && (
              <div className="px-4 pb-2">
                <SuggestedQuestions onQuestionClick={handleQuestionClick} />
              </div>
            )}

            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              disabled={isTyping}
            />

            <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <ChatHistoryPanel
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              onNewChat={handleNewChat}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
