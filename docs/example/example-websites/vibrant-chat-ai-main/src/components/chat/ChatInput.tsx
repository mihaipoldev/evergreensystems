import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Mic } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const suggestions = [
  { icon: '📊', text: 'Show me a comparison chart' },
  { icon: '📧', text: 'Draft an outreach email' },
  { icon: '🔍', text: 'Deep dive into section 4' },
];

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 2000;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const progress = (message.length / maxLength) * 100;
  const circumference = 2 * Math.PI * 10;

  return (
    <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Autocomplete suggestions */}
      <AnimatePresence>
        {showSuggestions && message.length === 0 && (
          <motion.div
            className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => setMessage(suggestion.text)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50 text-xs font-medium whitespace-nowrap hover-lift"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <span>{suggestion.icon}</span>
                <span>{suggestion.text}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <motion.div
        className={`relative rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? 'border-primary/50 shadow-glow-sm'
            : 'border-border'
        }`}
        animate={isFocused ? { borderColor: 'hsl(262, 83%, 58%, 0.5)' } : {}}
      >
        {/* Gradient border animation when focused */}
        {isFocused && (
          <motion.div
            className="absolute -inset-[2px] rounded-2xl opacity-30 -z-10"
            style={{
              background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(172, 66%, 50%))',
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="flex items-end gap-2 p-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this report..."
            className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground min-h-[24px] max-h-[120px]"
            rows={1}
            maxLength={maxLength}
            disabled={disabled}
          />

          {/* Voice input button */}
          <motion.button
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Mic size={18} />
          </motion.button>

          {/* Send button with progress ring */}
          <div className="relative">
            {/* Progress ring */}
            {message.length > 0 && (
              <svg
                className="absolute -inset-1 w-12 h-12 progress-ring"
                viewBox="0 0 24 24"
              >
                <circle
                  className="text-muted/30"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="transparent"
                  r="10"
                  cx="12"
                  cy="12"
                />
                <motion.circle
                  className="text-primary progress-ring-circle"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="transparent"
                  r="10"
                  cx="12"
                  cy="12"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
                  strokeLinecap="round"
                />
              </svg>
            )}

            <motion.button
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                message.trim()
                  ? 'gradient-purple-blue text-white shadow-glow-sm'
                  : 'bg-muted text-muted-foreground'
              }`}
              whileHover={message.trim() ? { scale: 1.1, rotate: 15 } : {}}
              whileTap={message.trim() ? { scale: 0.9 } : {}}
              animate={message.trim() ? { 
                boxShadow: ['0 0 15px rgba(139, 92, 246, 0.3)', '0 0 25px rgba(139, 92, 246, 0.5)', '0 0 15px rgba(139, 92, 246, 0.3)']
              } : {}}
              transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
            >
              <ArrowUp size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Character count */}
      {message.length > maxLength * 0.8 && (
        <motion.p
          className={`text-xs mt-2 text-right ${
            message.length >= maxLength ? 'text-destructive' : 'text-muted-foreground'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {message.length}/{maxLength}
        </motion.p>
      )}
    </div>
  );
};
