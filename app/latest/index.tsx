import React from 'react';
import { Clock } from 'lucide-react';
import GenericPageSkeleton from '../../components/skeletons/GenericPageSkeleton';

const LatestPage = () => (
  <GenericPageSkeleton 
    title="Latest Updates"
    gradient="bg-gradient-to-br from-cyan-400 to-blue-600"
    icon={<Clock size={48} />}
    features={["Real-time Feed", "Timeline View", "Live Blog Support"]}
  />
);

export default LatestPage;