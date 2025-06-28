import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Article } from '../types/article';

interface ArticleCardProps {
  article: Article;
  query?: string;
  setIsSearching: (isSearching: boolean) => void; // Add prop
}

const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article, query, setIsSearching }) => {
  const [imgSrc, setImgSrc] = useState(article.image_url || '/images/placeholder.jpg');

  const isBestMatch =
    query &&
    (article.title.toLowerCase().includes(query.toLowerCase()) ||
      (article.description && article.description.toLowerCase().includes(query.toLowerCase())));

  const handleClick = () => {
    setIsSearching(true); // Trigger loader
  };

  const handleImageError = () => {
    setImgSrc('/images/placeholder.jpg');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`border rounded-lg shadow-sm overflow-hidden ${
        isBestMatch ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'
      }`}
    >
      <Link
        href={`/article/${article.article_id}${query ? `?query=${encodeURIComponent(query)}` : ''}`}
        aria-label={`Read more about ${article.title}`}
        onClick={handleClick} // Set loader on click
      >
        <div className="p-4">
          <img
            src={imgSrc}
            alt={article.title || 'Article image'}
            className="w-full h-48 object-cover rounded-md mb-4"
            onError={handleImageError}
          />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2">{article.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{article.source_id}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{format(parseISO(article.pubDate), 'PPP')}</p>
          {isBestMatch && (
            <p className="text-blue-600 dark:text-blue-300 text-sm font-medium mt-2">Best Match</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
});

export default ArticleCard;