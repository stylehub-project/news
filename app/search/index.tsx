
import React, { useState } from 'react';
import { Search, X, Filter, SlidersHorizontal, FileText, User, Tag, Globe, Image as ImageIcon, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import SearchLoadingState from '../../components/loaders/SearchLoadingState';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';

const SearchPage = () => {
    const navigate = useNavigate();
    const { contentLanguage } = useLanguage();
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    
    // Filter State
    const [activeFilter, setActiveFilter] = useState('All');

    const FILTERS = [
        { id: 'All', label: 'All', icon: Layout },
        { id: 'Headlines', label: 'Headlines', icon: FileText },
        { id: 'Description', label: 'Details', icon: AlignLeftIcon }, // Custom Icon below
        { id: 'Source', label: 'Sources', icon: Globe },
        { id: 'Topics', label: 'Topics', icon: Tag },
    ];

    const performSearch = async (searchTerm: string, filterType: string) => {
        if (!searchTerm.trim()) return;
        
        setIsSearching(true);
        setHasSearched(true);
        setResults([]); // Clear previous
        
        try {
            const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
            
            // Pass the filter type to the AI/API service
            const data = await fetchNewsFeed(1, { 
                category: searchTerm, 
                sort: 'Relevance', 
                language: langName,
                filter: filterType === 'All' ? 'General' : filterType, // Map filter to context
                searchField: filterType // Explicit field instruction
            });
            
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            performSearch(query, activeFilter);
        }
    };

    const handleFilterChange = (id: string) => {
        setActiveFilter(id);
        if (query.trim()) {
            performSearch(query, id);
        }
    };

    const handleCardClick = (id: string) => {
        navigate(`/news/${id}`);
    };

    const clearSearch = () => {
        setQuery('');
        setHasSearched(false);
        setResults([]);
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-black transition-colors duration-300 flex flex-col overflow-hidden">
             {/* Sticky Header Container */}
             <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 pb-2">
                
                {/* Search Input Bar */}
                <div className="px-4 py-3">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white dark:focus-within:bg-black transition-all shadow-sm border border-transparent focus-within:border-blue-500/30">
                        <div className="pl-3 text-gray-400">
                            <Search size={20} />
                        </div>
                        <input 
                            className="bg-transparent outline-none w-full text-base py-2 dark:text-white dark:placeholder:text-gray-500 font-medium" 
                            placeholder={`Search ${activeFilter.toLowerCase()}...`}
                            autoFocus 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        {query && (
                            <button onClick={clearSearch} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Chips - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
                    {FILTERS.map((f) => {
                        const Icon = f.icon;
                        const isActive = activeFilter === f.id;
                        return (
                            <button
                                key={f.id}
                                onClick={() => handleFilterChange(f.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                    isActive 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon size={12} />
                                {f.label}
                            </button>
                        )
                    })}
                </div>
             </div>
             
             {/* Scrollable Results Area */}
             <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar">
                 {isSearching ? (
                     <SearchLoadingState query={query} filter={activeFilter} />
                 ) : (
                     <div className="space-y-4">
                        {!hasSearched && (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 opacity-60">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <Search size={32} />
                                </div>
                                <p className="text-sm font-bold">Discover the world</p>
                                <p className="text-xs">Search for topics, sources, or keywords</p>
                            </div>
                        )}

                        {hasSearched && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                                    <SlidersHorizontal size={24} />
                                </div>
                                <p className="font-bold">No results found for "{query}".</p>
                                <p className="text-xs mt-1">Try changing the filter or keyword.</p>
                            </div>
                        )}

                        {results.map((article, index) => (
                            <div key={article.id + index} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                                <NewsCardBasic 
                                    {...article}
                                    onClick={handleCardClick}
                                    onAIExplain={() => navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}`)}
                                />
                            </div>
                        ))}
                        
                        {/* Bottom Padding */}
                        {results.length > 0 && <div className="h-8"></div>}
                     </div>
                 )}
             </div>
        </div>
    )
};

// Helper Icon
const AlignLeftIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <line x1="21" y1="6" x2="3" y2="6"></line>
        <line x1="15" y1="12" x2="3" y2="12"></line>
        <line x1="17" y1="18" x2="3" y2="18"></line>
    </svg>
);

export default SearchPage;
