import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const autocompleteSuggestions = [
  'What are the red flags for this niche?',
  'What are the best list sources?',
  'What are the main competitors?',
  'What are the pricing trends?',
];

export const ChatInput = ({ value, onChange, onSend, disabled }: ChatInputProps) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 2000;

  useEffect(() => {
    if (value.length > 5) {
      const filtered = autocompleteSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setShowAutocomplete(false);
    }
  }, [value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowAutocomplete(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex-shrink-0 border-t border-border p-4 bg-card relative">
      <AnimatePresence>
        {showAutocomplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="absolute right-3 top-1 text-xs text-muted-foreground">
          {value.length}/{maxChars}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          disabled={disabled}
          className="w-full min-h-[44px] max-h-[120px] pr-12 pt-6 pb-3 px-4 bg-muted/50 border border-border rounded-xl resize-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          rows={1}
        />
        <Button
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
