import React, { useState } from 'react';
import { Download, Edit2, ZoomIn, ZoomOut, Share2, Volume2, Type, Eye } from 'lucide-react';
import Button from '../ui/Button';
import { NewspaperSettings } from './NewspaperTemplate';

interface NewspaperControlsProps {
  onDownload: () => void;
  onEdit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onShare?: () => void;
  onRead?: () => void;
  settings: NewspaperSettings;
  onSettingsChange: (newSettings: NewspaperSettings) => void;
}

const NewspaperControls: React.FC<NewspaperControlsProps> = ({
  onDownload,
  onEdit,
  onZoomIn,
  onZoomOut,
  onShare,
  onRead,
  settings,
  onSettingsChange
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const toggleSetting = (key: keyof NewspaperSettings, value: any) => {
      onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col gap-3">
        {/* Expanded Settings Panel */}
        {showSettings && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Settings</span>
                    <button onClick={() => setShowSettings(false)} className="text-xs text-blue-600 dark:text-blue-400 font-bold">Done</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold">Size</label>
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {['sm', 'md', 'lg'].map((s) => (
                                <button 
                                    key={s}
                                    onClick={() => toggleSetting('fontSize', s)}
                                    className={`flex-1 py-1 text-[10px] font-bold rounded ${settings.fontSize === s ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    {s === 'sm' ? 'A' : s === 'md' ? 'A+' : 'A++'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold">Spacing</label>
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {['compact', 'comfortable', 'loose'].map((s) => (
                                <button 
                                    key={s}
                                    onClick={() => toggleSetting('spacing', s)}
                                    className={`flex-1 py-1 text-[10px] font-bold rounded ${settings.spacing === s ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    {s === 'compact' ? '1.0' : s === 'comfortable' ? '1.5' : '2.0'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold">Font</label>
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button 
                                onClick={() => toggleSetting('font', 'serif')}
                                className={`flex-1 py-1 text-[10px] font-serif font-bold rounded ${settings.font === 'serif' ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                T
                            </button>
                            <button 
                                onClick={() => toggleSetting('font', 'sans')}
                                className={`flex-1 py-1 text-[10px] font-sans font-bold rounded ${settings.font === 'sans' ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                S
                            </button>
                            <button 
                                onClick={() => toggleSetting('font', 'dyslexic')}
                                className={`flex-1 py-1 text-[10px] font-bold rounded ${settings.font === 'dyslexic' ? 'bg-white dark:bg-gray-600 shadow text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                title="Dyslexia Friendly"
                            >
                                <Eye size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Main Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0 transition-colors">
        <div className="flex gap-2 w-full md:w-auto">
            <Button 
                variant="secondary" 
                size="sm" 
                onClick={onEdit}
                leftIcon={<Edit2 size={16} />}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
            Edit
            </Button>
            <Button 
                variant="secondary" 
                size="sm" 
                onClick={onRead}
                leftIcon={<Volume2 size={16} />}
                className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
            Listen
            </Button>
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg border transition-colors ${showSettings ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
                title="Appearance Settings"
            >
                <Type size={18} />
            </button>
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto justify-between md:justify-end">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button onClick={onZoomOut} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors text-gray-600 dark:text-gray-300"><ZoomOut size={16} /></button>
                <div className="w-[1px] bg-gray-300 dark:bg-gray-600 my-1 mx-1"></div>
                <button onClick={onZoomIn} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors text-gray-600 dark:text-gray-300"><ZoomIn size={16} /></button>
            </div>
            
            <div className="flex gap-2">
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={onShare}
                    className="w-10 px-0 flex justify-center dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                    <Share2 size={16} />
                </Button>
                <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={onDownload}
                    leftIcon={<Download size={16} />}
                    className="bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                    PDF
                </Button>
            </div>
        </div>
        </div>
    </div>
  );
};

export default NewspaperControls;