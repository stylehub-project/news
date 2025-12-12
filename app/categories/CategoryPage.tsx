import React from 'react';
import { useParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import GenericPageSkeleton from '../../components/skeletons/GenericPageSkeleton';

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Capitalize first letter
  const title = id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Category';

  return (
    <GenericPageSkeleton 
      title={title}
      gradient="bg-gradient-to-br from-indigo-500 to-blue-500"
      icon={<Layers size={48} />}
      features={[`Top ${title} News`, "Trending Updates", "Expert Analysis"]}
      description={`Explore the latest stories and updates in ${title}.`}
    />
  );
};

export default CategoryPage;
