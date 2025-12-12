import React from 'react';
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AIAnalysisCardProps {
  summary: string;
  keyPoints: string[];
  tags: string[];
  onExplain?: () => void;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  summary,
  keyPoints,
  tags,
  onExplain
}) => {
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <BrainCircuit size={80} className="text-indigo-600" />
      </div>

      <div className="p-5 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-indigo-600 text-white p-1 rounded-md">
            <Sparkles size={14} />
          </div>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">AI Insight</span>
        </div>

        <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
          {summary}
        </p>

        {keyPoints.length > 0 && (
          <div className="mb-4 space-y-2">
            {keyPoints.map((point, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
                <span className="text-xs text-gray-600 leading-snug">{point}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] bg-white border border-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        <Button 
          variant="primary" 
          size="sm" 
          fullWidth 
          className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
          onClick={onExplain}
          rightIcon={<ArrowRight size={14} />}
        >
          Explain Deeper
        </Button>
      </div>
    </Card>
  );
};

export default AIAnalysisCard;