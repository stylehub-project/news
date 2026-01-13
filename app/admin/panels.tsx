
import React, { useState, useEffect } from 'react';
import { BarChart3, BrainCircuit, Shield, Activity, Save, RefreshCw, Sliders, ToggleLeft, ToggleRight, Mic, Send, Bot } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { AdminConfig, getAdminConfig, saveAdminConfig } from '../../utils/adminConfig';
import { GoogleGenAI } from "@google/genai";

// --- PANEL 1: ANALYTICS ---
export const AnalyticsPanel = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Sessions', value: '1,240', change: '+12%', color: 'text-green-400' },
                    { label: 'Avg Read Time', value: '4m 32s', change: '+5%', color: 'text-blue-400' },
                    { label: 'AI Requests', value: '45.2k', change: '+28%', color: 'text-purple-400' },
                    { label: 'Error Rate', value: '0.4%', change: '-2%', color: 'text-green-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-end gap-2 mt-1">
                            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                            <span className={`text-xs font-bold ${stat.color} mb-1`}>{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white flex items-center gap-2"><Activity size={18} className="text-blue-500" /> Live Usage Heatmap</h3>
                    <div className="flex gap-2">
                        {['1h', '24h', '7d'].map(t => <button key={t} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-gray-300">{t}</button>)}
                    </div>
                </div>
                <div className="h-48 flex items-end justify-between gap-1">
                    {[...Array(40)].map((_, i) => {
                        const height = Math.random() * 100;
                        const opacity = 0.3 + (height / 200);
                        return (
                            <div key={i} className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-400" style={{ height: `${height}%`, opacity }}></div>
                        )
                    })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                </div>
            </div>
        </div>
    );
};

// --- PANEL 2: AI BRAIN ---
export const AIConfigPanel = () => {
    const [config, setConfig] = useState<AdminConfig>(getAdminConfig());
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        saveAdminConfig(config);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const updatePersona = (key: keyof AdminConfig['aiPersona'], value: any) => {
        setConfig(prev => ({
            ...prev,
            aiPersona: { ...prev.aiPersona, [key]: value }
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 border-l-4 border-l-purple-500">
                <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><BrainCircuit size={20} className="text-purple-500" /> AI Personality Matrix</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Response Tone</label>
                        <div className="flex bg-gray-900 p-1 rounded-lg">
                            {['neutral', 'concise', 'explanatory', 'witty'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => updatePersona('tone', t)}
                                    className={`flex-1 py-2 text-xs font-bold capitalize rounded transition-all ${config.aiPersona.tone === t ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Creativity (Temperature)</label>
                            <span className="text-xs font-mono text-purple-400">{config.aiPersona.creativity}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.1" 
                            value={config.aiPersona.creativity}
                            onChange={(e) => updatePersona('creativity', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">System Prompt Override</label>
                        <textarea 
                            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm text-white font-mono focus:border-purple-500 outline-none"
                            placeholder="Enter custom system instructions here..."
                            value={config.aiPersona.systemPromptOverride}
                            onChange={(e) => updatePersona('systemPromptOverride', e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSave} className={`font-bold transition-all ${isSaved ? 'bg-green-600' : 'bg-white text-black'}`}>
                        {isSaved ? 'Settings Applied' : 'Save Configuration'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- PANEL 3: FEATURES ---
export const FeaturesPanel = () => {
    const [config, setConfig] = useState<AdminConfig>(getAdminConfig());

    const toggleFeature = (key: keyof AdminConfig['features']) => {
        const states: AdminConfig['features'][keyof AdminConfig['features']][] = ['live', 'beta', 'maintenance', 'hidden'];
        const currentIdx = states.indexOf(config.features[key]);
        const nextState = states[(currentIdx + 1) % states.length];
        
        const newConfig = {
            ...config,
            features: { ...config.features, [key]: nextState }
        };
        setConfig(newConfig);
        saveAdminConfig(newConfig);
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'live': return 'text-green-400 bg-green-900/20 border-green-800';
            case 'beta': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
            case 'maintenance': return 'text-red-400 bg-red-900/20 border-red-800';
            default: return 'text-gray-500 bg-gray-900 border-gray-800';
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2"><Sliders size={20} className="text-blue-500" /> Feature Flags</h3>
                
                <div className="space-y-4">
                    {Object.entries(config.features).map(([key, status]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                            <div>
                                <h4 className="font-bold text-white capitalize">{key} Module</h4>
                                <p className="text-xs text-gray-500">Controls visibility and access to {key}</p>
                            </div>
                            <button 
                                onClick={() => toggleFeature(key as any)}
                                className={`px-4 py-2 rounded-lg border text-xs font-black uppercase tracking-wider transition-all min-w-[100px] ${getStatusColor(status as string)}`}
                            >
                                {status as string}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- PANEL 4: COPILOT ---
export const CopilotPanel = () => {
    const [messages, setMessages] = useState<{role: 'admin'|'ai', text: string}[]>([
        { role: 'ai', text: "Ready for commands. I can analyze logs, adjust filters, or provide summaries." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'admin', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        try {
            // Mock AI Admin logic or hook into real API if desired
            setTimeout(() => {
                let response = "I've processed that request.";
                if (userMsg.toLowerCase().includes('stat')) response = "User engagement is up 15% today. The 'Tech' category is trending.";
                if (userMsg.toLowerCase().includes('block')) response = "Scanning content sources. 2 suspicious domains identified.";
                
                setMessages(prev => [...prev, { role: 'ai', text: response }]);
                setIsTyping(false);
            }, 1000);
        } catch (e) {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                    <Bot size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">Admin Copilot</h3>
                    <p className="text-xs text-gray-400">System Level Intelligence</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'admin' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-700 text-gray-200 rounded-tl-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700 px-4 py-2 rounded-full rounded-tl-none flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-700 flex gap-2">
                <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Type a command..." 
                    className="bg-gray-800 border-gray-700 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} variant="icon-button" className="bg-indigo-600 text-white hover:bg-indigo-700"><Send size={18} /></Button>
            </div>
        </div>
    );
};
