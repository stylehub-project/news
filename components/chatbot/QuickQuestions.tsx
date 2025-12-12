import React from 'react';
import { Sparkles } from 'lucide-react';

interface QuickQuestionsProps {
  onSelect: (q: string) => void;
}

const QUESTIONS = [
  "Summarize today's top stories",
  "Explain Quantum Computing",
  "Create a flowchart for legislation",
  "Show me a graph of Tech stocks",
  "Generate newspaper layout",
  "Teach me about AI (Notebook Mode)"
];

const QuickQuestions: React.FC<QuickQuestionsProps> = ({ onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-3 px-4 scrollbar-hide shrink-0">
      {QUESTIONS.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-100 rounded-full text-xs font-medium text-indigo-700 whitespace-nowrap hover:bg-indigo-50 transition-colors shadow-sm active:scale-95"
        >
          <Sparkles size={10} className="text-indigo-400" />
          {q}
        </button>
      ))}
    </div>
  );
};
export default QuickQuestions;