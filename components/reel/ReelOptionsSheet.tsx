import React from 'react';
import Sheet from '../ui/Sheet';
import { ThumbsDown, ThumbsUp, BellOff, Flag, EyeOff, Layers } from 'lucide-react';

interface ReelOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  source: string;
}

const ReelOptionsSheet: React.FC<ReelOptionsSheetProps> = ({ isOpen, onClose, category, source }) => {
  const options = [
    { 
      id: 'more', 
      label: 'Show more like this', 
      icon: ThumbsUp, 
      color: 'text-green-600 bg-green-50',
      desc: 'We will show more stories about ' + category 
    },
    { 
      id: 'less', 
      label: 'Not interested', 
      icon: ThumbsDown, 
      color: 'text-red-500 bg-red-50',
      desc: 'We will show fewer stories like this' 
    },
    { 
      id: 'mute_cat', 
      label: `Mute ${category}`, 
      icon: Layers, 
      color: 'text-gray-600 bg-gray-100',
      desc: 'Stop seeing news from this category' 
    },
    { 
      id: 'mute_source', 
      label: `Mute ${source}`, 
      icon: BellOff, 
      color: 'text-gray-600 bg-gray-100',
      desc: 'Stop seeing news from this publisher' 
    },
    { 
      id: 'report', 
      label: 'Report Issue', 
      icon: Flag, 
      color: 'text-orange-600 bg-orange-50',
      desc: 'Inappropriate content or misinformation' 
    }
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Personalize Feed">
      <div className="space-y-1 pb-4">
        {options.map((opt) => {
            const Icon = opt.icon;
            return (
                <button 
                    key={opt.id} 
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left group active:scale-[0.98]"
                    onClick={() => {
                        // Mock action
                        console.log('Selected option:', opt.id);
                        onClose();
                    }}
                >
                    <div className={`p-3 rounded-full ${opt.color} group-hover:scale-110 transition-transform`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-900">{opt.label}</span>
                        <span className="block text-xs text-gray-500">{opt.desc}</span>
                    </div>
                </button>
            )
        })}
      </div>
    </Sheet>
  );
};

export default ReelOptionsSheet;