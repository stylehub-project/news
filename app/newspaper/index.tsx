import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import NewspaperTemplate, { NewspaperStyle, NewspaperData, NewspaperSettings } from '../../components/newspaper/NewspaperTemplate';
import NewspaperPreview from '../../components/newspaper/NewspaperPreview';
import NewspaperControls from '../../components/newspaper/NewspaperControls';
import NewspaperConfig from '../../components/newspaper/NewspaperConfig';
import NewspaperGenerationLoader from '../../components/loaders/NewspaperGenerationLoader';
import { fetchNewspaperContent } from '../../utils/aiService';
import Toast, { ToastType } from '../../components/ui/Toast';

const NewspaperPage: React.FC = () => {
  // State
  const [viewState, setViewState] = useState<'EDIT' | 'GENERATING' | 'LIVE_WRITING' | 'READING'>('EDIT');
  const [style, setStyle] = useState<NewspaperStyle>('Classic');
  const [title, setTitle] = useState("The AI Daily");
  const [zoom, setZoom] = useState(0.7);
  const [generationStage, setGenerationStage] = useState<'drafting' | 'image-gen' | 'finalizing'>('drafting');
  const [toast, setToast] = useState<{show: boolean, msg: string, type: ToastType}>({ show: false, msg: '', type: 'success' });
  
  // Accessibility Settings
  const [settings, setSettings] = useState<NewspaperSettings>({
      fontSize: 'md',
      spacing: 'comfortable',
      font: 'serif'
  });

  // Data for the template
  const [data, setData] = useState<NewspaperData>({
      title: "The AI Daily",
      date: new Date().toLocaleDateString(),
      sections: []
  });

  const handleGenerate = async (config: any) => {
    setViewState('GENERATING');
    setGenerationStage('drafting');
    
    // 1. Simulate AI Thinking
    setTimeout(() => setGenerationStage('image-gen'), 1500);
    setTimeout(() => setGenerationStage('finalizing'), 3000);
    
    // 2. Fetch Data (Async)
    const generatedData = await fetchNewspaperContent(title, config);
    setData(generatedData);

    // 3. Start Live Writing
    setTimeout(() => {
        setViewState('LIVE_WRITING');
        setZoom(0.85); // Zoom in slightly for writing view
    }, 4000);
  };

  const handleWritingComplete = () => {
      setViewState('READING');
  };

  const handleSectionUpdate = (index: number, newContent: any) => {
      const updatedSections = [...data.sections];
      updatedSections[index] = newContent;
      setData({ ...data, sections: updatedSections });
      setToast({ show: true, msg: 'Section updated by AI', type: 'success' });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.4));

  const handleShare = async () => {
      if (navigator.share) {
          await navigator.share({ title: data.title, text: "Check out this AI newspaper!", url: window.location.href });
      } else {
          setToast({ show: true, msg: 'Link copied to clipboard', type: 'success' });
      }
  };

  const handleReadFull = () => {
      const allText = data.sections.map(s => s.type === 'text' ? s.content : s.title).join(". ");
      const u = new SpeechSynthesisUtterance(allText);
      window.speechSynthesis.speak(u);
      setToast({ show: true, msg: 'Reading full edition...', type: 'info' });
  };

  const steps = [
      { id: 'drafting', label: 'Drafting Headlines' },
      { id: 'image-gen', label: 'Generating Visuals' },
      { id: 'finalizing', label: 'Polishing Layout' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black pb-[80px] transition-colors duration-300 relative">
        <div className="shrink-0">
          <PageHeader title="AI Newsroom" />
        </div>

        {toast.show && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60]">
                <Toast type={toast.type} message={toast.msg} onClose={() => setToast(prev => ({...prev, show: false}))} />
            </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
            
            {/* Editor Mode */}
            {viewState === 'EDIT' && (
                <NewspaperConfig 
                    title={title}
                    setTitle={setTitle}
                    style={style}
                    setStyle={setStyle}
                    onGenerate={handleGenerate}
                />
            )}

            {/* Generating Mode (Overlay) */}
            {viewState === 'GENERATING' && (
                 <NewspaperGenerationLoader steps={steps} currentStepId={generationStage} />
            )}

            {/* Live Writing or Reading Mode */}
            {(viewState === 'LIVE_WRITING' || viewState === 'READING') && (
                <div className="flex flex-col h-full p-2 md:p-4 gap-4 animate-in fade-in">
                    
                    {/* Toolbar appears only when reading */}
                    {viewState === 'READING' && (
                        <div className="animate-in slide-in-from-top-4 fade-in">
                            <NewspaperControls 
                                onDownload={() => setToast({ show: true, msg: 'PDF Download Started', type: 'success' })}
                                onEdit={() => setViewState('EDIT')}
                                onZoomIn={handleZoomIn}
                                onZoomOut={handleZoomOut}
                                onShare={handleShare}
                                onRead={handleReadFull}
                                settings={settings}
                                onSettingsChange={setSettings}
                            />
                        </div>
                    )}

                    <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl bg-gray-800 min-h-0">
                        <NewspaperPreview zoom={zoom}>
                            <NewspaperTemplate 
                                style={style} 
                                data={data} 
                                isLive={viewState === 'LIVE_WRITING'}
                                onWritingComplete={handleWritingComplete}
                                onSectionUpdate={handleSectionUpdate}
                                settings={settings}
                            />
                        </NewspaperPreview>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default NewspaperPage;