
import React, { useState, useRef } from 'react';
import Sheet from '../ui/Sheet';
import Button from '../ui/Button';
import { Upload, Link as LinkIcon, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import Input from '../ui/Input';
import { parseUserSource, ParsedNews } from '../../utils/sourceParser';

interface SourceUploadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzed: (result: ParsedNews) => void;
}

const SourceUploadSheet: React.FC<SourceUploadSheetProps> = ({ isOpen, onClose, onAnalyzed }) => {
  const [mode, setMode] = useState<'file' | 'link'>('file');
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsAnalyzing(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          // Strip header if image
          const content = base64.split(',')[1];
          const result = await parseUserSource(content, 'image_base64');
          setIsAnalyzing(false);
          onAnalyzed(result);
          onClose();
      };
      
      // Simple handling: treat everything as potential image for this demo (Gemini Vision)
      // In prod, check MIME types for PDF/Text and handle accordingly
      reader.readAsDataURL(file);
  };

  const handleLinkSubmit = async () => {
      if (!url) return;
      setIsAnalyzing(true);
      // Mock link parsing for demo as we can't scrape client-side easily without a proxy
      // In a real app, this would send URL to backend which fetches content then sends to Gemini
      setTimeout(() => {
          setIsAnalyzing(false);
          onAnalyzed({
              headline: "Analysis of External Link",
              summary: "Content extracted from the provided URL regarding market trends.",
              fullText: `Analysis of: ${url}. This content has been parsed from the web.`,
              keyFacts: ["Source: External Web", "Verified: Pending"],
              category: "Web Source",
              reliability: "External",
              language: "English"
          });
          onClose();
      }, 2000);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Add Your Source">
      <div className="space-y-6 pb-6">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button 
                onClick={() => setMode('file')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'file' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500'}`}
            >
                Upload File
            </button>
            <button 
                onClick={() => setMode('link')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'link' ? 'bg-white dark:bg-gray-700 shadow text-black dark:text-white' : 'text-gray-500'}`}
            >
                Paste Link
            </button>
        </div>

        {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-8">
                <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">AI Analyzing Source...</p>
                <p className="text-xs text-gray-500">Extracting facts & checking reliability</p>
            </div>
        ) : (
            <>
                {mode === 'file' && (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
                            <Upload size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Tap to Upload</h4>
                        <p className="text-xs text-gray-500 mt-1">Supports Images (OCR), PDF, Text</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*,.pdf,.txt"
                            onChange={handleFileChange}
                        />
                    </div>
                )}

                {mode === 'link' && (
                    <div className="space-y-4">
                        <Input 
                            placeholder="https://example.com/news..." 
                            value={url} 
                            onChange={(e) => setUrl(e.target.value)}
                            icon={<LinkIcon size={18} />}
                        />
                        <Button fullWidth onClick={handleLinkSubmit} disabled={!url}>Analyze Link</Button>
                    </div>
                )}
            </>
        )}
      </div>
    </Sheet>
  );
};

export default SourceUploadSheet;
