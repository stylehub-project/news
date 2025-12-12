import React, { useState, useEffect } from 'react';
import { Sparkles, Construction, Clock, ArrowLeft, Home, Bell, Lock, ChevronRight, Zap, Bot, PenTool, Rocket, Leaf, Laptop, Coffee, Scan, Monitor, Layers, Smile, Activity, Calendar, CheckCircle2, BarChart3, Terminal, Radio, Gauge, Box, Crown, CreditCard, Key, Eye, Shield, Gem, Star, Gamepad2, Tv, Cat, Bird, LifeBuoy, MapPin, Ruler, Send, Palette, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Toast from './ui/Toast';

export type ComingSoonVariant = 
  | 'gradient' | 'minimal' | 'typography' | 'premium' // Group A
  | 'blob' | 'shapes' | 'comic' | 'robot' | 'classroom' | 'newspaper' | 'space' | 'nature' | 'hud' | 'office' // Group B
  | 'loader-ring' | 'shimmer' | 'timeline' | 'steps' | 'graph' | 'pulse' | 'typing' | 'wave' | 'dial' | 'cube' // Group C
  | 'blur-preview' | 'paywall' | 'frosted' | 'glowing-lock' | 'vip' | 'dimmed' | 'folded' | 'curtain' | 'key' | 'card-flip' // Group D
  | 'pixel' | 'breaking' | 'mascot' | 'origami' | 'ferris' | 'neon' | 'blueprint' | 'plane' | 'burst' | 'quotes'; // Group E

interface ComingSoonProps {
  title: string;
  description?: string;
  gradient?: string; // Kept for backward compat, used in 'gradient' variant
  featureList?: string[];
  icon?: React.ReactNode;
  variant?: ComingSoonVariant;
  fullPage?: boolean;
  eta?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description = "We're crafting something amazing here.", 
  gradient = "bg-gradient-to-r from-blue-600 to-indigo-700",
  featureList = ["AI Integration", "Real-time Updates", "Personalized Feed"],
  icon,
  variant = 'gradient',
  fullPage = false,
  eta = "Coming Soon"
}) => {
  const navigate = useNavigate();
  const [notified, setNotified] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleNotify = () => {
    setNotified(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // --- Renderers Group A ---
  const renderGradient = () => (
    <div className={`w-full relative overflow-hidden rounded-3xl ${gradient} text-white shadow-xl ${fullPage ? 'min-h-[60vh] flex flex-col justify-center' : 'p-6'}`}>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className={`relative z-10 flex flex-col items-center text-center ${fullPage ? 'max-w-md mx-auto p-8' : ''}`}>
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full mb-6 ring-4 ring-white/10 animate-bounce shadow-lg">
          {icon || <Sparkles size={32} />}
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-3 drop-shadow-sm tracking-tight">{title}</h2>
        <p className="text-lg opacity-90 mb-6 font-medium leading-relaxed">{description}</p>
        <div className="w-full max-w-xs bg-black/20 rounded-full h-1.5 mb-6 overflow-hidden backdrop-blur-sm">
          <div className="bg-white h-full rounded-full w-2/3 animate-[shimmer_2s_infinite]"></div>
        </div>
        <Button onClick={handleNotify} variant="secondary" className="bg-white text-blue-900 border-none font-bold hover:bg-blue-50" rightIcon={notified ? <Zap size={16} className="fill-yellow-400 text-yellow-500" /> : <Bell size={16} />} disabled={notified}>
            {notified ? "You're on the list!" : "Notify Me When Ready"}
        </Button>
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden min-h-[400px]">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 text-gray-800 animate-in zoom-in duration-500">
             {icon || <Construction size={40} />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 max-w-xs mb-8">{description}</p>
        <div className="flex gap-3">
             <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-900">Go Back</Button>
             <Button onClick={handleNotify} className="bg-black text-white hover:bg-gray-800 rounded-full px-6">
                {notified ? "Notified" : "Notify Me"}
             </Button>
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gray-200 rounded-full blur-3xl opacity-50"></div>
    </div>
  );

  const renderTypography = () => (
    <div className="relative bg-black text-white rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl min-h-[500px] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur-[100px] opacity-40 animate-pulse-slow"></div>
        <div className="relative z-10">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-4 block animate-pulse">In Development</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
                SOMETHING<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">NEW</span> IS<br/>
                ARRIVING.
            </h1>
            <p className="text-gray-400 text-lg max-w-md border-l-2 border-purple-500 pl-4">{description}</p>
        </div>
        <div className="relative z-10 pt-12">
             <button onClick={handleNotify} className="group flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ArrowLeft size={20} className="rotate-180" />
                </div>
                <div>
                    <span className="block text-sm font-bold">Get Early Access</span>
                    <span className="block text-xs text-gray-500">Join the waitlist</span>
                </div>
             </button>
        </div>
    </div>
  );

  const renderPremium = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-900 p-1 min-h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-white opacity-5 grid grid-cols-2 gap-4 p-4 blur-sm pointer-events-none">
              <div className="h-32 bg-gray-500 rounded-xl"></div>
              <div className="h-32 bg-gray-500 rounded-xl"></div>
              <div className="col-span-2 h-40 bg-gray-500 rounded-xl"></div>
          </div>
          <div className="relative z-10 bg-gray-800/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center max-w-sm shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                    <Lock size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-400 text-sm mb-6">This feature is reserved for premium members. It will be available in the next update.</p>
                <Button fullWidth className="bg-gradient-to-r from-yellow-400 to-orange-600 text-white border-none font-bold">Unlock Premium</Button>
                <p className="text-[10px] text-gray-500 mt-3">Coming in v2.1 • {eta}</p>
          </div>
      </div>
  );

  // --- Renderers Group B ---
  const renderBlob = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-indigo-50 min-h-[450px] flex items-center justify-center p-6 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-full blur-2xl animate-pulse opacity-50"></div>
          <div className="relative z-10 bg-white/60 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/40 max-w-sm">
             <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 rotate-3">
                 {icon || <Layers size={36} className="text-white" />}
             </div>
             <h2 className="text-2xl font-black text-indigo-900 mb-2">{title}</h2>
             <p className="text-indigo-800/70 text-sm mb-6">{description}</p>
             <Button onClick={handleNotify} className="bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 w-full">Notify Me</Button>
          </div>
      </div>
  );

  const renderShapes = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-white min-h-[450px] flex items-center justify-center p-8">
          <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-200 rounded-full opacity-50 animate-bounce"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-100 rounded-xl rotate-12 opacity-60 animate-pulse"></div>
          <div className="relative z-10 text-center">
             <div className="inline-block p-4 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 mb-4">
                 {icon || <Construction size={32} className="text-gray-400" />}
             </div>
             <h2 className="text-3xl font-black text-gray-800 mb-3">{title}</h2>
             <p className="text-gray-500 max-w-xs mx-auto mb-6">{description}</p>
          </div>
      </div>
  );

  const renderComic = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-yellow-400 min-h-[450px] flex items-center justify-center p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="relative z-10 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm transform rotate-1">
              <div className="bg-red-500 text-white text-xs font-black uppercase px-3 py-1 border-2 border-black absolute -top-4 -right-4 transform rotate-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Coming Soon!
              </div>
              <h2 className="text-4xl font-black text-black mb-2 uppercase italic">{title}</h2>
              <p className="text-black font-bold mb-6 border-l-4 border-black pl-3">{description}</p>
              <Button onClick={handleNotify} className="bg-blue-500 text-white border-2 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full rounded-none">
                  Get Notified!
              </Button>
          </div>
      </div>
  );

  const renderRobot = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-100 min-h-[450px] flex items-center justify-center p-6">
          <div className="text-center">
             <div className="relative w-32 h-32 mx-auto mb-6">
                 <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                 <Bot size={80} className="text-gray-800 relative z-10 animate-bounce" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Building Intelligence...</h2>
             <p className="text-gray-500 max-w-xs mx-auto mb-6 text-sm">{description}</p>
          </div>
      </div>
  );

  const renderClassroom = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#2d3732] min-h-[450px] flex items-center justify-center p-6 border-8 border-[#5c4033]">
          <div className="text-center text-white/90">
             <div className="mb-6 opacity-80">
                 <PenTool size={48} className="mx-auto text-white/50" />
             </div>
             <h2 className="text-3xl font-serif mb-2" style={{ fontFamily: 'cursive' }}>{title}</h2>
             <p className="text-white/70 max-w-xs mx-auto mb-8 font-light italic">{description}</p>
             <Button variant="secondary" onClick={handleNotify} className="bg-white/10 text-white border-white/20 hover:bg-white/20">Raise Hand</Button>
          </div>
      </div>
  );

  const renderNewspaper = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#f4f1ea] min-h-[450px] flex items-center justify-center p-8">
          <div className="border-2 border-gray-800 p-1 w-full max-w-sm bg-white shadow-xl">
              <div className="border border-gray-800 p-6 text-center">
                  <div className="border-b-2 border-black pb-2 mb-4">
                      <h2 className="text-3xl font-black uppercase font-serif tracking-widest">{title}</h2>
                  </div>
                  <p className="text-sm font-serif text-justify leading-snug mb-4">{description}</p>
                  <Button onClick={handleNotify} size="sm" fullWidth className="bg-black text-white rounded-none font-serif font-bold uppercase">Subscribe</Button>
              </div>
          </div>
      </div>
  );

  const renderSpace = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-900 min-h-[450px] flex items-center justify-center p-6">
          <div className="relative z-10 text-center text-white">
              <div className="relative w-24 h-24 mx-auto mb-6">
                  <Rocket size={64} className="text-white relative z-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold tracking-widest uppercase mb-2">Launch Imminent</h2>
              <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">{description}</p>
              <Button onClick={handleNotify} className="bg-white/10 text-white border border-white/20 hover:bg-white/20">Join Mission</Button>
          </div>
      </div>
  );

  const renderNature = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#eaf4e6] min-h-[450px] flex items-center justify-center p-6">
          <Leaf size={120} className="absolute -top-10 -right-10 text-[#d0e6c8] rotate-45" />
          <div className="relative z-10 text-center max-w-sm">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                  <Smile size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">{title}</h2>
              <p className="text-green-800/70 mb-6 leading-relaxed">{description}</p>
          </div>
      </div>
  );

  const renderHUD = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-black min-h-[450px] flex items-center justify-center p-6 border border-cyan-900">
          <div className="relative z-10 border border-cyan-500/50 bg-black/80 backdrop-blur-sm p-8 max-w-sm text-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Scan size={40} className="mx-auto text-cyan-400 mb-4 animate-pulse" />
              <h2 className="text-xl font-mono font-bold text-cyan-400 mb-2 tracking-widest uppercase">{title}</h2>
              <Button onClick={handleNotify} className="bg-cyan-900/30 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 font-mono text-xs uppercase tracking-wider w-full">System Alert: On</Button>
          </div>
      </div>
  );

  const renderOffice = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-orange-50 min-h-[450px] flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-lg shadow-lg rotate-1 max-w-xs relative border border-gray-100">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-200 opacity-50 rotate-[-2deg]"></div>
              <div className="flex justify-center gap-4 mb-4 text-gray-400">
                  <Laptop size={32} />
                  <Coffee size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Work in Progress!</h2>
              <p className="text-gray-500 text-sm mb-4 text-center">{description}</p>
          </div>
      </div>
  );

  // --- Renderers Group C ---
  const renderLoaderRing = () => (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gray-900 min-h-[450px] flex items-center justify-center p-8">
       <div className="relative w-40 h-40">
           <svg className="w-full h-full transform -rotate-90">
               <circle cx="80" cy="80" r="70" stroke="#374151" strokeWidth="8" fill="transparent" />
               <circle cx="80" cy="80" r="70" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset="110" className="animate-[spin_3s_linear_infinite]" strokeLinecap="round" />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
               <span className="text-3xl font-black">75%</span>
               <span className="text-xs text-gray-400 uppercase tracking-widest">Loading</span>
           </div>
       </div>
       <div className="absolute bottom-12 text-center w-full px-4">
           <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
           <p className="text-sm text-gray-400">{description}</p>
       </div>
    </div>
  );

  const renderShimmer = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-white min-h-[450px] p-8 flex flex-col gap-6">
          <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
          </div>
          <div className="space-y-3">
               {[1,2,3,4].map(i => (
                   <div key={i} className="h-24 w-full bg-gray-100 rounded-xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                   </div>
               ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
               <div className="bg-white px-6 py-3 rounded-full shadow-xl border border-gray-100 flex items-center gap-2">
                   <Activity className="animate-spin text-blue-500" size={18} />
                   <span className="font-bold text-gray-800">Constructing Page...</span>
               </div>
          </div>
      </div>
  );

  const renderTimeline = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-800 min-h-[450px] flex flex-col items-center justify-center p-8 text-white">
          <Calendar size={48} className="mb-6 text-slate-400" />
          <h2 className="text-2xl font-bold mb-8 text-center">{title}</h2>
          
          <div className="flex items-center w-full max-w-sm relative">
               <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-600 -translate-y-1/2 z-0"></div>
               <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-blue-500 -translate-y-1/2 z-0"></div>
               
               <div className="flex justify-between w-full relative z-10">
                   {['Concept', 'Design', 'Code', 'Launch'].map((step, i) => (
                       <div key={i} className="flex flex-col items-center gap-2">
                           <div className={`w-4 h-4 rounded-full border-2 ${i < 3 ? 'bg-blue-500 border-blue-500' : 'bg-slate-800 border-slate-400'}`}></div>
                           <span className={`text-[10px] uppercase font-bold ${i < 3 ? 'text-blue-400' : 'text-slate-500'}`}>{step}</span>
                       </div>
                   ))}
               </div>
          </div>
          <div className="mt-8 bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
               <span className="text-xs font-mono text-blue-300">ETA: {eta}</span>
          </div>
      </div>
  );

  const renderSteps = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-emerald-50 min-h-[450px] flex items-center justify-center p-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 w-full max-w-sm">
               <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Status Report</h2>
               <div className="space-y-4">
                   {[
                       { label: 'Initializing Core', status: 'done' },
                       { label: 'Loading Assets', status: 'done' },
                       { label: 'Connecting API', status: 'loading' },
                       { label: 'Final Polish', status: 'waiting' }
                   ].map((item, i) => (
                       <div key={i} className="flex items-center gap-3">
                           {item.status === 'done' && <CheckCircle2 size={18} className="text-emerald-500" />}
                           {item.status === 'loading' && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>}
                           {item.status === 'waiting' && <div className="w-4 h-4 rounded-full border-2 border-gray-200"></div>}
                           <span className={`text-sm ${item.status === 'waiting' ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>{item.label}</span>
                       </div>
                   ))}
               </div>
           </div>
      </div>
  );

  const renderGraph = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-50 min-h-[450px] flex flex-col items-center justify-center p-8">
           <div className="flex items-end gap-2 h-32 mb-6">
               {[40, 70, 30, 85, 50].map((h, i) => (
                   <div 
                    key={i} 
                    className="w-8 bg-blue-500 rounded-t-lg animate-pulse" 
                    style={{ 
                        height: `${h}%`,
                        animationDelay: `${i * 0.1}s`,
                        opacity: 0.6 + (i * 0.1)
                    }}
                   ></div>
               ))}
           </div>
           <div className="flex items-center gap-2 text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
               <BarChart3 size={18} />
               <span>Optimizing Performance...</span>
           </div>
      </div>
  );

  const renderPulse = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-violet-900 min-h-[450px] flex items-center justify-center p-8 text-center">
           <div className="relative">
               <div className="absolute inset-0 bg-violet-500 rounded-full animate-ping opacity-75"></div>
               <div className="relative bg-white p-6 rounded-full shadow-2xl z-10">
                   <Zap size={32} className="text-violet-600 fill-violet-600" />
               </div>
           </div>
           <div className="absolute bottom-16">
               <h2 className="text-2xl font-bold text-white mb-1">Stay Tuned</h2>
               <p className="text-violet-200 text-sm">We are going live shortly.</p>
           </div>
      </div>
  );

  const TypingText = ({ text }: { text: string }) => {
      const [displayed, setDisplayed] = useState('');
      useEffect(() => {
          let i = 0;
          const interval = setInterval(() => {
              setDisplayed(text.slice(0, i));
              i++;
              if (i > text.length) clearInterval(interval);
          }, 50);
          return () => clearInterval(interval);
      }, [text]);
      return <span>{displayed}<span className="animate-pulse">_</span></span>;
  };

  const renderTyping = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-black min-h-[450px] flex items-center justify-center p-8 font-mono text-green-500">
           <div className="w-full max-w-md">
               <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
                   <Terminal size={16} />
                   <span className="text-xs">SYSTEM_ROOT</span>
               </div>
               <div className="space-y-2 text-sm">
                   <p className="opacity-50">{">"} Initializing build sequence...</p>
                   <p className="opacity-50">{">"} Loading modules...</p>
                   <p className="font-bold text-lg mt-4 text-white">
                       {">"} <TypingText text={title} />
                   </p>
               </div>
           </div>
      </div>
  );

  const renderWave = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-blue-500 min-h-[450px] flex flex-col items-center justify-center p-8 text-white">
           <div className="flex gap-1.5 h-16 items-center mb-6">
               {[...Array(9)].map((_, i) => (
                   <div 
                    key={i} 
                    className="w-2 bg-white rounded-full animate-[bounce_1s_infinite]"
                    style={{ animationDelay: `${i * 0.1}s` }}
                   ></div>
               ))}
           </div>
           <h2 className="text-2xl font-bold mb-2">Tuning In...</h2>
           <p className="text-blue-100 opacity-80">{description}</p>
      </div>
  );

  const renderDial = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-zinc-800 min-h-[450px] flex items-center justify-center p-8">
           <div className="text-center">
               <div className="relative w-48 h-24 overflow-hidden mb-4">
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-[12px] border-zinc-600 border-b-transparent"></div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-[12px] border-orange-500 border-b-transparent border-l-transparent border-r-transparent animate-[spin_2s_linear_infinite_reverse]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'}}></div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-20 bg-white origin-bottom rotate-45 transition-transform duration-1000"></div>
               </div>
               <div className="flex items-center justify-center gap-2 text-orange-500 font-bold mb-2">
                   <Gauge size={20} />
                   <span className="uppercase tracking-widest">Pressure</span>
               </div>
               <p className="text-zinc-400 text-xs">Building features at max capacity.</p>
           </div>
      </div>
  );

  const renderCube = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-indigo-900 min-h-[450px] flex items-center justify-center p-8 perspective-1000">
           <div className="relative w-24 h-24 animate-[spin_4s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }}>
               <div className="absolute inset-0 bg-indigo-500 opacity-80 border border-white/20" style={{ transform: 'translateZ(48px)' }}></div>
               <div className="absolute inset-0 bg-indigo-600 opacity-80 border border-white/20" style={{ transform: 'rotateY(180deg) translateZ(48px)' }}></div>
               <div className="absolute inset-0 bg-indigo-400 opacity-80 border border-white/20" style={{ transform: 'rotateY(90deg) translateZ(48px)' }}></div>
               <div className="absolute inset-0 bg-indigo-400 opacity-80 border border-white/20" style={{ transform: 'rotateY(-90deg) translateZ(48px)' }}></div>
               <div className="absolute inset-0 bg-indigo-300 opacity-80 border border-white/20" style={{ transform: 'rotateX(90deg) translateZ(48px)' }}></div>
               <div className="absolute inset-0 bg-indigo-700 opacity-80 border border-white/20" style={{ transform: 'rotateX(-90deg) translateZ(48px)' }}></div>
           </div>
           
           <div className="absolute bottom-12 text-center text-white">
               <div className="flex items-center gap-2 justify-center mb-1">
                   <Box size={16} className="text-indigo-300" />
                   <span className="text-xs font-mono text-indigo-300">RENDERING_MODULE</span>
               </div>
               <h2 className="font-bold">{title}</h2>
           </div>
      </div>
  );

  // --- Renderers Group D (Premium / Lock) ---

  const renderBlurPreview = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-100 min-h-[450px] flex items-center justify-center p-8">
          {/* Mock UI Background */}
          <div className="absolute inset-0 p-8 opacity-50 blur-md pointer-events-none select-none flex flex-col gap-4">
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
          
          <div className="relative z-10 bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl text-center max-w-sm border border-white/50">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  <Lock size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">Feature Locked</h2>
              <p className="text-gray-500 text-sm mb-6">This preview is currently unavailable to public users.</p>
              <Button onClick={handleNotify} className="bg-black text-white w-full">Notify When Open</Button>
          </div>
      </div>
  );

  const renderPaywall = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-gray-900 to-black min-h-[450px] flex items-center justify-center p-8 text-white">
          <div className="text-center max-w-sm">
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-yellow-500/30">
                  <Crown size={12} /> Premium Only
              </div>
              <h2 className="text-3xl font-black mb-4">Unlock Early Access</h2>
              <ul className="text-left space-y-3 mb-8 text-gray-300 text-sm mx-auto max-w-[200px]">
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Ad-free experience</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Priority support</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500"/> Beta features</li>
              </ul>
              <Button onClick={handleNotify} className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold border-none w-full">Get News Club+</Button>
              <p className="text-xs text-gray-500 mt-4">Coming Soon to your region</p>
          </div>
      </div>
  );

  const renderFrosted = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 min-h-[450px] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-20"></div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl max-w-sm text-center text-white">
              <div className="mb-4 inline-block p-3 rounded-2xl bg-white/10">
                  {icon || <Sparkles size={32} />}
              </div>
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-white/80 text-sm mb-6">{description}</p>
              <Button variant="glass" onClick={handleNotify} className="w-full">Notify Me</Button>
          </div>
      </div>
  );

  const renderGlowingLock = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-black min-h-[450px] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-black to-black"></div>
          
          <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-40 animate-pulse"></div>
                  <Lock size={64} className="text-cyan-400 relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-8 mb-2 tracking-wider uppercase">Access Denied</h2>
              <p className="text-cyan-400/60 text-sm font-mono">Module under construction...</p>
          </div>
      </div>
  );

  const renderVIP = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-white min-h-[450px] flex items-center justify-center p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200 mb-6">
                  <Crown size={36} className="text-white fill-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">VIP Access</h2>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">Experience {title} like never before with our exclusive tier.</p>
              <Button onClick={handleNotify} className="bg-black text-white rounded-full px-8">Join Waitlist</Button>
          </div>
      </div>
  );

  const renderDimmed = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-50 min-h-[450px] flex items-center justify-center p-8">
          {/* Faint UI Background */}
          <div className="absolute inset-0 p-8 grayscale opacity-30 pointer-events-none flex flex-col gap-4">
               <div className="flex gap-4">
                   <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                   <div className="flex-1 bg-gray-300 rounded-lg h-12"></div>
               </div>
               <div className="flex-1 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300"></div>
          </div>

          <div className="relative z-10 bg-white p-6 rounded-2xl shadow-xl text-center max-w-xs transform rotate-2">
              <Eye size={32} className="mx-auto text-gray-400 mb-3" />
              <h2 className="text-lg font-bold text-gray-800 mb-1">Sneak Peek</h2>
              <p className="text-xs text-gray-500">Coming in the next update.</p>
          </div>
      </div>
  );

  const renderFolded = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-blue-600 min-h-[450px] flex items-center justify-center p-8">
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[100px] border-t-white/20 border-l-[100px] border-l-transparent pointer-events-none"></div>
          
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-600 rotate-45 transform"></div>
               <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{title}</h2>
               <p className="text-gray-500 mb-6">{description}</p>
               <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600 w-1/4"></div>
               </div>
               <p className="text-right text-[10px] text-gray-400 mt-2">25% Complete</p>
          </div>
      </div>
  );

  const renderCurtain = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-red-900 min-h-[450px] flex items-center justify-center p-8">
           {/* Spotlight */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-yellow-100/10 via-transparent to-transparent pointer-events-none"></div>
           
           <div className="relative z-10 text-center text-white">
               <div className="mb-6 inline-block p-4 border-2 border-yellow-500/50 rounded-full">
                   <Star size={32} className="text-yellow-400 fill-yellow-400 animate-pulse" />
               </div>
               <h2 className="text-3xl font-serif font-bold mb-2 text-yellow-50">Grand Reveal</h2>
               <p className="text-red-200 text-sm mb-8">The stage is being set for {title}.</p>
               <Button onClick={handleNotify} variant="secondary" className="bg-white text-red-900 border-none font-bold">Reserve Seat</Button>
           </div>
      </div>
  );

  const renderKey = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-slate-800 min-h-[450px] flex items-center justify-center p-8">
           <div className="text-center">
               <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                   <div className="absolute inset-0 border-4 border-dashed border-slate-600 rounded-full animate-[spin_10s_linear_infinite]"></div>
                   <Key size={48} className="text-emerald-400 animate-bounce" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Unlocking Soon</h2>
               <p className="text-slate-400 text-sm max-w-xs mx-auto">{description}</p>
           </div>
      </div>
  );

  const renderCardFlip = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-100 min-h-[450px] flex items-center justify-center p-8 perspective-1000 group">
           <div className="relative w-64 h-80 transition-transform duration-700 transform-style-3d group-hover:rotate-y-180 cursor-pointer">
               {/* Front */}
               <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 border border-gray-200">
                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                       <CreditCard size={32} />
                   </div>
                   <h3 className="font-bold text-lg text-gray-800">Mystery Feature</h3>
                   <p className="text-xs text-gray-400 mt-2">Hover to reveal</p>
               </div>
               
               {/* Back */}
               <div className="absolute inset-0 backface-hidden bg-blue-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 text-white rotate-y-180">
                   <h3 className="font-bold text-xl mb-2">{title}</h3>
                   <p className="text-sm text-blue-100 text-center mb-4">{description}</p>
                   <Button onClick={(e) => { e.stopPropagation(); handleNotify(); }} size="sm" className="bg-white text-blue-600 border-none">Notify Me</Button>
               </div>
           </div>
      </div>
  );

  // --- Renderers Group E (Fun / Creative) ---

  // 41. Pixel Art
  const renderPixel = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-900 min-h-[450px] flex items-center justify-center p-8 font-mono">
          <div className="text-center text-green-400">
              <Gamepad2 size={64} className="mx-auto mb-6" />
              <h2 className="text-xl font-bold mb-4 uppercase tracking-widest">LOADING LEVEL 2...</h2>
              <div className="w-64 h-6 border-4 border-green-400 p-1 mx-auto mb-6">
                  <div className="h-full bg-green-400 w-2/3 animate-pulse"></div>
              </div>
              <p className="text-xs text-green-600">INSERT COIN TO CONTINUE</p>
              <Button onClick={handleNotify} className="mt-6 bg-green-600 text-black font-bold border-2 border-green-400 hover:bg-green-500 rounded-none w-full">START GAME</Button>
          </div>
      </div>
  );

  // 42. News Channel Breaking Look
  const renderBreaking = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-blue-900 min-h-[450px] flex flex-col justify-end">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Tv size={120} className="text-white" />
          </div>
          <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 shadow-lg relative z-10">
              <div className="flex items-center gap-3 mb-2 text-white">
                  <span className="bg-white text-red-700 px-2 py-0.5 font-black uppercase text-xs animate-pulse">LIVE</span>
                  <span className="font-bold text-sm tracking-wide uppercase">Breaking News</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic leading-none mb-2">{title}</h2>
              <div className="bg-black/30 p-2 text-white text-xs font-mono truncate">
                  Developing Story... • Stay Tuned • {description}
              </div>
          </div>
      </div>
  );

  // 43. Cute Animal Mascot
  const renderMascot = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-orange-50 min-h-[450px] flex items-center justify-center p-8 text-center">
          <div className="relative mb-6">
              <div className="absolute -top-8 -right-8 animate-bounce delay-700">
                  <span className="text-2xl">💤</span>
              </div>
              <Cat size={80} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-orange-900 mb-2">Paws & Reflect</h2>
          <p className="text-orange-700/70 text-sm max-w-xs mx-auto mb-6">Our coding cats are taking a quick nap. We'll be back shortly with {title}.</p>
          <Button onClick={handleNotify} className="bg-orange-500 text-white rounded-full hover:bg-orange-600">Wake Me Up</Button>
      </div>
  );

  // 44. Origami Bird
  const renderOrigami = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-sky-100 min-h-[450px] flex items-center justify-center p-8">
          <div className="absolute top-10 right-10 opacity-20"><Bird size={40} className="text-sky-800 rotate-12" /></div>
          <div className="absolute bottom-20 left-10 opacity-10"><Bird size={60} className="text-sky-800 -rotate-12" /></div>
          
          <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-white shadow-xl rotate-45 mx-auto mb-8 flex items-center justify-center rounded-xl">
                  <Bird size={48} className="text-sky-600 -rotate-45" />
              </div>
              <h2 className="text-2xl font-bold text-sky-900 mb-2">Unfolding Soon</h2>
              <p className="text-sky-700 text-sm max-w-xs mx-auto">We're crafting this feature with precision and care.</p>
          </div>
      </div>
  );

  // 45. Ferris Wheel
  const renderFerris = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-white min-h-[450px] flex items-center justify-center p-8">
          <div className="relative w-64 h-64 border-4 border-gray-200 rounded-full animate-[spin_10s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 p-2 rounded-full"><Home size={20} className="text-blue-600"/></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-red-100 p-2 rounded-full"><Bell size={20} className="text-red-600"/></div>
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-100 p-2 rounded-full"><LifeBuoy size={20} className="text-green-600"/></div>
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-yellow-100 p-2 rounded-full"><Star size={20} className="text-yellow-600"/></div>
          </div>
          <div className="absolute z-10 bg-white/90 px-6 py-3 rounded-xl shadow-xl text-center border border-gray-100">
              <h2 className="font-bold text-gray-800">Coming Around</h2>
              <p className="text-xs text-gray-500">Wait for it...</p>
          </div>
      </div>
  );

  // 46. Neon Tokyo
  const renderNeon = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#0a0a12] min-h-[450px] flex items-center justify-center p-8">
          <div className="border-4 border-fuchsia-500 p-8 rounded-lg shadow-[0_0_20px_rgba(217,70,239,0.5)] text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a0a12] px-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">Cyber Zone</div>
              <MapPin size={48} className="text-cyan-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 mb-2 uppercase italic">{title}</h2>
              <p className="text-fuchsia-200/60 text-xs font-mono">System Offline // Reconnecting...</p>
          </div>
      </div>
  );

  // 47. Blueprint Sketch
  const renderBlueprint = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#0052cc] min-h-[450px] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="relative z-10 border-2 border-dashed border-white/40 p-8 rounded-lg max-w-sm text-center">
              <div className="absolute -top-3 -left-3"><Ruler className="text-white rotate-45" size={24} /></div>
              <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool className="text-white" />
              </div>
              <h2 className="text-2xl font-mono font-bold text-white mb-2 uppercase">{title}</h2>
              <p className="text-blue-200 text-xs font-mono">Architecture v1.0 in progress.</p>
          </div>
      </div>
  );

  // 48. Paper Plane Animation
  const renderPlane = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-sky-300 to-white min-h-[450px] flex items-center justify-center p-8">
          <div className="absolute top-1/4 left-0 w-full h-full">
               <Send size={32} className="text-white absolute animate-[bounce_3s_infinite]" style={{ left: '50%', top: '20%' }} />
               <div className="absolute top-[28%] left-[45%] w-24 h-0.5 bg-white/50 -rotate-12"></div>
          </div>
          
          <div className="relative z-10 mt-32 text-center">
              <h2 className="text-2xl font-bold text-sky-900 mb-1">In Transit</h2>
              <p className="text-sky-700 text-sm">Delivering this feature to you soon.</p>
          </div>
      </div>
  );

  // 49. Color Burst
  const renderBurst = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-white min-h-[450px] flex items-center justify-center p-8">
          {/* Static confetti simulation */}
          {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                    backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 5],
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0.6
                }}
              ></div>
          ))}
          
          <div className="relative z-10 text-center bg-white/90 p-8 rounded-3xl shadow-xl backdrop-blur-sm">
              <Palette size={40} className="mx-auto mb-4 text-purple-500" />
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 mb-2">Making it Pop!</h2>
              <p className="text-gray-500 text-sm">Adding the final splash of color.</p>
          </div>
      </div>
  );

  // 50. Dynamic Quotes
  const QuoteRotator = () => {
      const quotes = [
          "Good things come to those who wait.",
          "Rome wasn't built in a day.",
          "Quality takes time.",
          "Building the future, one line at a time."
      ];
      const [index, setIndex] = useState(0);
      useEffect(() => {
          const timer = setInterval(() => setIndex(i => (i + 1) % quotes.length), 3000);
          return () => clearInterval(timer);
      }, []);
      
      return <p className="italic text-lg font-serif text-gray-700 transition-opacity duration-500 min-h-[3rem]">"{quotes[index]}"</p>;
  };

  const renderQuotes = () => (
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#fdfbf7] min-h-[450px] flex items-center justify-center p-8 text-center border border-stone-200">
          <div className="max-w-md">
              <Quote size={40} className="mx-auto mb-6 text-stone-300 fill-stone-100" />
              <QuoteRotator />
              <div className="mt-8 w-16 h-1 bg-stone-200 mx-auto rounded-full"></div>
              <p className="text-stone-400 text-xs mt-4 uppercase tracking-widest">{title}</p>
          </div>
      </div>
  );

  return (
    <div className={`w-full ${fullPage ? 'min-h-[80vh] flex flex-col' : ''}`}>
      
      {showToast && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
            <Toast type="success" message="You've been added to the waitlist!" onClose={() => setShowToast(false)} />
         </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {variant === 'gradient' && renderGradient()}
        {variant === 'minimal' && renderMinimal()}
        {variant === 'typography' && renderTypography()}
        {variant === 'premium' && renderPremium()}
        
        {variant === 'blob' && renderBlob()}
        {variant === 'shapes' && renderShapes()}
        {variant === 'comic' && renderComic()}
        {variant === 'robot' && renderRobot()}
        {variant === 'classroom' && renderClassroom()}
        {variant === 'newspaper' && renderNewspaper()}
        {variant === 'space' && renderSpace()}
        {variant === 'nature' && renderNature()}
        {variant === 'hud' && renderHUD()}
        {variant === 'office' && renderOffice()}
        
        {variant === 'loader-ring' && renderLoaderRing()}
        {variant === 'shimmer' && renderShimmer()}
        {variant === 'timeline' && renderTimeline()}
        {variant === 'steps' && renderSteps()}
        {variant === 'graph' && renderGraph()}
        {variant === 'pulse' && renderPulse()}
        {variant === 'typing' && renderTyping()}
        {variant === 'wave' && renderWave()}
        {variant === 'dial' && renderDial()}
        {variant === 'cube' && renderCube()}

        {variant === 'blur-preview' && renderBlurPreview()}
        {variant === 'paywall' && renderPaywall()}
        {variant === 'frosted' && renderFrosted()}
        {variant === 'glowing-lock' && renderGlowingLock()}
        {variant === 'vip' && renderVIP()}
        {variant === 'dimmed' && renderDimmed()}
        {variant === 'folded' && renderFolded()}
        {variant === 'curtain' && renderCurtain()}
        {variant === 'key' && renderKey()}
        {variant === 'card-flip' && renderCardFlip()}

        {variant === 'pixel' && renderPixel()}
        {variant === 'breaking' && renderBreaking()}
        {variant === 'mascot' && renderMascot()}
        {variant === 'origami' && renderOrigami()}
        {variant === 'ferris' && renderFerris()}
        {variant === 'neon' && renderNeon()}
        {variant === 'blueprint' && renderBlueprint()}
        {variant === 'plane' && renderPlane()}
        {variant === 'burst' && renderBurst()}
        {variant === 'quotes' && renderQuotes()}
      </div>

      {/* Zero Dead Ends - Footer Actions (Only for Full Page mode) */}
      {fullPage && (
        <div className="mt-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Explore Other Features</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => navigate('/')} 
                    className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all group text-left"
                >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Home size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-gray-800 text-sm">Home Feed</span>
                        <span className="block text-xs text-gray-400">Back to start</span>
                    </div>
                </button>

                 <button 
                    onClick={() => navigate('/reel')} 
                    className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-pink-200 hover:shadow-md transition-all group text-left"
                >
                    <div className="p-2 bg-pink-50 text-pink-600 rounded-lg group-hover:bg-pink-100 transition-colors">
                        <Zap size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-gray-800 text-sm">News Reels</span>
                        <span className="block text-xs text-gray-400">Watch updates</span>
                    </div>
                </button>
            </div>

            <div className="mt-6 text-center">
                <button onClick={() => navigate(-1)} className="text-sm font-medium text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto">
                    <ArrowLeft size={14} /> Go Back to Previous Page
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ComingSoon;