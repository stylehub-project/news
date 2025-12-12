import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl relative ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 z-10 ${
              isActive ? 'text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isActive && (
              <div className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10 animate-in fade-in zoom-in-95 duration-200" />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;