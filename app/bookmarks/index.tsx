import React, { useState } from 'react';
import { Bookmark, Grid, List, Trash2, Filter, CheckCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import BookmarkCard from '../../components/cards/BookmarkCard';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import Button from '../../components/ui/Button';

// Mock Data
const SAVED_ITEMS = [
    { id: '1', title: 'The Future of AI', source: 'TechCrunch', savedAt: '2h ago', category: 'Tech', imageUrl: 'https://picsum.photos/300/200?random=1' },
    { id: '2', title: 'Global Climate Summit', source: 'BBC', savedAt: '1d ago', category: 'World', imageUrl: 'https://picsum.photos/300/200?random=2' },
    { id: '3', title: 'SpaceX Launch', source: 'SpaceNews', savedAt: '3d ago', category: 'Science', imageUrl: 'https://picsum.photos/300/200?random=3' },
    { id: '4', title: 'Market Rally', source: 'Bloomberg', savedAt: '4d ago', category: 'Business', imageUrl: 'https://picsum.photos/300/200?random=4' },
    { id: '5', title: 'Championship Finals', source: 'ESPN', savedAt: '5d ago', category: 'Sports', imageUrl: 'https://picsum.photos/300/200?random=5' },
];

const BookmarksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'category'>('newest');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [items, setItems] = useState(SAVED_ITEMS);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const sortedItems = [...items].sort((a, b) => {
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0; // Default Mock order is newest
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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

      {/* 12.1 Controls */}
      {!isSelectionMode && (
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center sticky top-[57px] z-30">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Sort:</span>
                <select 
                    className="text-sm font-bold bg-transparent outline-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                >
                    <option value="newest">Newest</option>
                    <option value="category">Category</option>
                </select>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                >
                    <List size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                >
                    <Grid size={16} />
                </button>
            </div>
        </div>
      )}

      {/* Content */}
      <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
        {sortedItems.map(item => {
            const isSelected = selectedIds.includes(item.id);
            return (
                <div 
                    key={item.id} 
                    className="relative group cursor-pointer"
                    onClick={() => isSelectionMode ? toggleSelection(item.id) : null}
                >
                    {/* Selection Overlay */}
                    {isSelectionMode && (
                        <div className={`absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-transparent'}`}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                {isSelected && <CheckCircle size={14} className="text-white" />}
                            </div>
                        </div>
                    )}

                    {viewMode === 'list' ? (
                        <BookmarkCard
                            {...item}
                            // If selection mode is active, disable card internal actions
                            onRemove={!isSelectionMode ? (id) => setItems(prev => prev.filter(i => i.id !== id)) : undefined}
                        />
                    ) : (
                        <div className="h-full">
                            <NewsCardBasic 
                                {...item}
                                description="Saved for later reading."
                                timeAgo={item.savedAt}
                                // Hide actions in grid view for cleaner look in bookmarks
                            />
                        </div>
                    )}
                </div>
            );
        })}
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