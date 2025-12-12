import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBack = false, action }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;