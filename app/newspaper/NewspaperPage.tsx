import React from 'react';
import { Layout, PenTool, Download, RefreshCw } from 'lucide-react';

const NewspaperPage: React.FC = () => {
  return (
    <div className="p-4 space-y-6 pb-24">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold font-serif">AI Daily Edition</h1>
            <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <Download size={16} /> Export
            </button>
        </header>

        {/* Controls */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {['Classic', 'Modern', 'Minimal', 'Tabloid'].map(style => (
                <button key={style} className="px-4 py-2 border rounded-full text-sm hover:bg-gray-100 whitespace-nowrap">
                    {style}
                </button>
            ))}
        </div>

        {/* Canvas Skeleton */}
        <div className="w-full aspect-[3/4] bg-white border shadow-2xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="border-b-4 border-black pb-4 mb-4 text-center">
                <h2 className="text-4xl font-black uppercase tracking-widest font-serif">The Daily AI</h2>
                <div className="flex justify-between text-xs mt-2 border-t border-black pt-1 font-mono">
                    <span>VOL. 1</span>
                    <span>{new Date().toLocaleDateString()}</span>
                    <span>$0.00</span>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-2 gap-4 h-3/4">
                <div className="col-span-2 h-40 bg-gray-200 rounded animate-pulse relative">
                     <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <PenTool className="mr-2" /> Generative Image...
                     </div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                 <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                 <div className="col-span-2 h-32 bg-gray-100 rounded p-4 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-blue-600">
                        <RefreshCw className="animate-spin" />
                        <span className="font-mono text-sm">AI Writer drafting content...</span>
                    </div>
                 </div>
            </div>
            
            {/* Live Writing Effect */}
            <div className="absolute bottom-4 right-4 bg-yellow-300 text-black text-xs font-bold px-2 py-1 rotate-[-5deg] shadow-lg">
                LIVE GENERATION
            </div>
        </div>
    </div>
  );
};

export default NewspaperPage;