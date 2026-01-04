
import React, { useState } from 'react';
import Sheet from '../ui/Sheet';
import { Thermometer, Wind, Droplets, Sparkles, Volume2, Pause, ArrowRight, BrainCircuit, ShieldAlert, Bookmark, Bell } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import Toast from '../ui/Toast';

interface MapNewsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const MapNewsSheet: React.FC<MapNewsSheetProps> = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!data) return null;

  const handlePlayAudio = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPlaying) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
      } else {
          const text = `Weather Alert for ${data.locationName}. ${data.title}. Current temperature ${data.temp}. ${data.description}`;
          const u = new SpeechSynthesisUtterance(text);
          u.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(u);
          setIsPlaying(true);
      }
  };

  const handleAlertToggle = () => {
      setShowToast(true);
  };

  // W4 - Weather News Card Layout
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Weather Intelligence">
      {showToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
              <Toast type="success" message="Alerts Enabled for this Region" onClose={() => setShowToast(false)} />
          </div>
      )}

      <div className="flex flex-col gap-4 pb-6">
        
        {/* Header Visual */}
        <div className="relative h-40 w-full rounded-2xl overflow-hidden shrink-0 group bg-gray-900">
            <img src={data.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Weather" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            
            {/* W4 - Listen Button */}
            <button 
                onClick={handlePlayAudio}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-95"
            >
                {isPlaying ? <Pause size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Title & Location */}
            <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${data.type === 'severe' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {data.type}
                    </span>
                    <span className="text-xs font-medium text-gray-300">{data.locationName}</span>
                </div>
                <h2 className="text-xl font-black leading-none drop-shadow-md">{data.title}</h2>
            </div>
        </div>

        {/* W4 - Conditions Grid */}
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col items-center">
                <Thermometer size={20} className="text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">Temp</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{data.temp}</span>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex flex-col items-center">
                <Wind size={20} className="text-indigo-600 dark:text-indigo-400 mb-1" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">Wind</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{data.wind}</span>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-xl border border-cyan-100 dark:border-cyan-800 flex flex-col items-center">
                <Droplets size={20} className="text-cyan-600 dark:text-cyan-400 mb-1" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">Precip</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">{data.precip}</span>
            </div>
        </div>

        {/* W5 - AI Analysis Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
            <Sparkles size={64} className="absolute -right-4 -bottom-4 text-indigo-200 dark:text-indigo-900 opacity-50" />
            <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">Why this matters</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed relative z-10">
                {data.description}
            </p>
        </div>

        {/* W4 - Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-auto">
            <button 
                onClick={() => navigate(`/ai-chat?context=weather&headline=${encodeURIComponent(data.title)}`)}
                className="col-span-2 bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/30"
            >
                <Sparkles size={16} className="text-yellow-300" /> AI Explain
            </button>
            <button className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Bookmark size={20} />
            </button>
            <button onClick={handleAlertToggle} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Bell size={20} />
            </button>
        </div>
      </div>
    </Sheet>
  );
};

export default MapNewsSheet;
