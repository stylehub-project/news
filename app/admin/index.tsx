
import React, { useState } from 'react';
import { ShieldAlert, BarChart, FileText, Bell, Lock, LogOut, BrainCircuit, Sliders, Bot, ShieldCheck } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { AnalyticsPanel, AIConfigPanel, FeaturesPanel, CopilotPanel } from './panels';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'ai' | 'features' | 'copilot'>('stats');

  // Login State
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Simple mock check
      if (key === 'admin123' || key === 'secret') {
          setIsLoggedIn(true);
          setError('');
      } else {
          setError('Invalid Admin Key');
      }
  };

  // 17.1 Admin Login Screen
  if (!isLoggedIn) {
      return (
          <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
              {/* Security Background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_100%)] opacity-80 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

              <div className="relative z-10 w-full max-w-sm">
                  <div className="mb-8 text-center">
                      <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative group">
                          <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <ShieldAlert size={32} className="text-red-500 relative z-10" />
                      </div>
                      <h1 className="text-3xl font-black tracking-tight mb-2">Restricted Access</h1>
                      <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">System Governance Console</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-4 bg-gray-900/50 backdrop-blur-md p-8 rounded-3xl border border-gray-800 shadow-xl">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Access Key</label>
                          <Input 
                            type="password" 
                            placeholder="••••••••••••" 
                            value={key} 
                            onChange={(e) => setKey(e.target.value)}
                            className="bg-black border-gray-800 text-white placeholder:text-gray-700 font-mono tracking-widest text-center focus:border-red-900 focus:ring-1 focus:ring-red-900"
                          />
                      </div>
                      
                      {error && <p className="text-red-500 text-xs text-center font-bold animate-pulse">{error}</p>}

                      <Button fullWidth className="bg-white text-black hover:bg-gray-200 mt-2 h-12 font-bold shadow-lg" rightIcon={<Lock size={16}/>}>
                          Authenticate
                      </Button>
                  </form>
                  
                  <div className="mt-8 text-center opacity-30 hover:opacity-50 transition-opacity">
                      <p className="text-[10px] text-gray-500 font-mono">ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                  </div>
              </div>
          </div>
      );
  }

  // 17.0 Admin Dashboard
  return (
    <div className="min-h-screen bg-[#050505] pb-24 text-gray-100 font-sans selection:bg-red-500/30">
       {/* Top Nav */}
       <div className="bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50">
           <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
                        <ShieldCheck size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm leading-none text-white tracking-wide">ADMIN CONSOLE</h1>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">v2.4.0 • LIVE</p>
                    </div>
                </div>
                <button onClick={() => setIsLoggedIn(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors">
                    <LogOut size={18} />
                </button>
           </div>
           
           {/* Navigation Tabs */}
           <div className="flex px-4 gap-2 overflow-x-auto scrollbar-hide pb-0">
                {[
                    { id: 'stats', label: 'Overview', icon: BarChart },
                    { id: 'ai', label: 'AI Brain', icon: BrainCircuit },
                    { id: 'features', label: 'Features', icon: Sliders },
                    { id: 'copilot', label: 'Copilot', icon: Bot },
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all text-sm font-bold whitespace-nowrap ${isActive ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    )
                })}
           </div>
       </div>

       {/* Content Area */}
       <div className="p-4 max-w-5xl mx-auto mt-4">
            {activeTab === 'stats' && <AnalyticsPanel />}
            {activeTab === 'ai' && <AIConfigPanel />}
            {activeTab === 'features' && <FeaturesPanel />}
            {activeTab === 'copilot' && <CopilotPanel />}
       </div>
    </div>
  );
};

export default AdminPage;
