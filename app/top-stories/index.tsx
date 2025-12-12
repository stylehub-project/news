import React from 'react';
import { Newspaper } from 'lucide-react';
import GenericPageSkeleton from '../../components/skeletons/GenericPageSkeleton';

const TopStoriesPage = () => (
  <GenericPageSkeleton 
    title="Top Stories"
    gradient="bg-gradient-to-r from-red-500 to-orange-500"
    icon={<Newspaper size={48} />}
    features={["Curated Headlines", "Breaking News Alerts", "Deep Dive Analysis"]}
  />
);

export default TopStoriesPage;