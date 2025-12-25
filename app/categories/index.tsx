
import React from 'react';
import { Grid } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Link } from 'react-router-dom';

const CategoriesPage = () => {
    const categories = [
        { id: 'politics', label: 'Politics', color: 'from-blue-100 to-blue-200' },
        { id: 'sports', label: 'Sports', color: 'from-green-100 to-green-200' },
        { id: 'business', label: 'Business', color: 'from-amber-100 to-amber-200' },
        { id: 'entertainment', label: 'Entertainment', color: 'from-pink-100 to-pink-200' },
        { id: 'technology', label: 'Technology', color: 'from-indigo-100 to-indigo-200' },
        { id: 'science', label: 'Science', color: 'from-teal-100 to-teal-200' },
        { id: 'world', label: 'World', color: 'from-sky-100 to-sky-200' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-24 transition-colors duration-300">
            <PageHeader title="Explore Topics" />
            <div className="p-4 grid grid-cols-2 gap-4">
                {categories.map(cat => (
                    <Link to={`/categories/${cat.id}`} key={cat.id} className={`h-28 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg font-bold text-gray-700 shadow-sm hover:scale-105 transition-transform hover:shadow-md border border-white/50`}>
                        {cat.label}
                    </Link>
                ))}
                
                <div className="col-span-2 mt-4 p-6 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center text-gray-400 dark:text-gray-500 transition-colors">
                    <Grid size={32} className="mb-2" />
                    <span className="text-sm">More categories loading...</span>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;
