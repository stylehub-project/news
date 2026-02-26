import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Save, RefreshCw, FileText, Mic, Clock, Zap, Filter, List, Volume2, Radio } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { uploadToCloudinary, fetchSavedNews } from '../../utils/cloudinaryService';

// --- Audio Helpers ---
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);

  return view;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeRawPCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  let alignedData = data;
  if (data.byteLength % 2 !== 0) {
      alignedData = data.slice(0, data.byteLength - 1);
  }

  const dataInt16 = new Int16Array(alignedData.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AudioVisualizer = ({ isPlaying, audioData }: { isPlaying: boolean, audioData: Uint8Array }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const draw = () => {
            if (!isPlaying) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; 
                ctx.lineWidth = 2;
                for (let i = 0; i < canvas.width; i++) {
                    ctx.lineTo(i, canvas.height / 2);
                }
                ctx.stroke();
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / audioData.length) * 2.5;
            let x = 0;

            for (let i = 0; i < audioData.length; i++) {
                const barHeight = (audioData[i] / 255) * height;
                
                const gradient = ctx.createLinearGradient(0, height, 0, 0);
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#8b5cf6');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
            animationId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, audioData]);

    return <canvas ref={canvasRef} width={300} height={60} className="w-full h-16 rounded-lg bg-black/20" />;
};

