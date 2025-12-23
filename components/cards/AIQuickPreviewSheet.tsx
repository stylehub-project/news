
import React, { useEffect, useState } from 'react';
import Sheet from '../ui/Sheet';
import { Sparkles, ArrowRight, BrainCircuit, Zap } from 'lucide-react';
import Button from '../ui/Button';

interface AIQuickPreviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  article?: {
      title: string;
      description: string;
      source: string;
  };
  onFullAnalysis: () => void;
}

const AIQuickPreviewSheet: React.FC<AIQuickPreviewSheetProps> = ({ isOpen, onClose, article, onFullAnalysis }) => {
  const [analysis, setAnalysis] = useState<{summary: string, impact: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (isOpen && article && !analysis) {
          generateQuickPreview(article.title, article.description);
      }
      if (!isOpen) {
          setAnalysis(null); // Reset on close
      }
  }, [isOpen, article]);

  const generateQuickPreview = async (title: string, desc: string) => {
      setLoading(true);
      try {
          // In a real app, this would be a light API call.
          // For immediate responsiveness on "Long Press", we simulate a fast cache hit or quick generation.
          setTimeout(() => {
              setAnalysis({
                  summary: desc.length > 50 ? desc : "This story is developing. Key sources indicate significant market shifts and potential policy updates.",
                  impact: "High relevance to your Technology interests. Potential volatility in related stocks expected."
              });
              setLoading(false);
          }, 800); // Fast simulation

      } catch (e) {
          setLoading(false);
      }
  };

  if (!article) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Quick AI Glance">
      <div className="space-y-5 pb-4">
        
        {/* Header Pulse */}
        <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <div className="p-2 bg-white dark:bg-indigo-800 rounded-full shadow-sm">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">AI Intelligence</h4>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300">Generated in 0.4s</p>
            </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-2">{article.title}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase">{article.source}</p>
            </div>

            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-3">
                        <div className="mt-1"><BrainCircuit size={16} className="text-gray-400" /></div>
                        <div>
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-200 block mb-1">Summary</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{analysis?.summary}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="mt-1"><Zap size={16} className="text-yellow-500 fill-yellow-500" /></div>
                        <div>
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-200 block mb-1">Impact</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{analysis?.impact}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2">
            <Button 
                fullWidth 
                variant="primary" 
                onClick={onFullAnalysis}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-200"
                rightIcon={<ArrowRight size={16} />}
            >
                Open Full Chat Analysis
            </Button>
        </div>
      </div>
    </Sheet>
  );
};

export default AIQuickPreviewSheet;
