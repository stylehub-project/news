
import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, FileText, Image as ImageIcon, BookOpen, Mic, Layout, Eye, EyeOff, Check, RefreshCw, PenTool, X, ChevronRight, PlayCircle, Settings, Sliders, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { processSipsContent, SipsContent } from '../../utils/sipsService';
import SipsPlayer from './SipsPlayer';
import SmartLoader from '../../components/loaders/SmartLoader';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
];

const MODES = ['Summary', 'Detailed', 'Kids', 'Headline'];

const SipsDashboard: React.FC = () => {
  const [content, setContent] = useState<SipsContent | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'link' | 'image' | 'topic'>('topic');
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentMode, setStudentMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Settings
  const [language, setLanguage] = useState('English');
  const [presentationMode, setPresentationMode] = useState('Detailed');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Drag and Drop
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Reading State
  const [activeIndex, setActiveIndex] = useState(-1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
          let input = inputValue;
          let type: any = inputMode;

          if (inputMode === 'image') {
              if (!file) {
                  setErrorMsg("Please select an image first.");
                  setIsLoading(false);
                  return;
              }
              const reader = new FileReader();
              const promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => resolve(reader.result as string);
              });
              reader.readAsDataURL(file);
              const base64 = await promise;
              input = base64.split(',')[1];
          } else if (!input.trim()) {
              setErrorMsg("Please enter some content.");
              setIsLoading(false);
              return;
          }

          const result = await processSipsContent(input, type, language, presentationMode, advancedMode);
          setContent(result);
      } catch (e: any) {
          console.error(e);
          setErrorMsg(e.message || "Failed to process content. The AI service may be temporarily unavailable.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleReset = () => {
      setContent(null);
      setInputValue('');
      setFile(null);
      setActiveIndex(-1);
      setErrorMsg(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
          setErrorMsg(null);
      }
  };

  const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
          setIsDragActive(true);
      } else if (e.type === "dragleave") {
          setIsDragActive(false);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          setInputMode('image'); // Switch mode automatically
          setFile(e.dataTransfer.files[0]);
          setErrorMsg(null);
      }
  };

  const sentences = content ? (content.fullText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [content.fullText]) : [];

  return (
    <div className={`h-full flex flex-col bg-[#0f172a] text-white overflow-hidden transition-all duration-500 ${studentMode ? 'p-0' : 'p-4 md:p-6'}`}>
        
        {/* Top Control Bar (Hidden in Student Mode) */}
        {!studentMode && (
            <div className="max-w-6xl mx-auto w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shrink-0 z-20 relative">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                        <BookOpen size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tight leading-none">SIPS</h1>
                        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mt-1">Smart Lesson Architect</p>
                    </div>
                </div>

                <div className="flex flex-1 w-full md:w-auto justify-center">
                    <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/5 overflow-x-auto max-w-full">
                        {[
                            {id: 'topic', icon: PenTool, label: 'Topic'}, 
                            {id: 'link', icon: LinkIcon, label: 'Link'}, 
                            {id: 'text', icon: FileText, label: 'Text'}, 
                            {id: 'image', icon: ImageIcon, label: 'Image'}
                        ].map((m) => {
                            const Icon = m.icon;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setInputMode(m.id as any);
                                        setFile(null);
                                        setInputValue('');
                                        setErrorMsg(null);
                                    }}
                                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${inputMode === m.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                                    title={m.label}
                                >
                                    <Icon size={16} />
                                    <span className="text-xs font-bold hidden sm:inline capitalize">{m.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end relative">
                    {/* Settings Toggle */}
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors border ${showSettings ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <Settings size={18} />
                    </button>

                    {/* Settings Popover */}
                    {showSettings && (
                        <div className="absolute top-12 right-0 bg-gray-900 border border-gray-700 rounded-xl p-4 w-64 shadow-2xl z-50 animate-in slide-in-from-top-2 fade-in">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                <Sliders size={12} /> Teacher Controls
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold block mb-1">Language</label>
                                    <select 
                                        value={language} 
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                                    >
                                        {LANGUAGES.map(l => <option key={l.code} value={l.label}>{l.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold block mb-1">Mode</label>
                                    <select 
                                        value={presentationMode}
                                        onChange={(e) => setPresentationMode(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                                    >
                                        {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>

                                {/* Advanced Mode Toggle */}
                                <div className="flex items-center justify-between border-t border-gray-800 pt-2">
                                    <label className="text-xs font-bold text-gray-300">Advanced Mode</label>
                                    <button 
                                        onClick={() => setAdvancedMode(!advancedMode)}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${advancedMode ? 'bg-indigo-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${advancedMode ? 'left-5' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-500 -mt-2">Retain technical jargon & complex terms.</p>

                                {/* Voice Controls */}
                                <div className="border-t border-gray-800 pt-2 space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-[10px] text-gray-500 font-bold">Voice Speed</label>
                                        <span className="text-[10px] text-indigo-400">{voiceSpeed.toFixed(1)}x</span>
                                    </div>
                                    <input 
                                        type="range" min="0.5" max="2" step="0.1" 
                                        value={voiceSpeed} onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    
                                    <div className="flex justify-between">
                                        <label className="text-[10px] text-gray-500 font-bold">Pitch</label>
                                        <span className="text-[10px] text-indigo-400">{voicePitch.toFixed(1)}</span>
                                    </div>
                                    <input 
                                        type="range" min="0.5" max="2" step="0.1" 
                                        value={voicePitch} onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {content && (
                        <button 
                            onClick={() => setStudentMode(true)} 
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg font-bold text-xs hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
                        >
                            <PlayCircle size={16} /> <span className="hidden sm:inline">Start Class</span>
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* Main Content Area - Center Smart Panel */}
        <div className="flex-1 flex flex-col overflow-hidden relative rounded-3xl border border-gray-800 bg-[#0a0a0a] shadow-2xl max-w-6xl mx-auto w-full">
            
            {/* Input Panel (Hidden when content loaded or in student mode) */}
            {!content && !isLoading && (
                <div className="w-full h-full flex items-center justify-center p-6 md:p-12 overflow-y-auto">
                    <div className="max-w-2xl w-full space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                                What are we teaching today?
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base">Upload content to generate an interactive lesson plan instantly.</p>
                        </div>
                        
                        <div 
                            className={`bg-gray-900/50 p-6 md:p-8 rounded-3xl border transition-all duration-300 shadow-inner ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-800'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {inputMode === 'image' ? (
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full h-48 md:h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${file ? 'border-emerald-500/50 bg-emerald-500/5' : isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleFileSelect} 
                                        />
                                        
                                        {file ? (
                                            <div className="text-center space-y-3">
                                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                                    <Check size={32} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-emerald-400">{file.name}</p>
                                                    <p className="text-xs text-emerald-500/70 mt-1">{(file.size / 1024).toFixed(1)} KB • Ready to process</p>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                    className="text-xs text-gray-500 hover:text-white underline mt-2"
                                                >
                                                    Remove Image
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-3 group-hover:scale-105 transition-transform pointer-events-none">
                                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                                    <Upload size={32} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-300">
                                                        {isDragActive ? "Drop image here" : "Click to upload image"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Fallback button for mobile users where drag/click area might be tricky */}
                                    {!file && (
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-300 border border-gray-700 transition-colors"
                                        >
                                            Browse Files
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={
                                        inputMode === 'link' ? "Paste any article or website URL..." : 
                                        inputMode === 'topic' ? "Enter a topic (e.g. 'Photosynthesis', 'World War II')..." :
                                        "Paste text content here..."
                                    }
                                    className="w-full h-48 md:h-64 bg-black/30 rounded-2xl border border-gray-700 p-6 text-base md:text-lg text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none resize-none leading-relaxed transition-all"
                                />
                            )}

                            {errorMsg && (
                                <div className="mt-4 flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                                    <AlertCircle size={14} /> {errorMsg}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <Button 
                                    size="lg" 
                                    onClick={handleProcess}
                                    disabled={(!inputValue && !file) || isLoading}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 text-base shadow-xl shadow-indigo-900/20 w-full md:w-auto rounded-xl"
                                    rightIcon={isLoading ? <RefreshCw className="animate-spin" /> : <ChevronRight />}
                                >
                                    {isLoading ? "Analyzing..." : "Generate Lesson"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
                    <SmartLoader message="AI is preparing your lesson plan..." />
                </div>
            )}

            {/* Presentation View */}
            {content && (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center bg-[#050505]">
                    
                    {/* Student Mode Exit Button */}
                    {studentMode && (
                        <button 
                            onClick={() => setStudentMode(false)}
                            className="fixed top-6 right-6 bg-gray-900/80 hover:bg-gray-800 p-3 rounded-full text-gray-400 hover:text-white transition-all z-50 backdrop-blur-md border border-white/10 shadow-xl group"
                            title="Exit Presentation Mode"
                        >
                            <EyeOff size={20} />
                            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Exit Mode</span>
                        </button>
                    )}

                    <div className="max-w-5xl w-full py-12 px-6 md:px-12 space-y-16 pb-40">
                        {/* Header */}
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                                <BookOpen size={12} /> {presentationMode} Overview {advancedMode && '(Advanced)'}
                            </div>
                            <h1 className="text-4xl md:text-7xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-sm">
                                {content.headline}
                            </h1>
                            <p className="text-lg md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed">
                                {content.summary}
                            </p>
                        </div>

                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent mx-auto opacity-50"></div>

                        {/* Reading Content */}
                        <div className="text-xl md:text-3xl leading-loose font-medium text-gray-300 max-w-4xl mx-auto font-serif tracking-wide">
                            {sentences.map((sentence, idx) => (
                                <span 
                                    key={idx}
                                    className={`transition-all duration-500 px-1 py-0.5 rounded cursor-pointer hover:bg-white/5 hover:text-white ${idx === activeIndex ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] scale-[1.02] inline-block transform' : 'opacity-80'}`}
                                    onClick={() => setActiveIndex(idx)}
                                >
                                    {sentence}{' '}
                                </span>
                            ))}
                        </div>

                        {/* Key Terms */}
                        {content.keyTerms.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                                {content.keyTerms.map((term, i) => (
                                    <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-colors group">
                                        <h3 className="text-xl font-bold text-indigo-400 mb-3 group-hover:text-indigo-300">{term.term}</h3>
                                        <p className="text-base text-gray-400 leading-relaxed group-hover:text-gray-300">{term.definition}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quiz Section */}
                        {content.quiz.length > 0 && !studentMode && (
                            <div className="bg-gradient-to-br from-gray-900 to-gray-900 rounded-3xl p-8 md:p-10 border border-gray-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 bg-indigo-600/10 blur-[100px] rounded-full w-64 h-64 pointer-events-none"></div>
                                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Check size={24}/></div> 
                                    Knowledge Check
                                </h3>
                                <div className="space-y-8 relative z-10">
                                    {content.quiz.map((q, i) => (
                                        <div key={i} className="space-y-4">
                                            <p className="text-lg font-bold text-white">{i+1}. {q.question}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {q.options.map((opt, oi) => (
                                                    <div key={oi} className={`p-4 rounded-xl border text-center font-medium text-sm transition-all ${opt === q.answer ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-black/40 border-gray-800 text-gray-500'}`}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {!studentMode && (
                            <div className="flex justify-center pt-12 pb-8">
                                <Button 
                                    onClick={handleReset} 
                                    variant="secondary" 
                                    className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 px-8"
                                >
                                    Process New Source
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Player */}
        {content && (
            <SipsPlayer 
                text={content.fullText} 
                onHighlight={setActiveIndex} 
                onComplete={() => setActiveIndex(-1)} 
                voiceLang={language === 'Hindi' ? 'hi-IN' : language === 'Spanish' ? 'es-ES' : language === 'French' ? 'fr-FR' : 'en-US'}
                speed={voiceSpeed}
                pitch={voicePitch}
            />
        )}
    </div>
  );
};

export default SipsDashboard;
