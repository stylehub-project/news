
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import KeywordPulsingLoader from '../../components/loaders/KeywordPulsingLoader';
import { fetchNewsFeed } from '../../utils/aiService';
import { useLanguage } from '../../context/LanguageContext';

const SearchPage = () => {
    const navigate = useNavigate();
    const { contentLanguage } = useLanguage();
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) return;
        
        setIsSearching(true);
        setHasSearched(true);
        
        try {
            const langName = contentLanguage === 'hi' ? 'Hindi' : 'English';
            // Use the query as the category to trick the AI service into searching for this topic
            const data = await fetchNewsFeed(1, { 
                category: searchTerm, 
                sort: 'Relevance', 
                language: langName,
                filter: 'Search' 
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
            performSearch(query);
        }
    };

    const handleCardClick = (id: string) => {
        navigate(`/news/${id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 flex flex-col">
             <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all shadow-sm">
                    {isSearching ? <Loader2 className="animate-spin text-blue-500" size={20} /> : <Search className="text-gray-400" size={20} />}
                    <input 
                        className="bg-transparent outline-none w-full text-sm dark:text-white dark:placeholder:text-gray-500 font-medium" 
                        placeholder="Search keywords, topics..." 
                        autoFocus 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
             </div>
             
             <div className="flex-1 p-4">
                 {isSearching ? (
                     <div className="mt-12">
                        <KeywordPulsingLoader keywords={[query || "Analyzing", "Fetching", "Summarizing"]} />
                     </div>
                 ) : (
                     <div className="space-y-4">
                        {!hasSearched && (
                            <div className="text-center text-gray-400 mt-20">
                                <Search size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm">Type to search for global news</p>
                            </div>
                        )}

                        {hasSearched && results.length === 0 && (
                            <div className="text-center text-gray-500 mt-20">
                                <p>No results found for "{query}".</p>
                            </div>
                        )}

                        {results.map((article) => (
                            <NewsCardBasic 
                                key={article.id}
                                {...article}
                                onClick={handleCardClick}
                                onAIExplain={() => navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}`)}
                            />
                        ))}
                     </div>
                 )}
             </div>
        </div>
    )
};

export default SearchPage;
