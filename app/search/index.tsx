import React, { useState } from 'react';
import { Search } from 'lucide-react';
import GenericPageSkeleton from '../../components/skeletons/GenericPageSkeleton';
import KeywordPulsingLoader from '../../components/loaders/KeywordPulsingLoader';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (e.target.value.length > 2) {
            setIsSearching(true);
            // Simulate API call
            setTimeout(() => setIsSearching(false), 3000);
        } else {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
             <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
                <div className="bg-gray-100 p-3 rounded-xl flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white transition-all">
                    <Search className="text-gray-400" size={20} />
                    <input 
                        className="bg-transparent outline-none w-full text-sm" 
                        placeholder="Search keywords, topics..." 
                        autoFocus 
                        value={query}
                        onChange={handleSearch}
                    />
                </div>
             </div>
             
             <div className="p-4">
                 {isSearching ? (
                     <div className="mt-12">
                        <KeywordPulsingLoader />
                     </div>
                 ) : (
                     <GenericPageSkeleton 
                        title="Search Engine"
                        gradient="bg-gradient-to-br from-orange-400 to-pink-500"
                        icon={<Search size={48} />}
                        features={["Semantic Search", "Filter by Date", "Topic Clustering"]}
                        showBack={false}
                    />
                 )}
             </div>
        </div>
    )
};

export default SearchPage;