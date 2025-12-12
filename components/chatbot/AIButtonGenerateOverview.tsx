import React from 'react';
import { Sparkles, BarChart2, Zap } from 'lucide-react';
import Button from '../ui/Button';

interface AIButtonGenerateOverviewProps {
  onClick: () => void;
  isLoading?: boolean;
}

const AIButtonGenerateOverview: React.FC<AIButtonGenerateOverviewProps> = ({ onClick, isLoading }) => {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[position:right_center] transition-all duration-500 text-white shadow-lg shadow-indigo-500/30 border border-white/20 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      <div className="relative flex items-center gap-2">
        <Sparkles size={16} className="text-yellow-300 animate-pulse" />
        <span className="font-semibold">Generate Today's News Overview</span>
        <BarChart2 size={16} className="opacity-70" />
      </div>
    </Button>
  );
};

export default AIButtonGenerateOverview;
