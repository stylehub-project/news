
import React from 'react';
import PageHeader from '../../components/PageHeader';
import { useHistory, HistoryItem } from '../../context/HistoryContext';
import { Clock, PlayCircle, FileText, ChevronRight, BarChart2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HistoryPage: React.FC = () => {
  const { getGroupedHistory, clearHistory, deleteHistoryItem, isPaused } = useHistory();
  const navigate = useNavigate();
  const groupedHistory = getGroupedHistory();

  const handleResume = (item: HistoryItem) => {
      if (item.type === 'article') {
          navigate(`/news/${item.id}?resume=true`);
      } else {
          navigate('/reel');
      }
  };

  const renderSection = (title: string, items: HistoryItem[]) => {
      if (items.length === 0) return null;

      return (
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{title}</h3>
              </div>
              
              <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-1 space-y-6">
                  {items.map((item) => (
                      <div key={item.id} className="relative pl-6 group">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 transition-colors ${item.progress > 90 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700 group-hover:bg-blue-500'}`}></div>
                          
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30 relative">
                              {/* 15.10 Delete Item */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                                title="Remove from history"
                              >
                                  <Trash2 size={14} />
                              </button>

                              <div onClick={() => handleResume(item)} className="cursor-pointer">
                                  <div className="flex justify-between items-start mb-2 pr-6">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'reel' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                          {item.type}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-mono">
                                          {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                  </div>
                                  
                                  <h4 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4">
                                      {item.title}
                                  </h4>

                                  {/* Progress Stats */}
                                  <div className="flex items-center justify-between mt-3">
                                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                          <div className="flex items-center gap-1">
                                              <BarChart2 size={12} /> 
                                              <span className="font-medium">{Math.round(item.progress)}% Read</span>
                                          </div>
                                          {item.audioProgress !== undefined && (
                                              <div className="flex items-center gap-1 text-purple-500">
                                                  <PlayCircle size={12} />
                                                  <span className="font-medium">Listened</span>
                                              </div>
                                          )}
                                      </div>
                                      
                                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Resume <ChevronRight size={12} />
                                      </span>
                                  </div>

                                  {/* Visual Progress Bar */}
                                  <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${item.progress}%` }}></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const hasHistory = Object.values(groupedHistory).some((g: HistoryItem[]) => g.length > 0);

  return (
    <div className="h-full bg-gray-50 dark:bg-black flex flex-col transition-colors">
        <PageHeader 
            title="Your Journey" 
            showBack 
            action={hasHistory && <button onClick={clearHistory} className="text-xs text-red-500 font-bold px-2">Clear All</button>}
        />
        
        {isPaused && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 text-center border-b border-yellow-100 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-bold">History tracking is paused</p>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {!hasHistory ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Clock size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No reading history yet.</p>
                    <button onClick={() => navigate('/')} className="text-blue-600 font-bold text-sm">Start Reading</button>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    {renderSection('Today', groupedHistory['Today'])}
                    {renderSection('Yesterday', groupedHistory['Yesterday'])}
                    {renderSection('This Week', groupedHistory['This Week'])}
                    {renderSection('Older', groupedHistory['Older'])}
                </div>
            )}
        </div>
    </div>
  );
};

export default HistoryPage;
