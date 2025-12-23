import React from 'react';
import PageHeader from '../PageHeader';
import ComingSoon, { ComingSoonVariant } from '../ComingSoonBanner';
import { LucideIcon } from 'lucide-react';
import ParticleLoader from '../loaders/ParticleLoader';

interface GenericPageSkeletonProps {
  title: string;
  gradient: string;
  icon: React.ReactNode;
  features: string[];
  description?: string;
  showBack?: boolean;
}

const GenericPageSkeleton: React.FC<GenericPageSkeletonProps> = ({ 
  title, 
  gradient, 
  icon, 
  features, 
  description,
  showBack = true 
}) => {
  // Deterministic "random" style
  const variants: ComingSoonVariant[] = [
      'gradient', 'minimal', 'typography', 'premium',
      'blob', 'shapes', 'comic', 'robot', 'classroom',
      'newspaper', 'space', 'nature', 'hud', 'office',
      'loader-ring', 'shimmer', 'timeline', 'steps', 'graph',
      'pulse', 'typing', 'wave', 'dial', 'cube',
      'blur-preview', 'paywall', 'frosted', 'glowing-lock', 'vip',
      'dimmed', 'folded', 'curtain', 'key', 'card-flip',
      'pixel', 'breaking', 'mascot', 'origami', 'ferris',
      'neon', 'blueprint', 'plane', 'burst', 'quotes'
  ];
  const variantIndex = title.length % variants.length;
  const selectedVariant = variants[variantIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-black transition-colors">
      <PageHeader title={title} showBack={showBack} />
      
      {/* Premium Loader Effect Overlay */}
      <div className="relative">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
             <ParticleLoader className="h-[400px] w-full bg-transparent" />
          </div>
          
          <div className="p-4 relative z-10">
            <ComingSoon 
              title={title}
              gradient={gradient}
              icon={icon}
              description={description || `The ${title} section is currently under active development.`}
              featureList={features}
              variant={selectedVariant}
              fullPage={true}
            />
          </div>
      </div>
    </div>
  );
};

export default GenericPageSkeleton;
