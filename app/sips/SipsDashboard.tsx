
import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, FileText, Image as ImageIcon, BookOpen, Mic, Layout, Eye, EyeOff, Check, RefreshCw, PenTool } from 'lucide-react';
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
  
  // Settings
  const [language, setLanguage] = useState('English');
  const [presentationMode, setPresentationMode] = useState('Detailed');
  
  // Reading State
  const [activeIndex, setActiveIndex] = useState(-1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
      setIsLoading(true);
      try {
          let input = inputValue;
          let type: any = inputMode;

          if (inputMode === 'image' && file) {
              const reader = new FileReader();
              const promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => resolve(reader.result as string);
              });
              reader.readAsDataURL(file);
              const base64 = await promise;
              input = base64.split(',')[1];
          }

          const result = await processSipsContent(input, type, language, presentationMode);
          setContent(result);
      } catch (e) {
          alert("Failed to process content");
      } finally {
          setIsLoading(false);
      }
  };

  const handleReset = () => {
      setContent(null);
      setInputValue('');
      setFile(null);
      setActiveIndex(-1);
  };

  const sentences = content ? (content.fullText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [content.fullText]) : [];

  return (
    <div className={`h-screen flex flex-col bg-[#0f172a] text-white overflow-hidden transition-all ${studentMode ? 'p-0' : 'p-4'}`}>
        
        {/* Top Control Bar (Hidden in Student Mode) */}
        {!studentMode && (
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-xl shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <BookOpen size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tight">SIPS Panel</h1>
                        <p className="text-xs text-gray-400 font-mono">Smart Interactive Presentation System</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-black/20 p-1 rounded-xl">
                    {[{id: 'topic', icon: PenTool}, {id: 'link', icon: LinkIcon}, {id: 'text', icon: FileText}, {id: 'image', icon: ImageIcon}].map((m) => {
                        const Icon = m.icon;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setInputMode(m.id as any)}
                                className={`p-2 rounded-lg transition-colors ${inputMode === m.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                title={m.id}
                            >
                                <Icon size={18} />
                            </button>
                        );
                    })}
                </div>

                <div className="flex gap-2">
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {LANGUAGES.map(l => <option key={l.code} value={l.label}>{l.label}</option>)}
                    </select>
                    <select 
                        value={presentationMode}
                        onChange={(e) => setPresentationMode(e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                <div className="flex gap-2">
                    {content && (
                        <button onClick={() => setStudentMode(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg font-bold text-sm hover:bg-green-500 transition-colors">
                            <Eye size={16} /> Present
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden gap-4 relative">
            
            {/* Input Panel (Hidden when content loaded or in student mode) */}
            {!content && !isLoading && (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-700">
                    <div className="max-w-md w-full space-y-6 text-center">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                            {inputMode === 'image' ? <ImageIcon size={40} className="text-indigo-400" /> : 
                             inputMode === 'link' ? <LinkIcon size={40} className="text-indigo-400" /> :
                             inputMode === 'text' ? <FileText size={40} className="text-indigo-400" /> :
                             <PenTool size={40} className="text-indigo-400" />}
                        </div>
                        
                        <h2 className="text-2xl font-bold">Upload Source Material</h2>
                        
                        {inputMode === 'image' ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 bg-gray-800 rounded-xl border border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                                <p className="text-sm text-gray-300 mb-2">Click to select image</p>
                                <span className="text-xs text-gray-500">{file ? file.name : "No file selected"}</span>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            </div>
                        ) : (
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={
                                    inputMode === 'url' ? "Paste website URL..." : 
                                    inputMode === 'topic' ? "Enter a topic (e.g. Solar System)..." :
                                    "Paste text content here..."
                                }
                                className="w-full h-32 bg-gray-800 rounded-xl border border-gray-600 p-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        )}

                        <Button 
                            fullWidth 
                            size="lg" 
                            onClick={handleProcess}
                            disabled={!inputValue && !file}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 text-lg shadow-xl shadow-indigo-900/20"
                        >
                            Generate Lesson
                        </Button>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50">
                    <SmartLoader message="AI Preparing Lesson..." />
                </div>
            )}

            {/* Presentation View */}
            {content && (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
                    
                    {/* Student Mode Exit Button */}
                    {studentMode && (
                        <button 
                            onClick={() => setStudentMode(false)}
                            className="fixed top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white/50 hover:text-white transition-colors z-50 backdrop-blur-md"
                        >
                            <EyeOff size={20} />
                        </button>
                    )}

                    <div className="max-w-4xl w-full py-8 px-4 md:px-12 space-y-12 pb-32">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest border border-indigo-500/30">
                                {presentationMode} Overview
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 drop-shadow-sm">
                                {content.headline}
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                                {content.summary}
                            </p>
                        </div>

                        <hr className="border-gray-800" />

                        {/* Reading Content */}
                        <div className="text-2xl md:text-3xl leading-relaxed font-medium space-y-8 text-gray-200">
                            {sentences.map((sentence, idx) => (
                                <span 
                                    key={idx}
                                    className={`transition-all duration-300 px-1 rounded cursor-pointer hover:bg-white/5 ${idx === activeIndex ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'opacity-90'}`}
                                    onClick={() => setActiveIndex(idx)}
                                >
                                    {sentence}{' '}
                                </span>
                            ))}
                        </div>

                        {/* Key Terms */}
                        {content.keyTerms.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                                {content.keyTerms.map((term, i) => (
                                    <div key={i} className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl">
                                        <h3 className="text-xl font-bold text-indigo-400 mb-2">{term.term}</h3>
                                        <p className="text-lg text-gray-300">{term.definition}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quiz Section */}
                        {content.quiz.length > 0 && !studentMode && (
                            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Check size={28} className="text-green-500"/> Quick Check</h3>
                                <div className="space-y-6">
                                    {content.quiz.map((q, i) => (
                                        <div key={i}>
                                            <p className="text-lg font-bold mb-3">{i+1}. {q.question}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {q.options.map((opt, oi) => (
                                                    <div key={oi} className={`p-3 rounded-xl border text-center font-medium ${opt === q.answer ? 'bg-green-900/30 border-green-800 text-green-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
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
                            <div className="flex justify-center pt-8">
                                <Button onClick={handleReset} variant="secondary">Process New Source</Button>
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
            />
        )}
    </div>
  );
};

export default SipsDashboard;