const SipsDashboard: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Professional');
  const [duration, setDuration] = useState('Medium');
  
  const [step, setStep] = useState<'config' | 'generating' | 'playing'>('config');
  const [loadingText, setLoadingText] = useState('');
  const [script, setScript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [visualData, setVisualData] = useState<Uint8Array>(new Uint8Array(0));
  const [playbackTime, setPlaybackTime] = useState(0);
  const startTimeRef = useRef(0);
  
  const [savedNews, setSavedNews] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [isReferMode, setIsReferMode] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedNews();
  }, []);

  // Auto-scroll to active line
  useEffect(() => {
      if (isPlaying && transcriptRef.current) {
          const activeEl = transcriptRef.current.querySelector('.active-line');
          if (activeEl) {
              activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  }, [playbackTime, isPlaying]);

  const loadSavedNews = async () => {
    setIsLoadingSaved(true);
    try {
      const news = await fetchSavedNews();
      setSavedNews(news);
    } catch (e) {
      console.error('Failed to load saved news', e);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const generateAudioWithSettings = async () => {
      if (!topic.trim()) {
          alert("Please enter a topic.");
          return;
      }
      setStep('generating');
      setLoadingText('Connecting to SIPS Newsroom...');

      try {
          const apiKey = (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY;
          if (!apiKey) throw new Error("API Key Missing");
          const ai = new GoogleGenAI({ apiKey });

          // 1. Script Generation
          const durationConstraint = duration === 'Short' 
            ? "Keep it very concise, under 100 words. Focus only on the most critical facts." 
            : duration === 'Long' ? "Provide a detailed discussion, around 500 words. Explore nuances and context."
            : "Provide a balanced discussion, around 250 words.";

          const scriptPrompt = `
            Create a spoken news dialogue between Joe (Male) and Jane (Female) about: "${topic}".
            Language: ${language}.
            Tone: ${tone}. 
            Constraint: ${durationConstraint}
            Structure lines strictly as "Joe: ..." and "Jane: ...".
            Make it engaging and educational.
          `;

          const scriptResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: scriptPrompt
          });
          
          const generatedScript = scriptResponse.text || "Script generation failed.";
          setScript(generatedScript);
          setLoadingText('Synthesizing broadcast...');

          // 2. TTS Generation
          const ttsResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash-preview-tts',
              contents: [{ parts: [{ text: generatedScript }] }],
              config: {
                  responseModalities: ['AUDIO'],
                  speechConfig: {
                      multiSpeakerVoiceConfig: {
                          speakerVoiceConfigs: [
                              { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }, 
                              { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                          ]
                      }
                  }
              }
          });

          const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (!base64Audio) throw new Error("No audio generated");

          // Convert Base64 to Bytes
          const bytes = decodeBase64(base64Audio);

          // Setup Audio Context
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass({ sampleRate: 24000 });
          audioContextRef.current = ctx;

          // Decode Raw PCM Manually
          const audioBuffer = await decodeRawPCM(bytes, ctx, 24000, 1);
          audioBufferRef.current = audioBuffer;

          // Prepare WAV for download
          const wavView = encodeWAV(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
          setAudioBlob(new Blob([wavView], { type: 'audio/wav' }));

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;

          setStep('playing');

      } catch (error) {
          console.error("Generation Error", error);
          alert(`Failed to generate audio. ${error}`);
          setStep('config');
      }
  };

  const togglePlay = () => {
      if (!audioContextRef.current || !audioBufferRef.current) return;

      if (isPlaying) {
          if (sourceRef.current) {
              sourceRef.current.stop();
              sourceRef.current = null;
          }
          setIsPlaying(false);
      } else {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBufferRef.current;
          
          if (analyserRef.current) {
              source.connect(analyserRef.current);
              analyserRef.current.connect(audioContextRef.current.destination);
          } else {
              source.connect(audioContextRef.current.destination);
          }

          source.start(0, playbackTime);
          startTimeRef.current = audioContextRef.current.currentTime - playbackTime;
          sourceRef.current = source;
          setIsPlaying(true);

          source.onended = () => {
              setIsPlaying(false);
              setPlaybackTime(0);
          };
          animateVisualizer();
      }
  };

  const animateVisualizer = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const loop = () => {
          if (!sourceRef.current) return;
          analyserRef.current!.getByteFrequencyData(dataArray);
          setVisualData(new Uint8Array(dataArray));
          
          if (audioContextRef.current) {
              setPlaybackTime(audioContextRef.current.currentTime - startTimeRef.current);
          }
          
          requestAnimationFrame(loop);
      };
      loop();
  };

  const downloadAudio = () => {
      if (!audioBlob) return;
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sips-news-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const saveToCloudinary = async () => {
      if (!audioBlob || !script) return;
      setIsSaving(true);
      try {
          // 1. Upload audio
          const audioRes = await uploadToCloudinary(audioBlob, 'video', 'sips_news');
          const audioUrl = audioRes.secure_url;
          
          // 2. Upload JSON metadata
          const metadata = {
              title: topic,
              script: script,
              audioUrl: audioUrl,
              language,
              tone
          };
          const jsonBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
          await uploadToCloudinary(jsonBlob, 'raw', 'sips_news');
          
          alert('Successfully saved to Cloudinary!');
          loadSavedNews();
      } catch (e: any) {
          console.error(e);
          alert('Failed to save: ' + e.message);
      } finally {
          setIsSaving(false);
      }
  };

  const playSavedNews = async (newsItem: any) => {
      setTopic(newsItem.title);
      setScript(newsItem.script);
      setStep('generating');
      setLoadingText('Loading saved broadcast...');
      
      try {
          const res = await fetch(newsItem.audioUrl);
          const arrayBuffer = await res.arrayBuffer();
          
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass({ sampleRate: 24000 });
          audioContextRef.current = ctx;
          
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          audioBufferRef.current = audioBuffer;
          
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          
          // Create a mock blob for download
          const wavView = encodeWAV(audioBuffer.getChannelData(0), audioBuffer.sampleRate);
          setAudioBlob(new Blob([wavView], { type: 'audio/wav' }));
          
          setActiveTab('create');
          setStep('playing');
      } catch (e) {
          console.error(e);
          alert('Failed to load audio');
          setStep('config');
      }
  };

  // Live text reader highlighting logic
  const renderScript = () => {
      if (!script) return null;
      
      const lines = script.split('\n').filter(l => l.trim());
      const totalDuration = audioBufferRef.current?.duration || 1;
      const progress = playbackTime / totalDuration;
      
      // Estimate which line is currently being spoken
      const currentLineIndex = Math.min(
          Math.floor(progress * lines.length),
          lines.length - 1
      );

      return (
          <div className="space-y-4 text-lg leading-relaxed" ref={transcriptRef}>
              {lines.map((line, idx) => {
                  const isJoe = line.startsWith('Joe:');
                  const isJane = line.startsWith('Jane:');
                  const isActive = idx === currentLineIndex && isPlaying;
                  
                  let displayText = line;
                  if (isReferMode) {
                      displayText = line.replace(/^(Joe|Jane):\s*/, '');
                  }

                  let className = "p-3 rounded-xl transition-all duration-300 ";
                  
                  if (isReferMode) {
                      className += "text-center text-2xl md:text-3xl font-medium ";
                      if (isActive) {
                          className += "text-white active-line scale-105";
                      } else {
                          className += "text-gray-600 opacity-40";
                      }
                  } else {
                      if (isJoe) className += "bg-blue-500/10 border border-blue-500/20 text-blue-100 ";
                      else if (isJane) className += "bg-purple-500/10 border border-purple-500/20 text-purple-100 ";
                      else className += "text-gray-300 ";
                      
                      if (isActive) {
                          className += "ring-2 ring-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)] transform scale-[1.02] active-line";
                      } else if (idx < currentLineIndex) {
                          className += "opacity-60";
                      }
                  }

                  return (
                      <div key={idx} className={className}>
                          {displayText}
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white p-4 md:p-8 font-sans overflow-y-auto pb-24">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
                    <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                    SIPS News Reader
                </h1>
                <p className="text-gray-400 mt-2 text-sm md:text-base">Generate, listen, and save live news broadcasts.</p>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
                <button 
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    Create News
                </button>
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'saved' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <List className="w-4 h-4" />
                    Saved Library
                </button>
            </div>
        </div>

        {activeTab === 'create' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Config & Controls */}
              <div className="lg:col-span-5 space-y-6">
                
                {step === 'config' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">News Topic or URL</label>
                            <Input 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Latest AI breakthroughs..."
                                className="w-full bg-black/40 border-white/10 text-white"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                                <select 
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Hinglish</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                                <select 
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option>Professional</option>
                                    <option>Casual</option>
                                    <option>Dramatic</option>
                                    <option>Educational</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                            <div className="flex gap-2">
                                {['Short', 'Medium', 'Long'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${duration === d ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button 
                            onClick={generateAudioWithSettings}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Zap className="w-5 h-5" />
                            Generate Broadcast
                        </Button>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-sm">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Mic className="w-6 h-6 text-blue-400 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{loadingText}</h3>
                            <p className="text-gray-400 text-sm">This may take a minute depending on duration.</p>
                        </div>
                    </div>
                )}

                {step === 'playing' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Radio className="w-5 h-5 text-blue-400" />
                                Live Broadcast
                            </h3>
                            <button 
                                onClick={() => setStep('config')}
                                className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                            >
                                <RefreshCw className="w-4 h-4" /> New
                            </button>
                        </div>

                        <AudioVisualizer isPlaying={isPlaying} audioData={visualData} />

                        <div className="flex items-center justify-center gap-4">
                            <button 
                                onClick={togglePlay}
                                className="w-16 h-16 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105"
                            >
                                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                            <Button 
                                variant="outline" 
                                onClick={downloadAudio}
                                className="w-full flex items-center justify-center gap-2 border-white/10 hover:bg-white/5 text-gray-300"
                            >
                                <Download className="w-4 h-4" /> Download
                            </Button>
                            <Button 
                                onClick={saveToCloudinary}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white"
                            >
                                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSaving ? 'Saving...' : 'Save to Cloud'}
                            </Button>
                        </div>
                    </div>
                )}
              </div>

              {/* Right Column: Live Text Reader */}
              <div className="lg:col-span-7">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[400px] lg:h-[600px] flex flex-col backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-bold text-white">Live Transcript</h3>
                        </div>
                        <button 
                            onClick={() => setIsReferMode(!isReferMode)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isReferMode ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                        >
                            <Eye className="w-4 h-4" />
                            Refer Mode
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        {script ? renderScript() : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <FileText className="w-12 h-12 opacity-20" />
                                <p>Transcript will appear here once generated.</p>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </div>
        ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm min-h-[600px]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Save className="w-6 h-6 text-purple-400" />
                        Cloudinary Library
                    </h2>
                    <button onClick={loadSavedNews} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                        <RefreshCw className={`w-5 h-5 ${isLoadingSaved ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {isLoadingSaved ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : savedNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedNews.map((news) => (
                            <div key={news.id} className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-colors group">
                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{news.title || 'Untitled Broadcast'}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(news.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Filter className="w-4 h-4" /> {news.language || 'English'}</span>
                                </div>
                                <Button 
                                    onClick={() => playSavedNews(news)}
                                    className="w-full bg-white/10 hover:bg-purple-600 text-white flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Play className="w-4 h-4" /> Play Broadcast
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <List className="w-16 h-16 opacity-20 mb-4" />
                        <p className="text-lg">No saved broadcasts found in Cloudinary.</p>
                        <p className="text-sm mt-2">Generate and save a broadcast to see it here.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SipsDashboard;
