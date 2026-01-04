
import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Bell, Zap, Bookmark, ShieldAlert, Settings, Info, MessageSquare, BrainCircuit, Check, Trash2, List, TrendingUp, Trophy, CloudRain } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNotification, NotificationType } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotification();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const getIcon = (type: NotificationType) => {
    switch(type) {
      case 'breaking': return <Zap size={20} className="text-red-500 fill-red-500" />;
      case 'personalized': return <Zap size={20} className="text-pink-500" />;
      case 'saved': return <Bookmark size={20} className="text-green-500 fill-green-500" />;
      case 'system': return <Settings size={20} className="text-gray-500 dark:text-gray-400" />;
      case 'ai': return <BrainCircuit size={20} className="text-indigo-500" />;
      case 'offline': return <Info size={20} className="text-blue-500" />;
      case 'digest': return <List size={20} className="text-orange-500" />;
      case 'market': return <TrendingUp size={20} className="text-green-600" />;
      case 'sports': return <Trophy size={20} className="text-amber-500" />;
      case 'weather': return <CloudRain size={20} className="text-blue-400" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
      switch(type) {
          case 'breaking': return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30';
          case 'ai': return 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30';
          case 'digest': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30';
          default: return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700';
      }
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  const handleNotificationClick = (id: string, link?: string) => {
      markAsRead(id);
      if (link) navigate(link);
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-black transition-colors duration-300 flex flex-col overflow-hidden">
      <div className="shrink-0">
        <PageHeader 
            title="Notifications" 
            showBack 
            action={
                <div className="flex gap-2">
                    <button onClick={markAllAsRead} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Mark all read"><Check size={18} /></button>
                    <button onClick={clearAll} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full" title="Clear all"><Trash2 size={18} /></button>
                </div>
            }
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2">
                {['all', 'breaking', 'digest', 'personalized', 'ai'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                            filter === f ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
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
                    onClick={() => handleNotificationClick(note.id, note.actionLink)}
                    className={`p-4 rounded-2xl border shadow-sm flex gap-4 items-start relative overflow-hidden transition-all hover:scale-[1.01] cursor-pointer ${getBgColor(note.type)} ${note.read ? 'opacity-70' : 'opacity-100'}`}
                >
                    {!note.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm shrink-0 mt-0.5 border border-gray-100 dark:border-gray-600">
                        {getIcon(note.type)}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start pr-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{note.type}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <h3 className={`text-sm font-bold leading-snug ${note.type === 'breaking' ? 'text-red-900 dark:text-red-300' : 'text-gray-900 dark:text-gray-100'}`}>
                            {note.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{note.body}</p>
                        
                        {/* 14.12 Context Info */}
                        {note.data?.context && (
                            <p className="text-[10px] text-indigo-500 dark:text-indigo-300 mt-1.5 font-medium italic">
                                ✦ {note.data.context}
                            </p>
                        )}

                        {/* Digest Items Preview in History */}
                        {note.data?.digestItems && (
                            <ul className="mt-2 list-disc list-inside text-[10px] text-gray-500 dark:text-gray-400">
                                {note.data.digestItems.slice(0, 2).map((item, i) => (
                                    <li key={i} className="truncate">{item}</li>
                                ))}
                            </ul>
                        )}
                        
                         {note.type === 'breaking' && !note.read && (
                            <div className="mt-2 flex gap-2">
                                <Button size="sm" variant="danger" className="py-1 text-[10px] h-7">Read Now</Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400 dark:text-gray-600">
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
