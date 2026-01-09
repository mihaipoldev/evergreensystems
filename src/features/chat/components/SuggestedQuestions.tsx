"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

const suggestions = [
  'Why is the fit score only 68/100?',
  'What are the biggest red flags?',
  'How should I position my offer?',
  'Compare this niche to AI/ML Consulting',
  'What are the best list sources?',
];

export const SuggestedQuestions = ({ onQuestionClick }: SuggestedQuestionsProps) => {
  return (
    <div className="flex-shrink-0 mx-4 my-3 p-3 bg-muted/50 rounded-lg border border-border/50">
      <div className="flex items-center gap-2 mb-2.5">
        <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Suggested Questions</span>
      </div>
      <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pb-1 -mx-1 px-1">
        {suggestions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border rounded-full transition-all hover:shadow-sm whitespace-nowrap flex-shrink-0"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

