import React from 'react';
import Sheet from '../ui/Sheet';
import { Copy, MessageCircle, Twitter, Facebook, Mail, Share2 } from 'lucide-react';

interface ReelShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReelShareSheet: React.FC<ReelShareSheetProps> = ({ isOpen, onClose }) => {
  const options = [
    { icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-500' },
    { icon: Twitter, label: 'X / Twitter', color: 'bg-black' },
    { icon: Facebook, label: 'Facebook', color: 'bg-blue-600' },
    { icon: Mail, label: 'Email', color: 'bg-red-500' },
    { icon: Copy, label: 'Copy Link', color: 'bg-gray-600' },
    { icon: Share2, label: 'More', color: 'bg-gray-400' },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Share Story">
      <div className="grid grid-cols-4 gap-4 py-4">
        {options.map((opt, i) => {
            const Icon = opt.icon;
            return (
                <button key={i} className="flex flex-col items-center gap-2 group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-active:scale-95 ${opt.color}`}>
                        <Icon size={24} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{opt.label}</span>
                </button>
            )
        })}
      </div>
    </Sheet>
  );
};

export default ReelShareSheet;