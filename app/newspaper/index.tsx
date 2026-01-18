
import React, { useState, useRef } from 'react';
import PageHeader from '../../components/PageHeader';
import NewspaperTemplate, { NewspaperStyle, NewspaperData, NewspaperSettings } from '../../components/newspaper/NewspaperTemplate';
import NewspaperPreview from '../../components/newspaper/NewspaperPreview';
import NewspaperControls from '../../components/newspaper/NewspaperControls';
import NewspaperConfig from '../../components/newspaper/NewspaperConfig';
import NewspaperGenerationLoader from '../../components/loaders/NewspaperGenerationLoader';
import { fetchNewspaperContent } from '../../utils/aiService';
import Toast, { ToastType } from '../../components/ui/Toast';
import { Download } from 'lucide-react';

// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';

const NewspaperPage: React.FC = () => {
  const [viewState, setViewState] = useState<'EDIT' | 'GENERATING' | 'LIVE_WRITING' | 'READING'>('EDIT');
  const [style, setStyle] = useState<NewspaperStyle>('Classic');
  const [title, setTitle] = useState("The AI Daily");
  const [zoom, setZoom] = useState(0.6); 
  const [generationStage, setGenerationStage] = useState<'drafting' | 'image-gen' | 'finalizing'>('drafting');
  const [toast, setToast] = useState<{show: boolean, msg: string, type: ToastType}>({ show: false, msg: '', type: 'success' });
  const [isDownloading, setIsDownloading] = useState(false);
  
  const componentRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<NewspaperSettings>({
      fontSize: 'md',
      spacing: 'comfortable',
      font: 'serif'
  });

  const [data, setData] = useState<NewspaperData>({
      title: "The AI Daily",
      date: new Date().toLocaleDateString(),
      sections: []
  });

  const handleGenerate = async (config: any) => {
    setViewState('GENERATING');
    setGenerationStage('drafting');
    
    // Set basic data immediately
    setData(prev => ({
        ...prev,
        title: title || "The AI Daily"
    }));

    setTimeout(() => setGenerationStage('image-gen'), 1500);
    setTimeout(() => setGenerationStage('finalizing'), 3000);
    
    // Pass user config to AI service
    const generatedData = await fetchNewspaperContent(title, config);
    setData(generatedData as any);

    setTimeout(() => {
        setViewState('LIVE_WRITING');
        setZoom(0.7); 
    }, 4000);
  };

  const handleWritingComplete = () => {
      setViewState('READING');
  };

  const handleSectionUpdate = (index: number, newContent: any) => {
      const updatedSections = [...data.sections];
      updatedSections[index] = newContent;
      setData({ ...data, sections: updatedSections });
      setToast({ show: true, msg: 'Section updated', type: 'success' });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));

  const handleDownload = async () => {
      if (!componentRef.current) return;
      setIsDownloading(true);
      setToast({ show: true, msg: 'Preparing Print Layout...', type: 'info' });

      try {
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = 210; // A4 width in mm
          const pdfHeight = 297; // A4 height in mm

          const originalElement = componentRef.current;
          const pages = originalElement.querySelectorAll('.newspaper-page');
          
          if (pages.length === 0) throw new Error("No pages found");

          for (let i = 0; i < pages.length; i++) {
              const pageElement = pages[i] as HTMLElement;
              
              const canvas = await html2canvas(pageElement, {
                  scale: 2, 
                  useCORS: true,
                  logging: false,
                  allowTaint: true,
                  windowWidth: 1600, 
                  backgroundColor: '#ffffff',
                  onclone: (clonedDoc) => {
                      const clonedPage = clonedDoc.querySelector(`[data-page-index="${i}"]`) as HTMLElement;
                      if (clonedPage) {
                          clonedPage.classList.add('print-export');
                          clonedPage.style.transform = 'none';
                          clonedPage.style.margin = '0';
                      }
                  }
              });

              const imgData = canvas.toDataURL('image/jpeg', 0.85);
              const imgProps = pdf.getImageProperties(imgData);
              const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
              
              if (i > 0) pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfImgHeight);
          }

          const fileName = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
          pdf.save(fileName);
          setToast({ show: true, msg: 'Download Complete!', type: 'success' });

      } catch (error) {
          console.error('PDF Generation Error:', error);
          setToast({ show: true, msg: 'Failed to generate PDF', type: 'error' });
      } finally {
          setIsDownloading(false);
      }
  };

  const handleShare = async () => {
      if (navigator.share) {
          await navigator.share({ title: data.title, text: "Check out this AI newspaper!", url: window.location.href });
      } else {
          setToast({ show: true, msg: 'Link copied to clipboard', type: 'success' });
      }
  };

  const steps = [
      { id: 'drafting', label: 'Drafting Headlines' },
      { id: 'image-gen', label: 'Generating Visuals' },
      { id: 'finalizing', label: 'Polishing Layout' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black pb-[80px] transition-colors duration-300 relative">
        <div className="shrink-0">
          <PageHeader 
            title="AI Newsroom" 
            action={
                <button 
                    onClick={handleDownload}
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-gray-800 transition-colors"
                    disabled={isDownloading}
                >
                    <Download size={14} /> {isDownloading ? 'Exporting...' : 'Export PDF'}
                </button>
            }
          />
        </div>

        {toast.show && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] w-max">
                <Toast type={toast.type} message={toast.msg} onClose={() => setToast(prev => ({...prev, show: false}))} />
            </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
            
            {viewState === 'EDIT' && (
                <NewspaperConfig 
                    title={title}
                    setTitle={setTitle}
                    style={style}
                    setStyle={setStyle}
                    onGenerate={handleGenerate}
                />
            )}

            {viewState === 'GENERATING' && (
                 <NewspaperGenerationLoader steps={steps} currentStepId={generationStage} />
            )}

            {(viewState === 'LIVE_WRITING' || viewState === 'READING') && (
                <div className="flex flex-col h-full relative">
                    <div className="flex-1 relative overflow-hidden bg-gray-200 dark:bg-gray-900">
                        <NewspaperPreview zoom={zoom}>
                            <NewspaperTemplate 
                                ref={componentRef}
                                style={style} 
                                data={data} 
                                isLive={viewState === 'LIVE_WRITING'}
                                onWritingComplete={handleWritingComplete}
                                onSectionUpdate={handleSectionUpdate}
                                settings={settings}
                            />
                        </NewspaperPreview>
                    </div>

                    {/* Controls Overlay */}
                    {viewState === 'READING' && (
                        <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none flex justify-center">
                            <div className="pointer-events-auto w-full max-w-2xl">
                                <NewspaperControls 
                                    onDownload={handleDownload}
                                    onEdit={() => setViewState('EDIT')}
                                    onZoomIn={handleZoomIn}
                                    onZoomOut={handleZoomOut}
                                    onShare={handleShare}
                                    settings={settings}
                                    onSettingsChange={setSettings}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default NewspaperPage;
