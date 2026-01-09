import { motion } from 'framer-motion';

interface Question {
  id: string;
  icon: string;
  text: string;
  gradient: string;
}

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const questions: Question[] = [
  {
    id: '1',
    icon: '⚠️',
    text: 'What are the biggest red flags I should know about this market?',
    gradient: 'from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30',
  },
  {
    id: '2',
    icon: '📊',
    text: 'Why is the fit score only 68/100? What\'s dragging it down?',
    gradient: 'from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30',
  },
  {
    id: '3',
    icon: '💰',
    text: 'What\'s the realistic CPL I should expect for this niche?',
    gradient: 'from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30',
  },
  {
    id: '4',
    icon: '🎯',
    text: 'How should I position my offer to stand out from competitors?',
    gradient: 'from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30',
  },
  {
    id: '5',
    icon: '📈',
    text: 'What are the top 3 growth opportunities in this space?',
    gradient: 'from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30',
  },
  {
    id: '6',
    icon: '🔍',
    text: 'Who are the key players and what can I learn from them?',
    gradient: 'from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30',
  },
];

export const SuggestedQuestions = ({ onSelectQuestion }: SuggestedQuestionsProps) => {
  return (
    <div className="px-4 py-3">
      <motion.h3
        className="text-sm font-semibold gradient-text mb-3 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span>💡</span>
        <span>Start a conversation</span>
      </motion.h3>

      <div className="grid grid-cols-1 gap-2">
        {questions.map((question, index) => (
          <motion.button
            key={question.id}
            onClick={() => onSelectQuestion(question.text)}
            className={`w-full text-left p-3 rounded-xl bg-gradient-to-br ${question.gradient} border border-border/50 transition-all duration-200 group`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <motion.span
                className="text-xl"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {question.icon}
              </motion.span>
              <span className="text-sm font-medium text-foreground leading-relaxed">
                {question.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
