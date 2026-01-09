import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Play } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { label: string; section: string }[];
  chart?: { name: string; value: number; color: string }[];
  actionButton?: { label: string; icon: string };
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

const chartData = [
  { name: 'Quality', value: 85, color: '#8B5CF6' },
  { name: 'Speed', value: 72, color: '#14B8A6' },
  { name: 'Price', value: 58, color: '#F97316' },
  { name: 'Support', value: 91, color: '#10B981' },
];

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <motion.div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                message.role === 'user'
                  ? 'gradient-purple-blue text-white'
                  : 'gradient-teal-blue'
              }`}
              whileHover={{ scale: 1.1 }}
              animate={message.role === 'assistant' ? { rotate: 360 } : {}}
              transition={message.role === 'assistant' ? { duration: 8, repeat: Infinity, ease: 'linear' } : {}}
            >
              {message.role === 'user' ? 'U' : '✨'}
            </motion.div>

            {/* Message bubble */}
            <div
              className={`${
                message.role === 'user'
                  ? 'chat-bubble-user px-4 py-3 shadow-md'
                  : 'chat-bubble-ai px-4 py-3 shadow-sm'
              }`}
            >
              <p className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white font-medium' : ''}`}>
                {message.content}
              </p>

              {/* Chart for AI messages */}
              {message.chart && (
                <motion.div
                  className="mt-4 bg-muted/30 rounded-lg p-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Performance Breakdown</p>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {message.sources.map((source, idx) => (
                    <motion.span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium gradient-purple-blue text-white cursor-pointer"
                      whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📄 {source.section}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Action button */}
              {message.actionButton && (
                <motion.button
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-purple-blue text-white font-semibold text-sm shadow-glow-sm"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    whileHover={{ rotate: 15, scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Play size={16} />
                  </motion.span>
                  {message.actionButton.label}
                </motion.button>
              )}

              {/* Timestamp */}
              <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const TypingIndicator = () => (
  <motion.div
    className="flex items-center gap-3 px-4 py-3"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <motion.div
      className="w-8 h-8 rounded-full gradient-teal-blue flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    >
      ✨
    </motion.div>
    <div className="chat-bubble-ai px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="typing-wave">
          <span />
          <span />
          <span />
        </div>
        <span className="text-xs text-muted-foreground">Claude is thinking...</span>
      </div>
    </div>
  </motion.div>
);
