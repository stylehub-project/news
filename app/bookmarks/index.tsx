import React, { useState, useEffect } from 'react';
import { Bookmark, Grid, List, Trash2, Filter, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BookmarkCard from '../../components/cards/BookmarkCard';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import Button from '../../components/ui/Button';

const BookmarksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'category'>('newest');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
      // Load from local storage
      try {
          const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
          setItems(saved);
      } catch (e) {
          console.error("Failed to load bookmarks", e);
      }
  }, []);

  const updateStorage = (newItems: any[]) => {
      setItems(newItems);
      localStorage.setItem('bookmarks', JSON.stringify(newItems));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    const newItems = items.filter(item => !selectedIds.includes(item.id));
    updateStorage(newItems);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const handleDeleteOne = (id: string) => {
      const newItems = items.filter(item => item.id !== id);
      updateStorage(newItems);
  };

  const sortedItems = [...items].sort((a, b) => {
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      // Mock newest sort by assuming array order or check savedAt date string parsing
      return 0; 
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900 transition-colors">
      <PageHeader 
        title={isSelectionMode ? `${selectedIds.length} Selected` : "Saved Stories"} 
        action={
            <button 
                onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedIds([]);
                }}
                className={`text-sm font-bold ${isSelectionMode ? 'text-blue-600' : 'text-gray-500'}`}
            >
                {isSelectionMode ? 'Done' : 'Manage'}
            </button>
        }
      />

      {/* Controls */}
      {!isSelectionMode && items.length > 0 && (
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-[57px] z-30 transition-colors">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Sort:</span>
                <select 
                    className="text-sm font-bold bg-transparent outline-none dark:text-white"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                >
                    <option value="newest">Newest</option>
                    <option value="category">Category</option>
                </select>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                >
                    <List size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}
                >
                    <Grid size={16} />
                </button>
            </div>
        </div>
      )}

      {/* Content */}
      <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
        {sortedItems.length === 0 ? (
            <div className="col-span-2 text-center py-20 text-gray-400">
                <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
                <p>No saved stories yet.</p>
            </div>
        ) : (
            sortedItems.map(item => {
                const isSelected = selectedIds.includes(item.id);
                return (
                    <div 
                        key={item.id} 
                        className="relative group cursor-pointer"
                        onClick={() => isSelectionMode ? toggleSelection(item.id) : null}
                    >
                        {/* Selection Overlay */}
                        {isSelectionMode && (
                            <div className={`absolute inset-0 z-20 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-transparent'}`}>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                    {isSelected && <CheckCircle size={14} className="text-white" />}
                                </div>
                            </div>
                        )}

                        {viewMode === 'list' ? (
                            <BookmarkCard
                                {...item}
                                onRemove={!isSelectionMode ? handleDeleteOne : undefined}
                            />
                        ) : (
                            <div className="h-full">
                                <NewsCardBasic 
                                    {...item}
                                    description={item.description || "Saved for later reading."}
                                    timeAgo={item.savedAt}
                                />
                            </div>
                        )}
                    </div>
                );
            })
        )}
      </div>

      {/* Bulk Delete Bar */}
      {isSelectionMode && selectedIds.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 z-40 cursor-pointer hover:bg-red-700 transition-colors" onClick={handleDeleteSelected}>
              <Trash2 size={18} />
              <span className="font-bold text-sm">Delete {selectedIds.length}</span>
          </div>
      )}
    </div>
  );
};

export default BookmarksPage;
