import React from 'react';
import PageHeader from '../PageHeader';
import ComingSoon, { ComingSoonVariant } from '../ComingSoonBanner';
import { LucideIcon } from 'lucide-react';

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
  // Deterministic "random" style based on title length to keep it consistent per page but varied across app
  const variants: ComingSoonVariant[] = [
      'gradient', 'minimal', 'typography', 'premium', // Group A
      'blob', 'shapes', 'comic', 'robot', 'classroom', // Group B
      'newspaper', 'space', 'nature', 'hud', 'office', // Group B continued
      'loader-ring', 'shimmer', 'timeline', 'steps', 'graph', // Group C
      'pulse', 'typing', 'wave', 'dial', 'cube', // Group C continued
      'blur-preview', 'paywall', 'frosted', 'glowing-lock', 'vip', // Group D
      'dimmed', 'folded', 'curtain', 'key', 'card-flip', // Group D continued
      'pixel', 'breaking', 'mascot', 'origami', 'ferris', // Group E
      'neon', 'blueprint', 'plane', 'burst', 'quotes' // Group E continued
  ];
  const variantIndex = title.length % variants.length;
  const selectedVariant = variants[variantIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader title={title} showBack={showBack} />
      <div className="p-4">
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
  );
};

export default GenericPageSkeleton;