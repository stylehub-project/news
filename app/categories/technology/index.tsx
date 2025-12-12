import React from 'react';
import { Cpu } from 'lucide-react';
import GenericPageSkeleton from '../../../components/skeletons/GenericPageSkeleton';

const TechPage = () => (
  <GenericPageSkeleton 
    title="Technology"
    gradient="bg-indigo-600"
    icon={<Cpu size={48} />}
    features={["Product Launches", "Startup News", "AI Breakthroughs"]}
  />
);

export default TechPage;