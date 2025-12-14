import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import NewspaperTemplate, { NewspaperStyle, NewspaperData } from '../../components/newspaper/NewspaperTemplate';
import NewspaperPreview from '../../components/newspaper/NewspaperPreview';
import NewspaperControls from '../../components/newspaper/NewspaperControls';
import NewspaperConfig from '../../components/newspaper/NewspaperConfig';
import MultiStepLoader from '../../components/loaders/MultiStepLoader';

const NewspaperPage: React.FC = () => {
  // State
  const [viewState, setViewState] = useState<'EDIT' | 'GENERATING' | 'PREVIEW'>('EDIT');
  const [style, setStyle] = useState<NewspaperStyle>('Classic');
  const [title, setTitle] = useState("The AI Daily");
  const [zoom, setZoom] = useState(0.8);
  const [generationStage, setGenerationStage] = useState<'drafting' | 'image-gen' | 'finalizing'>('drafting');
  
  // Data for the template
  const [data, setData] = useState<NewspaperData>({
      title: "The AI Daily",
      date: new Date().toLocaleDateString(),
      sections: []
  });

  const handleGenerate = () => {
    setViewState('GENERATING');
    setGenerationStage('drafting');
    
    // Simulate multi-step AI Generation
    setTimeout(() => setGenerationStage('image-gen'), 2000);
    setTimeout(() => setGenerationStage('finalizing'), 4500);
    
    setTimeout(() => {
        // Mock Rich Data Generation
        setData({
            title: title || "The AI Daily",
            date: new Date().toLocaleDateString(),
            sections: [
                {
                    type: 'text',
                    title: 'Executive Summary',
                    content: "The global technology sector saw unprecedented growth this week as major AI regulations were finalized in the EU. Markets reacted positively, with a 5% aggregate rise in semiconductor stocks. Meanwhile, sustainable energy breakthroughs in fusion power promise a new era of clean electricity."
                },
                {
                    type: 'timeline',
                    title: 'Key Events Timeline',
                    content: [
                        { time: '09:00 AM', title: 'Market Open', desc: 'Tech stocks surge on opening bell.' },
                        { time: '01:30 PM', title: 'Fusion Announcement', desc: 'Scientists achieve net energy gain.' },
                        { time: '04:00 PM', title: 'Closing Bell', desc: 'Record highs for renewable sector.' }
                    ]
                },
                {
                    type: 'graph',
                    title: 'Market Sentiment',
                    content: [
                        { label: 'Tech', value: 85 },
                        { label: 'Energy', value: 65 },
                        { label: 'Retail', value: 45 },
                        { label: 'Auto', value: 70 },
                        { label: 'Health', value: 55 }
                    ]
                },
                {
                    type: 'flowchart',
                    title: 'Legislation Process',
                    content: ['Proposal', 'Committee Review', 'Public Hearing', 'Final Vote', 'Law Enacted']
                },
                {
                    type: 'images',
                    title: 'Visual Highlights',
                    content: [
                        'https://picsum.photos/300/300?random=10',
                        'https://picsum.photos/300/300?random=11',
                        'https://picsum.photos/300/300?random=12'
                    ]
                }
            ]
        });
        setViewState('PREVIEW');
    }, 6000);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.4));

  const steps = [
      { id: 'drafting', label: 'Drafting Headlines' },
      { id: 'image-gen', label: 'Generating Visuals' },
      { id: 'finalizing', label: 'Polishing Layout' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-[80px]">
        <div className="shrink-0">
          <PageHeader title="AI News Overview Maker" />
        </div>

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

            {/* Generating Mode (Overlay with MultiStepLoader) */}
            {viewState === 'GENERATING' && (
                 <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6">
                     <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
                        <h3 className="text-xl font-black text-center mb-6">Building Your Edition</h3>
                        <MultiStepLoader steps={steps} currentStepId={generationStage} />
                     </div>
                 </div>
            )}

            {/* Preview Mode */}
            {viewState === 'PREVIEW' && (
                <div className="flex flex-col h-full p-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <NewspaperControls 
                        onDownload={() => alert("Downloading PDF...")}
                        onEdit={() => setViewState('EDIT')}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                    />

                    <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-200/50 min-h-0">
                        <NewspaperPreview zoom={zoom}>
                            <NewspaperTemplate style={style} data={data} />
                        </NewspaperPreview>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default NewspaperPage;