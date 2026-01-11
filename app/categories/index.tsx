
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Landmark, Briefcase, Trophy, FlaskConical, Cpu, Film, Leaf, HeartPulse, Plane, Sparkles, Zap, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import CategoryCard from '../../components/cards/CategoryCard';
import Sheet from '../../components/ui/Sheet';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = [
    { id: 'world', label: 'World', icon: <Globe size={24} />, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600', trending: true },
    { id: 'politics', label: 'Politics', icon: <Landmark size={24} />, gradient: 'bg-gradient-to-br from-red-500 to-rose-600', trending: true },
    { id: 'business', label: 'Business', icon: <Briefcase size={24} />, gradient: 'bg-gradient-to-br from-slate-600 to-slate-800' },
    { id: 'technology', label: 'Technology', icon: <Cpu size={24} />, gradient: 'bg-gradient-to-br from-violet-500 to-purple-600', trending: true },
    { id: 'science', label: 'Science', icon: <FlaskConical size={24} />, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { id: 'sports', label: 'Sports', icon: <Trophy size={24} />, gradient: 'bg-gradient-to-br from-orange-400 to-red-500' },
    { id: 'entertainment', label: 'Entertainment', icon: <Film size={24} />, gradient: 'bg-gradient-to-br from-pink-500 to-fuchsia-600' },
    { id: 'environment', label: 'Environment', icon: <Leaf size={24} />, gradient: 'bg-gradient-to-br from-green-500 to-emerald-700' },
    { id: 'health', label: 'Health', icon: <HeartPulse size={24} />, gradient: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
    { id: 'travel', label: 'Travel', icon: <Plane size={24} />, gradient: 'bg-gradient-to-br from-yellow-400 to-amber-500' },
];

const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
    world: { en: 'World', hi: 'दुनिया', es: 'Mundo', fr: 'Monde' },
    politics: { en: 'Politics', hi: 'राजनीति', es: 'Política', fr: 'Politique' },
    business: { en: 'Business', hi: 'व्यापार', es: 'Negocios', fr: 'Affaires' },
    technology: { en: 'Technology', hi: 'प्रौद्योगिकी', es: 'Tecnología', fr: 'Technologie' },
    science: { en: 'Science', hi: 'विज्ञान', es: 'Ciencia', fr: 'Science' },
    sports: { en: 'Sports', hi: 'खेल', es: 'Deportes', fr: 'Sports' },
    entertainment: { en: 'Entertainment', hi: 'मनोरंजन', es: 'Entretenimiento', fr: 'Divertissement' },
    environment: { en: 'Environment', hi: 'पर्यावरण', es: 'Medio Ambiente', fr: 'Environnement' },
    health: { en: 'Health', hi: 'स्वास्थ्य', es: 'Salud', fr: 'Santé' },
    travel: { en: 'Travel', hi: 'यात्रा', es: 'Viajes', fr: 'Voyage' },
};

const CategoriesPage = () => {
    const navigate = useNavigate();
    const { contentLanguage } = useLanguage();
    const [previewCategory, setPreviewCategory] = useState<string | null>(null);

    const handleCategoryClick = (id: string) => {
        // Handle special routes or generic category page
        if (id === 'politics') navigate('/categories/politics');
        else if (id === 'technology') navigate('/categories/technology');
        else navigate(`/category/${id}`);
    };

    const handleLongPress = (id: string) => {
        setPreviewCategory(id);
    };

    const selectedCategory = CATEGORIES.find(c => c.id === previewCategory);
    const selectedLabel = selectedCategory ? (CATEGORY_TRANSLATIONS[selectedCategory.id]?.[contentLanguage] || selectedCategory.label) : '';

    return (
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-black pb-24 transition-colors duration-300">
            <PageHeader title="Explore Topics" showBack />
            
            <div className="p-4">
                <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-900 w-fit px-3 py-1.5 rounded-full">
                    <Sparkles size={12} className="text-indigo-500" />
                    <span>Tip: Long-press a card for AI Insights</span>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {CATEGORIES.map((cat, index) => (
                        <div key={cat.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards">
                            <CategoryCard
                                {...cat}
                                label={CATEGORY_TRANSLATIONS[cat.id]?.[contentLanguage] || cat.label}
                                onClick={handleCategoryClick}
                                onLongPress={handleLongPress}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Long Press AI Sheet */}
            <Sheet isOpen={!!previewCategory} onClose={() => setPreviewCategory(null)} title={selectedLabel}>
                <div className="space-y-5 pb-4">
                    {/* Header Card */}
                    <div className={`p-5 rounded-2xl ${selectedCategory?.gradient} text-white shadow-xl relative overflow-hidden`}>
                        <div className="absolute right-0 top-0 p-4 opacity-10 scale-150">
                            {selectedCategory?.icon}
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg">
                                    <Zap size={16} className="text-yellow-300 fill-yellow-300" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Live Trend Analysis</span>
                            </div>
                            <h3 className="text-lg font-bold leading-tight mb-2">Why is {selectedLabel} trending?</h3>
                            <p className="text-sm font-medium leading-relaxed opacity-90">
                                High volume of breaking stories detected in the last 4 hours. 
                                Key themes include <span className="font-bold border-b border-white/30">Innovation</span>, <span className="font-bold border-b border-white/30">Global Policy</span>, and <span className="font-bold border-b border-white/30">Market Shifts</span>.
                            </p>
                        </div>
                    </div>
                    
                    {/* Quick Stats (Mock) */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
                            <span className="block text-lg font-black text-gray-900 dark:text-white">124</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">New Stories</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
                            <span className="block text-lg font-black text-green-500">+15%</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Engagement</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
                            <span className="block text-lg font-black text-blue-500">High</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Relevance</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button 
                            fullWidth 
                            variant="primary"
                            className="bg-gray-900 text-white dark:bg-white dark:text-black"
                            onClick={() => {
                                if (previewCategory) handleCategoryClick(previewCategory);
                                setPreviewCategory(null);
                            }}
                        >
                            Open Feed
                        </Button>
                        <Button 
                            fullWidth 
                            variant="secondary"
                            onClick={() => {
                                navigate(`/ai-chat?topic=${encodeURIComponent(selectedLabel || '')}`);
                                setPreviewCategory(null);
                            }}
                            leftIcon={<MessageSquare size={16} />}
                        >
                            Ask AI Agent
                        </Button>
                    </div>
                </div>
            </Sheet>
        </div>
    );
};

export default CategoriesPage;
