import React from 'react';
import { Search } from 'lucide-react';
import GenericPageSkeleton from '../../components/skeletons/GenericPageSkeleton';

const SearchPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
             <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
                <div className="bg-gray-100 p-3 rounded-xl flex items-center gap-2">
                    <Search className="text-gray-400" size={20} />
                    <input className="bg-transparent outline-none w-full text-sm" placeholder="Search keywords, topics..." autoFocus />
                </div>
             </div>
             <div className="p-4">
                 <GenericPageSkeleton 
                    title="Search Engine"
                    gradient="bg-gradient-to-br from-orange-400 to-pink-500"
                    icon={<Search size={48} />}
                    features={["Semantic Search", "Filter by Date", "Topic Clustering"]}
                    showBack={false} // Header handled manually
                />
             </div>
        </div>
    )
};

export default SearchPage;