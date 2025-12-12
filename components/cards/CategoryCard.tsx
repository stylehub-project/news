import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  label: string;
  gradient: string;
  icon?: React.ReactNode;
  count?: number;
  onClick?: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  label,
  gradient,
  icon,
  count,
  onClick
}) => {
  return (
    <div 
      onClick={() => onClick?.(id)}
      className={`relative h-28 rounded-2xl ${gradient} p-4 text-white overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
    >
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md w-fit">
            {icon}
          </div>
          {count !== undefined && (
            <span className="text-[10px] font-medium bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {count}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">{label}</span>
          <ChevronRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </div>

      {/* Decor */}
      <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12 scale-150">
        {icon}
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
    </div>
  );
};

export default CategoryCard;