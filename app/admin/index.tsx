import React, { useState } from 'react';
import { ShieldAlert, BarChart, Users, FileText, Bell, Plus, Lock, LogOut } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/PageHeader';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'news' | 'notify'>('stats');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Mock validation
      if (email && password) {
          setIsLoggedIn(true);
      }
  };

  // 10.1 Admin Login Screen
  if (!isLoggedIn) {
      return (
          <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
              <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/50">
                      <ShieldAlert size={32} />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
                  <p className="text-gray-400">Authorized personnel only.</p>
              </div>
              
              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                  <Input 
                    placeholder="Admin ID" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
                  />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
                  />
                  <Button fullWidth variant="danger" className="mt-4 font-bold" rightIcon={<Lock size={16}/>}>
                      Access Dashboard
                  </Button>
              </form>
          </div>
      );
  }

  // 10.2 Dashboard Home
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
       <div className="bg-gray-900 text-white pb-12 pt-4 px-4 rounded-b-[2rem] shadow-xl">
           <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Admin Dashboard</h1>
                        <p className="text-xs text-gray-400">Welcome back, Super Admin</p>
                    </div>
                </div>
                <button onClick={() => setIsLoggedIn(false)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-300">
                    <LogOut size={18} />
                </button>
           </div>
           
           {/* Navigation Tabs */}
           <div className="flex p-1 bg-gray-800 rounded-xl">
                {[
                    { id: 'stats', label: 'Overview', icon: BarChart },
                    { id: 'news', label: 'News', icon: FileText },
                    { id: 'notify', label: 'Alerts', icon: Bell },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    )
                })}
           </div>
       </div>

       <div className="p-4 -mt-8 space-y-6">
            
            {/* STATS TAB */}
            {activeTab === 'stats' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase"><Users size={14}/> Active Users</div>
                            <p className="text-2xl font-black text-gray-900">12.5k</p>
                            <span className="text-xs text-green-500 font-medium">+5% this week</span>
                        </Card>
                        <Card className="p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase"><FileText size={14}/> Articles</div>
                            <p className="text-2xl font-black text-gray-900">1,204</p>
                            <span className="text-xs text-blue-500 font-medium">85 today</span>
                        </Card>
                    </div>
                    
                    <Card className="p-4">
                        <h3 className="font-bold mb-4">Engagement Overview</h3>
                        <div className="h-32 flex items-end justify-between gap-2 px-2">
                            {[40, 65, 45, 90, 30, 80, 55].map((h, i) => (
                                <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group">
                                    <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-700" style={{ height: `${h}%` }}></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400 font-mono">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </Card>
                </div>
            )}

            {/* NEWS MANAGEMENT TAB */}
            {activeTab === 'news' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <Button fullWidth leftIcon={<Plus size={18} />} className="shadow-blue-500/20">Upload New Article</Button>
                    
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Uploads</h3>
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-3 flex gap-3 items-center">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0">
                                    <img src={`https://picsum.photos/100/100?random=${i+20}`} className="w-full h-full object-cover rounded-lg" alt=""/>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm line-clamp-1">Global Summit Reaches Agreement on Climate Targets</h4>
                                    <p className="text-xs text-gray-500 mt-1">Uploaded 2h ago • Politics</p>
                                </div>
                                <button className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-50 rounded">Edit</button>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notify' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                     <Card className="p-5 border-l-4 border-l-red-500">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-red-500" /> Send Alert
                        </h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Title</label>
                                <Input placeholder="e.g. Breaking News: ..." />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Type</label>
                                <div className="flex gap-2">
                                    {['Breaking', 'Trending', 'System', 'Admin'].map(type => (
                                        <button key={type} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 focus:bg-gray-900 focus:text-white transition-colors">
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Channels</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> In-App</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Push</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Email</label>
                                </div>
                            </div>
                            
                            <Button fullWidth className="mt-2 bg-gray-900 hover:bg-black">Broadcast Notification</Button>
                        </div>
                     </Card>
                </div>
            )}
       </div>
    </div>
  );
};

export default AdminPage;