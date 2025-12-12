import React from 'react';
import { Landmark } from 'lucide-react';
import GenericPageSkeleton from '../../../components/skeletons/GenericPageSkeleton';

const PoliticsPage = () => (
  <GenericPageSkeleton 
    title="Politics"
    gradient="bg-slate-700"
    icon={<Landmark size={48} />}
    features={["Election Trackers", "Policy Analysis", "Live Debates"]}
  />
);

export default PoliticsPage;