import React from 'react';
import Card from '../ui/Card';

const NewsCardSkeleton: React.FC = () => {
  return (
    <Card className="h-full flex flex-col overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800"></div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1">
        {/* Source & Time */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-6 flex-1">
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full"></div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full"></div>
          <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800 mt-auto">
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex gap-3">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NewsCardSkeleton;
