import React, { useState } from 'react';
import { Download, Share2, Maximize2, X, Wand2 } from 'lucide-react';
import Modal from '../ui/Modal';

interface ImageAttachmentProps {
  url: string;
  title?: string;
}

const ImageAttachment: React.FC<ImageAttachmentProps> = ({ url, title = "AI Generated Image" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Logic to download image
    const link = document.createElement('a');
    link.href = url;
    link.download = `news-ai-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm hover:shadow-md transition-all">
        {/* Header Badge */}
        <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/20">
            <Wand2 size={10} className="text-purple-300" />
            AI Visual
        </div>

        {/* Image */}
        <div className="aspect-video relative cursor-pointer" onClick={() => setIsExpanded(true)}>
            <img src={url} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-transform hover:scale-110">
                    <Maximize2 size={20} />
                </button>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-2.5 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500 truncate max-w-[120px]">{title}</span>
            <div className="flex gap-1">
                <button onClick={handleDownload} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors" title="Download">
                    <Download size={16} />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors" title="Share">
                    <Share2 size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-in fade-in duration-200">
            <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setIsExpanded(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
                    <X size={24} />
                </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
                <img src={url} alt={title} className="max-w-full max-h-full rounded-lg shadow-2xl" />
            </div>
            <div className="p-6 flex justify-center gap-4">
                <button onClick={handleDownload} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                    <Download size={20} /> Download High-Res
                </button>
            </div>
        </div>
      )}
    </>
  );
};

export default ImageAttachment;