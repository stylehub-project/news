import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Bell, Zap, Bookmark, ShieldAlert, Settings, Info, MessageSquare } from 'lucide-react';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';

// 9.1 Message Types Data
const NOTIFICATIONS = [
  { id: '1', type: 'breaking', title: 'Breaking: Market Hits All-Time High', time: '2m ago', read: false },
  { id: '2', type: 'trending', title: 'Trending: "AI Regulation" is viral in Tech', time: '1h ago', read: false },
  { id: '3', type: 'system', title: 'System Update 2.0 is live', time: '3h ago', read: true },
  { id: '4', type: 'saved', title: 'Update on saved story: "Mars Mission"', time: '5h ago', read: true },
  { id: '5', type: 'admin', title: 'Admin: Please update your profile', time: '1d ago', read: true },
];

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const getIcon = (type: string) => {
    switch(type) {
      case 'breaking': return <Zap size={20} className="text-red-500 fill-red-500" />;
      case 'trending': return <Zap size={20} className="text-blue-500" />;
      case 'saved': return <Bookmark size={20} className="text-green-500 fill-green-500" />;
      case 'admin': return <ShieldAlert size={20} className="text-purple-500" />;
      case 'system': return <Settings size={20} className="text-gray-500" />;
      default: return <Info size={20} className="text-gray-400" />;
    }
  };

  const getBgColor = (type: string) => {
      switch(type) {
          case 'breaking': return 'bg-red-50 border-red-100';
          case 'admin': return 'bg-purple-50 border-purple-100';
          default: return 'bg-white border-gray-100';
      }
  };

  const filtered = filter === 'all' ? NOTIFICATIONS : NOTIFICATIONS.filter(n => n.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Notifications" showBack />
      
      <div className="p-4">
        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2">
                {['all', 'breaking', 'trending', 'saved', 'admin'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                            filter === f ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        {/* List */}
        <div className="space-y-3">
            {filtered.map((note) => (
                <div 
                    key={note.id} 
                    className={`p-4 rounded-2xl border shadow-sm flex gap-4 items-start relative overflow-hidden transition-all hover:scale-[1.01] ${getBgColor(note.type)}`}
                >
                    {!note.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    
                    <div className="p-2 bg-white rounded-full shadow-sm shrink-0 mt-0.5 border border-gray-100">
                        {getIcon(note.type)}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start pr-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">{note.type}</span>
                            <span className="text-[10px] text-gray-400">{note.time}</span>
                        </div>
                        <h3 className={`text-sm font-bold leading-snug ${note.type === 'breaking' ? 'text-red-900' : 'text-gray-900'}`}>
                            {note.title}
                        </h3>
                        {note.type === 'admin' && (
                            <p className="text-xs text-gray-600 mt-1">Tap to view full message from the editorial team.</p>
                        )}
                         {note.type === 'breaking' && (
                            <div className="mt-2 flex gap-2">
                                <Button size="sm" variant="danger" className="py-1 text-[10px] h-7">Read Now</Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Bell size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No notifications found.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;