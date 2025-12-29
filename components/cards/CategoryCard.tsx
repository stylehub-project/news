
import React, { useRef } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';

interface CategoryCardProps {
  id: string;
  label: string;
  gradient: string;
  icon: React.ReactNode;
  trending?: boolean;
  onClick: (id: string) => void;
  onLongPress?: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  label,
  gradient,
  icon,
  trending,
  onClick,
  onLongPress
}) => {
  const timerRef = useRef<any>(null);

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
        if(navigator.vibrate) navigator.vibrate(50);
        onLongPress?.(id);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div
      onClick={() => onClick(id)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart} // For desktop testing
      onMouseUp={handleTouchEnd}
      className={`relative h-32 rounded-2xl ${gradient} p-4 text-white overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group select-none border border-white/10`}
    >
        {/* Decor */}
        <div className="absolute -bottom-6 -right-6 opacity-20 rotate-12 scale-[2.5] transition-transform group-hover:rotate-6">
            {icon}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">
                    {icon}
                </div>
                {trending && (
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-sm">
                        <Sparkles size={10} className="text-yellow-300 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Hot</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <span className="font-bold text-xl tracking-tight shadow-black drop-shadow-md">{label}</span>
                <div className="p-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <ChevronRight size={16} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default CategoryCard;
