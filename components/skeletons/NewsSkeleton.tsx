import React, { useState, useEffect } from 'react';
import Shimmer from '../ui/Shimmer';

const FACTS = [
  "Did you know? The first newspaper was printed in 1605.",
  "Gemini can summarize 1000 words in seconds.",
  "Reading keeps your brain active!",
  "Updating headlines from around the world..."
];

const NewsSkeleton: React.FC = () => {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex gap-4 mb-4">
        <Shimmer className="w-24 h-24 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
           <Shimmer width="80%" height="1.2rem" />
           <Shimmer width="60%" />
           <Shimmer width="40%" />
        </div>
      </div>
      <div className="pt-2 border-t border-gray-50 text-center">
         <p className="text-xs text-blue-500 font-medium animate-pulse">{FACTS[factIndex]}</p>
      </div>
    </div>
  );
};
export default NewsSkeleton;