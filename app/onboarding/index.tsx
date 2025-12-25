
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, ChevronRight, Globe, Moon, Sun, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import SmartLoader from '../../components/loaders/SmartLoader';

const INTERESTS = [
    { id: 'world', label: 'World News', emoji: '🌍' },
    { id: 'politics', label: 'Politics', emoji: '⚖️' },
    { id: 'tech', label: 'Technology', emoji: '💻' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'science', label: 'Science', emoji: '🧬' },
    { id: 'business', label: 'Business', emoji: '📈' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
    { id: 'health', label: 'Health', emoji: '🏥' },
    { id: 'travel', label: 'Travel', emoji: '✈️' },
];

const LANGUAGES = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'es', label: 'Spanish', native: 'Español' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'fr', label: 'French', native: 'Français' },
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      // Complete onboarding and show loader
      setIsSubmitting(true);
      setTimeout(() => {
          navigate('/');
      }, 4500);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isSubmitting) {
      return <SmartLoader type="profile" />;
  }

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800 z-20">
        <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-6 pt-12 max-w-md mx-auto">
            
            {/* Header */}
            <div className="mb-8">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 block">Step {step} of {totalSteps}</span>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {step === 1 && "Create your profile"}
                    {step === 2 && "Choose your language"}
                    {step === 3 && "Customize appearance"}
                    {step === 4 && "Select your interests"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                    {step === 1 && "Let's get to know you better."}
                    {step === 2 && "Which language do you prefer for news?"}
                    {step === 3 && "Choose a theme that fits your style."}
                    {step === 4 && "We'll curate a feed just for you."}
                </p>
            </div>

            {/* Step 1: Profile */}
            {step === 1 && (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="relative mb-8 group cursor-pointer">
                        <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                            <Camera size={32} className="text-gray-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                            <Check size={16} />
                        </div>
                    </div>
                    
                    <div className="w-full space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                <input 
                                    type="text" 
                                    placeholder="johndoe"
                                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Language */}
            {step === 2 && (
                <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-right-8 duration-500">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code as any)}
                            className="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all group focus:outline-none focus:border-blue-500"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm text-lg">
                                    <Globe size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{lang.label}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{lang.native}</p>
                                </div>
                            </div>
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 group-focus:border-blue-600 group-focus:bg-blue-600 flex items-center justify-center">
                                <Check size={12} className="text-white opacity-0 group-focus:opacity-100" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 3: Theme */}
            {step === 3 && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-right-8 duration-500">
                    <button onClick={() => setTheme('light')} className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:border-blue-500 transition-all flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                            <Sun size={24} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">Light Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Classic bright appearance</p>
                        </div>
                    </button>

                    <button onClick={() => setTheme('dark')} className="p-4 rounded-xl border-2 border-gray-800 bg-gray-900 text-white shadow-sm hover:border-blue-500 transition-all flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-gray-800 text-blue-400 rounded-full flex items-center justify-center border border-gray-700">
                            <Moon size={24} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-bold">Dark Mode</h3>
                            <p className="text-sm text-gray-400">Easy on the eyes</p>
                        </div>
                    </button>

                    <button onClick={() => setTheme('amoled')} className="p-4 rounded-xl border-2 border-black bg-black text-white shadow-sm hover:border-blue-500 transition-all flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-gray-900 text-purple-400 rounded-full flex items-center justify-center border border-gray-800">
                            <Smartphone size={24} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-bold">AMOLED</h3>
                            <p className="text-sm text-gray-400">Pure black for OLED screens</p>
                        </div>
                    </button>
                </div>
            )}

            {/* Step 4: Interests */}
            {step === 4 && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-8 duration-500">
                    {INTERESTS.map((interest) => {
                        const isSelected = selectedInterests.includes(interest.id);
                        return (
                            <button
                                key={interest.id}
                                onClick={() => toggleInterest(interest.id)}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center aspect-square ${
                                    isSelected 
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-600'
                                }`}
                            >
                                <span className="text-3xl mb-1">{interest.emoji}</span>
                                <span className="font-bold text-sm">{interest.label}</span>
                                {isSelected && <div className="absolute top-2 right-2 text-blue-600 dark:text-blue-400"><Check size={14} /></div>}
                            </button>
                        );
                    })}
                </div>
            )}

        </div>
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between z-20 transition-colors">
         <button 
            onClick={() => navigate('/')} 
            className="text-gray-400 font-medium text-sm hover:text-gray-600 dark:hover:text-gray-300 px-2"
         >
            Skip
         </button>

         <Button 
            onClick={handleNext} 
            size="lg" 
            className="rounded-full px-8 shadow-lg shadow-blue-500/20"
            rightIcon={step === totalSteps ? <Sparkles size={18} /> : <ArrowRight size={18} />}
         >
            {step === totalSteps ? "Get Started" : "Continue"}
         </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
