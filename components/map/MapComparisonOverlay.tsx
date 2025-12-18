import React from 'react';
import { X, TrendingUp, Users, AlertTriangle } from 'lucide-react';

interface ComparisonData {
  id: string;
  name: string;
  sentiment: string;
  volume: number;
  momentum: string;
}

interface MapComparisonOverlayProps {
  itemA: ComparisonData | null;
  itemB: ComparisonData | null;
  onClose: () => void;
}

const MapComparisonOverlay: React.FC<MapComparisonOverlayProps> = ({ itemA, itemB, onClose }) => {
  return (
    <div className="absolute bottom-20 left-4 right-4 z-30 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full z-10">
            <X size={14} />
        </button>

        <div className="text-center py-2 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Regional Comparison</h3>
        </div>

        <div className="flex divide-x divide-gray-100">
            {/* Left Side */}
            <div className="flex-1 p-4">
                {itemA ? (
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 truncate">{itemA.name}</h4>
                        <div className="space-y-2">
                            <StatRow label="Sentiment" value={itemA.sentiment} color={itemA.sentiment === 'Positive' ? 'text-green-600' : 'text-red-600'} />
                            <StatRow label="Volume" value={itemA.volume.toString()} />
                            <StatRow label="Momentum" value={itemA.momentum} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">Select Point A</div>
                )}
            </div>

            {/* VS Badge */}
            <div className="relative w-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white z-10 shadow-sm">
                    VS
                </div>
            </div>

            {/* Right Side */}
            <div className="flex-1 p-4">
                {itemB ? (
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 truncate">{itemB.name}</h4>
                        <div className="space-y-2">
                            <StatRow label="Sentiment" value={itemB.sentiment} color={itemB.sentiment === 'Positive' ? 'text-green-600' : 'text-red-600'} />
                            <StatRow label="Volume" value={itemB.volume.toString()} />
                            <StatRow label="Momentum" value={itemB.momentum} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">Select Point B</div>
                )}
            </div>
        </div>

        {itemA && itemB && (
            <div className="bg-indigo-50 p-3 text-center border-t border-indigo-100">
                <p className="text-xs text-indigo-800 font-medium">
                    <SparklesIcon /> AI: {itemA.name} shows higher stability than {itemB.name}.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

const StatRow = ({ label, value, color = 'text-gray-800' }: { label: string, value: string, color?: string }) => (
    <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 uppercase font-bold">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
);

const SparklesIcon = () => (
    <svg className="w-3 h-3 inline-block mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
);

export default MapComparisonOverlay;