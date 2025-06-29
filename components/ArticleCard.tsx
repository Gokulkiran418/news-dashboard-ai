// components/ArticleCard.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Article } from '../types/article';

interface ArticleCardProps {
  article: Article;
  query?: string;
  setIsSearching: (isSearching: boolean) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = React.memo(
  ({ article, query, setIsSearching }) => {
    // Fallback placeholder
    const [imgSrc, setImgSrc] = useState(
      article.image_url ?? '/images/placeholder.png'
    );

    // Skip if essential fields are missing
    if (!article.title || !article.source_id || !article.pubDate || !article.link) {
      console.warn('Skipping invalid article:', article);
      return null;
    }

    // Derive a stable ID or fallback to encoded title+date
    const articleId =
      article.article_id && article.article_id !== 'null'
        ? article.article_id
        : encodeURIComponent(`${article.title.trim().toLowerCase()}_${article.pubDate}`);

    const handleClick = () => {
      setIsSearching(true);
    };

    const handleImageError = () => {
      setImgSrc('/images/placeholder.png');
    };

    // Highlight when it matches the search query
    const isBestMatch =
      query &&
      (article.title.toLowerCase().includes(query.toLowerCase()) ||
        (article.description?.toLowerCase().includes(query.toLowerCase()) ?? false));

    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`border rounded-lg shadow-sm overflow-hidden ${
          isBestMatch
            ? 'bg-blue-200 dark:bg-gray-700 dark:border-black'
            : 'bg-white dark:bg-gray-800 dark:border-black'
        }`}
      >
        <Link
          href={`/article/${articleId}${query ? `?query=${encodeURIComponent(query)}` : ''}`}
          onClick={handleClick}
          aria-label={`Read more about ${article.title}`}
        >
          <div className="p-4">
            <img
              src={imgSrc}
              alt={article.title}
              className="w-full h-48 object-cover rounded-md mb-4"
              onError={handleImageError}
            />

            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2">
              {article.title}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
              {article.source_id}
            </p>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {format(parseISO(article.pubDate), 'PPP')}
            </p>

            {isBestMatch && (
              <p className="text-blue-600 dark:text-blue-500 text-sm font-medium mt-2">
                Best Match
              </p>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }
);

export default ArticleCard;
