import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import NewsCardBasic from '../../components/cards/NewsCardBasic';
import SmartLoader from '../../components/loaders/SmartLoader';
import { fetchNewsFeed } from '../../utils/aiService';

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Capitalize first letter
  const title = id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Category';

  useEffect(() => {
      const loadData = async () => {
          setLoading(true);
          const news = await fetchNewsFeed(1, { category: title, sort: 'Latest' });
          setArticles(news);
          setLoading(false);
      };
      if (id) loadData();
  }, [id, title]);

  const handleCardClick = (newsId: string) => {
      navigate(`/news/${newsId}`);
  };

  const handleAIExplain = (newsId: string) => {
      const article = articles.find(a => a.id === newsId);
      if (article) {
          navigate(`/ai-chat?context=article&headline=${encodeURIComponent(article.title)}&id=${newsId}`);
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-black">
              <PageHeader title={title} showBack />
              <SmartLoader type="home" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      <PageHeader title={title} showBack />
      
      <div className="p-4 space-y-4">
          {articles.length > 0 ? (
              articles.map((news) => (
                  <NewsCardBasic 
                    key={news.id} 
                    {...news} 
                    onClick={handleCardClick}
                    onAIExplain={handleAIExplain}
                  />
              ))
          ) : (
              <div className="text-center py-20 text-gray-500">
                  <p>No stories found for {title}.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default CategoryPage;