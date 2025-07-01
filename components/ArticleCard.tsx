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
  isNew?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = React.memo(
  ({ article, query, setIsSearching, isNew = false }) => {
    const [imgSrc, setImgSrc] = useState(
      article.image_url ?? '/images/placeholder.png'
    );

    if (!article.title || !article.source_id || !article.pubDate || !article.link) {
      console.warn('Skipping invalid article:', article);
      return null;
    }

    const articleId =
      article.article_id && article.article_id !== 'null'
        ? article.article_id
        : encodeURIComponent(
            `${article.title.trim().toLowerCase()}_${article.pubDate}`
          );

    const handleClick = () => setIsSearching(true);
    const handleImageError = () => setImgSrc('/images/placeholder.png');

    const isBestMatch =
      query &&
      (article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description?.toLowerCase().includes(query.toLowerCase()));

    // Framer Motion variants for the green ring fade-out
    const ringVariants = {
      initial: { boxShadow: '0 0 0 4px rgba(34,197,94,1)' },
      animate: { boxShadow: '0 0 0 0px rgba(34,197,94,0)' },
    };

    return (
      <motion.div
        whileHover={{
        scale: 1.05,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 10,
        },
      }}
        initial={isNew ? 'initial' : undefined}
        animate={isNew ? 'animate' : undefined}
        variants={ringVariants}
        transition={isNew ? { duration: 1, ease: 'easeOut' } : undefined}
        className={`relative border rounded-lg shadow-sm overflow-hidden transition-colors duration-300 ${
          isBestMatch
            ? 'bg-blue-200 dark:bg-blue-900 dark:border-black'
            : 'bg-white dark:bg-gray-800 dark:border-black'
        }`}
      >
        {isNew && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">
            NEW
          </div>
        )}

        <Link
          href={`/article/${articleId}${
            query ? `?query=${encodeURIComponent(query)}` : ''
          }`}
          onClick={handleClick}
          aria-label={`Read more about ${article.title}`}
        >
          <div className="p-4">
            <img
              src={imgSrc}
              alt={article.title || 'News article image'}
              className="w-full h-48 object-cover rounded-md mb-4"
              onError={handleImageError}
            />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2">
              {article.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <p className="inline-block text-sm font-medium px-2 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded">
                {article.source_id}
              </p>
              <p className="inline-block text-sm font-medium px-2 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded">
                {format(parseISO(article.pubDate), 'PPP')}
              </p>
            </div>
            {isBestMatch && (
              <p className="text-blue-600 dark:text-blue-200 text-sm font-medium mt-2">
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
