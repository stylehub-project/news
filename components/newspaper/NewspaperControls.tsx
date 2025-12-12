import React from 'react';
import { Download, Edit2, ZoomIn, ZoomOut } from 'lucide-react';
import Button from '../ui/Button';

interface NewspaperControlsProps {
  onDownload: () => void;
  onEdit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const NewspaperControls: React.FC<NewspaperControlsProps> = ({
  onDownload,
  onEdit,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm shrink-0">
      <div className="flex gap-2 w-full md:w-auto">
        <Button 
            variant="secondary" 
            size="sm" 
            onClick={onEdit}
            leftIcon={<Edit2 size={16} />}
        >
          Edit / Regenerate
        </Button>
      </div>

      <div className="flex gap-2 items-center w-full md:w-auto justify-between md:justify-end">
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={onZoomOut} className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-600"><ZoomOut size={16} /></button>
            <div className="w-[1px] bg-gray-300 my-1 mx-1"></div>
            <button onClick={onZoomIn} className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-600"><ZoomIn size={16} /></button>
        </div>
        
        <Button 
            variant="primary" 
            size="sm" 
            onClick={onDownload}
            leftIcon={<Download size={16} />}
            className="bg-black hover:bg-gray-800"
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default NewspaperControls;